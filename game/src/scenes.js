// Tideglass Observatory — scene data.
// Every scene is pure data: a list of paintable objects plus exactly seven
// differences. The painter (painter.js) draws the left panel from the object
// list as written and the right panel with each difference applied, so the
// two panels and the difference map agree by construction.
// Difference modes:
//   removed — the object is present on the left, gone on the right
//   extra   — the object exists only on the right (object has onlyRight)
//   color   — the object's main colour changes (diff.color)
//   flip    — the object is mirrored horizontally on the right
//   param   — named painter parameters change (diff.set), e.g. clock hands,
//             gear teeth, bottle fill, candle height, telescope tilt,
//             compass needle, lantern lit state, steam / leaf / spot counts

export const PANEL_W = 600;
export const PANEL_H = 520;

export const DISTRICTS = [
  { name: 'The Brass Dome', blurb: 'Clockwork halls above the flood line' },
  { name: 'The Flooded Arcade', blurb: 'Shops and stalls waist-deep in tide' },
  { name: 'The Star Terrace', blurb: 'Open roofs under a working sky' },
];

function obj(kind, id, x, y, p) {
  return { kind, id, x, y, p: p || {} };
}

function dif(target, mode, label, extra) {
  return Object.assign({ target, mode, label, r: 36 }, extra || {});
}

function scene(id, title, district, timeLimit, sky, water, objects, diffs) {
  return { id, title, district, timeLimit, sky, water, objects, diffs };
}

export const SCENES = [
  // ---------------------------------------------------------- The Brass Dome
  scene('orrery-hall', 'The Orrery Hall', 0, 180, '#1d2a4a', '#274b5e', [
    obj('dome', 'dome', 300, 118, { color: '#c9973f', size: 210 }),
    obj('moon', 'moon', 92, 74, { color: '#f2e3b3', size: 26 }),
    obj('star', 'stars-a', 470, 60, { color: '#ffe9a8', count: 5, spread: 60 }),
    obj('clock', 'grand-clock', 300, 268, { color: '#8a5a24', size: 74, hour: 3, min: 10 }),
    obj('gear', 'gear-left', 128, 300, { color: '#b07f2e', size: 46, teeth: 9 }),
    obj('gear', 'gear-right', 472, 300, { color: '#9c742f', size: 38, teeth: 8 }),
    obj('orb', 'orrery-orb', 300, 268, { color: '#57c7d4', size: 20 }),
    obj('lantern', 'lamp-left', 66, 210, { color: '#e8b64c', lit: true }),
    obj('lantern', 'lamp-right', 534, 210, { color: '#e8b64c', lit: true }),
    obj('candle', 'candle-a', 196, 408, { color: '#f4ead2', height: 34, lit: true }),
    obj('candle', 'candle-b', 404, 408, { color: '#f4ead2', height: 26, lit: true }),
    obj('banner', 'banner', 300, 168, { color: '#7a2e35', size: 54 }),
    obj('compass', 'compass', 486, 428, { color: '#d8b25c', size: 30, needle: 40 }),
    obj('book', 'ledger', 118, 436, { color: '#5d7a3a', size: 34 }),
    obj('steam', 'steam-a', 210, 150, { color: '#cfd8dc', count: 3 }),
    obj('pipe', 'pipe-a', 40, 330, { color: '#7d8a99', size: 90 }),
    obj('window', 'win-a', 168, 120, { color: '#9fd8e8', size: 34 }),
    obj('window', 'win-b', 432, 120, { color: '#9fd8e8', size: 34 }),
    obj('bell', 'bell-extra', 356, 96, { color: '#e3c15e', size: 20, onlyRight: true }),
    obj('railing', 'rail', 300, 486, { color: '#5e4632', size: 520 }),
  ], [
    dif('grand-clock', 'param', 'Clock hands moved', { set: { hour: 5, min: 42 } }),
    dif('gear-left', 'param', 'Gear lost teeth', { set: { teeth: 6 } }),
    dif('lamp-right', 'param', 'Lantern went out', { set: { lit: false } }),
    dif('banner', 'color', 'Banner changed colour', { color: '#2e5f7a' }),
    dif('candle-a', 'param', 'Candle burned lower', { set: { height: 16 } }),
    dif('compass', 'param', 'Compass needle swung', { set: { needle: 150 } }),
    dif('bell-extra', 'extra', 'A bell appeared'),
  ]),

  scene('clockwork-nave', 'Clockwork Nave', 0, 170, '#241f3d', '#2c4a56', [
    obj('arch', 'arch', 300, 210, { color: '#a87c33', size: 300 }),
    obj('clock', 'nave-clock', 300, 176, { color: '#6e4a1e', size: 58, hour: 11, min: 55 }),
    obj('gear', 'gear-top', 118, 96, { color: '#c39a3d', size: 40, teeth: 10 }),
    obj('gear', 'gear-mid', 486, 118, { color: '#a87c33', size: 34, teeth: 7 }),
    obj('gear', 'gear-low', 452, 356, { color: '#8a6527', size: 52, teeth: 11 }),
    obj('pipe', 'pipe-left', 56, 260, { color: '#6f7d8c', size: 150 }),
    obj('pipe', 'pipe-right', 544, 260, { color: '#6f7d8c', size: 150 }),
    obj('steam', 'steam-left', 120, 330, { color: '#d7dee2', count: 4 }),
    obj('steam', 'steam-right', 480, 210, { color: '#d7dee2', count: 2 }),
    obj('lantern', 'nave-lamp', 300, 330, { color: '#f0bd55', lit: true }),
    obj('candle', 'nave-candle', 210, 430, { color: '#efe3c8', height: 30, lit: true }),
    obj('window', 'nave-win', 196, 150, { color: '#8fc6dd', size: 30 }),
    obj('book', 'nave-book', 396, 436, { color: '#7a3b4f', size: 32 }),
    obj('bell', 'nave-bell', 300, 84, { color: '#dcbc58', size: 24 }),
    obj('banner', 'nave-banner', 128, 420, { color: '#31556e', size: 46 }),
    obj('leaf', 'nave-leaf', 520, 430, { color: '#6f9e4a', count: 3 }),
    obj('orb', 'nave-orb-gone', 84, 470, { color: '#7fd0dd', size: 14 }),
    obj('railing', 'nave-rail', 300, 492, { color: '#4c3a28', size: 520 }),
  ], [
    dif('nave-clock', 'param', 'Clock hands moved', { set: { hour: 1, min: 20 } }),
    dif('gear-top', 'color', 'Gear changed colour', { color: '#4f7d8c' }),
    dif('steam-left', 'param', 'Steam puffs multiplied', { set: { count: 7 } }),
    dif('nave-bell', 'flip', 'Bell flipped'),
    dif('nave-book', 'removed', 'Book vanished'),
    dif('nave-leaf', 'param', 'Leaves multiplied', { set: { count: 6 } }),
    dif('nave-orb-gone', 'removed', 'Glass orb vanished'),
  ]),

  scene('gear-vault', 'The Gear Vault', 0, 190, '#1a2440', '#26455a', [
    obj('dome', 'vault-dome', 300, 104, { color: '#b78c36', size: 180 }),
    obj('gear', 'vault-gear-a', 170, 210, { color: '#c49a3f', size: 62, teeth: 12 }),
    obj('gear', 'vault-gear-b', 268, 168, { color: '#a87c33', size: 44, teeth: 9 }),
    obj('gear', 'vault-gear-c', 420, 224, { color: '#96702c', size: 56, teeth: 10 }),
    obj('telescope', 'vault-scope', 486, 380, { color: '#8fa3b8', tilt: -28 }),
    obj('bottle', 'vault-bottle-a', 120, 420, { color: '#4fae7d', fill: 0.8, size: 40 }),
    obj('bottle', 'vault-bottle-b', 178, 428, { color: '#4f7dae', fill: 0.45, size: 34 }),
    obj('compass', 'vault-compass', 316, 330, { color: '#d8b25c', size: 34, needle: 300 }),
    obj('lantern', 'vault-lamp', 60, 130, { color: '#eec25e', lit: true }),
    obj('candle', 'vault-candle', 540, 150, { color: '#f1e5cb', height: 38, lit: true }),
    obj('clock', 'vault-clock', 316, 452, { color: '#77531f', size: 44, hour: 8, min: 5 }),
    obj('pipe', 'vault-pipe', 36, 420, { color: '#77879a', size: 110 }),
    obj('steam', 'vault-steam', 560, 420, { color: '#d3dde2', count: 3 }),
    obj('star', 'vault-stars', 90, 52, { color: '#ffe9a8', count: 4, spread: 48 }),
    obj('window', 'vault-win', 300, 66, { color: '#a5d6e6', size: 30 }),
    obj('book', 'vault-book', 420, 452, { color: '#54683a', size: 30 }),
    obj('gear', 'vault-gear-extra', 520, 300, { color: '#bd9138', size: 30, teeth: 8, onlyRight: true }),
    obj('railing', 'vault-rail', 300, 496, { color: '#584631', size: 520 }),
  ], [
    dif('vault-gear-a', 'param', 'Gear gained teeth', { set: { teeth: 15 } }),
    dif('vault-bottle-a', 'param', 'Bottle drained', { set: { fill: 0.25 } }),
    dif('vault-scope', 'param', 'Telescope tilted', { set: { tilt: -52 } }),
    dif('vault-compass', 'param', 'Compass needle swung', { set: { needle: 80 } }),
    dif('vault-candle', 'color', 'Candle changed colour', { color: '#b8d4ea' }),
    dif('vault-book', 'flip', 'Book flipped'),
    dif('vault-gear-extra', 'extra', 'A gear appeared'),
  ]),

  scene('brass-belfry', 'Brass Belfry', 0, 160, '#262038', '#2a4658', [
    obj('tower', 'belfry-tower', 300, 240, { color: '#8a6a35', size: 260 }),
    obj('bell', 'belfry-bell-a', 236, 150, { color: '#e6c561', size: 34 }),
    obj('bell', 'belfry-bell-b', 364, 150, { color: '#d9b84f', size: 28 }),
    obj('clock', 'belfry-clock', 300, 300, { color: '#5f431c', size: 52, hour: 6, min: 30 }),
    obj('moon', 'belfry-moon', 512, 66, { color: '#f2e3b3', size: 22 }),
    obj('cloud', 'belfry-cloud', 130, 84, { color: '#5d6d8c', size: 70 }),
    obj('star', 'belfry-stars', 420, 52, { color: '#ffe9a8', count: 6, spread: 54 }),
    obj('lantern', 'belfry-lamp-a', 120, 330, { color: '#eec25e', lit: true }),
    obj('lantern', 'belfry-lamp-b', 480, 330, { color: '#eec25e', lit: false }),
    obj('banner', 'belfry-banner', 300, 420, { color: '#84363d', size: 50 }),
    obj('gear', 'belfry-gear', 96, 440, { color: '#b28a35', size: 40, teeth: 9 }),
    obj('candle', 'belfry-candle', 500, 446, { color: '#efe3c8', height: 28, lit: true }),
    obj('window', 'belfry-win', 300, 226, { color: '#9fd0e2', size: 26 }),
    obj('leaf', 'belfry-leaf', 180, 470, { color: '#7aa653', count: 4 }),
    obj('book', 'belfry-book-gone', 420, 470, { color: '#6d4a63', size: 28 }),
    obj('orb', 'belfry-orb', 60, 60, { color: '#86d3de', size: 12 }),
    obj('railing', 'belfry-rail', 300, 500, { color: '#4c3a28', size: 520 }),
  ], [
    dif('belfry-bell-b', 'removed', 'Bell vanished'),
    dif('belfry-lamp-b', 'param', 'Lantern lit up', { set: { lit: true } }),
    dif('belfry-clock', 'param', 'Clock hands moved', { set: { hour: 9, min: 5 } }),
    dif('belfry-banner', 'color', 'Banner changed colour', { color: '#2e6e5e' }),
    dif('belfry-cloud', 'flip', 'Cloud flipped'),
    dif('belfry-leaf', 'param', 'Leaves thinned out', { set: { count: 2 } }),
    dif('belfry-book-gone', 'removed', 'Book vanished'),
  ]),
];

// ------------------------------------------------------ The Flooded Arcade
SCENES.push(
  scene('sunken-colonnade', 'Sunken Colonnade', 1, 180, '#17334d', '#1f5f6e', [
    obj('arch', 'col-arch', 300, 190, { color: '#5e7d8c', size: 320 }),
    obj('tower', 'col-tower', 84, 200, { color: '#4c6675', size: 190 }),
    obj('boat', 'col-boat', 380, 430, { color: '#8a5a30', size: 96 }),
    obj('lantern', 'col-lamp-a', 150, 150, { color: '#f0bd55', lit: true }),
    obj('lantern', 'col-lamp-b', 450, 150, { color: '#f0bd55', lit: true }),
    obj('window', 'col-win-a', 240, 120, { color: '#a8dcec', size: 30 }),
    obj('window', 'col-win-b', 360, 120, { color: '#a8dcec', size: 30 }),
    obj('bottle', 'col-bottle', 520, 380, { color: '#57b58a', fill: 0.6, size: 36 }),
    obj('leaf', 'col-leaf', 120, 400, { color: '#69a34e', count: 5 }),
    obj('cloud', 'col-cloud', 480, 60, { color: '#546a86', size: 64 }),
    obj('moon', 'col-moon', 70, 56, { color: '#eee0ae', size: 20 }),
    obj('gear', 'col-gear', 540, 240, { color: '#a5833a', size: 36, teeth: 8 }),
    obj('book', 'col-book', 210, 330, { color: '#77572e', size: 30 }),
    obj('steam', 'col-steam', 300, 300, { color: '#cfd9de', count: 2 }),
    obj('compass', 'col-compass', 90, 480, { color: '#cfa855', size: 28, needle: 200 }),
    obj('candle', 'col-candle', 300, 452, { color: '#f1e5cb', height: 24, lit: false }),
    obj('star', 'col-star-extra', 330, 70, { color: '#ffe9a8', count: 3, spread: 30, onlyRight: true }),
    obj('railing', 'col-rail', 300, 498, { color: '#3d4c42', size: 520 }),
  ], [
    dif('col-boat', 'flip', 'Boat flipped'),
    dif('col-bottle', 'param', 'Bottle filled up', { set: { fill: 0.95 } }),
    dif('col-lamp-a', 'param', 'Lantern went out', { set: { lit: false } }),
    dif('col-win-b', 'color', 'Window changed colour', { color: '#e8c98a' }),
    dif('col-gear', 'param', 'Gear lost teeth', { set: { teeth: 5 } }),
    dif('col-compass', 'param', 'Compass needle swung', { set: { needle: 320 } }),
    dif('col-star-extra', 'extra', 'Stars appeared'),
  ]),

  scene('tide-market', 'The Tide Market', 1, 200, '#1b3049', '#256b74', [
    obj('banner', 'mkt-banner-a', 150, 110, { color: '#a03d46', size: 60 }),
    obj('banner', 'mkt-banner-b', 450, 110, { color: '#2e6e8e', size: 60 }),
    obj('arch', 'mkt-arch', 300, 230, { color: '#667f8f', size: 280 }),
    obj('bottle', 'mkt-bottle-a', 130, 330, { color: '#c2574f', fill: 0.7, size: 38 }),
    obj('bottle', 'mkt-bottle-b', 196, 340, { color: '#57b58a', fill: 0.35, size: 32 }),
    obj('bottle', 'mkt-bottle-c', 404, 340, { color: '#d8a84e', fill: 0.55, size: 32 }),
    obj('boat', 'mkt-boat', 300, 452, { color: '#7c4f2a', size: 110 }),
    obj('lantern', 'mkt-lamp', 300, 170, { color: '#f0bd55', lit: true }),
    obj('leaf', 'mkt-leaf', 500, 320, { color: '#69a34e', count: 4 }),
    obj('book', 'mkt-book', 480, 420, { color: '#4f6d8f', size: 32 }),
    obj('gear', 'mkt-gear', 70, 230, { color: '#a5833a', size: 34, teeth: 9 }),
    obj('candle', 'mkt-candle', 90, 440, { color: '#f1e5cb', height: 32, lit: true }),
    obj('cloud', 'mkt-cloud', 520, 56, { color: '#546a86', size: 58 }),
    obj('star', 'mkt-stars', 110, 52, { color: '#ffe9a8', count: 4, spread: 44 }),
    obj('compass', 'mkt-compass', 540, 460, { color: '#cfa855', size: 26, needle: 90 }),
    obj('steam', 'mkt-steam-gone', 250, 260, { color: '#cfd9de', count: 3 }),
    obj('window', 'mkt-win', 300, 300, { color: '#a8dcec', size: 28 }),
    obj('railing', 'mkt-rail', 300, 500, { color: '#3d4c42', size: 520 }),
  ], [
    dif('mkt-banner-a', 'color', 'Banner changed colour', { color: '#3f7a52' }),
    dif('mkt-bottle-b', 'param', 'Bottle drained', { set: { fill: 0.1 } }),
    dif('mkt-candle', 'param', 'Candle burned lower', { set: { height: 14 } }),
    dif('mkt-leaf', 'param', 'Leaves multiplied', { set: { count: 7 } }),
    dif('mkt-gear', 'flip', 'Gear flipped'),
    dif('mkt-steam-gone', 'removed', 'Steam vanished'),
    dif('mkt-compass', 'param', 'Compass needle swung', { set: { needle: 210 } }),
  ]),

  scene('lantern-ferry', 'Lantern Ferry Dock', 1, 175, '#152c46', '#1d5a68', [
    obj('boat', 'dock-boat-a', 180, 420, { color: '#8a5a30', size: 120 }),
    obj('boat', 'dock-boat-b', 440, 446, { color: '#6e4a2c', size: 84 }),
    obj('lantern', 'dock-lamp-a', 110, 240, { color: '#f0bd55', lit: true }),
    obj('lantern', 'dock-lamp-b', 300, 210, { color: '#f0bd55', lit: true }),
    obj('lantern', 'dock-lamp-c', 490, 240, { color: '#f0bd55', lit: false }),
    obj('tower', 'dock-tower', 300, 120, { color: '#54707f', size: 130 }),
    obj('moon', 'dock-moon', 520, 60, { color: '#eee0ae', size: 24 }),
    obj('cloud', 'dock-cloud', 120, 70, { color: '#50637f', size: 72 }),
    obj('star', 'dock-stars', 300, 48, { color: '#ffe9a8', count: 5, spread: 60 }),
    obj('pipe', 'dock-pipe', 560, 340, { color: '#71808f', size: 120 }),
    obj('steam', 'dock-steam', 540, 250, { color: '#cfd9de', count: 4 }),
    obj('leaf', 'dock-leaf', 60, 470, { color: '#69a34e', count: 3 }),
    obj('book', 'dock-book', 250, 300, { color: '#7a4a3a', size: 28 }),
    obj('bottle', 'dock-bottle', 360, 320, { color: '#57b58a', fill: 0.5, size: 34 }),
    obj('bell', 'dock-bell-extra', 300, 330, { color: '#e3c15e', size: 22, onlyRight: true }),
    obj('compass', 'dock-compass', 480, 480, { color: '#cfa855', size: 28, needle: 130 }),
    obj('railing', 'dock-rail', 300, 500, { color: '#3a4a40', size: 520 }),
  ], [
    dif('dock-lamp-c', 'param', 'Lantern lit up', { set: { lit: true } }),
    dif('dock-boat-b', 'color', 'Boat changed colour', { color: '#3f6d8f' }),
    dif('dock-steam', 'param', 'Steam thinned out', { set: { count: 1 } }),
    dif('dock-book', 'removed', 'Book vanished'),
    dif('dock-bottle', 'param', 'Bottle filled up', { set: { fill: 0.9 } }),
    dif('dock-cloud', 'flip', 'Cloud flipped'),
    dif('dock-bell-extra', 'extra', 'A bell appeared'),
  ]),

  scene('drowned-library', 'The Drowned Library', 1, 205, '#1d2c48', '#235e66', [
    obj('arch', 'lib-arch', 300, 180, { color: '#5f7a72', size: 300 }),
    obj('book', 'lib-book-a', 130, 260, { color: '#8f4f3a', size: 38 }),
    obj('book', 'lib-book-b', 200, 280, { color: '#3f6d8f', size: 34 }),
    obj('book', 'lib-book-c', 400, 280, { color: '#6d8f3f', size: 34 }),
    obj('book', 'lib-book-d', 470, 260, { color: '#8f3f6d', size: 38 }),
    obj('candle', 'lib-candle-a', 300, 330, { color: '#f1e5cb', height: 36, lit: true }),
    obj('candle', 'lib-candle-b', 340, 340, { color: '#e8dcc2', height: 22, lit: true }),
    obj('lantern', 'lib-lamp', 70, 130, { color: '#f0bd55', lit: true }),
    obj('window', 'lib-win', 300, 110, { color: '#a8dcec', size: 36 }),
    obj('gear', 'lib-gear', 530, 140, { color: '#a5833a', size: 34, teeth: 7 }),
    obj('bottle', 'lib-bottle', 90, 420, { color: '#c2574f', fill: 0.65, size: 36 }),
    obj('boat', 'lib-boat', 430, 440, { color: '#7c4f2a', size: 92 }),
    obj('leaf', 'lib-leaf', 260, 450, { color: '#69a34e', count: 6 }),
    obj('clock', 'lib-clock', 520, 300, { color: '#6e4a1e', size: 42, hour: 4, min: 48 }),
    obj('compass', 'lib-compass', 140, 470, { color: '#cfa855', size: 28, needle: 260 }),
    obj('steam', 'lib-steam', 470, 380, { color: '#cfd9de', count: 2 }),
    obj('moon', 'lib-moon-gone', 60, 52, { color: '#eee0ae', size: 18 }),
    obj('railing', 'lib-rail', 300, 500, { color: '#3d4c42', size: 520 }),
  ], [
    dif('lib-book-c', 'color', 'Book changed colour', { color: '#c2a13a' }),
    dif('lib-candle-a', 'param', 'Candle burned lower', { set: { height: 18 } }),
    dif('lib-clock', 'param', 'Clock hands moved', { set: { hour: 7, min: 12 } }),
    dif('lib-gear', 'param', 'Gear gained teeth', { set: { teeth: 11 } }),
    dif('lib-leaf', 'param', 'Leaves thinned out', { set: { count: 3 } }),
    dif('lib-bottle', 'flip', 'Bottle flipped'),
    dif('lib-moon-gone', 'removed', 'Moon vanished'),
  ]),
);

// --------------------------------------------------------- The Star Terrace
SCENES.push(
  scene('telescope-landing', 'Telescope Landing', 2, 190, '#141c3d', '#274b63', [
    obj('telescope', 'land-scope-a', 190, 330, { color: '#9db2c6', tilt: -34 }),
    obj('telescope', 'land-scope-b', 430, 360, { color: '#7e93a8', tilt: -18 }),
    obj('moon', 'land-moon', 480, 80, { color: '#f2e3b3', size: 30 }),
    obj('star', 'land-stars-a', 130, 70, { color: '#ffe9a8', count: 7, spread: 80 }),
    obj('star', 'land-stars-b', 330, 120, { color: '#cfe4ff', count: 4, spread: 50 }),
    obj('cloud', 'land-cloud', 250, 60, { color: '#46587a', size: 76 }),
    obj('compass', 'land-compass', 90, 450, { color: '#d8b25c', size: 32, needle: 45 }),
    obj('lantern', 'land-lamp', 540, 300, { color: '#f0bd55', lit: true }),
    obj('orb', 'land-orb', 300, 240, { color: '#8fd8e2', size: 18 }),
    obj('gear', 'land-gear', 70, 260, { color: '#a5833a', size: 36, teeth: 9 }),
    obj('book', 'land-book', 520, 450, { color: '#5d7a3a', size: 30 }),
    obj('candle', 'land-candle', 350, 460, { color: '#f1e5cb', height: 26, lit: true }),
    obj('banner', 'land-banner', 300, 420, { color: '#4a3a7a', size: 48 }),
    obj('bell', 'land-bell', 560, 120, { color: '#e3c15e', size: 20 }),
    obj('leaf', 'land-leaf-gone', 160, 470, { color: '#69a34e', count: 4 }),
    obj('dome', 'land-dome', 300, 150, { color: '#7a6a9e', size: 150 }),
    obj('railing', 'land-rail', 300, 498, { color: '#3a3550', size: 520 }),
  ], [
    dif('land-scope-a', 'param', 'Telescope tilted', { set: { tilt: -58 } }),
    dif('land-stars-a', 'param', 'Stars multiplied', { set: { count: 11 } }),
    dif('land-compass', 'param', 'Compass needle swung', { set: { needle: 190 } }),
    dif('land-orb', 'color', 'Orb changed colour', { color: '#e28fb0' }),
    dif('land-bell', 'flip', 'Bell flipped'),
    dif('land-banner', 'removed', 'Banner vanished'),
    dif('land-leaf-gone', 'removed', 'Leaves vanished'),
  ]),

  scene('astrolabe-roof', 'The Astrolabe Roof', 2, 210, '#121a38', '#22455e', [
    obj('dome', 'roof-dome', 300, 130, { color: '#6d5f96', size: 190 }),
    obj('compass', 'roof-astrolabe', 300, 300, { color: '#d8b25c', size: 64, needle: 270 }),
    obj('gear', 'roof-gear-a', 140, 320, { color: '#a5833a', size: 48, teeth: 10 }),
    obj('gear', 'roof-gear-b', 460, 320, { color: '#93762f', size: 42, teeth: 8 }),
    obj('star', 'roof-stars', 480, 60, { color: '#ffe9a8', count: 6, spread: 56 }),
    obj('moon', 'roof-moon', 100, 64, { color: '#f2e3b3', size: 24 }),
    obj('telescope', 'roof-scope', 510, 420, { color: '#9db2c6', tilt: -40 }),
    obj('lantern', 'roof-lamp-a', 80, 200, { color: '#f0bd55', lit: true }),
    obj('lantern', 'roof-lamp-b', 520, 200, { color: '#f0bd55', lit: true }),
    obj('candle', 'roof-candle', 210, 440, { color: '#f1e5cb', height: 30, lit: true }),
    obj('book', 'roof-book', 380, 446, { color: '#7a3b4f', size: 30 }),
    obj('cloud', 'roof-cloud', 300, 52, { color: '#46587a', size: 66 }),
    obj('orb', 'roof-orb-extra', 180, 130, { color: '#8fd8e2', size: 13, onlyRight: true }),
    obj('banner', 'roof-banner', 300, 196, { color: '#31556e', size: 44 }),
    obj('clock', 'roof-clock', 90, 460, { color: '#6e4a1e', size: 40, hour: 10, min: 8 }),
    obj('steam', 'roof-steam', 420, 130, { color: '#cfd9de', count: 3 }),
    obj('railing', 'roof-rail', 300, 500, { color: '#37324e', size: 520 }),
  ], [
    dif('roof-astrolabe', 'param', 'Astrolabe needle swung', { set: { needle: 30 } }),
    dif('roof-gear-b', 'param', 'Gear lost teeth', { set: { teeth: 5 } }),
    dif('roof-scope', 'param', 'Telescope tilted', { set: { tilt: -14 } }),
    dif('roof-lamp-b', 'param', 'Lantern went out', { set: { lit: false } }),
    dif('roof-banner', 'color', 'Banner changed colour', { color: '#8f6d2e' }),
    dif('roof-clock', 'param', 'Clock hands moved', { set: { hour: 2, min: 36 } }),
    dif('roof-orb-extra', 'extra', 'An orb appeared'),
  ]),

  scene('comet-watch', 'Comet Watch', 2, 200, '#101838', '#20405a', [
    obj('star', 'comet-stars-a', 150, 80, { color: '#ffe9a8', count: 8, spread: 90 }),
    obj('star', 'comet-stars-b', 450, 140, { color: '#cfe4ff', count: 5, spread: 56 }),
    obj('moon', 'comet-moon', 540, 66, { color: '#f2e3b3', size: 26 }),
    obj('cloud', 'comet-cloud-a', 130, 150, { color: '#42536f', size: 70 }),
    obj('cloud', 'comet-cloud-b', 420, 60, { color: '#42536f', size: 58 }),
    obj('telescope', 'comet-scope', 300, 360, { color: '#a9bdd1', tilt: -44 }),
    obj('dome', 'comet-dome', 120, 300, { color: '#77689e', size: 120 }),
    obj('lantern', 'comet-lamp-a', 200, 440, { color: '#f0bd55', lit: true }),
    obj('lantern', 'comet-lamp-b', 420, 440, { color: '#f0bd55', lit: true }),
    obj('compass', 'comet-compass', 520, 460, { color: '#d8b25c', size: 30, needle: 340 }),
    obj('orb', 'comet-orb', 300, 210, { color: '#e2a88f', size: 16 }),
    obj('gear', 'comet-gear', 540, 300, { color: '#a5833a', size: 38, teeth: 9 }),
    obj('book', 'comet-book', 90, 450, { color: '#54683a', size: 30 }),
    obj('candle', 'comet-candle', 480, 360, { color: '#f1e5cb', height: 34, lit: false }),
    obj('banner', 'comet-banner', 180, 380, { color: '#7a2e35', size: 46 }),
    obj('leaf', 'comet-leaf', 350, 480, { color: '#69a34e', count: 5 }),
    obj('bell', 'comet-bell-gone', 60, 240, { color: '#e3c15e', size: 20 }),
    obj('railing', 'comet-rail', 300, 500, { color: '#35304a', size: 520 }),
  ], [
    dif('comet-stars-b', 'param', 'Stars thinned out', { set: { count: 2 } }),
    dif('comet-scope', 'color', 'Telescope changed colour', { color: '#c2a35e' }),
    dif('comet-candle', 'param', 'Candle lit up', { set: { lit: true } }),
    dif('comet-compass', 'param', 'Compass needle swung', { set: { needle: 120 } }),
    dif('comet-banner', 'flip', 'Banner flipped'),
    dif('comet-leaf', 'param', 'Leaves multiplied', { set: { count: 8 } }),
    dif('comet-bell-gone', 'removed', 'Bell vanished'),
  ]),

  scene('zenith-dome', 'The Zenith Dome', 2, 210, '#0f1633', '#1e3c56', [
    obj('dome', 'zen-dome', 300, 120, { color: '#8674b0', size: 220 }),
    obj('clock', 'zen-clock', 300, 286, { color: '#77531f', size: 66, hour: 12, min: 0 }),
    obj('gear', 'zen-gear-a', 130, 300, { color: '#b28a35', size: 50, teeth: 11 }),
    obj('gear', 'zen-gear-b', 470, 300, { color: '#9c742f', size: 44, teeth: 9 }),
    obj('telescope', 'zen-scope', 500, 430, { color: '#9db2c6', tilt: -30 }),
    obj('moon', 'zen-moon', 84, 66, { color: '#f2e3b3', size: 28 }),
    obj('star', 'zen-stars', 460, 56, { color: '#ffe9a8', count: 7, spread: 64 }),
    obj('compass', 'zen-compass', 110, 440, { color: '#d8b25c', size: 34, needle: 180 }),
    obj('lantern', 'zen-lamp-a', 190, 180, { color: '#f0bd55', lit: true }),
    obj('lantern', 'zen-lamp-b', 410, 180, { color: '#f0bd55', lit: true }),
    obj('orb', 'zen-orb', 300, 286, { color: '#6fd3c7', size: 22 }),
    obj('candle', 'zen-candle-a', 230, 420, { color: '#f1e5cb', height: 32, lit: true }),
    obj('candle', 'zen-candle-b', 370, 420, { color: '#f1e5cb', height: 32, lit: true }),
    obj('banner', 'zen-banner', 300, 176, { color: '#4a3a7a', size: 56 }),
    obj('book', 'zen-book', 420, 462, { color: '#8f4f3a', size: 30 }),
    obj('bottle', 'zen-bottle', 180, 462, { color: '#57b58a', fill: 0.75, size: 36 }),
    obj('cloud', 'zen-cloud', 540, 130, { color: '#46587a', size: 60 }),
    obj('steam', 'zen-steam-extra', 70, 350, { color: '#cfd9de', count: 3, onlyRight: true }),
    obj('railing', 'zen-rail', 300, 500, { color: '#332e48', size: 520 }),
  ], [
    dif('zen-clock', 'param', 'Clock hands moved', { set: { hour: 4, min: 24 } }),
    dif('zen-gear-a', 'param', 'Gear lost teeth', { set: { teeth: 7 } }),
    dif('zen-scope', 'param', 'Telescope tilted', { set: { tilt: -62 } }),
    dif('zen-lamp-a', 'param', 'Lantern went out', { set: { lit: false } }),
    dif('zen-orb', 'color', 'Orb changed colour', { color: '#e2c86f' }),
    dif('zen-bottle', 'param', 'Bottle drained', { set: { fill: 0.3 } }),
    dif('zen-steam-extra', 'extra', 'Steam appeared'),
  ]),
);

/** Look up one object of a scene by its id. */
export function objectById(scene, id) {
  for (const o of scene.objects) if (o.id === id) return o;
  return null;
}

/** Total differences in the whole campaign (12 scenes x 7 = 84). */
export const TOTAL_DIFFS = SCENES.reduce((n, s) => n + s.diffs.length, 0);
