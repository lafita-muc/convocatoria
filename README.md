# LAFITA · Nuevas Miradas — Convocatoria

Web de inscripción de películas para **Nuevas Miradas**, la nueva sección de **LAFITA – Lateinamerikanische Filmtage München** para **jóvenes cineastas que viven en Alemania** y tienen un vínculo con América Latina.

Primera edición: **noviembre 2027** (LAFITA se celebra cada noviembre). Disponible en **alemán, español, inglés y portugués**, con el mismo estilo que [lafita.de](https://lafita.de) y la web de Tickets (blanco y negro, verde como acento, Oswald + Barlow).

> El nombre *Nuevas Miradas*, las fechas y las bases son una **propuesta** para que el equipo la revise. Todo se cambia en `config.js` (fechas) e `i18n.js` (textos).

## Qué hace

- **Portada:** presentación de la sección, datos clave (fecha límite, festival, gratis, respuesta), quién puede participar y cómo funciona.
- **Formulario en 5 bloques**, inspirado en las convocatorias de otros festivales (Max Ophüls Preis, Berlinale, Filmfest München, Cinélatino…):
  1. **La película:** título, año, duración (calcula sola la categoría: corto / medio / largo), formato, países, idiomas, subtítulos, logline, sinopsis, **vínculo con América Latina**, estatus de estreno, festivales, formato de proyección.
  2. **Dirección:** nombre, pronombres, contacto, nacionalidad, origen latinoamericano, **ciudad en Alemania y desde cuándo**, si es corto / ópera prima / segunda película (avisa si es un tercer largo), escuela de cine, biografía, filmografía.
  3. **Producción y contacto** (opcional).
  4. **Material de visionado:** enlace online (Vimeo, etc.) y contraseña, tráiler, fotos, dossier. **No se suben archivos.**
  5. **Para terminar:** si puede venir a Múnich en noviembre, cómo se enteró, y las tres casillas obligatorias (derechos, bases, datos).
- **Comprobación** de cada campo con mensajes en el idioma elegido, contador de caracteres y resumen de errores.
- **Borrador automático:** lo que se escribe se guarda en el navegador; si la persona cierra la página, al volver sigue ahí.
- **Confirmación** con un **número de inscripción** (ej. `NM27-K7QXP`) en pantalla y **por correo** (en el idioma de la persona). Para inscribir otra película se mantienen los datos de la dirección.
- **Cierre automático:** después de la fecha límite el formulario se cierra solo (en la web y en el script).
- **Bases** (`bases.html`): 12 puntos en los 4 idiomas.
- **Todo llega a una hoja de Google** en el Drive compartido de LAFITA (`LAFITA / Convocatoria / Nuevas Miradas 2027 – Inscripciones`): una fila por película, con columna **Estado** desplegable (Nueva → En visionado → Preselección → Seleccionada / Descartada, con colores), **Notas del comité** y el **enlace de visionado**. El comité trabaja directamente en la hoja (filtrar, ordenar, comentar, descargar a Excel). Opcional: un correo al equipo por cada inscripción nueva.

## Bases propuestas (resumen)

| | |
|---|---|
| Quién | Dirección con residencia principal en Alemania (cualquier nacionalidad) |
| Talentos jóvenes | Cortos y mediometrajes sin restricción; largometrajes: 1.ª o 2.ª película. Sin límite de edad |
| Vínculo | Raíces latinoamericanas de quien dirige **o** película sobre América Latina / su diáspora / vida latinoamericana en Alemania |
| Películas | Terminadas después del 01.01.2026. Ficción, documental, animación, experimental |
| Idioma | Cualquiera; visionado con subtítulos en alemán o inglés |
| Inscripción | Gratis, solo online, hasta el **30.06.2027**; máx. 2 películas por persona |
| Respuesta | A todas las personas antes del **30.09.2027** |
| Copia de proyección | Antes del **01.11.2027** |

## Poner la web en marcha

Las películas no se guardan: la gente deja un **enlace** (Vimeo, etc.). Por eso basta con una hoja de Google como "base de datos", conectada con un pequeño script de Google (Apps Script). Gratis y sin servidores.

1. **GitHub Pages:** Settings → Pages → *Deploy from a branch* → `main` / `(root)`. La web queda en `https://lafita-muc.github.io/convocatoria/`.
2. **Conectar la hoja** (10 minutos, una sola vez):
   1. Abrir el editor de Apps Script: desde la hoja **Nuevas Miradas 2027 – Inscripciones** (Drive → LAFITA → Convocatoria) → menú **Extensiones → Apps Script**, o (más fácil desde el **móvil**: Safari en modo *sitio de escritorio*) en [script.google.com](https://script.google.com) → **Nuevo proyecto**. El script encuentra la hoja por su ID (`AJUSTES.hojaId`).
   2. Borrar lo que haya en `Code.gs`, pegar el contenido de [`apps-script/Code.gs`](apps-script/Code.gs) y guardar (💾).
   3. Arriba, elegir la función **configurar** y pulsar **▶ Ejecutar**. Google pide permisos ("Google no ha verificado esta app" → *Configuración avanzada* → *Ir a…* → *Permitir*). Es normal: el script es vuestro.
   4. **Implementar → Nueva implementación** → tipo **Aplicación web** → *Ejecutar como:* **Yo** · *Quién tiene acceso:* **Cualquier usuario** → Implementar.
   5. Copiar la **URL de la aplicación web** (termina en `/exec`) y pegarla en `config.js` → `urlEnvio`.
3. Poner el correo de contacto en `config.js` (`contacto`). Si está vacío, no se muestra.
4. Opcional, en `apps-script/Code.gs` → `AJUSTES`: `avisarA` (correo del equipo para avisar de cada inscripción) y `confirmar` (correo de confirmación a quien inscribe, activado). Después de cambiar el script: *Implementar → Gestionar implementaciones → ✏️ → Versión: Nueva versión* (la URL no cambia).

Mientras `urlEnvio` esté vacío, el formulario se puede probar, pero avisa de que no guarda nada.

**Importante:** no cambiar el orden de las columnas de la hoja ni la fila 1 (el script escribe por posición). Se pueden añadir columnas propias **a la derecha** del todo. Los correos salen de la cuenta de Google de quien implementa el script (límite: 100 al día con una cuenta gratuita).

## Cada año

| Qué | Dónde |
|---|---|
| Año, fecha límite, respuesta, copia, "terminadas después de", máx. películas, contacto | `config.js` |
| Año y fecha límite del lado de Google | `apps-script/Code.gs` → `AJUSTES` (y nueva versión de la implementación) |
| Hoja nueva para el año nuevo | Hacer una copia de la hoja (el script se copia con ella), implementarla y poner la nueva URL en `config.js` |
| Textos y bases en los 4 idiomas | `i18n.js` |
| Preguntas del formulario | `campos.js` (y `COLUMNAS` / `OBLIGATORIOS` en `apps-script/Code.gs` + la cabecera de la hoja) |
| Colores y diseño | `style.css` |

## Archivos

| Archivo | Para qué sirve |
|---|---|
| `index.html` | Portada + formulario + confirmación |
| `formulario.js` | Construye y comprueba el formulario, guarda el borrador, envía a la hoja |
| `campos.js` | Lista de preguntas del formulario |
| `bases.html` | Bases de participación |
| `config.js` | Fechas y datos de la edición |
| `i18n.js` | Textos (DE · ES · EN · PT) |
| `style.css` | Diseño (mismo estilo que LAFITA Tickets) |
| `apps-script/Code.gs` | Script de Google que recibe las inscripciones, las guarda en la hoja y manda los correos |

## Notas

- La hoja del Drive es privada: solo la ve quien tiene acceso a la carpeta de LAFITA. La web solo puede **añadir** filas (no leerlas).
- Las bases son un borrador: conviene que alguien del equipo las revise (sobre todo derechos y protección de datos) antes de publicar.
