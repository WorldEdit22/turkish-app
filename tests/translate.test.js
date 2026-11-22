import { test } from 'node:test';
import assert from 'node:assert/strict';
import { MAX_CHARS, other, translateUrl, googleLink, parseTranslation, translate, swapState, OFFLINE, FAILED } from '../js/translate.js';

// Replaces fetch with canned replies, one per call; returns the requested URLs.
// A reply is { status, body } or an Error to reject with.
function stubFetch(...replies) {
  const urls = [];
  globalThis.fetch = async (url) => {
    urls.push(url);
    const r = replies[Math.min(urls.length, replies.length) - 1];
    if (r instanceof Error) throw r;
    return { ok: r.status === 200, status: r.status, json: async () => r.body };
  };
  return urls;
}

// Google's reply for "Yarın eve gideceğim. Gelir misin?" (checked 2026-11-22).
const REPLY = [[['I will go home tomorrow. ', 'Yarın eve gideceğim. ', null, null, 3], ['Will you come?', 'Gelir misin?', null, null, 3]], null, 'tr'];

test('the endpoint URL carries both directions and the encoded text', () => {
  assert.equal(translateUrl('Gelir misin?', 'tr'), 'https://translate.googleapis.com/translate_a/single?client=gtx&sl=tr&tl=en&dt=t&q=Gelir%20misin%3F');
  assert.match(translateUrl('Hi', 'en'), /sl=en&tl=tr/);
  assert.equal(other('tr'), 'en');
  assert.equal(other('en'), 'tr');
});

test('the Google Translate link opens the same text and direction', () => {
  assert.equal(googleLink('Çay', 'tr'), 'https://translate.google.com/?sl=tr&tl=en&text=%C3%87ay&op=translate');
  assert.equal(googleLink('Tea', 'en'), 'https://translate.google.com/?sl=en&tl=tr&text=Tea&op=translate');
});

test('segments are joined into one translation', () => {
  assert.equal(parseTranslation(REPLY), 'I will go home tomorrow. Will you come?');
});

test('an unexpected reply is a failure', () => {
  for (const odd of [{}, [], [null], null]) assert.throws(() => parseTranslation(odd), { message: FAILED });
});

test('translate asks once and returns the text', async () => {
  const urls = stubFetch({ status: 200, body: REPLY });
  assert.equal(await translate(' Yarın eve gideceğim. Gelir misin? ', 'tr'), 'I will go home tomorrow. Will you come?');
  assert.deepEqual(urls, [translateUrl('Yarın eve gideceğim. Gelir misin?', 'tr')]);
});

test('blank text is not sent', async () => {
  const urls = stubFetch({ status: 200, body: REPLY });
  assert.equal(await translate('  ', 'tr'), '');
  assert.equal(urls.length, 0);
});

test('at most 1000 characters are sent', async () => {
  const urls = stubFetch({ status: 200, body: REPLY });
  await translate('a'.repeat(1500), 'en');
  assert.equal(MAX_CHARS, 1000);
  assert.equal(new URL(urls[0]).searchParams.get('q'), 'a'.repeat(1000));
});

test('a failed request says so', async (t) => {
  const real = Object.getOwnPropertyDescriptor(globalThis, 'navigator');
  t.after(() => Object.defineProperty(globalThis, 'navigator', real));

  stubFetch({ status: 500, body: {} });
  await assert.rejects(translate('Gel', 'tr'), { message: FAILED });

  stubFetch({ status: 200, body: { error: 'nope' } });
  await assert.rejects(translate('Gel', 'tr'), { message: FAILED });

  stubFetch(new TypeError('Failed to fetch'));
  Object.defineProperty(globalThis, 'navigator', { value: { onLine: false }, configurable: true });
  await assert.rejects(translate('Gel', 'tr'), { message: OFFLINE });

  Object.defineProperty(globalThis, 'navigator', { value: { onLine: true }, configurable: true });
  await assert.rejects(translate('Gel', 'tr'), { message: FAILED });
});

test('swap moves the translation into the box only when it belongs to the text', () => {
  const done = { text: 'Gel', from: 'tr', result: 'Come', resultFor: 'Gel', error: null };
  assert.deepEqual(swapState(done), { text: 'Come', from: 'en', result: '', resultFor: '', error: null });
  assert.equal(swapState({ ...done, text: 'Gel ' }).text, 'Come', 'a trailing space is the same text');
  // The newer request failed: the old translation is not on screen, so the typed text stays.
  assert.equal(swapState({ ...done, text: 'Gel buraya', error: FAILED }).text, 'Gel buraya');
  assert.equal(swapState({ ...done, error: OFFLINE }).text, 'Gel');
  // Edited, and the new answer has not arrived yet.
  assert.equal(swapState({ ...done, text: 'Gel buraya' }).text, 'Gel buraya');
  // Nothing translated yet.
  assert.deepEqual(swapState({ text: 'Su', from: 'en', result: '', resultFor: '', error: null }), { text: 'Su', from: 'tr', result: '', resultFor: '', error: null });
});

test('the two messages are the agreed copy', () => {
  assert.equal(OFFLINE, 'No connection. Translating needs the internet.');
  assert.equal(FAILED, "Couldn't translate right now. Try again, or open Google Translate below.");
});
