// Free AI services: "More examples", and reading and explaining photographed
// Turkish text (Gemini only). Keys are stored only on this device.
//
// Gemini uses Google's own API; the others share the OpenAI-style chat API.

export const PROVIDERS = {
  gemini: {
    label: 'Google Gemini (recommended)',
    // Flash-Lite: about 500 free requests a day (regular Flash: about 20, and often overloaded).
    model: 'gemini-flash-lite-latest',
    keyUrl: 'https://aistudio.google.com/apikey',
    howTo: 'Sign in with a Google account at Google AI Studio and press "Create API key". No credit card needed.',
  },
  groq: {
    label: 'Groq',
    model: 'llama-3.3-70b-versatile',
    url: 'https://api.groq.com/openai/v1/chat/completions',
    keyUrl: 'https://console.groq.com/keys',
    howTo: 'Create a free account at console.groq.com and make an API key. No credit card needed.',
    json: true,
  },
  mistral: {
    label: 'Mistral',
    model: 'mistral-small-latest',
    url: 'https://api.mistral.ai/v1/chat/completions',
    keyUrl: 'https://console.mistral.ai/api-keys',
    howTo: 'Create a free account at console.mistral.ai (free "Experiment" plan) and make an API key.',
    json: true,
  },
  openrouter: {
    label: 'OpenRouter (free models)',
    model: 'meta-llama/llama-3.3-70b-instruct:free',
    url: 'https://openrouter.ai/api/v1/chat/completions',
    keyUrl: 'https://openrouter.ai/keys',
    howTo: 'Create a free account at openrouter.ai and make a key. Models ending in ":free" cost nothing.',
  },
};

export class AIError extends Error {}

// The first {...} in a reply, ignoring code fences and chatter; null if none parses.
function jsonObject(text) {
  const s = String(text || '');
  const start = s.indexOf('{');
  if (start < 0) return null;
  try {
    return JSON.parse(s.slice(start, s.lastIndexOf('}') + 1));
  } catch {
    return null;
  }
}

const str = (v) => (typeof v === 'string' ? v.trim() : '');

// Pulls [{tr, en}] out of a model reply, ignoring code fences and chatter.
export function parseExamples(text) {
  const s = String(text || '');
  const arrStart = s.indexOf('[');
  const objStart = s.indexOf('{');
  let data = null;
  try {
    if (arrStart >= 0 && (objStart < 0 || arrStart < objStart)) {
      data = JSON.parse(s.slice(arrStart, s.lastIndexOf(']') + 1));
    } else if (objStart >= 0) {
      const obj = JSON.parse(s.slice(objStart, s.lastIndexOf('}') + 1));
      data = Array.isArray(obj.examples) ? obj.examples : [obj];
    }
  } catch {
    data = null;
  }
  const out = (Array.isArray(data) ? data : [])
    .filter((e) => e && typeof e.tr === 'string' && typeof e.en === 'string')
    .map((e) => ({ tr: e.tr.trim(), en: e.en.trim() }))
    .filter((e) => e.tr && e.en);
  if (!out.length) throw new AIError('Could not read examples from the AI reply. Try again.');
  return out;
}

// Paragraphs of sentences read from a photo. [] means no Turkish text was found.
export function parsePage(text) {
  const obj = jsonObject(text);
  if (!obj || !Array.isArray(obj.paragraphs)) throw new AIError('Could not read the text from the AI reply. Try again.');
  return obj.paragraphs
    .map((p) => (Array.isArray(p) ? p : []).map(str).filter(Boolean))
    .filter((p) => p.length);
}

// { en, structure, words: [{ w, base, en, parts }] } for one sentence.
export function parseExplanation(text) {
  const obj = jsonObject(text);
  if (!obj || !str(obj.en)) throw new AIError('Could not read the explanation from the AI reply. Try again.');
  const words = (Array.isArray(obj.words) ? obj.words : [])
    .filter((x) => x && str(x.w))
    .map((x) => ({ w: str(x.w), base: str(x.base), en: str(x.en), parts: str(x.parts) }));
  return { en: str(obj.en), structure: str(obj.structure), words };
}

const RULES =
  'Rules: short sentences (at most 8 words), natural casual everyday spoken Turkish, common vocabulary, ' +
  'correct suffixes and vowel harmony, and a natural English translation. ' +
  'Reply with JSON only, in this shape: {"examples":[{"tr":"Turkish sentence","en":"English translation"}]}';

const avoid = (existing) =>
  existing.length ? `Do not repeat these: ${existing.slice(-12).map((e) => e.tr).join(' | ')}\n` : '';

export function patternPrompt({ variant, patternEn, words, existing = [], n = 4 }) {
  return (
    `You help an English speaker learn everyday spoken Turkish.\n` +
    `Write ${n} new example sentences that use this Turkish pattern: "${variant.tr}" (meaning "${variant.en}", from "${patternEn}").\n` +
    (words.length
      ? `Build them with these words the learner knows, one per sentence where it fits naturally: ${words.map((w) => `${w.tr} (${w.en})`).join(', ')}.\n`
      : '') +
    avoid(existing) +
    RULES
  );
}

export function wordPrompt({ word, meaning, kind, patterns, existing = [], n = 4 }) {
  return (
    `You help an English speaker learn everyday spoken Turkish.\n` +
    `Write ${n} new example sentences that use the Turkish ${kind} "${word}" (${meaning}).\n` +
    (patterns.length
      ? `Where natural, use these patterns the learner knows: ${patterns.map((v) => `"${v.tr}" (${v.en})`).join(', ')}.\n`
      : '') +
    avoid(existing) +
    RULES
  );
}

const PAGE_PROMPT =
  'This photo shows Turkish text, for example a page of a book. Write out the Turkish text exactly as printed: ' +
  'keep every letter (ç ğ ı İ ö ş ü), the punctuation and the paragraphs, and correct nothing. ' +
  'Join words that are hyphenated across line ends. Split each paragraph into its sentences. ' +
  'Leave out page numbers, running headers and any text that is not Turkish. ' +
  'If there is no Turkish text, reply with an empty list. ' +
  'Reply with JSON only, in this shape: {"paragraphs":[["First sentence.","Second sentence."],["A sentence of the next paragraph."]]}';

const explainPrompt = (sentence) =>
  `You help an English speaker understand Turkish grammar.\n` +
  `Explain this Turkish sentence: ${JSON.stringify(sentence)}\n` +
  'Give "en": a natural English translation. ' +
  'Give "structure": how the sentence is built, in 2 to 5 short plain-English sentences (subject, verb, tense, ' +
  'word order, a hidden subject, and any clause or connector). ' +
  'Give "words": every word in order, each with "w" (as written), "base" (dictionary form, verbs with -mak/-mek), ' +
  '"en" (its meaning here) and "parts" (the stem and each suffix with its meaning, for example ' +
  '"kitap + -lar (plural) + -ım (my)"; just the word when it has no suffix). ' +
  'Reply with JSON only, in this shape: {"en":"...","structure":"...","words":[{"w":"...","base":"...","en":"...","parts":"..."}]}';

const LIMIT_MSG = 'The free daily limit is used up. Try again later or pick another provider in Settings.';
const SCAN_LIMIT_MSG = 'The free daily limit is used up. Try again tomorrow.';

// An error for a failed reply, with the service's own explanation when it gives one.
async function httpError(res, limitMsg = LIMIT_MSG) {
  if (res.status === 429) return new AIError(limitMsg);
  let detail = '';
  try {
    detail = str((await res.json())?.error?.message);
  } catch {
    /* no JSON body */
  }
  const code = `error ${res.status}${detail ? `: ${detail}` : ''}`;
  if ([400, 401, 403, 404].includes(res.status)) return new AIError(`The AI service did not accept the key or model (${code}). Check Settings.`);
  return new AIError(`The AI service had a problem (${code}). Try again later.`);
}

function networkError(e) {
  if (e instanceof AIError) return e;
  if (e.name === 'AbortError') return new AIError('The AI took too long to answer. Try again.');
  return new AIError(navigator.onLine === false ? "You're offline. Built-in examples still work." : 'Could not reach the AI service.');
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// One Gemini request; a 503 (overloaded) is retried once after `retryMs`. Returns the reply text.
async function callGemini({ key, model, parts, temperature, timeout = 25000, retryMs = 2000, limitMsg }) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;
  for (let attempt = 0; ; attempt++) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), timeout);
    let res;
    try {
      res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
        body: JSON.stringify({
          contents: [{ role: 'user', parts }],
          generationConfig: { responseMimeType: 'application/json', temperature },
        }),
        signal: ctrl.signal,
      });
    } catch (e) {
      throw networkError(e);
    } finally {
      clearTimeout(timer);
    }
    if (res.status === 503 && attempt === 0) {
      await sleep(retryMs);
      continue;
    }
    if (!res.ok) throw await httpError(res, limitMsg);
    const data = await res.json();
    return (data.candidates?.[0]?.content?.parts || []).map((x) => x.text || '').join('');
  }
}

// Scans always use Gemini, whichever provider is chosen for "More examples".
function geminiFor(settings) {
  const key = settings.keys?.gemini;
  if (!key) throw new AIError('Add a free Gemini key in Settings to scan photos.');
  return { key, model: settings.models?.gemini || PROVIDERS.gemini.model };
}

// image: { data: base64 without the data: prefix, mimeType }. Returns paragraphs of sentences.
export async function readPage(settings, image, { retryMs = 2000 } = {}) {
  const parts = [{ inline_data: { mime_type: image.mimeType, data: image.data } }, { text: PAGE_PROMPT }];
  const text = await callGemini({ ...geminiFor(settings), parts, temperature: 0.2, timeout: 60000, retryMs, limitMsg: SCAN_LIMIT_MSG });
  return parsePage(text);
}

export async function explainSentence(settings, sentence, { retryMs = 2000 } = {}) {
  const parts = [{ text: explainPrompt(sentence) }];
  const text = await callGemini({ ...geminiFor(settings), parts, temperature: 0.2, timeout: 60000, retryMs, limitMsg: SCAN_LIMIT_MSG });
  return parseExplanation(text);
}

export async function generate(settings, prompt) {
  const id = settings.provider;
  const p = PROVIDERS[id];
  const key = settings.keys?.[id];
  if (!p || !key) throw new AIError('Add a free AI key in Settings to get more examples.');
  const model = settings.models?.[id] || p.model;

  if (id === 'gemini') {
    return parseExamples(await callGemini({ key, model, parts: [{ text: prompt }], temperature: 0.9 }));
  }

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 25000);
  try {
    const res = await fetch(p.url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model,
        temperature: 0.9,
        messages: [{ role: 'user', content: prompt }],
        ...(p.json ? { response_format: { type: 'json_object' } } : {}),
      }),
      signal: ctrl.signal,
    });
    if (!res.ok) throw await httpError(res);
    const data = await res.json();
    return parseExamples(data.choices?.[0]?.message?.content || '');
  } catch (e) {
    throw networkError(e);
  } finally {
    clearTimeout(timer);
  }
}
