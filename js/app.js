import { READINGS, RESPONSES, INTRO, buildTimeline, timedSeconds, directions, PREP, RESPONSE } from './format.js';
import { clockHtml, runClock, idleClock, fmt } from './clock.js';
import { unlockAudio, beep, speak, stopSpeaking, openMicrophone, closeMicrophone, levelMeter, startRecording } from './audio.js';
import { scriptUrl, saveScriptUrl, isScriptUrl, ping, report, enqueue, onUpload, pendingUploads, resumeUploads } from './api.js';
import { saveRecording, allRecordings } from './store.js';

const app = document.getElementById('app');
const params = new URLSearchParams(location.search);
// ?demo=1: the teacher's try-out, with the real clocks; the sheet marks it "demo".
const DEMO = params.has('demo');
// ?quick=1 shortens every clock to 10 % (for testing the page only).
const SCALE = params.has('quick') ? 0.1 : 1;
const SESSION = 'phon.session';

const esc = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
// "**word**" → <b>word</b>
const bold = (s) => esc(s).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');

let S = null; // the student's exam: { student, group, attempt, steps, stepIndex, done, leftPage, resumed, finished }

function persist() {
  if (!S) return;
  const { steps, ...keep } = S;
  try {
    sessionStorage.setItem(SESSION, JSON.stringify(keep));
  } catch {
    /* storage unavailable */
  }
}

function savedSession() {
  try {
    return JSON.parse(sessionStorage.getItem(SESSION) || 'null');
  } catch {
    return null;
  }
}

function clearSession() {
  try {
    sessionStorage.removeItem(SESSION);
  } catch {
    /* storage unavailable */
  }
}

const newId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
const who = () => `${esc(S.student)}${S.group ? ` · ${esc(S.group)}` : ''}`;

// ─── 1 · start ──────────────────────────────────────────────────────────────

function renderStart(error = '') {
  const saved = S || {};
  app.innerHTML = `<main class="screen start">
    <section class="start-hero">
      <p class="eyebrow">Phonology Reading Exam${DEMO ? ' · <b>demo</b>' : ''}</p>
      <h1>Read when the clock says so.</h1>
      <p class="lede">Three readings, sentence by sentence. A clock counts down ${PREP} seconds to prepare; when it reaches zero
        you hear a beep, your microphone turns on, and it records for ${RESPONSE} seconds while you read aloud.
        Pay attention to the words in <b>bold</b>.</p>
      <ol class="parts-overview">
        ${READINGS.map(
          (r) => `<li><span class="po-label">Reading ${r.n}</span><span class="po-title">${esc(r.title)}</span>
            <span class="po-time">${PREP} s to prepare · ${RESPONSE} s to read</span></li>`,
        ).join('')}
      </ol>
    </section>
    <form class="card start-form" data-start novalidate>
      <h2>Your details</h2>
      <label>Full name<input name="student" required maxlength="80" autocomplete="name" value="${esc(saved.student || '')}"></label>
      <p class="form-error" data-error role="alert">${esc(error)}</p>
      <button class="btn primary big" type="submit">Continue</button>
      <p class="muted small">${scriptUrl() ? 'Your recordings go to your teacher’s Google Drive.' : 'This exam is not connected to your teacher’s sheet yet.'}
        · <a href="#teacher">Teacher</a></p>
    </form>
  </main>`;
}

function submitStart(form) {
  const data = Object.fromEntries(new FormData(form));
  const err = form.querySelector('[data-error]');
  if (!String(data.student || '').trim()) {
    err.textContent = 'Write your full name.';
    return;
  }
  S = {
    student: data.student.trim(),
    // Students only write their name. A teacher's link with ?g=<group> still
    // files the recordings by group.
    group: String(params.get('g') || '').trim().slice(0, 40),
    attempt: newId(),
    steps: buildTimeline({ scale: SCALE }),
    stepIndex: 0,
    done: [],
    leftPage: 0,
    resumed: 0,
  };
  persist();
  renderCheck();
}

// ─── 2 · microphone and sound check ─────────────────────────────────────────

let stopMeter = () => {};

function meterHtml() {
  return `<div class="meter" aria-hidden="true">${'<i></i>'.repeat(14)}</div>`;
}

function showLevel(el, level) {
  const bars = el.querySelectorAll('.meter i');
  const lit = Math.round(level * bars.length);
  bars.forEach((b, i) => b.classList.toggle('on', i < lit));
}

function renderCheck(resuming = false) {
  const total = timedSeconds(S.steps);
  app.innerHTML = `<main class="screen check">
    <header class="check-head">
      <p class="eyebrow">${who()}</p>
      <h1>${resuming ? 'Continue your exam' : 'Check your microphone and sound'}</h1>
      <p class="lede">${
        resuming
          ? 'Your exam was interrupted. It will continue from the reading you were doing.'
          : `About ${Math.round(total / 60) + 2} minutes. Use headphones if you can, in a quiet place.`
      }</p>
    </header>
    <div class="check-grid">
      <section class="card check-step" data-mic-step>
        <span class="step-num">1</span>
        <h2>Microphone</h2>
        <p>Allow the microphone, then say something: the bars should move.</p>
        ${meterHtml()}
        <div class="row"><button type="button" class="btn" data-mic>Allow the microphone</button>
          <button type="button" class="btn ghost" data-test-rec disabled>Record a 3-second test</button></div>
        <p class="status" data-mic-status aria-live="polite"></p>
        <audio data-test-audio controls hidden></audio>
      </section>
      <section class="card check-step">
        <span class="step-num">2</span>
        <h2>Sound</h2>
        <p>You will hear the directions, and a beep before you read.</p>
        <div class="row"><button type="button" class="btn" data-sound>Play the beep and a voice</button></div>
        <p class="status" data-sound-status aria-live="polite"></p>
      </section>
      <section class="card check-step rules">
        <span class="step-num">3</span>
        <h2>Once you start</h2>
        <ul>
          <li>The exam runs by itself. You can’t pause it or go back.</li>
          <li>The sentences appear when the <b>Preparation time</b> starts: read them silently.</li>
          <li>When the clock says <b>Reading time</b>, the microphone is recording: read aloud.</li>
          <li>Stay on this page until the end, when your recordings are sent.</li>
        </ul>
      </section>
    </div>
    <div class="check-go">
      <button type="button" class="btn primary big" data-begin disabled>${resuming ? 'Continue the exam' : 'Start the exam'}</button>
      <button type="button" class="btn ghost" data-back>Back</button>
    </div>
  </main>`;
}

async function allowMic(button) {
  const status = app.querySelector('[data-mic-status]');
  button.disabled = true;
  try {
    await openMicrophone();
    unlockAudio();
    stopMeter();
    const card = app.querySelector('[data-mic-step]');
    stopMeter = levelMeter((l) => showLevel(card, l));
    status.textContent = '✓ The microphone is on.';
    status.className = 'status ok';
    button.textContent = 'Microphone on';
    app.querySelector('[data-test-rec]').disabled = false;
    app.querySelector('[data-begin]').disabled = false;
  } catch (e) {
    button.disabled = false;
    status.textContent = e.message;
    status.className = 'status bad';
  }
}

async function testRecording(button) {
  const status = app.querySelector('[data-mic-status]');
  button.disabled = true;
  status.textContent = 'Recording… say a sentence.';
  const rec = startRecording();
  await new Promise((r) => setTimeout(r, 3000));
  const { blob } = await rec.stop();
  const audio = app.querySelector('[data-test-audio]');
  audio.src = URL.createObjectURL(blob);
  audio.hidden = false;
  audio.play().catch(() => {});
  status.textContent = '✓ Listen to your test. If you can’t hear yourself, check the microphone.';
  status.className = 'status ok';
  button.disabled = false;
}

async function testSound(button) {
  unlockAudio();
  button.disabled = true;
  const status = app.querySelector('[data-sound-status]');
  await beep();
  await speak('This is the sound check. If you can hear this voice, your sound is working.');
  status.textContent = '✓ If you heard the beep and the voice, your sound works.';
  status.className = 'status ok';
  button.disabled = false;
}

// ─── 3 · the exam ───────────────────────────────────────────────────────────

let wakeLock = null;
async function keepAwake() {
  try {
    wakeLock = await navigator.wakeLock?.request('screen');
  } catch {
    /* not supported */
  }
}

function examShell() {
  app.innerHTML = `<div class="stage">
    <header class="stage-top">
      <div class="brand"><span class="dot"></span>Phonology Reading Exam</div>
      <div class="progress">
        <span class="progress-label" data-progress-label>Reading 1 of ${RESPONSES.length}</span>
        <span class="progress-bars" aria-hidden="true">${RESPONSES.map((r) => `<i data-q="${r.id}"></i>`).join('')}</span>
      </div>
      <div class="who">${who()}</div>
    </header>
    <main class="stage-main">
      <section class="task" data-task aria-live="polite"></section>
      <aside class="clock-panel">
        ${clockHtml()}
        <div class="rec" data-rec hidden><span class="rec-dot"></span><b>Recording</b>${meterHtml()}</div>
        <p class="cue" data-cue aria-live="assertive"></p>
      </aside>
    </main>
  </div>`;
  S.done.forEach((id) => app.querySelector(`[data-q="${id}"]`)?.classList.add('done'));
}

// The numbered sentences, with the targets in bold. The teacher's copy also
// says what each sentence tests.
export function readingHtml(r, { rules = false } = {}) {
  const li = (s) => `<li>${bold(s.text)}${rules ? `<small class="rule">${esc(s.rule)}</small>` : ''}</li>`;
  return `<ol class="reading sentences">${r.sentences.map(li).join('')}</ol>`;
}

function taskHtml(step) {
  if (step.type === 'intro') {
    return `<p class="task-label">${who()}</p><h2>Phonology reading test</h2>
      <p class="directions">${esc(INTRO)}</p>`;
  }
  const r = READINGS.find((x) => x.id === step.reading);
  const head = `<p class="task-label">Reading ${r.n} of ${READINGS.length}</p><h2>${esc(r.title)}</h2>`;
  // The sentences appear only when the preparation clock starts: during the
  // directions there is nothing to read, so everyone gets the same 60 seconds.
  if (step.type === 'part') return `${head}<p class="directions"><b>Directions:</b> ${esc(directions(r))}</p>`;
  return head + readingHtml(r);
}

function setCue(text, kind = '') {
  const cue = app.querySelector('[data-cue]');
  cue.textContent = text;
  cue.className = `cue ${kind}`;
}

let running = false;

async function runExam() {
  running = true;
  examShell();
  keepAwake();
  const clock = app.querySelector('.clock');
  const recEl = app.querySelector('[data-rec]');
  if (S.stepIndex === 0) report({ type: 'start', attempt: S.attempt, student: S.student, group: S.group, demo: DEMO || SCALE < 1, startedAt: new Date().toISOString(), userAgent: navigator.userAgent });

  for (let i = S.stepIndex; i < S.steps.length; i++) {
    S.stepIndex = i;
    persist();
    const step = S.steps[i];
    const task = app.querySelector('[data-task]');
    const show = (html) => {
      if (task.dataset.html === html) return;
      task.innerHTML = html;
      task.dataset.html = html;
      // New content starts at the top (on a phone, the page may be scrolled down).
      window.scrollTo({ top: 0 });
    };
    // The sentences appear when the preparation clock starts, after "Begin preparing now".
    if (step.type !== 'prep') show(taskHtml(step));
    // Where the student is: a status, not something to click (the exam goes on by itself).
    app.querySelectorAll('.progress [data-q]').forEach((bar) => bar.classList.toggle('now', bar.dataset.q === step.reading));
    const r = READINGS.find((x) => x.id === step.reading);
    if (r) app.querySelector('[data-progress-label]').textContent = `Reading ${r.n} of ${READINGS.length}`;

    if (step.type === 'intro' || step.type === 'part') {
      idleClock(clock, { phase: 'Listen', time: '··', sub: 'Directions' });
      setCue('Listen to the directions.');
      await speak(step.say);
    } else if (step.type === 'prep') {
      idleClock(clock, { phase: 'Preparation time', time: fmt(step.seconds) });
      setCue(step.say);
      await speak(step.say);
      show(taskHtml(step));
      setCue('Read the sentences silently and prepare.', 'prep');
      await runClock(clock, step.seconds, { mode: 'prep', phase: 'Preparation time', sub: 'Prepare' }).done;
    } else if (step.type === 'response') {
      idleClock(clock, { phase: 'Reading time', time: fmt(step.seconds) });
      setCue(step.say);
      await speak(step.say);
      await beep();
      const rec = startRecording();
      recEl.hidden = false;
      const stop = levelMeter((l) => showLevel(recEl, l));
      setCue('Read aloud now: the microphone is recording.', 'live');
      await runClock(clock, step.seconds, { mode: 'response', phase: 'Reading time', sub: 'Recording' }).done;
      const { blob, seconds } = await rec.stop();
      stop();
      recEl.hidden = true;
      setCue('Time is up.', 'done');
      const meta = RESPONSES.find((r) => r.id === step.id);
      const saved = {
        key: `${S.attempt}:${step.id}`,
        attempt: S.attempt,
        student: S.student,
        group: S.group,
        qid: step.id,
        label: meta.label,
        prompt: step.prompt,
        seconds,
        blob,
        recordedAt: new Date().toISOString(),
        uploaded: false,
      };
      await saveRecording(saved);
      enqueue(saved);
      if (!S.done.includes(step.id)) S.done.push(step.id);
      app.querySelector(`[data-q="${step.id}"]`)?.classList.add('done');
      persist();
      await new Promise((r) => setTimeout(r, 1200));
    }
  }
  running = false;
  S.stepIndex = S.steps.length;
  S.finished = true;
  persist();
  closeMicrophone();
  stopSpeaking();
  wakeLock?.release?.().catch(() => {});
  report({ type: 'finish', attempt: S.attempt, student: S.student, group: S.group, responses: S.done.length, leftPage: S.leftPage, resumed: S.resumed, finishedAt: new Date().toISOString() });
  renderDone();
}

// After a reload: start again from the reading that was interrupted.
function resumeIndex(steps, done) {
  let last = -1;
  steps.forEach((s, i) => s.type === 'response' && done.includes(s.id) && (last = i));
  return last + 1;
}

// ─── 4 · the end ────────────────────────────────────────────────────────────

const STATUS = {
  waiting: 'Waiting…',
  sending: 'Sending…',
  retrying: 'Trying again…',
  sent: '✓ Sent',
  local: 'Saved on this device',
};

async function renderDone() {
  const recs = (await allRecordings()).filter((r) => r.attempt === S.attempt);
  const connected = Boolean(scriptUrl());
  app.innerHTML = `<main class="screen done">
    <p class="eyebrow">${who()}</p>
    <h1 data-done-title>${connected ? 'Sending your recordings…' : 'The exam is over'}</h1>
    <p class="lede" data-done-lede>${
      connected
        ? 'Keep this page open until every reading says “Sent”.'
        : 'This exam isn’t connected to your teacher’s sheet. Download your recordings and send them to your teacher.'
    }</p>
    <ol class="card uploads">
      ${RESPONSES.map((r) => {
        const rec = recs.find((x) => x.qid === r.id);
        const status = !rec ? 'missing' : rec.uploaded ? 'sent' : connected ? 'waiting' : 'local';
        return `<li data-up="${r.id}" data-status="${status}">
          <span class="up-label">${esc(r.label)} · ${esc(r.title)}</span>
          <span class="up-time">${rec ? fmt(Math.round(rec.seconds)) : '—'}</span>
          <span class="up-status">${status === 'missing' ? 'Not recorded' : STATUS[status]}</span>
          ${rec ? `<a class="btn ghost small" download="${esc(S.student)} - ${esc(r.label)}.${/mp4/.test(rec.blob.type) ? 'm4a' : 'webm'}" href="${URL.createObjectURL(rec.blob)}">Download</a>` : ''}
        </li>`;
      }).join('')}
    </ol>
  </main>`;
  updateDone();
}

function updateDone() {
  if (!S?.finished) return;
  const title = app.querySelector('[data-done-title]');
  if (!title || !scriptUrl()) return;
  const rows = [...app.querySelectorAll('[data-up]')];
  const recorded = rows.filter((r) => r.dataset.status !== 'missing');
  if (recorded.length && recorded.every((r) => r.dataset.status === 'sent') && !pendingUploads()) {
    title.textContent = '✓ Your recordings were sent';
    app.querySelector('[data-done-lede]').textContent = 'Your teacher has your recordings. You can close this page.';
    clearSession();
  }
}

onUpload(({ qid, key, status, error }) => {
  if (S && !key.startsWith(`${S.attempt}:`)) return;
  const row = app.querySelector(`[data-up="${qid}"]`);
  if (!row) return;
  row.dataset.status = status;
  row.querySelector('.up-status').textContent = STATUS[status] || status;
  if (error) row.querySelector('.up-status').title = error;
  updateDone();
});

// ─── teacher ────────────────────────────────────────────────────────────────

function renderTeacher(message = '') {
  const url = scriptUrl();
  const base = `${location.origin}${location.pathname}`;
  const link = (extra = '') => `${base}?${url ? `s=${encodeURIComponent(url)}&` : ''}${extra}`.replace(/[?&]$/, '');
  app.innerHTML = `<main class="screen teacher">
    <p class="eyebrow">Teacher</p>
    <h1>Set up the exam</h1>
    <form class="card" data-teacher>
      <h2>1 · Your Google Script</h2>
      <p>Paste the web app URL of the exam’s Google Apps Script (it ends in <code>/exec</code>). Recordings go to your Drive and
        a row for each one to your sheet.</p>
      <div class="row"><input name="url" value="${esc(url)}" placeholder="https://script.google.com/macros/s/…/exec" spellcheck="false">
        <button class="btn" type="button" data-test-script>Test</button><button class="btn primary" type="submit">Save</button></div>
      <p class="status" data-teacher-status aria-live="polite">${esc(message)}</p>
    </form>
    <section class="card">
      <h2>2 · The link for your students</h2>
      <p>It carries your script, so the recordings go to your sheet. Students write their full name and start.</p>
      <div class="link-row"><code>${esc(link())}</code><button class="btn small" data-copy="${esc(link())}">Copy</button></div>
    </section>
    <section class="card">
      <h2>3 · The readings</h2>
      ${READINGS.map((r) => `<h3>Reading ${r.n} · ${esc(r.title)}</h3>${readingHtml(r, { rules: true })}`).join('')}
    </section>
    <section class="card">
      <h2>4 · Try it</h2>
      <p>Try the whole exam with its real clocks (about ${Math.round((READINGS.length * (PREP + RESPONSE)) / 60) + 2} minutes); your
        recordings go to your sheet like a student’s, marked <i>demo</i>.</p>
      <p><a class="btn ghost" href="${esc(link('demo=1'))}">Try the exam</a></p>
    </section>
  </main>`;
}

// ─── events ─────────────────────────────────────────────────────────────────

document.addEventListener('submit', (e) => {
  const form = e.target;
  e.preventDefault();
  if (form.matches('[data-start]')) submitStart(form);
  if (form.matches('[data-teacher]')) {
    const url = String(new FormData(form).get('url') || '').trim();
    if (url && !isScriptUrl(url)) return renderTeacher('That is not an Apps Script web app URL (it ends in /exec).');
    saveScriptUrl(url);
    renderTeacher(url ? '✓ Saved. The link below now sends the recordings to your sheet.' : 'Removed.');
  }
});

document.addEventListener('click', async (e) => {
  const t = e.target.closest('button, a');
  if (!t) return;
  if (t.matches('[data-mic]')) allowMic(t);
  else if (t.matches('[data-test-rec]')) testRecording(t);
  else if (t.matches('[data-sound]')) testSound(t);
  else if (t.matches('[data-back]')) {
    stopMeter();
    closeMicrophone();
    renderStart();
  } else if (t.matches('[data-begin]')) {
    stopMeter();
    unlockAudio();
    runExam();
  } else if (t.matches('[data-copy]')) {
    try {
      await navigator.clipboard.writeText(t.dataset.copy);
      t.textContent = 'Copied';
    } catch {
      t.textContent = 'Select and copy';
    }
  } else if (t.matches('[data-test-script]')) {
    const status = app.querySelector('[data-teacher-status]');
    const url = app.querySelector('[name="url"]').value.trim();
    status.textContent = 'Testing…';
    try {
      const info = await ping(url);
      status.textContent = info.app === 'Phonology Reading Exam' ? `✓ Connected to “${info.sheet}”. Press Save.` : `That is the script of “${info.sheet}”, not the Phonology Reading Exam one.`;
    } catch (err) {
      status.textContent = `Couldn’t connect: ${err.message}`;
    }
  }
});

document.addEventListener('visibilitychange', () => {
  if (!running) return;
  if (document.hidden) {
    S.leftPage++;
    persist();
  } else keepAwake();
});

window.addEventListener('beforeunload', (e) => {
  if (running || (S?.finished && pendingUploads())) {
    e.preventDefault();
    e.returnValue = '';
  }
});

// ─── start ──────────────────────────────────────────────────────────────────

function start() {
  resumeUploads();
  if (location.hash === '#teacher') return renderTeacher();
  const saved = savedSession();
  if (saved && !saved.finished) {
    S = { ...saved, steps: buildTimeline({ scale: SCALE }) };
    S.stepIndex = resumeIndex(S.steps, S.done);
    S.resumed = (S.resumed || 0) + 1;
    persist();
    return renderCheck(true);
  }
  if (saved?.finished) {
    S = { ...saved, steps: buildTimeline({ scale: SCALE }) };
    return renderDone();
  }
  renderStart();
}

window.addEventListener('hashchange', () => !running && start());
start();
