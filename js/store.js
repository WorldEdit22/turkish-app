// Everything is saved on this device only (localStorage). Every access is
// wrapped in try/catch so the app still works if storage is unavailable.

const KEYS = { learned: 'tl.learned', selected: 'tl.selected', ui: 'tl.ui', settings: 'tl.settings', ai: 'tl.ai' };

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
    tab: 'patterns',
    status: { patterns: 'all', words: 'all' },
    sort: { patterns: 'common', words: 'topic' },
    type: 'all',
    pgroup: 'all',
    showTr: true,
  }),
  settings: load(KEYS.settings, { provider: '', keys: {}, models: {} }),
  ai: load(KEYS.ai, {}),

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
  clearSelected() {
    this.selected = {};
    save(KEYS.selected, this.selected);
  },
  selectedCount() {
    return Object.keys(this.selected).length;
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
