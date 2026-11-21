// Everything is saved on this device only (localStorage). Every access is
// wrapped in try/catch so the app still works if storage is unavailable.

const KEYS = {
  learned: 'tl.learned',
  selected: 'tl.selected',
  ui: 'tl.ui',
  settings: 'tl.settings',
  ai: 'tl.ai',
  scans: 'tl.scans',
  explain: 'tl.explain',
};

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

export const store = {
  learned: load(KEYS.learned, {}),
  selected: load(KEYS.selected, {}),
  ui: load(KEYS.ui, {
    tab: 'words',
    status: { patterns: 'all', words: 'all' },
    sort: { patterns: 'common', words: 'topic' },
    type: 'all',
    pgroup: 'all',
    showTr: true,
  }),
  settings: load(KEYS.settings, { provider: '', keys: {}, models: {} }),
  ai: load(KEYS.ai, {}),
  // Photographed pages as text, newest first ({ id, date, paragraphs }), and sentence explanations by sentence text.
  scans: [load(KEYS.scans, { list: [] }).list].map((l) => (Array.isArray(l) ? l : []))[0],
  explanations: load(KEYS.explain, {}),

  isLearned(key) {
    return Boolean(this.learned[key]);
  },
  toggleLearned(key) {
    if (this.learned[key]) delete this.learned[key];
    else this.learned[key] = Date.now();
    save(KEYS.learned, this.learned);
  },
  replaceLearned(obj) {
    this.learned = { ...obj };
    save(KEYS.learned, this.learned);
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
    this.scans = [scan, ...this.scans].slice(0, MAX_SCANS);
    save(KEYS.scans, { list: this.scans });
    return scan;
  },
  deleteScan(id) {
    this.scans = this.scans.filter((s) => s.id !== id);
    save(KEYS.scans, { list: this.scans });
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
