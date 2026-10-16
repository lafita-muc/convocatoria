// ============================================================
// NUEVAS MIRADAS — ajustes de la convocatoria
// ============================================================
// Cada año (la sección se celebra cada noviembre) basta con cambiar
// estos datos. Si cambias "cierre", cambia también la fecha en
// firestore.rules (allow create: if request.time < ...) y vuelve a
// publicar las reglas en Firebase.
// ============================================================

const CONVOCATORIA = {
  edicion: 2027,               // año del festival
  cierre: '2027-06-30',        // último día para enviar (hasta las 23:59, hora de Múnich)
  aviso: '2027-09-30',         // hasta cuándo respondemos a todas las personas
  terminadoDesde: '2026-01-01',// las películas tienen que estar terminadas después de esta fecha
  copiaHasta: '2027-11-01',    // fecha límite para la copia de proyección (películas seleccionadas)
  maxPorPersona: 2,            // películas como máximo por persona (dirección)
  contacto: ''                 // correo de contacto de la sección, p. ej. 'nuevasmiradas@lafita.de'
                               // (si está vacío, no se muestra)
};
