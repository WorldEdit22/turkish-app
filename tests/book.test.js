import { test } from 'node:test';
import assert from 'node:assert/strict';
import { BOOK } from '../data/book.js';

const IDS = [
  'letters', 'harmony', 'consonants', 'order', 'plural', 'tobe', 'cases', 'possessive', 'pronouns', 'questions',
  'iyor', 'aorist', 'past', 'future', 'negation', 'modals', 'linking', 'postpositions', 'numbers',
];
const KINDS = ['p', 'list', 'table', 'ex', 'tip', 'alphabet'];
const grammar = BOOK.filter((s) => !s.blocks.some((b) => b.alphabet));
const examplesOf = (s) => s.blocks.filter((b) => b.ex).flatMap((b) => b.ex);

// Every string anywhere inside a value.
const strings = (v) =>
  typeof v === 'string' ? [v] : Array.isArray(v) ? v.flatMap(strings) : v && typeof v === 'object' ? Object.values(v).flatMap(strings) : [];
const wordCount = (s) => strings(s.blocks).join(' ').split(/\s+/).filter(Boolean).length;

test("the book's sections in order, letters first", () => {
  assert.deepEqual(BOOK.map((s) => s.id), IDS);
  assert.deepEqual(BOOK[0].blocks, [{ alphabet: true }]);
});

test('every section has an icon, title, sub and blocks of the known kinds', () => {
  for (const s of BOOK) {
    for (const k of ['id', 'icon', 'title', 'sub']) assert.ok(typeof s[k] === 'string' && s[k].trim(), `${s.id}.${k}`);
    assert.ok(Array.isArray(s.blocks) && s.blocks.length, s.id);
    for (const b of s.blocks) {
      const keys = Object.keys(b);
      assert.equal(keys.length, 1, `${s.id}: one kind per block (${keys})`);
      assert.ok(KINDS.includes(keys[0]), `${s.id}: unknown block kind ${keys[0]}`);
      if (b.p !== undefined) assert.ok(typeof b.p === 'string' && b.p.trim(), `${s.id}: p`);
      if (b.tip !== undefined) assert.ok(typeof b.tip === 'string' && b.tip.trim(), `${s.id}: tip`);
      if (b.list) assert.ok(b.list.length && b.list.every((i) => typeof i === 'string' && i.trim()), `${s.id}: list`);
      if (b.table) {
        const { head, rows } = b.table;
        assert.ok(head === null || Array.isArray(head), `${s.id}: table head`);
        assert.ok(Array.isArray(rows) && rows.length, `${s.id}: table rows`);
        const width = head ? head.length : rows[0].length;
        for (const r of rows) assert.ok(r.length === width && r.every((c) => typeof c === 'string'), `${s.id}: table row ${r}`);
      }
      if (b.ex) assert.ok(Array.isArray(b.ex), `${s.id}: ex`);
      if (b.alphabet !== undefined) assert.ok(b.alphabet === true && s.id === 'letters', `${s.id}: alphabet`);
    }
  }
  assert.equal(new Set(BOOK.map((s) => s.id)).size, BOOK.length);
});

test('every grammar section has 2–5 examples, each a target and its meaning', () => {
  assert.equal(grammar.length, IDS.length - 1);
  for (const s of grammar) {
    const examples = examplesOf(s);
    assert.ok(examples.length >= 2 && examples.length <= 5, `${s.id}: ${examples.length} examples`);
    for (const pair of examples) {
      assert.ok(Array.isArray(pair) && pair.length === 2, `${s.id}: ${pair}`);
      for (const text of pair) assert.ok(typeof text === 'string' && text.trim(), `${s.id}: ${pair}`);
    }
  }
});

test('every grammar section has a tip, in about 120–250 words', () => {
  for (const s of grammar) {
    assert.ok(s.blocks.some((b) => b.tip), `${s.id} has a tip`);
    const words = wordCount(s);
    assert.ok(words >= 120 && words <= 250, `${s.id}: ${words} words`);
  }
});

test('every * mark is closed', () => {
  for (const text of strings(BOOK)) {
    assert.equal((text.match(/\*/g) || []).length % 2, 0, text);
    assert.ok(!text.includes('**'), `an empty mark: ${text}`);
  }
});

test('examples use only Turkish letters and punctuation on the target side', () => {
  for (const s of grammar) {
    for (const [target] of examplesOf(s)) {
      assert.match(target, /^[A-Za-zÇĞİÖŞÜçğıöşüâîû0-9 ,.!?'’:;\-–*()]+$/, `${s.id}: ${target}`);
    }
  }
});
