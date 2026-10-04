/* Sizatek — "Elige tu uso. Mira la diferencia." (portada)

   Pestañas por uso y un simulador: cuánto tarda una tarea real con el paquete
   sugerido contra el Básico. Las velocidades vienen del HTML (data-plan,
   data-ref), que a su vez salen de los formatos simplificados inscritos ante
   el IFT. Tiempo = GB × 8000 / Mbps (1 GB = 1000 MB, 8 bits por byte).

   La carrera va acelerada: el carril lento dura ~4.5 s y el rápido lo mismo
   en proporción. El reloj de cada carril cuenta el tiempo REAL equivalente.
   Sin JS el HTML ya trae los tiempos finales; con prefers-reduced-motion no
   hay carrera, solo el resultado. */
(function () {
  'use strict';
  var raiz = document.querySelector('.lab');
  if (!raiz) return;
  var quieto = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var tabs = [].slice.call(raiz.querySelectorAll('[role="tab"]'));
  var paneles = [].slice.call(raiz.querySelectorAll('[role="tabpanel"]'));

  function fmt(t) {
    t = Math.round(t);
    if (t < 60) return t + ' s';
    if (t < 3600) {
      var m = Math.floor(t / 60), s = t % 60;
      return m < 10 ? m + ' min ' + (s < 10 ? '0' : '') + s + ' s' : m + ' min';
    }
    var h = Math.floor(t / 3600), mm = Math.floor((t % 3600) / 60);
    return h + ' h ' + (mm < 10 ? '0' : '') + mm + ' min';
  }
  function segundos(gb, mbps) { return gb * 8000 / mbps; }

  function correr(panel) {
    var plan = JSON.parse(panel.getAttribute('data-plan'));
    var ref = JSON.parse(panel.getAttribute('data-ref'));
    var chip = panel.querySelector('.lab-chip[aria-pressed="true"]');
    var gb = Number(chip.getAttribute('data-gb'));
    var dir = chip.getAttribute('data-dir');
    var va = plan[dir], vb = ref[dir];
    var ta = segundos(gb, va), tb = segundos(gb, vb);
    var A = panel.querySelector('.lab-a'), B = panel.querySelector('.lab-b');
    A.querySelector('.lab-v').textContent = va;
    B.querySelector('.lab-v').textContent = vb;
    panel.querySelector('.lab-x').textContent = (tb / ta).toFixed(1) + '×';
    // "En lo que el Básico baja 1 juego, el Gamer baja 5": cuántas caben enteras.
    var verbo = dir === 'd' ? 'baja' : 'sube';
    panel.querySelector('.lab-cabe').innerHTML = 'En lo que el ' + ref.n + ' ' + verbo + ' 1 ' +
      chip.getAttribute('data-cosa') + ', el ' + plan.n + ' ' + verbo + ' <b>' + Math.floor(tb / ta) + '</b>.';
    var carriles = [[A, ta], [B, tb]];
    if (panel._raf) cancelAnimationFrame(panel._raf);
    panel.classList.remove('lab-fin');

    if (quieto) {
      carriles.forEach(function (c) { c[0].querySelector('.lab-t').textContent = fmt(c[1]); c[0].querySelector('i').style.width = '100%'; c[0].classList.add('lab-listo'); });
      panel.classList.add('lab-fin');
      return;
    }
    var lento = Math.max(ta, tb), escala = 4500 / lento, inicio = null;
    carriles.forEach(function (c) { c[0].classList.remove('lab-listo'); c[0].querySelector('i').style.width = '0%'; c[0].querySelector('.lab-t').textContent = '0 s'; });
    function paso(ahora) {
      if (inicio === null) inicio = ahora;
      var ms = ahora - inicio, vivos = 0;
      carriles.forEach(function (c) {
        var dur = c[1] * escala, f = Math.min(ms / dur, 1);
        c[0].querySelector('i').style.width = (f * 100).toFixed(2) + '%';
        c[0].querySelector('.lab-t').textContent = fmt(c[1] * f);
        if (f < 1) vivos++; else c[0].classList.add('lab-listo');
      });
      if (vivos) panel._raf = requestAnimationFrame(paso);
      else panel.classList.add('lab-fin');
    }
    panel._raf = requestAnimationFrame(paso);
  }

  /* Corre cuando el panel se ve, no al cargar la página: si no, la carrera
     ya terminó cuando el cliente llega a la sección. */
  var visto = false;
  function activo() { return paneles.filter(function (p) { return !p.hidden; })[0]; }
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (e, o) {
      if (e[0].isIntersecting && !visto) { visto = true; correr(activo()); o.disconnect(); }
    }, { threshold: 0.35 }).observe(raiz.querySelector('.lab-panels'));
  } else { visto = true; correr(activo()); }

  function elegir(tab, foco) {
    tabs.forEach(function (t) {
      var si = t === tab;
      t.setAttribute('aria-selected', si ? 'true' : 'false');
      t.tabIndex = si ? 0 : -1;
      document.getElementById(t.getAttribute('aria-controls')).hidden = !si;
    });
    if (foco) tab.focus();
    if (visto) correr(document.getElementById(tab.getAttribute('aria-controls')));
  }
  tabs.forEach(function (t, i) {
    t.addEventListener('click', function () { elegir(t); });
    t.addEventListener('keydown', function (e) {
      var j = e.key === 'ArrowRight' ? i + 1 : e.key === 'ArrowLeft' ? i - 1 : e.key === 'Home' ? 0 : e.key === 'End' ? tabs.length - 1 : null;
      if (j === null) return;
      e.preventDefault();
      elegir(tabs[(j + tabs.length) % tabs.length], true);
    });
  });

  paneles.forEach(function (p) {
    [].slice.call(p.querySelectorAll('.lab-chip')).forEach(function (c, _, todos) {
      c.addEventListener('click', function () {
        todos.forEach(function (o) { o.setAttribute('aria-pressed', o === c ? 'true' : 'false'); });
        visto = true; correr(p);
      });
    });
    p.querySelector('.lab-replay').addEventListener('click', function () { visto = true; correr(p); });
  });
})();
