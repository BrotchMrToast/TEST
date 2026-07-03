#!/usr/bin/env node
// TRINITY RIFT — content validator: run `node tools/validate.js` from repo root.
// Loads the game data with stubbed browser APIs and checks maps, refs, reachability.
'use strict';
const fs = require('fs');
const path = require('path');

// ---------- browser stubs ----------
global.window = global;
const noop = () => {};
const fakeCtx = new Proxy({}, {
  get(t, k) {
    if (k === 'measureText') return () => ({ width: 10 });
    if (k === 'createLinearGradient' || k === 'createRadialGradient') return () => ({ addColorStop: noop });
    if (k === 'getImageData') return () => ({ data: [] });
    return typeof t[k] !== 'undefined' ? t[k] : noop;
  },
  set(t, k, v) { t[k] = v; return true; },
});
global.document = {
  createElement: () => ({ width: 0, height: 0, getContext: () => fakeCtx }),
  getElementById: () => null,
};
global.localStorage = { getItem: () => null, setItem: noop, removeItem: noop };
window.addEventListener = noop;
global.performance = { now: () => 0 };
global.requestAnimationFrame = noop;

// ---------- load game (all but main.js) ----------
const root = path.join(__dirname, '..');
const files = [
  'js/core.js', 'js/input.js', 'js/audio.js', 'js/sprites.js', 'js/tiles.js',
  'js/items.js', 'js/dialog.js', 'js/quest.js', 'js/map.js', 'js/combat.js',
  'js/ui.js', 'js/world.js', 'js/scenes.js',
  'data/common.js', 'data/world_samurai.js', 'data/world_business.js',
  'data/world_cyber.js', 'data/convergence.js',
];
for (const f of files) {
  try { new Function(fs.readFileSync(path.join(root, f), 'utf8'))(); }
  catch (e) { console.error(`LOAD FAIL ${f}: ${e.message}`); process.exit(1); }
}
const G = window.G;

// ---------- checks ----------
let errors = 0, warns = 0;
const err = m => { errors++; console.error('  ERROR: ' + m); };
const warn = m => { warns++; console.warn('  warn : ' + m); };
const fakeCh = { chapter: 99, flags: { unified: 1 }, quests: {} };

for (const id in G.maps) {
  const m = G.maps[id];
  console.log(`\n== ${id} (${m.name}) ==`);
  const grid = m.rows.map(r => r.split(''));
  const W = grid[0].length, H = grid.length;
  grid.forEach((row, y) => {
    if (row.length !== W) warn(`row ${y} width ${row.length} != ${W}`);
    while (row.length < W) row.push('#');
  });
  const at = (x, y) => (x < 0 || y < 0 || x >= W || y >= H) ? '#' : grid[y][x];
  const walk = (x, y) => !G.tiles.isSolid(at(x, y));

  // BFS from spawn
  const seen = Array.from({ length: H }, () => new Array(W).fill(false));
  if (!walk(m.spawn.x, m.spawn.y)) err(`spawn (${m.spawn.x},${m.spawn.y}) not walkable: '${at(m.spawn.x, m.spawn.y)}'`);
  else {
    const q = [[m.spawn.x, m.spawn.y]];
    seen[m.spawn.y][m.spawn.x] = true;
    while (q.length) {
      const [x, y] = q.pop();
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = x + dx, ny = y + dy;
        if (nx >= 0 && ny >= 0 && nx < W && ny < H && !seen[ny][nx] && walk(nx, ny)) {
          seen[ny][nx] = true; q.push([nx, ny]);
        }
      }
    }
  }
  const reach = (x, y) => seen[y] && seen[y][x];
  const reachNear = (x, y) => reach(x, y) || reach(x + 1, y) || reach(x - 1, y) || reach(x, y + 1) || reach(x, y - 1);

  // npcs / chests / signs
  for (const n of (m.npcs || [])) {
    if (!walk(n.x, n.y)) err(`npc ${n.id} at (${n.x},${n.y}) on solid '${at(n.x, n.y)}'`);
    else if (!reachNear(n.x, n.y)) err(`npc ${n.id} at (${n.x},${n.y}) unreachable from spawn`);
    if (n.dialog && !G.dialogs[n.dialog]) err(`npc ${n.id} missing dialog '${n.dialog}'`);
    if (n.shop && !G.shops[n.shop]) err(`npc ${n.id} missing shop '${n.shop}'`);
    if (n.quest && !G.quests[n.quest]) err(`npc ${n.id} missing quest '${n.quest}'`);
    if (n.hire && !G.companions[n.hire]) err(`npc ${n.id} missing companion '${n.hire}'`);
    if (!n.spr) err(`npc ${n.id} has no sprite`);
  }
  for (const c of (m.chests || [])) {
    if (!walk(c.x, c.y)) err(`chest ${c.id} at (${c.x},${c.y}) on solid '${at(c.x, c.y)}'`);
    else if (!reachNear(c.x, c.y)) err(`chest ${c.id} at (${c.x},${c.y}) unreachable`);
    for (const it of (c.items || [])) if (!G.items[it.id]) err(`chest ${c.id} unknown item ${it.id}`);
  }
  for (const s of (m.signs || [])) {
    if (!reachNear(s.x, s.y)) warn(`sign at (${s.x},${s.y}) unreachable`);
  }
  // exits
  for (const e of (m.exits || [])) {
    let any = false;
    for (let dy = 0; dy < (e.h || 1); dy++) for (let dx = 0; dx < (e.w || 1); dx++) {
      if (walk(e.x + dx, e.y + dy) && reach(e.x + dx, e.y + dy)) any = true;
    }
    if (!any) err(`exit to ${e.to} at (${e.x},${e.y},${e.w || 1}x${e.h || 1}) has no reachable walkable tile`);
    const tgt = G.maps[e.to];
    if (!tgt) { err(`exit target map '${e.to}' missing`); continue; }
    const tg = tgt.rows.map(r => r.split(''));
    const tat = (x, y) => (x < 0 || y < 0 || y >= tg.length || x >= tg[0].length) ? '#' : (tg[y][x] || '#');
    if (G.tiles.isSolid(tat(e.tx, e.ty))) err(`exit to ${e.to}: arrival (${e.tx},${e.ty}) is solid '${tat(e.tx, e.ty)}'`);
    for (const be of (tgt.exits || [])) {
      if (e.tx >= be.x && e.tx < be.x + (be.w || 1) && e.ty >= be.y && e.ty < be.y + (be.h || 1)) {
        err(`exit to ${e.to}: arrival (${e.tx},${e.ty}) lands INSIDE ${e.to}'s exit to ${be.to} (bounce loop)`);
      }
    }
  }
  // triggers
  for (const t of (m.triggers || [])) {
    let any = false;
    for (let dy = 0; dy < (t.h || 1); dy++) for (let dx = 0; dx < (t.w || 1); dx++) {
      if (walk(t.x + dx, t.y + dy) && reach(t.x + dx, t.y + dy)) any = true;
    }
    if (!any) err(`trigger ${t.id} at (${t.x},${t.y},${t.w || 1}x${t.h || 1}) has no reachable walkable tile`);
    if (!G.cutscenes[t.event]) err(`trigger ${t.id} missing cutscene '${t.event}'`);
  }
  // encounters
  if (m.enc) {
    for (const g of m.enc.groups) for (const eid of g) if (!G.enemies[eid]) err(`enc enemy '${eid}' missing`);
    const hostiles = m.rows.join('').split('').some(ch => G.tiles.isHostile(ch));
    if (!hostiles) warn('map has enc table but no hostile tiles');
  }
  // shrine present?
  if (!m.rows.join('').includes('+')) warn('no shrine (+) checkpoint on this map');
}

// global refs
console.log('\n== global ==');
for (const id in G.enemies) {
  const e = G.enemies[id];
  for (const d of (e.drops || [])) if (!G.items[d.id]) err(`enemy ${id} drops unknown item ${d.id}`);
}
for (const id in G.shops) {
  for (const it of G.shops[id].items) if (!G.items[it]) err(`shop ${id} sells unknown item ${it}`);
}
for (const id in G.quests) {
  const q = G.quests[id];
  const st = q.stages[0];
  if (st.type === 'kill' && !G.enemies[st.target]) err(`quest ${id} kill target '${st.target}' missing`);
  if (st.type === 'item' && !G.items[st.target]) err(`quest ${id} item target '${st.target}' missing`);
  let giverFound = false;
  for (const mid in G.maps) for (const n of (G.maps[mid].npcs || [])) if (n.quest === id) giverFound = true;
  if (!giverFound) err(`quest ${id} has no giver NPC on any map`);
}
// worlds & chapters
for (const wid of ['samurai', 'business', 'cyber', 'convergence']) {
  if (!G.worlds[wid]) { err(`world ${wid} not registered`); continue; }
  const wd = G.worlds[wid];
  if (!G.maps[wd.start.map]) err(`world ${wid} start map missing`);
}
// battle bgs referenced by maps exist (drawn lazily — just try)
for (const id in G.maps) {
  try { G.tiles.battleBG(G.maps[id].bg || 'rift'); } catch (e) { err(`battleBG '${G.maps[id].bg}' for ${id} throws: ${e.message}`); }
}

console.log(`\n${errors} error(s), ${warns} warning(s)`);
process.exit(errors ? 1 : 0);
