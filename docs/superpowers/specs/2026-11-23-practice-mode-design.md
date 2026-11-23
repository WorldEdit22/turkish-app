# Practice mode (spaced repetition) — design

Date: 2026-11-23. For **both apps**, built at the same time: Türkçe (`c:\dev\hobby\turkish-app`, UI in
English) and Svenska (`c:\dev\hobby\swedish-app`, UI in Turkish, no English anywhere a person sees it).
The same document lives in both repos.

## Why

Today a word is either "learned" or not, marked once and never checked again. The user wants words and
patterns to come back for practice at growing intervals, like Anki, so they stick. The user practises
Turkish to talk with their parents; the wife's family uses Svenska to talk with Swedes, some starting from
almost nothing.

Both directions matter: native → target trains *saying* it (forming sentences), target → native trains
*understanding* it (following what people say). They are practised and scheduled separately.

## Goals

1. Two modes, switched from the top bar: **Browse** and **Practice**. The mode switch replaces today's
   All / To learn / Learned segment.
2. **Browse:** every word and pattern is always shown and can be selected for examples, as today. There is
   no "learned" anymore: no yellow learned blocks, no swipe to mark, no learned filter or sorts. A word's or
   pattern's window shows its recall state for each direction and lets the user change it (for a mistaken tap).
3. **Practice:** one card at a time from the tab (Words / Patterns) and category the user is on, in the
   chosen direction. The user reveals the answer and rates it Forgot / Hard / Easy; the card leaves and comes
   back on a schedule.
4. A **daily dose** of new cards, with a **More** button, so the first days don't bury the user.
5. **Random spread** on intervals, so cards learned together don't all come back on the same day.
6. What the user already marked learned is kept: those items start as known.

## Non-goals

- Syncing between phones, accounts, or statistics screens and charts.
- Typing answers, multiple choice, or speech recognition: the user says or thinks the answer, reveals, rates.
- A settings screen for intervals or the daily dose (fixed values below; can come later).
- Grammar and help windows, and AI-added words: separate later projects.

## Anti-goals (it fails even if it works)

- Practice progress lost: a reload, an app update or a backup/restore must never wipe it.
- An accidental tap that cannot be put right.
- A review pile that grows faster than a person can keep up with in a few minutes a day.
- In Svenska: any English a person can see.

## Approaches

- **Shared engine, per-app screens (chosen).** The scheduler is one pure module with no visible text,
  identical in both repos and fully tested in Node. Each app keeps its own screens and wording (Svenska's
  in `js/metin.js`).
- Merge both apps into one code base: a big rebuild of two working apps for little gain. Rejected.
- **Order: both apps at once (the user's choice)** over Türkçe first then Svenska. Cost accepted: anything
  changed after trying it is changed in both apps.

## Design

### Cards and directions

- Every word and every pattern has **two cards**, one per direction:
  - **say**: native → target (Türkçe: English → Turkish; Svenska: Turkish → Swedish)
  - **understand**: target → native
- Each card has its own schedule. Card ids derive from the item's existing key (`w.id`, `p:<id>`) plus the
  direction, so renaming a word orphans its cards (as `learned` does today).

### Scheduling (the engine)

Days are counted in local days that **start at 4 a.m.** (practice at 1 a.m. counts toward the day before).

The three answers:

| Answer | New card, or a card after Forgot | Card with an interval |
|---|---|---|
| 🔴 Forgot | comes back later in this session; due today | comes back later in this session; due today; its interval is cleared |
| 🟠 Hard | 1 day | interval × 1.2 (at least +1 day) |
| 🟢 Easy | 3 days | interval × 2.5 (at least +1 day) |

- After Forgot, the card's next Hard or Easy schedules it as a new card would (1 or 3 days).
- **Random spread ("fuzz")**: every interval of 2 days or more is moved by a random amount up to
  ±15% of the interval, and at least ±1 day, then rounded to whole days (min 1). Example: Easy on a new card
  gives 2, 3 or 4 days.
- An always-Easy card comes back after roughly 3, 8, 19, 47 … days.
- **Mastered**: a card whose interval is 21 days or more.
- **Known** (used by examples and AI prompts, see below): an item with at least one card that has an
  interval (answered Hard/Easy, and not Forgot since).
- Each card remembers its state from before its last answer, so a later correction *replaces* the last
  answer instead of stacking a second one.

### The daily dose

- **15 new cards per direction per day**, shared across all tabs and categories. A card counts as new-today
  when it gets its first answer in Practice.
- **More new cards** adds 15 more for that direction, today only.
- Reviews have no daily limit.

### A practice session

The queue for (tab, category, direction):
1. Cards due today or earlier, most overdue first; cards due on the same day in random order.
2. Then new cards, up to what is left of today's dose: **most common first** (words by their existing rank;
   patterns in their "most useful" order).
3. A card answered Forgot goes back into the queue about 4 cards later (at the end if fewer remain).

Changing tab, category, direction or mode rebuilds the queue. Leaving and coming back loses nothing,
because Forgot cards are due today.

### The practice screen

Shown in the list area (between the bars) while Practice mode is on. Text sketch (Türkçe, say direction):

```
┌──────────────────────────────────────┐
│ 12 due · 15 new          Aa  💬  ⚙   │  ← title row
│ [ Browse | Practice ]   [ EN → TR ]  │  ← mode switch + direction switch
│ (All) (💬 Phrases) (🍞 Food) (🐾 …)   │  ← topics (Words) / groups (Patterns)
├──────────────────────────────────────┤
│                                      │
│              dog                     │  ← front
│           ● noun · 🐾                │
│                                      │
│ ──────────── tap to show ─────────── │
│            köpek  🔊                 │  ← back, after the tap
│   Köpeğim var. — I have a dog.  🔊   │
│                                      │
│ [ Forgot ]  [  Hard  ]  [  Easy  ]   │
│  today        1 day      3 days      │
│                    ↶ Undo            │
└──────────────────────────────────────┘
```

- **Front** (say): the native text as the block shows it, with the word-type dot and topic icon (words).
  (understand): the target text with a speaker; in Svenska also its pronunciation hint when hints are on.
- **Tap the card** (or a "Show" button) to reveal the **back**: the other side, a speaker, in Svenska the
  pronunciation hint and the forms line, the word's note if any, and **one example sentence** (the first
  hand-written example; for a word without one, the first generated example from `examples.js`).
- **Patterns**: the front shows the pattern as its block does **plus one hand-written example sentence**
  from a random variant, both in the front's language; the back shows the target pattern, **the chosen
  variant's own form** (most patterns have several variants, so the example may not match the headline:
  "I'm ___" with "Are you tired?"), and the example in the target language, with speakers.
- **Answer buttons** appear only after revealing, coloured red / orange / green, each with the next
  interval under it (before fuzz: "today", "1 day", "~3 days", "~8 days"…).
- **Undo** (my call): after an answer, "↶ Undo" puts the last answered card back as it was, at the front of
  the queue, and gives back its new-card count. Only the last answer, and only until the queue is rebuilt.
- **Done for today**: when the queue is empty, show what was done today in this direction and a
  **More new cards** button while unseen cards remain in this selection. When nothing is unseen and nothing
  is due: "All caught up here. Next review in N days."

### The top bar in each mode

- **Mode switch**: `Browse | Practice` (Svenska: `Göz at | Çalış`), in place of today's status segment.
- **Browse**: search field and camera, sort menu (minus "To learn first" / "Learned first"), chips by word
  type (Words) or group (Patterns), Clear (N) — as today.
- **Practice** (my calls):
  - The sort menu's place holds the **direction switch**, one button that flips between `EN → TR` and
    `TR → EN` (Svenska: `TR → SV` and `SV → TR`). Default: say.
  - The search row (search and camera) is hidden: there is nothing to search on one card.
  - Chips: **topics** with their icons on Words (All + every category), **groups** on Patterns.
  - Clear (N) is hidden.
  - The title row shows `N due · M new` for the current selection and direction (M = new cards left today).
- **Browse** title row: `N / M mastered`, where an item counts as mastered when **both** its cards are
  (my call). Topic headers in "By topic" show the same count for their topic.
- Mode, direction and the practice chip choices are remembered (`ui`). The app still always opens on Words.

### Browse mode: the window's recall section

The "Mark as learned" button in a word's or pattern's window becomes a small **Practice** section with
one row per direction:

```
EN → TR   🟠 Hard · next in 2 days
          [ New ] [ Forgot ] [ Hard ] [ Easy ]
TR → EN   New
          [ New ] [ Forgot ] [ Hard ] [ Easy ]
```

- The highlighted button is the card's last answer (or New).
- Tapping Forgot / Hard / Easy **replaces the last answer** (applied today, from the state before it); on a
  new card it answers it now, without counting toward the daily dose.
- **New** resets that card to new, and counts as its last answer: the state before it is kept, so a
  mistaken New is put right by tapping another button (which then applies to the state before New).
- The status text shows New, "due today", "next in N days", or "mastered · next in N days".

### What goes away

- The learned look on blocks (yellow), the swipe to mark learned/not learned (and `js/swipe.js`, its test
  and CSS if nothing else uses them), the status filter, the "To learn first"/"Learned first" sorts, the
  "Mark as learned" button, and the learned toasts.
- `isLearned` in examples and AI prompts becomes **known** (defined above): example sentences prefer known
  words and patterns, and "More examples" builds AI prompts from known ones, exactly where it used learned.

### Keeping what's already learned

- On first start with practice data empty and the old `learned` map non-empty: every learned item gets
  **both** cards as known: interval 7 days, first review on a random day 1 to 21 days ahead.
- This runs **once**: a saved "migrated" flag stops it from running again, so Reset progress does not bring
  the old learned items back on the next start.
- The old `learned` data is left in storage untouched (a safety copy) and no longer read after migration.

### Saving, backup, restore, reset

- Practice data is saved in its own storage key (`tl.…` / `sv.…`), compact enough for ~2,200 cards per app
  (both apps share the github.io origin's storage).
- **Copy backup** writes `{ app, v: 2, cards, … }`. **Restore** accepts that and the old `{ learned }`
  backups (migrated as above); in both apps it refuses another app's backup. Restore replaces all current
  practice progress, so it first asks for confirmation and says so.
- **Reset progress** clears all practice data (after the existing confirm).
- Settings' progress text counts mastered patterns and words.

### Release

- Bump `CACHE` in both `sw.js` files and add new modules to `ASSETS`.
- README: a short section on Browse and Practice.

## Constraints

- Plain HTML/CSS/ES modules, no build step, no dependencies; tests with `node --test`
  (`"/c/Program Files/nodejs/node.exe"`, not on PATH).
- Svenska: every visible string in `js/metin.js`; `tests/turkce.test.js` keeps checking for English.
- The scheduling module is identical in both repos.
- Builds on the quick fixes, merged and pushed 2026-11-23 (only `main` scrolls; the practice screen lives
  inside it).

## Left to the builder

- Module boundaries beyond the shared engine (suggested: `js/srs.js` pure engine; a pure practice-screen
  HTML builder like `scanview.js`; wiring in `app.js`), the storage shape, and the exact field names.
- Exact styling of the card, answer buttons and the window's Practice section, within each app's look.
- Svenska wording for the new strings (Forgot / Hard / Easy suggested as `Bilemedim / Zor / Kolay`); the
  wife proofreads the Turkish.

## Calls made without asking (for the user to check)

Undo in practice; search row hidden in practice; direction switch where the sort menu was; "mastered"
needs both directions; Forgot then Hard/Easy restarts at 1/3 days; corrections from the window don't count
toward the daily dose; migrated items get interval 7 days with first review 1–21 days ahead; one example
sentence on the back. After the builder check: migration runs only once (a flag), New can itself be
corrected, Restore asks first, and a pattern card's back shows the chosen variant's form.

Builder check (2026-11-23): nothing important left open. Card counts: Türkçe 942 words + 82 patterns
(~2,050 cards), Svenska 1,013 words + 78 patterns (~2,180 cards); every pattern variant has a
hand-written example; `js/swipe.js` is used only by `app.js`.
