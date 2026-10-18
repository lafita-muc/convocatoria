/**
 * NUEVAS MIRADAS — recibe las inscripciones del formulario web y las guarda
 * en esta hoja de cálculo (Google Drive compartido de LAFITA).
 *
 * Instalación (una sola vez, ver README):
 *   1. Abrir la hoja "Nuevas Miradas 2027 – Inscripciones" → Extensiones → Apps Script.
 *   2. Pegar este archivo entero en Code.gs y guardar.
 *   3. Ejecutar la función "configurar" (▶). Google pide permisos: aceptar.
 *   4. Implementar → Nueva implementación → Tipo: Aplicación web
 *        Ejecutar como: Yo · Quién tiene acceso: Cualquier usuario
 *   5. Copiar la URL (termina en /exec) y pegarla en config.js → urlEnvio.
 *
 * Si cambias este código, haz Implementar → Gestionar implementaciones →
 * editar (lápiz) → Versión: Nueva versión. Así la URL no cambia.
 */

// ------------------------------------------------------------
// Ajustes
// ------------------------------------------------------------
var AJUSTES = {
  edicion: 2027,
  cierre: '2027-06-30T23:59:59+02:00',   // fecha y hora límite (hora de Múnich)
  hoja: 'Inscripciones',                 // nombre de la pestaña
  avisarA: '',                           // correo(s) del equipo para avisar de cada inscripción, separados por coma
  confirmar: true                        // enviar un correo de confirmación a quien inscribe
};

// Columnas de la hoja: [dato, título de la columna]. El orden es el de la hoja.
var COLUMNAS = [
  ['creadoEn', 'Recibida'],
  ['codigo', 'Número'],
  ['estado', 'Estado'],
  ['notas', 'Notas del comité'],
  ['categoria', 'Categoría'],
  ['titulo', 'Título original'],
  ['tituloEn', 'Título internacional'],
  ['anio', 'Año'],
  ['duracion', 'Duración (min)'],
  ['tipo', 'Formato'],
  ['paises', 'Países'],
  ['idiomas', 'Idiomas'],
  ['subtitulos', 'Subtítulos'],
  ['sinopsisCorta', 'Logline'],
  ['sinopsis', 'Sinopsis'],
  ['relacionLatam', 'Vínculo con América Latina'],
  ['estreno', 'Estreno'],
  ['festivales', 'Festivales y premios'],
  ['formato', 'Formato de proyección'],
  ['dirNombre', 'Dirección'],
  ['dirPronombres', 'Pronombres'],
  ['dirNacimiento', 'Año de nacimiento'],
  ['dirEmail', 'Email'],
  ['dirTelefono', 'Teléfono'],
  ['dirNacionalidad', 'Nacionalidad'],
  ['dirOrigen', 'Origen latinoamericano'],
  ['dirCiudad', 'Ciudad en Alemania'],
  ['dirDesde', 'En Alemania desde'],
  ['dirObra', 'Obra'],
  ['dirEscuela', 'Escuela de cine'],
  ['dirBio', 'Biografía'],
  ['dirFilmografia', 'Filmografía'],
  ['dirWeb', 'Web / Instagram'],
  ['productora', 'Productora / escuela'],
  ['contNombre', 'Contacto'],
  ['contRol', 'Función del contacto'],
  ['contEmail', 'Email del contacto'],
  ['screener', 'Enlace de visionado'],
  ['screenerPass', 'Contraseña'],
  ['trailer', 'Tráiler'],
  ['stills', 'Fotos / póster'],
  ['presskit', 'Dossier de prensa'],
  ['asistencia', 'Puede venir a Múnich'],
  ['comoSupiste', 'Cómo se enteró'],
  ['comentarios', 'Comentarios'],
  ['aceptaciones', 'Aceptó derechos, bases y datos'],
  ['idioma', 'Idioma del formulario']
];

var ESTADOS = ['Nueva', 'En visionado', 'Preselección', 'Seleccionada', 'Descartada'];

var OBLIGATORIOS = ['titulo', 'anio', 'duracion', 'tipo', 'paises', 'idiomas', 'subtitulos',
  'sinopsisCorta', 'sinopsis', 'relacionLatam', 'estreno', 'formato', 'dirNombre', 'dirEmail',
  'dirNacionalidad', 'dirCiudad', 'dirDesde', 'dirObra', 'dirBio', 'screener', 'asistencia'];

// ------------------------------------------------------------
// Recibir una inscripción (POST desde la web)
// ------------------------------------------------------------
function doPost(e) {
  try {
    var d = JSON.parse((e && e.postData && e.postData.contents) || '{}');

    if (d.website) return responder({ ok: true, codigo: 'NM00-00000' });   // trampa para robots
    if (new Date() > new Date(AJUSTES.cierre)) return responder({ ok: false, error: 'closed' });

    var faltan = OBLIGATORIOS.filter(function (k) {
      var v = d[k];
      return v === undefined || v === null || v === '' || (Array.isArray(v) && v.length === 0);
    });
    if (faltan.length) return responder({ ok: false, error: 'missing: ' + faltan.join(', ') });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(d.dirEmail))) return responder({ ok: false, error: 'email' });
    if (!/^https?:\/\/\S+\.\S+/i.test(String(d.screener))) return responder({ ok: false, error: 'screener' });
    if (!(d.chkDerechos === true && d.chkBases === true && d.chkPrivacidad === true)) {
      return responder({ ok: false, error: 'consent' });
    }

    var lock = LockService.getScriptLock();
    lock.waitLock(20000);
    try {
      var hoja = obtenerHoja();
      var codigo = nuevoCodigo(hoja);
      d.codigo = codigo;
      d.creadoEn = new Date();
      d.estado = ESTADOS[0];
      d.notas = '';
      d.aceptaciones = 'sí';
      if (Array.isArray(d.subtitulos)) d.subtitulos = d.subtitulos.join(', ');
      hoja.appendRow(COLUMNAS.map(function (c) { return limpiar(d[c[0]]); }));
    } finally {
      lock.releaseLock();
    }

    avisar(d);
    return responder({ ok: true, codigo: codigo });
  } catch (err) {
    return responder({ ok: false, error: String(err && err.message || err) });
  }
}

// Para comprobar que la URL funciona: abrirla en el navegador
function doGet() {
  return responder({ ok: true, servicio: 'Nuevas Miradas ' + AJUSTES.edicion });
}

function responder(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

// Texto seguro para una celda: sin fórmulas, con un largo razonable
function limpiar(v) {
  if (v === undefined || v === null) return '';
  if (v instanceof Date || typeof v === 'number') return v;
  var s = String(v).slice(0, 5000);
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}

function nuevoCodigo(hoja) {
  var abc = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  var col = COLUMNAS.map(function (c) { return c[0]; }).indexOf('codigo') + 1;
  var n = hoja.getLastRow();
  var usados = n > 1 ? hoja.getRange(2, col, n - 1, 1).getValues().map(function (r) { return r[0]; }) : [];
  var codigo;
  do {
    codigo = 'NM' + String(AJUSTES.edicion).slice(2) + '-';
    for (var i = 0; i < 5; i++) codigo += abc.charAt(Math.floor(Math.random() * abc.length));
  } while (usados.indexOf(codigo) !== -1);
  return codigo;
}

// ------------------------------------------------------------
// Correos
// ------------------------------------------------------------
var CONFIRMACION = {
  de: ['Nuevas Miradas – Einreichung erhalten ({codigo})',
       'Hallo {nombre},\n\nwir haben deine Einreichung „{titulo}“ für Nuevas Miradas (LAFITA {edicion}) erhalten.\n\nEingangsnummer: {codigo}\n\nBitte halte den Sichtungslink bis Ende November {edicion} online. Wir melden uns bis Ende September {edicion}.\n\nHerzliche Grüße\nLAFITA – Lateinamerikanische Filmtage München'],
  es: ['Nuevas Miradas – Inscripción recibida ({codigo})',
       'Hola {nombre}:\n\nHemos recibido tu inscripción «{titulo}» para Nuevas Miradas (LAFITA {edicion}).\n\nNúmero de inscripción: {codigo}\n\nMantén el enlace de visionado activo hasta finales de noviembre de {edicion}. Te escribiremos antes de finales de septiembre de {edicion}.\n\nUn saludo,\nLAFITA – Festival de Cine Latinoamericano de Múnich'],
  en: ['Nuevas Miradas – Submission received ({codigo})',
       'Hello {nombre},\n\nWe have received your submission “{titulo}” for Nuevas Miradas (LAFITA {edicion}).\n\nSubmission number: {codigo}\n\nPlease keep the screener link online until the end of November {edicion}. We will get back to you by the end of September {edicion}.\n\nBest wishes,\nLAFITA – Latin American Film Festival Munich'],
  pt: ['Nuevas Miradas – Inscrição recebida ({codigo})',
       'Olá {nombre},\n\nRecebemos sua inscrição “{titulo}” para o Nuevas Miradas (LAFITA {edicion}).\n\nNúmero de inscrição: {codigo}\n\nMantenha o link de visualização ativo até o fim de novembro de {edicion}. Responderemos até o fim de setembro de {edicion}.\n\nAbraços,\nLAFITA – Festival de Cinema Latino-Americano de Munique']
};

function rellenar(s, d) {
  return s.replace(/\{(\w+)\}/g, function (_, k) {
    return k === 'edicion' ? AJUSTES.edicion : k === 'nombre' ? String(d.dirNombre || '') : String(d[k] || '');
  });
}

function avisar(d) {
  try {
    if (AJUSTES.confirmar) {
      var tpl = CONFIRMACION[d.idioma] || CONFIRMACION.de;
      MailApp.sendEmail({ to: d.dirEmail, subject: rellenar(tpl[0], d), body: rellenar(tpl[1], d), name: 'LAFITA · Nuevas Miradas' });
    }
    if (AJUSTES.avisarA) {
      MailApp.sendEmail({
        to: AJUSTES.avisarA,
        subject: 'Nueva inscripción ' + d.codigo + ': ' + d.titulo,
        body: d.titulo + ' (' + d.duracion + ' min, ' + d.categoria + ')\n' + d.dirNombre + ' · ' + d.dirCiudad +
              '\n' + d.screener + '\n\n' + SpreadsheetApp.getActiveSpreadsheet().getUrl(),
        name: 'LAFITA · Nuevas Miradas'
      });
    }
  } catch (err) {
    console.error('No se pudo enviar el correo: ' + err);   // la inscripción ya está guardada
  }
}

// ------------------------------------------------------------
// Preparar la hoja (ejecutar una vez a mano: ▶ configurar)
// ------------------------------------------------------------
function obtenerHoja() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var hoja = ss.getSheetByName(AJUSTES.hoja) || ss.getSheets()[0];
  if (hoja.getName() !== AJUSTES.hoja) hoja.setName(AJUSTES.hoja);
  if (hoja.getLastRow() === 0 || hoja.getRange(1, 1).getValue() !== COLUMNAS[0][1]) {
    hoja.getRange(1, 1, 1, COLUMNAS.length).setValues([COLUMNAS.map(function (c) { return c[1]; })]);
  }
  return hoja;
}

function configurar() {
  var hoja = obtenerHoja();
  var n = COLUMNAS.length;
  var cab = hoja.getRange(1, 1, 1, n);
  cab.setValues([COLUMNAS.map(function (c) { return c[1]; })])
     .setFontWeight('bold').setBackground('#111111').setFontColor('#ffffff').setWrap(true);
  hoja.setFrozenRows(1);
  hoja.setFrozenColumns(2);

  var col = function (k) { return COLUMNAS.map(function (c) { return c[0]; }).indexOf(k) + 1; };
  var filas = hoja.getMaxRows() - 1;

  // Estado: lista desplegable con colores
  var rEstado = hoja.getRange(2, col('estado'), filas, 1);
  rEstado.setDataValidation(SpreadsheetApp.newDataValidation().requireValueInList(ESTADOS, true).setAllowInvalid(false).build());
  var colores = { 'Nueva': '#e6f4f7', 'En visionado': '#fff6e0', 'Preselección': '#d0e9f0', 'Seleccionada': '#eaf4ee', 'Descartada': '#fbeae9' };
  hoja.setConditionalFormatRules(ESTADOS.map(function (e) {
    return SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo(e).setBackground(colores[e]).setRanges([rEstado]).build();
  }));

  hoja.getRange(2, col('creadoEn'), filas, 1).setNumberFormat('dd.mm.yyyy hh:mm');
  hoja.setColumnWidths(1, n, 140);
  ['titulo', 'sinopsisCorta', 'relacionLatam', 'notas', 'screener'].forEach(function (k) { hoja.setColumnWidth(col(k), 240); });
  hoja.setColumnWidth(col('sinopsis'), 360);
  hoja.getRange(2, 1, filas, n).setVerticalAlignment('top');

  // Proteger la cabecera para que nadie la cambie sin querer (la web escribe por posición)
  var p = cab.protect().setDescription('Cabecera – no cambiar el orden de las columnas');
  p.setWarningOnly(true);

  SpreadsheetApp.getActiveSpreadsheet().toast('Hoja lista. Ahora: Implementar → Nueva implementación → Aplicación web.');
}
