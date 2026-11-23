import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
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

// Runs sw.js's activate step with these cache names present; returns the names it deleted.
async function runActivate(names) {
  const handlers = {};
  const deleted = [];
  const context = {
    self: { addEventListener: (type, fn) => (handlers[type] = fn), skipWaiting: () => {}, clients: { claim: () => {} } },
    caches: { keys: async () => names, delete: async (k) => deleted.push(k) },
    Request: class {},
    location: { origin: 'https://example.test' },
  };
  vm.runInNewContext(readFileSync(new URL('../sw.js', import.meta.url), 'utf8'), context);
  let done;
  handlers.activate({ waitUntil: (p) => (done = p) });
  await done;
  return deleted;
}

test("activate deletes only this app's old caches", async () => {
  // Other apps on the same github.io origin (the Swedish app) keep their offline copies.
  const deleted = await runActivate(['turkish-v11', 'swedish-v1', 'turkish-v12', 'other']);
  assert.deepEqual(deleted.sort(), ['turkish-v11']);
});

test('install fetches every file fresh, never from the HTTP cache', async () => {
  const stored = await runInstall();
  assert.ok(stored.length > 10, 'caches the app files');
  for (const req of stored) {
    assert.equal(typeof req, 'object', `${req} should be a Request`);
    assert.equal(req.cache, 'reload', `${req.url} must bypass the HTTP cache`);
  }
});

test('every app module is in the offline cache', async () => {
  const urls = new Set((await runInstall()).map((req) => req.url));
  for (const dir of ['js', 'data']) {
    for (const file of readdirSync(new URL(`../${dir}/`, import.meta.url))) {
      assert.ok(urls.has(`${dir}/${file}`), `${dir}/${file} is missing from the offline cache`);
    }
  }
});
