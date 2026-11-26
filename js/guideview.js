// HTML for the grammar book and the help: a list of sections, and one section
// page made of blocks. Pure functions; everything is escaped. In any text,
// *x* shows as bold, and the speaker uses the text without the stars.

import { esc, SPEAKER } from './html.js';

// Escape first, then turn *x* into <b>x</b>.
export const inline = (text) => esc(text).replace(/\*([^*]+)\*/g, '<b>$1</b>');

// The text as it is spoken: no marks.
export const plain = (text) => String(text).replaceAll('*', '');

const top = (title, back) =>
  `<div class="s-top"><div class="grabber"></div><div class="s-head">` +
  (back ? `<button class="back" data-act="back" aria-label="Back">‹</button>` : '') +
  `<h2>${esc(title)}</h2><button class="close" data-act="close" aria-label="Close">✕</button></div></div>`;

export function guideListHtml({ title, intro, sections }) {
  const rows = sections
    .map(
      (s, i) =>
        (s.chapter && s.chapter !== sections[i - 1]?.chapter ? `<h3 class="gd-chapter">${esc(s.chapter)}</h3>` : '') +
        `<button class="gd-row" data-act="open-section" data-id="${esc(s.id)}">` +
        `<span class="gd-icon">${esc(s.icon)}</span>` +
        `<span class="gd-text"><span class="gd-title">${esc(s.title)}</span><span class="gd-sub">${esc(s.sub)}</span></span>` +
        `<span class="gd-go">›</span></button>`,
    )
    .join('');
  return top(title, false) + (intro ? `<p class="gd-intro">${inline(intro)}</p>` : '') + rows;
}

function exampleHtml(target, native) {
  const text = plain(target);
  return (
    `<div class="ex"><button class="say" data-say="${esc(text)}" aria-label="Listen">${SPEAKER}</button>` +
    `<div><div class="ex-tr">${inline(target)}</div><div class="ex-en">${inline(native)}</div></div></div>`
  );
}

const cells = (tag, row) => row.map((c) => `<${tag}>${inline(c)}</${tag}>`).join('');

function blockHtml(block, alphabet) {
  if (block.p !== undefined) return `<p class="gd-p">${inline(block.p)}</p>`;
  if (block.list) return `<ul class="gd-list">${block.list.map((i) => `<li>${inline(i)}</li>`).join('')}</ul>`;
  if (block.table) {
    const { head, rows } = block.table;
    return (
      `<table class="gd-table">` +
      (head ? `<thead><tr>${cells('th', head)}</tr></thead>` : '') +
      `<tbody>${rows.map((r) => `<tr>${cells('td', r)}</tr>`).join('')}</tbody></table>`
    );
  }
  if (block.ex) return block.ex.map(([t, n]) => exampleHtml(t, n)).join('');
  if (block.tip !== undefined) return `<p class="gd-tip">${inline(block.tip)}</p>`;
  if (block.alphabet) return alphabet || '';
  return '';
}

// alphabet: the HTML for an { alphabet: true } block. The caller's `hint` option is ignored: this app shows no pronunciation hints.
// next: { id, title } of the section to go on to, or null for no Next button.
export function guideSectionHtml(section, { alphabet = '', next = null } = {}) {
  return (
    top(section.title, true) +
    section.blocks.map((b) => blockHtml(b, alphabet)).join('') +
    (next ? `<button class="gd-next" data-act="next" data-id="${esc(next.id)}">Next: ${esc(next.title)} ›</button>` : '')
  );
}
