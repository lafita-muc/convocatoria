// ============================================================
// NUEVAS MIRADAS — ajustes de la convocatoria
// ============================================================
// Cada año (la sección se celebra cada noviembre) basta con cambiar
// estos datos. Si cambias "cierre" o "edicion", cambia también AJUSTES
// en apps-script/Code.gs (el script de la hoja de Google).
// ============================================================

const CONVOCATORIA = {
  edicion: 2027,               // año del festival
  cierre: '2027-06-30',        // último día para enviar (hasta las 23:59, hora de Múnich)
  aviso: '2027-09-30',         // hasta cuándo respondemos a todas las personas
  terminadoDesde: '2026-01-01',// las películas tienen que estar terminadas después de esta fecha
  copiaHasta: '2027-11-01',    // fecha límite para la copia de proyección (películas seleccionadas)
  maxPorPersona: 2,            // películas como máximo por persona (dirección)
  contacto: '',                // correo de contacto de la sección, p. ej. 'nuevasmiradas@lafita.de'
                               // (si está vacío, no se muestra)

  // Dirección del script de Google (Apps Script) que guarda las inscripciones
  // en la hoja "Nuevas Miradas 2027 – Inscripciones" del Drive de LAFITA.
  // Termina en /exec. Mientras esté vacío, el formulario se puede probar pero no guarda nada.
  urlEnvio: ''
};
