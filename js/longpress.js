// Press-and-hold on any element that `find(event)` returns.
// Fires `onLongPress(el)` after `delay` ms unless the finger lifts or moves more
// than `tolerance` px (so scrolling never counts). After a long press the
// browser still sends a click on release; `consumeClick()` tells the caller to
// ignore it.

export function longPress(target, { find, onLongPress, delay = 500, tolerance = 10 }) {
  let timer = null;
  let start = null;
  let fired = false;

  const cancel = () => {
    clearTimeout(timer);
    timer = null;
    start = null;
  };

  target.addEventListener('pointerdown', (e) => {
    cancel();
    fired = false;
    const el = find(e);
    if (!el) return;
    start = { x: e.clientX, y: e.clientY };
    timer = setTimeout(() => {
      timer = null;
      fired = true;
      onLongPress(el);
    }, delay);
  });

  target.addEventListener('pointermove', (e) => {
    if (!start) return;
    if (Math.hypot(e.clientX - start.x, e.clientY - start.y) > tolerance) cancel();
  });

  target.addEventListener('pointerup', cancel);
  target.addEventListener('pointercancel', cancel);

  // Stop the iPhone "copy / look up" menu from appearing on a held block.
  target.addEventListener('contextmenu', (e) => {
    if (find(e)) e.preventDefault();
  });

  return {
    consumeClick() {
      const was = fired;
      fired = false;
      return was;
    },
  };
}
