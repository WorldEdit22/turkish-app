# Photo scans, per-tab Clear, sturdier AI calls Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Photograph Turkish text, read it into tappable sentences with Gemini Flash-Lite, and explain any sentence (translation, structure, words), saved on the phone. Also: per-tab Clear, Flash-Lite as the default, a 503 retry and Google's error text in messages.

**Architecture:** `js/ai.js` gains two Gemini requests and their reply parsers, plus a shared request helper with retry. `js/store.js` keeps scans and explanations. `js/photo.js` shrinks a photo. `js/scanview.js` builds the scan screens' HTML as pure functions, with escaping in a shared `js/html.js`. `js/app.js` wires the camera button, the views inside the existing bottom window, and the reading and explaining flows. Everything pure is tested in Node; the wiring gets browser checks with `fetch` stubbed.

**Tech Stack:** Plain HTML/CSS/ES modules, no build step, `node:test`.

**Spec:** `docs/superpowers/specs/2026-11-21-photo-scans-design.md`

## Global Constraints

- No new dependencies; saved data keys and ids unchanged. New keys: `tl.scans` (`{ list: [...] }`) and `tl.explain` (`{ [sentence]: data }`).
- Gemini default model `gemini-flash-lite-latest`; scans and explanations always use `settings.keys.gemini` and `settings.models.gemini || PROVIDERS.gemini.model`.
- Temperature 0.2 for reading and explaining; reading timeout 60 s; one retry after 2000 ms on HTTP 503.
- Photos: at most 1600 px on the longest side, JPEG quality 0.85, `<input type="file" accept="image/*">` without `capture`.
- Exact copy: `Take or choose a photo`, `Reading the page…`, `Explaining…`, `Try again`, `Photos are sent to Google Gemini to read the text.`, `No Turkish text found in this photo.`, `Add a free Gemini key in Settings to scan photos.`, `The free daily limit is used up. Try again tomorrow.`, headings `Structure` and `Words`.
- Every AI-provided string is escaped before it is put into HTML.
- Every file under `js/` and `data/` listed in `sw.js` `ASSETS` (sw test). Offline cache → `turkish-v8`.
- Tests: `"/c/Program Files/nodejs/node.exe" --test tests/` (baseline: 80). Browser checks: `tools/serve.mjs` plus headless Edge over the DevTools protocol at 390 × 844.

## Review Focus

- Text from the AI containing `<`, `&` or quotes must show as text, never as markup. (Task 4 test.)
- An answer arriving after the user has moved on is saved but not drawn into the wrong window. (Task 4 browser check.)
- No request is sent without a user action, and an explanation already saved is never requested again. (Task 4 browser check: count stubbed `fetch` calls.)
- A 503 is retried exactly once; a 400/429 is not retried. (Task 1 tests.)
- Clear on one tab never touches the other tab's selection. (Task 2 test + browser check.)

---

### Task 1: Gemini requests for reading and explaining; Flash-Lite, retry, clearer errors

**Files:** Modify `js/ai.js`, `tests/ai.test.js`

**Interfaces (produced, all in `js/ai.js`):**
- `PROVIDERS.gemini.model` is `'gemini-flash-lite-latest'`.
- `parsePage(text) → string[][]`: paragraphs of trimmed, non-empty sentences; empty paragraphs dropped; `[]` when the reply's `paragraphs` is empty; throws `AIError` when no `paragraphs` array can be read.
- `parseExplanation(text) → { en, structure, words: [{ w, base, en, parts }] }`: strings trimmed; missing word fields become `''`; words without `w` dropped; throws `AIError` when `en` is missing.
- `readPage(settings, image, { retryMs = 2000 } = {}) → Promise<string[][]>`, where `image` is `{ data: base64, mimeType }`. Sends `parts: [{ inline_data: { mime_type, data } }, { text: prompt }]`.
- `explainSentence(settings, sentence, { retryMs = 2000 } = {}) → Promise<{ en, structure, words }>`.
- Both throw `AIError('Add a free Gemini key in Settings to scan photos.')` without `settings.keys.gemini`, and on 429 throw `AIError('The free daily limit is used up. Try again tomorrow.')`.
- `generate()` keeps its signature; its Gemini branch shares the retry and error handling.
- Other error messages end with Google's text when the body has `error.message`, e.g. `The AI service had a problem (error 503: The model is overloaded.).`

- [ ] **Step 1: Failing tests** (stub `globalThis.fetch` with a function returning `{ ok, status, json: async () => body }`; Gemini replies are `{ candidates: [{ content: { parts: [{ text }] } }] }`):
  - `parsePage keeps paragraphs and sentences, trimming blanks`: a fenced reply `{"paragraphs":[["Bugün hava güzel."," Parka gidelim. "],[]]}` → `[['Bugün hava güzel.', 'Parka gidelim.']]`.
  - `parsePage returns no paragraphs when the photo has no Turkish text`: `{"paragraphs":[]}` → `[]`.
  - `parsePage throws on a reply without paragraphs`: `'Sorry, I cannot read that.'` → throws.
  - `parseExplanation reads translation, structure and words`: a full reply → deep-equal; a word with only `w` gets `base`, `en`, `parts` as `''`.
  - `parseExplanation throws without a translation`.
  - `readPage sends the photo inline to Flash-Lite with the Gemini key`: settings `{ provider: 'groq', keys: { groq: 'g', gemini: 'k' }, models: {} }` → URL contains `models/gemini-flash-lite-latest:generateContent`, header `x-goog-api-key` is `k`, the first part deep-equals `{ inline_data: { mime_type: 'image/jpeg', data: 'QUJD' } }`, result is the parsed paragraphs.
  - `scans need a Gemini key`: `{ provider: 'groq', keys: { groq: 'g' } }` → rejects with the exact key message, and `fetch` is never called.
  - `a 503 is retried once`: 503 then 200 (`retryMs: 0`) → resolves; 2 calls. Three 503s → rejects after exactly 2 calls.
  - `a 400 is not retried and shows Google's message`: 400 with `{ error: { message: 'API key not valid.' } }` → 1 call; message contains `API key not valid.`.
  - `a used-up daily limit says try again tomorrow`: 429 → exact message; 1 call.
- [ ] **Step 2: Run, watch them fail. Step 3: Implement. Step 4: Run, pass; full suite green.**
- [ ] **Step 5: Commit** `feat: Gemini reads photos and explains sentences; Flash-Lite default, 503 retry`.

### Task 2: Per-tab Clear; scans and explanations saved on the phone

**Files:** Modify `js/store.js`, `tests/store.test.js`, `js/app.js` (`renderClear`, Clear handler)

**Interfaces (produced, on `store`):**
- `selectedCount(filter = () => true) → number`, `clearSelected(filter = () => true)`; `filter(key)` picks the keys.
- `scans → Scan[]` newest first, `Scan = { id: string, date: ISO string, paragraphs: string[][] }`; `addScan(paragraphs) → Scan` (keeps the 50 newest); `deleteScan(id)`.
- `explanation(sentence) → data | undefined`; `saveExplanation(sentence, data)`.

- [ ] **Step 1: Failing tests:** `clearing one tab leaves the other tab's selection` (select `su` and `p:want`; clear with `k => k.startsWith('p:')` → `su` still selected, `p:want` not; count with `k => !k.startsWith('p:')` is 1); `a new scan is saved first on the device` (the saved `tl.scans` JSON's `list[0].paragraphs` deep-equals what was added); `only the 50 newest scans are kept` (add 52 → 50, newest first); `deleting a scan keeps its explanations`; `explanations are saved by sentence text` (saved under `tl.explain`).
- [ ] **Step 2: Run, fail. Step 3: Implement. Step 4: Run, pass.**
- [ ] **Step 5: Wire Clear:** the filter is `(k) => k.startsWith('p:') === (ui.tab === 'patterns')`; `renderClear` counts with it (hidden at 0 and on Settings) and the Clear button clears with it. `renderClear` runs on tab switches (already through `renderControls`).
- [ ] **Step 6: Browser check:** select 2 words and 1 pattern → Words shows `Clear (2)`, Patterns `Clear (1)`; Clear on Patterns → Words still `Clear (2)` and its blocks still selected.
- [ ] **Step 7: Commit** `feat: Clear counts and clears only the tab you are on; scans saved on the phone`.

### Task 3: Shrink a photo before sending

**Files:** Create `js/photo.js`, `tests/photo.test.js`; modify `sw.js` (`ASSETS`)

**Interfaces:** `fitSize(w, h, max = 1600) → { w, h }` (scale down to fit, keep the aspect ratio, round, never enlarge); `shrinkPhoto(file, max = 1600, quality = 0.85) → Promise<{ data: base64 string, mimeType: 'image/jpeg' }>` (`createImageBitmap`, canvas, `toBlob('image/jpeg', quality)`, base64 without the `data:` prefix).

- [ ] **Step 1: Failing test** `fitSize scales big photos down and leaves small ones`: `(4032, 3024)` → `{ w: 1600, h: 1200 }`; `(3024, 4032)` → `{ w: 1200, h: 1600 }`; `(800, 600)` → unchanged.
- [ ] **Step 2: Run, fail. Step 3: Implement; add `js/photo.js` to `ASSETS`. Step 4: Run, pass.**
- [ ] **Step 5: Browser check:** in the page, make a 4000 × 3000 canvas PNG `File`, run `shrinkPhoto` → `mimeType` is `image/jpeg`, and the decoded result is 1600 × 1200.
- [ ] **Step 6: Commit** `feat: shrink photos to 1600 px JPEG before sending`.

### Task 4: Scan screens

**Files:** Create `js/html.js`, `js/scanview.js`, `tests/scanview.test.js`; modify `js/app.js` (import `esc` from `html.js`; camera button; window views; flows), `index.html` (camera button next to the search field), `css/app.css`, `sw.js` (`ASSETS`)

**Interfaces:**
- `esc(s) → string` in `js/html.js` (moved from `app.js`).
- In `js/scanview.js`: `scanTitle(scan) → string` (first 6 words of the first sentence, `…` when longer); `scanDate(iso) → string` (`21 Nov`); `scansListHtml(scans, { hasKey, status })`, where `status` is `null | 'reading' | 'empty' | { error }`; `scanHtml(scan, isExplained)`, with each sentence `<span class="sent[ done]" data-si="i">` numbered across paragraphs; `sentenceHtml(sentence, data, status)`, where `status` is `null | 'loading' | { error }`. Window headers come from the caller.
- The window has one view at a time: `{ kind: 'item', key } | { kind: 'scans' } | { kind: 'scan', id } | { kind: 'sentence', id, si }`. `openKey` becomes part of that view.

- [ ] **Step 1: Failing tests** in `tests/scanview.test.js`: `AI text is escaped everywhere` (a sentence `<img src=x onerror=alert(1)> & "q"` in `scanHtml` and in `sentenceHtml`, plus a word meaning `<b>` → output contains `&lt;img` and `&lt;b&gt;`, never `<img` or `<b>`); `explained sentences are marked` (`isExplained = (s) => s === 'Bir.'` → only that span has `done`); `sentence numbers run across paragraphs` (`[['A.', 'B.'], ['C.']]` → `data-si` 0, 1, 2 with C at 2); `without a Gemini key the list offers Settings instead of the photo button` (`hasKey: false` → contains `data-act="setup"` and no `type="file"`); `scanTitle shortens a long first sentence`.
- [ ] **Step 2: Run, fail. Step 3: Implement `html.js` and `scanview.js`; add both to `ASSETS`. Step 4: Run, pass.**
- [ ] **Step 5: Wire it in `app.js` and `index.html`.**
  - **Camera button:** next to `#search`, inside the controls, 44 px tall, `aria-label="Scan a photo"`, camera svg. It opens the `scans` view.
  - **Header:** every scan view has a header with ‹ (`data-act="back"`, hidden on the list), a title (`Scans`, `scanDate`, or `Sentence`) and the existing ✕.
  - **Photo input:** a change on the file input shrinks the photo, shows `Reading the page…`, calls `readPage`, then `addScan` and opens that scan. An empty result shows `No Turkish text found in this photo.`. An error shows its message with `Try again` (`data-act="retry-read"`), which reuses the shrunk photo.
  - **Scan rows:** `data-act="open-scan" data-id`. Delete is `data-act="delete-scan" data-id` with `confirm('Delete this scan?')`.
  - **Sentences:** `data-si` opens the sentence view. A saved explanation renders at once. Otherwise it shows `Explaining…`, calls `explainSentence`, saves, and renders. An error shows `Try again` (`data-act="retry-explain"`).
  - **Late answers:** a request remembers the view it was made for. When its answer arrives, the answer is saved, but it is drawn only if that same view is still showing.
- [ ] **Step 6: Style:**
  - **Book text:** `.page` paragraphs with comfortable line height.
  - **Sentences:** `.sent` is tappable with a pressed tint; `.sent.done` gets a dotted underline.
  - **Word rows:** a grid of word, base form, meaning and parts.
  - **Privacy note:** in the `.note` style.
  - **Colour schemes:** light and dark through the existing tokens.
- [ ] **Step 7: Browser check** (stub `fetch` in the page to return canned Gemini replies, and count calls; make a canvas `File` and put it on the input via `DataTransfer`):
  - **No key:** the camera opens a note with a Settings button.
  - **With a key:**
    - A photo → `Reading the page…` → the book view, with each sentence tappable.
    - A sentence → `Explaining…` → translation, Structure and Words.
    - ‹ back, then the same sentence again → no new `fetch`, and the sentence is underlined.
    - Delete asks to confirm and removes the row.
    - An error reply → message plus `Try again`, which works.
    - Going back while a stubbed slow reply is pending → that reply is saved but not drawn into the list.
  - **Escaping:** AI text with `<b>` shows literally.
  - **Look:** screenshots in light and dark.
  - **Errors:** no console errors.
- [ ] **Step 8: Full suite green. Commit** `feat: scan a photo of Turkish text and explain any sentence`.

### Task 5: Docs and cache

**Files:** Modify `README.md`, `js/app.js` (Settings AI card text), `sw.js` (`CACHE = 'turkish-v8'`)

- [ ] **Step 1:** README: a "Scan a page" bullet; Gemini setup says Flash-Lite is the default and the free limit is about 500 requests a day (check AI Studio); scans need a Gemini key.
- [ ] **Step 2:** Settings AI card: one line saying photo scans use the Gemini key.
- [ ] **Step 3:** Cache `turkish-v8`; full suite green.
- [ ] **Step 4: Commit** `docs: photo scans and Flash-Lite in README and Settings; cache v8`.
- [ ] **Step 5: Ask the user** to push, open the app once (auto-reload), and try a real book page.
