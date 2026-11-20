// Patterns, most useful first (the order is the "most common" ranking).
//
// Each pattern has one block in the app and one or more variants: different
// common ways to say the same thing. A variant has
//   tr / en  how it is shown
//   ex       fixed example sentences [turkish, english]
//   t        templates combined with your words (see js/combine.js)
//   slot     which words fit the gap (type:kind|kind). Defaults to the pattern's slot.
//   note     optional tip

const FOOD = 'food|ingr|drink';
const NOUN_THINGS = `noun:${FOOD}|thing`;
const PLACES = 'noun:place|room|area';

export const PATTERNS = [
  {
    id: 'want', en: 'I want ___', tr: '___ istiyorum', slot: NOUN_THINGS,
    variants: [
      {
        tr: '___ istiyorum', en: 'I want ___',
        note: 'Add "bir" for one item: Bir çay istiyorum.',
        ex: [['Su istiyorum.', 'I want water.'], ['Bir bilet istiyorum.', 'I want a ticket.']],
        t: [['{w} istiyorum.', 'I want {a}.'], ['{w} istemiyorum.', "I don't want {a}."], ['{w} ister misin?', 'Do you want {a}?']],
      },
      {
        tr: '___ alabilir miyim?', en: 'Can I have ___?',
        note: 'Polite and very common when ordering.',
        ex: [['Bir çay alabilir miyim?', 'Can I have a tea?'], ['Hesabı alabilir miyiz?', 'Can we have the bill?']],
        t: [['{w} alabilir miyim?', 'Can I have {a}?']],
      },
      {
        tr: 'Bir ___, lütfen', en: 'A ___, please',
        ex: [['Bir çay, lütfen.', 'A tea, please.'], ['İki bilet, lütfen.', 'Two tickets, please.']],
        t: [['Bir {w}, lütfen.', '{a}, please.']],
      },
    ],
  },
  {
    id: 'var', en: 'Is there ___?', tr: '___ var mı?', slot: `noun:${FOOD}|thing|place|issue|fixture|event|deal|weather|animal`,
    variants: [
      {
        tr: '___ var mı?', en: 'Is there ___? / Do you have ___?',
        ex: [['Wi-Fi var mı?', 'Is there Wi-Fi?'], ['Vejetaryen yemek var mı?', 'Do you have vegetarian food?']],
        t: [['{w} var mı?', '{is} there {a}?'], ['Burada {w} var mı?', '{is} there {a} here?']],
      },
      {
        tr: '___ var', en: 'There is ___',
        ex: [['Sorun var.', 'There is a problem.'], ['Evde ekmek var.', 'There is bread at home.']],
        t: [['{w} var.', 'There {is} {a}.'], ['Burada {w} var.', 'There {is} {a} here.']],
      },
      {
        tr: '___ yok', en: "There's no ___",
        ex: [['Su yok.', "There's no water."], ['Sorun yok.', 'No problem.']],
        t: [['{w} yok.', 'There {is} no {en}.'], ['Burada {w} yok.', 'There {is} no {en} here.']],
      },
    ],
  },
  {
    id: 'where', en: 'Where is ___?', tr: '___ nerede?', slot: 'noun:place|thing|room|area|fixture',
    variants: [
      {
        tr: '___ nerede?', en: 'Where is ___?',
        ex: [['Tuvalet nerede?', 'Where is the toilet?'], ['Anahtar nerede?', 'Where is the key?']],
        t: [['{w} nerede?', 'Where {is} {the}?'], ['{w} burada mı?', '{is} {the} here?']],
      },
      {
        tr: 'En yakın ___ nerede?', en: 'Where is the nearest ___?', slot: 'noun:place',
        ex: [['En yakın eczane nerede?', 'Where is the nearest pharmacy?'], ['En yakın bankamatik nerede?', 'Where is the nearest ATM?']],
        t: [['En yakın {w} nerede?', 'Where is the nearest {en}?']],
      },
      {
        tr: '___ ne tarafta?', en: 'Which way is ___?', slot: 'noun:place|area',
        ex: [['Plaj ne tarafta?', 'Which way is the beach?'], ['Çıkış ne tarafta?', 'Which way is the exit?']],
        t: [['{w} ne tarafta?', 'Which way is {the}?']],
      },
    ],
  },
  {
    id: 'price', en: 'How much is ___?', tr: '___ ne kadar?', slot: `noun:${FOOD}|thing|vehicle`,
    variants: [
      {
        tr: '___ ne kadar?', en: 'How much is ___?',
        ex: [['Bu ne kadar?', 'How much is this?'], ['Bilet ne kadar?', 'How much is the ticket?']],
        t: [['{w} ne kadar?', 'How much {is} {the}?']],
      },
      {
        tr: '___ kaç lira?', en: 'How many lira is ___?',
        ex: [['Çay kaç lira?', 'How many lira is the tea?'], ['Bu kaç lira?', 'How many lira is this?']],
        t: [['{w} kaç lira?', 'How many lira {is} {the}?']],
      },
    ],
  },
  {
    id: 'iam', en: "I'm ___", tr: '___-im', slot: 'adj:feel|any',
    variants: [
      {
        tr: '___-im / -ım / -um / -üm', en: "I'm ___",
        note: 'Personal endings follow vowel harmony: yorgun → yorgunum, hasta → hastayım.',
        ex: [['Yorgunum.', "I'm tired."], ['Açım.', "I'm hungry."]],
        t: [['{w:(y)Im}.', "I'm {en}."], ['Bugün {w:(y)Im}.', "I'm {en} today."]],
      },
      {
        tr: '___ misin?', en: 'Are you ___?',
        ex: [['Aç mısın?', 'Are you hungry?'], ['Emin misin?', 'Are you sure?']],
        t: [['{w:_mIsIn}?', 'Are you {en}?']],
      },
      {
        tr: '___ değilim', en: "I'm not ___",
        ex: [['Aç değilim.', "I'm not hungry."], ['Emin değilim.', "I'm not sure."]],
        t: [['{w} değilim.', "I'm not {en}."]],
      },
    ],
  },
  {
    id: 'very', en: "It's very ___", tr: 'Çok ___', slot: 'adj:desc|any',
    variants: [
      {
        tr: 'Çok ___', en: "It's very ___",
        note: 'No word for "it is" is needed: Çok güzel = It\'s very nice.',
        ex: [['Çok güzel!', "It's very nice!"], ['Çok pahalı.', "It's very expensive."]],
        t: [['Çok {w}.', "It's very {en}."], ['Bu çok {w}.', 'This is very {en}.']],
      },
      {
        tr: 'Biraz ___', en: "It's a bit ___", slot: 'adj:desc',
        ex: [['Biraz pahalı.', "It's a bit expensive."], ['Biraz soğuk.', "It's a bit cold."]],
        t: [['Biraz {w}.', "It's a bit {en}."]],
      },
      {
        tr: 'Çok ___ değil', en: "It's not very ___",
        ex: [['Çok uzak değil.', "It's not very far."], ['Fena değil.', 'Not bad.']],
        t: [['Çok {w} değil.', "It's not very {en}."], ['{w} değil.', "It's not {en}."]],
      },
      {
        tr: 'Ne kadar ___!', en: 'How ___!',
        ex: [['Ne kadar güzel!', 'How beautiful!'], ['Ne kadar tatlı!', 'How cute!']],
        t: [['Ne kadar {w}!', 'How {en}!']],
      },
    ],
  },
  {
    id: 'wantto', en: 'I want to ___', tr: '-mek istiyorum', slot: 'verb',
    variants: [
      {
        tr: '-mek / -mak istiyorum', en: 'I want to ___',
        ex: [['Türkçe öğrenmek istiyorum.', 'I want to learn Turkish.'], ['Eve gitmek istiyorum.', 'I want to go home.']],
        t: [['{w:mAk} istiyorum.', 'I want to {base}.'], ['{w:mAk} istemiyorum.', "I don't want to {base}."], ['Bugün {w:mAk} istiyorum.', 'I want to {base} today.']],
      },
      {
        tr: '-mek ister misin?', en: 'Would you like to ___?',
        ex: [['Kahve içmek ister misin?', 'Would you like to drink coffee?'], ['Yürümek ister misin?', 'Do you want to walk?']],
        t: [['{w:mAk} ister misin?', 'Would you like to {base}?']],
      },
    ],
  },
  {
    id: 'can', en: 'Can you ___?', tr: '-ebilir misin?', slot: 'verb',
    variants: [
      {
        tr: '-ebilir misin?', en: 'Can you ___?',
        ex: [['Bana yardım edebilir misin?', 'Can you help me?'], ['Tekrar edebilir misiniz?', 'Could you repeat that?']],
        t: [['{w:(y)Abilir_mIsIn}?', 'Can you {base}?'], ['Lütfen {w:(y)Abilir_mIsInIz}?', 'Could you please {base}?']],
      },
      {
        tr: '-ebilir miyim?', en: 'Can I ___?',
        ex: [['Burada oturabilir miyim?', 'Can I sit here?'], ['Kartla ödeyebilir miyim?', 'Can I pay by card?']],
        t: [['{w:(y)Abilir_mIyIm}?', 'Can I {base}?'], ['Burada {w:(y)Abilir_mIyIm}?', 'Can I {base} here?']],
      },
      {
        tr: '-ebilirim', en: 'I can ___',
        ex: [['Yardım edebilirim.', 'I can help.'], ['Yarın gelebilirim.', 'I can come tomorrow.']],
        t: [['{w:(y)AbilirIm}.', 'I can {base}.'], ['Yarın {w:(y)AbilirIm}.', 'I can {base} tomorrow.']],
      },
      {
        tr: '-emem', en: "I can't ___",
        ex: [['Gelemem.', "I can't come."], ['Bunu yapamam.', "I can't do this."]],
        t: [['{w:(y)AmAm}.', "I can't {base}."], ['Bugün {w:(y)AmAm}.', "I can't {base} today."]],
      },
    ],
  },
  {
    id: 'now', en: "I'm ___ing", tr: '-iyorum', slot: 'verb',
    variants: [
      {
        tr: '-iyorum', en: "I'm ___ing / I ___",
        note: 'The most used tense. Covers "right now" and everyday habits.',
        ex: [['Geliyorum!', "I'm coming!"], ['Türkçe öğreniyorum.', "I'm learning Turkish."]],
        t: [['{w:Iyorum}.', "I'm {ing}."], ['Şu an {w:Iyorum}.', "I'm {ing} right now."]],
      },
      {
        tr: '-iyor musun?', en: 'Are you ___ing?',
        ex: [['Anlıyor musun?', 'Do you understand?'], ['Geliyor musun?', 'Are you coming?']],
        t: [['{w:Iyor_mIsIn}?', 'Are you {ing}?']],
      },
      {
        tr: '-miyorum', en: "I'm not ___ing / I don't ___",
        ex: [['Anlamıyorum.', "I don't understand."], ['Bilmiyorum.', "I don't know."]],
        t: [['{w:mIyorum}.', "I'm not {ing}."]],
      },
      {
        tr: '-iyor', en: 'He / she is ___ing',
        ex: [['Yağmur yağıyor.', "It's raining."], ['Annem uyuyor.', 'My mom is sleeping.']],
        t: [['O {w:Iyor}.', 'He is {ing}.']],
      },
    ],
  },
  {
    id: 'past', en: 'I ___ed (past)', tr: '-dim', slot: 'verb',
    variants: [
      {
        tr: '-dim / -dım / -tim', en: 'I ___ed',
        ex: [['Anladım.', 'I understood. / Got it.'], ['Dün geldim.', 'I came yesterday.']],
        t: [['{w:DIm}.', 'I {past}.'], ['Dün {w:DIm}.', 'I {past} yesterday.']],
      },
      {
        tr: '-din mi?', en: 'Did you ___?',
        ex: [['Yemek yedin mi?', 'Did you eat?'], ['Anladın mı?', 'Did you understand?']],
        t: [['{w:DIn_mI}?', 'Did you {base}?']],
      },
      {
        tr: '-medim', en: "I didn't ___",
        ex: [['Anlamadım.', "I didn't understand."], ['Görmedim.', "I didn't see it."]],
        t: [['{w:mAdIm}.', "I didn't {base}."]],
      },
      {
        tr: '-di', en: 'He / she ___ed',
        ex: [['Otobüs geldi.', 'The bus came.'], ['Bitti.', "It's finished."]],
        t: [['O {w:DI}.', 'He {past}.']],
      },
    ],
  },
  {
    id: 'have', en: 'I have ___', tr: '___-im var', slot: `noun:${FOOD}|thing|person|vehicle|issue|abstract|event|info|ailment|animal`,
    variants: [
      {
        tr: '___-im var', en: 'I have ___',
        note: 'Turkish says "my ___ exists": araba → Arabam var.',
        ex: [['Arabam var.', 'I have a car.'], ['İki kardeşim var.', 'I have two siblings.']],
        t: [['{w:(I)m} var.', 'I have {a}.'], ['{w:(I)n} var mı?', 'Do you have {a}?']],
      },
      {
        tr: '___-im yok', en: "I don't have ___",
        ex: [['Param yok.', "I don't have money."], ['Vaktim yok.', "I don't have time."]],
        t: [['{w:(I)m} yok.', "I don't have {a}."]],
      },
    ],
  },
  {
    id: 'need', en: 'I need ___', tr: 'Bana ___ lazım', slot: `noun:${FOOD}|thing|abstract|help|vehicle`,
    variants: [
      {
        tr: 'Bana ___ lazım', en: 'I need ___',
        note: 'Casual and very common.',
        ex: [['Bana bir taksi lazım.', 'I need a taxi.'], ['Bana yardım lazım.', 'I need help.']],
        t: [['Bana {w} lazım.', 'I need {a}.'], ['Sana {w} lazım mı?', 'Do you need {a}?']],
      },
      {
        tr: '___-e ihtiyacım var', en: 'I need ___',
        note: 'A bit more formal.',
        ex: [['Yardıma ihtiyacım var.', 'I need help.'], ['Doktora ihtiyacım var.', 'I need a doctor.']],
        t: [['{w:(y)A} ihtiyacım var.', 'I need {a}.']],
      },
      {
        tr: 'Bana ___ gerek', en: 'I need ___',
        ex: [['Bana biraz zaman gerek.', 'I need some time.']],
        t: [['Bana {w} gerek.', 'I need {a}.']],
      },
    ],
  },
  {
    id: 'must', en: 'I have to ___', tr: '-mem lazım', slot: 'verb',
    variants: [
      {
        tr: '-mem / -mam lazım', en: 'I have to ___',
        note: 'Casual and very common.',
        ex: [['Gitmem lazım.', 'I have to go.'], ['Erken kalkmam lazım.', 'I have to get up early.']],
        t: [['{w:mAm} lazım.', 'I have to {base}.'], ['Bugün {w:mAm} lazım.', 'I have to {base} today.'], ['{w:mAn} lazım.', 'You have to {base}.']],
      },
      {
        tr: '-mem gerek', en: 'I need to ___',
        ex: [['Biraz dinlenmem gerek.', 'I need to rest a bit.'], ['Onu aramam gerek.', 'I need to call him.']],
        t: [['{w:mAm} gerek.', 'I need to {base}.']],
      },
      {
        tr: '-meliyim', en: 'I must ___',
        ex: [['Gitmeliyim.', 'I must go.'], ['Daha çok çalışmalıyım.', 'I should work more.']],
        t: [['{w:mAlIyIm}.', 'I must {base}.']],
      },
    ],
  },
  {
    id: 'lets', en: "Let's ___", tr: '-elim', slot: 'verb',
    variants: [
      {
        tr: '-elim / -alım', en: "Let's ___",
        ex: [['Gidelim!', "Let's go!"], ['Bir kahve içelim.', "Let's have a coffee."]],
        t: [['{w:(y)AlIm}!', "Let's {base}!"], ['Yarın {w:(y)AlIm}.', "Let's {base} tomorrow."]],
      },
      {
        tr: '-elim mi?', en: 'Shall we ___?',
        ex: [['Yürüyelim mi?', 'Shall we walk?'], ['Başlayalım mı?', 'Shall we start?']],
        t: [['{w:(y)AlIm_mI}?', 'Shall we {base}?']],
      },
      {
        tr: '-eyim mi?', en: 'Shall I ___?',
        ex: [['Yardım edeyim mi?', 'Shall I help?'], ['Kapıyı açayım mı?', 'Shall I open the door?']],
        t: [['{w:(y)AyIm_mI}?', 'Shall I {base}?'], ['{w:(y)AyIm}.', 'Let me {base}.']],
      },
    ],
  },
  {
    id: 'please', en: 'Please ___', tr: 'Lütfen ___-in', slot: 'verb',
    variants: [
      {
        tr: '-in / -ın (polite)', en: 'Please ___',
        note: 'Add -in to the stem to be polite: Gel → Gelin. Lütfen makes it softer.',
        ex: [['Lütfen bekleyin.', 'Please wait.'], ['Buyurun, oturun.', 'Here you are, sit down.']],
        t: [['Lütfen {w:(y)In}.', 'Please {base}.']],
      },
      {
        tr: '___! (to a friend)', en: '___! (casual)',
        note: 'The bare stem is a casual command.',
        ex: [['Gel!', 'Come!'], ['Bak!', 'Look!']],
        t: [['{w:}!', '{base}!'], ['Hadi, {w:}!', 'Come on, {base}!']],
      },
      {
        tr: '-ir misin?', en: 'Would you ___?',
        ex: [['Kapıyı açar mısın?', 'Would you open the door?'], ['Tuzu uzatır mısın?', 'Would you pass the salt?']],
        t: [['{w:R_mIsIn}?', 'Would you {base}?'], ['Lütfen {w:R_mIsInIz}?', 'Would you please {base}?']],
      },
    ],
  },
  {
    id: 'this', en: 'This ___', tr: 'Bu ___', slot: `noun:${FOOD}|thing|place|vehicle|room|area|fixture|animal`,
    variants: [
      {
        tr: 'Bu ___', en: 'This ___',
        ex: [['Bu ne?', 'What is this?'], ['Bu kitap çok güzel.', 'This book is very good.']],
        t: [['Bu {w} çok güzel.', '{this} {en} {is} very nice.'], ['Bu {w} kimin?', 'Whose {en} {is} {this}?']],
      },
      {
        tr: 'Şu ___', en: 'That ___ (pointing)', slot: NOUN_THINGS,
        ex: [['Şunu alabilir miyim?', 'Can I have that one?'], ['Şu adam kim?', 'Who is that man?']],
        t: [['Şu {w} ne kadar?', 'How much {is} {that} {en}?']],
      },
      {
        tr: 'O ___', en: 'That ___',
        ex: [['O kim?', 'Who is that?'], ['O film çok güzeldi.', 'That movie was very good.']],
        t: [['O {w} nerede?', 'Where {is} {that} {en}?']],
      },
    ],
  },
  {
    id: 'my', en: 'My ___', tr: '___-im', slot: 'noun:thing|person|room|vehicle|name|event|info|measure|animal',
    variants: [
      {
        tr: '___-im (my)', en: 'My ___',
        note: 'Possessive endings: ev → evim (my house), araba → arabam (my car).',
        ex: [['Bu benim çantam.', 'This is my bag.'], ['Telefonum nerede?', 'Where is my phone?']],
        t: [['{w:(I)m} nerede?', 'Where {is} my {en}?'], ['Bu benim {w:(I)m}.', '{this} {is} my {en}.']],
      },
      {
        tr: '___-in (your)', en: 'Your ___',
        ex: [['Telefonun çalıyor.', 'Your phone is ringing.'], ['Adın ne?', "What's your name?"]],
        t: [['{w:(I)n} nerede?', 'Where {is} your {en}?'], ['Bu senin {w:(I)n_mI}?', '{is} {this} your {en}?']],
      },
      {
        tr: '___-i (his / her)', en: 'His / her ___',
        ex: [['Annesi doktor.', 'Her mother is a doctor.'], ['Arabası yeni.', 'His car is new.']],
        t: [['{w:(s)I} nerede?', 'Where {is} her {en}?']],
      },
    ],
  },
  {
    id: 'going', en: "I'm going to ___", tr: '___-e gidiyorum', slot: PLACES,
    variants: [
      {
        tr: '___-e / -a gidiyorum', en: "I'm going to ___",
        note: '-e / -a means "to".',
        ex: [['Eve gidiyorum.', "I'm going home."], ['İşe gidiyorum.', "I'm going to work."]],
        t: [['{w:(y)A} gidiyorum.', "I'm going {to}."], ['{w:(y)A} gidiyor musun?', 'Are you going {to}?'], ['Yarın {w:(y)A} gideceğim.', "I'll go {to} tomorrow."]],
      },
      {
        tr: '___-e gidelim', en: "Let's go to ___",
        ex: [['Plaja gidelim!', "Let's go to the beach!"], ['Eve gidelim.', "Let's go home."]],
        t: [['{w:(y)A} gidelim.', "Let's go {to}."], ['{w:(y)A} gidelim mi?', 'Shall we go {to}?']],
      },
    ],
  },
  {
    id: 'at', en: "I'm at ___", tr: '___-deyim', slot: PLACES,
    variants: [
      {
        tr: '___-deyim / -dayım', en: "I'm at / in ___",
        note: '-de / -da means "at / in". After a hard consonant it becomes -te / -ta.',
        ex: [['Evdeyim.', "I'm at home."], ['Ofisteyim.', "I'm at the office."]],
        t: [['{w:DA(y)Im}.', "I'm {at}."], ['Şu an {w:DA(y)Im}.', "I'm {at} right now."]],
      },
      {
        tr: '___-de misin?', en: 'Are you at ___?',
        ex: [['Evde misin?', 'Are you at home?'], ['Neredesin?', 'Where are you?']],
        t: [['{w:DA_mIsIn}?', 'Are you {at}?']],
      },
      {
        tr: '___-de buluşalım', en: "Let's meet at ___",
        ex: [['Kafede buluşalım.', "Let's meet at the café."], ['Saat beşte buluşalım.', "Let's meet at five."]],
        t: [['{w:DA} buluşalım.', "Let's meet {at}."]],
      },
    ],
  },
  {
    id: 'future', en: 'I will ___', tr: '-eceğim', slot: 'verb',
    variants: [
      {
        tr: '-eceğim / -acağım', en: 'I will ___',
        ex: [['Yarın arayacağım.', "I'll call tomorrow."], ['Sonra geleceğim.', "I'll come later."]],
        t: [['{w:(y)AcAğIm}.', "I'll {base}."], ['Yarın {w:(y)AcAğIm}.', "I'll {base} tomorrow."]],
      },
      {
        tr: '-ecek misin?', en: 'Will you ___?',
        ex: [['Gelecek misin?', 'Will you come?'], ['Ne yapacaksın?', 'What will you do?']],
        t: [['{w:(y)AcAk_mIsIn}?', 'Will you {base}?']],
      },
      {
        tr: '-meyeceğim', en: "I won't ___",
        ex: [['Unutmayacağım.', "I won't forget."], ['Bir daha yapmayacağım.', "I won't do it again."]],
        t: [['{w:mAyAcAğIm}.', "I won't {base}."]],
      },
    ],
  },
  {
    id: 'isit', en: 'Is it ___?', tr: '___ mı?', slot: 'adj:desc|any',
    variants: [
      {
        tr: '___ mı? / mi? / mu? / mü?', en: 'Is it ___?',
        note: 'The question word follows vowel harmony.',
        ex: [['Pahalı mı?', 'Is it expensive?'], ['Uzak mı?', 'Is it far?']],
        t: [['{w:_mI}?', 'Is it {en}?'], ['Bu {w:_mI}?', 'Is this {en}?']],
      },
    ],
  },
  {
    id: 'dont', en: "Don't ___", tr: '-me!', slot: 'verb',
    variants: [
      {
        tr: '-me / -ma', en: "Don't ___! (casual)",
        ex: [['Gitme!', "Don't go!"], ['Merak etme.', "Don't worry."]],
        t: [['{w:mA}!', "Don't {base}!"], ['Lütfen {w:mA}.', "Please don't {base}."]],
      },
      {
        tr: '-meyin', en: "Don't ___ (polite)",
        ex: [['Lütfen sigara içmeyin.', 'Please do not smoke.'], ['Endişelenmeyin.', "Don't worry."]],
        t: [['Lütfen {w:mAyIn}.', "Please don't {base}."]],
      },
    ],
  },
  {
    id: 'habit', en: 'I usually ___', tr: '-irim / -arım', slot: 'verb',
    variants: [
      {
        tr: '-irim / -arım', en: 'I (usually) ___',
        note: 'This tense (geniş zaman) is for habits, general truths and promises.',
        ex: [['Her sabah kahve içerim.', 'I drink coffee every morning.'], ['Genelde erken kalkarım.', 'I usually get up early.']],
        t: [['Genelde {w:RIm}.', 'I usually {base}.'], ['Her gün {w:RIm}.', 'I {base} every day.']],
      },
      {
        tr: '-mem / -mam', en: "I don't ___ (in general)",
        ex: [['Et yemem.', "I don't eat meat."], ['Sigara içmem.', "I don't smoke."]],
        t: [['{w:mAm}.', "I don't {base}."]],
      },
      {
        tr: '-ir misin?', en: 'Do you ___? (in general)',
        ex: [['Çay içer misin?', 'Do you drink tea?'], ['Futbol oynar mısın?', 'Do you play football?']],
        t: [['{w:R_mIsIn}?', 'Do you {base}?']],
      },
    ],
  },
  {
    id: 'thanks', en: 'Thanks for ___', tr: '___ için teşekkürler', slot: `noun:${FOOD}|thing|help`,
    variants: [
      {
        tr: '___ için teşekkürler', en: 'Thanks for ___',
        ex: [['Her şey için teşekkürler.', 'Thanks for everything.'], ['Yardımın için teşekkürler.', 'Thanks for your help.']],
        t: [['{w} için teşekkürler.', 'Thanks for {the}.']],
      },
    ],
  },
  {
    id: 'seeyou', en: 'See you ___', tr: '___ görüşürüz', slot: '*:time|day',
    variants: [
      {
        tr: '___ görüşürüz', en: 'See you ___',
        ex: [['Yarın görüşürüz!', 'See you tomorrow!'], ['Sonra görüşürüz.', 'See you later.']],
        t: [['{w} görüşürüz!', 'See you {when}!']],
      },
      {
        tr: 'Her ___', en: 'Every ___', slot: 'noun:period|time|day|unit',
        ex: [['Her gün spor yapıyorum.', 'I work out every day.'], ['Her sabah çay içerim.', 'I drink tea every morning.']],
        t: [['Her {w} buradayım.', "I'm here every {en}."], ['Her {w} görüşelim.', "Let's meet every {en}."]],
      },
    ],
  },
  {
    id: 'clock', en: "At ___ o'clock", tr: 'Saat ___-de', slot: '*:hour',
    variants: [
      {
        tr: 'Saat ___-de', en: "At ___ o'clock",
        ex: [['Saat beşte buluşalım.', "Let's meet at five."], ['Saat kaçta?', 'At what time?']],
        t: [['Saat {w:DA} buluşalım.', "Let's meet at {en} o'clock."], ['Saat {w:DA} geliyorum.', "I'm coming at {en} o'clock."]],
      },
      {
        tr: 'Saat ___', en: "It's ___ o'clock",
        ex: [['Saat üç.', "It's three o'clock."], ['Saat kaç?', 'What time is it?']],
        t: [['Saat {w}.', "It's {en} o'clock."]],
      },
      {
        tr: 'Saat ___ buçuk', en: 'Half past ___',
        ex: [['Saat üç buçuk.', "It's half past three."]],
        t: [['Saat {w} buçuk.', "It's half past {en}."]],
      },
    ],
  },
  {
    id: 'howto', en: 'How do I get to ___?', tr: '___-e nasıl gidebilirim?', slot: 'noun:place|area',
    variants: [
      {
        tr: '___-e nasıl gidebilirim?', en: 'How can I get to ___?',
        ex: [['Havalimanına nasıl gidebilirim?', 'How can I get to the airport?'], ['Merkeze nasıl gidebilirim?', 'How can I get to the center?']],
        t: [['{w:(y)A} nasıl gidebilirim?', 'How can I get {to}?'], ['{w:(y)A} nasıl gidilir?', 'How do you get {to}?']],
      },
      {
        tr: '___-e gitmek ne kadar sürer?', en: 'How long does it take to get to ___?',
        ex: [['Havalimanına gitmek ne kadar sürer?', 'How long does it take to get to the airport?']],
        t: [['{w:(y)A} gitmek ne kadar sürer?', 'How long does it take to get {to}?']],
      },
      {
        tr: '___ uzak mı?', en: 'Is ___ far?',
        ex: [['Plaj uzak mı?', 'Is the beach far?'], ['Buradan uzak mı?', 'Is it far from here?']],
        t: [['{w} uzak mı?', 'Is {the} far?']],
      },
    ],
  },
  {
    id: 'looking', en: "I'm looking for ___", tr: '___ arıyorum', slot: 'noun:place|thing',
    variants: [
      {
        tr: 'Bir ___ arıyorum', en: "I'm looking for a ___",
        ex: [['Bir eczane arıyorum.', "I'm looking for a pharmacy."], ['Bir otel arıyorum.', "I'm looking for a hotel."]],
        t: [['Bir {w} arıyorum.', "I'm looking for {a}."]],
      },
      {
        tr: '___-i arıyorum', en: "I'm looking for the ___",
        note: 'A specific thing takes -i: Tuvaleti arıyorum.',
        ex: [['Tuvaleti arıyorum.', "I'm looking for the toilet."], ['Anahtarımı arıyorum.', "I'm looking for my key."]],
        t: [['{w:(y)I} arıyorum.', "I'm looking for {the}."], ['{w:(y)I} bulamıyorum.', "I can't find {the}."]],
      },
      {
        tr: '___ nereden alabilirim?', en: 'Where can I buy ___?', slot: NOUN_THINGS,
        ex: [['Bilet nereden alabilirim?', 'Where can I buy a ticket?'], ['Su nereden alabilirim?', 'Where can I buy water?']],
        t: [['{w} nereden alabilirim?', 'Where can I buy {a}?']],
      },
    ],
  },
  {
    id: 'from', en: "I'm coming from ___", tr: '___-den geliyorum', slot: PLACES,
    variants: [
      {
        tr: '___-den / -dan geliyorum', en: "I'm coming from ___",
        note: '-den / -dan means "from".',
        ex: [['İşten geliyorum.', "I'm coming from work."], ['Marketten geliyorum.', "I'm coming from the supermarket."]],
        t: [['{w:DAn} geliyorum.', "I'm coming {from}."], ['{w:DAn} ne zaman döneceksin?', 'When will you come back {from}?']],
      },
      {
        tr: '___-liyim', en: "I'm from ___ (a place)",
        ex: [['Nerelisin?', 'Where are you from?'], ['İstanbulluyum.', "I'm from Istanbul."]],
        t: [],
      },
    ],
  },
  {
    id: 'hurts', en: 'My ___ hurts', tr: '___-im ağrıyor', slot: 'noun:body',
    variants: [
      {
        tr: '___-im ağrıyor', en: 'My ___ hurts',
        ex: [['Başım ağrıyor.', 'I have a headache.'], ['Dişim ağrıyor.', 'My tooth hurts.']],
        t: [['{w:(I)m} ağrıyor.', 'My {en} hurts.'], ['{w:(I)n} ağrıyor mu?', 'Does your {en} hurt?']],
      },
      {
        tr: '___-im acıyor', en: 'My ___ is sore',
        ex: [['Gözüm acıyor.', 'My eye stings.'], ['Burası acıyor.', 'It hurts here.']],
        t: [['{w:(I)m} acıyor.', 'My {en} is sore.']],
      },
    ],
  },
  {
    id: 'by', en: 'By ___ (bus, car...)', tr: '___-le', slot: 'noun:vehicle',
    variants: [
      {
        tr: '___-le / -la / -yle', en: 'By ___ / with ___',
        ex: [['Otobüsle gidiyorum.', "I'm going by bus."], ['Taksiyle gidelim.', "Let's go by taxi."]],
        t: [['{w:(y)lA} gidiyorum.', "I'm going by {en}."], ['{w:(y)lA} gidelim.', "Let's go by {en}."], ['{w:(y)lA} ne kadar sürer?', 'How long does it take by {en}?']],
      },
      {
        tr: '___ ile', en: 'With ___ (separate word)',
        ex: [['Arkadaşım ile geldim.', 'I came with my friend.'], ['Kredi kartı ile ödeyebilir miyim?', 'Can I pay by credit card?']],
        t: [['{w} ile gidiyorum.', "I'm going by {en}."]],
      },
    ],
  },
  {
    id: 'withwithout', en: 'With / without ___', tr: '___-li / ___-siz', slot: 'noun:ingr',
    variants: [
      {
        tr: '___-siz / -sız / -suz', en: 'Without ___',
        ex: [['Şekersiz, lütfen.', 'Without sugar, please.'], ['Sütsüz kahve.', 'Coffee without milk.']],
        t: [['{w:sIz}, lütfen.', 'Without {en}, please.'], ['{w:sIz} olsun.', 'Make it without {en}.']],
      },
      {
        tr: '___-li / -lı / -lu', en: 'With ___',
        ex: [['Sütlü kahve, lütfen.', 'Coffee with milk, please.'], ['Peynirli börek.', 'Börek with cheese.']],
        t: [['{w:lI} olsun.', 'Make it with {en}.']],
      },
    ],
  },
  {
    id: 'like', en: 'I like ___', tr: '___-i seviyorum', slot: `noun:${FOOD}`,
    variants: [
      {
        tr: '___-i seviyorum', en: 'I love ___',
        note: 'What you love takes -i: kahve → Kahveyi seviyorum.',
        ex: [['Türk kahvesini seviyorum.', 'I love Turkish coffee.'], ['Seni seviyorum.', 'I love you.']],
        t: [['{w:(y)I} çok seviyorum.', 'I really love {gen}.'], ['{w:(y)I} sevmiyorum.', "I don't like {gen}."]],
      },
      {
        tr: '___ severim', en: 'I like ___ (in general)',
        ex: [['Çay severim.', 'I like tea.'], ['Balık sever misin?', 'Do you like fish?']],
        t: [['{w} severim.', 'I like {gen}.'], ['{w} sever misin?', 'Do you like {gen}?']],
      },
    ],
  },
  {
    id: 'when', en: 'When I ___', tr: '-ince', slot: 'verb',
    variants: [
      {
        tr: '-ince / -ınca', en: 'When / once ___',
        note: 'The short, casual way.',
        ex: [['Eve gelince ararım.', "I'll call when I get home."], ['Görünce şaşırdım.', 'I was surprised when I saw it.']],
        t: [['{w:(y)IncA} ararım.', "I'll call when I {base}."], ['{w:(y)IncA} haber ver.', 'Let me know when you {base}.']],
      },
      {
        tr: '-diğimde', en: 'When I ___',
        ex: [['Eve geldiğimde uyuyordun.', 'When I came home, you were sleeping.'], ["İstanbul'a gittiğimde seni arayacağım.", "I'll call you when I go to Istanbul."]],
        t: [['{w:DIğImdA} seni ararım.', "I'll call you when I {base}."]],
      },
      {
        tr: '-diğim zaman', en: 'When I ___',
        ex: [['Boş olduğum zaman kitap okurum.', "When I'm free, I read books."], ['Yorulduğum zaman uyurum.', 'When I get tired, I sleep.']],
        t: [['{w:DIğIm} zaman seni ararım.', "When I {base}, I'll call you."]],
      },
    ],
  },
  {
    id: 'if', en: 'If you ___', tr: '-irsen', slot: 'verb',
    variants: [
      {
        tr: '-irsen / -arsan', en: 'If you ___',
        ex: [['Gelirsen sevinirim.', "I'd be happy if you came."], ['İstersen gidebiliriz.', 'We can go if you want.']],
        t: [['{w:RsAn} haber ver.', 'Let me know if you {base}.']],
      },
      {
        tr: '-irsem / -arsam', en: 'If I ___',
        ex: [['Zamanım olursa gelirim.', "If I have time, I'll come."], ['Unutursam hatırlat.', 'Remind me if I forget.']],
        t: [['{w:RsAm} seni ararım.', "If I {base}, I'll call you."]],
      },
    ],
  },
  {
    id: 'because', en: 'Because ___', tr: 'çünkü / -diği için', slot: 'verb',
    variants: [
      {
        tr: 'çünkü ...', en: 'Because ...',
        ex: [['Gelemem, çünkü çalışıyorum.', "I can't come because I'm working."], ['Yorgunum çünkü uyumadım.', "I'm tired because I didn't sleep."]],
        t: [['Gelemem, çünkü {w:Iyorum}.', "I can't come because I'm {ing}."]],
      },
      {
        tr: '-diğim için', en: 'Because I ___',
        ex: [['Geç kaldığım için özür dilerim.', 'Sorry for being late.'], ['Hasta olduğum için gelmedim.', "I didn't come because I was sick."]],
        t: [['{w:DIğIm} için mutluyum.', "I'm happy because I {past}."]],
      },
    ],
  },
  {
    id: 'before', en: 'Before ___ing', tr: '-meden önce', slot: 'verb',
    variants: [
      {
        tr: '-meden / -madan önce', en: 'Before ___ing',
        ex: [['Yemeden önce ellerini yıka.', 'Wash your hands before eating.'], ['Gitmeden önce beni ara.', 'Call me before you go.']],
        t: [['{w:mAdAn} önce haber ver.', 'Let me know before {ing}.'], ['{w:mAdAn} önce biraz bekle.', 'Wait a bit before {ing}.']],
      },
      {
        tr: '-meden / -madan', en: 'Without ___ing',
        ex: [['Söylemeden gitti.', 'He left without saying anything.'], ['Düşünmeden konuşma.', "Don't speak without thinking."]],
        t: [['{w:mAdAn} gitme.', "Don't leave without {ing}."]],
      },
    ],
  },
  {
    id: 'after', en: 'After ___ing', tr: '-dikten sonra', slot: 'verb',
    variants: [
      {
        tr: '-dikten / -dıktan sonra', en: 'After ___ing',
        ex: [['Yedikten sonra yürüyüşe çıkalım.', "After eating, let's go for a walk."], ['İşten çıktıktan sonra seni ararım.', "I'll call you after I leave work."]],
        t: [['{w:DIktAn} sonra beni ara.', 'Call me after {ing}.'], ['{w:DIktAn} sonra dinlenirim.', 'I rest after {ing}.']],
      },
      {
        tr: '-ip', en: '___ and then ...',
        note: 'Joins two actions: Eve gidip uyuyacağım = I\'ll go home and sleep.',
        ex: [['Eve gidip uyuyacağım.', "I'll go home and sleep."], ['Oturup konuşalım.', "Let's sit and talk."]],
        t: [['{w:(y)Ip} döneceğim.', "I'll {base} and come back."]],
      },
    ],
  },
  {
    id: 'should', en: 'You should ___', tr: '-melisin', slot: 'verb',
    variants: [
      {
        tr: '-melisin / -malısın', en: 'You should ___',
        ex: [['Doktora gitmelisin.', 'You should go to the doctor.'], ['Biraz dinlenmelisin.', 'You should rest a bit.']],
        t: [['{w:mAlIsIn}.', 'You should {base}.']],
      },
      {
        tr: '-sen iyi olur', en: "You'd better ___",
        ex: [['Erken gelsen iyi olur.', "You'd better come early."], ['Şemsiye alsan iyi olur.', "You'd better take an umbrella."]],
        t: [['{w:sAn} iyi olur.', "You'd better {base}."]],
      },
    ],
  },
  {
    id: 'think', en: "I think it's ___", tr: 'Bence ___', slot: 'adj:desc|any',
    variants: [
      {
        tr: 'Bence ___', en: "I think it's ___",
        ex: [['Bence çok güzel.', "I think it's very nice."], ['Bence haklısın.', "I think you're right."]],
        t: [['Bence {w}.', "I think it's {en}."], ['Bence biraz {w}.', "I think it's a bit {en}."]],
      },
      {
        tr: '___ görünüyor', en: 'It looks ___',
        ex: [['Çok lezzetli görünüyor.', 'It looks very tasty.'], ['Yorgun görünüyorsun.', 'You look tired.']],
        t: [['{w} görünüyor.', 'It looks {en}.']],
      },
      {
        tr: '___ gibi', en: 'It seems ___ / like ___',
        ex: [['Yağmur yağacak gibi.', 'It looks like rain.'], ['Bu biraz pahalı gibi.', 'This seems a bit expensive.']],
        t: [['{w} gibi.', 'It seems {en}.']],
      },
    ],
  },
  {
    id: 'more', en: 'More ___ / the most ___', tr: 'Daha ___ / En ___',
    variants: [
      {
        tr: 'Daha ___', en: 'More ___ / ___er',
        note: 'Put daha before any adjective: daha ucuz = cheaper.',
        ex: [['Daha ucuz var mı?', 'Is there a cheaper one?'], ['Daha yavaş, lütfen.', 'Slower, please.']],
        t: [],
      },
      {
        tr: 'En ___', en: 'The most ___ / the ___est',
        ex: [['En iyisi hangisi?', 'Which one is the best?'], ['En yakın otel nerede?', 'Where is the nearest hotel?']],
        t: [],
      },
      {
        tr: '___-den daha ___', en: '___er than ___',
        ex: [['Bundan daha büyük var mı?', 'Is there a bigger one than this?'], ['Çay kahveden daha ucuz.', 'Tea is cheaper than coffee.']],
        t: [],
      },
    ],
  },
  {
    id: 'nextlast', en: 'Last / next / this ___', tr: 'Geçen / gelecek ___', slot: 'noun:period|day',
    variants: [
      {
        tr: 'Geçen ___', en: 'Last ___',
        ex: [["Geçen hafta İzmir'deydim.", 'I was in Izmir last week.'], ['Geçen yıl buraya taşındım.', 'I moved here last year.']],
        t: [['Geçen {w} çok yoğundum.', 'I was very busy last {en}.']],
      },
      {
        tr: 'Gelecek ___', en: 'Next ___',
        ex: [['Gelecek hafta tatildeyim.', "I'm on holiday next week."], ['Gelecek ay geliyorum.', "I'm coming next month."]],
        t: [['Gelecek {w} görüşürüz.', 'See you next {en}.']],
      },
      {
        tr: 'Bu ___', en: 'This ___',
        ex: [['Bu hafta çok yoğunum.', "I'm very busy this week."], ['Bu akşam ne yapıyorsun?', 'What are you doing this evening?']],
        t: [['Bu {w} boşum.', "I'm free this {en}."]],
      },
    ],
  },
  {
    id: 'inorder', en: 'To ___ (in order to)', tr: '-mek için', slot: 'verb',
    variants: [
      {
        tr: '-mek / -mak için', en: 'To ___ / in order to ___',
        ex: [['Türkçe öğrenmek için buradayım.', "I'm here to learn Turkish."], ['Ekmek almak için markete gittim.', 'I went to the supermarket to buy bread.']],
        t: [['{w:mAk} için buradayım.', "I'm here to {base}."], ['{w:mAk} için zamanım yok.', "I don't have time to {base}."]],
      },
    ],
  },
  {
    id: 'howmany', en: 'How many ___?', tr: 'Kaç ___?', slot: 'noun:thing|person|vehicle|unit|period|animal',
    variants: [
      {
        tr: 'Kaç ___?', en: 'How many ___?',
        note: 'Turkish keeps the noun singular after kaç and numbers: kaç gün, iki bilet.',
        ex: [['Kaç kişisiniz?', 'How many people are you?'], ['Kaç yaşındasın?', 'How old are you?']],
        t: [['Kaç {w} var?', 'How many {pl} are there?'], ['Kaç {w} istiyorsun?', 'How many {pl} do you want?']],
      },
    ],
  },
  {
    id: 'knowhow', en: 'I know how to ___', tr: '-meyi biliyorum', slot: 'verb',
    variants: [
      {
        tr: '-meyi biliyorum', en: 'I know how to ___',
        ex: [['Yüzmeyi biliyorum.', 'I know how to swim.'], ['Araba kullanmayı biliyor musun?', 'Do you know how to drive?']],
        t: [['{w:mAyI} biliyorum.', 'I know how to {base}.'], ['{w:mAyI} biliyor musun?', 'Do you know how to {base}?']],
      },
      {
        tr: '-meyi bilmiyorum', en: "I don't know how to ___",
        ex: [['Yemek yapmayı bilmiyorum.', "I don't know how to cook."], ['Dans etmeyi bilmiyorum.', "I don't know how to dance."]],
        t: [['{w:mAyI} bilmiyorum.', "I don't know how to {base}."]],
      },
    ],
  },
  {
    id: 'likedoing', en: 'I love ___ing', tr: '-meyi seviyorum', slot: 'verb',
    variants: [
      {
        tr: '-meyi seviyorum', en: 'I love ___ing',
        ex: [['Kitap okumayı seviyorum.', 'I love reading books.'], ['Yürümeyi seviyorum.', 'I love walking.']],
        t: [['{w:mAyI} seviyorum.', 'I love {ing}.'], ['{w:mAyI} sever misin?', 'Do you like {ing}?']],
      },
      {
        tr: '-meyi sevmiyorum', en: "I don't like ___ing",
        ex: [['Beklemeyi sevmiyorum.', "I don't like waiting."], ['Erken kalkmayı sevmiyorum.', "I don't like getting up early."]],
        t: [['{w:mAyI} sevmiyorum.', "I don't like {ing}."]],
      },
    ],
  },
  {
    id: 'try', en: "I'm trying to ___", tr: '-meye çalışıyorum', slot: 'verb',
    variants: [
      {
        tr: '-meye çalışıyorum', en: "I'm trying to ___",
        ex: [['Türkçe öğrenmeye çalışıyorum.', "I'm trying to learn Turkish."], ['Uyumaya çalışıyorum.', "I'm trying to sleep."]],
        t: [['{w:mAyA} çalışıyorum.', "I'm trying to {base}."]],
      },
    ],
  },
  {
    id: 'start', en: 'I started ___ing', tr: '-meye başladım', slot: 'verb',
    variants: [
      {
        tr: '-meye başladım', en: 'I started ___ing',
        ex: [['Spor yapmaya başladım.', 'I started working out.'], ['Yağmur yağmaya başladı.', 'It started to rain.']],
        t: [['{w:mAyA} başladım.', 'I started {ing}.'], ['Yarın {w:mAyA} başlayacağım.', "I'll start {ing} tomorrow."]],
      },
      {
        tr: '-meyi bıraktım', en: 'I stopped ___ing',
        ex: [['Sigarayı bıraktım.', 'I quit smoking.'], ['Kahve içmeyi bıraktım.', 'I stopped drinking coffee.']],
        t: [['{w:mAyI} bıraktım.', 'I stopped {ing}.']],
      },
    ],
  },
  {
    id: 'while', en: 'While ___ing', tr: '-irken', slot: 'verb',
    variants: [
      {
        tr: '-irken / -arken', en: 'While ___ing',
        ex: [['Yemek yerken konuşma.', "Don't talk while eating."], ['Gelirken ekmek al.', 'Pick up bread on your way.']],
        t: [['{w:Rken} müzik dinlerim.', 'I listen to music while {ing}.']],
      },
    ],
  },
  {
    id: 'until', en: 'Until ___', tr: '-ene kadar', slot: 'verb',
    variants: [
      {
        tr: '-ene / -ana kadar', en: 'Until ___',
        ex: [['Ben gelene kadar bekle.', 'Wait until I come.'], ['Bitirene kadar çalışacağım.', "I'll work until I finish."]],
        t: [['{w:(y)AnA} kadar bekle.', 'Wait until you {base}.']],
      },
      {
        tr: '-inceye kadar', en: 'Until ___ (more formal)',
        ex: [['Sen gelinceye kadar bekleyeceğim.', "I'll wait until you come."]],
        t: [['{w:(y)IncAyA} kadar bekleyeceğim.', "I'll wait until you {base}."]],
      },
    ],
  },
  {
    id: 'assoon', en: 'As soon as ___', tr: '-ir -mez', slot: 'verb',
    variants: [
      {
        tr: '-ir -mez', en: 'As soon as ___',
        note: 'Say the verb twice: gelir gelmez = as soon as (I) come.',
        ex: [['Eve gelir gelmez ararım.', "I'll call as soon as I get home."], ['Uyanır uyanmaz kahve içerim.', 'I drink coffee as soon as I wake up.']],
        t: [['{w:R} {w:mAz} ararım.', "I'll call as soon as I {base}."]],
      },
    ],
  },
  {
    id: 'forgot', en: 'I forgot to ___', tr: '-meyi unuttum', slot: 'verb',
    variants: [
      {
        tr: '-meyi unuttum', en: 'I forgot to ___',
        ex: [['Seni aramayı unuttum.', 'I forgot to call you.'], ['Kapıyı kilitlemeyi unuttum.', 'I forgot to lock the door.']],
        t: [['{w:mAyI} unuttum.', 'I forgot to {base}.'], ['{w:mAyI} unutma!', "Don't forget to {base}!"]],
      },
    ],
  },
  {
    id: 'timeto', en: "It's time to ___", tr: '-me zamanı', slot: 'verb',
    variants: [
      {
        tr: '-me / -ma zamanı', en: "It's time to ___",
        ex: [['Gitme zamanı.', "It's time to go."], ['Uyuma zamanı.', "It's time to sleep."]],
        t: [['{w:mA} zamanı.', "It's time to {base}."]],
      },
    ],
  },
  {
    id: 'instead', en: 'Instead of ___ing', tr: '-mek yerine', slot: 'verb',
    variants: [
      {
        tr: '-mek yerine', en: 'Instead of ___ing',
        ex: [['Taksiye binmek yerine yürüyelim.', "Let's walk instead of taking a taxi."], ['Beklemek yerine gidelim.', "Let's go instead of waiting."]],
        t: [['{w:mAk} yerine dinlenelim.', "Let's rest instead of {ing}."]],
      },
    ],
  },
  {
    id: 'ever', en: 'Have you ever ___?', tr: 'Hiç ___-din mi?', slot: 'verb',
    variants: [
      {
        tr: 'Hiç -din mi?', en: 'Have you ever ___?',
        ex: [["Hiç Türkiye'ye gittin mi?", 'Have you ever been to Turkey?'], ['Hiç baklava yedin mi?', 'Have you ever eaten baklava?']],
        t: [['Hiç {w:DIn_mI}?', 'Did you ever {base}?']],
      },
    ],
  },
];
