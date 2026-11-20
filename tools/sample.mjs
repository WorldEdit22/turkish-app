// Prints generated example sentences for a quick read-through.
// Usage: node tools/sample.mjs [wordsPerTemplate] [patternId]
import { WORDS } from '../data/words.js';
import { PATTERNS } from '../data/patterns.js';
import { fill, fits } from '../js/combine.js';

const per = Number(process.argv[2] || 4);
const only = process.argv[3];

for (const p of PATTERNS) {
  if (only && p.id !== only) continue;
  for (const v of p.variants) {
    const slot = v.slot || p.slot;
    const words = WORDS.filter((w) => fits(slot, w));
    if (!v.t.length || !words.length) continue;
    const step = Math.max(1, Math.floor(words.length / per));
    const picked = words.filter((_, i) => i % step === 0).slice(0, per);
    console.log(`\n## ${p.id} — ${v.tr}`);
    for (const [tr, en] of v.t) {
      for (const w of picked) {
        const r = fill({ tr, en }, w);
        console.log(`  ${r.tr.padEnd(42)} ${r.en}`);
      }
    }
  }
}
