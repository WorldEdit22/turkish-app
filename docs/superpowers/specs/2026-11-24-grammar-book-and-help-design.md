# Grammar book and help — design

Date: 2026-11-24. For **both apps**, built at the same time: Türkçe (`c:\dev\hobby\turkish-app`, UI in
English) and Svenska (`c:\dev\hobby\swedish-app`, UI in Turkish, no English anywhere a person sees it).
The same document lives in both repos.

## Why

- **The book.** Learners who get curious about *why* a pattern looks the way it does want to dig into the
  grammar: a guide with sections that are easy to move between and cover most of the language, written for
  that learner (Türkçe: Turkish grammar explained in English; Svenska: Swedish grammar explained in Turkish).
- **The help.** People new to the app (the wife's family especially) need to know what each feature is for
  and when to use it, without a wall of text.

## Goals

1. A **book button** (book icon) replaces today's "Aa" alphabet button: in the top row, and in every
   window's title row (next to the translate bubble). It opens the **book**: a list of sections, the first
   being **"Letters and sounds"** — exactly what the alphabet window shows today — followed by the grammar.
2. A **help button** (question-mark icon) in the top row opens the **help**: one line on what the app is for,
   a list of short topics, ending with a suggested daily routine.
3. Both open as a window on top of anything (like the translator and today's alphabet), and closing returns
   to what was below. Inside: tap a section in the list to open it on its own page; **‹** goes back to the
   list (at the same scroll position); **✕** closes.
4. Every grammar section: a few short paragraphs, a small table where it helps, and **2–5 example sentences**
   you can tap to hear, each with its translation.

## Non-goals

- Links from grammar sections to the app's patterns or words (possible later).
- Search inside the book, exercises, or AI-written grammar at run time: the content is fixed text in the app.
- Changing the practice features, or what the alphabet section contains.

## Anti-goals (it fails even if it works)

- A wall of text: a section should fit in one or two phone screens; paragraphs stay short.
- English visible anywhere in Svenska.
- Wrong grammar stated confidently: content is written with AI help and proofread (the user the Swedish,
  the wife the Turkish); the Türkçe book's Turkish examples are best checked with a native speaker.
- The top row overflowing again (the gear pushed off the screen).

## Approaches

- **A. Content as structured data, one shared list-and-page view (chosen).** Each section is a list of simple
  blocks (paragraph, list, table, examples, tip); one view draws both the book and the help as list → page →
  ‹ back, like the scans window. Tests can check every example (speaker, translation) and that Svenska has
  no English.
- B. Each section hand-written as an HTML string: faster to type, but hard to keep consistent across ~40
  sections in two apps, and the automatic checks above would not work.
- C. One long scrolling page per window with a table of contents: simplest, but exactly the overwhelming wall
  of text the user wants to avoid.

## Design

### Buttons

- **Top row** (both apps): progress text, Clear (N), **book**, translate bubble, **?**, gear. "Aa" is gone.
- **Window title rows** (word, pattern, scans, sentence): **book**, translate bubble, ✕. The ? is only in the
  top row. The translator keeps only its ✕; the book and help windows have ✕ (and ‹ on a section page).
- New line icons in `js/html.js` in the style of the others: an open book, and a question mark in a circle.

### The windows

- The existing alphabet window becomes the **book** window; a new **help** window works the same way. Both open
  on top of anything and keep `noscroll` and the toast host order consistent with the other windows.
- **List page:** the window title ("Grammar" / "Dil bilgisi"; "Help" / "Yardım"), then one row per section:
  its icon, title, a one-line subtitle saying what it covers, and ›. The help list starts with the one-line
  purpose of the app above the rows.
- **Section page:** ‹, the section title, ✕ in the title row; the section's blocks below.
- **Place (my call):** while the app is open, reopening the book returns to the section and scroll position you
  were at; ‹ from a section returns to the list where you left it. A fresh launch starts on the list.

### Content format

- A section: `{ id, icon, title, sub, blocks }`. Blocks:
  - `{ p: text }` — a short paragraph
  - `{ list: [text, …] }` — bullets
  - `{ table: { head: [..] | null, rows: [[..], …] } }` — a small table (forms, endings)
  - `{ ex: [[target, native], …] }` — examples: target sentence with a speaker, translation under it
  - `{ tip: text }` — a highlighted tip
  - `{ alphabet: true }` — the Letters-and-sounds section: renders today's alphabet content (letters, then the
    tricky sounds) without its own title bar
- **Highlighting (my call):** text may mark a part with `*…*` (e.g. `ev*e*`, `bil*en*`) to show it in bold —
  the ending a rule is about. Everything else is escaped as everywhere in the app. The speaker and the
  pronunciation hint use the text without the `*` marks.
- Svenska: under each example's Swedish, its pronunciation hint when hints are on in Settings (the alphabet
  section keeps showing hints always, as today).
- Content lives in data modules (one for the book, one for the help) next to the existing data; Svenska's are
  in Turkish and covered by the no-English tests like `data/alfabe.js`.

### The book's sections

**Türkçe** (Turkish grammar, in English), about 19 sections:
Letters and sounds; Vowel harmony; Consonant changes; Word order; Plural; "To be" and personal endings
(incl. var / yok); The cases (-i, -e, -de, -den, -in); Possessive endings and compound nouns; Pronouns;
Questions (mi, question words); Present continuous -iyor; Simple present -ir; Past -di and -miş; Future -ecek;
Negation and commands; Can / must / want; Linking sentences (ve, ama, çünkü, -ince, -ip); Postpositions and
comparison; Numbers and time.

**Svenska** (Swedish grammar, in Turkish), about 20 sections:
Harfler ve sesler; Kelime sırası: fiil ikinci sırada; en ve ett; "Belirli" eki; Beş çoğul grubu; Sıfat uyumu;
Zamirler; İyelik (min/mitt/mina, sin); Şimdiki zaman: herkes için tek biçim; Geçmiş zaman; har + supinum;
Gelecek: ska / kommer att; Emir kipi; Yardımcı fiiller (kan, vill, måste…); inte'nin yeri; Sorular; Edatlar;
Bağlaçlar ve yan cümleler; Karşılaştırma; Sayılar ve saat.

The exact list may move by a section or two while writing; the order goes from sounds to words to sentences.

**Writing guidance:**
- Türkçe: for an English-speaking learner who also knows Swedish; compare with English (or Swedish) where it helps.
- Svenska: simple Turkish for Turkish speakers with little Swedish; compare with Turkish where it helps
  (Turkish has no gender; the Turkish verb comes last, the Swedish one second).
- Each section: what it is, the rule, a table if forms are involved, 2–5 examples, and a tip if there is a
  classic mistake. About 120–250 words. Prefer words and patterns that are already in the app.

### The help's topics (both apps, short)

The purpose of the app in one line, then: Practice (a session, Show answer, Forgot / Hard / Easy, Undo, the
daily 15 and More, the two directions); Browse (tapping blocks to select them for examples, ⓘ for a word's or
pattern's window, correcting a card's answer there); Search and photo scan; Translate; The book; More
examples with AI (setting up a free key); Settings and backup (show the target language on blocks,
pronunciation hints in Svenska, copy a backup now and then); A daily routine (e.g. practise 5–10 minutes,
browse a topic when something comes up, look things up in the book when curious). Each topic 2–6 lines.

### Release

- Bump `CACHE` in both `sw.js`; new modules in `ASSETS`.
- README: the book and the help in a line or two each.

## Constraints

- Plain HTML/CSS/ES modules, no build step, offline; tests with `node --test`
  (`"/c/Program Files/nodejs/node.exe"`, not on PATH).
- Svenska: every visible string in `js/metin.js` or Turkish data modules; `tests/turkce.test.js` and the
  no-English checks keep passing; app.js has no visible text.
- Both apps in the same go; T and S structurally parallel (same view, different text).
- The top row must fit on a 390 pt wide phone with Clear (N) showing.

## Left to the builder

- Module and file names, exact section icons, CSS within each app's look.
- The final wording of every section and topic, following the guidance above.

## Calls made without asking (for the user to check)

The ? only in the top row; the book remembers its place while the app is open; `*…*` highlighting for endings;
examples in Svenska show hints only when hints are on (the alphabet section always does); a one-line subtitle
under each section title in the list; the speaker and hints ignore the `*` marks.

Builder check (2026-11-24): nothing important left open.
