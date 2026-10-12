# Focus Beat

A Windows Pomodoro app with 120 original generated tracks, adjustable stereo binaural tones, and gentle clock ticking during breaks. The interface uses slowly drifting purple waves, subtle star twinkles, translucent panels, and lavender-to-peach controls. The Animation on/off button remembers your preference across launches; Follow system honors reduced-motion preferences, while an explicit On choice enables animation. Wave shapes now morph continuously as well as drifting.

## Listening

- Select a focus track or enable shuffle. Tracks rotate automatically while focusing, and a new track is selected for the next focus session.
- The 120 scores span soft piano, warm ambient, mellow lo-fi, glass and bells, soft strings, and gentle electronic styles. Each has its own melody, key, tempo, and arrangement, lasting roughly 2–5 minutes.
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

Focus, Sound Studio, Tasks, and Progress are separate sections; a session keeps running when you switch sections. Sound Studio mixes the 120-track library and binaural layer with locally generated rainfall, distant thunder, vinyl crackle, brown noise, and café hum. These are synthesized textures, not field recordings. Every layer has an independent volume and is turned off during breaks. Save named mixes or choose one of five distinct built-in mixes for your activity (20 total). Lo-fi and gentle synth tracks are included in the music selector.

Tasks provides a saved checklist for each activity: add, edit, check/uncheck, delete, and filter tasks. Choose Focus on this to use a task as your optional session goal. Pace adjustment has been removed; edit session lengths directly instead. At the end, give optional goal feedback. Skipping, resetting, and switching away from an unfinished focus session records partial timed focus without counting it as a completed session. Paused time is excluded. History stores the track and mix selected when each session ends. Progress shows timed focus, completion feedback, a weekly chart, favorite mix, and a best-rated starting hour only after at least three rated goals in that hour. These are personal patterns, not claims about productivity or causation.

Milestones have no streak penalty. Hide milestone cards from Sound Studio if desired. Complete a session to unlock Quiet ocean, or eight to unlock Peach sunrise. The sound-reactive glow is optional and respects animation and reduced-motion settings. Breaks retain optional ticking and silence, with optional breathing, stretch, eye-rest, and movement prompts.

Desktop data is stored in the application's user-data directory as `focus-beat-data.json`, independently of the extracted release folder. Writes are serialized and atomic, with the previous file retained as `.bak`. Browser development uses local storage. If reading fails, the original file is preserved and automatic saving pauses until a backup is restored. Export and restore JSON backups from Progress; restoring requires a confirmation before replacing current data. There are no accounts, telemetry, or remote services. Focus Together is not included.

## Activity profiles (version 3)

Every launch begins with an activity chooser. Study starts at 50 minutes with 10-minute breaks and a blue/lavender lo-fi atmosphere; Work at 25/5 with a teal theme and ambient noise; Chores at 15/5 with a warm gold theme and upbeat electronic music; Creative at 60 minutes with a rose theme and relaxing soundscapes. Creative disables automatic breaks by default: completion records the session and stops the timer, ready for another session. Enable Automatic breaks for 10-minute breaks, or start a break manually.

Each profile remembers its own timer, audio, theme, and animation preferences. Change activity ends the current timer and records partial focus. Reset profile restores its defaults without deleting history or saved mixes. Activity playlists stay within their suggested musical styles; Sound Studio also lets you manually choose any of the 120 tracks. The original 30 track IDs remain unchanged. Progress can filter history and statistics by activity; older sessions appear as General focus. All 20 milestones use overall history, with progress indicators and earned/upcoming filters.

Profile themes animate by default. Animation On explicitly enables visibly morphing waves even if Windows requests reduced motion; Off stops movement; Follow system respects the operating-system setting. Saved On/Off choices remain specific to each activity.

Data schema version 2 preserves version-one settings, sessions, and mixes during migration. Version-one backups can still be restored. Older app versions will not automatically overwrite the newer data format.
