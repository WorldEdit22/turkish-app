# More words: fill the gaps, with animals

Status: approach A chosen, design awaiting approval. Size: small change (mostly data).

## Why

While talking with their parents, the user wanted to show the word for "lion" and couldn't find it. The list has 709 words chosen for everyday conversation, so some topics a family chat touches are thin:
- animals: 4 words
- nature: 6 words besides the weather words
- clothes: 13 words
- hobbies and sports: none

The goal is to fill those gaps so common words like these can be found and learned.

## Goals

- Add about 200 everyday words across the thin topics, including a new **Animals** topic and a new **Hobbies & sports** topic.
- Every new word works like the existing ones:
  - it is searchable and sorted by topic;
  - it is ranked by how common it is in spoken Turkish;
  - its generated example sentences are grammatically right in both languages.
- Saved progress is untouched.

## Non-goals

- An "Add your own word" feature (option C). It could come later.
- Rare or specialist vocabulary, and new grammar patterns.

## Anti-goals

- Words that crowd out the everyday core. Under "Most common", rarer words sort lower.
- Example sentences that are wrong or silly, such as "a rice" or "I have a sky".
- Losing anyone's learned or selected words.

## Approaches considered

- **A. Topic by topic, hand-picked, checked against the subtitle frequency list.** Chosen.
- **B. The most frequent missing words from the subtitle list.** Rejected: it leans towards TV-drama words and wouldn't fill topics like animals.
- **C. A user "Add a word" button.** Deferred.

## Design

**Topics**
- New **Animals** 🐾, placed after "Weather & nature".
- New **Hobbies & sports** ⚽, placed after "Clothes".
- The 4 existing animal words (hayvan, kedi, köpek, kuş) move to Animals.
- Their saved ids stay `nature:…`, so learned and selected marks are kept.

**Word list** (proposed). A word is dropped or swapped during the build if:
- it turns out to be a duplicate;
- it isn't in the 50,000-word subtitle list at all;
- it can't get sensible example sentences.

- **Animals:** aslan lion, kaplan tiger, fil elephant, maymun monkey, ayı bear, kurt wolf, tilki fox, tavşan rabbit, at horse, inek cow, koyun sheep, kuzu lamb, keçi goat, domuz pig, ördek duck, horoz rooster, yılan snake, kaplumbağa turtle, kurbağa frog, fare mouse, arı bee, kelebek butterfly, sinek fly, böcek bug, örümcek spider, karınca ant, yunus dolphin, köpekbalığı shark, balina whale, zürafa giraffe, deve camel, eşek donkey, kartal eagle, güvercin pigeon, martı seagull, penguen penguin, sincap squirrel, timsah crocodile, yavru young animal (kitten / puppy).
- **Nature:** doğa nature, nehir river, sahil coast, ada island, kum sand, taş stone, çimen grass, gökyüzü sky, ay moon, yıldız star, dünya world, toprak soil, yaprak leaf, tepe hill, çöl desert, fırtına storm, sis fog.
- **People & family:** anneanne grandmother (mother's mother), babaanne grandmother (father's mother), dayı uncle (mother's brother), hala aunt (father's sister), kuzen cousin, torun grandchild, yeğen niece / nephew, koca husband, erkek kardeş brother, kız kardeş sister, akraba relative, gelin bride / daughter-in-law, damat groom / son-in-law, nişanlı fiancé(e), ikiz twin.
- **Food:** çilek strawberry, kiraz cherry, şeftali peach, armut pear, kayısı apricot, incir fig, nar pomegranate, kavun melon, havuç carrot, patlıcan aubergine, kabak courgette, fasulye beans, mercimek lentils, sarımsak garlic, mantar mushroom, un flour, sucuk Turkish sausage, pide pide, tost toasted sandwich, kurabiye cookie, reçel jam, fındık hazelnuts.
- **Drinks:** limonata lemonade.
- **Home:** bahçe garden, merdiven stairs, duvar wall, halı carpet, perde curtain, ayna mirror, lamba lamp, yastık pillow, battaniye blanket, çamaşır makinesi washing machine, ütü iron, süpürge vacuum cleaner, diş fırçası toothbrush, oyuncak toy, asansör lift.
- **Around town:** köy village, kütüphane library, benzinlik petrol station, otopark car park, hayvanat bahçesi zoo, bina building.
- **Clothes:** kemer belt, kravat tie, eldiven gloves, atkı scarf, bere beanie, çizme boots, terlik slippers, şort shorts, pijama pyjamas, mayo swimsuit, yüzük ring, kolye necklace, küpe earrings.
- **Shopping:** cüzdan wallet.
- **Hobbies & sports:**
  - futbol football, basketbol basketball, voleybol volleyball, tenis tennis, satranç chess
  - maç match, takım team, top ball, oyun game
  - müzik music, şarkı song, film film, dizi TV series, resim picture / painting
  - gitar guitar, piyano piano, konser concert, tiyatro theatre
  - hobi hobby, kamp camping, yürüyüş walk / hike
  - çizmek to draw, resim yapmak to paint
- **Work & school:** avukat lawyer, hemşire nurse, dişçi dentist, aşçı cook, işçi worker, memur civil servant, asker soldier, mimar architect, sınıf class, defter notebook, ödev homework, kurs course.
- **Body & health:** omuz shoulder, göğüs chest, bel lower back, dudak lips, kaş eyebrow, deri skin, kemik bone, kan blood, tırnak nail, baş ağrısı headache, nezle cold, yara wound, tansiyon blood pressure.
- **Describing:** yüksek high, ince thin, şişman fat, zayıf thin / weak, akıllı clever, komik funny, sevimli cute, çirkin ugly, yaşlı old (people), zengin rich, fakir poor, kuru dry, ıslak wet, yumuşak soft, sert hard, karanlık dark, derin deep, geniş wide, dar narrow, nazik kind, ünlü famous.
- **Feelings:** emekli retired, kıskanç jealous, gururlu proud, tembel lazy, çalışkan hard-working, utangaç shy, plus the verbs nefret etmek to hate, üzülmek to be sad, sevinmek to be glad, şaşırmak to be surprised, kızmak to get angry.
- **Everyday actions:** uçmak to fly, atlamak to jump, düşmek to fall, çekmek to pull, itmek to push, taşımak to carry, saklamak to hide / keep, atmak to throw, yakalamak to catch, toplamak to collect / tidy, kesmek to cut, pişirmek to cook, öpmek to kiss, sarılmak to hug, ödünç almak to borrow, kontrol etmek to check, ısırmak to bite, beslemek to feed, büyümek to grow, ölmek to die, doğmak to be born, kaçmak to run away, söz vermek to promise, paylaşmak to share, çalmak to play (an instrument) / to steal / to ring.

**Words already in the app under another meaning**
- `ay` is "month" in Time and "moon" in Nature. Each block gets a note pointing to the other meaning.
- `koca` also means "huge"; the block gets a note saying so.
- `tavuk` and `balık` stay only under Food, as "chicken" and "fish". They are not repeated under Animals.

**Grammar details per word.** Each new word gets the options the existing ones use, so example sentences come out right:
- the stem before a vowel (`kitap → kitabı` style; for example `kaplumbağa`, `havuç → havucu`);
- plural English forms (sheep, mice, geese);
- "a" / "an" and uncountable nouns;
- possessive compounds (`köpekbalığı`, `gökyüzü`, `hayvanat bahçesi`);
- irregular verbs (`ölmek → ölür`).

Each word's `kind` decides which patterns it is combined with. Words that fit no pattern sensibly are marked `nc` (never combined) and keep their block and search entry.

**Ranking:** `tools/rank-words.mjs` is re-run with the same OpenSubtitles list. Existing ranks stay the same, and the new words get theirs. Shared spellings (`ay`, `koca`, `at`, `bel`, `top`…) are dampened like `et` and `yüz` already are.

**Release**
- The offline cache goes to `turkish-v10`.
- The README word count becomes about 900.

## Left to the builder

- The exact `kind` for each word, after reading the pattern slots, and checking the generated sentences with `tools/sample.mjs`.
- Small swaps in the list when a word fails the checks above.
- The dampening factors for shared spellings.
