// TRINITY RIFT — pause menu, shop, HUD
'use strict';

// ================= PAUSE MENU =================
G.Menu = function () {
  this.tabs = ['Status', 'Items', 'Equip', 'Party', 'Quests', 'System'];
  this.tab = 0; this.idx = 0; this.blocking = true; this.msg = '';
};
G.Menu.prototype = {
  update(dt) {
    if (G.input.take('menu') || G.input.take('cancel')) {
      G.audio.sfx('cancel'); G.overlay = null; return;
    }
    if (G.input.take('left')) { this.tab = (this.tab + this.tabs.length - 1) % this.tabs.length; this.idx = 0; this.msg = ''; G.audio.sfx('move'); }
    if (G.input.take('right')) { this.tab = (this.tab + 1) % this.tabs.length; this.idx = 0; this.msg = ''; G.audio.sfx('move'); }
    const ch = G.ch();
    const nav = len => {
      if (len <= 0) return;
      if (G.input.take('up')) { this.idx = (this.idx + len - 1) % len; G.audio.sfx('move'); }
      if (G.input.take('down')) { this.idx = (this.idx + 1) % len; G.audio.sfx('move'); }
      this.idx = Math.min(this.idx, len - 1);
    };
    const tab = this.tabs[this.tab];
    if (tab === 'Items') {
      const list = G.inv.list(ch).filter(e => e.it.type === 'consumable' || e.it.type === 'key');
      nav(list.length);
      if (G.input.take('confirm') && list.length) {
        const e = list[this.idx];
        if (e.it.type === 'consumable' && e.it.use) {
          const u = e.it.use, s = G.heroStats(G.gs.current);
          if (u.heal) { ch.hp = Math.min(s.hp, ch.hp + u.heal); G.audio.sfx('heal'); G.inv.remove(ch, e.id, 1); this.msg = `Used ${e.it.name}.`; }
          else if (u.mp) { ch.mp = Math.min(s.mp, ch.mp + u.mp); G.audio.sfx('heal'); G.inv.remove(ch, e.id, 1); this.msg = `Used ${e.it.name}.`; }
          else this.msg = 'Only useful in battle.';
        } else this.msg = (e.it.desc || 'A story item.');
      }
    } else if (tab === 'Equip') {
      const list = G.inv.list(ch).filter(e => ['weapon', 'armor', 'acc'].includes(e.it.type));
      nav(list.length);
      if (G.input.take('confirm') && list.length) {
        const e = list[this.idx];
        G.equipItem(ch, e.id);
        G.audio.sfx('confirm');
        this.msg = `Equipped ${e.it.name}.`;
        const s = G.heroStats(G.gs.current);
        ch.hp = Math.min(ch.hp, s.hp); ch.mp = Math.min(ch.mp, s.mp);
      }
    } else if (tab === 'Party') {
      nav(ch.party.length);
      if (G.input.take('confirm') && ch.party.length) {
        const cid = ch.party[this.idx];
        ch.party.splice(this.idx, 1);
        this.msg = `${G.companions[cid].name} left the party.`;
        G.audio.sfx('cancel');
      }
    } else if (tab === 'System') {
      const opts = 5;
      nav(opts);
      if (G.input.take('confirm')) {
        G.audio.sfx('confirm');
        if (this.idx === 0) { this.msg = G.save() ? 'Game saved.' : 'Save failed!'; }
        else if (this.idx === 1) { G.muted = !G.muted; this.msg = 'Music ' + (G.muted ? 'off' : 'on'); }
        else if (this.idx === 2) { G.fx = !G.fx; this.msg = 'HD-2D effects ' + (G.fx ? 'on' : 'off'); }
        else if (this.idx === 3) { this.msg = 'Z:confirm X:cancel Esc:menu Q/E:boost Shift:run'; }
        else { G.save(); G.overlay = null; G.scenes.toSelect(); }
      }
    } else if (tab === 'Quests') {
      nav(Math.max(1, G.activeQuests().length));
    }
  },
  draw(ctx) {
    const ch = G.ch(), key = G.gs.current;
    const world = key === 'convergence' ? 'divine' : key;
    const hd = G.heroDefs[world];
    ctx.fillStyle = 'rgba(4,3,10,0.78)'; ctx.fillRect(0, 0, G.W, G.H);
    G.panel(ctx, 40, 30, G.W - 80, G.H - 60, { border: hd.color });
    // tabs
    ctx.font = 'bold 15px "Courier New",monospace'; ctx.textAlign = 'left';
    this.tabs.forEach((t, i) => {
      const x = 70 + i * 140;
      if (i === this.tab) { G.panel(ctx, x - 10, 44, 124, 30, { border: '#ffd23e', bg: '#241d3d', r: 6 }); }
      ctx.fillStyle = i === this.tab ? '#ffd23e' : '#8a82a8';
      ctx.fillText(t, x, 64);
    });
    ctx.strokeStyle = '#3a3454'; ctx.beginPath(); ctx.moveTo(60, 84); ctx.lineTo(G.W - 60, 84); ctx.stroke();
    const tab = this.tabs[this.tab];
    ctx.font = '15px "Courier New",monospace';
    const left = 80, top = 118;
    if (tab === 'Status') {
      const s = G.heroStats(key);
      const spr = G.sprites.build(hd.spr);
      ctx.drawImage(spr.portrait, left, top - 10, 100, 100);
      ctx.fillStyle = hd.color; ctx.font = 'bold 20px "Courier New",monospace';
      ctx.fillText(`${hd.name} ${hd.title}`, left + 120, top + 14);
      ctx.font = '15px "Courier New",monospace'; ctx.fillStyle = '#e8e4f4';
      const rows = [
        `Level ${ch.level}   EXP ${ch.exp}/${G.expFor(ch.level)}`,
        `HP ${ch.hp}/${s.hp}    SP ${ch.mp}/${s.mp}`,
        `ATK ${s.atk}   DEF ${s.def}   SPD ${s.spd}   CRIT ${s.crit}%`,
        `${G.currency()}: ${ch.gold}`,
        '',
        `Weapon: ${ch.equip.weapon ? G.items[ch.equip.weapon].name : '—'}`,
        `Armor:  ${ch.equip.armor ? G.items[ch.equip.armor].name : '—'}`,
        `Charm:  ${ch.equip.acc ? G.items[ch.equip.acc].name : '—'}`,
      ];
      rows.forEach((r, i) => ctx.fillText(r, left + 120, top + 44 + i * 24));
      // companions
      ch.party.forEach((cid, i) => {
        const c = G.companions[cid];
        const cs = G.compStats(cid, ch.level);
        const cy = top + 130 + i * 110;
        ctx.drawImage(G.sprites.build(c.spr).portrait, left, cy, 70, 70);
        ctx.fillStyle = '#cfc8e8'; ctx.fillText(`${c.name} — ${c.type}`, left + 84, cy + 24);
        ctx.fillStyle = '#9a94b8'; ctx.fillText(`HP ${cs.hp}  ATK ${cs.atk}  DEF ${cs.def}  SPD ${cs.spd}`, left + 84, cy + 48);
      });
    } else if (tab === 'Items') {
      const list = G.inv.list(ch).filter(e => e.it.type === 'consumable' || e.it.type === 'key');
      if (!list.length) { ctx.fillStyle = '#8a82a8'; ctx.fillText('Empty pockets.', left, top); }
      list.slice(0, 13).forEach((e, i) => {
        ctx.fillStyle = i === this.idx ? '#ffe98a' : (e.it.type === 'key' ? '#c86bff' : '#e8e4f4');
        ctx.fillText(`${i === this.idx ? '▶' : ' '} ${e.it.name} x${e.n}`, left, top + i * 26);
      });
      const sel = list[this.idx];
      if (sel) { ctx.fillStyle = '#9a94b8'; ctx.fillText(sel.it.desc || '', left, G.H - 100); }
    } else if (tab === 'Equip') {
      const list = G.inv.list(ch).filter(e => ['weapon', 'armor', 'acc'].includes(e.it.type));
      ctx.fillStyle = '#9a94b8'; ctx.fillText('Z to equip. Current gear returns to the bag.', left, top - 14);
      if (!list.length) { ctx.fillStyle = '#8a82a8'; ctx.fillText('Nothing to equip.', left, top + 16); }
      list.slice(0, 12).forEach((e, i) => {
        const it = e.it;
        const statStr = ['atk', 'def', 'spd', 'hp', 'crit'].filter(k => it[k]).map(k => `${k.toUpperCase()}+${it[k]}`).join(' ');
        ctx.fillStyle = i === this.idx ? '#ffe98a' : '#e8e4f4';
        ctx.fillText(`${i === this.idx ? '▶' : ' '} [${it.type}] ${it.name} x${e.n}  ${statStr}`, left, top + 16 + i * 26);
      });
      const sel = list[this.idx];
      if (sel) { ctx.fillStyle = '#9a94b8'; ctx.fillText(sel.it.desc || '', left, G.H - 100); }
    } else if (tab === 'Party') {
      ctx.fillStyle = '#9a94b8';
      ctx.fillText(`Companions: ${ch.party.length}/2 — Z to dismiss. Hire in towns.`, left, top - 14);
      if (!ch.party.length) { ctx.fillStyle = '#8a82a8'; ctx.fillText('You travel alone.', left, top + 20); }
      ch.party.forEach((cid, i) => {
        const c = G.companions[cid];
        const cy = top + 20 + i * 120;
        ctx.drawImage(G.sprites.build(c.spr).portrait, left, cy, 80, 80);
        ctx.fillStyle = i === this.idx ? '#ffe98a' : '#e8e4f4';
        ctx.fillText(`${i === this.idx ? '▶' : ' '}${c.name}  (${c.type})`, left + 100, cy + 26);
        ctx.fillStyle = '#9a94b8';
        G.wrapText(ctx, c.bio || '', 500).slice(0, 2).forEach((r, j) => ctx.fillText(r, left + 100, cy + 52 + j * 22));
      });
    } else if (tab === 'Quests') {
      const wd = G.worlds[ch.world];
      if (wd && wd.chapters[ch.chapter]) {
        ctx.fillStyle = '#ffd23e'; ctx.fillText('◆ MAIN: ' + wd.chapters[ch.chapter].goal, left, top);
      }
      const qs = G.activeQuests();
      if (!qs.length) { ctx.fillStyle = '#8a82a8'; ctx.fillText('No side quests active. Talk to people.', left, top + 40); }
      qs.forEach((id, i) => {
        const q = G.quests[id];
        ctx.fillStyle = i === this.idx ? '#ffe98a' : '#9adcff';
        ctx.fillText(`○ ${q.name}`, left, top + 44 + i * 52);
        ctx.fillStyle = '#9a94b8';
        ctx.fillText('   ' + G.questProgress(id), left, top + 66 + i * 52);
      });
      // completed
      const doneQs = Object.keys(ch.quests).filter(id => ch.quests[id].done && G.quests[id]);
      doneQs.slice(0, 4).forEach((id, i) => {
        ctx.fillStyle = '#5a7a5a';
        ctx.fillText(`● ${G.quests[id].name} — done`, left + 480, top + 44 + i * 26);
      });
    } else if (tab === 'System') {
      ['Save Game', `Music: ${G.muted ? 'OFF' : 'ON'}`, `HD-2D FX: ${G.fx ? 'ON' : 'OFF'}`, 'Controls', 'Return to Character Select'].forEach((o, i) => {
        ctx.fillStyle = i === this.idx ? '#ffe98a' : '#e8e4f4';
        ctx.fillText(`${i === this.idx ? '▶' : ' '} ${o}`, left, top + i * 30);
      });
    }
    if (this.msg) { ctx.fillStyle = '#7dffa0'; ctx.fillText(this.msg, left, G.H - 70); }
  },
};

// ================= SHOP =================
G.Shop = function (shopId) {
  this.shop = G.shops[shopId];
  this.mode = 'buy'; this.idx = 0; this.blocking = true; this.msg = '';
};
G.Shop.prototype = {
  items() {
    const ch = G.ch();
    if (this.mode === 'buy') return this.shop.items.map(id => ({ id, it: G.items[id] })).filter(e => e.it);
    return G.inv.list(ch).filter(e => e.it.price && e.it.type !== 'key');
  },
  update(dt) {
    const ch = G.ch();
    if (G.input.take('cancel') || G.input.take('menu')) { G.audio.sfx('cancel'); G.overlay = null; return; }
    if (G.input.take('left') || G.input.take('right')) { this.mode = this.mode === 'buy' ? 'sell' : 'buy'; this.idx = 0; this.msg = ''; G.audio.sfx('move'); }
    const list = this.items();
    if (G.input.take('up')) { this.idx = (this.idx + Math.max(1, list.length) - 1) % Math.max(1, list.length); G.audio.sfx('move'); }
    if (G.input.take('down')) { this.idx = (this.idx + 1) % Math.max(1, list.length); G.audio.sfx('move'); }
    this.idx = Math.min(this.idx, Math.max(0, list.length - 1));
    if (G.input.take('confirm') && list.length) {
      const e = list[this.idx];
      if (this.mode === 'buy') {
        if (ch.gold >= e.it.price) {
          ch.gold -= e.it.price; G.inv.add(ch, e.id, 1); G.audio.sfx('gold');
          this.msg = `Bought ${e.it.name}.`;
        } else { this.msg = 'Not enough ' + G.currency() + '!'; G.audio.sfx('cancel'); }
      } else {
        const val = Math.floor(e.it.price / 2);
        G.inv.remove(ch, e.id, 1); ch.gold += val; G.audio.sfx('gold');
        this.msg = `Sold ${e.it.name} for ${val}.`;
      }
    }
  },
  draw(ctx) {
    const ch = G.ch();
    ctx.fillStyle = 'rgba(4,3,10,0.7)'; ctx.fillRect(0, 0, G.W, G.H);
    G.panel(ctx, 120, 50, G.W - 240, G.H - 120, { border: '#ffd23e' });
    ctx.font = 'bold 19px "Courier New",monospace'; ctx.textAlign = 'left';
    ctx.fillStyle = '#ffd23e'; ctx.fillText(this.shop.name, 150, 86);
    ctx.font = '15px "Courier New",monospace';
    ctx.fillStyle = '#9a94b8';
    ctx.fillText(`◀ ${this.mode.toUpperCase()} ▶      ${G.currency()}: ${ch.gold}`, 150, 114);
    const list = this.items();
    if (!list.length) { ctx.fillStyle = '#8a82a8'; ctx.fillText(this.mode === 'buy' ? 'Sold out.' : 'Nothing to sell.', 150, 160); }
    list.slice(0, 10).forEach((e, i) => {
      const price = this.mode === 'buy' ? e.it.price : Math.floor(e.it.price / 2);
      const owned = G.inv.count(ch, e.id);
      ctx.fillStyle = i === this.idx ? '#ffe98a' : (this.mode === 'buy' && ch.gold < price ? '#6a6288' : '#e8e4f4');
      const nm = e.it.name + (this.mode === 'sell' ? ` x${e.n}` : (owned ? ` (own ${owned})` : ''));
      ctx.fillText(`${i === this.idx ? '▶' : ' '} ${nm}`, 150, 152 + i * 27);
      ctx.textAlign = 'right';
      ctx.fillText(`${price}`, G.W - 160, 152 + i * 27);
      ctx.textAlign = 'left';
    });
    const sel = list[this.idx];
    if (sel) {
      ctx.fillStyle = '#9a94b8';
      const statStr = ['atk', 'def', 'spd', 'hp', 'crit'].filter(k => sel.it[k]).map(k => `${k.toUpperCase()}+${sel.it[k]}`).join(' ');
      G.wrapText(ctx, (statStr ? statStr + ' — ' : '') + (sel.it.desc || ''), G.W - 320).slice(0, 2)
        .forEach((r, i) => ctx.fillText(r, 150, G.H - 130 + i * 22));
    }
    if (this.msg) { ctx.fillStyle = '#7dffa0'; ctx.fillText(this.msg, 150, G.H - 86); }
  },
};

// ================= overworld HUD =================
G.drawHUD = function (ctx) {
  const ch = G.ch(), key = G.gs.current;
  if (!ch) return;
  const world = key === 'convergence' ? 'divine' : key;
  const hd = G.heroDefs[world];
  const s = G.heroStats(key);
  G.panel(ctx, 10, 10, 240, 64, { bg: 'rgba(8,6,16,0.8)' });
  ctx.font = 'bold 14px "Courier New",monospace'; ctx.textAlign = 'left';
  ctx.fillStyle = hd.color; ctx.fillText(`${hd.name}  Lv${ch.level}`, 22, 30);
  ctx.fillStyle = '#2a2440'; ctx.fillRect(22, 38, 150, 10);
  ctx.fillStyle = ch.hp / s.hp > 0.3 ? '#7dffa0' : '#ff8080';
  ctx.fillRect(22, 38, 150 * G.clamp(ch.hp / s.hp, 0, 1), 10);
  ctx.fillStyle = '#2a2440'; ctx.fillRect(22, 52, 90, 8);
  ctx.fillStyle = '#9adcff'; ctx.fillRect(22, 52, 90 * G.clamp(ch.mp / s.mp, 0, 1), 8);
  ctx.fillStyle = '#e8e4f4'; ctx.font = '11px "Courier New",monospace';
  ctx.fillText(`${ch.hp}/${s.hp}`, 178, 47);
  ctx.fillStyle = '#ffd23e'; ctx.fillText(`${ch.gold} ${G.currency()}`, 178, 60);
  // objective tracker
  const wd = G.worlds[ch.world];
  if (wd && wd.chapters && wd.chapters[ch.chapter]) {
    ctx.font = '13px "Courier New",monospace';
    const goal = '◆ ' + wd.chapters[ch.chapter].goal;
    const tw = ctx.measureText(goal).width + 24;
    G.panel(ctx, G.W - tw - 10, 10, tw, 30, { bg: 'rgba(8,6,16,0.75)', border: '#3a3454', r: 6 });
    ctx.fillStyle = '#9adcff'; ctx.fillText(goal, G.W - tw + 2, 30);
  }
};
