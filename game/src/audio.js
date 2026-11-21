// Tideglass Observatory — WebAudio synth: every sound is generated, no
// audio files. Short blips for play feedback plus a quiet two-oscillator
// night-water ambience that runs under the game until muted.

let ctx = null;
let master = null;
let ambienceNodes = null;
let muted = false;

function ensureContext() {
  if (ctx) return true;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return false;
  ctx = new AC();
  master = ctx.createGain();
  master.gain.value = muted ? 0 : 0.5;
  master.connect(ctx.destination);
  return true;
}

function tone(freq, start, dur, type, vol, slideTo) {
  if (!ensureContext()) return;
  const t0 = ctx.currentTime + start;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type || 'sine';
  osc.frequency.setValueAtTime(freq, t0);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.exponentialRampToValueAtTime(vol || 0.2, t0 + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(gain);
  gain.connect(master);
  osc.start(t0);
  osc.stop(t0 + dur + 0.05);
}

/** Bright two-note chime when a difference is found. */
export function playFound(streak) {
  const base = 620 + Math.min(streak, 6) * 60;
  tone(base, 0, 0.16, 'sine', 0.25);
  tone(base * 1.5, 0.07, 0.22, 'sine', 0.22);
}

/** Low buzz when a click misses: the mistake penalty sound. */
export function playMistake() {
  tone(150, 0, 0.22, 'sawtooth', 0.12, 90);
}

/** Soft ping when a hint ring is shown. */
export function playHint() {
  tone(980, 0, 0.3, 'triangle', 0.16, 720);
}

/** Tiny click for buttons and map movement. */
export function playClick() {
  tone(440, 0, 0.06, 'square', 0.06);
}

/** Rising arpeggio for a cleared scene. */
export function playClear() {
  [523, 659, 784, 1046].forEach((f, i) => tone(f, i * 0.09, 0.24, 'triangle', 0.2));
}

/** Falling pair for a lost scene. */
export function playLose() {
  tone(392, 0, 0.3, 'triangle', 0.2);
  tone(262, 0.22, 0.45, 'triangle', 0.2);
}

/** Start the looping ambience (idempotent; needs a user gesture first). */
export function startAmbience() {
  if (!ensureContext() || ambienceNodes) return;
  const gain = ctx.createGain();
  gain.gain.value = 0.035;
  const o1 = ctx.createOscillator();
  o1.type = 'sine';
  o1.frequency.value = 110;
  const o2 = ctx.createOscillator();
  o2.type = 'sine';
  o2.frequency.value = 165.5;
  const lfo = ctx.createOscillator();
  lfo.frequency.value = 0.09;
  const lfoGain = ctx.createGain();
  lfoGain.gain.value = 0.014;
  lfo.connect(lfoGain);
  lfoGain.connect(gain.gain);
  o1.connect(gain);
  o2.connect(gain);
  gain.connect(master);
  o1.start();
  o2.start();
  lfo.start();
  ambienceNodes = { gain, o1, o2, lfo };
}

/** Toggle mute; returns the new muted state. */
export function toggleMute() {
  muted = !muted;
  if (master && ctx) master.gain.setValueAtTime(muted ? 0 : 0.5, ctx.currentTime);
  return muted;
}

export function isMuted() {
  return muted;
}
