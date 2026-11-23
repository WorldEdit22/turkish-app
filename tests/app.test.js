import { test } from 'node:test';
import assert from 'node:assert/strict';

// A small stand-in for the page, enough to run app.js: every element is a stub that
// keeps its innerHTML and listeners, so the test can draw screens and "click".
// (The same harness as the Swedish app's tests/app.test.js.)
const elements = new Map();
function element(name) {
  return {
    name,
    innerHTML: '',
    textContent: '',
    value: '',
    hidden: false,
    open: false,
    scrollTop: 0,
    dataset: {},
    style: {},
    listeners: {},
    parentElement: null,
    classList: { add() {}, remove() {}, toggle() {}, contains: () => false },
    addEventListener(type, fn) {
      (this.listeners[type] ||= []).push(fn);
    },
    fire(type, event = {}) {
      for (const fn of this.listeners[type] || []) fn({ target: this, preventDefault() {}, ...event });
    },
    setAttribute() {},
    focus() {},
    select() {},
    setSelectionRange() {},
    append() {},
    insertAdjacentHTML() {},
    querySelector: () => null,
    showModal() {
      this.open = true;
    },
    close() {
      this.open = false;
      this.fire('close');
    },
  };
}
const $ = (sel) => {
  if (!elements.has(sel)) elements.set(sel, element(sel));
  return elements.get(sel);
};
const saved = new Map();
Object.assign(globalThis, {
  window: globalThis,
  document: { querySelector: $, querySelectorAll: () => [], body: element('body') },
  location: { protocol: 'http:' },
  scrollTo() {},
  confirm: () => true,
});
Object.defineProperty(globalThis, 'localStorage', {
  configurable: true,
  value: { getItem: (k) => saved.get(k) ?? null, setItem: (k, v) => saved.set(k, String(v)) },
});

// Seed before app.js loads: one real word mastered both ways, and a card for a word that no longer exists.
const { dayOf } = await import('../js/srs.js');
const { WORDS } = await import('../data/words.js');
const mastered = () => ({ ivl: 30, due: dayOf(Date.now()) + 30, last: 'easy', prev: null });
saved.set(
  'tl.practice',
  JSON.stringify({
    migrated: true,
    cards: {
      'food:ekmek': { say: mastered(), understand: mastered() },
      'food:gone': { say: mastered(), understand: mastered() },
    },
    daily: null,
  }),
);

await import('../js/app.js');

// A click on a block's ⓘ, the way the list's click handler sees it.
const openBlock = (key) => {
  const block = { dataset: { key }, classList: { toggle() {} }, setAttribute() {} };
  $('#list').fire('click', { target: { closest: (s) => (s === '.block' ? block : s === '.b-info' ? {} : null) } });
};
const clean = (html) => !/undefined|NaN|\[object Object\]/.test(html);

test('the word list draws', () => {
  const html = $('#list').innerHTML;
  assert.ok((html.match(/class="block/g) || []).length > 900, 'every word has a block');
  assert.ok(html.includes('data-key="drinks:su"'));
  assert.ok(clean(html));
});

test('the word list has no learned look and counts mastered words; cards for words that no longer exist count nowhere', () => {
  assert.ok(!$('#list').innerHTML.includes('class="block on'));
  assert.equal($('#progress').textContent, `1 / ${WORDS.length} mastered`);
});

test('the status filter and the learned sorts are gone', () => {
  const html = $('#sort').innerHTML;
  assert.ok(html.includes('value="topic"'), 'the sort list is drawn');
  assert.ok(!/value="(todo|learned)"/.test(html));
});

test('the Aa button opens the alphabet with every letter', () => {
  $('#abc-btn').fire('click');
  assert.ok($('#alphabet').open);
  assert.equal(($('#alphabet-body').innerHTML.match(/class="abc-row"/g) || []).length, 29);
  $('#alphabet').close();
});

test("a word window's title row has the alphabet and translate buttons, and Aa opens the alphabet", () => {
  openBlock('drinks:su');
  const html = $('#sheet-body').innerHTML;
  assert.ok(html.includes('data-act="alphabet"') && html.includes('data-act="translate"'));
  assert.ok(clean(html));
  const btn = { dataset: { act: 'alphabet' } };
  $('#sheet-body').fire('click', { target: { closest: (s) => (s === '[data-act]' ? btn : null) } });
  assert.ok($('#alphabet').open, 'opens on top of the word window');
  $('#alphabet').close();
  assert.ok($('#sheet').open, 'the word window is still there');
  $('#sheet').close();
});

test('switching tabs scrolls the list, not the window, back to the top', () => {
  $('#list').scrollTop = 500;
  const tabs = document.querySelector('.tabs');
  try {
    tabs.fire('click', { target: { closest: () => ({ dataset: { tab: 'patterns' } }) } });
    assert.equal($('#list').scrollTop, 0);
  } finally {
    tabs.fire('click', { target: { closest: () => ({ dataset: { tab: 'words' } }) } });
  }
});
