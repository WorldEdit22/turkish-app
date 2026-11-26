# Grammar Book in Chapters Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Grow the grammar book to 44 Türkçe and 43 Svenska sections in 7 chapters, with chapter headings in the list and a "Next" link on every page.

**Architecture:** Each book section gets a `chapter` field; `js/guideview.js` draws a heading when the chapter changes and an optional "Next" button; `guideWindow` in `js/app.js` passes the next section for the book only. Content is data (`data/book.js` `BOOK`, `data/kitap.js` `KITAP`), checked by content tests that grow a little with every task.

**Tech Stack:** Plain ES modules, no build; tests with `node --test`. Node is not on PATH: run tests as
`"/c/Program Files/nodejs/node.exe" --test --test-reporter=dot /c/dev/hobby/turkish-app/tests/` (Türkçe, "T") and
`"/c/Program Files/nodejs/node.exe" --test --test-reporter=dot /c/dev/hobby/swedish-app/tests/` (Svenska, "S").

**Spec:** `docs/superpowers/specs/2026-11-26-grammar-chapters-design.md` (same file in both repos). Its section lists are the content brief: each content task writes the sections the spec names, covering the points on each section's line.

## Global Constraints

- Both repos, branch `grammar-chapters` (already checked out). Use `git -C <repo>`; never `cd`. One command per Bash call: no pipes, `;`, `&&`, `$(...)`. Commit messages must not contain the words reset, push or clean.
- Chapter titles, exact strings, in this order. T: `Sounds and letters`, `Building a sentence`, `Nouns and their endings`, `Small words`, `Tenses`, `Moods and voice`, `Longer sentences`. S: `Sesler ve harfler`, `Cümle`, `İsimler ve sıfatlar`, `Küçük kelimeler`, `Fiiller ve zamanlar`, `Kipler ve edilgen`, `Uzun cümleler`.
- Every grammar section: 120–250 words (all strings in its blocks, examples and table cells included), 2–5 examples, one `tip`; tables at most 4 columns. Block kinds `p`, `list`, `table`, `ex`, `tip`, `alphabet`; `*x*` is bold.
- Before writing, read two existing sections of the same file and match their voice: short sentences, plain words, the reader addressed directly (S: Turkish with "sen").
- Examples: common everyday words, natural for a native speaker. T target side only Turkish letters and punctuation; S target side only Swedish letters and punctuation; S has no English anywhere (chapter, title, sub, text, meanings).
- When a point moves out of a section, update that section's `title`/`sub` if they named it, and keep the section within the word range.
- Each page stands alone: never assume the reader came from the previous page; refer to another page by its title.
- `js/guideview.js` differs between the apps (S has hints and `T` strings from `js/metin.js`); edit each on its own.

## Review Focus

1. A wrong grammar rule or an unnatural example — no test can see it. Check every example as a native speaker would and every rule against a standard grammar; in S, also that the Turkish explanation reads naturally. (Owned by each content task's review.)
2. A point that moves between pages is lost or appears twice — each trimmed section (T `negation`, `cases`, `possessive`, `postpositions`, `numbers`, `past`, `linking`, and `modals`, which goes away; S `sifat`, `sayilar`, `modal`, `baglac`) has lost exactly what the spec moves, and the receiving section has it.
3. The same thing named two ways across pages (T "aorist" vs "simple present"; S Turkish grammar terms such as "belirli", "supinum") — use the term the existing pages use.
4. A wide table forces sideways scrolling at 390 pt — pinned by the 4-column test in Task 1.
5. "Next" leaves the reader somewhere odd — opening the next page must start at its top, and reopening the book shows the page the reader left. Pinned by the app test in Task 1.

---

### Task 1: Chapters, "Next", and the existing sections in chapter order (both apps)

**Files:**
- Modify: `js/guideview.js`, `js/app.js` (`guideWindow`, `bookWindow`), `css/app.css` (grammar book block), `sw.js`, T `data/book.js` + `data/help.js`, S `data/kitap.js` + `data/yardim.js` + `js/metin.js` (`book: { title, next: 'Sonraki' }`)
- Test: `tests/guideview.test.js`, `tests/app.test.js`, `tests/sw.test.js`, T `tests/book.test.js` + `tests/help.test.js`, S `tests/kitap.test.js` + `tests/yardim.test.js`

**Interfaces:**
- Produces: section field `chapter: string`; `guideListHtml({ title, intro, sections })` draws `<h3 class="gd-chapter">…</h3>` before the first section of each chapter (none when sections have no chapter); `guideSectionHtml(section, { hint, alphabet, next })` with `next: { id, title } | null` appends `<button class="gd-next" data-act="next" data-id="ID">Next: TITLE ›</button>` (S: `Sonraki: TITLE ›`, from `T.book.next`). `guideWindow` treats `act === 'next'` like `open-section`. The book's `content()` returns `linkNext: true`; help does not. In the content tests: a `CHAPTERS` list and a `COVERAGE` map (id → terms) that later tasks extend.

- [ ] **Step 1: Write the failing tests**

`tests/guideview.test.js` (both; S expects `Sonraki:`):
```js
test('the list shows a heading where the chapter changes, and none without chapters', () => {
  const s = (id, chapter) => ({ id, chapter, icon: 'x', title: id, sub: 's', blocks: [] });
  const html = guideListHtml({ title: 'B', sections: [s('a', 'One'), s('b', 'One'), s('c', 'Two & more')] });
  assert.equal(html.split('class="gd-chapter"').length - 1, 2);
  const at = (t) => html.indexOf(t);
  assert.ok(at('<h3 class="gd-chapter">One</h3>') < at('data-id="a"'));
  assert.ok(at('data-id="b"') < at('<h3 class="gd-chapter">Two &amp; more</h3>') && at('<h3 class="gd-chapter">Two &amp; more</h3>') < at('data-id="c"'));
  assert.ok(!guideListHtml({ title: 'H', sections: [{ id: 'a', icon: 'x', title: 'a', sub: 's', blocks: [] }] }).includes('gd-chapter'));
});

test('a section page can end with a Next button to the next section', () => {
  const sec = { id: 'a', icon: 'x', title: 'A', sub: 's', blocks: [{ p: 'Hi' }] };
  const html = guideSectionHtml(sec, { alphabet: '', next: { id: 'b"', title: 'Two & more' } });
  assert.ok(html.endsWith('<button class="gd-next" data-act="next" data-id="b&quot;">Next: Two &amp; more ›</button>'));
  assert.ok(!guideSectionHtml(sec, { alphabet: '' }).includes('gd-next'));
});
```
`tests/app.test.js` (both; use the file's `clickBook`, `resetBook`, `esc`, and the help helpers already there):
- `'the book list shows the chapter headings in order'`: open the book; the `<h3 class="gd-chapter">` texts equal `[...new Set(BOOK.map((s) => s.chapter))]` (escaped).
- `'Next opens the next section at its top; the last section and help topics have none'`: open `BOOK[0]`; the html has `data-act="next" data-id="${BOOK[1].id}"`; set `$('#book').scrollTop = 50`; `clickBook({ act: 'next', id: BOOK[1].id })`; the html has `<h2>${esc(BOOK[1].title)}</h2>` and `scrollTop` is 0; close and reopen the book: still on `BOOK[1]`. Open the last section: no `gd-next`. Open any help topic: no `gd-next`. Reset in `finally`.

T `tests/book.test.js` (S `tests/kitap.test.js` the same with S names):
- `IDS` becomes the existing sections in chapter order. T: `letters, harmony, consonants, order, tobe, questions, negation, plural, cases, possessive, pronouns, postpositions, numbers, iyor, aorist, past, future, modals, linking`. S: `harfler, sira, soru, inte, enett, belirli, cogul, sifat, karsilastirma, zamir, iyelik, edat, sayilar, simdiki, gecmis, perfekt, gelecek, emir, modal, baglac`.
- `const CHAPTERS = [...]` (the Global Constraints list) and:
```js
test('every section is in a chapter; the chapters come in order, each in one run', () => {
  const runs = BOOK.map((s) => s.chapter).filter((c, i, all) => i === 0 || c !== all[i - 1]);
  assert.deepEqual(runs, CHAPTERS);
});
```
- In the icon/title/sub test, also require a non-empty string `chapter`; in the table check, `assert.ok(width <= 4, …)`.
- The coverage test, with an empty map that later tasks fill:
```js
// Points the spec names for a section: each must appear in it (any case, without the * marks).
const COVERAGE = {};
test('every section covers the points the spec names', () => {
  for (const [id, terms] of Object.entries(COVERAGE)) {
    const s = BOOK.find((x) => x.id === id);
    assert.ok(s, `${id} exists`);
    const text = strings(s.blocks).join(' ').replaceAll('*', '').toLocaleLowerCase('tr');
    for (const t of terms) assert.ok(text.includes(t.toLocaleLowerCase('tr')), `${id}: ${t}`);
  }
});
```
- S only: the no-English test also reads `s.chapter`.

Help (T `tests/help.test.js`, S `tests/yardim.test.js`): `'the book topic mentions the chapters and Next'` — the `book` topic's text matches T `/chapters/` and `/\*Next\*/`, S `/bölüm/` and `/\*Sonraki\*/`.

`tests/sw.test.js`: T activate keys `['turkish-v16', 'swedish-v7', 'turkish-v17', 'other']` → deleted `['turkish-v16']`; S `['swedish-v6', 'turkish-v17', 'swedish-v7']` → `['swedish-v6']`.

- [ ] **Step 2: Run both suites; expect the new tests to fail** (unknown `next`, no headings, wrong order, no `chapter`, old cache).

- [ ] **Step 3: Implement**
- `guideview.js` (each app): headings and the Next button as in Interfaces, everything escaped.
- `app.js` `guideWindow`: `render()` passes `next: c.linkNext ? c.sections[c.sections.indexOf(section) + 1] ?? null : null`; the click handler runs the `open-section` branch for `next` too. `bookWindow`'s content adds `linkNext: true`.
- CSS: `.gd-chapter` a small muted heading (no `text-transform`: Turkish i/İ), `.gd-next` a full-width button styled like `.gd-row`, both fine in dark mode.
- Data: move the existing sections into the order above and give each its chapter (T: letters–consonants Sounds; order–negation Building a sentence; plural–possessive Nouns; pronouns–numbers Small words; iyor–future Tenses; modals Moods and voice; linking Longer sentences. S likewise by the spec's chapters). No text changes.
- Help `book` topic, both apps: say the book is in chapters and that *Next* (S *Sonraki*) at the bottom of a page goes on to the next one; stay within 2–6 lines.
- `sw.js` `CACHE`: T `turkish-v17`, S `swedish-v7`.

- [ ] **Step 4: Run both suites; expect all to pass.**

- [ ] **Step 5: Commit each repo** — `feat: grammar book in chapters, with Next at the end of each page`.

---

The content tasks below all follow the same steps:

1. **Tests first.** In the content test file, set `IDS` to the given list and add the given `COVERAGE` entries. Run the content test file; expect failures for the missing sections or terms.
2. **Write** each new section with its `chapter`, at its place in the array, covering the points on its line in the spec; trim and revise the sections named, as the spec says.
3. **Run** the content test file; expect it to pass (ids, chapters, word ranges, examples, script, coverage).
4. **Accuracy pass:** re-read every example and rule you wrote as a native speaker and a teacher would; fix anything doubtful; list in your report any point you were unsure of.
5. **Run both full suites; commit** each repo touched, message `feat(book): <chapter>`.

### Task 2: Sounds and Building a sentence

**Files:** T `data/book.js`, `tests/book.test.js`; S `data/kitap.js`, `tests/kitap.test.js`.
**Interfaces:** consumes Task 1's `chapter`, `IDS`, `COVERAGE`.

- T: revise `questions` (spec item 6). `IDS` unchanged. `COVERAGE`: `questions: ['yoksa', 'muyum']`.
- S: new `unlu`, `unsuz` (after `harfler`), `vara` (after `sira`); spec items 2, 3, 5. `harfler` does not change.
  `IDS` begins `harfler, unlu, unsuz, sira, vara, soru, inte, …` (rest as now).
  `COVERAGE`: `unlu: ['tack', 'villa']`, `unsuz: ['sked', 'kille']`, `vara: ['finns', 'det är']`.

### Task 3: Türkçe — Nouns and their endings

**Files:** T `data/book.js`, `tests/book.test.js`.
**Interfaces:** consumes Task 1's `chapter`, `IDS`, `COVERAGE`.

- New `adjectives`, `object`, `dative`, `locative`, `ablative`, `compounds`, `with`, `wordbuilding`; `cases` rewritten as the overview; `possessive` trimmed (compounds move out); `postpositions` loses comparison to `adjectives`. Spec items 8–18.
- `IDS` Nouns run: `plural, adjectives, cases, object, dative, locative, ablative, possessive, compounds, with, wordbuilding`.
- `COVERAGE`: `adjectives: ['daha', '-den daha']`, `cases: ['evlerimizde']`, `object: ['beni']`, `dative: ['bana', 'binmek']`, `locative: ['beşte']`, `ablative: ['korkmak', 'daha']`, `possessive: ['benim']`, `compounds: ["ali'nin", 'kahvesi']`, `with: ['benimle', 'şekersiz']`, `wordbuilding: ['türkçe', 'kahveci', 'amerikalı']`.

### Task 4: Svenska — İsimler ve sıfatlar

**Files:** S `data/kitap.js`, `tests/kitap.test.js`.
**Interfaces:** consumes Task 1's `chapter`, `IDS`, `COVERAGE`.

- New `cifte` (after `sifat`), `genitif`, `bilesik`, `turetme` (after `karsilastirma`); `sifat` trimmed (the double form moves to `cifte`); proofreading fixes in `cogul` ("genelde" for vowel-final ett-words) and `belirli` (-el/-er words take only -n when the ending is unstressed). Spec items 10–16.
- `IDS` run: `enett, belirli, cogul, sifat, cifte, karsilastirma, genitif, bilesik, turetme`.
- `COVERAGE`: `cogul: ['genelde']`, `belirli: ['vurgusuz']`, `sifat: ['stort']`, `cifte: ['den stora bilen', 'min stora bil']`, `genitif: ['annas']`, `bilesik: ['arbetsdag']`, `turetme: ['svenska', 'turkisk']`.

### Task 5: Small words

**Files:** T `data/book.js`, `tests/book.test.js`; S `data/kitap.js`, `tests/kitap.test.js`.
**Interfaces:** consumes Task 1's `chapter`, `IDS`, `COVERAGE`.

- T: new `kendi`, `ki`, `places`, `time`; `postpositions` trimmed (places move out); `numbers` trimmed (the clock moves out) and gains ordinals. Spec items 19–25.
  `IDS` run: `pronouns, kendi, ki, postpositions, places, numbers, time`.
  `COVERAGE`: `kendi: ['kendi kendime']`, `ki: ['benimki', 'dünkü']`, `postpositions: ['hakkında']`, `places: ['altına']`, `numbers: ['kaçıncı', 'buçuk']`, `time: ['kala', 'geçiyor']`.
- S: new `sig`, `belirsiz`, `yer`, `saat`; `sayilar` trimmed (the clock moves out) and gains ordinals. Spec items 17–24.
  `IDS` run: `zamir, iyelik, sig, belirsiz, edat, yer, sayilar, saat`.
  `COVERAGE`: `sig: ['själv', 'tvätta sig']`, `belirsiz: ['någon', 'ingen']`, `yer: ['hemma', 'dit']`, `sayilar: ['första']`, `saat: ['halv', 'sedan']`.

### Task 6: Tenses

**Files:** as Task 5. **Interfaces:** consumes Task 1's `chapter`, `IDS`, `COVERAGE`.

- T: new `mis`, `was`, `usedto`; `past` trimmed (-miş moves to `mis`). Spec items 26–32.
  `IDS` run: `iyor, aorist, past, mis, future, was, usedto`.
  `COVERAGE`: `mis: ['hastaymış', 'iyormuş']`, `was: ['öğretmendim', 'değildi', 'mişti']`, `usedto: ['otururduk', 'isterdim']`.
- S: new `gruplar`, `hade`, `aliskanlik`, `partikel`. Spec items 25–32.
  `IDS` run: `gruplar, simdiki, gecmis, perfekt, hade, gelecek, aliskanlik, partikel`.
  `COVERAGE`: `gruplar: ['köpte', 'bott']`, `hade: ['hade', 'supinum']`, `aliskanlik: ['brukar', 'håller på']`, `partikel: ['tycka om']`.

### Task 7: Moods and voice

**Files:** as Task 5. **Interfaces:** consumes Task 1's `chapter`, `IDS`, `COVERAGE`.

- T: new `commands`, `can`, `must`, `if`, `wishes`, `passive`; `negation` trimmed (commands move out); `modals` is removed (its istemek part goes to `infinitive` in Task 8 — the gap until then is expected on this branch). Spec items 33–38, and 7.
  `IDS` run: `commands, can, must, if, wishes, passive` (no `modals`).
  `COVERAGE`: `negation: ['-mez']`, `commands: ['elim', 'gelme!']`, `can: ['yapamam', 'miyim']`, `must: ['zorunda', 'lazım']`, `if: ['eğer', 'gelirsem']`, `wishes: ['keşke', 'olsaydı']`, `passive: ['tarafından', 'içilmez']`.
- S: new `gerek`, `om`, `skulle`, `passiv`; `modal` trimmed (måste and the others move to `gerek`). Spec items 33–38.
  `IDS` run: `emir, modal, gerek, om, skulle, passiv`.
  `COVERAGE`: `modal: ['kunde']`, `gerek: ['behöver inte', 'får inte']`, `om: ['stannar vi']`, `skulle: ['skulle vilja']`, `passiv: ['öppnas', 'hoppas']`.

### Task 8: Longer sentences

**Files:** as Task 5. **Interfaces:** consumes Task 1's `chapter`, `IDS`, `COVERAGE`.

- T: new `infinitive` (with istemek from the old `modals`), `gerunds`, `participle`, `dik`, `when`; `linking` trimmed (-ince moves to `when`). Spec items 39–44.
  `IDS` run: `infinitive, gerunds, participle, dik, when, linking`. The full T list is now the spec's 44.
  `COVERAGE`: `infinitive: ['istiyorum', 'için']`, `gerunds: ['gelmeni']`, `participle: ['giden']`, `dik: ['okuduğum', 'geldiğini']`, `when: ['gelince', 'çocukken', 'meden önce']`, `linking: ['hem', 'kalkıp']`.
- S: new `mastar`, `ortac`, `som`, `yancumle`; `baglac` trimmed (subordinate clauses move to `yancumle`). Spec items 39–43.
  `IDS` run: `mastar, ortac, som, baglac, yancumle`. The full S list is now the spec's 43.
  `COVERAGE`: `mastar: ['för att']`, `ortac: ['spännande', 'stängda']`, `som: ['vars']`, `baglac: ['varken']`, `yancumle: ['eftersom', 'medan']`.
