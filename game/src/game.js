// Tideglass Observatory — game state and rules.
// Owns the campaign: district map with unlocks, per-scene timer, lives,
// mistake penalties, hints, streak scoring, stars and saved bests. Rendering
// and input live in main.js; this module is the rules only, so the shot
// staging in shots.js can drive exactly the same state a player gets.

import { DISTRICTS, SCENES, objectById } from './scenes.js';

export const SCREEN_MAP = 'map';
export const SCREEN_PLAY = 'play';
export const SCREEN_CLEAR = 'clear';
export const SCREEN_OVER = 'over';
export const SCREEN_VICTORY = 'victory';

export const FOUND_POINTS = 100;
export const MISTAKE_POINTS = 25;
export const MISTAKE_SECONDS = 5;
export const HINT_COST = 150;
export const HINTS_PER_SCENE = 3;
export const START_LIVES = 3;

const BESTS_KEY = 'tideglass-observatory-bests-v1';

export function loadBests() {
  try {
    const raw = localStorage.getItem(BESTS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (err) { /* storage unavailable: play without saved bests */ }
  return {};
}

export function saveBests(bests) {
  try {
    localStorage.setItem(BESTS_KEY, JSON.stringify(bests));
  } catch (err) { /* storage unavailable: ignore */ }
}

/** Stars for a finished scene: base star for clearing, plus time and lives. */
export function starsFor(state) {
  let stars = 1;
  if (state.timeLeft >= state.scene.timeLimit * 0.3) stars += 1;
  if (state.lives >= 2 && state.hintsUsed === 0) stars += 1;
  return stars;
}

/** A scene is unlocked when every earlier scene has a saved clear. */
export function isUnlocked(index, bests) {
  if (index === 0) return true;
  const prev = SCENES[index - 1];
  return Boolean(bests[prev.id]);
}

export function districtOf(sceneIndex) {
  return SCENES[sceneIndex].district;
}

export function districtScenes(district) {
  const out = [];
  SCENES.forEach((s, i) => { if (s.district === district) out.push(i); });
  return out;
}

export function createGame() {
  return {
    screen: SCREEN_MAP,
    bests: loadBests(),
    totalScore: 0,
    sceneIndex: 0,
    scene: null,
    found: new Set(),
    lives: START_LIVES,
    score: 0,
    streak: 0,
    bestStreak: 0,
    timeLeft: 0,
    hintsLeft: HINTS_PER_SCENE,
    hintsUsed: 0,
    hintTarget: null,
    hintUntil: 0,
    mistakes: 0,
    lastFindAt: 0,
    clearInfo: null,
  };
}

/** Begin a scene fresh: full timer, full lives, nothing found. */
export function startScene(game, index) {
  const scene = SCENES[index];
  game.sceneIndex = index;
  game.scene = scene;
  game.found = new Set();
  game.lives = START_LIVES;
  game.score = 0;
  game.streak = 0;
  game.bestStreak = 0;
  game.timeLeft = scene.timeLimit;
  game.hintsLeft = HINTS_PER_SCENE;
  game.hintsUsed = 0;
  game.hintTarget = null;
  game.mistakes = 0;
  game.clearInfo = null;
  game.screen = SCREEN_PLAY;
  return game;
}

/** Remaining differences of the current scene, in data order. */
export function remainingDiffs(game) {
  return game.scene.diffs.filter((d) => !game.found.has(d.target));
}

/**
 * Judge a click given in panel coordinates. Returns 'found', 'already',
 * 'miss' or 'ignored'. Each miss costs points and time, resets the streak,
 * and every third miss also costs a life.
 */
export function clickAt(game, x, y) {
  if (game.screen !== SCREEN_PLAY) return 'ignored';
  for (const d of game.scene.diffs) {
    const o = objectById(game.scene, d.target);
    if (!o) continue;
    const dx = x - o.x;
    const dy = y - o.y;
    if (dx * dx + dy * dy <= d.r * d.r) {
      if (game.found.has(d.target)) return 'already';
      game.found.add(d.target);
      game.streak += 1;
      game.bestStreak = Math.max(game.bestStreak, game.streak);
      const gain = FOUND_POINTS * (1 + Math.min(game.streak - 1, 4) * 0.25);
      game.score += Math.round(gain);
      game.lastFindAt = performance.now();
      if (game.hintTarget === d.target) game.hintTarget = null;
      if (game.found.size >= game.scene.diffs.length) finishScene(game, true);
      return 'found';
    }
  }
  game.streak = 0;
  game.mistakes += 1;
  game.score = Math.max(0, game.score - MISTAKE_POINTS);
  game.timeLeft = Math.max(0, game.timeLeft - MISTAKE_SECONDS);
  if (game.mistakes % 3 === 0) game.lives -= 1;
  if (game.lives <= 0) finishScene(game, false);
  return 'miss';
}

/** Spend a hint: reveal one remaining difference for a point cost. */
export function useHint(game, now) {
  if (game.screen !== SCREEN_PLAY || game.hintsLeft <= 0) return null;
  const rest = remainingDiffs(game);
  if (!rest.length) return null;
  game.hintsLeft -= 1;
  game.hintsUsed += 1;
  game.score = Math.max(0, game.score - HINT_COST);
  game.hintTarget = rest[0].target;
  game.hintUntil = now + 2600;
  return game.hintTarget;
}

/** Advance the timer; running out of time ends the scene. */
export function tick(game, dtSeconds) {
  if (game.screen !== SCREEN_PLAY) return;
  game.timeLeft -= dtSeconds;
  if (game.timeLeft <= 0) {
    game.timeLeft = 0;
    finishScene(game, false);
  }
}

function finishScene(game, won) {
  if (won) {
    const timeBonus = Math.round(game.timeLeft) * 2;
    const lifeBonus = game.lives * 50;
    const stars = starsFor(game);
    game.clearInfo = {
      won: true,
      stars,
      base: game.score,
      timeBonus,
      lifeBonus,
      total: game.score + timeBonus + lifeBonus,
    };
    game.score = game.clearInfo.total;
    game.totalScore += game.score;
    const prev = game.bests[game.scene.id];
    if (!prev || game.score > prev.score) {
      game.bests[game.scene.id] = { score: game.score, stars };
      saveBests(game.bests);
    }
    const allDone = SCENES.every((s) => game.bests[s.id]);
    game.screen = allDone ? SCREEN_VICTORY : SCREEN_CLEAR;
  } else {
    game.clearInfo = { won: false, stars: 0, base: game.score, timeBonus: 0, lifeBonus: 0, total: game.score };
    game.screen = SCREEN_OVER;
  }
}

/** Campaign progress summary for the map screen. */
export function campaignSummary(game) {
  let cleared = 0;
  let stars = 0;
  for (const s of SCENES) {
    const b = game.bests[s.id];
    if (b) { cleared += 1; stars += b.stars || 0; }
  }
  return { cleared, stars, districts: DISTRICTS.length, scenes: SCENES.length };
}
