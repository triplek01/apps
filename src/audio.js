import { arrangement, frequency, stepDuration } from './music.mjs';

export class SessionAudio {
  async start(mode, volume, beat, binauralLevel = .35) {
    this.stop();
    const ctx = new AudioContext(); this.ctx = ctx;
    await ctx.resume();
    // A pause or session change may happen while audio permission is resolving.
    if (this.ctx !== ctx) { if (ctx.state !== 'closed') await ctx.close(); return; }
    const master = ctx.createGain(); master.gain.value = volume;
    const limiter = ctx.createDynamicsCompressor();
    limiter.threshold.value = -14; limiter.knee.value = 18; limiter.ratio.value = 4;
    master.connect(limiter); limiter.connect(ctx.destination); this.master = master;
    const music = ctx.createGain(); music.gain.value = .8; music.connect(master);
    const reverb = ctx.createConvolver();
    const impulse = ctx.createBuffer(2, Math.floor(ctx.sampleRate * 2.8), ctx.sampleRate);
    for (let channel = 0; channel < 2; channel++) {
      const data = impulse.getChannelData(channel);
      for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length) ** 3 * .5;
    }
    reverb.buffer = impulse;
    const wet = ctx.createGain(); wet.gain.value = mode === 'focus' ? .32 : .13;
    reverb.connect(wet); wet.connect(music);
    const melodyBus = ctx.createBiquadFilter(); melodyBus.type = 'lowpass'; melodyBus.frequency.value = mode === 'focus' ? 2600 : 6200;
    melodyBus.connect(music); melodyBus.connect(reverb);

    if (mode === 'focus') {
      // This stereo-only layer stays separate from the musical reverb.
      const merger = ctx.createChannelMerger(2); merger.connect(master);
      this.binaural = [];
      [160, 160 + beat].forEach((pitch, channel) => {
        const osc = ctx.createOscillator(); const gain = ctx.createGain();
        osc.frequency.value = pitch; gain.gain.value = binauralLevel * .055;
        osc.connect(gain); gain.connect(merger, 0, channel); osc.start(); this.binaural.push(gain);
      });
    }

    const noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const noiseData = noise.getChannelData(0);
    for (let i = 0; i < noiseData.length; i++) noiseData[i] = Math.random() * 2 - 1;
    const play = (event, time) => {
      if (event.instrument === 'kick') {
        const osc = ctx.createOscillator(); const gain = ctx.createGain();
        osc.frequency.setValueAtTime(130, time); osc.frequency.exponentialRampToValueAtTime(42, time + .15);
        gain.gain.setValueAtTime(.34, time); gain.gain.exponentialRampToValueAtTime(.0001, time + .22);
        osc.connect(gain); gain.connect(music); osc.start(time); osc.stop(time + .25);
        osc.onended = () => { osc.disconnect(); gain.disconnect(); }; return;
      }
      if (event.instrument === 'snare' || event.instrument === 'hat') {
        const source = ctx.createBufferSource(); source.buffer = noise;
        const filter = ctx.createBiquadFilter(); filter.type = 'highpass'; filter.frequency.value = event.instrument === 'hat' ? 7000 : 1800;
        const gain = ctx.createGain(); const duration = event.instrument === 'hat' ? .045 : .14;
        gain.gain.setValueAtTime(event.level || .105, time); gain.gain.exponentialRampToValueAtTime(.0001, time + duration);
        source.connect(filter); filter.connect(gain); gain.connect(music); source.start(time); source.stop(time + duration + .02);
        source.onended = () => { source.disconnect(); filter.disconnect(); gain.disconnect(); }; return;
      }
      event.notes.forEach((note, index) => {
        const envelope = ctx.createGain(); const pan = ctx.createStereoPanner();
        pan.pan.value = event.instrument === 'bass' ? 0 : (index % 2 ? .25 : -.25);
        envelope.connect(pan); pan.connect(melodyBus);
        const pad = event.instrument === 'pad'; const duration = event.duration;
        envelope.gain.setValueAtTime(.0001, time);
        envelope.gain.exponentialRampToValueAtTime(event.level, time + (pad ? Math.min(1.8, duration * .25) : .012));
        if (pad) envelope.gain.setValueAtTime(event.level, time + duration * .65);
        envelope.gain.exponentialRampToValueAtTime(.0001, time + duration);
        const harmonics = pad ? [1, 2] : event.instrument === 'bass' ? [1, 2] : [1, 2, 3];
        const oscillators = harmonics.map((harmonic, i) => {
          const osc = ctx.createOscillator(); const gain = ctx.createGain();
          osc.frequency.value = frequency(note) * harmonic;
          osc.detune.value = pad ? (i === 0 ? -3 : 3) : 0;
          gain.gain.value = [1, pad ? .15 : .23, .07][i];
          osc.connect(gain); gain.connect(envelope); osc.start(time); osc.stop(time + duration + .02);
          return { osc, gain };
        });
        oscillators[0].osc.onended = () => { oscillators.forEach(({osc, gain}) => { osc.disconnect(); gain.disconnect(); }); envelope.disconnect(); pan.disconnect(); };
      });
    };
    let step = 0; let next = ctx.currentTime + .08; const interval = stepDuration(mode);
    const schedule = () => {
      // Never queue a burst of old notes if the computer wakes from sleep.
      if (next < ctx.currentTime) { const skipped = Math.ceil((ctx.currentTime - next) / interval); step += skipped; next += skipped * interval; }
      while (next < ctx.currentTime + .2) {
        arrangement(mode, step).forEach(event => play(event, next)); step++; next += interval;
      }
    };
    schedule(); this.interval = setInterval(schedule, 50);
  }
  setVolume(volume) { if (this.master) this.master.gain.setTargetAtTime(volume, this.ctx.currentTime, .05); }
  setBinauralLevel(level) { this.binaural?.forEach(gain => gain.gain.setTargetAtTime(level * .055, this.ctx.currentTime, .1)); }
  stop() {
    clearInterval(this.interval); this.interval = null;
    const ctx = this.ctx; this.ctx = null; this.master = null; this.binaural = null;
    if (ctx && ctx.state !== 'closed') ctx.close().catch(() => {});
  }
}
