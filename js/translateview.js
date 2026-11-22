// The translator window's HTML. state = { text, from: 'tr' | 'en', result, error }.
// The text box and the result are drawn separately, so typing never redraws the box.

import { esc, SPEAKER } from './html.js';
import { MAX_CHARS, other, googleLink } from './translate.js';

const NAMES = { tr: 'Turkish', en: 'English' };

export function resultHtml({ from, result, error }) {
  if (error) return `<p class="tr-msg err">${esc(error)}</p>`;
  if (!result) return '<p class="tr-msg">Translation</p>';
  const to = other(from);
  return (
    `<p class="tr-text" lang="${to}">${esc(result)}</p>` +
    (to === 'tr' ? `<button class="say" data-say="${esc(result)}" aria-label="Listen">${SPEAKER}</button>` : '')
  );
}

export function translatorHtml(state) {
  const { text, from } = state;
  return (
    `<div class="s-top"><div class="grabber"></div>` +
    `<div class="s-head"><h2>Translate</h2><button class="close" data-act="close" aria-label="Close">✕</button></div></div>` +
    `<div class="tr-langs"><span class="tr-lang">${NAMES[from]}</span>` +
    `<button class="tr-swap" data-act="swap" aria-label="Swap languages">⇄</button>` +
    `<span class="tr-lang">${NAMES[other(from)]}</span></div>` +
    `<div class="tr-box">` +
    `<textarea id="tr-input" maxlength="${MAX_CHARS}" autocorrect="off" autocapitalize="sentences" spellcheck="false" lang="${from}" placeholder="Type in ${NAMES[from]}">${esc(text)}</textarea>` +
    `<div class="tr-tools"><button class="tr-clear" data-act="clear" aria-label="Clear text">✕</button>` +
    (from === 'tr' ? `<button class="say" data-act="say-text" aria-label="Listen">${SPEAKER}</button>` : '') +
    `</div></div>` +
    `<div id="tr-result" class="tr-out" aria-live="polite">${resultHtml(state)}</div>` +
    `<a id="tr-link" class="tr-link" href="${esc(googleLink(text, from))}" target="_blank" rel="noopener">Open in Google Translate</a>`
  );
}
