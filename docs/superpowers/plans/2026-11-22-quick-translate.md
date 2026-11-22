# Quick translate, TR setting off by default — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove the TR button so that "Show Turkish on blocks" lives only in Settings and starts off. Add a chat-bubble button, available from anywhere, that opens a Turkish ⇄ English translator backed by Google Translate's free endpoint.

**Architecture:**
- `js/translate.js` builds the endpoint and link URLs, calls the endpoint, and parses the reply.
- `js/translateview.js` builds the translator's HTML as pure functions, like `scanview.js` does.
- `js/app.js` wires up the rest:
  - a second `<dialog id="translator">` that opens on top of anything;
  - the bubble buttons in the top row and in every window header;
  - translate-as-you-type with a pause;
  - swap, clear, and speak.
- Pure code is tested in Node. The wiring gets browser checks with `fetch` stubbed.

**Tech Stack:** Plain HTML/CSS/ES modules, no build step, `node:test`.

**Spec:** `docs/superpowers/specs/2026-11-22-quick-translate-design.md`

## Global Constraints

- No new dependencies.
- No AI calls from the translator.
- Saved data keys stay the same. The UI setting is now `ui.showTurkish`, default `false`; any saved `showTr` is ignored.
- The endpoint is `https://translate.googleapis.com/translate_a/single?client=gtx&sl=<from>&tl=<to>&dt=t&q=<encoded text>`, where from/to is `tr`/`en` either way round.
- The link is `https://translate.google.com/?sl=<from>&tl=<to>&text=<encoded text>&op=translate`.
- At most 1000 characters are sent. The debounce is 500 ms after the last keystroke. Swap and Clear act at once.
- Exact copy:
  - `Translate`: the button's aria-label and the header
  - `Turkish` and `English`
  - `Swap languages`: aria-label
  - `Type in Turkish` / `Type in English`: placeholders
  - `Clear text`: aria-label
  - `Translation`: the empty result
  - `Open in Google Translate`
  - `No connection. Translating needs the internet.`
  - `Couldn't translate right now. Try again, or open Google Translate below.`
  - `Listen`: the speaker
- Text from Google is always escaped before it goes into HTML.
- The text box has `autocorrect="off" spellcheck="false"`, so iOS doesn't "fix" Turkish word forms into English words.
- Every file under `js/` must be listed in `sw.js` `ASSETS` (the sw test checks this). The offline cache becomes `turkish-v9`.
- Tests run with `"/c/Program Files/nodejs/node.exe" --test tests/` (baseline 106).
- Browser checks use `node tools/serve.mjs 8080` and headless Edge over the DevTools protocol at 390 × 844 (scratchpad `cdp.mjs`).

## Review Focus

1. **Out-of-order answers.** An answer for older text arrives after the answer for newer text. The newer one must stay. (Task 4 browser check: the stub answers the first request last.)
2. **Fast typing.** It must send one request per pause, not one per keystroke. (Task 4 browser check: count the stubbed `fetch` calls.)
3. **Closing the translator over an open word window.** ✕, a backdrop tap and Escape each close only the translator. The word window stays open, with the same scroll position. (Task 4 browser check.)
4. **Markup in Google's text.** A reply containing `<`, `&` or quotes shows as text. (Task 3 test.)
5. **The silent-mode toast.** When it fires from the translator's speaker, it must show inside the translator, not behind it. (Task 4 browser check with an iPhone user agent.)

---

### Task 1: TR button removed; "Show Turkish on blocks" only in Settings, off by default

**Files:**
- Modify `index.html`, `js/store.js`, `js/app.js`, `css/app.css`
- Test `tests/store.test.js`

**Interfaces (produced):** `store.ui.showTurkish: boolean`, default `false`. `ui.showTr` is gone.

- [ ] **Step 1: Failing test.**
  - In `tests/store.test.js`, before the dynamic import, seed `saved.set('tl.ui', JSON.stringify({ tab: 'words', showTr: true }))`. This is what the phone has saved today.
  - Add the test `Turkish on blocks starts off, even where the old TR setting was saved on`, asserting `store.ui.showTurkish === false`.
- [ ] **Step 2: Run it and watch it fail.** Expected: FAIL (`undefined !== false`).
- [ ] **Step 3: Implement.**
  - `store.js`: replace the default `showTr: true` with `showTurkish: false`.
  - `app.js`: `blockHtml` and the Settings switch (`#set-showtr`, checked from `ui.showTurkish`) use `ui.showTurkish`. Remove the `#toggle-tr` click handler and its two lines in `renderControls`.
  - `index.html`: remove `#toggle-tr`.
  - `css/app.css`:
    - Remove `.icon-btn[aria-pressed="false"]`, now only the TR rule.
    - Remove `.gear-btn[aria-pressed="false"]`, which overrode it.
    - Rewrite the gear comment so it doesn't mention TR.
- [ ] **Step 4: Run the full suite.** Expected: 107 pass.
- [ ] **Step 5: Browser check** (fresh profile, then a reload with `tl.ui` = `{"showTr":true}`):
  - `#toggle-tr` is absent.
  - `.b-tr` count is 0 in both cases.
  - Ticking the Settings switch and going back to Words shows `.b-tr` on the blocks.
  - The gear looks the same as before (screenshot).
- [ ] **Step 6: Commit** `feat: Turkish on blocks is a Settings switch, off by default; TR button removed`.

### Task 2: `js/translate.js`, the Google endpoint

**Files:**
- Create `js/translate.js`, `tests/translate.test.js`
- Modify `sw.js` (add the module to `ASSETS`)

**Interfaces (produced, in `js/translate.js`):**
- `MAX_CHARS = 1000`
- `other(lang) → 'tr' | 'en'`
- `translateUrl(text, from) → string`: the endpoint URL, with `tl = other(from)` and `q = encodeURIComponent(text)`.
- `googleLink(text, from) → string`: the translate.google.com URL.
- `parseTranslation(json) → string`: joins `json[0][i][0]` over every segment whose `[0]` is a string. It throws `TranslateError(FAILED)` when `json[0]` isn't an array.
- `class TranslateError extends Error`.
- `OFFLINE` and `FAILED`: the two exact error messages.
- `translate(text, from) → Promise<string>`. The text is trimmed:
  - Blank text resolves `''` without fetching.
  - Otherwise it sends one GET to `translateUrl(text.slice(0, MAX_CHARS), from)`.
  - A non-ok status, unreadable JSON or a bad shape all throw `TranslateError(FAILED)`.
  - When `fetch` itself rejects, it throws `TranslateError(OFFLINE)` if `navigator.onLine === false`, else `TranslateError(FAILED)`.

- [ ] **Step 1: Failing tests.** Stub `globalThis.fetch` the way `tests/ai.test.js` does.
  - `the endpoint URL carries both directions and the encoded text`. `translateUrl('Gelir misin?', 'tr')` equals `https://translate.googleapis.com/translate_a/single?client=gtx&sl=tr&tl=en&dt=t&q=Gelir%20misin%3F`, and `translateUrl('Hi', 'en')` contains `sl=en&tl=tr`.
  - `the Google Translate link opens the same text and direction`. `googleLink('Çay', 'tr')` equals `https://translate.google.com/?sl=tr&tl=en&text=%C3%87ay&op=translate`.
  - `segments are joined into one translation`. The real reply from the spec, `[[["I will go home tomorrow. ","Yarın eve gideceğim. ",null,null,3],["Will you come?","Gelir misin?",null,null,3]],null,"tr"]`, gives `'I will go home tomorrow. Will you come?'`.
  - `an unexpected reply is a failure`. `{}`, `[]` and `[null]` each throw with the message `FAILED`.
  - `translate asks once and returns the text`. One call to the URL; the result is the joined text.
  - `blank text is not sent`. `'  '` resolves `''`, with 0 calls.
  - `at most 1000 characters are sent`. `'a'.repeat(1500)` gives a request whose `q` decodes to 1000 `a`s.
  - `a failed request says so`:
    - status 500 rejects with `FAILED`;
    - `fetch` rejecting while `navigator.onLine` is false rejects with `OFFLINE`, stubbed with `Object.defineProperty(globalThis, 'navigator', { value: { onLine: false }, configurable: true })` and restored afterwards;
    - rejecting while online gives `FAILED`.
- [ ] **Step 2: Run them and watch them fail.** Expected: FAIL, because the module isn't found.
- [ ] **Step 3: Implement**, and add `'js/translate.js'` to `sw.js` `ASSETS`.
- [ ] **Step 4: Run the full suite.** Expected: all pass, including the sw test.
- [ ] **Step 5: Live smoke check.** Run one real `curl` of `translateUrl('Yarın eve gideceğim.', 'tr')` plus one with 1000 characters, and confirm both are 200 and parse.
- [ ] **Step 6: Commit** `feat: translate.js calls Google Translate's free endpoint`.

### Task 3: `js/translateview.js`, the translator's HTML

**Files:**
- Create `js/translateview.js`, `tests/translateview.test.js`
- Modify `js/html.js` (add `BUBBLE`) and `sw.js` (`ASSETS`)

**Interfaces:**
- Consumes `esc` and `SPEAKER` from `js/html.js`, and `MAX_CHARS`, `other` and `googleLink` from Task 2.
- Produces:
  - `BUBBLE`: a chat-bubble line svg, in `js/html.js`.
  - `translatorHtml(state) → string`, where `state = { text, from, result, error }`. It gives, in order:
    - the `.s-top` with a grabber, an `<h2>Translate</h2>` and `<button class="close" data-act="close" aria-label="Close">✕</button>`;
    - a `.tr-langs` row: from-name, `<button class="tr-swap" data-act="swap" aria-label="Swap languages">⇄</button>`, to-name;
    - a `.tr-box` holding `<textarea id="tr-input" maxlength="1000" autocorrect="off" autocapitalize="sentences" spellcheck="false" lang="<from>" placeholder="Type in <From>">` with the escaped text, a `data-act="clear"` button (aria-label `Clear text`), and, only when `from === 'tr'`, a `data-act="say-text"` speaker (aria-label `Listen`);
    - `<div id="tr-result" class="tr-out" aria-live="polite">` holding `resultHtml(state)`;
    - `<a id="tr-link" class="tr-link" href="<googleLink>" target="_blank" rel="noopener">Open in Google Translate</a>`.
  - `resultHtml(state) → string`:
    - with an error, `<p class="tr-msg err">` holding the error;
    - with no result, `<p class="tr-msg">Translation</p>`;
    - otherwise `<p class="tr-text" lang="<to>">` holding the result, plus, only when the result is Turkish (`from === 'en'`), `<button class="say" data-say="<result>" aria-label="Listen">`.

- [ ] **Step 1: Failing tests.**
  - `Google's text and yours are escaped`. Text and result of `<img src=x onerror=alert(1)> & "q"` contain neither `<img` nor `onerror=alert(1)>` unescaped, and both contain `&lt;img`.
  - `Turkish to English`: the from-name comes before ⇄ as `Turkish`, the placeholder is `Type in Turkish`, `data-act="say-text"` is present, and the result has no `data-say`.
  - `English to Turkish`: the placeholder is `Type in English`, `say-text` is absent, and a result `Bir kahve lütfen.` gets `data-say="Bir kahve lütfen."` and `lang="tr"`.
  - `the text box does not autocorrect and holds at most 1000 characters`: it has `autocorrect="off"`, `spellcheck="false"` and `maxlength="1000"`.
  - `the result area shows the placeholder, the error, or the translation`.
  - `the Google link follows the text and direction`: the `href` equals `googleLink(text, from)`, with `&` written as `&amp;` in HTML.
- [ ] **Step 2: Run them and watch them fail.** Expected: FAIL, because the module isn't found.
- [ ] **Step 3: Implement**, and add `'js/translateview.js'` to `ASSETS`.
- [ ] **Step 4: Run the full suite.** Expected: all pass.
- [ ] **Step 5: Commit** `feat: translator window HTML`.

### Task 4: Wiring, styling and release

**Files:**
- Modify `index.html`, `js/app.js`, `css/app.css`, `sw.js`, `README.md`

**Interfaces:**
- Consumes Tasks 2–3.
- Produces in `app.js`:
  - `trState = { text: '', from: 'tr', result: '', error: null }`, kept in memory only.
  - `openTranslator()`.
  - A shared `headButtons()` returning the bubble (`<button class="head-tr" data-act="translate" aria-label="Translate">` + `BUBBLE`) followed by the existing ✕. It is used by `headHtml` and `scanTop`, so the bubble sits just left of ✕ in every window.

- [ ] **Step 1: Markup and styling.**
  - `index.html`:
    - Add `<button id="tr-btn" class="icon-btn svg-btn" aria-label="Translate">` + the bubble svg before `#gear`.
    - Add `<dialog id="translator" class="sheet" aria-label="Translate" tabindex="-1"><div id="translator-body" class="sheet-body"></div></dialog>` after `#sheet`.
  - CSS:
    - The gear's layout and svg rules move to a shared `.svg-btn`, used by the gear and `#tr-btn`. The gear also keeps `gear-btn` for its pressed state.
    - The `dialog#sheet` rules apply to `#translator` too.
    - `#translator` gets `height: 92dvh` (falling back to `92vh`), so the text box sits high on the screen.
    - `.head-tr` takes the `.close` look, with an 18 px svg.
    - The `.tr-langs`, `.tr-box`, textarea, `.tr-out`, `.tr-msg` and `.tr-link` rules follow the card styles that already exist.
- [ ] **Step 2: Behaviour in `app.js`.**
  - **Opening.** `openTranslator()` renders `translatorHtml(trState)`, calls `showModal()` if the translator isn't already open, then focuses `#tr-input` with the caret at the end. The `#tr-btn` click and `data-act="translate"` in `#sheet-body` both call it.
  - **Typing.** An `input` on `#tr-input` does the following:
    - sets `trState.text`, and updates `#tr-link`'s `href`;
    - bumps `seq` and clears the timer;
    - if the text is blank, it empties result and error and re-renders `#tr-result`;
    - otherwise, after 500 ms, it runs `run(seq)`.
  - **`run(seq)`.** It awaits `translate(text, from)`. If `seq` still matches, it stores the result (or the `TranslateError` message, or `FAILED` for anything else) and re-renders `#tr-result`. The previous result stays visible until the answer arrives.
  - **Swap.** It flips `from`. If there is a result, the result becomes `text`. It then clears the result and error, bumps `seq`, re-renders the whole window, focuses the text box, and runs right away if the text isn't blank.
  - **Clear.** It empties `text`, `result` and `error`, bumps `seq`, re-renders, and focuses the text box.
  - **Listening.** `say-text` speaks `#tr-input`'s value when it isn't blank, and `[data-say]` speaks its value.
  - **Closing.** `close` and a backdrop tap close only `#translator`. Its `close` event cancels speech.
  - **The toast.** Its host becomes `translator.open ? translator : sheet.open ? sheet : document.body`.
- [ ] **Step 3: Browser checks.** Stub `window.fetch` for `translate.googleapis.com` to count calls and answer with `[[["EN:" + q, q]], null, "tr"]`, with optional per-call delays.
  - **Bubble.** It is visible in the top row on Words, Patterns and Settings. Tapping it opens `#translator`, and `document.activeElement.id === 'tr-input'`.
  - **Fast typing.** Typing `G`, `Ge`, `Gel` 100 ms apart sends one request (`Gel`) after the pause, and `#tr-result` shows `EN:Gel`.
  - **Out of order.** The first request is delayed 800 ms, then text is changed and the second answers at once. `#tr-result` ends with the second answer.
  - **Swap.** The labels flip, the text box holds `EN:Gel`, the next request has `sl=en&tl=tr`, and the speaker moves to the result.
  - **Over a word window.**
    - Open a word card, scroll it 200 px, then tap its `.head-tr`. Both dialogs are open.
    - Closing the translator by ✕, by a backdrop tap, and by Escape each leaves `#sheet` open with `scrollTop` 200.
    - The bubble is also present in the scans list, a scan, and a sentence header.
  - **Toast.** With an iPhone user agent, tapping the translator's speaker places `#toast` inside `#translator`.
  - **Offline.** Emulate offline with `Network.emulateNetworkConditions`, or a stub that rejects while `navigator.onLine` is false. The window shows the offline message.
  - **Screenshots.** Light and dark, with no exceptions in the logs.
- [ ] **Step 4: Release.**
  - `sw.js`: `CACHE = 'turkish-v9'`.
  - README:
    - a bullet for the translator, saying the text goes to Google Translate and it needs the internet;
    - "Show Turkish on blocks" is now in Settings.
- [ ] **Step 5: Run the full suite.** Expected: all pass.
- [ ] **Step 6: Commit** `feat: quick translate from anywhere (Google Translate, Turkish ⇄ English)`.
