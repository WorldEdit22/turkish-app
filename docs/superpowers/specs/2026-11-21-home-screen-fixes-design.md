# Auto-reload, honest sound hint, top row clear of the blur in the home-screen app — design

Agreed in conversation on 2026-11-21. Items marked *(my call)* were filled in by Claude and can still be changed.

## Why

The user tested the previous update on their iPhone:

- **Sound:** the speaker is still silent in silent mode. Both fixes from the last round were tried on the real phone and
  neither helped: the playback audio session and the silent clip. Safari's built-in voice evidently follows the silent
  switch there. The user chose option A: keep the iPhone voice and say so clearly.
- **Blur:** the gear is still blurred. A screenshot shows the user runs the app from the **home screen**: there is no
  Safari interface, and the top row sits exactly where the home-screen layout puts it (the 47 pt status bar plus 10 px).
  The previous fix skipped the home-screen app on purpose, so nothing changed there. In the screenshot the blur reaches
  from the top of the screen to about the bottom of the TR and gear buttons, roughly 90 pt down.
- **Updates:** each update needs the app opened twice, because the offline copy shows the old version while the new
  one downloads. The user asked for the app to reload itself once a new version is ready.

## Decisions

**Auto-reload**
- When a new version has been installed and takes over an open page, the page reloads once, so the new version shows
  straight away.
- No reload on the very first install, when no earlier version was in control.

**Sound (option A)**
- On iPhone and iPad, the first speaker tap after each app launch shows a toast for about 3 s: **No sound? Turn off
  silent mode**. *(my call: once per launch, not once ever, because the user may forget the switch on a later day)*
- The silent clip and the playback audio-session setting are removed. They did nothing on the user's phone, and the
  playback setting can pause the user's music. *(my call)*
- The Settings line "No sound? Silent mode mutes it on iPhone." stays.

**Top row**
- The home-screen app gets the same extra room above the top row as a Safari tab: padding-top
  `env(safe-area-inset-top) + 10px + --top-clear`, with `--top-clear` raised from 30 px to 40 px. On the user's iPhone
  the gear will then start about 97 pt from the top, below the blurred strip. *(my call: 40 px, read from the
  screenshot, still one value to tune)*
- The `standalone` class, which only existed to skip the home-screen app, is removed.

**Housekeeping**
- Offline cache version goes up to `turkish-v7`.

## Approaches considered (top row in the home-screen app)

1. **More room above the top row (picked):** works without reinstalling. It costs about 40 pt of extra turquoise at the
   top of the screen.
2. Opaque status bar (`apple-mobile-web-app-status-bar-style: default`): reported to keep iOS 26 from blurring the page
   at all. But it only takes effect after the app is removed from the home screen and added again, which also deletes
   its saved progress unless a backup is restored. The status bar would also be white or black instead of turquoise.

## Approaches considered (sound)

Chosen by the user: A, a clear hint. Not chosen: B, Gemini's voice when an AI key is set (needs internet, slower, limited
free tier); C, pre-recorded audio for words and hand-written examples (several MB more, and generated sentences would
still use the iPhone voice).

## Not in this change

- This update itself still needs the app opened twice, because the auto-reload only works once this version is
  running.
