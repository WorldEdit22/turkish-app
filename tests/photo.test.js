import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fitSize } from '../js/photo.js';

test('fitSize scales big photos down and leaves small ones', () => {
  assert.deepEqual(fitSize(4032, 3024), { w: 1600, h: 1200 });
  assert.deepEqual(fitSize(3024, 4032), { w: 1200, h: 1600 });
  assert.deepEqual(fitSize(800, 600), { w: 800, h: 600 });
  assert.deepEqual(fitSize(1000, 333, 500), { w: 500, h: 167 });
});
