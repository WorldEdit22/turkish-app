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

test('the alphabet window has the same window styles as the others', () => {
  assert.ok(/dialog#sheet, dialog#translator, dialog#alphabet \{/.test(css), 'the window rule names #alphabet');
  assert.ok(/dialog#alphabet::backdrop/.test(css), 'the backdrop rule names #alphabet');
});

test('the progress text gives way, so the top row never pushes the gear off screen', () => {
  const p = rule(css, '.progress');
  for (const d of ['min-width: 0', 'overflow: hidden', 'text-overflow: ellipsis']) assert.ok(p.includes(d), d);
});

test('the page itself never rubber-bands, also when a drag starts on a bar', () => {
  assert.ok(rule(css, 'html').includes('overscroll-behavior: none'));
});

test('practice hides the search row; the answer colours have light and dark values', () => {
  assert.ok(rule(css, '.search-row[hidden]').includes('display: none'), '.search-row sets display, so hidden needs its own rule');
  for (const token of ['--forgot', '--hard', '--easy', '--on-grade']) assert.equal(css.split(`${token}: #`).length - 1, 2, token);
});

// The Browse/Practice switch must not move when toggling: it comes first (the search row,
// shown only in Browse, sits below it), and the sort menu and the direction button beside it
// take the same width, so the switch keeps its size.
test('the mode switch stays put when toggling', () => {
  const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  assert.ok(html.indexOf('id="mode"') < html.indexOf('class="search-row"'), 'the switch comes before the search row');
  for (const sel of ['select#sort', '.dir-btn']) assert.ok(rule(css, sel).includes('flex: 0 0 42%'), sel);
});

test('the Show answer button is large; the topic icon sits in the card corner', () => {
  const show = rule(css, '.pc-show');
  for (const d of ['min-height: 52px', 'font-size: 18px']) assert.ok(show.includes(d), d);
  assert.ok(rule(css, '.pc-icon').includes('position: absolute'));
});

test('the bars sit outside the scrolling area', () => {
  assert.ok(!rule(css, '.tabs').includes('position: fixed'));
  assert.ok(!rule(css, '.top').includes('position: sticky'));
});
