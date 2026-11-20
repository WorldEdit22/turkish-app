import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

// Runs sw.js against a minimal stand-in for the browser's service worker
// globals and returns what its install step put in the cache.
async function runInstall() {
  const handlers = {};
  let stored = null;
  const context = {
    self: { addEventListener: (type, fn) => (handlers[type] = fn), skipWaiting: () => {}, clients: { claim: () => {} } },
    caches: { open: async () => ({ addAll: async (reqs) => (stored = reqs) }) },
    Request: class {
      constructor(url, init = {}) {
        this.url = url;
        this.cache = init.cache || 'default';
      }
    },
    location: { origin: 'https://example.test' },
  };
  vm.runInNewContext(readFileSync(new URL('../sw.js', import.meta.url), 'utf8'), context);
  let done;
  handlers.install({ waitUntil: (p) => (done = p) });
  await done;
  return stored;
}

test('install fetches every file fresh, never from the HTTP cache', async () => {
  const stored = await runInstall();
  assert.ok(stored.length > 10, 'caches the app files');
  for (const req of stored) {
    assert.equal(typeof req, 'object', `${req} should be a Request`);
    assert.equal(req.cache, 'reload', `${req.url} must bypass the HTTP cache`);
  }
});
