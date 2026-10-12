// Original arrangements: mellow ambient keys for focus, instrumental pop for breaks.
// MIDI pitches keep chords, melody, and bass in the same key.
const chords = [
  [48, 55, 59, 64], [45, 52, 55, 60], [41, 48, 52, 57], [43, 50, 55, 59],
  [48, 55, 59, 62], [45, 52, 57, 60], [41, 48, 55, 57], [43, 50, 57, 59],
];
const focusMelodies = [
  [76, null, 79, null, 83, null, 79, null, 74, null, 76, null, 71, null, null, null],
  [72, null, 76, null, 79, null, 76, null, 69, null, 72, null, 76, null, null, null],
  [69, null, 72, null, 76, null, 79, null, 76, null, 72, null, 67, null, null, null],
  [71, null, 74, null, 79, null, 81, null, 79, null, 74, null, 71, null, null, null],
];
const breakMelodies = [
  [72, null, 76, 79, null, 76, 74, null, 72, 76, 79, null, 83, 79, 76, null],
  [69, null, 72, 76, null, 79, 76, null, 72, 76, 81, null, 79, 76, 72, null],
  [69, null, 72, 77, null, 76, 72, null, 69, 72, 76, null, 79, 76, 72, null],
  [71, null, 74, 79, null, 81, 79, null, 74, 79, 83, null, 81, 79, 74, null],
];
export function frequency(midi) { return 440 * 2 ** ((midi - 69) / 12); }
export function arrangement(mode, step) {
  const focus = mode === 'focus';
  const bar = Math.floor(step / 8); const beat = step % 8;
  const chord = chords[bar % chords.length];
  const events = [];
  if (focus) {
    // Each harmony and melodic phrase spans two bars, with space to breathe.
    const phrase = Math.floor(step / 16);
    if (step % 16 === 0) events.push({ instrument: 'pad', notes: chords[phrase % chords.length], duration: 13, level: .035 });
    const note = focusMelodies[phrase % 4][step % 16];
    if (note !== null) events.push({ instrument: 'keys', notes: [note - (phrase % 8 >= 4 ? 12 : 0)], duration: 3.8, level: .12 });
  } else {
    if (beat === 0) events.push({ instrument: 'pad', notes: chord, duration: 2, level: .018 });
    if (beat % 2 === 0) events.push({ instrument: 'guitar', notes: chord.map(n => n + 12), duration: .38, level: beat === 0 ? .036 : .025 });
    if ([0, 3, 4, 6].includes(beat)) events.push({ instrument: 'bass', notes: [chord[0] - 12 + (beat === 6 ? 7 : 0)], duration: .34, level: .2 });
    const note = breakMelodies[bar % 4][(bar % 2) * 8 + beat];
    if (note !== null) events.push({ instrument: 'keys', notes: [note], duration: .75, level: .11 });
    if (beat === 0 || beat === 4) events.push({ instrument: 'kick' });
    if (beat === 2 || beat === 6) events.push({ instrument: 'snare' });
    events.push({ instrument: 'hat', level: beat % 2 ? .028 : .045 });
  }
  return events;
}
export function stepDuration(mode) { return 60 / (mode === 'focus' ? 68 : 112) / 2; }
