import { test } from 'node:test';
import assert from 'node:assert/strict';
import { WORDS, CATEGORIES, TYPES } from '../data/words.js';
import { PATTERNS, GROUPS, ORDER } from '../data/patterns.js';
import { fill, fits, enPl, enA, enPast, enIng } from '../js/combine.js';
import { attach } from '../js/grammar.js';
import { RANKS } from '../data/ranks.js';

const catIds = new Set(CATEGORIES.map((c) => c.id));
const word = (id) => {
  const w = WORDS.find((x) => x.id === id);
  assert.ok(w, `missing word ${id}`);
  return w;
};
const pattern = (id) => PATTERNS.find((p) => p.id === id);

test('word ids are unique', () => {
  const seen = new Set();
  for (const w of WORDS) {
    assert.ok(!seen.has(w.id), `duplicate word id ${w.id}`);
    seen.add(w.id);
  }
});

test('pattern ids are unique', () => {
  const ids = PATTERNS.map((p) => p.id);
  assert.equal(new Set(ids).size, ids.length);
});

test('the usefulness order lists every pattern exactly once, and PATTERNS follows it', () => {
  assert.ok(Array.isArray(ORDER), 'ORDER is exported');
  assert.deepEqual([...ORDER].sort(), PATTERNS.map((p) => p.id).sort());
  assert.deepEqual(PATTERNS.map((p) => p.id), ORDER);
});

test('every pattern has a known group', () => {
  for (const p of PATTERNS) assert.ok(GROUPS && GROUPS[p.group], `${p.id} has unknown group ${p.group}`);
});

test('existing ids are unchanged, so saved progress keeps working', () => {
  const ids = new Set([...WORDS.map((w) => w.id), ...PATTERNS.map((p) => `p:${p.id}`)]);
  for (const id of ['p:want', 'p:before', 'p:until', 'p:because', 'p:must', 'p:lets', 'food:ekmek', 'work:iş', 'time:bugün', 'numbers:dört']) {
    assert.ok(ids.has(id), `missing ${id}`);
  }
});

test('every word has a known type and category', () => {
  for (const w of WORDS) {
    assert.ok(w.tr && w.en, `${w.id} needs tr and en`);
    assert.ok(TYPES[w.type], `${w.id} has unknown type ${w.type}`);
    assert.ok(catIds.has(w.cat), `${w.id} has unknown category ${w.cat}`);
  }
});

test('every pattern variant has examples, and a slot when it has templates', () => {
  for (const p of PATTERNS) {
    assert.ok(p.variants.length > 0, p.id);
    for (const v of p.variants) {
      assert.ok(v.ex.length > 0, `${p.id}: ${v.tr} needs examples`);
      if (v.t.length) assert.ok(v.slot || p.slot, `${p.id}: ${v.tr} has templates but no slot`);
    }
  }
});

test('every slot fits at least three words', () => {
  for (const p of PATTERNS) {
    for (const v of p.variants) {
      if (!v.t.length) continue;
      const slot = v.slot || p.slot;
      const n = WORDS.filter((w) => fits(slot, w)).length;
      assert.ok(n >= 3, `${p.id}: slot ${slot} fits only ${n} words`);
    }
  }
});

test('every template renders cleanly with every word that fits', () => {
  const problems = [];
  for (const p of PATTERNS) {
    for (const v of p.variants) {
      const slot = v.slot || p.slot;
      for (const w of WORDS.filter((x) => fits(slot, x))) {
        for (const [tr, en] of v.t) {
          const r = fill({ tr, en }, w);
          if (/[{}]/.test(r.tr) || /[{}]/.test(r.en)) problems.push(`${p.id} ${w.id}: ${r.tr} | ${r.en}`);
          for (const part of r.trParts.filter((x) => x.hl)) {
            // Leftover archiphonemes are upper-case letters after the first character.
            if (/[ADCRI]/.test(part.text.slice(1))) problems.push(`${p.id} ${w.id}: ${part.text}`);
          }
        }
      }
    }
  }
  assert.deepEqual(problems, []);
});

// ---------- the 2026-11-22 additions ----------

test('Animals and Hobbies & sports are topics, after nature and after clothes', () => {
  const ids = CATEGORIES.map((c) => c.id);
  assert.equal(ids[ids.indexOf('nature') + 1], 'animals');
  assert.equal(ids[ids.indexOf('clothes') + 1], 'hobbies');
});

test('the four old animal words moved to Animals and kept their ids', () => {
  for (const id of ['nature:hayvan', 'nature:kedi', 'nature:köpek', 'nature:kuş']) assert.equal(word(id).cat, 'animals', id);
});

// Same spelling, different words: each pair is shown as two blocks with their own meanings.
const ALLOWED_DUPES = new Set(['yemek', 'tatlı', 'pazar', 'yüz', 'ay']);

test('Turkish spellings are unique, except known pairs', () => {
  const by = new Map();
  for (const w of WORDS) by.set(w.tr, [...(by.get(w.tr) || []), w.id]);
  const dupes = [...by].filter(([tr, ids]) => ids.length > 1 && !ALLOWED_DUPES.has(tr));
  assert.deepEqual(dupes, []);
});

test('wild animals only go into patterns that make sense', () => {
  const lion = word('animals:aslan');
  assert.ok(fits(pattern('var').slot, lion), 'Is there a lion?');
  // No "Whose lion is this?" or "I have a giraffe".
  for (const id of ['this', 'have', 'my', 'howmany', 'asif']) assert.ok(!fits(pattern(id).slot, lion), `lion stays out of ${id}`);
  assert.ok(fits(pattern('have').slot, word('nature:kedi')), 'a cat is still something you can have');
  // No "He talks like a turtle".
  assert.ok(!fits(pattern('asif').slot, word('animals:kaplumbağa')), 'animals stay out of "talks like"');
});

test('words that would teach the wrong meaning stay out of those patterns', () => {
  // Resmi seviyorum = I love the picture, not painting (that is resim yapmak).
  assert.ok(!fits(pattern('like').slot, word('hobbies:resim')));
  // Lips and nails acıyor, they don't ağrıyor.
  for (const id of ['body:dudak', 'body:tırnak']) {
    assert.ok(!fits(pattern('hurts').slot, word(id)), `${id} stays out of "hurts"`);
    assert.ok(word(id).ex, `${id} has its own example`);
  }
});

test('animal grammar', () => {
  assert.equal(enPl(word('animals:koyun')), 'sheep');
  assert.equal(enPl(word('animals:fare')), 'mice');
  assert.equal(attach(word('animals:inek'), '(I)m'), 'ineğim');
  assert.equal(attach(word('animals:kurt'), '(y)I'), 'kurdu');
  assert.equal(attach(word('animals:sincap'), '(y)I'), 'sincabı');
  const [tr, en] = pattern('var').variants[0].t[0];
  assert.deepEqual([fill({ tr, en }, word('animals:aslan')).tr, fill({ tr, en }, word('animals:aslan')).en], ['Aslan var mı?', 'Is there a lion?']);
});

// Phrases are their own example, and the tens (yirmi, otuz…) are plain numbers, so only content words are checked.
test('every noun, verb and adjective left out of patterns has its own example or a note', () => {
  const inSomePattern = (w) => PATTERNS.some((p) => p.variants.some((v) => v.t.length && fits(v.slot || p.slot, w)));
  const content = WORDS.filter((w) => ['noun', 'verb', 'adj'].includes(w.type));
  const empty = content.filter((w) => !inSomePattern(w) && !w.ex && !w.note).map((w) => w.id);
  assert.deepEqual(empty, []);
});

test('noun grammar', () => {
  assert.equal(attach(word('nature:nehir'), '(y)A'), 'nehre');
  assert.equal(attach(word('nature:ada'), 'DA'), 'adada');
  assert.equal(attach(word('town:hayvanat bahçesi'), '(y)A'), 'hayvanat bahçesine');
  assert.equal(attach(word('food:sarımsak'), 'lI'), 'sarımsaklı');
  assert.equal(attach(word('food:çilek'), '(y)I'), 'çileği');
  assert.equal(attach(word('food:armut'), '(y)I'), 'armudu');
  assert.equal(attach(word('food:havuç'), '(y)I'), 'havucu');
  assert.equal(attach(word('people:damat'), '(I)m'), 'damadım');
  assert.equal(attach(word('people:erkek kardeş'), '(I)m'), 'erkek kardeşim');
});

test('hobbies go into "I like ___"', () => {
  const [tr, en] = pattern('like').variants[0].t[0];
  const r = fill({ tr, en }, word('hobbies:futbol'));
  assert.deepEqual([r.tr, r.en], ['Futbolu çok seviyorum.', 'I really love football.']);
  assert.equal(enPl(word('hobbies:dizi')), 'TV series');
  assert.equal(attach(word('hobbies:satranç'), '(y)I'), 'satrancı');
  assert.equal(attach(word('hobbies:resim'), '(y)I'), 'resmi');
});

test('body grammar', () => {
  assert.equal(attach(word('body:omuz'), '(I)m'), 'omzum');
  assert.equal(attach(word('body:göğüs'), '(I)m'), 'göğsüm');
  assert.equal(attach(word('body:baş ağrısı'), '(I)m'), 'baş ağrım');
  assert.ok(fits(pattern('hurts').slot, word('body:omuz')));
  assert.ok(fits(pattern('have').slot, word('body:baş ağrısı')));
});

test('new adjectives', () => {
  const [tr, en] = pattern('iam').variants[0].t[0];
  const r = fill({ tr, en }, word('feelings:emekli'));
  assert.deepEqual([r.tr, r.en], ['Emekliyim.', "I'm retired."]);
  assert.equal(attach(word('feelings:kıskanç'), '(y)Im'), 'kıskancım');
  assert.equal(attach(word('feelings:utangaç'), '(y)Im'), 'utangacım');
  assert.ok(fits(pattern('very').slot, word('describe:ıslak')));
  assert.ok(!fits(pattern('very').slot, word('feelings:emekli')), 'retired is said about yourself');
});

test('new verbs', () => {
  assert.equal(enPast(word('actions:uçmak')), 'flew');
  assert.equal(enPast(word('actions:düşmek')), 'fell');
  assert.equal(enPast(word('actions:yakalamak')), 'caught');
  assert.equal(enIng(word('actions:kaçmak')), 'running away');
  // saklamak hides something (hiding yourself is saklanmak).
  assert.equal(enIng(word('actions:saklamak')), 'hiding it');
  assert.equal(enPast(word('actions:saklamak')), 'hid it');
  assert.equal(attach(word('actions:toplamak'), 'Iyorum'), 'topluyorum');
  assert.equal(attach(word('actions:beslemek'), 'Iyorum'), 'besliyorum');
  assert.equal(attach(word('actions:ölmek'), 'R'), 'ölür');
  // Verbs join every verb pattern ("Let's ___", "Please ___"), so these only show their own example.
  // düşmek too: "Let's fall", and "Lütfen düşün" reads as "please think".
  for (const id of ['actions:ölmek', 'actions:doğmak', 'actions:ısırmak', 'actions:düşmek']) {
    assert.ok(word(id).nc && word(id).ex, `${id} stays out of the verb patterns`);
  }
});

// Spoken-Turkish ranks come from tools/rank-words.mjs. A rank of 0 means the subtitle list
// doesn't have the word; that is accepted only for these (Turkish dishes and everyday words subtitles rarely use).
const UNRANKED_OK = new Set([
  'food:lahmacun', 'food:baklava', 'food:mantı', 'food:menemen', 'food:pide', 'drinks:ayran', 'drinks:rakı',
  'town:bankamatik', 'town:benzinlik', 'travel:vapur', 'travel:otogar',
]);

test('every word is ranked', () => {
  const missing = WORDS.filter((w) => typeof RANKS[w.id] !== 'number').map((w) => w.id);
  assert.deepEqual(missing, [], 'run tools/rank-words.mjs');
  const zero = WORDS.filter((w) => RANKS[w.id] === 0 && !UNRANKED_OK.has(w.id)).map((w) => w.id);
  assert.deepEqual(zero, []);
});

test('noun English', () => {
  assert.equal(enA(word('clothes:eldiven')), 'gloves');
  const [tr, en] = pattern('at').variants[0].t[0];
  assert.match(fill({ tr, en }, word('nature:ada')).en, /on the island/);
  assert.equal(word('nature:ay').note, 'Also means "month".');
  assert.equal(word('time:ay').note, 'Also means "moon".');
});
