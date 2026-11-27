// The grammar book: a list of sections, each a page of blocks (see js/guideview.js).
// In any text, *x* shows as bold. The first section is the alphabet.

export const BOOK = [
  {
    id: 'letters',
    chapter: 'Sounds and letters',
    icon: '🔤',
    title: 'Letters and sounds',
    sub: 'All 29 letters, and the tricky ones',
    blocks: [{ alphabet: true }],
  },
  {
    id: 'harmony',
    chapter: 'Sounds and letters',
    icon: '🧩',
    title: 'Vowel harmony',
    sub: 'Why endings change their vowel',
    blocks: [
      { p: 'A Turkish ending changes its vowel to match the last vowel of the word. English has no such rule, but it is regular, so you only learn it once.' },
      { p: 'Some endings have two forms (*e* or *a*), others have four (*i*, *ı*, *u* or *ü*). Look only at the last vowel of the word:' },
      {
        table: {
          head: ['Last vowel', '2-way ending', '4-way ending'],
          rows: [
            ['e, i', 'e', 'i'],
            ['a, ı', 'a', 'ı'],
            ['o, u', 'a', 'u'],
            ['ö, ü', 'e', 'ü'],
          ],
        },
      },
      { p: 'The plural *-ler / -lar* is 2-way. The "my" ending *-im / -ım / -um / -üm* is 4-way.' },
      {
        ex: [
          ['ev*ler*', 'houses'],
          ['kitap*lar*', 'books'],
          ['ev*im*', 'my house'],
          ['okul*um*', 'my school'],
        ],
      },
      { tip: 'Only the last vowel counts. Ignore the consonants, pick the matching ending, and say it aloud: the right one is the one that is easy to say.' },
    ],
  },
  {
    id: 'consonants',
    chapter: 'Sounds and letters',
    icon: '🔀',
    title: 'Consonant changes',
    sub: 'Why kitap becomes kitabı, and -de becomes -te',
    blocks: [
      { p: 'Consonants change too, where a word meets its ending. Two rules cover almost everything.' },
      { p: "1. Softening. When an ending that starts with a vowel is added, a noun's final p, ç, t or k usually turns soft:" },
      {
        table: {
          head: ['Ends in', 'Becomes', 'Example'],
          rows: [
            ['p', 'b', 'kitap → kita*b*ı'],
            ['ç', 'c', 'ağaç → ağa*c*ı'],
            ['t', 'd', 'kağıt → kağı*d*ı'],
            ['k', 'ğ', 'çocuk → çocu*ğ*u'],
          ],
        },
      },
      { p: 'Most one-syllable words keep their letter (top → topu, saç → saçı), but a few common ones soften (dört → dörde). Many words ending in t keep it too (bilet → bileti). After n, k becomes g, not ğ: renk → ren*g*i.' },
      { p: 'Verbs keep their letter: anlatıyorum, öğretiyorum, bırakıyorum. Only git- and et- (and tat-) soften: gi*d*iyorum, yardım e*d*iyorum.' },
      { p: '2. Hardening. An ending that starts with d or c changes it to t or ç after f, s, t, k, ç, ş, h or p (Turks remember them as FıSTıKÇı ŞaHaP, "Şahap the peanut seller"): ev*de* but mutfak*ta*, gel*di* but git*ti*.' },
      {
        ex: [
          ['Kita*b*ı okudun mu?', 'Did you read the book?'],
          ['Çocu*ğ*u okula götürüyorum.', "I'm taking the child to school."],
          ['Annem mutfak*ta*.', 'Mum is in the kitchen.'],
          ['Dün markete git*ti*m.', 'I went to the shop yesterday.'],
        ],
      },
      { tip: 'Softening needs a vowel right after the letter. Before a consonant it stays hard: kitap*lar*, kitap*ta*. And when you look a word up, go back to the hard letter: ağacı comes from ağaç.' },
    ],
  },
  {
    id: 'order',
    chapter: 'Building a sentence',
    icon: '🚂',
    title: 'Word order',
    sub: 'The verb comes last',
    blocks: [
      { p: 'A Turkish sentence ends with its verb. The usual order is subject, object, verb:' },
      { table: { head: null, rows: [['Annem', 'çay', '*içiyor*.'], ['My mum', 'tea', 'is drinking']] } },
      { p: 'Swedish puts the verb second (Idag dricker jag te) and English right after the subject. Turkish keeps it for the end: Bugün çay *içiyorum*.' },
      { p: 'Time and place usually come early. The spot right before the verb carries the stress: put the word that matters most there, the way you would stress it with your voice in English.' },
      { p: 'Describing words come first, as in English: güzel bir ev (a nice house). Little words like "to", "in" and "my" are endings, so sentences stay short, and the subject is often left out because the verb ending already says who.' },
      {
        ex: [
          ['Annem mutfakta yemek *yapıyor*.', 'Mum is cooking in the kitchen.'],
          ["Ablam İstanbul'da *oturuyor*.", 'My sister lives in Istanbul.'],
          ['Bu akşam ailemi *arayacağım*.', "I'll call my family this evening."],
          ['Çayı *ben* yaptım.', 'I made the tea. (It was me.)'],
        ],
      },
      { tip: "Don't build the sentence in English order. Find the verb and put it last, then put the most important word right before it." },
    ],
  },
  {
    id: 'tobe',
    chapter: 'Building a sentence',
    icon: '🙋',
    title: '"To be" and personal endings',
    sub: 'I am, you are… and var / yok',
    blocks: [
      { p: 'Turkish has no word for "am, is, are". A personal ending goes on the word itself: yorgun*um* = I am tired. For "he, she, it" nothing is added: Çay sıcak. = The tea is hot.' },
      {
        table: {
          head: ['', 'yorgun (tired)', 'hasta (ill)'],
          rows: [
            ['ben (I)', 'yorgun*um*', 'hasta*yım*'],
            ['sen (you)', 'yorgun*sun*', 'hasta*sın*'],
            ['o (he, she, it)', 'yorgun', 'hasta'],
            ['biz (we)', 'yorgun*uz*', 'hasta*yız*'],
            ['siz (you)', 'yorgun*sunuz*', 'hasta*sınız*'],
            ['onlar (they)', 'yorgun*lar*', 'hasta*lar*'],
          ],
        },
      },
      { p: 'The endings follow 4-way harmony, and after a vowel "I" and "we" take a y. They work on places too: evde*yim* = I am at home.' },
      { p: '"Not" is *değil*, a separate word that takes the ending: aç değil*im* = I am not hungry.' },
      { p: '*var* (there is) and *yok* (there is not) say whether something exists. With "my" on the thing, they mean "have": Bir sorum var. = I have a question (literally "a question of mine exists").' },
      {
        ex: [
          ['Bugün çok yorgun*um*.', "I'm very tired today."],
          ['Şu an evde*yim*.', "I'm at home right now."],
          ['Aç değil*im*.', "I'm not hungry."],
          ['Evde ekmek *yok*.', "There's no bread at home."],
        ],
      },
      { tip: '"I have a car" is not ben araba var. Put "my" on the thing: Araba*m* var (my car exists). Without it: Araba*m* yok.' },
    ],
  },
  {
    id: 'questions',
    chapter: 'Building a sentence',
    icon: '❓',
    title: 'Questions',
    sub: 'mi, question words, and veya or yoksa',
    blocks: [
      { p: 'For a yes/no question, put *mi* right after the word you ask about. It is written as a separate word but follows 4-way harmony: mi, mı, mu, mü. At the end it asks about the whole sentence; after another word, about just that word: Dün *mü* geldin? (Was it yesterday you came?)' },
      { p: 'With "to be" and most tenses, the personal ending moves onto mi: Mutlu *muyum*? (Am I happy?), Geliyor *musun*? (Are you coming?). Only -ler (they) stays on the word: Geliyorlar *mı*? The -di past is the other way round, with the ending before mi: Geldin *mi*? (Did you come?)' },
      { p: 'Question words take no mi. They stand where the answer would go, usually right before the verb:' },
      {
        table: {
          head: null,
          rows: [
            ['ne', 'what', 'kim', 'who'],
            ['nerede', 'where', 'nereye', 'where to'],
            ['ne zaman', 'when', 'nereden', 'where from'],
            ['neden, niye', 'why', 'nasıl', 'how'],
            ['kaç', 'how many', 'ne kadar', 'how much'],
            ['hangi', 'which', 'kimin', 'whose'],
          ],
        },
      },
      { p: 'In a question that offers a choice, "or" is *yoksa*, and mi follows each option. *veya* (or ya da) is the plain "or": Çay veya kahve içer misin? only asks whether you want a drink.' },
      {
        ex: [
          ['Çay sıcak *mı*?', 'Is the tea hot?'],
          ['Rahatsız ediyor *muyum*?', 'Am I disturbing you?'],
          ['Yemek yedin *mi*?', 'Have you eaten?'],
          ['*Nereye* gidiyorsun?', 'Where are you going?'],
          ['Çay *mı* istersin, *yoksa* kahve *mi*?', 'Would you like tea, or coffee?'],
        ],
      },
      { tip: 'Say Geliyor *musun*?, not Geliyorsun mu?: the ending goes on mi, except after -di. And mi is always written as its own word.' },
    ],
  },
  {
    id: 'negation',
    chapter: 'Building a sentence',
    icon: '🚫',
    title: 'Negation and commands',
    sub: 'değil, yok, -me, and telling someone to do something',
    blocks: [
      { p: 'There are three ways to say "not":' },
      {
        list: [
          '*değil* for "is not": Pahalı değil. (It\'s not expensive.)',
          '*yok* for "there is no" or "I have no": Param yok. (I have no money.)',
          '*-me / -ma* on a verb, right after the stem: gel*me*di (he didn\'t come).',
        ],
      },
      {
        table: {
          head: ['', 'yes', 'no'],
          rows: [
            ['-iyor', 'geliyorum', 'gel*mi*yorum'],
            ['-di', 'geldim', 'gel*me*dim'],
            ['-ecek', 'geleceğim', 'gel*me*yeceğim'],
            ['-ir', 'gelirim', 'gel*mem*'],
            ['command', 'gel', 'gel*me*'],
          ],
        },
      },
      { p: "Commands: the bare stem is a command to someone you call sen: Gel! (Come!), Bak! (Look!). For siz, polite or to several people, add -in (4-way), after a vowel -yin: Gel*in*! Bekle*yin*! And \"let's\" is -elim / -alım: Gid*elim*!" },
      {
        ex: [
          ['Bugün gel*mi*yorum.', "I'm not coming today."],
          ['Merak et*me*!', "Don't worry!"],
          ['Buyurun, otur*un*.', 'Please, have a seat.'],
          ['Hadi, gid*elim*!', "Come on, let's go!"],
        ],
      },
      { tip: 'Don\'t use değil to make a verb negative: "I\'m not going" is Git*mi*yorum, not Gidiyorum değil. değil goes with nouns and adjectives.' },
    ],
  },
  {
    id: 'plural',
    chapter: 'Nouns and their endings',
    icon: '👥',
    title: 'Plural',
    sub: '-ler / -lar, and when to leave it out',
    blocks: [
      { p: 'The plural ending is *-ler* or *-lar* (2-way harmony): -ler after e, i, ö, ü and -lar after a, ı, o, u.' },
      {
        table: {
          head: ['One', 'Several'],
          rows: [
            ['ev (house)', 'ev*ler*'],
            ['göz (eye)', 'göz*ler*'],
            ['kitap (book)', 'kitap*lar*'],
            ['okul (school)', 'okul*lar*'],
          ],
        },
      },
      { p: 'Other endings come after it: ev*ler*de (in the houses), arkadaş*lar*ım (my friends).' },
      { p: 'After a number, or a word like çok (many) or kaç (how many), the noun stays singular: iki kitap (two books), çok insan (many people). The number already says there are several.' },
      { p: 'With a plural subject the verb often stays singular: Çocuklar oynuyor. And on a family word, -ler means "and the family": annem*ler* is my mum and the rest of the family, usually my parents.' },
      {
        ex: [
          ['Çocuk*lar* bahçede oynuyor.', 'The children are playing in the garden.'],
          ['Arkadaş*lar*ımla buluşuyorum.', "I'm meeting my friends."],
          ['İki kardeşim var.', 'I have two siblings.'],
          ['Annem*ler*e gidiyoruz.', "We're going to my parents' place."],
        ],
      },
      { tip: 'No -ler after a number: iki kitap, not iki kitaplar. English says "two books", Turkish says "two book".' },
    ],
  },
  {
    id: 'adjectives',
    chapter: 'Nouns and their endings',
    icon: '📏',
    title: 'Adjectives and comparison',
    sub: 'güzel bir ev, daha büyük, en büyük',
    blocks: [
      { p: 'An adjective goes before its noun, as in English: *sıcak* çay (hot tea), *yeni* araba (a new car). Before a noun it never changes. There is no agreement, unlike Swedish stor, stort, stora: the endings go on the noun, yeni araba*lar* (new cars).' },
      { p: '"A" is *bir*, the word for "one". It comes after the adjective, right before the noun: güzel *bir* ev (a nice house).' },
      { p: 'An adjective can also end the sentence, with no word for "is": Ev büyük. (The house is big.) For "I am" and "you are" it takes a personal ending: Yorgun*um*. (I am tired.) See "To be" and personal endings.' },
      { p: 'To compare, put *daha* (more) or *en* (most) before the adjective. "Than" is -den on the thing you compare with, and it comes first, so the pattern is *-den daha*:' },
      {
        table: {
          head: null,
          rows: [
            ['büyük', 'big'],
            ['daha büyük', 'bigger'],
            ['en büyük', 'biggest'],
            ['ev*den* daha büyük', 'bigger than a house'],
          ],
        },
      },
      {
        ex: [
          ['Güzel *bir* ev bulduk.', 'We found a nice house.'],
          ['Bu çanta çok pahalı.', 'This bag is very expensive.'],
          ['Türkçe İngilizce*den daha* zor.', 'Turkish is harder than English.'],
          ["İstanbul Türkiye'nin *en* büyük şehri.", "Istanbul is Turkey's biggest city."],
        ],
      },
      { tip: 'There is no word for "than". The thing you compare with takes -den: Ben*den* uzun = taller than me, literally "from me tall". The daha is often left out.' },
    ],
  },
  {
    id: 'cases',
    chapter: 'Nouns and their endings',
    icon: '🗺️',
    title: 'The cases',
    sub: 'Six forms of a noun, and the order of endings',
    blocks: [
      { p: 'Where English uses little words like "to", "at" and "from", Turkish puts an ending on the noun. With the plain word, a noun has six forms, called cases. This table is the map; each ending has its own page in this chapter.' },
      {
        table: {
          head: ['Meaning', 'Ending', 'ev (house)', 'oda (room)'],
          rows: [
            ['plain', '–', 'ev', 'oda'],
            ['object', '-(y)i', 'ev*i*', 'oda*yı*'],
            ['to', '-(y)e', 'ev*e*', 'oda*ya*'],
            ['at, in, on', '-de', 'ev*de*', 'oda*da*'],
            ['from', '-den', 'ev*den*', 'oda*dan*'],
            ["of, 's", '-(n)in', 'ev*in*', 'oda*nın*'],
          ],
        },
      },
      { p: 'The letter in brackets comes only after a vowel. -i and -in have 4-way harmony (okul*u*, göz*ün*), the others 2-way (okul*a*, göz*de*). After f, s, t, k, ç, ş, h or p the d turns into t: mutfak*ta* (see Consonant changes). A name takes an apostrophe before the ending: İstanbul\'*da*.' },
      { p: 'Endings stack in a fixed order: plural, then "my, your…", then the case.' },
      { table: { head: null, rows: [['ev', '-ler', '-imiz', '-de'], ['house', 'plural', 'our', 'in']] } },
      { p: 'Together: ev*lerimizde*, in our houses. After the "his, her" ending -i / -si, a case ending takes an n first: evi*n*de (in his house).' },
      {
        ex: [
          ['Çanta*mda* su var.', "There's water in my bag."],
          ['Arkadaş*larıma* mesaj attım.', 'I texted my friends.'],
          ['Çocuk*ları* okul*dan* aldım.', 'I picked the children up from school.'],
          ["Ali'nin ev*inde* kaldık.", "We stayed at Ali's place."],
        ],
      },
      { tip: 'Read a long word from the end. The last ending tells you its job in the sentence, and the rest peel off one by one: evlerimizde → evlerimiz → evler → ev.' },
    ],
  },
  {
    id: 'object',
    chapter: 'Nouns and their endings',
    icon: '🎯',
    title: 'The object ending -i',
    sub: '"The bread" or "bread", and beni, seni',
    blocks: [
      { p: 'The object is what the verb acts on: in "I bought the bread", it is the bread. Turkish adds *-i* to an object you would say "the" about. It has 4-way harmony and takes a y after a vowel: ekmeğ*i*, okul*u*, kapı*yı*.' },
      { p: 'An object without "the" gets no ending. With *bir* it is "a" or "one". With no bir at all it just names the kind of thing, one or more, and stays right before the verb. Compare the first three examples.' },
      { p: '"The" is not the only sign. "This", "my", a name or a pronoun make the object definite too: bu kitab*ı*, kitabım*ı*, Ali\'*yi*. Pronouns always take the ending: *beni* (me), *seni* (you), onu, bizi, sizi, onları.' },
      {
        ex: [
          ['Ekmeğ*i* aldım.', 'I bought the bread.'],
          ['*Bir* ekmek aldım.', 'I bought a loaf of bread.'],
          ['Ekmek aldım.', 'I bought bread.'],
          ['*Beni* bekler misin?', 'Will you wait for me?'],
          ["Ali'*yi* gördün mü?", 'Have you seen Ali?'],
        ],
      },
      { tip: 'Don\'t put -i on every object, only where English would say "the", "this", "my" or a name. Çay içtim. = I had some tea. Çay*ı* içtim. = I drank the tea (the one that was poured for me).' },
    ],
  },
  {
    id: 'dative',
    chapter: 'Nouns and their endings',
    icon: '➡️',
    title: 'To: the -e ending',
    sub: 'eve, bana, and verbs that take -e',
    blocks: [
      { p: '*-e* means "to" or "towards". It has 2-way harmony (-e, -a) and takes a y after a vowel: ev*e*, okul*a*, oda*ya*. It marks where you go, and who you give, send or say something to.' },
      { p: 'With pronouns, ben and sen change their vowel: *bana* (to me), *sana* (to you). The others are regular: ona, bize, size, onlara.' },
      { p: 'Some verbs take -e where English says "at", "on" or nothing at all. Learn them with their case:' },
      {
        table: {
          head: null,
          rows: [
            ['-e bakmak', 'look at'],
            ['-e binmek', 'get on, ride'],
            ['-e başlamak', 'start'],
            ['-e yardım etmek', 'help'],
          ],
        },
      },
      {
        ex: [
          ["Yarın İstanbul'*a* gidiyoruz.", "We're going to Istanbul tomorrow."],
          ['*Sana* bir şey söyleyeceğim.', "I'm going to tell you something."],
          ['Metro*ya* bindim.', 'I took the metro.'],
          ['İş*e* saat dokuzda başlıyorum.', 'I start work at nine.'],
          ['Annem*e* yardım ediyorum.', "I'm helping my mum."],
        ],
      },
      { tip: 'With these verbs the -e does the job of "at" or "on", so there is no extra word: Bana bak! (Look at me!) And "home" as a direction is ev*e*: Eve gidiyorum. (I\'m going home.)' },
    ],
  },
  {
    id: 'locative',
    chapter: 'Nouns and their endings',
    icon: '📍',
    title: 'At, in, on: the -de ending',
    sub: 'evde, saat beşte, and -de var',
    blocks: [
      { p: '*-de* tells you where something is. It covers "at", "in" and "on" alike: ev*de* (at home), Ankara\'*da* (in Ankara), masa*da* (on the table). It has 2-way harmony (-de, -da) and needs no extra letter after a vowel.' },
      { p: 'After f, s, t, k, ç, ş, h or p it starts with t: mutfak*ta* (in the kitchen), sokak*ta* (in the street). See Consonant changes.' },
      { p: 'It gives the time too: saat beş*te* (at five), Saat kaç*ta*? (At what time?) See Telling the time.' },
      { p: 'With *var* and *yok* it says what there is in a place: Evde süt var mı? On a person it means "on me, with me": Bende şemsiye var. The question word *nerede* (where) has it too, and so do burada (here) and orada (there).' },
      {
        ex: [
          ['Babam bahçe*de*.', 'Dad is in the garden.'],
          ['Çocuklar okul*da*.', 'The kids are at school.'],
          ['Film saat beş*te* başlıyor.', 'The film starts at five.'],
          ['Ev*de* süt *var* mı?', 'Is there any milk at home?'],
          ['Ben*de* şemsiye *var*.', 'I have an umbrella with me.'],
        ],
      },
      { tip: '-de is where something is, -e is where it goes: Evdeyim. (I\'m at home.) Eve gidiyorum. (I\'m going home.) Ask nerede? for the first and nereye? for the second.' },
    ],
  },
  {
    id: 'ablative',
    chapter: 'Nouns and their endings',
    icon: '⬅️',
    title: 'From: the -den ending',
    sub: 'evden, "than", and verbs that take -den',
    blocks: [
      { p: '*-den* means "from" or "out of". It has 2-way harmony (-den, -dan), and after f, s, t, k, ç, ş, h or p it starts with t: okul*dan*, sokak*tan*. See Consonant changes.' },
      { p: 'It also marks the way you go through or past: pencere*den* (out of the window), kapı*dan* (through the door).' },
      { p: '"Than" is -den too: Ali ben*den* daha uzun. (Ali is taller than me.) The daha (more) is often left out; see Adjectives and comparison.' },
      { p: 'Some verbs take -den where English says "of", "off" or nothing:' },
      {
        table: {
          head: null,
          rows: [
            ['-den korkmak', 'be afraid of'],
            ['-den hoşlanmak', 'like'],
            ['-den nefret etmek', 'hate'],
            ['-den inmek', 'get off'],
          ],
        },
      },
      {
        ex: [
          ['Okul*dan* geliyorum.', "I'm coming from school."],
          ["Bu otobüs Taksim'*den* geçiyor mu?", 'Does this bus go through Taksim?'],
          ['Ayşe ben*den* iki yaş büyük.', 'Ayşe is two years older than me.'],
          ['Kızım köpek*ten* korkuyor.', 'My daughter is afraid of dogs.'],
        ],
      },
      { tip: 'Get on is -e, get off is -den: otobüs*e* binmek, otobüs*ten* inmek. Learn each verb with its case, the way you learn "afraid of" in English.' },
    ],
  },
  {
    id: 'possessive',
    chapter: 'Nouns and their endings',
    icon: '🏷️',
    title: 'Possessive endings',
    sub: 'My house, your car: evim, araban',
    blocks: [
      { p: 'Where English says "my" or "your", Turkish adds an ending to the thing that is owned. *benim* (my) can go in front for emphasis, but is usually left out: Bu *benim* çantam! (This is MY bag!)' },
      {
        table: {
          head: ['', 'ev (house)', 'araba (car)'],
          rows: [
            ['my', 'ev*im*', 'araba*m*'],
            ['your', 'ev*in*', 'araba*n*'],
            ['his, her, its', 'ev*i*', 'araba*sı*'],
            ['our', 'ev*imiz*', 'araba*mız*'],
            ['your (siz)', 'ev*iniz*', 'araba*nız*'],
            ['their', 'ev*leri*', 'araba*ları*'],
          ],
        },
      },
      { p: 'The endings have 4-way harmony (only "their", -leri / -ları, is 2-way): ev*im*, kız*ım*, okul*um*, göz*üm*. After a vowel they drop their own first vowel (araba*m*, araba*n*), and "his, her" becomes -si / -sı / -su / -sü: araba*sı*, kedi*si*.' },
      { p: 'After "his, her" or "their" (-i, -si, -leri), a case ending takes an n first: arabası*n*da (in her car), evi*n*e (to his house). To name the owner, as in "Ali\'s car", see Owners and compound nouns.' },
      {
        ex: [
          ['Benim ad*ım* Erik.', 'My name is Erik.'],
          ['Ev*imiz* küçük ama güzel.', 'Our house is small but nice.'],
          ['Telefon*un* çalıyor.', 'Your phone is ringing.'],
          ['Babam oda*sında*.', 'Dad is in his room.'],
        ],
      },
      { tip: 'benim does not replace the ending: say benim ev*im*, or just ev*im*. Only in casual speech will you hear bizim ev (our place) without one.' },
    ],
  },
  {
    id: 'compounds',
    chapter: 'Nouns and their endings',
    icon: '☕',
    title: 'Owners and compound nouns',
    sub: "Ali'nin arabası, Türk kahvesi",
    blocks: [
      { p: 'To say whose something is, both words get an ending. The owner takes *-in* (of, \'s), and the thing takes the "his, her" ending -i / -si: Ali\'*nin* araba*sı* = Ali\'s car, literally "Ali\'s his-car".' },
      { p: '-in has 4-way harmony and takes an n after a vowel: kız*ın*, okul*un*, Ayşe\'*nin*.' },
      {
        table: {
          head: ['Owner', 'Thing', 'Means'],
          rows: [
            ["Ali'*nin*", 'araba*sı*', "Ali's car"],
            ['annem*in*', 'telefon*u*', "my mum's phone"],
            ['ev*in*', 'kapı*sı*', 'the door of the house'],
          ],
        },
      },
      { p: 'A compound noun names a kind of thing, not an owner. The first word takes no ending, but the second still takes -i / -si: Türk kahve*si* (Turkish coffee), doğum gün*ü* (birthday), yatak oda*sı* (bedroom). A case ending after it takes an n, as after any "his, her" ending: doğum günü*n*e (to the birthday).' },
      { p: 'So which one? Use -in when the first word is a particular person or thing: çocuğ*un* kitabı (the child\'s book). Leave it out when the first word only says what kind: çocuk kitabı (a children\'s book).' },
      {
        ex: [
          ['Annem*in* ad*ı* Ayşe.', "My mother's name is Ayşe."],
          ['Bir Türk kahve*si*, lütfen.', 'A Turkish coffee, please.'],
          ['Akşam yemeğ*i* hazır!', 'Dinner is ready!'],
          ["Zeynep'*in* doğum gün*üne* gidiyoruz.", "We're going to Zeynep's birthday party."],
        ],
      },
      { tip: "The second word always keeps its ending: Ali'nin araba*sı*, Türk kahve*si*. Never Ali'nin araba, never Türk kahve." },
    ],
  },
  {
    id: 'with',
    chapter: 'Nouns and their endings',
    icon: '🤝',
    title: 'With and without',
    sub: '-le, -li and -siz: benimle, sütlü, şekersiz',
    blocks: [
      { p: '*ile* means "with" or "by". It can stand alone, but is usually an ending: -le / -la (2-way), after a vowel -yle / -yla. It marks who you are with, and the tool or transport you use: arkadaşım*la* (with my friend), otobüs*le* (by bus), araba*yla* (by car).' },
      { p: 'With pronouns it goes on the -in form: *benimle* (with me), seninle, *onunla*, bizimle, sizinle; but onlar*la*.' },
      { p: '*-li* (4-way: -li, -lı, -lu, -lü) on a noun makes a describing word, "with": süt*lü* kahve (coffee with milk), şeker*li* çay (tea with sugar). Its opposite is *-siz* (-siz, -sız, -suz, -süz), "without": şeker*siz* (without sugar), tuz*suz* (without salt).' },
      {
        ex: [
          ['İşe otobüs*le* gidiyorum.', 'I go to work by bus.'],
          ['*Benimle* gelir misin?', 'Will you come with me?'],
          ['Annem*le* telefonda konuştum.', 'I talked to my mum on the phone.'],
          ['Süt*lü* bir kahve, lütfen.', 'A coffee with milk, please.'],
          ['Çayı şeker*siz* içerim.', 'I take my tea without sugar.'],
        ],
      },
      { tip: 'Use -le for doing something with someone or by means of something: Annemle konuştum. Use -li for what a thing has: sütlü kahve. Many -li and -siz words are everyday adjectives: akıllı (clever), işsiz (out of work).' },
    ],
  },
  {
    id: 'wordbuilding',
    chapter: 'Nouns and their endings',
    icon: '🧱',
    title: 'Building words',
    sub: 'Türkçe, İstanbullu, kahveci, gözlük',
    blocks: [
      { p: 'A few endings turn one word into another. Once you know them, you can guess many new words.' },
      {
        table: {
          head: ['Ending', 'Makes', 'Examples'],
          rows: [
            ['-ce', 'a language', 'Türk*çe*, İngiliz*ce*'],
            ['-li', 'someone from', 'İstanbul*lu*, Amerika*lı*'],
            ['-ci', 'someone who makes or sells', 'kahve*ci*, balık*çı*'],
            ['-lik', 'a thing for, or "-ness"', 'göz*lük*, arkadaş*lık*'],
          ],
        },
      },
      { p: '*-ce* has 2-way harmony and turns into -çe / -ça after f, s, t, k, ç, ş, h or p: Alman*ca* (German), Türk*çe*, İsveç*çe* (Swedish). The others have 4-way harmony, and -ci also turns into -çi after those letters: balık*çı* (fishmonger).' },
      { p: '*Türk* is a Turk, and Turkish as in Türk kahvesi. *Türkçe* is only the language. For people, some countries have their own word (Türk, Alman, İngiliz), others take -li: İsveç*li* (Swedish), Amerika*lı* (American). It is the same -li as in sütlü kahve; see With and without.' },
      { p: '-lik makes a thing for something (göz → gözlük, glasses) or a word for a quality (arkadaş → arkadaşlık, friendship).' },
      {
        ex: [
          ['Türk*çe* öğreniyorum.', "I'm learning Turkish."],
          ['Nere*li*sin?', 'Where are you from?'],
          ['İsveç*li*yim.', "I'm Swedish."],
          ['Köşede bir kitap*çı* var.', "There's a bookshop on the corner."],
          ['Göz*lüğ*ümü gördün mü?', 'Have you seen my glasses?'],
        ],
      },
      { tip: '"I speak Turkish" is Türkçe konuşuyorum, never Türk konuşuyorum. And Türküm means "I am a Turk".' },
    ],
  },
  {
    id: 'pronouns',
    chapter: 'Small words',
    icon: '👉',
    title: 'Pronouns',
    sub: 'ben, sen, o… and their forms',
    blocks: [
      { p: 'ben (I), sen (you), o (he, she, it), biz (we), siz (you), onlar (they). There is no gender at all: o is he, she and it, unlike Swedish han, hon, den and det.' },
      { p: 'sen is for one person you know well. siz is for several people, and the polite "you" for one, like ni in older Swedish.' },
      {
        table: {
          head: ['', 'me…', 'to me…', 'my…'],
          rows: [
            ['ben', 'beni', '*bana*', '*benim*'],
            ['sen', 'seni', '*sana*', 'senin'],
            ['o', 'o*n*u', 'o*n*a', 'o*n*un'],
            ['biz', 'bizi', 'bize', '*bizim*'],
            ['siz', 'sizi', 'size', 'sizin'],
            ['onlar', 'onları', 'onlara', 'onların'],
          ],
        },
      },
      { p: 'Watch the irregular ones: *bana* and *sana* (not bene, sene), and *benim*, *bizim*. o adds an n before an ending. The other cases are regular: bende, benden, onda, ondan. bu (this) and şu (that) work like o: bunu, buna, şunu.' },
      {
        ex: [
          ['*Seni* seviyorum.', 'I love you.'],
          ['*Bana* bir çay verir misin?', 'Could you give me a tea?'],
          ['Bu kitap *senin* mi?', 'Is this book yours?'],
          ['*O* da geliyor.', "He's coming too. / She's coming too."],
        ],
      },
      { tip: "The verb ending already says who, so Geliyorum is enough. Add ben only to stress \"I\": Ben geliyorum = I'm the one coming. Ben de! (Me too!) works the same way." },
    ],
  },
  {
    id: 'kendi',
    chapter: 'Small words',
    icon: '🪞',
    title: 'Self and own: kendi',
    sub: 'kendim, kendi evim, kendi kendime',
    blocks: [
      { p: '*kendi* means "self". With the "my, your…" endings it becomes kendim (myself), kendin (yourself) and so on, and then it takes case endings like any noun:' },
      {
        table: {
          head: ['', 'myself…', 'myself… (object)', 'to myself…'],
          rows: [
            ['ben', 'kendi*m*', 'kendi*mi*', 'kendi*me*'],
            ['sen', 'kendi*n*', 'kendi*ni*', 'kendi*ne*'],
            ['o', 'kendi*si*', 'kendi*ni*', 'kendi*ne*'],
            ['biz', 'kendi*miz*', 'kendi*mizi*', 'kendi*mize*'],
            ['siz', 'kendi*niz*', 'kendi*nizi*', 'kendi*nize*'],
            ['onlar', 'kendi*leri*', 'kendi*lerini*', 'kendi*lerine*'],
          ],
        },
      },
      { p: 'Use it where English says "myself, yourself": Kendimi iyi hissetmiyorum. (I don\'t feel well.) As the subject it stresses that nobody else did it: Kendim yaptım. (I did it myself.)' },
      { p: 'Bare *kendi* before a noun means "own". The noun keeps its "my, your…" ending: kendi ev*im* (my own house), kendi araba*sı* (his own car).' },
      { p: '*kendi kendime* (kendi kendine, kendi kendimize…) means "by myself, on my own" or "to myself", with nobody else involved.' },
      {
        ex: [
          ['*Kendine* iyi bak!', 'Take care of yourself!'],
          ['Bu pastayı *kendim* yaptım.', 'I made this cake myself.'],
          ['Artık *kendi* odam var.', 'I have my own room now.'],
          ['*Kendi kendime* Türkçe öğreniyorum.', "I'm teaching myself Turkish."],
          ['Çocuk *kendi kendine* konuşuyor.', 'The child is talking to himself.'],
        ],
      },
      { tip: 'When people do something to themselves, use kendi-, not o: Ali aynada *kendini* gördü. (Ali saw himself in the mirror.) Ali aynada onu gördü means he saw someone else.' },
    ],
  },
  {
    id: 'ki',
    chapter: 'Small words',
    icon: '📎',
    title: 'The -ki ending, and ki',
    sub: 'benimki, masadaki, dünkü, iyi ki',
    blocks: [
      { p: 'The ending *-ki* means "the one that is…", and turns a word into a describing word. Unlike almost every other ending, it ignores vowel harmony and is always -ki. Only a few words take -kü: dünkü, bugünkü.' },
      {
        table: {
          head: ['After', 'Example', 'Means'],
          rows: [
            ['the -in form', "benim*ki*, Ali'nin*ki*", "mine, Ali's"],
            ['-de', 'masada*ki* kitap', 'the book on the table'],
            ['a time word', 'dün*kü* maç', "yesterday's match"],
          ],
        },
      },
      { p: 'After the -in form it means "mine, yours…": benimki, seninki, onunki, bizimki, sizinki, onlarınki. After -de it tells you where a thing is: evdeki herkes (everyone at home). After a time word it means "of that time": bugünkü gazete (today\'s paper), yarınki toplantı (tomorrow\'s meeting). A case ending after -ki takes an n first: seninki*n*i (yours, as the object).' },
      { p: 'The separate word *ki* is something else: "that", joining two sentences. It often follows "so": O kadar yorgunum ki… (I\'m so tired that…). Biliyorum ki… (I know that…) sounds emphatic. And *iyi ki* means "it\'s a good thing that".' },
      {
        ex: [
          ['Benim çantam kırmızı, *seninki* mavi.', 'My bag is red, yours is blue.'],
          ['Buzdolabın*daki* yemeği yedin mi?', 'Did you eat the food in the fridge?'],
          ['*Dünkü* maçı izledin mi?', "Did you watch yesterday's match?"],
          ['*İyi ki* geldin!', "I'm so glad you came!"],
          ['*İyi ki* doğdun!', 'Happy birthday! (Good thing you were born!)'],
        ],
      },
      { tip: 'Write the ending -ki together with its word (masadaki, benimki) and the word ki apart (iyi ki), the same way -de (at) and de (too) differ.' },
    ],
  },
  {
    id: 'postpositions',
    chapter: 'Small words',
    icon: '🎁',
    title: 'Postpositions',
    sub: 'için, gibi, kadar, hakkında: for, like, until, about',
    blocks: [
      { p: 'English puts "for" and "like" before a word. Turkish puts them after it: annem *için* (for my mum), arkadaşım *gibi* (like my friend). They are separate words, and their vowels never change.' },
      { p: 'With pronouns, use the -in form: benim için, senin gibi, onun hakkında (but onlar için).' },
      {
        table: {
          head: null,
          rows: [
            ['için', 'for'],
            ['gibi', 'like'],
            ['kadar', 'as … as'],
            ['hakkında', 'about'],
            ['-e kadar', 'until, as far as'],
            ['-den önce', 'before'],
            ['-den sonra', 'after'],
          ],
        },
      },
      { p: 'The last three need a case on the word before: akşam*a kadar* (until the evening), yemek*ten sonra* (after the meal). Without a case, kadar compares: Ali kadar uzun (as tall as Ali). Words for places, like "under" and "behind", work differently: see Place words.' },
      {
        ex: [
          ['Bu senin *için*.', 'This is for you.'],
          ['Aynı annem *gibi* konuşuyorsun.', 'You talk just like my mum.'],
          ['Akşam*a kadar* buradayım.', "I'm here until the evening."],
          ['Yemek*ten sonra* yürüyüşe çıkalım mı?', 'Shall we go for a walk after the meal?'],
          ['Bu film *hakkında* ne düşünüyorsun?', 'What do you think about this film?'],
        ],
      },
      { tip: 'For "ago" and "later", put önce and sonra right after a length of time, with no -den: iki yıl önce (two years ago), bir saat sonra (an hour later).' },
    ],
  },
  {
    id: 'places',
    chapter: 'Small words',
    icon: '📦',
    title: 'Place words',
    sub: 'üstünde, altında, önünde: on, under, in front of',
    blocks: [
      { p: '"Under", "behind" and "next to" are nouns in Turkish: alt (bottom), arka (back), yan (side). They take the "his, her" ending and then a case, and the thing they belong to takes -in: evi*n* ön*ünde* = in front of the house, literally "at the house\'s front".' },
      {
        table: {
          head: ['Noun', 'Where', 'Means'],
          rows: [
            ['iç', 'içinde', 'in, inside'],
            ['üst', 'üstünde', 'on, above'],
            ['alt', 'altında', 'under'],
            ['ön', 'önünde', 'in front of'],
            ['arka', 'arkasında', 'behind'],
            ['yan', 'yanında', 'next to'],
            ['ara', 'arasında', 'between'],
          ],
        },
      },
      { p: 'Like any noun, they take -e for "to" and -den for "from": masanın alt*ına* (to under the table), masanın alt*ından* (from under the table). Ask nerede?, nereye? or nereden?' },
      { p: 'With a pronoun, the ending already says who, so the pronoun is often left out: (benim) yan*ımda* = next to me, or "on me". For plain "in", -de is usually enough: arabada (in the car). içinde stresses "inside".' },
      {
        ex: [
          ['Anahtar masanın *üstünde*.', 'The key is on the table.'],
          ['Eczane bankanın *yanında*.', 'The pharmacy is next to the bank.'],
          ['Arabayı evin *önüne* park ettim.', 'I parked the car in front of the house.'],
          ['Kedi yatağın *altından* çıktı.', 'The cat came out from under the bed.'],
          ['*Yanımda* hiç para yok.', "I don't have any money on me."],
        ],
      },
      { tip: 'English says "under" whether something is there, goes there or comes from there. Turkish shows it on the place word: altında (under), altına (to under), altından (from under).' },
    ],
  },
  {
    id: 'numbers',
    chapter: 'Small words',
    icon: '🔢',
    title: 'Numbers',
    sub: 'Counting, ages, birinci, buçuk',
    blocks: [
      {
        table: {
          head: null,
          rows: [
            ['1 bir', '10 on'],
            ['2 iki', '20 yirmi'],
            ['3 üç', '30 otuz'],
            ['4 dört', '40 kırk'],
            ['5 beş', '50 elli'],
            ['6 altı', '60 altmış'],
            ['7 yedi', '70 yetmiş'],
            ['8 sekiz', '80 seksen'],
            ['9 dokuz', '90 doksan'],
            ['0 sıfır', '100 yüz'],
          ],
        },
      },
      { p: 'Bigger numbers are built like a sum, biggest first: on bir (11), yirmi beş (25), yüz elli (150), iki bin yirmi altı (2026). A hundred and a thousand are just yüz and bin, never bir yüz.' },
      { p: 'After a number the noun stays singular: iki çay (two teas), üç gün (three days). Age is yaşında: Otuz yaşındayım. (I\'m thirty.) Kaç yaşındasın? (How old are you?)' },
      { p: 'For "first, second…" add *-inci* (4-way harmony; after a vowel, -nci): bir*inci*, iki*nci*, üç*üncü*, dörd*üncü* (with d), beş*inci*, on*uncu*. Ask with *kaçıncı*, "which one in order": Kaçıncı kattasın? (Which floor are you on?) In writing, a dot follows the digit: 3. kat (3rd floor).' },
      { p: '*yarım* is "half" on its own: yarım saat (half an hour). After a number, "and a half" is *buçuk*: iki buçuk (two and a half), bir buçuk saat (an hour and a half).' },
      {
        ex: [
          ['Babam altmış beş yaşında.', 'Dad is sixty-five.'],
          ['*Üçüncü* katta oturuyoruz.', 'We live on the third floor.'],
          ['*Yarım* kilo peynir, lütfen.', 'Half a kilo of cheese, please.'],
          ['*Bir buçuk* saat bekledik.', 'We waited an hour and a half.'],
        ],
      },
      { tip: '"One and a half" is bir buçuk, never bir yarım: buçuk comes after a number, yarım stands on its own. For the clock, see Telling the time.' },
    ],
  },
  {
    id: 'time',
    chapter: 'Small words',
    icon: '🕐',
    title: 'Telling the time',
    sub: 'Saat kaç?, üç buçuk, dörde çeyrek var',
    blocks: [
      { p: 'Ask *Saat kaç?* (What time is it?) and answer with saat and the hour: Saat üç. Half past is buçuk: Saat üç buçuk. Half past twelve is just *yarım*.' },
      { p: 'Minutes past: the hour takes -i and the verb is *geçiyor*, "is passing": Saat üç*ü* on geçiyor. (3:10) Minutes to: the hour takes -e and the verb is *var*, "there are": Saat iki*ye* on var. (1:50) A quarter is *çeyrek*.' },
      { p: 'For "at" a time, a full hour or buçuk takes -de: saat üç*te*, üç buçuk*ta*. With minutes, geçiyor becomes *geçe* and var becomes *kala*, "remaining". Ask *Saat kaçta?* (At what time?)' },
      {
        table: {
          head: ['', 'It is…', 'At…'],
          rows: [
            ['3:00', 'saat üç', 'saat üç*te*'],
            ['3:15', 'üçü çeyrek *geçiyor*', 'üçü çeyrek *geçe*'],
            ['3:30', 'üç buçuk', 'üç buçuk*ta*'],
            ['3:45', 'dörde çeyrek *var*', 'dörde çeyrek *kala*'],
          ],
        },
      },
      {
        ex: [
          ['Saat kaç?', 'What time is it?'],
          ['Saat ikiyi yirmi *geçiyor*.', "It's twenty past two."],
          ['Toplantı onu çeyrek *geçe* başlıyor.', 'The meeting starts at a quarter past ten.'],
          ['Film dokuza çeyrek *kala* bitiyor.', 'The film ends at a quarter to nine.'],
          ['Yarın sabah yedi*de* kalkıyoruz.', "We're getting up at seven tomorrow morning."],
        ],
      },
      { tip: 'Pair the ending with the verb: -i goes with geçiyor and geçe, -e with var and kala. dört softens: dördü, dörde. And -de follows the last sound: bir*de*, iki*de*, üç*te*, dört*te*, beş*te*, altı*da*.' },
    ],
  },
  {
    id: 'iyor',
    chapter: 'Tenses',
    icon: '⏳',
    title: 'Present continuous -iyor',
    sub: 'What is happening now, and these days',
    blocks: [
      { p: '-iyor is the tense you will hear most. It covers "I am doing" and often "I do": Türkçe öğren*iyorum* = I am learning Turkish / I learn Turkish.' },
      { p: 'Take the verb without -mek / -mak and add -iyor, with 4-way harmony on the i: -iyor, -ıyor, -uyor, -üyor. The -yor part never changes. Then add the personal ending.' },
      {
        table: {
          head: ['', 'gel- (come)', 'bak- (look)'],
          rows: [
            ['ben', 'gel*iyorum*', 'bak*ıyorum*'],
            ['sen', 'gel*iyorsun*', 'bak*ıyorsun*'],
            ['o', 'gel*iyor*', 'bak*ıyor*'],
            ['biz', 'gel*iyoruz*', 'bak*ıyoruz*'],
            ['siz', 'gel*iyorsunuz*', 'bak*ıyorsunuz*'],
            ['onlar', 'gel*iyorlar*', 'bak*ıyorlar*'],
          ],
        },
      },
      { p: 'A final vowel of the stem drops: bekle- → bekl*iyorum*, ara- → ar*ıyorum*. git- softens to gid*iyorum*, and ye- (eat) and de- (say) become yiyorum and diyorum.' },
      { p: 'Negative: -mi- (4-way) before -yor: gel*mi*yorum (I am not coming), anla*mı*yorum (I don\'t understand).' },
      {
        ex: [
          ['Ne yap*ıyorsun*?', 'What are you doing?'],
          ['Babam televizyon izl*iyor*.', 'Dad is watching TV.'],
          ['Anla*mı*yorum, tekrar eder misin?', "I don't understand, can you say it again?"],
          ['Yarın gel*iyoruz*.', "We're coming tomorrow."],
        ],
      },
      { tip: 'Use -iyor where English uses the simple present for now and these days: Nerede oturuyorsun? (Where do you live?), Biliyorum. (I know.), Seni seviyorum. (I love you.) It is the safe default.' },
    ],
  },
  {
    id: 'aorist',
    chapter: 'Tenses',
    icon: '🔁',
    title: 'Simple present -ir',
    sub: 'Habits, offers and polite requests',
    blocks: [
      { p: 'The -ir tense (the aorist) is for habits, general truths, promises and polite requests. It sounds more general than -iyor: Çay iç*er* misin? = Would you like some tea? / Do you drink tea?' },
      {
        list: [
          'After a vowel, just -r: bekle*r*, oku*r*.',
          'One-syllable stems take -er / -ar: iç*er*, yap*ar*.',
          'Longer stems take -ir (4-way): otur*ur*, konuş*ur*.',
          'Thirteen one-syllable verbs take -ir too, among them al, bil, bul, gel, gör, kal, ol and ver: gel*ir*, al*ır*.',
        ],
      },
      {
        table: {
          head: ['', 'yes', 'no'],
          rows: [
            ['ben', 'gel*irim*', 'gel*mem*'],
            ['sen', 'gel*irsin*', 'gel*mezsin*'],
            ['o', 'gel*ir*', 'gel*mez*'],
            ['biz', 'gel*iriz*', 'gel*meyiz*'],
            ['siz', 'gel*irsiniz*', 'gel*mezsiniz*'],
            ['onlar', 'gel*irler*', 'gel*mezler*'],
          ],
        },
      },
      { p: 'The negative is -mez / -maz, but "I" and "we" are short: gel*mem*, gel*meyiz*.' },
      {
        ex: [
          ['Her sabah çay iç*erim*.', 'I drink tea every morning.'],
          ['Kapıyı aç*ar* mısın?', 'Could you open the door?'],
          ['Ben et ye*mem*.', "I don't eat meat."],
          ['Sonra konuş*uruz*.', "We'll talk later."],
        ],
      },
      { tip: '"I don\'t" is gel*mem*, not gelmezim, and "we don\'t" is gel*meyiz*. This little table is worth learning by heart.' },
    ],
  },
  {
    id: 'past',
    chapter: 'Tenses',
    icon: '⏪',
    title: 'Past -di and -miş',
    sub: 'What happened, and what you heard happened',
    blocks: [
      { p: '-di is the plain past, for things you saw or know happened. It has 4-way harmony, and its d turns into t after f, s, t, k, ç, ş, h or p. That makes eight forms: -di, -dı, -du, -dü, -ti, -tı, -tu, -tü.' },
      {
        table: {
          head: ['', 'gel- (come)', 'yap- (do)'],
          rows: [
            ['ben', 'gel*dim*', 'yap*tım*'],
            ['sen', 'gel*din*', 'yap*tın*'],
            ['o', 'gel*di*', 'yap*tı*'],
            ['biz', 'gel*dik*', 'yap*tık*'],
            ['siz', 'gel*diniz*', 'yap*tınız*'],
            ['onlar', 'gel*diler*', 'yap*tılar*'],
          ],
        },
      },
      { p: 'Note the short endings for I, you and we: -m, -n, -k. Negative: gel*me*di (he didn\'t come), yap*ma*dım (I didn\'t do it).' },
      { p: '-miş (-miş, -mış, -muş, -müş) is the reported past: you heard it from someone, or you just found out. English needs "apparently" or "I hear" for this, like Swedish "tydligen".' },
      {
        ex: [
          ['Dün annemi ara*dım*.', 'I called my mum yesterday.'],
          ['Kahvaltı yap*tın* mı?', 'Did you have breakfast?'],
          ['Ayşe evlen*miş*!', 'I hear Ayşe got married!'],
          ['Baban ara*mış*.', 'Your dad called, apparently.'],
        ],
      },
      { tip: 'Use -di for what you did yourself: Gittim. (I went.) Gitmişim means you only found out afterwards that you went, so it sounds odd about your own day.' },
    ],
  },
  {
    id: 'future',
    chapter: 'Tenses',
    icon: '🔮',
    title: 'Future -ecek',
    sub: 'I will, I am going to',
    blocks: [
      { p: 'The future ending is -ecek / -acak (2-way harmony). After a vowel it takes a y: bekle*yecek*, oku*yacak*.' },
      { p: 'Before a vowel its k softens to ğ, so "I" and "we" have ğ: gel*eceğim*, gel*eceğiz*. The other forms keep the k.' },
      {
        table: {
          head: ['', 'gel- (come)', 'yap- (do)'],
          rows: [
            ['ben', 'gel*eceğim*', 'yap*acağım*'],
            ['sen', 'gel*eceksin*', 'yap*acaksın*'],
            ['o', 'gel*ecek*', 'yap*acak*'],
            ['biz', 'gel*eceğiz*', 'yap*acağız*'],
            ['siz', 'gel*eceksiniz*', 'yap*acaksınız*'],
            ['onlar', 'gel*ecekler*', 'yap*acaklar*'],
          ],
        },
      },
      { p: 'git- and et- soften too: gid*eceğim*, yardım ed*eceğim*. Negative: -meyecek / -mayacak: gel*meyeceğim* (I won\'t come).' },
      {
        ex: [
          ['Yarın sizi ara*yacağım*.', "I'll call you tomorrow."],
          ['Bu akşam ne yap*acaksın*?', 'What are you going to do this evening?'],
          ['Yağmur yağ*acak*.', "It's going to rain."],
          ["Bu yaz Türkiye'ye gid*eceğiz*.", "We're going to Turkey this summer."],
        ],
      },
      { tip: 'Write gel*eceğim*, not gelecekim. In fast speech it often sounds like "gelicem" or "gelcem", so don\'t be thrown when you hear that.' },
    ],
  },
  {
    id: 'modals',
    chapter: 'Moods and voice',
    icon: '💪',
    title: 'Can / must / want',
    sub: '-ebil, -eme, -meli, lazım and istemek',
    blocks: [
      {
        table: {
          head: ['Meaning', 'Form', 'Example'],
          rows: [
            ['can', '-ebil / -abil', 'gel*ebil*irim'],
            ["can't", '-eme / -ama', 'gel*eme*m'],
            ['must, should', '-meli / -malı', 'gel*meli*yim'],
            ['have to', '-mem lazım', 'gel*mem lazım*'],
            ['want to', '-mek istiyorum', 'gel*mek* istiyorum'],
          ],
        },
      },
      { p: 'Can: -ebil goes right after the stem, then any tense: yardım ed*ebil*ir misin? (can you help?). After a vowel it takes a y: bekle*yebil*irim.' },
      { p: "Can't: use -eme / -ama instead, without bil: gel*eme*m (I can't come), yap*ama*dım (I couldn't do it)." },
      { p: 'Have to: the everyday way is the -me form (gitme, "going") with "my" and lazım (needed): gitme*m* lazım = I have to go (literally "my going is needed"). The same goes for gelme*m* lazım: it is not the negative gelmem, "I don\'t come", but the "coming" form plus "my". For others: gitme*n* lazım (you), gitme*si* lazım (he, she). -meli is a firmer "must", and with sen it gives advice.' },
      { p: 'Want to: the -mek form with istemek, as in the last example.' },
      {
        ex: [
          ['Bana yardım ed*ebilir* misin?', 'Can you help me?'],
          ['Bugün gel*eme*m.', "I can't come today."],
          ['Artık git*mem lazım*.', 'I have to go now.'],
          ['Biraz dinlen*meli*sin.', 'You should rest a little.'],
          ['Türkçe öğren*mek* istiyorum.', 'I want to learn Turkish.'],
        ],
      },
      { tip: '-ebil also means "might": Yağmur yağabilir. (It might rain.) So gelmeyebilirim is "I might not come". For "I can\'t come", say gel*eme*m.' },
    ],
  },
  {
    id: 'linking',
    chapter: 'Longer sentences',
    icon: '🔗',
    title: 'Linking sentences',
    sub: 've, ama, çünkü, -ince and -ip',
    blocks: [
      { p: 'The simple linking words work as in English:' },
      {
        table: {
          head: null,
          rows: [
            ['ve', 'and', 'ama', 'but'],
            ['çünkü', 'because', 'ya da', 'or'],
            ['sonra', 'then, later', 'o yüzden', 'so, that is why'],
          ],
        },
      },
      { p: 'de / da (too, also) is a separate word after what it is about. It has 2-way harmony but never turns into te: Ben *de*! (Me too!), Kitap *da* var. (There is a book too.)' },
      { p: 'Often an ending does the linking. -ince (4-way: -ince, -ınca, -unca, -ünce) means "when, once": Eve gel*ince* ara. (Call when you get home.) After a vowel it takes a y: bekle*yince*.' },
      { p: '-ip (-ip, -ıp, -up, -üp) means "and" between two actions with the same tense and person. Only the last verb shows them: Gid*ip* bakacağım. (I will go and look.)' },
      {
        ex: [
          ['Gelemem *çünkü* hastayım.', "I can't come because I'm sick."],
          ['Eve gel*ince* beni ara.', 'Call me when you get home.'],
          ['Markete gid*ip* ekmek alacağım.', "I'll go to the shop and buy bread."],
          ['Ben *de* geliyorum!', "I'm coming too!"],
        ],
      },
      { tip: 'Write de (too) apart and -de (at) together: Ben de evdeyim. (I am at home too.) Mixing them up is a classic spelling mistake, even among Turks.' },
    ],
  },
];
