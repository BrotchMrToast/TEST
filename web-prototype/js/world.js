// TRINITY RIFT — overworld exploration scene + HD-2D presentation pipeline
'use strict';
G.world = (function () {
  const T = G.TILE;
  const W = {
    map: null, npcs: [], chests: [], px: 0, py: 0, dir: 'down',
    moving: false, animT: 0, hist: [], particles: [], banner: 0, bannerText: '',
    encMeter: 0, encThresh: 5, stepT: 0, chatterT: 8, chatter: null,
  };
  const wc = G.mkCanvas(G.W, G.H);          // world composite
  const blurC = G.mkCanvas(G.W, G.H);       // tilt-shift layer

  const GRADES = {
    ash:    { top: 'rgba(255,120,60,0.20)', bottom: 'rgba(60,20,20,0.30)' },
    forest: { top: 'rgba(120,220,140,0.13)', bottom: 'rgba(10,40,20,0.28)' },
    dusk:   { top: 'rgba(200,120,220,0.16)', bottom: 'rgba(20,10,50,0.30)' },
    blood:  { top: 'rgba(255,60,60,0.18)', bottom: 'rgba(40,0,10,0.36)' },
    night:  { top: 'rgba(80,120,255,0.14)', bottom: 'rgba(5,10,40,0.34)' },
    city:   { top: 'rgba(140,180,255,0.12)', bottom: 'rgba(15,20,45,0.28)' },
    day:    { top: 'rgba(255,240,180,0.14)', bottom: 'rgba(30,40,30,0.16)' },
    neon:   { top: 'rgba(255,45,149,0.13)', bottom: 'rgba(10,5,40,0.36)' },
    toxic:  { top: 'rgba(160,255,120,0.10)', bottom: 'rgba(20,30,10,0.32)' },
    sand:   { top: 'rgba(255,200,120,0.20)', bottom: 'rgba(80,50,20,0.22)' },
    rift:   { top: 'rgba(200,107,255,0.22)', bottom: 'rgba(20,5,50,0.40)' },
  };

  // ---------- loading ----------
  function load(mapId, x, y) {
    const map = G.mapRT.prepare(mapId);
    if (!map) return;
    W.map = map;
    const ch = G.ch();
    ch.map = mapId;
    W.px = ch.x = (x !== undefined ? x : map.spawn.x) * T + T / 2;
    W.py = ch.y = (y !== undefined ? y : map.spawn.y) * T + T / 2;
    W.hist = []; W.encMeter = 0; W.encThresh = 4 + Math.random() * 4;
    W.banner = 3; W.bannerText = map.name;
    // npcs
    W.npcs = (map.npcs || []).map(def => ({
      def, id: def.id, x: def.x * T + T / 2, y: def.y * T + T / 2,
      spr: G.sprites.build(def.spr || { kind: 'humanoid', o: {} }),
      dir: def.dir || 'down', wanderT: Math.random() * 4, ox: def.x * T + T / 2, oy: def.y * T + T / 2,
      hidden: def.cond ? !def.cond(ch) : false,
    }));
    W.chests = (map.chests || []).map(c => ({
      def: c, x: c.x * T + T / 2, y: c.y * T + T / 2,
      open: !!ch.flags['chest_' + map.id + '_' + c.id],
    }));
    initParticles(map.amb);
    if (map.music) G.audio.play(map.music);
    if (!ch.checkpoint) ch.checkpoint = { map: mapId, x: map.spawn.x, y: map.spawn.y };
    G.setScene(scene);
  }
  function resume() { // back from battle/menu without reload
    if (!W.map) return;
    G.setScene(scene);
    if (W.map.music) G.audio.play(W.map.music);
  }
  function respawn() {
    const ch = G.ch();
    const cp = ch.checkpoint || { map: W.map.id, x: W.map.spawn.x, y: W.map.spawn.y };
    const s = G.heroStats(G.gs.current);
    ch.hp = Math.floor(s.hp / 2); ch.mp = Math.floor(s.mp / 2);
    ch.gold = Math.max(0, ch.gold - Math.floor(ch.gold * 0.15));
    G.fadeTo(() => { load(cp.map, cp.x, cp.y); G.toast('You wake at the last shrine… lighter of purse.', '#b8b0d0'); }, 0.8);
  }
  function enterWorld(key) {
    G.gs.current = key;
    const ch = G.ch();
    const wd = G.worlds[key];
    if (!ch.started) {
      ch.started = true;
      const s = G.heroStats(key);
      ch.hp = s.hp; ch.mp = s.mp;
      load(wd.start.map, wd.start.x, wd.start.y);
      if (wd.intro) G.runCutscene(wd.intro());
    } else {
      load(ch.map || wd.start.map, ch.x !== undefined ? Math.floor(ch.x / T) : undefined,
        ch.y !== undefined ? Math.floor(ch.y / T) : undefined);
    }
  }

  // ---------- particles ----------
  function initParticles(preset) {
    W.particles = [];
    W.amb = G.tiles.AMBIENCE[preset] || null;
    if (!W.amb) return;
    for (let i = 0; i < W.amb.count; i++) W.particles.push(newPart(true));
  }
  function newPart(anywhere) {
    const a = W.amb;
    return {
      x: Math.random() * G.W, y: anywhere ? Math.random() * G.H : -10,
      vx: G.lerp(a.vx[0], a.vx[1], Math.random()), vy: G.lerp(a.vy[0], a.vy[1], Math.random()),
      ph: Math.random() * 6.28, blink: Math.random(),
    };
  }
  function updParticles(dt) {
    const a = W.amb;
    if (!a) return;
    for (let i = 0; i < W.particles.length; i++) {
      const p = W.particles[i];
      p.x += p.vx * dt + (a.sway ? Math.sin(G.time * 1.5 + p.ph) * 18 * dt : 0);
      p.y += p.vy * dt;
      if (p.y > G.H + 12 || p.y < -30 || p.x < -30 || p.x > G.W + 30) W.particles[i] = newPart(false), W.particles[i].y = p.vy > 0 ? -8 : G.H + 8, W.particles[i].x = Math.random() * G.W;
    }
  }
  function drawParticles(ctx) {
    const a = W.amb;
    if (!a) return;
    ctx.save();
    ctx.fillStyle = a.col; ctx.strokeStyle = a.col;
    for (const p of W.particles) {
      if (a.blink && Math.sin(G.time * 4 + p.ph) < 0) continue;
      if (a.streak) {
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x - p.vx * 0.03, p.y - a.streak);
        ctx.stroke();
      }
      else ctx.fillRect(p.x, p.y, a.size, a.size);
    }
    ctx.restore();
  }

  // ---------- interaction ----------
  function facingPoint() {
    const d = { down: [0, 26], up: [0, -26], left: [-26, 0], right: [26, 0] }[W.dir];
    return [W.px + d[0], W.py + d[1] - 6];
  }
  function tryInteract() {
    const ch = G.ch();
    const [fx, fy] = facingPoint();
    // npc
    for (const n of W.npcs) {
      if (n.hidden) continue;
      if (Math.abs(n.x - fx) < 26 && Math.abs(n.y - 6 - fy) < 28) { interactNPC(n); return; }
    }
    // chest
    for (const c of W.chests) {
      if (!c.open && Math.abs(c.x - fx) < 24 && Math.abs(c.y - fy) < 24) {
        c.open = true;
        ch.flags['chest_' + W.map.id + '_' + c.def.id] = 1;
        G.audio.sfx('chest');
        (c.def.items || []).forEach(it => G.inv.add(ch, it.id, it.n || 1));
        if (c.def.gold) { ch.gold += c.def.gold; G.toast(`+${c.def.gold} ${G.currency()}`, '#ffd23e'); }
        return;
      }
    }
    // shrine checkpoint
    if (G.mapRT.shrineAt(W.map, fx, fy) || G.mapRT.shrineAt(W.map, W.px, W.py)) {
      const s = G.heroStats(G.gs.current);
      ch.hp = s.hp; ch.mp = s.mp;
      ch.checkpoint = { map: W.map.id, x: Math.floor(W.px / T), y: Math.floor(W.py / T) };
      G.save();
      G.audio.sfx('heal');
      G.toast('Rested. Progress saved — this shrine is now your checkpoint.', '#7dffa0');
      return;
    }
    // signs
    for (const s of (W.map.signs || [])) {
      if (Math.abs(s.x * T + 16 - fx) < 24 && Math.abs(s.y * T + 16 - fy) < 24) {
        G.say([{ text: s.text }]);
        return;
      }
    }
  }
  function interactNPC(n) {
    const ch = G.ch(), def = n.def;
    // face player
    n.dir = W.dir === 'down' ? 'up' : W.dir === 'up' ? 'down' : W.dir === 'left' ? 'right' : 'left';
    G.notifyTalk(def.id);
    // quest turn-in first
    if (def.quest && G.questReady(def.quest)) {
      const q = G.quests[def.quest];
      G.say((q.turninLines || [{ who: def.name, text: 'You actually did it. Here — as promised.' }])
        .map(l => G.spk({ name: def.name, spr: def.spr, color: def.color }, l.text || l)),
        () => G.turnInQuest(def.quest));
      return;
    }
    // quest offer
    if (def.quest && !ch.quests[def.quest]) {
      const q = G.quests[def.quest];
      const lines = (q.offerLines || [q.desc]).map(t => G.spk({ name: def.name, spr: def.spr, color: def.color }, t));
      lines[lines.length - 1] = Object.assign({}, lines[lines.length - 1], {
        choices: [
          { label: 'Accept — ' + q.name, then: () => G.startQuest(def.quest) },
          { label: 'Not now', then: () => {} },
        ],
      });
      G.say(lines);
      return;
    }
    // quest in progress
    if (def.quest && ch.quests[def.quest] && !ch.quests[def.quest].done && !G.questReady(def.quest)) {
      G.say([G.spk({ name: def.name, spr: def.spr, color: def.color }, G.quests[def.quest].midLine || ('Still on it? ' + G.questProgress(def.quest)))]);
      return;
    }
    // hire
    if (def.hire && !ch.party.includes(def.hire)) {
      const comp = G.companions[def.hire];
      const cost = comp.cost;
      G.say([G.spk({ name: def.name, spr: def.spr, color: def.color }, comp.pitch || 'Need a hand out there?', {
        choices: [
          {
            label: `Hire ${comp.name} (${cost} ${G.currency()})`, then: () => {
              if (ch.party.length >= 2) { G.say([{ text: 'Your party is full. (2 companions max — dismiss one in the menu.)' }]); return; }
              if (ch.gold < cost) { G.say([G.spk({ name: def.name, spr: def.spr, color: def.color }, comp.broke || "Come back when you can pay.")]); return; }
              ch.gold -= cost; ch.party.push(def.hire);
              G.audio.sfx('level');
              const bank = G.compBanks[comp.type];
              G.say([G.spk({ name: comp.name, spr: comp.spr, color: '#b8b0d0' }, G.choice(bank.hire))]);
            },
          },
          { label: 'Just passing through', then: () => {} },
        ],
      })]);
      return;
    }
    if (def.hire && ch.party.includes(def.hire)) {
      const comp = G.companions[def.hire];
      G.say([G.spk({ name: comp.name, spr: comp.spr, color: '#b8b0d0' }, G.choice(G.compBanks[comp.type].idle))]);
      return;
    }
    // shop
    if (def.shop) {
      G.say([G.spk({ name: def.name, spr: def.spr, color: def.color }, def.shopLine || 'Take a look. Everything has a price.')],
        () => { G.overlay = new G.Shop(def.shop); });
      return;
    }
    // dialog
    let d = def.dialog && G.dialogs[def.dialog];
    if (typeof d === 'function') d = d(ch);
    if (d) {
      G.say(d.map(l => typeof l === 'string' ? G.spk({ name: def.name, spr: def.spr, color: def.color }, l) : l));
    } else {
      G.say([G.spk({ name: def.name, spr: def.spr, color: def.color }, '…')]);
    }
  }

  // ---------- triggers & exits ----------
  function checkTriggers() {
    const ch = G.ch();
    for (const tr of (W.map.triggers || [])) {
      const key = 'trg_' + W.map.id + '_' + tr.id;
      if (tr.once !== false && ch.flags[key]) continue;
      const x0 = tr.x * T, y0 = tr.y * T, x1 = x0 + (tr.w || 1) * T, y1 = y0 + (tr.h || 1) * T;
      if (W.px >= x0 && W.px < x1 && W.py >= y0 && W.py < y1) {
        if (tr.cond && !tr.cond(ch)) continue;
        if (tr.once !== false) ch.flags[key] = 1;
        const cs = G.cutscenes[tr.event];
        if (cs) G.runCutscene(typeof cs === 'function' ? cs() : cs);
        return true;
      }
    }
    return false;
  }
  function checkExits() {
    const ch = G.ch();
    for (const ex of (W.map.exits || [])) {
      const x0 = ex.x * T, y0 = ex.y * T, x1 = x0 + (ex.w || 1) * T, y1 = y0 + (ex.h || 1) * T;
      if (W.px >= x0 && W.px < x1 && W.py >= y0 && W.py < y1) {
        if (ex.cond && !ex.cond(ch)) {
          if (ex.locked) G.toast(ex.locked, '#ff8080');
          // push player back
          W.px = ch.x; W.py = ch.y;
          const push = { down: [0, -8], up: [0, 8], left: [8, 0], right: [-8, 0] }[W.dir];
          W.px += push[0] * 2; W.py += push[1] * 2;
          return true;
        }
        G.fadeTo(() => load(ex.to, ex.tx, ex.ty), 0.6);
        return true;
      }
    }
    return false;
  }

  // ---------- scene ----------
  const scene = {
    id: 'world',
    update(dt) {
      const ch = G.ch();
      ch.playtime = (ch.playtime || 0) + dt;
      G.updateToasts(dt);
      G.updateCut(dt);
      W.banner = Math.max(0, W.banner - dt);
      updParticles(dt);
      if (W.chatter && (W.chatter.t += dt) > 3.2) W.chatter = null;

      if (G.overlay) { G.overlay.update(dt); return; }
      if (G.cut) return; // cutscene without dialog step (waits etc.)
      if (G.trans.dur > 0) return;

      if (G.input.take('menu')) { G.audio.sfx('confirm'); G.overlay = new G.Menu(); return; }
      if (G.input.take('confirm')) { tryInteract(); if (G.overlay || G.cut) return; }

      // movement
      let dx = 0, dy = 0;
      if (G.input.down.up) dy -= 1;
      if (G.input.down.down) dy += 1;
      if (G.input.down.left) dx -= 1;
      if (G.input.down.right) dx += 1;
      W.moving = !!(dx || dy);
      if (W.moving) {
        if (dy < 0) W.dir = 'up'; else if (dy > 0) W.dir = 'down';
        if (dx < 0) W.dir = 'left'; else if (dx > 0) W.dir = 'right';
        const spd = (G.input.down.run ? 205 : 145) * dt;
        const mag = Math.hypot(dx, dy);
        const nx = W.px + dx / mag * spd, ny = W.py + dy / mag * spd;
        const solids = W.npcs.filter(n => !n.hidden);
        if (!G.mapRT.blocked(W.map, nx, W.py, solids)) W.px = nx;
        if (!G.mapRT.blocked(W.map, W.px, ny, solids)) W.py = ny;
        W.animT += dt * 8;
        W.hist.unshift([W.px, W.py, W.dir]);
        if (W.hist.length > 40) W.hist.pop();
        ch.x = W.px; ch.y = W.py;
        W.stepT += dt;
        if (W.stepT > 0.28) { W.stepT = 0; G.audio.sfx('step'); }
        // encounters
        if (W.map.enc && G.mapRT.hostileAt(W.map, W.px, W.py)) {
          W.encMeter += dt * (G.input.down.run ? 1.35 : 1);
          if (W.encMeter >= W.encThresh) {
            W.encMeter = 0; W.encThresh = 4 + Math.random() * 4.5;
            const group = G.choice(W.map.enc.groups);
            G.startBattle({ enemies: group, bg: W.map.bg });
            return;
          }
        }
        if (checkExits()) return;
        if (checkTriggers()) return;
        // companion chatter
        W.chatterT -= dt;
        if (W.chatterT <= 0) {
          W.chatterT = 11 + Math.random() * 14;
          if (ch.party.length && Math.random() < 0.55) {
            const cid = G.choice(ch.party);
            const comp = G.companions[cid];
            W.chatter = { cid, text: G.choice(G.compBanks[comp.type].idle), t: 0 };
          }
        }
      } else {
        W.animT = 0;
        checkTriggers();
      }
      // npc wander
      for (const n of W.npcs) {
        if (n.hidden || n.def.still) continue;
        n.wanderT -= dt;
        if (n.wanderT <= 0) {
          n.wanderT = 2 + Math.random() * 4;
          n.tx = n.ox + (Math.random() - 0.5) * 70;
          n.ty = n.oy + (Math.random() - 0.5) * 70;
        }
        if (n.tx !== undefined) {
          const ddx = n.tx - n.x, ddy = n.ty - n.y;
          const d = Math.hypot(ddx, ddy);
          if (d > 4) {
            const nx = n.x + ddx / d * 34 * dt, ny = n.y + ddy / d * 34 * dt;
            if (!G.mapRT.blocked(W.map, nx, ny) && G.dist(nx, ny, W.px, W.py) > 30) { n.x = nx; n.y = ny; }
            else { n.tx = undefined; }
            n.dir = Math.abs(ddx) > Math.abs(ddy) ? (ddx < 0 ? 'left' : 'right') : (ddy < 0 ? 'up' : 'down');
            n.walking = true;
          } else n.walking = false;
        }
      }
    },

    draw(ctx) {
      if (!W.map) return;
      const ch = G.ch();
      const x = wc.getContext('2d');
      x.imageSmoothingEnabled = false;
      // camera
      const mw = W.map.w * T, mh = W.map.h * T;
      let camx = G.clamp(W.px - G.W / 2, 0, Math.max(0, mw - G.W));
      let camy = G.clamp(W.py - G.H / 2, 0, Math.max(0, mh - G.H));
      const [shx, shy] = G.shakeOff();
      if (G.shake.t > 0) G.shake.t -= 1 / 60;
      camx += shx; camy += shy;
      x.fillStyle = '#050308'; x.fillRect(0, 0, G.W, G.H);
      x.drawImage(W.map.baked, -camx, -camy);
      G.tiles.drawAnim(x, W.map, camx, camy, G.time);

      // entities y-sorted: chests, npcs, followers, player
      const ents = [];
      for (const c of W.chests) ents.push({ y: c.y, draw: () => {
        const img = G.sprites.chest(c.open);
        x.drawImage(img, c.x - 16 - camx, c.y - 22 - camy);
      }});
      for (const n of W.npcs) {
        if (n.hidden) continue;
        ents.push({ y: n.y, draw: () => {
          const frames = n.spr[n.dir] || n.spr.down || n.spr.side;
          const f = n.walking ? (Math.floor(G.time * 6) % 2 + 1) : 0;
          const img = frames[Math.min(f, frames.length - 1)];
          shadow(x, n.x - camx, n.y - camy);
          x.drawImage(img, n.x - img.width / 2 - camx, n.y - img.height + 6 - camy);
          // quest indicator
          if (n.def.quest) {
            const st = ch.quests[n.def.quest];
            let mark = null, col = '#ffd23e';
            if (!st) mark = '!';
            else if (G.questReady(n.def.quest)) { mark = '?'; col = '#7dffa0'; }
            if (mark) {
              x.font = 'bold 16px "Courier New",monospace'; x.textAlign = 'center';
              const bob = Math.sin(G.time * 4) * 3;
              x.fillStyle = col; x.fillText(mark, n.x - camx, n.y - img.height - 4 - camy + bob);
            }
          }
        }});
      }
      // followers
      ch.party.forEach((cid, i) => {
        const rec = W.hist[Math.min(W.hist.length - 1, (i + 1) * 13)] || [W.px, W.py, W.dir];
        const comp = G.companions[cid];
        const spr = G.sprites.build(comp.spr);
        ents.push({ y: rec[1], draw: () => {
          const frames = spr[rec[2]] || spr.down;
          const f = W.moving ? (Math.floor(G.time * 6) % 2 + 1) : 0;
          const img = frames[Math.min(f, frames.length - 1)];
          shadow(x, rec[0] - camx, rec[1] - camy);
          x.drawImage(img, rec[0] - img.width / 2 - camx, rec[1] - img.height + 6 - camy);
          if (W.chatter && W.chatter.cid === cid) bubble(x, rec[0] - camx, rec[1] - img.height - camy, W.chatter.text);
        }});
      });
      // player
      const heroKey = G.gs.current === 'convergence' ? 'divine' : G.gs.current;
      const pspr = G.sprites.build(G.heroDefs[heroKey].spr);
      ents.push({ y: W.py, draw: () => {
        const frames = pspr[W.dir] || pspr.down;
        const f = W.moving ? (Math.floor(W.animT) % 2 + 1) : 0;
        const img = frames[Math.min(f, frames.length - 1)];
        shadow(x, W.px - camx, W.py - camy);
        x.drawImage(img, W.px - img.width / 2 - camx, W.py - img.height + 6 - camy);
      }});
      ents.sort((a, b) => a.y - b.y).forEach(e => e.draw());
      // canopy above entities
      x.drawImage(W.map.canopy, -camx, -camy);

      // ============ HD-2D post fx ============
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(wc, 0, 0);
      if (G.fx) {
        // tilt-shift: blurred copy, visible only at top/bottom bands
        const b = blurC.getContext('2d');
        b.clearRect(0, 0, G.W, G.H);
        b.filter = 'blur(3.5px)';
        b.drawImage(wc, 0, 0);
        b.filter = 'none';
        b.globalCompositeOperation = 'destination-out';
        const mask = b.createLinearGradient(0, 0, 0, G.H);
        mask.addColorStop(0, 'rgba(0,0,0,0)');
        mask.addColorStop(0.30, 'rgba(0,0,0,1)');
        mask.addColorStop(0.70, 'rgba(0,0,0,1)');
        mask.addColorStop(1, 'rgba(0,0,0,0)');
        b.fillStyle = mask;
        b.fillRect(0, 0, G.W, G.H);
        b.globalCompositeOperation = 'source-over';
        ctx.drawImage(blurC, 0, 0);
        // color grade
        const gr = GRADES[W.map.grade] || GRADES.day;
        const gg = ctx.createLinearGradient(0, 0, 0, G.H);
        gg.addColorStop(0, gr.top); gg.addColorStop(1, gr.bottom);
        ctx.fillStyle = gg;
        ctx.fillRect(0, 0, G.W, G.H);
        // neon bloom pulse for cyber/rift themes
        if (W.map.theme === 'cyber' || W.map.theme === 'rift') {
          ctx.save();
          ctx.globalCompositeOperation = 'lighter';
          ctx.globalAlpha = 0.05 + Math.sin(G.time * 1.4) * 0.02;
          ctx.drawImage(wc, 0, 0);
          ctx.restore();
        }
      }
      // vignette
      const vg = ctx.createRadialGradient(G.W / 2, G.H / 2, G.H * 0.42, G.W / 2, G.H / 2, G.H * 0.85);
      vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.45)');
      ctx.fillStyle = vg; ctx.fillRect(0, 0, G.W, G.H);
      drawParticles(ctx);

      // area banner
      if (W.banner > 0) {
        const a = Math.min(1, W.banner, (3 - W.banner) * 2);
        ctx.save(); ctx.globalAlpha = a; ctx.textAlign = 'center';
        ctx.font = 'bold 30px "Courier New",monospace';
        ctx.fillStyle = '#000'; ctx.fillText(W.bannerText, G.W / 2 + 2, 92);
        ctx.fillStyle = '#f0ecff'; ctx.fillText(W.bannerText, G.W / 2, 90);
        ctx.font = '13px "Courier New",monospace'; ctx.fillStyle = '#b8b0d0';
        ctx.fillText('— ' + (G.worlds[G.ch().world] ? G.worlds[G.ch().world].name : '') + ' —', G.W / 2, 116);
        ctx.restore();
      }
      if (!G.cut) G.drawHUD(ctx);
      if (G.overlay) G.overlay.draw(ctx);
      if (G.cut) G.drawCutFx(ctx);
      G.drawToasts(ctx);
    },
  };
  function shadow(x, sx, sy) {
    x.fillStyle = 'rgba(0,0,0,0.35)';
    x.beginPath(); x.ellipse(sx, sy + 4, 10, 4, 0, 0, 7); x.fill();
  }
  function bubble(x, bx, by, text) {
    x.font = '12px "Courier New",monospace';
    const tw = x.measureText(text).width + 14;
    const px = G.clamp(bx - tw / 2, 4, G.W - tw - 4);
    G.panel(x, px, by - 26, tw, 22, { bg: 'rgba(16,12,28,0.92)', border: '#5a5480', r: 5 });
    x.fillStyle = '#d8d2ec'; x.textAlign = 'left';
    x.fillText(text, px + 7, by - 10);
  }

  W.load = load; W.resume = resume; W.respawn = respawn; W.enterWorld = enterWorld;
  W.scene = scene;
  return W;
})();
