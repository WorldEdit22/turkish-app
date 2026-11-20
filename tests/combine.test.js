import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fill, fits, enIng, enPast, enA } from '../js/combine.js';

const n = (tr, en, o = {}) => ({ tr, en, type: 'noun', ...o });
const v = (tr, en, o = {}) => ({ tr, en, type: 'verb', ...o });
const a = (tr, en, o = {}) => ({ tr, en, type: 'adj', ...o });

test('fill puts the suffixed word into the Turkish and English templates', () => {
  const r = fill({ tr: '{w:(y)A} gidiyorum.', en: "I'm going to {the}." }, n('okul', 'school'));
  assert.equal(r.tr, 'Okula gidiyorum.');
  assert.equal(r.en, "I'm going to the school.");
});

test('fill capitalises a Turkish sentence that starts with the word', () => {
  assert.equal(fill({ tr: '{w} var mı?', en: 'Is there {a}?' }, n('ilaç', 'medicine', { m: 1 })).tr, 'İlaç var mı?');
});

test('fill handles a word used twice', () => {
  const r = fill({ tr: '{w:R} {w:mAz} ararım.', en: "I'll call as soon as I {base}." }, v('gelmek', 'come'));
  assert.equal(r.tr, 'Gelir gelmez ararım.');
  assert.equal(r.en, "I'll call as soon as I come.");
});

test('fill marks the inserted word so the UI can highlight it', () => {
  const r = fill({ tr: 'Çok {w}.', en: "It's very {en}." }, a('pahalı', 'expensive'));
  assert.deepEqual(r.trParts, [
    { text: 'Çok ', hl: false },
    { text: 'pahalı', hl: true },
    { text: '.', hl: false },
  ]);
  assert.deepEqual(r.enParts, [
    { text: "It's very ", hl: false },
    { text: 'expensive', hl: true },
    { text: '.', hl: false },
  ]);
});

test('English verb forms: base, -ing and past', () => {
  const r = fill({ tr: '{w:mAdAn} önce', en: '{base} / {ing} / {past}' }, v('yazmak', 'write', { p: 'wrote' }));
  assert.equal(r.en, 'Write / writing / wrote');
});

test('enIng derives -ing forms', () => {
  const cases = [
    [v('', 'come'), 'coming'],
    [v('', 'see'), 'seeing'],
    [v('', 'go'), 'going'],
    [v('', 'sit'), 'sitting'],
    [v('', 'wait'), 'waiting'],
    [v('', 'open'), 'opening'],
    [v('', 'fix'), 'fixing'],
    [v('', 'lie'), 'lying'],
    [v('', 'wake up'), 'waking up'],
    [v('', 'begin', { ing: 'beginning' }), 'beginning'],
  ];
  for (const [w, want] of cases) assert.equal(enIng(w), want, w.en);
});

test('enPast derives regular past forms and respects irregular ones', () => {
  const cases = [
    [v('', 'want'), 'wanted'],
    [v('', 'live'), 'lived'],
    [v('', 'try'), 'tried'],
    [v('', 'stop'), 'stopped'],
    [v('', 'play'), 'played'],
    [v('', 'go', { p: 'went' }), 'went'],
    [v('', 'clean up'), 'cleaned up'],
  ];
  for (const [w, want] of cases) assert.equal(enPast(w), want, w.en);
});

test('enA chooses a / an, skips mass nouns and respects overrides', () => {
  assert.equal(enA(n('', 'ticket')), 'a ticket');
  assert.equal(enA(n('', 'apple')), 'an apple');
  assert.equal(enA(n('', 'water', { m: 1 })), 'water');
  assert.equal(enA(n('', 'hour', { a: 'an hour' })), 'an hour');
});

test('{to} {at} {from} default to "the" and accept overrides', () => {
  const tpl = { tr: '{w:(y)A}', en: 'going {to}, {at}, {from}' };
  assert.equal(fill(tpl, n('banka', 'bank')).en, 'Going to the bank, at the bank, from the bank');
  const home = n('ev', 'home', { to: 'home', at: 'at home', from: 'from home' });
  assert.equal(fill(tpl, home).en, 'Going home, at home, from home');
  assert.equal(fill({ tr: '{w}', en: 'where is {the}?' }, n('ev', 'home', { the: 'my home' })).en, 'Where is my home?');
});

test('{w:} gives the bare verb stem for commands', () => {
  const r = fill({ tr: '{w:}!', en: '{base}!' }, v('gelmek', 'come'));
  assert.equal(r.tr, 'Gel!');
  assert.equal(r.en, 'Come!');
});

test('{pl} pluralises and {gen} uses the plural only for countable nouns', () => {
  const cases = [
    [n('elma', 'apple'), 'apples', 'apples'],
    [n('domates', 'tomato'), 'tomatoes', 'tomatoes'],
    [n('şehir', 'city'), 'cities', 'cities'],
    [n('otobüs', 'bus'), 'buses', 'buses'],
    [n('anahtar', 'key'), 'keys', 'keys'],
    [n('çocuk', 'child', { pl: 'children' }), 'children', 'children'],
    [n('su', 'water', { m: 1 }), 'waters', 'water'],
  ];
  for (const [w, pl, gen] of cases) {
    assert.equal(fill({ tr: '{w}', en: '{pl}|{gen}' }, w).en, capFirst(`${pl}|${gen}`), w.en);
  }
});

test('{when} uses a time phrase override, else the plain word', () => {
  const tpl = { tr: '{w} görüşürüz!', en: 'See you {when}!' };
  assert.equal(fill(tpl, n('akşam', 'evening', { when: 'this evening' })).en, 'See you this evening!');
  assert.equal(fill(tpl, n('pazartesi', 'Monday')).en, 'See you Monday!');
});

test('{is} {this} {that} agree with plural English words and are not highlighted', () => {
  const tpl = { tr: '{w}', en: '{is} {the} here, {this} {en} or {that} {en}?' };
  const shoes = n('ayakkabı', 'shoes', { m: 1, pe: 1 });
  const r = fill(tpl, shoes);
  assert.equal(r.en, 'Are the shoes here, these shoes or those shoes?');
  assert.deepEqual(r.enParts.filter((p) => p.hl).map((p) => p.text), ['the shoes', 'shoes', 'shoes']);
  assert.equal(fill(tpl, n('bilet', 'ticket')).en, 'Is the ticket here, this ticket or that ticket?');
});

function capFirst(s) {
  return s[0].toUpperCase() + s.slice(1);
}

test('fits accepts a word with several kinds', () => {
  const work = n('iş', 'work', { kind: 'room|event' });
  assert.equal(fits('noun:event', work), true);
  assert.equal(fits('noun:room', work), true);
  assert.equal(fits('noun:place', work), false);
});

test('fits matches word type and optional kinds', () => {
  assert.equal(fits('verb', v('gelmek', 'come')), true);
  assert.equal(fits('verb', n('ev', 'home')), false);
  assert.equal(fits('noun:place|food', n('ev', 'home', { kind: 'place' })), true);
  assert.equal(fits('noun:place|food', n('masa', 'table', { kind: 'thing' })), false);
  assert.equal(fits('*:time', { tr: 'yarın', en: 'tomorrow', type: 'adv', kind: 'time' }), true);
  assert.equal(fits('noun', n('ev', 'home', { nc: 1 })), false);
});
