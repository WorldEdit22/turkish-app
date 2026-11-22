import { test } from 'node:test';
import assert from 'node:assert/strict';
import { translatorHtml, resultHtml } from '../js/translateview.js';
import { googleLink } from '../js/translate.js';
import { esc } from '../js/html.js';

const state = (o = {}) => ({ text: '', from: 'tr', result: '', error: null, ...o });
const EVIL = '<img src=x onerror=alert(1)> & "q"';

test("Google's text and yours are escaped", () => {
  const html = translatorHtml(state({ text: EVIL, result: EVIL })) + translatorHtml(state({ text: EVIL, result: EVIL, from: 'en' }));
  assert.ok(!html.includes('<img'), 'no raw tag');
  assert.ok(!html.includes('onerror=alert(1)>'), 'no raw attribute');
  const escaped = esc(EVIL);
  assert.ok(html.includes(`>${escaped}</textarea>`), 'text box holds the escaped text');
  assert.ok(html.includes(`>${escaped}</p>`), 'result holds the escaped text');
  assert.ok(html.includes(`data-say="${escaped}"`), 'speaker value is escaped');
});

test('Turkish to English', () => {
  const html = translatorHtml(state({ text: 'Gel', result: 'Come' }));
  assert.match(html, /<h2>Translate<\/h2>/);
  assert.match(html, /Turkish<\/span>\s*<button class="tr-swap" data-act="swap" aria-label="Swap languages">⇄<\/button>\s*<span[^>]*>English/);
  assert.match(html, /placeholder="Type in Turkish"/);
  assert.match(html, /lang="tr"/);
  assert.match(html, /data-act="say-text" aria-label="Listen"/);
  assert.ok(!html.includes('data-say'), 'English result has no speaker');
  assert.match(html, /<p class="tr-text" lang="en">Come<\/p>/);
});

test('English to Turkish', () => {
  const html = translatorHtml(state({ from: 'en', text: 'A coffee please.', result: 'Bir kahve lütfen.' }));
  assert.match(html, /English<\/span>\s*<button class="tr-swap"[^>]*>⇄<\/button>\s*<span[^>]*>Turkish/);
  assert.match(html, /placeholder="Type in English"/);
  assert.ok(!html.includes('say-text'), 'no speaker on English text');
  assert.match(html, /<p class="tr-text" lang="tr">Bir kahve lütfen\.<\/p>/);
  assert.match(html, /data-say="Bir kahve lütfen\." aria-label="Listen"/);
});

test('the text box does not autocorrect and holds at most 1000 characters', () => {
  const box = translatorHtml(state()).match(/<textarea[^>]*>/)[0];
  assert.match(box, /id="tr-input"/);
  assert.match(box, /autocorrect="off"/);
  assert.match(box, /spellcheck="false"/);
  assert.match(box, /maxlength="1000"/);
  assert.match(translatorHtml(state()), /data-act="clear" aria-label="Clear text"/);
  assert.match(translatorHtml(state()), /<button class="close" data-act="close" aria-label="Close">✕<\/button>/);
});

test('the result area shows the placeholder, the error, or the translation', () => {
  assert.equal(resultHtml(state()), '<p class="tr-msg">Translation</p>');
  assert.equal(resultHtml(state({ result: 'old', error: 'No connection.' })), '<p class="tr-msg err">No connection.</p>');
  assert.equal(resultHtml(state({ result: 'Come' })), '<p class="tr-text" lang="en">Come</p>');
  assert.match(translatorHtml(state({ result: 'Come' })), /<div id="tr-result" class="tr-out" aria-live="polite"><p class="tr-text" lang="en">Come<\/p><\/div>/);
});

test('the Google link follows the text and direction', () => {
  const html = translatorHtml(state({ from: 'en', text: 'Tea & milk' }));
  const href = esc(googleLink('Tea & milk', 'en'));
  assert.ok(href.includes('&amp;'));
  assert.ok(html.includes(`<a id="tr-link" class="tr-link" href="${href}" target="_blank" rel="noopener">Open in Google Translate</a>`));
});
