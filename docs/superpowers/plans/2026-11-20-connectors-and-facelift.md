# Connectors, pattern groups and facelift Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add 27 common connector patterns (plus variants and connector words), group the Patterns tab with chips, and restyle the UI to white cards with borders and shadows.

**Architecture:** Content stays data-driven (`data/patterns.js`, `data/words.js`) and is validated by the existing content tests, which render every template with every fitting word. One engine change: `fits()` accepts words with several kinds (`kind: 'room|event'`). Grouping is a `group` field per pattern plus a chip row in `js/app.js`. The facelift is CSS only, with dark mode kept.

**Tech Stack:** Plain HTML/CSS/ES modules, Node built-in test runner.

**Spec:** `docs/superpowers/specs/2026-11-20-connectors-and-facelift-design.md`

## Global Constraints

- Common connectors only; no rare or literary forms.
- Existing word and pattern ids must not change (saved progress is keyed by id).
- No new dependencies; no build step.
- Run tests with `"/c/Program Files/nodejs/node.exe" --test tests/` from the repo root.
- Nothing is pushed to GitHub until the user has seen screenshots and agreed.
- Commits on branch `connectors-and-facelift`, ending with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## Review Focus

- A phone that already has saved progress and UI settings from v1 opens v2: green marks stay, and the missing `pgroup` setting defaults to `all`. (Task 2: ids test; store merge already adds missing top-level keys.)
- The phone's offline cache holds v1 files: after deploy it must not run a mix of old and new modules. (Task 6: bump the cache name.)
- Group chip + status filter + search can combine to an empty list: the existing "Nothing here" message shows. (Task 2: manual check in the screenshot step.)
- Long connector names ("Whenever / whatever you ___") wrap inside two-column cards at 390 px without overlapping the check circle. (Task 5: screenshot.)
- Dark mode keeps readable contrast after the facelift. (Task 5: dark screenshot.)

---

### Task 1: Words with several kinds

**Files:**
- Modify: `js/combine.js` (`fits`)
- Test: `tests/combine.test.js`

**Interfaces:**
- Produces: `fits(slot, word)` treats `word.kind` as a `|`-separated list; a word fits when any of its kinds is in the slot.

- [ ] **Step 1: Write the failing test** `fits accepts a word with several kinds`: `fits('noun:event', n('iş','work',{kind:'room|event'}))` is `true`; `fits('noun:room', same)` is `true`; `fits('noun:place', same)` is `false`.
- [ ] **Step 2: Run tests, expect that one to fail.**
- [ ] **Step 3: Implement** the split in `fits`.
- [ ] **Step 4: Run tests, all pass.**
- [ ] **Step 5: Commit** `feat: words can have several kinds`.

### Task 2: Pattern groups and chips

**Files:**
- Modify: `data/patterns.js` (add `group` to every pattern), `js/app.js` (chips on the Patterns tab), `js/store.js` (default `pgroup: 'all'`)
- Test: `tests/content.test.js`

**Interfaces:**
- Produces: `export const GROUPS = { everyday: 'Everyday', verbs: 'Verbs & tenses', connectors: 'Connectors' }` in `data/patterns.js`; every pattern has `group` ∈ keys of `GROUPS`; `store.ui.pgroup` ∈ `'all' | keyof GROUPS`.

- [ ] **Step 1: Write failing tests** in `content.test.js`: `every pattern has a known group`; `existing ids are unchanged` (asserts these exist: `p:want`, `p:before`, `p:until`, `p:because`, `p:must`, `p:lets`, `food:ekmek`, `work:iş`, `time:bugün`, `numbers:dört`).
- [ ] **Step 2: Run tests, expect the group test to fail.**
- [ ] **Step 3: Add `GROUPS` and `group` fields.** Everyday: want, var, where, price, iam, very, have, need, this, my, going, at, isit, thanks, seeyou, clock, howto, looking, from, hurts, by, withwithout, like, think, more, nextlast, howmany. Verbs: wantto, can, now, past, must, lets, please, future, dont, habit, should, knowhow, likedoing, try, start, forgot, timeto, ever. Connectors: when, if, because, before, after, while, until, assoon, inorder, instead.
- [ ] **Step 4: Add the chip row** to the Patterns tab, reusing the `#types` element and `.chip` styles; filter `visibleItems` by `ui.pgroup`; keep Words chips unchanged.
- [ ] **Step 5: Run tests, all pass. Commit** `feat: group patterns with chips`.

### Task 3: New words and kinds

**Files:**
- Modify: `data/words.js`, `data/patterns.js` (slot `seeyou` → `'*:time|day|today|soon'`)

- [ ] **Step 1: Add words:** travel `trafik` (traffic, kind `cause`); feelings `genç` (young, `feel`); Little words (type `other`, each with `ex`): bu yüzden, o yüzden, yani, ayrıca, bu arada, neyse, o zaman, yoksa, sonunda, hatta, sanki, ondan sonra.
- [ ] **Step 2: Retag kinds:** `iş` → `room|event`; yemek, kahvaltı, öğle yemeği, akşam yemeği → `food|meal` with `the` = meal name (yemek: `the meal`); çocuk, bebek → `person|life`, öğrenci → `person|life`; bugün, yarın → `today`; sonra, yakında → `soon`; days get `the` = English day name; `dört` gets `soft: 'dörd'`.
- [ ] **Step 3: Run tests, all pass** (content tests catch broken slots). Commit `feat: connector words and new kinds`.

### Task 4: Connector patterns and variants

**Files:**
- Modify: `data/patterns.js`

- [ ] **Step 1: Add the 27 blocks from the spec** with `group: 'connectors'` (apparently, might, wish, whydont, plan, tiredof, keepdoing, aboutto → `verbs`). Slots: verb connectors `verb`; *-ken* variants `adj:feel|any`, `noun:life`, `noun:place|room|area`; *-den beri* noun variant `*:time|day|past`; *rağmen* noun `noun:weather|issue|cause`; *yüzünden* `noun:weather|issue|event|cause`; *sayesinde*, *-e göre*, *-imle* `noun:person`; *gibi* `noun:person|animal`; *-den fazla* `noun:unit|period`; *o kadar … ki* `adj:feel|any` and `adj:desc|any`; *hem* `noun:food`, *ya* `noun:day`; *ne … ne* and *keşke -seydim* have fixed examples only.
- [ ] **Step 2: Add variants to existing blocks:** before/after `___-den önce/sonra` slot `noun:event|meal|day`; until `___-e kadar` slot `*:time|day|today` and `Saat ___-e kadar` slot `*:hour`; must `-mak zorundayım`; lets `-sin`; because `-diği için`.
- [ ] **Step 3: Insert new blocks into the "most useful" order** by everyday frequency (might, apparently, whenever, as-you-said, since, because-of near the top of the connectors).
- [ ] **Step 4: Run tests, all pass. Read `tools/sample.mjs` output for every new block and fix any wrong Turkish or English.**
- [ ] **Step 5: Commit** `feat: 27 connector patterns`.

### Task 5: Facelift

**Files:**
- Modify: `css/app.css` (tokens and component styles), `js/app.js` only if example rows need a wrapper class

- [ ] **Step 1: Restyle** with the spec's light values: page `#f7f8fa`, cards `#ffffff`, border `#e2e4e9`, shadow `0 1px 2px rgba(16,24,40,.05), 0 2px 6px rgba(16,24,40,.05)`, text `#111418`, secondary `#5b6270`; learned = green border + faint green tint + filled check; white bordered controls; dark chip selected; white header with bottom border; examples in light bordered rows; dark mode equivalents.
- [ ] **Step 2: Screenshot** Patterns (with Connectors chip), Words, a pattern card and dark mode at 390 × 844 via headless Edge; check wrapping, contrast, and the empty-state message.
- [ ] **Step 3: Commit** `feat: white card facelift`.

### Task 6: Ranks, cache, docs

**Files:**
- Modify: `data/ranks.js` (regenerate), `sw.js` (`CACHE = 'turkish-v2'`), `README.md` (counts)

- [ ] **Step 1: Regenerate ranks** with `tools/rank-words.mjs`.
- [ ] **Step 2: Bump the cache name and update README counts.**
- [ ] **Step 3: Run the full test suite, all pass. Commit** `chore: ranks, cache version, docs`.
