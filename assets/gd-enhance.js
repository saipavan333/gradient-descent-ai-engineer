/* Gradient Descent — experience layer. Self-contained, offline, on-device. */
(function(){
"use strict";
if(window.__gdeLoaded)return; window.__gdeLoaded=true;
var clamp=function(x,a,b){return Math.max(a,Math.min(b,x));};
var LS="gd_enhance_v1";
function get(){try{return JSON.parse(localStorage.getItem(LS))||{}}catch(e){return{};}}
function set(o){try{localStorage.setItem(LS,JSON.stringify(o))}catch(e){}}
function pageKey(){return (location.pathname.split("/").pop()||"index.html");}

function boot(){
  var article=document.querySelector("article.content");

  /* ---------- progress bar (scroll depth) ---------- */
  var bar=document.createElement("div"); bar.id="gde-bar"; document.body.appendChild(bar);
  var completedShown=false;
  function onScroll(){
    var h=document.documentElement;
    var max=h.scrollHeight-h.clientHeight;
    var pct=max<=6?1:clamp(h.scrollTop/max,0,1);
    bar.style.width=(pct*100).toFixed(1)+"%";
    if(pct>=0.9 && !completedShown){
      completedShown=true;
      var s=get(); s.done=s.done||{}; 
      if(!s.done[pageKey()]){ s.done[pageKey()]=1; set(s); updateChip(); }
    }
  }
  window.addEventListener("scroll",onScroll,{passive:true});
  window.addEventListener("resize",onScroll);

  /* ---------- dock ---------- */
  var dock=document.createElement("div"); dock.className="gde-dock"; document.body.appendChild(dock);

  /* ---------- read aloud ---------- */
  var synth=window.speechSynthesis;
  var readEls=[], speaking=false, idx=0;
  if(article){
    article.querySelectorAll("h2,h3,p,li").forEach(function(el){
      if(el.closest("pre,code,figure,.quiz,details,script,style,.gde-modal,.q-options"))return;
      var t=(el.textContent||"").replace(/\s+/g," ").trim();
      if(t.length>3) readEls.push(el);
    });
  }
  var ttsBtn=null;
  if(synth && readEls.length){
    ttsBtn=mkBtn("gde-ic","▶","Read aloud"," Read aloud");
    ttsBtn.onclick=function(){ speaking?stopTTS():startTTS(); };
    dock.appendChild(ttsBtn);
  }
  function pickVoice(){
    var vs=synth.getVoices(); var pref=["Google US English","Samantha","Microsoft Aria Online (Natural)","Microsoft Jenny","Daniel","Alex"];
    for(var i=0;i<pref.length;i++){var v=vs.find(function(x){return x.name.indexOf(pref[i])>=0;}); if(v)return v;}
    return vs.find(function(x){return /en[-_]/i.test(x.lang);})||vs[0]||null;
  }
  function speakFrom(i){
    if(i>=readEls.length){stopTTS();return;}
    idx=i; readEls.forEach(function(n){n.classList.remove("gde-reading");});
    var node=readEls[i]; node.classList.add("gde-reading");
    node.scrollIntoView({behavior:"smooth",block:"center"});
    var u=new SpeechSynthesisUtterance((node.textContent||"").replace(/\s+/g," ").trim());
    var v=pickVoice(); if(v)u.voice=v; u.rate=1.0;
    u.onend=function(){ if(speaking) speakFrom(i+1); };
    synth.speak(u);
  }
  function startTTS(){ speaking=true; ttsBtn.classList.add("on"); ttsBtn.querySelector(".gde-lbl").textContent=" Stop"; ttsBtn.querySelector(".gde-ic").textContent="⏹"; speakFrom(0); }
  function stopTTS(){ speaking=false; synth.cancel(); readEls.forEach(function(n){n.classList.remove("gde-reading");}); if(ttsBtn){ttsBtn.classList.remove("on"); ttsBtn.querySelector(".gde-lbl").textContent=" Read aloud"; ttsBtn.querySelector(".gde-ic").textContent="▶";} }
  if(synth)synth.onvoiceschanged=function(){};

  /* ---------- flashcards from key points ---------- */
  var cards=[];
  if(article){
    article.querySelectorAll(".keypoints li").forEach(function(li){
      var full=(li.textContent||"").replace(/\s+/g," ").trim();
      if(full.length<8)return;
      var lead=li.querySelector("strong,b");
      var front=lead?lead.textContent.replace(/[:—\-\s]+$/,"").trim():full.split(/[.:—]/)[0].trim();
      if(front.length<2)front="Recall";
      cards.push({front:front, back:full});
    });
  }
  if(cards.length){
    var fcBtn=mkBtn("gde-ic","🗂","Flashcards"," Flashcards ("+cards.length+")");
    fcBtn.onclick=openDeck; dock.appendChild(fcBtn);
  }

  /* ---------- progress chip ---------- */
  var chip=document.createElement("span"); chip.className="gde-chip"; 
  var chipBtn=mkBtn("gde-ic","✓","Progress","");
  chipBtn.style.cursor="default"; chipBtn.appendChild(chip);
  dock.appendChild(chipBtn);
  function updateChip(){ var s=get(); var n=s.done?Object.keys(s.done).length:0; chip.textContent=n+" done"; }
  updateChip();

  /* ---------- deck modal ---------- */
  var modal,deckState,cur,flipped;
  function openDeck(){
    if(!modal)buildModal();
    var s=get(); deckState=(s["deck_"+pageKey()]&&s["deck_"+pageKey()].length===cards.length)?s["deck_"+pageKey()]:cards.map(function(_,i){return {i:i,box:1};});
    modal.classList.add("show"); nextCard();
  }
  function saveDeck(){ var s=get(); s["deck_"+pageKey()]=deckState; set(s); }
  function pick(){ var best=deckState[0]; deckState.forEach(function(c){if(c.box<best.box)best=c;}); return best; }
  function nextCard(){ cur=pick(); flipped=false; render(); }
  function render(){
    var c=cards[cur.i];
    modal.querySelector(".gde-card").innerHTML = flipped
      ? '<div>'+esc(c.back)+'</div>'
      : '<div class="q">'+esc(c.front)+'</div><div style="font-size:12px;color:#94a3b8;margin-top:10px">click to flip</div>';
    modal.querySelector(".gde-rate").style.display=flipped?"flex":"none";
    modal.querySelector(".gde-sub").textContent="Box "+cur.box+" of 3 · "+cards.length+" cards from this lesson's key points";
  }
  function buildModal(){
    modal=document.createElement("div"); modal.className="gde-modal";
    modal.innerHTML='<div class="gde-deck" style="position:relative">'
      +'<button class="gde-btn gde-x" style="height:32px;padding:0 10px">✕</button>'
      +'<h3>Flashcards</h3><p class="sub gde-sub"></p>'
      +'<div class="gde-card"></div>'
      +'<div class="gde-row gde-rate" style="display:none">'
      +'<button class="gde-btn gde-again">Again ↻</button><button class="gde-btn on gde-good">Got it ✓</button></div>'
      +'<div class="gde-row"><button class="gde-btn gde-flip">Flip</button></div></div>';
    document.body.appendChild(modal);
    var card=modal.querySelector(".gde-card"), flip=function(){flipped=!flipped;render();};
    card.onclick=flip; modal.querySelector(".gde-flip").onclick=flip;
    modal.querySelector(".gde-again").onclick=function(){cur.box=1;saveDeck();nextCard();};
    modal.querySelector(".gde-good").onclick=function(){cur.box=clamp(cur.box+1,1,3);saveDeck();nextCard();};
    modal.querySelector(".gde-x").onclick=function(){modal.classList.remove("show");};
    modal.addEventListener("click",function(e){if(e.target===modal)modal.classList.remove("show");});
  }

  function mkBtn(icClass,ic,aria,lbl){
    var b=document.createElement("button"); b.className="gde-btn"; b.setAttribute("aria-label",aria);
    b.innerHTML='<span class="'+icClass+'">'+ic+'</span><span class="gde-lbl">'+lbl+'</span>';
    return b;
  }
  function esc(s){var d=document.createElement("div");d.textContent=s;return d.innerHTML;}
  onScroll();
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot);
else boot();
})();
