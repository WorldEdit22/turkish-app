import { test } from 'node:test';
import assert from 'node:assert/strict';
import { WORDS, CATEGORIES, TYPES } from '../data/words.js';
import { PATTERNS, GROUPS } from '../data/patterns.js';
import { fill, fits } from '../js/combine.js';

const catIds = new Set(CATEGORIES.map((c) => c.id));

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
