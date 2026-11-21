// Tideglass Observatory — game engine: scenes, timer, lives, hints, streaks,
// scoring, zoom & pan, the district progress map, and win / lose flow.
// Rendering is delegated to painter.js; all state lives in this class and is
// mirrored into the DOM HUD by syncHud().

import { SCENES, DISTRICTS } from './scenes.js';
import { drawScene, SCENE_W, SCENE_H } from './painter.js';
import { SoundBank } from './audio.js';

export const SCREEN_MAP = 'map';
export const SCREEN_PLAY = 'play';
export const SCREEN_CLEAR = 'clear';
export const SCREEN_FAIL = 'fail';
export const SCREEN_WIN = 'win';

const HINTS_PER_SCENE = 3;
const LIVES_PER_SCENE = 3;
const HINT_COST = 150;
const MISTAKE_COST = 25;
const MISTAKE_TIME_PENALTY = 5;
const FIND_BASE = 100;

export class SpotGame {
  constructor(ui) {
    this.ui = ui;
    this.sound = new SoundBank();
    this.screen = SCREEN_MAP;
    this.sceneIndex = 0;
    this.unlocked = 1;
    this.stars = new Array(SCENES.length).fill(0);
    this.sceneScores = new Array(SCENES.length).fill(0);
    this.totalScore = 0;
    this.zoom = 1;
    this.pan = { x: 0, y: 0 };
    this.resetSceneState();
    this.loadProgress();
  }

  resetSceneState() {
    this.found = new Set();
    this.lives = LIVES_PER_SCENE;
    this.hintsLeft = HINTS_PER_SCENE;
    this.streak = 0;
    this.bestStreak = 0;
    this.mistakes = 0;
    this.hintsUsed = 0;
    this.timeLeft = 0;
    this.elapsed = 0;
    this.hintId = null;
    this.hintUntil = 0;
    this.lastMiss = null;
    this.sceneScore = 0;
    this.paused = false;
  }

  get scene() {
    return SCENES[this.sceneIndex];
  }

  get remaining() {
    return this.scene.diffs.length - this.found.size;
  }

  loadProgress() {
    try {
      const raw = localStorage.getItem('tideglass-progress');
      if (!raw) return;
      const data = JSON.parse(raw);
      this.unlocked = Math.min(SCENES.length, Math.max(1, data.unlocked | 0));
      if (Array.isArray(data.stars)) this.stars = data.stars.slice(0, SCENES.length);
      if (Array.isArray(data.scores)) this.sceneScores = data.scores.slice(0, SCENES.length);
      this.totalScore = this.sceneScores.reduce((a, b) => a + (b | 0), 0);
    } catch {
      /* a fresh observatory */
    }
  }

  saveProgress() {
    try {
      localStorage.setItem('tideglass-progress', JSON.stringify({
        unlocked: this.unlocked, stars: this.stars, scores: this.sceneScores,
      }));
    } catch {
      /* storage unavailable */
    }
  }

  startScene(index) {
    this.sceneIndex = index;
    this.resetSceneState();
    this.timeLeft = this.scene.time;
    this.zoom = 1;
    this.pan = { x: 0, y: 0 };
    this.screen = SCREEN_PLAY;
    this.sound.ensure();
    this.sound.startAmbience();
    this.syncHud();
    this.showOverlay(null);
  }

  /** Seconds tick: drains the timer, expires hints, ends the scene at zero. */
  tick(dt) {
    if (this.screen !== SCREEN_PLAY || this.paused) return;
    this.elapsed += dt;
    this.timeLeft -= dt;
    if (this.hintId && performance.now() > this.hintUntil) this.hintId = null;
    if (this.timeLeft <= 0) {
      this.timeLeft = 0;
      this.failScene('The lantern light ran out.');
    }
  }

  /**
   * A click in scene coordinates on either panel. Returns 'found', 'already'
   * or 'miss'. A miss costs a life, time and score, and breaks the streak.
   */
  clickAt(x, y) {
    if (this.screen !== SCREEN_PLAY || this.paused) return null;
    for (const diff of this.scene.diffs) {
      const dx = x - diff.x;
      const dy = y - diff.y;
      if (dx * dx + dy * dy <= (diff.r + 8) * (diff.r + 8)) {
        if (this.found.has(diff.id)) {
          this.sound.playClick();
          this.ui.toast(`Already found: ${diff.note}`);
          return 'already';
        }
        this.found.add(diff.id);
        if (this.hintId === diff.id) this.hintId = null;
        this.streak += 1;
        this.bestStreak = Math.max(this.bestStreak, this.streak);
        const gained = FIND_BASE + 25 * Math.min(this.streak - 1, 4) + Math.ceil(this.timeLeft / 10);
        this.sceneScore += gained;
        this.sound.playFind(this.streak);
        this.ui.toast(`Found: ${diff.note}  +${gained}`);
        if (this.remaining === 0) this.clearScene();
        this.syncHud();
        return 'found';
      }
    }
    this.mistakes += 1;
    this.streak = 0;
    this.lives -= 1;
    this.timeLeft = Math.max(0, this.timeLeft - MISTAKE_TIME_PENALTY);
    this.sceneScore = Math.max(0, this.sceneScore - MISTAKE_COST);
    this.lastMiss = { x, y, until: performance.now() + 450 };
    this.sound.playMistake();
    this.ui.toast(this.lives > 0 ? `Not there — a lantern gutters. ${this.lives} left.` : 'The last lantern gutters…');
    if (this.lives <= 0) this.failScene('Three wrong guesses doused the lanterns.');
    this.syncHud();
    return 'miss';
  }

  /** Spend score to pulse the next unfound difference for two seconds. */
  useHint() {
    if (this.screen !== SCREEN_PLAY || this.paused) return;
    if (this.hintsLeft <= 0) {
      this.ui.toast('No hints left in this scene.');
      return;
    }
    const next = this.scene.diffs.find((diff) => !this.found.has(diff.id));
    if (!next) return;
    this.hintsLeft -= 1;
    this.hintsUsed += 1;
    this.sceneScore = Math.max(0, this.sceneScore - HINT_COST);
    this.hintId = next.id;
    this.hintUntil = performance.now() + 2200;
    this.sound.playHint();
    this.ui.toast(`A hint glimmers… (−${HINT_COST})`);
    this.syncHud();
  }

  starsForScene() {
    let stars = 1;
    if (this.mistakes === 0) stars += 1;
    if (this.hintsUsed === 0 && this.timeLeft > this.scene.time * 0.25) stars += 1;
    return stars;
  }

  clearScene() {
    const timeBonus = Math.ceil(this.timeLeft) * 2;
    this.sceneScore += timeBonus;
    this.lastClear = {
      timeBonus,
      stars: this.starsForScene(),
      score: this.sceneScore,
    };
    this.stars[this.sceneIndex] = Math.max(this.stars[this.sceneIndex], this.lastClear.stars);
    this.sceneScores[this.sceneIndex] = Math.max(this.sceneScores[this.sceneIndex], this.sceneScore);
    this.totalScore = this.sceneScores.reduce((a, b) => a + b, 0);
    this.unlocked = Math.max(this.unlocked, Math.min(SCENES.length, this.sceneIndex + 2));
    this.saveProgress();
    if (this.sceneIndex === SCENES.length - 1) {
      this.screen = SCREEN_WIN;
      this.sound.playCampaignWin();
      this.showOverlay('win');
    } else {
      this.screen = SCREEN_CLEAR;
      this.sound.playSceneClear();
      this.showOverlay('clear');
    }
    this.syncHud();
  }

  failScene(reason) {
    this.screen = SCREEN_FAIL;
    this.failReason = reason;
    this.sound.playFail();
    this.showOverlay('fail');
    this.syncHud();
  }

  setZoom(zoom, centre) {
    const clamped = Math.min(2.5, Math.max(1, zoom));
    if (centre && clamped !== this.zoom) {
      const ratio = clamped / this.zoom;
      this.pan.x = centre.x - (centre.x - this.pan.x) * ratio;
      this.pan.y = centre.y - (centre.y - this.pan.y) * ratio;
    }
    this.zoom = clamped;
    this.clampPan();
    this.syncHud();
  }

  clampPan() {
    const maxX = SCENE_W * (this.zoom - 1);
    const maxY = SCENE_H * (this.zoom - 1);
    this.pan.x = Math.min(0, Math.max(-maxX, this.pan.x));
    this.pan.y = Math.min(0, Math.max(-maxY, this.pan.y));
  }

  /** Convert a point inside a panel canvas element to scene coordinates. */
  toScene(clientX, clientY, rect) {
    const px = ((clientX - rect.left) / rect.width) * SCENE_W;
    const py = ((clientY - rect.top) / rect.height) * SCENE_H;
    return { x: (px - this.pan.x) / this.zoom, y: (py - this.pan.y) / this.zoom };
  }

  /** Draw both panels with the shared zoom/pan transform and miss marks. */
  render(nowMs) {
    for (const side of ['left', 'right']) {
      const canvas = side === 'left' ? this.ui.canvasLeft : this.ui.canvasRight;
      const ctx = canvas.getContext('2d');
      ctx.save();
      ctx.translate(this.pan.x, this.pan.y);
      ctx.scale(this.zoom, this.zoom);
      drawScene(ctx, this.scene, side, this.found, this.hintId, nowMs);
      if (this.lastMiss && nowMs < this.lastMiss.until) {
        const { x, y } = this.lastMiss;
        ctx.strokeStyle = '#ff5a5a';
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(x - 10, y - 10);
        ctx.lineTo(x + 10, y + 10);
        ctx.moveTo(x + 10, y - 10);
        ctx.lineTo(x - 10, y + 10);
        ctx.stroke();
      }
      ctx.restore();
    }
  }

  showOverlay(name) {
    this.ui.showOverlay(name, this);
  }

  syncHud() {
    this.ui.syncHud(this);
  }
}

export { DISTRICTS, SCENES };
