import { test } from 'node:test';
import assert from 'node:assert/strict';
import { scanTitle, scanDate, sentencesOf, scansListHtml, scanHtml, sentenceHtml } from '../js/scanview.js';

const scan = (paragraphs, o = {}) => ({ id: 's1', date: '2026-11-21T10:00:00.000Z', paragraphs, ...o });
const EVIL = '<img src=x onerror=alert(1)> & "q"';

test('AI text is escaped everywhere', () => {
  const s = scan([[EVIL]]);
  const data = { en: '<i>en</i>', structure: '<script>x</script>', words: [{ w: '<w>', base: '<base>', en: '<b>', parts: '<u>' }] };
  const html = scanHtml(s, () => false) + sentenceHtml(EVIL, data, null) + scansListHtml([s], { hasKey: true, status: { error: '<e>' } });
  assert.ok(html.includes('&lt;img src=x onerror=alert(1)&gt; &amp; &quot;q&quot;'));
  for (const tag of ['<img', '<i>', '<script>', '<w>', '<base>', '<b>', '<u>', '<e>']) assert.ok(!html.includes(tag), `${tag} must be escaped`);
  assert.ok(html.includes('&lt;b&gt;'));
});

test('explained sentences are marked', () => {
  const html = scanHtml(scan([['Bir.', 'İki.']]), (s) => s === 'Bir.');
  assert.match(html, /class="sent done"[^>]*>Bir\./);
  assert.match(html, /class="sent"[^>]*>İki\./);
});

test('sentence numbers run across paragraphs', () => {
  const s = scan([['A.', 'B.'], ['C.']]);
  const html = scanHtml(s, () => false);
  assert.deepEqual([...html.matchAll(/data-si="(\d+)"[^>]*>([^<]*)</g)].map((m) => [m[1], m[2]]), [['0', 'A.'], ['1', 'B.'], ['2', 'C.']]);
  assert.equal((html.match(/<p>/g) || []).length, 2, 'one paragraph each');
  assert.deepEqual(sentencesOf(s), ['A.', 'B.', 'C.']);
});

test('without a Gemini key the list offers Settings instead of the photo button', () => {
  const none = scansListHtml([], { hasKey: false, status: null });
  assert.ok(none.includes('data-act="setup"'));
  assert.ok(!none.includes('type="file"'));
  const withKey = scansListHtml([], { hasKey: true, status: null });
  assert.ok(withKey.includes('type="file"') && withKey.includes('accept="image/*"') && !withKey.includes('capture'));
  assert.ok(withKey.includes('Photos are sent to Google Gemini to read the text.'));
});

test('the list shows reading, empty and error states, and every saved scan', () => {
  assert.ok(scansListHtml([], { hasKey: true, status: 'reading' }).includes('Reading the page…'));
  assert.ok(scansListHtml([], { hasKey: true, status: 'empty' }).includes('No Turkish text found in this photo.'));
  const err = scansListHtml([], { hasKey: true, status: { error: 'Boom.' } });
  assert.ok(err.includes('Boom.') && err.includes('data-act="retry-read"'));
  const list = scansListHtml([scan([['Bir.']], { id: 'a' }), scan([['İki.']], { id: 'b' })], { hasKey: true, status: null });
  assert.equal((list.match(/data-act="open-scan"/g) || []).length, 2);
  assert.ok(list.includes('data-act="delete-scan" data-id="b"'));
});

test('a sentence shows translation, structure and every word, or its loading and error states', () => {
  const data = { en: 'We want to go.', structure: 'Hidden subject.', words: [{ w: 'Gitmek', base: 'gitmek', en: 'to go', parts: 'git- + -mek' }] };
  const html = sentenceHtml('Gitmek istiyoruz.', data, null);
  for (const text of ['We want to go.', 'Structure', 'Hidden subject.', 'Words', 'Gitmek', 'to go', 'git- + -mek']) assert.ok(html.includes(text), text);
  assert.ok(html.includes('data-say="Gitmek istiyoruz."'));
  assert.ok(sentenceHtml('Gel.', undefined, 'loading').includes('Explaining…'));
  const err = sentenceHtml('Gel.', undefined, { error: 'Nope.' });
  assert.ok(err.includes('Nope.') && err.includes('data-act="retry-explain"'));
});

test('scanTitle shortens a long first sentence', () => {
  assert.equal(scanTitle(scan([['Bugün hava çok güzel ve biz parka gidiyoruz.']])), 'Bugün hava çok güzel ve biz…');
  assert.equal(scanTitle(scan([['Merhaba!']])), 'Merhaba!');
  assert.equal(scanDate('2026-11-21T10:00:00.000Z'), '21 Nov');
});
