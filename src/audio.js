export class SessionAudio {
  async start(mode, volume, beat) {
    this.stop();
    const ctx = new AudioContext(); this.ctx = ctx;
    await ctx.resume();
    if (this.ctx !== ctx) { await ctx.close(); return; }
    const master = ctx.createGain(); master.gain.value = volume; master.connect(ctx.destination); this.master = master;
    if (mode === 'focus') {
      const merger = ctx.createChannelMerger(2); merger.connect(master);
      [180, 180 + beat].forEach((frequency, channel) => {
        const osc = ctx.createOscillator(); const gain = ctx.createGain();
        osc.frequency.value = frequency; gain.gain.value = 0.18;
        osc.connect(gain); gain.connect(merger, 0, channel); osc.start();
      });
    } else {
      let step = 0;
      const schedule = () => {
        const t = ctx.currentTime;
        const osc = ctx.createOscillator(); const gain = ctx.createGain();
        osc.type = 'triangle'; osc.frequency.value = [261.63, 329.63, 392, 523.25, 392, 329.63, 440, 392][step % 8];
        gain.gain.setValueAtTime(0, t); gain.gain.linearRampToValueAtTime(.24, t + .01); gain.gain.exponentialRampToValueAtTime(.001, t + .21);
        osc.connect(gain); gain.connect(master); osc.start(t); osc.stop(t + .23);
        if (step % 2 === 0) {
          const kick = ctx.createOscillator(); const envelope = ctx.createGain();
          kick.frequency.setValueAtTime(120, t); kick.frequency.exponentialRampToValueAtTime(45, t + .12);
          envelope.gain.setValueAtTime(.35, t); envelope.gain.exponentialRampToValueAtTime(.001, t + .15);
          kick.connect(envelope); envelope.connect(master); kick.start(t); kick.stop(t + .17);
        }
        step++;
      };
      schedule(); this.interval = setInterval(schedule, 250);
    }
  }
  setVolume(volume) { if (this.master) this.master.gain.setTargetAtTime(volume, this.ctx.currentTime, .05); }
  stop() { clearInterval(this.interval); if (this.ctx && this.ctx.state !== 'closed') this.ctx.close(); this.ctx = null; this.master = null; }
}
