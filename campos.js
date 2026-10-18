// ============================================================
// NUEVAS MIRADAS — campos del formulario
// ============================================================
// El formulario (index.html) y la comprobación se construyen a partir de esta lista.
//
// Cada campo:
//   k      nombre del dato (en la base de datos y en el CSV)
//   tipo   text · email · url · tel · number · textarea · select · radio · checks · check
//   req    obligatorio
//   max    caracteres máximos (texto) o número máximo
//   min    número mínimo / caracteres mínimos
//   half   ocupa media fila
//   opts   opciones (select, radio, checks); el texto es t(pre + opción)
//   ph     tiene placeholder (texto en i18n: 'ph_' + k)
//   hint   tiene ayuda debajo (texto en i18n: 'hint_' + k)
//   lbl    clave del texto de la etiqueta (por defecto 'lbl_' + k)
//
// Si añades, quitas o cambias un campo, actualiza también COLUMNAS (y
// OBLIGATORIOS) en apps-script/Code.gs, la cabecera de la hoja y los textos en i18n.js.
// ============================================================

const ANIO_MIN = parseInt(CONVOCATORIA.terminadoDesde.slice(0, 4), 10);
const ED = CONVOCATORIA.edicion;

const SECCIONES = [
  {
    id: 's1',
    campos: [
      { k: 'titulo', tipo: 'text', req: true, max: 200, half: true },
      { k: 'tituloEn', tipo: 'text', max: 200, half: true },
      { k: 'anio', tipo: 'number', req: true, min: ANIO_MIN, max: ED, half: true },
      { k: 'duracion', tipo: 'number', req: true, min: 1, max: 600, half: true },
      { k: 'tipo', tipo: 'radio', req: true, pre: 'tipo_', opts: ['ficcion', 'documental', 'animacion', 'experimental', 'hibrido'] },
      { k: 'paises', tipo: 'text', req: true, max: 200, half: true, ph: true },
      { k: 'idiomas', tipo: 'text', req: true, max: 200, half: true, ph: true },
      { k: 'subtitulos', tipo: 'checks', req: true, pre: 'sub_', opts: ['de', 'en', 'es', 'otros', 'no'], hint: true },
      { k: 'sinopsisCorta', tipo: 'textarea', req: true, min: 20, max: 300, hint: true },
      { k: 'sinopsis', tipo: 'textarea', req: true, min: 100, max: 1500, tall: true },
      { k: 'relacionLatam', tipo: 'textarea', req: true, min: 20, max: 800, hint: true },
      { k: 'estreno', tipo: 'select', req: true, pre: 'est_', opts: ['mundial', 'internacional', 'alemania', 'muenchen', 'ya'], hint: true },
      { k: 'festivales', tipo: 'textarea', max: 1000, ph: true },
      { k: 'formato', tipo: 'select', req: true, pre: 'fmt_', opts: ['dcp', 'prores', 'h264', 'otro'], half: true }
    ]
  },
  {
    id: 's2',
    campos: [
      { k: 'dirNombre', tipo: 'text', req: true, min: 2, max: 200, hint: true },
      { k: 'dirPronombres', tipo: 'text', max: 60, half: true, ph: true },
      { k: 'dirNacimiento', tipo: 'number', min: 1940, max: ED - 14, half: true },
      { k: 'dirEmail', tipo: 'email', req: true, max: 160, half: true },
      { k: 'dirTelefono', tipo: 'tel', max: 40, half: true },
      { k: 'dirNacionalidad', tipo: 'text', req: true, max: 120, half: true },
      { k: 'dirOrigen', tipo: 'text', max: 200, half: true, ph: true },
      { k: 'dirCiudad', tipo: 'text', req: true, max: 120, half: true, ph: true },
      { k: 'dirDesde', tipo: 'number', req: true, min: 1950, max: ED, half: true },
      { k: 'dirObra', tipo: 'radio', req: true, pre: 'obra_', opts: ['corto', 'debut', 'segunda', 'mas'], stack: true },
      { k: 'dirEscuela', tipo: 'text', max: 200, ph: true },
      { k: 'dirBio', tipo: 'textarea', req: true, min: 50, max: 800 },
      { k: 'dirFilmografia', tipo: 'textarea', max: 1500, ph: true },
      { k: 'dirWeb', tipo: 'url', max: 300 }
    ]
  },
  {
    id: 's3',
    campos: [
      { k: 'productora', tipo: 'text', max: 200 },
      { k: 'contNombre', tipo: 'text', max: 200, half: true },
      { k: 'contRol', tipo: 'text', max: 100, half: true, ph: true },
      { k: 'contEmail', tipo: 'email', max: 160 }
    ]
  },
  {
    id: 's4',
    campos: [
      { k: 'screener', tipo: 'url', req: true, max: 500, ph: true, hint: true },
      { k: 'screenerPass', tipo: 'text', max: 100, half: true },
      { k: 'trailer', tipo: 'url', max: 500, half: true },
      { k: 'stills', tipo: 'url', max: 500, half: true },
      { k: 'presskit', tipo: 'url', max: 500, half: true }
    ]
  },
  {
    id: 's5',
    campos: [
      { k: 'asistencia', tipo: 'radio', req: true, pre: 'asis_', opts: ['si', 'quizas', 'no'] },
      { k: 'comoSupiste', tipo: 'text', max: 200 },
      { k: 'comentarios', tipo: 'textarea', max: 1000 },
      { k: 'chkDerechos', tipo: 'check', req: true, lbl: 'chk_derechos' },
      { k: 'chkBases', tipo: 'check', req: true, lbl: 'chk_bases' },
      { k: 'chkPrivacidad', tipo: 'check', req: true, lbl: 'chk_privacidad' }
    ]
  }
];

const CAMPOS = SECCIONES.flatMap(s => s.campos);

// Categoría según la duración
function categoriaDe(min) {
  if (!(min >= 1)) return '';
  return min <= 30 ? 'corto' : min <= 60 ? 'medio' : 'largo';
}

