# Focus Beat

A Windows desktop Pomodoro timer with synthesized binaural focus tones and an energetic break loop. Use stereo headphones for binaural audio and a comfortable listening volume. The tones are a sound preference, not a promised cognitive benefit.

## Develop

Node.js 22 or newer is recommended.

```sh
npm ci
npm run dev
```

The Vite server supports browser development. For the desktop application:

```sh
npm run build
npm run desktop
```

## Windows installer

Run on Windows:

```sh
npm ci
npm run dist:win
```

The NSIS installer is written to `release/`. This initial build is unsigned; public distribution will need a Windows signing certificate.

## Validate

```sh
npm test
npm run build
```

Default sessions are 25 minutes of focus, 5 minutes of rest, and a 15-minute break after four focus sessions. Sessions advance automatically while running. Pause stops audio; reset restarts the current session. The app must stay open for the timer to run. Settings and completed-session counts currently reset when the app closes.

For a portable Windows ZIP, run `npm run dist:win:portable`, extract the archive from `release/`, and launch `Focus Beat.exe`. The NSIS installer requires Windows or Wine when cross-compiling on Linux.
