/* Sizatek · Estado de servicios: pinta lo que publica el sondeador del NAS
   (velocidad.sizatek.com/api/estado). Sin datos no inventa nada. */
(function(){
  var API='https://velocidad.sizatek.com/api/estado';
  var top=document.getElementById('estTop'),tit=document.getElementById('estTitulo'),hora=document.getElementById('estHora'),grid=document.getElementById('estGrid');
  if(!grid)return;
  var TXT={ok:'Accesible',degradado:'Con fallas',falla:'Sin respuesta',mantenimiento:'En mantenimiento',desconocido:'Sin datos'};
  var GEN={ok:'Todos los servicios accesibles desde la red de Sizatek',degradado:'Algunos servicios presentan fallas',falla:'Algunos servicios no responden',mantenimiento:'Hay servicios en mantenimiento',desconocido:'Sin datos por el momento'};
  function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
  function fecha(iso){if(!iso)return'';var d=new Date(iso);if(isNaN(d))return'';return d.toLocaleTimeString('es-MX',{hour:'2-digit',minute:'2-digit',second:'2-digit'})}
  function desde(iso){if(!iso)return'';var m=Math.round((Date.now()-new Date(iso))/60000);if(!(m>=2))return'';if(m<60)return'desde hace '+m+' min';var h=Math.floor(m/60);if(h<48)return'desde hace '+h+' h';return'desde hace '+Math.floor(h/24)+' días'}
  function svc(s){
    var e=s.estado||'desconocido',ext=[];
    if(s.oficial&&s.oficial.estado&&s.oficial.estado!=='ok'&&s.oficial.estado!=='desconocido'){ext.push('<em class="est-of">Reporte oficial: '+esc(s.oficial.detalle||TXT[s.oficial.estado]||'')+'</em>')}
    else if(e!=='ok'&&e!=='desconocido'&&s.desde){var d=desde(s.desde);if(d)ext.push('<em>'+d+'</em>')}
    if(s.ms!=null&&e==='ok')ext.push('<em>'+s.ms+' ms</em>');
    if(typeof s.disponibilidad_24h==='number'&&s.disponibilidad_24h<100)ext.push('<em>Disponibilidad 24 h: '+s.disponibilidad_24h.toFixed(1).replace('.',',')+' %</em>');
    var nom=s.pagina?'<a href="'+esc(s.pagina)+'" target="_blank" rel="noopener">'+esc(s.nombre)+'</a>':esc(s.nombre);
    return'<li class="est-svc '+e+'"><i></i><div class="est-nom">'+nom+(ext.length?'<div class="est-ext">'+ext.join('')+'</div>':'')+'</div><b>'+TXT[e]+'</b></li>';
  }
  function pinta(d){
    var g=d.estado||'desconocido';
    top.className='est-top '+g;tit.textContent=GEN[g]||GEN.desconocido;
    hora.textContent=d.actualizado?'Última revisión: '+fecha(d.actualizado):'';
    // Dos columnas repartidas por número de renglones para que no queden
    // huecos (la Red Sizatek es corta y Juegos es larga): la primera tarjeta
    // siempre va a la izquierda, las demás a la columna más corta.
    var gs=(d.grupos||[]).map(function(gr){
      var e=gr.estado||'desconocido';
      return{n:(gr.servicios||[]).length+2,html:'<section class="est-card"><header><h3>'+esc(gr.nombre)+'</h3><span class="est-badge '+e+'"><i></i>'+TXT[e]+'</span></header><ul>'+(gr.servicios||[]).map(svc).join('')+'</ul></section>'};
    });
    // Se prueban todos los repartos (la primera tarjeta fija a la izquierda) y
    // se queda el que deja las dos columnas más parejas.
    var mejor=null,total=gs.reduce(function(a,g){return a+g.n},0);
    for(var m=0;m<(1<<gs.length);m+=2){
      var izq=0;gs.forEach(function(g,i){if(!(m&(1<<i)))izq+=g.n});
      var dif=Math.abs(total-2*izq);
      if(mejor===null||dif<mejor.dif)mejor={dif:dif,m:m};
    }
    var cols=[[],[]];gs.forEach(function(g,i){cols[(mejor.m&(1<<i))?1:0].push(g.html)});
    grid.innerHTML='<div class="est-col">'+cols[0].join('')+'</div><div class="est-col">'+cols[1].join('')+'</div>';
  }
  function falla(){top.className='est-top desconocido';tit.textContent='No se pudo consultar el estado en este momento.';hora.textContent='';}
  function carga(){
    var ctl=new AbortController(),t=setTimeout(function(){ctl.abort()},9000);
    fetch(API,{signal:ctl.signal,cache:'no-store'}).then(function(r){if(!r.ok)throw 0;return r.json()}).then(function(d){clearTimeout(t);pinta(d)}).catch(function(){clearTimeout(t);if(!grid.children.length)falla()});
  }
  carga();
  setInterval(function(){if(!document.hidden)carga()},30000);
  document.addEventListener('visibilitychange',function(){if(!document.hidden)carga()});
})();
