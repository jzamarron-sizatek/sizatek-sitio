/* Sizatek — /pagar/ : arma la liga del portal de la pasarela con el número de
   cliente que escribe el visitante.

   LO QUE ESTE ARCHIVO NO HACE, Y ES A PROPÓSITO:
   no pide, no guarda y no manda datos de tarjeta. Lo único que toca es el
   número de cliente, y nada más para pegarlo al final de una URL. El cobro
   ocurre en el sitio de la pasarela.

   POR QUÉ SE VALIDA EL NÚMERO:
   es texto que escribe un desconocido y termina dentro de una URL. Si se
   dejara pasar cualquier cosa, alguien podría escribir "../otra-cosa" y mandar
   al cliente a una página que no es la suya. Por eso sólo se aceptan dígitos
   y además se escapa con encodeURIComponent. Las dos cosas: la primera para
   que el usuario sepa que se equivocó, la segunda porque nunca se confía en
   que la primera esté bien escrita.

   Y por qué no se abre en pestaña nueva: el cliente viene a pagar. Mandarlo a
   otra pestaña deja la de atrás abierta y, cuando regresa, no sabe cuál es la
   buena. */
(function () {
  'use strict';

  var formas = document.querySelectorAll('.pagar .idform');
  if (!formas.length) return;

  formas.forEach(function (f) {
    var campo = f.querySelector('input[name=id]');
    var error = f.querySelector('.err');

    function avisa(texto) {
      error.textContent = texto;
      error.hidden = !texto;
      if (texto) campo.focus();
    }

    campo.addEventListener('input', function () { avisa(''); });

    f.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var base = f.dataset.base || '';
      // Sin liga configurada no se manda a nadie a ningún lado.
      if (!base) { avisa('Esta forma de pago todavía no está disponible.'); return; }

      var id = (campo.value || '').trim();
      if (!id) { avisa('Escribe tu número de cliente.'); return; }
      if (!/^[0-9]{1,12}$/.test(id)) {
        avisa('El número de cliente son sólo dígitos. Lo encuentras en tu recibo.');
        return;
      }

      var destino = base.replace(/\/+$/, '') + '/' + encodeURIComponent(id);
      location.href = destino;
    });
  });
})();

/* Copiar la CLABE y la cuenta.

   Una CLABE son 18 dígitos. Copiada a mano, un dígito cambiado manda el dinero
   a la cuenta de otra persona y el cliente se queda sin servicio y sin dinero.
   Por eso el botón, y por eso hay respaldo: si el navegador no deja usar el
   portapapeles moderno —pasa en http, en navegadores viejos y dentro de algunos
   webviews—, se selecciona el texto para que el usuario copie con sus dedos.
   Un botón que falla en silencio es peor que no tenerlo. */
(function () {
  'use strict';

  var botones = document.querySelectorAll('.copiar');
  if (!botones.length) return;

  function seleccionar(nodo) {
    try {
      var r = document.createRange();
      r.selectNodeContents(nodo);
      var sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(r);
    } catch (e) { /* ni modo: el dato sigue visible para copiarlo a mano */ }
  }

  botones.forEach(function (b) {
    var original = b.textContent;
    var dato = b.dataset.copiar || '';
    var texto = b.parentElement.querySelector('.dato');

    function avisa(msg, ok) {
      b.textContent = msg;
      b.classList.toggle('listo', !!ok);
      setTimeout(function () { b.textContent = original; b.classList.remove('listo'); }, 2200);
    }

    b.addEventListener('click', function () {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(dato).then(
          function () { avisa('Copiado', true); },
          function () { if (texto) seleccionar(texto); avisa('Selecciónalo', false); }
        );
      } else {
        if (texto) seleccionar(texto);
        avisa('Selecciónalo', false);
      }
    });
  });
})();
