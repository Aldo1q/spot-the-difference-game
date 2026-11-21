// Tideglass Observatory — bootstrap: wires the DOM HUD, pointer and keyboard
// input, the render loop, overlays (map / clear / fail / win / pause) and the
// ?shot= screenshot staging to the SpotGame engine in game.js.

import { SpotGame, SCREEN_MAP, SCREEN_PLAY, SCENES, DISTRICTS } from './game.js';
import { stageShot } from './shots.js';

const $ = (id) => document.getElementById(id);
const els = {
  left: $('panel-left'),
  right: $('panel-right'),
  remaining: $('remaining-count'),
  pips: $('pips'),
  timerText: $('timer-text'),
  timerFill: $('timer-fill'),
  score: $('score'),
  streak: $('streak'),
  lives: $('lives'),
  sceneLabel: $('scene-label'),
  zoomLabel: $('zoom-label'),
  hintBtn: $('btn-hint'),
  toast: $('toast'),
  status: $('status'),
  overlay: $('overlay'),
  mapDistricts: $('map-districts'),
  mapTotal: $('map-total'),
  clearStars: $('clear-stars'),
  clearLines: $('clear-lines'),
  failReason: $('fail-reason'),
  winLines: $('win-lines'),
};

let toastTimer = 0;
const ui = {
  canvasLeft: els.left,
  canvasRight: els.right,
  toast(message) {
    els.toast.textContent = message;
    els.toast.classList.add('show');
    els.status.textContent = message;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => els.toast.classList.remove('show'), 2400);
  },
  syncHud(game) {
    const scene = game.scene;
    els.remaining.textContent = String(game.remaining);
    els.sceneLabel.textContent = `${DISTRICTS[scene.district].name} · Scene ${game.sceneIndex + 1} of ${SCENES.length} — ${scene.title}`;
    els.pips.innerHTML = scene.diffs.map((diff) => `<i class="${game.found.has(diff.id) ? 'found' : ''}"></i>`).join('');
    const t = Math.max(0, Math.ceil(game.timeLeft));
    els.timerText.textContent = `${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}`;
    const danger = game.timeLeft <= 20 && game.screen === SCREEN_PLAY;
    els.timerText.parentElement.classList.toggle('danger', danger);
    els.timerFill.style.width = `${Math.max(0, (game.timeLeft / scene.time) * 100)}%`;
    els.timerFill.classList.toggle('danger', danger);
    els.score.textContent = String(game.totalScore + (game.screen === SCREEN_PLAY ? game.sceneScore : 0));
    els.streak.textContent = `×${game.streak}`;
    els.lives.textContent = '♥'.repeat(Math.max(0, game.lives)) + '♡'.repeat(Math.max(0, 3 - game.lives));
    els.lives.style.color = game.lives <= 1 ? '#ff5a5a' : '#ff8fa8';
    els.hintBtn.textContent = `💡 Hint (${game.hintsLeft}) · −150`;
    els.hintBtn.disabled = game.hintsLeft <= 0 || game.screen !== SCREEN_PLAY;
    els.zoomLabel.textContent = `${game.zoom.toFixed(1)}×`;
  },
  showOverlay(name, game) {
    const panes = { map: 'ov-map', clear: 'ov-clear', fail: 'ov-fail', win: 'ov-win', pause: 'ov-pause' };
    if (!name) {
      els.overlay.hidden = true;
      return;
    }
    for (const [key, id] of Object.entries(panes)) $(id).hidden = key !== name;
    els.overlay.hidden = false;
    if (name === 'map') buildMap(game);
    if (name === 'clear' && game.lastClear) {
      els.clearStars.textContent = '★'.repeat(game.lastClear.stars) + '☆'.repeat(3 - game.lastClear.stars);
      els.clearLines.innerHTML =
        `<b>${game.scene.title}</b> — all 7 differences found!<br>` +
        `Scene score <b>${game.lastClear.score}</b> (time bonus +${game.lastClear.timeBonus}) · ` +
        `Best streak ×${game.bestStreak} · Mistakes ${game.mistakes} · Hints used ${game.hintsUsed}<br>` +
        `Total score: <b>${game.totalScore}</b>`;
    }
    if (name === 'fail') {
      els.failReason.innerHTML = `${game.failReason ?? 'The light went out.'}<br>` +
        `You found ${game.found.size} of 7 differences in <b>${game.scene.title}</b>.`;
    }
    if (name === 'win') {
      const stars = game.stars.reduce((a, b) => a + b, 0);
      els.winLines.innerHTML =
        `All 12 scenes cleared — the Tideglass Observatory shines again.<br>` +
        `Final score: <b>${game.totalScore}</b> · Stars: <b>${stars} / 36</b>`;
    }
  },
};

function buildMap(game) {
  els.mapTotal.textContent = String(game.totalScore);
  els.mapDistricts.innerHTML = '';
  DISTRICTS.forEach((district, di) => {
    const wrap = document.createElement('div');
    wrap.className = 'district';
    wrap.innerHTML = `<h2>${di + 1}. ${district.name}</h2><p class="blurb">${district.blurb}</p>`;
    const grid = document.createElement('div');
    grid.className = 'scene-grid';
    SCENES.forEach((scene, si) => {
      if (scene.district !== di) return;
      const locked = si >= game.unlocked;
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `scene-btn${locked ? ' locked' : ''}`;
      btn.disabled = locked;
      btn.innerHTML = locked
        ? `<span class="sc-title">🔒 ${scene.title}</span><span class="sc-meta">Clear the scene before to unlock</span>`
        : `<span class="sc-title">${si + 1}. ${scene.title}</span>` +
          `<span class="sc-stars">${'★'.repeat(game.stars[si])}${'☆'.repeat(3 - game.stars[si])}</span> ` +
          `<span class="sc-meta">7 differences · ${scene.time}s${game.sceneScores[si] ? ` · best ${game.sceneScores[si]}` : ''}</span>`;
      btn.addEventListener('click', () => {
        game.sound.playClick();
        game.startScene(si);
      });
      grid.appendChild(btn);
    });
    wrap.appendChild(grid);
    els.mapDistricts.appendChild(wrap);
  });
}

const game = new SpotGame(ui);
game.screen = SCREEN_MAP;
game.showOverlay('map');
game.syncHud();

// Pointer input: a short press is a guess; a drag (when zoomed) pans.
for (const canvas of [els.left, els.right]) {
  let drag = null;
  canvas.addEventListener('pointerdown', (event) => {
    game.sound.ensure();
    drag = { x: event.clientX, y: event.clientY, panX: game.pan.x, panY: game.pan.y, moved: false };
    canvas.setPointerCapture(event.pointerId);
  });
  canvas.addEventListener('pointermove', (event) => {
    if (!drag) return;
    const dx = event.clientX - drag.x;
    const dy = event.clientY - drag.y;
    if (Math.abs(dx) + Math.abs(dy) > 6) drag.moved = true;
    if (drag.moved && game.zoom > 1) {
      const rect = canvas.getBoundingClientRect();
      game.pan.x = drag.panX + (dx / rect.width) * 600;
      game.pan.y = drag.panY + (dy / rect.height) * 450;
      game.clampPan();
    }
  });
  canvas.addEventListener('pointerup', (event) => {
    if (drag && !drag.moved) {
      const rect = canvas.getBoundingClientRect();
      const point = game.toScene(event.clientX, event.clientY, rect);
      game.clickAt(point.x, point.y);
    }
    drag = null;
  });
  canvas.addEventListener('wheel', (event) => {
    event.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const px = ((event.clientX - rect.left) / rect.width) * 600;
    const py = ((event.clientY - rect.top) / rect.height) * 450;
    game.setZoom(game.zoom * (event.deltaY < 0 ? 1.15 : 1 / 1.15), { x: px, y: py });
  }, { passive: false });
}

$('btn-hint').addEventListener('click', () => game.useHint());
$('btn-zoom-in').addEventListener('click', () => game.setZoom(game.zoom * 1.25, { x: 300, y: 225 }));
$('btn-zoom-out').addEventListener('click', () => game.setZoom(game.zoom / 1.25, { x: 300, y: 225 }));
$('btn-map').addEventListener('click', () => {
  if (game.screen === SCREEN_PLAY) game.paused = true;
  game.screen = SCREEN_MAP;
  game.showOverlay('map');
  game.syncHud();
});
$('btn-pause').addEventListener('click', () => togglePause());
$('btn-mute').addEventListener('click', (event) => {
  const muted = !game.sound.muted;
  game.sound.setMuted(muted);
  event.currentTarget.textContent = muted ? '🔇' : '🔊';
});
$('btn-next').addEventListener('click', () => game.startScene(Math.min(SCENES.length - 1, game.sceneIndex + 1)));
$('btn-clear-map').addEventListener('click', () => { game.screen = SCREEN_MAP; game.showOverlay('map'); });
$('btn-retry').addEventListener('click', () => game.startScene(game.sceneIndex));
$('btn-fail-map').addEventListener('click', () => { game.screen = SCREEN_MAP; game.showOverlay('map'); });
$('btn-win-map').addEventListener('click', () => { game.screen = SCREEN_MAP; game.showOverlay('map'); });
$('btn-resume').addEventListener('click', () => togglePause());
$('btn-pause-map').addEventListener('click', () => { game.paused = false; game.screen = SCREEN_MAP; game.showOverlay('map'); });

function togglePause() {
  if (game.screen !== SCREEN_PLAY) return;
  game.paused = !game.paused;
  game.showOverlay(game.paused ? 'pause' : null);
}

window.addEventListener('keydown', (event) => {
  const key = event.key.toLowerCase();
  if (key === 'h') game.useHint();
  else if (key === 'm') $('btn-mute').click();
  else if (key === 'p' || key === 'escape') togglePause();
  else if (key === 'r' && game.screen === SCREEN_PLAY) game.startScene(game.sceneIndex);
  else if (key === '+' || key === '=') game.setZoom(game.zoom * 1.25, { x: 300, y: 225 });
  else if (key === '-') game.setZoom(game.zoom / 1.25, { x: 300, y: 225 });
  else if (key.startsWith('arrow') && game.zoom > 1) {
    const step = 40;
    if (key === 'arrowleft') game.pan.x += step;
    if (key === 'arrowright') game.pan.x -= step;
    if (key === 'arrowup') game.pan.y += step;
    if (key === 'arrowdown') game.pan.y -= step;
    game.clampPan();
    event.preventDefault();
  }
});

// Screenshot staging: ?shot=cover|map|zoom|win freezes a deterministic frame.
const params = new URLSearchParams(location.search);
const shot = params.get('shot');
if (shot) stageShot(shot, game);

let lastTs = performance.now();
function frame(ts) {
  const dt = Math.min(0.1, (ts - lastTs) / 1000);
  lastTs = ts;
  game.tick(dt);
  if (game.screen !== SCREEN_MAP) game.render(ts);
  if ((frame.n = (frame.n || 0) + 1) % 15 === 0 && game.screen === SCREEN_PLAY) game.syncHud();
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
