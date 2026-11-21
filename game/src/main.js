// Tideglass Observatory — page bootstrap, rendering and input.
// One canvas holds both panels side by side; the DOM above it is the HUD
// (timer, lives, score, streak, found counter) and the control bar. This
// module draws every screen (play, district map, clear, game over, pause,
// campaign victory), converts mouse and keyboard input into game.js calls,
// and stages the ?shot= frames shots.js describes.

import { PANEL_H, PANEL_W, SCENES, DISTRICTS, objectById } from './scenes.js';
import { drawPanel } from './painter.js';
import {
  SCREEN_CLEAR, SCREEN_MAP, SCREEN_OVER, SCREEN_PLAY, SCREEN_VICTORY,
  HINTS_PER_SCENE, createGame, startScene, clickAt, useHint, tick,
  isUnlocked, districtScenes, campaignSummary,
} from './game.js';
import {
  playFound, playMistake, playHint, playClick, playClear, playLose,
  startAmbience, toggleMute,
} from './audio.js';
import { stageShot } from './shots.js';

const GAP = 24;
const VIEW_W = PANEL_W * 2 + GAP;
const VIEW_H = PANEL_H;

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
canvas.width = VIEW_W;
canvas.height = VIEW_H;

const el = (id) => document.getElementById(id);
const hudScene = el('hud-scene');
const hudTimer = el('hud-timer');
const hudLives = el('hud-lives');
const hudScore = el('hud-score');
const hudStreak = el('hud-streak');
const hudFound = el('hud-found');
const statusLine = el('status');

const params = new URLSearchParams(location.search);
const shotName = params.get('shot');

let game = createGame();
let view = { zoom: 1, panX: 0, panY: 0, frozen: false };
if (shotName) {
  const staged = stageShot(shotName);
  game = staged.game;
  view = staged.view;
}

let paused = false;
let flashes = [];
let buttons = [];
let lastTs = 0;

function announce(text) {
  statusLine.textContent = text;
}

function formatTime(seconds) {
  const s = Math.max(0, Math.ceil(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

function syncHud() {
  if (game.screen === SCREEN_MAP) {
    hudScene.textContent = 'District Map';
    hudTimer.textContent = '--:--';
    hudLives.textContent = '';
    hudScore.textContent = `Campaign ${game.totalScore}`;
    hudStreak.textContent = '';
    const sum = campaignSummary(game);
    hudFound.textContent = `${sum.cleared} / ${sum.scenes} scenes cleared`;
    return;
  }
  if (!game.scene) return;
  hudScene.textContent = game.scene.title;
  hudTimer.textContent = formatTime(game.timeLeft);
  hudTimer.classList.toggle('danger', game.screen === SCREEN_PLAY && game.timeLeft <= 30);
  hudLives.textContent = '♥'.repeat(game.lives) + '♡'.repeat(Math.max(0, 3 - game.lives));
  hudScore.textContent = `Score ${game.score}`;
  hudStreak.textContent = game.streak > 1 ? `Streak x${(1 + Math.min(game.streak - 1, 4) * 0.25).toFixed(2)}` : '';
  const left = game.scene.diffs.length - game.found.size;
  hudFound.textContent = `${game.found.size} / ${game.scene.diffs.length} found — ${left} remain`;
  el('btn-hint').textContent = `Hint (${game.hintsLeft})`;
}

function panelOrigin(side) {
  return side === 0 ? 0 : PANEL_W + GAP;
}

function drawPanelClipped(side) {
  const px = panelOrigin(side);
  ctx.save();
  ctx.beginPath();
  ctx.rect(px, 0, PANEL_W, PANEL_H);
  ctx.clip();
  ctx.translate(px + view.panX, view.panY);
  ctx.scale(view.zoom, view.zoom);
  drawPanel(ctx, game.scene, side);
  ctx.restore();
  ctx.strokeStyle = '#0b0f1c';
  ctx.lineWidth = 3;
  ctx.strokeRect(px + 1, 1, PANEL_W - 2, PANEL_H - 2);
  ctx.fillStyle = 'rgba(8,12,22,0.72)';
  ctx.fillRect(px + 10, 10, 86, 24);
  ctx.fillStyle = '#cfe4ff';
  ctx.font = '600 13px system-ui, sans-serif';
  ctx.fillText(side === 0 ? 'ORIGINAL' : 'ALTERED', px + 18, 27);
}

function drawMarkers(now) {
  for (const side of [0, 1]) {
    const px = panelOrigin(side);
    for (const target of game.found) {
      const o = objectById(game.scene, target);
      if (!o) continue;
      const x = px + view.panX + o.x * view.zoom;
      const y = view.panY + o.y * view.zoom;
      if (x < px - 30 || x > px + PANEL_W + 30 || y < -30 || y > PANEL_H + 30) continue;
      ctx.beginPath();
      ctx.arc(x, y, 20, 0, Math.PI * 2);
      ctx.strokeStyle = '#57e389';
      ctx.lineWidth = 3.5;
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x - 8, y);
      ctx.lineTo(x - 2.5, y + 6);
      ctx.lineTo(x + 9, y - 6);
      ctx.strokeStyle = '#57e389';
      ctx.lineWidth = 3.5;
      ctx.stroke();
    }
    if (game.hintTarget && now < game.hintUntil) {
      const o = objectById(game.scene, game.hintTarget);
      if (o) {
        const x = px + view.panX + o.x * view.zoom;
        const y = view.panY + o.y * view.zoom;
        const pulse = 30 + Math.sin(now / 180) * 7;
        ctx.beginPath();
        ctx.arc(x, y, pulse, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255,209,102,0.95)';
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(x, y, pulse + 9, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255,209,102,0.4)';
        ctx.stroke();
        ctx.fillStyle = 'rgba(20,16,4,0.85)';
        ctx.fillRect(x - 24, y - pulse - 30, 48, 17);
        ctx.fillStyle = '#ffd166';
        ctx.font = '700 11px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('HINT', x, y - pulse - 17);
        ctx.textAlign = 'left';
      }
    }
  }
  flashes = flashes.filter((f) => now - f.at < 450);
  for (const f of flashes) {
    ctx.strokeStyle = 'rgba(255,92,92,0.9)';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(f.x - 9, f.y - 9);
    ctx.lineTo(f.x + 9, f.y + 9);
    ctx.moveTo(f.x + 9, f.y - 9);
    ctx.lineTo(f.x - 9, f.y + 9);
    ctx.stroke();
  }
}

// ------------------------------------------------------------ other screens
function drawBackdropDim(alpha) {
  ctx.fillStyle = `rgba(5,8,16,${alpha})`;
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
}

function panelBox(x, y, w, h) {
  ctx.fillStyle = 'rgba(13,20,36,0.96)';
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = '#c9973f';
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y, w, h);
}

function text(str, x, y, size, color, align, weight) {
  ctx.fillStyle = color || '#e8eef7';
  ctx.font = `${weight || 400} ${size}px system-ui, sans-serif`;
  ctx.textAlign = align || 'left';
  ctx.fillText(str, x, y);
  ctx.textAlign = 'left';
}

function addButton(id, x, y, w, h, label) {
  ctx.fillStyle = '#274b63';
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = '#7fb2d9';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(x, y, w, h);
  text(label, x + w / 2, y + h / 2 + 6, 16, '#eaf4ff', 'center', 600);
  buttons.push({ id, x, y, w, h });
}

function starRow(cx, y, stars) {
  for (let i = 0; i < 3; i += 1) {
    text(i < stars ? '★' : '☆', cx + (i - 1) * 44, y, 38, '#ffd166', 'center');
  }
}

function drawMap() {
  drawBackdropDim(1);
  buttons = [];
  text('TIDEGLASS OBSERVATORY', VIEW_W / 2, 52, 30, '#ffd166', 'center', 700);
  const sum = campaignSummary(game);
  text(`${sum.cleared} of ${sum.scenes} scenes cleared · ${sum.stars} stars · campaign score ${game.totalScore}`,
    VIEW_W / 2, 84, 16, '#b9c9dd', 'center');
  DISTRICTS.forEach((district, di) => {
    const x = 36 + di * (376 + 18);
    text(district.name, x + 188, 128, 20, '#8fd8e2', 'center', 700);
    text(district.blurb, x + 188, 152, 12.5, '#8496ad', 'center');
    districtScenes(di).forEach((sceneIndex, row) => {
      const y = 172 + row * 80;
      const scene = SCENES[sceneIndex];
      const unlocked = isUnlocked(sceneIndex, game.bests);
      const best = game.bests[scene.id];
      ctx.fillStyle = unlocked ? 'rgba(39,75,99,0.9)' : 'rgba(20,28,44,0.9)';
      ctx.fillRect(x, y, 376, 66);
      ctx.strokeStyle = unlocked ? '#7fb2d9' : '#3a465e';
      ctx.strokeRect(x, y, 376, 66);
      text(scene.title, x + 16, y + 28, 17, unlocked ? '#eaf4ff' : '#68788f', 'left', 600);
      const sub = unlocked
        ? (best ? `Best ${best.score} · ${'★'.repeat(best.stars)}${'☆'.repeat(3 - best.stars)} · ${scene.timeLimit}s`
          : `Not cleared yet · ${scene.diffs.length} differences · ${scene.timeLimit}s`)
        : 'Locked — clear the scene before it';
      text(sub, x + 16, y + 52, 13, '#9db2c6');
      if (unlocked) buttons.push({ id: `scene-${sceneIndex}`, x, y, w: 376, h: 66 });
    });
  });
  text('Click a scene to play · Find 7 differences in each · 84 in all', VIEW_W / 2, 506, 14, '#8496ad', 'center');
}

function drawEndPanel(won) {
  if (game.scene) { drawPanelClipped(0); drawPanelClipped(1); drawMarkers(performance.now()); }
  drawBackdropDim(0.62);
  buttons = [];
  const info = game.clearInfo || { stars: 0, base: 0, timeBonus: 0, lifeBonus: 0, total: game.score };
  const x = VIEW_W / 2 - 250;
  const y = 76;
  panelBox(x, y, 500, 368);
  if (game.screen === SCREEN_VICTORY) {
    text('CAMPAIGN COMPLETE', VIEW_W / 2, y + 58, 27, '#ffd166', 'center', 700);
    text('Every difference in the observatory found.', VIEW_W / 2, y + 92, 15, '#b9c9dd', 'center');
  } else {
    text(won ? 'SCENE CLEARED' : 'THE TIDE TAKES IT', VIEW_W / 2, y + 58, 27, won ? '#57e389' : '#ff8a8a', 'center', 700);
    text(game.scene ? game.scene.title : '', VIEW_W / 2, y + 88, 15, '#b9c9dd', 'center');
  }
  if (won) {
    starRow(VIEW_W / 2, y + 138, info.stars);
    text(`Finds & streaks`, x + 70, y + 182, 16, '#b9c9dd');
    text(`${info.base}`, x + 430, y + 182, 16, '#e8eef7', 'right', 600);
    text(`Time bonus`, x + 70, y + 212, 16, '#b9c9dd');
    text(`${info.timeBonus}`, x + 430, y + 212, 16, '#e8eef7', 'right', 600);
    text(`Lives bonus`, x + 70, y + 242, 16, '#b9c9dd');
    text(`${info.lifeBonus}`, x + 430, y + 242, 16, '#e8eef7', 'right', 600);
    text(`Scene total`, x + 70, y + 278, 18, '#ffd166', 'left', 700);
    text(`${info.total}`, x + 430, y + 278, 18, '#ffd166', 'right', 700);
  } else {
    text(`You found ${game.found.size} of ${game.scene.diffs.length} differences.`, VIEW_W / 2, y + 150, 16, '#b9c9dd', 'center');
    text(`Score ${info.total} · mistakes ${game.mistakes}`, VIEW_W / 2, y + 182, 15, '#b9c9dd', 'center');
  }
  const nextIndex = game.sceneIndex + 1;
  const by = y + 306;
  if (won && nextIndex < SCENES.length) addButton('next', x + 40, by, 130, 42, 'Next scene');
  addButton('retry', x + 185, by, 130, 42, 'Retry');
  addButton('map', x + 330, by, 130, 42, 'District map');
}

function drawPaused() {
  drawBackdropDim(0.55);
  text('PAUSED', VIEW_W / 2, VIEW_H / 2 - 8, 34, '#ffd166', 'center', 700);
  text('Press P or the Pause button to resume', VIEW_W / 2, VIEW_H / 2 + 28, 15, '#b9c9dd', 'center');
}

function render(now) {
  ctx.clearRect(0, 0, VIEW_W, VIEW_H);
  if (game.screen === SCREEN_MAP) { drawMap(); return; }
  if (game.screen === SCREEN_CLEAR || game.screen === SCREEN_VICTORY || game.screen === SCREEN_OVER) {
    drawEndPanel(game.screen !== SCREEN_OVER);
    return;
  }
  buttons = [];
  drawPanelClipped(0);
  drawPanelClipped(1);
  drawMarkers(now);
  if (paused) drawPaused();
}

// ------------------------------------------------------------------- input
function toCanvas(evt) {
  const r = canvas.getBoundingClientRect();
  return {
    x: ((evt.clientX - r.left) / r.width) * VIEW_W,
    y: ((evt.clientY - r.top) / r.height) * VIEW_H,
  };
}

function toPanel(cx, cy) {
  let side = -1;
  let lx = 0;
  if (cx >= 0 && cx < PANEL_W) { side = 0; lx = cx; }
  if (cx >= PANEL_W + GAP && cx < VIEW_W) { side = 1; lx = cx - PANEL_W - GAP; }
  if (side < 0) return null;
  return { side, x: (lx - view.panX) / view.zoom, y: (cy - view.panY) / view.zoom };
}

function hitButton(cx, cy) {
  for (const b of buttons) {
    if (cx >= b.x && cx <= b.x + b.w && cy >= b.y && cy <= b.y + b.h) return b.id;
  }
  return null;
}

function goToScene(index) {
  startScene(game, index);
  view.zoom = 1;
  view.panX = 0;
  view.panY = 0;
  paused = false;
  playClick();
  announce(`${game.scene.title}: find ${game.scene.diffs.length} differences.`);
}

function pressButton(id) {
  if (id === 'next') goToScene(Math.min(game.sceneIndex + 1, SCENES.length - 1));
  else if (id === 'retry') goToScene(game.sceneIndex);
  else if (id === 'map') { game.screen = SCREEN_MAP; playClick(); }
  else if (id && id.startsWith('scene-')) goToScene(Number(id.slice(6)));
}

let drag = null;
canvas.addEventListener('pointerdown', (evt) => {
  startAmbience();
  const { x, y } = toCanvas(evt);
  drag = { x, y, moved: false };
});

canvas.addEventListener('pointermove', (evt) => {
  if (!drag || game.screen !== SCREEN_PLAY || paused) return;
  const { x, y } = toCanvas(evt);
  const dx = x - drag.x;
  const dy = y - drag.y;
  if (Math.abs(dx) + Math.abs(dy) > 5) drag.moved = true;
  if (drag.moved && view.zoom > 1) {
    view.panX = clampPan(view.panX + dx, 'x');
    view.panY = clampPan(view.panY + dy, 'y');
    drag.x = x;
    drag.y = y;
  }
});

canvas.addEventListener('pointerup', (evt) => {
  const wasDrag = drag && drag.moved;
  drag = null;
  if (wasDrag) return;
  const { x, y } = toCanvas(evt);
  const btn = hitButton(x, y);
  if (btn) { pressButton(btn); syncHud(); return; }
  if (game.screen !== SCREEN_PLAY || paused) return;
  const p = toPanel(x, y);
  if (!p) return;
  const before = game.screen;
  const result = clickAt(game, p.x, p.y);
  if (result === 'found') {
    playFound(game.streak);
    announce(`Found one. ${game.scene.diffs.length - game.found.size} remain.`);
    if (game.screen === SCREEN_CLEAR || game.screen === SCREEN_VICTORY) playClear();
  } else if (result === 'miss') {
    playMistake();
    const px = panelOrigin(p.side) + view.panX + p.x * view.zoom;
    flashes.push({ x: px, y: view.panY + p.y * view.zoom, at: performance.now() });
    announce(`Not there. Minus ${5} seconds.`);
    if (game.screen === SCREEN_OVER && before === SCREEN_PLAY) playLose();
  }
  syncHud();
});

canvas.addEventListener('wheel', (evt) => {
  if (game.screen !== SCREEN_PLAY) return;
  evt.preventDefault();
  setZoom(view.zoom * (evt.deltaY < 0 ? 1.12 : 0.89));
}, { passive: false });

function clampPan(v, axis) {
  const span = axis === 'x' ? PANEL_W : PANEL_H;
  const min = -(span * (view.zoom - 1));
  return Math.max(min, Math.min(0, v));
}

function setZoom(z) {
  view.zoom = Math.max(1, Math.min(2.5, z));
  view.panX = clampPan(view.panX, 'x');
  view.panY = clampPan(view.panY, 'y');
}

function doHint() {
  if (useHint(game, performance.now())) {
    playHint();
    announce('Hint shown as a gold ring on both panels.');
    syncHud();
  }
}

el('btn-hint').addEventListener('click', () => { startAmbience(); doHint(); });
el('btn-pause').addEventListener('click', () => { paused = !paused; playClick(); });
el('btn-zoomin').addEventListener('click', () => setZoom(view.zoom * 1.25));
el('btn-zoomout').addEventListener('click', () => setZoom(view.zoom / 1.25));
el('btn-map').addEventListener('click', () => { game.screen = SCREEN_MAP; playClick(); syncHud(); });
el('btn-restart').addEventListener('click', () => { if (game.scene) goToScene(game.sceneIndex); syncHud(); });
el('btn-mute').addEventListener('click', (evt) => {
  startAmbience();
  evt.target.textContent = toggleMute() ? 'Unmute' : 'Mute';
});

window.addEventListener('keydown', (evt) => {
  const k = evt.key.toLowerCase();
  if (k === 'h') doHint();
  else if (k === 'p') paused = !paused;
  else if (k === 'm') el('btn-mute').click();
  else if (k === 'r' && game.scene) { goToScene(game.sceneIndex); syncHud(); }
  else if (k === '+' || k === '=') setZoom(view.zoom * 1.2);
  else if (k === '-') setZoom(view.zoom / 1.2);
  else if (evt.key === 'ArrowLeft') view.panX = clampPan(view.panX + 30, 'x');
  else if (evt.key === 'ArrowRight') view.panX = clampPan(view.panX - 30, 'x');
  else if (evt.key === 'ArrowUp') view.panY = clampPan(view.panY + 30, 'y');
  else if (evt.key === 'ArrowDown') view.panY = clampPan(view.panY - 30, 'y');
});

// -------------------------------------------------------------------- loop
function frame(ts) {
  const dt = Math.min(0.1, (ts - lastTs) / 1000 || 0);
  lastTs = ts;
  if (!view.frozen && !paused && game.screen === SCREEN_PLAY) {
    const before = game.screen;
    tick(game, dt);
    if (game.screen === SCREEN_OVER && before === SCREEN_PLAY) playLose();
    syncHud();
  }
  render(ts);
  requestAnimationFrame(frame);
}

syncHud();
render(performance.now());
window.__tideglassReady = true;
requestAnimationFrame(frame);
