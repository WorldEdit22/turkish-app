// "More examples" via a free AI service. The key is stored only on this device.
//
// Gemini uses Google's own API; the others share the OpenAI-style chat API.

export const PROVIDERS = {
  gemini: {
    label: 'Google Gemini (recommended)',
    model: 'gemini-flash-latest',
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

async function httpError(res) {
  if (res.status === 429) return new AIError('The free daily limit is used up. Try again later or pick another provider in Settings.');
  if ([400, 401, 403, 404].includes(res.status)) {
    return new AIError(`The AI service did not accept the key or model (error ${res.status}). Check Settings.`);
  }
  return new AIError(`The AI service had a problem (error ${res.status}). Try again later.`);
}

export async function generate(settings, prompt) {
  const id = settings.provider;
  const p = PROVIDERS[id];
  const key = settings.keys?.[id];
  if (!p || !key) throw new AIError('Add a free AI key in Settings to get more examples.');
  const model = settings.models?.[id] || p.model;

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 25000);
  try {
    let text;
    if (id === 'gemini') {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: 'application/json', temperature: 0.9 },
          }),
          signal: ctrl.signal,
        },
      );
      if (!res.ok) throw await httpError(res);
      const data = await res.json();
      text = (data.candidates?.[0]?.content?.parts || []).map((x) => x.text || '').join('');
    } else {
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
      text = data.choices?.[0]?.message?.content || '';
    }
    return parseExamples(text);
  } catch (e) {
    if (e instanceof AIError) throw e;
    if (e.name === 'AbortError') throw new AIError('The AI took too long to answer. Try again.');
    throw new AIError(navigator.onLine === false ? "You're offline. Built-in examples still work." : 'Could not reach the AI service.');
  } finally {
    clearTimeout(timer);
  }
}
