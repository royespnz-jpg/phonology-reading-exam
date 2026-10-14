import { test } from 'node:test';
import assert from 'node:assert/strict';
import { READINGS, RESPONSES, PREP, RESPONSE, buildTimeline, timedSeconds, plain, targets, caps, words } from '../js/format.js';
import { fmt } from '../js/clock.js';
import { syllables, syllablesOf } from './syllables.mjs';

test('three readings, each with 60 seconds to prepare and 60 to read', () => {
  const steps = buildTimeline();
  assert.equal(steps[0].type, 'intro');
  assert.deepEqual(
    steps.filter((s) => s.seconds).map((s) => `${s.type}:${s.reading}:${s.seconds}`),
    ['prep:r1:60', 'response:r1:60', 'prep:r2:60', 'response:r2:60', 'prep:r3:60', 'response:r3:60'],
  );
  assert.equal(PREP, 60);
  assert.equal(RESPONSE, 60);
  assert.equal(timedSeconds(steps), 360);
  assert.deepEqual(steps.filter((s) => s.type === 'response').map((s) => s.id), RESPONSES.map((r) => r.id));
  assert.deepEqual(READINGS.map((r) => r.title), ['Vowels and consonants', 'Connected speech', 'Word stress']);
  // Each reading: its directions, then "Begin preparing now", then "Begin reading aloud now".
  const r2 = steps.findIndex((s) => s.type === 'part' && s.reading === 'r2');
  assert.match(steps[r2].say, /^Reading 2\. Connected speech\. .*60 seconds to prepare.*60 seconds to read/);
  assert.equal(steps[r2 + 1].say, 'Begin preparing now.');
  assert.equal(steps[r2 + 2].say, 'Begin reading aloud now.');
  // The sheet keeps the sentences, numbered, with the targets in capitals.
  assert.match(steps[r2 + 2].prompt, /^1\. DID YOU STAY UP LAST NIGHT\? 2\. WOULD YOU /);
});

test('the quick demo shortens every clock but keeps at least 3 seconds', () => {
  assert.deepEqual(buildTimeline({ scale: 0.1 }).filter((s) => s.seconds).map((s) => s.seconds), [6, 6, 6, 6, 6, 6]);
  assert.deepEqual(buildTimeline({ scale: 0.01 }).filter((s) => s.seconds).map((s) => s.seconds), [3, 3, 3, 3, 3, 3]);
});

test('each reading is a list of separate sentences with the targets in bold', () => {
  const all = new Set();
  for (const r of READINGS) {
    assert.ok(r.sentences.length >= 10 && r.sentences.length <= 13, `${r.id}: ${r.sentences.length} sentences`);
    for (const s of r.sentences) {
      assert.equal(s.text.split('**').length % 2, 1, `unbalanced ** in: ${s.text}`);
      assert.match(plain(s.text), /^[A-Z].*[.?!]$/, `one whole sentence: ${s.text}`);
      assert.doesNotMatch(plain(s.text), /[.?!]\s/, `one sentence per line: ${s.text}`);
      assert.ok(targets(s.text).length >= 2, `targets in bold: ${s.text}`);
      assert.ok(s.rule && s.rule.length > 3, `what it tests: ${s.text}`);
      assert.ok(!all.has(plain(s.text)), `repeated: ${s.text}`);
      all.add(plain(s.text));
    }
  }
});

test('each reading fits its minute', () => {
  // A careful learner reads about 3 syllables a second and pauses briefly
  // between sentences: every reading should take most of the minute, not more.
  for (const r of READINGS) {
    const syl = r.sentences.reduce((n, s) => n + syllablesOf(plain(s.text)), 0);
    const seconds = syl / 3 + 0.4 * (r.sentences.length - 1);
    assert.ok(syl >= 135 && syl <= 165, `${r.id}: ${syl} syllables`);
    assert.ok(seconds >= 48 && seconds <= 60, `${r.id}: about ${Math.round(seconds)} s`);
    assert.ok(words(r).length >= 75 && words(r).length <= 130, `${r.id}: ${words(r).length} words`);
  }
});

test('word stress targets have more than one syllable', () => {
  const r3 = READINGS.find((r) => r.id === 'r3');
  for (const s of r3.sentences) {
    for (const t of targets(s.text)) assert.ok(syllablesOf(t) >= 2, `${t} has one syllable`);
  }
});

test('helpers: plain text, targets, capitals, syllables', () => {
  const s = '**Did you** **stay up** last night?';
  assert.equal(plain(s), 'Did you stay up last night?');
  assert.deepEqual(targets(s), ['Did you', 'stay up']);
  assert.equal(caps(s), 'DID YOU STAY UP last night?');
  assert.deepEqual(['home', 'looked', 'decided', 'washes', 'hopes', 'usually', 'technique', 'little'].map(syllables), [1, 1, 3, 2, 1, 4, 2, 2]);
});

test('the clock shows mm:ss and rounds up', () => {
  assert.equal(fmt(60), '01:00');
  assert.equal(fmt(44.2), '00:45');
  assert.equal(fmt(0.01), '00:01');
  assert.equal(fmt(-1), '00:00');
});
