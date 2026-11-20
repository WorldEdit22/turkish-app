import { test, mock } from 'node:test';
import assert from 'node:assert/strict';
import { longPress } from '../js/longpress.js';

const ev = (type, x = 0, y = 0) => Object.assign(new Event(type, { cancelable: true }), { clientX: x, clientY: y });

function setup() {
  mock.timers.enable({ apis: ['setTimeout'] });
  const target = new EventTarget();
  const block = { id: 'block' };
  const held = [];
  const lp = longPress(target, { find: () => block, onLongPress: (el) => held.push(el) });
  return { target, block, held, lp };
}

test('fires after holding 500 ms', (t) => {
  t.after(() => mock.timers.reset());
  const { target, block, held } = setup();
  target.dispatchEvent(ev('pointerdown', 10, 10));
  mock.timers.tick(499);
  assert.deepEqual(held, []);
  mock.timers.tick(1);
  assert.deepEqual(held, [block]);
});

test('does not fire when released early', (t) => {
  t.after(() => mock.timers.reset());
  const { target, held } = setup();
  target.dispatchEvent(ev('pointerdown', 10, 10));
  mock.timers.tick(300);
  target.dispatchEvent(ev('pointerup', 10, 10));
  mock.timers.tick(500);
  assert.deepEqual(held, []);
});

test('does not fire when the finger moves more than 10 px', (t) => {
  t.after(() => mock.timers.reset());
  const { target, held } = setup();
  target.dispatchEvent(ev('pointerdown', 10, 10));
  target.dispatchEvent(ev('pointermove', 15, 15)); // ~7 px: still a hold
  mock.timers.tick(100);
  target.dispatchEvent(ev('pointermove', 10, 25)); // 15 px: scrolling
  mock.timers.tick(500);
  assert.deepEqual(held, []);
});

test('consumeClick is true once after a long press and false after a normal tap', (t) => {
  t.after(() => mock.timers.reset());
  const { target, lp } = setup();
  target.dispatchEvent(ev('pointerdown'));
  target.dispatchEvent(ev('pointerup'));
  assert.equal(lp.consumeClick(), false);
  target.dispatchEvent(ev('pointerdown'));
  mock.timers.tick(500);
  target.dispatchEvent(ev('pointerup'));
  assert.equal(lp.consumeClick(), true);
  assert.equal(lp.consumeClick(), false);
});

test('ignores presses outside a block and blocks the long-press menu on blocks', (t) => {
  t.after(() => mock.timers.reset());
  mock.timers.enable({ apis: ['setTimeout'] });
  const target = new EventTarget();
  const held = [];
  let found = null;
  longPress(target, { find: () => found, onLongPress: (el) => held.push(el) });
  target.dispatchEvent(ev('pointerdown'));
  mock.timers.tick(600);
  assert.deepEqual(held, []);
  found = { id: 'block' };
  const menu = ev('contextmenu');
  target.dispatchEvent(menu);
  assert.equal(menu.defaultPrevented, true);
});
