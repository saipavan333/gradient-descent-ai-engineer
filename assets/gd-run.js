/* Gradient Descent — runnable Python cells via Pyodide. Lazy-loaded on first Run. */
(function(){
"use strict";
if(window.__gdrunLoaded)return; window.__gdrunLoaded=true;
var PYVER="https://cdn.jsdelivr.net/pyodide/v0.26.2/full/pyodide.js";
var _py=null, cells=[], loaded={};
function loadScript(src){
  return new Promise(function(res,rej){
    if(window.loadPyodide){res();return;}
    var s=document.createElement("script");s.src=src;s.onload=function(){res();};s.onerror=rej;document.head.appendChild(s);
  });
}
function ensurePy(status){
  if(!_py){
    status.textContent="⏳ loading Python… (first run, ~15s)";
    _py=loadScript(PYVER).then(function(){return loadPyodide();})
      .catch(function(e){status.textContent="⚠ couldn't load Python (needs internet on first run)";_py=null;throw e;});
  }
  return _py;
}
function pkgsFor(code){
  var need=["numpy"];
  if(/\b(import pandas|from pandas|pd\.)/.test(code)) need.push("pandas");
  if(/\b(import scipy|from scipy)/.test(code)) need.push("scipy");
  if(/\b(sklearn|scikit-learn)/.test(code)) need.push("scikit-learn");
  return need.filter(function(p){return !loaded[p];});
}
function autosize(ta){ ta.style.height="auto"; ta.style.height=(ta.scrollHeight+2)+"px"; }
function wire(ta){
  var box=document.createElement("div");box.className="gdrun-box";
  ta.parentNode.insertBefore(box,ta);
  var bar=document.createElement("div");bar.className="gdrun-bar";
  bar.innerHTML='<span class="gdrun-lbl">🐍 Python · runs in your browser</span><span class="gdrun-status"></span><button class="gdrun-btn">▶ Run</button>';
  box.appendChild(bar);box.appendChild(ta);
  var olbl=document.createElement("div");olbl.className="gdrun-outlbl";olbl.textContent="Output";
  var out=document.createElement("div");out.className="gdrun-out";out.textContent="▸ press Run — the output appears here";
  box.appendChild(olbl);box.appendChild(out);
  autosize(ta); ta.addEventListener("input",function(){autosize(ta);}); cells.push(ta);
  var status=bar.querySelector(".gdrun-status"),btn=bar.querySelector(".gdrun-btn");
  btn.onclick=function(){
    btn.disabled=true; out.textContent="running…"; out.className="gdrun-out";
    ensurePy(status).then(function(py){
      var extra=pkgsFor(ta.value);
      var step=extra.length?(function(){status.textContent="⏳ loading "+extra.join(", ")+"…";return py.loadPackage(extra).then(function(){extra.forEach(function(p){loaded[p]=1;});});})():Promise.resolve();
      return step.then(function(){
        status.textContent="";
        py.runPython("import sys,io\n_o=io.StringIO()\nsys.stdout=_o\nsys.stderr=_o");
        try{ py.runPython(ta.value); }
        catch(err){ out.textContent=String(err.message||err); out.className="gdrun-out err"; btn.disabled=false; return; }
        var o=py.runPython("_o.getvalue()");
        out.textContent=(o&&o.length)?o:"(ran with no output)"; out.className="gdrun-out ok"; btn.disabled=false;
      });
    }).catch(function(){ out.textContent="Python runtime unavailable offline on first load. Connect once and retry."; out.className="gdrun-out err"; btn.disabled=false; });
  };
}
function boot(){ [].forEach.call(document.querySelectorAll(".gdrun-code"),wire); }
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot);else boot();
window.addEventListener("load",function(){cells.forEach(autosize);});
})();
