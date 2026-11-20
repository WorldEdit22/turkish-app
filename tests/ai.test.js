import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseExamples } from '../js/ai.js';

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
