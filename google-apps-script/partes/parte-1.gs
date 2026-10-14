/* ── Phonology Exam · parte 1 de 10 ── */

/*
 * ── Phonology Reading Exam · Google Apps Script ──
 *
 * Recibe las grabaciones del examen de lectura (vocales y consonantes,
 * connected speech y word stress) y las guarda en tu Google Drive, con una
 * fila por lectura en esta planilla para que pongas la nota.
 *
 * Instalación (una vez):
 *   1. Creá una planilla nueva (sheets.new) → Extensiones → Apps Script.
 *   2. Borrá lo que haya, pegá todo este archivo (o las partes, en orden) y guardá.
 *   3. Elegí la función «setup» → ▶ Ejecutar → aceptá los permisos.
 *   4. Implementar → Nueva implementación → Aplicación web · Ejecutar como: Yo ·
 *      Quién tiene acceso: Cualquier persona → copiá la URL que termina en /exec.
 *   5. Pasale la URL a quien arma la página (o pegala en …/#teacher y guardá).
 * Si cambiás este código: Implementar → Administrar implementaciones → ✏ →
 * Nueva versión.
 */

const APP = 'Phonology Reading Exam';
const VERSION = 3;
const ROOT_FOLDER = 'Phonology Reading Exam — Recordings';
/* The readings: id, title and kind. Made from js/format.js: npm run gs. */
const READINGS_META = [
  ["r1","Vowels","vowels"],
  ["r2","Consonants","consonants"],
  ["r3","-ed and -s endings","endings"],
  ["r4","Connected speech 1","connected"],
  ["r5","Connected speech 2","connected"],
  ["r6","Connected speech 3","connected"],
  ["r7","Word stress 1","stress"],
  ["r8","Word stress 2","stress"],
  ["r9","Word stress 3","stress"],
  ["r10","Word stress 4","stress"],
];
const QUESTIONS = READINGS_META.map(function (r) { return r[0]; });
const LABELS = {};
READINGS_META.forEach(function (r, i) { LABELS[r[0]] = 'Reading ' + (i + 1); });
const MAX_AUDIO_BYTES = 20 * 1024 * 1024;

const SHEETS = {
  exams: {
    name: 'Exams',
    headers: [
      'Started', 'Student', 'Group', 'Status', 'Readings', 'Finished',
      'Left the page', 'Restarts', 'Total score', 'Folder', 'Attempt',
    ],
  },
  responses: {
    name: 'Responses',
    headers: [
      'Recorded', 'Student', 'Group', 'Reading', 'Text (targets in CAPITALS)',
      'Seconds', 'Recording', 'Score (0–3)', 'Comments', 'Attempt',
    ],
  },
  rubric: {
    name: 'Rubric',
    headers: ['Score'].concat(READINGS_META.map(function (r, i) { return 'Reading ' + (i + 1) + ' · ' + r[1]; })),
  },
  readings: {
    name: 'Readings',
    headers: ['Reading', 'Sentence', 'Text (targets in CAPITALS)', 'Target words', 'What it tests'],
  },
};
const EX = { status: 4, answers: 5, finished: 6, left: 7, restarts: 8, total: 9, folder: 10, attempt: 11 };
const RE = { label: 4, recording: 7, score: 8, attempt: 10 };

/* ── fin de la parte 1 de 10 ── */
