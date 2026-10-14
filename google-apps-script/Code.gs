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

/* ✂ */

/* Each reading has 15 sentences with two targets each: 30 targets. */
const RUBRIC = [
  [
    '3',
    'At least 27 of the 30 target vowels are right and clearly different (sleep ≠ slip, cut ≠ caught).',
    'At least 27 of the 30 target consonants are right (price ≠ prize, thought ≠ taught).',
    'At least 27 of the 30 endings are right: /t/, /d/ or /ɪd/; /s/, /z/ or /ɪz/.',
    'At least 27 of the 30 adjustments are made: linking, assimilation, deletion, reductions.',
    'At least 27 of the 30 words are stressed on the right syllable, with the others reduced.',
  ],
  [
    '2',
    '20 to 26 vowels right; some pairs sound the same.',
    '20 to 26 consonants right; some pairs sound the same.',
    '20 to 26 endings right; some are dropped or get an extra vowel.',
    '20 to 26 adjustments made; some phrases are read word by word.',
    '20 to 26 words stressed right.',
  ],
  [
    '1',
    '10 to 19 vowels right.',
    '10 to 19 consonants right.',
    '10 to 19 endings right.',
    '10 to 19 adjustments made; the reading is choppy.',
    '10 to 19 words stressed right.',
  ],
  ['0', 'Fewer than 10, no reading, or it can’t be understood.', 'Fewer than 10, no reading, or it can’t be understood.',
    'Fewer than 10, no reading, or it can’t be understood.', 'Fewer than 10, no reading, or it can’t be understood.',
    'Fewer than 10, no reading, or it can’t be understood.'],
];

/* ✂ */

/* The readings, as the page shows them (the words in CAPITALS are the targets),
   and what each sentence tests. Made from js/format.js: npm run gs. */
const READINGS_ROWS = [
  [1,1,"We NEED a BIG table for the family party tonight.","need, big","need: /i/ · big: /ɪ/"],
  [1,2,"Please write your name with a PEN, not with a PIN.","pen, pin","pen: /ɛ/ · pin: /ɪ/"],
  [1,3,"We had to WAIT a long time on the WET grass.","wait, wet","wait: /eɪ/ · wet: /ɛ/"],
  [1,4,"EIGHT PEOPLE came to the meeting at the library.","Eight, people","Eight: /eɪ/ · people: /i/"],
  [1,5,"Put on your HAT, because it is very HOT outside.","hat, hot","hat: /æ/ · hot: /ɑ/"],
  [1,6,"The new CURTAIN in her room is made of COTTON.","curtain, cotton","curtain: /ɚ/ · cotton: /ɑ/"],
  [1,7,"A little BIRD ate a BUG on the branch of the tree.","bird, bug","bird: /ɚ/ · bug: /ʌ/"],
  [1,8,"I left my CUP and my CAP on the table at school.","cup, cap","cup: /ʌ/ · cap: /æ/"],
  [1,9,"My parents BOUGHT a small BOAT last summer.","bought, boat","bought: /ɔ/ · boat: /oʊ/"],
  [1,10,"JOE is coming home from college in JUNE.","Joe, June","Joe: /oʊ/ · June: /u/"],
  [1,11,"The swimming POOL was FULL of happy children.","pool, full","pool: /u/ · full: /ʊ/"],
  [1,12,"I COULD WALK to school when I was younger.","could, walk","could: /ʊ/ · walk: /ɔ/"],
  [1,13,"The CHILD lives in a big HOUSE near the river.","child, house","child: /aɪ/ · house: /aʊ/"],
  [1,14,"The CROWD made a lot of NOISE after the game.","crowd, noise","crowd: /aʊ/ · noise: /ɔɪ/"],
  [1,15,"The BOY wants to BUY a new bike for his birthday.","boy, buy","boy: /ɔɪ/ · buy: /aɪ/"],
  [2,1,"What is the PRICE of the PRIZE for the winner?","price, prize","price: /s/ · prize: /z/"],
  [2,2,"He THOUGHT about the lesson that the teacher TAUGHT.","thought, taught","thought: /θ/ · taught: /t/"],
  [2,3,"THEY will come back to the city another DAY.","They, day","They: /ð/ · day: /d/"],
  [2,4,"Only a FEW people could enjoy the VIEW from the hill.","few, view","few: /f/ · view: /v/"],
  [2,5,"Please SHARE your CHAIR with the new student.","share, chair","share: /ʃ/ · chair: /tʃ/"],
  [2,6,"Everybody CHEERED when the JUDGE read the result.","cheered, judge","cheered: /tʃ/ · judge: /dʒ/"],
  [2,7,"The MAJOR had a long meeting with the MAYOR.","major, mayor","major: /dʒ/ · mayor: /y/"],
  [2,8,"It is a PLEASURE to work with such PLEASANT people.","pleasure, pleasant","pleasure: /ʒ/ · pleasant: /z/"],
  [2,9,"She bought the BEST VEST in the whole store.","best, vest","best: /b/ · vest: /v/"],
  [2,10,"WENDY BET ten dollars on the soccer game.","Wendy, bet","Wendy: /w/ · bet: /b/"],
  [2,11,"The HALL is on the second FLOOR of the building.","hall, floor","hall: /h/ · floor: /f/"],
  [2,12,"Turn RIGHT at the next traffic LIGHT, and then stop.","right, light","right: /r/ · light: /l/"],
  [2,13,"The KING KNOWS the answer to every question.","king, knows","king: /ŋ/ · knows: /n/"],
  [2,14,"SOME people like to sit in the SUN all afternoon.","Some, sun","Some: /m/ · sun: /n/"],
  [2,15,"I THINK this old boat is going to SINK.","think, sink","think: /θ/ · sink: /s/"],
  [3,1,"He WALKED home from work and CALLED his mother.","walked, called","walked: -ed = /t/ · called: -ed = /d/"],
  [3,2,"We FINISHED the test early and VISITED the museum.","finished, visited","finished: -ed = /t/ · visited: -ed = /ɪd/"],
  [3,3,"They RETURNED to the hotel and DECIDED to rest.","returned, decided","returned: -ed = /d/ · decided: -ed = /ɪd/"],
  [3,4,"Mark THINKS that his two DOGS are hungry again.","thinks, dogs","thinks: -s = /s/ · dogs: -s = /z/"],
  [3,5,"She TAKES three CLASSES on Monday and Friday.","takes, classes","takes: -s = /s/ · classes: -s = /ɪz/"],
  [3,6,"He LOVES the chicken SANDWICHES at school.","loves, sandwiches","loves: -s = /z/ · sandwiches: -s = /ɪz/"],
  [3,7,"Kate HELPED the teacher check the RESULTS of the test.","helped, results","helped: -ed = /t/ · results: -s = /s/"],
  [3,8,"The children LAUGHED at the funny ANIMALS at the zoo.","laughed, animals","laughed: -ed = /t/ · animals: -s = /z/"],
  [3,9,"The whole family WATCHED the DANCES at the festival.","watched, dances","watched: -ed = /t/ · dances: -s = /ɪz/"],
  [3,10,"We PLANNED a long trip across three STATES last year.","planned, states","planned: -ed = /d/ · states: -s = /s/"],
  [3,11,"She OPENED a box of warm winter GLOVES for her son.","opened, gloves","opened: -ed = /d/ · gloves: -s = /z/"],
  [3,12,"He ENJOYED the EXERCISES in class.","enjoyed, exercises","enjoyed: -ed = /d/ · exercises: -s = /ɪz/"],
  [3,13,"My little sister WANTED some of the CHOCOLATES.","wanted, chocolates","wanted: -ed = /ɪd/ · chocolates: -s = /s/"],
  [3,14,"The tired boys WAITED a long time for their RIDES.","waited, rides","waited: -ed = /ɪd/ · rides: -s = /z/"],
  [3,15,"We NEEDED two big SUITCASES for the trip.","needed, suitcases","needed: -ed = /ɪd/ · suitcases: -s = /ɪz/"],
  [4,1,"DID YOU see the new movie at the theater LAST NIGHT?","Did you, last night","Did you: palatalization: /d/ + /y/ → /dʒ/ · last night: deletion of /t/ between words"],
  [4,2,"I’m GOING TO STAY UP late to finish my homework.","going to, stay up","going to: reduction: going to → gonna · stay up: linking with a /y/ glide"],
  [4,3,"GIVE ME a big piece of that CHOCOLATE cake, please.","Give me, chocolate","Give me: assimilation: give me → gimme · chocolate: syncope (choc’late)"],
  [4,4,"We HAVE TO GO AWAY for a week in December.","have to, go away","have to: regressive assimilation: have to → hafta · go away: linking with a /w/ glide"],
  [4,5,"IS YOUR older brother TWENTY years old?","Is your, twenty","Is your: palatalization: /z/ + /y/ → /ʒ/ · twenty: deletion of /t/ after /n/"],
  [4,6,"I’LL buy LOTS OF flowers for my grandmother.","I’ll, lots of","I’ll: contraction · lots of: deletion of /v/ in “of”"],
  [4,7,"The little kids KEEP OUT of the FOOTBALL field.","keep out, football","keep out: consonant + vowel linking · football: unreleased stop before a stop"],
  [4,8,"The GOOD BOY HAD TO wait outside the classroom.","good boy, had to","good boy: regressive assimilation: /d/ → /b/ · had to: progressive assimilation: had to → hatta"],
  [4,9,"I know WHAT YOU WANT TO say to the teacher.","what you, want to","what you: palatalization: /t/ + /y/ → /tʃ/ · want to: reduction: want to → wanna"],
  [4,10,"HIS SHIRT has a BIG GAP in the back.","His shirt, big gap","His shirt: assimilation: /z/ + /ʃ/ → /ʃ/ · big gap: gemination (one long /g/)"],
  [4,11,"We USED TO go skiing in the mountains every FEBRUARY.","used to, February","used to: regressive assimilation: used to → usta · February: disappearing /r/ (Feb’uary)"],
  [4,12,"The WATER in the lake is KIND OF cold today.","water, kind of","water: flap /t/ · kind of: reduction: kind of → kinda"],
  [4,13,"You CAN GO to the party if you ASK HER first.","can go, ask her","can go: regressive assimilation: /n/ → /ŋ/ · ask her: deletion of /h/"],
  [4,14,"I’ve GOT TO thank them all for their KINDNESS.","got to, kindness","got to: reduction: got to → gotta · kindness: deletion of /d/ in a cluster of three (kin’ness)"],
  [4,15,"You CAN BUY a ticket, but FIND OUT the price first.","can buy, find out","can buy: regressive assimilation: /n/ → /m/ · find out: resyllabification (fin-dout)"],
  [5,1,"The new EMPLOYEE has a UNIQUE idea.","employee, unique","employee: stressed suffix -ee · unique: stressed suffix -ique"],
  [5,2,"Our VOLUNTEER speaks JAPANESE at home.","volunteer, Japanese","volunteer: stressed suffix -eer · Japanese: stressed suffix -ese"],
  [5,3,"The band will ENTERTAIN us at a PICTURESQUE hotel.","entertain, picturesque","entertain: stressed suffix -ain (verbs) · picturesque: stressed suffix -esque"],
  [5,4,"Smoking a CIGARETTE is a bad DECISION.","cigarette, decision","cigarette: stressed suffix -ette · decision: stress before -ion"],
  [5,5,"PHYSICAL exercise is a FANTASTIC way to relax.","Physical, fantastic","Physical: stress before -ical · fantastic: stress before -ic"],
  [5,6,"The OFFICIAL PUBLICITY starts today.","official, publicity","official: stress before -ial · publicity: stress before -ity"],
  [5,7,"The CANADIAN restaurant serves DELICIOUS food.","Canadian, delicious","Canadian: stress before -ian · delicious: stress before -ious"],
  [5,8,"Please CLASSIFY these SENSITIVE files.","classify, sensitive","classify: stress before -ify · sensitive: stress before -itive"],
  [5,9,"Her ATTITUDE toward BIOLOGY changed this year.","attitude, biology","attitude: stress before -itude · biology: stress before -logy"],
  [5,10,"GEOGRAPHY helps us APPRECIATE other cultures.","Geography, appreciate","Geography: stress before -graphy · appreciate: -ate: two syllables before the suffix"],
  [5,11,"The SECRETARY made a small MISTAKE in the letter.","secretary, mistake","secretary: -ary: two syllables before the suffix · mistake: noun stressed on the root (exception)"],
  [5,12,"Please APOLOGIZE to your MOTHER for being late.","apologize, mother","apologize: -ize: two syllables before the suffix · mother: two-syllable noun: first syllable"],
  [5,13,"The NEWSPAPER says that prices will INCREASE again.","newspaper, increase","newspaper: compound noun: first word · increase: noun–verb pair: verb on the root"],
  [5,14,"Please PICK UP the BEAUTIFUL flowers.","pick up, beautiful","pick up: two-word verb: last word · beautiful: suffix -ful does not move the stress"],
  [5,15,"We INTRODUCE OURSELVES on the first day.","introduce, ourselves","introduce: first syllable of the root · ourselves: reflexive pronoun: last syllable"],
];

/* ✂ */

function setup() {
  Object.keys(SHEETS).forEach(function (k) { sheet_(k); });
  reference_('rubric', RUBRIC);
  reference_('readings', READINGS_ROWS);
  rootFolder_();
  const msg = 'Listo: hojas Exams, Responses, Rubric y Readings, y la carpeta «' + ROOT_FOLDER +
    '» en tu Drive. Ahora implementá la aplicación web.';
  Logger.log(msg);
  return msg;
}

function onOpen() {
  SpreadsheetApp.getUi().createMenu(APP).addItem('Configurar (setup)', 'setup').addToUi();
}

function doGet() {
  const name = SpreadsheetApp.getActiveSpreadsheet().getName();
  return json_({ ok: true, app: APP, sheet: name, version: VERSION });
}

function doPost(e) {
  try {
    const data = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    if (data.type === 'start') return json_(withLock_(function () { return start_(data); }));
    if (data.type === 'recording') return json_(recording_(data));
    if (data.type === 'finish') return json_(withLock_(function () { return finish_(data); }));
    throw new Error('Pedido desconocido: ' + String(data.type));
  } catch (err) {
    return json_({ ok: false, error: err.message });
  }
}

/* ✂ */

/* ─── requests ─── */

function start_(d) {
  const who = person_(d);
  const sheet = sheet_('exams');
  const row = findRow_(sheet, EX.attempt, who.attempt);
  if (row) return { ok: true, duplicate: true };
  const folder = studentFolder_(who);
  sheet.appendRow([
    date_(d.startedAt),
    text_(who.student),
    text_(who.group),
    d.demo ? 'demo' : 'started',
    0,
    '',
    '',
    '',
    '',
    folder.getUrl(),
    who.attempt,
  ]);
  const last = sheet.getLastRow();
  sheet.getRange(last, EX.total).setFormula(
    '=IF(COUNTIFS(Responses!J:J,K' + last + ',Responses!H:H,"<>")=0,"",' +
      'SUMIFS(Responses!H:H,Responses!J:J,K' + last + '))'
  );
  return { ok: true };
}

/* ✂ */

function recording_(d) {
  const who = person_(d);
  if (QUESTIONS.indexOf(d.qid) < 0) throw new Error('Lectura desconocida.');
  const mime = String(d.mime || '').split(';')[0];
  if (mime.indexOf('audio/') !== 0) throw new Error('Eso no es un audio.');
  if (!d.audio) throw new Error('No llegó el audio.');
  const bytes = Utilities.base64Decode(d.audio);
  if (bytes.length > MAX_AUDIO_BYTES) throw new Error('La grabación es demasiado grande.');

  /* The same reading sent again (the first one did arrive) gets the same file back. */
  const sheet = sheet_('responses');
  const existing = findResponse_(sheet, who.attempt, d.qid);
  if (existing) return { ok: true, duplicate: true, url: existing };

  const ext = /mp4|m4a|aac/.test(d.mime) ? 'm4a' : /ogg/.test(d.mime) ? 'ogg' : 'webm';
  const label = LABELS[d.qid];
  const blob = Utilities.newBlob(bytes, mime, label + '.' + ext);
  const file = studentFolder_(who).createFile(blob);
  file.setDescription(String(d.prompt || '').slice(0, 1000));
  const url = file.getUrl();

  withLock_(function () {
    if (findResponse_(sheet, who.attempt, d.qid)) return;
    sheet.appendRow([
      date_(d.recordedAt),
      text_(who.student),
      text_(who.group),
      label,
      text_(String(d.prompt || '').slice(0, 2000)),
      Math.round(Number(d.durationSec) || 0),
      '',
      '',
      '',
      who.attempt,
    ]);
    sheet.getRange(sheet.getLastRow(), RE.recording).setFormula('=HYPERLINK("' + url + '","▶ Listen")');
    const exams = sheet_('exams');
    const row = findRow_(exams, EX.attempt, who.attempt);
    if (row) exams.getRange(row, EX.answers).setValue(countResponses_(sheet, who.attempt));
  });
  return { ok: true, url: url, id: file.getId() };
}

function finish_(d) {
  const who = person_(d);
  const sheet = sheet_('exams');
  let row = findRow_(sheet, EX.attempt, who.attempt);
  if (!row) {
    start_(d);
    row = sheet.getLastRow();
  }
  sheet.getRange(row, EX.status).setValue('finished');
  sheet.getRange(row, EX.answers).setValue(countResponses_(sheet_('responses'), who.attempt));
  sheet.getRange(row, EX.finished).setValue(date_(d.finishedAt));
  sheet.getRange(row, EX.left).setValue(Number(d.leftPage) || 0);
  sheet.getRange(row, EX.restarts).setValue(Number(d.resumed) || 0);
  return { ok: true };
}

/* ✂ */

/* ─── helpers ─── */

function person_(d) {
  const attempt = String(d.attempt || '');
  if (!/^[\w-]{6,40}$/.test(attempt)) throw new Error('Intento inválido.');
  const student = String(d.student || '').trim().slice(0, 80);
  if (!student) throw new Error('Falta el nombre.');
  const group = String(d.group || '').trim().slice(0, 40);
  return { attempt: attempt, student: student, group: group };
}

/* The Rubric and Readings tabs are rewritten each time setup runs. */
function reference_(key, rows) {
  const sheet = sheet_(key);
  const headers = SHEETS[key].headers;
  if (sheet.getLastRow() > 0) {
    sheet.getRange(1, 1, sheet.getLastRow(), Math.max(sheet.getLastColumn(), headers.length)).clearContent();
  }
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]).setFontWeight('bold');
  sheet.getRange(2, 1, rows.length, rows[0].length).setValues(rows);
}

function sheet_(key) {
  const def = SHEETS[key];
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(def.name);
  if (!sheet) {
    sheet = ss.insertSheet(def.name);
    sheet.getRange(1, 1, 1, def.headers.length).setValues([def.headers]).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function findRow_(sheet, col, value) {
  const last = sheet.getLastRow();
  if (last < 2) return 0;
  const values = sheet.getRange(2, col, last - 1, 1).getValues();
  for (let i = values.length - 1; i >= 0; i--) {
    if (String(values[i][0]) === value) return i + 2;
  }
  return 0;
}

/* The recording link of a reading already saved, or ''. */
function findResponse_(sheet, attempt, qid) {
  const last = sheet.getLastRow();
  if (last < 2) return '';
  const label = LABELS[qid];
  const rows = sheet.getRange(2, 1, last - 1, SHEETS.responses.headers.length).getValues();
  const formulas = sheet.getRange(2, RE.recording, last - 1, 1).getFormulas();
  for (let i = 0; i < rows.length; i++) {
    if (String(rows[i][RE.attempt - 1]) === attempt && String(rows[i][RE.label - 1]) === label) {
      const m = String(formulas[i][0]).match(/HYPERLINK\("([^"]+)"/);
      return m ? m[1] : 'saved';
    }
  }
  return '';
}

function countResponses_(sheet, attempt) {
  const last = sheet.getLastRow();
  if (last < 2) return 0;
  return sheet
    .getRange(2, RE.attempt, last - 1, 1)
    .getValues()
    .filter(function (r) { return String(r[0]) === attempt; }).length;
}

/* ✂ */

function rootFolder_() {
  const it = DriveApp.getFoldersByName(ROOT_FOLDER);
  return it.hasNext() ? it.next() : DriveApp.createFolder(ROOT_FOLDER);
}

function childFolder_(parent, name) {
  const it = parent.getFoldersByName(name);
  return it.hasNext() ? it.next() : parent.createFolder(name);
}

/* Phonology Reading Exam — Recordings / <group> / <student> · <attempt> */
function studentFolder_(who) {
  const group = childFolder_(rootFolder_(), who.group || 'No group');
  const name = who.student.replace(/[\\/:*?"<>|]/g, '-');
  return childFolder_(group, name + ' · ' + who.attempt.slice(-6));
}

function withLock_(fn) {
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    return fn();
  } finally {
    lock.releaseLock();
  }
}

/* Text that looks like a formula is kept as text. */
function text_(s) {
  s = String(s || '');
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}

function date_(iso) {
  const d = new Date(iso);
  return isNaN(d) ? new Date() : d;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
