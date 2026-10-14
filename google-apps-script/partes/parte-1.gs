/* ── Phonology Exam · parte 1 de 8 ── */

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
const VERSION = 2;
const ROOT_FOLDER = 'Phonology Reading Exam — Recordings';
const QUESTIONS = ['r1', 'r2', 'r3', 'r4', 'r5'];
const LABELS = { r1: 'Reading 1', r2: 'Reading 2', r3: 'Reading 3', r4: 'Reading 4', r5: 'Reading 5' };
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
    headers: [
      'Score', 'Reading 1 · Vowels', 'Reading 2 · Consonants', 'Reading 3 · -ed and -s endings',
      'Reading 4 · Connected speech', 'Reading 5 · Word stress',
    ],
  },
  readings: {
    name: 'Readings',
    headers: ['Reading', 'Sentence', 'Text (targets in CAPITALS)', 'Target words', 'What it tests'],
  },
};
const EX = { status: 4, answers: 5, finished: 6, left: 7, restarts: 8, total: 9, folder: 10, attempt: 11 };
const RE = { label: 4, recording: 7, score: 8, attempt: 10 };

/* ── fin de la parte 1 de 8 ── */
