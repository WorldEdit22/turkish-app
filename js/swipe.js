// Horizontal swipe on any element that `find(event)` returns.
//
// The direction is decided once the finger has moved `lock` px: mostly sideways
// means a swipe, mostly up/down means the user is scrolling and the gesture is
// dropped. Releasing at least `threshold` px sideways calls `onSwipe(el, dir)`.
// `onDrag(el, dx)` lets the caller move the block with the finger, `onEnd(el)`
// lets it reset. A browser may still send a click after a swipe;
// `consumeClick()` tells the caller to ignore it.

export function swipe(target, { find, onSwipe, onDrag = () => {}, onEnd = () => {}, threshold = 60, lock = 10 }) {
  let el = null;
  let start = null;
  let mode = null; // null = undecided, 'h' = swiping, 'v' = scrolling
  let swiped = false;

  const reset = () => {
    el = null;
    start = null;
    mode = null;
  };

  target.addEventListener('pointerdown', (e) => {
    reset();
    swiped = false;
    el = find(e);
    if (el) start = { x: e.clientX, y: e.clientY };
  });

  target.addEventListener('pointermove', (e) => {
    if (!start || mode === 'v') return;
    const dx = e.clientX - start.x;
    const dy = e.clientY - start.y;
    if (!mode) {
      if (Math.abs(dx) > lock && Math.abs(dx) > Math.abs(dy)) mode = 'h';
      else if (Math.abs(dy) > lock) mode = 'v';
      else return;
    }
    if (mode === 'h') onDrag(el, dx);
  });

  target.addEventListener('pointerup', (e) => {
    if (mode === 'h') {
      const dx = e.clientX - start.x;
      if (Math.abs(dx) >= threshold) {
        swiped = true;
        onSwipe(el, dx > 0 ? 'right' : 'left');
      }
      onEnd(el);
    }
    reset();
  });

  target.addEventListener('pointercancel', () => {
    if (mode === 'h') onEnd(el);
    reset();
  });

  return {
    consumeClick() {
      const was = swiped;
      swiped = false;
      return was;
    },
  };
}
