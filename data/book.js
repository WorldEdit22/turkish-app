// The grammar book: a list of sections, each a page of blocks (see js/guideview.js).
// In any text, *x* shows as bold. The first section is the alphabet.

export const BOOK = [
  {
    id: 'letters',
    icon: '🔤',
    title: 'Letters and sounds',
    sub: 'All 29 letters, and the tricky ones',
    blocks: [{ alphabet: true }],
  },
  {
    id: 'harmony',
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
    id: 'plural',
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
    id: 'tobe',
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
    id: 'cases',
    icon: '📍',
    title: 'The cases',
    sub: '-i, -e, -de, -den, -in: the, to, at, from, of',
    blocks: [
      { p: 'Where English uses little words like to, at and from, Turkish puts an ending on the noun. There are five, all with vowel harmony.' },
      {
        table: {
          head: ['Meaning', 'Ending', 'ev (house)', 'oda (room)'],
          rows: [
            ['object', '-i', 'ev*i*', 'oda*yı*'],
            ['to', '-e', 'ev*e*', 'oda*ya*'],
            ['at, in, on', '-de', 'ev*de*', 'oda*da*'],
            ['from', '-den', 'ev*den*', 'oda*dan*'],
            ["of, 's", '-in', 'ev*in*', 'oda*nın*'],
          ],
        },
      },
      { p: '-i and -in are 4-way (okul*u*, okul*un*, göz*ü*, göz*ün*); -e, -de and -den are 2-way. After a vowel, -i and -e take a y and -in takes an n. After f, s, t, k, ç, ş, h or p, the d turns into t: mutfak*ta*, sokak*tan*.' },
      { p: 'The object ending is only for a definite object, like English "the": Kitap okuyorum. = I am reading (a book). Kitab*ı* okuyorum. = I am reading the book. Names and pronouns always take it.' },
      { p: 'Add -ki to -de to describe a thing by where it is: masada*ki* kitap = the book on the table.' },
      {
        ex: [
          ['Şimdi ev*e* gidiyorum.', "I'm going home now."],
          ['Babam bahçe*de*.', 'Dad is in the garden.'],
          ['Okul*dan* geliyorum.', "I'm coming from school."],
          ['Ekmeğ*i* aldım.', 'I bought the bread.'],
          ['Annem*in* telefonu burada.', "Mum's phone is here."],
        ],
      },
      { tip: "Some verbs take a case English wouldn't expect: bakmak (look at) takes -e, Kedi*ye* bak! (Look at the cat!), and korkmak (be afraid of) takes -den, Köpek*ten* korkuyorum. (I'm afraid of dogs.) Learn each verb with its case." },
    ],
  },
  {
    id: 'possessive',
    icon: '🏷️',
    title: 'Possessive endings and compound nouns',
    sub: "My house, Ali's car, Turkish coffee",
    blocks: [
      { p: 'Where English says "my" or "your", Turkish adds an ending to the thing that is owned. benim (my) can go in front for emphasis, but is usually left out.' },
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
      { p: "When you name the owner, both words get an ending: the owner takes -in (of), the thing takes -i / -sı (his, her): Ali'*nin* araba*sı* = Ali's car." },
      { p: 'A compound noun has the ending only on the second word, and the first word none: Türk kahve*si* (Turkish coffee), yatak oda*sı* (bedroom), akşam yemeğ*i* (dinner). It names a kind of thing, not an owner.' },
      { p: 'A case ending after -i / -sı takes an n first: arabası*n*da (in her car), evi*n*e (to his house).' },
      {
        ex: [
          ['Benim ad*ım* Erik.', 'My name is Erik.'],
          ['Annem*in* ad*ı* Ayşe.', "My mother's name is Ayşe."],
          ['Ev*imiz* küçük ama güzel.', 'Our house is small but nice.'],
          ['Akşam yemeğ*i* hazır!', 'Dinner is ready!'],
        ],
      },
      { tip: "The owned thing always needs its ending: Ali'nin araba*sı*, never Ali'nin araba. Compare Ali'nin kitabı (Ali's book) with çocuk kitabı (a children's book)." },
    ],
  },
  {
    id: 'pronouns',
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
    id: 'questions',
    icon: '❓',
    title: 'Questions',
    sub: 'The particle mi, and question words',
    blocks: [
      { p: 'For a yes/no question, put *mi* after the word you ask about. It is written as a separate word but follows 4-way harmony: mi, mı, mu, mü.' },
      { p: 'Personal endings move onto mi: Yorgun *musun*? (Are you tired?), Hazır *mıyız*? (Are we ready?). Only -ler (they) stays on the word: Geliyorlar *mı*? (Are they coming?) Put mi after another word to ask about just that: Dün *mü* geldin? (Was it yesterday you came?)' },
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
      {
        ex: [
          ['Çay sıcak *mı*?', 'Is the tea hot?'],
          ['Yorgun *musun*?', 'Are you tired?'],
          ['Yemek yedin *mi*?', 'Have you eaten?'],
          ['*Nereye* gidiyorsun?', 'Where are you going?'],
        ],
      },
      { tip: 'Say Geliyor *musun*?, not Geliyorsun mu?: the ending goes on mi. The -di past is the other way round: Geldin *mi*? And mi is always written as its own word.' },
    ],
  },
  {
    id: 'iyor',
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
    id: 'negation',
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
    id: 'modals',
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
      { p: 'Have to: the everyday way is the -me form (gitme, "going") with "my" and lazım (needed): gitme*m* lazım = I have to go (literally "my going is needed"). For others: gitme*n* lazım (you), gitme*si* lazım (he, she). -meli is a firmer "must", and with sen it gives advice.' },
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
  {
    id: 'postpositions',
    icon: '⚖️',
    title: 'Postpositions and comparison',
    sub: 'için, ile, gibi, and bigger / biggest',
    blocks: [
      { p: 'English puts "for", "with" and "like" before a word. Turkish puts them after it: annem *için* (for my mum), arkadaşım *gibi* (like my friend).' },
      { p: 'ile (with, by) is usually an ending: -le / -la, after a vowel -yle / -yla: otobüs*le* (by bus), araba*yla* (by car). With pronouns, use the -in form: benim için, seninle, onun gibi (but onlar için).' },
      { p: 'Some need a case: -den önce (before), -den sonra (after), -e kadar (until): yemek*ten sonra* (after the meal), akşam*a kadar* (until the evening). Place words are nouns with endings: masanın *üstünde* (on the table).' },
      { p: 'Comparison: daha (more) and en (most) go before the adjective, and "than" is -den on the other thing:' },
      {
        table: {
          head: null,
          rows: [
            ['büyük', 'big'],
            ['daha büyük', 'bigger'],
            ['en büyük', 'biggest'],
            ['ev*den* büyük', 'bigger than a house'],
          ],
        },
      },
      {
        ex: [
          ['Bu senin *için*.', 'This is for you.'],
          ['İşe otobüs*le* gidiyorum.', 'I go to work by bus.'],
          ['Anahtar masanın *üstünde*.', 'The key is on the table.'],
          ['Türkçe İngilizce*den* daha zor.', 'Turkish is harder than English.'],
        ],
      },
      { tip: 'There is no word for "than": the thing you compare with takes -den and comes first. Ben*den* büyük = bigger than me (literally "from me big").' },
    ],
  },
  {
    id: 'numbers',
    icon: '🕐',
    title: 'Numbers and time',
    sub: 'Counting, ages and the clock',
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
      { p: 'After a number the noun stays singular: iki çay (two teas), üç gün (three days).' },
      { p: "The clock: Saat kaç? (What time is it?) Saat üç. (It's three.) Half past is buçuk: üç buçuk. \"At\" is -de: saat üç*te* (at three)." },
      { p: 'Quarter past is çeyrek geçiyor, with -i on the hour. Quarter to is çeyrek var, with -e: Saat üç*ü* çeyrek geçiyor. (3:15) Saat dörd*e* çeyrek var. (3:45)' },
      {
        ex: [
          ['Saat kaç?', 'What time is it?'],
          ['Saat üç buçuk.', "It's half past three."],
          ['Saat sekiz*de* geliyorum.', "I'm coming at eight."],
          ['Babam altmış beş yaşında.', 'Dad is sixty-five.'],
        ],
      },
      { tip: 'The -de for "at" follows the number\'s last sound: bir*de*, iki*de*, üç*te*, dört*te*, beş*te*, altı*da*, yedi*de*, sekiz*de*, dokuz*da*, on*da*.' },
    ],
  },
];
