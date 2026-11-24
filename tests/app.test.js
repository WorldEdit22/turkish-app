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
  document: Object.assign(element('document'), { querySelector: $, querySelectorAll: () => [], body: element('body') }),
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

// The app opens in Practice; the older tests below start from Browse.
const openedWith = $('#list').innerHTML;
$('#mode').fire('click', { target: { closest: (s) => (s === '[data-mode]' ? { dataset: { mode: 'browse' } } : null) } });

test('the app opens in Practice', () => {
  assert.ok(/class="pc"|class="pc-done"/.test(openedWith), 'the list shows a practice card or the done screen');
});

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

const { store } = await import('../js/store.js');
const clickSheet = (dataset) => $('#sheet-body').fire('click', { target: { closest: (s) => (s === '[data-act]' ? { dataset } : null) } });
const onButton = (html, dir, grade) => html.includes(`class="on" data-act="recall" data-dir="${dir}" data-grade="${grade}"`);
const clickSettings = (id) => $('#settings').fire('click', { target: { id, closest: () => null } });
const withSettings = async (fn) => {
  $('#gear').fire('click');
  try {
    await fn();
  } finally {
    $('#gear').fire('click');
  }
};

test("a word window shows both directions' recall state with New highlighted", () => {
  openBlock('drinks:su');
  try {
    const html = $('#sheet-body').innerHTML;
    assert.equal((html.match(/data-dir="/g) || []).length, 8, 'two rows of four buttons');
    assert.ok(html.includes('EN → TR') && html.includes('TR → EN'));
    assert.ok(onButton(html, 'say', 'new') && onButton(html, 'understand', 'new'));
    assert.ok(!html.includes('learn-btn') && clean(html));
  } finally {
    $('#sheet').close();
  }
});

test('tapping Easy in the window answers that direction now; tapping New puts it back, and Easy again restores it', () => {
  const today = dayOf(Date.now());
  const dose = store.doseLeft('say', today);
  openBlock('drinks:su');
  try {
    $('#sheet').scrollTop = 120;
    clickSheet({ act: 'recall', dir: 'say', grade: 'easy' });
    assert.equal(store.card('drinks:su', 'say').last, 'easy');
    assert.ok(onButton($('#sheet-body').innerHTML, 'say', 'easy'), 'the window is redrawn');
    assert.ok(onButton($('#sheet-body').innerHTML, 'understand', 'new'), 'the other direction is untouched');
    assert.equal($('#sheet').scrollTop, 120, 'the scroll position is kept');
    assert.equal(store.doseLeft('say', today), dose, 'the daily dose is untouched');

    clickSheet({ act: 'recall', dir: 'say', grade: 'new' });
    assert.ok(onButton($('#sheet-body').innerHTML, 'say', 'new'));
    assert.equal(store.card('drinks:su', 'say')?.last ?? 'new', 'new');

    clickSheet({ act: 'recall', dir: 'say', grade: 'easy' });
    assert.equal(store.card('drinks:su', 'say').last, 'easy');
    assert.equal(store.doseLeft('say', today), dose);
  } finally {
    $('#sheet').close();
    const cards = { ...store.cards };
    delete cards['drinks:su'];
    store.replaceCards(cards);
  }
});

test('Settings shows mastered counts', () =>
  withSettings(() => {
    const html = $('#settings').innerHTML;
    assert.ok(html.includes(`0 of `) && html.includes(`1 of ${WORDS.length} words mastered.`), html);
    assert.ok(!/learned/.test(html));
  }));

test('Restore asks first: declined leaves the cards as they were', () =>
  withSettings(() => {
    const before = structuredClone(store.cards);
    const backup = JSON.parse(store.backupText());
    backup.cards = {};
    const ask = globalThis.confirm;
    let asked = 0;
    globalThis.confirm = () => (asked++, false);
    try {
      clickSettings('set-restore'); // opens the paste box
      $('#set-backup-text').value = JSON.stringify(backup);
      clickSettings('set-restore');
      assert.equal(asked, 1);
      assert.deepEqual(store.cards, before);
    } finally {
      globalThis.confirm = ask;
    }
  }));

test('Reset clears practice data', () =>
  withSettings(() => {
    const before = structuredClone(store.cards);
    try {
      clickSettings('set-reset');
      assert.deepEqual(store.cards, {});
      assert.ok($('#settings').innerHTML.includes(`0 of ${WORDS.length} words mastered.`));
    } finally {
      store.replaceCards(before);
    }
  }));

const tabTo = (tab) => document.querySelector('.tabs').fire('click', { target: { closest: () => ({ dataset: { tab } }) } });

test('switching tabs scrolls the list, not the window, back to the top', () => {
  $('#list').scrollTop = 500;
  try {
    tabTo('patterns');
    assert.equal($('#list').scrollTop, 0);
  } finally {
    tabTo('words');
  }
});

// ---------- practice ----------

const { esc } = await import('../js/html.js');
const { isNew } = await import('../js/srs.js');
const { PATTERNS } = await import('../data/patterns.js');
const ui = store.ui;
const today = () => dayOf(Date.now());
// A tap in the list: `hits` maps each selector the tapped spot is inside to that element's dataset.
const tapList = (hits) => $('#list').fire('click', { target: { closest: (s) => (hits[s] ? { dataset: hits[s] } : null) } });
const reveal = () => tapList({ '[data-act]': { act: 'reveal' } });
const answerWith = (grade) => tapList({ '[data-grade]': { grade } });
const act = (name) => tapList({ '[data-act]': { act: name } });
const setMode = (mode) => $('#mode').fire('click', { target: { closest: (s) => (s === '[data-mode]' ? { dataset: { mode } } : null) } });
const tapChip = (dataset) => $('#types').fire('click', { target: { closest: () => ({ dataset }) } });
// The native text on the front of the card on screen (the say side).
const front = () => $('#list').innerHTML.match(/<div class="pc-native">([^<]*)<\/div>/)?.[1];
const label = (x) => esc(x.label);
// Words most common first (app.js ranks them), and those still new in a direction.
const BY_RANK = [...WORDS].sort((a, b) => a.rank - b.rank);
const newWords = (dir, cat) => BY_RANK.filter((w) => (!cat || w.cat === cat) && isNew(store.card(w.id, dir)));

// Runs fn in Practice (after setup); then back to Browse with the cards, the dose, the direction and the topic as they were.
function inPractice(fn, setup = () => {}) {
  const cards = structuredClone(store.cards);
  const daily = structuredClone(store.practice.daily);
  const { dir, topic } = ui;
  try {
    setup();
    setMode('practice');
    fn();
  } finally {
    setMode('browse');
    store.replaceCards(cards);
    store.practice.daily = daily;
    store.savePractice();
    Object.assign(ui, { dir, topic });
    store.saveUi();
  }
}

test("Practice shows the most common word's native text and hides the search row", () => {
  store.toggleSelected('drinks:su'); // so Browse has a Clear (1) button to hide
  try {
    inPractice(() => {
      const html = $('#list').innerHTML;
      assert.equal(front(), label(newWords('say')[0]));
      assert.ok(html.includes('data-act="reveal"') && !html.includes('data-grade'), 'the answer waits for a tap');
      assert.ok(clean(html));
      assert.equal($('.search-row').hidden, true);
      assert.equal($('#sort').hidden, true);
      assert.equal($('#clear-sel').hidden, true);
      assert.equal($('#dir').hidden, false);
      assert.equal($('#dir').textContent, 'EN → TR');
      assert.ok($('#types').innerHTML.includes('data-topic="food"'), 'topic chips');
      assert.ok(!$('#types').innerHTML.includes('data-type='), 'no word-type chips');
    });
    assert.equal($('.search-row').hidden, false, 'Browse shows the search row again');
    assert.equal($('#sort').hidden, false);
    assert.equal($('#clear-sel').hidden, false);
    assert.equal($('#dir').hidden, true);
    assert.ok($('#list').innerHTML.includes('class="block'), 'and the blocks');
  } finally {
    store.toggleSelected('drinks:su');
  }
});

test('revealing shows three answers; answering Easy saves the card and shows the next one, unrevealed', () =>
  inPractice(() => {
    const t = today();
    const [a, b] = newWords('say');
    const dose = store.doseLeft('say', t);
    reveal();
    let html = $('#list').innerHTML;
    assert.equal((html.match(/data-grade="/g) || []).length, 3);
    assert.ok(html.includes(`<span class="pc-target">${esc(a.tr)}</span>`), 'the Turkish is on the back');
    assert.ok(html.includes('1 day') && html.includes('~3 days'), "a new card's intervals");
    assert.ok(clean(html));

    answerWith('easy');
    const card = store.card(a.id, 'say');
    assert.equal(card.last, 'easy');
    assert.ok(card.due > t);
    assert.equal(store.doseLeft('say', t), dose - 1, "a new card uses one of the day's new cards");
    html = $('#list').innerHTML;
    assert.equal(front(), label(b));
    assert.ok(!html.includes('data-grade'), 'no answers on the next card until it is revealed');
    assert.ok(html.includes('data-act="undo"'));

    answerWith('easy'); // a quick second tap where the buttons were
    assert.equal(store.card(b.id, 'say'), undefined, 'the next card is not answered unseen');
    assert.equal(front(), label(b));
  }));

test('Forgot brings the card back 4 cards later', () =>
  inPractice(() => {
    const [a, b, c, d, e] = newWords('say');
    reveal();
    answerWith('forgot');
    assert.equal(store.card(a.id, 'say').last, 'forgot');
    assert.equal(store.card(a.id, 'say').due, today(), 'due today');
    const shown = [];
    for (let i = 0; i < 5; i++) {
      shown.push(front());
      reveal();
      answerWith('easy');
    }
    assert.deepEqual(shown, [b, c, d, e, a].map(label));
  }));

test('Undo after Forgot restores the card and leaves it in the queue once', () =>
  inPractice(() => {
    const t = today();
    const [a, b, c, d, e, f] = newWords('say');
    const dose = store.doseLeft('say', t);
    reveal();
    answerWith('forgot');
    act('undo');
    assert.equal(store.card(a.id, 'say'), undefined, 'as it was: never answered');
    assert.equal(store.doseLeft('say', t), dose, 'its new-card count is given back');
    assert.equal(front(), label(a), 'at the front again');
    assert.ok(!$('#list').innerHTML.includes('data-act="undo"'), 'only the last answer can be undone');
    const shown = [];
    for (let i = 0; i < 6; i++) {
      shown.push(front());
      reveal();
      answerWith('easy');
    }
    assert.deepEqual(shown, [a, b, c, d, e, f].map(label));
  }));

test('Undo after the last card of a session brings that card back', () => {
  const t = today();
  inPractice(
    () => {
      const [a] = newWords('say');
      assert.equal(store.doseLeft('say', t), 1, 'one card in this session');
      reveal();
      answerWith('easy');
      const html = $('#list').innerHTML;
      assert.ok(html.includes('Done for today') && html.includes('data-act="undo"'), 'Undo on the done screen');
      act('undo');
      assert.equal(store.card(a.id, 'say'), undefined, 'as it was: never answered');
      assert.equal(store.doseLeft('say', t), 1, 'its new-card count is given back');
      assert.equal(front(), label(a), 'the card is back');
      assert.ok(!$('#list').innerHTML.includes('data-act="undo"'));
    },
    () => {
      for (let i = 0; i < 14; i++) store.useDose('say', t);
    },
  );
});

test('after 15 new cards: Done for today with More; More gives 15 more', () =>
  inPractice(() => {
    const t = today();
    const answerAll = () => {
      let n = 0;
      for (; n < 50 && $('#list').innerHTML.includes('data-act="reveal"'); n++) {
        reveal();
        answerWith('easy');
      }
      return n;
    };
    assert.equal(store.doseLeft('say', t), 15);
    assert.equal(answerAll(), 15);
    let html = $('#list').innerHTML;
    assert.ok(html.includes('Done for today'));
    assert.ok(html.includes('15 new cards today'));
    assert.match(html, /data-act="more"/);
    assert.equal($('#progress').textContent, '0 due · 0 new');

    act('more');
    assert.equal(store.doseLeft('say', t), 15);
    assert.equal(answerAll(), 15, 'More gives 15 more');
    html = $('#list').innerHTML;
    assert.ok(html.includes('30 new cards today'));
    assert.ok(clean(html));
  }));

test('the direction switch flips the front to the target language', () =>
  inPractice(() => {
    const w = newWords('understand')[0];
    $('#dir').fire('click');
    assert.equal(ui.dir, 'understand');
    assert.equal($('#dir').textContent, 'TR → EN');
    const html = $('#list').innerHTML;
    assert.ok(html.includes(`<span class="pc-target">${esc(w.tr)}</span>`), 'the Turkish is on the front');
    assert.ok(!html.includes('pc-native'), 'the English waits for the answer');

    // The speaker sits inside the tap-to-reveal area: tapping it speaks and reveals nothing.
    const spoken = [];
    globalThis.speechSynthesis = { cancel() {}, getVoices: () => [], speak: (u) => spoken.push(u.text) };
    globalThis.SpeechSynthesisUtterance = class {
      constructor(text) {
        this.text = text;
      }
    };
    try {
      tapList({ '[data-say]': { say: w.tr }, '[data-act]': { act: 'reveal' } });
    } finally {
      delete globalThis.speechSynthesis;
      delete globalThis.SpeechSynthesisUtterance;
    }
    assert.deepEqual(spoken, [w.tr]);
    assert.ok(!$('#list').innerHTML.includes('data-grade'), 'still unrevealed');

    reveal();
    assert.ok($('#list').innerHTML.includes(`<div class="pc-native">${label(w)}</div>`));
    $('#dir').fire('click');
    assert.equal($('#dir').textContent, 'EN → TR');
    assert.equal(front(), label(newWords('say')[0]));
  }));

test('a topic chip limits practice to that topic', () =>
  inPractice(() => {
    tapChip({ topic: 'drinks' });
    assert.equal(ui.topic, 'drinks');
    assert.ok($('#types').innerHTML.includes('class="chip on" data-topic="drinks"'));
    const drinks = newWords('say', 'drinks');
    assert.equal($('#progress').textContent, `0 due · ${Math.min(15, drinks.length)} new`);
    const shown = [];
    for (let i = 0; i < 3; i++) {
      shown.push(front());
      reveal();
      answerWith('easy');
    }
    assert.deepEqual(shown, drinks.slice(0, 3).map(label));
  }));

test('on Patterns, practice starts with the most useful pattern; the back shows a variant and an example', () =>
  inPractice(() => {
    tabTo('patterns');
    try {
      const p = PATTERNS.find((x) => isNew(store.card(x.key, 'say')));
      assert.equal(front(), esc(p.en));
      assert.ok($('#types').innerHTML.includes('data-group="everyday"'), 'group chips');
      // The front also shows one of its own example sentences, in English.
      const pairs = p.variants.flatMap((v) => v.ex);
      const shown = pairs.find(([, en]) => $('#list').innerHTML.includes(`<div class="pc-front-ex"><div class="pc-native">${esc(en)}</div>`));
      assert.ok(shown, 'an example sentence on the front');
      reveal();
      const html = $('#list').innerHTML;
      assert.ok(html.includes('class="pc-variant"') && html.includes('class="pc-ex"'));
      assert.ok(p.variants.some((v) => html.includes(`<span class="pc-target">${esc(v.tr)}</span>`)), "one of the pattern's own variants");
      assert.ok(html.includes(`<span class="pc-target">${esc(shown[0])}</span>`), 'the same example in Turkish on the back');
      assert.ok(clean(html));
    } finally {
      tabTo('words');
    }
  }));

test('the title row shows due and new counts', () => {
  const w = newWords('say').at(-1); // the least common word, made due below
  inPractice(
    () => {
      const t = today();
      const fresh = Math.min(store.doseLeft('say', t), newWords('say').length);
      assert.equal($('#progress').textContent, `1 due · ${fresh} new`, 'a card for a word no longer in the data counts nowhere');
      assert.equal(front(), label(w), 'due cards come first; the card for a word no longer in the data never does');
      reveal();
      answerWith('easy');
      assert.equal($('#progress').textContent, `0 due · ${fresh} new`);
      reveal();
      answerWith('easy');
      assert.equal($('#progress').textContent, `0 due · ${fresh - 1} new`);
    },
    () => {
      const t = today();
      store.setCard(w.id, 'say', { ivl: 3, due: t - 1, last: 'easy', prev: null });
      store.setCard('food:gone', 'say', { ivl: 3, due: t - 2, last: 'easy', prev: null });
    },
  );
});

test('a new day starts a new dose', () => {
  const realNow = Date.now;
  const t = dayOf(realNow());
  const w = newWords('say').at(-1); // due tomorrow
  inPractice(
    () => {
      assert.ok($('#list').innerHTML.includes('Done for today'), 'nothing left today');
      Date.now = () => realNow() + 30 * 3600e3; // the next morning at the earliest, summer time or not
      try {
        const later = dayOf(Date.now());
        document.fire('visibilitychange'); // the app comes back to the screen
        assert.equal(store.doseLeft('say', later), 15, 'the dose is back');
        assert.equal(front(), label(w), 'the queue is rebuilt, with the card due now');
        assert.equal($('#progress').textContent, '1 due · 15 new');
      } finally {
        Date.now = realNow;
      }
    },
    () => {
      for (let i = 0; i < 15; i++) store.useDose('say', t);
      store.setCard(w.id, 'say', { ivl: 1, due: t + 1, last: 'hard', prev: null });
    },
  );
});
