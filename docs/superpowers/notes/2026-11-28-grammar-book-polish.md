# Grammar book: polish notes left after the chapters work (2026-11-28)

Small points the reviews found and judged harmless enough to leave. None teaches a wrong form outright; most are wording,
a missing nuance, or a repeat. Line numbers are from 2026-11-28 and will drift. T = turkish-app `data/book.js`,
S = swedish-app `data/kitap.js`.

## Türkçe (T)

- questions: says *yoksa* as if required; spoken "Çay mı kahve mi?" leaves it out (book.js:160).
- questions: tip "except after -di" — -se and -eyim also put the ending before mi (book.js:170).
- questions: sub "and veya or yoksa" reads like a riddle → "mi, question words, veya vs yoksa" (book.js:142).
- adjectives: "yeni araba (a new car)" right before "a is bir" → "new car" (book.js:252).
- cases: "each ending has its own page" doesn't name the -in page, *Owners and compound nouns* (book.js:285).
- cases: the -n- rule names only "his, her"; the possessive page also says "their" (book.js:302 vs 447).
- object: tip "only where English says the/this/my/a name" drops pronouns (book.js:333).
- dative: "the others are regular: ona…" vs the pronouns page "o adds an n" (book.js:344).
- locative: a paragraph repeats its own two *var* examples word for word (book.js:379).
- compounds: material words (tahta masa) take no -si — not said (book.js:479/488).
- with: "describing word" and "adjective" on the same page (book.js:500/510).
- wordbuilding: -ci gloss lacks "the shop" though kitapçı = bookshop; no -ça example (Almanca, Rusça) (book.js:527–540).
- postpositions: the tip repeats lines 589–590 (book.js:599).
- kendi: "Kendimi iyi hissetmiyorum" gloss has no "myself" (book.js:602).
- ki: "often follows 'so'" → completes "so … that" (book.js:636).
- places: "ara = between" invites *masanın arasında; say "iki ev arasında" (book.js:703).
- past: the pointer to -miş mentions hearsay only (book.js:876).
- mis: tip "Gitmişim sounds as if you had forgotten it" is imprecise (book.js:929).
- usedto: gloss "We lived here…" hides "used to" (book.js:1026).
- must: "gelmemelisin" glossed shouldn't in the paragraph, mustn't in the tip (book.js:1121/1132).
- passive: "a consonant" (l is one too); "istendi (was wanted)" stilted → "was asked for" (book.js:1202/1204).
- commands / passive: git → gid unexplained (Gidelim, gidilir) (book.js:1051, 1062, 1209).
- participle: tip "for anything else use -dik" too broad (arabası bozulan adam) (book.js:1286).
- gerunds: "gelme (coming)" looks like the command Gelme! — not said (book.js:1251).

## Svenska (S)

- unsuz: "Birkaç sık kelime" → "Sık kullanılan birkaç kelime"; "ya da vurgulu hecenin başında" has no example (kitap.js:68–72). The page is at 249/250 words.
- vara: det finns inte / det finns ingen without saying which, or ingen → inget (kitap.js:134).
- unlu: could link vowel length to vowel quality (hus ü vs buss ö), tying it to the alphabet notes.
- belirli: the pointer omits plural *de*; the Turkish "de" next to *det* confuses; tip word order (kitap.js:266, 274).
- sifat: the -tt line gives röd/vit/god/svart without meanings; "-t eki -tt olur" is loose for röd (kitap.js:329).
- cifte: "farkı yalnızca bir gösterir" too strong; "liten burada da" assumes the sifat page; "söz ettiğini" → "söz ettiğimizi" (kitap.js:349–361).
- genitif: "söz ettiğini" → "söz ettiğimizi"; the tip "iyelik eki" vs its example *bilen* (a definite ending) (kitap.js:436, 445). No coverage term pins the -s/-x/-z exception.
- enett: "no rule for en/ett" vs bilesik "the last part decides"; -are/-ning/-het are always en (kitap.js:235 vs 455).
- turetme: *svenska* is also the adjective's -a form (svenska bilar) (kitap.js:497).
- iyelik: tip ("min bilen" değil) overlaps the cifte tip (kitap.js:584 vs 370).
- sig: "Bazı fiiller hep böyle" over-claims (lära, sätta, känna) (kitap.js:608).
- sayilar: "första gången jag är i Sverige" glossed "İsveç'e ilk kez geliyorum" → "İlk kez İsveç'teyim" (kitap.js:752).
- aliskanlik: "İki fiil aynı zamanda olur" awkward; brukade = -erdi while gruplar glosses bodde "otururduk" — a line on states (bo, vara, ha) (kitap.js:1013–1015).
- skulle: compares *Skulle du kunna* with *Jag vill*; one meaning drops the polite request; could show keşke + -seydi (Om jag bara hade vetat!) (kitap.js:1197–1202).
- passiv: "Huset byggdes…" glossed "Bu ev…"; "-er verbs keep only -s" would give *läss (läses) (kitap.js:1229, 1236).
- om: "Om det regnar, stannar vi hemma" four times on one page (kitap.js:1170–1184).
- som: the tip repeats the table/example; the inte paragraph repeats *inte'nin yeri* (kitap.js:1328, 1337).
- ortac: "-ande hiç değişmez" said twice (kitap.js:1283, 1305).
- baglac: first paragraph is a leftover and too narrow (these words also join words) (kitap.js:1347).

## Both apps (code)

- Back after several Nexts restores the list's old scroll, so the current page's row may be off-screen; `scrollIntoView`
  on the current row in `guideWindow`'s back branch would fix it.

## Outside the book (found along the way, pre-existing)

- S pronunciation hints: `data/words.js` has no override for *kille* and *keps*, so they show a soft k (kö is right).
- S pronunciation hints: `js/uttal.js` turns unstressed o into "u" (någon "no:gun", bakom "ba:kum", frukost "frü:kust").
