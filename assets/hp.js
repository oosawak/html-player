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
