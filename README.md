# Türkçe – patterns & words

A small, fast web app for learning the most common Turkish sentence patterns and words, made to be installed on an iPhone home screen.

- **Patterns** tab: 82 everyday patterns (*___ istiyorum*, *-meden önce*, *-dikçe*, *-se bile*…), most useful first, with chips for Everyday, Verbs & tenses, and Connectors. Each has a few common ways to say the same thing.
- **Words** tab: about 710 words grouped by topic. They are sorted by how often they appear in spoken Turkish, and coloured dots show the word type.
- Tap a block to open it. Swipe a block right to mark it learned (it turns turquoise), left to unmark it, or use **✓ Mark** in the header to mark blocks with taps.
- Open a pattern and its examples are built from your green words. Open a word and it is shown inside your green patterns. The suffixes and vowel harmony are worked out on the phone, so this works offline.
- Optional **More examples** button that asks a free AI (Gemini, Groq, Mistral or OpenRouter) for extra sentences. Answers are saved on the phone.
- A speaker button reads Turkish aloud using the phone's built-in Turkish voice.

No frameworks, no build step and no server code: plain HTML, CSS and JavaScript modules.

## Put it on your iPhone

The app has to be served over HTTPS to work offline from the home screen. GitHub Pages is free:

1. Create a GitHub repository and push this folder to it.
2. In the repository, open **Settings → Pages**. Set **Source** to "Deploy from a branch", choose `main` and `/ (root)`, and save.
3. After a minute the site is live at `https://<your-user>.github.io/<repo>/`.
4. Open that address in **Safari** on the iPhone, tap **Share → Add to Home Screen**.

The app now opens full screen and works offline. Your progress is stored on the phone. Use **Settings → Copy backup** now and then.

### Quick test without hosting

```sh
node tools/serve.mjs
```

Then open the "On your phone" address it prints in Safari (the phone must be on the same Wi-Fi). Over plain HTTP everything works except offline mode.

## Free AI for more examples

In the app: **Settings → More examples with a free AI**. Choose a provider, follow the "Get a key" link, then paste the key. Google Gemini is the recommended one: sign in at Google AI Studio and create an API key, no credit card needed. Free tiers have daily limits, and Google may use what you send to improve its products (here that is only requests for example sentences). The key is stored only on your phone.

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
