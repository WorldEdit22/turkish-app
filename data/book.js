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
];
