// Turkish ⇄ English through Google Translate's free web endpoint (no key, no AI).
// The endpoint is unofficial: if it ever stops working, MyMemory is the planned backup.

export const MAX_CHARS = 1000;
export const OFFLINE = 'No connection. Translating needs the internet.';
export const FAILED = "Couldn't translate right now. Try again, or open Google Translate below.";

export class TranslateError extends Error {}

export const other = (lang) => (lang === 'tr' ? 'en' : 'tr');

export const translateUrl = (text, from) =>
  `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${from}&tl=${other(from)}&dt=t&q=${encodeURIComponent(text)}`;

export const googleLink = (text, from) =>
  `https://translate.google.com/?sl=${from}&tl=${other(from)}&text=${encodeURIComponent(text)}&op=translate`;

// Swap the direction, like Google Translate: the translation becomes the new text, but only
// when it is the translation of the text in the box and is on screen (no error showing).
// Otherwise the typed text stays. state = { text, from, result, resultFor, error }.
export function swapState({ text, from, result, resultFor, error }) {
  const current = Boolean(result) && !error && resultFor.trim() === text.trim();
  return { text: current ? result : text, from: other(from), result: '', resultFor: '', error: null };
}

// The reply's first item lists the translated segments; each segment starts with its text.
export function parseTranslation(json) {
  const segments = Array.isArray(json) ? json[0] : null;
  if (!Array.isArray(segments)) throw new TranslateError(FAILED);
  return segments
    .filter((s) => Array.isArray(s) && typeof s[0] === 'string')
    .map((s) => s[0])
    .join('');
}

export async function translate(text, from) {
  const q = text.trim().slice(0, MAX_CHARS);
  if (!q) return '';
  let res;
  try {
    res = await fetch(translateUrl(q, from));
  } catch {
    throw new TranslateError(globalThis.navigator?.onLine === false ? OFFLINE : FAILED);
  }
  if (!res.ok) throw new TranslateError(FAILED);
  let json;
  try {
    json = await res.json();
  } catch {
    throw new TranslateError(FAILED);
  }
  return parseTranslation(json);
}
