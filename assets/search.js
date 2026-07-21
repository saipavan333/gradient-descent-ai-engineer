/* Gradient Descent — lightweight in-page search over all lessons + glossary. Self-contained, offline. */
(function(){
"use strict";
if(window.__gdsLoaded)return; window.__gdsLoaded=true;

var inLessons=/\/lessons\//.test(location.pathname);
var dataUrl=(inLessons?"../assets/":"assets/")+"search-data.js";
var base=inLessons?"":"lessons/";           // prefix to reach lessons/ from current page

/* ---- styles ---- */
var css=
".gds-fab{position:fixed;left:18px;bottom:18px;z-index:2147483000;display:flex;align-items:center;gap:8px;"+
"font:600 13.5px system-ui;color:#334155;background:#fff;border:1px solid #e2e8f0;border-radius:999px;"+
"padding:9px 14px;box-shadow:0 6px 20px rgba(15,23,42,.10);cursor:pointer;transition:.15s}"+
".gds-fab:hover{border-color:#6366f1;color:#4f46e5;transform:translateY(-1px)}"+
".gds-fab kbd{font:600 11px ui-monospace,monospace;background:#f1f5f9;border:1px solid #e2e8f0;border-radius:5px;padding:1px 5px;color:#64748b}"+
".gds-ov{position:fixed;inset:0;z-index:2147483001;background:rgba(15,23,42,.42);backdrop-filter:blur(3px);"+
"display:none;align-items:flex-start;justify-content:center;padding:12vh 16px 16px}"+
".gds-ov.show{display:flex}"+
".gds-box{width:100%;max-width:640px;background:#fff;border:1px solid #e2e8f0;border-radius:16px;"+
"box-shadow:0 24px 70px rgba(15,23,42,.3);overflow:hidden;display:flex;flex-direction:column;max-height:76vh}"+
".gds-in{border:none;border-bottom:1px solid #eef1f6;font:500 18px system-ui;padding:18px 20px;outline:none;color:#0f172a}"+
".gds-in::placeholder{color:#94a3b8}"+
".gds-res{overflow-y:auto;padding:6px}"+
".gds-h{font:800 10.5px system-ui;letter-spacing:.1em;text-transform:uppercase;color:#94a3b8;padding:10px 12px 5px}"+
".gds-item{display:flex;align-items:center;gap:11px;padding:9px 12px;border-radius:10px;text-decoration:none;color:#1e293b;cursor:pointer}"+
".gds-item.on{background:#eef2ff}"+
".gds-badge{flex:0 0 auto;min-width:22px;height:22px;padding:0 6px;display:grid;place-items:center;font:700 11.5px system-ui;"+
"color:#fff;background:#6366f1;border-radius:6px}"+
".gds-badge.gg{background:#0d9488}"+
".gds-tt{font-weight:650;font-size:14.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;flex:0 1 auto}"+
".gds-sub{color:#94a3b8;font-size:12.5px;margin-left:auto;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:46%}"+
".gds-hint{color:#94a3b8;font-size:14px;padding:22px;text-align:center}"+
".gds-foot{border-top:1px solid #eef1f6;padding:8px 14px;font:500 11.5px system-ui;color:#94a3b8;display:flex;gap:14px}"+
".gds-foot b{color:#64748b;font-weight:700}"+
"@media(max-width:520px){.gds-fab span.lbl{display:none}.gds-sub{display:none}}";
var st=document.createElement("style"); st.textContent=css; document.head.appendChild(st);

function esc(s){var d=document.createElement("div");d.textContent=s;return d.innerHTML;}
function el(t,c,h){var e=document.createElement(t);if(c)e.className=c;if(h!=null)e.innerHTML=h;return e;}

function boot(){
  var D=window.GD_SEARCH; if(!D||!D.lessons)return;
  var lessons=D.lessons, gloss=D.glossary||[];

  var fab=el("button","gds-fab",'<span>🔍</span><span class="lbl">Search</span><kbd>/</kbd>');
  var ov=el("div","gds-ov");
  ov.innerHTML='<div class="gds-box"><input class="gds-in" type="text" placeholder="Search '+lessons.length+' lessons and '+gloss.length+' terms…" autocomplete="off" spellcheck="false"><div class="gds-res"></div><div class="gds-foot"><span><b>↑ ↓</b> move</span><span><b>↵</b> open</span><span><b>esc</b> close</span></div></div>';
  document.body.appendChild(fab); document.body.appendChild(ov);
  var input=ov.querySelector(".gds-in"), res=ov.querySelector(".gds-res");
  var open=false, items=[], sel=0;

  function show(){open=true;ov.classList.add("show");input.value="";input.focus();render("");}
  function hide(){open=false;ov.classList.remove("show");}
  window.gdSearchOpen=function(q){open=true;ov.classList.add("show");input.value=q||"";input.focus();render(input.value);};
  fab.onclick=show;
  ov.addEventListener("click",function(e){if(e.target===ov)hide();});
  document.addEventListener("keydown",function(e){
    var tag=(e.target&&e.target.tagName||"").toLowerCase(), typing=(tag==="input"||tag==="textarea"||e.target.isContentEditable);
    if(!open && !typing && (e.key==="/"||((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==="k"))){e.preventDefault();show();}
    else if(open && e.key==="Escape"){e.preventDefault();hide();}
  });
  input.addEventListener("keydown",function(e){
    if(e.key==="ArrowDown"){e.preventDefault();sel=Math.min(items.length-1,sel+1);paintSel();}
    else if(e.key==="ArrowUp"){e.preventDefault();sel=Math.max(0,sel-1);paintSel();}
    else if(e.key==="Enter"){e.preventDefault();if(items[sel])location.href=items[sel].href;}
  });
  input.addEventListener("input",function(){render(input.value);});

  function match(q,hay){
    var words=q.split(/\s+/),sc=0;
    for(var i=0;i<words.length;i++){var w=words[i];if(!w)continue;var p=hay.indexOf(w);if(p<0)return 0;sc+=(p===0?4:1)+(hay.indexOf(" "+w)>=0?1:0);}
    return sc;
  }
  function render(q){
    q=q.trim().toLowerCase(); items=[]; sel=0;
    if(!q){res.innerHTML='<div class="gds-hint">Type to search lessons, concepts and glossary terms across the whole course.</div>';return;}
    var Ls=[],Gs=[];
    lessons.forEach(function(l){var s=match(q,(l.t+" "+l.tn+" "+l.x).toLowerCase());if(s>0)Ls.push({s:s,l:l});});
    gloss.forEach(function(g){var s=match(q,(g.term+" "+g.desc).toLowerCase());if(s>0)Gs.push({s:s,g:g});});
    Ls.sort(function(a,b){return b.s-a.s;}); Gs.sort(function(a,b){return b.s-a.s;});
    Ls=Ls.slice(0,8); Gs=Gs.slice(0,6);
    var html="";
    if(Ls.length){html+='<div class="gds-h">Lessons</div>';Ls.forEach(function(o){var href=base+o.l.f,i=items.length;items.push({href:href});
      html+='<a class="gds-item" data-i="'+i+'" href="'+href+'"><span class="gds-badge">'+o.l.k+'</span><span class="gds-tt">'+esc(o.l.t)+'</span><span class="gds-sub">'+esc(o.l.tn)+'</span></a>';});}
    if(Gs.length){html+='<div class="gds-h">Glossary</div>';Gs.forEach(function(o){var href=base+"glossary.html",i=items.length;items.push({href:href});
      html+='<a class="gds-item" data-i="'+i+'" href="'+href+'"><span class="gds-badge gg">A</span><span class="gds-tt">'+esc(o.g.term)+'</span><span class="gds-sub">'+esc(o.g.desc)+'</span></a>';});}
    if(!items.length)html='<div class="gds-hint">No matches for &ldquo;'+esc(q)+'&rdquo;.</div>';
    res.innerHTML=html; paintSel();
    [].forEach.call(res.querySelectorAll(".gds-item"),function(a){a.addEventListener("mousemove",function(){sel=+a.getAttribute("data-i");paintSel();});});
  }
  function paintSel(){[].forEach.call(res.querySelectorAll(".gds-item"),function(a){a.classList.toggle("on",+a.getAttribute("data-i")===sel);});
    var onEl=res.querySelector(".gds-item.on"); if(onEl)onEl.scrollIntoView({block:"nearest"});}
}

if(window.GD_SEARCH){boot();}
else{var sc=document.createElement("script");sc.src=dataUrl;sc.onload=boot;sc.onerror=function(){};document.head.appendChild(sc);}
})();
