// The exam: five readings aloud — vowels, consonants, the -ed and -s endings,
// connected speech and word stress — each with 60 seconds to prepare and 60
// seconds to read. Each reading has 15 separate sentences, and each sentence
// has exactly two targets in **bold**; `tests` says what each one tests, in the
// same order (the teacher sees it; students don't). Within a reading no pair
// of targets is used twice: every vowel is tested twice and every consonant at
// most twice; the 15 sentences of the endings reading are the 15 pairs of /t/,
// /d/, /ɪd/, /s/, /z/, /ɪz/; and the connected speech and word stress readings
// each test 30 different adjustments or rules (from CS and ST). No target
// word is used twice in the whole exam. Each reading has about 170–185
// syllables: under a minute at a steady learner's pace (≈ 3.5 syllables a
// second with a short pause between sentences). The sentences are new; their
// words and rules come only from the chapters below.
//
// Sources: Dauer, Accurate English — Ch. 4 Vowels in Detail, Ch. 14 <ed> and
// <s> Endings, Ch. 15 Consonants in Detail, Ch. 6–7 Stress; Celce-Murcia et
// al., Teaching Pronunciation — Ch. 5 Connected Speech; Prator & Robinett,
// Manual of American English Pronunciation — Lesson 16 The Sandhi of Spoken
// English.

export const PREP = 60;
export const RESPONSE = 60;

// The adjustments of connected speech (Celce-Murcia Ch. 5; Prator & Robinett
// L16; Accurate English 15.11) and the stress rules (Accurate English Ch. 6–7)
// the targets can test. The connected speech and word stress readings each use
// 30 of them, none twice.
export const CS = {
  pal_dy: 'palatalization: /d/ + /y/ → /dʒ/',
  pal_ty: 'palatalization: /t/ + /y/ → /tʃ/',
  pal_sy: 'palatalization: /s/ + /y/ → /ʃ/',
  pal_zy: 'palatalization: /z/ + /y/ → /ʒ/',
  glide_y: 'linking with a /y/ glide',
  glide_w: 'linking with a /w/ glide',
  cv: 'consonant + vowel linking',
  resyl: 'resyllabification',
  gem: 'gemination (one long consonant)',
  unrel: 'unreleased stop',
  prog: 'progressive assimilation',
  n_m: 'regressive assimilation: /n/ → /m/',
  n_ng: 'regressive assimilation: /n/ → /ŋ/',
  place: 'regressive assimilation: /d/, /t/ → /b/, /g/, /p/, /k/',
  sib: 'regressive assimilation: /s/, /z/ + /ʃ/ → /ʃ/',
  manner: 'assimilation: give me → gimme, let me → lemme',
  contr: 'contraction (blend)',
  del_nt: 'deletion of /t/ after /n/',
  del_3: 'deletion of /t/ or /d/ in a cluster of three',
  del_wb: 'deletion of /t/ or /d/ between words',
  syncope: 'syncope (a lost unstressed vowel)',
  del_r: 'disappearing /r/',
  del_v: 'deletion of /v/ in “of”',
  del_h: 'deletion of /h/ in he, him, her, his',
  del_th: 'deletion of /ð/ in them',
  flap: 'flap /t/',
  epen: 'epenthesis: an added /t/ or /p/',
  weak: 'weak form of a function word',
  syll: 'syllabic consonant',
  gonna: 'reduction: going to → gonna',
  wanna: 'reduction: want to → wanna',
  gotta: 'reduction: got to → gotta',
  hafta: 'reduction: have to, has to → hafta, hasta',
  usta: 'reduction: used to → usta',
  oughta: 'reduction: ought to → oughta',
  kinda: 'reduction: kind of → kinda',
  dodid: 'reduction: what do you → whaddaya',
};

export const ST = {
  ee: 'stressed suffix -ee',
  eer: 'stressed suffix -eer',
  ese: 'stressed suffix -ese',
  ique: 'stressed suffix -ique',
  ette: 'stressed suffix -ette',
  ain: 'stressed suffix -ain (verbs)',
  esque: 'stressed suffix -esque',
  ion: 'stress before -ion',
  ic: 'stress before -ic',
  ical: 'stress before -ical',
  ity: 'stress before -ity',
  ial: 'stress before -ial',
  ian: 'stress before -ian',
  ious: 'stress before -ious',
  ify: 'stress before -ify',
  itive: 'stress before -itive',
  itude: 'stress before -itude',
  logy: 'stress before -logy',
  graphy: 'stress before -graphy',
  ual: 'stress before -ual',
  cient: 'stress before -cient',
  uous: 'stress before -uous',
  ate_v: '-ate verb: two syllables before the suffix',
  ate_a: '-ate adjective or noun: two syllables before the suffix',
  ize: '-ize: two syllables before the suffix',
  ary: '-ary: two syllables before the suffix',
  n2: 'two-syllable noun: first syllable',
  v2: 'two-syllable verb with a prefix: on the root',
  a2: 'two-syllable adjective with a prefix: on the root',
  first2: 'two-syllable verb or adjective without a prefix: first syllable',
  noun_root: 'noun stressed on the root (exception)',
  foreign: 'borrowed word: last syllable',
  compound: 'compound noun: first word',
  twoword: 'two-word verb: last word',
  reflexive: 'reflexive pronoun: last syllable',
  long1: 'long noun or adjective: first syllable',
  root1: 'first syllable of the root',
  neutral: 'neutral suffix (-ful, -al, -ment…): the stress does not move',
  nv_n: 'noun–verb pair: noun on the first syllable',
  nv_v: 'noun–verb pair: verb on the root',
  inter: 'verb with inter-, over-, under-: on the root',
  disappear: 'a syllable disappears after the stress',
};

export const READINGS = [
  {
    id: 'r1',
    n: 1,
    kind: 'vowels',
    title: 'Vowels',
    focus: 'the vowel sounds',
    sentences: [
      { text: 'We **need** a **big** table for the family party tonight.', tests: ['/i/', '/ɪ/'] },
      { text: 'Please write your name with a **pen**, not with a **pin**.', tests: ['/ɛ/', '/ɪ/'] },
      { text: 'We had to **wait** a long time on the **wet** grass.', tests: ['/eɪ/', '/ɛ/'] },
      { text: '**Eight** **people** came to the meeting at the library.', tests: ['/eɪ/', '/i/'] },
      { text: 'Put on your **hat**, because it is very **hot** outside.', tests: ['/æ/', '/ɑ/'] },
      { text: 'The new **curtain** in her room is made of **cotton**.', tests: ['/ɚ/', '/ɑ/'] },
      { text: 'A little **bird** ate a **bug** on the branch of the tree.', tests: ['/ɚ/', '/ʌ/'] },
      { text: 'I left my **cup** and my **cap** on the table at school.', tests: ['/ʌ/', '/æ/'] },
      { text: 'My parents **bought** a small **boat** last summer.', tests: ['/ɔ/', '/oʊ/'] },
      { text: '**Joe** is coming home from college in **June**.', tests: ['/oʊ/', '/u/'] },
      { text: 'The swimming **pool** was **full** of happy children.', tests: ['/u/', '/ʊ/'] },
      { text: 'I **could** **walk** to school when I was younger.', tests: ['/ʊ/', '/ɔ/'] },
      { text: 'The **child** lives in a big **house** near the river.', tests: ['/aɪ/', '/aʊ/'] },
      { text: 'The **crowd** made a lot of **noise** after the game.', tests: ['/aʊ/', '/ɔɪ/'] },
      { text: 'The **boy** wants to **buy** a new bike for his birthday.', tests: ['/ɔɪ/', '/aɪ/'] },
    ],
  },
  {
    id: 'r2',
    n: 2,
    kind: 'consonants',
    title: 'Consonants',
    focus: 'the consonant sounds',
    sentences: [
      { text: 'What is the **price** of the **prize** for the winner?', tests: ['/s/', '/z/'] },
      { text: 'He **thought** about the lesson that the teacher **taught**.', tests: ['/θ/', '/t/'] },
      { text: '**They** will come back to the city another **day**.', tests: ['/ð/', '/d/'] },
      { text: 'Only a **few** people could enjoy the **view** from the hill.', tests: ['/f/', '/v/'] },
      { text: 'Please **share** your **chair** with the new student.', tests: ['/ʃ/', '/tʃ/'] },
      { text: 'Everybody **cheered** when the **judge** read the result.', tests: ['/tʃ/', '/dʒ/'] },
      { text: 'The **major** had a long meeting with the **mayor**.', tests: ['/dʒ/', '/y/'] },
      { text: 'It is a **pleasure** to work with such **pleasant** people.', tests: ['/ʒ/', '/z/'] },
      { text: 'She bought the **best** **vest** in the whole store.', tests: ['/b/', '/v/'] },
      { text: '**Wendy** **bet** ten dollars on the soccer game.', tests: ['/w/', '/b/'] },
      { text: 'The **hall** is on the second **floor** of the building.', tests: ['/h/', '/f/'] },
      { text: 'Turn **right** at the next traffic **light**, and then stop.', tests: ['/r/', '/l/'] },
      { text: 'The **king** **knows** the answer to every question.', tests: ['/ŋ/', '/n/'] },
      { text: '**Some** people like to sit in the **sun** all afternoon.', tests: ['/m/', '/n/'] },
      { text: 'I **think** this old boat is going to **sink**.', tests: ['/θ/', '/s/'] },
    ],
  },
  {
    id: 'r3',
    n: 3,
    kind: 'endings',
    title: '-ed and -s endings',
    spoken: 'The endings of the past tense and the plural',
    focus: 'how you say the endings of the past tense and the plural',
    sentences: [
      { text: 'He **walked** home from work and **called** his mother.', tests: ['-ed = /t/', '-ed = /d/'] },
      { text: 'We **finished** the test early and **visited** the museum.', tests: ['-ed = /t/', '-ed = /ɪd/'] },
      { text: 'They **returned** to the hotel and **decided** to rest.', tests: ['-ed = /d/', '-ed = /ɪd/'] },
      { text: 'Mark **thinks** that his two **dogs** are hungry again.', tests: ['-s = /s/', '-s = /z/'] },
      { text: 'She **takes** three **classes** on Monday and Friday.', tests: ['-s = /s/', '-s = /ɪz/'] },
      { text: 'He **loves** the chicken **sandwiches** at school.', tests: ['-s = /z/', '-s = /ɪz/'] },
      { text: 'Kate **helped** the teacher check the **results** of the test.', tests: ['-ed = /t/', '-s = /s/'] },
      { text: 'The children **laughed** at the funny **animals** at the zoo.', tests: ['-ed = /t/', '-s = /z/'] },
      { text: 'The whole family **watched** the **dances** at the festival.', tests: ['-ed = /t/', '-s = /ɪz/'] },
      { text: 'We **planned** a long trip across three **states** last year.', tests: ['-ed = /d/', '-s = /s/'] },
      { text: 'She **opened** a box of warm winter **gloves** for her son.', tests: ['-ed = /d/', '-s = /z/'] },
      { text: 'He **enjoyed** the **exercises** in class.', tests: ['-ed = /d/', '-s = /ɪz/'] },
      { text: 'My little sister **wanted** some of the **chocolates**.', tests: ['-ed = /ɪd/', '-s = /s/'] },
      { text: 'The tired boys **waited** a long time for their **rides**.', tests: ['-ed = /ɪd/', '-s = /z/'] },
      { text: 'We **needed** two big **suitcases** for the trip.', tests: ['-ed = /ɪd/', '-s = /ɪz/'] },
    ],
  },
  {
    id: 'r4',
    n: 4,
    kind: 'connected',
    title: 'Connected speech',
    focus: 'how the words join and change together',
    sentences: [
      { text: '**Did you** see the new movie at the theater **last night**?', tests: [CS.pal_dy, CS.del_wb] },
      { text: 'I’m **going to** **stay up** late to finish my homework.', tests: [CS.gonna, CS.glide_y] },
      { text: '**Give me** a big piece of that **chocolate** cake, please.', tests: [CS.manner, CS.syncope] },
      { text: 'We **have to** **go away** for a week in December.', tests: [CS.hafta, CS.glide_w] },
      { text: '**Is your** older brother **twenty** years old?', tests: [CS.pal_zy, CS.del_nt] },
      { text: '**I’ll** buy **lots of** flowers for my grandmother.', tests: [CS.contr, CS.del_v] },
      { text: 'The little kids **keep out** of the **football** field.', tests: [CS.cv, CS.unrel] },
      { text: 'The **good boy** **had to** wait outside the classroom.', tests: [CS.place, CS.prog] },
      { text: 'I know **what you** **want to** say to the teacher.', tests: [CS.pal_ty, CS.wanna] },
      { text: '**His shirt** has a **big gap** in the back.', tests: [CS.sib, CS.gem] },
      { text: 'We **used to** go skiing in the mountains every **February**.', tests: [CS.usta, CS.del_r] },
      { text: 'The **water** in the lake is **kind of** cold today.', tests: [CS.flap, CS.kinda] },
      { text: 'You **can go** to the party if you **ask her** first.', tests: [CS.n_ng, CS.del_h] },
      { text: 'I’ve **got to** thank them all for their **kindness**.', tests: [CS.gotta, CS.del_3] },
      { text: 'You **can buy** a ticket, but **find out** the price first.', tests: [CS.n_m, CS.resyl] },
    ],
  },
  {
    id: 'r5',
    n: 5,
    kind: 'stress',
    title: 'Word stress',
    focus: 'the stressed syllable of each word',
    sentences: [
      { text: 'The new **employee** has a **unique** idea.', tests: [ST.ee, ST.ique] },
      { text: 'Our **volunteer** speaks **Japanese** at home.', tests: [ST.eer, ST.ese] },
      { text: 'The band will **entertain** us at a **picturesque** hotel.', tests: [ST.ain, ST.esque] },
      { text: 'Smoking a **cigarette** is a bad **decision**.', tests: [ST.ette, ST.ion] },
      { text: '**Physical** exercise is a **fantastic** way to relax.', tests: [ST.ical, ST.ic] },
      { text: 'The **official** **publicity** starts today.', tests: [ST.ial, ST.ity] },
      { text: 'The **Canadian** restaurant serves **delicious** food.', tests: [ST.ian, ST.ious] },
      { text: 'Please **classify** these **sensitive** files.', tests: [ST.ify, ST.itive] },
      { text: 'Her **attitude** toward **biology** changed this year.', tests: [ST.itude, ST.logy] },
      { text: '**Geography** helps us **appreciate** other cultures.', tests: [ST.graphy, ST.ate_v] },
      { text: 'The **secretary** made a small **mistake** in the letter.', tests: [ST.ary, ST.noun_root] },
      { text: 'Please **apologize** to your **mother** for being late.', tests: [ST.ize, ST.n2] },
      { text: 'The **newspaper** says that prices will **increase** again.', tests: [ST.compound, ST.nv_v] },
      { text: 'Please **pick up** the **beautiful** flowers.', tests: [ST.twoword, ST.neutral] },
      { text: 'We **introduce** **ourselves** on the first day.', tests: [ST.root1, ST.reflexive] },
    ],
  },
];

export const INTRO =
  'This is the phonology reading test. It has five readings: vowels, consonants, the endings of the past tense and the plural, connected speech, and word stress. ' +
  'For each reading you will have sixty seconds to prepare and sixty seconds to read the sentences aloud. ' +
  'The test runs by itself. Your microphone turns on when it is time to read and turns off when the time is up. You cannot pause or go back.';

export const directions = (r) =>
  `In this part of the test, you will read aloud the sentences on the screen. Pay attention to the words in bold: ${r.focus}. ` +
  `You will have ${PREP} seconds to prepare. Then you will have ${RESPONSE} seconds to read the sentences aloud.`;

// The recorded answers, in order.
export const RESPONSES = READINGS.map((r) => ({ id: r.id, label: `Reading ${r.n}`, short: String(r.n), title: r.title }));

// "**word**" → the plain text (what the teacher's sheet keeps) and the targets.
export const plain = (s) => s.replace(/\*\*/g, '');
export const targets = (s) => [...s.matchAll(/\*\*(.+?)\*\*/g)].map((m) => m[1]);
export const caps = (s) => s.replace(/\*\*(.+?)\*\*/g, (m, w) => w.toUpperCase());
// What a sentence tests, target by target: "pen: /ɛ/ · pin: /ɪ/".
export const ruleOf = (s) => targets(s.text).map((t, i) => `${t}: ${s.tests[i]}`).join(' · ');
export const words = (r) => r.sentences.map((s) => plain(s.text)).join(' ').match(/[A-Za-z’']+/g) || [];

// Every step of the exam, in order. `scale` shortens the clocks (quick tests of the page).
//   intro     – general directions, spoken
//   part      – a reading's directions, spoken (the sentences are not shown yet)
//   prep      – preparation time on the clock; the sentences appear
//   response  – the microphone records for `seconds`
export function buildTimeline({ scale = 1 } = {}) {
  const t = (s) => Math.max(3, Math.round(s * scale));
  const steps = [{ type: 'intro', say: INTRO }];
  for (const r of READINGS) {
    steps.push({ type: 'part', reading: r.id, say: `Reading ${r.n}. ${r.spoken || r.title}. ${directions(r)}` });
    steps.push({ type: 'prep', reading: r.id, seconds: t(PREP), say: 'Begin preparing now.' });
    steps.push({
      type: 'response',
      reading: r.id,
      id: r.id,
      seconds: t(RESPONSE),
      say: 'Begin reading aloud now.',
      prompt: r.sentences.map((s, i) => `${i + 1}. ${caps(s.text)}`).join(' '),
    });
  }
  return steps;
}

// How long the exam takes, in seconds, not counting the spoken directions.
export function timedSeconds(steps) {
  return steps.reduce((n, s) => n + (s.seconds || 0), 0);
}
