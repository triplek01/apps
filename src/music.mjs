const major = [0, 2, 4, 5, 7, 9, 11];
const minor = [0, 2, 3, 5, 7, 8, 10];
const progressions = [
  [0, 5, 3, 4, 0, 2, 3, 4], [0, 3, 5, 4, 2, 5, 3, 0],
  [5, 3, 0, 4, 5, 2, 3, 4], [0, 2, 3, 5, 0, 4, 3, 0],
  [0, 4, 5, 3, 2, 5, 4, 0],
];
const rhythms = {
  piano: [0, 3, 6, 8, 11, 14], ambient: [0, 6, 10, 14],
  lofi: [0, 3, 5, 8, 10, 13, 15], bells: [0, 4, 7, 10, 14],
  strings: [0, 4, 8, 12], electronic: [0, 2, 5, 8, 10, 12, 15],
};
const families = { piano: 'Soft piano', ambient: 'Warm ambient', lofi: 'Mellow lo-fi', bells: 'Glass & bells', strings: 'Soft strings', electronic: 'Gentle electronic' };
// Each score has its own motif, key, tempo, harmony order, and instrumentation.
const scores = [
  ['First Light','piano',48,66,0,false,[0,2,4,3,1,2,0,-1]],
  ['Paper Lanterns','piano',50,70,1,false,[2,4,5,4,2,1,0,2]],
  ['Quiet Window','piano',53,62,2,false,[4,3,2,0,1,3,2,0]],
  ['Slow Sunday','piano',55,64,3,false,[0,1,3,2,4,2,1,0]],
  ['Evening Pages','piano',45,68,4,true,[0,2,3,5,4,2,1,0]],
  ['Velvet Sky','ambient',48,58,2,false,[0,4,3,2,5,4,2,0]],
  ['Driftwood','ambient',50,60,3,true,[2,0,3,4,2,1,0,-1]],
  ['Blue Horizon','ambient',53,64,4,false,[0,3,4,6,4,3,1,0]],
  ['Moon Garden','ambient',45,56,0,true,[4,2,3,1,0,2,1,0]],
  ['Cloud Atlas','ambient',55,62,1,false,[0,2,5,4,6,3,2,0]],
  ['Desk by the Rain','lofi',48,74,1,false,[2,0,2,4,3,1,2,0]],
  ['Midnight Notes','lofi',45,72,2,true,[0,3,2,4,5,3,1,0]],
  ['Coffee & Chapters','lofi',53,78,3,false,[4,2,1,3,2,0,1,2]],
  ['City in Soft Focus','lofi',50,76,4,true,[1,3,4,2,0,2,3,1]],
  ['Golden Hour','lofi',55,70,0,false,[0,4,2,5,3,4,1,0]],
  ['Small Constellations','bells',48,64,3,false,[0,4,6,3,5,2,4,0]],
  ['Crystal Lake','bells',53,60,4,false,[2,5,4,6,3,1,2,0]],
  ['Firefly Path','bells',50,68,0,false,[0,3,5,2,4,1,3,0]],
  ['Silver Morning','bells',55,66,1,false,[4,6,5,3,2,4,1,0]],
  ['Distant Stars','bells',45,58,2,true,[0,5,3,6,4,2,1,0]],
  ['Still Water','strings',48,60,4,false,[0,2,3,4,3,1,2,0]],
  ['Moss & Fern','strings',50,58,0,true,[2,3,1,0,4,3,2,0]],
  ['Open Fields','strings',53,64,1,false,[0,3,2,5,4,6,3,0]],
  ['Deep Blue','strings',45,56,2,true,[4,3,5,2,1,0,2,0]],
  ['After the Storm','strings',55,62,3,false,[0,1,2,4,5,3,2,0]],
  ['Soft Circuit','electronic',48,76,0,false,[0,2,1,4,3,5,2,0]],
  ['Neon Dusk','electronic',50,80,1,true,[2,4,3,1,5,2,0,1]],
  ['Satellite Dreams','electronic',53,72,2,false,[0,5,2,4,6,3,1,0]],
  ['Gentle Current','electronic',55,78,3,false,[1,2,4,3,0,5,2,0]],
  ['Orbit Home','electronic',45,74,4,true,[0,3,1,5,2,4,1,0]],
];
export const TRACKS = scores.map(([title, style, root, bpm, progression, isMinor, motif], id) => ({
  id, title, style, family: families[style], root, bpm, progression: progressions[progression],
  scale: isMinor ? minor : major, motif, totalSteps: 512,
  duration: 512 * 60 / bpm / 2,
}));
export function frequency(midi) { return 440 * 2 ** ((midi - 69) / 12); }
export function stepDuration(mode, trackId = 0) { return 60 / TRACKS[trackId].bpm / 2; }
function pitch(track, degree) {
  const octave = Math.floor(degree / 7); const index = ((degree % 7) + 7) % 7;
  return track.root + track.scale[index] + 12 * octave;
}
export function arrangement(mode, step, trackId = 0) {
  if (mode !== 'focus') return [];
  const track = TRACKS[trackId];
  const phrase = Math.floor(step / 16); const position = step % 16;
  const section = Math.floor(step / 128) % 4;
  const chordDegree = track.progression[phrase % 8];
  const chord = [0, 2, 4, 6].map(degree => pitch(track, chordDegree + degree));
  const events = []; const interval = stepDuration(mode, trackId);
  if (position === 0) events.push({ instrument: 'pad', notes: chord, duration: interval * 19, level: track.style === 'ambient' ? .043 : .025 });
  const rhythm = rhythms[track.style]; const index = rhythm.indexOf(position);
  if (index >= 0) {
    const motifIndex = (index + (phrase % 4) * 2) % track.motif.length;
    const degree = track.motif[motifIndex] + chordDegree + (section === 2 ? 0 : 7);
    const instrument = { piano: 'piano', ambient: 'keys', lofi: 'keys', bells: 'bell', strings: 'strings', electronic: 'pluck' }[track.style];
    events.push({ instrument, notes: [pitch(track, degree)], duration: interval * (track.style === 'strings' ? 7 : track.style === 'bells' ? 6 : 4), level: track.style === 'strings' ? .065 : .105, pan: index % 2 ? .2 : -.2 });
  }
  if (track.style === 'lofi' || track.style === 'electronic') {
    if (position % 4 === 0) events.push({ instrument: 'bass', notes: [pitch(track, chordDegree - 7)], duration: interval * 1.5, level: .065 });
    if (position === 0 || position === 8) events.push({ instrument: 'kick', level: .065 });
    if (track.style === 'electronic' && position % 4 === 2) events.push({ instrument: 'pluck', notes: [chord[(position / 2) % 4] + 12], duration: interval * 1.2, level: .025, pan: .3 });
  }
  return events;
}
