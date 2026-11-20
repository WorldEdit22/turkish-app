# Turquoise theme and press-and-hold Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Tapping a block always opens it, press-and-hold marks it, and the header and tab bar turn turquoise.

**Architecture:** A small `js/longpress.js` helper owns the press-and-hold timing on any `EventTarget`, so it can be tested in Node with fake timers; `js/app.js` wires it to the list. The theme is CSS tokens plus the iOS status-bar meta tags.

**Tech Stack:** Plain HTML/CSS/ES modules, Node built-in test runner (`node:test` mock timers).

**Spec:** `docs/superpowers/specs/2026-11-20-turquoise-and-hold-design.md`

## Global Constraints

- Hold delay 500 ms; movement over 10 px cancels.
- Learned colour stays green; existing ids and saved progress untouched.
- Bump the offline cache to `turkish-v3`.
- Run tests with `"/c/Program Files/nodejs/node.exe" --test tests/`.

## Review Focus

- Scrolling a list with a finger resting on a block must never mark it (move > 10 px cancels). (Task 1 test.)
- After a hold, the click that iOS fires on release must not also open the card. (Task 1 test: `consumeClick`.)
- iOS long-press must not pop up the "copy / look up" callout or select text. (Task 1: `contextmenu` prevented; CSS already blocks callout.)
- White text on turquoise keeps at least 4.5:1 contrast, in light and dark mode. (Task 2: colour values chosen to pass, checked in the screenshot step.)
- With the translucent status bar, the header must not slide under the clock/battery. (Task 2: screenshot plus `env(safe-area-inset-top)` padding kept.)

---

### Task 1: Tap opens, press-and-hold marks

**Files:**
- Create: `js/longpress.js`
- Modify: `js/app.js` (list events, toast, card tip), `css/app.css` (circle is not a button; toast; hold feedback)
- Test: `tests/longpress.test.js`

**Interfaces:**
- Produces: `longPress(target, { find, onLongPress, delay = 500, tolerance = 10 }) → { consumeClick(): boolean }`. `find(event)` returns the element being held or `null`; `onLongPress(el)` fires once after `delay` ms without release, cancel or a move beyond `tolerance` px; `consumeClick()` returns `true` exactly once after a long press, so the release click can be ignored.

- [ ] **Step 1: Write failing tests** (`node:test` `mock.timers`, dispatching `Event`s with `clientX`/`clientY` on an `EventTarget`): `fires after holding 500 ms`; `does not fire when released early`; `does not fire when the finger moves more than 10 px`; `consumeClick is true once after a long press and false after a normal tap`.
- [ ] **Step 2: Run, expect failures** (module missing → add stub, then assertion failures).
- [ ] **Step 3: Implement `longPress`** listening to `pointerdown`, `pointermove`, `pointerup`, `pointercancel` and preventing `contextmenu` on found elements.
- [ ] **Step 4: Wire into `app.js`:** block click opens the card unless `consumeClick()`; hold toggles learned, updates the block, shows a toast "Marked as learned" / "Not learned" for 1.5 s; the circle becomes a non-interactive `span`; the card's learn button gets the tip "Tip: press and hold a block in the list to mark it quickly."
- [ ] **Step 5: Run the full suite, all pass. Commit** `feat: tap opens, press and hold marks learned`.

### Task 2: Turquoise header and tab bar

**Files:**
- Modify: `css/app.css`, `index.html` (`apple-mobile-web-app-status-bar-style` → `black-translucent`, `theme-color` → turquoise), `manifest.webmanifest` (`theme_color`), `sw.js` (`turkish-v3`)

- [ ] **Step 1: Restyle:** brand `#0b6e78` (light) / `#0a5961` (dark); header and tab bar brand background, white title, 80 % white progress; search and chips white; selected chip and segment `#073f45` with white text; tab icons 70 % white, active 100 % white; `--accent` `#0a6b75` (light) / `#5cc6cf` (dark).
- [ ] **Step 2: Screenshots** light and dark at 390 × 844 via headless Edge; check contrast and the top safe area.
- [ ] **Step 3: Run the full suite, all pass. Commit** `feat: turquoise header and tab bar`.
