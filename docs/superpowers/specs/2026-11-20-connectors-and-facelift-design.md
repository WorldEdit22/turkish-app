# Connectors, pattern groups and UI facelift — design

Approved in conversation on 2026-11-20.

## Why

The app's purpose is to help the user speak everyday Turkish quickly. The 55 pattern blocks cover the basics but
few connectors (the suffix-based ways to join ideas, like *-madan önce*). The user wants more connectors, common
ones only, in the same style. The grey blocks feel dull; the user wants a whiter look with contrast, borders and
shadows.

## Goals

- 27 new connector blocks, plus extra variants in existing blocks, plus about 12 connector words.
- Pattern groups with filter chips: All · Everyday · Verbs & tenses · Connectors.
- Facelift: white cards with thin border and soft shadow on a near-white background; stronger text contrast;
  learned = green border + faint green tint + filled check; white bordered controls; dark mode gets the same
  treatment.

## Non-goals and anti-goals

- No rare or literary connectors (*oysa*, *-dikçe* yes, *-esiye* no).
- No person forms (you/we/he) for existing tenses in this round.
- No new screens or flows; the app must stay as fast and simple as today.
- Nothing is pushed to GitHub until the user has seen screenshots and agreed.

## Approaches considered

1. **Add data in the existing format (picked).** Patterns, variants and templates go into `data/patterns.js`; words
   into `data/words.js`. The engine already handles almost every needed suffix. One small engine change: a word may
   have several kinds (`kind: 'room|event'`), so *iş* can be both a place you go to and an event you do something
   after (*işten sonra*).
2. Fold everything into existing blocks as variants. Rejected: the user wants more visible blocks, and most of the
   connectors are new meanings.
3. A separate "Connectors" tab. Rejected: grouping chips give the same focus without another tab.

## New pattern blocks

Time: *-dikçe* (the more / every time, + *-medikçe* unless, + *her -diğimde*), *-den beri / -diğimden beri* (since),
*-mek üzereyim* (about to), *-meye devam* (keep ___ing), *-ken* (while / when I was: adjectives, life stages,
places).

Cause and condition: *-sa bile* (even if), *-mama rağmen / -diğim halde / -e rağmen* (although / despite),
*-diğim sürece* (as long as), *madem / -diğine göre* (seeing that), *yüzünden / sayesinde* (because of / thanks to),
*ne zaman / ne / nereye -irsen* (whenever / whatever / wherever you).

Manner and comparison: *-erek* (by ___ing), *gibi / -mış gibi / -ecek gibi* (like / as if / looks like it will),
*-diğin gibi* (as you said), *-diğin kadar* (as much as), *-den fazla / az* (more / less than),
*o kadar … ki* (so … that), *hem / ya / ne … de* (both / either / neither).

Saying and thinking: *-diğini biliyorum / -eceğini söyledi / -eceğini sanıyorum* (that …), *-mış* (apparently),
*-ebilir / -meyebilir* (might / might not), *keşke* (I wish), *-sene!* (why don't you), *-e göre* (according to),
*-imle birlikte* (with my ___), *-mekten* (tired of / afraid of / enjoy ___ing), *-meyi düşünüyorum /
-meye karar verdim* (thinking of / decided to).

Variants added to existing blocks: before / after with nouns (*toplantıdan önce*, *işten sonra*), until with
nouns and hours (*akşama kadar*, *saat beşe kadar*), *-mak zorundayım* (have to), *-sin* (let him), *-diği için*
(because he / it).

Connector words (Words tab, Little words): bu yüzden, o yüzden, yani, ayrıca, bu arada, neyse, o zaman, yoksa,
sonunda, hatta, sanki, ondan sonra.

Supporting words: *trafik* (traffic), *genç* (young). New kinds: `meal` (meals, *yemek*), `life` (çocuk, bebek,
öğrenci), `cause` (trafik), `today` (bugün, yarın), `soon` (sonra, yakında).

## Groups

Every pattern gets `group: 'everyday' | 'verbs' | 'connectors'`. The Patterns tab shows chips All · Everyday ·
Verbs & tenses · Connectors next to the existing status filter and sort. New blocks are placed in the
"most useful" order by how common they are in speech.

## Facelift

Light: page `#f7f8fa`, cards `#ffffff`, border `#e2e4e9`, shadow `0 1px 2px rgba(16,24,40,.05), 0 2px 6px
rgba(16,24,40,.05)`, text `#111418`, secondary `#5b6270`. Learned: border green, background a faint green tint,
filled check. Controls (search, segmented filter, sort, chips): white with a 1px border; selected chip dark.
Header: white with a bottom border. Sheet: white, examples in light bordered rows. Dark mode: the same structure
with dark surfaces and lighter borders.

## Left to the builder

English template wording, which existing words get the new kinds, exact shades, ordering of new blocks within
"most useful".
