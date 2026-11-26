import { WORDS, CATEGORIES, TYPES } from '../data/words.js';
import { PATTERNS, GROUPS } from '../data/patterns.js';
import { RANKS } from '../data/ranks.js';
import { LETTERS, TRICKY } from '../data/alphabet.js';
import { fits } from './combine.js';
import { patternExamples, wordExamples, wordPatternPairs, slotOf } from './examples.js';
import { store } from './store.js';
import { answer, buildQueue, correct, dayOf, DIRS, isKnown, isMastered, isNew, newCandidates, NEW_POOL, nextInterval, PATTERN_POOL, requeue, status, unqueue } from './srs.js';
import { cardHtml, countsText, doneHtml, recallHtml } from './practiceview.js';
import { PROVIDERS, AIError, generate, patternPrompt, wordPrompt, readPage, explainSentence } from './ai.js';
import { reloadOnUpdate } from './update.js';
import { esc, SPEAKER, BUBBLE, BOOK as BOOK_ICON, QUESTION } from './html.js';
import { shrinkPhoto } from './photo.js';
import { sentencesOf, scanDate, scansListHtml, scanHtml, sentenceHtml } from './scanview.js';
import { translate, TranslateError, FAILED, googleLink, swapState } from './translate.js';
import { translatorHtml, resultHtml } from './translateview.js';
import { alphabetBodyHtml } from './alphabetview.js';
import { guideListHtml, guideSectionHtml } from './guideview.js';
import { BOOK } from '../data/book.js';
import { HELP } from '../data/help.js';

// ---------- data ----------

const CAT = Object.fromEntries(CATEGORIES.map((c) => [c.id, c]));
const CAT_ORDER = Object.fromEntries(CATEGORIES.map((c, i) => [c.id, i]));

WORDS.forEach((w, i) => {
  w.score = RANKS[w.id] ?? 0;
  w.order = i;
  w.label = w.gloss || (w.type === 'verb' ? `to ${w.en}` : w.en);
});
const BY_COMMON = [...WORDS].sort((a, b) => b.score - a.score || a.order - b.order);
BY_COMMON.forEach((w, i) => (w.rank = i + 1));
PATTERNS.forEach((p, i) => {
  p.rank = i + 1;
  p.key = `p:${p.id}`;
  p.label = p.en;
});

const ITEM = new Map([...WORDS.map((w) => [w.id, w]), ...PATTERNS.map((p) => [p.key, p])]);
const keyOf = (x) => x.key || x.id;
const isPattern = (x) => Boolean(x.variants);

// ---------- helpers ----------

const $ = (s) => document.querySelector(s);
const FOLD = { ç: 'c', ğ: 'g', ı: 'i', ö: 'o', ş: 's', ü: 'u', â: 'a', î: 'i', û: 'u' };
const fold = (s) => s.toLocaleLowerCase('tr').replace(/[çğıöşüâîû]/g, (c) => FOLD[c]);
const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};
const known = (x) => DIRS.some((d) => isKnown(store.card(keyOf(x), d)));
const mastered = (x) => DIRS.every((d) => isMastered(store.card(keyOf(x), d)));
const selected = (x) => store.isSelected(keyOf(x));

const INFO = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 11v5.5"/><path d="M12 7.6v.01"/></svg>';

// ---------- speech ----------

function turkishVoice() {
  if (!('speechSynthesis' in window)) return null;
  return speechSynthesis.getVoices().find((v) => (v.lang || '').toLowerCase().startsWith('tr')) || null;
}

// iPhone and iPad (iPadOS reports itself as a Mac with touch).
const isAppleTouch = /iP(hone|ad|od)/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
// On iPhone the built-in voice follows the silent switch, and no web trick gets past it
// (tried: the playback audio session and a silent clip). Say so on the first tap of each launch.
let soundHintShown = false;

function speak(text) {
  if (!('speechSynthesis' in window)) return;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'tr-TR';
  const v = turkishVoice();
  if (v) u.voice = v;
  u.rate = 0.9;
  if (isAppleTouch && !soundHintShown) {
    soundHintShown = true;
    toast('No sound? Turn off silent mode', 3000);
  }
  speechSynthesis.speak(u);
}

// ---------- list view ----------

const SORTS = {
  patterns: [
    ['common', 'Most useful'],
    ['az', 'A–Z'],
  ],
  words: [
    ['topic', 'By topic'],
    ['common', 'Most common'],
    ['az', 'A–Z English'],
    ['tr', 'A–Z Turkish'],
  ],
};

const ui = store.ui;

function visibleItems(tab) {
  const isP = tab === 'patterns';
  let items = isP ? PATTERNS : WORDS;
  const q = fold($('#search').value.trim());
  if (q) {
    items = items.filter((x) => {
      const extra = isP ? x.variants.map((v) => `${v.tr} ${v.en}`).join(' ') : '';
      return fold(`${x.label} ${x.en} ${x.tr} ${extra}`).includes(q);
    });
  }
  if (!isP && ui.type !== 'all') items = items.filter((w) => w.type === ui.type);
  if (isP && ui.pgroup !== 'all') items = items.filter((p) => p.group === ui.pgroup);

  const byRank = (a, b) => a.rank - b.rank;
  const sort = ui.sort[tab];
  const sorted = [...items];
  if (sort === 'az') sorted.sort((a, b) => a.label.localeCompare(b.label, 'en'));
  else if (sort === 'tr') sorted.sort((a, b) => a.tr.localeCompare(b.tr, 'tr'));
  else if (sort === 'topic') sorted.sort((a, b) => CAT_ORDER[a.cat] - CAT_ORDER[b.cat] || byRank(a, b));
  else sorted.sort(byRank);
  return sorted;
}

// Tapping a block selects it; the ⓘ button opens its card.
function blockHtml(x, showIcon) {
  const sel = store.isSelected(keyOf(x));
  const dot = isPattern(x) ? '' : `<span class="dot t-${x.type}"></span>`;
  return (
    `<div class="block${sel ? ' sel' : ''}" data-key="${esc(keyOf(x))}" role="button" tabindex="0"` +
    ` aria-pressed="${sel}" aria-label="${esc(`${x.label}, ${x.tr}`)}">` +
    `<div class="b-en">${dot}<span>${esc(x.label)}</span></div>` +
    (ui.showTurkish ? `<div class="b-tr">${esc(x.tr)}</div>` : '') +
    `<button class="b-info" aria-label="Details">${INFO}</button>` +
    (showIcon ? `<span class="b-icon">${CAT[x.cat].icon}</span>` : '') +
    `</div>`
  );
}

function renderList() {
  if (ui.mode === 'practice') return renderPractice();
  const tab = ui.tab;
  const items = visibleItems(tab);
  const list = $('#list');
  if (!items.length) {
    list.innerHTML = '<p class="empty">Nothing here. Try another filter or search.</p>';
  } else if (tab === 'words' && ui.sort.words === 'topic') {
    let html = '';
    for (const c of CATEGORIES) {
      const inCat = items.filter((w) => w.cat === c.id);
      if (!inCat.length) continue;
      const all = WORDS.filter((w) => w.cat === c.id);
      const done = all.filter(mastered).length;
      html +=
        `<h2 class="sec">${c.icon} ${esc(c.label)} <span class="count">${done}/${all.length}</span></h2>` +
        `<div class="grid">${inCat.map((w) => blockHtml(w, false)).join('')}</div>`;
    }
    list.innerHTML = html;
  } else {
    list.innerHTML = `<div class="grid">${items.map((x) => blockHtml(x, tab === 'words')).join('')}</div>`;
  }
  renderProgress();
}

function renderProgress() {
  const all = ui.tab === 'patterns' ? PATTERNS : ui.tab === 'words' ? WORDS : null;
  if (!all) $('#progress').textContent = 'Settings';
  else if (ui.mode === 'practice') $('#progress').textContent = practiceCounts();
  else $('#progress').textContent = `${all.filter(mastered).length} / ${all.length} mastered`;
}

// The chip row: pattern groups on Patterns; on Words, word types (Browse) or topics (Practice).
function chipRow() {
  const all = [['all', 'All', '']];
  if (ui.tab === 'patterns') {
    return { attr: 'data-group', current: ui.pgroup, label: 'Pattern group', chips: all.concat(Object.entries(GROUPS).map(([id, label]) => [id, label, ''])) };
  }
  if (ui.mode === 'practice') {
    const topics = CATEGORIES.map((c) => [c.id, c.label, `<span aria-hidden="true">${esc(c.icon)}</span>`]);
    return { attr: 'data-topic', current: ui.topic, label: 'Topic', chips: all.concat(topics) };
  }
  const types = Object.entries(TYPES).map(([id, t]) => [id, t.label, `<span class="dot t-${id}"></span>`]);
  return { attr: 'data-type', current: ui.type, label: 'Word type', chips: all.concat(types) };
}

function renderControls() {
  const tab = ui.tab;
  const listTab = tab !== 'settings';
  const practice = ui.mode === 'practice';
  $('#controls').hidden = !listTab;
  renderClear();
  $('#gear').setAttribute('aria-pressed', String(!listTab));
  document.querySelectorAll('.tabs button').forEach((b) => b.classList.toggle('on', b.dataset.tab === tab));
  if (!listTab) {
    renderProgress();
    return;
  }

  document.querySelectorAll('#mode button').forEach((b) => {
    b.classList.toggle('on', b.dataset.mode === ui.mode);
    b.setAttribute('aria-pressed', String(b.dataset.mode === ui.mode));
  });
  // Practice has nothing to search or sort; the direction switch takes the sort menu's place.
  $('.search-row').hidden = practice;
  $('#sort').hidden = practice;
  $('#dir').hidden = !practice;
  $('#dir').textContent = DIR_LABELS[ui.dir];

  $('#sort').innerHTML = SORTS[tab]
    .map(([v, label]) => `<option value="${v}"${ui.sort[tab] === v ? ' selected' : ''}>${label}</option>`)
    .join('');

  const { attr, current, label, chips } = chipRow();
  $('#types').setAttribute('aria-label', label);
  $('#types').innerHTML = chips
    .map(([id, text, mark]) => `<button class="chip${current === id ? ' on' : ''}" ${attr}="${esc(id)}">${mark}${esc(text)}</button>`)
    .join('');
}

function render() {
  renderControls();
  const settings = ui.tab === 'settings';
  $('#list').hidden = settings;
  $('#settings').hidden = !settings;
  if (settings) renderSettings();
  else renderList();
}

// Settings opens from the gear; the gear again goes back to the list it came from.
let lastListTab = 'words';

function setTab(tab) {
  if (tab !== 'settings') lastListTab = tab;
  ui.tab = tab;
  store.saveUi();
  $('#search').value = '';
  session = null; // a fresh practice queue, also after Settings (a restore or a reset changes the cards)
  render();
  // Only the list and Settings scroll; the page itself never does.
  $('#list').scrollTop = 0;
  $('#settings').scrollTop = 0;
}

// ---------- practice ----------
//
// One card at a time from the tab and chip the user is on, in the chosen direction.
// session: { sig, queue, face, revealed, undo }
//   sig       the tab, chip, direction and day the queue was built for; when any of them
//             changes (a new day too), the next render builds a fresh queue
//   face      what the front card shows, with its key; made once per card shown, so
//             revealing keeps the same example
//   undo      { key, dir, before, wasNew } for the last answer, until the queue is rebuilt

const DIR_LABELS = { say: 'EN → TR', understand: 'TR → EN' };
let session = null;

const pick = (list) => list[Math.floor(Math.random() * list.length)];

// Words of the chosen topic, most common first; patterns of the chosen group, most useful first.
// Only items in the data, so cards for removed words never come up.
function selectionKeys() {
  if (ui.tab === 'patterns') return PATTERNS.filter((p) => ui.pgroup === 'all' || p.group === ui.pgroup).map(keyOf);
  return BY_COMMON.filter((w) => ui.topic === 'all' || w.cat === ui.topic).map(keyOf);
}

const selectionCards = () => selectionKeys().map((key) => store.card(key, ui.dir));
// The same item's card in the other direction: what was just practised there is held back here.
const otherOf = (key) => store.card(key, ui.dir === 'say' ? 'understand' : 'say');
const offerable = (today) => newCandidates(selectionKeys(), (key) => store.card(key, ui.dir), today, otherOf);

// See practiceview.js for the face's fields.
function faceOf(x) {
  const face = { native: x.label, target: x.tr, say: x.tr.replace(/_+|\.\.\./g, ' ') };
  if (isPattern(x)) {
    const v = pick(x.variants.filter((o) => o.ex.length));
    const [tr, en] = pick(v.ex);
    return { ...face, icon: null, note: v.note || null, variant: { native: v.en, target: v.tr }, example: { native: en, target: tr } };
  }
  const row = x.ex ? { tr: x.ex[0], en: x.ex[1] } : wordExamples(x, exampleOpts()).examples[0];
  return { ...face, icon: CAT[x.cat].icon, note: x.note || null, variant: null, example: row ? { native: row.en, target: row.tr } : null };
}

function ensureSession() {
  const today = dayOf(Date.now());
  const sig = `${ui.tab}|${ui.tab === 'patterns' ? ui.pgroup : ui.topic}|${ui.dir}|${today}`;
  if (session?.sig !== sig) {
    const pool = ui.tab === 'patterns' ? PATTERN_POOL : NEW_POOL;
    const queue = buildQueue(selectionKeys(), (key) => store.card(key, ui.dir), today, store.doseLeft(ui.dir, today), Math.random, otherOf, pool);
    session = { sig, queue, face: null, revealed: false, undo: null };
  }
  return session;
}

// "N due · M new" for the selection and direction; M is what today's dose still allows.
function practiceCounts() {
  const today = dayOf(Date.now());
  const cards = selectionCards();
  const due = cards.filter((c) => !isNew(c) && c.due <= today).length;
  const fresh = Math.min(store.doseLeft(ui.dir, today), offerable(today).length);
  return countsText(due, Math.max(0, fresh));
}

function doneState() {
  const today = dayOf(Date.now());
  const cards = selectionCards();
  const ahead = cards.filter((c) => !isNew(c) && c.due > today).map((c) => c.due - today);
  return { newToday: store.doseUsed(ui.dir, today), canMore: offerable(today).length > 0, nextIn: ahead.length ? Math.min(...ahead) : null };
}

function renderPractice() {
  const s = ensureSession();
  const key = s.queue[0];
  let html;
  if (!key) html = doneHtml({ ...doneState(), canUndo: Boolean(s.undo) });
  else {
    if (s.face?.key !== key) s.face = { key, ...faceOf(ITEM.get(key)) };
    const card = store.card(key, ui.dir);
    const previews = { forgot: 0, hard: nextInterval(card, 'hard'), easy: nextInterval(card, 'easy') };
    html = cardHtml(s.face, { dir: ui.dir, revealed: s.revealed, previews, canUndo: Boolean(s.undo) });
  }
  $('#list').innerHTML = `<div class="pc-screen">${html}</div>`;
  renderProgress();
}

function answerCard(grade) {
  const s = session;
  const key = s?.queue[0];
  // Only a revealed card takes an answer: a quick second tap lands on the next card, still hidden.
  if (!key || !s.revealed) return;
  const today = dayOf(Date.now());
  const dir = ui.dir;
  const before = store.card(key, dir);
  const wasNew = isNew(before);
  store.setCard(key, dir, answer(before, grade, today, Math.random));
  if (wasNew) store.useDose(dir, today);
  s.queue = s.queue.slice(1);
  if (grade === 'forgot') s.queue = requeue(s.queue, key);
  s.undo = { key, dir, before, wasNew };
  s.revealed = false;
  renderList();
}

// Puts the last answered card back as it was, at the front, and gives back its new-card count.
function undoAnswer() {
  const u = session?.undo;
  if (!u) return;
  store.setCard(u.key, u.dir, u.before);
  if (u.wasNew) store.giveBackDose(u.dir, dayOf(Date.now()));
  session.queue = [u.key, ...unqueue(session.queue, u.key)];
  session.undo = null;
  session.revealed = false;
  renderList();
}

function moreCards() {
  store.addDose(ui.dir, dayOf(Date.now()));
  session = null;
  renderList();
}

// The speaker sits inside the tap-to-reveal area, so it is checked first.
function practiceClick(e) {
  const say = e.target.closest('[data-say]');
  if (say) return speak(say.dataset.say);
  const grade = e.target.closest('[data-grade]');
  if (grade) return answerCard(grade.dataset.grade);
  const act = e.target.closest('[data-act]')?.dataset.act;
  if (act === 'reveal' && session) {
    session.revealed = true;
    renderList();
  } else if (act === 'undo') undoAnswer();
  else if (act === 'more') moreCards();
}

$('#mode').addEventListener('click', (e) => {
  const b = e.target.closest('[data-mode]');
  if (!b || b.dataset.mode === ui.mode) return;
  ui.mode = b.dataset.mode;
  store.saveUi();
  session = null;
  render();
  $('#list').scrollTop = 0;
});

$('#dir').addEventListener('click', () => {
  ui.dir = ui.dir === 'say' ? 'understand' : 'say';
  store.saveUi();
  renderControls();
  renderList();
});

// Back on screen, maybe the next morning: draw again, so a new day starts a fresh queue and dose.
document.addEventListener('visibilitychange', () => {
  if (!document.hidden && ui.mode === 'practice' && ui.tab !== 'settings') renderList();
});

// ---------- sheet (detail card) ----------

const sheet = $('#sheet');
let openKey = null;

function partsHtml(parts) {
  return parts.map((p) => (p.hl ? `<b>${esc(p.text)}</b>` : esc(p.text))).join('');
}

function exHtml(tr, en, opts = {}) {
  const trH = opts.trParts ? partsHtml(opts.trParts) : esc(tr);
  const enH = opts.enParts ? partsHtml(opts.enParts) : esc(en);
  return (
    `<div class="ex"><button class="say" data-say="${esc(tr)}" aria-label="Listen">${SPEAKER}</button>` +
    `<div><div class="ex-tr">${trH}</div><div class="ex-en">${enH}</div>` +
    (opts.from ? `<div class="ex-from">${esc(opts.from)}</div>` : '') +
    `</div></div>`
  );
}

// Sections from examples.js: "From your selection" (with a "Not used here" line), then "Examples".
// `label` names a not-used item: a word's Turkish on a pattern card, a pattern's English on a word card.
function examplesHtml({ selected, notUsed, examples }, label) {
  const rows = (list) => list.map((r) => exHtml(r.tr, r.en, { trParts: r.trParts, enParts: r.enParts, from: r.from })).join('');
  let h = '';
  if (selected.length || notUsed.length) {
    h += `<div class="sub"><span>From your selection</span></div>${rows(selected)}`;
    if (notUsed.length) h += `<p class="not-used">Not used here: ${esc(notUsed.map(label).join(', '))}</p>`;
  }
  if (examples.length) h += `<div class="sub"><span>Examples</span></div>${rows(examples)}`;
  return h;
}

function aiHtml(cacheKey, vi = '') {
  const cached = store.ai[cacheKey] || [];
  const ready = store.settings.provider && store.settings.keys?.[store.settings.provider];
  return (
    `<div class="ai" data-ck="${esc(cacheKey)}">` +
    (cached.length ? `<div class="sub"><span>From AI</span></div>` : '') +
    `<div class="ai-list">${cached.map((e) => exHtml(e.tr, e.en)).join('')}</div>` +
    (ready
      ? `<button class="ai-btn" data-act="ai" data-v="${vi}">✨ More examples</button>`
      : `<button class="ai-btn" data-act="setup">✨ Get more examples with a free AI (set up in Settings)</button>`) +
    `<div class="ai-msg" role="status"></div></div>`
  );
}

// The book, the translate bubble and ✕, at the right end of every window's title row.
const headButtons = () =>
  `<button class="head-book" data-act="book" aria-label="Grammar">${BOOK_ICON}</button>` +
  `<button class="head-tr" data-act="translate" aria-label="Translate">${BUBBLE}</button>` +
  `<button class="close" data-act="close" aria-label="Close">✕</button>`;

// The title row with ✕ sits in .s-top, which stays at the top while the card scrolls.
function headHtml(key, title, tr, meta) {
  const today = dayOf(Date.now());
  const rows = DIRS.map((dir) => ({
    dir,
    label: DIR_LABELS[dir],
    st: status(store.card(key, dir), today),
    last: store.card(key, dir)?.last,
  }));
  return (
    `<div class="s-top"><div class="grabber"></div>` +
    `<div class="s-head"><h2>${esc(title)}</h2>${headButtons()}</div></div>` +
    `<div class="s-tr"><span>${esc(tr)}</span><button class="say" data-say="${esc(tr.replace(/_+|\.\.\./g, ' '))}" aria-label="Listen">${SPEAKER}</button></div>` +
    (meta ? `<div class="s-meta">${meta}</div>` : '') +
    recallHtml(rows)
  );
}

const exampleOpts = () => ({ words: BY_COMMON, patterns: PATTERNS, isSelected: selected, isKnown: known });

function patternSheet(p) {
  let h = headHtml(p.key, p.en, p.tr, '');
  p.variants.forEach((v, vi) => {
    h +=
      `<section class="variant">` +
      `<div class="v-tr">${esc(v.tr)}</div><div class="v-en">${esc(v.en)}</div>` +
      (v.note ? `<p class="note">${esc(v.note)}</p>` : '') +
      examplesHtml(patternExamples(p, vi, exampleOpts()), (w) => w.tr) +
      aiHtml(`${p.key}#${vi}`, vi) +
      `</section>`;
  });
  return h;
}

function wordSheet(w) {
  const c = CAT[w.cat];
  const meta = `${TYPES[w.type].one} · ${c.icon} ${esc(c.label)}`;
  let h = headHtml(w.id, w.label, w.tr, meta);
  if (w.note) h += `<p class="note">${esc(w.note)}</p>`;
  h += examplesHtml(wordExamples(w, exampleOpts()), (p) => p.en);
  if (w.type !== 'phrase') h += aiHtml(w.id);
  return h;
}

// ---------- photo scans (shown in the same window) ----------
//
// scanView: null while the window shows a word or pattern (openKey), else
//   { kind: 'scans' } | { kind: 'scan', id } | { kind: 'sentence', id, si }.
// An answer that arrives after the user moved on is saved, but only drawn if
// its view is still showing.

let scanView = null;
let readStatus = null; // the list's status: null | 'reading' | 'empty' | { error }
let pendingPhoto = null; // the shrunk photo, kept for "Try again"
const explainStatus = new Map(); // sentence → 'loading' | { error }

const errorText = (e) => (e instanceof AIError ? e.message : 'Something went wrong. Try again.');
const findScan = (id) => store.scans.find((s) => s.id === id);
const sentenceOf = (v) => sentencesOf(findScan(v.id))[v.si];

function scanTop(title, back) {
  return (
    `<div class="s-top"><div class="grabber"></div><div class="s-head">` +
    (back ? `<button class="back" data-act="back" aria-label="Back">‹</button>` : '') +
    `<h2>${esc(title)}</h2>${headButtons()}</div></div>`
  );
}

function scanSheet(v) {
  if (v.kind !== 'scans' && !findScan(v.id)) scanView = v = { kind: 'scans' }; // deleted meanwhile
  if (v.kind === 'scans') {
    return scanTop('Scans', false) + scansListHtml(store.scans, { hasKey: Boolean(store.settings.keys?.gemini), status: readStatus });
  }
  const scan = findScan(v.id);
  if (v.kind === 'scan') return scanTop(scanDate(scan.date), true) + scanHtml(scan, (s) => Boolean(store.explanation(s)));
  const sentence = sentenceOf(v);
  return scanTop('Sentence', true) + sentenceHtml(sentence, store.explanation(sentence), explainStatus.get(sentence) || null);
}

// Redraw only if the window still shows a view that `matches`.
function refreshIf(matches) {
  if (sheet.open && scanView && matches(scanView)) renderSheet();
}

// Where the reader was on each scan page, so ‹ back from a sentence returns to the same place.
const scanScroll = new Map();

function openScanView(v) {
  if (sheet.open && scanView?.kind === 'scan') scanScroll.set(scanView.id, sheet.scrollTop);
  openKey = null;
  scanView = v;
  showSheet(v.kind === 'scan' ? scanScroll.get(v.id) || 0 : 0);
}

async function readPhoto(file) {
  if (readStatus === 'reading') return;
  if (!file && !pendingPhoto) {
    readStatus = null; // nothing to retry (the photo could not be used): pick a new one
    refreshIf((v) => v.kind === 'scans');
    return;
  }
  readStatus = 'reading';
  refreshIf((v) => v.kind === 'scans');
  try {
    if (file) {
      try {
        pendingPhoto = await shrinkPhoto(file);
      } catch {
        throw new AIError('Could not use this photo. Try another one.');
      }
    }
    const paragraphs = await readPage(store.settings, pendingPhoto);
    if (!paragraphs.length) readStatus = 'empty';
    else {
      const scan = store.addScan(paragraphs);
      readStatus = null;
      pendingPhoto = null;
      if (sheet.open && scanView?.kind === 'scans') return openScanView({ kind: 'scan', id: scan.id });
    }
  } catch (e) {
    readStatus = { error: errorText(e) };
  }
  refreshIf((v) => v.kind === 'scans');
}

async function explain(sentence) {
  if (explainStatus.get(sentence) === 'loading') return;
  const showing = (v) => v.kind === 'sentence' && sentenceOf(v) === sentence;
  explainStatus.set(sentence, 'loading');
  refreshIf(showing);
  try {
    store.saveExplanation(sentence, await explainSentence(store.settings, sentence));
    explainStatus.delete(sentence);
  } catch (e) {
    explainStatus.set(sentence, { error: errorText(e) });
  }
  refreshIf(showing);
}

function openSentence(id, si) {
  openScanView({ kind: 'sentence', id, si });
  const sentence = sentenceOf(scanView);
  if (!store.explanation(sentence)) explain(sentence);
}

$('#scan-btn').addEventListener('click', () => openScanView({ kind: 'scans' }));

$('#sheet-body').addEventListener('change', (e) => {
  if (!e.target.matches('input[type="file"]')) return;
  const file = e.target.files?.[0];
  e.target.value = '';
  if (file) readPhoto(file);
});

$('#sheet-body').addEventListener('keydown', (e) => {
  const s = e.target.closest?.('.sent');
  if (s && (e.key === 'Enter' || e.key === ' ')) {
    e.preventDefault();
    openSentence(scanView.id, Number(s.dataset.si));
  }
});

// ---------- the window ----------

function renderSheet() {
  if (scanView) {
    $('#sheet-body').innerHTML = scanSheet(scanView);
    return;
  }
  const x = ITEM.get(openKey);
  if (!x) return;
  $('#sheet-body').innerHTML = isPattern(x) ? patternSheet(x) : wordSheet(x);
}

function showSheet(scrollTop = 0) {
  renderSheet();
  if (!sheet.open) {
    document.body.classList.add('noscroll');
    sheet.showModal();
  }
  sheet.focus({ preventScroll: true }); // keep focus off the close button so no focus ring shows
  sheet.scrollTop = scrollTop;
}

function openSheet(key) {
  scanView = null;
  openKey = key;
  showSheet();
}

sheet.addEventListener('close', () => {
  document.body.classList.remove('noscroll');
  window.speechSynthesis?.cancel();
  openKey = null;
  scanView = null;
  renderList();
});

// Tap on the dimmed backdrop closes the sheet.
sheet.addEventListener('click', (e) => {
  if (e.target === sheet) sheet.close();
});

// ---------- translator (Google Translate, Turkish ⇄ English) ----------
//
// A second window that opens on top of anything, the sheet included; closing it
// returns to what was below. Text and direction last while the app is open.

const translator = $('#translator');
const trState = { text: '', from: 'tr', result: '', resultFor: '', error: null }; // resultFor: the text `result` translates
let trSeq = 0; // bumped on every change, so a late answer to older text is dropped
let trTimer = null;

const renderTranslator = () => ($('#translator-body').innerHTML = translatorHtml(trState));
const renderTrResult = () => ($('#tr-result').innerHTML = resultHtml(trState));

function focusTrInput() {
  const box = $('#tr-input');
  box.focus({ preventScroll: true });
  box.setSelectionRange(box.value.length, box.value.length);
}

function openTranslator() {
  renderTranslator();
  if (!translator.open) {
    document.body.classList.add('noscroll');
    translator.showModal();
  }
  translator.scrollTop = 0;
  focusTrInput();
  // The last try failed (say, while offline): opening again is trying again.
  if (trState.error) restartTranslation(true);
}

async function runTranslate(seq) {
  const text = trState.text;
  try {
    const result = await translate(text, trState.from);
    if (seq !== trSeq) return;
    trState.result = result;
    trState.resultFor = text;
    trState.error = null;
  } catch (e) {
    if (seq !== trSeq) return;
    trState.error = e instanceof TranslateError ? e.message : FAILED;
  }
  renderTrResult();
}

// Something changed: forget pending answers; translate again now (or not at all when blank).
function restartTranslation(now) {
  const seq = ++trSeq;
  clearTimeout(trTimer);
  if (!trState.text.trim()) {
    trState.result = '';
    trState.error = null;
    renderTrResult();
  } else if (now) runTranslate(seq);
  else trTimer = setTimeout(() => runTranslate(seq), 500);
}

translator.addEventListener('input', (e) => {
  if (e.target.id !== 'tr-input') return;
  trState.text = e.target.value;
  $('#tr-link').href = googleLink(trState.text, trState.from);
  restartTranslation(false);
});

translator.addEventListener('click', (e) => {
  if (e.target === translator) return translator.close(); // the dimmed backdrop
  const say = e.target.closest('[data-say]');
  if (say) return speak(say.dataset.say);
  const btn = e.target.closest('[data-act]');
  if (!btn) return;
  const act = btn.dataset.act;
  if (act === 'close') translator.close();
  else if (act === 'say-text') {
    const text = $('#tr-input').value.trim();
    if (text) speak(text);
  } else if (act === 'swap' || act === 'clear') {
    Object.assign(trState, act === 'swap' ? swapState(trState) : { text: '', result: '', resultFor: '', error: null });
    renderTranslator();
    focusTrInput();
    restartTranslation(true);
  }
});

translator.addEventListener('close', () => {
  window.speechSynthesis?.cancel();
  if (!anyWindowOpen()) document.body.classList.remove('noscroll');
});

// ---------- guide windows: the grammar book ----------
//
// Like the translator: opens on top of anything and returns to what was below.
// A guide window shows a list of sections, or one section with ‹ back to the list.
// It remembers where it was: reopening shows the same page at the same scroll.

const book = $('#book');
const help = $('#help');
const anyWindowOpen = () => sheet.open || translator.open || book.open || help.open;

// content() → { title, intro, sections, linkNext, hint, alphabet() }, called each time the window opens.
function guideWindow(dialog, body, content) {
  const state = { id: null, listScroll: 0, sectionScroll: 0 };

  function render() {
    const c = content();
    const section = c.sections.find((s) => s.id === state.id);
    state.id = section ? section.id : null;
    body.innerHTML = section
      ? guideSectionHtml(section, {
          hint: c.hint,
          alphabet: section.blocks.some((b) => b.alphabet) ? c.alphabet() : '',
          next: c.linkNext ? c.sections[c.sections.indexOf(section) + 1] ?? null : null,
        })
      : guideListHtml(c);
    dialog.scrollTop = section ? state.sectionScroll : state.listScroll;
  }

  // A closed dialog reads scrollTop 0, so the scroll is saved before it closes.
  const saveScroll = () => (state[state.id ? 'sectionScroll' : 'listScroll'] = dialog.scrollTop);
  const shut = () => {
    saveScroll();
    dialog.close();
  };

  dialog.addEventListener('click', (e) => {
    if (e.target === dialog) return shut(); // the dimmed backdrop
    const say = e.target.closest('[data-say]');
    if (say) return speak(say.dataset.say);
    const btn = e.target.closest('[data-act]');
    if (!btn) return;
    const { act, id } = btn.dataset;
    if (act === 'close') shut();
    else if (act === 'open-section' || act === 'next') {
      saveScroll();
      state.id = id;
      state.sectionScroll = 0;
      render();
    } else if (act === 'back') {
      state.id = null;
      render();
    }
  });
  dialog.addEventListener('cancel', saveScroll); // Esc
  dialog.addEventListener('close', () => {
    window.speechSynthesis?.cancel();
    if (!anyWindowOpen()) document.body.classList.remove('noscroll');
  });

  return {
    open() {
      if (!dialog.open) {
        document.body.classList.add('noscroll');
        dialog.showModal();
      }
      render();
      dialog.focus({ preventScroll: true });
    },
  };
}

const bookWindow = guideWindow(book, $('#book-body'), () => ({
  title: 'Grammar',
  intro: '',
  sections: BOOK,
  linkNext: true,
  hint: null,
  alphabet: () => alphabetBodyHtml(LETTERS, TRICKY),
}));
const openBook = () => bookWindow.open();

const helpWindow = guideWindow(help, $('#help-body'), () => ({
  title: 'Help',
  intro: HELP.intro,
  sections: HELP.sections,
  hint: null,
  alphabet: () => '',
}));

async function askAi(button) {
  const x = ITEM.get(openKey);
  const box = button.closest('.ai');
  const msg = box.querySelector('.ai-msg');
  const ck = box.dataset.ck;
  const existing = store.ai[ck] || [];
  let prompt;
  if (isPattern(x)) {
    const v = x.variants[Number(button.dataset.v)];
    const fitting = BY_COMMON.filter((w) => fits(slotOf(x, v), w));
    const mine = fitting.filter(known);
    const words = shuffle(mine.length ? mine : fitting.slice(0, 20)).slice(0, 6);
    prompt = patternPrompt({ variant: v, patternEn: x.en, words, existing });
  } else {
    const pairs = wordPatternPairs(x, PATTERNS).filter(({ p }) => known(p));
    const patterns = shuffle(pairs.map(({ v }) => v)).slice(0, 4);
    prompt = wordPrompt({ word: x.tr, meaning: x.label, kind: TYPES[x.type].one, patterns, existing });
  }
  button.disabled = true;
  button.textContent = 'Thinking…';
  msg.textContent = '';
  msg.classList.remove('err');
  try {
    const examples = await generate(store.settings, prompt);
    store.addAi(ck, examples);
    if (!box.querySelector('.sub')) box.insertAdjacentHTML('afterbegin', '<div class="sub"><span>From AI</span></div>');
    box.querySelector('.ai-list').insertAdjacentHTML('beforeend', examples.map((e) => exHtml(e.tr, e.en)).join(''));
    msg.textContent = 'Saved on this phone, so they also work offline.';
  } catch (e) {
    msg.textContent = e instanceof AIError ? e.message : 'Something went wrong. Try again.';
    msg.classList.add('err');
  } finally {
    button.disabled = false;
    button.textContent = '✨ More examples';
  }
}

$('#sheet-body').addEventListener('click', (e) => {
  const say = e.target.closest('[data-say]');
  if (say) return speak(say.dataset.say);
  const sent = e.target.closest('.sent');
  if (sent && scanView?.kind === 'scan') return openSentence(scanView.id, Number(sent.dataset.si));
  const btn = e.target.closest('[data-act]');
  if (!btn) return;
  const act = btn.dataset.act;
  if (act === 'close') sheet.close();
  else if (act === 'translate') openTranslator();
  else if (act === 'book') openBook();
  else if (act === 'recall') {
    const { dir, grade } = btn.dataset;
    store.setCard(openKey, dir, correct(store.card(openKey, dir), grade, dayOf(Date.now()), Math.random));
    const top = sheet.scrollTop;
    renderSheet();
    sheet.scrollTop = top;
  } else if (act === 'back') openScanView(scanView.kind === 'sentence' ? { kind: 'scan', id: scanView.id } : { kind: 'scans' });
  else if (act === 'open-scan') openScanView({ kind: 'scan', id: btn.dataset.id });
  else if (act === 'delete-scan') {
    if (confirm('Delete this scan?')) {
      store.deleteScan(btn.dataset.id);
      renderSheet();
    }
  } else if (act === 'retry-read') readPhoto(null);
  else if (act === 'retry-explain') explain(sentenceOf(scanView));
  else if (act === 'ai') askAi(btn);
  else if (act === 'setup') {
    sheet.close();
    setTab('settings');
  }
});

// ---------- settings ----------

function renderSettings() {
  const s = store.settings;
  const p = PROVIDERS[s.provider];
  const voice = turkishVoice();
  const nP = PATTERNS.filter(mastered).length;
  const nW = WORDS.filter(mastered).length;
  $('#settings').innerHTML =
    `<section class="card"><h2>Blocks</h2>` +
    `<label class="toggle-row"><span>Show Turkish on blocks</span><input type="checkbox" class="switch" id="set-showtr"${ui.showTurkish ? ' checked' : ''}></label>` +
    `<p>Turn it off to test yourself: read the English, say the Turkish, then tap ⓘ to check.</p></section>` +
    `<section class="card"><h2>More examples with a free AI</h2>` +
    `<p>The built-in examples always work, offline too. Add a free AI key to get extra sentences built from the words you know. The key is stored only on this phone.</p>` +
    `<p>Photo scans (the camera button next to the search field) always use the Gemini key.</p>` +
    `<label class="field">Provider<select id="set-provider"><option value="">Off</option>` +
    Object.entries(PROVIDERS)
      .map(([id, x]) => `<option value="${id}"${s.provider === id ? ' selected' : ''}>${esc(x.label)}</option>`)
      .join('') +
    `</select></label>` +
    (p
      ? `<p>${esc(p.howTo)} <a href="${p.keyUrl}" target="_blank" rel="noopener">Get a key ↗</a></p>` +
        `<label class="field">API key<input id="set-key" type="password" autocomplete="off" value="${esc(s.keys?.[s.provider] || '')}"></label>` +
        `<label class="field">Model<input id="set-model" type="text" autocomplete="off" autocapitalize="off" placeholder="${esc(p.model)}" value="${esc(s.models?.[s.provider] || '')}"></label>` +
        `<p>Leave the model empty to use the default. If the default stops working, check the provider's list of free models.</p>` +
        `<div class="btns"><button class="btn primary" id="set-test">Test</button></div><p class="status-msg" id="set-status"></p>`
      : '') +
    `</section>` +
    `<section class="card"><h2>Pronunciation</h2>` +
    (voice
      ? `<p>Turkish voice found: ${esc(voice.name)}. Tap the speaker icons to listen.</p>`
      : `<p>No Turkish voice found yet. On iPhone, add one in Settings → Accessibility → Spoken Content → Voices → Turkish.</p>`) +
    `<p>No sound? Silent mode mutes it on iPhone.</p>` +
    `<div class="btns"><button class="btn" data-say="Merhaba! Nasılsın?">Try it: Merhaba! Nasılsın?</button></div></section>` +
    `<section class="card"><h2>Progress</h2><p>${nP} of ${PATTERNS.length} patterns and ${nW} of ${WORDS.length} words mastered.</p>` +
    `<p>Progress is saved on this phone. Copy a backup now and then, for example into Notes.</p>` +
    `<div class="btns"><button class="btn" id="set-backup">Copy backup</button><button class="btn" id="set-restore">Restore…</button><button class="btn danger" id="set-reset">Reset progress</button></div>` +
    `<textarea id="set-backup-text" hidden placeholder="Paste a backup here, then press Restore again"></textarea><p class="status-msg" id="set-progress-msg"></p></section>` +
    `<section class="card"><h2>About</h2><p>Words are ordered by how often they appear in a large collection of Turkish film and TV subtitles (FrequencyWords, CC BY-SA 4.0). Patterns are ordered by everyday usefulness.</p>` +
    `<p>The content was written with the help of AI. It can contain mistakes, so double-check anything important with a native speaker.</p></section>`;
}

$('#settings').addEventListener('click', async (e) => {
  const say = e.target.closest('[data-say]');
  if (say) return speak(say.dataset.say);
  const id = e.target.id;
  if (id === 'set-test') {
    const out = $('#set-status');
    out.textContent = 'Testing…';
    try {
      const ex = await generate(store.settings, wordPrompt({ word: 'merhaba', meaning: 'hello', kind: 'word', patterns: [], n: 1 }));
      out.textContent = `It works: ${ex[0].tr} = ${ex[0].en}`;
    } catch (err) {
      out.textContent = err.message;
    }
  } else if (id === 'set-backup') {
    const text = store.backupText();
    const msg = $('#set-progress-msg');
    try {
      await navigator.clipboard.writeText(text);
      msg.textContent = 'Backup copied. Paste it somewhere safe, like Notes.';
    } catch {
      const ta = $('#set-backup-text');
      ta.hidden = false;
      ta.value = text;
      ta.select();
      msg.textContent = 'Copy the text above and keep it somewhere safe.';
    }
  } else if (id === 'set-restore') {
    const ta = $('#set-backup-text');
    const msg = $('#set-progress-msg');
    if (ta.hidden || !ta.value.trim()) {
      ta.hidden = false;
      ta.value = '';
      ta.focus();
      msg.textContent = 'Paste your backup above, then press Restore again.';
      return;
    }
    const restored = store.parseBackup(ta.value, dayOf(Date.now()));
    if (!restored) {
      msg.textContent = "That doesn't look like a backup from this app.";
      return;
    }
    if (!confirm('Restore this backup? It replaces your current practice progress.')) return;
    store.replaceCards(restored);
    renderSettings();
    $('#set-progress-msg').textContent = 'Progress restored.';
  } else if (id === 'set-reset') {
    if (confirm('Clear all practice progress? This cannot be undone.')) {
      store.resetProgress();
      renderSettings();
    }
  }
});

$('#settings').addEventListener('change', (e) => {
  const s = store.settings;
  if (e.target.id === 'set-showtr') {
    ui.showTurkish = e.target.checked;
    store.saveUi();
  } else if (e.target.id === 'set-provider') {
    s.provider = e.target.value;
    store.saveSettings();
    renderSettings();
  }
});

$('#settings').addEventListener('input', (e) => {
  const s = store.settings;
  if (e.target.id === 'set-key') {
    s.keys = { ...s.keys, [s.provider]: e.target.value.trim() };
    store.saveSettings();
  } else if (e.target.id === 'set-model') {
    s.models = { ...s.models, [s.provider]: e.target.value.trim() };
    store.saveSettings();
  }
});

// ---------- events ----------

let toastTimer = null;
function toast(message, ms = 1500) {
  const el = $('#toast');
  // An open window sits above the whole page, so the toast goes inside the top one while it is open.
  const host = translator.open ? translator : book.open ? book : help.open ? help : sheet.open ? sheet : document.body;
  if (el.parentElement !== host) host.append(el);
  el.textContent = message;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), ms);
}

// Selection: shown in place, so the list keeps its scroll position and focus.
// Clear (N) counts and clears only the tab you are on: pattern keys start with "p:".
const inThisTab = (key) => key.startsWith('p:') === (ui.tab === 'patterns');

function renderClear() {
  const n = store.selectedCount(inThisTab);
  const btn = $('#clear-sel');
  btn.hidden = n === 0 || ui.tab === 'settings' || ui.mode === 'practice';
  btn.textContent = `Clear (${n})`;
}

function toggleSelect(block) {
  const key = block.dataset.key;
  store.toggleSelected(key);
  const on = store.isSelected(key);
  block.classList.toggle('sel', on);
  block.setAttribute('aria-pressed', String(on));
  renderClear();
}

$('#clear-sel').addEventListener('click', () => {
  store.clearSelected(inThisTab);
  renderClear();
  renderList();
});

$('#list').addEventListener('click', (e) => {
  if (ui.mode === 'practice') return practiceClick(e);
  const block = e.target.closest('.block');
  if (!block) return;
  if (e.target.closest('.b-info')) openSheet(block.dataset.key);
  else toggleSelect(block);
});

$('#list').addEventListener('keydown', (e) => {
  if ((e.key === 'Enter' || e.key === ' ') && e.target.classList.contains('block')) {
    e.preventDefault();
    toggleSelect(e.target);
  }
});

document.querySelector('.tabs').addEventListener('click', (e) => {
  const b = e.target.closest('[data-tab]');
  if (b) setTab(b.dataset.tab);
});

$('#gear').addEventListener('click', () => setTab(ui.tab === 'settings' ? lastListTab : 'settings'));

$('#tr-btn').innerHTML = BUBBLE;
$('#tr-btn').addEventListener('click', () => openTranslator());
$('#book-btn').innerHTML = BOOK_ICON;
$('#book-btn').addEventListener('click', () => openBook());
$('#help-btn').innerHTML = QUESTION;
$('#help-btn').addEventListener('click', () => helpWindow.open());

$('#sort').addEventListener('change', (e) => {
  ui.sort[ui.tab] = e.target.value;
  store.saveUi();
  renderList();
});

$('#types').addEventListener('click', (e) => {
  const b = e.target.closest('[data-type], [data-group], [data-topic]');
  if (!b) return;
  if (b.dataset.group) ui.pgroup = b.dataset.group;
  else if (b.dataset.topic) ui.topic = b.dataset.topic;
  else ui.type = b.dataset.type;
  store.saveUi();
  renderControls();
  renderList();
});

$('#search').addEventListener('input', () => renderList());

// Voices load asynchronously in some browsers.
if ('speechSynthesis' in window) {
  speechSynthesis.addEventListener?.('voiceschanged', () => {
    if (ui.tab === 'settings') renderSettings();
  });
}

ui.tab = 'words'; // the app always opens on Words,
ui.mode = 'practice'; // in Practice
render();

if ('serviceWorker' in navigator && location.protocol === 'https:') {
  reloadOnUpdate(navigator.serviceWorker, () => location.reload());
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
