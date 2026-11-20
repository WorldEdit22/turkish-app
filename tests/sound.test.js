import { test } from 'node:test';
import assert from 'node:assert/strict';
import { silentWav } from '../js/sound.js';

const ascii = (b, at) => String.fromCharCode(...b.slice(at, at + 4));
const u16 = (b, at) => b[at] | (b[at + 1] << 8);
const u32 = (b, at) => (b[at] | (b[at + 1] << 8) | (b[at + 2] << 16) | (b[at + 3] << 24)) >>> 0;

test('silentWav builds a valid 0.05 s silent WAV', () => {
  const b = silentWav();
  assert.equal(b.length, 444);
  assert.equal(ascii(b, 0), 'RIFF');
  assert.equal(u32(b, 4), 436, 'RIFF size = file size - 8');
  assert.equal(ascii(b, 8), 'WAVE');
  assert.equal(ascii(b, 12), 'fmt ');
  assert.equal(u32(b, 16), 16, 'PCM fmt chunk size');
  assert.equal(u16(b, 20), 1, 'PCM');
  assert.equal(u16(b, 22), 1, 'mono');
  assert.equal(u32(b, 24), 8000, 'sample rate');
  assert.equal(u32(b, 28), 8000, 'byte rate');
  assert.equal(u16(b, 32), 1, 'block align');
  assert.equal(u16(b, 34), 8, 'bits per sample');
  assert.equal(ascii(b, 36), 'data');
  assert.equal(u32(b, 40), 400, '0.05 s at 8 kHz');
  assert.ok(b.slice(44).every((x) => x === 128), '8-bit silence is 128');
});
