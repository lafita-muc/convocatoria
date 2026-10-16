// ============================================================
// NUEVAS MIRADAS — formulario de inscripción
// ============================================================
// - Construye el formulario a partir de campos.js
// - Comprueba cada campo (mensajes en el idioma elegido)
// - Guarda un borrador en este navegador mientras se rellena
// - Envía la inscripción a Firestore (colección "envios")
// ============================================================

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const CLAVE_BORRADOR = 'lafita-nm-borrador-' + CONVOCATORIA.edicion;
const $ = id => document.getElementById(id);
const form = $('form');
const tocado = {};

// ---------- Fechas ----------
function cierreTs() {
  const mes = parseInt(CONVOCATORIA.cierre.slice(5, 7), 10);
  const offset = mes >= 4 && mes <= 10 ? '+02:00' : '+01:00';   // hora de Múnich (verano / invierno)
  return Date.parse(CONVOCATORIA.cierre + 'T23:59:59' + offset);
}
const estaCerrada = () => Date.now() > cierreTs();

// ---------- Construir el formulario ----------
function esc(s) { return String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }

function htmlCampo(c) {
  const lbl = c.lbl || 'lbl_' + c.k;
  const req = c.req ? ' <span class="req" aria-hidden="true">*</span>' : '';
  const err = `<p class="field-error" id="${c.k}-err" aria-live="polite"></p>`;
  const hint = c.hint ? `<p class="hint" id="${c.k}-hint" data-i18n="hint_${c.k}"></p>` : '';
  const desc = `aria-describedby="${c.k}-err${c.hint ? ' ' + c.k + '-hint' : ''}"`;
  const cls = 'field' + (c.half ? ' half' : '');

  if (c.tipo === 'radio' || c.tipo === 'checks') {
    const type = c.tipo === 'radio' ? 'radio' : 'checkbox';
    const opts = c.opts.map(o =>
      `<label class="choice"><input type="${type}" name="${c.k}" value="${o}"><span data-i18n="${c.pre}${o}"></span></label>`
    ).join('');
    const extra = c.k === 'dirObra' ? `<div id="aviso-obra" class="alert warn hidden" data-i18n="warn_obra"></div>` : '';
    return `<fieldset class="${cls}" data-k="${c.k}" ${desc}><legend><span data-i18n="${lbl}"></span>${req}</legend>
      <div class="choices${c.stack ? ' stack' : ''}">${opts}</div>${hint}${err}${extra}</fieldset>`;
  }
  if (c.tipo === 'check') {
    return `<div class="${cls}" data-k="${c.k}"><label class="check"><input type="checkbox" id="${c.k}" name="${c.k}" ${desc}>
      <span><span data-i18n="${lbl}"></span>${req}</span></label>${err}</div>`;
  }

  const ph = c.ph ? ` data-i18n-ph="ph_${c.k}"` : '';
  const counter = c.max && (c.tipo === 'textarea') ? `<span class="counter" id="${c.k}-count"></span>` : '';
  let control;
  if (c.tipo === 'textarea') {
    control = `<textarea id="${c.k}" name="${c.k}" maxlength="${c.max}" class="${c.tall ? 'tall' : ''}"${ph} ${desc}></textarea>`;
  } else if (c.tipo === 'select') {
    const opts = c.opts.map(o => `<option value="${o}" data-i18n="${c.pre}${o}"></option>`).join('');
    control = `<select id="${c.k}" name="${c.k}" ${desc}><option value="" data-i18n="opt_choose"></option>${opts}</select>`;
  } else if (c.tipo === 'number') {
    control = `<input type="number" inputmode="numeric" id="${c.k}" name="${c.k}" min="${c.min}" max="${c.max}" step="1"${ph} ${desc}>`;
  } else {
    const auto = { dirNombre: 'name', dirEmail: 'email', dirTelefono: 'tel', dirWeb: 'url' }[c.k] || 'off';
    control = `<input type="${c.tipo}" id="${c.k}" name="${c.k}" maxlength="${c.max}" autocomplete="${auto}"${ph} ${desc}>`;
  }
  const cat = c.k === 'duracion' ? `<p class="cat-out" id="cat-out" aria-live="polite"></p>` : '';
  return `<div class="${cls}" data-k="${c.k}"><label for="${c.k}"><span data-i18n="${lbl}"></span>${req}${counter}</label>
    ${control}${cat}${hint}${err}</div>`;
}

function construir() {
  $('bloques').innerHTML = SECCIONES.map((s, i) => `
    <section class="block" id="${s.id}" aria-labelledby="${s.id}-h">
      <div class="block-title"><div class="n">${String(i + 1).padStart(2, '0')}</div>
        <h3 id="${s.id}-h" data-i18n="${s.id}"></h3><div class="green-bar"></div></div>
      <div class="fields">${s.campos.map(htmlCampo).join('')}</div>
    </section>`).join('');
}

// ---------- Leer y comprobar ----------
function valor(c) {
  if (c.tipo === 'radio') { const r = form.querySelector(`[name="${c.k}"]:checked`); return r ? r.value : ''; }
  if (c.tipo === 'checks') return [...form.querySelectorAll(`[name="${c.k}"]:checked`)].map(x => x.value);
  if (c.tipo === 'check') return $(c.k).checked;
  if (c.tipo === 'number') { const s = $(c.k).value.trim(); return s === '' ? null : Number(s); }
  return $(c.k).value.replace(/\s+$/g, '').replace(/^\s+/g, '');
}

function urlValida(s) {
  try { const u = new URL(s); return /^https?:$/.test(u.protocol) && u.hostname.includes('.'); } catch (e) { return false; }
}

function errorDe(c) {
  const v = valor(c);
  switch (c.tipo) {
    case 'radio': case 'select': return c.req && !v ? ['val_choose'] : null;
    case 'checks': return c.req && v.length === 0 ? ['val_choose'] : null;
    case 'check': return c.req && !v ? ['val_accept'] : null;
    case 'number':
      if (v === null) return c.req ? ['val_required'] : null;
      return Number.isInteger(v) && v >= c.min && v <= c.max ? null : ['val_number', { min: c.min, max: c.max }];
  }
  if (!v) return c.req ? ['val_required'] : null;
  if (c.min && v.length < c.min) return ['val_short', { min: c.min }];
  if (c.tipo === 'email' && !EMAIL_RE.test(v)) return ['val_email'];
  if (c.tipo === 'url' && !urlValida(v)) return ['val_url'];
  return null;
}

function pintarError(c, mostrar) {
  const e = errorDe(c);
  const on = !!e && mostrar;
  const box = form.querySelector(`[data-k="${c.k}"]`);
  const objetivo = (c.tipo === 'radio' || c.tipo === 'checks') ? box : $(c.k);
  objetivo.setAttribute('aria-invalid', on ? 'true' : 'false');
  if (c.tipo === 'check') box.setAttribute('aria-invalid', on ? 'true' : 'false');
  $(c.k + '-err').textContent = on ? t(e[0], e[1]) : '';
  return !e;
}

function refrescarTodo() {
  CAMPOS.forEach(c => pintarError(c, !!tocado[c.k]));
  actualizarExtras();
}

function actualizarExtras() {
  // Categoría según la duración
  const cat = categoriaDe(valor(CAMPOS.find(c => c.k === 'duracion')));
  $('cat-out').textContent = cat ? t('cat_' + cat) : '';
  // Aviso: tercer largometraje
  $('aviso-obra').classList.toggle('hidden', valor(CAMPOS.find(c => c.k === 'dirObra')) !== 'mas');
  // Contadores de caracteres
  CAMPOS.filter(c => c.tipo === 'textarea').forEach(c => {
    const n = $(c.k).value.length;
    const el = $(c.k + '-count');
    el.textContent = `${n} / ${c.max}`;
    el.classList.toggle('over', n >= c.max);
  });
  // Si ya se intentó enviar, el resumen de errores se actualiza solo
  if (!$('resumen').classList.contains('hidden')) mostrarResumen();
}

function mostrarResumen() {
  const malos = CAMPOS.filter(c => errorDe(c));
  const r = $('resumen');
  r.classList.toggle('hidden', malos.length === 0);
  r.textContent = malos.length ? t('val_summary', { n: malos.length }) : '';
  return malos;
}

// ---------- Borrador (solo en este navegador) ----------
let timerBorrador = null;
function guardarBorrador() {
  clearTimeout(timerBorrador);
  timerBorrador = setTimeout(() => {
    const d = {};
    CAMPOS.forEach(c => { d[c.k] = valor(c); });
    try { localStorage.setItem(CLAVE_BORRADOR, JSON.stringify(d)); } catch (e) {}
  }, 400);
}

function rellenar(d) {
  CAMPOS.forEach(c => {
    const v = d[c.k];
    if (v === undefined || v === null) return;
    if (c.tipo === 'radio' || c.tipo === 'checks') {
      const lista = Array.isArray(v) ? v : [v];
      form.querySelectorAll(`[name="${c.k}"]`).forEach(x => { x.checked = lista.includes(x.value); });
    } else if (c.tipo === 'check') {
      $(c.k).checked = !!v;
    } else {
      $(c.k).value = v;
    }
  });
}

function cargarBorrador() {
  let d = null;
  try { d = JSON.parse(localStorage.getItem(CLAVE_BORRADOR)); } catch (e) {}
  if (!d || !Object.values(d).some(v => v && (!Array.isArray(v) || v.length))) return;
  rellenar(d);
  $('aviso-borrador').classList.remove('hidden');
}

function borrarBorrador() {
  try { localStorage.removeItem(CLAVE_BORRADOR); } catch (e) {}
}

// ---------- Enviar ----------
function generarCodigo() {
  const abc = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';   // sin 0/O ni 1/I, para que se lea bien
  const r = crypto.getRandomValues(new Uint32Array(5));
  return 'NM' + String(CONVOCATORIA.edicion).slice(2) + '-' + [...r].map(n => abc[n % abc.length]).join('');
}

function datosParaGuardar() {
  const d = {};
  CAMPOS.forEach(c => {
    let v = valor(c);
    if (typeof v === 'string') v = v.slice(0, c.max);
    d[c.k] = v;
  });
  d.categoria = categoriaDe(d.duracion);
  return d;
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  CAMPOS.forEach(c => { tocado[c.k] = true; });
  refrescarTodo();
  const malos = mostrarResumen();
  if (malos.length) {
    const c = malos[0];
    const el = (c.tipo === 'radio' || c.tipo === 'checks') ? form.querySelector(`[name="${c.k}"]`) : $(c.k);
    form.querySelector(`[data-k="${c.k}"]`).scrollIntoView({ block: 'center' });
    el.focus({ preventScroll: true });
    return;
  }
  const r = $('resumen');
  if (estaCerrada()) { r.textContent = t('err_closed'); r.classList.remove('hidden'); return; }
  if (!FIREBASE_LISTO || !db) { r.textContent = t('notconf'); r.classList.remove('hidden'); return; }

  const btn = $('btn-enviar');
  btn.disabled = true;
  btn.textContent = t('sending');
  const datos = datosParaGuardar();
  const codigo = generarCodigo();
  try {
    await db.collection('envios').add(Object.assign(datos, {
      codigo,
      edicion: CONVOCATORIA.edicion,
      estado: 'nueva',
      idioma: LANG,
      creadoEn: firebase.firestore.FieldValue.serverTimestamp()
    }));
    borrarBorrador();
    mostrarHecho({ codigo, titulo: datos.titulo, email: datos.dirEmail });
  } catch (err) {
    r.textContent = t('err_send', { msg: err.message });
    r.classList.remove('hidden');
  } finally {
    btn.disabled = false;
    btn.textContent = t('btn_send');
  }
});

let ultimo = null;
function mostrarHecho(h) {
  ultimo = h;
  $('ok-text').innerHTML = t('ok_text', { titulo: esc(h.titulo), email: esc(h.email) });
  $('ok-code').textContent = h.codigo;
  form.classList.add('hidden');
  document.querySelector('.info').classList.add('hidden');
  $('hecho').classList.remove('hidden');
  $('hecho').scrollIntoView({ block: 'start' });
  $('hecho').focus({ preventScroll: true });
}

$('btn-otra').addEventListener('click', () => {
  // Para otra película se mantienen los datos de la dirección y el contacto
  const conservar = ['s2', 's3'];
  const d = {};
  SECCIONES.filter(s => conservar.includes(s.id)).flatMap(s => s.campos).forEach(c => { d[c.k] = valor(c); });
  form.reset();
  rellenar(d);
  CAMPOS.forEach(c => { delete tocado[c.k]; });
  $('resumen').classList.add('hidden');
  ultimo = null;
  $('hecho').classList.add('hidden');
  document.querySelector('.info').classList.remove('hidden');
  form.classList.remove('hidden');
  refrescarTodo();
  $('s1').scrollIntoView({ block: 'start' });
});

$('btn-borrar').addEventListener('click', () => {
  if (!confirm(t('draft_confirm'))) return;
  form.reset();
  borrarBorrador();
  CAMPOS.forEach(c => { delete tocado[c.k]; });
  $('aviso-borrador').classList.add('hidden');
  $('resumen').classList.add('hidden');
  refrescarTodo();
});

// ---------- Inicio ----------
construir();
initLangSwitch();
document.querySelectorAll('.contact').forEach(el => { el.hidden = !CONVOCATORIA.contacto; });

if (estaCerrada()) {
  form.classList.add('hidden');
  $('cerrada').classList.remove('hidden');
  $('cta').classList.add('hidden');
} else {
  if (!FIREBASE_LISTO) $('aviso-config').classList.remove('hidden');
  cargarBorrador();
}

form.addEventListener('input', () => { refrescarTodo(); guardarBorrador(); });
form.addEventListener('change', e => {
  if (e.target.name) tocado[e.target.name] = true;
  refrescarTodo(); guardarBorrador();
});
form.addEventListener('focusout', e => {
  const el = e.target;
  if (!el.name) return;
  // "vimeo.com/123" → "https://vimeo.com/123"
  if (el.type === 'url' && el.value.trim() && !/^https?:\/\//i.test(el.value.trim())) {
    el.value = 'https://' + el.value.trim();
    guardarBorrador();
  }
  tocado[el.name] = true;
  const c = CAMPOS.find(x => x.k === el.name);
  if (c) pintarError(c, true);
});
document.addEventListener('langchange', () => {
  refrescarTodo();
  if (ultimo) $('ok-text').innerHTML = t('ok_text', { titulo: esc(ultimo.titulo), email: esc(ultimo.email) });
});
refrescarTodo();
