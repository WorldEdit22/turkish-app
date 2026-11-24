import { test } from 'node:test';
import assert from 'node:assert/strict';
import { BOOK } from '../data/book.js';

test('the book starts with the alphabet, then the grammar sections', () => {
  assert.deepEqual(BOOK.map((s) => s.id), ['letters', 'harmony']);
  assert.deepEqual(BOOK[0].blocks, [{ alphabet: true }]);
});

test('every section has an id, icon, title, sub and blocks; ids are unique', () => {
  for (const s of BOOK) {
    for (const k of ['id', 'icon', 'title', 'sub']) assert.ok(typeof s[k] === 'string' && s[k], `${s.id}.${k}`);
    assert.ok(Array.isArray(s.blocks) && s.blocks.length, s.id);
  }
  assert.equal(new Set(BOOK.map((s) => s.id)).size, BOOK.length);
});

test('a grammar section has 2-5 examples and a tip, in 100-300 words', () => {
  for (const s of BOOK.filter((x) => !x.blocks[0].alphabet)) {
    const examples = s.blocks.filter((b) => b.ex).flatMap((b) => b.ex);
    assert.ok(examples.length >= 2 && examples.length <= 5, `${s.id}: ${examples.length} examples`);
    assert.ok(s.blocks.some((b) => b.tip), `${s.id} has a tip`);
    const words = JSON.stringify(s.blocks).split(/\s+/).length;
    assert.ok(words >= 100 && words <= 300, `${s.id}: ${words} words`);
  }
});
