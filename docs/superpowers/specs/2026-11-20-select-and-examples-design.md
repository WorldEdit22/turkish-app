# Select words and patterns, cleaner card — design

Agreed in conversation on 2026-11-20. Items marked *(my call)* were filled in by Claude and can still be changed.

## Why

The user wants to pick a few words and a few patterns and see them used together, instead of only seeing examples with
everything already learned. Marking learned stays a deliberate action. The screen should feel cleaner: fewer buttons,
less text in the card, more depth on the bars. The speaker button does not play anything in Safari on the iPhone.

## Decisions

**Bars and layout**
- Top bar and tab bar get more depth: a stronger, layered shadow on their inner edges (the exact values are the
  builder's choice).
- The title ("Patterns" / "Words") is removed. The top row keeps the progress text and the TR toggle, and gets a gear
  button that opens Settings.
- The ✓ Mark button, its hint line and Mark mode are removed.
- The tab bar has two tabs: **Words** on the left, **Patterns** on the right. The app opens on Words every time it starts
  *(my call)*.
- Settings shows in place of the list, like today. While it is open the gear is shown pressed and no tab is highlighted.
  Tapping a tab, or the gear again, goes back *(my call)*.

**Selecting (option A, picked by the user)**
- Tapping a block selects or unselects it. A selected block gets a see-through turquoise fill and a darker turquoise
  border. The border is what shows selection on a learned block, which is already turquoise *(my call)*.
- A small ⓘ button in the block's top-right corner opens the information card. Its tap area is at least 44 px even
  though the icon is small. On Words the topic emoji stays in the bottom-right corner.
- Swiping a block still marks it learned (right) or not learned (left). A swipe never selects.
- Words and patterns can be selected together, on both tabs. The selection is saved on the phone *(my call)*.
- When anything is selected, the top row shows **Clear (N)**, which unselects everything *(my call)*.
- Keyboard: Enter or Space on a block selects it; the ⓘ is its own button.

**Marking learned**
- Only by swiping, or with **Mark as learned** in the card.

**The card**
- The heading with the ✕ stays at the top while the card scrolls.
- No rank line ("#12 most common"). Words keep "Noun · 🍎 Food"; patterns have no meta line.
- The tip under **Mark as learned** is removed.
- One **Examples** list instead of "Examples" plus "With common words / your words". No Shuffle.
- **Pattern card, per variant**, in this order:
  1. One sentence for each selected word that fits the variant (a random template of that variant).
  2. The hand-written examples. They have no highlight, because the app does not know which word in them fills the gap.
  3. Up to 3 sentences with learned words that fit, or with common words if none are learned, skipping words already
     used above.
- **Word card**, in this order:
  1. For each selected pattern, one sentence per variant the word fits, labelled with the variant like today
     ("___ istiyorum · I want ___").
  2. The word's hand-written example.
  3. Up to 4 sentences with learned patterns, or common patterns if none are learned, skipping selected patterns.
- Generated sentences highlight the word as "With common words" does today.
- No sentence appears twice. When a hand-written example matches a generated one, only the highlighted, generated one
  is kept *(my call)*.
- Selected items that do not fit are skipped without a message *(my call)*.
- The AI section is unchanged.

**Sound**
- Cause, confirmed by the user: the iPhone's silent mode mutes the speaker button in Safari. With silent mode off it works.
- Try telling Safari the page plays audio like a media player (`navigator.audioSession.type = 'playback'`, iOS 17+).
  This is known to let other web audio play in silent mode, but nobody has confirmed it for speech, so the user tests it
  with silent mode on.
- Whether or not that works, Settings → Pronunciation says "No sound? Silent mode mutes it on iPhone." *(my call)*.

**Housekeeping**
- The code that builds the example list moves into its own module with tests (`node --test tests/`).
- The offline cache version goes up so phones pick up the update. The README describes selecting instead of Mark.

## Approaches considered (selecting)

1. **Tap selects, ⓘ opens (picked)**: selecting is the most common action, so it gets the big target, and a wrong tap
   is harmless.
2. Checkbox selects, tap opens: keeps today's tap-to-open, but selecting many blocks needs precise taps, and a missed
   checkbox tap opens the card.

## Not in this change

- Taking a photo of Turkish text and asking the AI to explain its grammar and words: a possible later feature.
- The AI's "More examples" does not use the selection yet.
