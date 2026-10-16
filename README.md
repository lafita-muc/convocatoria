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
- **Confirmación** con un **número de inscripción** (ej. `NM27-K7QXP`) que se puede imprimir. Para inscribir otra película se mantienen los datos de la dirección.
- **Cierre automático:** después de la fecha límite el formulario se cierra solo (en la web y en la base de datos).
- **Bases** (`bases.html`): 12 puntos en los 4 idiomas.
- **Panel del comité** (`admin.html`, con usuario y contraseña): lista de inscripciones en directo, búsqueda, filtros por estado y categoría, **estado** de cada película (Nueva → En visionado → Preselección → Seleccionada / Descartada), notas internas, todos los datos, enlace directo al visionado y **exportar a CSV / Excel**.

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

1. **GitHub Pages:** Settings → Pages → *Deploy from a branch* → `main` / `(root)`. La web queda en `https://lafita-muc.github.io/convocatoria/`.
2. **Firebase** (la base de datos donde llegan las inscripciones). Se recomienda un proyecto **nuevo**, separado del de Tickets, para que las reglas de uno no pisen las del otro:
   1. [console.firebase.google.com](https://console.firebase.google.com) → *Agregar proyecto* (plan gratuito Spark).
   2. Registrar una app web (`</>`) y copiar los valores en `firebase-config.js`.
   3. *Firestore Database* → crear (modo producción, región `europe-west3` Frankfurt).
   4. *Authentication* → habilitar *Correo/contraseña* y crear un usuario por persona del comité.
   5. *Firestore → Reglas*: pegar `firestore.rules` y publicar.
3. Poner el correo de contacto en `config.js` (`contacto`). Si está vacío, no se muestra.

Mientras `firebase-config.js` esté vacío, el formulario se puede probar, pero avisa de que no guarda nada.

## Cada año

| Qué | Dónde |
|---|---|
| Año, fecha límite, respuesta, copia, "terminadas después de", máx. películas, contacto | `config.js` |
| Fecha de cierre y año en la base de datos | `firestore.rules` (`timestamp.date(…)`, `d.edicion == …`, `num(d, 'anio', …)`, `numOpt(d, 'dirNacimiento', …)`, `num(d, 'dirDesde', …)`) → volver a publicar las reglas |
| Textos y bases en los 4 idiomas | `i18n.js` |
| Preguntas del formulario | `campos.js` (y las listas de `firestore.rules`) |
| Colores y diseño | `style.css` |

Las inscripciones de cada año se guardan con su `edicion`; el panel muestra solo las del año de `config.js`.

## Archivos

| Archivo | Para qué sirve |
|---|---|
| `index.html` | Portada + formulario + confirmación |
| `formulario.js` | Construye y comprueba el formulario, guarda el borrador, envía |
| `campos.js` | Lista de preguntas (la usan el formulario, el panel y el CSV) |
| `bases.html` | Bases de participación |
| `admin.html` | Panel del comité de selección |
| `config.js` | Fechas y datos de la edición |
| `i18n.js` | Textos (DE · ES · EN · PT) |
| `style.css` | Diseño (mismo estilo que LAFITA Tickets) |
| `firebase-config.js` | Conexión con la base de datos |
| `firestore.rules` | Reglas de seguridad: el público solo puede inscribir; el comité lo ve todo |

## Notas

- No se envía un correo automático de confirmación (haría falta un servidor). La persona ve e imprime su número de inscripción; el comité escribe a todas las personas antes de la fecha de respuesta.
- Las bases son un borrador: conviene que alguien del equipo las revise (sobre todo derechos y protección de datos) antes de publicar.
