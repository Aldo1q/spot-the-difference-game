// Screenshot staging behind ?shot=cover|map|zoom|win&seed=N.
// Each scene is staged by playing the real game state forward: differences are
// marked found through the same set the click handler fills, the timer, score
// and streak are set to mid-game values, and the normal render loop draws the
// frame — so a screenshot is exactly what a player sees, never a mock-up.

import { SCREEN_PLAY, SCREEN_MAP, SCREEN_CLEAR } from './game.js';

/** Mark the first `ids.length` differences of the current scene as found. */
function stageFound(game, ids, scorePerFind = 135) {
  for (const id of ids) {
    game.found.add(id);
    game.sceneScore += scorePerFind;
  }
  game.totalScore = game.sceneScores.reduce((a, b) => a + b, 0) + game.sceneScore;
}

/**
 * Put `game` into the named screenshot scene and return nothing; main.js then
 * runs the ordinary render loop. Unknown names stage the cover.
 */
export function stageShot(name, game) {
  if (name === 'map') {
    // A returning keeper: district one cleared, district two under way.
    game.stars = [3, 2, 3, 2, 3, 1, 0, 0, 0, 0, 0, 0];
    game.sceneScores = [1240, 980, 1410, 1050, 1290, 860, 0, 0, 0, 0, 0, 0];
    game.totalScore = game.sceneScores.reduce((a, b) => a + b, 0);
    game.unlocked = 7;
    game.screen = SCREEN_MAP;
    game.showOverlay('map');
    game.syncHud();
    return;
  }
  if (name === 'zoom') {
    // The Diver's Cache, zoomed 2x on the anchor, a hint still pulsing.
    game.startScene(7);
    stageFound(game, ['d1', 'd5']);
    game.streak = 2;
    game.bestStreak = 4;
    game.timeLeft = 96;
    game.elapsed = 84;
    game.setZoom(2, { x: 300, y: 210 });
    game.pan = { x: -260, y: -170 };
    game.clampPan();
    game.hintId = 'd3';
    game.hintUntil = performance.now() + 60000;
    game.syncHud();
    return;
  }
  if (name === 'win') {
    // Telescope Row cleared with two stars: the scene-clear panel is up.
    game.startScene(9);
    for (const diff of game.scene.diffs) game.found.add(diff.id);
    game.sceneScore = 1180;
    game.timeLeft = 41;
    game.mistakes = 1;
    game.hintsUsed = 0;
    game.streak = 4;
    game.bestStreak = 6;
    game.sceneScores[9] = 1262;
    game.sceneScores[0] = 1240;
    game.sceneScores[1] = 980;
    game.totalScore = game.sceneScores.reduce((a, b) => a + b, 0);
    game.lastClear = { timeBonus: 82, stars: 2, score: 1262 };
    game.screen = SCREEN_CLEAR;
    game.showOverlay('clear');
    game.syncHud();
    return;
  }
  // cover: The Belfry Gears, three differences found, four still hiding.
  game.startScene(2);
  stageFound(game, ['d1', 'd4', 'd6']);
  game.streak = 3;
  game.bestStreak = 3;
  game.timeLeft = 97;
  game.elapsed = 68;
  game.lives = 2;
  game.syncHud();
}
