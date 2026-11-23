// Everything is saved on this device only (localStorage). Every access is
// wrapped in try/catch so the app still works if storage is unavailable.

import { dayOf, migrateLearned, doseLeft, useDose, addDose, giveBackDose } from './srs.js';

const KEYS = {
  learned: 'tl.learned', // read once for the migration, never written
  practice: 'tl.practice',
  selected: 'tl.selected',
  ui: 'tl.ui',
  settings: 'tl.settings',
  ai: 'tl.ai',
  scans: 'tl.scans',
  explain: 'tl.explain',
};

const APP = 'turkish'; // marks backups from this app
const MAX_SCANS = 50;
const all = () => true;

function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? { ...fallback, ...JSON.parse(raw) } : fallback;
  } catch {
    return fallback;
  }
}

function save(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage full or blocked: keep working in memory */
  }
}

const isMap = (x) => Boolean(x) && typeof x === 'object' && !Array.isArray(x);

// Practice data. The first time, the old learned marks become cards; the old map stays in storage, unused.
function loadPractice() {
  const practice = load(KEYS.practice, { migrated: false, cards: {}, daily: null });
  if (!practice.migrated) {
    const old = load(KEYS.learned, {});
    practice.cards = migrateLearned(old, dayOf(Date.now()), Math.random);
    practice.migrated = true;
    save(KEYS.practice, practice);
  }
  if (!isMap(practice.cards)) practice.cards = {};
  return practice;
}

// The "todo" and "learned" sorts and the status filter are gone; saved ones fall back to the default.
function sanitiseUi(ui) {
  const sort = { patterns: 'common', words: 'topic', ...ui.sort };
  if (sort.patterns === 'todo' || sort.patterns === 'learned') sort.patterns = 'common';
  if (sort.words === 'todo' || sort.words === 'learned') sort.words = 'topic';
  ui.sort = sort;
  delete ui.status;
  return ui;
}

const practice = loadPractice();

export const store = {
  practice,
  cards: practice.cards,
  selected: load(KEYS.selected, {}),
  ui: sanitiseUi(load(KEYS.ui, {
    tab: 'words',
    sort: { patterns: 'common', words: 'topic' },
    type: 'all',
    pgroup: 'all',
    mode: 'browse',
    dir: 'say',
    topic: 'all',
    // Off by default. A new name, so a phone that saved the old TR button's "on" (showTr) starts off too.
    showTurkish: false,
  })),
  settings: load(KEYS.settings, { provider: '', keys: {}, models: {} }),
  ai: load(KEYS.ai, {}),
  // Photographed pages as text, newest first ({ id, date, paragraphs }), and sentence explanations by sentence text.
  scans: [load(KEYS.scans, { list: [] }).list].map((l) => (Array.isArray(l) ? l : []))[0],
  explanations: load(KEYS.explain, {}),

  // Practice data: one card per key and direction (see srs.js).
  card(key, dir) {
    return this.cards[key]?.[dir];
  },
  setCard(key, dir, card) {
    this.cards[key] = { ...this.cards[key], [dir]: card };
    this.savePractice();
  },
  doseLeft(dir, today) {
    return doseLeft(this.practice.daily, dir, today);
  },
  useDose(dir, today) {
    this.practice.daily = useDose(this.practice.daily, dir, today);
    this.savePractice();
  },
  addDose(dir, today) {
    this.practice.daily = addDose(this.practice.daily, dir, today);
    this.savePractice();
  },
  giveBackDose(dir, today) {
    this.practice.daily = giveBackDose(this.practice.daily, dir, today);
    this.savePractice();
  },
  // Clears the cards and today's dose; the migrated flag stays so old marks never come back.
  resetProgress() {
    this.replaceCards({});
    this.practice.daily = null;
    this.savePractice();
  },
  replaceCards(cards) {
    this.practice.cards = this.cards = { ...cards };
    this.savePractice();
  },
  savePractice() {
    save(KEYS.practice, this.practice);
  },
  // Progress as text to keep somewhere safe; parseBackup reads it back.
  backupText() {
    return JSON.stringify({ app: APP, v: 2, cards: this.cards });
  },
  // The cards from a backup of this app (an old { learned } backup is migrated), or null for anything else.
  parseBackup(text, today) {
    try {
      const data = JSON.parse(text);
      if (!data || data.app !== APP) return null;
      if (isMap(data.cards)) return data.cards;
      return isMap(data.learned) ? migrateLearned(data.learned, today) : null;
    } catch {
      return null;
    }
  },
  // Selected words and patterns (same keys as learned) feed the card's examples.
  isSelected(key) {
    return Boolean(this.selected[key]);
  },
  toggleSelected(key) {
    if (this.selected[key]) delete this.selected[key];
    else this.selected[key] = 1;
    save(KEYS.selected, this.selected);
  },
  // `filter(key)` limits these to some keys, e.g. only patterns (keys starting with "p:").
  clearSelected(filter = all) {
    for (const key of Object.keys(this.selected)) if (filter(key)) delete this.selected[key];
    save(KEYS.selected, this.selected);
  },
  selectedCount(filter = all) {
    return Object.keys(this.selected).filter(filter).length;
  },
  addScan(paragraphs) {
    const scan = { id: `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`, date: new Date().toISOString(), paragraphs };
    this.setScans([scan, ...this.scans].slice(0, MAX_SCANS));
    return scan;
  },
  deleteScan(id) {
    this.setScans(this.scans.filter((s) => s.id !== id));
  },
  // Saves the scans and drops explanations that no remaining scan contains, so storage stays bounded.
  setScans(list) {
    this.scans = list;
    save(KEYS.scans, { list });
    const kept = new Set(list.flatMap((s) => s.paragraphs.flat()));
    const unused = Object.keys(this.explanations).filter((sentence) => !kept.has(sentence));
    if (!unused.length) return;
    for (const sentence of unused) delete this.explanations[sentence];
    save(KEYS.explain, this.explanations);
  },
  explanation(sentence) {
    return this.explanations[sentence];
  },
  saveExplanation(sentence, data) {
    this.explanations[sentence] = data;
    save(KEYS.explain, this.explanations);
  },
  saveUi() {
    save(KEYS.ui, this.ui);
  },
  saveSettings() {
    save(KEYS.settings, this.settings);
  },
  addAi(key, examples) {
    this.ai[key] = [...(this.ai[key] || []), ...examples];
    save(KEYS.ai, this.ai);
  },
};
