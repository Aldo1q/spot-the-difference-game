// Tideglass Observatory — WebAudio synth: every sound is generated, no files.
// A soft harbour ambience (filtered noise + slow bell swells) sits under short
// chimes for finds, a dull thud for mistakes, a harp gliss for hints and a
// small fanfare when a scene is cleared.

export class SoundBank {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.ambienceNodes = [];
  }

  ensure() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') this.ctx.resume();
      return this.ctx;
    }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    this.ctx = new AC();
    this.master = this.ctx.createGain();
    this.master.gain.value = 0.5;
    this.master.connect(this.ctx.destination);
    return this.ctx;
  }

  tone(freq, start, dur, type = 'sine', vol = 0.2, slideTo = null) {
    if (!this.ensure() || this.muted) return;
    const t0 = this.ctx.currentTime + start;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
    gain.gain.setValueAtTime(0, t0);
    gain.gain.linearRampToValueAtTime(vol, t0 + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(gain).connect(this.master);
    osc.start(t0);
    osc.stop(t0 + dur + 0.05);
  }

  /** Two-note bell chime; the pitch climbs with the current streak. */
  playFind(streak) {
    const base = 660 * Math.pow(1.059, Math.min(streak, 8));
    this.tone(base, 0, 0.35, 'sine', 0.22);
    this.tone(base * 1.5, 0.07, 0.45, 'sine', 0.18);
    this.tone(base * 2, 0.14, 0.5, 'triangle', 0.1);
  }

  playMistake() {
    this.tone(150, 0, 0.22, 'square', 0.12, 90);
    this.tone(98, 0.02, 0.25, 'sine', 0.16, 70);
  }

  playHint() {
    [523, 659, 784, 1047].forEach((f, i) => this.tone(f, i * 0.09, 0.4, 'triangle', 0.12));
  }

  playClick() {
    this.tone(880, 0, 0.06, 'triangle', 0.08);
  }

  playSceneClear() {
    [392, 523, 659, 784, 1047].forEach((f, i) => this.tone(f, i * 0.11, 0.55, 'sine', 0.16));
    this.tone(1319, 0.58, 0.8, 'triangle', 0.12);
  }

  playFail() {
    [440, 349, 262, 196].forEach((f, i) => this.tone(f, i * 0.16, 0.4, 'sawtooth', 0.07));
  }

  playCampaignWin() {
    [523, 659, 784, 1047, 784, 1047, 1319, 1568].forEach((f, i) => this.tone(f, i * 0.13, 0.6, 'sine', 0.15));
  }

  /** Gentle water-and-wind loop, started on the first user gesture. */
  startAmbience() {
    if (!this.ensure() || this.ambienceNodes.length) return;
    const ctx = this.ctx;
    const len = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let last = 0;
    for (let i = 0; i < len; i += 1) {
      const white = Math.random() * 2 - 1;
      last = (last + 0.02 * white) / 1.02;
      data[i] = last * 3.2;
    }
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    src.loop = true;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 420;
    const gain = ctx.createGain();
    gain.gain.value = 0.05;
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.09;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 0.025;
    lfo.connect(lfoGain).connect(gain.gain);
    src.connect(filter).connect(gain).connect(this.master);
    src.start();
    lfo.start();
    this.ambienceNodes = [src, lfo];
  }

  setMuted(muted) {
    this.muted = muted;
    if (this.master) this.master.gain.value = muted ? 0 : 0.5;
  }
}
