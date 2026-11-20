import { test } from 'node:test';
import assert from 'node:assert/strict';
import { patternExamples, wordExamples } from '../js/examples.js';

const drink = (id, tr, en, o = {}) => ({ id, tr, en, type: 'noun', kind: 'drink', ...o });
const cay = drink('cay', 'çay', 'tea');
const su = drink('su', 'su', 'water', { m: 1 });
const kahve = drink('kahve', 'kahve', 'coffee');
const ayran = drink('ayran', 'ayran', 'ayran');
const sut = drink('sut', 'süt', 'milk');
const gelmek = { id: 'gelmek', tr: 'gelmek', en: 'come', type: 'verb' };
const WORDS = [cay, su, kahve, ayran, sut, gelmek]; // most common first

const want = {
  key: 'p:want',
  en: 'I want ___',
  slot: 'noun:drink',
  variants: [
    {
      tr: '___ istiyorum',
      en: 'I want ___',
      ex: [['Bir bilet istiyorum.', 'I want a ticket.'], ['Su istiyorum.', 'I want water.']],
      t: [['{w} istiyorum.', 'I want {en}.']],
    },
    { tr: 'Bir ___, lütfen', en: 'A ___, please', ex: [['Bir çay, lütfen.', 'A tea, please.']], t: [] },
  ],
};

const order = {
  key: 'p:order',
  en: 'Can I have ___?',
  slot: 'noun:drink',
  variants: [
    { tr: '___ alabilir miyim?', en: 'Can I have ___?', ex: [['Su alabilir miyim?', 'Can I have water?']], t: [['{w} alabilir miyim?', 'Can I have {en}?']] },
    { tr: '___ var mı?', en: 'Is there ___?', ex: [['Su var mı?', 'Is there water?']], t: [['{w} var mı?', 'Is there {en}?']] },
  ],
};

const where = {
  key: 'p:where',
  en: 'Where is ___?',
  slot: 'noun:place',
  variants: [{ tr: '___ nerede?', en: 'Where is ___?', ex: [['Okul nerede?', 'Where is the school?']], t: [['{w} nerede?', 'Where is the {en}?']] }],
};

// A one-variant pattern that fits drinks, labelled "___ N · Pattern N".
const numbered = (i) => ({
  key: `p:${i}`,
  en: `Pattern ${i}`,
  slot: 'noun:drink',
  variants: [{ tr: `___ ${i}`, en: `___ ${i}`, ex: [[`Örnek ${i}.`, `Example ${i}.`]], t: [[`{w} ${i}.`, `{en} ${i}.`]] }],
});

const sel = (...items) => (x) => items.includes(x);
const none = () => false;
const generated = (rows) => rows.filter((r) => r.trParts);
const hlEn = (row) => row.enParts.find((p) => p.hl).text;

test('pattern examples start with one sentence per selected word that fits, most common first', () => {
  const rows = patternExamples(want, 0, { words: WORDS, isSelected: sel(su, cay, gelmek), isLearned: none });
  assert.deepEqual(rows.slice(0, 2).map((r) => r.tr), ['Çay istiyorum.', 'Su istiyorum.']);
  assert.ok(rows[0].trParts.some((p) => p.hl));
  assert.ok(rows[1].trParts.some((p) => p.hl));
  assert.ok(!rows.some((r) => /gel/i.test(r.tr)), 'a verb does not fit "I want ___"');
});

test('hand-written examples follow the selected ones without highlight', () => {
  const rows = patternExamples(want, 0, { words: WORDS, isSelected: sel(cay), isLearned: none });
  assert.equal(rows[0].tr, 'Çay istiyorum.');
  assert.deepEqual(rows[1], { tr: 'Bir bilet istiyorum.', en: 'I want a ticket.' });
});

test('a hand-written example equal to a generated one appears once, highlighted', () => {
  const rows = patternExamples(want, 0, { words: WORDS, isSelected: sel(su), isLearned: none });
  const same = rows.filter((r) => r.tr === 'Su istiyorum.');
  assert.equal(same.length, 1);
  assert.ok(same[0].trParts, 'the highlighted, generated sentence is kept');
});

test('then up to 3 with learned words, never repeating a selected word', () => {
  for (let run = 0; run < 30; run++) {
    const rows = patternExamples(want, 0, { words: WORDS, isSelected: sel(cay), isLearned: sel(cay, su, kahve, ayran, sut) });
    assert.equal(generated(rows).length, 4, '1 selected + 3 learned');
    assert.equal(rows.filter((r) => r.tr === 'Çay istiyorum.').length, 1);
    assert.equal(new Set(rows.map((r) => r.tr)).size, rows.length, 'no sentence twice');
  }
});

test('with no fitting word learned, the extras come from the 15 most common fitting words', () => {
  const many = Array.from({ length: 20 }, (_, i) => drink(`d${i}`, `içecek${i}`, `drink${i}`));
  const first15 = new Set(['drink0', 'drink1', 'drink2', 'drink3', 'drink4', 'drink5', 'drink6', 'drink7', 'drink8', 'drink9', 'drink10', 'drink11', 'drink12', 'drink13', 'drink14']);
  for (let run = 0; run < 50; run++) {
    const rows = patternExamples(want, 0, { words: many, isSelected: none, isLearned: none });
    const extras = generated(rows);
    assert.equal(extras.length, 3);
    for (const r of extras) assert.ok(first15.has(hlEn(r)), `${hlEn(r)} is not among the 15 most common`);
  }
});

test('when every learned word is selected, the extras come from common words', () => {
  const rows = patternExamples(want, 0, { words: WORDS, isSelected: sel(cay), isLearned: sel(cay) });
  assert.equal(generated(rows).length, 4, '1 selected + 3 common');
  assert.equal(rows.filter((r) => r.tr === 'Çay istiyorum.').length, 1);
});

test('a variant without templates shows only its hand-written examples', () => {
  const rows = patternExamples(want, 1, { words: WORDS, isSelected: sel(cay), isLearned: sel(su) });
  assert.deepEqual(rows, [{ tr: 'Bir çay, lütfen.', en: 'A tea, please.' }]);
});

test('word examples start with each selected pattern, one sentence per variant the word fits', () => {
  const rows = wordExamples(cay, { patterns: [want, order, where], isSelected: sel(order, where), isLearned: none });
  assert.equal(rows[0].tr, 'Çay alabilir miyim?');
  assert.equal(rows[0].from, '___ alabilir miyim? · Can I have ___?');
  assert.equal(rows[1].tr, 'Çay var mı?');
  assert.equal(rows[1].from, '___ var mı? · Can I have ___?');
  assert.ok(!rows.some((r) => r.from?.includes('nerede')), 'tea does not fit "Where is ___?"');
});

test("then the word's own example, then up to 4 with learned patterns, skipping selected ones", () => {
  const tea = drink('cay', 'çay', 'tea', { ex: ['Çay içer misin?', 'Do you drink tea?'] });
  const six = Array.from({ length: 6 }, (_, i) => numbered(i));
  for (let run = 0; run < 30; run++) {
    const rows = wordExamples(tea, { patterns: six, isSelected: sel(six[2]), isLearned: () => true });
    assert.equal(rows[0].from, '___ 2 · Pattern 2');
    assert.deepEqual(rows[1], { tr: 'Çay içer misin?', en: 'Do you drink tea?' });
    const extras = rows.slice(2);
    assert.equal(extras.length, 4);
    assert.ok(!extras.some((r) => r.from.endsWith('Pattern 2')), 'a selected pattern is not repeated');
  }
});

test('when every learned pattern is selected, the extras come from the most useful patterns', () => {
  const six = Array.from({ length: 6 }, (_, i) => numbered(i));
  const rows = wordExamples(cay, { patterns: six, isSelected: sel(six[0]), isLearned: sel(six[0]) });
  assert.equal(rows[0].from, '___ 0 · Pattern 0');
  assert.equal(rows.length, 5, '1 selected + 4 common');
  assert.ok(!rows.slice(1).some((r) => r.from.endsWith('Pattern 0')));
});

test('with no learned pattern, the extras come from the 15 most useful patterns', () => {
  const twenty = Array.from({ length: 20 }, (_, i) => numbered(i));
  const first15 = new Set(Array.from({ length: 15 }, (_, i) => `___ ${i} · Pattern ${i}`));
  for (let run = 0; run < 50; run++) {
    const rows = wordExamples(cay, { patterns: twenty, isSelected: none, isLearned: none });
    assert.equal(rows.length, 4);
    for (const r of rows) assert.ok(first15.has(r.from), `${r.from} is not among the 15 most useful`);
  }
});
