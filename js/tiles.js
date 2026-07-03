// TRINITY RIFT — tile rendering, map baking, battle backdrops, ambience presets
'use strict';
G.tiles = (function () {
  const T = G.TILE;

  // per-world palettes
  const THEMES = {
    sengoku: {
      floor: ['#4c6136', '#50663a', '#485c34'], hostile: ['#3d4f2c', '#42552f'],
      path: ['#8a7358', '#937c60'], wall: ['#4d4a52', '#565360'], wallTop: '#6a6675',
      water: ['#2a4a5e', '#2e5268'], tree: '#2e4424', treeTrunk: '#4a3520',
      house: '#5a4632', roof: '#7a3030', sand: ['#8a7a5a', '#94845f'],
      accent: '#c43a3a', dirt: ['#5c4a38', '#63503c'],
    },
    tokyo: {
      floor: ['#585c64', '#5c6068', '#54585f'], hostile: ['#494c53', '#4d5057'],
      path: ['#3c3f46', '#42454c'], wall: ['#33363e', '#3a3d45'], wallTop: '#4c505b',
      water: ['#1e3448', '#223a50'], tree: '#3a5a34', treeTrunk: '#4a3a28',
      house: '#4e5460', roof: '#333a48', sand: ['#8a8272', '#948b79'],
      accent: '#3a7bc4', dirt: ['#55503f', '#5b5644'],
    },
    rural: {
      floor: ['#557038', '#5a763c', '#516b35'], hostile: ['#46592e', '#4b5f31'],
      path: ['#93825d', '#9c8b64'], wall: ['#5c5a52', '#63615a'], wallTop: '#75736a',
      water: ['#2c5464', '#305c6e'], tree: '#31572a', treeTrunk: '#4d3b24',
      house: '#6a5a42', roof: '#5a6a7a', sand: ['#9a8a68', '#a4936f'],
      accent: '#3a7bc4', dirt: ['#5e4e3a', '#65543f'],
    },
    cyber: {
      floor: ['#2a2438', '#2e2840', '#262032'], hostile: ['#221c30', '#261f36'],
      path: ['#3a3450', '#403a58'], wall: ['#1a1626', '#201a2e'], wallTop: '#332c48',
      water: ['#101c3a', '#142244'], tree: '#1c3a3a', treeTrunk: '#2a2a3a',
      house: '#252035', roof: '#181425', sand: ['#6a5a48', '#73624e'],
      accent: '#00e5c9', dirt: ['#463a30', '#4c4034'],
    },
    desert: {
      floor: ['#9a7a52', '#a28258', '#93744d'], hostile: ['#8a6c46', '#91724a'],
      path: ['#b09468', '#b89c6e'], wall: ['#6a5238', '#71583c'], wallTop: '#83694a',
      water: ['#2a5a6a', '#2e6274'], tree: '#4a5a2a', treeTrunk: '#5a4a2a',
      house: '#7a5f40', roof: '#8a4a2a', sand: ['#b0906a', '#b89870'],
      accent: '#ff9a3c', dirt: ['#8a6a48', '#91704c'],
    },
    rift: {
      floor: ['#241a3a', '#2a1f44', '#1f1633'], hostile: ['#1c1430', '#211838'],
      path: ['#3c2c5e', '#443368'], wall: ['#120c20', '#171028'], wallTop: '#2c2246',
      water: ['#3a1050', '#44145e'], tree: '#2a1a44', treeTrunk: '#1e1430',
      house: '#2a2040', roof: '#1a1230', sand: ['#4a3a5a', '#524062'],
      accent: '#c86bff', dirt: ['#332a44', '#39304b'],
    },
  };

  const SOLID = new Set(['T', '%', '~', '#', 'H', 'o', '^', 'P', 'F', 'B', 'c', '_', 'Y']);
  const HOSTILE = new Set([',', 'w', ';']);

  function isSolid(ch) { return SOLID.has(ch); }
  function isHostile(ch) { return HOSTILE.has(ch); }

  function vary(rng, cols) { return cols[Math.floor(rng() * cols.length)]; }

  // draws one tile's ground into ctx at (px,py); returns optional canopy fn
  function drawTile(ctx, cnp, ch, px, py, rng, P, map) {
    const base = () => { ctx.fillStyle = vary(rng, P.floor); ctx.fillRect(px, py, T, T); };
    switch (ch) {
      default: base(); if (rng() < 0.06) { ctx.fillStyle = 'rgba(255,255,255,0.06)'; ctx.fillRect(px + 8 + rng() * 12 | 0, py + 8 + rng() * 12 | 0, 2, 2); } break;
      case ',': case ';': {
        ctx.fillStyle = vary(rng, P.hostile); ctx.fillRect(px, py, T, T);
        ctx.fillStyle = 'rgba(0,0,0,0.18)';
        for (let i = 0; i < 4; i++) ctx.fillRect(px + (rng() * 28 | 0), py + (rng() * 24 | 0), 2, 6);
        break;
      }
      case '=': {
        ctx.fillStyle = vary(rng, P.path); ctx.fillRect(px, py, T, T);
        if (rng() < 0.25) { ctx.fillStyle = 'rgba(0,0,0,0.12)'; ctx.fillRect(px + (rng() * 24 | 0), py + (rng() * 24 | 0), 5, 3); }
        break;
      }
      case 'd': { ctx.fillStyle = vary(rng, P.dirt); ctx.fillRect(px, py, T, T); break; }
      case 's': { ctx.fillStyle = vary(rng, P.sand); ctx.fillRect(px, py, T, T);
        if (rng() < 0.2) { ctx.fillStyle = 'rgba(0,0,0,0.1)'; ctx.fillRect(px + (rng() * 26 | 0), py + (rng() * 26 | 0), 4, 2); } break; }
      case '~': break; // animated, painted per-frame
      case '#': case '^': {
        ctx.fillStyle = vary(rng, P.wall); ctx.fillRect(px, py, T, T);
        ctx.fillStyle = P.wallTop; ctx.fillRect(px, py, T, 6);
        ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fillRect(px, py + T - 4, T, 4);
        if (ch === '^') { ctx.fillStyle = 'rgba(255,255,255,0.14)'; ctx.fillRect(px + 4, py + 2, 8, 3); }
        break;
      }
      case '_': { ctx.fillStyle = '#050308'; ctx.fillRect(px, py, T, T);
        if (rng() < 0.1) { ctx.fillStyle = '#3a2a5a'; ctx.fillRect(px + rng() * 28 | 0, py + rng() * 28 | 0, 2, 2); } break; }
      case 'T': case 'Y': {
        base();
        const trunk = P.treeTrunk, leaf = ch === 'Y' ? '#4a4440' : P.tree;
        ctx.fillStyle = trunk; ctx.fillRect(px + 13, py + 14, 6, 16);
        cnp.fillStyle = leaf;
        if (ch === 'Y') { // dead tree: bare branches
          cnp.fillStyle = trunk;
          cnp.fillRect(px + 14, py - 12, 4, 28); cnp.fillRect(px + 6, py - 6, 10, 3);
          cnp.fillRect(px + 16, py - 12, 10, 3); cnp.fillRect(px + 22, py - 18, 3, 8);
        } else {
          cnp.beginPath(); cnp.arc(px + 16, py + 4, 14, 0, 7); cnp.fill();
          cnp.beginPath(); cnp.arc(px + 8, py + 10, 9, 0, 7); cnp.fill();
          cnp.beginPath(); cnp.arc(px + 24, py + 10, 9, 0, 7); cnp.fill();
          cnp.fillStyle = 'rgba(255,255,255,0.09)';
          cnp.beginPath(); cnp.arc(px + 12, py, 6, 0, 7); cnp.fill();
        }
        break;
      }
      case '%': { // bamboo
        base();
        const g = '#5a8a3a', d = '#3e6428';
        for (const bx of [6, 15, 24]) {
          cnp.fillStyle = rng() < 0.5 ? g : d;
          cnp.fillRect(px + bx, py - 20, 4, 52);
          cnp.fillStyle = 'rgba(0,0,0,0.25)';
          for (let s = -16; s < 30; s += 10) cnp.fillRect(px + bx, py + s, 4, 2);
        }
        break;
      }
      case 'o': { base(); ctx.fillStyle = P.wall[0]; ctx.beginPath(); ctx.arc(px + 16, py + 18, 11, 0, 7); ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.15)'; ctx.beginPath(); ctx.arc(px + 12, py + 14, 4, 0, 7); ctx.fill(); break; }
      case '*': { base(); for (let i = 0; i < 3; i++) { ctx.fillStyle = G.choice(['#e8a0b8', '#f0d060', '#d8e8f0']); ctx.fillRect(px + 4 + (rng() * 22 | 0), py + 4 + (rng() * 22 | 0), 3, 3); } break; }
      case 'w': { ctx.fillStyle = '#3a4432'; ctx.fillRect(px, py, T, T);
        ctx.fillStyle = '#2c3626'; for (let i = 0; i < 3; i++) ctx.fillRect(px + rng() * 24 | 0, py + rng() * 24 | 0, 8, 5);
        ctx.fillStyle = 'rgba(120,40,40,0.25)'; if (rng() < 0.3) ctx.fillRect(px + rng() * 20 | 0, py + rng() * 20 | 0, 10, 8); break; }
      case 'H': { // small building block w/ roof drawn in canopy at top row detection
        ctx.fillStyle = P.house; ctx.fillRect(px, py, T, T);
        ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fillRect(px, py + T - 5, T, 5);
        ctx.fillStyle = P.roof; ctx.fillRect(px, py, T, 12);
        ctx.fillStyle = 'rgba(255,255,255,0.1)'; ctx.fillRect(px, py, T, 3);
        if (rng() < 0.4) { ctx.fillStyle = map.theme === 'cyber' ? '#ffe98a' : '#f5d789'; ctx.fillRect(px + 8, py + 17, 7, 8); ctx.fillStyle = 'rgba(0,0,0,0.4)'; ctx.fillRect(px + 11, py + 17, 1, 8); }
        break;
      }
      case 'B': { // hi-rise: dark block + lit windows, canopy adds height
        ctx.fillStyle = P.house; ctx.fillRect(px, py, T, T);
        cnp.fillStyle = P.roof; cnp.fillRect(px, py - 26, T, 28);
        for (let wy = 0; wy < 5; wy++) for (let wx = 0; wx < 3; wx++) {
          if (rng() < 0.55) { cnp.fillStyle = rng() < 0.5 ? '#ffe98a' : (map.theme === 'cyber' ? '#00e5c9' : '#cfe4ff'); cnp.fillRect(px + 4 + wx * 9, py - 22 + wy * 9, 5, 6); }
        }
        ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.fillRect(px, py + T - 6, T, 6);
        break;
      }
      case 'P': { base(); ctx.fillStyle = P.wall[1]; ctx.fillRect(px + 10, py + 4, 12, 26); cnp.fillStyle = P.wallTop; cnp.fillRect(px + 7, py - 6, 18, 12); break; }
      case 'F': { base(); ctx.fillStyle = P.treeTrunk; ctx.fillRect(px, py + 12, T, 4); ctx.fillRect(px + 4, py + 8, 4, 14); ctx.fillRect(px + 22, py + 8, 4, 14); break; }
      case 'c': { ctx.fillStyle = P.house; ctx.fillRect(px, py, T, T); ctx.fillStyle = 'rgba(255,255,255,0.14)'; ctx.fillRect(px, py, T, 8); break; }
      case 'n': { // neon-lit floor
        ctx.fillStyle = vary(rng, P.floor); ctx.fillRect(px, py, T, T);
        ctx.fillStyle = 'rgba(0,229,201,0.12)'; ctx.fillRect(px, py, T, T);
        if (rng() < 0.2) { ctx.fillStyle = G.choice(['#00e5c9', '#ff2d95', '#c86bff']); ctx.fillRect(px + 2, py + 30, 28, 2); }
        break;
      }
      case 'x': { base(); ctx.strokeStyle = '#c86bff'; ctx.lineWidth = 2; ctx.beginPath();
        ctx.moveTo(px + 4, py + 28); ctx.lineTo(px + 14, py + 16); ctx.lineTo(px + 10, py + 10); ctx.lineTo(px + 24, py + 2); ctx.stroke(); break; }
      case '+': break; // shrine/checkpoint: animated per-frame
      case 'x2': break;
    }
  }

  // bake ground+canopy layers for a map
  function bake(map) {
    const w = map.w * T, h = map.h * T;
    const ground = G.mkCanvas(w, h), canopy = G.mkCanvas(w, h);
    const gx = ground.getContext('2d'), cx = canopy.getContext('2d');
    const P = THEMES[map.theme] || THEMES.sengoku;
    const rng = G.mulberry(G.hash(map.id));
    gx.fillStyle = P.floor[0]; gx.fillRect(0, 0, w, h);
    map.anim = [];
    for (let y = 0; y < map.h; y++) for (let x = 0; x < map.w; x++) {
      const ch = map.grid[y][x];
      if (ch === '~' || ch === '+') map.anim.push({ x, y, ch });
      drawTile(gx, cx, ch, x * T, y * T, rng, P, map);
    }
    map.baked = ground; map.canopy = canopy; map.pal = P;
  }

  // animated tiles painted onto the visible frame each tick
  function drawAnim(ctx, map, camx, camy, time) {
    const P = map.pal;
    for (const a of map.anim) {
      const px = a.x * T - camx, py = a.y * T - camy;
      if (px < -T || py < -T || px > G.W || py > G.H) continue;
      if (a.ch === '~') {
        ctx.fillStyle = P.water[(a.x + a.y + (time * 1.5 | 0)) % 2];
        ctx.fillRect(px, py, T, T);
        ctx.fillStyle = 'rgba(255,255,255,0.12)';
        const off = Math.sin(time * 2 + a.x * 1.7 + a.y) * 6;
        ctx.fillRect(px + 6 + off, py + 8 + ((a.x + a.y) % 3) * 7, 12, 2);
      } else if (a.ch === '+') {
        // checkpoint shrine: themed obelisk with pulsing glow
        ctx.fillStyle = P.floor[0]; ctx.fillRect(px, py, T, T);
        const pulse = 0.5 + Math.sin(time * 3) * 0.3;
        ctx.fillStyle = P.wall[0]; ctx.fillRect(px + 10, py + 6, 12, 22);
        ctx.fillStyle = P.wallTop; ctx.fillRect(px + 7, py + 2, 18, 6);
        ctx.fillStyle = `rgba(255,233,138,${pulse})`; ctx.fillRect(px + 13, py + 12, 6, 8);
        ctx.save(); ctx.globalAlpha = pulse * 0.4; ctx.fillStyle = '#ffe98a';
        ctx.beginPath(); ctx.arc(px + 16, py + 16, 18, 0, 7); ctx.fill(); ctx.restore();
      }
    }
  }

  // ============ battle backdrops ============
  const bgCache = {};
  function battleBG(name) {
    if (bgCache[name]) return bgCache[name];
    const c = G.mkCanvas(G.W, G.H), g = c.getContext('2d');
    const grad = (c1, c2, yy = G.H) => { const gr = g.createLinearGradient(0, 0, 0, yy); gr.addColorStop(0, c1); gr.addColorStop(1, c2); return gr; };
    const ground = (col, y = 360) => { g.fillStyle = col; g.fillRect(0, y, G.W, G.H - y); };
    const rng = G.mulberry(G.hash(name));
    const sil = (col, baseY, minH, maxH, w1, w2, gap) => { // silhouette skyline / hills
      g.fillStyle = col;
      let x = -20;
      while (x < G.W + 20) {
        const w = w1 + rng() * w2, h = minH + rng() * (maxH - minH);
        g.fillRect(x, baseY - h, w, h);
        x += w + rng() * gap;
      }
    };
    switch (name) {
      case 'ashvillage': g.fillStyle = grad('#3a2626', '#6a4438'); g.fillRect(0, 0, G.W, G.H);
        sil('#241a1a', 380, 60, 160, 60, 80, 30); ground('#403028', 380);
        g.fillStyle = 'rgba(200,90,50,0.25)'; for (let i = 0; i < 30; i++) g.fillRect(rng() * G.W, rng() * 300, 2, 2); break;
      case 'bamboo': g.fillStyle = grad('#1c2e1c', '#3a5a34'); g.fillRect(0, 0, G.W, G.H);
        for (let i = 0; i < 26; i++) { const x = rng() * G.W; g.fillStyle = `rgba(${40 + rng() * 40 | 0},${90 + rng() * 50 | 0},40,0.7)`; g.fillRect(x, 0, 10 + rng() * 8, 420); }
        ground('#2c4426', 400); break;
      case 'castle': g.fillStyle = grad('#2c2434', '#544458'); g.fillRect(0, 0, G.W, G.H);
        sil('#1e1828', 390, 100, 240, 100, 120, 60); g.fillStyle = '#302838'; g.fillRect(370, 90, 220, 300);
        g.fillStyle = '#241e2e'; g.fillRect(340, 70, 280, 40); ground('#3c3444', 390); break;
      case 'marsh': g.fillStyle = grad('#26301e', '#48543a'); g.fillRect(0, 0, G.W, G.H);
        sil('#1a2214', 380, 30, 90, 90, 100, 40); ground('#333e28', 380);
        g.fillStyle = 'rgba(150,30,30,0.2)'; g.fillRect(0, 340, G.W, 60); break;
      case 'fortress': g.fillStyle = grad('#1a1420', '#4a2430'); g.fillRect(0, 0, G.W, G.H);
        sil('#120e18', 400, 150, 300, 130, 140, 20); g.fillStyle = 'rgba(255,80,40,0.3)';
        for (let i = 0; i < 14; i++) g.fillRect(rng() * G.W, 180 + rng() * 200, 4, 8); ground('#2c1e26', 400); break;
      case 'street': g.fillStyle = grad('#141824', '#3a4258'); g.fillRect(0, 0, G.W, G.H);
        sil('#0e1220', 380, 140, 300, 70, 90, 20);
        g.fillStyle = 'rgba(255,233,138,0.5)'; for (let i = 0; i < 60; i++) g.fillRect(rng() * G.W, 100 + rng() * 260, 3, 3);
        ground('#2e3240', 380); g.fillStyle = '#22252f'; g.fillRect(0, 420, G.W, 8); break;
      case 'office': g.fillStyle = grad('#2c3140', '#4a5264'); g.fillRect(0, 0, G.W, G.H);
        for (let i = 0; i < 5; i++) { g.fillStyle = 'rgba(180,200,230,0.15)'; g.fillRect(60 + i * 180, 60, 120, 260); }
        ground('#3a4050', 380); break;
      case 'rural': g.fillStyle = grad('#7ba4c4', '#cfe0d8'); g.fillRect(0, 0, G.W, G.H);
        sil('#5a7a94', 320, 60, 140, 140, 160, 0); sil('#48705a', 380, 40, 90, 100, 140, 20);
        ground('#5d7a44', 380); break;
      case 'docks': g.fillStyle = grad('#101828', '#2c3a50'); g.fillRect(0, 0, G.W, G.H);
        g.fillStyle = '#0c1420'; g.fillRect(0, 330, G.W, 60);
        sil('#141c2c', 330, 60, 150, 100, 200, 40); ground('#2a3040', 390);
        g.fillStyle = 'rgba(120,200,255,0.2)'; for (let i = 0; i < 20; i++) g.fillRect(rng() * G.W, 340 + rng() * 40, 30, 2); break;
      case 'neon': g.fillStyle = grad('#0c0818', '#2a1440'); g.fillRect(0, 0, G.W, G.H);
        sil('#080614', 400, 160, 330, 60, 80, 10);
        for (let i = 0; i < 80; i++) { g.fillStyle = G.choice(['#00e5c9', '#ff2d95', '#c86bff', '#ffe98a']); g.globalAlpha = 0.5 + rng() * 0.5; g.fillRect(rng() * G.W, 80 + rng() * 300, 3, 3); }
        g.globalAlpha = 1; ground('#181228', 400); break;
      case 'desert': g.fillStyle = grad('#c47840', '#e8b070'); g.fillRect(0, 0, G.W, G.H);
        sil('#8a5430', 340, 60, 160, 160, 200, 0); ground('#a5794c', 380);
        g.fillStyle = '#b8865a'; g.beginPath(); g.arc(200, 500, 220, 0, 7); g.fill(); break;
      case 'under': g.fillStyle = grad('#0a0c12', '#1e2430'); g.fillRect(0, 0, G.W, G.H);
        g.fillStyle = '#141820'; for (let i = 0; i < 8; i++) g.fillRect(i * 130, 0, 30, 400);
        g.fillStyle = 'rgba(0,229,201,0.25)'; for (let i = 0; i < 12; i++) g.fillRect(rng() * G.W, rng() * 340, 20, 3);
        ground('#181c26', 390); break;
      case 'citadel': g.fillStyle = grad('#141024', '#302050'); g.fillRect(0, 0, G.W, G.H);
        g.fillStyle = '#0e0a1c'; g.fillRect(330, 60, 300, 330); g.fillRect(410, 20, 140, 60);
        g.fillStyle = 'rgba(200,107,255,0.4)'; for (let i = 0; i < 20; i++) g.fillRect(350 + rng() * 260, 80 + rng() * 280, 5, 5);
        ground('#221a38', 390); break;
      case 'rift': default: g.fillStyle = grad('#0c0618', '#2a1048'); g.fillRect(0, 0, G.W, G.H);
        g.strokeStyle = '#c86bff'; g.lineWidth = 3;
        for (let i = 0; i < 8; i++) { g.beginPath(); let x = rng() * G.W, y = rng() * 300; g.moveTo(x, y);
          for (let j = 0; j < 4; j++) { x += (rng() - 0.5) * 160; y += rng() * 60; g.lineTo(x, y); } g.globalAlpha = 0.3 + rng() * 0.5; g.stroke(); }
        g.globalAlpha = 1; ground('#1a1230', 390);
        g.fillStyle = 'rgba(200,107,255,0.15)'; g.beginPath(); g.arc(480, 180, 150, 0, 7); g.fill(); break;
      case 'arena': g.fillStyle = grad('#180a20', '#401454'); g.fillRect(0, 0, G.W, G.H);
        g.fillStyle = 'rgba(255,60,120,0.2)'; g.beginPath(); g.arc(480, 200, 240, 0, 7); g.fill();
        g.fillStyle = '#0e0616'; sil('#0e0616', 400, 80, 200, 90, 110, 30); ground('#241030', 390);
        g.fillStyle = 'rgba(255,233,138,0.5)'; for (let i = 0; i < 40; i++) g.fillRect(rng() * G.W, rng() * 200, 2, 2); break;
    }
    bgCache[name] = c;
    return c;
  }

  // ambience particle presets
  const AMBIENCE = {
    ash: { count: 40, col: 'rgba(200,190,180,0.5)', vy: [8, 20], vx: [-6, 6], size: 2, sway: true },
    embers: { count: 30, col: 'rgba(255,120,50,0.6)', vy: [-24, -10], vx: [-8, 8], size: 2, sway: true },
    petals: { count: 30, col: 'rgba(240,170,190,0.7)', vy: [12, 26], vx: [-20, -6], size: 3, sway: true },
    rain: { count: 90, col: 'rgba(160,190,230,0.4)', vy: [300, 420], vx: [-30, -30], size: 1, streak: 10 },
    neonrain: { count: 70, col: 'rgba(0,229,201,0.35)', vy: [260, 380], vx: [-20, -20], size: 1, streak: 12 },
    snow: { count: 50, col: 'rgba(240,244,255,0.8)', vy: [14, 30], vx: [-10, 10], size: 2, sway: true },
    fireflies: { count: 18, col: 'rgba(220,255,140,0.8)', vy: [-6, 6], vx: [-8, 8], size: 2, blink: true },
    motes: { count: 26, col: 'rgba(200,107,255,0.6)', vy: [-14, -4], vx: [-6, 6], size: 2, blink: true },
    dust: { count: 24, col: 'rgba(210,180,130,0.35)', vy: [-4, 4], vx: [20, 50], size: 2, sway: true },
    smog: { count: 16, col: 'rgba(120,120,140,0.15)', vy: [-3, 3], vx: [8, 20], size: 26, sway: true },
  };

  return { THEMES, isSolid, isHostile, bake, drawAnim, battleBG, AMBIENCE };
})();
