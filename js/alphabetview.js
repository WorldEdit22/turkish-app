// The alphabet window's HTML: every letter with its Turkish name, its sound in English
// terms and an example word, then the tricky letters. Built like the Swedish app's
// alphabet window; Turkish is written as it is said, so there are no pronunciation hints.

import { esc, SPEAKER } from './html.js';

const say = (text) => `<button class="say" data-say="${esc(text)}" aria-label="Listen">${SPEAKER}</button>`;

function exampleHtml(tr, en) {
  return (
    `<div class="abc-ex"><span class="abc-word" lang="tr">${esc(tr)}</span>` +
    `<div class="abc-meaning">${esc(en)}</div></div>${say(tr)}`
  );
}

export function alphabetHtml(letters, tricky) {
  const rows = letters
    .map(
      (l) =>
        `<div class="abc-row">` +
        // The letter's name, not the letter: a voice reads a lone capital as "capital …".
        `<button class="abc-letter" data-say="${esc(l.name)}" lang="tr" aria-label="${esc(`Listen: ${l.ch}`)}">${esc(l.ch)} ${esc(l.ch.toLocaleLowerCase('tr'))}</button>` +
        `<div class="abc-info"><div class="abc-name" lang="tr">${esc(l.name)}</div><div class="abc-sound">${esc(l.sound)}</div></div>` +
        exampleHtml(l.ex[0], l.ex[1]) +
        `</div>`,
    )
    .join('');
  const hard = tricky
    .map(
      (t) =>
        `<div class="abc-combo"><div class="abc-combo-title">${esc(t.title)}</div><p class="abc-sound">${esc(t.sound)}</p>` +
        t.ex.map(([tr, en]) => `<div class="abc-combo-ex">${exampleHtml(tr, en)}</div>`).join('') +
        `</div>`,
    )
    .join('');
  return (
    `<div class="s-top"><div class="grabber"></div>` +
    `<div class="s-head"><h2>Turkish alphabet</h2><button class="close" data-act="close" aria-label="Close">✕</button></div></div>` +
    `<p class="note">Every letter is always said the same way, and every letter is said, except ğ.</p>` +
    `<div class="abc-list">${rows}</div>` +
    `<h3 class="abc-head">Tricky letters</h3>${hard}`
  );
}
