// TRINITY RIFT — map runtime: parsing, collision, entity prep
'use strict';
G.mapRT = (function () {
  const T = G.TILE;

  function prepare(id) {
    const def = G.maps[id];
    if (!def) { console.error('missing map', id); return null; }
    if (!def.grid) {
      def.grid = def.rows.map(r => r.split(''));
      def.h = def.grid.length;
      def.w = def.grid[0].length;
      // pad ragged rows
      for (const row of def.grid) while (row.length < def.w) row.push('#');
    }
    if (!def.baked) G.tiles.bake(def);
    return def;
  }

  function tileAt(map, tx, ty) {
    if (tx < 0 || ty < 0 || tx >= map.w || ty >= map.h) return '#';
    return map.grid[ty][tx];
  }
  function solidAt(map, x, y) { // pixel coords
    return G.tiles.isSolid(tileAt(map, Math.floor(x / T), Math.floor(y / T)));
  }
  // entity collision box: feet area (cx, cy = center bottom)
  function blocked(map, cx, cy, ents) {
    const hw = 9;
    if (solidAt(map, cx - hw, cy - 4) || solidAt(map, cx + hw, cy - 4) ||
        solidAt(map, cx - hw, cy + 5) || solidAt(map, cx + hw, cy + 5)) return true;
    if (ents) {
      for (const e of ents) {
        if (e.noSolid) continue;
        if (Math.abs(e.x - cx) < 20 && Math.abs(e.y - cy) < 16) return e;
      }
    }
    return false;
  }
  function hostileAt(map, x, y) {
    return G.tiles.isHostile(tileAt(map, Math.floor(x / T), Math.floor(y / T)));
  }
  function shrineAt(map, x, y) {
    return tileAt(map, Math.floor(x / T), Math.floor(y / T)) === '+';
  }

  return { prepare, tileAt, solidAt, blocked, hostileAt, shrineAt };
})();
