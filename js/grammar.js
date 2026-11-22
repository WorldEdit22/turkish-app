// Turkish suffix engine.
//
// attach(word, suffix) glues a suffix written with archiphonemes onto a word:
//   A    → a / e            (two-way vowel harmony)
//   I    → ı / i / u / ü    (four-way vowel harmony)
//   D    → d / t            (t after a voiceless consonant)
//   C    → c / ç
//   R    → aorist marker: -r after a vowel, -Ir for long stems and the 13
//          one-syllable exceptions, -Ar for other one-syllable stems
//   (y) (n) (s) → buffer consonants, only after a vowel
//   (I)  → buffer vowel, only after a consonant
//   _    → space (a separate word such as the question particle mI)
//   anything else is copied literally.
//
// Word fields used: tr, type ('verb' strips -mak/-mek), and optionally
//   soft  – stem used before a vowel (kitap → kitab, şehir → şehr)
//   h     – harmony vowel override for loanwords (saat → h: 'e')
//   cmp   – compound noun ending in a possessive (otobüs durağı → durağına)
//   noSoft – turn off automatic k → ğ softening

const VOWELS = new Set('aeıioöuüâîû');
const BACK = new Set('aıouâû');
const ROUND = new Set('oöuüû');
const VOICELESS = new Set('çfhkpsşt');

// One-syllable verbs whose aorist is -Ir instead of -Ar.
const AORIST_IR = new Set(['al', 'bil', 'bul', 'dur', 'gel', 'gör', 'kal', 'ol', 'öl', 'san', 'var', 'ver', 'vur']);
// Verb stems whose final t softens to d before a vowel (applies to compounds like "yardım et").
const VERB_SOFT = { et: 'ed', git: 'gid', tat: 'tad' };
// ye- and de- become yi- and di- before -yor and before a y buffer.
const VERB_YI = { ye: 'yi', de: 'di' };
// Words that take y before possessive endings (su → suyum, suyu).
const POSS_Y = { su: 'suy' };

const isVowel = (c) => VOWELS.has(c);
const lastChar = (s) => s[s.length - 1] || '';
const endsInVowel = (s) => isVowel(lastChar(s));
const lastWordOf = (s) => s.slice(s.lastIndexOf(' ') + 1);
const vowelCount = (s) => [...s].filter(isVowel).length;

function lastVowel(s) {
  for (let i = s.length - 1; i >= 0; i--) if (isVowel(s[i])) return s[i];
  return 'e';
}

const harmA = (v) => (BACK.has(v) ? 'a' : 'e');
const harmI = (v) => (BACK.has(v) ? (ROUND.has(v) ? 'u' : 'ı') : ROUND.has(v) ? 'ü' : 'i');

export function stemOf(word) {
  return word.type === 'verb' ? word.tr.replace(/m[ae]k$/, '') : word.tr;
}

function replaceLastWord(s, w) {
  const i = s.lastIndexOf(' ');
  return i < 0 ? w : s.slice(0, i + 1) + w;
}

// The form of the stem used before a vowel-initial suffix.
function softStem(word, base) {
  if (word.soft) return word.soft;
  const lw = lastWordOf(base);
  if (word.type === 'verb') {
    return VERB_SOFT[lw] ? replaceLastWord(base, VERB_SOFT[lw]) : base;
  }
  if (!word.noSoft && vowelCount(lw) >= 2 && /[aeıioöuü]k$/.test(lw)) {
    return base.slice(0, -1) + 'ğ';
  }
  return base;
}

function tokenize(suffix) {
  return suffix.match(/\([ynsI]\)|./gu) || [];
}

export function attach(word, suffix) {
  const base = stemOf(word);
  let out = base;
  let tokens = tokenize(suffix);
  let atStem = true; // nothing emitted yet, so stem rules still apply
  let harmonyOverride = word.h || null;

  // Compound nouns ending in a possessive take n before case endings.
  // A third-person possessive is already there, so (s)I adds nothing,
  // and my / your replace it: baş ağrısı → baş ağrım, kredi kartı → kredi kartın.
  if (word.cmp) {
    if (suffix.startsWith('(s)I')) tokens = tokens.slice(2);
    else if (suffix.startsWith('(y)A') || suffix.startsWith('(y)I')) tokens = ['n', ...tokens.slice(1)];
    else if (suffix.startsWith('DA')) tokens = ['n', ...tokens];
    else if (suffix.startsWith('(I)')) out = /[aeıioöuü]s[ıiuü]$/.test(base) ? base.slice(0, -2) : base.slice(0, -1);
  }

  // Present continuous: a final stem vowel drops before -Iyor.
  if (word.type === 'verb' && suffix.startsWith('Iyor')) {
    if (VERB_YI[base]) {
      out = VERB_YI[base];
      tokens = tokens.slice(1);
      atStem = false;
    } else if (endsInVowel(out)) {
      out = out.slice(0, -1);
    }
  }

  // su → suy before possessive buffers.
  if (POSS_Y[base] && ['(I)', '(s)', '(n)'].includes(tokens[0])) out = POSS_Y[base];

  const vowel = () => harmonyOverride || lastVowel(out);

  function emit(piece) {
    if (!piece) return;
    if (atStem && isVowel(piece[0]) && !endsInVowel(out)) out = softStem(word, out);
    atStem = false;
    if ([...piece].some(isVowel)) harmonyOverride = null;
    out += piece;
  }

  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    switch (t) {
      case '(y)':
        if (endsInVowel(out)) {
          // ye- → yi- always; de- → di- only before an A-type vowel (diyelim, but deyin).
          const yi = atStem && word.type === 'verb' && VERB_YI[base];
          if (yi && (base === 'ye' || tokens[i + 1] === 'A')) out = yi;
          emit('y');
        }
        break;
      case '(n)':
        if (endsInVowel(out)) emit('n');
        break;
      case '(s)':
        if (endsInVowel(out)) emit('s');
        break;
      case '(I)':
        if (!endsInVowel(out)) emit(harmI(vowel()));
        break;
      case 'A':
        emit(harmA(vowel()));
        break;
      case 'I':
        emit(harmI(vowel()));
        break;
      case 'D':
        emit(VOICELESS.has(lastChar(out)) ? 't' : 'd');
        break;
      case 'C':
        emit(VOICELESS.has(lastChar(out)) ? 'ç' : 'c');
        break;
      case 'R': {
        if (endsInVowel(out)) {
          emit('r');
        } else {
          const lw = lastWordOf(out);
          const useI = vowelCount(lw) >= 2 || AORIST_IR.has(lw);
          emit((useI ? harmI(vowel()) : harmA(vowel())) + 'r');
        }
        break;
      }
      case '_':
        out += ' ';
        atStem = false;
        break;
      default:
        emit(t);
    }
  }
  return out;
}

export function capTr(s) {
  if (!s) return s;
  const first = s[0] === 'i' ? 'İ' : s[0] === 'ı' ? 'I' : s[0].toLocaleUpperCase('tr');
  return first + s.slice(1);
}
