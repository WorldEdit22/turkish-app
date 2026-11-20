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

test('selecting does not mark learned', () => {
  store.toggleSelected('kahve');
  assert.equal(store.isLearned('kahve'), false);
  store.toggleLearned('cay');
  assert.equal(store.isSelected('cay'), false);
});
