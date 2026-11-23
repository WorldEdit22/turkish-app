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

// face: { native, target, say, dot, icon, hint, forms, note, variant, example }
// state: { dir: 'say'|'understand', revealed, previews: { forgot, hard, easy }, canUndo }
export function cardHtml(face, { dir, revealed, previews, canUndo }) {
  const meta =
    face.dot || face.icon
      ? `<div class="pc-meta">${face.dot ? `<span class="dot t-${esc(face.dot)}"></span>` : ''}${face.icon ? `<span class="pc-icon">${esc(face.icon)}</span>` : ''}</div>`
      : '';
  const targetLine = (text) => `<div class="pc-line"><span class="pc-target">${esc(text)}</span>${speaker(face.say)}</div>`;

  const front =
    dir === 'say'
      ? `<div class="pc-native">${esc(face.native)}</div>`
      : targetLine(face.target) + optional('pc-hint', face.hint);

  let back = '';
  if (revealed) {
    back =
      '<div class="pc-back">' +
      (dir === 'say'
        ? targetLine(face.target) + optional('pc-hint', face.hint)
        : `<div class="pc-native">${esc(face.native)}</div>`) +
      optional('pc-forms', face.forms) +
      optional('pc-note', face.note) +
      (face.variant
        ? `<div class="pc-variant"><span class="pc-native">${esc(face.variant.native)}</span> <span class="pc-target">${esc(face.variant.target)}</span></div>`
        : '') +
      (face.example
        ? `<div class="pc-ex"><div class="pc-line"><span class="pc-target">${esc(face.example.target)}</span>${speaker(face.example.target)}</div>` +
          `<div class="pc-native">${esc(face.example.native)}</div>${optional('pc-hint', face.example.hint)}</div>`
        : '') +
      '</div>';
  }

  const top = `<div class="pc-front"${revealed ? '' : ' data-act="reveal"'}>${meta}${front}${revealed ? '' : '<div class="pc-show">Show answer</div>'}</div>`;

  const grades = revealed
    ? '<div class="grades">' +
      Object.entries(GRADES)
        .map(
          ([g, label]) =>
            `<button class="grade ${g}" data-grade="${g}"><span class="grade-label">${label}</span><span class="grade-ivl">${esc(intervalText(previews[g]))}</span></button>`,
        )
        .join('') +
      '</div>'
    : '';

  const undo = canUndo ? '<button class="pc-undo" data-act="undo">↶ Undo</button>' : '';
  return `<div class="pc">${top}${back}</div>${grades}${undo}`;
}

export function doneHtml({ newToday, canMore, nextIn }) {
  return (
    '<div class="pc-done"><h2>Done for today 🎉</h2>' +
    `<p>${newToday} new ${newToday === 1 ? 'card' : 'cards'} today</p>` +
    (canMore
      ? '<button class="btn primary pc-more" data-act="more">More new cards</button>'
      : nextIn != null
        ? `<p>All caught up here. Next review in ${daysText(nextIn)}.</p>`
        : '') +
    '</div>'
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
