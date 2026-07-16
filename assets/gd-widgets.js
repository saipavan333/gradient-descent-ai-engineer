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


/* ---- boot: render every placeholder ---- */
function boot(){
  [].forEach.call(document.querySelectorAll(".gdw[data-widget]"),function(host){
    var name=host.getAttribute("data-widget");
    if(reg[name]){try{reg[name](host);}catch(e){host.innerHTML='<div class="gdw-hint">widget failed to load</div>';}}
  });
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot);else boot();
})();
