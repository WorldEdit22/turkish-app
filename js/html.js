// Small HTML helpers shared by the app's views.

export const esc = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

export const SPEAKER =
  '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9H4z"/><path d="M16.5 8.5a5 5 0 0 1 0 7"/><path d="M19 6a8.5 8.5 0 0 1 0 12"/></svg>';

// Chat bubble: opens the translator.
export const BUBBLE =
  '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5.5h16v11H10l-4.5 3.5v-3.5H4z"/><path d="M8 9.5h8"/><path d="M8 12.5h5"/></svg>';

// "Aa": opens the alphabet.
export const ABC =
  '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2.5 19L7.5 5l5 14"/><path d="M4.4 14h6.2"/><circle cx="17.5" cy="15.5" r="3.3"/><path d="M20.8 11.5V19"/></svg>';

export const TRASH =
  '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16"/><path d="M9 7V4h6v3"/><path d="M6 7l1 13h10l1-13"/></svg>';
