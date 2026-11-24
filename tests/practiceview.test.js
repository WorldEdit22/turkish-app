import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cardHtml, doneHtml, recallHtml, intervalText, statusText, countsText } from '../js/practiceview.js';

const face = (o = {}) => ({
  native: 'water',
  target: 'su',
  say: 'su',
  icon: '💧',
  hint: null,
  forms: null,
  note: null,
  variant: null,
  example: null,
  ...o,
});
const previews = { forgot: 0, hard: 1, easy: 3 };
const opts = (o = {}) => ({ dir: 'say', revealed: false, previews, canUndo: false, ...o });

test('the say side shows the native text and hides the answer until revealed', () => {
  const html = cardHtml(face(), opts());
  assert.ok(html.includes('water'));
  assert.ok(!html.includes('data-grade'));
  assert.ok(!html.includes('su'));
});

// A tap beside the speaker must not reveal: only the Show answer button does.
test('only the Show answer button reveals, not the rest of the card', () => {
  for (const dir of ['say', 'understand']) {
    const html = cardHtml(face(), opts({ dir }));
    assert.equal((html.match(/data-act="reveal"/g) || []).length, 1, dir);
    assert.ok(html.includes('<button class="pc-show" data-act="reveal">Show answer</button>'), dir);
  }
});

test('the topic icon sits in the corner and there is no word-type dot', () => {
  const html = cardHtml(face(), opts());
  assert.ok(html.startsWith('<div class="pc"><span class="pc-icon" aria-hidden="true">💧</span>'));
  assert.ok(!html.includes('class="dot') && !html.includes('pc-meta'));
  assert.ok(!cardHtml(face({ icon: null }), opts()).includes('pc-icon'), 'a pattern card has no icon');
});

test('revealed: the other side, a speaker, the example and three answers with their intervals', () => {
  const html = cardHtml(
    face({ example: { native: 'I drink water', target: 'Su içerim', hint: null } }),
    opts({ revealed: true }),
  );
  assert.ok(!html.includes('data-act="reveal"'));
  assert.match(html, /class="pc-target"[^>]*>su</);
  assert.match(html, /<button class="say" data-say="su" aria-label="Listen">/);
  assert.match(html, /<button class="say" data-say="Su içerim" aria-label="Listen">/);
  assert.ok(html.includes('I drink water'));
  for (const g of ['forgot', 'hard', 'easy']) assert.match(html, new RegExp(`<button class="grade ${g}" data-grade="${g}">`));
  assert.ok(html.includes('Forgot') && html.includes('Hard') && html.includes('Easy'));
  assert.ok(html.includes('today') && html.includes('1 day') && html.includes('~3 days'));
});

test('the understand side starts from the target text with a speaker', () => {
  const html = cardHtml(face({ say: 'su!' }), opts({ dir: 'understand' }));
  assert.match(html, /data-say="su!"/);
  assert.ok(!html.includes('water'));
  const back = cardHtml(face(), opts({ dir: 'understand', revealed: true }));
  assert.ok(back.includes('water'));
});

test('hint and forms render only when present', () => {
  assert.ok(!cardHtml(face(), opts({ revealed: true })).includes('pc-hint'));
  const html = cardHtml(face({ hint: 'su', forms: 'suyu' }), opts({ revealed: true }));
  assert.match(html, /class="pc-hint"/);
  assert.match(html, /class="pc-forms"/);
});

test('a pattern card\'s back shows the chosen variant\'s form', () => {
  const html = cardHtml(face({ variant: { native: 'to the water', target: 'suya' }, note: 'dative' }), opts({ revealed: true }));
  assert.match(html, /class="pc-variant"/);
  assert.ok(html.includes('to the water') && html.includes('suya'));
  assert.match(html, /class="pc-note"[^>]*>dative</);
  assert.ok(!cardHtml(face(), opts({ revealed: true })).includes('pc-variant'));
});

test("a pattern card's front adds an example sentence in the front's language; a word card's front does not", () => {
  const example = { native: 'I want water.', target: 'Su istiyorum.', hint: null };
  const pattern = face({ native: 'I want ___', target: '___ istiyorum', say: ' istiyorum', dot: null, icon: null, variant: { native: 'I want ___', target: '___ istiyorum' }, example });
  const say = cardHtml(pattern, opts());
  assert.match(say, /class="pc-front-ex"><div class="pc-native">I want water\.<\/div>/);
  assert.ok(!say.includes('Su istiyorum') && !say.includes('data-grade'), 'the Turkish waits for the answer');

  const understand = cardHtml(pattern, opts({ dir: 'understand' }));
  assert.match(understand, /class="pc-front-ex"><div class="pc-line"><span class="pc-target">Su istiyorum\.<\/span><button class="say" data-say="Su istiyorum\."/);
  assert.ok(!understand.includes('I want'), 'the English waits for the answer');

  const back = cardHtml(pattern, opts({ revealed: true }));
  assert.match(back, /class="pc-ex"><div class="pc-line"><span class="pc-target">Su istiyorum\.<\/span><button class="say" data-say="Su istiyorum\."/, 'the back keeps the example in Turkish');
  assert.ok(!cardHtml(face({ example }), opts()).includes('pc-front-ex'), "a word card's front has no example");
});

test('the unrevealed card keeps the answer row\'s place: hidden, inert, no data-grade', () => {
  const html = cardHtml(face(), opts({ canUndo: true }));
  assert.match(html, /<div class="grades grades-hold" aria-hidden="true">/);
  assert.equal((html.match(/<button class="grade [a-z]+" disabled tabindex="-1">/g) || []).length, 3);
  assert.ok(!html.includes('data-grade'));
  assert.ok(html.indexOf('grades-hold') < html.indexOf('data-act="undo"'), 'the row sits above Undo');
  assert.ok(!cardHtml(face(), opts({ revealed: true })).includes('grades-hold'));
});

test('Undo shows only when there is something to undo', () => {
  assert.ok(!cardHtml(face(), opts()).includes('data-act="undo"'));
  const html = cardHtml(face(), opts({ canUndo: true }));
  assert.match(html, /data-act="undo"/);
  assert.ok(html.includes('↶ Undo'));
});

test('done: More while unseen cards remain; otherwise when the next review is', () => {
  const more = doneHtml({ newToday: 15, canMore: true, nextIn: 2 });
  assert.ok(more.includes('Done for today'));
  assert.ok(more.includes('15 new cards today'));
  assert.match(more, /data-act="more"/);
  assert.ok(!more.includes('All caught up'));
  const caught = doneHtml({ newToday: 0, canMore: false, nextIn: 4 });
  assert.ok(!caught.includes('data-act="more"'));
  assert.ok(caught.includes('All caught up here. Next review in 4 days'));
  const none = doneHtml({ newToday: 0, canMore: false, nextIn: null });
  assert.ok(!none.includes('All caught up'));
});

test('done: Undo shows while the last answer can be undone', () => {
  assert.ok(!doneHtml({ newToday: 1, canMore: true, nextIn: null }).includes('data-act="undo"'));
  const html = doneHtml({ newToday: 1, canMore: true, nextIn: null, canUndo: true });
  assert.ok(html.includes('<button class="pc-undo" data-act="undo">↶ Undo</button>'));
});

test('the window\'s Practice section highlights each direction\'s last answer', () => {
  const html = recallHtml([
    { dir: 'say', label: 'Say it', st: { kind: 'due', days: 0 }, last: 'hard' },
    { dir: 'understand', label: 'Understand it', st: { kind: 'new', days: 0 }, last: undefined },
  ]);
  assert.ok(html.includes('Practice'));
  assert.equal(html.match(/data-act="recall"/g).length, 8);
  assert.equal(html.match(/class="[^"]*\bon\b[^"]*"/g).length, 2);
  assert.match(html, /<button class="on" data-act="recall" data-dir="say" data-grade="hard">/);
  assert.match(html, /<button class="on" data-act="recall" data-dir="understand" data-grade="new">/);
  assert.ok(html.includes('Due today') && html.includes('Say it'));
});

test('long intervals read in months', () => {
  assert.equal(intervalText(90), '~3 months');
  assert.equal(intervalText(59), '~59 days');
  assert.equal(intervalText(0), 'today');
  assert.equal(intervalText(1), '1 day');
});

test('status and counts text', () => {
  assert.equal(statusText({ kind: 'new', days: 0 }), 'New');
  assert.equal(statusText({ kind: 'due', days: 0 }), 'Due today');
  assert.equal(statusText({ kind: 'later', days: 5 }), 'Next in 5 days');
  assert.equal(statusText({ kind: 'mastered', days: 30 }), 'Mastered · next in 30 days');
  assert.equal(countsText(3, 12), '3 due · 12 new');
});

test('text is escaped', () => {
  const E = '<img src=x onerror=alert(1)>';
  const f = face({
    native: E, target: E, say: E, icon: E, hint: E, forms: E, note: E,
    variant: { native: E, target: E }, example: { native: E, target: E, hint: E },
  });
  const html =
    cardHtml(f, opts({ revealed: true })) +
    cardHtml(f, opts({ dir: 'understand' })) +
    recallHtml([{ dir: 'say', label: E, st: { kind: 'new', days: 0 }, last: 'new' }]);
  assert.ok(!html.includes('<img'));
  assert.ok(html.includes('&lt;img src=x onerror=alert(1)&gt;'));
});
