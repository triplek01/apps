// Locally generated sound layers; no network or external audio files.
export function createSoundscape(ctx, destination) {
  const gains = {};
  const buffer = (seconds, generate) => {
    const result = ctx.createBuffer(2, Math.floor(ctx.sampleRate * seconds), ctx.sampleRate);
    for (let channel = 0; channel < 2; channel++) {
      const data = result.getChannelData(channel); let previous = 0;
      for (let i = 0; i < data.length; i++) { const value = generate(i, previous, channel); data[i] = value; previous = value; }
    }
    return result;
  };
  const loop = (data, gain, type, frequency) => {
    const source = ctx.createBufferSource(); source.buffer = data; source.loop = true;
    if (type) { const filter = ctx.createBiquadFilter(); filter.type = type; filter.frequency.value = frequency; source.connect(filter); filter.connect(gain); }
    else source.connect(gain);
    source.start();
  };
  function add(name) {
    const gain = ctx.createGain(); gain.gain.value = 0; gain.connect(destination); gains[name] = gain;
    const noise = () => Math.random() * 2 - 1;
    if (name === 'brown') loop(buffer(8, (_i, previous) => (previous + noise() * .018) / 1.018), gain);
    if (name === 'rain') loop(buffer(12, i => noise() * .2 * (.8 + .2 * Math.sin(i / ctx.sampleRate * .6))), gain, 'lowpass', 4500);
    if (name === 'vinyl') loop(buffer(11, () => Math.random() < .001 ? noise() * .25 : noise() * .008), gain, 'lowpass', 3800);
    if (name === 'thunder') {
      // Smooth rumble swells, separated by quiet passages; never a loud thunderclap.
      loop(buffer(24, (i, previous) => {
        const time = i / ctx.sampleRate; const swell = Math.sin(Math.PI * Math.max(0, 1 - Math.abs(time - 7) / 4)) ** 2 + Math.sin(Math.PI * Math.max(0, 1 - Math.abs(time - 18) / 5)) ** 2;
        return previous * .95 + noise() * .018 * swell;
      }), gain, 'lowpass', 240);
    }
    if (name === 'cafe') {
      loop(buffer(14, () => noise() * .08), gain, 'bandpass', 650);
      [190,260,340,440].forEach((frequency,index) => {
        const voice = ctx.createOscillator(); const envelope = ctx.createGain(); const lfo = ctx.createOscillator(); const depth = ctx.createGain();
        voice.type = 'triangle'; voice.frequency.value = frequency; envelope.gain.value = .009;
        lfo.frequency.value = .4 + index * .17; depth.gain.value = .007;
        lfo.connect(depth); depth.connect(envelope.gain); voice.connect(envelope); envelope.connect(gain); voice.start(); lfo.start();
      });
    }
    return gain;
  }
  return {
    setLevels(levels) {
      for (const name of ['rain','thunder','vinyl','brown','cafe']) {
        const level = Math.max(0,Math.min(1,levels?.[name] || 0));
        if (level > 0 || gains[name]) (gains[name] || add(name)).gain.setTargetAtTime(level,ctx.currentTime,.15);
      }
    },
  };
}
