# Phonology Reading Exam

Un examen de lectura en voz alta, cronometrado como el examen de Speaking (formato TOEIC): el reloj cuenta el tiempo para preparar, suena
un beep, el micrófono se enciende solo, graba hasta que se acaba el tiempo y pasa a la lectura siguiente. Cada
grabación va a tu Google Drive y a una planilla donde ponés la nota.

## El examen

Cinco lecturas, cada una con **60 segundos para preparar** y **60 segundos para leer**:

| Lectura | Qué evalúa | Fuente (solo estos PDFs) |
| --- | --- | --- |
| 1 · Vowels | Las 15 vocales | *Accurate English*, cap. 4 |
| 2 · Consonants | Las consonantes | *Accurate English*, cap. 15 |
| 3 · -ed and -s endings | /t/, /d/, /ɪd/ y /s/, /z/, /ɪz/ | *Accurate English*, cap. 14 |
| 4 · Connected speech | 30 ajustes: linking, glides, asimilación, palatalización, deleción, síncopa, reducciones… | Celce-Murcia, cap. 5; Prator & Robinett, lección 16 |
| 5 · Word stress | 30 reglas: sufijos, pares sustantivo–verbo, *-ate*, compuestos, phrasal verbs… | *Accurate English*, cap. 6 y 7 |

- **Por oraciones.** Cada lectura es una lista numerada de **15 oraciones** sueltas, sin texto narrativo ni párrafos. Las
  oraciones son nuevas: no se copiaron de los libros, pero sus palabras y reglas salen solo de esos capítulos.
- **Dos targets por oración, en negrita.** Cada oración tiene exactamente **dos** palabras (o grupos de palabras, en
  connected speech) en **negrita**, y cada una evalúa un sonido, ajuste o regla distinto. En la planilla aparecen en
  MAYÚSCULAS.
- **Nada se repite** dentro de una lectura: ninguna palabra target y ningún par.
  - *Vowels*: cada oración contrasta dos vocales (sleep/slip, cut/caught…); cada una de las 15 vocales aparece exactamente
    dos veces.
  - *Consonants*: dos consonantes por oración (price/prize, thought/taught…); ninguna aparece más de dos veces.
  - *-ed / -s*: con seis pronunciaciones hay justo 15 pares posibles, y cada oración usa uno distinto.
  - *Connected speech* y *Word stress*: cada una evalúa 30 ajustes o reglas diferentes (dos por oración), sin repetir
    ninguno (de las listas `CS` y `ST` en [`js/format.js`](js/format.js)).
- **Ninguna palabra target se repite en todo el examen** (150 targets, todos distintos).
- **Cabe en un minuto.** Cada lectura tiene unas 170–185 sílabas: a ritmo parejo de estudiante (unas 3,5 sílabas por
  segundo, con una pausa corta entre oraciones) lleva entre 55 y 59 segundos. Las pruebas automáticas controlan todo
  esto (dos targets, nada repetido, el minuto).
- **Las oraciones aparecen** recién cuando empieza el tiempo de preparación (“Begin preparing now”), así todos tienen
  los mismos 60 segundos.
- En la página **Teacher** y en la vista previa, cada oración muestra en letra chica qué evalúa cada target (por ejemplo
  *pen: /ɛ/ · pin: /ɪ/*); los estudiantes no lo ven. La hoja *Readings* de la planilla también lo tiene.

Las consignas se oyen (voz del navegador) y se leen en pantalla. Son unos 13 minutos (10 de relojes).

- **El micrófono**: se pide una vez, en la prueba de micrófono antes de empezar. Después graba solo en cada lectura y
  se cierra al terminar el tiempo.
- **Nada se pierde**: cada grabación se guarda en el navegador y se envía enseguida; si se corta internet, se reintenta.
  Al final el estudiante ve “✓ Sent” en cada lectura, y puede descargarlas si no hay planilla conectada.
- **Si se recarga la página**, el examen sigue desde la lectura en la que estaba (la planilla lo cuenta en *Restarts*;
  también cuenta cuántas veces salió de la página).

## Instalación

1. **La planilla y el script.** Creá una planilla nueva (<https://sheets.new>) → **Extensiones → Apps Script** → borrá
   lo que haya → pegá [`google-apps-script/Code.gs`](google-apps-script/Code.gs) (o las partes de
   [`google-apps-script/partes/`](google-apps-script/partes), en orden, si el editor no te deja pegar todo junto) →
   guardá → elegí **`setup`** → **▶ Ejecutar** → aceptá los permisos. Crea las hojas *Exams*, *Responses*, *Rubric* y
   *Readings*, y la carpeta *Phonology Reading Exam — Recordings* en tu Drive.
2. **Implementar → Nueva implementación → Aplicación web** · Ejecutar como: **Yo** · Quién tiene acceso: **Cualquier
   persona** → copiá la URL que termina en `/exec`.
3. **En el examen**, abrí la página **Teacher** (`…/#teacher`) con el código del docente, **1234**: pegá la URL, *Test*, *Save*. Ahí está el link para los
   estudiantes y un link para probar el examen. La página ya trae tu URL de fábrica ([`js/config.js`](js/config.js)): si
   cambiás de planilla, cambiala ahí o usá el link de la página Teacher.

### Qué guarda la planilla

| Hoja | Qué tiene |
| --- | --- |
| **Exams** | Una fila por estudiante: inicio, nombre, grupo, estado, lecturas enviadas, fin, veces que salió de la página, reinicios, **nota total** (suma automática) y la carpeta de sus audios |
| **Responses** | Una fila por lectura: el texto (targets en MAYÚSCULAS), segundos, **▶ Listen** (el audio en tu Drive), **Score (0–3)** y *Comments* para que completes |
| **Rubric** | Criterios de 0 a 3 para cada lectura, según cuántos de los 30 targets están bien |
| **Readings** | Las oraciones, sus targets y qué regla evalúa cada una |

Los alumnos solo escriben su **nombre completo**. Los audios quedan en *Phonology Reading Exam — Recordings / No group /
nombre · intento*. Si querés separarlos por curso, agregá `?g=` al link (por ejemplo `…/phonology-reading-exam/?g=10-1`):
ese grupo va a la columna *Group* y a su propia carpeta, sin que el alumno lo escriba.

## Vista previa del docente (código 1234)

El link **Teacher** de la página de inicio pide el código **1234** (se cambia en [`js/config.js`](js/config.js),
`TEACHER_CODE`). Con el código entrás a:

- **La página Teacher**: el script, el link para los alumnos, las oraciones con lo que evalúa cada una y la prueba con
  relojes reales.
- **La vista previa** (`…/#preview`): todos los pasos del examen tal como los ven los alumnos —la introducción y, en cada
  lectura, *Directions*, *Prepare* y *Read*— en el orden que quieras: botones de cada paso, *Previous* / *Next* o las
  flechas ← →. Podés escuchar lo que dice la voz, probar el reloj de 60 segundos y mostrar qué evalúa cada oración. No
  graba ni manda nada a la planilla.

El código queda abierto solo en esa pestaña; **Lock and leave** lo cierra. Sin el código, los alumnos no ven las
oraciones antes de tiempo (no es una contraseña: alguien que lea el código de la página podría encontrarlo).

## Cambiar las oraciones

Están en [`js/format.js`](js/format.js) (`READINGS`): cada oración es `{ text, tests }`, con los dos targets entre `**` y en `tests` qué evalúa cada uno.
Después de cambiarlas:

```bash
npm run gs        # copia las oraciones a Code.gs y vuelve a armar las partes
npm run version   # pone una versión nueva a los archivos, así una recarga normal trae los cambios
npm test          # controla negritas, una oración por línea y que cada lectura entre en 60 s
```

y en Apps Script pegá el `Code.gs` nuevo, corré `setup` otra vez y hacé **Implementar → Administrar implementaciones →
✏ → Nueva versión**.

## Probarlo

```bash
npm start     # http://localhost:8080   ( …/?quick=1 acorta los relojes al 10 % )
npm test
```

No hay dependencias ni build: HTML, CSS y JavaScript. Funciona en Chrome, Edge, Firefox y Safari (también en el
celular); conviene usar auriculares.
