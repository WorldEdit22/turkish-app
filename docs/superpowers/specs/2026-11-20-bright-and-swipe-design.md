# Bright turquoise look, Mark mode and swipe — design

Approved in conversation on 2026-11-20.

## Why

The user wants a much brighter turquoise, fading diagonally, with more depth. On the iPhone, press-and-hold does not
mark blocks (taps open fine), so marking needs ways that do not depend on a gesture the phone may claim for itself.
The check circle goes; a learned block shows by its colour.

## Decisions

**Marking**
- **✓ Mark** button in the header (hidden on Settings). On: it reads **Done**, a line "Tap blocks to mark or unmark
  them" appears, and taps toggle learned instead of opening. Off when the app starts.
- **Swipe** a block: right (≥ 60 px) = learned, left = not learned, with a short toast. The block follows the
  finger. Vertical movement scrolls as usual (`touch-action: pan-y` on blocks). A swipe never opens the card.
- The card's **Mark as learned** button stays. Press-and-hold and its tip are removed.

**Look**
- Header and tab bar: `linear-gradient(135deg, #2ee6d6, #12b5e0)` with dark-teal text `#05343a` (secondary
  `#073f45`); contrast ≥ 4.5:1 across the gradient. Tab bar active tab: light pill. Selected chip / segment: dark teal
  with white text.
- Page: faint turquoise-to-white background. Blocks, chips, buttons: thicker border, stronger shadow, sink slightly
  when pressed.
- Learned block: the same turquoise gradient, dark text, soft glow; no circle. Green is removed from the app
  (highlights, switch, buttons use turquoise).
- Dark mode: deeper gradient `#0c7a76 → #0a5f80` with white text.

## Approaches considered (marking)

1. **Mark mode + swipe (picked)** — fast, and Mark mode works without any gesture.
2. Press-and-hold — fails on the user's iPhone.
3. Card button only — reliable but slow for many known words.
