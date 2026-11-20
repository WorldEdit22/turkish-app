// A tiny clip of silence. Playing it through an <audio> element just before
// speaking puts iOS into media playback, which the silent switch does not mute,
// so the Turkish voice is heard through the speaker in silent mode too.

// 8-bit mono PCM WAV of `ms` milliseconds of silence (sample value 128).
export function silentWav(ms = 50, rate = 8000) {
  const n = Math.round((rate * ms) / 1000);
  const b = new Uint8Array(44 + n);
  const view = new DataView(b.buffer);
  const text = (at, s) => [...s].forEach((c, i) => (b[at + i] = c.charCodeAt(0)));
  text(0, 'RIFF');
  view.setUint32(4, 36 + n, true);
  text(8, 'WAVE');
  text(12, 'fmt ');
  view.setUint32(16, 16, true); // fmt chunk size
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, 1, true); // mono
  view.setUint32(24, rate, true);
  view.setUint32(28, rate, true); // byte rate = rate × 1 byte
  view.setUint16(32, 1, true); // block align
  view.setUint16(34, 8, true); // bits per sample
  text(36, 'data');
  view.setUint32(40, n, true);
  b.fill(128, 44);
  return b;
}
