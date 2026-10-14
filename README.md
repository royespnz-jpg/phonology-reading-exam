# Phonology Reading Exam

Un examen de lectura en voz alta, cronometrado como el examen de Speaking (formato TOEIC): el reloj cuenta el tiempo para preparar, suena
un beep, el micrófono se enciende solo, graba hasta que se acaba el tiempo y pasa a la lectura siguiente. Cada
grabación va a tu Google Drive y a una planilla donde ponés la nota.

## El examen

Tres lecturas, cada una con **60 segundos para preparar** y **60 segundos para leer**:

| Lectura | Qué evalúa | Fuente (solo estos PDFs) |
| --- | --- | --- |
| 1 · Vowels and consonants | Vocales, consonantes y las terminaciones *-ed* y *-s* | *Accurate English*, cap. 4, 14 y 15 |
| 2 · Connected speech | Linking, asimilación, deleción, reducciones | Celce-Murcia, cap. 5; Prator & Robinett, lección 16 |
| 3 · Word stress | La sílaba acentuada de cada palabra | *Accurate English*, cap. 6 y 7 |

- **Por oraciones.** Cada lectura es una lista numerada de **15 oraciones** sueltas, sin texto narrativo ni párrafos. Las
  oraciones son nuevas: no se copiaron de los libros, pero sus palabras y reglas salen solo de esos capítulos.
- **Targets en negrita.** Las palabras (o grupos de palabras, en connected speech) que escuchás para corregir están en
  **negrita**. En la planilla aparecen en MAYÚSCULAS.
- **Variedad de reglas.** Cada oración prueba reglas distintas del capítulo:
  - Lectura 1: /i/–/ɪ/, /eɪ/–/ɛ/, /æ ɑ ʌ ɔ/, /oʊ/–/ɔ/, /u/–/ʊ/, /aɪ aʊ ɔɪ/; /θ ð/, /ʃ tʃ dʒ ʒ/, /y/, /h/,
    /v b w f/, /r l/, /s/ + consonante, /ŋ ŋk n/; *-ed* = /t d ɪd/ y *-s* = /s z ɪz/.
  - Lectura 2: palatalización, linking con /y/ y /w/, consonante + vocal, resilabificación, geminación, oclusivas sin
    soltar, asimilación regresiva y progresiva, deleción de /t d h v r/, síncopa, contracciones y reducciones (*gonna,
    wanna, usta, gimme*, *had to*), flap /t/.
  - Lectura 3: sufijos acentuados (*-ee, -eer, -ese, -ique, -ette*), acento antes del sufijo (*-ion, -ic, -ial, -ious, -cian,
    -ian, -cious, -logy, -graphy, -itive, -itude*), dos sílabas antes (*-ate, -ize, -ary*), pares sustantivo–verbo, palabras en *-ate*, compuestos,
    phrasal verbs, pronombres reflexivos y la alternancia de vocales plenas y reducidas.
- **Cabe en un minuto.** Cada lectura tiene unas 165–185 sílabas: a ritmo parejo de estudiante (unas 3,5 sílabas por
  segundo, con una pausa corta entre oraciones) lleva entre 54 y 58 segundos. Las pruebas automáticas lo controlan.
- **Las oraciones aparecen** recién cuando empieza el tiempo de preparación (“Begin preparing now”), así todos tienen
  los mismos 60 segundos.
- En la página **Teacher** cada oración muestra, en letra chica, qué regla evalúa; los estudiantes no lo ven. La hoja
  *Readings* de la planilla también lo tiene.

Las consignas se oyen (voz del navegador) y se leen en pantalla. Son unos 8 minutos.

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
3. **En el examen**, abrí la página **Teacher** (`…/#teacher`): pegá la URL, *Test*, *Save*. Ahí está el link para los
   estudiantes y un link para probar el examen. La página ya trae tu URL de fábrica ([`js/config.js`](js/config.js)): si
   cambiás de planilla, cambiala ahí o usá el link de la página Teacher.

### Qué guarda la planilla

| Hoja | Qué tiene |
| --- | --- |
| **Exams** | Una fila por estudiante: inicio, nombre, grupo, estado, lecturas enviadas, fin, veces que salió de la página, reinicios, **nota total** (suma automática) y la carpeta de sus audios |
| **Responses** | Una fila por lectura: el texto (targets en MAYÚSCULAS), segundos, **▶ Listen** (el audio en tu Drive), **Score (0–3)** y *Comments* para que completes |
| **Rubric** | Criterios de 0 a 3 para cada lectura |
| **Readings** | Las oraciones, sus targets y qué regla evalúa cada una |

Los audios quedan en *Phonology Reading Exam — Recordings / grupo / nombre · intento*.

## Cambiar las oraciones

Están en [`js/format.js`](js/format.js) (`READINGS`): cada oración es `{ text, rule }`, con los targets entre `**`.
Después de cambiarlas:

```bash
npm run gs    # copia las oraciones a Code.gs y vuelve a armar las partes
npm test      # controla negritas, una oración por línea y que cada lectura entre en 60 s
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
