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
const all = (res) => [...res.selected, ...res.examples];

// ---------- pattern card ----------

test('pattern examples start with one sentence per selected word that fits, most common first', () => {
  const res = patternExamples(want, 0, { words: WORDS, isSelected: sel(su, cay, gelmek), isKnown: none });
  assert.deepEqual(res.selected.map((r) => r.tr), ['Çay istiyorum.', 'Su istiyorum.']);
  assert.ok(res.selected.every((r) => r.trParts.some((p) => p.hl)));
  assert.ok(!all(res).some((r) => /gel/i.test(r.tr)), 'a verb does not fit "I want ___"');
});

test('a selected word that does not fit a form is listed as not used', () => {
  const res = patternExamples(want, 0, { words: WORDS, isSelected: sel(su, gelmek), isKnown: none });
  assert.deepEqual(res.notUsed, [gelmek]);
  assert.deepEqual(res.selected.map((r) => r.tr), ['Su istiyorum.']);
});

test('with nothing selected there is no selection section', () => {
  const res = patternExamples(want, 0, { words: WORDS, isSelected: none, isKnown: none });
  assert.deepEqual(res.selected, []);
  assert.deepEqual(res.notUsed, []);
});

test('hand-written examples open the Examples section, without highlight', () => {
  const res = patternExamples(want, 0, { words: WORDS, isSelected: sel(cay), isKnown: none });
  assert.equal(res.selected[0].tr, 'Çay istiyorum.');
  assert.deepEqual(res.examples[0], { tr: 'Bir bilet istiyorum.', en: 'I want a ticket.' });
});

test('a hand-written example equal to a generated one appears once, highlighted', () => {
  const res = patternExamples(want, 0, { words: WORDS, isSelected: sel(su), isKnown: none });
  const same = all(res).filter((r) => r.tr === 'Su istiyorum.');
  assert.equal(same.length, 1);
  assert.ok(same[0].trParts, 'the highlighted, generated sentence is kept');
});

test('then up to 3 with learned words, never repeating a selected word', () => {
  for (let run = 0; run < 30; run++) {
    const res = patternExamples(want, 0, { words: WORDS, isSelected: sel(cay), isKnown: sel(cay, su, kahve, ayran, sut) });
    assert.equal(generated(res.examples).length, 3, '3 learned extras');
    assert.equal(all(res).filter((r) => r.tr === 'Çay istiyorum.').length, 1);
    assert.equal(new Set(all(res).map((r) => r.tr)).size, all(res).length, 'no sentence twice');
  }
});

test('with no fitting word learned, the extras come from the 15 most common fitting words', () => {
  const many = Array.from({ length: 20 }, (_, i) => drink(`d${i}`, `içecek${i}`, `drink${i}`));
  const first15 = new Set(['drink0', 'drink1', 'drink2', 'drink3', 'drink4', 'drink5', 'drink6', 'drink7', 'drink8', 'drink9', 'drink10', 'drink11', 'drink12', 'drink13', 'drink14']);
  for (let run = 0; run < 50; run++) {
    const extras = generated(patternExamples(want, 0, { words: many, isSelected: none, isKnown: none }).examples);
    assert.equal(extras.length, 3);
    for (const r of extras) assert.ok(first15.has(hlEn(r)), `${hlEn(r)} is not among the 15 most common`);
  }
});

test('when every learned word is selected, the extras come from common words', () => {
  const res = patternExamples(want, 0, { words: WORDS, isSelected: sel(cay), isKnown: sel(cay) });
  assert.equal(res.selected.length, 1);
  assert.equal(generated(res.examples).length, 3, '3 common extras');
  assert.equal(all(res).filter((r) => r.tr === 'Çay istiyorum.').length, 1);
});

test('a form without templates lists every selected word as not used', () => {
  const res = patternExamples(want, 1, { words: WORDS, isSelected: sel(cay, gelmek), isKnown: sel(su) });
  assert.deepEqual(res.selected, []);
  assert.deepEqual(res.notUsed, [cay, gelmek]);
  assert.deepEqual(res.examples, [{ tr: 'Bir çay, lütfen.', en: 'A tea, please.' }]);
});

// ---------- word card ----------

test('word examples start with each selected pattern, one sentence per variant the word fits', () => {
  const res = wordExamples(cay, { patterns: [want, order, where], isSelected: sel(order, where), isKnown: none });
  assert.deepEqual(res.selected.map((r) => [r.tr, r.from]), [
    ['Çay alabilir miyim?', '___ alabilir miyim? · Can I have ___?'],
    ['Çay var mı?', '___ var mı? · Can I have ___?'],
  ]);
  assert.ok(!all(res).some((r) => r.from?.includes('nerede')), 'tea does not fit "Where is ___?"');
});

test('a word card lists selected patterns the word fits in no form as not used', () => {
  const res = wordExamples(cay, { patterns: [want, order, where], isSelected: sel(order, where), isKnown: none });
  assert.deepEqual(res.notUsed, [where]);
  assert.equal(res.selected.length, 2);
});

test("then the word's own example, then up to 4 with learned patterns, skipping selected ones", () => {
  const tea = drink('cay', 'çay', 'tea', { ex: ['Çay içer misin?', 'Do you drink tea?'] });
  const six = Array.from({ length: 6 }, (_, i) => numbered(i));
  for (let run = 0; run < 30; run++) {
    const res = wordExamples(tea, { patterns: six, isSelected: sel(six[2]), isKnown: () => true });
    assert.deepEqual(res.selected.map((r) => r.from), ['___ 2 · Pattern 2']);
    assert.deepEqual(res.examples[0], { tr: 'Çay içer misin?', en: 'Do you drink tea?' });
    const extras = res.examples.slice(1);
    assert.equal(extras.length, 4);
    assert.ok(!extras.some((r) => r.from.endsWith('Pattern 2')), 'a selected pattern is not repeated');
  }
});

test('when every learned pattern is selected, the extras come from the most useful patterns', () => {
  const six = Array.from({ length: 6 }, (_, i) => numbered(i));
  const res = wordExamples(cay, { patterns: six, isSelected: sel(six[0]), isKnown: sel(six[0]) });
  assert.deepEqual(res.selected.map((r) => r.from), ['___ 0 · Pattern 0']);
  assert.equal(res.examples.length, 4, '4 common extras');
  assert.ok(!res.examples.some((r) => r.from.endsWith('Pattern 0')));
});

test('with no learned pattern, the extras come from the 15 most useful patterns', () => {
  const twenty = Array.from({ length: 20 }, (_, i) => numbered(i));
  const first15 = new Set(Array.from({ length: 15 }, (_, i) => `___ ${i} · Pattern ${i}`));
  for (let run = 0; run < 50; run++) {
    const res = wordExamples(cay, { patterns: twenty, isSelected: none, isKnown: none });
    assert.deepEqual(res.selected, []);
    assert.equal(res.examples.length, 4);
    for (const r of res.examples) assert.ok(first15.has(r.from), `${r.from} is not among the 15 most useful`);
  }
});
