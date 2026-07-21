/* Gradient Descent — inline definitions for the difficult terms marked with .term.
   Hover (desktop) or tap (touch) any highlighted term to see a plain-English definition.
   Self-contained; loads its own definition data; no dependencies. */
(function(){
"use strict";
if(window.__gdefLoaded)return; window.__gdefLoaded=true;

function esc(s){var d=document.createElement("div");d.textContent=s;return d.innerHTML;}

function boot(){
  var DEFS=window.GD_DEFS; if(!DEFS)return;
  var terms=document.querySelectorAll(".content .term, article .term, .term");
  if(!terms.length)return;

  function lookup(t){
    t=t.toLowerCase().replace(/\s+/g," ").replace(/[.,;:]+$/,"").trim();
    return DEFS[t]||DEFS[t.replace(/s$/,"")]||DEFS[t+"s"]||DEFS[t.replace(/-/g," ")]||DEFS[t.replace(/ /g,"-")]||null;
  }

  var tip=document.createElement("div"); tip.className="gdef-tip";
  tip.innerHTML='<span class="gdef-arrow"></span><b></b><span class="gdef-body"></span>';
  document.body.appendChild(tip);
  var arrow=tip.querySelector(".gdef-arrow"), bEl=tip.querySelector("b"), body=tip.querySelector(".gdef-body");
  var cur=null, hideT=null;

  function place(el){
    var r=el.getBoundingClientRect();
    tip.style.left="0px"; tip.style.top="0px"; tip.classList.add("show"); // measure
    var tw=tip.offsetWidth, th=tip.offsetHeight, pad=8;
    var cx=r.left+r.width/2;
    var left=Math.max(pad, Math.min(cx-tw/2, window.innerWidth-tw-pad));
    var below=r.bottom+10, above=r.top-th-10;
    var top, cls;
    if(r.bottom+th+14 < window.innerHeight || r.top-th-14 < 0){ top=below; cls="below"; }
    else { top=above; cls="above"; }
    tip.classList.remove("above","below"); tip.classList.add(cls);
    tip.style.left=left+"px"; tip.style.top=top+"px";
    arrow.style.left=Math.max(10, Math.min(cx-left-5, tw-20))+"px";
  }
  function show(el){
    if(hideT){clearTimeout(hideT);hideT=null;}
    var term=el.textContent.trim(), def=lookup(term);
    bEl.textContent=term;
    if(def){ body.className="gdef-body"; body.textContent=def; }
    else { body.className="gdef-body gdef-none";
      body.innerHTML="Defined where it first appears — <a href=\"#\" class=\"gdef-search\">search the course →</a>"; }
    place(el); cur=el;
    var sl=body.querySelector(".gdef-search");
    if(sl)sl.onclick=function(e){e.preventDefault();hide();if(window.gdSearchOpen)window.gdSearchOpen(term);};
  }
  function hide(){tip.classList.remove("show");cur=null;}
  function softHide(){ hideT=setTimeout(function(){ if(!tip.matches(":hover")) hide(); },120); }

  [].forEach.call(terms,function(el){
    var def=lookup(el.textContent.trim());
    el.classList.add(def?"gdef-yes":"gdef-maybe");
    el.setAttribute("tabindex","0");
    el.addEventListener("mouseenter",function(){show(el);});
    el.addEventListener("mouseleave",softHide);
    el.addEventListener("focus",function(){show(el);});
    el.addEventListener("blur",softHide);
    el.addEventListener("click",function(e){ e.stopPropagation(); if(cur===el)hide(); else show(el); });
    el.addEventListener("keydown",function(e){ if(e.key==="Escape")hide(); });
  });
  tip.addEventListener("mouseenter",function(){ if(hideT){clearTimeout(hideT);hideT=null;} });
  tip.addEventListener("mouseleave",hide);
  document.addEventListener("click",function(e){ if(cur && !cur.contains(e.target) && !tip.contains(e.target)) hide(); });
  window.addEventListener("scroll",function(){ if(cur)hide(); },true);
}

function start(){
  if(!document.querySelector(".content .term, article .term, .term")) return; // no marked terms on this page
  if(window.GD_DEFS){ boot(); return; }
  var s=document.createElement("script");
  s.src=(/\/lessons\//.test(location.pathname)?"../assets/":"assets/")+"gd-glossary-data.js";
  s.onload=boot; s.onerror=function(){}; document.head.appendChild(s);
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start);else start();
})();
