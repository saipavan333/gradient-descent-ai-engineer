/* Gradient Descent — study-tools control. Self-contained, offline, on-device. */
(function(){
"use strict";
if(window.__gdeLoaded)return; window.__gdeLoaded=true;
var clamp=function(x,a,b){return Math.max(a,Math.min(b,x));};
var LS="gd_enhance_v2";
function get(){try{return JSON.parse(localStorage.getItem(LS))||{}}catch(e){return{}}}
function set(o){try{localStorage.setItem(LS,JSON.stringify(o))}catch(e){}}
function elc(t,c,h){var e=document.createElement(t);if(c)e.className=c;if(h!=null)e.innerHTML=h;return e;}
function pageKey(){return (location.pathname.split("/").pop()||"index.html");}

function boot(){
  var article=document.querySelector("article.content")||document.querySelector("main")||document.body;

  /* progress bar */
  var bar=elc("div"); bar.id="gde-bar"; document.body.appendChild(bar);
  function onScroll(){
    var h=document.documentElement, mx=h.scrollHeight-h.clientHeight;
    var pct=mx<=6?1:clamp(h.scrollTop/mx,0,1);
    bar.style.width=(pct*100).toFixed(1)+"%";
    if(pct>=0.9){var s=get();s.done=s.done||{};if(!s.done[pageKey()]){s.done[pageKey()]=1;set(s);paintProg();}}
  }
  window.addEventListener("scroll",onScroll,{passive:true});
  window.addEventListener("resize",onScroll);

  /* collect readable nodes for narration */
  var readEls=[];
  article.querySelectorAll("h1,h2,h3,p,li").forEach(function(el){
    if(el.closest("pre,code,figure,.quiz,details,script,style,.gde-panel,.gde-modal,.q-options,.gdw"))return;
    var t=(el.textContent||"").replace(/\s+/g," ").trim();
    if(t.length>3) readEls.push(el);
  });
  /* flashcards from key points */
  var cards=[];
  article.querySelectorAll(".keypoints li").forEach(function(li){
    var full=(li.textContent||"").replace(/\s+/g," ").trim(); if(full.length<8)return;
    var lead=li.querySelector("strong,b");
    var front=lead?lead.textContent.replace(/[:\-—\s]+$/,"").trim():full.split(/[.:—]/)[0].trim();
    if(front.length<2)front="Recall";
    cards.push({front:front,back:full});
  });

  /* ---- build the control (collapsed pill + panel) ---- */
  var fab=elc("button","gde-fab",'<span class="dot"></span><span>Study tools</span><span class="chev">▲</span>');
  fab.setAttribute("aria-label","Open study tools");
  var panel=elc("div","gde-panel"); panel.setAttribute("role","menu");
  document.body.appendChild(fab); document.body.appendChild(panel);

  var synth=window.speechSynthesis, speaking=false;
  var ttsItem=null;
  if(synth && readEls.length){
    ttsItem=elc("button","gde-item",'<span class="ic">▶</span><span>Read aloud</span>');
    ttsItem.onclick=function(){speaking?stopTTS():startTTS();};
    panel.appendChild(headed("Listen")); panel.appendChild(ttsItem);
  }
  if(cards.length){
    var fcItem=elc("button","gde-item",'<span class="ic">🗂</span><span>Flashcards</span><span class="sub">'+cards.length+'</span>');
    fcItem.onclick=openDeck;
    panel.appendChild(headed("Revise")); panel.appendChild(fcItem);
  }
  panel.appendChild(headed("Your progress"));
  var prog=elc("div","gde-prog",'<div class="lab"><span>Lessons completed</span><b class="gde-n">0</b></div><div class="gde-track"><i class="gde-fill"></i></div>');
  panel.appendChild(prog);
  var revLink=elc("a","gde-item gde-revlink",'<span class="ic">◱</span><span>Review &amp; progress hub</span><span class="sub">→</span>');
  revLink.href="review.html"; revLink.title="Spaced-repetition review across every lesson"; panel.appendChild(revLink);
  var hide=elc("button","gde-hide","Hide these tools"); panel.appendChild(hide);

  function headed(t){return elc("div","gde-h",t);}
  function paintProg(){
    var s=get(); var n=s.done?Object.keys(s.done).length:0;
    var nEl=panel.querySelector(".gde-n"); if(nEl)nEl.textContent=n;
    var fill=panel.querySelector(".gde-fill"); if(fill)fill.style.width=clamp(n/125*100,0,100)+"%";
  }
  var open=false;
  function toggle(v){open=(v==null)?!open:v;panel.classList.toggle("open",open);fab.classList.toggle("open",open);if(open)paintProg();}
  fab.onclick=function(e){e.stopPropagation();toggle();};
  document.addEventListener("click",function(e){if(open&&!panel.contains(e.target)&&e.target!==fab&&!fab.contains(e.target))toggle(false);});
  hide.onclick=function(){toggle(false);fab.style.display="none";var s=get();s.hidden=1;set(s);showRestore();};

  function showRestore(){
    if(document.querySelector(".gde-restore"))return;
    var r=elc("button","gde-restore"); r.title="Show study tools";
    r.onclick=function(){r.remove();fab.style.display="";var s=get();s.hidden=0;set(s);toggle(true);};
    document.body.appendChild(r);
  }
  if(get().hidden){fab.style.display="none";showRestore();}

  /* ---- narration ---- */
  function voice(){var vs=synth.getVoices();var p=["Google US English","Samantha","Microsoft Aria Online (Natural)","Microsoft Jenny","Daniel","Alex"];for(var i=0;i<p.length;i++){var v=vs.find(function(x){return x.name.indexOf(p[i])>=0;});if(v)return v;}return vs.find(function(x){return /en[-_]/i.test(x.lang);})||vs[0]||null;}
  function speakFrom(i){if(i>=readEls.length){stopTTS();return;}readEls.forEach(function(n){n.classList.remove("gde-reading");});var nd=readEls[i];nd.classList.add("gde-reading");nd.scrollIntoView({behavior:"smooth",block:"center"});var u=new SpeechSynthesisUtterance((nd.textContent||"").replace(/\s+/g," ").trim());var v=voice();if(v)u.voice=v;u.onend=function(){if(speaking)speakFrom(i+1);};synth.speak(u);}
  function startTTS(){speaking=true;if(ttsItem){ttsItem.classList.add("on");ttsItem.querySelector("span:nth-child(2)").textContent="Stop reading";ttsItem.querySelector(".ic").textContent="⏹";}speakFrom(0);}
  function stopTTS(){speaking=false;if(synth)synth.cancel();readEls.forEach(function(n){n.classList.remove("gde-reading");});if(ttsItem){ttsItem.classList.remove("on");ttsItem.querySelector("span:nth-child(2)").textContent="Read aloud";ttsItem.querySelector(".ic").textContent="▶";}}
  if(synth)synth.onvoiceschanged=function(){};

  /* ---- flashcards modal ---- */
  var modal,deckState,cur,flipped;
  function openDeck(){toggle(false);if(!modal)buildModal();var s=get();deckState=(s["deck_"+pageKey()]&&s["deck_"+pageKey()].length===cards.length)?s["deck_"+pageKey()]:cards.map(function(_,i){return{i:i,box:1};});modal.classList.add("show");nextCard();}
  function saveDeck(){var s=get();s["deck_"+pageKey()]=deckState;set(s);}
  function pick(){var b=deckState[0];deckState.forEach(function(c){if(c.box<b.box)b=c;});return b;}
  function nextCard(){cur=pick();flipped=false;render();}
  function esc(s){var d=document.createElement("div");d.textContent=s;return d.innerHTML;}
  function render(){var c=cards[cur.i];modal.querySelector(".gde-card").innerHTML=flipped?'<div>'+esc(c.back)+'</div>':'<div class="q">'+esc(c.front)+'</div><div style="font-size:12px;color:#94a3b8;margin-top:10px">click to flip</div>';modal.querySelector(".gde-cardrow").style.display=flipped?"flex":"none";modal.querySelector(".gde-sub").textContent="Box "+cur.box+" of 3 · "+cards.length+" cards from this lesson";}
  function buildModal(){
    modal=elc("div","gde-modal");
    modal.innerHTML='<div class="gde-deck"><button class="gde-x">×</button><h3>Flashcards</h3><p class="sub gde-sub"></p><div class="gde-card"></div><div class="gde-cardrow" style="display:none"><button class="gde-cbtn again">Again ↻</button><button class="gde-cbtn good">Got it ✓</button></div><div class="gde-cardrow"><button class="gde-cbtn flip">Flip card</button></div></div>';
    document.body.appendChild(modal);
    var card=modal.querySelector(".gde-card"),flip=function(){flipped=!flipped;render();};
    card.onclick=flip; modal.querySelector(".flip").onclick=flip;
    modal.querySelector(".again").onclick=function(){cur.box=1;saveDeck();nextCard();};
    modal.querySelector(".good").onclick=function(){cur.box=clamp(cur.box+1,1,3);saveDeck();nextCard();};
    modal.querySelector(".gde-x").onclick=function(){modal.classList.remove("show");};
    modal.addEventListener("click",function(e){if(e.target===modal)modal.classList.remove("show");});
  }

  paintProg(); onScroll();
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot);else boot();
})();
