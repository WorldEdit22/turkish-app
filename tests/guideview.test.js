import { test } from 'node:test';
import assert from 'node:assert/strict';
import { inline, plain, guideListHtml, guideSectionHtml } from '../js/guideview.js';

const count = (html, s) => html.split(s).length - 1;

test('inline escapes and bolds *marked* parts', () => {
  assert.equal(inline('ev*e* <b>'), 'ev<b>e</b> &lt;b&gt;');
  assert.equal(plain('ev*e*'), 'eve');
});

test('the list shows every section as a row that opens it', () => {
  const sections = [
    { id: 'a', icon: '1', title: 'Alpha', sub: 'first sub', blocks: [] },
    { id: 'b', icon: '2', title: 'Beta', sub: 'second sub', blocks: [] },
    { id: 'c', icon: '3', title: 'Gamma', sub: 'third sub', blocks: [] },
  ];
  const html = guideListHtml({ title: 'The Book', intro: 'Read me', sections });
  assert.equal(count(html, 'data-act="open-section"'), 3);
  for (const s of sections) {
    assert.ok(html.includes(`data-id="${s.id}"`));
    assert.ok(html.includes(s.title));
    assert.ok(html.includes(s.sub));
  }
  assert.ok(html.includes('The Book'));
  assert.ok(html.includes('<p class="gd-intro">Read me</p>'));
  assert.ok(html.includes('data-act="close"'));
  assert.ok(html.includes('s-top'));
});

test('the list shows a heading where the chapter changes, and none without chapters', () => {
  const s = (id, chapter) => ({ id, chapter, icon: 'x', title: id, sub: 's', blocks: [] });
  const html = guideListHtml({ title: 'B', sections: [s('a', 'One'), s('b', 'One'), s('c', 'Two & more')] });
  assert.equal(html.split('class="gd-chapter"').length - 1, 2);
  const at = (t) => html.indexOf(t);
  assert.ok(at('<h3 class="gd-chapter">One</h3>') < at('data-id="a"'));
  assert.ok(at('data-id="b"') < at('<h3 class="gd-chapter">Two &amp; more</h3>') && at('<h3 class="gd-chapter">Two &amp; more</h3>') < at('data-id="c"'));
  assert.ok(!guideListHtml({ title: 'H', sections: [{ id: 'a', icon: 'x', title: 'a', sub: 's', blocks: [] }] }).includes('gd-chapter'));
});

test('a section page can end with a Next button to the next section', () => {
  const sec = { id: 'a', icon: 'x', title: 'A', sub: 's', blocks: [{ p: 'Hi' }] };
  const html = guideSectionHtml(sec, { alphabet: '', next: { id: 'b"', title: 'Two & more' } });
  assert.ok(html.endsWith('<button class="gd-next" data-act="next" data-id="b&quot;">Next: Two &amp; more ›</button>'));
  assert.ok(!guideSectionHtml(sec, { alphabet: '' }).includes('gd-next'));
});

test('the list has no intro paragraph without an intro', () => {
  assert.ok(!guideListHtml({ title: 'T', sections: [] }).includes('gd-intro'));
});

const full = (head) => ({
  id: 'x',
  icon: 'i',
  title: 'Sec',
  sub: 's',
  blocks: [
    { p: 'para' },
    { list: ['one', 'two'] },
    { table: { head, rows: [['a', 'b']] } },
    { ex: [['Ev', 'House']] },
    { tip: 'careful' },
    { alphabet: true },
  ],
});

test('a section page has back, title and close, then its blocks', () => {
  const html = guideSectionHtml(full(['H1', 'H2']), { hint: null, alphabet: '<div id="abc"></div>' });
  assert.ok(html.includes('data-act="back"'));
  assert.ok(html.includes('<h2>Sec</h2>'));
  assert.ok(html.includes('data-act="close"'));
  assert.equal(count(html, 'class="gd-p"'), 1);
  assert.equal(count(html, 'class="gd-list"'), 1);
  assert.equal(count(html, 'class="gd-table"'), 1);
  assert.equal(count(html, '<thead>'), 1);
  assert.equal(count(html, 'class="gd-tip"'), 1);
  assert.equal(count(html, '<div id="abc"></div>'), 1);
});

test('a table without head has no thead', () => {
  const html = guideSectionHtml(full(null), { hint: null, alphabet: '' });
  assert.equal(count(html, '<thead>'), 0);
  assert.equal(count(html, 'class="gd-table"'), 1);
});

test('an example speaks the plain text and shows the bold', () => {
  const sec = { id: 'x', title: 'S', blocks: [{ ex: [['Ev*e* gidiyorum.', 'I am going *home*.']] }] };
  const html = guideSectionHtml(sec, { hint: null, alphabet: '' });
  assert.ok(html.includes('data-say="Eve gidiyorum."'));
  assert.ok(html.includes('Ev<b>e</b> gidiyorum.'));
  assert.ok(html.includes('I am going <b>home</b>.'));
  assert.ok(html.includes('class="ex-tr"'));
  assert.ok(html.includes('class="ex-en"'));
  assert.ok(!html.includes('class="hint"'));
});

test('text is escaped', () => {
  const x = '<x>';
  const sec = {
    id: 'x',
    title: x,
    blocks: [{ p: x }, { list: [x] }, { table: { head: [x], rows: [[x]] } }, { ex: [[x, x]] }, { tip: x }],
  };
  const html = guideSectionHtml(sec, { hint: null, alphabet: '' });
  assert.ok(!html.includes('<x>'));
  const list = guideListHtml({ title: x, intro: x, sections: [{ id: 'q"', icon: x, title: x, sub: x, blocks: [] }] });
  assert.ok(!list.includes('<x>'));
  assert.ok(!list.includes('q"'));
});
