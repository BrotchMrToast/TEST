// TRINITY RIFT — procedural pixel-art sprite generators (no external assets)
'use strict';
G.sprites = (function () {
  const cache = {};

  function px(ctx, x, y, c) { if (c) { ctx.fillStyle = c; ctx.fillRect(x, y, 1, 1); } }
  function rect(ctx, x, y, w, h, c) { if (c) { ctx.fillStyle = c; ctx.fillRect(x, y, w, h); } }

  function scaled(small, scale) {
    const c = G.mkCanvas(small.width * scale, small.height * scale);
    const x = c.getContext('2d'); x.imageSmoothingEnabled = false;
    x.drawImage(small, 0, 0, c.width, c.height);
    return c;
  }
  function flipped(cv) {
    const c = G.mkCanvas(cv.width, cv.height);
    const x = c.getContext('2d'); x.imageSmoothingEnabled = false;
    x.translate(cv.width, 0); x.scale(-1, 1); x.drawImage(cv, 0, 0);
    return c;
  }

  // ============ HUMANOID (16x24 base grid) ============
  // o: {skin,hair,top,bottom,shoe,eye,hat,hatColor,gear,gearColor,belt}
  function drawHumanoid(g, o, dir, frame) {
    const skin = o.skin || '#e8b88a', hair = o.hair || '#222',
      top = o.top || '#556', bottom = o.bottom || '#334',
      shoe = o.shoe || '#211', eyeC = o.eye || '#181820';
    const legShift = frame === 1 ? 1 : frame === 2 ? -1 : 0;
    const bob = frame === 0 ? 0 : 0; // subtle
    // ---- legs (rows 18..23)
    if (dir === 'side') {
      rect(g, 6 + legShift, 18, 2, 5, bottom); rect(g, 8 - legShift, 18, 2, 5, bottom);
      rect(g, 6 + legShift, 22, 3, 2, shoe); rect(g, 8 - legShift, 22, 3, 2, shoe);
    } else {
      rect(g, 5, 18, 2, 5 - Math.abs(legShift)), rect(g, 5, 18, 2, 5, bottom);
      rect(g, 9, 18, 2, 5, bottom);
      rect(g, 5, 22 + (legShift > 0 ? -1 : 0), 2, 2, shoe);
      rect(g, 9, 22 + (legShift < 0 ? -1 : 0), 2, 2, shoe);
    }
    // ---- torso (rows 10..17)
    if (dir === 'side') {
      rect(g, 5, 10 + bob, 6, 8, top);
      rect(g, 5, 15, 6, 1, o.belt || 'rgba(0,0,0,0.35)');
      // near arm swings
      rect(g, 6 + legShift, 11, 2, 5, top);
      rect(g, 6 + legShift, 15, 2, 2, skin);
    } else {
      rect(g, 4, 10 + bob, 8, 8, top);
      rect(g, 4, 15, 8, 1, o.belt || 'rgba(0,0,0,0.35)');
      rect(g, 3, 11, 1, 5, top); rect(g, 12, 11, 1, 5, top); // arms
      rect(g, 3, 15 + legShift, 1, 2, skin); rect(g, 12, 15 - legShift, 1, 2, skin);
      if (o.tie && dir === 'down') rect(g, 7, 11, 2, 4, o.tie);
      if (o.lapel && dir === 'down') { rect(g, 5, 10, 1, 4, '#fff'); rect(g, 10, 10, 1, 4, '#fff'); }
    }
    // ---- head (rows 2..9), 8 wide
    const hx = 4, hy = 2 + bob;
    rect(g, hx, hy + 2, 8, 6, skin);
    if (dir === 'up') {
      rect(g, hx, hy, 8, 7, hair); // back of head
    } else {
      rect(g, hx, hy, 8, 3, hair); // hairline
      rect(g, hx, hy + 3, 1, 2, hair); rect(g, hx + 7, hy + 3, 1, 2, hair);
      if (o.longHair) { rect(g, hx - 1, hy + 2, 1, 6, hair); rect(g, hx + 8, hy + 2, 1, 6, hair); }
      if (dir === 'down') {
        px(g, hx + 2, hy + 4, eyeC); px(g, hx + 5, hy + 4, eyeC);
        if (o.scar) px(g, hx + 5, hy + 5, '#a33');
      } else { // side (right-facing base)
        px(g, hx + 5, hy + 4, eyeC);
        if (o.scar) px(g, hx + 5, hy + 5, '#a33');
      }
    }
    // topknot / ponytail
    if (o.topknot) rect(g, hx + 3, hy - 1, 2, 2, hair);
    if (o.ponytail && dir !== 'down') rect(g, hx + (dir === 'up' ? 3 : 0), hy + 4, 2, 5, hair);
    // ---- headgear
    const hc = o.hatColor || '#332';
    switch (o.hat) {
      case 'kasa': rect(g, hx - 2, hy + 1, 12, 1, hc); rect(g, hx, hy - 1, 8, 2, hc); rect(g, hx + 2, hy - 2, 4, 1, hc); break;
      case 'fedora': rect(g, hx - 1, hy + 1, 10, 1, hc); rect(g, hx + 1, hy - 1, 6, 2, hc); break;
      case 'visor': rect(g, hx, hy + 3, 8, 2, hc); if (dir !== 'up') { px(g, hx + 2, hy + 4, '#7ff'); px(g, hx + 5, hy + 4, '#7ff'); } break;
      case 'hood': rect(g, hx - 1, hy - 1, 10, 4, hc); rect(g, hx - 1, hy + 2, 2, 5, hc); rect(g, hx + 7, hy + 2, 2, 5, hc); break;
      case 'horns': rect(g, hx, hy - 2, 1, 2, '#eed'); rect(g, hx + 7, hy - 2, 1, 2, '#eed'); break;
      case 'headband': rect(g, hx, hy + 2, 8, 1, hc); break;
      case 'cap': rect(g, hx, hy, 8, 2, hc); rect(g, hx + (dir === 'up' ? -2 : 6), hy + 1, 4, 1, hc); break;
      case 'crown': rect(g, hx + 1, hy - 1, 6, 1, '#fd4'); px(g, hx + 1, hy - 2, '#fd4'); px(g, hx + 4, hy - 2, '#fd4'); px(g, hx + 6, hy - 2, '#fd4'); break;
      case 'oni': rect(g, hx - 1, hy + 3, 10, 3, hc); rect(g, hx + 1, hy - 2, 1, 2, '#eee'); rect(g, hx + 6, hy - 2, 1, 2, '#eee'); break;
      case 'halo': rect(g, hx + 1, hy - 3, 6, 1, '#ffe98a'); break;
    }
    // ---- gear
    const gc = o.gearColor || '#889';
    if (o.gear === 'katana' && dir !== 'down') { // sheathed on back
      g.save(); g.fillStyle = gc;
      for (let i = 0; i < 7; i++) px(g, 11 - i, 9 + i, gc);
      g.restore();
    }
    if (o.gear === 'katana' && dir === 'down') rect(g, 12, 12, 1, 6, gc);
    if (o.gear === 'case') rect(g, dir === 'side' ? 10 : 12, 15, 3, 4, gc);
    if (o.gear === 'gun') rect(g, dir === 'side' ? 9 : 12, 14, 3, 2, gc);
    if (o.gear === 'staff') { rect(g, 13, 6, 1, 14, gc); px(g, 13, 5, '#8ff'); }
  }

  function humanoid(o) {
    const key = 'h' + JSON.stringify(o);
    if (cache[key]) return cache[key];
    const frames = {};
    for (const dir of ['down', 'up', 'side']) {
      frames[dir] = [0, 1, 2].map(f => {
        const c = G.mkCanvas(16, 24);
        drawHumanoid(c.getContext('2d'), o, dir, f);
        return scaled(c, 2);
      });
    }
    frames.left = frames.side.map(flipped);
    frames.right = frames.side;
    frames.portrait = portrait(o);
    frames.w = 32; frames.h = 48;
    cache[key] = frames;
    return frames;
  }

  // ============ PORTRAIT (bigger face) ============
  function portrait(o) {
    const c = G.mkCanvas(20, 20), g = c.getContext('2d');
    const skin = o.skin || '#e8b88a', hair = o.hair || '#222';
    rect(g, 4, 5, 12, 11, skin);                       // face
    rect(g, 4, 2, 12, 5, hair);                        // hair top
    rect(g, 3, 4, 2, 6, hair); rect(g, 15, 4, 2, 6, hair);
    if (o.longHair) { rect(g, 3, 4, 2, 12, hair); rect(g, 15, 4, 2, 12, hair); }
    rect(g, 7, 9, 2, 2, o.eye || '#181820'); rect(g, 12, 9, 2, 2, o.eye || '#181820');
    px(g, 7, 9, '#fff'); px(g, 12, 9, '#fff');
    rect(g, 8, 13, 4, 1, 'rgba(0,0,0,0.4)');           // mouth
    if (o.scar) { px(g, 12, 8, '#a33'); px(g, 13, 11, '#a33'); px(g, 12, 12, '#a33'); }
    if (o.beard) rect(g, 6, 13, 8, 3, hair);
    const hc = o.hatColor || '#332';
    switch (o.hat) {
      case 'kasa': rect(g, 1, 3, 18, 2, hc); rect(g, 5, 1, 10, 2, hc); break;
      case 'fedora': rect(g, 2, 3, 16, 2, hc); rect(g, 5, 0, 10, 3, hc); break;
      case 'visor': rect(g, 4, 8, 12, 3, hc); rect(g, 6, 9, 2, 1, '#7ff'); rect(g, 12, 9, 2, 1, '#7ff'); break;
      case 'hood': rect(g, 2, 1, 16, 5, hc); rect(g, 2, 4, 3, 10, hc); rect(g, 15, 4, 3, 10, hc); break;
      case 'horns': case 'oni': rect(g, 3, 0, 2, 3, '#eed'); rect(g, 15, 0, 2, 3, '#eed'); break;
      case 'headband': rect(g, 4, 6, 12, 2, hc); break;
      case 'cap': rect(g, 3, 2, 14, 3, hc); break;
      case 'crown': rect(g, 5, 0, 10, 2, '#fd4'); break;
      case 'halo': rect(g, 5, 0, 10, 1, '#ffe98a'); break;
    }
    if (o.topknot) rect(g, 8, 0, 4, 2, hair);
    return scaled(c, 4); // 80x80
  }

  // ============ BEAST (quadruped, side view, 24x16) ============
  function beast(o) {
    const key = 'b' + JSON.stringify(o);
    if (cache[key]) return cache[key];
    const col = o.col || '#786058', dark = o.dark || '#4a3a34';
    const frames = [0, 1].map(f => {
      const c = G.mkCanvas(24, 16), g = c.getContext('2d');
      rect(g, 4, 5, 14, 6, col);                        // body
      rect(g, 15, 2, 6, 6, col);                        // head
      rect(g, 15, 1, 2, 2, dark); rect(g, 19, 1, 2, 2, dark); // ears
      px(g, 19, 4, o.eye || '#f33');
      rect(g, 20, 6, 2, 2, dark);                       // snout
      const l = f === 0 ? 0 : 1;
      rect(g, 5 + l, 11, 2, 4, dark); rect(g, 10 - l, 11, 2, 4, dark);
      rect(g, 13 + l, 11, 2, 4, dark); rect(g, 16 - l, 11, 2, 4, dark);
      rect(g, 1, 4, 4, 2, dark);                        // tail
      if (o.spikes) for (let i = 5; i < 17; i += 3) px(g, i, 4, '#ddd');
      if (o.cyber) { rect(g, 16, 3, 4, 1, '#0ff'); px(g, 6, 6, '#0ff'); px(g, 10, 7, '#0ff'); }
      return scaled(c, 2);
    });
    const out = { side: frames, left: frames.map(flipped), w: 48, h: 32 };
    out.right = out.side;
    cache[key] = out;
    return out;
  }

  // ============ BLOB / SPIRIT (20x20) ============
  function blob(o) {
    const key = 'o' + JSON.stringify(o);
    if (cache[key]) return cache[key];
    const col = o.col || '#7a5a9a', dark = o.dark || '#4a3560';
    const frames = [0, 1].map(f => {
      const c = G.mkCanvas(20, 20), g = c.getContext('2d');
      const squish = f === 0 ? 0 : 1;
      rect(g, 3, 6 + squish, 14, 12 - squish, col);
      rect(g, 4, 4 + squish, 12, 3, col);
      rect(g, 2, 10, 16, 5, col);
      rect(g, 6, 9 + squish, 2, 3, o.eye || '#ff4'); rect(g, 12, 9 + squish, 2, 3, o.eye || '#ff4');
      rect(g, 8, 14, 4, 2, dark);                       // mouth
      if (o.spikes) { px(g, 4, 3 + squish, dark); px(g, 9, 2 + squish, dark); px(g, 15, 3 + squish, dark); }
      if (o.ghost) { for (let i = 3; i < 17; i += 3) rect(g, i, 17, 2, 2, col); g.globalAlpha = 1; }
      if (o.drip) { px(g, 5, 18, dark); px(g, 13, 19, dark); }
      return scaled(c, 2);
    });
    const out = { side: frames, left: frames.map(flipped), w: 40, h: 40 };
    out.right = out.side;
    cache[key] = out;
    return out;
  }

  // ============ MECH / DRONE (20x20) ============
  function mech(o) {
    const key = 'm' + JSON.stringify(o);
    if (cache[key]) return cache[key];
    const col = o.col || '#5a6470', dark = o.dark || '#333a44', glow = o.glow || '#0ff';
    const frames = [0, 1].map(f => {
      const c = G.mkCanvas(20, 20), g = c.getContext('2d');
      const hov = f === 0 ? 0 : 1;
      if (o.fly) {
        rect(g, 4, 5 + hov, 12, 8, col);
        rect(g, 2, 7 + hov, 2, 3, dark); rect(g, 16, 7 + hov, 2, 3, dark); // thrusters
        rect(g, 7, 8 + hov, 6, 2, glow);                                    // eye bar
        rect(g, 5, 13 + hov, 2, 2, glow); rect(g, 13, 13 + hov, 2, 2, glow);
      } else {
        rect(g, 5, 4, 10, 9, col);
        rect(g, 7, 6, 6, 3, glow);
        rect(g, 4, 13, 4, 6 - hov, dark); rect(g, 12, 13, 4, 6 + 0, dark);
        rect(g, 2, 6, 3, 5, dark); rect(g, 15, 6, 3, 5, dark);              // arms
        if (o.cannon) rect(g, 15, 7, 5, 2, dark);
      }
      if (o.antenna) { rect(g, 9, 1, 1, 3 + hov, dark); px(g, 9, 0 + hov, '#f44'); }
      return scaled(c, 2);
    });
    const out = { side: frames, left: frames.map(flipped), w: 40, h: 40 };
    out.right = out.side;
    cache[key] = out;
    return out;
  }

  // ============ DEMON GOD (large, 40x40) ============
  function demon(o) {
    const key = 'd' + JSON.stringify(o);
    if (cache[key]) return cache[key];
    const col = o.col || '#3a1030', dark = o.dark || '#1a0518', glow = o.glow || '#f3a';
    const frames = [0, 1].map(f => {
      const c = G.mkCanvas(40, 40), g = c.getContext('2d');
      const br = f === 0 ? 0 : 1;
      rect(g, 8, 10, 24, 24, col);                       // torso
      rect(g, 12, 2, 16, 12, col);                       // head
      rect(g, 10, 0, 3, 5, '#dcc'); rect(g, 27, 0, 3, 5, '#dcc'); // horns
      rect(g, 8, -1 + 1, 2, 3, '#dcc'); rect(g, 30, 0, 2, 3, '#dcc');
      rect(g, 15, 6 + br, 3, 3, glow); rect(g, 22, 6 + br, 3, 3, glow); // eyes
      rect(g, 16, 11, 8, 2, dark);                       // maw
      rect(g, 2, 12, 6, 16, col); rect(g, 32, 12, 6, 16, col); // arms
      rect(g, 1, 26, 7, 4, dark); rect(g, 32, 26, 7, 4, dark); // claws
      rect(g, 14, 18 + br, 12, 3, glow);                 // chest sigil
      rect(g, 17, 15, 6, 9, dark);
      rect(g, 10, 34, 8, 6, dark); rect(g, 22, 34, 8, 6, dark);
      for (let i = 0; i < 6; i++) px(g, 8 + i * 4, 33 + (i % 2), glow); // rune belt
      return scaled(c, 2);
    });
    const out = { side: frames, left: frames.map(flipped), w: 80, h: 80 };
    out.right = out.side;
    cache[key] = out;
    return out;
  }

  // ============ chest ============
  function chest(open) {
    const key = 'c' + open;
    if (cache[key]) return cache[key];
    const c = G.mkCanvas(16, 14), g = c.getContext('2d');
    rect(g, 1, 5, 14, 8, '#7a5230'); rect(g, 1, 5, 14, 2, '#8f6238');
    rect(g, 1, open ? 0 : 2, 14, 3, open ? '#5a3a20' : '#8f6238');
    rect(g, 0, 5, 1, 8, '#4a3018'); rect(g, 15, 5, 1, 8, '#4a3018');
    rect(g, 7, 6, 2, 3, open ? '#4a3018' : '#ffd23e');
    cache[key] = scaled(c, 2);
    return cache[key];
  }

  function build(spec) {
    const kind = spec.kind || 'humanoid';
    if (kind === 'beast') return beast(spec.o || {});
    if (kind === 'blob') return blob(spec.o || {});
    if (kind === 'mech') return mech(spec.o || {});
    if (kind === 'demon') return demon(spec.o || {});
    return humanoid(spec.o || {});
  }

  return { humanoid, beast, blob, mech, demon, chest, build, portrait };
})();

// hero sprite definitions (shared with data files)
G.heroDefs = {
  samurai: {
    name: 'Kenji', title: 'the Broken Blade',
    spr: { kind: 'humanoid', o: { skin: '#e0aa7c', hair: '#16161c', top: '#3a3d52', bottom: '#22242f', topknot: true, gear: 'katana', gearColor: '#a8b0c0', scar: true, belt: '#6a2020' } },
    color: '#c43a3a',
  },
  business: {
    name: 'Daiki', title: 'the Caged Suit',
    spr: { kind: 'humanoid', o: { skin: '#eab992', hair: '#26221e', top: '#2c3444', bottom: '#232a37', tie: '#a02030', lapel: true, gear: 'case', gearColor: '#3a2c1c', scar: true } },
    color: '#3a7bc4',
  },
  cyber: {
    name: 'Vex', title: 'the Unchained Gun',
    spr: { kind: 'humanoid', o: { skin: '#d8a087', hair: '#d8d8e8', top: '#33234a', bottom: '#1e1830', hat: 'visor', hatColor: '#141420', gear: 'gun', gearColor: '#556', scar: true, belt: '#00e5c9' } },
    color: '#b229c9',
  },
  divine: {
    name: 'Tokihito', title: 'the Timeless One',
    spr: { kind: 'humanoid', o: { skin: '#f0d8b8', hair: '#ffe98a', top: '#e8e4ff', bottom: '#cabffa', hat: 'halo', longHair: true, gear: 'staff', gearColor: '#fff', belt: '#ffd23e' } },
    color: '#ffe98a',
  },
};
