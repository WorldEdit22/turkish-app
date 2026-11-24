import { test } from 'node:test';
import assert from 'node:assert/strict';
import { LETTERS, TRICKY } from '../data/alphabet.js';
import { alphabetBodyHtml } from '../js/alphabetview.js';

test('all 29 letters in Turkish order', () => {
  assert.equal(LETTERS.map((l) => l.ch).join(''), 'ABCÇDEFGĞHIİJKLMNOÖPRSŞTUÜVYZ');
});

test('every letter has a name, a sound and an example with its meaning', () => {
  for (const l of LETTERS) {
    assert.ok(l.name && l.sound, l.ch);
    assert.ok(l.ex.length === 2 && l.ex.every((s) => typeof s === 'string' && s), l.ch);
  }
  const name = (ch) => LETTERS.find((l) => l.ch === ch).name;
  assert.deepEqual(['C', 'Ğ', 'I', 'İ', 'J'].map(name), ['ce', 'yumuşak ge', 'ı', 'i', 'je']);
});

test('the tricky letters are ğ, ı, c, ç and ş, each with examples', () => {
  assert.deepEqual(TRICKY.map((t) => t.ch), ['ğ', 'ı', 'c', 'ç', 'ş']);
  for (const t of TRICKY) {
    assert.ok(t.title && t.sound, t.ch);
    assert.ok(t.ex.length >= 2 && t.ex.every((e) => e.length === 2 && e[0] && e[1]), t.ch);
  }
});

test('the body lists every letter, then the tricky letters, without a title bar', () => {
  const html = alphabetBodyHtml(LETTERS, TRICKY);
  assert.equal((html.match(/class="abc-row"/g) || []).length, 29);
  assert.equal((html.match(/class="abc-combo"/g) || []).length, 5);
  assert.ok(html.includes('Tricky letters'));
  assert.ok(!html.includes('s-top') && !html.includes('data-act="close"'), 'the book supplies the title bar');
  assert.ok(html.includes('data-say="yumuşak ge"'), 'a letter says its name');
  for (const shown of ['Ç ç', 'I ı', 'İ i']) assert.ok(html.includes(`>${shown}<`), shown);
  assert.ok(html.includes('data-say="anne"'), 'the example has a speaker');
});

// Content the review corrected: v is a plain v, ğ's y-sound comes after front vowels,
// and the intro does not claim ğ is said.
test('the sound descriptions are accurate', () => {
  const sound = (ch) => LETTERS.find((l) => l.ch === ch).sound;
  assert.match(sound('V'), /^Like English v/);
  assert.match(TRICKY.find((t) => t.ch === 'ğ').sound, /after e, i, ö or ü/);
  assert.match(alphabetBodyHtml(LETTERS, TRICKY), /class="note">[^<]*ğ/);
});

test('text is escaped', () => {
  const html = alphabetBodyHtml(
    [{ ch: '<', name: '<n>', sound: '<s>', ex: ['<e>', '<t>'] }],
    [{ ch: 'x', title: '<c>', sound: '<d>', ex: [['<x>', '<y>']] }],
  );
  for (const tag of ['<n>', '<s>', '<e>', '<t>', '<c>', '<d>', '<x>', '<y>']) assert.ok(!html.includes(tag), tag);
});
