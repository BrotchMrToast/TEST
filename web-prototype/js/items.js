// TRINITY RIFT — items, equipment, inventory, stats & leveling
'use strict';
G.items = {};
(function () {
  const I = (id, def) => { def.id = id; G.items[id] = def; };
  const W = (id, name, world, tier, atk, price, desc, extra) =>
    I(id, Object.assign({ name, type: 'weapon', world, tier, atk, price, desc }, extra));
  const A = (id, name, world, tier, def, price, desc, extra) =>
    I(id, Object.assign({ name, type: 'armor', world, tier, def, price, desc }, extra));
  const X = (id, name, world, price, desc, extra) =>
    I(id, Object.assign({ name, type: 'acc', world, price, desc }, extra));
  const C = (id, name, world, price, desc, use) =>
    I(id, { name, type: 'consumable', world, price, desc, use });

  // ---------------- SAMURAI ----------------
  W('sam_w1', 'Chipped Katana', 'samurai', 1, 6, 80, 'A blade that has seen too many funerals.');
  W('sam_w2', "Soldier's Yari", 'samurai', 2, 11, 260, 'Standard ashigaru spear. Reliable, unloved.');
  W('sam_w3', 'Kurogane Blade', 'samurai', 3, 17, 620, 'Forged in the castle town of black iron.');
  W('sam_w4', 'Bloodfang Odachi', 'samurai', 4, 24, 1300, 'Too heavy for a sane man. You are not sane.', { spd: -2 });
  W('sam_w5', "Masamune's Sorrow", 'samurai', 5, 32, 2600, 'It hums when drawn, like a mourner.', { crit: 8 });
  A('sam_a1', 'Straw Garb', 'samurai', 1, 3, 60, 'Smells of rice fields and rain.');
  A('sam_a2', 'Do-Maru Armor', 'samurai', 2, 7, 240, 'Lacquered chest plates of a fallen ronin.');
  A('sam_a3', 'Kurogane Mail', 'samurai', 3, 12, 580, 'Black iron rings, cold as the forge master.');
  A('sam_a4', 'War Oni Plate', 'samurai', 4, 18, 1200, 'Cut from a demon. It still twitches.', { spd: -2 });
  A('sam_a5', "Shogun's Regalia", 'samurai', 5, 25, 2400, 'Worn by the man you came to kill.', { hp: 40 });
  X('sam_x1', 'Omamori Charm', 'samurai', 200, "Hana's shrine charm. +25 max HP.", { hp: 25 });
  X('sam_x2', 'Swift Tabi', 'samurai', 350, 'Silent field boots. +4 SPD.', { spd: 4 });
  X('sam_x3', 'Whetstone of Wrath', 'samurai', 500, 'Sharpens more than steel. +5 ATK.', { atk: 5 });
  C('sam_h1', 'Onigiri', 'samurai', 30, 'Restores 60 HP. Mother made these once.', { heal: 60 });
  C('sam_h2', 'Healing Salve', 'samurai', 90, 'Restores 150 HP. Bitter herbs, honest work.', { heal: 150 });
  C('sam_m1', 'Green Tea', 'samurai', 60, 'Restores 30 SP.', { mp: 30 });
  C('sam_r1', 'Prayer Tag', 'samurai', 220, 'Revives a fallen ally at half HP.', { revive: 0.5 });

  // ---------------- BUSINESSMAN ----------------
  W('biz_w1', 'Boxcutter', 'business', 1, 6, 80, 'From the office supply closet. It opened you first.');
  W('biz_w2', 'Brass Knuckles', 'business', 2, 11, 260, '"A gift", Tetsu said. Gifts here have teeth.');
  W('biz_w3', 'Collapsible Baton', 'business', 3, 17, 620, 'Fits in a briefcase next to the spreadsheets.');
  W('biz_w4', 'Compact Pistol', 'business', 4, 24, 1300, 'Never fired. Until it was.', { crit: 5 });
  W('biz_w5', 'Custom .45 "Severance"', 'business', 5, 32, 2600, 'Your resignation letter, notarized in lead.', { crit: 8 });
  A('biz_a1', 'Off-rack Suit', 'business', 1, 3, 60, 'Polyester. Your soul itches.');
  A('biz_a2', 'Tailored Suit', 'business', 2, 7, 240, 'Ginza cut. Blood comes out with club soda.');
  A('biz_a3', 'Kevlar Vest', 'business', 3, 12, 580, 'Business casual, Kabukicho edition.');
  A('biz_a4', 'Armored Chauffeur Coat', 'business', 4, 18, 1200, "The last driver didn't need it anymore.", { spd: -2 });
  A('biz_a5', "Oyabun's Bulletproof Suit", 'business', 5, 25, 2400, 'Silk outside, steel inside. Like its owner.', { hp: 40 });
  X('biz_x1', 'Lucky Tiepin', 'business', 200, 'Survived three mergers. +25 max HP.', { hp: 25 });
  X('biz_x2', "Runner's Loafers", 'business', 350, 'For exits, strategic. +4 SPD.', { spd: 4 });
  X('biz_x3', 'Golden Watch', 'business', 500, 'Time is leverage. +5 ATK.', { atk: 5 });
  C('biz_h1', 'Conbini Bento', 'business', 30, 'Restores 60 HP. 24h comfort.', { heal: 60 });
  C('biz_h2', 'Energy Drink XX', 'business', 90, 'Restores 150 HP. Heart palpitations included.', { heal: 150 });
  C('biz_m1', 'Black Coffee', 'business', 60, 'Restores 30 SP.', { mp: 30 });
  C('biz_r1', 'Defibrillator Kit', 'business', 220, 'Revives a fallen ally at half HP.', { revive: 0.5 });

  // ---------------- CYBERPUNK ----------------
  W('cyb_w1', 'Scrap Pistol', 'cyber', 1, 6, 80, 'Printed in a basement. Jams politely.');
  W('cyb_w2', 'Mono-Knife', 'cyber', 2, 11, 260, 'One molecule thick. Do not check the edge.');
  W('cyb_w3', 'Pulse SMG', 'cyber', 3, 17, 620, 'Sings in ultraviolet.');
  W('cyb_w4', 'Railgun "Whisper"', 'cyber', 4, 24, 1300, 'The last thing heard, and barely.', { crit: 5 });
  W('cyb_w5', 'Prototype Arc Cannon', 'cyber', 5, 32, 2600, 'Property of the Ministry. Finders keepers.', { crit: 8 });
  A('cyb_a1', 'Synth Jacket', 'cyber', 1, 3, 60, 'Smells like rain and ozone.');
  A('cyb_a2', 'Plated Weave', 'cyber', 2, 7, 240, 'Ballistic mesh under streetwear.');
  A('cyb_a3', 'Aegis Subdermal', 'cyber', 3, 12, 580, 'Armor you cannot forget at home.');
  A('cyb_a4', 'Mil-Spec Exoshell', 'cyber', 4, 18, 1200, 'Stolen from a checkpoint locker.', { spd: -2 });
  A('cyb_a5', 'Ghostwire Suit', 'cyber', 5, 25, 2400, 'Cameras develop sudden amnesia.', { hp: 40 });
  X('cyb_x1', 'Neural Charm', 'cyber', 200, "Mira's old trinket, wired to your HUD. +25 max HP.", { hp: 25 });
  X('cyb_x2', 'Kinetic Boots', 'cyber', 350, 'Charge with every step. +4 SPD.', { spd: 4 });
  X('cyb_x3', 'Target Assist Chip', 'cyber', 500, 'Aim like a machine. +5 ATK.', { atk: 5 });
  C('cyb_h1', 'Synth-Ramen', 'cyber', 30, 'Restores 60 HP. 90% noodle-adjacent.', { heal: 60 });
  C('cyb_h2', 'Stim Pack', 'cyber', 90, 'Restores 150 HP. Mild time dilation.', { heal: 150 });
  C('cyb_m1', 'Neuro-Booster', 'cyber', 60, 'Restores 30 SP.', { mp: 30 });
  C('cyb_r1', 'Trauma Drone', 'cyber', 220, 'Revives a fallen ally at half HP.', { revive: 0.5 });

  // ---------------- CONVERGENCE / DIVINE ----------------
  W('div_w1', 'Chrono Edge', 'convergence', 6, 46, 0, 'Three lifetimes folded into one blade.', { crit: 12 });
  A('div_a1', 'Vestment of Hours', 'convergence', 6, 34, 0, 'Woven from unspent seconds.', { hp: 80 });
  X('div_x1', 'The Unbroken Memory', 'convergence', 0, 'Everything you were. +8 ATK, +8 SPD.', { atk: 8, spd: 8 });
  C('div_h1', 'Drop of Eternity', 'convergence', 0, 'Restores 400 HP.', { heal: 400 });

  // key / story items
  I('key_ribbon', { name: "Hana's Ribbon", type: 'key', desc: 'Torn silk, found in the ashes. She is alive.' });
  I('key_ledger', { name: 'Black Ledger', type: 'key', desc: "Every payment the Kurosawa-gumi ever hid. Your leverage. Your noose." });
  I('key_chip', { name: 'Senator Datachip', type: 'key', desc: "Ren's last recording. The truth about Directive Zero." });
  I('key_shard1', { name: 'Rift Shard: Vermilion', type: 'key', desc: 'A splinter of broken time. It shows a burning village.' });
  I('key_shard2', { name: 'Rift Shard: Cobalt', type: 'key', desc: 'A splinter of broken time. It reflects neon rain.' });
  I('key_shard3', { name: 'Rift Shard: Violet', type: 'key', desc: 'A splinter of broken time. It hums with static.' });
})();

// ---------------- inventory helpers ----------------
G.inv = {
  add(ch, id, n = 1) {
    ch.inv[id] = (ch.inv[id] || 0) + n;
    const it = G.items[id];
    if (it) G.toast(`Got ${it.name}${n > 1 ? ' x' + n : ''}`, '#ffd23e');
  },
  remove(ch, id, n = 1) {
    if (!ch.inv[id]) return false;
    ch.inv[id] -= n;
    if (ch.inv[id] <= 0) delete ch.inv[id];
    return true;
  },
  count: (ch, id) => ch.inv[id] || 0,
  list(ch, type) {
    return Object.keys(ch.inv)
      .filter(id => G.items[id] && (!type || G.items[id].type === type))
      .map(id => ({ id, n: ch.inv[id], it: G.items[id] }));
  },
};
G.equipItem = function (ch, id) {
  const it = G.items[id];
  if (!it) return;
  const slot = it.type === 'weapon' ? 'weapon' : it.type === 'armor' ? 'armor' : 'acc';
  const prev = ch.equip[slot];
  if (prev) G.inv.add(ch, prev, 1);
  ch.equip[slot] = id;
  G.inv.remove(ch, id, 1);
};

// ---------------- hero base stats & growth ----------------
G.heroBase = {
  samurai: { hp: 95, mp: 24, atk: 12, def: 7, spd: 9, ghp: 14, gmp: 3, gatk: 2.4, gdef: 1.5, gspd: 0.8 },
  business:{ hp: 105, mp: 28, atk: 10, def: 8, spd: 8, ghp: 15, gmp: 3.4, gatk: 2.1, gdef: 1.7, gspd: 0.7 },
  cyber:   { hp: 88, mp: 30, atk: 13, def: 6, spd: 11, ghp: 13, gmp: 3.6, gatk: 2.5, gdef: 1.3, gspd: 1.0 },
  divine:  { hp: 600, mp: 120, atk: 60, def: 34, spd: 16, ghp: 0, gmp: 0, gatk: 0, gdef: 0, gspd: 0 },
};
G.compBase = { // companion archetypes, scale with hero level
  brute:    { hp: 1.25, mp: 0.6, atk: 1.15, def: 1.2, spd: 0.7 },
  tactician:{ hp: 0.85, mp: 1.4, atk: 0.8, def: 0.9, spd: 1.0 },
  thief:    { hp: 0.8, mp: 0.9, atk: 1.0, def: 0.7, spd: 1.5 },
  gambler:  { hp: 0.9, mp: 1.0, atk: 1.05, def: 0.8, spd: 1.1 },
  tech:     { hp: 0.8, mp: 1.5, atk: 0.75, def: 0.85, spd: 0.95 },
};

G.expFor = level => Math.floor(55 * Math.pow(level, 1.85));

G.heroStats = function (chKey) {
  const ch = chKey === 'convergence' ? G.gs.convergence : G.gs.chars[chKey];
  const world = chKey === 'convergence' ? 'divine' : chKey;
  const b = G.heroBase[world];
  const L = ch.level - 1;
  const s = {
    hp: Math.floor(b.hp + b.ghp * L), mp: Math.floor(b.mp + b.gmp * L),
    atk: Math.floor(b.atk + b.gatk * L), def: Math.floor(b.def + b.gdef * L),
    spd: Math.floor(b.spd + b.gspd * L), crit: 6,
  };
  for (const slot of ['weapon', 'armor', 'acc']) {
    const it = ch.equip && G.items[ch.equip[slot]];
    if (!it) continue;
    s.atk += it.atk || 0; s.def += it.def || 0; s.spd += it.spd || 0;
    s.hp += it.hp || 0; s.crit += it.crit || 0;
  }
  return s;
};
G.compStats = function (compId, heroLevel) {
  const comp = G.companions[compId];
  const m = G.compBase[comp.type];
  const L = heroLevel - 1;
  return {
    hp: Math.floor((80 + 12 * L) * m.hp), mp: Math.floor((22 + 3 * L) * m.mp),
    atk: Math.floor((10 + 2.1 * L) * m.atk), def: Math.floor((7 + 1.4 * L) * m.def),
    spd: Math.floor((9 + 0.8 * L) * m.spd), crit: comp.type === 'thief' ? 14 : 6,
  };
};
G.gainExp = function (ch, chKey, amount) {
  ch.exp += amount;
  let leveled = false;
  while (ch.exp >= G.expFor(ch.level)) {
    ch.exp -= G.expFor(ch.level);
    ch.level++;
    leveled = true;
  }
  if (leveled) {
    const s = G.heroStats(chKey);
    ch.hp = s.hp; ch.mp = s.mp; // full restore on level up
    G.toast(`LEVEL UP! ${G.heroDefs[chKey === 'convergence' ? 'divine' : chKey].name} is now Lv ${ch.level}`, '#7dffa0');
    G.audio.sfx('level');
  }
  return leveled;
};
