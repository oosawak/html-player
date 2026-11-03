// HP mini framework for HTML Player cartridges (MIT)
// プレイヤーが供給する共通部品: 入力（十字キー/A/B）・ゲームループ・効果音。
// ゲーム側は <script src="https://oosawak.github.io/html-player/assets/hp.js"></script> で読み込む。
(function(){
"use strict";
if(window.HP)return;
var keys={},pressed={};
addEventListener("keydown",function(e){
  if(!e.repeat){keys[e.code]=true;pressed[e.code]=true}
  if(["ArrowLeft","ArrowRight","ArrowUp","ArrowDown","Space"].indexOf(e.code)>=0)e.preventDefault();
});
addEventListener("keyup",function(e){keys[e.code]=false});
var HP={
  keys:keys,
  left:function(){return !!keys.ArrowLeft},
  right:function(){return !!keys.ArrowRight},
  up:function(){return !!keys.ArrowUp},
  down:function(){return !!keys.ArrowDown},
  a:function(){return !!keys.Space},
  b:function(){return !!keys.KeyX},
  aHit:function(){return !!pressed.Space},
  bHit:function(){return !!pressed.KeyX},
  loop:function(fn){
    var p=performance.now();
    function f(n){
      var dt=Math.min(0.05,(n-p)/1000);p=n;
      fn(dt);
      for(var k in pressed)delete pressed[k];
      requestAnimationFrame(f);
    }
    requestAnimationFrame(f);
  },
  bar:function(g,x,y,w,h,ratio,color,bg){
    g.fillStyle=bg||"#2a3c5f";g.fillRect(x,y,w,h);
    g.fillStyle=color;g.fillRect(x,y,w*Math.max(0,Math.min(1,ratio)),h);
  },
  text:function(g,s,x,y,size,color,align,font){
    g.font=(size||13)+'px '+(font||'"HP Mono",monospace');
    g.fillStyle=color||"#fff";g.textAlign=align||"left";
    g.fillText(s,x,y);g.textAlign="left";
  },
  panel:function(g,x,y,w,h,fill,stroke){
    g.fillStyle=fill||"rgba(10,14,30,.85)";g.fillRect(x,y,w,h);
    if(stroke){g.strokeStyle=stroke;g.strokeRect(x,y,w,h)}
  },
  title:function(g,W,H,title,lines,color,font){
    g.fillStyle=color||"#fff";g.textAlign="center";
    g.font=(font?'26px ':'700 25px ')+(font||'"HP Sans",sans-serif');g.fillText(title,W/2,H/2-40);
    g.font=(font?'14px ':'13px ')+(font||'"HP Sans",sans-serif');
    (lines||[]).forEach(function(s,i){g.fillText(s,W/2,H/2-8+i*22)});
    g.textAlign="left";
  },
  beep:function(freq,dur,type,vol){
    try{
      var C=window.__ac||(window.__ac=new (window.AudioContext||window.webkitAudioContext)());
      var o=C.createOscillator(),gn=C.createGain();
      o.type=type||"square";o.frequency.value=freq||440;
      gn.gain.value=vol||0.04;
      o.connect(gn);gn.connect(C.destination);
      o.start();
      gn.gain.exponentialRampToValueAtTime(0.0001,C.currentTime+(dur||0.08));
      o.stop(C.currentTime+(dur||0.08));
    }catch(e){}
  }
};
window.HP=HP;
})();
