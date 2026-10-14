/* ── Phonology Exam · parte 2 de 10 ── */

/* Each reading has 15 sentences with two targets each: 30 targets. The
   rubric has a column per reading, from the descriptors of its kind. */
const RUBRIC_KINDS = {
  vowels: [
    'At least 27 of the 30 target vowels are right and clearly different (sleep ≠ slip, cut ≠ caught).',
    '20 to 26 vowels right; some pairs sound the same.',
    '10 to 19 vowels right.',
  ],
  consonants: [
    'At least 27 of the 30 target consonants are right (price ≠ prize, thought ≠ taught).',
    '20 to 26 consonants right; some pairs sound the same.',
    '10 to 19 consonants right.',
  ],
  endings: [
    'At least 27 of the 30 endings are right: /t/, /d/ or /ɪd/; /s/, /z/ or /ɪz/.',
    '20 to 26 endings right; some are dropped or get an extra vowel.',
    '10 to 19 endings right.',
  ],
  connected: [
    'At least 27 of the 30 adjustments are made: linking, assimilation, deletion, reductions.',
    '20 to 26 adjustments made; some phrases are read word by word.',
    '10 to 19 adjustments made; the reading is choppy.',
  ],
  stress: [
    'At least 27 of the 30 words are stressed on the right syllable, with the others reduced.',
    '20 to 26 words stressed right.',
    '10 to 19 words stressed right.',
  ],
};

function rubric_() {
  return ['3', '2', '1', '0'].map(function (score, i) {
    return [score].concat(READINGS_META.map(function (r) {
      return i < 3 ? RUBRIC_KINDS[r[2]][i] : 'Fewer than 10, no reading, or it can’t be understood.';
    }));
  });
}

/* ── fin de la parte 2 de 10 ── */
