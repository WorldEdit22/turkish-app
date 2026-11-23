# Practice Mode (both apps) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace "learned" with Anki-style spaced repetition in both apps: a Browse mode without learned marks, and a Practice mode with two directions, a daily dose of new cards, and Forgot / Hard / Easy answers.

**Architecture:** One pure scheduling module, `js/srs.js`, byte-identical in both repos. `js/store.js` keeps the practice data (one storage key per app) and migrates old learned marks once. `js/practiceview.js` is a pure HTML builder per app (the Swedish app's text comes from `js/metin.js`). `js/app.js` wires the mode switch, the practice session and the window's Practice section.

**Tech Stack:** Plain HTML/CSS/ES modules, no build step; `node --test` (node is at `"/c/Program Files/nodejs/node.exe"`, not on PATH).

**Spec:** `docs/superpowers/specs/2026-11-23-practice-mode-design.md` (the same file is in both repos).

**Repos:** T = `c:\dev\hobby\turkish-app` (UI in English), S = `c:\dev\hobby\swedish-app` (UI in Turkish). Both are on branch `practice-mode`.

## Global Constraints

- Every task changes **both** apps: T first, then S. Commit once per repo per task (`git -C <repo> …`).
- `js/srs.js` and `tests/srs.test.js` are byte-identical in both repos.
- S: every visible string lives in `js/metin.js`. `tests/turkce.test.js` (no English) and `tests/imports.test.js` (no text in app.js) stay green.
- Storage: practice data under `tl.practice` (T) / `sv.practice` (S). `tl.learned` / `sv.learned` is read only for the one-time migration and never written again.
- Fixed values from the spec: 15 new cards per direction per day; More adds 15; a new day starts at 4 a.m. local time; mastered means an interval of 21 days or more; Forgot puts the card back 4 cards later.
- Intervals: a new card goes to 1 day on Hard and 3 days on Easy. A card with an interval goes to ×1.2 on Hard and ×2.5 on Easy, at least +1 day either way.
- Fuzz on intervals of 2 days or more: ±15%, at least ±1 day.
- Migration of old learned marks: interval 7, due 1–21 days ahead, done once.
- Tests: `"/c/Program Files/nodejs/node.exe" --test --test-reporter=dot /c/dev/hobby/<repo>/tests/`, one command per call, no `cd`, no pipes or `&&`.
- Every new file in `js/` or `data/` goes into that repo's `sw.js` `ASSETS` in the task that creates it (tests/sw.test.js checks). A deleted file leaves `ASSETS` in the same task.

## Review Focus

These five inputs aren't covered by the spec's examples. Each has a test pinned in the task that owns the code:

1. **A quick double tap on an answer button.** The second tap must not answer the next card unseen: the next card shows no answer buttons until it's revealed. (Task 6)
2. **Undo right after Forgot.** The card must not stay in the queue twice. (Tasks 1 and 6)
3. **The app left open past 4 a.m.** The next render starts a new day: a fresh dose, and cards due today included. (Task 6)
4. **Cards for words no longer in the data.** They must not count anywhere: not in counts, mastered numbers or the queue. (Tasks 4 and 6)
5. **Reset progress, then restart.** The old learned marks must not come back. (Task 2)

---

### Task 1: The scheduling engine, `js/srs.js`

**Files:**
- Create in T: `js/srs.js`, `tests/srs.test.js`; add `'js/srs.js'` to `sw.js` ASSETS.
- Copy both files byte for byte to S; add `'js/srs.js'` to S's `sw.js` ASSETS.

**Interfaces:**
- Produces (all pure; `rand` defaults to `Math.random`; days are integers):
  - `Card = { ivl: number, due: number|null, last: 'forgot'|'hard'|'easy'|'new', prev: Card|null }`. `prev` is the state before the last answer, stored without its own `prev`. `undefined` means a card that has never been answered.
  - `DIRS = ['say', 'understand']`, `NEW_PER_DAY = 15`, `MASTERED_DAYS = 21`, `REQUEUE_GAP = 4`
  - `dayOf(ms) → number`: local days since 1970-01-01, where a day starts at 4 a.m.
  - `fuzz(days, rand) → number`
  - `nextInterval(card, grade) → number`: the interval before fuzz; `forgot` gives 0. Used for the button labels.
  - `answer(card, grade, today, rand) → Card`
  - `correct(card, grade, today, rand) → Card`: `grade` may also be `'new'`. It replaces the last answer by applying the grade to `card.prev`.
  - `isNew(card)`: true when `!card` or `card.last === 'new'`. `isKnown(card)`: `ivl >= 1`. `isMastered(card)`: `ivl >= 21`.
  - `status(card, today) → { kind: 'new'|'due'|'later'|'mastered', days }`, where `days` is the time until due (0 when due).
  - `buildQueue(keys, cardOf, today, newLeft, rand) → string[]`
  - `requeue(queue, key) → string[]` and `unqueue(queue, key) → string[]`
  - `Daily = { day, say: { used, extra }, understand: { used, extra } } | null`, with `doseLeft(daily, dir, today) → number`, and `useDose`, `addDose`, `giveBackDose`, each `(daily, dir, today) → Daily`
  - `migrateLearned(learned, today, rand) → { [key]: { say: Card, understand: Card } }`

- [ ] **Step 1: Write the failing tests** in T `tests/srs.test.js`

```js
const fixed = (r) => () => r; // a rand that always returns r
const D = 20000; // any day number

test('a day starts at 4 a.m. local time', () => {
  const at = (d, h, m = 0) => dayOf(new Date(2026, 10, d, h, m).getTime());
  assert.equal(at(23, 3, 59), at(22, 12));
  assert.equal(at(23, 4), at(22, 12) + 1);
});

test('fuzz spreads 2+ day intervals by ±15%, at least ±1 day', () => {
  assert.equal(fuzz(1, fixed(0)), 1);
  assert.deepEqual([fuzz(3, fixed(0)), fuzz(3, fixed(0.5)), fuzz(3, fixed(0.999))], [2, 3, 4]);
  assert.deepEqual([fuzz(20, fixed(0)), fuzz(20, fixed(0.999))], [17, 23]);
});

test('a new card: Forgot today, Hard 1 day, Easy 3 days', () => {
  const r = fixed(0.5); // no fuzz offset
  assert.deepEqual(answer(undefined, 'forgot', D, r), { ivl: 0, due: D, last: 'forgot', prev: null });
  assert.deepEqual(answer(undefined, 'hard', D, r), { ivl: 1, due: D + 1, last: 'hard', prev: null });
  assert.deepEqual(answer(undefined, 'easy', D, r), { ivl: 3, due: D + 3, last: 'easy', prev: null });
});

test('a card with an interval: Hard ×1.2, Easy ×2.5, at least +1 day; Forgot clears it', () => {
  const r = fixed(0.5);
  const c = { ivl: 8, due: D, last: 'easy', prev: null };
  assert.equal(answer(c, 'hard', D, r).ivl, 10);
  assert.equal(answer(c, 'easy', D, r).ivl, 20);
  assert.equal(answer({ ...c, ivl: 1 }, 'hard', D, r).ivl, 2);
  const f = answer(c, 'forgot', D, r);
  assert.deepEqual([f.ivl, f.due], [0, D]);
  assert.equal(answer(f, 'easy', D, r).ivl, 3, 'after Forgot it starts over like a new card');
});

test('an always-Easy card comes back after about 3, 8, 20 and 50 days', () => {
  let c;
  const seen = [];
  for (let i = 0; i < 4; i++) seen.push((c = answer(c, 'easy', D, fixed(0.5))).ivl);
  assert.deepEqual(seen, [3, 8, 20, 50]);
});

test('each answer keeps the state before it, without nesting', () => {
  const a = answer(undefined, 'easy', D, fixed(0.5));
  const b = answer(a, 'hard', D, fixed(0.5));
  assert.deepEqual(b.prev, { ivl: 3, due: D + 3, last: 'easy', prev: null });
});

test('correct replaces the last answer; New can itself be corrected', () => {
  const r = fixed(0.5);
  const a = answer(undefined, 'easy', D, r);
  const b = answer(a, 'easy', D, r); // 8 days
  assert.equal(correct(b, 'hard', D, r).ivl, 4, 'Hard applied to the 3-day state');
  const n = correct(b, 'new', D, r);
  assert.ok(isNew(n));
  assert.equal(correct(n, 'easy', D, r).ivl, 8, 'Easy after a mistaken New applies to the state before it');
  assert.equal(correct(undefined, 'easy', D, r).ivl, 3, 'a never-answered card is answered now');
});

test('status, known and mastered', () => {
  assert.deepEqual(status(undefined, D), { kind: 'new', days: 0 });
  assert.deepEqual(status({ ivl: 3, due: D, last: 'easy', prev: null }, D), { kind: 'due', days: 0 });
  assert.deepEqual(status({ ivl: 3, due: D + 2, last: 'easy', prev: null }, D), { kind: 'later', days: 2 });
  assert.deepEqual(status({ ivl: 21, due: D + 9, last: 'easy', prev: null }, D), { kind: 'mastered', days: 9 });
  assert.equal(isKnown({ ivl: 0, due: D, last: 'forgot', prev: null }), false);
  assert.equal(isMastered({ ivl: 20, due: D, last: 'easy', prev: null }), false);
});

test('nextInterval is the button label: no fuzz', () => {
  assert.deepEqual(['forgot', 'hard', 'easy'].map((g) => nextInterval(undefined, g)), [0, 1, 3]);
  assert.deepEqual(['hard', 'easy'].map((g) => nextInterval({ ivl: 8, due: D, last: 'easy', prev: null }, g)), [10, 20]);
});

test('the queue: due cards oldest first, then new cards in the given order up to the dose', () => {
  const cards = { a: { ivl: 3, due: D - 2, last: 'easy', prev: null }, c: { ivl: 3, due: D, last: 'easy', prev: null }, e: { ivl: 3, due: D + 1, last: 'easy', prev: null } };
  const q = buildQueue(['a', 'b', 'c', 'd', 'e', 'f'], (k) => cards[k], D, 2, fixed(0));
  assert.deepEqual(q, ['a', 'c', 'b', 'd']);
  assert.deepEqual(buildQueue(['b', 'd'], () => undefined, D, 0, fixed(0)), []);
});

test('a Forgot card goes back 4 cards later, or last; unqueue removes it', () => {
  assert.deepEqual(requeue(['a', 'b', 'c', 'd', 'e'], 'x'), ['a', 'b', 'c', 'd', 'x', 'e']);
  assert.deepEqual(requeue(['a'], 'x'), ['a', 'x']);
  assert.deepEqual(unqueue(['a', 'x', 'b', 'x'], 'x'), ['a', 'b']);
});

test('the daily dose: 15 per direction, More adds 15, a new day starts over', () => {
  let d = null;
  assert.equal(doseLeft(d, 'say', D), 15);
  d = useDose(d, 'say', D);
  assert.equal(doseLeft(d, 'say', D), 14);
  assert.equal(doseLeft(d, 'understand', D), 15);
  d = addDose(d, 'say', D);
  assert.equal(doseLeft(d, 'say', D), 29);
  d = giveBackDose(d, 'say', D);
  assert.equal(doseLeft(d, 'say', D), 30);
  assert.equal(doseLeft(d, 'say', D + 1), 15);
});

test('old learned marks become known in both directions, due 1–21 days ahead', () => {
  const lo = migrateLearned({ 'food:x': 1 }, D, fixed(0));
  const hi = migrateLearned({ 'food:x': 1 }, D, fixed(0.999));
  assert.deepEqual(lo['food:x'].say, { ivl: 7, due: D + 1, last: 'easy', prev: null });
  assert.equal(hi['food:x'].understand.due, D + 21);
});
```

- [ ] **Step 2: Run the T tests.** Expected: FAIL, cannot find `js/srs.js`.

- [ ] **Step 3: Implement `js/srs.js` in T.**
  - `dayOf`: shift by 4 hours, then count whole local days:

    ```js
    const d = new Date(ms - 4 * 3600e3);
    return Math.round(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 864e5);
    ```

  - `fuzz(days)`: `spread = max(1, round(days × 0.15))`, then `days + floor(rand × (2 × spread + 1)) − spread`, at least 1. Intervals under 2 days are returned unchanged.
  - The base interval is `card.ivl` for a card that isn't new, otherwise 0.
  - `buildQueue` takes the due keys (not new, `due <= today`), shuffles them with `rand`, then stable-sorts by `due`. The new keys follow in the given order, sliced to `max(0, newLeft)`.
  - `requeue` inserts at index `min(REQUEUE_GAP, queue.length)`.
  - The dose functions treat a `daily` whose `day !== today` as fresh. They never mutate their input.

- [ ] **Step 4: Add `'js/srs.js'` to T's `sw.js` ASSETS.** Run the T tests. Expected: all PASS.

- [ ] **Step 5: Copy both files to S** (`cp` with absolute paths, one call per file) and add `'js/srs.js'` to S's ASSETS. Run the S tests: all PASS. Check that the copies are identical with `git diff --no-index /c/dev/hobby/turkish-app/js/srs.js /c/dev/hobby/swedish-app/js/srs.js`, which should print nothing.

- [ ] **Step 6: Commit both.** Message: `feat: spaced-repetition engine (shared with the other app)`.

### Task 2: Practice data in the store

**Files:**
- Modify: T and S `js/store.js` and `tests/store.test.js`.

**Interfaces:**
- Consumes `dayOf`, `migrateLearned`, `doseLeft`, `useDose`, `addDose`, `giveBackDose` and `DIRS` from Task 1.
- Produces, on `store`, in both apps:
  - `card(key, dir) → Card|undefined` and `setCard(key, dir, card)`, which saves.
  - `doseLeft(dir, today)`, `useDose(dir, today)`, `addDose(dir, today)` and `giveBackDose(dir, today)`, each of which saves.
  - `resetProgress()`: clears the cards and the daily dose, and keeps the migrated flag.
  - `backupText() → string`, giving `{ app, v: 2, cards }` with `app` set to `'turkish'` or `'swedish'`.
  - `parseBackup(text, today) → cards|null`. It accepts v2, and old `{ app, learned }` backups, which it migrates. It refuses another app's backup, broken text, and an object without `cards` or `learned`.
  - `replaceCards(cards)`.
  - `ui.mode` (`'browse'`), `ui.dir` (`'say'`) and `ui.topic` (`'all'`).
- Removed: `learned`, `isLearned`, `toggleLearned`, `replaceLearned`, and `ui.status`.

- [ ] **Step 1: Write the failing tests.** These replace the learned tests (`selecting does not mark learned`, the S backup tests, and S `the Turkish app's progress is not read`). Before the import, seed `saved` with:
  - `{prefix}.learned`: `{ '<a real key>': 1 }`. Use `food:ekmek` for T and `food:bröd` for S.
  - S only: the other app's `tl.learned`.
  - `{prefix}.ui`: `{ tab: 'words', sort: { words: 'todo', patterns: 'learned' }, status: { words: 'learned' } }`.

  The tests:
  - `old learned marks become known in both directions`: both directions of the seeded key have `ivl` 7. In S, `tl.learned`'s key has no card.
  - `migration runs once: Reset progress does not bring old marks back`: call `store.resetProgress()`, then `const again = (await import('../js/store.js?again')).store`. `again.card(key, 'say')` is `undefined`.
  - `saved learned sorts and the status filter are dropped`: `ui.sort.words === 'topic'`, `ui.sort.patterns === 'common'`, `ui.status === undefined`, `ui.mode === 'browse'` and `ui.dir === 'say'`.
  - `setCard saves under {prefix}.practice`: check through `JSON.parse(saved.get(...)).cards[key].say.last`.
  - `the daily dose is saved and starts over on a new day`.
  - `a v2 backup round-trips; an old learned backup is migrated; another app's, broken or empty backups are refused`. T: `{"app":"turkish","learned":{…}}` is accepted. S: `{"app":"turkish",…}` is refused, and so is the reverse in T.

- [ ] **Step 2: Run them in each repo.** Expected: FAIL (`store.card is not a function`).

- [ ] **Step 3: Implement.**
  - Storage key `{prefix}.practice` holds `{ migrated, cards, daily }`.
  - On load: if `migrated` is not set, run `cards = migrateLearned(old learned map, dayOf(Date.now()))`, set `migrated = true` and save. The old map stays in storage.
  - Sanitise `ui` on load: a `todo` or `learned` sort goes back to the default (`common` for patterns, `topic` for words), and `status` is deleted.
  - In T, move the backup JSON out of `app.js` into `backupText`/`parseBackup`. The app.js call sites change in Task 5. Until then, keep T's `set-backup`/`set-restore` code compiling by pointing it at `store.backupText()`.

- [ ] **Step 4: Run both suites.** `store.test.js` passes. `tests/app.test.js` (T and S) and `examples` may now fail on `isLearned`/`toggleLearned`. Allowed until Task 4: record the failing test names in the ledger.

- [ ] **Step 5: Commit both.** Message: `feat: practice data in the store; old learned marks migrate once`.

### Task 3: The practice screen's HTML, `js/practiceview.js`

**Files:**
- Create: T and S `js/practiceview.js` and `tests/practiceview.test.js`. Add `'js/practiceview.js'` to both ASSETS lists.
- Modify: S `js/metin.js`, adding `T.practice`.

**Interfaces:**
- Consumes `status`'s result shape from Task 1.
- Produces (pure, everything escaped):
  - `Face = { native, target, say, dot, icon, hint, forms, note, variant: { native, target }|null, example: { native, target, hint }|null }`. In T, `hint` and `forms` are always null.
  - `cardHtml(face, { dir, revealed, previews: { forgot, hard, easy }, canUndo }) → string`:
    - The front is the native text (say) or the target text with a speaker and its hint (understand).
    - Until revealed, it's wrapped in an element with `data-act="reveal"`.
    - Once revealed, it adds the back: the other side, the target with a speaker, the hint and forms (S), the note, the variant form, and the example with a speaker.
    - Then three `<button class="grade <grade>" data-grade="<grade>">` with the label and the interval under it.
    - `data-act="undo"` appears only while `canUndo`.
  - `doneHtml({ newToday, canMore, nextIn })`: "done for today", today's new-card count, a `data-act="more"` button while `canMore`, and "All caught up here. Next review in N days" when `!canMore && nextIn != null`.
  - `recallHtml(rows)`, where `rows = [{ dir, label, st, last }]`. Each row shows the label and the status text, then four `<button data-act="recall" data-dir="<dir>" data-grade="new|forgot|hard|easy">`. The button whose grade is `last` (or `new`) has class `on`.
  - `intervalText(days)`, `statusText(st)` and `countsText(due, fresh)`.
- Text in T (inline English):
  - Answers: Forgot / Hard / Easy. Reveal: "Show answer". Undo: "↶ Undo".
  - Intervals: "today", "1 day", "~N days", and "~N months" for 60 days or more (`round(N / 30)`).
  - Status: "New", "Due today", "Next in N days", "Mastered · next in N days".
  - Done screen: "Done for today 🎉", "N new cards today", "More new cards".
  - Title row: "N due · M new". Window section heading: "Practice".
- Text in S (`T.practice`, in Turkish):
  - `modes`: `{ browse: 'Göz at', practice: 'Çalış' }`. `dirs`: `{ say: 'TR → SV', understand: 'SV → TR' }`.
  - `grades`: `{ forgot: 'Bilemedim', hard: 'Zor', easy: 'Kolay' }`. `show`: `'Cevabı göster'`. `undo`: `'↶ Geri al'`.
  - `today`: `'bugün'`. `days(n)`: `'1 gün'` for 1, otherwise `'~n gün'`. `months(n)`: `'~n ay'`.
  - `status`: `{ new: 'Yeni', due: 'Bugün tekrar', later: (n) => \`${n} gün sonra\`, mastered: (n) => \`Ezberlendi · ${n} gün sonra\` }`.
  - `done`: `'Bugünlük bu kadar 🎉'`. `newToday(n)`: `` `Bugün ${n} yeni kart` ``. `more`: `'Daha fazla yeni kart'`.
  - `caughtUp(n)`: `` `Burada her şey tamam. Sonraki tekrar ${n} gün sonra.` ``.
  - `counts(d, f)`: `` `${d} tekrar · ${f} yeni` ``. `title`: `'Çalışma'`. The wife proofreads all of these.

- [ ] **Step 1: Write the failing tests** (in each repo's own language):
  - `the say side shows the native text and hides the answer until revealed`: there's a `data-act="reveal"`, no `data-grade`, and the target text is absent.
  - `revealed: the other side, a speaker, the example and three answers with their intervals`. With previews `{ forgot: 0, hard: 1, easy: 3 }`, the output includes `today`, `1 day` and `~3 days` (S: `bugün`, `1 gün`, `~3 gün`).
  - `the understand side starts from the target text with a speaker`, plus, in S, its hint.
  - `a pattern card's back shows the chosen variant's form`.
  - `Undo shows only when there is something to undo`.
  - `done: More while unseen cards remain; otherwise when the next review is`.
  - `the window's Practice section highlights each direction's last answer`: two rows and eight buttons. `last: undefined` highlights New.
  - `long intervals read in months`: `intervalText(90)` gives `~3 months` / `~3 ay`.
  - `text is escaped`.
  - S: `T.practice` strings pass `tests/turkce.test.js`, which runs anyway.

- [ ] **Step 2: Run the tests.** Expected: FAIL, module not found.
- [ ] **Step 3: Implement both modules and S `T.practice`.** Add the files to ASSETS.
- [ ] **Step 4: Run the suites.** The new tests pass. Only the Task 2 ledgered failures remain.
- [ ] **Step 5: Commit both.** Message: `feat: practice card, done screen and recall section HTML`.

### Task 4: Browse mode without "learned"

**Files:**
- Modify: T and S `index.html`, `js/app.js`, `js/examples.js`, `css/app.css`, `sw.js` (remove `js/swipe.js`), `tests/examples.test.js` and `tests/app.test.js`.
- Modify S `js/metin.js`: remove `status`, the `todo`/`learned` sorts, `learn`, `aria.learnedSuffix`, and the `progress` function. Add `mastered(n, total)` → `` `${n} / ${total} ezberlendi` ``.
- Delete: T and S `js/swipe.js` and `tests/swipe.test.js`.

**Interfaces:**
- Consumes `store.card` from Task 2, and `DIRS`, `isKnown` and `isMastered` from Task 1.
- Produces in app.js:
  - `known(x) = DIRS.some((d) => isKnown(store.card(keyOf(x), d)))`
  - `mastered(x) = DIRS.every((d) => isMastered(store.card(keyOf(x), d)))`
- `examples.js` renames its option `isLearned` to `isKnown` in both functions (and their comments). The tests follow the rename.

- [ ] **Step 1: Write the failing tests.**
  - `tests/examples.test.js`: rename `isLearned` to `isKnown` throughout, so the tests fail until examples.js follows.
  - T and S `tests/app.test.js`:
    - `the word list has no learned look and counts mastered words`: no `class="block on`. The progress text is `0 / <WORDS.length> mastered` (S: `ezberlendi`). A card saved with `ivl` 30 in both directions for one word before the import makes it `1 / …`.
    - `cards for words that no longer exist count nowhere`: seed `{prefix}.practice` with a card for `food:gone` before the import, and check the count is unchanged.
    - `the status filter and the learned sorts are gone`: `#sort` has no `todo`/`learned` option.
  - Remove the S `app.test.js` line that expects `/öğrenildi$/`.

- [ ] **Step 2: Run the tests.** Expected: the new and renamed tests FAIL.

- [ ] **Step 3: Implement.**
  - Remove `#status` from index.html and its handler from app.js.
  - Remove the swipe wiring, `setLearned`, the learned toasts, and the learned and `aria` suffix in `blockHtml`.
  - Topic headers count mastered words. The browse progress line shows mastered.
  - `exampleOpts()` passes `isKnown: known`. `askAi` uses `known` wherever it used `learned`.
  - CSS: remove `.block.on`, `.block.on.sel`, `.to-on`, `.to-off`, `.dragging`, `.block.on …` and `touch-action: pan-y` on `.block`.
  - T's `SORTS` and S's `T.sorts` lose `todo` and `learned`.

- [ ] **Step 4: Run both suites.** Expected: all PASS except anything Task 5 owns (the sheet's learn button, settings). Ledger any such failure by name.

- [ ] **Step 5: Commit both.** Message: `feat: browse mode without learned marks; examples prefer known items`.

### Task 5: The window's Practice section, and Settings

**Files:**
- Modify: T and S `js/app.js`, `css/app.css` and `tests/app.test.js`. Also S `js/metin.js`: add `settings.progressText` worded for mastered, `settings.confirmRestore`, and a new `confirmReset`.

**Interfaces:**
- Consumes `correct`, `status` and `dayOf` from Task 1; `card`, `setCard`, `backupText`, `parseBackup`, `replaceCards` and `resetProgress` from Task 2; and `recallHtml` from Task 3.

- [ ] **Step 1: Write the failing tests** (T and S `tests/app.test.js`):
  - `a word window shows both directions' recall state with New highlighted`: two `data-dir` rows, and the `new` buttons have `on`.
  - `tapping Easy in the window answers that direction now`. Click with `target.closest('[data-act]')` returning `{ dataset: { act: 'recall', dir: 'say', grade: 'easy' } }`. The saved card's `last` is `easy`, and `doseLeft('say', today)` is still 15.
  - `tapping New puts it back to new, and tapping Easy again restores it`.
  - `Settings shows mastered counts; Reset clears practice data`.
  - `Restore asks first`: with `confirm` stubbed to return false, the cards are unchanged.

- [ ] **Step 2: Run the tests.** Expected: FAIL.

- [ ] **Step 3: Implement.**
  - `headHtml` drops the learn button and appends `recallHtml`. Each row's `label` is the direction label (T: `EN → TR`/`TR → EN`; S: `T.practice.dirs`).
  - The `recall` act sets the card with `correct(…, dayOf(Date.now()), Math.random)` and redraws the sheet, keeping `sheet.scrollTop`.
  - The `toggle` act is removed.
  - Settings use the store API: progress counts use `mastered`; Restore runs `confirm(...)` before `replaceCards`; Reset uses `resetProgress`.
  - CSS for `.recall`.

- [ ] **Step 4: Run both suites.** Expected: all PASS.
- [ ] **Step 5: Commit both.** Message: `feat: recall state in the window; backup, restore and reset for practice data`.

### Task 6: Practice mode

**Files:**
- Modify: T and S `index.html`: in `.row`, put `<div class="seg" id="mode" role="group" aria-label="…">` with `data-mode="browse|practice"` buttons, then `<select id="sort">`, then a `<button id="dir" class="dir-btn" hidden>`.
- Modify: T and S `js/app.js`, `css/app.css` and `tests/app.test.js`.

**Interfaces:**
- Consumes everything above.
- Session state in app.js, at module level: `session = { sig, queue, face, revealed, undo }`.
  - `sig` is `` `${tab}|${chip}|${dir}|${today}` ``, so changing any of these, or the day, rebuilds the queue (Review Focus 3).
  - `undo` is `{ key, dir, before, wasNew } | null`.
- `selectionKeys()`:
  - On Words, `BY_COMMON` filtered by `ui.topic`, mapped to ids.
  - On Patterns, `PATTERNS` (rank order) filtered by `ui.pgroup`, mapped to keys.
  - Only items that exist in the data, so orphaned cards never enter (Review Focus 4).
- `faceOf(x)` is app-specific and runs once per card shown, so revealing doesn't change the example:
  - Words use `w.ex`, or else `wordExamples(...).examples[0]`, or else null.
  - Patterns use a random variant that has `ex`, and a random one of its `ex`.

- [ ] **Step 1: Write the failing tests** (T and S `tests/app.test.js`, driving `#mode`, `#dir`, `#types` and `#list` clicks through the stub):
  - `Practice shows the most common word's native text and hides the search row`.
  - `revealing shows three answers; answering Easy saves the card and shows the next one, unrevealed`. The next card's HTML has no `data-grade` (Review Focus 1).
  - `Forgot brings the card back 4 cards later`.
  - `Undo after Forgot restores the card and leaves it in the queue once` (Review Focus 2).
  - `after 15 new cards: Done for today with More; More gives 15 more`.
  - `the direction switch flips the front to the target language`.
  - `a topic chip limits practice to that topic`.
  - `the title row shows due and new counts`.
  - `a new day starts a new dose`: call `store.useDose` 15 times for `today`, then fake tomorrow by overriding `Date.now` in the test. Render: the dose is back and the queue is rebuilt.

- [ ] **Step 2: Run the tests.** Expected: FAIL.

- [ ] **Step 3: Implement.**
  - `renderControls` in practice mode:
    - `#mode` buttons are `on`.
    - `.search-row`, `#sort` and `#clear-sel` are hidden; `#dir` is shown with the direction label.
    - Chips are the topics (`data-topic`) on Words and the groups on Patterns.
  - `renderList` in practice mode renders the card or the done screen.
  - The progress line uses `countsText(due, min(doseLeft, unseen))`.
  - `#list` clicks in practice mode:
    - `data-act="reveal"`: reveal the card.
    - `data-grade`: answer the card. Use `useDose` when the card was new, `requeue` on Forgot, then set `undo`.
    - `data-act="undo"`: restore `before`, give back the dose when `wasNew`, `unqueue`, then put the key at the front.
    - `data-act="more"`: run `addDose`, then rebuild.
    - `data-say`: speak.
  - Browse mode's block selection is unchanged.
  - CSS:
    - Answer colours are tokens `--forgot` (red), `--hard` (orange) and `--easy` (green), with light and dark values.
    - The card is centred in `main` and its text wraps.
    - `.dir-btn` matches `#sort`'s look.

- [ ] **Step 4: Run both suites.** Expected: all PASS.
- [ ] **Step 5: Commit both.** Message: `feat: practice mode — cards, answers, daily dose, undo, both directions`.

### Task 7: Release

**Files:**
- Modify: T and S `sw.js` (CACHE `turkish-v13` / `swedish-v3`), `tests/sw.test.js` (the activate test's cache names), and `README.md`. In the README, replace the swipe and learned lines with a short "Browse and Practice" section: the two modes, the directions, the three answers, the daily 15 with More, and fixing an answer from a word's window.

- [ ] **Step 1: Update the `sw.test.js` activate tests.** T lists `['turkish-v12', 'swedish-v2', 'turkish-v13', 'other']` and expects `['turkish-v12']` to be deleted. S lists `['swedish-v2', 'turkish-v13', 'swedish-v3']` and expects `['swedish-v2']`. Run them: FAIL.
- [ ] **Step 2: Bump CACHE in both apps and update the READMEs.** Run both suites: all PASS. Check that `git diff --no-index` on `js/srs.js` and `tests/srs.test.js` between the repos prints nothing.
- [ ] **Step 3: Commit both.** Message: `chore: practice mode release; cache v13 / v3; README`.
