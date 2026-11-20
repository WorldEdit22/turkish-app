// Builds the example sentences shown in a card: first with what the user has
// selected, then the hand-written ones, then a few with learned (or common)
// words or patterns. Pure functions, so they are tested in Node.
//
// A row is { tr, en } for a hand-written example, or a fill() result
// { tr, en, trParts, enParts } for a generated one. Word-card rows made from a
// pattern also carry `from` ("___ istiyorum · I want ___").

import { fill, fits } from './combine.js';

export const slotOf = (p, v) => v.slot || p.slot;

const tpl = ([tr, en]) => ({ tr, en });
const pick = (a, rand) => a[Math.floor(rand() * a.length)];

function shuffle(arr, rand) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Selected rows, then hand-written ones (minus any that a generated row
// repeats), then the extras.
function merge(selected, hand, extras) {
  const gen = new Set([...selected, ...extras].map((r) => r.tr));
  return [...selected, ...hand.filter((r) => !gen.has(r.tr)), ...extras];
}

// Every variant with templates that the word fits, in pattern order.
export function wordPatternPairs(word, patterns) {
  const pairs = [];
  for (const p of patterns) for (const v of p.variants) if (v.t.length && fits(slotOf(p, v), word)) pairs.push({ p, v });
  return pairs;
}

export function patternExamples(p, vi, { words, isSelected, isLearned, rand = Math.random }) {
  const v = p.variants[vi];
  const hand = v.ex.map(([tr, en]) => ({ tr, en }));
  if (!v.t.length) return hand;
  const make = (w) => fill(tpl(pick(v.t, rand)), w);
  const fitting = words.filter((w) => fits(slotOf(p, v), w));
  // Selected words are shown already; the extras come from the rest.
  const free = fitting.filter((w) => !isSelected(w));
  const learned = free.filter(isLearned);
  const pool = learned.length ? learned : free.slice(0, 15);
  return merge(fitting.filter(isSelected).map(make), hand, shuffle(pool, rand).slice(0, 3).map(make));
}

export function wordExamples(w, { patterns, isSelected, isLearned, rand = Math.random }) {
  const make = ({ p, v }) => ({ ...fill(tpl(pick(v.t, rand)), w), from: `${v.tr} · ${p.en}` });
  const pairs = wordPatternPairs(w, patterns);
  const top = new Set(patterns.slice(0, 15));
  // Selected patterns are shown already; the extras come from the rest.
  const free = pairs.filter(({ p }) => !isSelected(p));
  const learned = free.filter(({ p }) => isLearned(p));
  const common = free.filter(({ p }) => top.has(p));
  const pool = learned.length ? learned : common.length >= 4 ? common : free.slice(0, 10);
  const hand = w.ex ? [{ tr: w.ex[0], en: w.ex[1] }] : [];
  return merge(pairs.filter(({ p }) => isSelected(p)).map(make), hand, shuffle(pool, rand).slice(0, 4).map(make));
}
