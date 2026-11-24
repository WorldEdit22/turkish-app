import { test } from 'node:test';
import assert from 'node:assert/strict';

// An in-memory stand-in for the phone's localStorage, set before store.js loads.
const saved = new Map();
Object.defineProperty(globalThis, 'localStorage', {
  configurable: true,
  value: { getItem: (k) => saved.get(k) ?? null, setItem: (k, v) => saved.set(k, String(v)) },
});
// What a phone that used the old TR button has saved.
saved.set('tl.ui', JSON.stringify({ tab: 'words', showTr: true, sort: { words: 'todo', patterns: 'learned' }, status: { words: 'learned' } }));
// Marks from before practice mode, migrated once on first load.
saved.set('tl.learned', JSON.stringify({ 'food:ekmek': 1 }));
const { store } = await import('../js/store.js');

test('Turkish on blocks starts off, even where the old TR setting was saved on', () => {
  assert.equal(store.ui.showTurkish, false);
});

test('the selection is saved on the device under tl.selected', () => {
  store.toggleSelected('ayran');
  assert.ok(JSON.parse(saved.get('tl.selected')).ayran);
  store.toggleSelected('ayran');
  assert.equal(JSON.parse(saved.get('tl.selected')).ayran, undefined);
});

test('toggleSelected selects and unselects a key', () => {
  assert.equal(store.isSelected('ev'), false);
  store.toggleSelected('ev');
  assert.equal(store.isSelected('ev'), true);
  store.toggleSelected('ev');
  assert.equal(store.isSelected('ev'), false);
});

test('clearSelected empties the selection and selectedCount follows', () => {
  store.clearSelected();
  store.toggleSelected('su');
  store.toggleSelected('p:want');
  assert.equal(store.selectedCount(), 2);
  store.clearSelected();
  assert.equal(store.selectedCount(), 0);
  assert.equal(store.isSelected('su'), false);
  assert.equal(store.isSelected('p:want'), false);
});

test("clearing one tab leaves the other tab's selection", () => {
  const isPattern = (k) => k.startsWith('p:');
  store.clearSelected();
  store.toggleSelected('su');
  store.toggleSelected('p:want');
  store.clearSelected(isPattern);
  assert.equal(store.isSelected('su'), true);
  assert.equal(store.isSelected('p:want'), false);
  assert.equal(store.selectedCount((k) => !isPattern(k)), 1);
  assert.equal(store.selectedCount(isPattern), 0);
  assert.deepEqual(JSON.parse(saved.get('tl.selected')), { su: 1 });
});

test('a new scan is saved first on the device', () => {
  store.addScan([['Eski.']]);
  const scan = store.addScan([['Bugün hava güzel.', 'Parka gidelim.']]);
  assert.equal(store.scans[0], scan);
  assert.deepEqual(JSON.parse(saved.get('tl.scans')).list[0].paragraphs, [['Bugün hava güzel.', 'Parka gidelim.']]);
  assert.equal(typeof scan.id, 'string');
  assert.ok(!Number.isNaN(Date.parse(scan.date)));
});

test('only the 50 newest scans are kept', () => {
  for (let i = 0; i < 52; i++) store.addScan([[`Cümle ${i}.`]]);
  assert.equal(store.scans.length, 50);
  assert.deepEqual(store.scans[0].paragraphs, [['Cümle 51.']]);
  assert.deepEqual(store.scans[49].paragraphs, [['Cümle 2.']]);
  assert.equal(new Set(store.scans.map((s) => s.id)).size, 50, 'ids are unique');
});

test('explanations are saved by sentence text', () => {
  store.saveExplanation('Gel.', { en: 'Come.', structure: '', words: [] });
  assert.deepEqual(store.explanation('Gel.'), { en: 'Come.', structure: '', words: [] });
  assert.equal(store.explanation('Git.'), undefined);
  assert.equal(JSON.parse(saved.get('tl.explain'))['Gel.'].en, 'Come.');
});

test('deleting a scan keeps only the explanations another scan still uses', () => {
  const a = store.addScan([['Otur.', 'Ortak cümle.']]);
  store.addScan([['Ortak cümle.']]);
  store.saveExplanation('Otur.', { en: 'Sit.', structure: '', words: [] });
  store.saveExplanation('Ortak cümle.', { en: 'A shared sentence.', structure: '', words: [] });
  store.deleteScan(a.id);
  assert.ok(!store.scans.some((s) => s.id === a.id));
  assert.ok(!JSON.parse(saved.get('tl.scans')).list.some((s) => s.id === a.id));
  assert.equal(store.explanation('Otur.'), undefined);
  assert.equal(store.explanation('Ortak cümle.').en, 'A shared sentence.');
  assert.ok(!('Otur.' in JSON.parse(saved.get('tl.explain'))));
});

test('a scan dropped by the 50-scan limit takes its own explanations with it', () => {
  const oldest = store.addScan([['En eski cümle.']]);
  store.saveExplanation('En eski cümle.', { en: 'The oldest sentence.', structure: '', words: [] });
  for (let i = 0; i < 50; i++) store.addScan([[`Yeni ${i}.`]]);
  assert.ok(!store.scans.some((s) => s.id === oldest.id));
  assert.equal(store.explanation('En eski cümle.'), undefined);
});

const KEY = 'food:ekmek';

test('old learned marks become known in both directions', () => {
  assert.equal(store.card(KEY, 'say').ivl, 7);
  assert.equal(store.card(KEY, 'understand').ivl, 7);
});

test('saved learned sorts and the status filter are dropped', () => {
  assert.equal(store.ui.sort.words, 'topic');
  assert.equal(store.ui.sort.patterns, 'common');
  assert.equal(store.ui.status, undefined);
  assert.equal(store.ui.mode, 'practice');
  assert.equal(store.ui.dir, 'say');
  assert.equal(store.ui.topic, 'all');
});

test('setCard saves under tl.practice', () => {
  store.setCard('su', 'say', { ivl: 1, due: 5, last: 'hard', prev: null });
  assert.equal(JSON.parse(saved.get('tl.practice')).cards.su.say.last, 'hard');
  assert.equal(store.card('su', 'understand'), undefined);
});

test('the daily dose is saved and starts over on a new day', () => {
  assert.equal(store.doseLeft('say', 100), 15);
  store.useDose('say', 100);
  store.useDose('say', 100);
  assert.equal(store.doseLeft('say', 100), 13);
  assert.equal(store.doseLeft('understand', 100), 15);
  assert.equal(JSON.parse(saved.get('tl.practice')).daily.say.used, 2);
  store.giveBackDose('say', 100);
  assert.equal(store.doseLeft('say', 100), 14);
  store.addDose('say', 100);
  assert.equal(store.doseLeft('say', 100), 29);
  assert.equal(store.doseLeft('say', 101), 15);
});

test("doseUsed counts today's new cards per direction; another day counts none", () => {
  store.useDose('understand', 200);
  store.useDose('understand', 200);
  assert.equal(store.doseUsed('understand', 200), 2);
  assert.equal(store.doseUsed('say', 200), 0);
  assert.equal(store.doseUsed('understand', 201), 0);
});

test('a v2 backup round-trips; an old learned backup is migrated; another app\'s, broken or empty backups are refused', () => {
  const text = store.backupText();
  const parsed = JSON.parse(text);
  assert.equal(parsed.app, 'turkish');
  assert.equal(parsed.v, 2);
  assert.deepEqual(store.parseBackup(text, 100), store.cards);
  const old = store.parseBackup('{"app":"turkish","learned":{"a":1}}', 100);
  assert.equal(old.a.say.ivl, 7);
  assert.equal(old.a.understand.ivl, 7);
  assert.ok(old.a.say.due >= 101 && old.a.say.due <= 121);
  assert.equal(store.parseBackup('{"app":"swedish","learned":{"a":1}}', 100), null);
  assert.equal(store.parseBackup('{"app":"swedish","v":2,"cards":{}}', 100), null);
  assert.equal(store.parseBackup('{"learned":{"a":1}}', 100), null);
  assert.equal(store.parseBackup('not json', 100), null);
  assert.equal(store.parseBackup('{"app":"turkish"}', 100), null);
  assert.equal(store.parseBackup('{"app":"turkish","learned":[1]}', 100), null);
});

test('replaceCards swaps all cards and saves', () => {
  store.replaceCards({ x: { say: { ivl: 2, due: 9, last: 'easy', prev: null } } });
  assert.equal(store.card('su', 'say'), undefined);
  assert.equal(store.card('x', 'say').ivl, 2);
  assert.equal(JSON.parse(saved.get('tl.practice')).cards.x.say.due, 9);
});

test('migration runs once: Reset progress does not bring old marks back', async () => {
  store.resetProgress();
  assert.equal(store.card(KEY, 'say'), undefined);
  assert.equal(store.doseLeft('say', 100), 15);
  const again = (await import('../js/store.js?again')).store;
  assert.equal(again.card(KEY, 'say'), undefined);
});
