// HP mini framework for HTML Player cartridges (MIT)
// プレイヤーが供給する共通部品: 入力（十字キー/A/B/X/Y/L1/R1）・ゲームループ・効果音。
// ゲーム側は <script src="https://oosawak.github.io/html-player/assets/hp.js"></script> で読み込む。
(function(){
"use strict";
if(window.HP)return;
var keys={},pressed={},pendingUp={};
function kd(code){if(!keys[code])pressed[code]=true;keys[code]=true;delete pendingUp[code]}
function ku(code){pendingUp[code]=performance.now()+50} // 短いタップでも最低50msは押下が見えるようにする
addEventListener("keydown",function(e){
  if(!e.repeat)kd(e.code);
  if(["ArrowLeft","ArrowRight","ArrowUp","ArrowDown","Space"].indexOf(e.code)>=0)e.preventDefault();
});
addEventListener("keyup",function(e){ku(e.code)});
// 画面コントローラー（プレイヤー側）からの入力。隔離された枠ではキーイベントが
// 直接届かないため、プレイヤーは postMessage で送り、ここでキーの状態に直す。
addEventListener("message",function(e){
  var d=e.data;
  if(!d||d.t!=="hp-key"||typeof d.code!=="string")return;
  if(d.down)kd(d.code);else ku(d.code);
});
setInterval(function(){try{parent.postMessage({t:"hp-alive"},"*")}catch(e){}},500);
// 物理ゲームパッド（Androidゲーム機の十字キーなど）。標準配置:
// 十字=ボタン12〜15、左スティック=軸0/1、A=ボタン0、B=ボタン1、
// X=ボタン2、Y=ボタン3、L1=ボタン4、R1=ボタン5。
// L2（ボタン6）とR2（ボタン7）はプレイヤー用（出入り）に予約され、ここでは読まない。
// キーボードと同じ状態に重ねるので、ゲーム側は入力元を区別しなくてよい。
var padKeys={},padPrev={},sysPrev={};
function padSet(code,down){
  if(down){
    if(!padPrev[code])pressed[code]=true;
    padKeys[code]=true;
  }else{
    delete padKeys[code];
  }
  padPrev[code]=down;
}
function pollPad(){
  var gps;
  try{gps=navigator.getGamepads?navigator.getGamepads():[]}catch(e){return}
  var gp=null;
  for(var i=0;i<gps.length;i++){if(gps[i]){gp=gps[i];break}}
  var m={ArrowLeft:false,ArrowRight:false,ArrowUp:false,ArrowDown:false,Space:false,KeyX:false,PadX:false,PadY:false,PadL1:false,PadR1:false};
  if(gp){
    var b=gp.buttons||[],ax=gp.axes||[];
    function btn(i){return !!(b[i]&&b[i].pressed)}
    m.ArrowLeft=btn(14)||ax[0]<-0.5;
    m.ArrowRight=btn(15)||ax[0]>0.5;
    m.ArrowUp=btn(12)||ax[1]<-0.5;
    m.ArrowDown=btn(13)||ax[1]>0.5;
    m.Space=btn(0);
    m.KeyX=btn(1);
    m.PadX=btn(2);
    m.PadY=btn(3);
    m.PadL1=btn(4);
    m.PadR1=btn(5);
  }
  for(var code in m)padSet(code,m[code]);
  if(gp){
    [[6,"l2"],[7,"r2"]].forEach(function(pair){
      var down=!!(gp.buttons&&gp.buttons[pair[0]]&&gp.buttons[pair[0]].pressed);
      if(down&&!sysPrev[pair[1]]){try{parent.postMessage({t:"hp-sys",btn:pair[1]},"*")}catch(e){}}
      sysPrev[pair[1]]=down;
    });
  }
}
setInterval(pollPad,16);
var HP={
  keys:keys,
  left:function(){return !!(keys.ArrowLeft||padKeys.ArrowLeft)},
  right:function(){return !!(keys.ArrowRight||padKeys.ArrowRight)},
  up:function(){return !!(keys.ArrowUp||padKeys.ArrowUp)},
  down:function(){return !!(keys.ArrowDown||padKeys.ArrowDown)},
  a:function(){return !!(keys.Space||padKeys.Space)},
  b:function(){return !!(keys.KeyX||padKeys.KeyX)},
  aHit:function(){return !!pressed.Space},
  bHit:function(){return !!pressed.KeyX},
  x:function(){return !!(padKeys.PadX||keys.KeyZ)},
  y:function(){return !!(padKeys.PadY||keys.KeyC)},
  l1:function(){return !!(padKeys.PadL1||keys.ShiftLeft)},
  r1:function(){return !!(padKeys.PadR1||keys.ShiftRight)},
  xHit:function(){return !!(pressed.PadX||pressed.KeyZ)},
  yHit:function(){return !!(pressed.PadY||pressed.KeyC)},
  l1Hit:function(){return !!(pressed.PadL1||pressed.ShiftLeft)},
  r1Hit:function(){return !!(pressed.PadR1||pressed.ShiftRight)},
  loop:function(fn){
    var p=performance.now();
    function f(n){
      var dt=Math.min(0.05,(n-p)/1000);p=n;
      fn(dt);
      for(var k in pressed)delete pressed[k];
      var _now=performance.now();
      for(var u in pendingUp){if(_now>=pendingUp[u]){keys[u]=false;delete pendingUp[u]}}
      requestAnimationFrame(f);
    }
    requestAnimationFrame(f);
  },
  bar:function(g,x,y,w,h,ratio,color,bg){
    g.fillStyle=bg||"#2a3c5f";g.fillRect(x,y,w,h);
    g.fillStyle=color;g.fillRect(x,y,w*Math.max(0,Math.min(1,ratio)),h);
  },
  text:function(g,s,x,y,size,color,align,font){
    g.font=(size||13)+'px '+(font||'"HP Denki",sans-serif');
    g.fillStyle=color||"#fff";g.textAlign=align||"left";
    g.fillText(s,x,y);g.textAlign="left";
  },
  panel:function(g,x,y,w,h,fill,stroke){
    g.fillStyle=fill||"rgba(10,14,30,.85)";g.fillRect(x,y,w,h);
    if(stroke){g.strokeStyle=stroke;g.strokeRect(x,y,w,h)}
  },
  title:function(g,W,H,title,lines,color,font){
    g.fillStyle=color||"#fff";g.textAlign="center";
    g.font=(font?'26px ':'700 25px ')+(font||'"HP Denki",sans-serif');g.fillText(title,W/2,H/2-40);
    g.font=(font?'14px ':'13px ')+(font||'"HP Denki",sans-serif');
    (lines||[]).forEach(function(s,i){g.fillText(s,W/2,H/2-8+i*22)});
    g.textAlign="left";
  },
  scene:function(defs,initial){
    var cur=null;
    var api={
      cur:function(){return cur},
      go:function(name){
        if(cur&&defs[cur]&&defs[cur].exit)defs[cur].exit();
        cur=name;
        if(defs[cur]&&defs[cur].enter)defs[cur].enter();
      },
      frame:function(dt){
        if(cur&&defs[cur]&&defs[cur].frame)defs[cur].frame(dt);
      }
    };
    if(initial)api.go(initial);
    return api;
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
