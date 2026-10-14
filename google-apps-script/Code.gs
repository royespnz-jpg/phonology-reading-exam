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
const VERSION = 3;
const ROOT_FOLDER = 'Phonology Reading Exam — Recordings';
/* The readings: id, title and kind. Made from js/format.js: npm run gs. */
const READINGS_META = [
  ["r1","Vowels","vowels"],
  ["r2","Consonants","consonants"],
  ["r3","-ed and -s endings","endings"],
  ["r4","Connected speech 1","connected"],
  ["r5","Connected speech 2","connected"],
  ["r6","Connected speech 3","connected"],
  ["r7","Word stress 1","stress"],
  ["r8","Word stress 2","stress"],
  ["r9","Word stress 3","stress"],
  ["r10","Word stress 4","stress"],
];
const QUESTIONS = READINGS_META.map(function (r) { return r[0]; });
const LABELS = {};
READINGS_META.forEach(function (r, i) { LABELS[r[0]] = 'Reading ' + (i + 1); });
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
    headers: ['Score'].concat(READINGS_META.map(function (r, i) { return 'Reading ' + (i + 1) + ' · ' + r[1]; })),
  },
  readings: {
    name: 'Readings',
    headers: ['Reading', 'Sentence', 'Text (targets in CAPITALS)', 'Target words', 'What it tests'],
  },
};
const EX = { status: 4, answers: 5, finished: 6, left: 7, restarts: 8, total: 9, folder: 10, attempt: 11 };
const RE = { label: 4, recording: 7, score: 8, attempt: 10 };

/* ✂ */

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

/* ✂ */

/* readings:start */
/* The readings, as the page shows them (the words in CAPITALS are the targets),
   and what each target tests. Made from js/format.js: npm run gs. */
const READINGS_ROWS_1 = [
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
  [4,1,"DID YOU see the new movie at the theater LAST NIGHT?","Did you, last night","Did you: palatalization: /d/ + /y/ → /dʒ/ · last night: deletion of /t/ or /d/ between words"],
  [4,2,"I’m GOING TO STAY UP late to finish my homework.","going to, stay up","going to: reduction: going to → gonna · stay up: linking with a /y/ glide"],
  [4,3,"GIVE ME a big piece of that CHOCOLATE cake, please.","Give me, chocolate","Give me: assimilation: give me → gimme, let me → lemme · chocolate: syncope (a lost unstressed vowel)"],
  [4,4,"We HAVE TO GO AWAY for a week in December.","have to, go away","have to: reduction: have to, has to → hafta, hasta · go away: linking with a /w/ glide"],
  [4,5,"IS YOUR older brother TWENTY years old?","Is your, twenty","Is your: palatalization: /z/ + /y/ → /ʒ/ · twenty: deletion of /t/ after /n/"],
  [4,6,"I’LL buy LOTS OF flowers for my grandmother.","I’ll, lots of","I’ll: contraction (blend) · lots of: deletion of /v/ in “of”"],
  [4,7,"The little kids KEEP OUT of the FOOTBALL field.","keep out, football","keep out: consonant + vowel linking · football: unreleased stop"],
  [4,8,"The GOOD BOY HAD TO wait outside the classroom.","good boy, had to","good boy: regressive assimilation: /d/, /t/ → /b/, /g/, /p/, /k/ · had to: progressive assimilation"],
  [4,9,"I know WHAT YOU WANT TO say to the teacher.","what you, want to","what you: palatalization: /t/ + /y/ → /tʃ/ · want to: reduction: want to → wanna"],
  [4,10,"HIS SHIRT has a BIG GAP in the back.","His shirt, big gap","His shirt: regressive assimilation: /s/, /z/ + /ʃ/ → /ʃ/ · big gap: gemination (one long consonant)"],
  [4,11,"We USED TO go skiing in the mountains every FEBRUARY.","used to, February","used to: reduction: used to → usta · February: disappearing /r/"],
  [4,12,"The WATER in the lake is KIND OF cold today.","water, kind of","water: flap /t/ · kind of: reduction: kind of → kinda"],
  [4,13,"You CAN GO to the party if you ASK HER first.","can go, ask her","can go: regressive assimilation: /n/ → /ŋ/ · ask her: deletion of /h/ in he, him, her, his"],
  [4,14,"I’ve GOT TO thank them all for their KINDNESS.","got to, kindness","got to: reduction: got to → gotta · kindness: deletion of /t/ or /d/ in a cluster of three"],
  [4,15,"You CAN BUY a ticket, but FIND OUT the price first.","can buy, find out","can buy: regressive assimilation: /n/ → /m/ · find out: resyllabification"],
];

/* ✂ */

const READINGS_ROWS_2 = [
  [5,1,"I will MISS YOU when you leave the CITY next month.","miss you, city","miss you: palatalization: /s/ + /y/ → /ʃ/ · city: flap /t/"],
  [5,2,"COULD YOU park the BLACK CAR over there, please?","Could you, black car","Could you: palatalization: /d/ + /y/ → /dʒ/ · black car: gemination (one long consonant)"],
  [5,3,"I BET YOU know the answer to the question EXACTLY.","bet you, exactly","bet you: palatalization: /t/ + /y/ → /tʃ/ · exactly: deletion of /t/ or /d/ in a cluster of three"],
  [5,4,"WAS YOUR dinner at the hotel AS GOOD AS mine?","Was your, as good as","Was your: palatalization: /z/ + /y/ → /ʒ/ · as good as: weak form of a function word"],
  [5,5,"Please SAY IT again slowly for the new STUDENT.","say it, student","say it: linking with a /y/ glide · student: syllabic consonant"],
  [5,6,"GO OUT and meet the young PRINCE at the gate.","Go out, prince","Go out: linking with a /w/ glide · prince: epenthesis: an added /t/ or /p/"],
  [5,7,"TURN OFF the lights and TELL THEM to go to sleep.","Turn off, tell them","Turn off: consonant + vowel linking · tell them: deletion of /ð/ in them"],
  [5,8,"The plan WORKED OUT well, so you OUGHT TO try it.","worked out, ought to","worked out: resyllabification · ought to: reduction: ought to → oughta"],
  [5,9,"WHAT DO YOU usually write in that little NOTEBOOK?","What do you, notebook","What do you: reduction: what do you → whaddaya · notebook: unreleased stop"],
  [5,10,"IT’S too late to talk to the manager IN PERSON.","It’s, in person","It’s: progressive assimilation · in person: regressive assimilation: /n/ → /m/"],
  [5,11,"SHE’LL take a taxi home IN CASE it rains.","She’ll, in case","She’ll: contraction (blend) · in case: regressive assimilation: /n/ → /ŋ/"],
  [5,12,"That RED CAR is always parked on the EAST SIDE.","red car, East side","red car: regressive assimilation: /d/, /t/ → /b/, /g/, /p/, /k/ · East side: deletion of /t/ or /d/ between words"],
  [5,13,"THESE SHOES cost PLENTY of money at the mall.","These shoes, plenty","These shoes: regressive assimilation: /s/, /z/ + /ʃ/ → /ʃ/ · plenty: deletion of /t/ after /n/"],
  [5,14,"There’s a CUP OF coffee next to the fresh VEGETABLES.","cup of, vegetables","cup of: deletion of /v/ in “of” · vegetables: syncope (a lost unstressed vowel)"],
  [5,15,"HELP HIM carry the bags, because it’s GOING TO RAIN.","Help him, going to rain","Help him: deletion of /h/ in he, him, her, his · going to rain: reduction: going to → gonna"],
  [6,1,"WOULD YOU really WANT TO GO to the beach alone?","Would you, want to go","Would you: palatalization: /d/ + /y/ → /dʒ/ · want to go: reduction: want to → wanna"],
  [6,2,"I’ll MEET YOU at six, but now I’ve GOT TO GO.","meet you, got to go","meet you: palatalization: /t/ + /y/ → /tʃ/ · got to go: reduction: got to → gotta"],
  [6,3,"My sister HAS TO study very hard THIS YEAR.","has to, this year","has to: reduction: have to, has to → hafta, hasta · this year: palatalization: /s/ + /y/ → /ʃ/"],
  [6,4,"Grandpa USED TO FISH in the river with MY UNCLE.","used to fish, my uncle","used to fish: reduction: used to → usta · my uncle: linking with a /y/ glide"],
  [6,5,"I’m KIND OF TIRED, and I have NO IDEA why.","kind of tired, no idea","kind of tired: reduction: kind of → kinda · no idea: linking with a /w/ glide"],
  [6,6,"LET ME drive you home after the birthday PARTY.","Let me, party","Let me: assimilation: give me → gimme, let me → lemme · party: flap /t/"],
  [6,7,"COME IN and say hello to the GOVERNOR.","Come in, governor","Come in: consonant + vowel linking · governor: disappearing /r/"],
  [6,8,"Give the BAD DOG a little COMFORT after the storm.","bad dog, comfort","bad dog: gemination (one long consonant) · comfort: epenthesis: an added /t/ or /p/"],
  [6,9,"Buy a HOT DOG and a BOTTLE OF water for the trip.","hot dog, bottle of","hot dog: unreleased stop · bottle of: deletion of /v/ in “of”"],
  [6,10,"THAT’S a warm WINTER coat for the mountains.","That’s, winter","That’s: progressive assimilation · winter: deletion of /t/ after /n/"],
  [6,11,"TEN BOYS told us that THEY’D come to the game.","Ten boys, they’d","Ten boys: regressive assimilation: /n/ → /m/ · they’d: contraction (blend)"],
  [6,12,"My BEST FRIEND has lived IN KANSAS since May.","best friend, in Kansas","best friend: deletion of /t/ or /d/ between words · in Kansas: regressive assimilation: /n/ → /ŋ/"],
  [6,13,"THIS SHOP sells shirts in many DIFFERENT colors.","This shop, different","This shop: regressive assimilation: /s/, /z/ + /ʃ/ → /ʃ/ · different: syncope (a lost unstressed vowel)"],
  [6,14,"TELL HER to LOOK AT THE clock on the wall.","Tell her, look at the","Tell her: deletion of /h/ in he, him, her, his · look at the: weak form of a function word"],
  [6,15,"The POSTMAN COULDN’T find our new house.","postman, couldn’t","postman: deletion of /t/ or /d/ in a cluster of three · couldn’t: syllabic consonant"],
  [7,1,"The new EMPLOYEE has a UNIQUE idea.","employee, unique","employee: stressed suffix -ee · unique: stressed suffix -ique"],
  [7,2,"Our VOLUNTEER speaks JAPANESE at home.","volunteer, Japanese","volunteer: stressed suffix -eer · Japanese: stressed suffix -ese"],
  [7,3,"The band will ENTERTAIN us at a PICTURESQUE hotel.","entertain, picturesque","entertain: stressed suffix -ain (verbs) · picturesque: stressed suffix -esque"],
  [7,4,"Smoking a CIGARETTE is a bad DECISION.","cigarette, decision","cigarette: stressed suffix -ette · decision: stress before -ion"],
  [7,5,"PHYSICAL exercise is a FANTASTIC way to relax.","Physical, fantastic","Physical: stress before -ical · fantastic: stress before -ic"],
  [7,6,"The OFFICIAL PUBLICITY starts today.","official, publicity","official: stress before -ial · publicity: stress before -ity"],
  [7,7,"The CANADIAN restaurant serves DELICIOUS food.","Canadian, delicious","Canadian: stress before -ian · delicious: stress before -ious"],
  [7,8,"Please CLASSIFY these SENSITIVE files.","classify, sensitive","classify: stress before -ify · sensitive: stress before -itive"],
  [7,9,"Her ATTITUDE toward BIOLOGY changed this year.","attitude, biology","attitude: stress before -itude · biology: stress before -logy"],
  [7,10,"GEOGRAPHY helps us APPRECIATE other cultures.","Geography, appreciate","Geography: stress before -graphy · appreciate: -ate verb: two syllables before the suffix"],
  [7,11,"The SECRETARY made a small MISTAKE in the letter.","secretary, mistake","secretary: -ary: two syllables before the suffix · mistake: noun stressed on the root (exception)"],
  [7,12,"Please APOLOGIZE to your MOTHER for being late.","apologize, mother","apologize: -ize: two syllables before the suffix · mother: two-syllable noun: first syllable"],
  [7,13,"The NEWSPAPER says that prices will INCREASE again.","newspaper, increase","newspaper: compound noun: first word · increase: noun–verb pair: verb on the root"],
  [7,14,"Please PICK UP the BEAUTIFUL flowers.","pick up, beautiful","pick up: two-word verb: last word · beautiful: neutral suffix (-ful, -al, -ment…): the stress does not move"],
  [7,15,"We INTRODUCE OURSELVES on the first day.","introduce, ourselves","introduce: first syllable of the root · ourselves: reflexive pronoun: last syllable"],
  [8,1,"Every INDIVIDUAL TRAINEE gets a desk.","individual, trainee","individual: stress before -ual · trainee: stressed suffix -ee"],
  [8,2,"Our ENGINEER is very EFFICIENT at work.","engineer, efficient","engineer: stressed suffix -eer · efficient: stress before -cient"],
  [8,3,"The ANTIQUE clock makes a CONTINUOUS sound.","antique, continuous","antique: stressed suffix -ique · continuous: stress before -uous"],
  [8,4,"CHINESE silk is soft and very DELICATE.","Chinese, delicate","Chinese: stressed suffix -ese · delicate: -ate adjective or noun: two syllables before the suffix"],
  [8,5,"Please REMOVE that old CASSETTE from the car.","remove, cassette","remove: two-syllable verb with a prefix: on the root · cassette: stressed suffix -ette"],
  [8,6,"This DEFINITION in the dictionary is not COMPLETE.","definition, complete","definition: stress before -ion · complete: two-syllable adjective with a prefix: on the root"],
  [8,7,"The ENERGETIC children FINISH their work early.","energetic, finish","energetic: stress before -ic · finish: two-syllable verb or adjective without a prefix: first syllable"],
  [8,8,"The HUMIDITY in the GARAGE is very high.","humidity, garage","humidity: stress before -ity · garage: borrowed word: last syllable"],
  [8,9,"The FINANCIAL report this month was EXCELLENT.","financial, excellent","financial: stress before -ial · excellent: long noun or adjective: first syllable"],
  [8,10,"The VEGETARIAN market sells fresh PRODUCE.","vegetarian, produce","vegetarian: stress before -ian · produce: noun–verb pair: noun on the first syllable"],
  [8,11,"Please don’t INTERFERE; it’s a MYSTERIOUS case.","interfere, mysterious","interfere: verb with inter-, over-, under-: on the root · mysterious: stress before -ious"],
  [8,12,"ZOOLOGY is my FAVORITE subject at school.","Zoology, favorite","Zoology: stress before -logy · favorite: a syllable disappears after the stress"],
  [8,13,"Many writers EXAGGERATE in an AUTOBIOGRAPHY.","exaggerate, autobiography","exaggerate: -ate verb: two syllables before the suffix · autobiography: stress before -graphy"],
  [8,14,"Let’s ORGANIZE the shelves in the DRUGSTORE.","organize, drugstore","organize: -ize: two syllables before the suffix · drugstore: compound noun: first word"],
  [8,15,"Don’t DROP OUT of school; believe in YOURSELF.","drop out, yourself","drop out: two-word verb: last word · yourself: reflexive pronoun: last syllable"],
];

/* ✂ */

const READINGS_ROWS_3 = [
  [9,1,"The REFUGEE showed great GRATITUDE to the family.","refugee, gratitude","refugee: stressed suffix -ee · gratitude: stress before -itude"],
  [9,2,"The MOUNTAINEER packed all the NECESSARY tools.","mountaineer, necessary","mountaineer: stressed suffix -eer · necessary: -ary: two syllables before the suffix"],
  [9,3,"She loves CLASSICAL PORTUGUESE music.","classical, Portuguese","classical: stress before -ical · Portuguese: stressed suffix -ese"],
  [9,4,"Can you IDENTIFY the owner of the BOUTIQUE?","identify, boutique","identify: stress before -ify · boutique: stressed suffix -ique"],
  [9,5,"We saw a SILHOUETTE during the DEMONSTRATION.","silhouette, demonstration","silhouette: stressed suffix -ette · demonstration: stress before -ion"],
  [9,6,"We must MAINTAIN a REALISTIC budget this year.","maintain, realistic","maintain: stressed suffix -ain (verbs) · realistic: stress before -ic"],
  [9,7,"The DISTANCE to the GROTESQUE old castle is short.","distance, grotesque","distance: two-syllable noun: first syllable · grotesque: stressed suffix -esque"],
  [9,8,"The ELECTRICIAN checked the ELECTRICITY in the house.","electrician, electricity","electrician: stress before -ian · electricity: stress before -ity"],
  [9,9,"Our COMPETITIVE team got SUBSTANTIAL support.","competitive, substantial","competitive: stress before -itive · substantial: stress before -ial"],
  [9,10,"TECHNOLOGY makes young children CURIOUS.","Technology, curious","Technology: stress before -logy · curious: stress before -ious"],
  [9,11,"We CONGRATULATE her on her PHOTOGRAPHY.","congratulate, photography","congratulate: -ate verb: two syllables before the suffix · photography: stress before -graphy"],
  [9,12,"It is UNFORTUNATE that they CRITICIZE him so much.","unfortunate, criticize","unfortunate: -ate adjective or noun: two syllables before the suffix · criticize: -ize: two syllables before the suffix"],
  [9,13,"We must PROTECT this REMOTE island.","protect, remote","protect: two-syllable verb with a prefix: on the root · remote: two-syllable adjective with a prefix: on the root"],
  [9,14,"The SUDDEN SUCCESS of the song surprised everyone.","sudden, success","sudden: two-syllable verb or adjective without a prefix: first syllable · success: noun stressed on the root (exception)"],
  [9,15,"The old TYPEWRITER was DIFFICULT to use.","typewriter, difficult","typewriter: compound noun: first word · difficult: long noun or adjective: first syllable"],
  [10,1,"The REFEREE checked every VISUAL signal.","referee, visual","referee: stressed suffix -ee · visual: stress before -ual"],
  [10,2,"His CAREER had an AMBIGUOUS start.","career, ambiguous","career: stressed suffix -eer · ambiguous: stress before -uous"],
  [10,3,"The VIETNAMESE cook is very PROFICIENT.","Vietnamese, proficient","Vietnamese: stressed suffix -ese · proficient: stress before -cient"],
  [10,4,"Her CRITIQUE of the new BROCHURE was fair.","critique, brochure","critique: stressed suffix -ique · brochure: borrowed word: last syllable"],
  [10,5,"Please PUT AWAY the MICROPHONE after class.","put away, microphone","put away: two-word verb: last word · microphone: long noun or adjective: first syllable"],
  [10,6,"The guard will DETAIN the thief HIMSELF.","detain, himself","detain: stressed suffix -ain (verbs) · himself: reflexive pronoun: last syllable"],
  [10,7,"We need to DEVELOP a better LOCATION for the store.","develop, location","develop: first syllable of the root · location: stress before -ion"],
  [10,8,"PROFESSIONAL players use ELASTIC bands.","Professional, elastic","Professional: neutral suffix (-ful, -al, -ment…): the stress does not move · elastic: stress before -ic"],
  [10,9,"The CONFLICT between the two groups became CRITICAL.","conflict, critical","conflict: noun–verb pair: noun on the first syllable · critical: stress before -ical"],
  [10,10,"We SUSPECT there is no NECESSITY for a new law.","suspect, necessity","suspect: noun–verb pair: verb on the root · necessity: stress before -ity"],
  [10,11,"Don’t UNDERESTIMATE the EDITORIAL team.","underestimate, editorial","underestimate: verb with inter-, over-, under-: on the root · editorial: stress before -ial"],
  [10,12,"The HISTORIAN sat in a COMFORTABLE chair.","historian, comfortable","historian: stress before -ian · comfortable: a syllable disappears after the stress"],
  [10,13,"Don’t TERRIFY the SUPERSTITIOUS children.","terrify, superstitious","terrify: stress before -ify · superstitious: stress before -ious"],
  [10,14,"ARCHEOLOGY can be a REPETITIVE job.","Archeology, repetitive","Archeology: stress before -logy · repetitive: stress before -itive"],
  [10,15,"You don’t need to MEMORIZE the whole BIBLIOGRAPHY.","memorize, bibliography","memorize: -ize: two syllables before the suffix · bibliography: stress before -graphy"],
];

function readingRows_() {
  return [].concat(READINGS_ROWS_1, READINGS_ROWS_2, READINGS_ROWS_3);
}
/* readings:end */

/* ✂ */

function setup() {
  Object.keys(SHEETS).forEach(function (k) { sheet_(k); });
  reference_('rubric', rubric_());
  reference_('readings', readingRows_());
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
