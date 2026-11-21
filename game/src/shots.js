// Tideglass Observatory — screenshot staging behind ?shot=<name>.
// Each staging drives the real game state (game.js) into a representative
// moment and freezes the timer, so a headless browser renders exactly the
// frame a player would see. Names come from shots.json at the repo root:
//   cover — mid-play in the Tide Market: three found, four still hidden
//   map   — the district progress map with the first district cleared
//   zoom  — the Orrery Hall at 2x zoom with a hint ring pulsing
//   clear — the scene-clear panel with stars and the score breakdown

import { SCENES } from './scenes.js';
import {
  SCREEN_CLEAR, SCREEN_MAP, SCREEN_PLAY,
  createGame, startScene, saveBests,
} from './game.js';

/** Mark the first `count` differences of the current scene as found. */
function findFirst(game, count) {
  const diffs = game.scene.diffs;
  for (let i = 0; i < count && i < diffs.length; i += 1) {
    game.found.add(diffs[i].target);
  }
  game.streak = count;
  game.bestStreak = count;
  game.score = count * 125;
}

/** Give the campaign a believable history: district one cleared. */
function seedCampaign(game) {
  SCENES.forEach((s, i) => {
    if (s.district === 0) {
      game.bests[s.id] = { score: 1180 + i * 140, stars: i % 2 === 0 ? 3 : 2 };
    }
  });
  game.bests[SCENES[4].id] = { score: 1310, stars: 2 };
  saveBests(game.bests);
  game.totalScore = 6120;
}

/**
 * Build the staged state for `name`. Returns { game, view } where view
 * carries the camera (zoom / pan) and overlay choices main.js renders.
 */
export function stageShot(name) {
  const game = createGame();
  const view = { zoom: 1, panX: 0, panY: 0, frozen: true };
  if (name === 'map') {
    seedCampaign(game);
    game.screen = SCREEN_MAP;
    return { game, view };
  }
  if (name === 'zoom') {
    startScene(game, 0);
    findFirst(game, 2);
    game.timeLeft = 121;
    game.hintTarget = game.scene.diffs[3].target;
    game.hintUntil = Number.POSITIVE_INFINITY;
    game.hintsLeft = 2;
    game.score -= 150;
    view.zoom = 1.8;
    view.panX = -140;
    view.panY = -90;
    return { game, view };
  }
  if (name === 'clear') {
    seedCampaign(game);
    startScene(game, 4);
    findFirst(game, 7);
    game.timeLeft = 74;
    game.lives = 3;
    const timeBonus = Math.round(game.timeLeft) * 2;
    game.clearInfo = {
      won: true, stars: 3, base: game.score, timeBonus,
      lifeBonus: 150, total: game.score + timeBonus + 150,
    };
    game.score = game.clearInfo.total;
    game.screen = SCREEN_CLEAR;
    return { game, view };
  }
  // Default: the cover — mid-play in the Tide Market (scene index 5).
  seedCampaign(game);
  startScene(game, 5);
  findFirst(game, 3);
  game.timeLeft = 96;
  game.lives = 3;
  game.screen = SCREEN_PLAY;
  return { game, view };
}
