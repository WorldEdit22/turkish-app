# Selection headings, sound in silent mode, top row clear of Safari's blur — design

Agreed in conversation on 2026-11-21. Items marked *(my call)* were filled in by Claude and can still be changed.

## Why

The user tried the selection update on an iPhone in Safari and reported four things:

1. The speaker buttons are still silent in silent mode through the phone's speaker. They work with headphones.
2. The top row is faded: half the gear is blurred as soon as the page opens, not only after scrolling.
3. Not every selected word or pattern shows up in an opened block, which looks like a bug.
4. They want the sentences made from the selection under their own heading.

## Decisions

**Selection in the card (3 and 4)**
- The card shows a **From your selection** heading over the sentences made with selected items, then **Examples** over the
  hand-written examples and the learned or common extras.
- Selected items that are not used get one faint line in that section: **Not used here: gelmek, ev**. A pattern card
  lists selected words by their Turkish. A word card lists selected patterns by their English. *(my call: "Not used
  here" instead of "Doesn't fit here", because it is also true for a form that has no sentence templates.)*
- Pattern card: per form (variant), as today. A selected word is "not used" when it does not fit that form, or when the
  form has no templates (14 of 202 forms).
- Word card: a selected pattern is "not used" when the word fits none of its forms. Forms the word does not fit are
  left out without a note; each sentence's label already names its form.
- When nothing relevant is selected, there is no "From your selection" heading. Selected patterns are not relevant on a
  pattern card, and selected words are not relevant on a word card. When something is selected but none of it is used,
  the section shows only the "Not used here" line.
- The no-duplicates rule stays across both sections.

**Sound in silent mode (1)**
- Keep `navigator.audioSession.type = 'playback'`, which was not enough on its own.
- Add: on iPhone and iPad only, inside the tap and just before `speechSynthesis.speak`, play a 0.05 s silent WAV through
  an `<audio>` element. This switches iOS to media playback, which silent mode does not mute. One project confirmed it
  on a real iPhone in silent mode (github.com/hungchistudio-glitch/exchange-notes/pull/195).
- The silent clip is built in code as a data URI, so it also works offline. *(my call)*
- If this still fails on the user's phone, the built-in voice cannot be made to play in silent mode, and the Settings
  hint stays as the answer.

**Top row and Safari's blur (2)**
- iOS 26 Safari blurs a strip at the very top of the page. In a Safari tab the app's top row starts 10 px down, so its
  upper half is in that strip.
- In a Safari tab (anything but the home-screen app), the top bar gets about 30 px more padding above its first row, so the row
  starts about 40 px down. The bar's colour still fills the strip. The home-screen app keeps today's padding, which
  already starts below the status bar. *(my call: 30 px, from "half the 34 px gear is blurred" plus a margin; one CSS
  value to tune if it is not enough)*

**Housekeeping**
- Offline cache version goes up to `turkish-v6`.

## Approaches considered

- **Sound:** (a) silent clip plus the playback setting (picked: the only fix reported to work on a real iPhone);
  (b) prerecorded audio files, which cannot cover generated sentences and would need many files; (c) the Settings hint
  only, which is what remains if (a) fails.
- **Blur:** (a) move the first row below the strip (picked: simple, and reported to work); (b) a transparent pinned
  header, which reportedly keeps Safari from painting the status bar but does not fit a coloured bar; (c) `theme-color`,
  reported to have no effect.
- **Not used note:** (a) a line per form (picked: says exactly which words are missing from which form); (b) one line
  per card, which cannot explain words that fit some forms but not others.

## Not in this change

- The home-screen app's own status-bar behaviour on iOS 26, until the user installs it.
