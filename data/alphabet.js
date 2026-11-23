// The Turkish alphabet for the alphabet window: every letter with its Turkish name,
// how it sounds in English terms (Swedish where English has no such sound), and an
// example word. The voice reads the name when a letter is tapped.
// TRICKY are the letters that trip up English speakers.

export const LETTERS = [
  { ch: 'A', name: 'a', sound: 'Like the a in "father", but short.', ex: ['anne', 'mother'] },
  { ch: 'B', name: 'be', sound: 'As in English.', ex: ['baba', 'father'] },
  { ch: 'C', name: 'ce', sound: 'Always like the j in "jam", never k or s.', ex: ['cuma', 'Friday'] },
  { ch: 'Ç', name: 'çe', sound: 'Like the ch in "church".', ex: ['çay', 'tea'] },
  { ch: 'D', name: 'de', sound: 'As in English.', ex: ['deniz', 'sea'] },
  { ch: 'E', name: 'e', sound: 'Like the e in "bed".', ex: ['ekmek', 'bread'] },
  { ch: 'F', name: 'fe', sound: 'As in English.', ex: ['fil', 'elephant'] },
  { ch: 'G', name: 'ge', sound: 'Always hard, like the g in "go".', ex: ['göz', 'eye'] },
  { ch: 'Ğ', name: 'yumuşak ge', sound: 'Not said as a g: it makes the vowel before it longer. Never starts a word.', ex: ['dağ', 'mountain'] },
  { ch: 'H', name: 'he', sound: 'Like the h in "hat", and said at the end of a word too.', ex: ['hayır', 'no'] },
  { ch: 'I', name: 'ı', sound: 'No English match: like the e in "roses", with relaxed lips.', ex: ['ışık', 'light'] },
  { ch: 'İ', name: 'i', sound: 'Like the ee in "see", but short.', ex: ['iyi', 'good'] },
  { ch: 'J', name: 'je', sound: 'Like the s in "measure". Rare.', ex: ['plaj', 'beach'] },
  { ch: 'K', name: 'ke', sound: 'As in English.', ex: ['kedi', 'cat'] },
  { ch: 'L', name: 'le', sound: 'As in English.', ex: ['limon', 'lemon'] },
  { ch: 'M', name: 'me', sound: 'As in English.', ex: ['masa', 'table'] },
  { ch: 'N', name: 'ne', sound: 'As in English.', ex: ['nasıl', 'how'] },
  { ch: 'O', name: 'o', sound: 'Like the o in "more", short and round.', ex: ['okul', 'school'] },
  { ch: 'Ö', name: 'ö', sound: 'Like Swedish ö (öga), or the u in "fur" with rounded lips.', ex: ['ördek', 'duck'] },
  { ch: 'P', name: 'pe', sound: 'As in English.', ex: ['peynir', 'cheese'] },
  { ch: 'R', name: 're', sound: 'A light tap of the tongue; softer, almost breathed, at the end of a word.', ex: ['resim', 'picture'] },
  { ch: 'S', name: 'se', sound: 'Always like the s in "sun", never z.', ex: ['su', 'water'] },
  { ch: 'Ş', name: 'şe', sound: 'Like the sh in "ship".', ex: ['şeker', 'sugar'] },
  { ch: 'T', name: 'te', sound: 'As in English.', ex: ['tuz', 'salt'] },
  { ch: 'U', name: 'u', sound: 'Like the oo in "food", but short.', ex: ['uçak', 'plane'] },
  { ch: 'Ü', name: 'ü', sound: 'Close to Swedish y (by): say ee with rounded lips.', ex: ['üzüm', 'grapes'] },
  { ch: 'V', name: 've', sound: 'Softer than English v, between v and w.', ex: ['valiz', 'suitcase'] },
  { ch: 'Y', name: 'ye', sound: 'Always like the y in "yes".', ex: ['yol', 'road'] },
  { ch: 'Z', name: 'ze', sound: 'Like the z in "zoo".', ex: ['zaman', 'time'] },
];

export const TRICKY = [
  {
    ch: 'ğ',
    title: 'ğ, soft g',
    sound: 'Never starts a word and is not said as a g. It lengthens the vowel before it (dağ ≈ daa); between e or i it can sound like a light y (değil ≈ deyil).',
    ex: [['dağ', 'mountain'], ['yağmur', 'rain'], ['değil', 'not']],
  },
  {
    ch: 'ı',
    title: 'ı, i without a dot',
    sound: 'Like the e in "roses", with relaxed lips. Its capital is I, while i has the capital İ (İstanbul).',
    ex: [['kız', 'girl'], ['ışık', 'light'], ['kapı', 'door']],
  },
  {
    ch: 'c',
    title: 'c is j',
    sound: 'Always like the j in "jam", never k or s.',
    ex: [['cuma', 'Friday'], ['cevap', 'answer']],
  },
  {
    ch: 'ç',
    title: 'ç is ch',
    sound: 'Like the ch in "church".',
    ex: [['çay', 'tea'], ['çocuk', 'child']],
  },
  {
    ch: 'ş',
    title: 'ş is sh',
    sound: 'Like the sh in "ship".',
    ex: [['şeker', 'sugar'], ['beş', 'five']],
  },
];
