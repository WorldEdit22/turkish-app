# Bright look, Mark mode and swipe Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace press-and-hold with swipe and a Mark mode, remove the check circle, and restyle with a bright diagonal turquoise.

**Architecture:** `js/swipe.js` (replacing `js/longpress.js`) owns horizontal-swipe detection on any `EventTarget` and is tested in Node; `js/app.js` wires it plus Mark mode; the look is CSS tokens.

**Tech Stack:** Plain HTML/CSS/ES modules, `node:test`.

**Spec:** `docs/superpowers/specs/2026-11-20-bright-and-swipe-design.md`

## Global Constraints

- Swipe threshold 60 px; direction decided after 10 px of movement; vertical-first movement never swipes.
- Header/tab gradient `#2ee6d6 → #12b5e0`, text `#05343a` / `#073f45`; dark mode `#0c7a76 → #0a5f80` with white text.
- Saved progress and ids untouched. Offline cache → `turkish-v4`.
- Tests: `"/c/Program Files/nodejs/node.exe" --test tests/`.

## Review Focus

- Scrolling the list must never mark a block (vertical-first movement abandons the swipe). (Task 1 test.)
- The click a browser may send after a swipe must not open the card. (Task 1 test: `consumeClick`.)
- Mark mode must not survive into the Settings tab or a relaunch. (Task 2: browser check.)
- A learned block's text stays readable on the gradient in light and dark mode. (Task 3: screenshots.)
- Phones holding the v3 offline files get a consistent v4. (Task 3: cache bump, existing sw test.)

---

### Task 1: Swipe to mark (replaces press-and-hold)

**Files:**
- Create: `js/swipe.js`, `tests/swipe.test.js`
- Delete: `js/longpress.js`, `tests/longpress.test.js`
- Modify: `js/app.js`, `css/app.css` (`touch-action: pan-y` on blocks, drag feedback), `sw.js` (asset list)

**Interfaces:**
- Produces: `swipe(target, { find, onSwipe, onDrag = () => {}, onEnd = () => {}, threshold = 60, lock = 10 }) → { consumeClick(): boolean }`. `onSwipe(el, 'left' | 'right')` on release past the threshold; `onDrag(el, dx)` while dragging horizontally; `onEnd(el)` whenever a horizontal drag ends (swiped or not).

- [ ] **Step 1: Failing tests:** `swiping right 80 px reports right`; `swiping left 80 px reports left`; `a 40 px drag is not a swipe`; `vertical-first movement never becomes a swipe`; `onDrag follows the finger`; `consumeClick is true once after a swipe`.
- [ ] **Step 2: Run, watch them fail.**
- [ ] **Step 3: Implement `swipe`;** delete the long-press module and its test; wire into `app.js` (right → learned, left → not learned, toast, block follows finger at 60 % of the drag, clamped to ±90 px).
- [ ] **Step 4: Full suite green; browser check of a synthetic swipe. Commit** `feat: swipe a block to mark or unmark it`.

### Task 2: Mark mode

**Files:** Modify `index.html` (button and hint), `js/app.js`, `css/app.css`

- [ ] **Step 1:** `#mark-btn` (aria-pressed) next to TR; module-level `markMode = false`; on: label "Done", hint "Tap blocks to mark or unmark them", list taps toggle; hidden and switched off on Settings.
- [ ] **Step 2:** Card tip: "Tip: swipe a block right to mark it, left to unmark — or use ✓ Mark at the top."
- [ ] **Step 3: Browser check** (tap in Mark mode toggles without opening; Done restores opening). **Commit** `feat: Mark mode`.

### Task 3: Bright look

**Files:** Modify `css/app.css`, `js/app.js` (remove circle markup), `index.html` + `manifest.webmanifest` (theme colour `#2ee6d6`), `sw.js` (`turkish-v4`), `README.md`

- [ ] **Step 1:** Tokens and styles per the spec; learned block gradient + glow; remove `.check`; replace green everywhere.
- [ ] **Step 2: Screenshots** light/dark; check text contrast on learned blocks and header.
- [ ] **Step 3: Full suite green. Commit** `feat: bright turquoise look`.
