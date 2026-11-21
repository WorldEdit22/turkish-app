import { WORDS, CATEGORIES, TYPES } from '../data/words.js';
import { PATTERNS, GROUPS } from '../data/patterns.js';
import { RANKS } from '../data/ranks.js';
import { fits } from './combine.js';
import { patternExamples, wordExamples, wordPatternPairs, slotOf } from './examples.js';
import { store } from './store.js';
import { PROVIDERS, AIError, generate, patternPrompt, wordPrompt } from './ai.js';
import { swipe } from './swipe.js';
import { reloadOnUpdate } from './update.js';

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
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
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
const learned = (x) => store.isLearned(keyOf(x));
const selected = (x) => store.isSelected(keyOf(x));

const SPEAKER = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9H4z"/><path d="M16.5 8.5a5 5 0 0 1 0 7"/><path d="M19 6a8.5 8.5 0 0 1 0 12"/></svg>';
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
    ['todo', 'To learn first'],
    ['learned', 'Learned first'],
  ],
  words: [
    ['topic', 'By topic'],
    ['common', 'Most common'],
    ['az', 'A–Z English'],
    ['tr', 'A–Z Turkish'],
    ['todo', 'To learn first'],
    ['learned', 'Learned first'],
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
  const st = ui.status[tab];
  if (st !== 'all') items = items.filter((x) => learned(x) === (st === 'learned'));

  const byRank = (a, b) => a.rank - b.rank;
  const sort = ui.sort[tab];
  const sorted = [...items];
  if (sort === 'az') sorted.sort((a, b) => a.label.localeCompare(b.label, 'en'));
  else if (sort === 'tr') sorted.sort((a, b) => a.tr.localeCompare(b.tr, 'tr'));
  else if (sort === 'todo') sorted.sort((a, b) => learned(a) - learned(b) || byRank(a, b));
  else if (sort === 'learned') sorted.sort((a, b) => learned(b) - learned(a) || byRank(a, b));
  else if (sort === 'topic') sorted.sort((a, b) => CAT_ORDER[a.cat] - CAT_ORDER[b.cat] || byRank(a, b));
  else sorted.sort(byRank);
  return sorted;
}

// Tapping a block selects it; the ⓘ button opens its card.
function blockHtml(x, showIcon) {
  const on = learned(x);
  const sel = store.isSelected(keyOf(x));
  const dot = isPattern(x) ? '' : `<span class="dot t-${x.type}"></span>`;
  return (
    `<div class="block${on ? ' on' : ''}${sel ? ' sel' : ''}" data-key="${esc(keyOf(x))}" role="button" tabindex="0"` +
    ` aria-pressed="${sel}" aria-label="${esc(`${x.label}, ${x.tr}${on ? ', learned' : ''}`)}">` +
    `<div class="b-en">${dot}<span>${esc(x.label)}</span></div>` +
    (ui.showTr ? `<div class="b-tr">${esc(x.tr)}</div>` : '') +
    `<button class="b-info" aria-label="Details">${INFO}</button>` +
    (showIcon ? `<span class="b-icon">${CAT[x.cat].icon}</span>` : '') +
    `</div>`
  );
}

function renderList() {
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
      const done = all.filter(learned).length;
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
  $('#progress').textContent = all ? `${all.filter(learned).length} / ${all.length} learned` : 'Settings';
}

function renderControls() {
  const tab = ui.tab;
  const listTab = tab !== 'settings';
  $('#controls').hidden = !listTab;
  $('#toggle-tr').hidden = !listTab;
  renderClear();
  $('#toggle-tr').setAttribute('aria-pressed', String(ui.showTr));
  $('#gear').setAttribute('aria-pressed', String(!listTab));
  document.querySelectorAll('.tabs button').forEach((b) => b.classList.toggle('on', b.dataset.tab === tab));
  if (!listTab) {
    renderProgress();
    return;
  }

  document.querySelectorAll('#status button').forEach((b) => b.classList.toggle('on', b.dataset.status === ui.status[tab]));
  $('#sort').innerHTML = SORTS[tab]
    .map(([v, label]) => `<option value="${v}"${ui.sort[tab] === v ? ' selected' : ''}>${label}</option>`)
    .join('');

  // Chip row: word types on the Words tab, pattern groups on the Patterns tab.
  const chips =
    tab === 'words'
      ? [['all', 'All', '']].concat(Object.entries(TYPES).map(([id, t]) => [id, t.label, `<span class="dot t-${id}"></span>`]))
      : [['all', 'All', '']].concat(Object.entries(GROUPS).map(([id, label]) => [id, label, '']));
  const current = tab === 'words' ? ui.type : ui.pgroup;
  const attr = tab === 'words' ? 'data-type' : 'data-group';
  $('#types').setAttribute('aria-label', tab === 'words' ? 'Word type' : 'Pattern group');
  $('#types').innerHTML = chips
    .map(([id, label, dot]) => `<button class="chip${current === id ? ' on' : ''}" ${attr}="${id}">${dot}${label}</button>`)
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
  render();
  window.scrollTo(0, 0);
}

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

// The title row with ✕ sits in .s-top, which stays at the top while the card scrolls.
function headHtml(title, tr, on, meta) {
  return (
    `<div class="s-top"><div class="grabber"></div>` +
    `<div class="s-head"><h2>${esc(title)}</h2><button class="close" data-act="close" aria-label="Close">✕</button></div></div>` +
    `<div class="s-tr"><span>${esc(tr)}</span><button class="say" data-say="${esc(tr.replace(/_+|\.\.\./g, ' '))}" aria-label="Listen">${SPEAKER}</button></div>` +
    (meta ? `<div class="s-meta">${meta}</div>` : '') +
    `<button class="learn-btn${on ? ' on' : ''}" data-act="toggle">${on ? '✓ Learned' : 'Mark as learned'}</button>`
  );
}

const exampleOpts = () => ({ words: BY_COMMON, patterns: PATTERNS, isSelected: selected, isLearned: learned });

function patternSheet(p) {
  let h = headHtml(p.en, p.tr, learned(p), '');
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
  let h = headHtml(w.label, w.tr, learned(w), meta);
  if (w.note) h += `<p class="note">${esc(w.note)}</p>`;
  h += examplesHtml(wordExamples(w, exampleOpts()), (p) => p.en);
  if (w.type !== 'phrase') h += aiHtml(w.id);
  return h;
}

function renderSheet() {
  const x = ITEM.get(openKey);
  if (!x) return;
  $('#sheet-body').innerHTML = isPattern(x) ? patternSheet(x) : wordSheet(x);
}

function openSheet(key) {
  openKey = key;
  renderSheet();
  document.body.classList.add('noscroll');
  sheet.showModal();
  sheet.focus(); // keep focus off the close button so no focus ring shows
  sheet.scrollTop = 0;
}

sheet.addEventListener('close', () => {
  document.body.classList.remove('noscroll');
  window.speechSynthesis?.cancel();
  openKey = null;
  renderList();
});

// Tap on the dimmed backdrop closes the sheet.
sheet.addEventListener('click', (e) => {
  if (e.target === sheet) sheet.close();
});

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
    const mine = fitting.filter(learned);
    const words = shuffle(mine.length ? mine : fitting.slice(0, 20)).slice(0, 6);
    prompt = patternPrompt({ variant: v, patternEn: x.en, words, existing });
  } else {
    const pairs = wordPatternPairs(x, PATTERNS).filter(({ p }) => learned(p));
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
  const btn = e.target.closest('[data-act]');
  if (!btn) return;
  const act = btn.dataset.act;
  if (act === 'close') sheet.close();
  else if (act === 'toggle') {
    store.toggleLearned(openKey);
    const on = store.isLearned(openKey);
    btn.classList.toggle('on', on);
    btn.textContent = on ? '✓ Learned' : 'Mark as learned';
  } else if (act === 'ai') askAi(btn);
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
  const nP = PATTERNS.filter(learned).length;
  const nW = WORDS.filter(learned).length;
  $('#settings').innerHTML =
    `<section class="card"><h2>Blocks</h2>` +
    `<label class="toggle-row"><span>Show Turkish on blocks</span><input type="checkbox" class="switch" id="set-showtr"${ui.showTr ? ' checked' : ''}></label>` +
    `<p>Turn it off to test yourself: read the English, say the Turkish, then tap ⓘ to check.</p></section>` +
    `<section class="card"><h2>More examples with a free AI</h2>` +
    `<p>The built-in examples always work, offline too. Add a free AI key to get extra sentences built from your learned words. The key is stored only on this phone.</p>` +
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
    `<section class="card"><h2>Progress</h2><p>${nP} of ${PATTERNS.length} patterns and ${nW} of ${WORDS.length} words learned.</p>` +
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
    const text = JSON.stringify({ app: 'turkish', learned: store.learned });
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
    try {
      const data = JSON.parse(ta.value);
      if (!data || typeof data.learned !== 'object') throw new Error();
      store.replaceLearned(data.learned);
      renderSettings();
      $('#set-progress-msg').textContent = 'Progress restored.';
    } catch {
      msg.textContent = "That doesn't look like a backup from this app.";
    }
  } else if (id === 'set-reset') {
    if (confirm('Mark everything as not learned? This cannot be undone.')) {
      store.replaceLearned({});
      renderSettings();
    }
  }
});

$('#settings').addEventListener('change', (e) => {
  const s = store.settings;
  if (e.target.id === 'set-showtr') {
    ui.showTr = e.target.checked;
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
  // An open card sits above the whole page, so the toast goes inside it while it is open.
  const host = sheet.open ? sheet : document.body;
  if (el.parentElement !== host) host.append(el);
  el.textContent = message;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), ms);
}

function setLearned(key, on) {
  if (store.isLearned(key) !== on) store.toggleLearned(key);
  toast(on ? '✓ Learned' : 'Not learned');
  renderList();
}

// Swipe a block right to mark it learned, left to unmark; the block follows the finger.
const swiper = swipe($('#list'), {
  find: (e) => e.target.closest?.('.block') || null,
  onDrag: (block, dx) => {
    const x = Math.max(-90, Math.min(90, dx * 0.6));
    block.classList.add('dragging');
    block.classList.toggle('to-on', dx >= 60);
    block.classList.toggle('to-off', dx <= -60);
    block.style.transform = `translateX(${x}px)`;
  },
  onEnd: (block) => {
    block.classList.remove('dragging', 'to-on', 'to-off');
    block.style.transform = '';
  },
  onSwipe: (block, dir) => setLearned(block.dataset.key, dir === 'right'),
});

// Selection: shown in place, so the list keeps its scroll position and focus.
// Clear (N) counts and clears only the tab you are on: pattern keys start with "p:".
const inThisTab = (key) => key.startsWith('p:') === (ui.tab === 'patterns');

function renderClear() {
  const n = store.selectedCount(inThisTab);
  const btn = $('#clear-sel');
  btn.hidden = n === 0 || ui.tab === 'settings';
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
  const block = e.target.closest('.block');
  if (!block || swiper.consumeClick()) return;
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

$('#status').addEventListener('click', (e) => {
  const b = e.target.closest('[data-status]');
  if (!b) return;
  ui.status[ui.tab] = b.dataset.status;
  store.saveUi();
  renderControls();
  renderList();
});

$('#sort').addEventListener('change', (e) => {
  ui.sort[ui.tab] = e.target.value;
  store.saveUi();
  renderList();
});

$('#types').addEventListener('click', (e) => {
  const b = e.target.closest('[data-type], [data-group]');
  if (!b) return;
  if (b.dataset.group) ui.pgroup = b.dataset.group;
  else ui.type = b.dataset.type;
  store.saveUi();
  renderControls();
  renderList();
});

$('#search').addEventListener('input', () => renderList());

$('#toggle-tr').addEventListener('click', () => {
  ui.showTr = !ui.showTr;
  store.saveUi();
  renderControls();
  renderList();
});

// Voices load asynchronously in some browsers.
if ('speechSynthesis' in window) {
  speechSynthesis.addEventListener?.('voiceschanged', () => {
    if (ui.tab === 'settings') renderSettings();
  });
}

ui.tab = 'words'; // the app always opens on Words
render();

if ('serviceWorker' in navigator && location.protocol === 'https:') {
  reloadOnUpdate(navigator.serviceWorker, () => location.reload());
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
