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
const VERSION = 1;
const ROOT_FOLDER = 'Phonology Reading Exam — Recordings';
const QUESTIONS = ['r1', 'r2', 'r3'];
const LABELS = { r1: 'Reading 1', r2: 'Reading 2', r3: 'Reading 3' };
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
    headers: ['Score', 'Reading 1 · Vowels and consonants', 'Reading 2 · Connected speech', 'Reading 3 · Word stress'],
  },
  readings: {
    name: 'Readings',
    headers: ['Reading', 'Sentence', 'Text (targets in CAPITALS)', 'Target words', 'What it tests'],
  },
};
const EX = { status: 4, answers: 5, finished: 6, left: 7, restarts: 8, total: 9, folder: 10, attempt: 11 };
const RE = { label: 4, recording: 7, score: 8, attempt: 10 };

/* ✂ */

const RUBRIC = [
  [
    '3',
    'Almost every target vowel and consonant is accurate; the -ed and -s endings ' +
      'are pronounced correctly (/t/, /d/, /ɪd/; /s/, /z/, /ɪz/).',
    'Words are linked smoothly; reductions, assimilation and deletions sound ' +
      'natural; the rhythm is not choppy.',
    'The stressed syllable is right in almost every target word, with ' +
      'unstressed syllables reduced.',
  ],
  [
    '2',
    'Most targets are accurate; a few vowels, consonants or endings are ' +
      'replaced or dropped.',
    'Some linking and reductions, but several phrases are read word by word.',
    'Most stresses are right; some words have the stress on the wrong syllable.',
  ],
  [
    '1',
    'Many targets are inaccurate or missing; endings are often dropped or added.',
    'Little linking or reduction; the reading is choppy and slow.',
    'Many words are stressed on the wrong syllable or with no clear stress.',
  ],
  ['0', 'No reading, or it can’t be understood.', 'No reading, or it can’t be understood.', 'No reading, or it can’t be understood.'],
];

/* The readings, as the page shows them (the words in CAPITALS are the targets),
   and what each sentence tests. Made from js/format.js: npm run gs. */
const READINGS_ROWS = [
  [1,1,"LUKE LOOKED at the FULL POOL and DECIDED to swim.","Luke, looked, full, pool, decided","/u/ and /ʊ/ · -ed = /t/, /ɪd/"],
  [1,2,"BETH TASTED the PEPPER and WAITED for the TEST RESULTS.","Beth, tasted, pepper, waited, test, results","/eɪ/ and /ɛ/ · -ed = /ɪd/ · -s = /s/"],
  [1,3,"The COP CAUGHT the BUS, but his CAT STAYED home.","cop, caught, bus, cat, stayed","/ɑ/, /ɔ/, /ʌ/, /æ/ · -ed = /d/"],
  [1,4,"He BOUGHT a BOAT on the COAST, but it COST too much.","bought, boat, coast, cost","/ɔ/ and /oʊ/"],
  [1,5,"WHO HID the HOT HAM in the HALL?","Who, hid, hot, ham, hall","/h/ · /ɪ/, /ɑ/, /æ/, /ɔ/"],
  [1,6,"TIM SLIPPED on the STREET near the LITTLE HOSPITAL.","Tim, slipped, street, little, hospital","/ɪ/ and /i/ · /str/ · dark /l/ · -ed = /t/"],
  [1,7,"THREE THOUSAND people THANKED the MOTHER of THESE TWINS.","Three, thousand, thanked, mother, these, twins","/θ/ and /ð/ · -ed = /t/ · -s = /z/"],
  [1,8,"GEORGE USUALLY MEASURES the ORANGE JUICE in the GARAGE.","George, usually, measures, orange, juice, garage","/dʒ/ and /ʒ/"],
  [1,9,"The YOUNG MAJOR ASKED the MAYOR for YELLOW JELLO.","young, major, asked, mayor, yellow, jello","/y/ and /dʒ/ · -ed = /t/"],
  [1,10,"SHE WASHES the DISHES and WATCHES the SHIPS from her CHAIR.","She, washes, dishes, watches, ships, chair","/ʃ/ and /tʃ/ · -es = /ɪz/ · -s = /s/"],
  [1,11,"VERY FEW VOTERS WENT BOATING in the WET WEATHER.","Very, few, voters, went, boating, wet, weather","/v/, /f/, /b/, /w/"],
  [1,12,"A RED LIGHT FLASHED on the RIGHT side of the ROAD.","red, light, flashed, right, road","/r/ and /l/ · /fl/ · -ed = /t/"],
  [1,13,"SMALL SPANISH SCHOOLS START STUDYING in SPRING.","Small, Spanish, schools, start, studying, spring","/s/ + consonant at the beginning of a word (no /e/ before it) · -s = /z/"],
  [1,14,"The KING THINKS the YOUNG SINGER SANG TEN SONGS.","king, thinks, young, singer, sang, ten, songs","/ŋ/, /ŋk/ and /n/ · -s = /s/, /z/"],
  [1,15,"The BOY ENJOYED the LOUD NOISE of the CROWD.","boy, enjoyed, loud, noise, crowd","/ɔɪ/ and /aʊ/ · -ed = /d/"],
  [2,1,"DID YOU STAY UP LAST NIGHT?","Did you, stay up, last night","palatalization (did you) · linking with a /y/ glide · deletion of /t/"],
  [2,2,"WOULD YOU PICK IT UP and PUT IT ON the BLACKBOARD?","Would you, pick it up, put it on, blackboard","palatalization · consonant + vowel linking · flap /t/ · unreleased stop"],
  [2,3,"You CAN BUY a GOOD BIKE IN MAY.","can buy, good bike, in May","regressive assimilation: /n/ → /m/, /d/ → /b/"],
  [2,4,"TELL HIM to ASK HER about that INTERESTING RESTAURANT.","Tell him, ask her, interesting, restaurant","deletion of /h/ · syncope"],
  [2,5,"Please STOP PUSHING; THERE’S a BIG GAP in the OLD BRIDGE.","stop pushing, there’s, big gap, old bridge","gemination (one long consonant) · contraction · deletion of /d/"],
  [2,6,"I’M GOING TO GO AWAY for a SHORT TIME.","I’m, going to, go away, short time","contraction · reduction (gonna) · linking with a /w/ glide · gemination"],
  [2,7,"GIVE ME a SANDWICH and LOTS OF VEGETABLES, please.","Give me, sandwich, lots of, vegetables","assimilation (gimme) · /nd/ → /m/ · deletion of /v/ in “of” · syncope"],
  [2,8,"My FAMILY USED TO visit TORONTO EVERY FEBRUARY.","family, used to, Toronto, every, February","syncope · regressive assimilation (usta) · deletion of /t/ after /n/ · disappearing /r/"],
  [2,9,"IS YOUR GRANDPA IN KANSAS THIS YEAR?","Is your, grandpa, in Kansas, this year","palatalization · /nd/ → /m/ · /n/ → /ŋ/"],
  [2,10,"WHAT DO YOU WANT TO EAT AT the PARTY?","What do you, want to, eat at, party","reduced “do you” · reduction (wanna) · linking · flap /t/"],
  [2,11,"TWENTY people GOT OUT of the BIG CHURCH AT EIGHT.","Twenty, got out, big church, at eight","deletion of /t/ after /n/ · flap /t/ and linking · unreleased stop before an affricate"],
  [2,12,"HIS SHIRT is in THIS SHOP, but I CAN GO GET IT.","His shirt, this shop, can go, get it","/z/, /s/ + /ʃ/ assimilation · /n/ → /ŋ/ · flap /t/ and linking"],
  [2,13,"We HAD TO WAIT AN HOUR for the NEXT BUS.","had to, wait an hour, next bus","progressive assimilation (had to → /hætə/) · linking · deletion of /t/"],
  [2,14,"He PUSHED UP his sleeve and HURT HIS LEFT ARM.","pushed up, hurt his, left arm","resyllabification · deletion of /h/"],
  [2,15,"DO IT now, or you WON’T BE ABLE to SEE IT.","Do it, won’t, be able, see it","linking with a /w/ glide · contraction · linking with a /y/ glide"],
  [3,1,"The JAPANESE VOLUNTEER has a UNIQUE TECHNIQUE.","Japanese, volunteer, unique, technique","stressed suffixes -ese, -eer, -ique"],
  [3,2,"We OBJECT to the PROJECT and will PROTEST.","object, project, protest","noun–verb pairs: ob’ject (verb), ’project (noun), pro’test (verb)"],
  [3,3,"Please RECORD the RECORD for the EMPLOYEES.","record, record, employees","noun–verb pair: re’cord (verb), ’record (noun) · stressed suffix -ee"],
  [3,4,"Each GRADUATE will GRADUATE in June.","graduate, graduate","-ate: ’graduate (noun, /ɪt/), ’graduate (verb, /eɪt/)"],
  [3,5,"A DEMOCRAT wants DEMOCRACY and DEMOCRATIC ELECTIONS.","democrat, democracy, democratic, elections","full and reduced vowels alternate · -ion"],
  [3,6,"The POLITICIAN APOLOGIZED for his MISTAKE.","politician, apologized, mistake","-cian · -ize · noun stressed on the root"],
  [3,7,"VEGETARIAN food is DELICIOUS.","Vegetarian, delicious","-ian, -cious"],
  [3,8,"BIOLOGY is a FANTASTIC SUBJECT.","Biology, fantastic, subject","-logy, -ic · two-syllable noun"],
  [3,9,"PHOTOGRAPHY is an IMPORTANT CAREER.","Photography, important, career","-graphy · first syllable of the root · stressed suffix -eer"],
  [3,10,"The SECRETARY PICKED UP a NEWSPAPER.","secretary, picked up, newspaper","-ary · two-word verb · compound noun"],
  [3,11,"The POLICEMAN told him to PUT AWAY his CIGARETTE.","policeman, put away, cigarette","compound noun · two-word verb · stressed suffix -ette"],
  [3,12,"CURIOUS children INTRODUCE THEMSELVES.","Curious, introduce, themselves","-ious · first syllable of the root · reflexive pronoun"],
  [3,13,"They APPRECIATE your SENSITIVE ATTITUDE.","appreciate, sensitive, attitude","-ate verb · -itive · -itude"],
  [3,14,"The OFFICIAL CONCLUSION was a PLEASANT SURPRISE.","official, conclusion, pleasant, surprise","-ial, -sion · two-syllable adjective · noun stressed on the root"],
  [3,15,"Please TURN OFF the WASHING MACHINE; it’s DIFFICULT to CONCENTRATE.","turn off, washing machine, difficult, concentrate","two-word verb · compound noun · first syllable · -ate verb"],
];

/* ✂ */

function setup() {
  Object.keys(SHEETS).forEach(function (k) { sheet_(k); });
  const rubric = sheet_('rubric');
  if (rubric.getLastRow() < 2) {
    rubric.getRange(2, 1, RUBRIC.length, RUBRIC[0].length).setValues(RUBRIC);
  }
  const readings = sheet_('readings');
  if (readings.getLastRow() > 1) {
    readings.getRange(2, 1, readings.getLastRow() - 1, readings.getLastColumn()).clearContent();
  }
  readings.getRange(2, 1, READINGS_ROWS.length, READINGS_ROWS[0].length).setValues(READINGS_ROWS);
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
