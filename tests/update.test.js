import { test } from 'node:test';
import assert from 'node:assert/strict';
import { reloadOnUpdate } from '../js/update.js';

// A stand-in for navigator.serviceWorker: an event target with a `controller`.
const container = (controller) => Object.assign(new EventTarget(), { controller });
const takeOver = (c) => c.dispatchEvent(new Event('controllerchange'));

test('a new version taking over reloads the page once', () => {
  const c = container({ scriptURL: 'sw.js' });
  let reloads = 0;
  reloadOnUpdate(c, () => reloads++);
  takeOver(c);
  takeOver(c);
  assert.equal(reloads, 1);
});

test('the first install does not reload', () => {
  const c = container(null);
  let reloads = 0;
  reloadOnUpdate(c, () => reloads++);
  takeOver(c);
  assert.equal(reloads, 0);
});
