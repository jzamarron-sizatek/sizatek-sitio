/* Sizatek — Calcula tu paquete: cuestionario guiado con recomendación */
(function(){
  'use strict';
  var body=document.getElementById('wizBody');if(!body)return;
  var back=document.getElementById('wizBack'),prog=document.getElementById('wizProg'),stepEl=document.getElementById('wizStep');
  var WA='https://wa.me/5216567646127';
  /* Pesos con separador de miles. Los megas NO lo llevan: la marca
     escribe 2000, no 2,000. */
  function pesos(n){return '$'+Number(n).toLocaleString('es-MX');}

  /* Planes (según flyers y Formatos Simplificados IFT) */
  /* Planes, cotejados contra el formato simplificado de cada folio.
     `up` es la SUBIDA inscrita: antes se imprimía la bajada en su lugar y la
     recomendación decía, por ejemplo, "450 SUBIDA" en un plan de 450/300.
     `duo:true` marca el que no se recomienda sin preguntar antes por el
     puerto del equipo (ver la pregunta `puerto`). */
  var PLANES={
    casa:[
      {n:'BÁSICO',mb:120,up:120,p:399,f:2848687,slug:'basico'},
      {n:'FAMILIAR',mb:200,up:200,p:499,f:2848701,slug:'familiar'},
      {n:'ENTRETENIMIENTO',mb:450,up:300,p:599,f:2984627,slug:'entretenimiento'},
      {n:'GAMER',mb:650,up:400,p:799,f:2984630,slug:'gamer'},
      {n:'ELITE',mb:1000,up:500,p:999,f:2984659,slug:'elite'},
      {n:'DUO',mb:2000,up:500,p:1899,f:2980155,slug:'duo',duo:true,inst:1500}],
    negocio:[
      {n:'BÁSICO',mb:120,up:120,p:449,f:2853268,slug:'negocios-basico'},
      {n:'PRO',mb:200,up:200,p:549,f:2853278,slug:'negocios-pro'},
      {n:'PLUS',mb:450,up:300,p:649,f:2984684,slug:'negocios-plus'},
      {n:'MAX',mb:650,up:400,p:849,f:2984699,slug:'negocios-max'},
      {n:'ELITE',mb:1000,up:500,p:1099,f:2984710,slug:'negocios-elite'}]
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
    /* EL DUO NO SE RECOMIENDA A CIEGAS.
        Con un puerto de 1 Gb el equipo topa en 1000 Mbps aunque el servicio
        traiga 2000: el cliente pagaría $1,899 y vería lo mismo que con ELITE.
        Esta pregunta sólo aparece cuando el uso declarado pasa de 1000. */
    puerto:{r:'Puerto del equipo',icon:'disp',q:'¿Tu equipo tiene puerto de 2.5 Gb?',
      s:'Lo traen computadoras y NAS recientes, y los switches que lo soportan. Con un puerto de 1 Gb, un solo equipo topa en 1000 Mbps aunque el servicio traiga más.',opts:[
      {l:'Sí',s:'o lo voy a conectar por WiFi 6 entre varios equipos',puerto:'si'},
      {l:'No lo sé',s:'pregúntenme al instalar',puerto:'nose'},
      {l:'No',s:'mi equipo es de 1 Gb',puerto:'no'}]},
    nube:{r:'Nube / punto de venta',icon:'work',q:'¿Sistemas en la nube o punto de venta?',s:'facturación, punto de venta, respaldos, escritorio remoto',opts:[
      {l:'No',v:0},{l:'Sí',v:20},{l:'Sí, varios',v:50}]}
  };
  var FLOW={casa:['personas','pantallas','dispositivos','iot','camaras','consolas','homeoffice','envivo'],
            negocio:['equipo','dispositivos','pantallas','camaras','iot','videollamadas','nube']};

  var ans={},order=['lugar'],idx=0;
  function flow(){
    if(!ans.lugar)return['lugar'];
    var f=['lugar'].concat(FLOW[ans.lugar.k]);
    /* La pregunta del puerto se agrega al final SÓLO cuando ya están
       contestadas las demás y el cuestionario ya topó la escalera, que es el
       único caso en que el Duo entra a discusión. Preguntarle por hardware a
       quien va a terminar en BÁSICO es ruido. */
    if(ans.lugar.k==='casa' && f.slice(1).every(function(k){return ans[k];}) && topa()) f.push('puerto');
    return f;
  }

  /* Mbps estimados de uso simultáneo, ya con el margen. */
  function necesidad(){
    var sum=0,tipo=ans.lugar?ans.lugar.k:'casa';
    (FLOW[tipo]||[]).forEach(function(k){var o=ans[k];if(o)sum+=o.v||0;});
    return sum*1.6;
  }
  /* Mínimo forzado por una respuesta (p. ej. consolas sube a GAMER). */
  function minimo(){
    var m=0,tipo=ans.lugar?ans.lugar.k:'casa';
    (FLOW[tipo]||[]).forEach(function(k){var o=ans[k];if(o&&o.minTier!=null)m=Math.max(m,o.minTier);});
    return m;
  }
  /* Índice sobre la escalera SIN el Duo. */
  function indiceBase(tipo){
    var planes=PLANES[tipo].filter(function(x){return !x.duo;}),need=necesidad(),i=0;
    while(i<planes.length-1&&planes[i].mb<need)i++;
    return Math.max(i,minimo());
  }
  /* ¿El cuestionario ya llegó al último escalón? Ahí es donde tiene sentido
     preguntar por el puerto: es la única puerta de entrada al Duo. */
  function topa(){
    var tipo=ans.lugar.k,planes=PLANES[tipo].filter(function(x){return !x.duo;});
    return indiceBase(tipo)===planes.length-1;
  }

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
    var tipo=ans.lugar.k,planes=PLANES[tipo],base=PLANES[tipo].filter(function(x){return !x.duo;});
    var i=indiceBase(tipo),puerto=ans.puerto?ans.puerto.puerto:null,subido=null;
    var plan=base[i];
    /* El Duo sólo se recomienda si el cliente dijo que su equipo lo aprovecha.
       Si dijo que no, se queda en ELITE y el resultado explica por qué:
       cobrarle $1,899 para que vea 1000 Mbps no es vender, es prepararle una
       queja. Si dijo que no sabe, se le ofrece con la advertencia. */
    if(i===base.length-1 && (puerto==='si'||puerto==='nose')){
      var duo=planes.filter(function(x){return x.duo;})[0];
      if(duo){ subido=plan; plan=duo; }
    }
    var alt = subido ? subido : (i>0?base[i-1]:null);
    return {tipo:tipo,plan:plan,alt:alt,need:Math.round(necesidad()),
            puerto:puerto,bajado:(i===base.length-1&&puerto==='no')?planes.filter(function(x){return x.duo;})[0]:null};
  }

  function resumen(){var parts=[];flow().slice(1).forEach(function(k){var o=ans[k];if(o&&o.v)parts.push(Q[k].r+': '+o.l);});return parts;}

  function result(){
    var r=calc(),p=r.plan,tipo=r.tipo==='casa'?'RESIDENCIAL':'NEGOCIO';
    back.hidden=false;prog.style.width='100%';stepEl.textContent='';
    var inst=p.inst||600;
    var msg='Hola, calculé mi paquete en sizatek.com: '+p.n+' '+tipo+' ('+p.mb+' megas, recarga '+pesos(p.p)+', vigencia 30 días). Quiero agendar mi instalación.\n'+resumen().join(' · ');
    var wa=WA+'?text='+encodeURIComponent(msg);
    var pdf='https://sizatek.com/wp-content/uploads/2026/09/formato-simplificado-'+p.f+'-'+p.slug+'.pdf';

    /* Un aviso, no una letra chiquita: si el cliente dijo que su equipo es de
       1 Gb, tiene derecho a saber por qué no le estamos ofreciendo el Duo. */
    var aviso='';
    if(r.bajado){
      aviso='<p class="wiz-aviso">Por lo que nos dijiste, el Duo 2000 no te rendiría: '+
        'con un puerto de 1 Gb un solo equipo topa en 1000 Mbps aunque el servicio traiga más. '+
        'Si cambias de equipo o lo vas a repartir por WiFi 6 entre varios, dinos y lo vemos.</p>';
    } else if(p.duo && r.puerto==='nose'){
      aviso='<p class="wiz-aviso">Al instalar revisamos el puerto de tu equipo. Si resulta de '+
        '1 Gb, un solo equipo topa en 1000 Mbps: te lo decimos antes de contratar.</p>';
    }

    var h='<div class="wiz-res"><p class="eyebrow">Paquete sugerido</p>'+
      '<div class="rung open'+(p.duo?' es-duo':'')+'"><div class="wiz-plan">'+
      '<div class="name">'+p.n+'<small>'+tipo+' · Folio de inscripción '+p.f+'</small></div>'+
      '<div class="bar-wrap"><div class="bar"><i style="--w:'+Math.max(12,p.mb/20)+'%"></i><span class="mb">'+p.mb+'<small>MEGAS</small></span></div><div class="up"><b>'+p.up+'</b> SUBIDA<span class="v6">IPv4 + IPv6</span></div></div>'+
      '<div class="price"><div class="amt">'+pesos(p.p)+'<small>recarga</small></div><div class="vig">vigencia del saldo 30 días · instalación '+pesos(inst)+'</div><a class="btn btn-luz" href="'+wa+'">AGENDAR MI INSTALACIÓN</a></div>'+
      '</div></div>'+aviso+
      '<div class="wiz-sum">'+resumen().map(function(s){return '<span>'+s+'</span>';}).join('')+'</div>'+
      '<div class="wiz-links"><a class="btn btn-ghost" href="/paquetes/#plan-'+p.f+'">Paquetes</a><a class="btn btn-ghost" href="'+pdf+'">Folio de inscripción '+p.f+'</a>'+(r.alt?'<a class="btn btn-ghost" href="/paquetes/#plan-'+r.alt.f+'">'+r.alt.n+' · '+r.alt.mb+' MEGAS · $'+r.alt.p+' recarga</a>':'')+'</div>'+
      '<p class="legal">Acceso a Internet Fijo Prepago. Vigencia del saldo: 30 días. Velocidad mínima garantizada: 10% de la velocidad contratada, de bajada y de subida. Sin plazo mínimo de permanencia. Un equipo terminal incluido, en comodato. IVA incluido. Sujeto a cobertura y factibilidad técnica. Esta sugerencia es orientativa; la contratación va por el folio inscrito ante el IFT.</p>'+
      '<button type="button" class="wiz-again" id="wizAgain">&#8635; Empezar de nuevo</button></div>';
    swap(h);
    document.getElementById('wizAgain').addEventListener('click',function(){ans={};idx=0;render();});
  }
  back.addEventListener('click',function(){if(idx>0){idx=Math.min(idx-1,flow().length-1);render();}});
  render();
})();
