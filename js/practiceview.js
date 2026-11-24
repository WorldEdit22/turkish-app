// HTML for the practice screen: one card (front, then the answer and the three
// grades), the "done for today" screen and the window's Practice section.
// Pure functions; everything is escaped. The caller wires the data-act buttons.

import { esc, SPEAKER } from './html.js';

const GRADES = { forgot: 'Forgot', hard: 'Hard', easy: 'Easy' };

export function intervalText(days) {
  if (days <= 0) return 'today';
  if (days === 1) return '1 day';
  if (days >= 60) return `~${Math.round(days / 30)} months`;
  return `~${days} days`;
}

const daysText = (n) => `${n} ${n === 1 ? 'day' : 'days'}`;

// st: { kind: 'new'|'due'|'later'|'mastered', days }
export function statusText(st) {
  if (st.kind === 'new') return 'New';
  if (st.kind === 'due') return 'Due today';
  if (st.kind === 'mastered') return `Mastered · next in ${daysText(st.days)}`;
  return `Next in ${daysText(st.days)}`;
}

export const countsText = (due, fresh) => `${due} due · ${fresh} new`;

export const PRACTICE_TITLE = 'Practice';

const speaker = (text) => `<button class="say" data-say="${esc(text)}" aria-label="Listen">${SPEAKER}</button>`;
const optional = (cls, text) => (text ? `<div class="${cls}">${esc(text)}</div>` : '');
// Target-language text with its speaker (`say` is what the speaker reads).
const targetLine = (text, say) => `<div class="pc-line"><span class="pc-target">${esc(text)}</span>${speaker(say)}</div>`;
const UNDO = '<button class="pc-undo" data-act="undo">↶ Undo</button>';

// face: { native, target, say, icon, hint, forms, note, variant, example }
//   icon is the word's topic icon (none on a pattern), shown in the card's corner.
//   variant is set only for a pattern; its front also shows the example, in the front's language.
// state: { dir: 'say'|'understand', revealed, previews: { forgot, hard, easy }, canUndo }
export function cardHtml(face, { dir, revealed, previews, canUndo }) {
  const icon = face.icon ? `<span class="pc-icon" aria-hidden="true">${esc(face.icon)}</span>` : '';
  const ex = face.example;
  const nativeLine = (text) => `<div class="pc-native">${esc(text)}</div>`;

  const frontEx =
    face.variant && ex
      ? `<div class="pc-front-ex">${dir === 'say' ? nativeLine(ex.native) : targetLine(ex.target, ex.target) + optional('pc-hint', ex.hint)}</div>`
      : '';
  const front = (dir === 'say' ? nativeLine(face.native) : targetLine(face.target, face.say) + optional('pc-hint', face.hint)) + frontEx;

  let back = '';
  if (revealed) {
    back =
      '<div class="pc-back">' +
      (dir === 'say' ? targetLine(face.target, face.say) + optional('pc-hint', face.hint) : nativeLine(face.native)) +
      optional('pc-forms', face.forms) +
      optional('pc-note', face.note) +
      (face.variant
        ? `<div class="pc-variant"><span class="pc-native">${esc(face.variant.native)}</span> <span class="pc-target">${esc(face.variant.target)}</span></div>`
        : '') +
      (ex ? `<div class="pc-ex">${targetLine(ex.target, ex.target)}${nativeLine(ex.native)}${optional('pc-hint', ex.hint)}</div>` : '') +
      '</div>';
  }

  // Only the button reveals, so a tap beside the speaker never does.
  const top = `<div class="pc-front">${front}${revealed ? '' : '<button class="pc-show" data-act="reveal">Show answer</button>'}</div>`;

  // Unrevealed, the row stays in the layout (hidden, inert) so Undo below doesn't move between cards.
  const grades =
    `<div class="grades${revealed ? '' : ' grades-hold'}"${revealed ? '' : ' aria-hidden="true"'}>` +
    Object.entries(GRADES)
      .map(
        ([g, label]) =>
          `<button class="grade ${g}"${revealed ? ` data-grade="${g}"` : ' disabled tabindex="-1"'}><span class="grade-label">${label}</span><span class="grade-ivl">${esc(intervalText(previews[g]))}</span></button>`,
      )
      .join('') +
    '</div>';

  return `<div class="pc">${icon}${top}${back}</div>${grades}${canUndo ? UNDO : ''}`;
}

// canUndo: the last answer can still be undone, also after the last card of the queue.
export function doneHtml({ newToday, canMore, nextIn, canUndo = false }) {
  return (
    '<div class="pc-done"><h2>Done for today 🎉</h2>' +
    `<p>${newToday} new ${newToday === 1 ? 'card' : 'cards'} today</p>` +
    (canMore
      ? '<button class="btn primary pc-more" data-act="more">More new cards</button>'
      : nextIn != null
        ? `<p>All caught up here. Next review in ${daysText(nextIn)}.</p>`
        : '') +
    '</div>' +
    (canUndo ? UNDO : '')
  );
}

// rows: [{ dir, label, st, last }]; last: 'forgot'|'hard'|'easy'|'new'|undefined (undefined = New).
export function recallHtml(rows) {
  const buttons = (dir, last) =>
    ['new', 'forgot', 'hard', 'easy']
      .map((g) => {
        const on = g === (last || 'new');
        return `<button${on ? ' class="on"' : ''} data-act="recall" data-dir="${esc(dir)}" data-grade="${g}">${g === 'new' ? 'New' : GRADES[g]}</button>`;
      })
      .join('');
  return (
    `<div class="recall"><div class="sub"><span>${PRACTICE_TITLE}</span></div>` +
    rows
      .map(
        (r) =>
          `<div class="recall-row"><div class="recall-head"><span>${esc(r.label)}</span><span class="recall-st">${esc(statusText(r.st))}</span></div>` +
          `<div class="recall-btns">${buttons(r.dir, r.last)}</div></div>`,
      )
      .join('') +
    '</div>'
  );
}
