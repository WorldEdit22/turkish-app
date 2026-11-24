# Türkçe – patterns & words

A small, fast web app for learning the most common Turkish sentence patterns and words, made to be installed on an iPhone home screen.

- **Patterns** tab: 82 everyday patterns (*___ istiyorum*, *-meden önce*, *-dikçe*, *-se bile*…), most useful first, with chips for Everyday, Verbs & tenses, and Connectors. Each has a few common ways to say the same thing.
- **Words** tab: about 940 words grouped by topic, from everyday phrases to family, food, animals, and hobbies & sports. They are sorted by how often they appear in spoken Turkish, and coloured dots show the word type.
- Tap blocks to select words and patterns, on both tabs; **Clear** unselects them. Tap **ⓘ** on a block to open it.
- An open pattern shows examples with every selected word that fits, then its own examples, then a few with words you know (words you have practised, or common words). An open word works the same way with selected and practised patterns. The suffixes and vowel harmony are worked out on the phone, so this works offline.
- **Browse and Practice:** the switch in the top bar changes between the two modes.
  - **Browse** is the list of patterns and words described above. A word's or pattern's window has a recall section, where you can also correct the answer for that card.
  - **Practice** is spaced repetition, like Anki. Each direction (EN → TR and TR → EN) has its own schedule. Tap the card to show the answer, then choose **Forgot** (it comes back a few cards later), **Hard** (soon) or **Easy** (after a longer wait).
  - Each day brings 15 new cards per direction. **More new cards** adds 15 more, and **Undo** takes back the last answer.
  - Items you had marked as learned in the old version are carried over once, as cards you already know.
- The gear at the top opens Settings. There you can also turn on **Show Turkish on blocks** (off by default).
- **Translate:** the chat-bubble button, next to the gear and next to ✕ in every window, opens a Turkish ⇄ English translator. It translates as you type, ⇄ swaps the direction, and a link opens the same text in Google Translate. The text is sent to Google Translate (no key, no AI), so it needs the internet.
- Optional **More examples** button that asks a free AI (Gemini, Groq, Mistral or OpenRouter) for extra sentences. Answers are saved on the phone.
- **Scan a page:** the camera button next to the search field takes or picks a photo of Turkish text. Gemini reads it into sentences shown like a book page. Tap a sentence for its translation, how it is built, and every word with its base form, meaning and suffixes. Scans (text only) and explanations are saved on the phone, so they also open offline. Needs a Gemini key.
- **Grammar book:** the book button in the top row (and in the word, pattern and scan windows) opens short grammar sections with tappable examples. The letters and sounds are its first section.
- **Help:** the **?** button in the top row explains what the app is for, gives a short guide to each feature, and suggests a daily routine.
- A speaker button reads Turkish aloud using the phone's built-in Turkish voice.

No frameworks, no build step and no server code: plain HTML, CSS and JavaScript modules.

## Put it on your iPhone

The app has to be served over HTTPS to work offline from the home screen. GitHub Pages is free:

1. Create a GitHub repository and push this folder to it.
2. In the repository, open **Settings → Pages**. Set **Source** to "Deploy from a branch", choose `main` and `/ (root)`, and save.
3. After a minute the site is live at `https://<your-user>.github.io/<repo>/`.
4. Open that address in **Safari** on the iPhone, tap **Share → Add to Home Screen**.

The app now opens full screen and works offline. Your progress is stored on the phone. Use **Settings → Copy backup** now and then.

Safari and the home-screen app keep separate progress. To move it, use **Copy backup** in one and **Restore** in the other.

No sound from the speaker buttons? The iPhone's silent mode mutes them.

### Quick test without hosting

```sh
node tools/serve.mjs
```

Then open the "On your phone" address it prints in Safari (the phone must be on the same Wi-Fi). Over plain HTTP everything works except offline mode.

## Free AI for more examples and scans

In the app: **Settings → More examples with a free AI**. Choose a provider, follow the "Get a key" link, then paste the key. Google Gemini is the recommended one, and photo scans need it: sign in at Google AI Studio and create an API key, no credit card needed. Leave the model empty to use the default, Gemini Flash-Lite. Its free tier allows about 500 requests a day; check your exact limits in AI Studio. Each scanned photo is one request, and so is each sentence you open for the first time. Google may use what you send on the free tier to improve its products (here: requests for example sentences, photos of pages, and the sentences you ask about). The key is stored only on your phone.

## Development

Needs Node.js (any recent version) for tests and tools. The app itself needs nothing.

```sh
node --test tests/                       # grammar engine, templates, content checks, AI reply parser
node tools/serve.mjs                     # local server on port 8080
node tools/sample.mjs 4 [patternId]      # print generated example sentences to proofread
node tools/rank-words.mjs tr_50k.txt     # recompute word frequency ranks (data/ranks.js)
node tools/make-icons.mjs                # redraw the app icons
```

| Path | What it is |
| --- | --- |
| `js/grammar.js` | Turkish suffix engine: vowel harmony, consonant changes, buffer letters, aorist, *git→gid*, *ye→yi* and so on. |
| `js/combine.js` | Fills pattern templates with a word, in Turkish and English. |
| `js/app.js` | The user interface. |
| `js/ai.js` | Optional free-AI examples. |
| `data/words.js` | The word list with topic, type and grammar hints. |
| `data/patterns.js` | The patterns, their variants, examples and templates. |
| `data/ranks.js` | Generated frequency scores. |

### Adding content

- **A word:** add a row to the right group in `data/words.js`. Its `kind` decides which patterns it is combined with. If it is irregular, add `soft` (for example `kitap` → `soft: 'kitab'`).
- **A pattern:** add an entry to `data/patterns.js`. Templates use suffix codes such as `{w:(y)A}` (to), `{w:DA}` (at), `{w:Iyorum}` (I'm …ing). See the notes at the top of `js/grammar.js`.
- Then run `node --test tests/`. The content tests render every template with every word that fits, and fail on any leftover code. Use `tools/sample.mjs` to read the results.

## Credits

Word frequencies come from [FrequencyWords](https://github.com/hermitdave/FrequencyWords) (OpenSubtitles 2018, CC BY-SA 4.0). The content was written with the help of AI, so have a native speaker check anything important.
