# Selection headings, silent-mode sound, top row clear of Safari's blur Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give sentences from the selection their own heading with a "Not used here" line, play a silent clip before speaking so iPhone silent mode does not mute speech, and move the top row below iOS 26 Safari's top blur.

**Architecture:** `js/examples.js` returns the card's rows in sections (`selected`, `notUsed`, `examples`) and `js/app.js` renders the headings. A new pure module `js/sound.js` builds the silent WAV so it is tested in Node; `app.js` plays it before `speechSynthesis.speak` on iPhone and iPad. The top-row offset is CSS, with a `standalone` class set from JS for the home-screen app.

**Tech Stack:** Plain HTML/CSS/ES modules, no build step, `node:test`.

**Spec:** `docs/superpowers/specs/2026-11-21-selection-feedback-design.md`

## Global Constraints

- No frameworks, no build step, no new dependencies. Saved data keys and ids unchanged.
- Exact copy: headings `From your selection` and `Examples`; note `Not used here: ` followed by the items joined with `, ` (pattern card: each word's `tr`; word card: each pattern's `en`).
- Offline cache → `turkish-v6`; every file under `js/` and `data/` stays listed in `sw.js` `ASSETS` (the sw test enforces it).
- Silent clip: 0.05 s, 8 kHz, 8-bit mono PCM WAV of silence (sample value 128), played on iPhone/iPad only, before `speechSynthesis.speak`, and never blocking it.
- Safari tab: the top row starts 40 px below the top of the page (10 px today); the home-screen app keeps `calc(env(safe-area-inset-top) + 10px)`.
- Tests: `"/c/Program Files/nodejs/node.exe" --test tests/` (baseline: 75 passing).
- Browser checks: `"/c/Program Files/nodejs/node.exe" tools/serve.mjs` and headless Edge driven over the DevTools protocol at 390 × 844.

## Review Focus

- A form with no templates shows only its hand-written examples under "Examples", and lists every selected word under "Not used here". (Task 1 test.)
- A selected word that fits one form of a pattern but not another appears in the first and is listed as not used in the second. (Task 1 test.)
- With nothing relevant selected (no words on a pattern card, no patterns on a word card), no "From your selection" heading appears. (Task 1 test + browser check.)
- The silent clip is a well-formed WAV; a malformed one makes `play()` reject and changes nothing on the phone. (Task 2 test.)
- Speech still plays when the clip cannot play (desktop, or `play()` rejected): `speak` is called regardless. (Task 2 browser check.)

---

### Task 1: "From your selection" section with a "Not used here" line

**Files:**
- Modify: `js/examples.js`, `tests/examples.test.js`, `js/app.js` (`examplesHtml`, `patternSheet`, `wordSheet`), `css/app.css` (sheet section)

**Interfaces:**
- Produces (replacing today's flat `Row[]` return):
  - `patternExamples(p, vi, opts) → { selected: Row[], notUsed: Word[], examples: Row[] }`. `selected`: one row per selected word that fits the form (as today). `notUsed`: selected words not used in this form (they do not fit, or the form has no templates), in `words` order. `examples`: hand-written (minus any equal to a generated row) then extras.
  - `wordExamples(w, opts) → { selected: Row[], notUsed: Pattern[], examples: Row[] }`. `notUsed`: selected patterns the word fits in none of their templated forms, in `patterns` order.
  - `opts` unchanged: `{ words | patterns, isSelected, isLearned, rand }`.

- [ ] **Step 1: Update the tests to the new shape.** The existing 11 tests keep their assertions but read `res.selected` / `res.examples` instead of a flat array (for example `rows.slice(0, 2)` → `res.selected`; `rows[1]` → `res.examples[0]`; generated extras → `res.examples.filter((r) => r.trParts)`). Add:
  - `a selected word that does not fit a form is listed as not used`: su and gelmek selected, `want` form 0 → `notUsed` deep-equals `[gelmek]`, `selected` has one row `Su istiyorum.`.
  - `a form without templates lists every selected word as not used`: çay and gelmek selected, `want` form 1 → `selected` is `[]`, `notUsed` deep-equals `[cay, gelmek]`, `examples` deep-equals `[{ tr: 'Bir çay, lütfen.', en: 'A tea, please.' }]`.
  - `with nothing selected there is no selection section`: `want` form 0, nothing selected → `selected` and `notUsed` both `[]`.
  - `a word card lists selected patterns the word fits in no form as not used`: çay with `order` and `where` selected → `notUsed` deep-equals `[where]`, `selected` has 2 rows.
- [ ] **Step 2: Run, watch them fail** (shape mismatch: `res.selected` undefined).
- [ ] **Step 3: Implement** the new return shape in `js/examples.js`; the dedupe and the extras pool are unchanged.
- [ ] **Step 4: Run, pass; full suite green** (75 + 4).
- [ ] **Step 5: Render.** `examplesHtml(res, label)` in `app.js`: when `selected.length || notUsed.length`, a `From your selection` heading, the selected rows, then `<p class="not-used">Not used here: …</p>` if `notUsed` is not empty (`label` is `(w) => w.tr` on pattern cards and `(p) => p.en` on word cards, escaped); then, when `examples` is not empty, an `Examples` heading and those rows. `.not-used`: `--faint` colour, 13 px, small margin.
- [ ] **Step 6: Browser check:** select su, çay, gelmek, ev and open "I want ___": each templated form has "From your selection" with Su and Çay, then "Not used here: gelmek, ev" (plus any other non-fitting ones); forms are followed by "Examples". Select two patterns, one that fits çay and "Where is ___?", open çay: "Not used here: Where is ___?". Clear the selection and open a pattern: no "From your selection" heading. No console errors.
- [ ] **Step 7: Commit** `feat: "From your selection" heading with a "Not used here" line`.

### Task 2: Silent clip before speaking

**Files:**
- Create: `js/sound.js`, `tests/sound.test.js`
- Modify: `js/app.js` (`speak`), `sw.js` (add `'js/sound.js'` to `ASSETS`)

**Interfaces:**
- Produces: `silentWav(ms = 50, rate = 8000) → Uint8Array` in `js/sound.js`: a 44-byte RIFF/WAVE header (PCM, mono, 8-bit) followed by `rate * ms / 1000` bytes of value 128.

- [ ] **Step 1: Failing test** `silentWav builds a valid 0.05 s silent WAV`: length 444; ASCII `RIFF` at 0, `WAVE` at 8, `fmt ` at 12, `data` at 36; little-endian RIFF size 436 at 4, fmt size 16 at 16, format 1 at 20, channels 1 at 22, sample rate 8000 at 24, byte rate 8000 at 28, block align 1 at 32, bits 8 at 34, data size 400 at 40; every byte from 44 on is 128.
- [ ] **Step 2: Run, watch it fail** (module missing). **Step 3: Implement.** **Step 4: Run, pass.** The sw test now fails on `js/sound.js`; add it to `ASSETS`; suite green.
- [ ] **Step 5: Wire into `speak()`.** Build the data URI once (`data:audio/wav;base64,` + base64 of `silentWav()`). `isAppleTouch`: `/iP(hone|ad|od)/` in the user agent, or `MacIntel` with `maxTouchPoints > 1`. In `speak()`, after setting `navigator.audioSession.type`, on Apple touch devices only: reuse one `Audio` element, set `currentTime = 0`, call `play()` and swallow its rejection; then call `speechSynthesis.speak(u)` without awaiting the clip.
- [ ] **Step 6: Browser check:** in Edge, a speaker tap calls `speechSynthesis.speak` (spy) with no errors; with the user agent overridden to an iPhone, `HTMLMediaElement.prototype.play` is called before `speechSynthesis.speak` (spy order), and `speak` still runs when `play` rejects.
- [ ] **Step 7: Commit** `fix: play a silent clip before speaking so iPhone silent mode does not mute it`.

### Task 3: Top row clear of Safari's blur, cache v6

**Files:**
- Modify: `css/app.css` (`.top` padding), `js/app.js` (set the `standalone` class at startup), `sw.js` (`CACHE = 'turkish-v6'`)

- [ ] **Step 1: Standalone class.** At startup, before the first render: `document.documentElement.classList.toggle('standalone', navigator.standalone === true || matchMedia('(display-mode: standalone)').matches)`.
- [ ] **Step 2: Padding.** Token `--top-clear: 30px`. `.top` padding-top: `calc(env(safe-area-inset-top) + 10px + var(--top-clear))`; `.standalone .top` padding-top: `calc(env(safe-area-inset-top) + 10px)`. The bar's background still starts at the very top.
- [ ] **Step 3: Cache.** `sw.js` → `turkish-v6`.
- [ ] **Step 4: Browser check:** in the Safari-like default, the top of `#gear` is 40 px from the top of the page and the bar's gradient fills the space above it; with `standalone` added to `<html>`, it is 10 px. Screenshots in light and dark. Full suite green.
- [ ] **Step 5: Commit** `fix: start the top row below iOS 26 Safari's top blur`.
- [ ] **Step 6: Ask the user** to push, then check on the iPhone in Safari: the gear is fully sharp, and a speaker tap plays with silent mode on.
