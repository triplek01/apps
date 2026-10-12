# Focus Beat

A Windows Pomodoro app with 30 original generated focus tracks, adjustable stereo binaural tones, and gentle clock ticking during breaks. The interface uses a dark starry background, translucent purple panels, and lavender-to-peach controls.

## Listening

- Select a focus track or enable shuffle. Tracks rotate automatically while focusing, and a new track is selected for the next focus session.
- The 30 scores span soft piano, warm ambient, mellow lo-fi, glass and bells, soft strings, and gentle electronic styles. Each has its own melody, key, tempo, and arrangement, lasting roughly 3–5 minutes.
- Music and binaural volumes are independent. Use stereo headphones for binaural tones. Set binaural volume to zero for music alone.
- Short and long breaks play a soft clock tick once per second, with their own volume control and an off switch for complete silence. Breaks never play music or binaural tones.
- Pause and mute preserve the current track's playback position. Next-track and manual selection start the selected track from the beginning.
- All music is synthesized locally; no streaming services or downloaded recordings are used. Keep listening at a comfortable volume. Binaural tones are a sound preference, not a promised cognitive benefit.

## Develop

Node.js 22 or newer is recommended.

```sh
npm ci
npm run dev
```

For the desktop app:

```sh
npm run build
npm run desktop
```

## Windows downloads

```sh
npm run dist:win:portable
```

Extract the ZIP from `release/`, then launch `Focus Beat.exe`. Keep all extracted files together. For an installer, run `npm run dist:win` on Windows (or Linux with Wine). Builds are unsigned.

GitHub Actions publishes a Windows ZIP when a version tag is pushed. Do not push a release tag before the design has been reviewed.

## Validate

```sh
npm test
npm run build
```

Tests cover timer transitions, musical score validity and uniqueness, silent break arrangements, ordered playback, and shuffle without repeats. Default sessions are 25 minutes of focus, 5-minute breaks, and a 15-minute break after four focus sessions. The app must remain open for the timer to run. Settings, playlist order, and completed-session counts currently reset when the app closes.

The bundled Inter typeface is distributed under the SIL Open Font License; see `public/Inter-LICENSE.txt`.
