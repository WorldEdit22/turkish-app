# Card mix: no link between the two directions — design (short)

Date: 2026-11-26. Both apps (the same change; `js/srs.js` stays byte-identical). Approved in conversation.

## Why

New cards come strictly most-common-first, and both directions use the same list, so today's new EN → TR
cards (Svenska: TR → SV) are exactly today's new TR → EN cards. Switching direction then shows words that
are fresh in memory, which is not a fair test. The user wants the two directions to have no correlation.

## Design

- **New cards are random from the most common unseen.** For the current tab, topic or group and direction,
  take the unseen items in their existing order (words most common first, patterns most useful first),
  keep the first **60**, and draw today's new cards from those at random.
- **Held back from the other direction for a week.** An item whose card in the *other* direction was
  answered in the last **7 days** is not offered as a new card in this direction.
- **Reviews:** a due card whose other direction was answered *today* goes after the other due cards
  (it still comes up today, just not right away).
- To know when a card was last answered, every answer records the day (`seen`). Cards answered before this
  change, and the migrated learned marks, have no day and are never held back.
- The title row's "M new", and whether "More new cards" shows, count only the new cards that may be
  offered (not the held-back ones).

## Approaches

- **Random from the 60 most common unseen, plus a one-week hold-back (chosen):** the two directions get
  different words, and beginners still meet useful words first.
- Fully random from everything unseen: no correlation either, but a beginner meets rare words (zebra, satranç)
  as early as the most common ones.
- Keep most-common-first and only add the hold-back: the directions differ, but each direction's order stays
  predictable.

## Left to the builder

Names, and how tests fix the randomness.
