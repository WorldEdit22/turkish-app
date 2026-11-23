import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  dayOf, fuzz, nextInterval, answer, correct, isNew, isKnown, isMastered, status,
  buildQueue, requeue, unqueue, doseLeft, useDose, addDose, giveBackDose, migrateLearned,
} from '../js/srs.js';

const fixed = (r) => () => r; // a rand that always returns r
const D = 20000; // any day number

test('a day starts at 4 a.m. local time', () => {
  const at = (d, h, m = 0) => dayOf(new Date(2026, 10, d, h, m).getTime());
  assert.equal(at(23, 3, 59), at(22, 12));
  assert.equal(at(23, 4), at(22, 12) + 1);
});

test('fuzz spreads 2+ day intervals by ±15%, at least ±1 day', () => {
  assert.equal(fuzz(1, fixed(0)), 1);
  assert.deepEqual([fuzz(3, fixed(0)), fuzz(3, fixed(0.5)), fuzz(3, fixed(0.999))], [2, 3, 4]);
  assert.deepEqual([fuzz(20, fixed(0)), fuzz(20, fixed(0.999))], [17, 23]);
});

test('a new card: Forgot today, Hard 1 day, Easy 3 days', () => {
  const r = fixed(0.5); // no fuzz offset
  assert.deepEqual(answer(undefined, 'forgot', D, r), { ivl: 0, due: D, last: 'forgot', prev: null });
  assert.deepEqual(answer(undefined, 'hard', D, r), { ivl: 1, due: D + 1, last: 'hard', prev: null });
  assert.deepEqual(answer(undefined, 'easy', D, r), { ivl: 3, due: D + 3, last: 'easy', prev: null });
});

test('a card with an interval: Hard ×1.2, Easy ×2.5, at least +1 day; Forgot clears it', () => {
  const r = fixed(0.5);
  const c = { ivl: 8, due: D, last: 'easy', prev: null };
  assert.equal(answer(c, 'hard', D, r).ivl, 10);
  assert.equal(answer(c, 'easy', D, r).ivl, 20);
  assert.equal(answer({ ...c, ivl: 1 }, 'hard', D, r).ivl, 2);
  const f = answer(c, 'forgot', D, r);
  assert.deepEqual([f.ivl, f.due], [0, D]);
  assert.equal(answer(f, 'easy', D, r).ivl, 3, 'after Forgot it starts over like a new card');
});

test('an always-Easy card comes back after about 3, 8, 20 and 50 days', () => {
  let c;
  const seen = [];
  for (let i = 0; i < 4; i++) seen.push((c = answer(c, 'easy', D, fixed(0.5))).ivl);
  assert.deepEqual(seen, [3, 8, 20, 50]);
});

test('each answer keeps the state before it, without nesting', () => {
  const a = answer(undefined, 'easy', D, fixed(0.5));
  const b = answer(a, 'hard', D, fixed(0.5));
  assert.deepEqual(b.prev, { ivl: 3, due: D + 3, last: 'easy', prev: null });
});

test('correct replaces the last answer; New can itself be corrected', () => {
  const r = fixed(0.5);
  const a = answer(undefined, 'easy', D, r);
  const b = answer(a, 'easy', D, r); // 8 days
  assert.equal(correct(b, 'hard', D, r).ivl, 4, 'Hard applied to the 3-day state');
  const n = correct(b, 'new', D, r);
  assert.ok(isNew(n));
  assert.equal(correct(n, 'easy', D, r).ivl, 8, 'Easy after a mistaken New applies to the state before it');
  assert.equal(correct(undefined, 'easy', D, r).ivl, 3, 'a never-answered card is answered now');
});

test('status, known and mastered', () => {
  assert.deepEqual(status(undefined, D), { kind: 'new', days: 0 });
  assert.deepEqual(status({ ivl: 3, due: D, last: 'easy', prev: null }, D), { kind: 'due', days: 0 });
  assert.deepEqual(status({ ivl: 3, due: D + 2, last: 'easy', prev: null }, D), { kind: 'later', days: 2 });
  assert.deepEqual(status({ ivl: 21, due: D + 9, last: 'easy', prev: null }, D), { kind: 'mastered', days: 9 });
  assert.equal(isKnown({ ivl: 0, due: D, last: 'forgot', prev: null }), false);
  assert.equal(isMastered({ ivl: 20, due: D, last: 'easy', prev: null }), false);
});

test('nextInterval is the button label: no fuzz', () => {
  assert.deepEqual(['forgot', 'hard', 'easy'].map((g) => nextInterval(undefined, g)), [0, 1, 3]);
  assert.deepEqual(['hard', 'easy'].map((g) => nextInterval({ ivl: 8, due: D, last: 'easy', prev: null }, g)), [10, 20]);
});

test('the queue: due cards oldest first, then new cards in the given order up to the dose', () => {
  const cards = { a: { ivl: 3, due: D - 2, last: 'easy', prev: null }, c: { ivl: 3, due: D, last: 'easy', prev: null }, e: { ivl: 3, due: D + 1, last: 'easy', prev: null } };
  const q = buildQueue(['a', 'b', 'c', 'd', 'e', 'f'], (k) => cards[k], D, 2, fixed(0));
  assert.deepEqual(q, ['a', 'c', 'b', 'd']);
  assert.deepEqual(buildQueue(['b', 'd'], () => undefined, D, 0, fixed(0)), []);
});

test('a Forgot card goes back 4 cards later, or last; unqueue removes it', () => {
  assert.deepEqual(requeue(['a', 'b', 'c', 'd', 'e'], 'x'), ['a', 'b', 'c', 'd', 'x', 'e']);
  assert.deepEqual(requeue(['a'], 'x'), ['a', 'x']);
  assert.deepEqual(unqueue(['a', 'x', 'b', 'x'], 'x'), ['a', 'b']);
});

test('the daily dose: 15 per direction, More adds 15, a new day starts over', () => {
  let d = null;
  assert.equal(doseLeft(d, 'say', D), 15);
  d = useDose(d, 'say', D);
  assert.equal(doseLeft(d, 'say', D), 14);
  assert.equal(doseLeft(d, 'understand', D), 15);
  d = addDose(d, 'say', D);
  assert.equal(doseLeft(d, 'say', D), 29);
  d = giveBackDose(d, 'say', D);
  assert.equal(doseLeft(d, 'say', D), 30);
  assert.equal(doseLeft(d, 'say', D + 1), 15);
});

test('old learned marks become known in both directions, due 1–21 days ahead', () => {
  const lo = migrateLearned({ 'food:x': 1 }, D, fixed(0));
  const hi = migrateLearned({ 'food:x': 1 }, D, fixed(0.999));
  assert.deepEqual(lo['food:x'].say, { ivl: 7, due: D + 1, last: 'easy', prev: null });
  assert.equal(hi['food:x'].understand.due, D + 21);
});
