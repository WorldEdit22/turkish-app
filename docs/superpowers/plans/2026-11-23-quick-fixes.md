# Quick Fixes (Türkçe) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Keep the scroll line between the bars, and add the Swedish app's alphabet window for Turkish.

**Architecture:** The page becomes a fixed-height flex column (top bar, `main`, tab bar) and only `main` scrolls, exactly as in the Swedish app's plan of the same date. The alphabet is data (`data/alphabet.js`) plus a pure HTML builder (`js/alphabetview.js`), wired into `app.js` the way the Swedish app wires its `alfabe` files.

**Tech Stack:** Plain HTML/CSS/ES modules, `node --test` (node is at `"/c/Program Files/nodejs/node.exe"`, not on PATH).

**Spec:** `docs/superpowers/specs/2026-11-23-quick-fixes-design.md`

## Global Constraints

- The UI is in English.
- Bump `CACHE` in `sw.js` to `turkish-v12`; every file in `js/` and `data/` must be in `ASSETS` (tests/sw.test.js checks).
- Run tests with `"/c/Program Files/nodejs/node.exe" --test /c/dev/hobby/turkish-app/tests/` (one command, no `cd`).
- Reference implementation: `c:\dev\hobby\swedish-app` — `js/alfabeview.js`, `data/alfabe.js`, the alphabet part of `js/app.js` (lines 576-603) and `css/app.css` (lines 641-676).

## Review Focus

Phone checks for the user after the push (no automated test can render iOS layout):

1. Open the translator after scrolling far down the word list: the text cursor sits on the text line (iOS 26 bug WebKit 300690; the page no longer scrolls, which removes its trigger).
2. Scroll to the end of the list and of Settings: the last block/card is fully visible above the tab bar.
3. Rubber-band at the list's ends moves only the list, never the bars.
4. Swiping a block sideways still works, and vertical scrolling still starts on a block.
5. Tap Ğ, I and İ: the voice says "yumuşak ge", "ı" and "i", never "capital …".

---

### Task 1: Only the list scrolls

Same as Task 1 of `c:\dev\hobby\swedish-app\docs\superpowers\plans\2026-11-23-quick-fixes.md`, on this repo's files:

**Files:**
- Modify: `css/app.css` (`body`, `.top`, `main`, `.tabs` rules)
- Modify: `js/app.js:225` (`setTab`: replace `window.scrollTo(0, 0)` with resetting `$('#list').scrollTop` and `$('#settings').scrollTop` to 0)
- Create: `tests/layout.test.js` (same two tests and the same `rule(css, selector)` helper)

This app has no `tests/app.test.js`, so the `setTab` change is checked on the phone (Review Focus 2).

- [ ] **Step 1:** Write `tests/layout.test.js`.
- [ ] **Step 2:** Run the tests; the two layout tests FAIL.
- [ ] **Step 3:** Make the CSS changes listed in the Swedish plan's Task 1 Step 3 and the `setTab` change.
- [ ] **Step 4:** Run the tests; all PASS.
- [ ] **Step 5: Commit**

```bash
git -C /c/dev/hobby/turkish-app add css/app.css js/app.js tests/layout.test.js
git -C /c/dev/hobby/turkish-app commit -m "fix: only the list scrolls, so the scroll line stays between the bars"
```

### Task 2: Alphabet data and window HTML

**Files:**
- Create: `data/alphabet.js`, `js/alphabetview.js`, `tests/alphabet.test.js`
- Modify: `js/html.js` (add `ABC`, copied from the Swedish app's `js/html.js`)

**Interfaces:**
- Produces:
  - `data/alphabet.js`: `export const LETTERS: { ch, name, sound, ex: [turkish, english] }[]` and `export const TRICKY: { ch, title, sound, ex: [turkish, english][] }[]`
  - `js/alphabetview.js`: `export function alphabetHtml(letters, tricky): string` — the whole body of the alphabet window
  - `js/html.js`: `export const ABC` (the "Aa" SVG)

- [ ] **Step 1: Write the failing tests** in `tests/alphabet.test.js`

```js
test('all 29 letters in Turkish order', () => {
  assert.equal(LETTERS.map((l) => l.ch).join(''), 'ABCÇDEFGĞHIİJKLMNOÖPRSŞTUÜVYZ');
});

test('every letter has a name, a sound and an example with its meaning', () => {
  for (const l of LETTERS) {
    assert.ok(l.name && l.sound, l.ch);
    assert.ok(l.ex.length === 2 && l.ex.every((s) => typeof s === 'string' && s), l.ch);
  }
  const name = (ch) => LETTERS.find((l) => l.ch === ch).name;
  assert.deepEqual(['C', 'Ğ', 'I', 'İ', 'J'].map(name), ['ce', 'yumuşak ge', 'ı', 'i', 'je']);
});

test('the tricky letters are ğ, ı, c, ç and ş, each with examples', () => {
  assert.deepEqual(TRICKY.map((t) => t.ch), ['ğ', 'ı', 'c', 'ç', 'ş']);
  for (const t of TRICKY) {
    assert.ok(t.title && t.sound, t.ch);
    assert.ok(t.ex.length >= 2 && t.ex.every((e) => e.length === 2 && e[0] && e[1]), t.ch);
  }
});

test('the window lists every letter, then the tricky letters', () => {
  const html = alphabetHtml(LETTERS, TRICKY);
  assert.equal((html.match(/class="abc-row"/g) || []).length, 29);
  assert.equal((html.match(/class="abc-combo"/g) || []).length, 5);
  for (const text of ['Turkish alphabet', 'Tricky letters', 'data-act="close"']) assert.ok(html.includes(text), text);
  assert.ok(html.includes('data-say="yumuşak ge"'), 'a letter says its name');
  for (const shown of ['Ç ç', 'I ı', 'İ i']) assert.ok(html.includes(`>${shown}<`), shown);
  assert.ok(html.includes('data-say="anne"'), 'the example has a speaker');
});

test('text is escaped', () => {
  const html = alphabetHtml([{ ch: '<', name: '<n>', sound: '<s>', ex: ['<e>', '<t>'] }], [{ ch: 'x', title: '<c>', sound: '<d>', ex: [['<x>', '<y>']] }]);
  for (const tag of ['<n>', '<s>', '<e>', '<t>', '<c>', '<d>', '<x>', '<y>']) assert.ok(!html.includes(tag), tag);
});
```

- [ ] **Step 2: Run the tests and see them fail**

Run: `"/c/Program Files/nodejs/node.exe" --test /c/dev/hobby/turkish-app/tests/`
Expected: FAIL, cannot find `data/alphabet.js`.

- [ ] **Step 3: Write `data/alphabet.js`**

Names and examples (decided); `sound` is one short English sentence each. Compare with English; where English has no such sound, compare with Swedish (ö = Swedish ö, ü ≈ Swedish y).

| ch | name | example | ch | name | example |
|---|---|---|---|---|---|
| A | a | anne, mother | M | me | masa, table |
| B | be | baba, father | N | ne | nasıl, how |
| C | ce | cuma, Friday | O | o | okul, school |
| Ç | çe | çay, tea | Ö | ö | ördek, duck |
| D | de | deniz, sea | P | pe | peynir, cheese |
| E | e | ekmek, bread | R | re | resim, picture |
| F | fe | fil, elephant | S | se | su, water |
| G | ge | göz, eye | Ş | şe | şeker, sugar |
| Ğ | yumuşak ge | dağ, mountain | T | te | tuz, salt |
| H | he | hayır, no | U | u | uçak, plane |
| I | ı | ışık, light | Ü | ü | üzüm, grapes |
| İ | i | iyi, good | V | ve | valiz, suitcase |
| J | je | plaj, beach | Y | ye | yol, road |
| K | ke | kedi, cat | Z | ze | zaman, time |
| L | le | limon, lemon | | | |

`TRICKY` (title, then a two-sentence `sound`):
- ğ "ğ, soft g": never starts a word and is not said as a g; it lengthens the vowel before it (dağ ≈ daa), and between e or i it can sound like a light y. Examples: dağ mountain, yağmur rain, değil not.
- ı "ı, i without a dot": like the e in "roses", lips relaxed; its capital is I, while i's capital is İ (İstanbul). Examples: kız girl, ışık light, kapı door.
- c "c is j": always like j in "jam", never k or s. Examples: cuma Friday, cevap answer.
- ç "ç is ch": like ch in "church". Examples: çay tea, çocuk child.
- ş "ş is sh": like sh in "ship". Examples: şeker sugar, beş five.

- [ ] **Step 4: Write `alphabetHtml(letters, tricky)` in `js/alphabetview.js`**

Follow `swedish-app/js/alfabeview.js` with these differences:
- English text inline (no metin.js): title "Turkish alphabet", intro note "Every letter is always said the same way, and every letter is said.", heading "Tricky letters", aria-labels "Listen" and "Close".
- Letter button: `data-say` is the letter's `name`; it shows `${ch} ${ch.toLocaleLowerCase('tr')}` with `lang="tr"`.
- `.abc-name` shows the name (no brackets); no pronunciation hints anywhere.
- Example: `<span class="abc-word" lang="tr">` + `<div class="abc-meaning">` + a speaker (`data-say` = the Turkish word).
- Each tricky letter is a `<div class="abc-combo">` with `.abc-combo-title`, `.abc-sound` and one `.abc-combo-ex` row per example.

- [ ] **Step 5: Add `ABC` to `js/html.js`** (copy from the Swedish app).

- [ ] **Step 6: Run the tests and see them pass**

Run: `"/c/Program Files/nodejs/node.exe" --test /c/dev/hobby/turkish-app/tests/`
Expected: the alphabet tests PASS; `sw.test.js` "every app module is in the offline cache" FAILS (fixed in Task 3).

- [ ] **Step 7: Commit**

```bash
git -C /c/dev/hobby/turkish-app add data/alphabet.js js/alphabetview.js js/html.js tests/alphabet.test.js
git -C /c/dev/hobby/turkish-app commit -m "feat: Turkish alphabet data and window HTML"
```

### Task 3: The alphabet in the app, and the release

**Files:**
- Modify: `index.html` (an `#abc-btn` before `#tr-btn`, `aria-label="Alphabet"`; a `<dialog id="alphabet" class="sheet" aria-label="Alphabet" tabindex="-1"><div id="alphabet-body" class="sheet-body"></div></dialog>` after the translator)
- Modify: `js/app.js`
- Modify: `css/app.css`
- Modify: `sw.js`, `tests/sw.test.js`, `tests/layout.test.js`

**Interfaces:**
- Consumes: `LETTERS`, `TRICKY`, `alphabetHtml`, `ABC` from Task 2.

- [ ] **Step 1: Write the failing tests**

- `tests/layout.test.js`: the Swedish plan's Task 2 test "the alphabet window has the same window styles as the others".
- `tests/sw.test.js`: the activate test lists `['turkish-v11', 'swedish-v1', 'turkish-v12', 'other']` and expects `['turkish-v11']` deleted.

- [ ] **Step 2: Run the tests and see them fail**

Run: `"/c/Program Files/nodejs/node.exe" --test /c/dev/hobby/turkish-app/tests/`
Expected: those two FAIL, plus the offline-cache test from Task 2.

- [ ] **Step 3: Wire it into `js/app.js`**, as the Swedish app does:
- `openAlphabet()` and the `#alphabet` click and close handlers (Swedish `app.js` 576-603), drawing `alphabetHtml(LETTERS, TRICKY)`.
- `headButtons()` puts `<button class="head-abc" data-act="alphabet" aria-label="Alphabet">${ABC}</button>` before the bubble; the sheet's click handler opens the alphabet on `act === 'alphabet'`.
- The translator's close handler keeps `noscroll` while the alphabet is open; `toast()` uses the alphabet as host while it is open (after the translator, before the sheet).
- `#abc-btn` gets `ABC` and opens the alphabet.

- [ ] **Step 4: CSS**: add `dialog#alphabet` to the four window rules; add `.head-abc` next to `.head-tr` in its two rules; copy the Swedish alphabet section, renaming `.abc-ex-sv` → `.abc-word` and `.abc-ex-tr` → `.abc-meaning`, dropping `.abc-ex .hint`.

- [ ] **Step 5: `sw.js`**: `CACHE = 'turkish-v12'`; add `'js/alphabetview.js'` and `'data/alphabet.js'` to `ASSETS`.

- [ ] **Step 6: Run the tests and see them pass**

Run: `"/c/Program Files/nodejs/node.exe" --test /c/dev/hobby/turkish-app/tests/`
Expected: all tests PASS.

- [ ] **Step 7: Commit**

```bash
git -C /c/dev/hobby/turkish-app add index.html js/app.js css/app.css sw.js tests/sw.test.js tests/layout.test.js
git -C /c/dev/hobby/turkish-app commit -m "feat: alphabet button and window; cache v12"
```
