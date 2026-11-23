# Quick fixes: scroll line and an alphabet window — design

Date: 2026-11-23. Approved in conversation. The Swedish app gets the same scroll fix and a fix to
its alphabet voice (see its own spec of the same date).

## Why

- On the iPhone the page's scroll line runs over the top and bottom bars. It should stay between them.
- The Swedish app has an alphabet window and the user wants it here too.

## Changes

1. **Only the list scrolls.** Same as in the Swedish app: the page becomes a column that fills the
   screen (top bar, list, tab bar); `#list` and `#settings` scroll; the tab bar is no longer laid over
   the list; switching tabs scrolls the list to the top; content stays centered at 900 px by padding
   inside the full-width scroll area.
2. **Alphabet window**, built like the Swedish app's:
   - An "Aa" button next to the translate bubble in the top row, and in every window's title row next
     to the bubble. It opens on top of anything and closing it returns to what was below.
   - A short intro line: every letter is always said the same way, and every letter is said.
   - All 29 letters in order: A B C Ç D E F G Ğ H I İ J K L M N O Ö P R S Ş T U Ü V Y Z. Each row: the
     letter button ("Ç ç"), its Turkish name (be, ce, yumuşak ge, …), its sound in English, and an
     example word with its English meaning and a speaker.
   - Where English has no such sound, a Swedish comparison (ö = Swedish ö, ü ≈ Swedish y).
   - Tapping a letter speaks its name ("be", "yumuşak ge"), so the voice never says "capital".
   - Then "Tricky letters": ğ, ı, c, ç and ş, each with a short explanation and example words.
   - No pronunciation hints: Turkish is written as it is said, and this app has none elsewhere.
   - Files: `data/alphabet.js`, `js/alphabetview.js`, `tests/alphabet.test.js`, the ABC icon in
     `js/html.js`, styles copied from the Swedish app (including the window styles that the Swedish
     app was missing for `#alphabet`).
3. Cache version bump in `sw.js` (`turkish-v12`) and the new files in its list.

## Approaches

- **Only the list scrolls** (picked), for the same reasons as in the Swedish app's spec.
- The alphabet follows the Swedish app's window, so both apps work the same way. Speaking the
  letter's name rather than the letter itself is the one difference: Turkish names are real Turkish
  text the voice can read; the Swedish app's names are pronunciation hints in Turkish letters.

## Left to the builder

- Sound descriptions and example words, kept short and everyday (family-friendly, ideally words the
  app already has).
- Exact CSS, with the same rules as the Swedish app's spec.
- Can't be checked here on a real iPhone: the user checks the scroll line and the letter voices.
