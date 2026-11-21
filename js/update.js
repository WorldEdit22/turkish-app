// When a new version of the app has been installed, its service worker takes
// over the open page ('controllerchange'). Reload once so the new version shows
// straight away instead of on the next launch. On the very first install there
// was no earlier version in control, so there is nothing to refresh.

export function reloadOnUpdate(container, reload) {
  if (!container.controller) return;
  let done = false;
  container.addEventListener('controllerchange', () => {
    if (done) return;
    done = true;
    reload();
  });
}
