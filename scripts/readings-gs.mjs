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

export function rowsBlock() {
  return `const READINGS_ROWS = [\n${readingRows().map((row) => `  ${JSON.stringify(row)},`).join('\n')}\n];`;
}

export const ROWS_RE = /const READINGS_ROWS = \[\n[\s\S]*?\n\];/;

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const code = readFileSync(SRC, 'utf8');
  if (!ROWS_RE.test(code)) throw new Error('READINGS_ROWS not found in Code.gs');
  writeFileSync(SRC, code.replace(ROWS_RE, rowsBlock()));
  console.log(`Code.gs: ${readingRows().length} sentences`);
}
