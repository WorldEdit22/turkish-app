import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseExamples, parsePage, parseExplanation, readPage, explainSentence } from '../js/ai.js';

// Replaces fetch with canned replies, one per call; returns the recorded calls.
function stubFetch(...replies) {
  const calls = [];
  globalThis.fetch = async (url, init) => {
    calls.push({ url, init, body: JSON.parse(init.body) });
    const r = replies[Math.min(calls.length, replies.length) - 1];
    return { ok: r.status === 200, status: r.status, json: async () => r.body };
  };
  return calls;
}
const gemini = (text) => ({ status: 200, body: { candidates: [{ content: { parts: [{ text }] } }] } });
const KEYS = { provider: 'groq', keys: { groq: 'g', gemini: 'k' }, models: {} };
const IMAGE = { data: 'QUJD', mimeType: 'image/jpeg' };
const PAGE = '{"paragraphs":[["Bugün hava güzel."]]}';

test('parseExamples reads the examples array', () => {
  const text = '{"examples":[{"tr":"Su istiyorum.","en":"I want water."}]}';
  assert.deepEqual(parseExamples(text), [{ tr: 'Su istiyorum.', en: 'I want water.' }]);
});

test('parseExamples tolerates code fences and chatter around the JSON', () => {
  const text = 'Sure!\n```json\n{"examples":[{"tr":"Eve gidiyorum.","en":"I\'m going home."}]}\n```\nEnjoy.';
  assert.deepEqual(parseExamples(text), [{ tr: 'Eve gidiyorum.', en: "I'm going home." }]);
});

test('parseExamples accepts a bare array', () => {
  assert.deepEqual(parseExamples('[{"tr":"Gel!","en":"Come!"}]'), [{ tr: 'Gel!', en: 'Come!' }]);
});

test('parseExamples drops malformed entries and trims text', () => {
  const text = '{"examples":[{"tr":"  Gel! ","en":" Come! "},{"tr":""},{"en":"x"},"nope",{"tr":5,"en":"y"}]}';
  assert.deepEqual(parseExamples(text), [{ tr: 'Gel!', en: 'Come!' }]);
});

test('parseExamples throws when there is nothing usable', () => {
  assert.throws(() => parseExamples('I cannot help with that.'), /could not read/i);
  assert.throws(() => parseExamples('{"examples":[]}'), /could not read/i);
});

// ---------- reading a page ----------

test('parsePage keeps paragraphs and sentences, trimming blanks', () => {
  const text = '```json\n{"paragraphs":[["Bugün hava güzel."," Parka gidelim. ",""],[]]}\n```';
  assert.deepEqual(parsePage(text), [['Bugün hava güzel.', 'Parka gidelim.']]);
});

test('parsePage returns no paragraphs when the photo has no Turkish text', () => {
  assert.deepEqual(parsePage('{"paragraphs":[]}'), []);
});

test('parsePage throws on a reply without paragraphs', () => {
  assert.throws(() => parsePage('Sorry, I cannot read that.'));
  assert.throws(() => parsePage('{"text":"Bugün"}'));
});

test('readPage sends the photo inline to Flash-Lite with the Gemini key', async () => {
  const calls = stubFetch(gemini(PAGE));
  const paragraphs = await readPage(KEYS, IMAGE, { retryMs: 0 });
  assert.deepEqual(paragraphs, [['Bugün hava güzel.']]);
  assert.equal(calls.length, 1);
  assert.match(calls[0].url, /models\/gemini-flash-lite-latest:generateContent$/);
  assert.equal(calls[0].init.headers['x-goog-api-key'], 'k');
  assert.deepEqual(calls[0].body.contents[0].parts[0], { inline_data: { mime_type: 'image/jpeg', data: 'QUJD' } });
});

test('scans need a Gemini key', async () => {
  const calls = stubFetch(gemini(PAGE));
  await assert.rejects(readPage({ provider: 'groq', keys: { groq: 'g' } }, IMAGE), { message: 'Add a free Gemini key in Settings to scan photos.' });
  assert.equal(calls.length, 0);
});

test('a 503 is retried once', async () => {
  let calls = stubFetch({ status: 503, body: {} }, gemini(PAGE));
  assert.deepEqual(await readPage(KEYS, IMAGE, { retryMs: 0 }), [['Bugün hava güzel.']]);
  assert.equal(calls.length, 2);
  calls = stubFetch({ status: 503, body: {} }, { status: 503, body: {} }, { status: 503, body: {} });
  await assert.rejects(readPage(KEYS, IMAGE, { retryMs: 0 }));
  assert.equal(calls.length, 2);
});

test("a 400 is not retried and shows Google's message", async () => {
  const calls = stubFetch({ status: 400, body: { error: { message: 'API key not valid.' } } });
  await assert.rejects(explainSentence(KEYS, 'Gel.', { retryMs: 0 }), /API key not valid\./);
  assert.equal(calls.length, 1);
});

test('a used-up daily limit says try again tomorrow', async () => {
  const calls = stubFetch({ status: 429, body: { error: { message: 'Quota exceeded' } } });
  await assert.rejects(readPage(KEYS, IMAGE, { retryMs: 0 }), { message: 'The free daily limit is used up. Try again tomorrow.' });
  assert.equal(calls.length, 1);
});

// ---------- explaining a sentence ----------

test('parseExplanation reads translation, structure and words', () => {
  const text =
    'Here:\n{"en":" We want to go to the park. ","structure":"Subject is hidden (biz).",' +
    '"words":[{"w":"Parka","base":"park","en":"to the park","parts":"park + -a (to)"},{"w":"gitmek"},{"base":"x"}]}';
  assert.deepEqual(parseExplanation(text), {
    en: 'We want to go to the park.',
    structure: 'Subject is hidden (biz).',
    words: [
      { w: 'Parka', base: 'park', en: 'to the park', parts: 'park + -a (to)' },
      { w: 'gitmek', base: '', en: '', parts: '' },
    ],
  });
});

test('parseExplanation throws without a translation', () => {
  assert.throws(() => parseExplanation('{"structure":"x","words":[]}'));
});

test('explainSentence asks Gemini about the sentence and returns the explanation', async () => {
  const calls = stubFetch(gemini('{"en":"Come.","structure":"A command.","words":[{"w":"Gel","base":"gelmek","en":"come","parts":"gel- (stem)"}]}'));
  const res = await explainSentence(KEYS, 'Gel.', { retryMs: 0 });
  assert.equal(res.en, 'Come.');
  assert.equal(res.words[0].base, 'gelmek');
  assert.match(calls[0].body.contents[0].parts.map((p) => p.text).join(' '), /Gel\./);
});
