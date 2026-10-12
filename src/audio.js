import { arrangement, frequency, stepDuration, TRACKS } from './music.mjs';
const voices = {
  pad: { harmonics: [1,2], levels: [1,.14], attack: 1.4, sustain: true },
  piano: { harmonics: [1,2,3], levels: [1,.22,.06], attack: .014 },
  keys: { harmonics: [1,2,3], levels: [1,.16,.04], attack: .035 },
  bell: { harmonics: [1,2,4], levels: [1,.18,.04], attack: .012 },
  strings: { harmonics: [1,2,3,4], levels: [1,.22,.1,.035], attack: .6, sustain: true },
  pluck: { harmonics: [1,2,3], levels: [1,.25,.08], attack: .008 },
  bass: { harmonics: [1,2], levels: [1,.15], attack: .025 },
};
export class SessionAudio {
  async start(mode, musicVolume, beat, binauralLevel = .35, trackId = 0, onEnd = () => {}, offset = 0) {
    this.stop();
    // Breaks create no audio context, oscillators, or playback scheduler.
    if (mode !== 'focus') return;
    const track = TRACKS[trackId];
    const ctx = new AudioContext(); this.ctx = ctx; this.offset = offset;
    await ctx.resume();
    if (this.ctx !== ctx) { if (ctx.state !== 'closed') await ctx.close(); return; }
    const limiter = ctx.createDynamicsCompressor(); limiter.threshold.value = -14; limiter.knee.value = 18; limiter.ratio.value = 4; limiter.connect(ctx.destination);
    const music = ctx.createGain(); music.gain.value = musicVolume * .8; music.connect(limiter); this.music = music;
    const reverb = ctx.createConvolver();
    const impulse = ctx.createBuffer(2, Math.floor(ctx.sampleRate * 2.5), ctx.sampleRate);
    for (let channel = 0; channel < 2; channel++) {
      const data = impulse.getChannelData(channel);
      for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length) ** 3 * .5;
    }
    reverb.buffer = impulse;
    const wet = ctx.createGain(); wet.gain.value = track.style === 'ambient' ? .38 : .23;
    reverb.connect(wet); wet.connect(music);
    const melodyBus = ctx.createBiquadFilter(); melodyBus.type = 'lowpass'; melodyBus.frequency.value = track.style === 'bells' ? 3500 : track.style === 'lofi' ? 1800 : 2600;
    melodyBus.connect(music); melodyBus.connect(reverb);
    const merger = ctx.createChannelMerger(2); merger.connect(limiter); this.binaural = [];
    [160, 160 + beat].forEach((pitch, channel) => {
      const osc = ctx.createOscillator(); const gain = ctx.createGain();
      osc.frequency.value = pitch; gain.gain.value = binauralLevel * .055;
      osc.connect(gain); gain.connect(merger, 0, channel); osc.start(); this.binaural.push(gain);
    });
    const play = (event, time) => {
      if (event.instrument === 'kick') {
        const osc = ctx.createOscillator(); const gain = ctx.createGain();
        osc.frequency.setValueAtTime(100, time); osc.frequency.exponentialRampToValueAtTime(42, time + .15);
        gain.gain.setValueAtTime(event.level, time); gain.gain.exponentialRampToValueAtTime(.0001, time + .22);
        osc.connect(gain); gain.connect(music); osc.start(time); osc.stop(time + .25);
        osc.onended = () => { osc.disconnect(); gain.disconnect(); }; return;
      }
      const voice = voices[event.instrument];
      event.notes.forEach((note, index) => {
        const envelope = ctx.createGain(); const pan = ctx.createStereoPanner();
        pan.pan.value = event.instrument === 'bass' ? 0 : (event.pan ?? (index % 2 ? .25 : -.25));
        envelope.connect(pan); pan.connect(melodyBus);
        const duration = event.duration;
        envelope.gain.setValueAtTime(.0001, time);
        envelope.gain.exponentialRampToValueAtTime(event.level, time + Math.min(voice.attack, duration * .25));
        if (voice.sustain) envelope.gain.setValueAtTime(event.level, time + duration * .65);
        envelope.gain.exponentialRampToValueAtTime(.0001, time + duration);
        const oscillators = voice.harmonics.map((harmonic, i) => {
          const osc = ctx.createOscillator(); const gain = ctx.createGain();
          osc.frequency.value = frequency(note) * harmonic;
          osc.detune.value = event.instrument === 'pad' ? (i === 0 ? -3 : 3) : 0;
          gain.gain.value = voice.levels[i]; osc.connect(gain); gain.connect(envelope);
          osc.start(time); osc.stop(time + duration + .02); return { osc, gain };
        });
        oscillators[0].osc.onended = () => { oscillators.forEach(({osc,gain}) => { osc.disconnect(); gain.disconnect(); }); envelope.disconnect(); pan.disconnect(); };
      });
    };
    const interval = stepDuration(mode, trackId); let step = Math.floor(offset / interval); let next = ctx.currentTime + .08;
    if (step % 16) arrangement(mode, step - step % 16, trackId).filter(e => e.instrument === 'pad').forEach(e => play(e, next));
    const endTime = ctx.currentTime + Math.max(0, track.duration - offset);
    let ended = false;
    const schedule = () => {
      if (ctx.currentTime >= endTime && !ended) { ended = true; clearInterval(this.interval); onEnd(); return; }
      if (next < ctx.currentTime) { const skipped = Math.ceil((ctx.currentTime - next) / interval); step += skipped; next += skipped * interval; }
      while (next < ctx.currentTime + .2 && step < track.totalSteps) { arrangement(mode, step, trackId).forEach(event => play(event, next)); step++; next += interval; }
    };
    schedule(); this.interval = setInterval(schedule, 50);
  }
  getPosition() { return this.ctx ? this.offset + this.ctx.currentTime : 0; }
  setVolume(volume) { if (this.music) this.music.gain.setTargetAtTime(volume * .8, this.ctx.currentTime, .05); }
  setBinauralLevel(level) { this.binaural?.forEach(gain => gain.gain.setTargetAtTime(level * .055, this.ctx.currentTime, .1)); }
  stop() {
    clearInterval(this.interval); this.interval = null;
    const ctx = this.ctx; this.ctx = null; this.music = null; this.binaural = null;
    if (ctx && ctx.state !== 'closed') ctx.close().catch(() => {});
  }
}
