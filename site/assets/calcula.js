/* Sizatek — Calcula tu paquete: cuestionario guiado con recomendación */
(function(){
  'use strict';
  var body=document.getElementById('wizBody');if(!body)return;
  var back=document.getElementById('wizBack'),prog=document.getElementById('wizProg'),stepEl=document.getElementById('wizStep');
  var WA='https://wa.me/5216567646127';

  /* Planes (según flyers y Formatos Simplificados IFT) */
  var PLANES={
    casa:[
      {n:'BÁSICO',mb:120,p:399,f:2848687,slug:'basico'},
      {n:'FAMILIAR',mb:200,p:499,f:2848701,slug:'familiar'},
      {n:'ENTRETENIMIENTO',mb:450,p:599,f:2870866,slug:'entretenimiento'},
      {n:'GAMER',mb:650,p:799,f:2848745,slug:'gamer'},
      {n:'ELITE',mb:1000,p:999,f:2848765,slug:'elite'}],
    negocio:[
      {n:'BÁSICO',mb:120,p:449,f:2853268,slug:'basico'},
      {n:'PRO',mb:200,p:549,f:2853278,slug:'pro'},
      {n:'PLUS',mb:450,p:649,f:2853290,slug:'plus'},
      {n:'MAX',mb:650,p:849,f:2853297,slug:'max'},
      {n:'ELITE',mb:1000,p:1099,f:2853299,slug:'elite'}]
  };

  /* Iconos */
  var I={
    casa:'<svg viewBox="0 0 24 24"><path d="M3 11.5 12 4l9 7.5"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/></svg>',
    negocio:'<svg viewBox="0 0 24 24"><path d="M3 9h18l-1.5 4H4.5z"/><path d="M5 13v7h14v-7"/><path d="M9 20v-4h6v4"/><path d="M4 9l2-5h12l2 5"/></svg>',
    personas:'<svg viewBox="0 0 24 24"><circle cx="9" cy="8" r="3.2"/><path d="M3.5 19a5.5 5.5 0 0 1 11 0"/><circle cx="17" cy="9" r="2.5"/><path d="M15.5 19a4.5 4.5 0 0 1 5-4.3"/></svg>',
    tv:'<svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="12" rx="2"/><path d="M8 21h8M12 17v4"/></svg>',
    disp:'<svg viewBox="0 0 24 24"><rect x="3" y="4" width="13" height="10" rx="1.5"/><path d="M6 18h7"/><rect x="17" y="8" width="4" height="10" rx="1"/></svg>',
    iot:'<svg viewBox="0 0 24 24"><path d="M9 17h6M10 20h4"/><path d="M12 3a6 6 0 0 0-3.5 10.9c.6.5.9 1.2.9 2H14.6c0-.8.3-1.5.9-2A6 6 0 0 0 12 3z"/></svg>',
    cam:'<svg viewBox="0 0 24 24"><rect x="3" y="7" width="12" height="9" rx="2"/><path d="m15 10 6-3v10l-6-3"/><path d="M7 16v4"/></svg>',
    game:'<svg viewBox="0 0 24 24"><path d="M6 8h12a4 4 0 0 1 4 4v1a4 4 0 0 1-7 2.6l-1-1.1h-4l-1 1.1A4 4 0 0 1 2 13v-1a4 4 0 0 1 4-4z"/><path d="M7 11v3M5.5 12.5h3"/><circle cx="16.5" cy="11.5" r=".8"/><circle cx="18.5" cy="13.5" r=".8"/></svg>',
    work:'<svg viewBox="0 0 24 24"><rect x="3" y="6" width="18" height="12" rx="2"/><path d="M3 10h18"/><path d="M9 6V4h6v2"/></svg>',
    live:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M7.5 7.5a6.4 6.4 0 0 0 0 9M16.5 7.5a6.4 6.4 0 0 1 0 9"/><path d="M4.5 4.5a10.6 10.6 0 0 0 0 15M19.5 4.5a10.6 10.6 0 0 1 0 15"/></svg>',
    call:'<svg viewBox="0 0 24 24"><rect x="3" y="6" width="13" height="12" rx="2"/><path d="m16 10 5-2.5v9L16 14"/></svg>'
  };

  /* Preguntas. v = Mbps estimados de uso simultáneo; minTier fuerza un mínimo (índice del plan) */
  var Q={
    lugar:{icon:'casa',q:'¿Para dónde es el internet?',opts:[
      {l:'Mi casa',s:'departamento, casa, rancho',k:'casa',icon:'casa'},
      {l:'Un negocio',s:'tienda, oficina, despacho, consultorio, escuela',k:'negocio',icon:'negocio'}]},
    personas:{r:'Personas',icon:'personas',q:'¿Cuántas personas lo van a usar?',opts:[
      {l:'1 – 2',v:10},{l:'3 – 4',v:20},{l:'5 – 6',v:35},{l:'7 o más',v:50}]},
    equipo:{r:'Personas conectadas',icon:'personas',q:'¿Cuántas personas trabajan conectadas?',opts:[
      {l:'1 – 3',v:15},{l:'4 – 8',v:40},{l:'9 – 15',v:80},{l:'16 o más',v:150}]},
    pantallas:{r:'Pantallas',icon:'tv',q:'¿Cuántas pantallas con streaming?',s:'Smart TV, TV con dispositivo de streaming, proyector',opts:[
      {l:'Ninguna',v:0},{l:'1',v:25},{l:'2',v:50},{l:'3',v:75},{l:'4 o más',v:110}]},
    dispositivos:{r:'Dispositivos',icon:'disp',q:'¿Cuántos dispositivos personales?',s:'celulares, tablets, laptops, computadoras',opts:[
      {l:'1 – 3',v:15},{l:'4 – 6',v:30},{l:'7 – 10',v:50},{l:'11 o más',v:80}]},
    iot:{r:'Inteligentes',icon:'iot',q:'¿Cuántos dispositivos inteligentes?',s:'focos, apagadores, enchufes, sensores, asistentes de voz, electrodomésticos',opts:[
      {l:'Ninguno',v:0},{l:'1 – 5',v:5},{l:'6 – 15',v:15},{l:'16 o más',v:30}]},
    camaras:{r:'Cámaras',icon:'cam',q:'¿Cuántas cámaras de seguridad?',s:'cámaras que se ven desde el celular o graban en la nube',opts:[
      {l:'Ninguna',v:0},{l:'1 – 2',v:10},{l:'3 – 6',v:25},{l:'7 o más',v:50}]},
    consolas:{r:'Consolas',icon:'game',q:'¿Consolas o juegos en línea?',s:'PlayStation, Xbox, Nintendo, PC gamer',opts:[
      {l:'Ninguna',v:0},{l:'1',v:40,minTier:3},{l:'2 o más',v:80,minTier:3}]},
    homeoffice:{r:'Trabajo o clases',icon:'work',q:'¿Trabajo o clases desde casa?',s:'videollamadas, plataformas escolares, escritorio remoto',opts:[
      {l:'No',v:0},{l:'Sí, 1 persona',v:15},{l:'Sí, 2 o más',v:35}]},
    envivo:{r:'En vivo',icon:'live',q:'¿Transmites en vivo o subes videos?',s:'Twitch, YouTube, TikTok, Instagram',opts:[
      {l:'No',v:0},{l:'A veces',v:30},{l:'Seguido',v:70}]},
    videollamadas:{r:'Videollamadas',icon:'call',q:'¿Videollamadas o videoconferencias?',opts:[
      {l:'Casi nunca',v:5},{l:'A diario',v:30},{l:'Varias al mismo tiempo',v:70}]},
    nube:{r:'Nube / punto de venta',icon:'work',q:'¿Sistemas en la nube o punto de venta?',s:'facturación, punto de venta, respaldos, escritorio remoto',opts:[
      {l:'No',v:0},{l:'Sí',v:20},{l:'Sí, varios',v:50}]}
  };
  var FLOW={casa:['personas','pantallas','dispositivos','iot','camaras','consolas','homeoffice','envivo'],
            negocio:['equipo','dispositivos','pantallas','camaras','iot','videollamadas','nube']};

  var ans={},order=['lugar'],idx=0;
  function flow(){return ans.lugar?['lugar'].concat(FLOW[ans.lugar.k]):['lugar'];}

  function render(){
    order=flow();var total=order.length;
    if(idx>=total){return result();}
    var key=order[idx],q=Q[key];
    back.hidden=idx===0;prog.style.width=(idx/total*100)+'%';stepEl.textContent=(idx+1)+' / '+total;
    var h='<div class="wiz-q"><span class="wiz-ico">'+I[q.icon]+'</span><h3>'+q.q+'</h3>'+(q.s?'<p>'+q.s+'</p>':'')+'</div><div class="wiz-opts'+(q.opts.length>3?' cols':'')+'">';
    q.opts.forEach(function(o,i){var sel=ans[key]&&ans[key].l===o.l;h+='<button type="button" class="wiz-opt'+(sel?' sel':'')+'" data-i="'+i+'">'+(o.icon?'<span class="wiz-ico sm">'+I[o.icon]+'</span>':'')+'<b>'+o.l+'</b>'+(o.s?'<small>'+o.s+'</small>':'')+'</button>';});
    h+='</div>';
    swap(h);
    body.querySelectorAll('.wiz-opt').forEach(function(b){b.addEventListener('click',function(){var o=q.opts[+b.dataset.i];ans[key]=o;b.classList.add('sel');setTimeout(function(){idx++;render();},180);});});
  }
  var wiz=document.getElementById('wiz');
  function swap(h){body.classList.remove('in');body.innerHTML=h;void body.offsetWidth;body.classList.add('in');var top=wiz.getBoundingClientRect().top;if(top<0)window.scrollTo({top:window.scrollY+top-84,behavior:'smooth'});}

  function calc(){
    var tipo=ans.lugar.k,sum=0,min=0;
    flow().slice(1).forEach(function(k){var o=ans[k];if(!o)return;sum+=o.v||0;if(o.minTier!=null)min=Math.max(min,o.minTier);});
    var need=sum*1.6,planes=PLANES[tipo],i=0;
    while(i<planes.length-1&&planes[i].mb<need)i++;
    i=Math.max(i,min);
    return {tipo:tipo,plan:planes[i],alt:i>0?planes[i-1]:null,need:Math.round(need)};
  }
  function resumen(){var parts=[];flow().slice(1).forEach(function(k){var o=ans[k];if(o&&o.v)parts.push(Q[k].r+': '+o.l);});return parts;}

  function result(){
    var r=calc(),p=r.plan,tipo=r.tipo==='casa'?'RESIDENCIAL':'NEGOCIO';
    back.hidden=false;prog.style.width='100%';stepEl.textContent='';
    var msg='Hola, calculé mi paquete en sizatek.com: '+p.n+' '+tipo+' ('+p.mb+' megas, $'+p.p+'/mes). Quiero agendar mi instalación.\n'+resumen().join(' · ');
    var wa=WA+'?text='+encodeURIComponent(msg);
    var pdf='https://sizatek.com/wp-content/uploads/2026/09/formato-simplificado-'+p.f+'-'+p.slug+'.pdf';
    var h='<div class="wiz-res"><p class="eyebrow">Paquete sugerido</p>'+
      '<div class="rung open"><div class="wiz-plan">'+
      '<div class="name">'+p.n+'<small>'+tipo+' · Folio de inscripción '+p.f+'</small></div>'+
      '<div class="bar-wrap"><div class="bar"><i style="--w:'+Math.max(12,p.mb/10)+'%"></i><span class="mb">'+p.mb+'<small>MEGAS</small></span></div><div class="up"><b>'+p.mb+'</b> SUBIDA<span class="v6">IPv4 + IPv6</span></div></div>'+
      '<div class="price"><div class="amt">$'+p.p+'<small>/MES</small></div><a class="btn btn-luz" href="'+wa+'">AGENDAR MI INSTALACIÓN</a></div>'+
      '</div></div>'+
      '<div class="wiz-sum">'+resumen().map(function(s){return '<span>'+s+'</span>';}).join('')+'</div>'+
      '<div class="wiz-links"><a class="btn btn-ghost" href="/paquetes/#plan-'+p.f+'">Paquetes</a><a class="btn btn-ghost" href="'+pdf+'">Folio de inscripción '+p.f+'</a>'+(r.alt?'<a class="btn btn-ghost" href="/paquetes/#plan-'+r.alt.f+'">'+r.alt.n+' · '+r.alt.mb+' MEGAS · $'+r.alt.p+'/MES</a>':'')+'</div>'+
      '<p class="legal">*Válido a partir del 1 de septiembre de 2026. Aplican restricciones. Sujeto a cobertura.</p>'+
      '<button type="button" class="wiz-again" id="wizAgain">&#8635; Empezar de nuevo</button></div>';
    swap(h);
    document.getElementById('wizAgain').addEventListener('click',function(){ans={};idx=0;render();});
  }
  back.addEventListener('click',function(){if(idx>0){idx=Math.min(idx-1,flow().length-1);render();}});
  render();
})();
