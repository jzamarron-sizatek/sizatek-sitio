/* Sizatek — intro animado nativo (canvas + CSS). Se muestra una vez por sesión. */
(function(){
  'use strict';
  var el=document.getElementById('intro'); if(!el) return;
  var RENDER=/(\?|&)render=1/.test(location.search);
  var reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion:reduce)').matches;
  var seen=false; try{seen=sessionStorage.getItem('sz-intro')==='1';}catch(e){}
  if(!RENDER&&(seen||reduce)){el.remove();return;}
  document.documentElement.classList.add('has-intro');

  var cv=el.querySelector('canvas'), ctx=cv.getContext('2d');
  var iso=el.querySelector('.intro-iso'), tag=el.querySelector('.intro-tag');
  var W=0,H=0,DPR=1;
  function resize(){DPR=Math.min(window.devicePixelRatio||1,2);W=el.clientWidth;H=el.clientHeight;cv.width=W*DPR;cv.height=H*DPR;cv.style.width=W+'px';cv.style.height=H+'px';ctx.setTransform(DPR,0,0,DPR,0,0);}
  resize(); window.addEventListener('resize',resize);

  /* ---- tiempos (s) ---- */
  var T={grid:0.0,core:0.25,burst:0.7,streak0:1.0,streak1:2.45,ring:2.35,iso:1.75,word:2.55,tag:3.15,sweep:3.2,out:4.75,end:5.6};
  var DUR=T.end;

  /* ---- RNG determinista ---- */
  function rng(seed){return function(){seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};}
  var r1=rng(7);
  var stars=[];for(var i=0;i<70;i++)stars.push({x:r1(),y:r1(),s:0.6+r1()*1.6,p:r1()*6.28,f:0.6+r1()*1.4});
  var parts=[];for(i=0;i<160;i++){var a=r1()*6.283,sp=140+r1()*520;parts.push({a:a,sp:sp,sz:0.8+r1()*2.2,life:0.9+r1()*0.9,h:r1()});}
  var streaks=[{a0:0.3,w:1.0,c:'#1BE7FF'},{a0:2.4,w:0.8,c:'#8FF3FF'},{a0:4.5,w:0.9,c:'#4FB3B5'}];

  var C='#1BE7FF',TEAL='#4FB3B5';
  function clamp(v){return v<0?0:v>1?1:v;}
  function eo(x){return 1-Math.pow(1-x,3);} function eio(x){return x<0.5?4*x*x*x:1-Math.pow(-2*x+2,3)/2;}

  function center(){var r=iso.getBoundingClientRect(),e=el.getBoundingClientRect();return {x:r.left-e.left+r.width/2,y:r.top-e.top+r.height/2,r:r.width/2};}
  function tagY(){var r=tag.getBoundingClientRect(),e=el.getBoundingClientRect();return {x:r.left-e.left+r.width/2,y:r.top-e.top+r.height/2,w:r.width};}

  function draw(t){
    var c=center();
    ctx.globalCompositeOperation='source-over';
    ctx.fillStyle='#050B1A';ctx.fillRect(0,0,W,H);

    /* rejilla */
    var ga=clamp((t-T.grid)/0.9)*0.9;
    if(ga>0){
      ctx.strokeStyle='rgba(79,179,181,'+(0.11*ga).toFixed(3)+')';ctx.lineWidth=1;ctx.beginPath();
      var g=44,ox=(W/2)%g,oy=(H/2)%g;
      for(var x=ox;x<W;x+=g){ctx.moveTo(x+0.5,0);ctx.lineTo(x+0.5,H);}
      for(var y=oy;y<H;y+=g){ctx.moveTo(0,y+0.5);ctx.lineTo(W,y+0.5);}
      ctx.stroke();
      /* viñeta */
      var vg=ctx.createRadialGradient(c.x,c.y,Math.min(W,H)*0.25,c.x,c.y,Math.max(W,H)*0.75);
      vg.addColorStop(0,'rgba(5,11,26,0)');vg.addColorStop(1,'rgba(5,11,26,0.92)');ctx.fillStyle=vg;ctx.fillRect(0,0,W,H);
    }
    /* estrellas */
    for(var i=0;i<stars.length;i++){var s=stars[i];var tw=0.35+0.65*(0.5+0.5*Math.sin(t*s.f*2+s.p));ctx.fillStyle='rgba(255,247,238,'+(0.5*tw*ga).toFixed(3)+')';ctx.beginPath();ctx.arc(s.x*W,s.y*H,s.s,0,6.283);ctx.fill();}

    ctx.globalCompositeOperation='lighter';
    /* núcleo de luz */
    var ct=clamp((t-T.core)/1.1);
    var coreA=ct*(t<T.iso?1:Math.max(0.25,1-clamp((t-T.iso)/0.6)*0.75));
    if(ct>0){
      var pulse=1+0.08*Math.sin(t*9);
      var cr=(10+eo(ct)*Math.min(W,H)*0.16)*pulse;
      var cg=ctx.createRadialGradient(c.x,c.y,0,c.x,c.y,cr);
      cg.addColorStop(0,'rgba(200,250,255,'+(0.95*coreA).toFixed(3)+')');cg.addColorStop(0.25,'rgba(27,231,255,'+(0.55*coreA).toFixed(3)+')');cg.addColorStop(1,'rgba(27,231,255,0)');
      ctx.fillStyle=cg;ctx.beginPath();ctx.arc(c.x,c.y,cr,0,6.283);ctx.fill();
    }
    /* ráfaga de partículas */
    var bt=t-T.burst;
    if(bt>0){
      for(i=0;i<parts.length;i++){var p=parts[i];if(bt>p.life)continue;var tau=bt/p.life;var d=p.sp*(1-Math.exp(-3*bt))/3;var px=c.x+Math.cos(p.a)*d,py=c.y+Math.sin(p.a)*d;var al=(1-tau)*(1-tau);ctx.fillStyle=p.h<0.5?'rgba(27,231,255,'+al.toFixed(3)+')':'rgba(255,247,238,'+(al*0.8).toFixed(3)+')';ctx.beginPath();ctx.arc(px,py,p.sz*(1-tau*0.5),0,6.283);ctx.fill();}
    }
    /* estelas orbitando */
    var st=t-T.streak0;
    if(st>0){
      var R0=Math.min(W,H)*0.34,R1=c.r*1.12,dur=T.streak1-T.streak0;
      var fade=1-clamp((t-T.streak1)/0.35);
      if(fade>0){
        ctx.lineCap='round';
        for(i=0;i<streaks.length;i++){var sk=streaks[i];var N=52;
          var pts=[];
          for(var k=0;k<N;k++){var tk=st-k*0.017;if(tk<0)break;var tau2=clamp(tk/dur);var rad=R0+(R1-R0)*eio(tau2);var ang=sk.a0+tk*(6.283*1.35)+Math.sin(tk*3+i)*0.15;pts.push([c.x+Math.cos(ang)*rad,c.y+Math.sin(ang)*rad*0.86]);}
          if(pts.length<2)continue;
          var headA=fade*(0.25+0.75*clamp(st/0.3));
          ctx.shadowColor=sk.c;ctx.shadowBlur=18;
          for(k=0;k<pts.length-1;k++){var q=1-k/pts.length;ctx.strokeStyle=sk.c;ctx.globalAlpha=headA*q*q;ctx.lineWidth=(1.5+7*q)*sk.w;ctx.beginPath();ctx.moveTo(pts[k][0],pts[k][1]);ctx.lineTo(pts[k+1][0],pts[k+1][1]);ctx.stroke();}
          ctx.globalAlpha=headA;ctx.shadowBlur=26;ctx.fillStyle='#ffffff';ctx.beginPath();ctx.arc(pts[0][0],pts[0][1],2.6*sk.w,0,6.283);ctx.fill();
        }
        ctx.globalAlpha=1;ctx.shadowBlur=0;
      }
    }
    /* anillo de llegada */
    var rt=t-T.ring;
    if(rt>0&&rt<0.9){var q2=rt/0.9;ctx.strokeStyle=C;ctx.globalAlpha=(1-q2)*(1-q2)*0.9;ctx.lineWidth=3*(1-q2)+0.5;ctx.shadowColor=C;ctx.shadowBlur=20;ctx.beginPath();ctx.arc(c.x,c.y,c.r*(1.05+q2*0.9),0,6.283);ctx.stroke();ctx.globalAlpha=1;ctx.shadowBlur=0;}
    /* destello bajo el lema */
    var wt=t-T.sweep;
    if(wt>0&&wt<0.9){var tg=tagY();var q3=eo(wt/0.9);var span=tg.w*1.5;var hx=tg.x-span/2+span*q3;var y2=tg.y+18;var tail=Math.min(220,span*0.35);var al2=Math.sin(Math.PI*clamp(wt/0.9));
      var lg=ctx.createLinearGradient(hx-tail,y2,hx,y2);lg.addColorStop(0,'rgba(27,231,255,0)');lg.addColorStop(0.8,'rgba(27,231,255,'+(0.8*al2).toFixed(3)+')');lg.addColorStop(1,'rgba(255,255,255,'+al2.toFixed(3)+')');
      ctx.strokeStyle=lg;ctx.lineWidth=2;ctx.shadowColor=C;ctx.shadowBlur=14;ctx.beginPath();ctx.moveTo(hx-tail,y2);ctx.lineTo(hx,y2);ctx.stroke();ctx.shadowBlur=0;
    }
    ctx.globalCompositeOperation='source-over';
  }

  /* ---- fases CSS ---- */
  var phases=[['iso',T.iso],['word',T.word],['tag',T.tag],['out',T.out]];
  function applyPhases(t){for(var i=0;i<phases.length;i++){el.classList.toggle('p-'+phases[i][0],t>=phases[i][1]);}}

  function finish(){try{sessionStorage.setItem('sz-intro','1');}catch(e){}document.documentElement.classList.remove('has-intro');if(el.parentNode)el.parentNode.removeChild(el);window.removeEventListener('resize',resize);}

  if(RENDER){
    /* modo exportación: renderizado determinista por tiempo (t en segundos) */
    el.classList.add('go','render');
    var seenAnims=[],t0map={'intro-iso':T.iso,'intro-word':T.word,'intro-bar':T.word,'intro-tag':T.tag,'intro-out':T.out,'intro-zoom':T.out};
    window.__intro={duration:DUR,seek:function(t){draw(t);applyPhases(t);var anims=document.getAnimations?document.getAnimations():[];for(var i=0;i<anims.length;i++){var a=anims[i];if(seenAnims.indexOf(a)<0){seenAnims.push(a);a.pause();a.__t0=(t0map[a.animationName]||0)*1000;}a.currentTime=Math.max(0,t*1000-a.__t0);}}};
    draw(0);
    return;
  }

  el.classList.add('go');
  var start=null,done=false,skipAt=null;
  function skip(){if(done)return;if(skipAt===null){skipAt=performance.now();el.classList.add('p-out','skip');}}
  el.addEventListener('click',skip);
  window.addEventListener('keydown',function(e){if(e.key==='Escape'||e.key==='Enter'||e.key===' ')skip();});
  function frame(now){if(done)return;if(start===null)start=now;var t=(now-start)/1000;
    if(skipAt!==null){if(now-skipAt>820){done=true;finish();return;}draw(t);requestAnimationFrame(frame);return;}
    draw(t);applyPhases(t);
    if(t>=T.end){done=true;finish();return;}
    requestAnimationFrame(frame);}
  requestAnimationFrame(frame);
})();
