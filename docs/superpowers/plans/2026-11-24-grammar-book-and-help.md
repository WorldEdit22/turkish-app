# Grammar Book and Help (both apps) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A book button that opens a grammar guide (first section: today's alphabet), and a ? button that opens short help, in both apps.

**Architecture:** Content is data: a list of sections, each a list of simple blocks. One pure view module, `js/guideview.js`, draws a section list and a section page for any such content. `app.js` gets one small window controller used by both the book and the help windows (list → page → ‹ back, place remembered while the app is open). The alphabet window becomes the book window; the alphabet view loses its own title bar and renders as the book's first section.

**Tech Stack:** Plain HTML/CSS/ES modules, no build step; `node --test` (node is at `"/c/Program Files/nodejs/node.exe"`, not on PATH).

**Spec:** `docs/superpowers/specs/2026-11-24-grammar-book-and-help-design.md` (the same file is in both repos).

**Repos:** T = `c:\dev\hobby\turkish-app` (UI in English), S = `c:\dev\hobby\swedish-app` (UI in Turkish). Both on branch `grammar-book`.

## Global Constraints

- Every task changes **both** apps: T first, then S. One commit per repo per task (`git -C <repo> …`). Keep the words reset, push and clean out of commit messages: the user's permission rules deny them.
- S: every visible string lives in `js/metin.js` or a Turkish data module. `tests/turkce.test.js` and the no-English checks (`tests/english.js`) cover the new data. `tests/imports.test.js` keeps app.js free of visible text.
- T and S stay structurally parallel: same view module and same block kinds, with different text.
- Section shape: `{ id, icon, title, sub, blocks }`. Block kinds: `{ p }`, `{ list: [...] }`, `{ table: { head: [...] | null, rows: [[...], ...] } }`, `{ ex: [[target, native], ...] }`, `{ tip }`, `{ alphabet: true }`.
- `*…*` in any text shows as bold. The speaker and the pronunciation hint use the text without the `*` marks.
- Each grammar section has 2–5 example sentences in total. About 120–250 words. The book's first section is the alphabet.
- Every new file in `js/` or `data/` goes into that repo's `sw.js` `ASSETS` in the task that creates it. A removed file leaves `ASSETS` in the same task.
- Tests: `"/c/Program Files/nodejs/node.exe" --test --test-reporter=dot /c/dev/hobby/<repo>/tests/`, one command per call. No `cd`, pipes or `&&`.

## Review Focus

1. **The top row with Clear (N) showing on a 390 pt phone** (progress, Clear, book, bubble, ?, gear): the gear stays fully visible. This is a phone check; the existing `.progress` rule lets the text give way.
2. **The book opened from a word window, then ✕:** the word window is still open underneath, unchanged. (Task 2 test)
3. **Leaving and reopening the book while the app is open** returns to the same section. A tap on ‹ returns to the list. (Task 2 test)
4. **A highlighted ending inside an example:** the speaker and the hint get the text without `*`, and the bold shows only on screen. (Task 1 test)
5. **Tapping a speaker inside a section** speaks and does nothing else: it doesn't navigate or close. (Task 2 test)

---

### Task 1: The guide view, `js/guideview.js`

**Files:**
- Create: T and S `js/guideview.js`, `tests/guideview.test.js`. Add `'js/guideview.js'` to both `sw.js` ASSETS.
- Modify: S `js/metin.js`, adding `T.guide = { back: 'Geri', close: 'Kapat' }` if `T.aria.back`/`T.aria.close` don't already cover it. Reuse `T.aria` where it does.

**Interfaces:**
- Produces (pure, everything escaped):
  - `inline(text) → html`: escapes the text, then turns `*x*` into `<b>x</b>`.
  - `plain(text) → string`: the text without `*`.
  - `guideListHtml({ title, intro, sections }) → html`:
    - An `.s-top` title row holding the title and `✕` (`data-act="close"`).
    - Then `intro` (if any) as `<p class="gd-intro">`.
    - Then one `<button class="gd-row" data-act="open-section" data-id="<id>">` per section, with the icon, the title, the `sub` line and `›`.
  - `guideSectionHtml(section, { hint, alphabet }) → html`:
    - An `.s-top` row with `‹` (`data-act="back"`), the section title, and `✕`.
    - Then the blocks:
      - `p` → `<p class="gd-p">`
      - `list` → `<ul class="gd-list">`
      - `table` → `<table class="gd-table">` with `<thead>` only when `head` is set
      - `ex` → one example row per pair, in the app's existing `.ex` markup:
        - T: `.ex` > `.say` + `.ex-tr` (target) + `.ex-en` (native)
        - S: `.ex` > `.say` + `.ex-sv` (target) + `.hint` + `.ex-tr` (native)
      - `tip` → `<p class="gd-tip">`
      - `alphabet` → the `alphabet` HTML string passed in, unchanged.
    - `hint` is `(text) → string` or null; T always passes null.
- S takes `back`, `close` and `listen` labels from `metin.js`; T writes "Back", "Close" and "Listen" inline.

- [ ] **Step 1: Write the failing tests** (each repo in its own language):
  - `inline escapes and bolds *marked* parts`: `inline('ev*e* <b>')` is `ev<b>e</b> &lt;b&gt;`. `plain('ev*e*')` is `eve`.
  - `the list shows every section as a row that opens it`: 3 sections give 3 `data-act="open-section"` rows with their ids. The output has the title, the intro, a close button, and each `sub`.
  - `a section page has back, title and close, then its blocks`: one of each block kind gives exactly one each of `gd-p`, `gd-list`, `gd-table` (and `<thead>` only when `head` is set), `gd-tip`, and the alphabet string.
  - `an example speaks and hints the plain text, and shows the bold` (Review Focus 4):
    - `ex: [['Ev*e* gidiyorum.', 'I am going *home*.']]` gives `data-say="Eve gidiyorum."` and `Ev<b>e</b> gidiyorum.`.
    - S: a fake hint receives `Eve gidiyorum.`-style plain text, with no `*`.
  - `text is escaped`: `<x>` in a title, `sub`, `p`, `list`, table cell, example or tip never appears raw.

- [ ] **Step 2: Run the tests.** Expected: FAIL, module not found.
- [ ] **Step 3: Implement both modules** and add them to ASSETS.
- [ ] **Step 4: Run both suites.** Expected: all PASS.
- [ ] **Step 5: Commit both.** Message: `feat: guide view for the book and the help`.

### Task 2: The book window (replaces the alphabet window)

**Files:**
- Modify: T and S `index.html`:
  - `#abc-btn` becomes `#book-btn`, with `aria-label` "Grammar" (S: "Dil bilgisi").
  - `<dialog id="alphabet">` becomes `<dialog id="book" class="sheet">` with `#book-body`.
- Modify: T and S `js/html.js`: add `BOOK`, an open-book line icon. Remove `ABC` if nothing else uses it.
- Modify: T `js/alphabetview.js` and S `js/alfabeview.js`.
  - The export becomes `alphabetBodyHtml(letters, tricky)` (T) / `alfabeBodyHtml(letters, combos, hint)` (S).
  - It returns today's content without its own `.s-top` title bar (the note, the rows, the tricky sounds).
  - The old `alphabetHtml`/`alfabeHtml` are removed.
- Create: T `data/book.js` and S `data/kitap.js`, each exporting `BOOK` with two sections for now:
  - T: `letters` (icon 🔤, "Letters and sounds", `{ alphabet: true }`), then `harmony` ("Vowel harmony", with real content).
  - S: `harfler` ("Harfler ve sesler"), then `sira` ("Kelime sırası: fiil ikinci sırada").
  - Tasks 4 and 5 fill in the rest.
  - Add the new files to ASSETS.
- Modify: T and S `js/app.js`, `css/app.css`, `tests/app.test.js`, `tests/layout.test.js`, and the alphabet view tests. Also S `js/metin.js`: add `T.book = { title: 'Dil bilgisi' }`, and the book's aria label.

**Interfaces:**
- Consumes: Task 1's `guideListHtml` and `guideSectionHtml`.
- Produces in app.js: `guideWindow(dialog, body, content) → { open() }`, used by Task 3 for the help.
  - `content() → { title, intro, sections }`, called at open time.
  - State per window: `{ id: null | sectionId, listScroll, sectionScroll }`.
  - `open()` draws the list or the current section and restores its scroll.
  - The click handler on the window:
    - `[data-say]` → speak, checked first (Review Focus 5)
    - `open-section` → save the list scroll, show the section at the top
    - `back` → the list at its saved scroll
    - `close` → close
    - a backdrop tap → close
  - Closing saves the current scroll. `noscroll` stays set while another window is open.
- The book's `content()`: T title "Grammar", S `T.book.title`, the `BOOK` sections, and no intro.
  - The alphabet section gets `alphabetBodyHtml(LETTERS, TRICKY)` (T) or `alfabeBodyHtml(LETTERS, COMBOS, sayIt)` (S).
  - Grammar examples get `hint`: S `hints()` (null when hints are off), T null.
- In each window's title row, `headButtons()` puts `<button class="head-book" data-act="book" aria-label="…">${BOOK}</button>` where `head-abc` was. The sheet's `book` act opens the book.
- The toast host order and the `noscroll` checks use `book` where they used `alphabet`.

- [ ] **Step 1: Write the failing tests.**
  - `tests/app.test.js` (both):
    - `the book button opens the book on its section list`: `#book-btn` click opens `#book`, the body lists `BOOK.length` `data-act="open-section"` rows, and the first is the alphabet section.
    - `opening the alphabet section shows the letters`: in T, 29 `abc-row`, with a `data-act="back"` button.
    - `back returns to the list; the book reopens where you left it` (Review Focus 3): open the section, close, reopen → the same section; back → the list.
    - `the book opened from a word window closes back to it` (Review Focus 2): open a word window, click its `data-act="book"`, close the book, and `#sheet` is still open with the same word.
    - `a speaker in a section speaks and stays` (Review Focus 5): a click with `closest('[data-say]')` set and `[data-act]` also set leaves the view unchanged.
    - Update the existing tests that use `#abc-btn`, `#alphabet` and `data-act="alphabet"`.
  - `tests/layout.test.js` (both): the window rule names `dialog#book` instead of `dialog#alphabet`, and the backdrop rule too.
  - The alphabet view tests (both): test `alphabetBodyHtml`/`alfabeBodyHtml` with the same assertions minus the title bar and close button, and assert there is no `s-top`.
  - S: `tests/turkce.test.js` keeps passing over the new `metin.js` strings and `data/kitap.js` (add `data/kitap.js` to its no-English check, like `data/alfabe.js`).

- [ ] **Step 2: Run the tests.** Expected: FAIL.
- [ ] **Step 3: Implement.** CSS:
  - Window rules for `dialog#book`.
  - `.gd-row`: a full-width row, like `.scan-open`, with the icon, title and sub, and `›` at the right; at least 52 px tall.
  - `.gd-p`, `.gd-list`, `.gd-table` (small, bordered, fits 390 pt; scrolls sideways inside itself if wider), and `.gd-tip` (highlighted box), in each app's palette, light and dark.
  - `.head-book` takes `.head-abc`'s rules.
- [ ] **Step 4: Run both suites.** Expected: all PASS.
- [ ] **Step 5: Commit both.** Message: `feat: the book replaces the alphabet window; letters are its first section`.

### Task 3: The help window

**Files:**
- Modify: T and S `index.html`:
  - Add `<button id="help-btn" class="icon-btn svg-btn" aria-label="Help">` (S: "Yardım") between `#tr-btn` and `#gear`.
  - Add `<dialog id="help" class="sheet">` with `#help-body`.
- Modify: T and S `js/html.js` (add `HELP`, a question mark in a circle), `js/app.js`, `css/app.css`, `tests/app.test.js` and `tests/layout.test.js`. In S, also `js/metin.js`: `T.help = { title: 'Yardım' }`, plus the aria label.
- Create: T `data/help.js` and S `data/yardim.js`. Each exports `HELP = { intro, sections }`, where the sections use the same shape and block kinds. Add them to ASSETS.

**Interfaces:**
- Consumes: Task 2's `guideWindow`, and Task 1's views.
- `HELP.sections` ids, in order: `practice`, `browse`, `windows`, `search`, `translate`, `book`, `ai`, `settings`, `routine`.
  - `windows` is the ⓘ window: examples, and the Practice section for correcting an answer.
- Each topic is 2–6 short lines, as `p`/`list`/`tip` blocks. Topics have no examples.
- `intro` is one line on what the app is for.
- The content matches what the app does today:
  - the mode switch, Show answer, Forgot/Hard/Easy, Undo, the daily 15 and More, and the two directions with their labels
  - selecting blocks for examples, ⓘ, correcting an answer in a word's window
  - search and the camera scan, the translate bubble, the book
  - AI examples set up in Settings
  - Settings: showing the target language on blocks; S: pronunciation hints; copying a backup now and then
  - `routine`: practise 5–10 minutes a day, browse a topic when something comes up, open the book when curious

- [ ] **Step 1: Write the failing tests.**
  - `tests/app.test.js` (both): `the ? button opens the help: intro, then the topics in order`. The topic list matches the ids above; opening `routine` and going back works.
  - A content test (T `tests/help.test.js`, S `tests/yardim.test.js`):
    - Every topic has an id, icon, title, sub and blocks.
    - No topic has an `ex` block.
    - The ids are exactly the list above.
    - S: no English in any string.
  - `tests/layout.test.js`: window rules for `dialog#help`.
- [ ] **Step 2: Run the tests.** Expected: FAIL.
- [ ] **Step 3: Implement**, writing the help text (T in English, S in Turkish).
- [ ] **Step 4: Run both suites.** Expected: all PASS.
- [ ] **Step 5: Commit both.** Message: `feat: help window with a short guide to every feature`.

### Task 4: Türkçe grammar content

**Files:**
- Modify: T `data/book.js` to complete the sections.
- Create: T `tests/book.test.js`.

**Interfaces:**
- `BOOK` ids, in order:
  `letters, harmony, consonants, order, plural, tobe, cases, possessive, pronouns, questions, iyor, aorist, past, future, negation, modals, linking, postpositions, numbers`.
- Titles follow the spec's list.

- [ ] **Step 1: Write the failing tests** in `tests/book.test.js`:
  - `the book's sections in order, letters first`: the ids equal the list above, and `BOOK[0].blocks` is `[{ alphabet: true }]`.
  - `every section has an icon, title, sub and blocks of the known kinds`.
  - `every grammar section has 2–5 examples, each a target and its meaning`: count the pairs across the section's `ex` blocks; each pair has two non-empty strings.
  - `every * mark is closed`: every string in `BOOK` has an even number of `*`.
  - `examples use only Turkish letters and punctuation on the target side`: the target matches `/^[A-Za-zÇĞİÖŞÜçğıöşüâîû0-9 ,.!?'’:;\-–*()]+$/`, which catches swapped columns.
- [ ] **Step 2: Run the tests.** Expected: FAIL (2 sections).
- [ ] **Step 3: Write the 17 missing sections**, following the spec's writing guidance: an English-speaking learner who knows Swedish; what the rule is, the forms in a small table where forms are involved, 2–5 examples, and a tip for a classic mistake; about 120–250 words; prefer words and patterns already in `data/words.js` and `data/patterns.js`; highlight the ending a rule is about with `*…*`. Turkish must be correct and natural.
- [ ] **Step 4: Run the T suite.** Expected: all PASS.
- [ ] **Step 5: Commit.** Message: `feat: Turkish grammar book content`.

### Task 5: Svenska grammar content

**Files:**
- Modify: S `data/kitap.js` to complete the sections.
- Create: S `tests/kitap.test.js`.

**Interfaces:**
- `BOOK` ids, in order:
  `harfler, sira, enett, belirli, cogul, sifat, zamir, iyelik, simdiki, gecmis, perfekt, gelecek, emir, modal, inte, soru, edat, baglac, karsilastirma, sayilar`.
- Titles follow the spec's list (Turkish).

- [ ] **Step 1: Write the failing tests** in `tests/kitap.test.js`. They are the same as Task 4's, with these changes:
  - The id list above.
  - The target side matches `/^[A-Za-zÅÄÖåäöéÉ0-9 ,.!?'’:;\-–*()]+$/`, which is Swedish letters only.
  - No English in any string, using `englishWords`/`allStrings` from `tests/english.js`.
- [ ] **Step 2: Run the tests.** Expected: FAIL.
- [ ] **Step 3: Write the 18 missing sections**, following the spec's writing guidance:
  - Write in simple Turkish for Turkish speakers with little Swedish, comparing with Turkish where it helps (the verb comes second in Swedish, last in Turkish; Turkish has no gender).
  - Cover the rule, forms in a small table, 2–5 examples, and a tip.
  - Keep each section to about 120–250 words.
  - Prefer words already in `data/words.js`.
  - Highlight the ending or word a rule is about with `*…*`.
  - Swedish must be correct and natural (the user proofreads it later), and so must the Turkish (the wife proofreads it).
- [ ] **Step 4: Run the S suite.** Expected: all PASS.
- [ ] **Step 5: Commit.** Message: `feat: Swedish grammar book content (in Turkish)`.

### Task 6: Release

**Files:**
- Modify: T and S `sw.js` (CACHE `turkish-v15` / `swedish-v5`), `tests/sw.test.js` and `README.md`.

- [ ] **Step 1: Update the activate tests.**
  - T lists `['turkish-v14', 'swedish-v4', 'turkish-v15', 'other']` and expects `['turkish-v14']` deleted.
  - S lists `['swedish-v4', 'turkish-v15', 'swedish-v5']` and expects `['swedish-v4']`.
  - Run them. Expected: FAIL.
- [ ] **Step 2: Bump CACHE in both apps.** In each README, add the book (grammar; letters are its first section) and the help (?) in a line or two, and remove any mention of the Aa button. Run both suites: all PASS.
- [ ] **Step 3: Commit both.** Message: `chore: grammar book and help release; cache v15 / v5; README`.
