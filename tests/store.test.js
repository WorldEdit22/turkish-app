import { test } from 'node:test';
import assert from 'node:assert/strict';

// An in-memory stand-in for the phone's localStorage, set before store.js loads.
const saved = new Map();
Object.defineProperty(globalThis, 'localStorage', {
  configurable: true,
  value: { getItem: (k) => saved.get(k) ?? null, setItem: (k, v) => saved.set(k, String(v)) },
});
const { store } = await import('../js/store.js');

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

test('deleting a scan keeps its explanations', () => {
  const scan = store.addScan([['Otur.']]);
  store.saveExplanation('Otur.', { en: 'Sit.', structure: '', words: [] });
  store.deleteScan(scan.id);
  assert.ok(!store.scans.some((s) => s.id === scan.id));
  assert.ok(!JSON.parse(saved.get('tl.scans')).list.some((s) => s.id === scan.id));
  assert.equal(store.explanation('Otur.').en, 'Sit.');
});

test('selecting does not mark learned', () => {
  store.toggleSelected('kahve');
  assert.equal(store.isLearned('kahve'), false);
  store.toggleLearned('cay');
  assert.equal(store.isSelected('cay'), false);
});
