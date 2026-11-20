# Select words and patterns, cleaner card Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Tap blocks to select words and patterns, open a block with a small ⓘ, and show one Examples list that combines the opened item with everything selected; plus a gear for Settings, Words first, deeper bars and a silent-mode fix for the speaker.

**Architecture:** A new pure module `js/examples.js` builds the example rows for a card from the data, a selection predicate and a learned predicate, so it is tested in Node. `js/store.js` keeps the selection next to learned progress. `js/app.js` renders blocks, the card and the top bar; the look is CSS tokens.

**Tech Stack:** Plain HTML/CSS/ES modules, no build step, `node:test`.

**Spec:** `docs/superpowers/specs/2026-11-20-select-and-examples-design.md`

## Global Constraints

- No frameworks, no build step, no new dependencies.
- Saved progress (`tl.learned`) and all ids are untouched. The selection is stored under its own key `tl.selected`, with the same keys as learned (`word.id`, `pattern.key` = `p:<id>`).
- Offline cache → `turkish-v5`; every file under `js/` and `data/` is listed in `sw.js` `ASSETS`.
- Exact copy: `Clear (N)`, `Examples`, `No sound? Silent mode mutes it on iPhone.`, ⓘ `aria-label="Details"`, gear `aria-label="Settings"`.
- ⓘ and gear tap areas are at least 44 × 44 px.
- New colours are tokens in `:root` with dark-mode values in the existing `@media (prefers-color-scheme: dark)` block.
- Tests: `"/c/Program Files/nodejs/node.exe" --test tests/` (baseline: 59 passing).
- Local server for browser checks: `"/c/Program Files/nodejs/node.exe" tools/serve.mjs` → `http://localhost:8080`.

## Review Focus

- Tapping ⓘ opens the card and does not also select the block; a swipe marks learned and never selects. (Task 2 browser check.)
- A word that is both selected and learned appears once in a pattern card, as a selected row, not again among the learned extras. (Task 1 test.)
- A hand-written example that is the same sentence as a generated one (`Su istiyorum.`) appears once, highlighted. (Task 1 test.)
- `js/examples.js` must be in the offline cache, or the home-screen app breaks offline. (Task 1 sw test.)
- On a long card (a 3-variant pattern with several words selected), the ✕ is visible and works after scrolling to the bottom. (Task 3 browser check.)

---

### Task 1: Example builder module

**Files:**
- Create: `js/examples.js`, `tests/examples.test.js`
- Modify: `sw.js` (`CACHE = 'turkish-v5'`, add `'js/examples.js'` to `ASSETS`), `tests/sw.test.js`

**Interfaces:**
- Consumes: `fill(tpl, word)` and `fits(slot, word)` from `js/combine.js`.
- Produces (all exported from `js/examples.js`):
  - `slotOf(p, v) → string`: `v.slot || p.slot`.
  - `wordPatternPairs(word, patterns) → Array<{ p, v }>`: every variant with templates (`v.t.length`) whose slot fits the word, in `patterns` order.
  - `patternExamples(p, vi, { words, isSelected, isLearned, rand = Math.random }) → Row[]` for variant `p.variants[vi]`.
  - `wordExamples(w, { patterns, isSelected, isLearned, rand = Math.random }) → Row[]`.
  - `Row = { tr, en, trParts?, enParts?, from? }`. Generated rows are `fill(...)` results (with `trParts`/`enParts`); hand-written rows are `{ tr, en }` only; word-card rows from a pattern carry `from: \`${v.tr} · ${p.en}\``.
  - `words` is most-common-first, `patterns` most-useful-first. `isSelected(item)` and `isLearned(item)` take the word or pattern object.

**Order rules** (from the spec):
- Pattern card, variant with templates: (1) one row per selected word that fits, in `words` order, using a random template of the variant; (2) the variant's hand-written `ex`; (3) up to 3 rows from a pool of learned fitting words, or, when no fitting word is learned, the 15 most common fitting words, minus selected words, picked at random. A variant with no templates returns only its hand-written examples.
- Word card: (1) for each selected pattern in `patterns` order, one row per fitting variant; (2) the word's own `w.ex` if any; (3) up to 4 rows picked at random from pairs whose pattern is learned, or, when none is, pairs whose pattern is among the first 15 of `patterns` (if that gives fewer than 4 pairs, the first 10 pairs), minus selected patterns.
- No sentence twice: drop a hand-written row whose `tr` equals a generated row's `tr`.

- [ ] **Step 1: Write the failing tests** in `tests/examples.test.js`. Use small fixtures as in `tests/combine.test.js`: drink nouns `çay/tea`, `su/water`, `kahve/coffee`, `ayran/ayran`, `süt/milk` (`type: 'noun', kind: 'drink'`) and a verb `gelmek/come`; a pattern `want` (`slot: 'noun:drink'`) with variant 0 `{ tr: '___ istiyorum', en: 'I want ___', ex: [['Bir bilet istiyorum.', 'I want a ticket.'], ['Su istiyorum.', 'I want water.']], t: [['{w} istiyorum.', 'I want {en}.']] }` and variant 1 `{ tr: 'Bir ___, lütfen', en: 'A ___, please', ex: [['Bir çay, lütfen.', 'A tea, please.']], t: [] }`; a second pattern with two templated drink variants and a `noun:place` pattern for the word-card tests. Tests:
  - `pattern examples start with one sentence per selected word that fits, most common first`: select su, çay, gelmek → first two `tr` are `['Çay istiyorum.', 'Su istiyorum.']`, both have a highlighted part, no row mentions `gel`.
  - `hand-written examples follow the selected ones without highlight`: select çay → `rows[1]` deep-equals `{ tr: 'Bir bilet istiyorum.', en: 'I want a ticket.' }` (this example can never be generated, so the test is not affected by the random extras).
  - `a hand-written example equal to a generated one appears once, highlighted`: select su → exactly one row with `tr === 'Su istiyorum.'` and it has `trParts`.
  - `then up to 3 with learned words, never repeating a selected word`: all five learned, çay selected → 4 generated rows (1 selected + 3), only one with `tr === 'Çay istiyorum.'`, all `tr` unique.
  - `with no fitting word learned, the extras come from the 15 most common fitting words`: 20 drink nouns, none learned or selected → 3 generated rows, each highlighted English word among the first 15.
  - `a variant without templates shows only its hand-written examples`: `patternExamples(want, 1, …)` with çay selected deep-equals `[{ tr: 'Bir çay, lütfen.', en: 'A tea, please.' }]`.
  - `word examples start with each selected pattern, one sentence per variant the word fits`: çay with the two-variant pattern and the place pattern selected → first two rows' `from` are that pattern's two labels; no row from the place pattern.
  - `then the word's own example, then up to 4 with learned patterns, skipping selected ones`: word with `ex`, six fitting patterns all learned, one selected → the row after the selected rows is the hand-written one; at most 4 rows after it; none labelled with the selected pattern.
  - `with no learned pattern, the extras come from the 15 most useful patterns`: 20 fitting one-variant patterns, none learned → every extra's `from` belongs to one of the first 15.
- [ ] **Step 2: Add to `tests/sw.test.js`:** `every app module is in the offline cache`: for every file in `js/` and `data/` (read with `readdirSync`), `js/<file>` / `data/<file>` is among the installed request URLs.
- [ ] **Step 3: Run, watch them fail** (`Cannot find module …/js/examples.js`; sw test fails on `js/examples.js`).
- [ ] **Step 4: Implement `js/examples.js`** per the interfaces and order rules; `rand` drives both the template pick and a Fisher–Yates shuffle. Bump `sw.js` to `turkish-v5` and add `'js/examples.js'`.
- [ ] **Step 5: Full suite green** (59 + 10).
- [ ] **Step 6: Commit** `feat: example builder that combines selected words and patterns`.

### Task 2: Select blocks, ⓘ opens

**Files:**
- Modify: `js/store.js`, `js/app.js` (`blockHtml` 118-129, list click/keydown 554-584, `renderControls`), `index.html` (title row 20-27), `css/app.css` (tokens, `.block`, mark styles 124-128)
- Create: `tests/store.test.js`

**Interfaces:**
- Produces on `store`: `selected` (object), `isSelected(key) → boolean`, `toggleSelected(key)`, `clearSelected()`, `selectedCount() → number`; saved under `tl.selected`.
- Block markup: `.block` gets class `sel` and `aria-pressed="true|false"`; it contains `<button class="b-info" aria-label="Details">` with an ⓘ svg.

- [ ] **Step 1: Failing tests** in `tests/store.test.js` (`store.js` falls back to memory without `localStorage`): `toggleSelected selects and unselects a key`; `clearSelected empties the selection and selectedCount follows`; `selecting does not mark learned`.
- [ ] **Step 2: Run, watch them fail.** **Step 3: Implement** in `store.js`. **Step 4: Run, pass.**
- [ ] **Step 5: Wire selection in `app.js`.** Tap on a block toggles selection, updating the block's `sel` class and `aria-pressed` in place (no full re-render, so scroll and focus stay); tap on `.b-info` opens the card and does not toggle; `swiper.consumeClick()` still guards both. Enter/Space on a block toggles selection. Add `<button id="clear-sel" class="icon-btn">` to the title row, text `Clear (N)`, hidden when `selectedCount() === 0` and on Settings; it clears and re-renders the list. Remove Mark mode entirely: `#mark-btn`, `#mark-hint`, `markMode`, `setMarkMode`, `.mark-btn`, `.mark-hint`, `.marking` styles.
- [ ] **Step 6: Style.** Tokens `--sel-fill` (light `rgba(46, 230, 214, 0.3)`, dark `rgba(46, 230, 214, 0.22)`) and `--sel-line` (light `#0a7a85`, dark `#5ee3d8`). `.block.sel`: `--sel-fill` background and a 2 px `--sel-line` ring that does not change the block's size; `.block.on.sel` keeps the learned gradient and shows the ring. `.b-info`: absolute top-right, 44 × 44 tap area, ~20 px icon in `--muted` (`--on-grad-soft` on learned blocks); `.b-en` right padding so text never runs under it.
- [ ] **Step 7: Browser check** (light and dark): tap selects/unselects; ⓘ opens without selecting; swipe right marks learned without selecting; Clear (N) counts words and patterns across both tabs and clears; selection survives a reload; a learned + selected block shows the ring.
- [ ] **Step 8: Full suite green. Commit** `feat: tap blocks to select them, ⓘ opens the card`.

### Task 3: The card

**Files:**
- Modify: `js/app.js` (sheet section 207-321, `askAi` 344-379, sheet click handler 381-402), `css/app.css` (sheet 342-376)

**Interfaces:**
- Consumes: `patternExamples`, `wordExamples`, `wordPatternPairs`, `slotOf` from Task 1; `store.isSelected` from Task 2. Call with `words: BY_COMMON`, `patterns: PATTERNS`, `isSelected: (x) => store.isSelected(keyOf(x))`, `isLearned: learned`.

- [ ] **Step 1: One Examples list.** Pattern card: per variant, a `Examples` heading and its `patternExamples` rows rendered with `exHtml` (pass `trParts`/`enParts` when present). Word card: one `Examples` heading and its `wordExamples` rows (with the `from` line). No heading when the list is empty. Delete `patternCombos`, `wordCombos`, the `shuffle` action, the "Mark … green" notes, and `app.js`'s own `slotOf`/`wordPatternPairs`/`pick` (import from `examples.js`; `askAi` keeps working).
- [ ] **Step 2: Head.** Remove the tip line. Meta: words `${TYPES[w.type].one} · ${c.icon} ${c.label}` (no rank); patterns have no meta line.
- [ ] **Step 3: ✕ always visible.** Wrap the grabber and the title row with ✕ in `.s-top`: `position: sticky; top: 0`, card background, above the scrolling content.
- [ ] **Step 4: Browser check:** select 3 words (one a verb that does not fit) and open a 3-variant pattern → templated variants start with the fitting selected words highlighted, then hand-written examples, then up to 3 more, no sentence twice, the verb skipped; scroll to the bottom → ✕ visible and closes. Select 2 patterns and open a fitting word → labelled rows first. No Shuffle, no tip, no "#N most common". "✨ More examples" still works or shows its setup button.
- [ ] **Step 5: Full suite green. Commit** `feat: one Examples list using your selection, ✕ always visible`.

### Task 4: Gear, Words first, deeper bars, sound

**Files:**
- Modify: `index.html` (title row, tab bar 45-55), `js/app.js` (`renderControls`, `setTab`, startup, `speak` 59-68, Settings pronunciation card 431-435), `js/store.js` (default `tab: 'words'`), `css/app.css` (`.top` 94-105, `.tabs` 283-320), `README.md`

- [ ] **Step 1: Top row and tabs.** Remove `<h1 id="title">`. Title row: `#progress`, `#clear-sel`, `#toggle-tr`, `<button id="gear" class="icon-btn" aria-label="Settings" aria-pressed="false">` with a gear svg in the tab icons' stroke style. Tab bar: Words, then Patterns; the Settings tab is removed.
- [ ] **Step 2: Behaviour.** Before the first render set `ui.tab = 'words'` (the app opens on Words every time). Gear: on a list tab → `setTab('settings')`; on Settings → back to the list tab it came from. On Settings: `#progress` reads `Settings`, controls, TR and Clear hidden, gear `aria-pressed="true"`, no tab highlighted. The card's AI setup button still opens Settings.
- [ ] **Step 3: Deeper bars.** Tokens `--bar-shadow-top` / `--bar-shadow-bottom` (light and dark) with a layered shadow on the top bar's lower edge and the tab bar's upper edge, clearly deeper than today's `0 4px 14px rgba(6, 90, 110, 0.25)`; exact values are the builder's choice.
- [ ] **Step 4: Sound.** In `speak()`, before `speechSynthesis.speak`: `try { if (navigator.audioSession) navigator.audioSession.type = 'playback'; } catch {}`. Pronunciation card gets `<p>No sound? Silent mode mutes it on iPhone.</p>`.
- [ ] **Step 5: README.** Replace the tap/swipe/✓ Mark bullet and the "green words" bullet with: tap blocks to select words and patterns, ⓘ opens one, its examples use everything selected plus learned (or common) items; swipe right/left or the card button marks learned. Under "Put it on your iPhone" add: Safari and the home-screen app keep separate progress (copy a backup in one, restore in the other), and silent mode mutes the speaker.
- [ ] **Step 6: Browser check** (light and dark): no title; tabs read Words | Patterns; after a reload while on Patterns or Settings the app opens on Words; gear opens and closes Settings; AI setup opens Settings with the gear pressed; both bars visibly deeper.
- [ ] **Step 7: Full suite green. Commit** `feat: gear for Settings, Words first, deeper bars, silent-mode hint`.
- [ ] **Step 8: Ask the user** to test the speaker in Safari on the iPhone with silent mode on, and report whether the `playback` setting made it play.
