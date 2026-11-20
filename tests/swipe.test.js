import { test } from 'node:test';
import assert from 'node:assert/strict';
import { swipe } from '../js/swipe.js';

const ev = (type, x, y) => Object.assign(new Event(type, { cancelable: true }), { clientX: x, clientY: y });

function setup() {
  const target = new EventTarget();
  const block = { id: 'block' };
  const swipes = [];
  const drags = [];
  const ends = [];
  const s = swipe(target, {
    find: () => block,
    onSwipe: (el, dir) => swipes.push([el, dir]),
    onDrag: (el, dx) => drags.push(dx),
    onEnd: (el) => ends.push(el),
  });
  const move = (points) => {
    const [x0, y0] = points[0];
    target.dispatchEvent(ev('pointerdown', x0, y0));
    for (const [x, y] of points.slice(1)) target.dispatchEvent(ev('pointermove', x, y));
    const [xl, yl] = points[points.length - 1];
    target.dispatchEvent(ev('pointerup', xl, yl));
  };
  return { block, swipes, drags, ends, move, s };
}

test('swiping right 80 px reports right', () => {
  const { block, swipes, ends, move } = setup();
  move([[100, 100], [115, 102], [150, 104], [180, 105]]);
  assert.deepEqual(swipes, [[block, 'right']]);
  assert.deepEqual(ends, [block]);
});

test('swiping left 80 px reports left', () => {
  const { block, swipes, move } = setup();
  move([[200, 100], [185, 101], [150, 100], [120, 99]]);
  assert.deepEqual(swipes, [[block, 'left']]);
});

test('a 40 px drag is not a swipe', () => {
  const { swipes, ends, block, move } = setup();
  move([[100, 100], [115, 100], [140, 100]]);
  assert.deepEqual(swipes, []);
  assert.deepEqual(ends, [block]);
});

test('vertical-first movement never becomes a swipe', () => {
  const { swipes, drags, move } = setup();
  move([[100, 100], [103, 120], [190, 130]]);
  assert.deepEqual(swipes, []);
  assert.deepEqual(drags, []);
});

test('onDrag follows the finger', () => {
  const { drags, move } = setup();
  move([[100, 100], [115, 100], [130, 101]]);
  assert.deepEqual(drags, [15, 30]);
});

test('consumeClick is true once after a swipe and false after a tap', () => {
  const { s, move } = setup();
  move([[100, 100], [100, 100]]);
  assert.equal(s.consumeClick(), false);
  move([[100, 100], [130, 100], [180, 100]]);
  assert.equal(s.consumeClick(), true);
  assert.equal(s.consumeClick(), false);
});
