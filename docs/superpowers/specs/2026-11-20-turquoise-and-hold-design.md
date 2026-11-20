# Turquoise theme and press-and-hold marking — design

Approved in conversation on 2026-11-20. Small change.

## Why

The user wants more colour, especially in the header and the bottom tab bar. And tapping a block often marks it
green by accident, because the check circle's tap area covers about a quarter of the block.

## Decisions

- **Tap** anywhere on a block always opens its card. The circle only shows learned / not learned.
- **Press and hold** a block for 500 ms toggles learned, with a short toast ("Marked as learned" / "Not learned").
  Moving the finger more than 10 px cancels, so scrolling never marks. The card's "Mark as learned" button stays,
  with a tip under it about press-and-hold.
- **Turquoise** (user's pick of turquoise / Turkish red / indigo): deep turquoise header and bottom tab bar with white
  text and icons; the iPhone status bar area is turquoise too. Search field and filter chips stay white on the
  turquoise header; the selected chip and segment are dark teal. Links and speaker icons use a darker turquoise for
  contrast on white. Green stays the learned colour. Dark mode uses a deeper turquoise.

## Approaches considered (tap problem)

1. **Tap opens, press-and-hold marks (picked)** — no accidental marks, quick marking still possible.
2. Smaller circle hit area — fewer accidents but still some, and a too-small target.
3. Marking only inside the card — safest but slow for marking many known words.

## Non-goals

No other layout changes. Swipe gestures are out.
