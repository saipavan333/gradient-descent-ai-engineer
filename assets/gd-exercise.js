/* Gradient Descent — auto-graded coding exercises. Runs your code + hidden tests in-browser (Pyodide). */
(function(){
"use strict";
if(window.__gdxLoaded)return; window.__gdxLoaded=true;
var PYVER="https://cdn.jsdelivr.net/pyodide/v0.26.2/full/pyodide.js";
function loadScript(src){return new Promise(function(res,rej){if(window.loadPyodide){res();return;}var s=document.createElement("script");s.src=src;s.onload=function(){res();};s.onerror=rej;document.head.appendChild(s);});}
function ensurePy(status){
  if(!window.__gdPy){ if(status)status.textContent="⏳ loading Python… (first run, ~15s)";
    window.__gdPy=loadScript(PYVER).then(function(){return loadPyodide();}).catch(function(e){window.__gdPy=null;throw e;}); }
  return window.__gdPy;
}
var loaded=(window.__gdPyPkgs=window.__gdPyPkgs||{});
function pkgsFor(code){var need=[];if(/\bnp\.|import numpy|from numpy/.test(code))need.push("numpy");return need.filter(function(p){return !loaded[p];});}

/* ---------- the exercises ---------- */
var EX={
"vector-norm":{title:"The length of a vector",
  prompt:"Write <code>norm(v)</code> that returns the L2 norm (length) of a vector: <code>&radic;(&Sigma; v&#7522;&sup2;)</code>. Plain Python — no imports needed.",
  starter:"def norm(v):\n    # sum the squares, then take the square root\n    return 0\n",
  hint:"total = sum(x*x for x in v); then return total ** 0.5",
  tests:[["norm([3, 4]) == 5","assert abs(norm([3,4])-5)<1e-9"],["norm([0, 0]) == 0","assert norm([0,0])==0"],["norm([1, 2, 2]) == 3","assert abs(norm([1,2,2])-3)<1e-9"]]},
"dot-product":{title:"The dot product",
  prompt:"Write <code>dot(a, b)</code> returning the dot product of two equal-length lists: <code>&Sigma; a&#7522;&middot;b&#7522;</code>.",
  starter:"def dot(a, b):\n    total = 0\n    # multiply matching pairs and add them up\n    return total\n",
  hint:"for x, y in zip(a, b): total += x * y",
  tests:[["dot([1,2,3],[4,5,6]) == 32","assert dot([1,2,3],[4,5,6])==32"],["handles negatives","assert dot([-1,2],[3,-4])==-11"],["zeros give 0","assert dot([0,0,0],[1,2,3])==0"],["length-1 vectors","assert dot([5],[5])==25"]]},
"gradient-step":{title:"One gradient-descent step",
  prompt:"For the loss <code>f(x) = x&sup2;</code> (whose derivative is <code>f&prime;(x) = 2x</code>), write <code>step(x, lr)</code> that returns x after ONE step downhill: <code>x &minus; lr&middot;2x</code>.",
  starter:"def step(x, lr):\n    # move against the gradient\n    return x\n",
  hint:"return x - lr * (2 * x)",
  tests:[["step(4, 0.1) == 3.2","assert abs(step(4,0.1)-3.2)<1e-9"],["step(0, 0.1) == 0","assert step(0,0.1)==0"],["step(-2, 0.5) == 0","assert abs(step(-2,0.5))<1e-9"]]},
"one-hot":{title:"One-hot encoding",
  prompt:"Write <code>one_hot(i, n)</code> returning a length-<code>n</code> list that is 1 at index <code>i</code> and 0 everywhere else.",
  starter:"def one_hot(i, n):\n    return []\n",
  hint:"[1 if k == i else 0 for k in range(n)]",
  tests:[["one_hot(2, 4) == [0,0,1,0]","assert one_hot(2,4)==[0,0,1,0]"],["one_hot(0, 3) == [1,0,0]","assert one_hot(0,3)==[1,0,0]"],["length is n","assert len(one_hot(1,7))==7"]]},
"standardize":{title:"Standardize a feature",
  prompt:"Write <code>standardize(xs)</code> that rescales a list to zero mean and unit standard deviation: <code>(x &minus; mean) / std</code>. Return the new list.",
  starter:"def standardize(xs):\n    return []\n",
  hint:"mean = sum(xs)/len(xs); std = (sum((x-mean)**2 for x in xs)/len(xs))**0.5; return [(x-mean)/std for x in xs]",
  tests:[["mean becomes ~0","z=standardize([1,2,3,4]); assert abs(sum(z)/len(z))<1e-9"],["length preserved","assert len(standardize([1,2,3,4,5]))==5"],["std becomes ~1","z=standardize([1,2,3,4]); m=sum(z)/len(z); assert abs((sum((v-m)**2 for v in z)/len(z))**0.5-1)<1e-9"]]},
"train-test-split":{title:"Train / test split sizes",
  prompt:"Write <code>split(n, f)</code> returning the tuple <code>(n_train, n_test)</code> where <code>n_test = round(n&middot;f)</code> and <code>n_train = n &minus; n_test</code>.",
  starter:"def split(n, f):\n    return (0, 0)\n",
  hint:"n_test = round(n*f); return (n - n_test, n_test)",
  tests:[["split(100, 0.2) == (80, 20)","assert split(100,0.2)==(80,20)"],["split(10, 0.5) == (5, 5)","assert split(10,0.5)==(5,5)"],["train + test == n","tr,te=split(37,0.3); assert tr+te==37"]]},
"sigmoid":{title:"The sigmoid function",
  prompt:"Write <code>sigmoid(z)</code> returning <code>1 / (1 + e<sup>&minus;z</sup>)</code>. <code>math</code> is already imported.",
  starter:"import math\ndef sigmoid(z):\n    return 0\n",
  hint:"return 1 / (1 + math.exp(-z))",
  tests:[["sigmoid(0) == 0.5","assert abs(sigmoid(0)-0.5)<1e-9"],["large z gives ~1","assert sigmoid(20)>0.999"],["very negative z gives ~0","assert sigmoid(-20)<0.001"]]},
"relu":{title:"ReLU activation",
  prompt:"Write <code>relu(xs)</code> that applies <code>max(0, x)</code> to every element of a list and returns the new list.",
  starter:"def relu(xs):\n    return []\n",
  hint:"[max(0, x) for x in xs]",
  tests:[["relu([-1,2,-3,4]) == [0,2,0,4]","assert relu([-1,2,-3,4])==[0,2,0,4]"],["all negatives become 0","assert relu([-5,-1])==[0,0]"],["positives unchanged","assert relu([1,2,3])==[1,2,3]"]]},
"precision":{title:"Precision from predictions",
  prompt:"Given <code>y_true</code> and <code>y_pred</code> (lists of 0/1), write <code>precision(y_true, y_pred)</code> = <code>TP / (TP + FP)</code> — of everything predicted positive, the fraction that was right.",
  starter:"def precision(y_true, y_pred):\n    # TP: pred 1 and true 1;  FP: pred 1 and true 0\n    return 0.0\n",
  hint:"tp = sum(1 for t,p in zip(y_true,y_pred) if p==1 and t==1); fp = sum(1 for t,p in zip(y_true,y_pred) if p==1 and t==0); return tp/(tp+fp)",
  tests:[["all predictions correct","assert precision([1,1,0],[1,1,0])==1.0"],["one false positive","assert abs(precision([1,0],[1,1])-0.5)<1e-9"],["two of three right","assert abs(precision([1,1,0],[1,1,1])-2/3)<1e-9"]]},
"softmax":{title:"Softmax",
  prompt:"Write <code>softmax(logits)</code> returning probabilities that sum to 1: <code>e<sup>z&#7522;</sup> / &Sigma; e<sup>z&#690;</sup></code>. Subtract the max first for numerical stability. <code>math</code> is imported.",
  starter:"import math\ndef softmax(logits):\n    return []\n",
  hint:"m = max(logits); exps = [math.exp(z-m) for z in logits]; s = sum(exps); return [e/s for e in exps]",
  tests:[["probabilities sum to 1","assert abs(sum(softmax([1.0,2.0,3.0]))-1.0)<1e-9"],["order is preserved","p=softmax([1,2,3]); assert p[2]>p[1]>p[0]"],["equal logits give equal probs","p=softmax([5,5]); assert abs(p[0]-0.5)<1e-9"]]},
"cosine":{title:"Cosine similarity",
  prompt:"Write <code>cosine(a, b)</code> returning the cosine similarity of two vectors: <code>(a&middot;b) / (|a| |b|)</code> — the basis of semantic search.",
  starter:"def cosine(a, b):\n    return 0.0\n",
  hint:"dot = sum(x*y for x,y in zip(a,b)); na = sum(x*x for x in a)**0.5; nb = sum(y*y for y in b)**0.5; return dot/(na*nb)",
  tests:[["identical vectors give 1","assert abs(cosine([1,2,3],[1,2,3])-1.0)<1e-9"],["orthogonal give 0","assert abs(cosine([1,0],[0,1]))<1e-9"],["opposite give -1","assert abs(cosine([1,1],[-1,-1])+1.0)<1e-9"]]},
"accuracy":{title:"Accuracy",
  prompt:"Write <code>accuracy(y_true, y_pred)</code> returning the fraction of predictions that match the labels.",
  starter:"def accuracy(y_true, y_pred):\n    return 0.0\n",
  hint:"sum(1 for t,p in zip(y_true,y_pred) if t==p) / len(y_true)",
  tests:[["3 of 4 correct","assert abs(accuracy([1,0,1,1],[1,0,0,1])-0.75)<1e-9"],["all correct","assert accuracy([1,1,1],[1,1,1])==1.0"],["none correct","assert accuracy([1,1],[0,0])==0.0"]]}
};

/* ---------- runner ---------- */
function esc(s){var d=document.createElement("div");d.textContent=s;return d.innerHTML;}
function autosize(ta){ta.style.height="auto";ta.style.height=(ta.scrollHeight+4)+"px";}
function render(host){
  var name=host.getAttribute("data-exercise"), ex=EX[name];
  if(!ex){host.innerHTML='<div class="gdx-box"><div class="gdx-head">unknown exercise: '+esc(name)+'</div></div>';return;}
  var box=document.createElement("div");box.className="gdx-box";
  box.innerHTML='<div class="gdx-head">🎯 Exercise · '+esc(ex.title)+'</div><div class="gdx-prompt">'+ex.prompt+'</div>';
  var ta=document.createElement("textarea");ta.className="gdx-code";ta.value=ex.starter;ta.spellcheck=false;box.appendChild(ta);
  var bar=document.createElement("div");bar.className="gdx-bar";
  bar.innerHTML='<button class="gdx-btn">▶ Run &amp; Check</button><span class="gdx-status"></span><button class="gdx-reset" title="reset to starter code">↺ reset</button>';
  box.appendChild(bar);
  var res=document.createElement("div");res.className="gdx-results";box.appendChild(res);
  host.innerHTML="";host.appendChild(box);
  autosize(ta);ta.addEventListener("input",function(){autosize(ta);});
  var btn=bar.querySelector(".gdx-btn"),status=bar.querySelector(".gdx-status");
  bar.querySelector(".gdx-reset").onclick=function(){ta.value=ex.starter;autosize(ta);res.innerHTML="";};
  btn.onclick=function(){grade(ex,ta.value,btn,status,res);};
}
function grade(ex,code,btn,status,res){
  btn.disabled=true;res.innerHTML='<div class="gdx-msg">running your code &amp; the hidden tests…</div>';
  ensurePy(status).then(function(py){
    var joined=code+"\n"+ex.tests.map(function(t){return t[1];}).join("\n");
    var extra=pkgsFor(joined);
    var step=extra.length?(function(){status.textContent="⏳ loading "+extra.join(", ")+"…";return py.loadPackage(extra).then(function(){extra.forEach(function(p){loaded[p]=1;});});})():Promise.resolve();
    return step.then(function(){
      status.textContent="";
      py.runPython("import sys,io,json\n_o=io.StringIO()\nsys.stdout=_o\n_ns={}");
      py.globals.set("_usercode",code);
      try{ py.runPython("exec(_usercode,_ns)"); }
      catch(err){ res.innerHTML='<div class="gdx-err"><b>Your code didn\'t run:</b>\n'+esc(String(err.message||err).split("\n").slice(-3).join("\n"))+'</div>'; btn.disabled=false; return; }
      var harness="_T="+JSON.stringify(ex.tests)+"\n_r=[]\nfor _d,_c in _T:\n"+
        "    try:\n        exec(_c,_ns)\n        _r.append([_d,True,''])\n"+
        "    except AssertionError:\n        _r.append([_d,False,'returned the wrong value'])\n"+
        "    except Exception as _e:\n        _r.append([_d,False,type(_e).__name__+': '+str(_e)])\n"+
        "print('@@GDX@@'+json.dumps(_r))";
      try{ py.runPython(harness); }catch(e){ res.innerHTML='<div class="gdx-err">test harness error</div>'; btn.disabled=false; return; }
      var out=py.runPython("_o.getvalue()"), line=(out.split("\n").filter(function(l){return l.indexOf("@@GDX@@")===0;})[0]||"@@GDX@@[]").slice(7);
      var r; try{ r=JSON.parse(line); }catch(e){ r=[]; }
      var passed=r.filter(function(x){return x[1];}).length, all=passed===r.length && r.length>0;
      var html='<div class="gdx-score '+(all?"pass":"fail")+'">'+(all?"✓ All "+r.length+" tests passed — nicely done.":passed+" / "+r.length+" tests passed")+'</div>';
      r.forEach(function(x){ html+='<div class="gdx-test '+(x[1]?"ok":"no")+'"><span class="ic">'+(x[1]?"✓":"✗")+'</span><code>'+esc(x[0])+'</code>'+(x[1]?"":'<span class="rsn">'+esc(x[2])+'</span>')+'</div>'; });
      if(!all && ex.hint) html+='<div class="gdx-hint"><b>Hint:</b> <code>'+esc(ex.hint)+'</code></div>';
      // capture any user prints (before the sentinel) for debugging
      var userOut=out.split("@@GDX@@")[0].trim();
      if(userOut) html+='<div class="gdx-stdout"><b>your output:</b>\n'+esc(userOut)+'</div>';
      res.innerHTML=html; btn.disabled=false;
    });
  }).catch(function(){ res.innerHTML='<div class="gdx-err">Python runtime unavailable offline on first load. Connect to the internet once and retry.</div>'; btn.disabled=false; });
}
function boot(){ [].forEach.call(document.querySelectorAll(".gdx[data-exercise]"),render); }
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot);else boot();
})();
