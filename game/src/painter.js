// Tideglass Observatory — scene painter.
// Every picture is drawn procedurally on a 600x450 canvas from the scene data in
// scenes.js, so the left (original) and right (altered) panels are pixel-exact
// apart from the seven planted differences. A difference mutates one object:
// it vanishes, appears, changes colour, flips, or swaps a detail parameter.

export const SCENE_W = 600;
export const SCENE_H = 450;

/** Deterministic 0..1 hash from an integer seed, for ambient decor. */
export function seededRandom(seed) {
  let state = (seed * 2654435761) >>> 0;
  return function next() {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

function circle(ctx, x, y, r, fill) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = fill;
  ctx.fill();
}

function roundRect(ctx, x, y, w, h, r, fill) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  ctx.fillStyle = fill;
  ctx.fill();
}

/** One object kind, drawn centred on (0,0) at unit size, scaled by the caller. */
const OBJECT_DRAWERS = {
  gear(ctx, o) {
    const teeth = o.n ?? 8;
    ctx.fillStyle = o.c;
    for (let i = 0; i < teeth; i += 1) {
      ctx.save();
      ctx.rotate(((Math.PI * 2) / teeth) * i + (o.rot ?? 0));
      ctx.fillRect(-4, -26, 8, 12);
      ctx.restore();
    }
    circle(ctx, 0, 0, 19, o.c);
    circle(ctx, 0, 0, 10, o.c2 ?? '#20242e');
    circle(ctx, 0, 0, 4, o.c);
  },
  lantern(ctx, o) {
    ctx.strokeStyle = '#0d0f14';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, -34);
    ctx.lineTo(0, -18);
    ctx.stroke();
    if (o.lit !== false) {
      const glow = ctx.createRadialGradient(0, 0, 2, 0, 0, 30);
      glow.addColorStop(0, 'rgba(255,214,120,0.55)');
      glow.addColorStop(1, 'rgba(255,214,120,0)');
      ctx.fillStyle = glow;
      ctx.fillRect(-32, -32, 64, 64);
    }
    ctx.beginPath();
    ctx.moveTo(-9, -18);
    ctx.lineTo(9, -18);
    ctx.lineTo(13, 12);
    ctx.lineTo(-13, 12);
    ctx.closePath();
    ctx.fillStyle = o.c;
    ctx.fill();
    ctx.fillStyle = o.lit === false ? '#39404d' : '#ffd678';
    ctx.fillRect(-7, -11, 14, 17);
    roundRect(ctx, -11, 12, 22, 5, 2, '#0d0f14');
  },
  star4(ctx, o) {
    ctx.beginPath();
    const r = 16;
    const q = 4.5;
    ctx.moveTo(0, -r);
    ctx.quadraticCurveTo(q, -q, r, 0);
    ctx.quadraticCurveTo(q, q, 0, r);
    ctx.quadraticCurveTo(-q, q, -r, 0);
    ctx.quadraticCurveTo(-q, -q, 0, -r);
    ctx.closePath();
    ctx.fillStyle = o.c;
    ctx.fill();
    circle(ctx, 0, 0, 3, '#fff6d8');
  },
  moon(ctx, o) {
    // Crescent via an even-odd path: the offset disc cuts the bite out of the
    // filled shape itself, never out of whatever was painted underneath.
    ctx.beginPath();
    ctx.arc(0, 0, 17, 0, Math.PI * 2);
    ctx.arc(8, -5, 14, 0, Math.PI * 2);
    ctx.fillStyle = o.c;
    ctx.fill('evenodd');
  },
  clock(ctx, o) {
    circle(ctx, 0, 0, 20, '#e8dfc8');
    ctx.lineWidth = 4;
    ctx.strokeStyle = o.c;
    ctx.beginPath();
    ctx.arc(0, 0, 20, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = '#2b2b26';
    ctx.lineWidth = 2;
    for (let i = 0; i < 12; i += 1) {
      const a = (Math.PI / 6) * i;
      ctx.beginPath();
      ctx.moveTo(Math.sin(a) * 15, -Math.cos(a) * 15);
      ctx.lineTo(Math.sin(a) * 18, -Math.cos(a) * 18);
      ctx.stroke();
    }
    const [hour, minute] = o.t ?? [10, 10];
    const ha = ((hour % 12) + minute / 60) * (Math.PI / 6);
    const ma = minute * (Math.PI / 30);
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(Math.sin(ha) * 10, -Math.cos(ha) * 10);
    ctx.stroke();
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(Math.sin(ma) * 15, -Math.cos(ma) * 15);
    ctx.stroke();
    circle(ctx, 0, 0, 2.5, o.c);
  },
  bottle(ctx, o) {
    ctx.beginPath();
    ctx.moveTo(-5, -22);
    ctx.lineTo(5, -22);
    ctx.lineTo(5, -8);
    ctx.quadraticCurveTo(13, -2, 13, 8);
    ctx.lineTo(13, 20);
    ctx.quadraticCurveTo(13, 24, 9, 24);
    ctx.lineTo(-9, 24);
    ctx.quadraticCurveTo(-13, 24, -13, 20);
    ctx.lineTo(-13, 8);
    ctx.quadraticCurveTo(-13, -2, -5, -8);
    ctx.closePath();
    ctx.fillStyle = o.c;
    ctx.fill();
    const level = (o.n ?? 5) / 10;
    ctx.fillStyle = o.c2 ?? '#7fd4ff';
    ctx.fillRect(-10, 24 - 30 * level, 20, 30 * level - 2);
    roundRect(ctx, -5, -28, 10, 7, 2, '#c9a06a');
  },
  book(ctx, o) {
    roundRect(ctx, -16, -6, 32, 13, 2, o.c);
    roundRect(ctx, -14, -17, 28, 11, 2, o.c2 ?? '#7a4a8c');
    ctx.fillStyle = '#efe6cf';
    ctx.fillRect(-16, -8, 32, 2.5);
    ctx.fillRect(-14, -19, 28, 2.5);
    ctx.fillStyle = '#f5c542';
    ctx.fillRect(6, -17, 4, 11);
  },
  key(ctx, o) {
    ctx.strokeStyle = o.c;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(-10, 0, 8, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-3, 0);
    ctx.lineTo(18, 0);
    ctx.moveTo(12, 0);
    ctx.lineTo(12, 8);
    ctx.moveTo(18, 0);
    ctx.lineTo(18, 9);
    ctx.stroke();
  },
  compass(ctx, o) {
    circle(ctx, 0, 0, 18, '#e8dfc8');
    ctx.lineWidth = 3;
    ctx.strokeStyle = o.c;
    ctx.beginPath();
    ctx.arc(0, 0, 18, 0, Math.PI * 2);
    ctx.stroke();
    const a = o.rot ?? -0.6;
    ctx.fillStyle = '#c33';
    ctx.beginPath();
    ctx.moveTo(Math.sin(a) * 13, -Math.cos(a) * 13);
    ctx.lineTo(Math.sin(a + 2.6) * 6, -Math.cos(a + 2.6) * 6);
    ctx.lineTo(Math.sin(a - 2.6) * 6, -Math.cos(a - 2.6) * 6);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#335';
    ctx.beginPath();
    const b = a + Math.PI;
    ctx.moveTo(Math.sin(b) * 13, -Math.cos(b) * 13);
    ctx.lineTo(Math.sin(b + 2.6) * 6, -Math.cos(b + 2.6) * 6);
    ctx.lineTo(Math.sin(b - 2.6) * 6, -Math.cos(b - 2.6) * 6);
    ctx.closePath();
    ctx.fill();
  },
  candle(ctx, o) {
    const h = 14 + (o.n ?? 3) * 4;
    roundRect(ctx, -7, 20 - h, 14, h, 3, o.c);
    ctx.beginPath();
    ctx.ellipse(0, 14 - h, 5, 9, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#ffb347';
    ctx.fill();
    circle(ctx, 0, 16 - h, 2.5, '#fff3b0');
    roundRect(ctx, -13, 19, 26, 5, 2, '#8a6d3b');
  },
  crystal(ctx, o) {
    ctx.beginPath();
    ctx.moveTo(0, -22);
    ctx.lineTo(13, -6);
    ctx.lineTo(8, 20);
    ctx.lineTo(-8, 20);
    ctx.lineTo(-13, -6);
    ctx.closePath();
    ctx.fillStyle = o.c;
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(0, -22);
    ctx.lineTo(4, 20);
    ctx.lineTo(-4, 20);
    ctx.closePath();
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-13, -6);
    ctx.lineTo(13, -6);
    ctx.strokeStyle = 'rgba(255,255,255,0.6)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  },
  shell(ctx, o) {
    ctx.fillStyle = o.c;
    ctx.beginPath();
    ctx.moveTo(0, 20);
    ctx.bezierCurveTo(-22, 12, -20, -14, 0, -18);
    ctx.bezierCurveTo(20, -14, 22, 12, 0, 20);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = 'rgba(60,30,20,0.45)';
    ctx.lineWidth = 2;
    for (let i = 1; i <= 4; i += 1) {
      ctx.beginPath();
      ctx.moveTo(-16 + i * 2, 14 - i * 2);
      ctx.quadraticCurveTo(0, -6 - i * 2, 16 - i * 2, 14 - i * 2);
      ctx.stroke();
    }
    circle(ctx, 0, -14, 3.5, o.c2 ?? '#fff1d6');
  },
  fish(ctx, o) {
    ctx.fillStyle = o.c;
    ctx.beginPath();
    ctx.ellipse(0, 0, 19, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(15, 0);
    ctx.lineTo(26, -10);
    ctx.lineTo(26, 10);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-2, -8);
    ctx.quadraticCurveTo(4, -16, 10, -8);
    ctx.closePath();
    ctx.fillStyle = o.c2 ?? o.c;
    ctx.fill();
    circle(ctx, -10, -2, 2.6, '#10131a');
  },
  bird(ctx, o) {
    ctx.fillStyle = o.c;
    ctx.beginPath();
    ctx.ellipse(0, 2, 13, 8, -0.25, 0, Math.PI * 2);
    ctx.fill();
    circle(ctx, 11, -5, 6, o.c);
    ctx.beginPath();
    ctx.moveTo(16, -5);
    ctx.lineTo(23, -3);
    ctx.lineTo(16, -1);
    ctx.closePath();
    ctx.fillStyle = '#f5c542';
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-10, 0);
    ctx.lineTo(-24, -8);
    ctx.lineTo(-20, 4);
    ctx.lineTo(-26, 8);
    ctx.closePath();
    ctx.fillStyle = o.c;
    ctx.fill();
    circle(ctx, 12, -6, 1.6, '#10131a');
  },
  bell(ctx, o) {
    ctx.beginPath();
    ctx.moveTo(0, -18);
    ctx.quadraticCurveTo(14, -16, 14, 2);
    ctx.quadraticCurveTo(14, 12, 19, 15);
    ctx.lineTo(-19, 15);
    ctx.quadraticCurveTo(-14, 12, -14, 2);
    ctx.quadraticCurveTo(-14, -16, 0, -18);
    ctx.closePath();
    ctx.fillStyle = o.c;
    ctx.fill();
    circle(ctx, 0, 20, 4.5, o.c2 ?? '#8a6d3b');
    circle(ctx, 0, -20, 3, '#8a6d3b');
  },
  plant(ctx, o) {
    const leaves = o.n ?? 4;
    ctx.strokeStyle = '#3f9e4d';
    ctx.lineWidth = 3;
    for (let i = 0; i < leaves; i += 1) {
      const a = -Math.PI / 2 + (i - (leaves - 1) / 2) * 0.5;
      ctx.beginPath();
      ctx.moveTo(0, 6);
      ctx.quadraticCurveTo(Math.cos(a) * 12, 6 + Math.sin(a) * 12, Math.cos(a) * 19, 6 + Math.sin(a) * 21);
      ctx.stroke();
      circle(ctx, Math.cos(a) * 19, 6 + Math.sin(a) * 21, 4, '#57c96b');
    }
    ctx.beginPath();
    ctx.moveTo(-11, 6);
    ctx.lineTo(11, 6);
    ctx.lineTo(8, 22);
    ctx.lineTo(-8, 22);
    ctx.closePath();
    ctx.fillStyle = o.c;
    ctx.fill();
  },
  telescope(ctx, o) {
    ctx.save();
    ctx.rotate(o.rot ?? -0.5);
    roundRect(ctx, -24, -6, 48, 12, 6, o.c);
    roundRect(ctx, 14, -8, 16, 16, 4, o.c2 ?? '#8a6d3b');
    ctx.restore();
    ctx.strokeStyle = '#2c2f38';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, 4);
    ctx.lineTo(-11, 24);
    ctx.moveTo(0, 4);
    ctx.lineTo(11, 24);
    ctx.moveTo(0, 4);
    ctx.lineTo(0, 24);
    ctx.stroke();
  },
  globe(ctx, o) {
    circle(ctx, 0, -2, 17, o.c);
    ctx.strokeStyle = 'rgba(16,32,48,0.55)';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.ellipse(0, -2, 7, 17, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-17, -2);
    ctx.lineTo(17, -2);
    ctx.moveTo(-14, -11);
    ctx.lineTo(14, -11);
    ctx.moveTo(-14, 7);
    ctx.lineTo(14, 7);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, 15);
    ctx.lineTo(0, 20);
    ctx.moveTo(-10, 23);
    ctx.lineTo(10, 23);
    ctx.strokeStyle = '#8a6d3b';
    ctx.lineWidth = 3;
    ctx.stroke();
  },
  cup(ctx, o) {
    ctx.strokeStyle = 'rgba(255,255,255,0.65)';
    ctx.lineWidth = 2;
    const steam = o.n ?? 2;
    for (let i = 0; i < steam; i += 1) {
      const sx = -6 + i * (12 / Math.max(1, steam - 1 || 1));
      ctx.beginPath();
      ctx.moveTo(sx, -12);
      ctx.quadraticCurveTo(sx + 4, -18, sx, -24);
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.moveTo(-14, -10);
    ctx.lineTo(14, -10);
    ctx.quadraticCurveTo(13, 10, 6, 12);
    ctx.lineTo(-6, 12);
    ctx.quadraticCurveTo(-13, 10, -14, -10);
    ctx.closePath();
    ctx.fillStyle = o.c;
    ctx.fill();
    ctx.beginPath();
    ctx.arc(17, -2, 6, -Math.PI / 2, Math.PI / 2);
    ctx.strokeStyle = o.c;
    ctx.lineWidth = 3.5;
    ctx.stroke();
    roundRect(ctx, -16, 14, 32, 4, 2, o.c2 ?? '#8a6d3b');
  },
  scroll(ctx, o) {
    roundRect(ctx, -20, -11, 40, 22, 9, '#efe3c2');
    roundRect(ctx, -20, -11, 40, 6, 3, '#e0cfa0');
    roundRect(ctx, -20, 5, 40, 6, 3, '#e0cfa0');
    ctx.strokeStyle = o.c;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-12, -1);
    ctx.lineTo(8, -1);
    ctx.moveTo(-12, 3);
    ctx.lineTo(2, 3);
    ctx.stroke();
    ctx.fillStyle = o.c;
    ctx.fillRect(12, -8, 4, 16);
  },
  mushroom(ctx, o) {
    ctx.beginPath();
    ctx.arc(0, 2, 19, Math.PI, 0);
    ctx.quadraticCurveTo(19, 8, 10, 8);
    ctx.lineTo(-10, 8);
    ctx.quadraticCurveTo(-19, 8, -19, 2);
    ctx.closePath();
    ctx.fillStyle = o.c;
    ctx.fill();
    const spots = o.n ?? 3;
    ctx.fillStyle = '#fff4e0';
    const spotAt = [[-9, -4], [4, -9], [11, 0], [-2, -1], [-14, 1]];
    for (let i = 0; i < spots; i += 1) circle(ctx, spotAt[i][0], spotAt[i][1], 2.8, '#fff4e0');
    roundRect(ctx, -6, 8, 12, 13, 4, '#efe3c2');
  },
  anchor(ctx, o) {
    ctx.strokeStyle = o.c;
    ctx.lineWidth = 4.5;
    ctx.beginPath();
    ctx.arc(0, -15, 5, 0, Math.PI * 2);
    ctx.moveTo(0, -10);
    ctx.lineTo(0, 16);
    ctx.moveTo(-11, -4);
    ctx.lineTo(11, -4);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-16, 6);
    ctx.quadraticCurveTo(-15, 19, 0, 20);
    ctx.quadraticCurveTo(15, 19, 16, 6);
    ctx.moveTo(-16, 6);
    ctx.lineTo(-11, 12);
    ctx.moveTo(16, 6);
    ctx.lineTo(11, 12);
    ctx.stroke();
  },
  kite(ctx, o) {
    ctx.beginPath();
    ctx.moveTo(0, -20);
    ctx.lineTo(13, -4);
    ctx.lineTo(0, 16);
    ctx.lineTo(-13, -4);
    ctx.closePath();
    ctx.fillStyle = o.c;
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(0, -20);
    ctx.lineTo(0, 16);
    ctx.moveTo(-13, -4);
    ctx.lineTo(13, -4);
    ctx.strokeStyle = 'rgba(255,255,255,0.55)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.strokeStyle = o.c2 ?? '#d9d4c5';
    ctx.beginPath();
    ctx.moveTo(0, 16);
    ctx.quadraticCurveTo(6, 24, 0, 30);
    ctx.stroke();
  },
  orb(ctx, o) {
    const glow = ctx.createRadialGradient(0, -4, 2, 0, -4, 26);
    glow.addColorStop(0, 'rgba(160,230,255,0.5)');
    glow.addColorStop(1, 'rgba(160,230,255,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(-28, -32, 56, 56);
    circle(ctx, 0, -4, 13, o.c);
    circle(ctx, -4, -8, 4, 'rgba(255,255,255,0.7)');
    ctx.beginPath();
    ctx.moveTo(-9, 8);
    ctx.lineTo(9, 8);
    ctx.lineTo(5, 18);
    ctx.lineTo(-5, 18);
    ctx.closePath();
    ctx.fillStyle = '#8a6d3b';
    ctx.fill();
    roundRect(ctx, -11, 18, 22, 4, 2, '#5d4a26');
  },
};

/** Draw one object, honouring flip and scale, in scene coordinates. */
export function drawObject(ctx, o) {
  const draw = OBJECT_DRAWERS[o.kind];
  if (!draw) return;
  ctx.save();
  ctx.translate(o.x, o.y);
  if (o.flip) ctx.scale(-1, 1);
  const s = o.s ?? 1;
  ctx.scale(s, s);
  if (o.rot && (o.kind === 'gear')) ctx.rotate(0); // gear uses rot internally
  draw(ctx, o);
  ctx.restore();
}

/** The right-hand variant of an object: apply its difference mutation, if any. */
export function variantOf(o, diff) {
  if (!diff) return o;
  if (diff.type === 'color') return { ...o, c: diff.to };
  if (diff.type === 'detail') return { ...o, ...(diff.alt ?? {}) };
  if (diff.type === 'flip') return { ...o, flip: !o.flip };
  return o;
}

/** Paint the backdrop: sky, structure silhouette, floor or floodwater, decor. */
export function drawBackground(ctx, scene) {
  const grad = ctx.createLinearGradient(0, 0, 0, SCENE_H);
  grad.addColorStop(0, scene.sky[0]);
  grad.addColorStop(0.62, scene.sky[1]);
  grad.addColorStop(1, scene.sky[2]);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, SCENE_W, SCENE_H);

  const rand = seededRandom(scene.seed);
  ctx.fillStyle = 'rgba(255,246,216,0.85)';
  for (let i = 0; i < 42; i += 1) {
    const x = rand() * SCENE_W;
    const y = rand() * 190;
    const r = rand() * 1.5 + 0.4;
    ctx.globalAlpha = 0.25 + rand() * 0.6;
    ctx.fillRect(x, y, r, r);
  }
  ctx.globalAlpha = 1;

  ctx.fillStyle = scene.silhouette;
  if (scene.structure === 'dome') {
    ctx.beginPath();
    ctx.arc(300, 330, 215, Math.PI, 0);
    ctx.fill();
    ctx.fillRect(85, 322, 430, 14);
    for (let i = 0; i < 7; i += 1) ctx.fillRect(104 + i * 66, 336, 16, 74);
    circle(ctx, 300, 108, 13, scene.silhouette);
    ctx.fillRect(297, 118, 6, 22);
  } else if (scene.structure === 'arches') {
    // One even-odd silhouette: a solid arcade wall with four arch openings
    // cut out of the path itself, so the sky shows through untouched.
    ctx.beginPath();
    ctx.rect(0, 130, SCENE_W, 282);
    for (let i = 0; i < 4; i += 1) {
      const x = 30 + i * 148;
      ctx.moveTo(x, 412);
      ctx.lineTo(x, 300);
      ctx.arc(x + 55, 300, 55, Math.PI, 0);
      ctx.lineTo(x + 110, 412);
      ctx.closePath();
    }
    ctx.fillStyle = scene.silhouette;
    ctx.fill('evenodd');
  } else if (scene.structure === 'terrace') {
    ctx.fillRect(0, 330, SCENE_W, 10);
    for (let i = 0; i < 16; i += 1) ctx.fillRect(12 + i * 38, 340, 9, 46);
    ctx.fillRect(0, 386, SCENE_W, 10);
    ctx.fillRect(18, 120, 20, 220);
    ctx.fillRect(562, 120, 20, 220);
    ctx.fillRect(0, 104, SCENE_W, 16);
  } else if (scene.structure === 'tower') {
    ctx.beginPath();
    ctx.moveTo(60, 410);
    ctx.lineTo(88, 150);
    ctx.lineTo(132, 150);
    ctx.lineTo(160, 410);
    ctx.closePath();
    ctx.fill();
    ctx.fillRect(78, 128, 64, 24);
    ctx.beginPath();
    ctx.moveTo(72, 128);
    ctx.lineTo(110, 92);
    ctx.lineTo(148, 128);
    ctx.closePath();
    ctx.fill();
    ctx.fillRect(430, 250, 170, 160);
    ctx.beginPath();
    ctx.moveTo(420, 250);
    ctx.lineTo(515, 205);
    ctx.lineTo(610, 250);
    ctx.closePath();
    ctx.fill();
  } else {
    // roofs: a skyline of rooftops, chimneys and a water tower
    const base = 348;
    const blocks = [[0, 90, 120], [105, 130, 95], [225, 80, 140], [345, 120, 100], [455, 85, 125], [565, 40, 110]];
    for (const [x, w, h] of blocks) ctx.fillRect(x, base - h, w, h);
    ctx.fillRect(140, base - 150, 14, 55);
    ctx.fillRect(392, base - 145, 14, 45);
    ctx.fillRect(492, base - 190, 46, 34);
    ctx.fillRect(498, base - 156, 6, 30);
    ctx.fillRect(526, base - 156, 6, 30);
    ctx.fillRect(0, base, SCENE_W, 8);
  }

  // string lights sagging across the top of the scene
  ctx.strokeStyle = 'rgba(12,14,20,0.8)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-10, 26);
  ctx.quadraticCurveTo(300, 92, 610, 20);
  ctx.stroke();
  const bulbs = 13;
  for (let i = 0; i < bulbs; i += 1) {
    const t = (i + 0.5) / bulbs;
    const x = -10 + 620 * t;
    const y = 26 + (20 - 26) * t + Math.sin(Math.PI * t) * 44 + 4;
    circle(ctx, x, y, 3.4, i % 2 ? '#ffd678' : '#ff9d76');
  }

  if (scene.water) {
    const water = ctx.createLinearGradient(0, 396, 0, SCENE_H);
    water.addColorStop(0, scene.water);
    water.addColorStop(1, '#0a1626');
    ctx.fillStyle = water;
    ctx.fillRect(0, 396, SCENE_W, SCENE_H - 396);
    ctx.strokeStyle = 'rgba(190,230,255,0.35)';
    ctx.lineWidth = 1.6;
    const wrand = seededRandom(scene.seed + 7);
    for (let i = 0; i < 12; i += 1) {
      const y = 404 + wrand() * 40;
      const x = wrand() * 520;
      const len = 24 + wrand() * 60;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + len, y);
      ctx.stroke();
    }
  } else {
    ctx.fillStyle = 'rgba(0,0,0,0.28)';
    ctx.fillRect(0, 410, SCENE_W, 40);
    ctx.fillStyle = 'rgba(255,255,255,0.07)';
    ctx.fillRect(0, 410, SCENE_W, 3);
  }
}

/**
 * Paint a whole panel. `side` is 'left' or 'right'; on the right the scene's
 * differences are applied. `foundIds` draws the ring markers, `hint` pulses.
 */
export function drawScene(ctx, scene, side, foundIds, hintId, nowMs) {
  ctx.clearRect(0, 0, SCENE_W, SCENE_H);
  drawBackground(ctx, scene);
  const diffByObject = new Map();
  for (const diff of scene.diffs) diffByObject.set(diff.obj, diff);
  for (const o of scene.objects) {
    const diff = diffByObject.get(o.id);
    if (side === 'right' && diff?.type === 'removed') continue;
    if (side === 'left' && diff?.type === 'extra') continue;
    const variant = side === 'right' ? variantOf(o, diff) : o;
    drawObject(ctx, variant);
  }
  // found markers: a satisfying double ring with a check, gently pulsing
  for (const diff of scene.diffs) {
    if (!foundIds.has(diff.id)) continue;
    const pulse = 1 + Math.sin(nowMs / 280) * 0.05;
    ctx.save();
    ctx.translate(diff.x, diff.y);
    ctx.scale(pulse, pulse);
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#51e07a';
    ctx.beginPath();
    ctx.arc(0, 0, diff.r + 7, 0, Math.PI * 2);
    ctx.stroke();
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgba(255,255,255,0.85)';
    ctx.beginPath();
    ctx.arc(0, 0, diff.r + 12, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = '#eafff0';
    ctx.lineWidth = 4.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-diff.r * 0.42, 0);
    ctx.lineTo(-diff.r * 0.12, diff.r * 0.34);
    ctx.lineTo(diff.r * 0.46, -diff.r * 0.32);
    ctx.stroke();
    ctx.restore();
  }
  // hint pulse: expanding rings around the hinted difference
  if (hintId) {
    const diff = scene.diffs.find((d) => d.id === hintId);
    if (diff) {
      const phase = (nowMs % 900) / 900;
      for (let k = 0; k < 2; k += 1) {
        const p = (phase + k * 0.5) % 1;
        ctx.save();
        ctx.globalAlpha = 1 - p;
        ctx.lineWidth = 4;
        ctx.strokeStyle = '#ffd94d';
        ctx.beginPath();
        ctx.arc(diff.x, diff.y, diff.r + 6 + p * 30, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }
    }
  }
}
