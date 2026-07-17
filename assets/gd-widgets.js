/* Gradient Descent — inline interactive widgets. Self-contained, offline, no deps. */
(function(){
"use strict";
if(window.__gdwLoaded)return; window.__gdwLoaded=true;
var reg={};

/* ---- shared helpers ---- */
function el(tag,cls,html){var e=document.createElement(tag);if(cls)e.className=cls;if(html!=null)e.innerHTML=html;return e;}
function shell(host,title,hint,w,h){
  host.innerHTML="";
  host.appendChild(el("div","gdw-title",title));
  if(hint)host.appendChild(el("div","gdw-hint",hint));
  var cv=el("canvas");cv.width=w||620;cv.height=h||340;host.appendChild(cv);
  var body=el("div");host.appendChild(body);
  var read=el("div","gdw-read");host.appendChild(read);
  return {cv:cv,ctx:cv.getContext("2d"),body:body,read:read};
}
function btn(parent,label,cb,cls){var b=el("button","gdw-btn"+(cls?" "+cls:""),label);b.onclick=function(){cb(b);};parent.appendChild(b);return b;}
function slider(parent,label,min,max,step,val,cb){
  var row=el("div","gdw-sl");row.appendChild(el("label",null,label));
  var inp=el("input");inp.type="range";inp.min=min;inp.max=max;inp.step=step;inp.value=val;
  var v=el("span","v",(+val).toString());
  inp.addEventListener("input",function(){v.textContent=(+inp.value).toString();cb(+inp.value);});
  row.appendChild(inp);row.appendChild(v);parent.appendChild(row);
  return {set:function(x){inp.value=x;v.textContent=(+x).toString();}};
}
function clamp(x,a,b){return x<a?a:(x>b?b:x);}
// axis plotter: maps math (x in [xlo,xhi], y in [ylo,yhi]) to canvas
function Plot(ctx,W,H,xlo,xhi,ylo,yhi,pad){
  pad=pad||34;
  function X(x){return pad+(x-xlo)/(xhi-xlo)*(W-2*pad);}
  function Y(y){return H-pad-(y-ylo)/(yhi-ylo)*(H-2*pad);}
  return {X:X,Y:Y,
    axes:function(){
      ctx.clearRect(0,0,W,H);
      ctx.strokeStyle="#e2e8f0";ctx.lineWidth=1;
      for(var gx=Math.ceil(xlo);gx<=xhi;gx++){ctx.beginPath();ctx.moveTo(X(gx),pad);ctx.lineTo(X(gx),H-pad);ctx.stroke();}
      ctx.strokeStyle="#cbd5e1";ctx.lineWidth=1.4;
      if(ylo<=0&&yhi>=0){ctx.beginPath();ctx.moveTo(pad,Y(0));ctx.lineTo(W-pad,Y(0));ctx.stroke();}
      if(xlo<=0&&xhi>=0){ctx.beginPath();ctx.moveTo(X(0),pad);ctx.lineTo(X(0),H-pad);ctx.stroke();}
    },
    curve:function(fn,col,w){ctx.strokeStyle=col;ctx.lineWidth=w||2.4;ctx.beginPath();
      var first=true;for(var px=0;px<=200;px++){var x=xlo+(xhi-xlo)*px/200,y=fn(x);
        if(y<ylo-99||y>yhi+99){first=true;continue;}var cx=X(x),cy=Y(clamp(y,ylo-5,yhi+5));
        if(first){ctx.moveTo(cx,cy);first=false;}else ctx.lineTo(cx,cy);}ctx.stroke();},
    dot:function(x,y,col,r){ctx.fillStyle=col;ctx.beginPath();ctx.arc(X(x),Y(y),r||5,0,7);ctx.fill();}
  };
}

/* ================= vector-pad ================= */
reg["vector-pad"]=function(host){
  var s=shell(host,"▶ Interactive · drag the vector, watch its numbers",
    "Click or drag on the grid to move the blue arrow's tip. Orange = horizontal component, green = vertical, red (toggle) = the unit vector. Try to land on (3, 4) and confirm the length is exactly 5.",620,380);
  var ctx=s.ctx,W=620,H=380,S=40,ox=W/2,oy=H/2,vx=3,vy=4,drag=false,unit=false;
  function arrow(x1,y1,x2,y2,c,w){ctx.strokeStyle=c;ctx.fillStyle=c;ctx.lineWidth=w;
    ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();
    if(Math.hypot(x2-x1,y2-y1)<2)return;var a=Math.atan2(y2-y1,x2-x1),h=11;
    ctx.beginPath();ctx.moveTo(x2,y2);ctx.lineTo(x2-h*Math.cos(a-.42),y2-h*Math.sin(a-.42));
    ctx.lineTo(x2-h*Math.cos(a+.42),y2-h*Math.sin(a+.42));ctx.closePath();ctx.fill();}
  function draw(){
    ctx.clearRect(0,0,W,H);ctx.strokeStyle="#eef1f6";ctx.lineWidth=1;
    for(var gx=ox%S;gx<W;gx+=S){ctx.beginPath();ctx.moveTo(gx,0);ctx.lineTo(gx,H);ctx.stroke();}
    for(var gy=oy%S;gy<H;gy+=S){ctx.beginPath();ctx.moveTo(0,gy);ctx.lineTo(W,gy);ctx.stroke();}
    ctx.strokeStyle="#cbd5e1";ctx.lineWidth=1.4;ctx.beginPath();ctx.moveTo(0,oy);ctx.lineTo(W,oy);ctx.stroke();
    ctx.beginPath();ctx.moveTo(ox,0);ctx.lineTo(ox,H);ctx.stroke();
    var tx=ox+vx*S,ty=oy-vy*S;
    ctx.strokeStyle="#94a3b8";ctx.setLineDash([4,4]);ctx.lineWidth=1;
    ctx.beginPath();ctx.moveTo(tx,ty);ctx.lineTo(tx,oy);ctx.stroke();
    ctx.beginPath();ctx.moveTo(tx,ty);ctx.lineTo(ox,ty);ctx.stroke();ctx.setLineDash([]);
    arrow(ox,oy,tx,oy,"#d97706",2.5);arrow(ox,oy,ox,ty,"#059669",2.5);arrow(ox,oy,tx,ty,"#2563eb",3);
    if(unit){var Lu=Math.sqrt(vx*vx+vy*vy)||1;arrow(ox,oy,ox+vx/Lu*S,oy-vy/Lu*S,"#dc2626",3);}
    ctx.fillStyle="#2563eb";ctx.beginPath();ctx.arc(tx,ty,6,0,7);ctx.fill();
    ctx.fillStyle="#fff";ctx.beginPath();ctx.arc(tx,ty,2.5,0,7);ctx.fill();
    var L=Math.sqrt(vx*vx+vy*vy);
    var m="v = ("+vx.toFixed(1)+", "+vy.toFixed(1)+")   |v| = √("+vx.toFixed(1)+"² + "+vy.toFixed(1)+"²) = √"+(vx*vx+vy*vy).toFixed(2)+" = "+L.toFixed(3);
    if(unit)m+="\nunit = ("+(vx/(L||1)).toFixed(3)+", "+(vy/(L||1)).toFixed(3)+")  (length 1, same direction)";
    s.read.textContent=m;
  }
  function set(e){var r=s.cv.getBoundingClientRect();var px=(e.clientX-r.left)*W/r.width,py=(e.clientY-r.top)*H/r.height;
    vx=clamp(Math.round((px-ox)/S*2)/2,-7,7);vy=clamp(Math.round((oy-py)/S*2)/2,-4.5,4.5);draw();}
  s.cv.addEventListener("pointerdown",function(e){drag=true;set(e);e.preventDefault();});
  s.cv.addEventListener("pointermove",function(e){if(drag){set(e);e.preventDefault();}});
  window.addEventListener("pointerup",function(){drag=false;});
  btn(s.body,"Reset to (3, 4)",function(){vx=3;vy=4;draw();});
  var ub;ub=btn(s.body,"Show unit vector",function(b){unit=!unit;b.classList.toggle("on",unit);draw();});
  s.cv.style.cursor="crosshair";draw();
};

/* ================= gradient-descent ================= */
reg["gradient-descent"]=function(host){
  var s=shell(host,"▶ Interactive · roll downhill with gradient descent",
    "The bowl is the loss f(x) = x². Gradient descent takes the slope f′(x) = 2x and steps downhill: x ← x − (learning rate)·2x. Press Step to take one step, or Run. Push the learning rate too high and watch it diverge.",620,340);
  var ctx=s.ctx,W=620,H=340,x=4.2,lr=0.1,timer=null;
  var P=Plot(ctx,W,H,-5,5,-1,25,36);
  function f(t){return t*t;} function g(t){return 2*t;}
  function draw(){P.axes();P.curve(f,"#6366f1",2.6);
    var gx=g(x),nx=x-lr*gx;
    // tangent
    ctx.strokeStyle="#f59e0b";ctx.lineWidth=1.6;ctx.beginPath();
    ctx.moveTo(P.X(x-1.2),P.Y(f(x)-gx*1.2));ctx.lineTo(P.X(x+1.2),P.Y(f(x)+gx*1.2));ctx.stroke();
    P.dot(x,f(x),"#dc2626",7);P.dot(nx,f(nx),"#10b981",5);
    s.read.textContent="x = "+x.toFixed(3)+"   f(x) = "+f(x).toFixed(3)+"   f′(x) = 2·x = "+gx.toFixed(3)
      +"\nstep: x ← "+x.toFixed(3)+" − "+lr+"·"+gx.toFixed(3)+" = "+nx.toFixed(3)+"   (green = where you land)";
  }
  function step(){x=x-lr*g(x);if(!isFinite(x)||Math.abs(x)>1e6){x=4.2;}draw();}
  slider(s.body,"learn rate",0.01,1.05,0.01,0.1,function(v){lr=v;draw();});
  btn(s.body,"Step ▸",function(){stop();step();});
  var rb=btn(s.body,"Run ▶",function(b){if(timer){stop();}else{b.textContent="Pause";timer=setInterval(step,340);}},"primary");
  btn(s.body,"Reset",function(){stop();x=4.2;draw();});
  function stop(){if(timer){clearInterval(timer);timer=null;rb.textContent="Run ▶";}}
  draw();
};

/* ================= activations ================= */
reg["activations"]=function(host){
  var s=shell(host,"▶ Interactive · the activation functions, side by side",
    "Toggle each nonlinearity on the plot and slide the input x to read off its value. ReLU zeros negatives; sigmoid squashes to (0,1); tanh to (−1,1); GELU is a smooth ReLU. These are the 'kinks' that let networks bend.",620,340);
  var ctx=s.ctx,W=620,H=340,x=0.8;
  var P=Plot(ctx,W,H,-4,4,-1.3,2.2,34);
  var F={relu:function(t){return Math.max(0,t);},sigmoid:function(t){return 1/(1+Math.exp(-t));},
    tanh:function(t){return Math.tanh(t);},gelu:function(t){return t/(1+Math.exp(-1.702*t));}};
  var COL={relu:"#dc2626",sigmoid:"#4f46e5",tanh:"#059669",gelu:"#d97706"};
  var on={relu:true,sigmoid:true,tanh:true,gelu:true};
  function draw(){P.axes();
    ctx.setLineDash([3,3]);ctx.strokeStyle="#cbd5e1";ctx.beginPath();ctx.moveTo(P.X(x),P.Y(-1.3));ctx.lineTo(P.X(x),P.Y(2.2));ctx.stroke();ctx.setLineDash([]);
    var lines=[];
    for(var k in F){if(on[k]){P.curve(F[k],COL[k],2.4);P.dot(x,F[k](x),COL[k],4.5);lines.push(k+"("+x.toFixed(2)+") = "+F[k](x).toFixed(3));}}
    s.read.textContent=lines.join("\n")||"(toggle a function on)";
  }
  slider(s.body,"input x",-4,4,0.05,0.8,function(v){x=v;draw();});
  for(var k in F)(function(k){btn(s.body,k,function(b){on[k]=!on[k];b.classList.toggle("on",on[k]);draw();},on[k]?"on":"");})(k);
  draw();
};

/* ================= sigmoid (logistic) ================= */
reg["sigmoid"]=function(host){
  var s=shell(host,"▶ Interactive · from a score to a probability",
    "Logistic regression turns a raw score z into a probability with σ(z) = 1 / (1 + e^−z). Slide z and watch the probability, and the decision at the 0.5 threshold. Notice how far z must move to shift a confident prediction.",620,320);
  var ctx=s.ctx,W=620,H=320,z=0;
  var P=Plot(ctx,W,H,-6,6,-0.1,1.15,34);
  function sig(t){return 1/(1+Math.exp(-t));}
  function draw(){P.axes();
    ctx.strokeStyle="#e2e8f0";ctx.setLineDash([4,4]);ctx.beginPath();ctx.moveTo(P.X(-6),P.Y(0.5));ctx.lineTo(P.X(6),P.Y(0.5));ctx.stroke();ctx.setLineDash([]);
    P.curve(sig,"#4f46e5",2.8);
    ctx.setLineDash([3,3]);ctx.strokeStyle="#cbd5e1";ctx.beginPath();ctx.moveTo(P.X(z),P.Y(-0.1));ctx.lineTo(P.X(z),P.Y(1.15));ctx.stroke();ctx.setLineDash([]);
    var p=sig(z);P.dot(z,p,p>=0.5?"#059669":"#dc2626",6.5);
    s.read.textContent="z = "+z.toFixed(2)+"   σ(z) = 1/(1+e^"+(-z).toFixed(2)+") = "+p.toFixed(4)
      +"\ndecision: "+(p>=0.5?"class 1 (p ≥ 0.5)":"class 0 (p < 0.5)");
  }
  slider(s.body,"score z",-6,6,0.05,0,function(v){z=v;draw();});
  btn(s.body,"z = 0 (p = 0.5)",function(){z=0;draw();});
  draw();
};

/* ================= line-fit (least squares) ================= */
reg["line-fit"]=function(host){
  var s=shell(host,"▶ Interactive · fit a line by minimizing squared error",
    "Move the line with the slope and intercept sliders and watch the mean squared error (MSE) — the average of the squared vertical gaps (shown in red). Then press ‘Best fit’ to jump to the least-squares line that makes the MSE as small as possible.",620,340);
  var ctx=s.ctx,W=620,H=340,m=0.4,b=1.2;
  var pts=[[1,2.1],[2,2.0],[3,3.4],[4,3.3],[5,4.8],[6,5.0],[7,6.3]];
  var P=Plot(ctx,W,H,0,8,0,8,34);
  var slM,slB;
  function mse(){var e=0;for(var i=0;i<pts.length;i++){var d=(m*pts[i][0]+b)-pts[i][1];e+=d*d;}return e/pts.length;}
  function best(){var n=pts.length,sx=0,sy=0,sxx=0,sxy=0;
    for(var i=0;i<n;i++){sx+=pts[i][0];sy+=pts[i][1];sxx+=pts[i][0]*pts[i][0];sxy+=pts[i][0]*pts[i][1];}
    var mm=(n*sxy-sx*sy)/(n*sxx-sx*sx);var bb=(sy-mm*sx)/n;return [mm,bb];}
  function draw(){P.axes();
    for(var i=0;i<pts.length;i++){var px=pts[i][0],py=pts[i][1],ly=m*px+b;
      ctx.strokeStyle="#fca5a5";ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(P.X(px),P.Y(py));ctx.lineTo(P.X(px),P.Y(ly));ctx.stroke();}
    ctx.strokeStyle="#4f46e5";ctx.lineWidth=2.6;ctx.beginPath();ctx.moveTo(P.X(0),P.Y(b));ctx.lineTo(P.X(8),P.Y(m*8+b));ctx.stroke();
    for(i=0;i<pts.length;i++)P.dot(pts[i][0],pts[i][1],"#0f172a",5);
    s.read.textContent="line: y = "+m.toFixed(2)+"·x + "+b.toFixed(2)+"     MSE = "+mse().toFixed(3);
  }
  slM=slider(s.body,"slope m",-1,2,0.02,0.4,function(v){m=v;draw();});
  slB=slider(s.body,"intercept b",-2,4,0.05,1.2,function(v){b=v;draw();});
  btn(s.body,"Best fit (least squares)",function(){var r=best();m=r[0];b=r[1];slM.set(m.toFixed(2));slB.set(b.toFixed(2));draw();},"primary");
  draw();
};

/* ================= neuron ================= */
reg["neuron"]=function(host){
  var s=shell(host,"▶ Interactive · one neuron computing",
    "A neuron takes inputs, multiplies each by a weight, adds a bias, and passes the sum z through an activation. Slide the weights and inputs; the plot shows the activation with a dot at your z, and the readout shows the arithmetic.",620,300);
  var ctx=s.ctx,W=620,H=300,x1=1,x2=1,w1=0.6,w2=-0.4,b=0.1,act="sigmoid";
  var P=Plot(ctx,W,H,-6,6,-1.2,1.2,34);
  var F={sigmoid:function(t){return 1/(1+Math.exp(-t));},relu:function(t){return Math.max(0,t);},tanh:function(t){return Math.tanh(t);}};
  function draw(){P.axes();P.curve(F[act],"#6366f1",2.4);
    var z=w1*x1+w2*x2+b,a=F[act](z);
    ctx.setLineDash([3,3]);ctx.strokeStyle="#cbd5e1";ctx.beginPath();ctx.moveTo(P.X(z),P.Y(-1.2));ctx.lineTo(P.X(z),P.Y(1.2));ctx.stroke();ctx.setLineDash([]);
    P.dot(z,a,"#dc2626",6);
    s.read.textContent="z = w1·x1 + w2·x2 + b = "+w1.toFixed(2)+"·"+x1.toFixed(1)+" + "+w2.toFixed(2)+"·"+x2.toFixed(1)+" + "+b.toFixed(2)+" = "+z.toFixed(3)
      +"\noutput a = "+act+"(z) = "+a.toFixed(4);
  }
  slider(s.body,"input x1",-3,3,0.1,1,function(v){x1=v;draw();});
  slider(s.body,"input x2",-3,3,0.1,1,function(v){x2=v;draw();});
  slider(s.body,"weight w1",-2,2,0.05,0.6,function(v){w1=v;draw();});
  slider(s.body,"weight w2",-2,2,0.05,-0.4,function(v){w2=v;draw();});
  slider(s.body,"bias b",-2,2,0.05,0.1,function(v){b=v;draw();});
  for(var k in F)(function(k){btn(s.body,k,function(bt){act=k;[].forEach.call(s.body.querySelectorAll(".gdw-btn"),function(x){x.classList.remove("on");});bt.classList.add("on");draw();},k==="sigmoid"?"on":"");})(k);
  draw();
};


/* ================= bias-variance ================= */
reg["bias-variance"]=function(host){
  var s=shell(host,"▶ Interactive · overfitting in one slider",
    "Drag the model complexity. Too simple underfits (misses the pattern); too complex overfits (memorizes the noise). Watch training error keep falling while test error dips then explodes — the U-shape.",620,340);
  var ctx=s.ctx,W=620,H=340;
  var D={"xt":[0,0.1,0.2,0.3,0.4,0.5,0.6,0.7,0.8,0.9,1.0],"yt":[0.455,0.365,0.757,0.692,1.013,-0.335,0.24,-0.942,-0.893,-1.0,-0.178],
    "fits":{"1":{"coef":[-1.6012,0.8162],"train":0.225,"test":0.371},"2":{"coef":[-0.693,-0.9082,0.7123],"train":0.222,"test":0.346},"3":{"coef":[14.3522,-22.2212,7.3012,0.1956],"train":0.106,"test":0.134},"5":{"coef":[-27.1149,95.5661,-100.4064,33.5164,-2.1941,0.4282],"train":0.075,"test":0.112},"7":{"coef":[-77.4249,434.8276,-891.7645,903.5082,-476.3296,115.0655,-8.518,0.4563],"train":0.072,"test":0.095},"10":{"coef":[1042066.67,-5194226.28,11089665.81,-13249947.3,9709954.27,-4495689.98,1304144.31,-226179.17,20988.48,-777.44,0.4548],"train":0.0,"test":20.759}}};
  var degs=[1,2,3,5,7,10], di=2;
  var P=Plot(ctx,W,H,-0.05,1.05,-2.3,2.3,34);
  function pv(c,x){var v=0;for(var i=0;i<c.length;i++)v=v*x+c[i];return v;}
  function draw(){
    var d=degs[di], f=D.fits[""+d]; P.axes();
    P.curve(function(x){return pv(f.coef,x);},"#6366f1",2.6);
    for(var i=0;i<D.xt.length;i++)P.dot(D.xt[i],D.yt[i],"#0f172a",4.5);
    var verdict=d<=2?"underfitting — too simple to capture the pattern":(d>=10?"overfitting — memorizes noise; test error explodes":"good fit — captures the pattern and generalizes");
    s.read.textContent="polynomial degree = "+d+"    train MSE = "+f.train.toFixed(3)+"    test MSE = "+f.test.toFixed(3)+"\n"+verdict;
  }
  slider(s.body,"complexity",0,degs.length-1,1,2,function(v){di=v|0;draw();});
  draw();
};

/* ================= softmax-temp ================= */
reg["softmax-temp"]=function(host){
  var s=shell(host,"▶ Interactive · temperature shapes the choice",
    "A model turns scores (logits) into probabilities with softmax. Temperature T divides the logits first: low T sharpens toward the top choice (safe, repetitive); high T flattens (creative, riskier). Slide T.",620,320);
  var ctx=s.ctx,W=620,H=320;
  var logits=[2.0,1.0,0.5,0.1,-0.5], toks=["cat","dog","the","sat","zzz"], T=1.0;
  function sm(){var z=logits.map(function(v){return v/T;});var m=Math.max.apply(null,z);var e=z.map(function(v){return Math.exp(v-m);});var t=e.reduce(function(a,b){return a+b;},0);return e.map(function(v){return v/t;});}
  function draw(){
    ctx.clearRect(0,0,W,H);var p=sm(),base=H-46,bw=72,gap=28,x0=95;
    for(var i=0;i<p.length;i++){var h=p[i]*(H-96),x=x0+i*(bw+gap);
      ctx.fillStyle=i===0?"#4f46e5":"#a5b4fc";ctx.fillRect(x,base-h,bw,h);
      ctx.fillStyle="#0f172a";ctx.font="600 13px system-ui";ctx.textAlign="center";ctx.fillText(p[i].toFixed(2),x+bw/2,base-h-7);
      ctx.fillStyle="#334155";ctx.font="13px system-ui";ctx.fillText('"'+toks[i]+'"',x+bw/2,base+18);
      ctx.fillStyle="#94a3b8";ctx.font="11px ui-monospace,monospace";ctx.fillText("logit "+logits[i].toFixed(1),x+bw/2,base+34);}
    s.read.textContent="temperature T = "+T.toFixed(2)+"   "+(T<0.7?"→ sharp: almost always the top token (repetitive)":(T>1.5?"→ flat: lower-ranked tokens picked more (creative, riskier)":"→ balanced"));
  }
  slider(s.body,"temperature",0.2,2.5,0.05,1.0,function(v){T=v;draw();});
  draw();
};

/* ================= bayes ================= */
reg["bayes"]=function(host){
  var s=shell(host,"▶ Interactive · the base-rate surprise",
    "A test can be 99% accurate yet a positive result still means you're probably fine — because the disease is rare. Slide the dials; the 1000-dot grid shows who's sick and who tests positive.",620,320);
  var ctx=s.ctx,W=620,H=320,prev=0.01,sens=0.99,spec=0.95;
  function draw(){
    var diseased=Math.round(1000*prev),healthy=1000-diseased;
    var TP=Math.round(diseased*sens),FN=diseased-TP,FP=Math.round(healthy*(1-spec)),TN=healthy-FP;
    var post=(TP+FP)>0?TP/(TP+FP):0;
    ctx.clearRect(0,0,W,H);
    var cols=40,rows=25,cw=13,ch=9,x0=16,y0=16,i=0;
    for(var r=0;r<rows;r++)for(var c=0;c<cols;c++){
      var col= i<TP?"#dc2626": i<TP+FN?"#fca5a5": i<TP+FN+FP?"#f59e0b":"#e5eaf3";
      ctx.fillStyle=col;ctx.fillRect(x0+c*cw,y0+r*ch,cw-1.5,ch-1.5);i++;}
    var ly=y0+rows*ch+22;
    function key(x,col,t){ctx.fillStyle=col;ctx.fillRect(x,ly-9,11,11);ctx.fillStyle="#475569";ctx.font="11.5px system-ui";ctx.textAlign="left";ctx.fillText(t,x+16,ly);}
    key(16,"#dc2626","sick + positive ("+TP+")");key(190,"#f59e0b","healthy + positive ("+FP+")");key(400,"#e5eaf3","healthy + negative");
    s.read.textContent="prevalence "+(prev*100).toFixed(1)+"%   sensitivity "+(sens*100).toFixed(0)+"%   specificity "+(spec*100).toFixed(0)+"%\nOf everyone who tests POSITIVE, only "+(post*100).toFixed(1)+"% actually have the disease  (= "+TP+" of "+(TP+FP)+")";
  }
  slider(s.body,"prevalence %",0.1,20,0.1,1,function(v){prev=v/100;draw();});
  slider(s.body,"sensitivity %",50,100,1,99,function(v){sens=v/100;draw();});
  slider(s.body,"specificity %",50,100,1,95,function(v){spec=v/100;draw();});
  draw();
};

/* ================= attention ================= */
reg["attention"]=function(host){
  var s=shell(host,"▶ Interactive · what a word attends to",
    "Self-attention lets each word gather meaning from the others. Click a word to make it the query — the bars show how much attention it pays to every word (its softmax weights). Try 'it'.",620,300);
  var ctx=s.ctx,W=620,H=300;
  var toks=["the","cat","sat","because","it","was","tired"];
  var emb=[[1,0,0,.2],[.9,.2,0,.1],[.2,.9,.1,0],[0,0,1,.3],[.85,.25,0,.15],[0,.1,.9,.2],[.1,.8,.2,.1]];
  var q=4;
  function dot(a,b){var s2=0;for(var i=0;i<a.length;i++)s2+=a[i]*b[i];return s2;}
  function sm(z){var m=Math.max.apply(null,z);var e=z.map(function(v){return Math.exp((v-m)*3);});var t=e.reduce(function(a,b){return a+b;},0);return e.map(function(v){return v/t;});}
  function draw(){
    ctx.clearRect(0,0,W,H);
    var w=sm(emb.map(function(e){return dot(emb[q],e);}));
    var n=toks.length,bw=64,gap=14,x0=40,base=H-58;
    for(var i=0;i<n;i++){var h=w[i]*(H-110),x=x0+i*(bw+gap);
      ctx.fillStyle=i===q?"#4f46e5":"#93c5fd";ctx.fillRect(x,base-h,bw,h);
      ctx.fillStyle="#0f172a";ctx.font="600 11px system-ui";ctx.textAlign="center";ctx.fillText(w[i].toFixed(2),x+bw/2,base-h-6);
      ctx.fillStyle=i===q?"#4f46e5":"#334155";ctx.font=(i===q?"700 ":"400 ")+"13px system-ui";ctx.fillText(toks[i],x+bw/2,base+20);}
    ctx.fillStyle="#94a3b8";ctx.font="12px system-ui";ctx.textAlign="left";ctx.fillText('query = "'+toks[q]+'"  · click any word to change it',x0,26);
    s.read.textContent='"'+toks[q]+'" attends most to "'+toks[w.indexOf(Math.max.apply(null,w))]+'"  (taller bar = more attention)';
  }
  s.cv.style.cursor="pointer";
  s.cv.addEventListener("click",function(e){var r=s.cv.getBoundingClientRect();var x=(e.clientX-r.left)*W/r.width;var n=toks.length,bw=64,gap=14,x0=40;var idx=Math.floor((x-x0)/(bw+gap));if(idx>=0&&idx<n){q=idx;draw();}});
  draw();
};



/* ================= matrix-transform ================= */
reg["matrix-transform"]=function(host){
  var s=shell(host,"▶ Interactive · a matrix bends space",
    "A 2×2 matrix is a rule for transforming space. Slide its four numbers and watch the grid rotate, stretch, and shear. The orange and green arrows show where the basis vectors (1,0) and (0,1) land. The determinant is the area-scale factor.",620,380);
  var ctx=s.ctx,W=620,H=380,S=42,ox=W/2,oy=H/2,a=1,b=0,c=0,d=1,slN=[];
  function T(x,y){return [ox+(a*x+b*y)*S, oy-(c*x+d*y)*S];}
  function ln(p,q){ctx.beginPath();ctx.moveTo(p[0],p[1]);ctx.lineTo(q[0],q[1]);ctx.stroke();}
  function arr(p,col){ctx.strokeStyle=col;ctx.fillStyle=col;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(ox,oy);ctx.lineTo(p[0],p[1]);ctx.stroke();var g=Math.atan2(p[1]-oy,p[0]-ox);if(Math.hypot(p[0]-ox,p[1]-oy)<3)return;ctx.beginPath();ctx.moveTo(p[0],p[1]);ctx.lineTo(p[0]-12*Math.cos(g-.4),p[1]-12*Math.sin(g-.4));ctx.lineTo(p[0]-12*Math.cos(g+.4),p[1]-12*Math.sin(g+.4));ctx.closePath();ctx.fill();}
  function draw(){
    ctx.clearRect(0,0,W,H);ctx.strokeStyle="#dbe2ff";ctx.lineWidth=1;
    for(var i=-6;i<=6;i++){ln(T(i,-6),T(i,6));ln(T(-6,i),T(6,i));}
    ctx.strokeStyle="#cbd5e1";ctx.lineWidth=1.4;ln(T(-7,0),T(7,0));ln(T(0,-7),T(0,7));
    arr(T(1,0),"#d97706");arr(T(0,1),"#059669");
    s.read.textContent="A = [ ["+a.toFixed(1)+", "+b.toFixed(1)+"],  ["+c.toFixed(1)+", "+d.toFixed(1)+"] ]    determinant = "+(a*d-b*c).toFixed(2)+"  (area scale; negative = flipped)";
  }
  slN.push(slider(s.body,"a  ↦ x of e₁",-2,2,0.1,1,function(v){a=v;draw();}));
  slN.push(slider(s.body,"b  ↦ x of e₂",-2,2,0.1,0,function(v){b=v;draw();}));
  slN.push(slider(s.body,"c  ↦ y of e₁",-2,2,0.1,0,function(v){c=v;draw();}));
  slN.push(slider(s.body,"d  ↦ y of e₂",-2,2,0.1,1,function(v){d=v;draw();}));
  var row=el("div","gdw-row");s.body.appendChild(row);
  function preset(t,A){var x=el("button","gdw-btn",t);x.onclick=function(){a=A[0];b=A[1];c=A[2];d=A[3];slN[0].set(a);slN[1].set(b);slN[2].set(c);slN[3].set(d);draw();};row.appendChild(x);}
  preset("Identity",[1,0,0,1]);preset("Rotate 45°",[0.7,-0.7,0.7,0.7]);preset("Scale 2×",[2,0,0,2]);preset("Shear",[1,1,0,1]);preset("Flip x",[-1,0,0,1]);
  draw();
};

/* ================= dot-product ================= */
reg["dot-product"]=function(host){
  var s=shell(host,"▶ Interactive · the dot product measures alignment",
    "Drag the two arrows. The dot product a·b is big and positive when they point the same way, zero when perpendicular, negative when opposed. The dashed line is the projection of a onto b — the shadow a casts on b.",620,380);
  var ctx=s.ctx,W=620,H=380,S=34,ox=W/2,oy=H/2,a=[3,2],b=[2,-2],drag=0;
  function P(v){return [ox+v[0]*S,oy-v[1]*S];}
  function arr(v,col,w){ctx.strokeStyle=col;ctx.fillStyle=col;ctx.lineWidth=w;var p=P(v);ctx.beginPath();ctx.moveTo(ox,oy);ctx.lineTo(p[0],p[1]);ctx.stroke();var g=Math.atan2(p[1]-oy,p[0]-ox);ctx.beginPath();ctx.moveTo(p[0],p[1]);ctx.lineTo(p[0]-12*Math.cos(g-.4),p[1]-12*Math.sin(g-.4));ctx.lineTo(p[0]-12*Math.cos(g+.4),p[1]-12*Math.sin(g+.4));ctx.closePath();ctx.fill();}
  function draw(){
    ctx.clearRect(0,0,W,H);ctx.strokeStyle="#eef1f6";ctx.lineWidth=1;
    for(var gx=ox%S;gx<W;gx+=S){ctx.beginPath();ctx.moveTo(gx,0);ctx.lineTo(gx,H);ctx.stroke();}
    for(var gy=oy%S;gy<H;gy+=S){ctx.beginPath();ctx.moveTo(0,gy);ctx.lineTo(W,gy);ctx.stroke();}
    ctx.strokeStyle="#cbd5e1";ctx.lineWidth=1.3;ctx.beginPath();ctx.moveTo(0,oy);ctx.lineTo(W,oy);ctx.stroke();ctx.beginPath();ctx.moveTo(ox,0);ctx.lineTo(ox,H);ctx.stroke();
    var dot=a[0]*b[0]+a[1]*b[1], bb=b[0]*b[0]+b[1]*b[1];
    var t=dot/(bb||1), proj=[t*b[0],t*b[1]];
    ctx.strokeStyle="#94a3b8";ctx.setLineDash([4,4]);ctx.lineWidth=1.4;var pa=P(a),pp=P(proj);ctx.beginPath();ctx.moveTo(pa[0],pa[1]);ctx.lineTo(pp[0],pp[1]);ctx.stroke();ctx.setLineDash([]);
    arr(proj,"#f59e0b",3);arr(b,"#059669",3);arr(a,"#2563eb",3.2);
    var la=Math.hypot(a[0],a[1]),lb=Math.hypot(b[0],b[1]),cos=dot/((la*lb)||1);
    s.read.textContent="a·b = "+a[0]+"×"+b[0]+" + "+a[1]+"×"+b[1]+" = "+dot.toFixed(1)+"    cos(angle) = "+cos.toFixed(3)+"    angle ≈ "+(Math.acos(Math.max(-1,Math.min(1,cos)))*180/Math.PI).toFixed(0)+"°";
  }
  function set(e){var r=s.cv.getBoundingClientRect();var mx=(e.clientX-r.left)*W/r.width,my=(e.clientY-r.top)*H/r.height;var v=[Math.round((mx-ox)/S*2)/2,Math.round((oy-my)/S*2)/2];(drag===1?a:b)[0]=v[0];(drag===1?a:b)[1]=v[1];draw();}
  s.cv.style.cursor="crosshair";
  s.cv.addEventListener("pointerdown",function(e){var r=s.cv.getBoundingClientRect();var mx=(e.clientX-r.left)*W/r.width,my=(e.clientY-r.top)*H/r.height;var da=Math.hypot(mx-P(a)[0],my-P(a)[1]),db=Math.hypot(mx-P(b)[0],my-P(b)[1]);drag=da<db?1:2;set(e);e.preventDefault();});
  s.cv.addEventListener("pointermove",function(e){if(drag){set(e);e.preventDefault();}});
  window.addEventListener("pointerup",function(){drag=0;});
  draw();
};

/* ================= eigenvectors ================= */
reg["eigenvectors"]=function(host){
  var s=shell(host,"▶ Interactive · eigenvectors don't turn",
    "The matrix A stretches and rotates most vectors. But a few special directions — the eigenvectors — only get scaled, never rotated: A·v stays parallel to v. Drag the blue input; when its yellow output lines up with it, you've found an eigenvector (dashed lines).",620,380);
  var ctx=s.ctx,W=620,H=380,S=54,ox=W/2,oy=H/2;
  var A=[[2,1],[1,2]], ang=0.6;
  function ev(){var a=A[0][0],b=A[0][1],c=A[1][0],d=A[1][1];var tr=a+d,det=a*d-b*c,disc=Math.sqrt(Math.max(0,tr*tr-4*det));var l1=(tr+disc)/2,l2=(tr-disc)/2;function vec(l){var v=Math.abs(b)>1e-6?[b,l-a]:[l-d,c];var n=Math.hypot(v[0],v[1])||1;return [v[0]/n,v[1]/n];}return [[l1,vec(l1)],[l2,vec(l2)]];}
  function P(v){return [ox+v[0]*S,oy-v[1]*S];}
  function arr(v,col,w){ctx.strokeStyle=col;ctx.fillStyle=col;ctx.lineWidth=w;var p=P(v);ctx.beginPath();ctx.moveTo(ox,oy);ctx.lineTo(p[0],p[1]);ctx.stroke();var g=Math.atan2(p[1]-oy,p[0]-ox);ctx.beginPath();ctx.moveTo(p[0],p[1]);ctx.lineTo(p[0]-11*Math.cos(g-.4),p[1]-11*Math.sin(g-.4));ctx.lineTo(p[0]-11*Math.cos(g+.4),p[1]-11*Math.sin(g+.4));ctx.closePath();ctx.fill();}
  function draw(){
    ctx.clearRect(0,0,W,H);ctx.strokeStyle="#cbd5e1";ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(0,oy);ctx.lineTo(W,oy);ctx.stroke();ctx.beginPath();ctx.moveTo(ox,0);ctx.lineTo(ox,H);ctx.stroke();
    var es=ev();
    ctx.setLineDash([5,5]);ctx.lineWidth=1.4;
    es.forEach(function(e){ctx.strokeStyle="#e5e7eb";var v=e[1];ctx.beginPath();ctx.moveTo(ox-v[0]*S*3.5,oy+v[1]*S*3.5);ctx.lineTo(ox+v[0]*S*3.5,oy-v[1]*S*3.5);ctx.stroke();});
    ctx.setLineDash([]);
    var v=[Math.cos(ang),Math.sin(ang)];var Av=[A[0][0]*v[0]+A[0][1]*v[1], A[1][0]*v[0]+A[1][1]*v[1]];
    arr(Av,"#f59e0b",3);arr(v,"#2563eb",3.2);
    var cross=Math.abs(v[0]*Av[1]-v[1]*Av[0]); var aligned=cross<0.06;
    if(aligned){ctx.fillStyle="#059669";ctx.font="700 14px system-ui";ctx.textAlign="center";ctx.fillText("★ eigenvector! output is parallel to input",W/2,28);}
    s.read.textContent="eigenvalues: "+es[0][0].toFixed(2)+" and "+es[1][0].toFixed(2)+"    "+(aligned?"ALIGNED — A·v = λv (only scaled, not rotated)":"drag the blue arrow until the yellow output lines up");
  }
  s.cv.style.cursor="grab";
  function set(e){var r=s.cv.getBoundingClientRect();var mx=(e.clientX-r.left)*W/r.width,my=(e.clientY-r.top)*H/r.height;ang=Math.atan2(oy-my,mx-ox);draw();}
  var dg=false;
  s.cv.addEventListener("pointerdown",function(e){dg=true;set(e);e.preventDefault();});
  s.cv.addEventListener("pointermove",function(e){if(dg){set(e);e.preventDefault();}});
  window.addEventListener("pointerup",function(){dg=false;});
  draw();
};

/* ================= kmeans ================= */
reg["kmeans"]=function(host){
  var s=shell(host,"▶ Interactive · k-means finds clusters",
    "K-means groups points into k clusters. Press Step: each point joins its nearest centroid (the big ✕), then each centroid moves to the middle of its points. Repeat until nothing moves. Press New points to reshuffle.",620,360);
  var ctx=s.ctx,W=620,H=360,K=3,cols=["#4f46e5","#059669","#d97706"];
  var pts=[],cent=[];
  function seed(){pts=[];for(var g=0;g<3;g++){var cx=80+Math.random()*460,cy=60+Math.random()*230;for(var i=0;i<22;i++)pts.push({x:cx+(Math.random()-0.5)*120,y:cy+(Math.random()-0.5)*110,c:-1});}cent=[];for(var k=0;k<K;k++)cent.push({x:80+Math.random()*460,y:60+Math.random()*250});}
  function assign(){pts.forEach(function(p){var best=0,bd=1e9;for(var k=0;k<K;k++){var d=(p.x-cent[k].x)*(p.x-cent[k].x)+(p.y-cent[k].y)*(p.y-cent[k].y);if(d<bd){bd=d;best=k;}}p.c=best;});}
  function move(){for(var k=0;k<K;k++){var sx=0,sy=0,n=0;pts.forEach(function(p){if(p.c===k){sx+=p.x;sy+=p.y;n++;}});if(n){cent[k].x=sx/n;cent[k].y=sy/n;}}}
  function draw(){
    ctx.clearRect(0,0,W,H);
    pts.forEach(function(p){ctx.fillStyle=p.c<0?"#94a3b8":cols[p.c];ctx.beginPath();ctx.arc(p.x,p.y,4,0,7);ctx.fill();});
    for(var k=0;k<K;k++){ctx.strokeStyle=cols[k];ctx.lineWidth=3.5;var cx=cent[k].x,cy=cent[k].y;ctx.beginPath();ctx.moveTo(cx-8,cy-8);ctx.lineTo(cx+8,cy+8);ctx.moveTo(cx+8,cy-8);ctx.lineTo(cx-8,cy+8);ctx.stroke();}
    s.read.textContent="k = 3 clusters · "+pts.length+" points. Step = assign points to nearest centroid, then recenter. It converges in a few steps.";
  }
  btn(s.body,"Step ▸",function(){assign();move();draw();});
  btn(s.body,"Assign only",function(){assign();draw();});
  btn(s.body,"New points",function(){seed();draw();},"");
  seed();draw();
};

/* ================= confusion / threshold ================= */
reg["confusion"]=function(host){
  var s=shell(host,"▶ Interactive · the precision–recall trade-off",
    "Each dot is a case with a model score (left = low, right = high) and a true label (red = actually positive). Slide the decision threshold: everything right of it is predicted positive. Watch precision and recall trade off — you can't max both.",620,340);
  var ctx=s.ctx,W=620,H=340,th=0.5;
  var data=[];(function(){var seed=7;function rnd(){seed=(seed*9301+49297)%233280;return seed/233280;}
    for(var i=0;i<60;i++){var pos=i<26;var sc=pos?0.45+rnd()*0.55:rnd()*0.6;data.push({s:Math.min(0.99,sc),pos:pos,y:40+rnd()*180});}})();
  function draw(){
    ctx.clearRect(0,0,W,H);var x0=30,x1=W-30,base=240;
    ctx.strokeStyle="#cbd5e1";ctx.beginPath();ctx.moveTo(x0,base+14);ctx.lineTo(x1,base+14);ctx.stroke();
    var tx=x0+th*(x1-x0);
    ctx.strokeStyle="#4f46e5";ctx.lineWidth=2;ctx.setLineDash([5,4]);ctx.beginPath();ctx.moveTo(tx,20);ctx.lineTo(tx,base+14);ctx.stroke();ctx.setLineDash([]);
    var TP=0,FP=0,FN=0,TN=0;
    data.forEach(function(d){var x=x0+d.s*(x1-x0);var pred=d.s>=th;ctx.fillStyle=d.pos?"#e11d48":"#38bdf8";ctx.globalAlpha=pred?1:0.35;ctx.beginPath();ctx.arc(x,d.y,5,0,7);ctx.fill();ctx.globalAlpha=1;if(d.pos&&pred)TP++;else if(!d.pos&&pred)FP++;else if(d.pos&&!pred)FN++;else TN++;});
    var prec=TP+FP?TP/(TP+FP):0, rec=TP+FN?TP/(TP+FN):0;
    ctx.fillStyle="#64748b";ctx.font="12px system-ui";ctx.textAlign="left";ctx.fillText("← predicted NEGATIVE",x0,base+34);ctx.textAlign="right";ctx.fillText("predicted POSITIVE →",x1,base+34);
    s.read.textContent="threshold = "+th.toFixed(2)+"   TP="+TP+" FP="+FP+" FN="+FN+"\nprecision = "+prec.toFixed(2)+" (of predicted-positive, how many right)   recall = "+rec.toFixed(2)+" (of actual-positive, how many caught)";
  }
  slider(s.body,"threshold",0.02,0.98,0.02,0.5,function(v){th=v;draw();});
  draw();
};

/* ================= loss-curve / training ================= */
reg["loss-curve"]=function(host){
  var s=shell(host,"▶ Interactive · watch a model train",
    "This runs gradient descent on a loss and plots the loss after each step — the curve you stare at while training. A good learning rate drops it smoothly to near zero; too high and it spikes or diverges; too low and it barely moves.",620,320);
  var ctx=s.ctx,W=620,H=320,lr=0.1;
  var P=Plot(ctx,W,H,0,40,0,20,34);
  function run(){var x=4.2,hist=[];for(var i=0;i<40;i++){hist.push(x*x);x=x-lr*2*x;if(!isFinite(x)||Math.abs(x)>1e6){x=0;}}return hist;}
  function draw(){
    var h=run();P.axes();
    ctx.strokeStyle="#4f46e5";ctx.lineWidth=2.6;ctx.beginPath();
    for(var i=0;i<h.length;i++){var y=Math.min(h[i],19.5);var cx=P.X(i),cy=P.Y(y);if(i===0)ctx.moveTo(cx,cy);else ctx.lineTo(cx,cy);}ctx.stroke();
    for(var i=0;i<h.length;i+=4)P.dot(i,Math.min(h[i],19.5),"#6366f1",3);
    var last=h[h.length-1];
    var verdict=lr>=1.0?"diverging — loss blowing up (rate too high)":(lr<0.03?"crawling — barely moving (rate too low)":"healthy — loss falling to ~0");
    s.read.textContent="learning rate = "+lr.toFixed(2)+"    final loss ≈ "+(isFinite(last)?last.toFixed(3):"∞")+"\n"+verdict+"   (x-axis = training steps, y-axis = loss)";
  }
  slider(s.body,"learning rate",0.01,1.05,0.01,0.1,function(v){lr=v;draw();});
  draw();
};



/* ================= normal-sampler ================= */
reg["normal-sampler"]=function(host){
  var s=shell(host,"▶ Interactive · randomness has shape",
    "Draw random samples from a normal (bell-curve) distribution and watch the histogram fill in. A few samples look ragged; thousands settle into the smooth bell. The sample mean and std home in on the true values — that's statistics at work.",620,320);
  var ctx=s.ctx,W=620,H=320,mu=0,sig=1,samples=[];
  function gauss(){var u=Math.random(),v=Math.random();return mu+sig*Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v);}
  function draw(){
    ctx.clearRect(0,0,W,H);var lo=mu-4*sig,hi=mu+4*sig,bins=40,cnt=new Array(bins).fill(0);
    samples.forEach(function(x){var bi=Math.floor((x-lo)/(hi-lo)*bins);if(bi>=0&&bi<bins)cnt[bi]++;});
    var mx=Math.max(1,Math.max.apply(null,cnt)),base=H-46,x0=24,bw=(W-48)/bins;
    for(var i=0;i<bins;i++){var h=cnt[i]/mx*(H-90);ctx.fillStyle="#a5b4fc";ctx.fillRect(x0+i*bw,base-h,bw-1,h);}
    // true curve
    ctx.strokeStyle="#4f46e5";ctx.lineWidth=2.4;ctx.beginPath();
    for(var p=0;p<=200;p++){var x=lo+(hi-lo)*p/200;var y=Math.exp(-(x-mu)*(x-mu)/(2*sig*sig));var cx=x0+(x-lo)/(hi-lo)*(W-48),cy=base-y*(H-90);if(p===0)ctx.moveTo(cx,cy);else ctx.lineTo(cx,cy);}ctx.stroke();
    var n=samples.length,m=n?samples.reduce(function(a,b){return a+b;},0)/n:0;
    var sd=n?Math.sqrt(samples.reduce(function(a,b){return a+(b-m)*(b-m);},0)/n):0;
    s.read.textContent=n+" samples   sample mean = "+m.toFixed(3)+" (true "+mu+")   sample std = "+sd.toFixed(3)+" (true "+sig+")";
  }
  btn(s.body,"Sample 50",function(){for(var i=0;i<50;i++)samples.push(gauss());draw();},"primary");
  btn(s.body,"Sample 1000",function(){for(var i=0;i<1000;i++)samples.push(gauss());draw();});
  btn(s.body,"Reset",function(){samples=[];draw();});
  draw();
};

/* ================= regularization ================= */
reg["regularization"]=function(host){
  var s=shell(host,"▶ Interactive · L1 vs L2 regularization",
    "Regularization shrinks a model's coefficients to fight overfitting. Slide the strength λ. L2 (ridge) shrinks every coefficient smoothly toward zero. L1 (lasso) pushes small ones to exactly zero — giving a simpler, sparse model. Watch which bars vanish.",620,340);
  var ctx=s.ctx,W=620,H=340,lam=0;
  var base=[1.8,-1.25,0.9,-0.35,0.15,2.1,-0.6,0.28];
  function draw(){
    ctx.clearRect(0,0,W,H);var n=base.length,bw=54,gap=14,x0=40;
    function bars(cy,label,fn,col){
      ctx.fillStyle="#64748b";ctx.font="700 12px system-ui";ctx.textAlign="left";ctx.fillText(label,x0,cy-52);
      ctx.strokeStyle="#e2e8f0";ctx.beginPath();ctx.moveTo(x0-6,cy);ctx.lineTo(x0+n*(bw+gap),cy);ctx.stroke();
      var zeros=0;
      for(var i=0;i<n;i++){var v=fn(base[i]);if(Math.abs(v)<0.001)zeros++;var h=v*30,x=x0+i*(bw+gap);ctx.fillStyle=col;ctx.fillRect(x,cy-Math.max(h,0),bw,Math.abs(h));ctx.fillStyle="#94a3b8";ctx.font="10px ui-monospace";ctx.textAlign="center";ctx.fillText(v.toFixed(2),x+bw/2,v>=0?cy-Math.abs(h)-4:cy+Math.abs(h)+11);}
      return zeros;
    }
    var l2z=bars(110,"L2 (ridge): shrink all",function(c){return c/(1+lam);},"#4f46e5");
    var l1z=bars(280,"L1 (lasso): sparsify",function(c){var t=Math.sign(c)*Math.max(0,Math.abs(c)-lam);return t;},"#059669");
    s.read.textContent="λ = "+lam.toFixed(2)+"    L1 has "+l1z+" of "+base.length+" coefficients driven to exactly 0 (sparse); L2 keeps all, just smaller.";
  }
  slider(s.body,"strength λ",0,2,0.05,0,function(v){lam=v;draw();});
  draw();
};

/* ================= decision-boundary (SVM margin) ================= */
reg["svm-margin"]=function(host){
  var s=shell(host,"▶ Interactive · the widest street wins",
    "A linear classifier separates two classes with a line. But which line? An SVM picks the one with the widest 'street' (margin) between the classes. Tilt and shift the line; watch the margin and any misclassified points.",620,340);
  var ctx=s.ctx,W=620,H=340,ang=0.2,off=0;
  var A=[],B=[];(function(){var seed=3;function r(){seed=(seed*9301+49297)%233280;return seed/233280;}for(var i=0;i<14;i++){A.push([120+r()*140,90+r()*150]);B.push([360+r()*150,90+r()*150]);}})();
  function draw(){
    ctx.clearRect(0,0,W,H);
    var nx=Math.cos(ang),ny=Math.sin(ang),cx=W/2+off*nx,cy=H/2+off*ny;
    // line direction perpendicular to normal (nx,ny)
    var dx=-ny,dy=nx;
    function lineAt(t){return [cx+dx*t, cy+dy*t];}
    ctx.strokeStyle="#4f46e5";ctx.lineWidth=2.4;var p1=lineAt(-500),p2=lineAt(500);ctx.beginPath();ctx.moveTo(p1[0],p1[1]);ctx.lineTo(p2[0],p2[1]);ctx.stroke();
    // margin lines (dashed) at ±40
    ctx.setLineDash([6,5]);ctx.strokeStyle="#cbd5e1";ctx.lineWidth=1.4;
    [40,-40].forEach(function(m){var a=[cx+nx*m+dx*-500,cy+ny*m+dy*-500],b=[cx+nx*m+dx*500,cy+ny*m+dy*500];ctx.beginPath();ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0],b[1]);ctx.stroke();});
    ctx.setLineDash([]);
    var err=0;
    function side(p){return (p[0]-cx)*nx+(p[1]-cy)*ny;}
    A.forEach(function(p){ctx.fillStyle="#2563eb";ctx.beginPath();ctx.arc(p[0],p[1],5,0,7);ctx.fill();if(side(p)>0)err++;});
    B.forEach(function(p){ctx.fillStyle="#e11d48";ctx.beginPath();ctx.arc(p[0],p[1],5,0,7);ctx.fill();if(side(p)<0)err++;});
    s.read.textContent="misclassified points: "+err+"    (dashed lines = the margin; SVM maximizes its width while keeping classes apart)";
  }
  slider(s.body,"tilt",-1.4,1.4,0.05,0.2,function(v){ang=v;draw();});
  slider(s.body,"shift",-140,140,4,0,function(v){off=v;draw();});
  draw();
};

/* ================= tokenizer ================= */
reg["tokenizer"]=function(host){
  var s=shell(host,"▶ Interactive · text becomes tokens",
    "A model can't read letters — it reads tokens (word pieces). Type anything and watch it split into tokens. Notice how common words are one token, but rare or long words break into pieces. Token count is what you pay for with an LLM.",620,200);
  s.cv.style.display="none";
  var wrap=el("div");wrap.style.cssText="margin:2px 0 10px";
  var ta=el("textarea");ta.value="Tokenization splits unbelievable sentences into subword pieces.";
  ta.style.cssText="width:100%;min-height:56px;border:1px solid #e2e8f0;border-radius:10px;padding:10px 12px;font:15px system-ui;resize:vertical";
  wrap.appendChild(ta);s.body.appendChild(wrap);
  var out=el("div");out.style.cssText="display:flex;flex-wrap:wrap;gap:5px;margin:6px 0";s.body.appendChild(out);
  var SUF=["ing","tion","able","ness","ly","ed","s","er","ment","ize","ation"];
  var cols=["#eef2ff","#ecfdf5","#fef3c7","#fce7f3","#e0f2fe"];
  function tok(w){var parts=[];var x=w;while(x.length>0){var cut=null;for(var i=0;i<SUF.length;i++){var suf=SUF[i];if(x.length>suf.length+2&&x.slice(-suf.length)===suf){cut=suf;break;}}if(cut){parts.unshift(cut);x=x.slice(0,-cut.length);}else{if(x.length>6){parts.unshift(x.slice(-4));x=x.slice(0,-4);}else{parts.unshift(x);x="";}}}return parts;}
  function render(){
    out.innerHTML="";var words=ta.value.split(/(\s+|[.,!?;:])/).filter(function(w){return w.length;});var n=0,ci=0;
    words.forEach(function(w){if(/^\s+$/.test(w)){return;}var ps=/^[.,!?;:]$/.test(w)?[w]:tok(w);ps.forEach(function(p){var c=el("span");c.textContent=p;c.style.cssText="font:13px ui-monospace,monospace;background:"+cols[ci%cols.length]+";border:1px solid #e2e8f0;border-radius:6px;padding:3px 7px;color:#334155";out.appendChild(c);ci++;n++;});});
    s.read.textContent=n+" tokens from "+ta.value.trim().split(/\s+/).length+" words. (This is a simplified demo; real tokenizers like BPE learn their pieces from data.)";
  }
  ta.addEventListener("input",render);render();
};

/* ================= positional encoding ================= */
reg["positional"]=function(host){
  var s=shell(host,"▶ Interactive · positions as waves",
    "Attention is order-blind, so transformers add a positional encoding to each token: a set of sine/cosine waves of different frequencies. Each row is a position, each column a dimension — together they give every position a unique fingerprint. Slide to see more.",620,320);
  var ctx=s.ctx,W=620,H=320,dims=32;
  function draw(){
    ctx.clearRect(0,0,W,H);var rows=20,x0=70,y0=20,cw=(W-x0-14)/dims,ch=(H-y0-40)/rows;
    for(var pos=0;pos<rows;pos++)for(var d=0;d<dims;d++){
      var v=(d%2===0)?Math.sin(pos/Math.pow(10000,d/dims)):Math.cos(pos/Math.pow(10000,(d-1)/dims));
      var t=(v+1)/2;var r=Math.round(79+t*(220-79)),g=Math.round(70+ (1-t)*(150)),b=Math.round(229-t*180);
      ctx.fillStyle="rgb("+r+","+Math.round(70+t*120)+","+Math.round(229-t*160)+")";
      ctx.fillRect(x0+d*cw,y0+pos*ch,cw-0.5,ch-0.5);
    }
    ctx.fillStyle="#64748b";ctx.font="11px system-ui";ctx.textAlign="right";
    for(var pos=0;pos<rows;pos+=4)ctx.fillText("pos "+pos,x0-6,y0+pos*ch+ch);
    ctx.textAlign="center";ctx.fillText("dimension →",x0+(W-x0)/2,H-8);
    s.read.textContent="Each position (row) gets a unique pattern of "+dims+" wave values. Low dimensions = fast waves (fine position), high = slow waves (coarse). The model reads position from this fingerprint.";
  }
  draw();
};

/* ================= cosine-search (RAG retrieval) ================= */
reg["cosine-search"]=function(host){
  var s=shell(host,"▶ Interactive · retrieval finds the nearest meaning",
    "RAG turns your query and every document into vectors, then retrieves the ones pointing the same way (highest cosine similarity). Drag the query arrow; the documents light up by how well they match. This is search by meaning, not keywords.",620,360);
  var ctx=s.ctx,W=620,H=360,S=120,ox=W/2,oy=H/2,ang=0.5;
  var docs=[{a:0.4,t:"refund policy"},{a:1.2,t:"shipping times"},{a:2.3,t:"login help"},{a:-0.6,t:"return an item"},{a:-1.5,t:"track my order"}];
  function draw(){
    ctx.clearRect(0,0,W,H);ctx.strokeStyle="#eef1f6";
    ctx.beginPath();ctx.arc(ox,oy,S,0,7);ctx.stroke();
    ctx.strokeStyle="#cbd5e1";ctx.beginPath();ctx.moveTo(0,oy);ctx.lineTo(W,oy);ctx.stroke();ctx.beginPath();ctx.moveTo(ox,0);ctx.lineTo(ox,H);ctx.stroke();
    var q=[Math.cos(ang),Math.sin(ang)];
    var sims=docs.map(function(d){var v=[Math.cos(d.a),Math.sin(d.a)];return q[0]*v[0]+q[1]*v[1];});
    var best=sims.indexOf(Math.max.apply(null,sims));
    docs.forEach(function(d,i){var v=[Math.cos(d.a),Math.sin(d.a)];var col=i===best?"#059669":"#94a3b8";ctx.strokeStyle=col;ctx.fillStyle=col;ctx.lineWidth=i===best?3:1.8;ctx.beginPath();ctx.moveTo(ox,oy);ctx.lineTo(ox+v[0]*S,oy-v[1]*S);ctx.stroke();ctx.font=(i===best?"700 ":"400 ")+"12px system-ui";ctx.textAlign="left";ctx.fillText(d.t+" ("+sims[i].toFixed(2)+")",ox+v[0]*S+6,oy-v[1]*S);});
    ctx.strokeStyle="#4f46e5";ctx.fillStyle="#4f46e5";ctx.lineWidth=3.4;ctx.beginPath();ctx.moveTo(ox,oy);ctx.lineTo(ox+q[0]*S,oy-q[1]*S);ctx.stroke();
    ctx.font="700 13px system-ui";ctx.fillText("query",ox+q[0]*S+6,oy-q[1]*S-4);
    s.read.textContent="best match: \""+docs[best].t+"\"  (cosine "+sims[best].toFixed(2)+")   — drag the blue query; the nearest-meaning document is retrieved.";
  }
  s.cv.style.cursor="grab";var dg=false;
  function set(e){var r=s.cv.getBoundingClientRect();ang=Math.atan2(oy-(e.clientY-r.top)*H/r.height,(e.clientX-r.left)*W/r.width-ox);draw();}
  s.cv.addEventListener("pointerdown",function(e){dg=true;set(e);e.preventDefault();});
  s.cv.addEventListener("pointermove",function(e){if(dg){set(e);e.preventDefault();}});
  window.addEventListener("pointerup",function(){dg=false;});
  draw();
};

/* ================= scaling-laws ================= */
reg["scaling-laws"]=function(host){
  var s=shell(host,"▶ Interactive · bigger, and predictably better",
    "Scaling laws say a model's loss falls as a smooth power of its compute — a straight line on a log-log plot. That predictability is why labs pour compute in: 10× the compute buys a reliable drop in loss. Slide the compute budget.",620,320);
  var ctx=s.ctx,W=620,H=320,logC=3;
  var P=Plot(ctx,W,H,1,9,0.5,3.5,38);
  function loss(lc){return 3.4*Math.pow(Math.pow(10,lc),-0.05);}
  function draw(){
    P.axes();
    P.curve(function(x){return loss(x);},"#4f46e5",2.8);
    P.dot(logC,loss(logC),"#dc2626",7);
    ctx.fillStyle="#64748b";ctx.font="11px system-ui";ctx.textAlign="center";
    ctx.fillText("compute  (10^x FLOPs)  →",W/2,H-8);
    var cur=loss(logC),ten=loss(logC+1);
    s.read.textContent="compute = 10^"+logC.toFixed(1)+" FLOPs    loss ≈ "+cur.toFixed(3)+"\n10× more compute → loss "+ten.toFixed(3)+" (a "+((1-ten/cur)*100).toFixed(1)+"% drop) — smooth and predictable.";
  }
  slider(s.body,"log₁₀ compute",1.5,8.5,0.1,3,function(v){logC=v;draw();});
  draw();
};


/* ================= backprop (computation graph) ================= */
reg["backprop"]=function(host){
  var s=shell(host,"▶ Interactive · watch gradients flow backward",
    "The chain rule made visible on f = (x + y) · z. Black numbers are the forward pass flowing right; red numbers are the gradients ∂f/∂· flowing left. Move any slider: ∂f/∂x and ∂f/∂y always equal z, while ∂f/∂z equals x+y — a multiply gate routes each input's gradient through the OTHER input's value.",640,320);
  var ctx=s.ctx,W=640,H=320,x=2,y=-3,z=4;
  function rr(a,b,w,h,r){ctx.beginPath();ctx.moveTo(a+r,b);ctx.arcTo(a+w,b,a+w,b+h,r);ctx.arcTo(a+w,b+h,a,b+h,r);ctx.arcTo(a,b+h,a,b,r);ctx.arcTo(a,b,a+w,b,r);ctx.closePath();}
  function box(cx,cy,name,val,grad,fill){
    var w=110,h=48;
    ctx.fillStyle=fill;ctx.strokeStyle="#94a3b8";ctx.lineWidth=1.4;rr(cx-w/2,cy-h/2,w,h,11);ctx.fill();ctx.stroke();
    ctx.textAlign="center";
    ctx.fillStyle="#334155";ctx.font="600 12.5px system-ui";ctx.fillText(name,cx,cy-8);
    ctx.fillStyle="#0f172a";ctx.font="700 16px system-ui";ctx.fillText(val,cx,cy+13);
    ctx.fillStyle="#dc2626";ctx.font="600 12px system-ui";ctx.fillText("grad "+grad,cx,cy+h/2+15);
  }
  function edge(x1,y1,x2,y2){ctx.strokeStyle="#cbd5e1";ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();
    ctx.fillStyle="#cbd5e1";var a=Math.atan2(y2-y1,x2-x1);ctx.beginPath();ctx.moveTo(x2,y2);ctx.lineTo(x2-9*Math.cos(a-.4),y2-9*Math.sin(a-.4));ctx.lineTo(x2-9*Math.cos(a+.4),y2-9*Math.sin(a+.4));ctx.closePath();ctx.fill();}
  function draw(){
    ctx.clearRect(0,0,W,H);
    var q=x+y,f=q*z, gf=1,gz=q,gq=z,gx=z,gy=z;
    var xN=[92,58],yN=[92,150],zN=[92,258],addN=[330,104],mulN=[530,175];
    edge(xN[0]+55,xN[1],addN[0]-55,addN[1]);
    edge(yN[0]+55,yN[1],addN[0]-55,addN[1]);
    edge(addN[0]+55,addN[1],mulN[0]-55,mulN[1]);
    edge(zN[0]+55,zN[1],mulN[0]-55,mulN[1]);
    box(xN[0],xN[1],"x",""+x,""+gx,"#eff6ff");
    box(yN[0],yN[1],"y",""+y,""+gy,"#eff6ff");
    box(zN[0],zN[1],"z",""+z,""+gz,"#eff6ff");
    box(addN[0],addN[1],"q = x + y",""+q,""+gq,"#ecfdf5");
    box(mulN[0],mulN[1],"f = q · z",""+f,""+gf,"#fef3c7");
    s.read.textContent="forward:   q = x+y = "+q+"      f = q·z = "+f+
      "\nbackward:  ∂f/∂z = q = "+q+"      ∂f/∂q = z = "+z+"      ∂f/∂x = ∂f/∂y = "+gx;
  }
  slider(s.body,"x",-6,6,1,x,function(v){x=v;draw();});
  slider(s.body,"y",-6,6,1,y,function(v){y=v;draw();});
  slider(s.body,"z",-6,6,1,z,function(v){z=v;draw();});
  draw();
};

/* ================= decision-tree ================= */
reg["decision-tree"]=function(host){
  var s=shell(host,"▶ Interactive · grow a decision tree, watch it overfit",
    "120 points, two classes, with a circular true boundary. A tree can only cut straight horizontal/vertical lines, so it approximates the circle with a staircase. Drag the depth slider: deeper trees fit the training points better (accuracy climbs toward 100%) — including the noise. That last mile is overfitting.",560,400);
  var ctx=s.ctx,W=560,H=400,pad=28,maxDepth=2;
  var seed=7; function rnd(){seed=(seed*1103515245+12345)&0x7fffffff;return seed/0x7fffffff;}
  var pts=[];for(var i=0;i<120;i++){var px=rnd(),py=rnd();var dd=(px-0.5)*(px-0.5)+(py-0.5)*(py-0.5);var lab=dd<0.10?1:0;if(rnd()<0.06)lab=1-lab;pts.push({x:px,y:py,c:lab});}
  function X(x){return pad+x*(W-2*pad);} function Y(y){return H-pad-y*(H-2*pad);}
  function gini(a){var n=a.length;if(!n)return 0;var c=0;for(var i=0;i<n;i++)c+=a[i].c;var p=c/n;return 1-p*p-(1-p)*(1-p);}
  function maj(a){var c=0;for(var i=0;i<a.length;i++)c+=a[i].c;return c*2>=a.length?1:0;}
  function build(a,depth){
    var g=gini(a);
    if(depth>=maxDepth||a.length<4||g===0)return {leaf:maj(a)};
    var best=null;
    for(var ax=0;ax<2;ax++){
      var key=ax===0?"x":"y";
      var vals=a.map(function(p){return p[key];}).sort(function(u,v){return u-v;});
      for(var i=0;i<vals.length-1;i++){
        if(vals[i]===vals[i+1])continue;
        var t=(vals[i]+vals[i+1])/2,L=[],R=[];
        for(var j=0;j<a.length;j++){(a[j][key]<t?L:R).push(a[j]);}
        if(!L.length||!R.length)continue;
        var wg=(L.length*gini(L)+R.length*gini(R))/a.length;
        if(!best||wg<best.wg)best={wg:wg,ax:ax,key:key,t:t,L:L,R:R};
      }
    }
    if(!best||best.wg>=g)return {leaf:maj(a)};
    return {ax:best.ax,key:best.key,t:best.t,L:build(best.L,depth+1),R:build(best.R,depth+1)};
  }
  function classify(node,p){while(node.leaf===undefined){node=(p[node.key]<node.t?node.L:node.R);}return node.leaf;}
  function draw(){
    var tree=build(pts,0);
    ctx.clearRect(0,0,W,H);
    var step=7;
    for(var gx=pad;gx<W-pad;gx+=step)for(var gy=pad;gy<H-pad;gy+=step){
      var px=(gx-pad)/(W-2*pad), py=(H-pad-gy)/(H-2*pad);
      var cls=classify(tree,{x:px,y:py});
      ctx.fillStyle=cls?"rgba(37,99,235,0.13)":"rgba(220,38,38,0.10)";
      ctx.fillRect(gx,gy,step,step);
    }
    (function lines(node,x0,x1,y0,y1){
      if(node.leaf!==undefined)return;
      ctx.strokeStyle="#334155";ctx.lineWidth=1.3;
      if(node.ax===0){var xx=X(node.t);ctx.beginPath();ctx.moveTo(xx,Y(y1));ctx.lineTo(xx,Y(y0));ctx.stroke();lines(node.L,x0,node.t,y0,y1);lines(node.R,node.t,x1,y0,y1);}
      else{var yy=Y(node.t);ctx.beginPath();ctx.moveTo(X(x0),yy);ctx.lineTo(X(x1),yy);ctx.stroke();lines(node.L,x0,x1,y0,node.t);lines(node.R,x0,x1,node.t,y1);}
    })(tree,0,1,0,1);
    for(var k=0;k<pts.length;k++){var p=pts[k];ctx.fillStyle=p.c?"#2563eb":"#dc2626";ctx.strokeStyle="#fff";ctx.lineWidth=1.2;ctx.beginPath();ctx.arc(X(p.x),Y(p.y),4.5,0,7);ctx.fill();ctx.stroke();}
    ctx.strokeStyle="#cbd5e1";ctx.lineWidth=1.2;ctx.strokeRect(pad,pad,W-2*pad,H-2*pad);
    var correct=0;for(var m=0;m<pts.length;m++)if(classify(tree,pts[m])===pts[m].c)correct++;
    var leaves=0;(function cnt(n){if(n.leaf!==undefined)leaves++;else{cnt(n.L);cnt(n.R);}})(tree);
    s.read.textContent="depth "+maxDepth+"   ·   "+leaves+" leaf regions   ·   training accuracy "+(correct/pts.length*100).toFixed(1)+"%\n"+(maxDepth>=5?"Very deep: the staircase now traces individual noisy points — classic overfitting.":"Increase depth to fit the circle more tightly.");
  }
  slider(s.body,"max depth",1,6,1,maxDepth,function(v){maxDepth=v;draw();});
  draw();
};

/* ================= embeddings (analogy) ================= */
reg["embeddings"]=function(host){
  var s=shell(host,"▶ Interactive · word vectors & analogies",
    "Words become points; directions carry meaning. Here the relation arrow is the same everywhere, so vector arithmetic works: king − man + woman lands on queen. Click an analogy to see the two parallel arrows and the nearest word.",600,400);
  var ctx=s.ctx,W=600,H=400,pad=42;
  var words={man:[2,1],woman:[2,3],king:[6.2,1],queen:[6.2,3],prince:[5,0],princess:[5,2],uncle:[3.6,1],aunt:[3.6,3],boy:[1.2,0],girl:[1.2,2]};
  var female={woman:1,queen:1,princess:1,aunt:1,girl:1};
  var xlo=0,xhi=7.6,ylo=-1,yhi=4;
  function X(x){return pad+(x-xlo)/(xhi-xlo)*(W-2*pad);} function Y(y){return H-pad-(y-ylo)/(yhi-ylo)*(H-2*pad);}
  var presets=[["king","man","woman"],["queen","woman","man"],["uncle","man","woman"],["prince","boy","girl"]];
  var cur=0;
  function nearest(v,exclude){var best=null;for(var w in words){if(exclude.indexOf(w)>=0)continue;var dx=words[w][0]-v[0],dy=words[w][1]-v[1],d=dx*dx+dy*dy;if(!best||d<best.d)best={w:w,d:d};}return best;}
  function arrow(x1,y1,x2,y2,c,w){ctx.strokeStyle=c;ctx.fillStyle=c;ctx.lineWidth=w;ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();var a=Math.atan2(y2-y1,x2-x1);ctx.beginPath();ctx.moveTo(x2,y2);ctx.lineTo(x2-10*Math.cos(a-.4),y2-10*Math.sin(a-.4));ctx.lineTo(x2-10*Math.cos(a+.4),y2-10*Math.sin(a+.4));ctx.closePath();ctx.fill();}
  function draw(){
    ctx.clearRect(0,0,W,H);
    ctx.strokeStyle="#eef1f6";ctx.lineWidth=1;
    for(var gx=Math.ceil(xlo);gx<=xhi;gx++){ctx.beginPath();ctx.moveTo(X(gx),pad);ctx.lineTo(X(gx),H-pad);ctx.stroke();}
    for(var gy=Math.ceil(ylo);gy<=yhi;gy++){ctx.beginPath();ctx.moveTo(pad,Y(gy));ctx.lineTo(W-pad,Y(gy));ctx.stroke();}
    var A=presets[cur][0],B=presets[cur][1],C=presets[cur][2];
    var res=[words[A][0]-words[B][0]+words[C][0], words[A][1]-words[B][1]+words[C][1]];
    var near=nearest(res,[A,B,C]);
    arrow(X(words[B][0]),Y(words[B][1]),X(words[A][0]),Y(words[A][1]),"#cbd5e1",2);
    arrow(X(words[C][0]),Y(words[C][1]),X(res[0]),Y(res[1]),"#6366f1",2.6);
    for(var w in words){var isF=female[w];ctx.fillStyle=isF?"#db2777":"#2563eb";ctx.beginPath();ctx.arc(X(words[w][0]),Y(words[w][1]),5,0,7);ctx.fill();
      ctx.fillStyle="#0f172a";ctx.font=((w===A||w===B||w===C)?"700 ":"600 ")+"13px system-ui";ctx.textAlign="left";ctx.fillText(w,X(words[w][0])+9,Y(words[w][1])+4);}
    ctx.strokeStyle="#6366f1";ctx.lineWidth=2;ctx.beginPath();ctx.arc(X(res[0]),Y(res[1]),9,0,7);ctx.stroke();
    s.read.textContent=A+" − "+B+" + "+C+"   =   nearest word  →  "+near.w.toUpperCase()+"\nThe grey arrow (the relation) and the blue arrow are parallel and equal length — that's why the arithmetic works.";
  }
  presets.forEach(function(p,i){btn(s.body,p[0]+" − "+p[1]+" + "+p[2],function(b){cur=i;[].forEach.call(s.body.querySelectorAll(".gdw-btn"),function(x){x.classList.remove("on");});b.classList.add("on");draw();});});
  s.body.querySelector(".gdw-btn").classList.add("on");
  draw();
};

/* ================= diffusion (forward noising) ================= */
reg["diffusion"]=function(host){
  var s=shell(host,"▶ Interactive · forward diffusion: signal → noise",
    "Diffusion training destroys an image with Gaussian noise, then learns to undo it step by step. Drag t from 0 (clean) to 1 (pure noise): x_t = √ā·x₀ + √(1−ā)·ε on a cosine schedule. The model's whole job is to look at any noisy x_t and predict the ε that was added, so it can subtract it.",560,300);
  var ctx=s.ctx,W=560,H=300,N=28,t=0.3;
  var x0=[],noise=[];
  var g=99; function rnd(){g=(g*1103515245+12345)&0x7fffffff;return g/0x7fffffff;}
  function gauss(){var u=rnd()||1e-9,v=rnd();return Math.sqrt(-2*Math.log(u))*Math.cos(6.283185*v);}
  for(var r=0;r<N;r++){x0[r]=[];noise[r]=[];for(var c=0;c<N;c++){
    var cx=(c-13.5)/13.5, cy=(r-13.5)/13.5, d=Math.sqrt(cx*cx+cy*cy);
    var val=0.05;
    if(d<0.92&&d>0.72)val=0.9;
    else if(d<=0.72)val=0.20;
    if((Math.abs(cx+0.32)<0.12&&Math.abs(cy+0.28)<0.15)||(Math.abs(cx-0.32)<0.12&&Math.abs(cy+0.28)<0.15))val=0.97;
    if(cy>0.12&&cy<0.5&&d<0.62&&d>0.40)val=0.97;
    x0[r][c]=val; noise[r][c]=gauss();
  }}
  var px=Math.floor((H-56)/N), side=px*N, ox=(W-side)/2, oy=16;
  function draw(){
    var abar=Math.pow(Math.cos(t*Math.PI/2),2), sa=Math.sqrt(abar), sn=Math.sqrt(1-abar);
    ctx.clearRect(0,0,W,H);
    for(var r=0;r<N;r++)for(var c=0;c<N;c++){
      var v=clamp(sa*x0[r][c]+sn*(0.5+0.28*noise[r][c]),0,1), g8=Math.round(255*(1-v));
      ctx.fillStyle="rgb("+g8+","+g8+","+g8+")";
      ctx.fillRect(ox+c*px,oy+r*px,px,px);
    }
    ctx.strokeStyle="#cbd5e1";ctx.lineWidth=1.2;ctx.strokeRect(ox,oy,side,side);
    s.read.textContent="t = "+t.toFixed(2)+"     √ā = "+sa.toFixed(2)+" (signal)     √(1−ā) = "+sn.toFixed(2)+" (noise)     →     "+Math.round(abar*100)+"% signal / "+Math.round((1-abar)*100)+"% noise";
  }
  slider(s.body,"noise level  t",0,1,0.02,t,function(v){t=v;draw();});
  draw();
};

/* ================= pca ================= */
reg["pca"]=function(host){
  var s=shell(host,"▶ Interactive · PCA finds the directions of greatest variance",
    "A correlated 2-D cloud. PCA computes the covariance matrix and its eigenvectors: PC1 (orange) is the direction of most spread, PC2 (green) is perpendicular. Toggle projection to squash the cloud onto PC1 — 2-D reduced to 1-D while keeping most of the variance.",600,420);
  var ctx=s.ctx,W=600,H=420,proj=false;
  var seed=5; function rnd(){seed=(seed*1103515245+12345)&0x7fffffff;return seed/0x7fffffff;}
  function gauss(){var u=rnd()||1e-9,v=rnd();return Math.sqrt(-2*Math.log(u))*Math.cos(6.2832*v);}
  var pts=[];for(var i=0;i<140;i++){var a=gauss()*2.4,b=gauss()*0.8;pts.push([a*0.87-b*0.5, a*0.5+b*0.87]);}
  var cx=0,cy=0;for(i=0;i<pts.length;i++){cx+=pts[i][0];cy+=pts[i][1];}cx/=pts.length;cy/=pts.length;
  var sxx=0,syy=0,sxy=0;for(i=0;i<pts.length;i++){var dx=pts[i][0]-cx,dy=pts[i][1]-cy;sxx+=dx*dx;syy+=dy*dy;sxy+=dx*dy;}
  sxx/=pts.length;syy/=pts.length;sxy/=pts.length;
  var tr=sxx+syy,disc=Math.sqrt(Math.max(0,tr*tr/4-(sxx*syy-sxy*sxy))),l1=tr/2+disc,l2=tr/2-disc;
  function evec(l){var vx=sxy,vy=l-sxx;if(Math.abs(sxy)<1e-9){vx=1;vy=0;}var n=Math.hypot(vx,vy)||1;return [vx/n,vy/n];}
  var e1=evec(l1),e2=evec(l2),scale=26,ox=W/2,oy=H/2;
  function px(x,y){return [ox+(x-cx)*scale, oy-(y-cy)*scale];}
  function draw(){
    ctx.clearRect(0,0,W,H);
    ctx.strokeStyle="#eef1f6";ctx.lineWidth=1;for(var g=-9;g<=9;g++){ctx.beginPath();ctx.moveTo(ox+g*scale,0);ctx.lineTo(ox+g*scale,H);ctx.stroke();ctx.beginPath();ctx.moveTo(0,oy+g*scale);ctx.lineTo(W,oy+g*scale);ctx.stroke();}
    for(var i=0;i<pts.length;i++){var P=px(pts[i][0],pts[i][1]);
      if(proj){var x=pts[i][0]-cx,y=pts[i][1]-cy,t=x*e1[0]+y*e1[1],Q=px(cx+t*e1[0],cy+t*e1[1]);
        ctx.strokeStyle="#e2e8f0";ctx.lineWidth=0.7;ctx.beginPath();ctx.moveTo(P[0],P[1]);ctx.lineTo(Q[0],Q[1]);ctx.stroke();
        ctx.fillStyle="#bfdbfe";ctx.beginPath();ctx.arc(P[0],P[1],2.4,0,7);ctx.fill();
        ctx.fillStyle="#d97706";ctx.beginPath();ctx.arc(Q[0],Q[1],3,0,7);ctx.fill();
      } else {ctx.fillStyle="#2563eb";ctx.beginPath();ctx.arc(P[0],P[1],3,0,7);ctx.fill();}}
    function axis(e,l,col,lab){var L=Math.sqrt(l)*2.2,A=px(cx-e[0]*L,cy-e[1]*L),B=px(cx+e[0]*L,cy+e[1]*L);
      ctx.strokeStyle=col;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(A[0],A[1]);ctx.lineTo(B[0],B[1]);ctx.stroke();
      ctx.fillStyle=col;ctx.font="700 13px system-ui";ctx.fillText(lab,B[0]+5,B[1]);}
    axis(e2,l2,"#059669","PC2");axis(e1,l1,"#d97706","PC1");
    var pct=l1/(l1+l2)*100;
    s.read.textContent="PC1 explains "+pct.toFixed(1)+"% of the variance, PC2 the remaining "+(100-pct).toFixed(1)+"%.\n"+(proj?"Projected onto PC1: each point is now ONE number along the orange line — 2-D reduced to 1-D, keeping "+pct.toFixed(0)+"% of the spread.":"Toggle projection to collapse the cloud onto PC1.");
  }
  btn(s.body,"Project onto PC1",function(b){proj=!proj;b.classList.toggle("on",proj);draw();});
  draw();
};

/* ================= optimizer-race ================= */
reg["optimizer-race"]=function(host){
  var s=shell(host,"▶ Interactive · SGD vs Momentum vs Adam",
    "An ill-conditioned bowl — steep one way, shallow the other — the classic case where plain SGD zig-zags. Press Run: three optimizers descend from the same start. Momentum builds speed along the shallow axis; Adam adapts its step per direction and usually arrives first. Push the learning rate up and watch who diverges.",600,380);
  var ctx=s.ctx,W=600,H=380,lr=0.06,timer=null;
  function gx(x){return 0.16*x;} function gy(y){return 2*y;}
  var start=[-9,3.0],opt;
  function reset(){opt={sgd:{p:start.slice()},mom:{p:start.slice(),v:[0,0]},adam:{p:start.slice(),m:[0,0],v:[0,0],t:0}};}
  reset();
  var ox=W/2,oy=H/2,sx=27,sy=48;
  function P(x,y){return [ox+x*sx, oy-y*sy];}
  function step(){
    var o=opt.sgd;o.p[0]-=lr*gx(o.p[0]);o.p[1]-=lr*gy(o.p[1]);
    o=opt.mom;o.v[0]=0.9*o.v[0]-lr*gx(o.p[0]);o.v[1]=0.9*o.v[1]-lr*gy(o.p[1]);o.p[0]+=o.v[0];o.p[1]+=o.v[1];
    o=opt.adam;o.t++;var b1=0.9,b2=0.999,g=[gx(o.p[0]),gy(o.p[1])];
    for(var k=0;k<2;k++){o.m[k]=b1*o.m[k]+(1-b1)*g[k];o.v[k]=b2*o.v[k]+(1-b2)*g[k]*g[k];var mh=o.m[k]/(1-Math.pow(b1,o.t)),vh=o.v[k]/(1-Math.pow(b2,o.t));o.p[k]-=lr*4*mh/(Math.sqrt(vh)+1e-8);}
  }
  function draw(){
    ctx.clearRect(0,0,W,H);
    for(var r=1;r<=6;r++){ctx.strokeStyle="#e2e8f0";ctx.lineWidth=1;ctx.beginPath();ctx.ellipse(ox,oy,r*sx*1.1,r*sy*0.5,0,0,7);ctx.stroke();}
    ctx.fillStyle="#94a3b8";ctx.beginPath();ctx.arc(ox,oy,4,0,7);ctx.fill();
    function dot(o,col){var q=P(o.p[0],o.p[1]);ctx.fillStyle=col;ctx.beginPath();ctx.arc(q[0],q[1],6,0,7);ctx.fill();}
    dot(opt.sgd,"#e11d48");dot(opt.mom,"#d97706");dot(opt.adam,"#059669");
    ctx.font="700 12px system-ui";ctx.fillStyle="#e11d48";ctx.fillText("● SGD",14,20);ctx.fillStyle="#d97706";ctx.fillText("● Momentum",70,20);ctx.fillStyle="#059669";ctx.fillText("● Adam",172,20);
    function d(o){return Math.hypot(o.p[0],o.p[1]);}
    s.read.textContent="distance to minimum — SGD "+d(opt.sgd).toFixed(2)+"    Momentum "+d(opt.mom).toFixed(2)+"    Adam "+d(opt.adam).toFixed(2)+"\nSGD crawls (and zig-zags) along the shallow axis; momentum accelerates; Adam adapts per-direction.";
  }
  btn(s.body,"Step",function(){step();draw();});
  btn(s.body,"Run",function(b){if(timer){clearInterval(timer);timer=null;b.textContent="Run";b.classList.remove("on");return;}b.textContent="Stop";b.classList.add("on");timer=setInterval(function(){step();draw();},90);});
  btn(s.body,"Reset",function(){reset();draw();});
  slider(s.body,"learning rate",0.01,0.2,0.005,lr,function(v){lr=v;});
  draw();
};

/* ================= roc-curve ================= */
reg["roc-curve"]=function(host){
  var s=shell(host,"▶ Interactive · the ROC curve and the threshold",
    "Two overlapping score distributions — positives (blue) tend to score higher than negatives (red), but they overlap. Slide the decision threshold: every threshold gives one (FPR, TPR) point, and sweeping all of them traces the ROC curve. The area under it (AUC) captures ranking quality in a single, threshold-independent number.",600,400);
  var ctx=s.ctx,W=600,H=400,thr=0.5;
  var seed=9;function rnd(){seed=(seed*1103515245+12345)&0x7fffffff;return seed/0x7fffffff;}
  function gauss(){var u=rnd()||1e-9,v=rnd();return Math.sqrt(-2*Math.log(u))*Math.cos(6.2832*v);}
  var pos=[],neg=[];for(var i=0;i<200;i++){pos.push(clamp(0.62+gauss()*0.16,0,1));neg.push(clamp(0.38+gauss()*0.16,0,1));}
  function rates(t){var tp=0,fp=0;for(var i=0;i<pos.length;i++)if(pos[i]>=t)tp++;for(i=0;i<neg.length;i++)if(neg[i]>=t)fp++;return [fp/neg.length,tp/pos.length];}
  var curve=[];for(var t=1.001;t>=-0.001;t-=0.01)curve.push(rates(t));
  var auc=0;for(i=1;i<curve.length;i++)auc+=(curve[i][0]-curve[i-1][0])*(curve[i][1]+curve[i-1][1])/2;
  var pad=44,gw=W-2*pad,gh=H-2*pad,box=gw*0.5;
  function draw(){
    ctx.clearRect(0,0,W,H);
    ctx.strokeStyle="#cbd5e1";ctx.lineWidth=1.2;ctx.strokeRect(pad,pad,box,gh);
    ctx.strokeStyle="#e2e8f0";ctx.setLineDash([4,4]);ctx.beginPath();ctx.moveTo(pad,pad+gh);ctx.lineTo(pad+box,pad);ctx.stroke();ctx.setLineDash([]);
    ctx.strokeStyle="#4f46e5";ctx.lineWidth=2.4;ctx.beginPath();
    for(i=0;i<curve.length;i++){var X=pad+curve[i][0]*box, Y=pad+gh-curve[i][1]*gh;i?ctx.lineTo(X,Y):ctx.moveTo(X,Y);}ctx.stroke();
    var rr=rates(thr),cxp=pad+rr[0]*box,cyp=pad+gh-rr[1]*gh;
    ctx.fillStyle="#e11d48";ctx.beginPath();ctx.arc(cxp,cyp,6,0,7);ctx.fill();
    ctx.fillStyle="#64748b";ctx.font="12px system-ui";ctx.fillText("FPR →",pad+box*0.4,H-14);ctx.save();ctx.translate(16,pad+gh/2+16);ctx.rotate(-1.5708);ctx.fillText("TPR →",0,0);ctx.restore();
    ctx.fillStyle="#0f172a";ctx.font="700 13px system-ui";ctx.fillText("AUC = "+auc.toFixed(3),pad+8,pad+18);
    var dx=pad+box+34,dw=W-pad-dx,dh=gh*0.46,dy=pad+16;
    function hist(arr,col){var b=new Array(20).fill(0);for(var i=0;i<arr.length;i++)b[Math.min(19,Math.floor(arr[i]*20))]++;var mx=Math.max.apply(null,b)||1;ctx.fillStyle=col;for(i=0;i<20;i++){var h=b[i]/mx*dh;ctx.fillRect(dx+i/20*dw,dy+dh-h,dw/20-1,h);}}
    ctx.globalAlpha=0.55;hist(neg,"#ef4444");hist(pos,"#3b82f6");ctx.globalAlpha=1;
    var tx=dx+thr*dw;ctx.strokeStyle="#0f172a";ctx.lineWidth=1.6;ctx.beginPath();ctx.moveTo(tx,dy-4);ctx.lineTo(tx,dy+dh+4);ctx.stroke();
    ctx.fillStyle="#64748b";ctx.font="11px system-ui";ctx.fillText("scores →",dx,dy+dh+16);ctx.fillStyle="#3b82f6";ctx.fillText("● pos",dx,dy+dh+32);ctx.fillStyle="#ef4444";ctx.fillText("● neg",dx+42,dy+dh+32);
    s.read.textContent="threshold "+thr.toFixed(2)+"   →   FPR "+rr[0].toFixed(2)+"    TPR (recall) "+rr[1].toFixed(2)+"\nLower the threshold: catch more positives (TPR↑) but more false alarms (FPR↑). AUC = "+auc.toFixed(3)+" doesn't depend on the threshold.";
  }
  slider(s.body,"threshold",0,1,0.02,thr,function(v){thr=v;draw();});
  draw();
};

/* ================= gradient-boosting ================= */
reg["gradient-boosting"]=function(host){
  var s=shell(host,"▶ Interactive · gradient boosting builds up from stumps",
    "Boosting adds simple models in sequence, each fixing the last one's mistakes. Here every new learner is a depth-1 'stump'. Drag the rounds slider: 0 rounds is a flat line; each round fits a stump to the current residuals and adds a fraction of it, so the staircase creeps toward the true curve. Too many rounds and it starts tracing the noise.",600,400);
  var ctx=s.ctx,W=600,H=400,rounds=0,LR=0.3;
  var seed=4;function rnd(){seed=(seed*1103515245+12345)&0x7fffffff;return seed/0x7fffffff;}
  var xs=[],ys=[];for(var i=0;i<40;i++){var x=i/39;xs.push(x);ys.push(Math.sin(x*6.2)*0.6+(rnd()-0.5)*0.25);}
  function fitStump(res){var best=null;
    for(var t=1;t<xs.length;t++){var thr=(xs[t-1]+xs[t])/2,ls=0,ln=0,rs=0,rn=0;
      for(var i=0;i<xs.length;i++){if(xs[i]<thr){ls+=res[i];ln++;}else{rs+=res[i];rn++;}}
      if(!ln||!rn)continue;var lm=ls/ln,rm=rs/rn,sse=0;
      for(i=0;i<xs.length;i++){var p=xs[i]<thr?lm:rm;sse+=(res[i]-p)*(res[i]-p);}
      if(!best||sse<best.sse)best={sse:sse,thr:thr,lm:lm,rm:rm};}
    return best;}
  function predict(R){var pred=new Array(xs.length).fill(0);
    for(var r=0;r<R;r++){var res=ys.map(function(y,i){return y-pred[i];}),st=fitStump(res);if(!st)break;
      for(var i=0;i<xs.length;i++)pred[i]+=LR*(xs[i]<st.thr?st.lm:st.rm);}
    return pred;}
  var pad=40,gw=W-2*pad,gh=H-2*pad;
  function X(x){return pad+x*gw;} function Y(y){return pad+gh/2-y*gh*0.42;}
  function draw(){
    ctx.clearRect(0,0,W,H);
    ctx.strokeStyle="#e2e8f0";ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(pad,Y(0));ctx.lineTo(W-pad,Y(0));ctx.stroke();
    ctx.strokeStyle="#cbd5e1";ctx.lineWidth=1.6;ctx.beginPath();for(var t=0;t<=100;t++){var x=t/100,y=Math.sin(x*6.2)*0.6;t?ctx.lineTo(X(x),Y(y)):ctx.moveTo(X(x),Y(y));}ctx.stroke();
    for(var i=0;i<xs.length;i++){ctx.fillStyle="#94a3b8";ctx.beginPath();ctx.arc(X(xs[i]),Y(ys[i]),3,0,7);ctx.fill();}
    var pr=predict(rounds);
    ctx.strokeStyle="#4f46e5";ctx.lineWidth=2.6;ctx.beginPath();for(i=0;i<xs.length;i++){var qx=X(xs[i]),qy=Y(pr[i]);i?ctx.lineTo(qx,qy):ctx.moveTo(qx,qy);}ctx.stroke();
    var mse=0;for(i=0;i<xs.length;i++)mse+=(ys[i]-pr[i])*(ys[i]-pr[i]);mse/=xs.length;
    s.read.textContent="rounds: "+rounds+"   ·   training MSE "+mse.toFixed(4)+"\n"+(rounds===0?"0 rounds → flat prediction.":rounds<12?"each stump nudges the staircase toward the data.":"many rounds → it now traces individual noisy points (overfitting).");
  }
  slider(s.body,"boosting rounds",0,40,1,rounds,function(v){rounds=v;draw();});
  draw();
};

/* ---- boot: render every placeholder ---- */
function boot(){
  [].forEach.call(document.querySelectorAll(".gdw[data-widget]"),function(host){
    var name=host.getAttribute("data-widget");
    if(reg[name]){try{reg[name](host);}catch(e){host.innerHTML='<div class="gdw-hint">widget failed to load</div>';}}
  });
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot);else boot();
})();
