/**
 * BRACAR — Guardar cotizaciones del formulario web en Google Sheets.
 *
 * CÓMO USARLO (resumen; pasos completos en el README del sitio):
 *  1) Crea una Google Sheet nueva (será donde se guarden las cotizaciones).
 *  2) En esa hoja: menú  Extensiones → Apps Script.
 *  3) Borra lo que haya y pega TODO este archivo. Guarda (💾).
 *  4) Implementar → Nueva implementación → tipo "Aplicación web":
 *        - Ejecutar como:  Yo (tu cuenta)
 *        - Quién tiene acceso:  Cualquier usuario
 *     Copia la URL que termina en /exec.
 *  5) Pega esa URL en js/script.js, en la constante SHEETS_ENDPOINT.
 *
 * Cada envío del formulario agrega una fila. La primera vez crea los encabezados.
 */

// A dónde llega el correo de las cotizaciones (método "correo" del formulario).
var DESTINO_CORREO = 'a.mendoza@tbracar.com';

// Orden de columnas en la hoja. (Las claves coinciden con lo que envía el sitio.)
var CAMPOS = [
  ['fecha',          'Fecha/hora de envío'],
  ['metodo',         'Método'],
  ['nombres',        'Nombres'],
  ['numero',         'Número'],
  ['correo',         'Correo'],
  ['servicio',       'Servicio'],
  ['pasajeros',      'Pasajeros'],
  ['fecha_servicio', 'Fecha del servicio'],
  ['origen',         'Origen'],
  ['destino',        'Destino'],
  ['mensaje',        'Mensaje']
];

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(20000); // evita filas pisadas si llegan dos envíos a la vez

    var datos = {};
    if (e && e.postData && e.postData.contents) {
      try { datos = JSON.parse(e.postData.contents); } catch (err) { datos = {}; }
    }
    // Soporta también envíos por formulario (e.parameter) por si acaso.
    if (e && e.parameter) {
      for (var k in e.parameter) { if (!(k in datos)) datos[k] = e.parameter[k]; }
    }

    var hoja = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];

    // Encabezados la primera vez.
    if (hoja.getLastRow() === 0) {
      hoja.appendRow(CAMPOS.map(function (c) { return c[1]; }));
      hoja.getRange(1, 1, 1, CAMPOS.length).setFontWeight('bold');
      hoja.setFrozenRows(1);
    }

    var fila = CAMPOS.map(function (c) {
      var v = datos[c[0]];
      return (v === undefined || v === null) ? '' : v;
    });
    hoja.appendRow(fila);

    // Si el usuario eligió "correo", enviamos el email desde aquí (sin que el
    // visitante tenga que abrir su app de correo).
    var metodo = String(datos.metodo || '').toLowerCase();
    if (metodo === 'correo' || metodo === 'email') {
      var asunto = 'Nueva cotización web — ' + (datos.nombres || 'Sin nombre');
      var cuerpo = 'Nueva solicitud de cotización desde la web de Transportes BRACAR:\n\n' +
        CAMPOS.filter(function (c) { return c[0] !== 'metodo'; })
          .map(function (c) {
            var v = datos[c[0]];
            return c[1] + ': ' + ((v === undefined || v === null || v === '') ? '—' : v);
          }).join('\n');
      var opciones = { name: 'Web Transportes BRACAR' };
      if (datos.correo && /@/.test(datos.correo)) opciones.replyTo = datos.correo; // responder al cliente
      MailApp.sendEmail(DESTINO_CORREO, asunto, cuerpo, opciones);
    }

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

// Permite abrir la URL /exec en el navegador para comprobar que está viva.
function doGet() {
  return ContentService
    .createTextOutput('BRACAR: endpoint activo. Usa POST para guardar cotizaciones.')
    .setMimeType(ContentService.MimeType.TEXT);
}

/**
 * EJECUTA ESTA FUNCIÓN UNA VEZ (botón ▶ "Ejecutar").
 * 1) Abre la pantalla de permisos: acéptala TODA (incluye "Enviar correo
 *    electrónico como tú"). En "Google no verificó esta app":
 *    Configuración avanzada → Ir a (tu proyecto) → Permitir.
 * 2) Envía UN correo de prueba a DESTINO_CORREO para confirmar que ya funciona.
 * Tras autorizar, el formulario de la web enviará correos sin volver a desplegar.
 */
function autorizar() {
  MailApp.sendEmail(
    DESTINO_CORREO,
    'BRACAR — prueba de autorización de correo',
    'Si recibes este correo, el envío de cotizaciones desde la web ya está ' +
    'autorizado y funcionando. Puedes borrar este mensaje.'
  );
  Logger.log('Correo de prueba enviado a ' + DESTINO_CORREO);
}
