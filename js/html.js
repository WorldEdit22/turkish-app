// Small HTML helpers shared by the app's views.

export const esc = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

export const SPEAKER =
  '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9H4z"/><path d="M16.5 8.5a5 5 0 0 1 0 7"/><path d="M19 6a8.5 8.5 0 0 1 0 12"/></svg>';

// Chat bubble: opens the translator.
export const BUBBLE =
  '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5.5h16v11H10l-4.5 3.5v-3.5H4z"/><path d="M8 9.5h8"/><path d="M8 12.5h5"/></svg>';

// An open book: opens the grammar book.
export const BOOK =
  '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 6.5C10.3 5.2 7.6 4.7 3.5 5v13c4.1-.3 6.8.2 8.5 1.5"/><path d="M12 6.5c1.7-1.3 4.4-1.8 8.5-1.5v13c-4.1-.3-6.8.2-8.5 1.5z"/><path d="M12 6.5v13"/></svg>';

// A question mark in a circle: opens the help.
export const QUESTION =
  '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.6 2.2c-.7.4-1.1.9-1.1 1.8"/><path d="M12 16.8v.01"/></svg>';

export const TRASH =
  '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16"/><path d="M9 7V4h6v3"/><path d="M6 7l1 13h10l1-13"/></svg>';
