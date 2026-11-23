import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

// Layout rules that iOS behaviour depends on but no test can render.
const css = readFileSync(new URL('../css/app.css', import.meta.url), 'utf8');

// The declarations of the rule whose selector starts a line, e.g. rule(css, 'main').
function rule(text, selector) {
  const quoted = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const m = text.match(new RegExp(`^${quoted} \\{([^}]*)\\}`, 'm'));
  assert.ok(m, `no rule for ${selector}`);
  return m[1];
}

// iOS draws the page's scroll line over the whole screen. With only main scrolling,
// it stays between the bars (and a window's text box keeps its caret: WebKit 300690).
test('the page is a column that does not scroll; only main scrolls', () => {
  const body = rule(css, 'body');
  for (const d of ['display: flex', 'flex-direction: column', 'overflow: hidden', 'height: 100dvh']) assert.ok(body.includes(d), d);
  const main = rule(css, 'main');
  for (const d of ['flex: 1', 'min-height: 0', 'overflow-y: auto']) assert.ok(main.includes(d), d);
});

test('the bars sit outside the scrolling area', () => {
  assert.ok(!rule(css, '.tabs').includes('position: fixed'));
  assert.ok(!rule(css, '.top').includes('position: sticky'));
});
