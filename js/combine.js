// Fills a pattern's sentence template with a word, in Turkish and English.
//
// Turkish template:  {w} is the word as written, {w:SUFFIX} attaches a suffix
//                    (see grammar.js for the suffix notation).
// English template:  {en} plain word, {a} with a/an, {the}, {to} {at} {from},
//                    and for verbs {base} {ing} {past}.
//
// Word fields used for English: en, m (mass noun: no "a"), a, the, to, at,
// from (overrides), ing, p (past) for irregular verbs.

import { attach, capTr } from './grammar.js';

const VOWEL_START = /^[aeiou]/i;

function isShortCvc(x) {
  const groups = x.match(/[aeiou]+/g) || [];
  return groups.length === 1 && /[^aeiou][aeiou][^aeiouwxy]$/.test(x);
}

function ingOf(x) {
  if (x.endsWith('ie')) return x.slice(0, -2) + 'ying';
  if (x.endsWith('e') && x.length > 2 && !/(ee|ye|oe)$/.test(x)) return x.slice(0, -1) + 'ing';
  if (isShortCvc(x)) return x + x.slice(-1) + 'ing';
  return x + 'ing';
}

function pastOf(x) {
  if (x.endsWith('e')) return x + 'd';
  if (/[^aeiou]y$/.test(x)) return x.slice(0, -1) + 'ied';
  if (isShortCvc(x)) return x + x.slice(-1) + 'ed';
  return x + 'ed';
}

// Phrasal verbs ("wake up") inflect the first word only.
function firstWord(en, f) {
  const [first, ...rest] = en.split(' ');
  return [f(first), ...rest].join(' ');
}

function plOf(x) {
  if (/(s|x|z|ch|sh|o)$/.test(x)) return x + 'es';
  if (/[^aeiou]y$/.test(x)) return x.slice(0, -1) + 'ies';
  return x + 's';
}

export const enPl = (w) => w.pl || plOf(w.en);
export const enIng = (w) => w.ing || firstWord(w.en, ingOf);
export const enPast = (w) => w.p || firstWord(w.en, pastOf);
export const enA = (w) => w.a || (w.m ? w.en : (VOWEL_START.test(w.en) ? 'an ' : 'a ') + w.en);
const enThe = (w) => w.the || 'the ' + w.en;

const EN_FORMS = {
  en: (w) => w.en,
  base: (w) => w.en,
  a: enA,
  the: enThe,
  to: (w) => w.to || 'to ' + enThe(w),
  at: (w) => w.at || 'at ' + enThe(w),
  from: (w) => w.from || 'from ' + enThe(w),
  ing: enIng,
  past: enPast,
  pl: enPl,
  gen: (w) => (w.m ? w.en : enPl(w)),
  when: (w) => w.when || w.en,
};

// Grammar helpers that agree with plural English words (pe: 1); not highlighted.
const EN_AGREE = {
  is: (w) => (w.pe ? 'are' : 'is'),
  this: (w) => (w.pe ? 'these' : 'this'),
  that: (w) => (w.pe ? 'those' : 'that'),
};

function render(str, re, replace, cap) {
  const parts = [];
  const push = (text, hl) => {
    const prev = parts[parts.length - 1];
    if (prev && !prev.hl && !hl) prev.text += text;
    else parts.push({ text, hl });
  };
  let last = 0;
  for (const m of str.matchAll(re)) {
    if (m.index > last) push(str.slice(last, m.index), false);
    push(...replace(m));
    last = m.index + m[0].length;
  }
  if (last < str.length) push(str.slice(last), false);
  if (parts.length) parts[0].text = cap(parts[0].text);
  return parts;
}

const capEn = (s) => (s ? s[0].toUpperCase() + s.slice(1) : s);
const join = (parts) => parts.map((p) => p.text).join('');

export function fill(tpl, word) {
  // {w} is the word as written; {w:} is the bare stem (gel); {w:SUFFIX} attaches.
  const trParts = render(tpl.tr, /\{w(?::([^}]*))?\}/g, (m) => [m[1] === undefined ? word.tr : attach(word, m[1]), true], capTr);
  const enParts = render(tpl.en, /\{(en|base|a|the|to|at|from|ing|past|pl|gen|when|is|this|that)\}/g, (m) =>
    EN_AGREE[m[1]] ? [EN_AGREE[m[1]](word), false] : [EN_FORMS[m[1]](word), true], capEn);
  return { tr: join(trParts), en: join(enParts), trParts, enParts };
}

// slot: "type" or "type:kind|kind"; type "*" matches any word type.
export function fits(slot, word) {
  if (!slot || word.nc) return false;
  const [type, kinds] = slot.split(':');
  if (type !== '*' && word.type !== type) return false;
  if (kinds && !kinds.split('|').includes(word.kind)) return false;
  return true;
}
