(function(){
  // menú móvil
  var mb=document.getElementById('menuBtn'),dr=document.getElementById('drawer');
  if(mb&&dr){mb.addEventListener('click',function(){var o=dr.classList.toggle('open');mb.setAttribute('aria-expanded',o)});
  dr.addEventListener('click',function(e){if(e.target.tagName==='A'){dr.classList.remove('open');mb.setAttribute('aria-expanded','false')}});}

  // Residencial / Negocio
  var segs=document.querySelectorAll('.seg button'),res=document.getElementById('ladder-res'),neg=document.getElementById('ladder-neg');
  function show(k){
    if(!res||!neg)return;
    segs.forEach(function(b){b.setAttribute('aria-pressed',String(b.dataset.seg===k))});
    res.hidden=(k!=='res');neg.hidden=(k!=='neg');
    var act=k==='res'?res:neg;
    act.querySelectorAll('.bar i').forEach(function(i){i.style.animation='none';void i.offsetWidth;i.style.animation=''});
  }
  segs.forEach(function(b){b.addEventListener('click',function(){show(b.dataset.seg)})});
  document.querySelectorAll('.rung summary a').forEach(function(a){a.addEventListener('click',function(e){e.stopPropagation()})});
  document.querySelectorAll('[data-seg-link]').forEach(function(a){a.addEventListener('click',function(){show(a.dataset.segLink)})});

  // formulario → WhatsApp con los datos capturados (sin texto adicional)
  var fc=document.getElementById('formContacto');
  if(fc)fc.addEventListener('submit',function(e){
    e.preventDefault();
    var f=e.target,parts=[f.nombre.value,f.tel.value,f.correo.value,f.msg.value].filter(Boolean);
    window.open('https://wa.me/5216567646127?text='+encodeURIComponent(parts.join('\n')),'_blank');
  });

  // hero: luz viajando por hilos de fibra (Canvas)
  var cv=document.getElementById('fibra');
  if(cv){
  var ctx=cv.getContext('2d'),W,H,strands=[],pulses=[];
  var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function size(){var r=cv.parentElement.getBoundingClientRect();W=cv.width=r.width*devicePixelRatio;H=cv.height=r.height*devicePixelRatio;build()}
  function build(){
    strands=[];pulses=[];
    var n=Math.max(6,Math.round(W/(160*devicePixelRatio)));
    for(var i=0;i<n;i++){
      var y0=H*(0.15+0.8*Math.random()),y1=H*(0.1+0.8*Math.random()),cx1=W*(0.2+0.3*Math.random()),cy1=H*Math.random(),cx2=W*(0.5+0.3*Math.random()),cy2=H*Math.random();
      strands.push({p:[0,y0,cx1,cy1,cx2,cy2,W,y1],a:0.05+Math.random()*0.08});
      for(var k=0;k<2;k++)pulses.push({s:i,t:Math.random(),v:(0.0009+Math.random()*0.0016),len:0.05+Math.random()*0.08});
    }
  }
  function bez(p,t){var u=1-t;return[u*u*u*p[0]+3*u*u*t*p[2]+3*u*t*t*p[4]+t*t*t*p[6],u*u*u*p[1]+3*u*u*t*p[3]+3*u*t*t*p[5]+t*t*t*p[7]]}
  function draw(){
    ctx.clearRect(0,0,W,H);
    ctx.lineWidth=1.2*devicePixelRatio;
    strands.forEach(function(s){ctx.strokeStyle='rgba(79,179,181,'+s.a+')';ctx.beginPath();ctx.moveTo(s.p[0],s.p[1]);ctx.bezierCurveTo(s.p[2],s.p[3],s.p[4],s.p[5],s.p[6],s.p[7]);ctx.stroke()});
    ctx.lineWidth=2.2*devicePixelRatio;ctx.lineCap='round';
    pulses.forEach(function(q){
      var s=strands[q.s],a=bez(s.p,q.t),b=bez(s.p,Math.min(1,q.t+q.len));
      var g=ctx.createLinearGradient(a[0],a[1],b[0],b[1]);g.addColorStop(0,'rgba(27,231,255,0)');g.addColorStop(1,'rgba(27,231,255,.95)');
      ctx.strokeStyle=g;ctx.beginPath();ctx.moveTo(a[0],a[1]);
      for(var i=1;i<=8;i++){var pt=bez(s.p,q.t+q.len*i/8);ctx.lineTo(pt[0],pt[1])}
      ctx.stroke();
      ctx.fillStyle='rgba(27,231,255,.9)';ctx.beginPath();ctx.arc(b[0],b[1],2.4*devicePixelRatio,0,7);ctx.fill();
      if(!reduce){q.t+=q.v;if(q.t>1){q.t=-q.len;}}
    });
    if(!reduce)requestAnimationFrame(draw);
  }
  size();draw();
  var to;window.addEventListener('resize',function(){clearTimeout(to);to=setTimeout(function(){size();if(reduce)draw()},150)});
  }

  // ── Verificador de cobertura (inicio): la base de cajas vive en el NAS, aquí solo llega sí/no ──
  (function(){
    var box=document.getElementById('cob');if(!box)return;
    var gps=document.getElementById('cobGps'),res=document.getElementById('cobRes'),note=document.getElementById('cobNote'),mapEl=document.getElementById('cobMap');
    var API='https://velocidad.sizatek.com/api/cobertura',WA='https://wa.me/5216567646127';
    var ico='<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.6.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.3a.5.5 0 0 0 0-.5l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4 5.1 5.1 0 0 0 3.1.6 2.7 2.7 0 0 0 1.7-1.2 2.1 2.1 0 0 0 .2-1.2c-.1-.1-.3-.2-.5-.3Z"/></svg>';
    var map=null,pin=null;
    function initMap(){if(map||typeof L==='undefined')return;map=L.map(mapEl,{zoomControl:true,attributionControl:true,scrollWheelZoom:false}).setView([30.4125,-107.9165],13);
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'}).addTo(map);
      map.on('click',function(e){place(e.latlng.lat,e.latlng.lng);consulta(e.latlng.lat,e.latlng.lng)});}
    function place(lat,lon){if(!map)return;var ll=[lat,lon];if(!pin){pin=L.marker(ll,{draggable:true,icon:L.divIcon({className:'',html:'<div class="cob-pin"></div>',iconSize:[22,22],iconAnchor:[11,11]})}).addTo(map);pin.on('dragend',function(){var p=pin.getLatLng();consulta(p.lat,p.lng)})}else pin.setLatLng(ll);map.setView(ll,Math.max(map.getZoom(),16))}
    function show(ok){res.hidden=false;res.className='cob-res '+(ok?'ok':'no');
      res.innerHTML=ok?'<div class="k"><i></i>Cobertura</div><p class="z">Nuevo Casas Grandes y Casas Grandes, Chihuahua.</p><a class="btn btn-wa" href="'+WA+'">'+ico+'AGENDAR MI INSTALACIÓN</a>'
                      :'<div class="k"><i></i>Sujeto a cobertura.</div><a class="btn btn-wa" href="'+WA+'">'+ico+'Contáctanos</a>';}
    function consulta(lat,lon){res.hidden=false;res.className='cob-res';res.innerHTML='<div class="k"><i></i>…</div>';note.textContent='';
      var c=new AbortController(),t=setTimeout(function(){c.abort()},8000);
      fetch(API+'?lat='+lat.toFixed(5)+'&lon='+lon.toFixed(5),{signal:c.signal,cache:'no-store'}).then(function(r){clearTimeout(t);return r.json()}).then(function(j){show(!!j.cobertura)}).catch(function(){res.hidden=true;note.textContent='—'});}
    gps.addEventListener('click',function(){initMap();if(!navigator.geolocation){note.textContent='—';return}
      gps.disabled=true;var h=gps.innerHTML;gps.textContent='…';
      navigator.geolocation.getCurrentPosition(function(p){gps.disabled=false;gps.innerHTML=h;place(p.coords.latitude,p.coords.longitude);consulta(p.coords.latitude,p.coords.longitude);note.textContent='GPS ±'+Math.round(p.coords.accuracy)+' m'},
        function(){gps.disabled=false;gps.innerHTML=h;note.textContent='—'},{enableHighAccuracy:true,timeout:15000,maximumAge:0})});
    if('IntersectionObserver' in window){new IntersectionObserver(function(en,o){if(en[0].isIntersecting){initMap();o.disconnect()}},{rootMargin:'200px'}).observe(mapEl)}else initMap();
  })();

  // ── Indicador IPv6 en vivo (pie de todas las páginas) ──
  (function(){
    var el=document.getElementById('v6live');if(!el)return;var ipEl=document.getElementById('v6live-ip');
    function show(ip){el.className='v6live '+(ip?'ok':'no');ipEl.textContent=ip||'';if(ip)el.title=ip}
    var cached=null;try{cached=sessionStorage.getItem('sz-v6')}catch(e){}
    if(cached!==null){show(cached);return}
    var c=new AbortController(),t=setTimeout(function(){c.abort()},6000);
    fetch('https://v6.velocidad.sizatek.com/backend/getIP.php?cors=true',{signal:c.signal,cache:'no-store'}).then(function(r){return r.json()}).then(function(x){clearTimeout(t);var ip=((x&&x.processedString)||'').split(' - ')[0];show(ip);try{sessionStorage.setItem('sz-v6',ip)}catch(e){}}).catch(function(){show('');try{sessionStorage.setItem('sz-v6','')}catch(e){}});
  })();

  // ── Prueba de velocidad (LibreSpeed en velocidad.sizatek.com) ──
  (function(){
    var HOST='https://velocidad.sizatek.com';
    var btn=document.getElementById('stz-btn');if(!btn)return;
    var _b=document.getElementById('stz-btn'),dl=document.getElementById('stz-dl'),ul=document.getElementById('stz-ul'),pg=document.getElementById('stz-ping'),jt=document.getElementById('stz-jit'),meta=document.getElementById('stz-meta'),dlbar=document.getElementById('stz-dlbar'),ulbar=document.getElementById('stz-ulbar');
    function probe(host,el){var c=new AbortController(),t=setTimeout(function(){c.abort()},6000);
      fetch('https://'+host+'/backend/getIP.php?cors=true&isp=true',{signal:c.signal,cache:'no-store'}).then(function(r){return r.json()}).then(function(j){clearTimeout(t);var ip=(j&&j.processedString)||'';el.textContent=ip.split(' - ')[0]||'—';el.className='val ip '+(ip?'ok':'no');if(ip&&el.id==='stz-ip6')el.parentNode.classList.add('v6ok')}).catch(function(){el.textContent='—';el.className='val ip no'})}
    probe('v4.velocidad.sizatek.com',document.getElementById('stz-ip4'));probe('v6.velocidad.sizatek.com',document.getElementById('stz-ip6'));
    if(typeof Speedtest==='undefined'){btn.addEventListener('click',function(){location.href=HOST});return}
    var s=new Speedtest(),running=false,MAX=1000,ip='';
    s.setParameter('url_dl',HOST+'/backend/garbage.php');s.setParameter('url_ul',HOST+'/backend/empty.php');s.setParameter('url_ping',HOST+'/backend/empty.php');s.setParameter('url_getIp',HOST+'/backend/getIP.php');
    s.setParameter('mpot',true);s.setParameter('url_telemetry',HOST+'/results/telemetry.php');s.setParameter('telemetry_level','basic');s.setParameter('getIp_ispInfo',true);s.setParameter('getIp_ispInfo_distance','km');
    s.setParameter('test_order','IP_P_D_U');s.setParameter('time_dl_max',12);s.setParameter('time_ul_max',12);
    var LEN=264;function arc(el,v){var q=Math.min(1,(parseFloat(v)||0)/MAX);el.style.strokeDashoffset=(LEN*(1-q)).toFixed(1)}
    s.onupdate=function(d){dl.textContent=d.dlStatus||'0.00';ul.textContent=d.ulStatus||'0.00';pg.textContent=d.pingStatus||'0.00';jt.textContent=d.jitterStatus||'0.00';arc(dlbar,d.dlStatus);arc(ulbar,d.ulStatus);
      if(d.clientIp){ip=d.clientIp;meta.textContent=ip}
      if(d.testState>=4&&d.testId){meta.innerHTML=(ip?ip+' · ':'')+'<a href="'+HOST+'/results/?id='+encodeURIComponent(d.testId)+'">'+d.testId+'</a>'}};
    s.onend=function(){running=false;btn.disabled=false;btn.textContent='Prueba tu Velocidad'};
    btn.addEventListener('click',function(){if(running){s.abort();return}running=true;btn.disabled=true;btn.textContent='…';dl.textContent=ul.textContent=pg.textContent=jt.textContent='0.00';arc(dlbar,0);arc(ulbar,0);s.start()});
  })();
})();
