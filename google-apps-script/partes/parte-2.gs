/* ── Phonology Exam · parte 2 de 7 ── */

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
  [1,5,"TIM SLIPPED on the STREET near the LITTLE HOSPITAL.","Tim, slipped, street, little, hospital","/ɪ/ and /i/ · /str/ · dark /l/ · -ed = /t/"],
  [1,6,"THREE THOUSAND people THANKED the MOTHER of THESE TWINS.","Three, thousand, thanked, mother, these, twins","/θ/ and /ð/ · -ed = /t/ · -s = /z/"],
  [1,7,"GEORGE USUALLY MEASURES the ORANGE JUICE in the GARAGE.","George, usually, measures, orange, juice, garage","/dʒ/ and /ʒ/"],
  [1,8,"SHE WASHES the DISHES and WATCHES the SHIPS from her CHAIR.","She, washes, dishes, watches, ships, chair","/ʃ/ and /tʃ/ · -es = /ɪz/ · -s = /s/"],
  [1,9,"VERY FEW VOTERS WENT BOATING in the WET WEATHER.","Very, few, voters, went, boating, wet, weather","/v/, /f/, /b/, /w/"],
  [1,10,"A RED LIGHT FLASHED on the RIGHT side of the ROAD.","red, light, flashed, right, road","/r/ and /l/ · /fl/ · -ed = /t/"],
  [1,11,"SMALL SPANISH SCHOOLS START STUDYING in SPRING.","Small, Spanish, schools, start, studying, spring","/s/ + consonant at the beginning of a word (no /e/ before it) · -s = /z/"],
  [1,12,"The KING THINKS the YOUNG SINGER SANG TEN SONGS.","king, thinks, young, singer, sang, ten, songs","/ŋ/, /ŋk/ and /n/ · -s = /s/, /z/"],
  [1,13,"The BOY ENJOYED the LOUD NOISE of the CROWD.","boy, enjoyed, loud, noise, crowd","/ɔɪ/ and /aʊ/ · -ed = /d/"],
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
  [2,11,"HIS SHIRT is in THIS SHOP, but I CAN GO GET IT.","His shirt, this shop, can go, get it","/z/, /s/ + /ʃ/ assimilation · /n/ → /ŋ/ · flap /t/ and linking"],
  [2,12,"We HAD TO WAIT AN HOUR for the NEXT BUS.","had to, wait an hour, next bus","progressive assimilation (had to → /hætə/) · linking · deletion of /t/"],
  [2,13,"He PUSHED UP his sleeve and HURT HIS LEFT ARM.","pushed up, hurt his, left arm","resyllabification · deletion of /h/"],
  [3,1,"A JAPANESE VOLUNTEER EXPLAINED a UNIQUE TECHNIQUE.","Japanese, volunteer, explained, unique, technique","stressed suffixes -ese, -eer, -ique · two-syllable verb on the root"],
  [3,2,"We OBJECT to the PROJECT, so we will PROTEST tomorrow.","object, project, protest","noun–verb pairs: ob’ject (verb), ’project (noun), pro’test (verb)"],
  [3,3,"Every GRADUATE will GRADUATE with a CERTIFICATE.","graduate, graduate, certificate","-ate: ’graduate (noun, /ɪt/), ’graduate (verb, /eɪt/), cer’tificate"],
  [3,4,"A DEMOCRAT BELIEVES in DEMOCRACY and DEMOCRATIC ELECTIONS.","democrat, believes, democracy, democratic, elections","full and reduced vowels alternate · verb on the root · -ion"],
  [3,5,"The POLITICIAN APOLOGIZED for his POLITICAL MISTAKE.","politician, apologized, political, mistake","-cian · -ize · -ical · noun stressed on the root"],
  [3,6,"BIOLOGY is a FANTASTIC SUBJECT at our UNIVERSITY.","Biology, fantastic, subject, university","-logy, -ic, -ity · two-syllable noun"],
  [3,7,"The SECRETARY PICKED UP a NEWSPAPER.","secretary, picked up, newspaper","-ary · two-word verb · compound noun"],
  [3,8,"CURIOUS children INTRODUCE THEMSELVES to every INSECT.","Curious, introduce, themselves, insect","-ious · first syllable of the root · reflexive pronoun · two-syllable noun"],
  [3,9,"The OFFICIAL CONCLUSION was a PLEASANT SURPRISE.","official, conclusion, pleasant, surprise","-ial, -sion · two-syllable adjective · noun stressed on the root"],
  [3,10,"Please TURN OFF the WASHING MACHINE; it’s DIFFICULT to CONCENTRATE.","turn off, washing machine, difficult, concentrate","two-word verb · compound noun · first syllable · -ate verb"],
];

/* ── fin de la parte 2 de 7 ── */
