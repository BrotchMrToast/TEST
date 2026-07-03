// TRINITY RIFT — core: globals, rng, math, save, scene management
'use strict';
window.G = {
  W: 960, H: 540, TILE: 32,
  time: 0, frame: 0,
  scene: null, overlay: null,
  maps: {}, enemies: {}, dialogs: {}, cutscenes: {}, quests: {},
  shops: {}, companions: {}, worlds: {},
  fx: true, muted: false,
  SAVE_KEY: 'trinity_rift_v1',
};

// ---------- math / rng ----------
G.clamp = (v, a, b) => v < a ? a : (v > b ? b : v);
G.lerp = (a, b, t) => a + (b - a) * t;
G.dist = (ax, ay, bx, by) => Math.hypot(ax - bx, ay - by);

G.mulberry = function (seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
};
G.rnd = Math.random;
G.rint = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
G.choice = arr => arr[Math.floor(Math.random() * arr.length)];
G.hash = function (str) { // deterministic per-string seed
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
};

// ---------- canvas helpers ----------
G.mkCanvas = function (w, h) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const x = c.getContext('2d'); x.imageSmoothingEnabled = false;
  return c;
};

// ---------- game state ----------
G.newCharState = function (world) {
  return {
    world, started: false, chapter: 0, riftReached: false,
    level: 1, exp: 0, gold: 120,
    hp: 0, mp: 0, // filled from stats on start
    inv: {}, equip: { weapon: null, armor: null, acc: null },
    party: [],           // companion ids (max 2)
    flags: {}, quests: {}, kills: {},
    map: null, x: 0, y: 0, dir: 'down',
    checkpoint: null,    // {map,x,y}
    playtime: 0,
  };
};
G.newGameState = function () {
  return {
    current: null, // 'samurai' | 'business' | 'cyber' | 'convergence'
    chars: {
      samurai: G.newCharState('samurai'),
      business: G.newCharState('business'),
      cyber: G.newCharState('cyber'),
    },
    convergence: { unlocked: false, phase: 0, done: false, flags: {}, level: 30,
      hp: 0, mp: 0, inv: {}, gold: 0 },
    settings: { muted: false, fx: true },
  };
};
G.gs = G.newGameState();
G.ch = function () { // active character progress record
  if (G.gs.current === 'convergence') return G.gs.convergence;
  return G.gs.chars[G.gs.current];
};

G.save = function () {
  try {
    G.gs.settings.muted = G.muted; G.gs.settings.fx = G.fx;
    localStorage.setItem(G.SAVE_KEY, JSON.stringify(G.gs));
    return true;
  } catch (e) { return false; }
};
G.load = function () {
  try {
    const raw = localStorage.getItem(G.SAVE_KEY);
    if (!raw) return false;
    const data = JSON.parse(raw);
    const base = G.newGameState();
    // shallow-merge so new fields added in updates keep defaults
    for (const k of ['samurai', 'business', 'cyber'])
      data.chars[k] = Object.assign(base.chars[k], data.chars[k]);
    G.gs = Object.assign(base, data);
    G.muted = !!G.gs.settings.muted; G.fx = G.gs.settings.fx !== false;
    return true;
  } catch (e) { return false; }
};
G.wipeSave = function () { try { localStorage.removeItem(G.SAVE_KEY); } catch (e) {} };

// ---------- registries ----------
G.registerMap = d => { G.maps[d.id] = d; };
G.registerEnemy = (id, d) => { d.id = id; G.enemies[id] = d; };
G.registerDialog = (id, d) => { G.dialogs[id] = d; };
G.registerCutscene = (id, d) => { G.cutscenes[id] = d; };
G.registerQuest = d => { G.quests[d.id] = d; };
G.registerShop = (id, d) => { d.id = id; G.shops[id] = d; };
G.registerCompanion = (id, d) => { d.id = id; G.companions[id] = d; };
G.registerWorld = (id, d) => { d.id = id; G.worlds[id] = d; };

// ---------- scene switching ----------
G.setScene = function (s) {
  if (G.scene && G.scene.exit) G.scene.exit();
  G.scene = s; G.overlay = null;
  if (s && s.enter) s.enter();
};

// ---------- screen transition ----------
G.trans = { t: 0, dur: 0, cb: null, mode: 'fade' };
G.fadeTo = function (cb, dur = 0.5, mode = 'fade') {
  if (G.trans.dur > 0) return;
  G.trans = { t: 0, dur, cb, mode, fired: false };
};
G.updateTrans = function (dt) {
  const tr = G.trans;
  if (tr.dur <= 0) return;
  tr.t += dt;
  if (!tr.fired && tr.t >= tr.dur / 2) { tr.fired = true; if (tr.cb) tr.cb(); }
  if (tr.t >= tr.dur) tr.dur = 0;
};
G.drawTrans = function (ctx) {
  const tr = G.trans;
  if (tr.dur <= 0) return;
  const half = tr.dur / 2;
  const a = tr.t < half ? tr.t / half : 1 - (tr.t - half) / half;
  if (tr.mode === 'battle') { // sharp spiral-ish wipe
    ctx.save(); ctx.fillStyle = '#000';
    const n = 14, ph = a * (G.W / n + 4);
    for (let i = 0; i < n; i++) ctx.fillRect(i * G.W / n, 0, ph, G.H);
    ctx.restore();
  } else {
    ctx.fillStyle = `rgba(0,0,0,${G.clamp(a, 0, 1)})`;
    ctx.fillRect(0, 0, G.W, G.H);
  }
};

// ---------- camera shake ----------
G.shake = { t: 0, mag: 0 };
G.doShake = function (mag = 6, t = 0.25) { G.shake.t = Math.max(G.shake.t, t); G.shake.mag = mag; };
G.shakeOff = function () {
  if (G.shake.t <= 0) return [0, 0];
  return [(Math.random() - 0.5) * 2 * G.shake.mag, (Math.random() - 0.5) * 2 * G.shake.mag];
};

// ---------- floating text (world space agnostic; drawn by scenes) ----------
G.toasts = [];
G.toast = function (text, color = '#fff') {
  G.toasts.push({ text, color, t: 0 });
  if (G.toasts.length > 4) G.toasts.shift();
};
G.updateToasts = function (dt) { G.toasts = G.toasts.filter(t => (t.t += dt) < 2.6); };
G.drawToasts = function (ctx) {
  ctx.save(); ctx.textAlign = 'center'; ctx.font = 'bold 15px "Courier New",monospace';
  G.toasts.forEach((t, i) => {
    const a = t.t < 2.1 ? 1 : (2.6 - t.t) / 0.5;
    const y = 64 + i * 22 - Math.min(t.t, 0.2) * 30;
    ctx.globalAlpha = a * 0.85; ctx.fillStyle = '#000';
    ctx.fillText(t.text, G.W / 2 + 1, y + 1);
    ctx.globalAlpha = a; ctx.fillStyle = t.color;
    ctx.fillText(t.text, G.W / 2, y);
  });
  ctx.restore();
};

// ---------- text helpers ----------
G.wrapText = function (ctx, text, maxW) {
  const words = String(text).split(' '); const lines = []; let cur = '';
  for (const w of words) {
    const test = cur ? cur + ' ' + w : w;
    if (ctx.measureText(test).width > maxW && cur) { lines.push(cur); cur = w; }
    else cur = test;
  }
  if (cur) lines.push(cur);
  return lines;
};
G.rounded = function (ctx, x, y, w, h, r) {
  ctx.beginPath(); ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
};
G.panel = function (ctx, x, y, w, h, opts = {}) {
  ctx.save();
  G.rounded(ctx, x, y, w, h, opts.r || 8);
  ctx.fillStyle = opts.bg || 'rgba(10,8,20,0.92)'; ctx.fill();
  ctx.strokeStyle = opts.border || '#8878c8'; ctx.lineWidth = 2; ctx.stroke();
  G.rounded(ctx, x + 3, y + 3, w - 6, h - 6, Math.max(2, (opts.r || 8) - 3));
  ctx.strokeStyle = 'rgba(255,255,255,0.08)'; ctx.lineWidth = 1; ctx.stroke();
  ctx.restore();
};
