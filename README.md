# Focus Beat

A Windows Pomodoro app with 30 original generated focus tracks, adjustable stereo binaural tones, and gentle clock ticking during breaks. The interface uses slowly drifting purple waves, subtle star twinkles, translucent panels, and lavender-to-peach controls. The Animation on/off button remembers your preference across launches; system reduced-motion preferences stop all ambient animation.

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

Tests cover timer transitions, musical score validity and uniqueness, silent break arrangements, ordered playback, and shuffle without repeats. Default sessions are 25 minutes of focus, 5-minute breaks, and a 15-minute break after four focus sessions. The app must remain open for the timer to run. Settings, saved mixes, goals, and session history are saved locally. The running timer does not resume after the app closes; complete or end a session before closing to record its focused time. Tracking begins with this version.

The bundled Inter typeface is distributed under the SIL Open Font License; see `public/Inter-LICENSE.txt`.

## Offline studio and progress

Focus, Sound Studio, and Progress are separate sections; a session keeps running when you switch sections. Sound Studio mixes the 30-track playlist and binaural layer with locally generated rainfall, distant thunder, vinyl crackle, brown noise, and café hum. These are synthesized textures, not field recordings. Every layer has an independent volume and is turned off during breaks. Save named mixes or use a built-in starting point. Lo-fi and gentle synth tracks are included in the music selector.

Set an optional session goal and choose an adjustable pace preset (Ease in, Steady focus, Deep work, or Short sprint). At the end, give optional goal feedback. Skipping, resetting, and switching away from an unfinished focus session records partial timed focus without counting it as a completed session. Paused time is excluded. History stores the starting track and mix for each completed session. Progress shows timed focus, completion feedback, a weekly chart, favorite starting mix, and a best-rated starting hour only after at least three rated goals in that hour. These are personal patterns, not claims about productivity or causation.

Milestones have no streak penalty. Hide milestone cards from Sound Studio if desired. Complete a session to unlock Quiet ocean, or eight to unlock Peach sunrise. The sound-reactive glow is optional and respects animation and reduced-motion settings. Breaks retain optional ticking and silence, with optional breathing, stretch, eye-rest, and movement prompts.

Desktop data is stored in the application's user-data directory as `focus-beat-data.json`, independently of the extracted release folder. Writes are serialized and atomic, with the previous file retained as `.bak`. Browser development uses local storage. If reading fails, the original file is preserved and automatic saving pauses until a backup is restored. Export and restore JSON backups from Progress; restoring requires a confirmation before replacing current data. There are no accounts, telemetry, or remote services. Focus Together is not included.
