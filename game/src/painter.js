// Tideglass Observatory — procedural painter.
// All art is drawn from scene data on a 2D canvas: no image files, so the
// left and right panels can never drift apart except where a difference
// says so. Each object kind has one small painter below; drawPanel renders
// a whole panel for one side, applying the scene's differences on the right.

import { PANEL_H, PANEL_W } from './scenes.js';

function circle(ctx, x, y, r, fill) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = fill;
  ctx.fill();
}

function line(ctx, x1, y1, x2, y2, stroke, width) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.strokeStyle = stroke;
  ctx.lineWidth = width;
  ctx.stroke();
}

function rect(ctx, x, y, w, h, fill) {
  ctx.fillStyle = fill;
  ctx.fillRect(x, y, w, h);
}

function hand(ctx, cx, cy, angleDeg, len, stroke, width) {
  const a = ((angleDeg - 90) * Math.PI) / 180;
  line(ctx, cx, cy, cx + Math.cos(a) * len, cy + Math.sin(a) * len, stroke, width);
}

const PAINTERS = {
  dome(ctx, o, p) {
    const s = p.size || 180;
    ctx.beginPath();
    ctx.arc(o.x, o.y + s * 0.28, s / 2, Math.PI, 0);
    ctx.fillStyle = p.color;
    ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.35)';
    ctx.lineWidth = 3;
    ctx.stroke();
    for (let i = -2; i <= 2; i += 1) {
      line(ctx, o.x + i * s * 0.18, o.y + s * 0.28, o.x + i * s * 0.1, o.y - s * 0.34, 'rgba(0,0,0,0.22)', 2);
    }
    rect(ctx, o.x - s / 2, o.y + s * 0.28, s, 8, 'rgba(0,0,0,0.3)');
    circle(ctx, o.x, o.y - s * 0.52, 7, '#ffe9a8');
    line(ctx, o.x, o.y - s * 0.36, o.x, o.y - s * 0.48, '#ffe9a8', 3);
  },

  arch(ctx, o, p) {
    const s = p.size || 280;
    ctx.beginPath();
    ctx.arc(o.x, o.y, s / 2, Math.PI, 0);
    ctx.lineTo(o.x + s / 2, o.y + s * 0.62);
    ctx.lineTo(o.x - s / 2, o.y + s * 0.62);
    ctx.closePath();
    ctx.fillStyle = p.color;
    ctx.globalAlpha = 0.5;
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.strokeStyle = 'rgba(0,0,0,0.4)';
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(o.x, o.y, s * 0.34, Math.PI, 0);
    ctx.strokeStyle = 'rgba(255,233,168,0.5)';
    ctx.lineWidth = 3;
    ctx.stroke();
  },

  tower(ctx, o, p) {
    const s = p.size || 200;
    rect(ctx, o.x - s * 0.16, o.y - s * 0.4, s * 0.32, s * 0.8, p.color);
    ctx.beginPath();
    ctx.moveTo(o.x - s * 0.22, o.y - s * 0.4);
    ctx.lineTo(o.x, o.y - s * 0.62);
    ctx.lineTo(o.x + s * 0.22, o.y - s * 0.4);
    ctx.closePath();
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.fill();
    rect(ctx, o.x - 9, o.y - s * 0.18, 18, 26, '#ffe9a8');
    rect(ctx, o.x - 7, o.y + s * 0.12, 14, 20, 'rgba(0,0,0,0.4)');
  },

  clock(ctx, o, p) {
    const s = p.size || 60;
    circle(ctx, o.x, o.y, s / 2 + 5, p.color);
    circle(ctx, o.x, o.y, s / 2, '#f6efdc');
    for (let i = 0; i < 12; i += 1) {
      const a = (i * Math.PI) / 6;
      const r1 = s / 2 - 5;
      const r2 = s / 2 - (i % 3 === 0 ? 11 : 8);
      line(ctx, o.x + Math.cos(a) * r2, o.y + Math.sin(a) * r2, o.x + Math.cos(a) * r1, o.y + Math.sin(a) * r1, '#3a3125', 2);
    }
    hand(ctx, o.x, o.y, ((p.hour || 0) % 12) * 30 + (p.min || 0) * 0.5, s * 0.26, '#2c2418', 5);
    hand(ctx, o.x, o.y, (p.min || 0) * 6, s * 0.4, '#2c2418', 3);
    circle(ctx, o.x, o.y, 4, '#8a5a24');
  },

  gear(ctx, o, p) {
    const s = p.size || 44;
    const teeth = p.teeth || 8;
    ctx.save();
    ctx.translate(o.x, o.y);
    ctx.fillStyle = p.color;
    for (let i = 0; i < teeth; i += 1) {
      ctx.save();
      ctx.rotate((i * Math.PI * 2) / teeth);
      ctx.fillRect(-s * 0.09, -s * 0.62, s * 0.18, s * 0.24);
      ctx.restore();
    }
    ctx.beginPath();
    ctx.arc(0, 0, s * 0.44, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(0, 0, s * 0.18, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0,0,0,0.45)';
    ctx.fill();
    ctx.restore();
  },

  telescope(ctx, o, p) {
    const tilt = ((p.tilt || -30) * Math.PI) / 180;
    ctx.save();
    ctx.translate(o.x, o.y);
    line(ctx, 0, 6, -14, 44, '#3c4654', 5);
    line(ctx, 0, 6, 14, 44, '#3c4654', 5);
    ctx.rotate(tilt);
    ctx.fillStyle = p.color;
    ctx.fillRect(-52, -10, 92, 20);
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.fillRect(28, -10, 12, 20);
    ctx.fillStyle = '#2c3644';
    ctx.fillRect(-60, -7, 10, 14);
    ctx.restore();
  },

  lantern(ctx, o, p) {
    line(ctx, o.x, o.y - 30, o.x, o.y - 14, '#20242c', 3);
    rect(ctx, o.x - 13, o.y - 14, 26, 34, '#20242c');
    if (p.lit) {
      const g = ctx.createRadialGradient(o.x, o.y + 3, 2, o.x, o.y + 3, 30);
      g.addColorStop(0, 'rgba(255,214,110,0.95)');
      g.addColorStop(1, 'rgba(255,214,110,0)');
      circle(ctx, o.x, o.y + 3, 30, g);
      rect(ctx, o.x - 8, o.y - 8, 16, 22, p.color);
    } else {
      rect(ctx, o.x - 8, o.y - 8, 16, 22, 'rgba(160,170,180,0.35)');
    }
    rect(ctx, o.x - 15, o.y + 20, 30, 5, '#20242c');
  },

  candle(ctx, o, p) {
    const h = p.height || 28;
    rect(ctx, o.x - 8, o.y + 20 - h, 16, h, p.color);
    rect(ctx, o.x - 13, o.y + 18, 26, 5, '#6b5636');
    if (p.lit) {
      ctx.beginPath();
      ctx.ellipse(o.x, o.y + 8 - h, 5, 9, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#ffb347';
      ctx.fill();
      circle(ctx, o.x, o.y + 10 - h, 2.5, '#fff3c4');
    }
    line(ctx, o.x, o.y + 16 - h, o.x, o.y + 12 - h, '#3a3125', 2);
  },

  bottle(ctx, o, p) {
    const s = p.size || 36;
    const fill = Math.max(0, Math.min(1, p.fill == null ? 0.5 : p.fill));
    ctx.beginPath();
    ctx.moveTo(o.x - 5, o.y - s * 0.62);
    ctx.lineTo(o.x + 5, o.y - s * 0.62);
    ctx.lineTo(o.x + 5, o.y - s * 0.3);
    ctx.quadraticCurveTo(o.x + s * 0.34, o.y - s * 0.1, o.x + s * 0.3, o.y + s * 0.42);
    ctx.lineTo(o.x - s * 0.3, o.y + s * 0.42);
    ctx.quadraticCurveTo(o.x - s * 0.34, o.y - s * 0.1, o.x - 5, o.y - s * 0.3);
    ctx.closePath();
    ctx.fillStyle = 'rgba(190,225,235,0.4)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(230,245,250,0.7)';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.save();
    ctx.clip();
    rect(ctx, o.x - s * 0.32, o.y + s * 0.44 - fill * s * 0.72, s * 0.64, fill * s * 0.72, p.color);
    ctx.restore();
    rect(ctx, o.x - 6, o.y - s * 0.72, 12, 8, '#8a6a42');
  },

  compass(ctx, o, p) {
    const s = p.size || 30;
    circle(ctx, o.x, o.y, s / 2 + 4, '#5e4a22');
    circle(ctx, o.x, o.y, s / 2, '#f3ecd8');
    for (let i = 0; i < 4; i += 1) hand(ctx, o.x, o.y, i * 90, s * 0.4, '#9a8a68', 2);
    hand(ctx, o.x, o.y, p.needle || 0, s * 0.42, '#b03a30', 4);
    hand(ctx, o.x, o.y, (p.needle || 0) + 180, s * 0.3, '#33506e', 4);
    circle(ctx, o.x, o.y, 3.5, '#5e4a22');
  },
};

// Second half of the painter table: scenery and dressing objects.
Object.assign(PAINTERS, {
  window(ctx, o, p) {
    const s = p.size || 32;
    rect(ctx, o.x - s / 2, o.y - s / 2, s, s * 1.2, p.color);
    ctx.strokeStyle = '#4a3b28';
    ctx.lineWidth = 4;
    ctx.strokeRect(o.x - s / 2, o.y - s / 2, s, s * 1.2);
    line(ctx, o.x, o.y - s / 2, o.x, o.y + s * 0.7, '#4a3b28', 3);
    line(ctx, o.x - s / 2, o.y + s * 0.1, o.x + s / 2, o.y + s * 0.1, '#4a3b28', 3);
    ctx.beginPath();
    ctx.arc(o.x, o.y - s / 2, s / 2, Math.PI, 0);
    ctx.fillStyle = p.color;
    ctx.fill();
  },

  railing(ctx, o, p) {
    const w = p.size || 520;
    line(ctx, o.x - w / 2, o.y, o.x + w / 2, o.y, p.color, 6);
    for (let x = o.x - w / 2 + 14; x < o.x + w / 2; x += 34) {
      line(ctx, x, o.y, x, o.y + 18, p.color, 4);
    }
  },

  boat(ctx, o, p) {
    const s = p.size || 100;
    ctx.beginPath();
    ctx.moveTo(o.x - s / 2, o.y - 8);
    ctx.lineTo(o.x + s / 2, o.y - 8);
    ctx.lineTo(o.x + s * 0.34, o.y + 16);
    ctx.lineTo(o.x - s * 0.34, o.y + 16);
    ctx.closePath();
    ctx.fillStyle = p.color;
    ctx.fill();
    line(ctx, o.x, o.y - 8, o.x, o.y - s * 0.52, '#4a3b28', 4);
    ctx.beginPath();
    ctx.moveTo(o.x, o.y - s * 0.52);
    ctx.lineTo(o.x, o.y - 12);
    ctx.lineTo(o.x + s * 0.26, o.y - 12);
    ctx.closePath();
    ctx.fillStyle = '#e8e0c8';
    ctx.fill();
  },

  moon(ctx, o, p) {
    const s = p.size || 24;
    circle(ctx, o.x, o.y, s, p.color);
    circle(ctx, o.x + s * 0.45, o.y - s * 0.3, s * 0.78, 'rgba(20,28,54,0.92)');
  },

  star(ctx, o, p) {
    const n = p.count || 4;
    const spread = p.spread || 50;
    ctx.fillStyle = p.color;
    for (let i = 0; i < n; i += 1) {
      const dx = ((i * 37) % spread) - spread / 2;
      const dy = ((i * 23) % 30) - 15;
      const r = 2 + ((i * 7) % 3);
      const x = o.x + dx;
      const y = o.y + dy;
      ctx.beginPath();
      ctx.moveTo(x, y - r * 2);
      ctx.lineTo(x + r * 0.6, y - r * 0.6);
      ctx.lineTo(x + r * 2, y);
      ctx.lineTo(x + r * 0.6, y + r * 0.6);
      ctx.lineTo(x, y + r * 2);
      ctx.lineTo(x - r * 0.6, y + r * 0.6);
      ctx.lineTo(x - r * 2, y);
      ctx.lineTo(x - r * 0.6, y - r * 0.6);
      ctx.closePath();
      ctx.fill();
    }
  },

  cloud(ctx, o, p) {
    const s = p.size || 64;
    ctx.fillStyle = p.color;
    for (const [dx, dy, r] of [[-0.3, 0.08, 0.26], [0, -0.08, 0.34], [0.3, 0.06, 0.27], [0.05, 0.14, 0.3]]) {
      ctx.beginPath();
      ctx.arc(o.x + dx * s, o.y + dy * s, r * s, 0, Math.PI * 2);
      ctx.fill();
    }
  },

  steam(ctx, o, p) {
    const n = p.count || 3;
    ctx.strokeStyle = p.color;
    ctx.globalAlpha = 0.75;
    ctx.lineWidth = 4;
    for (let i = 0; i < n; i += 1) {
      const x = o.x + (i - (n - 1) / 2) * 16;
      ctx.beginPath();
      ctx.moveTo(x, o.y + 16);
      ctx.bezierCurveTo(x - 8, o.y + 2, x + 8, o.y - 8, x, o.y - 24);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  },

  leaf(ctx, o, p) {
    const n = p.count || 3;
    for (let i = 0; i < n; i += 1) {
      const x = o.x + (i - (n - 1) / 2) * 20;
      const y = o.y + ((i * 13) % 12) - 6;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(-0.5 + (i % 3) * 0.4);
      ctx.beginPath();
      ctx.ellipse(0, 0, 6, 12, 0, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.fill();
      ctx.restore();
    }
  },

  book(ctx, o, p) {
    const s = p.size || 32;
    ctx.save();
    ctx.translate(o.x, o.y);
    ctx.rotate(-0.08);
    rect(ctx, -s / 2, -s * 0.4, s, s * 0.8, p.color);
    rect(ctx, -s / 2, -s * 0.4, 6, s * 0.8, 'rgba(0,0,0,0.35)');
    rect(ctx, -s * 0.2, -s * 0.22, s * 0.55, 5, 'rgba(255,240,200,0.75)');
    rect(ctx, -s * 0.2, -s * 0.02, s * 0.55, 5, 'rgba(255,240,200,0.55)');
    rect(ctx, -s * 0.2, s * 0.18, s * 0.4, 5, 'rgba(255,240,200,0.4)');
    ctx.restore();
  },

  bell(ctx, o, p) {
    const s = p.size || 24;
    ctx.beginPath();
    ctx.moveTo(o.x - s * 0.55, o.y + s * 0.4);
    ctx.quadraticCurveTo(o.x - s * 0.5, o.y - s * 0.5, o.x, o.y - s * 0.55);
    ctx.quadraticCurveTo(o.x + s * 0.5, o.y - s * 0.5, o.x + s * 0.55, o.y + s * 0.4);
    ctx.closePath();
    ctx.fillStyle = p.color;
    ctx.fill();
    rect(ctx, o.x - s * 0.66, o.y + s * 0.4, s * 1.32, 5, 'rgba(0,0,0,0.3)');
    circle(ctx, o.x, o.y + s * 0.62, 4.5, '#8a6a20');
    circle(ctx, o.x, o.y - s * 0.68, 4, p.color);
  },

  banner(ctx, o, p) {
    const s = p.size || 50;
    line(ctx, o.x - s * 0.7, o.y - s * 0.6, o.x + s * 0.7, o.y - s * 0.6, '#3a3125', 3);
    ctx.beginPath();
    ctx.moveTo(o.x - s / 2, o.y - s * 0.6);
    ctx.lineTo(o.x + s / 2, o.y - s * 0.6);
    ctx.lineTo(o.x + s / 2, o.y + s * 0.4);
    ctx.lineTo(o.x, o.y + s * 0.72);
    ctx.lineTo(o.x - s / 2, o.y + s * 0.4);
    ctx.closePath();
    ctx.fillStyle = p.color;
    ctx.fill();
    circle(ctx, o.x, o.y - s * 0.05, s * 0.16, 'rgba(255,233,168,0.85)');
  },

  pipe(ctx, o, p) {
    const s = p.size || 100;
    rect(ctx, o.x - 9, o.y - s / 2, 18, s, p.color);
    rect(ctx, o.x - 14, o.y - s / 2, 28, 12, 'rgba(0,0,0,0.3)');
    rect(ctx, o.x - 14, o.y + s / 2 - 12, 28, 12, 'rgba(0,0,0,0.3)');
    rect(ctx, o.x - 9, o.y - 4, 18, 8, 'rgba(255,255,255,0.18)');
  },

  orb(ctx, o, p) {
    const s = p.size || 16;
    const g = ctx.createRadialGradient(o.x - s * 0.3, o.y - s * 0.3, 2, o.x, o.y, s);
    g.addColorStop(0, '#ffffff');
    g.addColorStop(0.35, p.color);
    g.addColorStop(1, 'rgba(10,16,30,0.55)');
    circle(ctx, o.x, o.y, s, g);
    line(ctx, o.x - s - 8, o.y + s + 8, o.x + s + 8, o.y + s + 8, '#5e4a22', 3);
  },
});

/** The painter kinds this module can draw (23). */
export const PAINTER_KINDS = Object.keys(PAINTERS);

/** Effective object list for one side: 0 = left (original), 1 = right (altered). */
export function effectiveObjects(scene, side) {
  const out = [];
  for (const o of scene.objects) {
    let diff = null;
    for (const d of scene.diffs) if (d.target === o.id) diff = d;
    if (side === 0 && o.p.onlyRight) continue;
    if (side === 1 && diff && diff.mode === 'removed') continue;
    if (side === 0) { out.push({ o, p: o.p, flip: false }); continue; }
    const p = Object.assign({}, o.p);
    let flip = false;
    if (diff) {
      if (diff.mode === 'color') p.color = diff.color;
      if (diff.mode === 'flip') flip = true;
      if (diff.mode === 'param' && diff.set) Object.assign(p, diff.set);
    }
    out.push({ o, p, flip });
  }
  return out;
}

/** Paint the backdrop: night sky, skyline silhouette and flood water. */
export function paintBackdrop(ctx, scene) {
  const g = ctx.createLinearGradient(0, 0, 0, PANEL_H);
  g.addColorStop(0, scene.sky);
  g.addColorStop(0.72, '#24344f');
  g.addColorStop(0.721, scene.water);
  g.addColorStop(1, scene.water);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, PANEL_W, PANEL_H);
  ctx.fillStyle = 'rgba(6,10,20,0.55)';
  for (let i = 0; i < 9; i += 1) {
    const w = 46 + ((i * 53) % 40);
    const h = 60 + ((i * 37) % 70);
    ctx.fillRect(i * 68 - 6, 376 - h, w, h);
  }
  ctx.strokeStyle = 'rgba(190,230,240,0.25)';
  ctx.lineWidth = 2;
  for (let i = 0; i < 5; i += 1) {
    const y = 404 + i * 24;
    ctx.beginPath();
    for (let x = 0; x <= PANEL_W; x += 16) {
      const yy = y + Math.sin((x + i * 40) / 34) * 3;
      if (x === 0) ctx.moveTo(x, yy); else ctx.lineTo(x, yy);
    }
    ctx.stroke();
  }
}

/** Draw one full panel (side 0 or 1) of a scene into ctx at panel size. */
export function drawPanel(ctx, scene, side) {
  paintBackdrop(ctx, scene);
  for (const item of effectiveObjects(scene, side)) {
    const painter = PAINTERS[item.o.kind];
    if (!painter) continue;
    ctx.save();
    if (item.flip) {
      ctx.translate(item.o.x * 2, 0);
      ctx.scale(-1, 1);
    }
    painter(ctx, item.o, item.p);
    ctx.restore();
  }
}
