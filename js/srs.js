// Spaced-repetition scheduling for practice mode (shared byte for byte by both apps).
//
// A card is { ivl, due, last, prev, seen }: ivl is the current interval in days, due the
// day number it is next due (null for a card marked New), last the latest grade,
// prev the state before that answer (stored without its own prev, so it never nests),
// seen the day of the latest answer (missing on cards from before it was recorded).
// A card that has never been answered is simply undefined. Everything here is pure;
// the random source and "today" are passed in so tests can fix them.

export const DIRS = ['say', 'understand'];
export const NEW_PER_DAY = 15;
export const MASTERED_DAYS = 21;
export const REQUEUE_GAP = 4;
// New cards are drawn at random from this many of the most common unseen items, so the
// two directions get different words while beginners still meet useful ones first.
export const NEW_POOL = 60;
// An item answered in the other direction this recently is not offered as new here:
// it would still be fresh in memory.
export const HOLD_DAYS = 7;

// A day starts at 4 a.m., so a late-night session still counts as the same day.
export function dayOf(ms) {
  const d = new Date(ms - 4 * 3600e3);
  return Math.round(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 864e5);
}

// Spreads long intervals so cards learned together don't all fall due together.
export function fuzz(days, rand = Math.random) {
  if (days < 2) return days;
  const spread = Math.max(1, Math.round(days * 0.15));
  return Math.max(1, days + Math.floor(rand() * (2 * spread + 1)) - spread);
}

export const isNew = (card) => !card || card.last === 'new';
export const isKnown = (card) => !isNew(card) && card.ivl >= 1;
export const isMastered = (card) => !isNew(card) && card.ivl >= MASTERED_DAYS;

// The interval before fuzz; also the number on the answer button.
export function nextInterval(card, grade) {
  if (grade === 'forgot') return 0;
  const base = isNew(card) ? 0 : card.ivl;
  if (base === 0) return grade === 'easy' ? 3 : 1; // new, or starting over after Forgot
  const factor = grade === 'easy' ? 2.5 : 1.2;
  return Math.max(base + 1, Math.round(base * factor));
}

const stripped = (card) => (card ? { ivl: card.ivl, due: card.due, last: card.last, prev: null } : null);

export function answer(card, grade, today, rand = Math.random) {
  const ivl = grade === 'forgot' ? 0 : fuzz(nextInterval(card, grade), rand);
  return { ivl, due: today + ivl, last: grade, prev: stripped(card), seen: today };
}

// Replaces the last answer: the grade is applied to the state before it.
export function correct(card, grade, today, rand = Math.random) {
  const before = card && card.prev ? card.prev : undefined;
  if (grade === 'new') return { ivl: 0, due: null, last: 'new', prev: stripped(before) };
  return answer(before, grade, today, rand);
}

export function status(card, today) {
  if (isNew(card)) return { kind: 'new', days: 0 };
  const days = Math.max(0, card.due - today);
  if (days === 0) return { kind: 'due', days };
  return { kind: isMastered(card) ? 'mastered' : 'later', days };
}

function shuffle(list, rand) {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const seenWithin = (card, today, days) => card?.seen != null && today - card.seen < days;

// The keys new in this direction that may be offered today, in the given order:
// not answered in the other direction (`otherOf`) within HOLD_DAYS.
export function newCandidates(keys, cardOf, today, otherOf = () => undefined) {
  return keys.filter((k) => isNew(cardOf(k)) && !seenWithin(otherOf(k), today, HOLD_DAYS));
}

// Due cards oldest first (shuffled within a day, the sort is stable); those answered in the
// other direction today go last. Then new cards, at random from the first NEW_POOL candidates.
export function buildQueue(keys, cardOf, today, newLeft, rand = Math.random, otherOf = () => undefined) {
  const due = keys.filter((k) => {
    const c = cardOf(k);
    return !isNew(c) && c.due <= today;
  });
  const sorted = shuffle(due, rand).sort((x, y) => cardOf(x).due - cardOf(y).due);
  const fresh = (k) => !seenWithin(otherOf(k), today, 1);
  const reviews = [...sorted.filter(fresh), ...sorted.filter((k) => !fresh(k))];
  const pool = newCandidates(keys, cardOf, today, otherOf).slice(0, NEW_POOL);
  return [...reviews, ...shuffle(pool, rand).slice(0, Math.max(0, newLeft))];
}

export function requeue(queue, key) {
  const at = Math.min(REQUEUE_GAP, queue.length);
  return [...queue.slice(0, at), key, ...queue.slice(at)];
}

export const unqueue = (queue, key) => queue.filter((k) => k !== key);

// Daily dose of new cards. A stale or missing record counts as a fresh day.
function forToday(daily, today) {
  const fresh = { day: today, say: { used: 0, extra: 0 }, understand: { used: 0, extra: 0 } };
  if (!daily || daily.day !== today) return fresh;
  return { day: today, say: { ...daily.say }, understand: { ...daily.understand } };
}

export function doseLeft(daily, dir, today) {
  const d = forToday(daily, today)[dir];
  return NEW_PER_DAY + d.extra - d.used;
}

function change(daily, dir, today, fn) {
  const d = forToday(daily, today);
  d[dir] = fn(d[dir]);
  return d;
}

export const useDose = (daily, dir, today) => change(daily, dir, today, (x) => ({ ...x, used: x.used + 1 }));
export const addDose = (daily, dir, today) => change(daily, dir, today, (x) => ({ ...x, extra: x.extra + NEW_PER_DAY }));
export const giveBackDose = (daily, dir, today) => change(daily, dir, today, (x) => ({ ...x, used: Math.max(0, x.used - 1) }));

// One-time conversion of the old "learned" marks: known in both directions,
// spread over the next 1-21 days so they don't all come back at once.
export function migrateLearned(learned, today, rand = Math.random) {
  const out = {};
  for (const key of Object.keys(learned)) {
    const card = () => ({ ivl: 7, due: today + 1 + Math.floor(rand() * 21), last: 'easy', prev: null });
    out[key] = { say: card(), understand: card() };
  }
  return out;
}
