import { test } from 'node:test';
import assert from 'node:assert/strict';
import { READINGS, RESPONSES, PREP, RESPONSE, buildTimeline, timedSeconds, plain, targets, caps, ruleOf, words } from '../js/format.js';
import { fmt } from '../js/clock.js';
import { syllables, syllablesOf } from './syllables.mjs';

const byId = (id) => READINGS.find((r) => r.id === id);
const pairs = (r) => r.sentences.map((s) => [...s.tests].sort().join(' + '));
const uses = (r) => {
  const n = {};
  r.sentences.flatMap((s) => s.tests).forEach((t) => (n[t] = (n[t] || 0) + 1));
  return n;
};
const repeated = (list) => list.filter((x, i) => list.indexOf(x) !== i);

test('five readings, each with 60 seconds to prepare and 60 to read', () => {
  const steps = buildTimeline();
  assert.equal(steps[0].type, 'intro');
  assert.match(steps[0].say, /five readings/);
  assert.deepEqual(READINGS.map((r) => r.title), ['Vowels', 'Consonants', '-ed and -s endings', 'Connected speech', 'Word stress']);
  assert.deepEqual(
    steps.filter((s) => s.seconds).map((s) => `${s.type}:${s.reading}:${s.seconds}`),
    READINGS.flatMap((r) => [`prep:${r.id}:60`, `response:${r.id}:60`]),
  );
  assert.equal(PREP, 60);
  assert.equal(RESPONSE, 60);
  assert.equal(timedSeconds(steps), 600);
  assert.deepEqual(steps.filter((s) => s.type === 'response').map((s) => s.id), RESPONSES.map((r) => r.id));
  // Each reading: its directions, then "Begin preparing now", then "Begin reading aloud now".
  const r4 = steps.findIndex((s) => s.type === 'part' && s.reading === 'r4');
  assert.match(steps[r4].say, /^Reading 4\. Connected speech\. .*60 seconds to prepare.*60 seconds to read/);
  assert.equal(steps[r4 + 1].say, 'Begin preparing now.');
  assert.equal(steps[r4 + 2].say, 'Begin reading aloud now.');
  // The voice says the endings reading's name in words.
  assert.match(steps.find((s) => s.type === 'part' && s.reading === 'r3').say, /^Reading 3\. The endings of the past tense and the plural\./);
  // The sheet keeps the sentences, numbered, with the targets in capitals.
  assert.match(steps[r4 + 2].prompt, /^1\. DID YOU see the new movie at the theater LAST NIGHT\? 2\. /);
});

test('the quick demo shortens every clock but keeps at least 3 seconds', () => {
  assert.deepEqual(buildTimeline({ scale: 0.1 }).filter((s) => s.seconds).map((s) => s.seconds), Array(10).fill(6));
  assert.deepEqual(buildTimeline({ scale: 0.01 }).filter((s) => s.seconds).map((s) => s.seconds), Array(10).fill(3));
});

test('15 separate sentences per reading, each with exactly two targets in bold', () => {
  for (const r of READINGS) {
    assert.equal(r.sentences.length, 15, `${r.id}: ${r.sentences.length} sentences`);
    for (const s of r.sentences) {
      assert.equal(s.text.split('**').length % 2, 1, `unbalanced ** in: ${s.text}`);
      assert.match(plain(s.text), /^[A-Z].*[.?!]$/, `one whole sentence: ${s.text}`);
      assert.doesNotMatch(plain(s.text), /[.?!]\s/, `one sentence per line: ${s.text}`);
      assert.equal(targets(s.text).length, 2, `two targets: ${s.text}`);
      assert.equal(s.tests.length, 2, `what each target tests: ${s.text}`);
      assert.notEqual(s.tests[0], s.tests[1], `two different sounds or rules: ${s.text}`);
    }
  }
});

test('nothing repeats within a reading', () => {
  for (const r of READINGS) {
    const words = r.sentences.flatMap((s) => targets(s.text).map((t) => t.toLowerCase()));
    assert.deepEqual(repeated(words), [], `${r.id}: target words used twice`);
    assert.deepEqual(repeated(pairs(r)), [], `${r.id}: pairs used twice`);
  }
  // Vowels: the 15 vowels of Accurate English Ch. 4, each tested exactly twice.
  const vowels = uses(byId('r1'));
  assert.deepEqual(Object.keys(vowels).sort(), ['/aɪ/', '/aʊ/', '/eɪ/', '/i/', '/oʊ/', '/u/', '/æ/', '/ɑ/', '/ɔ/', '/ɔɪ/', '/ɚ/', '/ɛ/', '/ɪ/', '/ʊ/', '/ʌ/'].sort());
  assert.ok(Object.values(vowels).every((n) => n === 2), JSON.stringify(vowels));
  // Consonants: no consonant more than twice.
  assert.ok(Object.values(uses(byId('r2'))).every((n) => n <= 2), JSON.stringify(uses(byId('r2'))));
  // Endings: the 15 sentences are the 15 pairs of the six pronunciations.
  const six = ['-ed = /t/', '-ed = /d/', '-ed = /ɪd/', '-s = /s/', '-s = /z/', '-s = /ɪz/'];
  assert.deepEqual(Object.keys(uses(byId('r3'))).sort(), [...six].sort());
  const all = six.flatMap((a, i) => six.slice(i + 1).map((b) => [a, b].sort().join(' + ')));
  assert.deepEqual([...pairs(byId('r3'))].sort(), all.sort());
  // Connected speech and word stress: 30 different adjustments / rules.
  for (const id of ['r4', 'r5']) assert.equal(Object.keys(uses(byId(id))).length, 30, id);
});

test('each reading fits its minute', () => {
  // A learner reading steadily says about 3.5 syllables a second and pauses
  // briefly between sentences: every reading should take most of the minute,
  // not more.
  for (const r of READINGS) {
    const syl = r.sentences.reduce((n, s) => n + syllablesOf(plain(s.text)), 0);
    const seconds = syl / 3.5 + 0.4 * (r.sentences.length - 1);
    assert.ok(syl >= 160 && syl <= 190, `${r.id}: ${syl} syllables`);
    assert.ok(seconds >= 50 && seconds <= 60, `${r.id}: about ${Math.round(seconds)} s`);
    assert.ok(words(r).length >= 90 && words(r).length <= 160, `${r.id}: ${words(r).length} words`);
  }
});

test('word stress targets have more than one syllable', () => {
  for (const s of byId('r5').sentences) {
    for (const t of targets(s.text)) assert.ok(syllablesOf(t) >= 2, `${t} has one syllable`);
  }
});

test('helpers: plain text, targets, capitals, rules, syllables', () => {
  const s = { text: '**Did you** **stay up** last night?', tests: ['palatalization', '/y/ glide'] };
  assert.equal(plain(s.text), 'Did you stay up last night?');
  assert.deepEqual(targets(s.text), ['Did you', 'stay up']);
  assert.equal(caps(s.text), 'DID YOU STAY UP last night?');
  assert.equal(ruleOf(s), 'Did you: palatalization · stay up: /y/ glide');
  assert.deepEqual(['home', 'looked', 'decided', 'washes', 'hopes', 'usually', 'technique', 'little'].map(syllables), [1, 1, 3, 2, 1, 4, 2, 2]);
});

test('the clock shows mm:ss and rounds up', () => {
  assert.equal(fmt(60), '01:00');
  assert.equal(fmt(44.2), '00:45');
  assert.equal(fmt(0.01), '00:01');
  assert.equal(fmt(-1), '00:00');
});
