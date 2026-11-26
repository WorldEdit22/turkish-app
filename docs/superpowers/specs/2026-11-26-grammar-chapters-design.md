# Grammar book in chapters — design

Date: 2026-11-26. Both apps at once (Türkçe `c:\dev\hobby\turkish-app`, Svenska `c:\dev\hobby\swedish-app`).
The same file lives in both repos.

## Why

The grammar book (merged 2026-11-24) has 19 sections in Türkçe and 20 in Svenska. The user likes it but wants
it more extensive: "for turkish … cover almost the same parts" as the 43 Duolingo tips collected at
https://duome.eu/tips/en/tr, "for swedish accordingly coverage to match the turkish coverage". The reader is
someone curious about how the language works, dipping in rather than studying. The original request still
holds: "different sections that should be easy to navigate around and cover most of the grammar".

## Goals

- Türkçe covers every grammar point in the duome tips (the table below maps each tip to a section).
- Svenska covers Swedish grammar to the same depth, with the same chapters.
- About 40 sections per app, grouped into 7 chapters, still easy to find on a 390 pt phone screen.
- Pages stay short: one idea per page, read in a minute or two.

## Non-goals

- Exercises or quizzes in the book.
- Links from cards or words into book sections; search inside the book.
- Vocabulary pages (duome's "Family" tip is vocabulary only and is left out).
- Following the Duolingo course order (the user chose reference order).

## Anti-goals (a failure even if it works)

- Wrong grammar or unnatural examples. The last book round needed several accuracy fix passes; this one is
  twice the size.
- Long walls of text, or a list so long that nothing can be found.
- Any English visible in Svenska.
- The page scrolling outside `main`, or the list jumping (the layout rules from the quick fixes hold).

## Approaches (decided with the user)

- **Navigation: one list with chapter headings (chosen).** The book list is the same as today, with a small
  heading above each chapter's sections, and every section page ends with a "Next" link. The other option
  was chapters first, then sections, which costs an extra tap and an extra Back for every section; with
  about 40 sections it doesn't pay off.
- **Content: split the broad sections, then add the missing topics (chosen).** Pages that cram several
  topics into 250 words (Türkçe cases, can/must/want, linking; Svenska numbers and time, conjunctions, modals)
  become one page per topic, at the same short size. The other option was keeping the 19 sections and only
  adding pages, which leaves the cases and moods squeezed next to deeper new pages.
- **Order: reference order, by grammar area (chosen)**, not the Duolingo course order.

## The design

### Navigation

- Every section carries the title of its chapter. The book list shows a heading row whenever the chapter
  changes. Sections keep the order given below, so the chapters never interleave.
- The Help window uses the same list without chapters, and shows no headings. "Next" is for the book
  only; help topics don't get it (my call).
- Every section page ends with a "Next" link naming the next section: Türkçe `Next: Vowel harmony ›`,
  Svenska `Sonraki: Uzun ve kısa ünlüler ›`. The last section has none. It opens the next section's page
  at its top; Back still returns to the list.
- Help's "grammar book" topic (both apps) says the book is grouped into chapters and that "Next" at the
  bottom of each page goes on to the next one. The topic stays within the help test's 2–6 lines.

### Page rules (unchanged from the first book)

- Each grammar section: 120–250 words, 2–5 examples (each a target sentence with its meaning, with the
  speaker button; Svenska shows pronunciation hints when they are on), and one tip.
- Blocks: `p`, `list`, `table`, `ex`, `tip`, and `alphabet` (first section only). `*x*` marks bold.
- Examples use common, everyday words, natural for a native speaker.
- Svenska: all text Turkish, examples Swedish with Turkish meanings, no English.

### Türkçe: 44 sections in 7 chapters

"Kept" means the section stays with its id and is revised; "trimmed" means part of it moves to a new
section; "new" is a new page. The numbers in brackets are duome tips.

**Sounds and letters**
1. `letters` (kept): the alphabet.
2. `harmony` (kept): 2-way and 4-way vowel harmony. [4, 5, 10]
3. `consonants` (kept): p/ç/t/k → b/c/d/ğ before a vowel; -de/-te, -den/-ten, -di/-ti. [4, 10, 14]

**Building a sentence**
4. `order` (kept): verb last, the word before the verb is the focus, question words stay in place. [1, 9]
5. `tobe` (kept): personal endings -im/-sin/-iz/-siniz, -dir, -ler for people; var/yok; "I have". [6]
6. `questions` (kept, extended): mi, where it goes, and its harmony; personal endings after mi
   (mutlu muyum, geliyor musun) but before it with -di (geldin mi); question words; veya vs yoksa. [9, 19]
7. `negation` (trimmed, commands move to `commands`): değil, yok, and -me before each tense: -miyor, -medi,
   -meyecek, and the negative aorist -mez with its endings. [21, 27, 33]

**Nouns and their endings**
8. `plural` (kept): -ler/-lar; no plural after numbers or çok. [5, 11]
9. `adjectives` (new; comparison moves here from `postpositions`): adjective before the noun, bir as "a",
   no agreement, adjective as the predicate; daha, en, -den daha. [2, 3]
10. `cases` (rewritten as an overview): the six cases in one table with their harmony and buffer letters;
    the order of endings (plural, possessive, case: evlerimizde); -n- after a 3rd-person possessive. [7]
11. `object` (new, from `cases`): -i on a definite object, no ending on an indefinite one; bir + bare noun;
    beni, seni. [3, 4]
12. `dative` (new): -e "to": direction, giving to; verbs that take -e (bakmak, binmek, başlamak, yardım
    etmek); bana, sana. [8, 15]
13. `locative` (new): -de "at, in, on"; -te; time (saat beşte); "-de var". [10]
14. `ablative` (new): -den "from, out of, through"; "than" with daha; verbs that take -den (korkmak,
    hoşlanmak). [14]
15. `possessive` (trimmed, compounds move out): the endings table, -si after a vowel, benim evim vs evim,
    the -n- before a case. [7]
16. `compounds` (new, from `possessive`): genitive -in/-nin (Ali'nin arabası); compounds without the
    genitive (Türk kahvesi, doğum günü); when to use which. [7, 13]
17. `with` (new): -le/ile "with, by", benimle, onunla; -li "with" and -siz "without" (sütlü, şekersiz). [18]
18. `wordbuilding` (new): -ce for languages (Türkçe, İngilizce, -ça after voiceless), Türk vs Türkçe,
    -li for people from a place (Amerikalı, İstanbullu), -ci (kahveci), -lik (gözlük, arkadaşlık). [22]

**Small words**
19. `pronouns` (kept): ben, sen, o… with their cases; the subject is usually dropped. [1, 8]
20. `kendi` (new): kendim, kendin…; kendi evim; kendi kendime. [30]
21. `ki` (new): benimki, seninki; evdeki, dünkü, bugünkü; ki "that" (Biliyorum ki…); iyi ki. [29]
22. `postpositions` (trimmed): için, gibi, kadar, hakkında; önce/sonra with -den; benim için. [17]
23. `places` (new, from `postpositions`): içinde, üstünde, altında, önünde, arkasında, yanında, arasında;
    evin önünde; with -e, -de, -den (masanın altına). [17]
24. `numbers` (trimmed, the clock moves out; ordinals added): counting, ages, no plural after a number,
    -inci (birinci, kaçıncı), yarım and buçuk. [11, 24]
25. `time` (new, from `numbers`): Saat kaç?; üç buçuk; geçiyor / var (ikiye on var); "at" a time with
    geçe / kala (dörde çeyrek kala). [16]

**Tenses**
26. `iyor` (kept). [12]
27. `aorist` (kept): -r / -er / -ir and the one-syllable verbs that take -ir. [32, 33]
28. `past` (trimmed, -miş moves out): -di/-ti, its question and negative forms. [25, 27]
29. `mis` (new, from `past`): -miş for what you heard, found out or concluded; on nouns (hastaymış);
    -iyormuş. [38]
30. `future` (kept). [26, 27]
31. `was` (new): -(y)di on nouns and adjectives (öğretmendim, evdeydik), idi, değildi, miydi; -di after a
    tense: -iyordu, -ecekti, -mişti. [25]
32. `usedto` (new): -erdi "used to, would" (çocukken burada otururduk), -mezdi, polite isterdim. [34]

**Moods and voice**
33. `commands` (new, from `negation`): the bare stem (Gel!), -in/-iniz, -sin (let him), -elim (let's),
    -eyim mi (shall I?), negative -me (Gelme!). [1, 6, 28]
34. `can` (new, from `modals`): -ebil + a tense (yapabilirim), -eme (yapamam, gelemedim), "may I"
    (girebilir miyim?). [36]
35. `must` (new, from `modals`): -meli; zorunda (zorundayım / zorunda değilim); lazım and gerek, with
    -mesi lazım. [37]
36. `if` (new): -se with each tense (gelirsem, geliyorsan, geldiyse, gelecekse), plain -se (gelsem),
    eğer is optional. [39]
37. `wishes` (new): keşke + -se / -seydi; unreal conditions (Param olsaydı alırdım). [39]
38. `passive` (new): -il / -in / -n (yapıldı, bulundu, istendi); usually no doer, tarafından;
    Burada sigara içilmez. [41]

**Longer sentences**
39. `infinitive` (new; istemek from `modals`): -mek/-mak; gitmek istiyorum; -meye başlamak; -mek için;
    -mek as a subject (Türkçe konuşmak zor). [23]
40. `gerunds` (new): -me/-ma with possessive endings (gelmeni istiyorum, -meyi seviyorum); -iş (gidiş,
    bakış). [31]
41. `participle` (new): -en "who / that does": giden adam, okuyan çocuk, -meyen; as a noun (gelenler). [43]
42. `dik` (new): -dik + possessive (okuduğum kitap); -ecek (okuyacağım kitap); noun clauses (geldiğini
    biliyorum); -diği zaman, -diği için. [40]
43. `when` (new; -ince from `linking`): -ince (gelince), -ken (çocukken, yürürken), -dikten sonra,
    -meden önce. [35, 42]
44. `linking` (trimmed): ve, ama, fakat, çünkü, ya da / veya, de/da "too", hem … hem, ne … ne, -ip
    (kalkıp gitti).

The id `modals` goes away (its content is split into `can`, `must` and `infinitive`); every other old id stays.

**Duome coverage check:** 1 order, pronouns, commands · 2 adjectives · 3 object, adjectives · 4 object,
harmony, consonants · 5 plural · 6 tobe, commands · 7 cases, possessive, compounds · 8 dative, pronouns ·
9 questions, order · 10 locative · 11 numbers, plural · 12 iyor · 13 compounds · 14 ablative · 15 dative ·
16 time · 17 places, postpositions · 18 with · 19 questions · 20 (vocabulary, left out) · 21 negation ·
22 wordbuilding · 23 infinitive · 24 numbers · 25 past, was · 26 future · 27 negation · 28 commands ·
29 ki · 30 kendi · 31 gerunds · 32 aorist · 33 negation, aorist · 34 usedto · 35 when · 36 can · 37 must ·
38 mis · 39 if, wishes · 40 dik · 41 passive · 42 when · 43 participle.

### Svenska: 43 sections in the same 7 chapters

Chapter titles in Turkish: Sesler ve harfler · Cümle · İsimler ve sıfatlar · Küçük kelimeler · Fiiller ve
zamanlar · Kipler ve edilgen · Uzun cümleler. The bracket names the Türkçe section it matches, where there is
one.

**Sesler ve harfler**
1. `harfler` (kept as it is): the alphabet, with its letter rows and its tricky-sound notes (`LETTERS` and
   `COMBOS` in `data/alfabe.js`). The user approved this page; it does not change.
2. `unlu` (new): the *rules* behind the alphabet's vowel notes, not a repeat of them: when a vowel is long
   or short (one consonant after = long: tak; two = short: tack; the short words like han, vem, hem),
   minimal pairs (tak/tack, glas/glass, vila/villa), and how an ending can shorten a vowel (stor → stort).
3. `unsuz` (new): the *rules* behind the consonant notes: k, g, sk are soft before e, i, y, ä, ö (kör,
   göra, sked) and hard before a, o, u, å (ko, gå, skal); common exceptions (kille, kex); r + s/t/d/n run
   together (kors, kort, bord, barn).
   *(My call, after the builder check: the alphabet page stays, and these two pages go deeper instead of
   repeating it.)*

**Cümle**
4. `sira` (kept): the verb second. [order]
5. `vara` (new): är (the same for everyone), det finns (there is), har (have), det är vs det finns. [tobe]
6. `soru` (kept): inverting for yes/no, question words, ja / jo / nej. [questions]
7. `inte` (kept): where inte goes; aldrig and alltid go there too. [negation]

**İsimler ve sıfatlar**
8. `enett` (kept).
9. `belirli` (kept).
10. `cogul` (kept): also fix the open proofreading point here (vowel-final ett-words: "genelde"); the
    other one (-el/-er words take only -n: "unstressed") is in `belirli`. [plural]
11. `sifat` (trimmed): agreement in the indefinite: stor, stort, stora. [adjectives]
12. `cifte` (new, from `sifat`): den stora bilen; no double form after a possessive or genitive (min
    stora bil).
13. `karsilastirma` (kept). [adjectives]
14. `genitif` (new): -s (Annas bil, Sveriges huvudstad), no apostrophe, the noun after it takes no
    ending. [compounds]
15. `bilesik` (new): compound nouns (kaffekopp), the joining -s- (arbetsdag), the last part decides
    en/ett. [compounds]
16. `turetme` (new): -are, -ning, -het, -lig, -isk; svensk (adjective and person) vs svenska (language,
    and a woman); turk, turkisk, turkiska. [wordbuilding]

**Küçük kelimeler**
17. `zamir` (kept). [pronouns]
18. `iyelik` (kept): min/mitt/mina, sin.
19. `sig` (new): sig, mig, dig as reflexives; själv; reflexive verbs (tvätta sig, känna sig). [kendi]
20. `belirsiz` (new): den här / det här / de här, någon / något / några, ingen / inget / inga, alla,
    varje, mycket / många, lite / få.
21. `edat` (kept). [postpositions]
22. `yer` (new): place vs direction: här/hit, där/dit, hemma/hem, inne/in, ute/ut, uppe/upp; framför,
    bakom, bredvid, mellan, under, över. [places]
23. `sayilar` (trimmed, the clock moves out; ordinals added: första, andra…). [numbers]
24. `saat` (new, from `sayilar`): Hur mycket är klockan?, halv tre (= 2.30), kvart över / i, fem i halv;
    days and dates (på måndag, i juli, förra veckan, om en vecka, för två år sedan). [time]

**Fiiller ve zamanlar**
25. `gruplar` (new): the four verb groups and their forms in one table (tala, köpa, bo, skriva).
26. `simdiki` (kept). [iyor, aorist]
27. `gecmis` (kept). [past]
28. `perfekt` (kept).
29. `hade` (new): hade + supine (Jag hade redan ätit). [was: -mişti]
30. `gelecek` (kept). [future]
31. `aliskanlik` (new): brukar + infinitive, brukade (used to), håller på att, satt och läste. [usedto]
32. `partikel` (new): particle verbs (gå ut, stänga av, tycka om), the particle is stressed and can
    change the meaning.

**Kipler ve edilgen**
33. `emir` (kept). [commands]
34. `modal` (trimmed): kan, vill, får, + infinitive without att; kunde, ville. [can]
35. `gerek` (new, from `modal`): måste, behöver, borde, ska; får inte = must not; behöver inte = don't
    have to. [must]
36. `om` (new): om + present (Om det regnar, stannar vi hemma), the main clause inverts after it; om =
    whether. [if]
37. `skulle` (new): skulle + infinitive; Om jag hade tid, skulle jag…; Om jag bara…; Jag skulle vilja…
    [wishes]
38. `passiv` (new): -s passive (Affären öppnas klockan nio), bli + participle, av = by; verbs only in -s
    (hoppas, finnas, andas). [passive]

**Uzun cümleler**
39. `mastar` (new): att + infinitive (Det är roligt att simma), not after modals; för att, utan att,
    innan / efter att. [infinitive, gerunds]
40. `ortac` (new): -ande / -ende (spännande, leende); the past participle as an adjective with agreement
    (stängd, stängt, stängda). [participle]
41. `som` (new): relative som (mannen som bor här), dropped as object (boken jag läste), där, vars. [dik]
42. `baglac` (trimmed): och, men, eller, utan, för, så; både … och, antingen … eller, varken … eller.
    [linking]
43. `yancumle` (new, from `baglac`): att, när, om, eftersom, medan, innan, efter att, fast, trots att;
    inte before the verb; the main clause inverts after a leading subclause (När jag kom hem, åt jag).
    [when]

No old Svenska id goes away.

### Accuracy

Every new or rewritten page gets an independent grammar check before the merge, by a reviewer who checks
the target language as a native speaker would, and for Svenska also the Turkish of the explanations. A
finding is fixed and checked again. The open proofreading points from the first book are fixed along the way.

### Release

Both apps in the same branch name (`grammar-chapters`), merged locally; the user pushes. `CACHE` goes to
`turkish-v17` and `swedish-v7`.

## Left to the builder

- Icons, exact titles and subs, and the wording of every page, within the rules above.
- Field name for the chapter, and how the list and the "Next" link are built, following `js/guideview.js`
  and the existing book CSS.
- Updating the content tests (the id lists, the chapter order) and adding tests for the headings and "Next".
- Small moves of a point between neighbouring sections when a page would otherwise go over 250 words.
