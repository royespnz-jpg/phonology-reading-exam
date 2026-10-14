// The exam: three readings aloud, sentence by sentence, each with 60 seconds
// to prepare and 60 seconds to read. The words in **bold** are the targets the
// teacher listens for (vowels, consonants, -ed/-s endings; connected speech;
// word stress). The sentences are new and independent of each other; their
// target words and rules come only from the chapters below. Each reading has
// about 145–160 syllables: a minute at a careful learner's pace (≈ 3 syllables
// a second with a short pause between sentences). `rule` tells the teacher what
// each sentence tests; students don't see it.
//
// Sources: Dauer, Accurate English — Ch. 4 Vowels in Detail, Ch. 14 <ed> and
// <s> Endings, Ch. 15 Consonants in Detail, Ch. 6–7 Stress; Celce-Murcia et
// al., Teaching Pronunciation — Ch. 5 Connected Speech; Prator & Robinett,
// Manual of American English Pronunciation — Lesson 16 The Sandhi of Spoken
// English.

export const PREP = 60;
export const RESPONSE = 60;

export const READINGS = [
  {
    id: 'r1',
    n: 1,
    title: 'Vowels and consonants',
    focus: 'vowels, consonants, and the -ed and -s endings',
    sentences: [
      { text: '**Luke** **looked** at the **full** **pool** and **decided** to swim.', rule: '/u/ and /ʊ/ · -ed = /t/, /ɪd/' },
      { text: '**Beth** **tasted** the **pepper** and **waited** for the **test** **results**.', rule: '/eɪ/ and /ɛ/ · -ed = /ɪd/ · -s = /s/' },
      { text: 'The **cop** **caught** the **bus**, but his **cat** **stayed** home.', rule: '/ɑ/, /ɔ/, /ʌ/, /æ/ · -ed = /d/' },
      { text: 'He **bought** a **boat** on the **coast**, but it **cost** too much.', rule: '/ɔ/ and /oʊ/' },
      { text: '**Tim** **slipped** on the **street** near the **little** **hospital**.', rule: '/ɪ/ and /i/ · /str/ · dark /l/ · -ed = /t/' },
      { text: '**Three** **thousand** people **thanked** the **mother** of **these** **twins**.', rule: '/θ/ and /ð/ · -ed = /t/ · -s = /z/' },
      { text: '**George** **usually** **measures** the **orange** **juice** in the **garage**.', rule: '/dʒ/ and /ʒ/' },
      { text: '**She** **washes** the **dishes** and **watches** the **ships** from her **chair**.', rule: '/ʃ/ and /tʃ/ · -es = /ɪz/ · -s = /s/' },
      { text: '**Very** **few** **voters** **went** **boating** in the **wet** **weather**.', rule: '/v/, /f/, /b/, /w/' },
      { text: 'A **red** **light** **flashed** on the **right** side of the **road**.', rule: '/r/ and /l/ · /fl/ · -ed = /t/' },
      { text: '**Small** **Spanish** **schools** **start** **studying** in **spring**.', rule: '/s/ + consonant at the beginning of a word (no /e/ before it) · -s = /z/' },
      { text: 'The **king** **thinks** the **young** **singer** **sang** **ten** **songs**.', rule: '/ŋ/, /ŋk/ and /n/ · -s = /s/, /z/' },
      { text: 'The **boy** **enjoyed** the **loud** **noise** of the **crowd**.', rule: '/ɔɪ/ and /aʊ/ · -ed = /d/' },
    ],
  },
  {
    id: 'r2',
    n: 2,
    title: 'Connected speech',
    focus: 'linking, assimilation, deletion and reductions between words',
    sentences: [
      { text: '**Did you** **stay up** **last night**?', rule: 'palatalization (did you) · linking with a /y/ glide · deletion of /t/' },
      { text: '**Would you** **pick it up** and **put it on** the **blackboard**?', rule: 'palatalization · consonant + vowel linking · flap /t/ · unreleased stop' },
      { text: 'You **can buy** a **good bike** **in May**.', rule: 'regressive assimilation: /n/ → /m/, /d/ → /b/' },
      { text: '**Tell him** to **ask her** about that **interesting** **restaurant**.', rule: 'deletion of /h/ · syncope' },
      { text: 'Please **stop pushing**; **there’s** a **big gap** in the **old bridge**.', rule: 'gemination (one long consonant) · contraction · deletion of /d/' },
      { text: '**I’m** **going to** **go away** for a **short time**.', rule: 'contraction · reduction (gonna) · linking with a /w/ glide · gemination' },
      { text: '**Give me** a **sandwich** and **lots of** **vegetables**, please.', rule: 'assimilation (gimme) · /nd/ → /m/ · deletion of /v/ in “of” · syncope' },
      { text: 'My **family** **used to** visit **Toronto** **every** **February**.', rule: 'syncope · regressive assimilation (usta) · deletion of /t/ after /n/ · disappearing /r/' },
      { text: '**Is your** **grandpa** **in Kansas** **this year**?', rule: 'palatalization · /nd/ → /m/ · /n/ → /ŋ/' },
      { text: '**What do you** **want to** **eat at** the **party**?', rule: 'reduced “do you” · reduction (wanna) · linking · flap /t/' },
      { text: '**His shirt** is in **this shop**, but I **can go** **get it**.', rule: '/z/, /s/ + /ʃ/ assimilation · /n/ → /ŋ/ · flap /t/ and linking' },
      { text: 'We **had to** **wait an hour** for the **next bus**.', rule: 'progressive assimilation (had to → /hætə/) · linking · deletion of /t/' },
      { text: 'He **pushed up** his sleeve and **hurt his** **left arm**.', rule: 'resyllabification · deletion of /h/' },
    ],
  },
  {
    id: 'r3',
    n: 3,
    title: 'Word stress',
    focus: 'the stressed syllable of each word in bold',
    sentences: [
      { text: 'A **Japanese** **volunteer** **explained** a **unique** **technique**.', rule: 'stressed suffixes -ese, -eer, -ique · two-syllable verb on the root' },
      { text: 'We **object** to the **project**, so we will **protest** tomorrow.', rule: 'noun–verb pairs: ob’ject (verb), ’project (noun), pro’test (verb)' },
      { text: 'Every **graduate** will **graduate** with a **certificate**.', rule: '-ate: ’graduate (noun, /ɪt/), ’graduate (verb, /eɪt/), cer’tificate' },
      { text: 'A **democrat** **believes** in **democracy** and **democratic** **elections**.', rule: 'full and reduced vowels alternate · verb on the root · -ion' },
      { text: 'The **politician** **apologized** for his **political** **mistake**.', rule: '-cian · -ize · -ical · noun stressed on the root' },
      { text: '**Biology** is a **fantastic** **subject** at our **university**.', rule: '-logy, -ic, -ity · two-syllable noun' },
      { text: 'The **secretary** **picked up** a **newspaper**.', rule: '-ary · two-word verb · compound noun' },
      { text: '**Curious** children **introduce** **themselves** to every **insect**.', rule: '-ious · first syllable of the root · reflexive pronoun · two-syllable noun' },
      { text: 'The **official** **conclusion** was a **pleasant** **surprise**.', rule: '-ial, -sion · two-syllable adjective · noun stressed on the root' },
      { text: 'Please **turn off** the **washing machine**; it’s **difficult** to **concentrate**.', rule: 'two-word verb · compound noun · first syllable · -ate verb' },
    ],
  },
];

export const INTRO =
  'This is the phonology reading test. It has three readings: vowels and consonants, connected speech, and word stress. ' +
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
    steps.push({ type: 'part', reading: r.id, say: `Reading ${r.n}. ${r.title}. ${directions(r)}` });
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
