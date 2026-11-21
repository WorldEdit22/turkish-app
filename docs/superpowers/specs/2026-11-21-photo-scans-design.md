# Photo scans, per-tab Clear, sturdier AI calls — design

Agreed in conversation on 2026-11-21. Items marked *(my call)* were filled in by Claude and can still be changed.

## Why

The user reads Turkish texts, such as book pages, and wants to understand them sentence by sentence. They want to
photograph a page, see its sentences as text "like a book", and tap any sentence to get its grammar explained and the
meaning of every word.

The user's main worry is the free AI limit: the feature is useless if only a handful of scans fit in a day. Two smaller
requests ride along:
- the Clear button should only count and clear the tab you are on;
- "More examples" failed with error 503 on Gemini's regular Flash model.

## Goals

- Photograph or choose a photo of Turkish text and get its sentences as tappable text.
- For any sentence: an English translation, the structure of the sentence explained, and each word with its base form,
  meaning and suffixes.
- Daily use within Gemini's free tier.
- Scans and explanations stay on the phone and can be reopened offline.
- Clear (N) works per tab.

## Non-goals

- Storing the photos themselves.
- Scanning with providers other than Gemini.
- Adding words from a scan to the app's word list, or linking them to it.
- Importing PDFs or pasted text.

## Anti-goals (failure even if it works)

- Requests the user did not ask for. The free quota must only be spent on a photo the user sends or a sentence the user
  opens.
- Asking the AI again for something already answered.
- A misread letter (ı/i, ş/s, ğ/g) silently changing the grammar. This is why the AI reads the photo rather than an
  on-device text reader.

## Constraints

- Plain HTML/CSS/ES modules, no build step, no new dependencies. Offline cache list in `sw.js`, kept complete by the sw
  test.
- Gemini free tier, reported in October 2026 and not official: Flash-Lite about 10 requests per minute and 500 a day,
  Flash about 20 a day. Google shows the exact limits in AI Studio.
- The user confirmed that the `gemini-flash-lite-latest` model answers with their key. Regular Flash returned 503
  (overloaded).
- localStorage holds about 5 MB. Text only fits easily.

## Approaches considered (reading the photo)

1. **Gemini Flash-Lite reads the photo (picked by the user).** One request per photo, about 500 a day, best accuracy
   on Turkish letters. Needs internet, which the explanations need anyway.
2. On-device OCR (Tesseract.js): unlimited and offline, but weaker on phone photos of pages, misreads Turkish letters,
   and is a several-MB download that is slow on a phone.
3. Both: on-device first, with "Read again with AI". The most work.

## Design

**AI calls (`js/ai.js`)**
- The Gemini default model becomes `gemini-flash-lite-latest`, also for "More examples". A model typed in Settings
  still wins.
- On a 503 the request is retried once after about 2 s. *(my call)*
- An error message includes Google's own text when there is one, for example "The AI service had a problem (error 503:
  The model is overloaded)". *(my call)*
- Two new Gemini requests, both with JSON replies and a low temperature *(my call: 0.2, for faithful reading)*:
  - **Read a page:** the photo plus a prompt → `{ "paragraphs": [["sentence", …], …] }`. The Turkish text is kept
    exactly as printed, split into sentences, with the paragraphs kept. No translation at this step, so it stays fast.
    Text that is not Turkish is left out. *(my call)*
  - **Explain a sentence:** the sentence → `{ "en": translation, "structure": plain-English explanation in 2–5
    sentences, "words": [{ "w": word as written, "base": dictionary form, "en": meaning, "parts": "kitap + -lar
    (plural) + -ım (my)" }] }`.
- Parsing the replies tolerates code fences and stray text, like `parseExamples` today. Malformed replies become a
  clear error.
- Scans and explanations always use the Gemini key and model from Settings, even when another provider is chosen for
  "More examples". *(my call)*
- Reading a page may take longer than the 25 s timeout used for examples, so it gets 60 s. *(my call)*
- On a 429, the scan screens say the free daily limit is used up and to try again tomorrow, without suggesting another
  provider, since scans need Gemini.

**Photo**
- `<input type="file" accept="image/*">` without `capture`, so the iPhone offers both "Take Photo" and "Photo Library".
- The photo is shrunk on the phone to at most 1600 px on its longest side, as a JPEG at quality 0.85, before sending.
  This keeps uploads small and quick, and is still sharp enough for book text. *(my call)*

**Saved on the phone (`js/store.js`)**
- `tl.scans`: a list of `{ id, date, paragraphs }`, newest first, capped at 50 scans. The oldest are dropped. *(my call)*
- `tl.explain`: explanations keyed by the exact sentence text, so the same sentence in two scans is explained once.
- Deleting a scan keeps its explanations, which other scans may share. *(my call)*

**Screens** (all in the existing bottom window, which keeps its sticky ✕)
- **Camera button** next to the search field, 44 px, on both tabs.
- **Without a Gemini key:** the camera button opens a short note with a button to Settings.
- **Scans:** a "Take or choose a photo" button at the top, then saved scans, newest first. Each row shows the first
  words of the scan and its date, and has a delete button that asks for confirmation.
- **While reading:** "Reading the page…" in the window. Errors show inline with "Try again", and the photo is kept for
  the retry *(my call)*. If no Turkish text is found, the window says so.
- **A scan:** paragraphs as running text, like a book page. Each sentence can be tapped. Sentences already explained get
  a faint dotted underline. *(my call)*
- **A sentence:** the sentence with a speaker button, the English translation, a **Structure** section and a **Words**
  section with one row per word (word, base form, meaning, parts). The first open asks the AI ("Explaining…"); later
  opens use the saved answer, offline too.
- **Back:** a ‹ button in the window header goes from a sentence to its scan, and from a scan to the list. ✕ closes
  everything. *(my call: one window with back, instead of windows on top of each other)*
- **Leaving while waiting:** if the user goes back or closes the window while a page is being read or a sentence
  explained, the answer is still saved when it arrives. It is not drawn into whatever window is showing by then.
- **Privacy note:** one faint line at the top of the Scans window: "Photos are sent to Google Gemini to read the text."
  *(my call)*

**Clear per tab**
- On Words, Clear (N) counts and clears only selected words. On Patterns, only selected patterns. It is hidden when
  that tab has nothing selected.

**Housekeeping**
- Offline cache version goes up. New modules go into `ASSETS`.
- README: the scan feature, the Flash-Lite default, and where to get a Gemini key.

## Left to the builder

- Exact prompt wording, within the reply shapes above.
- Module boundaries for the new UI code. Pure parts (prompt building, parsing, storage) go in modules tested in Node.
- Styling of the book view and the word rows, using the existing tokens and in both colour schemes.
