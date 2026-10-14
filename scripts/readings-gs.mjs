#!/usr/bin/env node
// Copies the readings of js/format.js into Code.gs (READINGS_ROWS), so the
// teacher's sheet has them on the «Readings» tab. Then split the script again:
//
//   node scripts/readings-gs.mjs && node scripts/split-gs.mjs   (npm run gs)

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { READINGS, caps, targets, ruleOf } from '../js/format.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(ROOT, 'google-apps-script', 'Code.gs');

// One row per sentence: reading, sentence number, the text with the targets
// in CAPITALS, the target words, and what the sentence tests.
export function readingRows() {
  return READINGS.flatMap((r) => r.sentences.map((s, i) => [r.n, i + 1, caps(s.text), targets(s.text).join(', '), ruleOf(s)]));
}

// The rows go in blocks of four readings (60 rows), each in its own part of
// the script, so that every part stays short enough to paste.
const PER_BLOCK = 4;
export function rowsBlock() {
  const rows = readingRows();
  const blocks = [];
  for (let n = 0; n * PER_BLOCK < READINGS.length; n++) {
    const first = n * PER_BLOCK + 1;
    const last = Math.min(READINGS.length, first + PER_BLOCK - 1);
    const mine = rows.filter(([r]) => r >= first && r <= last);
    blocks.push(`const READINGS_ROWS_${n + 1} = [\n${mine.map((row) => `  ${JSON.stringify(row)},`).join('\n')}\n];`);
  }
  return [
    '/* readings:start */',
    '/* The readings, as the page shows them (the words in CAPITALS are the targets),',
    '   and what each target tests. Made from js/format.js: npm run gs. */',
    blocks.join('\n\n/* ✂ */\n\n'),
    '',
    `function readingRows_() {\n  return [].concat(${blocks.map((_, n) => `READINGS_ROWS_${n + 1}`).join(', ')});\n}`,
    '/* readings:end */',
  ].join('\n');
}

export const ROWS_RE = /\/\* readings:start \*\/[\s\S]*?\/\* readings:end \*\//;

// id, title and kind of each reading (the rubric and the sheet's labels).
export const metaRows = () => READINGS.map((r) => [r.id, r.title, r.kind]);
export const metaBlock = () => `const READINGS_META = [\n${metaRows().map((row) => `  ${JSON.stringify(row)},`).join('\n')}\n];`;
export const META_RE = /const READINGS_META = \[\n[\s\S]*?\];/;

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const code = readFileSync(SRC, 'utf8');
  if (!ROWS_RE.test(code)) throw new Error('the readings block (readings:start … readings:end) is not in Code.gs');
  if (!META_RE.test(code)) throw new Error('READINGS_META not found in Code.gs');
  writeFileSync(SRC, code.replace(ROWS_RE, rowsBlock()).replace(META_RE, metaBlock()));
  console.log(`Code.gs: ${readingRows().length} sentences`);
}
