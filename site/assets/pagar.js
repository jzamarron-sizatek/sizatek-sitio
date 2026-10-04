/* Sizatek — /pagar/ : copiar la CLABE y la cuenta sin equivocarse.

   AQUÍ VIVÍA EL ARMADOR DE LIGAS DE PASARELA, y se quitó junto con el campo
   de "tu número de cliente" de la página. La razón no es técnica:

   el portal de tapipay enseña NOMBRE Y ADEUDO a quien sepa un número de
   cliente. Mientras el campo estuvo aquí, cualquiera podía probar 1, 2, 3… y
   leer la deuda de los clientes de Sizatek desde la propia página de Sizatek.
   Que el portal de tapipay esté abierto de todos modos no nos absuelve: los
   datos son responsabilidad de Sizatek, y una forma con nuestra marca es
   nuestra puerta.

   Hoy la página manda al bot de WhatsApp, que ya identifica al cliente por su
   teléfono registrado antes de darle nada. El campo vuelve cuando exista la
   autenticación por código, detrás de ella — ver
   claude/pago-en-linea-autenticado.md. El código viejo está en el historial de
   git; no hace falta dejarlo aquí apagado. */

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
