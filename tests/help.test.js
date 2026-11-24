import { test } from 'node:test';
import assert from 'node:assert/strict';
import { HELP } from '../data/help.js';

const IDS = ['practice', 'browse', 'windows', 'search', 'translate', 'book', 'ai', 'settings', 'routine'];

test('the help has an intro and the topics in order', () => {
  assert.ok(typeof HELP.intro === 'string' && HELP.intro.length > 10);
  assert.deepEqual(HELP.sections.map((s) => s.id), IDS);
});

test('every topic has an icon, title, sub and 2 to 6 short lines, and no examples', () => {
  for (const s of HELP.sections) {
    for (const k of ['id', 'icon', 'title', 'sub']) assert.ok(typeof s[k] === 'string' && s[k], `${s.id}: ${k}`);
    assert.ok(Array.isArray(s.blocks) && s.blocks.length > 0, `${s.id}: blocks`);
    assert.ok(!s.blocks.some((b) => b.ex), `${s.id}: no ex block`);
    const lines = s.blocks.reduce((n, b) => n + (b.list ? b.list.length : 1), 0);
    assert.ok(lines >= 2 && lines <= 6, `${s.id}: ${lines} lines`);
    for (const b of s.blocks) assert.ok(['p', 'list', 'tip'].some((k) => k in b), `${s.id}: block kind`);
  }
});
