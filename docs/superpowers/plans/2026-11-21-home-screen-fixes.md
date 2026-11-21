# Auto-reload, honest sound hint, top row clear of the blur Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reload once when a new version takes over, replace the failed silent-mode workaround with a once-per-launch hint, and give the home-screen app the same extra room above the top row as a Safari tab.

**Architecture:** A new pure module `js/update.js` watches a service-worker container for a controller change and is tested in Node with a fake container. The sound hint and the padding are small changes in `js/app.js` and `css/app.css`.

**Tech Stack:** Plain HTML/CSS/ES modules, no build step, `node:test`.

**Spec:** `docs/superpowers/specs/2026-11-21-home-screen-fixes-design.md`

## Global Constraints

- No new dependencies; saved data keys and ids unchanged.
- Exact copy: toast `No sound? Turn off silent mode`, shown about 3000 ms.
- Offline cache → `turkish-v7`; every file under `js/` and `data/` listed in `sw.js` `ASSETS` (the sw test enforces it).
- Top row: padding-top `calc(env(safe-area-inset-top) + 10px + var(--top-clear))` everywhere, `--top-clear: 40px`.
- Tests: `"/c/Program Files/nodejs/node.exe" --test tests/` (baseline: 79 passing).
- Browser checks: `tools/serve.mjs` plus headless Edge over the DevTools protocol at 390 × 844.

## Review Focus

- A page that had no earlier version in control (first install) must not reload. (Task 1 test.)
- A controller change must reload at most once per page, even if the event fires again. (Task 1 test.)
- The sound hint shows once per launch on iPhone/iPad, never on desktop, and the speech still starts. (Task 2 browser check.)
- Removing `js/sound.js` must also remove it from the offline cache list, or the service worker install fails. (Task 2: sw test.)
- The home-screen app and a Safari tab both start the top row 50 px below the safe area. (Task 3 browser check.)

---

### Task 1: Reload once when a new version takes over

**Files:**
- Create: `js/update.js`, `tests/update.test.js`
- Modify: `js/app.js` (service-worker registration at the end), `sw.js` (add `'js/update.js'` to `ASSETS`)

**Interfaces:**
- Produces: `reloadOnUpdate(container, reload)` in `js/update.js`. `container` is a `ServiceWorkerContainer`-like object (`controller`, `addEventListener`). If `container.controller` is set when called, the first `controllerchange` calls `reload()`; later ones do nothing. If no controller was set, it never reloads.

- [ ] **Step 1: Failing tests** in `tests/update.test.js`, with a fake container built on `EventTarget` plus a `controller` field: `a new version taking over reloads the page once` (controller set, two `controllerchange` events → `reload` called exactly once); `the first install does not reload` (controller `null`, one event → not called).
- [ ] **Step 2: Run, watch them fail** (module missing). **Step 3: Implement.** **Step 4: Run, pass**; the sw test then flags `js/update.js`: add it to `ASSETS`; suite green.
- [ ] **Step 5: Wire it** in `app.js`: inside the existing `serviceWorker` / https check, call `reloadOnUpdate(navigator.serviceWorker, () => location.reload())` before `register`.
- [ ] **Step 6: Commit** `feat: reload once when a new version takes over`.

### Task 2: Once-per-launch sound hint instead of the silent clip

**Files:**
- Delete: `js/sound.js`, `tests/sound.test.js`
- Modify: `js/app.js` (`speak`, `toast`), `sw.js` (remove `'js/sound.js'`)

- [ ] **Step 1: Remove the workaround.** Delete the silent clip (`SILENCE`, `silence`, the `play()` call, the `silentWav` import), the `navigator.audioSession` setting, `js/sound.js`, `tests/sound.test.js`, and its `ASSETS` entry. Keep `isAppleTouch`.
- [ ] **Step 2: Hint.** `toast(message, ms = 1500)`. In `speak()`, on Apple touch devices only, the first call after launch shows `toast('No sound? Turn off silent mode', 3000)` (a module-level flag); `speechSynthesis.speak` still runs.
- [ ] **Step 3: Browser check:** desktop user agent → speaker taps show no hint; iPhone user agent (set before load) → first tap shows the toast text, a second tap does not, and `speechSynthesis.speak` runs both times (spy); reload → the hint shows again on the first tap; no requests for `js/sound.js`; no console errors. Full suite green (79 − 1 + 2 from Task 1 = 80).
- [ ] **Step 4: Commit** `fix: drop the silent-clip workaround, hint about silent mode once per launch`.

### Task 3: Top row clear of the blur in the home-screen app too

**Files:**
- Modify: `css/app.css` (`.top`, `--top-clear`, remove `.standalone .top`), `js/app.js` (remove the `standalone` class line), `sw.js` (`CACHE = 'turkish-v7'`)

- [ ] **Step 1:** Browser check first, expecting failure: with `html.standalone` the gear is 10 px below the bar's top (today); the target is 50 px in both modes.
- [ ] **Step 2:** `--top-clear: 40px`; remove `.standalone .top` and the class toggle in `app.js`; update the `.top` comment (iOS 26 blurs a strip below the status bar in the home-screen app and at the top of a Safari tab).
- [ ] **Step 3:** Cache `turkish-v7`.
- [ ] **Step 4: Browser check:** the gear is 50 px below the bar's top, the bar's background starts at y = 0, screenshots light and dark; full suite green.
- [ ] **Step 5: Commit** `fix: give the home-screen app room above the top row, below iOS 26's blur`.
- [ ] **Step 6: Ask the user** to push, then open the home-screen app twice (this update still needs it): the gear should be sharp, the hint should appear on the first speaker tap, and the next update should show on the first open.
