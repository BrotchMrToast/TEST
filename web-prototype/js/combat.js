// TRINITY RIFT — real-time round-based (ATB) combat with boost points
'use strict';
G.combat = (function () {

  // ---------- hero & companion skill books ----------
  const HERO_SKILLS = {
    samurai: [
      { lv: 1, name: 'Crimson Slash', mp: 6, pow: 1.6, type: 'attack', status: 'bleed', sfx: 'slash', col: '#ff4a4a', desc: 'Heavy cut that leaves foes bleeding' },
      { lv: 4, name: 'Iaijutsu', mp: 10, pow: 2.1, type: 'attack', crit: 35, sfx: 'slash', col: '#fff', desc: 'One breath. One draw. High crit' },
      { lv: 8, name: 'Whirlwind Cut', mp: 15, pow: 1.1, type: 'aoe', sfx: 'slash', col: '#ffb0a0', desc: 'Strike every enemy' },
      { lv: 13, name: 'Oni Severance', mp: 22, pow: 3.0, type: 'attack', sfx: 'crit', col: '#c43a3a', desc: 'The stroke meant for one man only' },
    ],
    business: [
      { lv: 1, name: 'Hostile Takeover', mp: 6, pow: 1.4, type: 'attack', status: 'atkDn', sfx: 'hit', col: '#9adcff', desc: 'Strike that saps enemy attack' },
      { lv: 4, name: 'Expense Account', mp: 10, type: 'healself', pow: 0.35, sfx: 'heal', col: '#7dffa0', desc: 'Recover 35% HP. It is deductible' },
      { lv: 8, name: 'Severance Package', mp: 15, pow: 1.1, type: 'aoe', sfx: 'gun', col: '#ffd23e', desc: 'Everyone gets a pink slip' },
      { lv: 13, name: 'Market Crash', mp: 22, pow: 2.6, type: 'attack', status: 'defDn', sfx: 'crit', col: '#ff4a4a', desc: 'Total devaluation of one enemy' },
    ],
    cyber: [
      { lv: 1, name: 'Burst Fire', mp: 6, pow: 0.65, hits: 3, type: 'attack', sfx: 'gun', col: '#00e5c9', desc: 'Three rounds, center mass' },
      { lv: 4, name: 'EMP Round', mp: 10, pow: 1.4, type: 'attack', status: 'stun', sfx: 'laser', col: '#7ff', desc: 'Damage + chance to stun' },
      { lv: 8, name: 'Overclock', mp: 14, type: 'buffself', sfx: 'boost', col: '#c86bff', desc: 'Raise own ATK and SPD' },
      { lv: 13, name: 'Railstorm', mp: 22, pow: 1.5, type: 'aoe', sfx: 'laser', col: '#ff2d95', desc: 'Saturation fire on all enemies' },
    ],
    divine: [
      { lv: 1, name: 'Blade of Eras', mp: 12, pow: 2.2, type: 'attack', sfx: 'slash', col: '#ffe98a', desc: 'Three lifetimes in one stroke' },
      { lv: 1, name: 'Sundering Light', mp: 24, pow: 1.6, type: 'aoe', sfx: 'laser', col: '#fff', desc: 'Burn away the dark, everywhere' },
      { lv: 1, name: 'Restore Timeline', mp: 20, type: 'healself', pow: 0.5, sfx: 'heal', col: '#7dffa0', desc: 'Rewind your wounds. 50% HP' },
      { lv: 1, name: 'Zenith', mp: 45, pow: 4.2, type: 'attack', sfx: 'explode', col: '#ffd23e', desc: 'The hour of the god of hours' },
    ],
  };
  const COMP_SKILLS = {
    brute: [
      { name: 'Crush', mp: 8, pow: 2.0, type: 'attack', sfx: 'crit', col: '#ff9a3c', desc: 'A very simple plan, executed hard' },
      { name: 'War Roar', mp: 6, type: 'taunt', sfx: 'boost', col: '#ffd23e', desc: 'Taunt enemies, raise own DEF' },
    ],
    tactician: [
      { name: 'Analyze', mp: 5, type: 'debuff', status: 'defDn', sfx: 'confirm', col: '#9adcff', desc: 'Expose a weakness: lower enemy DEF' },
      { name: 'Rally', mp: 10, type: 'partybuff', sfx: 'boost', col: '#7dffa0', desc: 'Raise party ATK' },
    ],
    thief: [
      { name: 'Backstab', mp: 7, pow: 1.7, crit: 30, type: 'attack', sfx: 'slash', col: '#c86bff', desc: 'Strike from a place of dishonesty' },
      { name: 'Pickpocket', mp: 4, type: 'steal', sfx: 'gold', col: '#ffd23e', desc: 'Steal gold mid-fight' },
    ],
    gambler: [
      { name: 'Dice Roll', mp: 6, type: 'gamble', sfx: 'hit', col: '#ff2d95', desc: 'Damage x0.2 to x3.5. Feeling lucky?' },
      { name: 'All In', mp: 12, pow: 3.2, type: 'allin', sfx: 'crit', col: '#ff4a4a', desc: 'Huge damage, 30% self-burn' },
    ],
    tech: [
      { name: 'Repair Drone', mp: 10, type: 'heal', pow: 0.35, sfx: 'heal', col: '#7dffa0', desc: 'Heal an ally for 35%' },
      { name: 'Shock Grid', mp: 14, pow: 1.0, type: 'aoe', status: 'stun', sfx: 'laser', col: '#7ff', desc: 'AoE with stun chance' },
    ],
  };

  let B = null; // battle state
  const ALLY_POS = [[720, 320], [790, 400], [650, 410]];
  const FOE_POS1 = [[240, 360]];
  const FOE_POS = [[210, 320], [290, 400], [150, 410], [330, 300]];

  function mkAllyHero() {
    const key = G.gs.current, ch = G.ch();
    const world = key === 'convergence' ? 'divine' : key;
    const hd = G.heroDefs[world];
    const s = G.heroStats(key);
    if (ch.hp <= 0 || ch.hp === undefined || ch.hp === 0) ch.hp = s.hp;
    return {
      name: hd.name, isHero: true, side: 'ally', world,
      spr: G.sprites.build(hd.spr), scale: 3,
      maxhp: s.hp, hp: Math.min(ch.hp, s.hp), maxmp: s.mp, mp: Math.min(ch.mp, s.mp),
      atk: s.atk, def: s.def, spd: s.spd, crit: s.crit,
      skills: HERO_SKILLS[world].filter(sk => ch.level >= sk.lv),
      atb: 0.3 + Math.random() * 0.3, bp: 1, statuses: {}, color: hd.color,
    };
  }
  function mkAllyComp(compId) {
    const comp = G.companions[compId];
    const s = G.compStats(compId, G.ch().level);
    return {
      name: comp.name, compId, type: comp.type, side: 'ally',
      spr: G.sprites.build(comp.spr), scale: 3,
      maxhp: s.hp, hp: s.hp, maxmp: s.mp, mp: s.mp,
      atk: s.atk, def: s.def, spd: s.spd, crit: s.crit,
      skills: COMP_SKILLS[comp.type], atb: Math.random() * 0.4, bp: 1, statuses: {},
      color: '#b8b0d0',
    };
  }
  function mkFoe(id, idx) {
    const d = G.enemies[id];
    if (!d) { console.error('missing enemy', id); return null; }
    return {
      name: d.name, enemyId: id, side: 'foe', boss: !!d.boss,
      spr: G.sprites.build(d.spr), scale: d.scale || 3,
      maxhp: d.hp, hp: d.hp, maxmp: 99, mp: 99,
      atk: d.atk, def: d.def, spd: d.spd, crit: 5,
      ai: d.skills || [{ name: 'Attack', pow: 1, type: 'attack', w: 1 }],
      exp: d.exp, gold: d.gold, drops: d.drops || [],
      atb: Math.random() * 0.5, bp: 0, statuses: {}, color: '#ff6a6a',
      barks: d.barks,
    };
  }

  // ---------- battle lifecycle ----------
  function start(opts) {
    const ch = G.ch();
    const allies = [];
    if (opts.customParty) opts.customParty.forEach(u => allies.push(u));
    else {
      allies.push(mkAllyHero());
      (ch.party || []).forEach(cid => allies.push(mkAllyComp(cid)));
    }
    const foes = opts.enemies.map((id, i) => mkFoe(id, i)).filter(Boolean);
    const positions = foes.length === 1 ? FOE_POS1 : FOE_POS;
    foes.forEach((f, i) => { const p = positions[i % positions.length]; f.x = f.homeX = p[0]; f.y = f.homeY = p[1]; });
    allies.forEach((a, i) => { const p = ALLY_POS[i]; a.x = a.homeX = p[0]; a.y = a.homeY = p[1]; });

    B = {
      allies, foes, opts,
      state: 'intro', t: 0, introT: 0,
      queue: [], menu: null, popups: [], fx: [], barks: [],
      rewardExp: 0, rewardGold: 0, rewardItems: [],
      bg: G.tiles.battleBG(opts.bg || (G.world.map && G.world.map.bg) || 'rift'),
      hitStop: 0, winT: 0, loseT: 0,
      boss: !!opts.boss || foes.some(f => f.boss),
    };
    G.audio.play(opts.music || (B.boss ? 'boss' : 'battle'));
    G.setScene(scene);
    // companion battle-start bark
    const talker = allies.find(a => a.compId);
    if (talker && Math.random() < 0.7) compBark(talker, 'battle');
    if (opts.bossBark && foes[0]) bark(foes[0], opts.bossBark);
  }

  function compBark(unit, context) {
    const comp = G.companions[unit.compId];
    const bank = G.compBanks[comp.type];
    if (bank && bank[context]) bark(unit, G.choice(bank[context]));
  }
  function bark(unit, text) { B.barks.push({ unit, text, t: 0 }); }

  // ---------- damage & effects ----------
  function popup(x, y, text, col, big) {
    B.popups.push({ x, y, text, col: col || '#fff', t: 0, big: !!big });
  }
  function spark(x, y, col, n = 10) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2, sp = 60 + Math.random() * 200;
      B.fx.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 60, t: 0, col, life: 0.4 + Math.random() * 0.3 });
    }
  }
  function dealDamage(src, tgt, pow, opts = {}) {
    const boost = 1 + (opts.boost || 0) * 0.5;
    let dmg = Math.max(1, Math.floor(src.atk * pow * boost * (0.9 + Math.random() * 0.2) - tgt.def * 0.85));
    if (tgt.statuses.defDn) dmg = Math.floor(dmg * 1.35);
    if (tgt.statuses.defUp) dmg = Math.floor(dmg * 0.65);
    if (src.statuses.atkUp) dmg = Math.floor(dmg * 1.3);
    if (src.statuses.atkDn) dmg = Math.floor(dmg * 0.7);
    if (tgt.defending) dmg = Math.floor(dmg * 0.5);
    const crit = Math.random() * 100 < (src.crit + (opts.crit || 0));
    if (crit) dmg = Math.floor(dmg * 1.6);
    tgt.hp = Math.max(0, tgt.hp - dmg);
    popup(tgt.x, tgt.y - 60, String(dmg), crit ? '#ffd23e' : (tgt.side === 'ally' ? '#ff8080' : '#fff'), crit);
    spark(tgt.x, tgt.y - 40, crit ? '#ffd23e' : '#fff', crit ? 18 : 10);
    G.doShake(crit ? 9 : Math.min(7, 3 + dmg / 30), 0.22);
    B.hitStop = crit ? 0.1 : 0.06;
    G.audio.sfx(crit ? 'crit' : 'hit');
    tgt.hurtT = 0.25;
    if (tgt.hp <= 0) kill(tgt);
    return dmg;
  }
  function kill(u) {
    u.dying = 0.6;
    G.audio.sfx('die');
    if (u.side === 'foe') {
      B.rewardExp += u.exp || 0; B.rewardGold += u.gold || 0;
      (u.drops || []).forEach(d => { if (Math.random() < d.chance) B.rewardItems.push(d.id); });
      if (u.enemyId) G.notifyKill(u.enemyId);
    }
  }
  function healUnit(u, amount) {
    const n = Math.floor(amount);
    u.hp = Math.min(u.maxhp, u.hp + n);
    popup(u.x, u.y - 60, '+' + n, '#7dffa0');
    spark(u.x, u.y - 40, '#7dffa0', 8);
    G.audio.sfx('heal');
  }

  const alive = list => list.filter(u => u.hp > 0 && !u.dying);

  // ---------- action execution ----------
  // action: {actor, kind:'attack'|'skill'|'item'|'defend'|'flee', skill, item, target, boost}
  function execute(action) {
    const a = action.actor;
    a.defending = false;
    // status tick at actor's turn
    if (a.statuses.bleed || a.statuses.poison) {
      const dot = Math.floor(a.maxhp * 0.06);
      a.hp = Math.max(0, a.hp - dot);
      popup(a.x, a.y - 70, '-' + dot, '#c86bff');
      if (a.hp <= 0) { kill(a); endAction(a); return; }
    }
    for (const k of ['atkUp', 'atkDn', 'defUp', 'defDn', 'taunt', 'haste']) {
      if (a.statuses[k]) { a.statuses[k]--; if (a.statuses[k] <= 0) delete a.statuses[k]; }
    }
    if (a.statuses.stun) {
      delete a.statuses.stun;
      popup(a.x, a.y - 70, 'STUNNED', '#7ff');
      endAction(a);
      return;
    }
    a.bp = Math.min(3, (a.bp || 0) + 1); // gain a boost point each turn
    if (action.boost) { a.bp -= action.boost; G.audio.sfx('boost'); }

    B.state = 'anim';
    B.anim = { action, phase: 0, t: 0 };
  }
  function endAction(a) {
    a.atb = 0;
    if (a.statuses.haste) a.atb = 0.35;
    B.anim = null;
    B.state = 'flow';
    checkEnd();
  }

  function performHit(action) {
    const a = action.actor, boost = action.boost || 0;
    const foesOf = u => u.side === 'ally' ? alive(B.foes) : alive(B.allies);
    let tgt = action.target;
    if (tgt && (tgt.hp <= 0 || tgt.dying)) tgt = foesOf(a)[0];
    if (!tgt && action.kind !== 'defend' && action.kind !== 'item' && action.kind !== 'flee') { return; }

    if (action.kind === 'attack') {
      const hits = 1 + boost; // boosting the basic attack = extra strikes
      for (let h = 0; h < hits; h++) {
        if (!tgt || tgt.hp <= 0) tgt = foesOf(a)[0];
        if (tgt) dealDamage(a, tgt, 1.0, { boost: 0 });
      }
      G.audio.sfx(a.world === 'cyber' ? 'gun' : a.world === 'business' ? 'hit' : 'slash');
    } else if (action.kind === 'skill') {
      const sk = action.skill;
      a.mp -= sk.mp;
      G.audio.sfx(sk.sfx || 'hit');
      switch (sk.type) {
        case 'attack': {
          const hits = sk.hits || 1;
          for (let h = 0; h < hits; h++) {
            if (!tgt || tgt.hp <= 0) tgt = foesOf(a)[0];
            if (tgt) dealDamage(a, tgt, sk.pow, { boost, crit: sk.crit || 0 });
          }
          if (tgt && tgt.hp > 0 && sk.status) applyStatus(tgt, sk.status);
          break;
        }
        case 'aoe': {
          foesOf(a).forEach(f => {
            dealDamage(a, f, sk.pow, { boost });
            if (f.hp > 0 && sk.status && Math.random() < 0.5) applyStatus(f, sk.status);
          });
          break;
        }
        case 'healself': healUnit(a, a.maxhp * sk.pow * (1 + boost * 0.3)); break;
        case 'heal': healUnit(action.target && action.target.side === 'ally' ? action.target : a, (action.target || a).maxhp * sk.pow * (1 + boost * 0.3)); break;
        case 'buffself': applyStatus(a, 'atkUp'); applyStatus(a, 'haste'); popup(a.x, a.y - 60, 'OVERCLOCK', '#c86bff'); break;
        case 'taunt': applyStatus(a, 'taunt'); applyStatus(a, 'defUp'); popup(a.x, a.y - 60, 'TAUNT', '#ffd23e'); break;
        case 'debuff': if (tgt) { applyStatus(tgt, 'defDn'); popup(tgt.x, tgt.y - 60, 'DEF DOWN', '#9adcff'); } break;
        case 'partybuff': alive(B.allies).forEach(u => applyStatus(u, 'atkUp')); popup(a.x, a.y - 60, 'RALLY', '#7dffa0'); break;
        case 'steal': {
          const amt = 20 + Math.floor(Math.random() * 40) + G.ch().level * 3;
          B.rewardGold += amt;
          popup(tgt.x, tgt.y - 60, `+${amt} stolen!`, '#ffd23e');
          break;
        }
        case 'gamble': {
          const mult = [0.2, 0.6, 1, 1.5, 2.2, 3.5][Math.floor(Math.random() * 6)];
          popup(a.x, a.y - 80, 'x' + mult, mult >= 2 ? '#ffd23e' : '#b8b0d0', mult >= 2);
          if (tgt) dealDamage(a, tgt, mult, { boost });
          break;
        }
        case 'allin': {
          if (tgt) dealDamage(a, tgt, sk.pow, { boost });
          if (Math.random() < 0.3) { const self = Math.floor(a.maxhp * 0.2); a.hp = Math.max(1, a.hp - self); popup(a.x, a.y - 60, '-' + self, '#ff8080'); }
          break;
        }
      }
    } else if (action.kind === 'item') {
      const it = G.items[action.item], ch = G.ch();
      G.inv.remove(ch, action.item, 1);
      const u = it.use || {};
      const t = action.target || a;
      if (u.heal) healUnit(t, u.heal);
      if (u.mp) { t.mp = Math.min(t.maxmp, t.mp + u.mp); popup(t.x, t.y - 60, '+' + u.mp + ' SP', '#9adcff'); G.audio.sfx('heal'); }
      if (u.revive && t.hp <= 0) { t.hp = Math.floor(t.maxhp * u.revive); t.dying = 0; t.dead = false; popup(t.x, t.y - 60, 'REVIVED', '#ffe98a'); }
    } else if (action.kind === 'defend') {
      a.defending = true;
      popup(a.x, a.y - 60, 'GUARD', '#9adcff');
    } else if (action.kind === 'flee') {
      if (!B.boss && Math.random() < 0.7) { B.state = 'fled'; B.winT = 0; G.toast('Got away…', '#b8b0d0'); }
      else popup(a.x, a.y - 60, "CAN'T ESCAPE", '#ff8080');
    }
    // AI skills for foes
    if (action.aiSkill) {
      const sk = action.aiSkill;
      if (sk.type === 'aoe') alive(B.allies).forEach(t2 => dealDamage(a, t2, sk.pow));
      else if (sk.type === 'heal') healUnit(a, a.maxhp * 0.25);
      else if (sk.type === 'buff') { applyStatus(a, 'atkUp'); popup(a.x, a.y - 60, 'ENRAGED', '#ff4a4a'); }
      else {
        if (tgt) {
          dealDamage(a, tgt, sk.pow || 1);
          if (sk.status && tgt.hp > 0 && Math.random() < 0.4) applyStatus(tgt, sk.status);
        }
      }
      if (sk.sfx) G.audio.sfx(sk.sfx);
    }
  }
  function applyStatus(u, key) {
    u.statuses[key] = key === 'bleed' || key === 'poison' ? 3 : 3;
    const names = { bleed: 'BLEED', poison: 'POISON', stun: 'STUN', atkUp: 'ATK UP', atkDn: 'ATK DOWN', defUp: 'DEF UP', defDn: 'DEF DOWN', taunt: 'TAUNT', haste: 'HASTE' };
    if (key === 'stun') u.statuses.stun = 1;
    popup(u.x, u.y - 78, names[key] || key, '#c86bff');
  }

  // ---------- enemy AI ----------
  function foeAct(foe) {
    const pool = foe.ai;
    let total = 0; pool.forEach(s => total += (s.w || 1));
    let r = Math.random() * total, sk = pool[0];
    for (const s of pool) { r -= (s.w || 1); if (r <= 0) { sk = s; break; } }
    // boss phase 2: rage under 45%
    if (foe.boss && foe.hp / foe.maxhp < 0.45 && !foe.raged) {
      foe.raged = true;
      applyStatus(foe, 'atkUp');
      if (foe.barks && foe.barks.rage) bark(foe, foe.barks.rage);
    }
    const taunter = alive(B.allies).find(u => u.statuses.taunt);
    const tgt = taunter || G.choice(alive(B.allies));
    execute({ actor: foe, kind: 'ai', aiSkill: sk, target: tgt });
  }

  // ---------- win / lose ----------
  function checkEnd() {
    const stopAt = B.opts.stopAt;
    if (stopAt) {
      const mainFoe = B.foes[0];
      if (mainFoe.hp / mainFoe.maxhp <= stopAt) { B.state = 'win'; B.winT = 0; B.scriptedStop = true; return; }
      const hero = B.allies[0];
      if (hero.hp / hero.maxhp <= 0.2) { hero.hp = Math.floor(hero.maxhp * 0.3); } // scripted fights can't be lost
    }
    if (!alive(B.foes).length && B.state !== 'win') {
      B.state = 'win'; B.winT = 0;
      const talker = alive(B.allies).find(a => a.compId);
      if (talker && Math.random() < 0.6) compBark(talker, 'win');
    }
    else if (!alive(B.allies).length && B.state !== 'lose') { B.state = 'lose'; B.loseT = 0; }
  }
  function finishWin() {
    const ch = G.ch(), opts = B.opts;
    if (!B.scriptedStop) {
      ch.gold += B.rewardGold;
      B.rewardItems.forEach(id => G.inv.add(ch, id, 1));
      G.gainExp(ch, G.gs.current, B.rewardExp);
    }
    // persist hero hp/mp
    const hero = B.allies.find(u => u.isHero);
    if (hero) { ch.hp = Math.max(1, hero.hp); ch.mp = hero.mp; }
    const after = opts.onWin;
    B = null;
    if (after) after();
    else G.world.resume();
  }
  function finishLose() {
    const opts = B.opts;
    if (opts.scripted || opts.retryOnLose) { // retry scripted fights
      const enemies = opts.enemies;
      B = null;
      start(opts);
      return;
    }
    B = null;
    G.world.respawn();
  }

  // ---------- player menu ----------
  function openMenu(unit) {
    B.menu = { unit, mode: 'root', idx: 0, boost: 0, list: null, targetIdx: 0, pending: null };
    B.state = 'menu';
  }
  function menuRootItems(u) {
    const items = [{ k: 'attack', label: 'Attack' }, { k: 'skill', label: u.compId ? 'Ability' : 'Skill' },
      { k: 'item', label: 'Item' }, { k: 'defend', label: 'Defend' }];
    if (!B.opts.scripted && !B.boss) items.push({ k: 'flee', label: 'Flee' });
    return items;
  }
  function updateMenu(dt) {
    const m = B.menu, u = m.unit;
    if (u.hp <= 0) { B.menu = null; B.state = 'flow'; return; }
    // boost adjust
    if (G.input.take('boostup') && m.boost < Math.min(3, u.bp)) { m.boost++; G.audio.sfx('boost'); }
    if (G.input.take('boostdn') && m.boost > 0) { m.boost--; G.audio.sfx('cancel'); }
    const nav = (len) => {
      if (G.input.take('up')) { m.idx = (m.idx + len - 1) % len; G.audio.sfx('move'); }
      if (G.input.take('down')) { m.idx = (m.idx + 1) % len; G.audio.sfx('move'); }
    };
    if (m.mode === 'root') {
      const items = menuRootItems(u);
      nav(items.length);
      if (G.input.take('confirm')) {
        G.audio.sfx('confirm');
        const k = items[m.idx].k;
        if (k === 'attack') { m.pending = { kind: 'attack' }; m.mode = 'target'; m.targets = alive(B.foes); m.targetIdx = 0; }
        else if (k === 'defend') { commit({ kind: 'defend' }); }
        else if (k === 'flee') { commit({ kind: 'flee' }); }
        else if (k === 'skill') { m.mode = 'skill'; m.idx = 0; }
        else if (k === 'item') {
          m.itemList = G.inv.list(G.ch(), 'consumable');
          if (!m.itemList.length) { G.toast('No usable items!', '#ff8080'); }
          else { m.mode = 'item'; m.idx = 0; }
        }
      }
    } else if (m.mode === 'skill') {
      const sks = u.skills || [];
      if (!sks.length) { m.mode = 'root'; return; }
      nav(sks.length);
      if (G.input.take('cancel')) { m.mode = 'root'; m.idx = 0; G.audio.sfx('cancel'); return; }
      if (G.input.take('confirm')) {
        const sk = sks[m.idx];
        if (u.mp < sk.mp) { G.audio.sfx('cancel'); G.toast('Not enough SP!', '#ff8080'); return; }
        G.audio.sfx('confirm');
        if (sk.type === 'heal') { m.pending = { kind: 'skill', skill: sk }; m.mode = 'target'; m.targets = alive(B.allies); m.targetIdx = 0; }
        else if (['healself', 'buffself', 'taunt', 'partybuff', 'aoe'].includes(sk.type)) commit({ kind: 'skill', skill: sk });
        else { m.pending = { kind: 'skill', skill: sk }; m.mode = 'target'; m.targets = alive(B.foes); m.targetIdx = 0; }
      }
    } else if (m.mode === 'item') {
      nav(m.itemList.length);
      if (G.input.take('cancel')) { m.mode = 'root'; m.idx = 0; G.audio.sfx('cancel'); return; }
      if (G.input.take('confirm')) {
        G.audio.sfx('confirm');
        const entry = m.itemList[m.idx];
        m.pending = { kind: 'item', item: entry.id };
        m.mode = 'target'; m.targets = B.allies.filter(a => !a.dying); m.targetIdx = 0;
      }
    } else if (m.mode === 'target') {
      const ts = m.targets.filter(t => t.hp > 0 || (m.pending.kind === 'item' && G.items[m.pending.item].use && G.items[m.pending.item].use.revive));
      if (!ts.length) { m.mode = 'root'; return; }
      if (G.input.take('left') || G.input.take('up')) { m.targetIdx = (m.targetIdx + ts.length - 1) % ts.length; G.audio.sfx('move'); }
      if (G.input.take('right') || G.input.take('down')) { m.targetIdx = (m.targetIdx + 1) % ts.length; G.audio.sfx('move'); }
      if (G.input.take('cancel')) { m.mode = 'root'; G.audio.sfx('cancel'); return; }
      if (G.input.take('confirm')) {
        G.audio.sfx('confirm');
        commit(Object.assign({}, m.pending, { target: ts[m.targetIdx] }));
      }
    }
    function commit(action) {
      action.actor = u;
      action.boost = ['attack', 'skill'].includes(action.kind) ? m.boost : 0;
      B.menu = null;
      execute(action);
    }
  }

  // ---------- scene ----------
  const scene = {
    id: 'battle',
    update(dt) {
      if (!B) return;
      B.t += dt;
      G.updateToasts(dt);
      if (B.hitStop > 0) { B.hitStop -= dt; return; }
      B.popups = B.popups.filter(p => (p.t += dt) < 1);
      B.fx = B.fx.filter(f => { f.t += dt; f.x += f.vx * dt; f.y += f.vy * dt; f.vy += 400 * dt; return f.t < f.life; });
      B.barks = B.barks.filter(bk => (bk.t += dt) < 2.8);
      [...B.allies, ...B.foes].forEach(u => {
        if (u.hurtT > 0) u.hurtT -= dt;
        if (u.dying > 0) { u.dying -= dt * (u.boss ? 0.4 : 1); if (u.dying <= 0) u.dead = true; }
      });

      if (B.state === 'intro') {
        B.introT += dt;
        if (B.introT > 0.7) B.state = 'flow';
        return;
      }
      if (B.state === 'win') {
        B.winT += dt;
        if (B.winT > 1 && G.input.take('confirm')) finishWin();
        return;
      }
      if (B.state === 'fled') {
        B.winT += dt;
        if (B.winT > 0.6) { const opts = B.opts; B = null; if (opts.onFlee) opts.onFlee(); else G.world.resume(); }
        return;
      }
      if (B.state === 'lose') {
        B.loseT += dt;
        if (B.loseT > 1.6) finishLose();
        return;
      }
      if (B.state === 'anim') {
        const an = B.anim;
        an.t += dt;
        const a = an.action.actor;
        const dir = a.side === 'ally' ? -1 : 1;
        if (an.phase === 0) { // lunge
          a.x = a.homeX + dir * Math.min(1, an.t / 0.12) * 46;
          if (an.t >= 0.12) { an.phase = 1; an.t = 0; performHit(an.action); }
        } else if (an.phase === 1) { // hold
          if (an.t >= 0.22) { an.phase = 2; an.t = 0; }
        } else { // return
          a.x = a.homeX + dir * (1 - Math.min(1, an.t / 0.15)) * 46;
          if (an.t >= 0.15) { a.x = a.homeX; endAction(a); }
        }
        return;
      }
      if (B.state === 'menu') { updateMenu(dt); /* atb keeps flowing below for others */ }

      // ATB flow (active-mode: fills even while a menu is open, FFVII style)
      const all = [...alive(B.allies), ...alive(B.foes)];
      for (const u of all) {
        if (B.menu && B.menu.unit === u) continue;
        u.atb += dt * (u.spd + 18) / 110 * (u.statuses.haste ? 1.5 : 1);
        if (u.atb >= 1) u.atb = 1;
      }
      if (B.state === 'menu') return;
      // pick next ready unit: foes act instantly, allies open menu
      const readyFoe = alive(B.foes).find(u => u.atb >= 1);
      if (readyFoe) { foeAct(readyFoe); return; }
      const readyAlly = alive(B.allies).find(u => u.atb >= 1);
      if (readyAlly) openMenu(readyAlly);
    },

    draw(ctx) {
      if (!B) return;
      const [sx, sy] = G.shakeOff();
      if (G.shake.t > 0) G.shake.t -= 1 / 60;
      ctx.save();
      ctx.translate(sx, sy);
      ctx.drawImage(B.bg, 0, 0);
      // intro wash
      if (B.state === 'intro') {
        ctx.fillStyle = `rgba(255,255,255,${Math.max(0, 0.6 - B.introT)})`;
        ctx.fillRect(0, 0, G.W, G.H);
      }
      // units (y-sorted)
      const units = [...B.allies, ...B.foes].filter(u => !u.dead).sort((a, b) => a.y - b.y);
      for (const u of units) {
        const frames = u.side === 'ally' ? (u.spr.left || u.spr.side) : (u.spr.right || u.spr.side);
        const fi = (B.anim && B.anim.action.actor === u && B.anim.phase < 2) ? 1 : (Math.floor(G.time * 3 + u.homeX) % 2);
        const img = frames[Math.min(fi, frames.length - 1)];
        const w = img.width * u.scale / 2, h = img.height * u.scale / 2;
        const bob = Math.sin(G.time * 2.2 + u.homeX * 0.1) * 3;
        ctx.save();
        // shadow
        ctx.fillStyle = 'rgba(0,0,0,0.4)';
        ctx.beginPath(); ctx.ellipse(u.x, u.y + 6, w * 0.4, 8, 0, 0, 7); ctx.fill();
        let alpha = 1;
        if (u.dying > 0) alpha = u.dying / 0.6;
        ctx.globalAlpha = alpha;
        if (u.hurtT > 0 && Math.floor(u.hurtT * 30) % 2 === 0) ctx.globalAlpha = 0.4;
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(img, u.x - w / 2, u.y - h + bob, w, h);
        // boost aura
        if (u.side === 'ally' && B.menu && B.menu.unit === u) {
          ctx.strokeStyle = '#ffe98a'; ctx.lineWidth = 2; ctx.globalAlpha = 0.7 + Math.sin(G.time * 6) * 0.3;
          ctx.beginPath(); ctx.ellipse(u.x, u.y + 6, w * 0.5 + 6, 11, 0, 0, 7); ctx.stroke();
        }
        ctx.restore();
        // boss hp bar above
        if (u.boss && u.hp > 0) {
          const bw = 160;
          ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(u.x - bw / 2, u.y - h - 26, bw, 10);
          ctx.fillStyle = '#c43a3a'; ctx.fillRect(u.x - bw / 2 + 1, u.y - h - 25, (bw - 2) * u.hp / u.maxhp, 8);
        }
      }
      // fx sparks
      for (const f of B.fx) {
        ctx.globalAlpha = 1 - f.t / f.life;
        ctx.fillStyle = f.col;
        ctx.fillRect(f.x - 2, f.y - 2, 4, 4);
      }
      ctx.globalAlpha = 1;
      // popups
      ctx.textAlign = 'center';
      for (const p of B.popups) {
        const dy = -p.t * 46;
        ctx.font = p.big ? 'bold 30px "Courier New",monospace' : 'bold 20px "Courier New",monospace';
        ctx.globalAlpha = p.t < 0.7 ? 1 : (1 - p.t) / 0.3;
        ctx.fillStyle = '#000'; ctx.fillText(p.text, p.x + 2, p.y + dy + 2);
        ctx.fillStyle = p.col; ctx.fillText(p.text, p.x, p.y + dy);
      }
      ctx.globalAlpha = 1;
      // barks (speech bubbles)
      for (const bk of B.barks) {
        const u = bk.unit;
        ctx.font = '13px "Courier New",monospace';
        const tw = ctx.measureText(bk.text).width + 18;
        const bx = G.clamp(u.x - tw / 2, 8, G.W - tw - 8), by = u.y - 150 - (u.boss ? 60 : 0);
        ctx.globalAlpha = bk.t > 2.3 ? (2.8 - bk.t) / 0.5 : 0.95;
        G.panel(ctx, bx, by, tw, 26, { bg: 'rgba(20,16,34,0.95)', border: u.color || '#8878c8', r: 6 });
        ctx.fillStyle = '#e8e4f4'; ctx.textAlign = 'left';
        ctx.fillText(bk.text, bx + 9, by + 18);
        ctx.globalAlpha = 1;
      }
      drawHUD(ctx);
      if (B.state === 'win') drawWin(ctx);
      if (B.state === 'lose') {
        ctx.fillStyle = `rgba(60,0,10,${Math.min(0.8, B.loseT)})`;
        ctx.fillRect(0, 0, G.W, G.H);
        ctx.fillStyle = '#ff8080'; ctx.font = 'bold 34px "Courier New",monospace'; ctx.textAlign = 'center';
        ctx.fillText(B.opts.scripted ? 'THE TIMELINE REJECTS THIS END' : 'YOU FELL…', G.W / 2, G.H / 2);
      }
      ctx.restore();
      G.drawToasts(ctx);
    },
  };

  function drawHUD(ctx) {
    // party status panel bottom-right
    const pw = 320, ph = 26 + B.allies.length * 34;
    const px = G.W - pw - 14, py = G.H - ph - 12;
    G.panel(ctx, px, py, pw, ph, { border: '#8878c8' });
    ctx.textAlign = 'left'; ctx.font = '13px "Courier New",monospace';
    B.allies.forEach((u, i) => {
      const y = py + 24 + i * 34;
      ctx.fillStyle = u.hp <= 0 ? '#664' : (B.menu && B.menu.unit === u ? '#ffe98a' : '#e8e4f4');
      ctx.fillText(u.name.slice(0, 9).padEnd(9), px + 12, y);
      // hp bar
      const bw = 92;
      ctx.fillStyle = '#2a2440'; ctx.fillRect(px + 96, y - 10, bw, 9);
      ctx.fillStyle = u.hp / u.maxhp > 0.3 ? '#7dffa0' : '#ff8080';
      ctx.fillRect(px + 96, y - 10, bw * G.clamp(u.hp / u.maxhp, 0, 1), 9);
      ctx.fillStyle = '#9a94b8'; ctx.font = '10px "Courier New",monospace';
      ctx.fillText(`${u.hp}/${u.maxhp}`, px + 98, y - 1);
      ctx.font = '13px "Courier New",monospace';
      // mp
      ctx.fillStyle = '#2a2440'; ctx.fillRect(px + 194, y - 10, 40, 9);
      ctx.fillStyle = '#9adcff'; ctx.fillRect(px + 194, y - 10, 40 * G.clamp(u.mp / u.maxmp, 0, 1), 9);
      // atb
      ctx.fillStyle = '#2a2440'; ctx.fillRect(px + 240, y - 10, 46, 9);
      ctx.fillStyle = u.atb >= 1 ? (Math.floor(G.time * 6) % 2 ? '#ffe98a' : '#fff') : '#c86bff';
      ctx.fillRect(px + 240, y - 10, 46 * G.clamp(u.atb, 0, 1), 9);
      // bp pips
      for (let b = 0; b < 3; b++) {
        ctx.fillStyle = b < u.bp ? '#ffd23e' : '#3a3454';
        ctx.beginPath(); ctx.arc(px + 294 + b * 9, y - 6, 3.5, 0, 7); ctx.fill();
      }
    });
    // command menu
    if (B.state === 'menu' && B.menu) drawMenu(ctx);
  }
  function drawMenu(ctx) {
    const m = B.menu, u = m.unit;
    const mx = 14, mh = 190, my = G.H - mh - 12, mw = 250;
    G.panel(ctx, mx, my, mw, mh, { border: u.color || '#ffe98a' });
    ctx.font = 'bold 14px "Courier New",monospace'; ctx.textAlign = 'left';
    ctx.fillStyle = u.color || '#ffe98a';
    ctx.fillText(`▸ ${u.name}`, mx + 14, my + 22);
    // boost indicator
    ctx.font = '12px "Courier New",monospace';
    ctx.fillStyle = '#9a94b8';
    ctx.fillText('BOOST (Q/E):', mx + 130, my + 22);
    for (let b = 0; b < 3; b++) {
      ctx.fillStyle = b < m.boost ? '#ffd23e' : (b < u.bp ? '#6a6288' : '#2a2440');
      ctx.beginPath(); ctx.arc(mx + 222 + b * 10, my + 18, 4, 0, 7); ctx.fill();
    }
    ctx.font = '15px "Courier New",monospace';
    const drawList = (rows, fmt) => {
      rows.forEach((r, i) => {
        const sel = i === m.idx;
        ctx.fillStyle = sel ? '#ffe98a' : '#cfc8e8';
        ctx.fillText((sel ? '▶ ' : '  ') + fmt(r), mx + 14, my + 52 + i * 24);
      });
    };
    if (m.mode === 'root') drawList(menuRootItems(u), r => r.label);
    else if (m.mode === 'skill') {
      drawList(u.skills, sk => `${sk.name} ${sk.mp}sp`);
      const sk = u.skills[m.idx];
      if (sk) { ctx.font = '11px "Courier New",monospace'; ctx.fillStyle = '#9a94b8'; ctx.fillText(sk.desc || '', mx + 14, my + mh - 12); ctx.font = '15px "Courier New",monospace'; }
    } else if (m.mode === 'item') drawList(m.itemList, e => `${e.it.name} x${e.n}`);
    else if (m.mode === 'target') {
      ctx.fillStyle = '#9a94b8'; ctx.fillText('Choose target…', mx + 14, my + 52);
      const ts = m.targets.filter(t => t.hp > 0 || (m.pending.kind === 'item' && G.items[m.pending.item].use && G.items[m.pending.item].use.revive));
      const t = ts[m.targetIdx];
      if (t) { // cursor
        ctx.fillStyle = '#ffe98a'; ctx.font = 'bold 26px "Courier New",monospace'; ctx.textAlign = 'center';
        const bob = Math.sin(G.time * 8) * 5;
        ctx.fillText('▼', t.x, t.y - (t.spr.h || 48) * (t.scale || 3) / 2 - 40 + bob);
        ctx.font = '14px "Courier New",monospace';
        ctx.fillText(t.name, t.x, t.y - (t.spr.h || 48) * (t.scale || 3) / 2 - 62);
        ctx.textAlign = 'left';
      }
    }
  }
  function drawWin(ctx) {
    const a = Math.min(1, B.winT * 2);
    ctx.globalAlpha = a;
    G.panel(ctx, G.W / 2 - 220, 100, 440, B.scriptedStop ? 90 : 170, { border: '#ffd23e' });
    ctx.textAlign = 'center';
    ctx.font = 'bold 24px "Courier New",monospace'; ctx.fillStyle = '#ffd23e';
    ctx.fillText(B.scriptedStop ? 'ENOUGH—' : 'VICTORY', G.W / 2, 138);
    ctx.font = '15px "Courier New",monospace'; ctx.fillStyle = '#e8e4f4';
    if (!B.scriptedStop) {
      ctx.fillText(`EXP +${B.rewardExp}    ${G.currency()} +${B.rewardGold}`, G.W / 2, 172);
      const names = B.rewardItems.map(id => G.items[id] ? G.items[id].name : id);
      if (names.length) ctx.fillText('Spoils: ' + names.join(', '), G.W / 2, 198);
      else ctx.fillText('No spoils this time.', G.W / 2, 198);
    }
    if (B.winT > 1) {
      ctx.fillStyle = '#9a94b8';
      ctx.fillText('— Z —', G.W / 2, B.scriptedStop ? 168 : 244);
    }
    ctx.globalAlpha = 1;
    ctx.textAlign = 'left';
  }

  function heroSkills(worldKey, level) {
    return (HERO_SKILLS[worldKey] || []).filter(sk => level >= sk.lv);
  }
  return { start, heroSkills, get B() { return B; } };
})();
G.startBattle = function (opts) {
  G.fadeTo(() => G.combat.start(opts), 0.6, 'battle');
};
