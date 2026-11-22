# Quick translate, and the TR button moves to Settings

Status: approved approach (A), design awaiting approval. Size: small change.

## Why

- **Translate:** while learning, you want to try a sentence or a different form of a word and see right away what it means. That should be one tap from anywhere in the app, with a plain translation and no AI.
- **TR button:** showing Turkish on the blocks is a set-and-forget choice. It doesn't need a place in the top row, and most of the time you want it off.

## Goals

1. Remove the TR button from the top row. "Show Turkish on blocks" stays in Settings, and it starts **off**, on the phone that already uses the app too.
2. Add a chat-bubble button that opens a translator:
   - On the main screen, it sits in the top row next to the gear. This includes Settings.
   - In every window that has a ✕ (a word, a pattern, the scans list, a scan, a sentence), it sits just left of the ✕.
3. The translator only translates Turkish → English and English → Turkish. A swap button turns the direction around, as Google Translate does.

## Non-goals

- Other languages, detecting the language automatically, a history of past translations, and copy buttons.
- Any AI. The translator never calls Gemini, so it doesn't use up the daily scan limit.

## Anti-goals (it fails even if it works)

- It feels slow, or you need extra taps before you can type.
- On the iPhone, the keyboard hides the text box or the translation.
- It loses your place: closing the translator must leave the window you came from exactly as it was, scroll position included.

## Approach

These were the three options considered:

- **A. Google Translate's free web endpoint.** It needs no key and no signup, and its results match the Google Translate app. It is unofficial and could change or become rate-limited. **Chosen.**
- **B. MyMemory.** It needs no key but allows only 5,000 characters a day, and its translations are rougher. Kept as a backup to add later if A becomes unstable.
- **C. Google Cloud Translation API.** It is official and reliable, but needs a Cloud account with a credit card and another key.

The endpoint is called like this:

`GET https://translate.googleapis.com/translate_a/single?client=gtx&sl=<tr|en>&tl=<en|tr>&dt=t&q=<text>`

- It answers with `Access-Control-Allow-Origin: *`, so the app calls it straight from the phone.
- The reply is JSON. Item `[0]` is a list of segments, and the translation is each segment's `[0]` joined together.
- Both directions were checked on 2026-11-22. "Yarın eve gideceğim. Gelir misin?" came back as "I will go home tomorrow. Will you come?", and "I would like a coffee, please." came back as "Bir kahve istiyorum lütfen."

## Design

**The translator window**
- It is a second window that opens on top of whatever is showing.
  - Closing it (✕, a tap on the dimmed area, or Escape) returns to the window or list below, unchanged.
  - It has its own `<dialog>`, so the existing window's close handling doesn't run.
- It is full height, so the text box sits in the top half of the screen, above the iPhone keyboard.
- From top to bottom:
  - A header "Translate" with ✕.
  - A language row: "Turkish ⇄ English", where the ⇄ button swaps.
  - The text box, with a small clear button.
  - The translation.
  - A small "Open in Google Translate" link. It opens the same text and direction on translate.google.com, which helps for dictionary detail or when the endpoint fails.
- The text box gets focus when the window opens, so the keyboard comes up at once.
- A speaker button sits on whichever side is Turkish: the text box for Turkish → English, the translation for English → Turkish. It uses the app's existing Turkish voice, and the silent-mode hint works here too.

**Translating**
- It translates as you type, about half a second after you stop.
- Only the newest answer is shown: a late answer to older text is ignored.
- An empty box shows no translation.
- Text is limited to 1,000 characters.

**Swapping**
- Swapping flips the direction.
- It also moves the current translation into the text box and translates again. If there is no translation yet, it keeps the text.

**Remembering**
- The text and the direction are kept while the app is open, so reopening shows the last translation.
- They are not saved across launches.

**Errors**
- With no connection, the window says "No connection. Translating needs the internet."
- Any other failure says "Couldn't translate right now. Try again, or open Google Translate below."

**The TR setting**
- The setting is stored under a new name, `showTurkish`, with the default `false`. The value the phone already saved under `showTr` is ignored, so the setting starts off there too.
- The TR button, its code, and its CSS go away. The gear keeps its current look.

**Release**
- `sw.js`: the new module goes in `ASSETS`, and `CACHE` becomes `turkish-v9`.
- The README gets a line about the translator, noting that the text is sent to Google.

## Left to the builder

- Module boundaries. Suggested split:
  - A small `js/translate.js` for the URL, the reply parsing and the fetch.
  - A pure HTML builder for the window, in the style of `scanview.js`.
  - The wiring in `app.js`.
- Icons. Use a chat bubble on the button, matching the gear's line style.
- Exact spacing and the debounce delay, which should be about 500 ms.
- The toast: while the translator is open, it must show inside the translator, the top window.
