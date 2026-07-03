// TRINITY RIFT — WORLD 2: Daiki, modern Tokyo (coerced into the Kurosawa-gumi)
'use strict';
(function () {
  const DAIKI = G.heroDefs.business;
  const YUMI = { name: 'Yumi (wife)', color: '#e8a0b8', spr: { kind: 'humanoid', o: { skin: '#eebfa0', hair: '#4a3a30', top: '#7a6a8a', bottom: '#4e4458', longHair: true } } };

  // ================= ENEMIES =================
  const E = G.registerEnemy;
  E('biz_punk', { name: 'Street Punk', spr: { kind: 'humanoid', o: { skin: '#e0b090', hair: '#c9522a', top: '#3a3a44', bottom: '#26262e', hat: 'headband', hatColor: '#222' } },
    hp: 36, atk: 8, def: 2, spd: 9, exp: 16, gold: 16, drops: [{ id: 'biz_h1', chance: 0.25 }],
    skills: [{ name: 'Sucker Punch', pow: 1, type: 'attack', w: 3 }, { name: 'Bottle Smash', pow: 1.4, type: 'attack', w: 1 }] });
  E('biz_thug', { name: 'Yakuza Thug', spr: { kind: 'humanoid', o: { skin: '#d8a87c', hair: '#1a1a1e', top: '#26262e', bottom: '#1a1a20', tie: '#555', lapel: true } },
    hp: 48, atk: 10, def: 3, spd: 8, exp: 24, gold: 26, drops: [{ id: 'biz_docs', chance: 0.5 }, { id: 'biz_h1', chance: 0.2 }],
    skills: [{ name: 'Beatdown', pow: 1, type: 'attack', w: 3 }, { name: 'Brass Hook', pow: 1.3, type: 'attack', w: 1 }] });
  E('biz_dog', { name: 'Attack Dog', spr: { kind: 'beast', o: { col: '#4a4038', dark: '#2c261e', eye: '#f44' } },
    hp: 34, atk: 11, def: 1, spd: 13, exp: 20, gold: 10, drops: [{ id: 'biz_h1', chance: 0.2 }],
    skills: [{ name: 'Bite', pow: 1, type: 'attack', w: 3 }, { name: 'Maul', pow: 1.4, type: 'attack', status: 'bleed', w: 1 }] });
  E('biz_enforcer', { name: 'Gumi Enforcer', spr: { kind: 'humanoid', o: { skin: '#c89068', hair: '#111', top: '#1e1e26', bottom: '#14141a', hat: 'visor', hatColor: '#111', tie: '#822' } },
    hp: 72, atk: 14, def: 6, spd: 9, exp: 44, gold: 44, drops: [{ id: 'biz_a2', chance: 0.07 }],
    skills: [{ name: 'Body Blow', pow: 1.1, type: 'attack', w: 2 }, { name: 'Intimidate', pow: 0.7, type: 'attack', status: 'atkDn', w: 1 }] });
  E('biz_fixer', { name: 'Corporate Fixer', spr: { kind: 'humanoid', o: { skin: '#e8bfa0', hair: '#3a3038', top: '#3c4458', bottom: '#282e3e', lapel: true, tie: '#246' } },
    hp: 64, atk: 16, def: 4, spd: 11, exp: 50, gold: 52, drops: [{ id: 'biz_m1', chance: 0.3 }],
    skills: [{ name: 'NDA Slap', pow: 1.1, type: 'attack', w: 2 }, { name: 'Hostile Audit', pow: 0.8, type: 'attack', status: 'defDn', w: 1 }] });
  E('biz_biker', { name: 'Bosozoku Rider', spr: { kind: 'humanoid', o: { skin: '#d8a87c', hair: '#222', top: '#5a2a2a', bottom: '#38181a', hat: 'cap', hatColor: '#191922' } },
    hp: 78, atk: 17, def: 5, spd: 12, exp: 58, gold: 56, drops: [{ id: 'biz_w3', chance: 0.05 }],
    skills: [{ name: 'Pipe Swing', pow: 1.1, type: 'attack', w: 2, sfx: 'hit' }, { name: 'Chain Whip', pow: 1.3, type: 'attack', w: 1 }] });
  E('biz_hitman', { name: 'Contract Killer', spr: { kind: 'humanoid', o: { skin: '#d8b090', hair: '#26221e', top: '#2a2a32', bottom: '#1c1c22', hat: 'fedora', hatColor: '#1c1c24', gear: 'gun', gearColor: '#445' } },
    hp: 92, atk: 21, def: 6, spd: 11, exp: 78, gold: 70, drops: [{ id: 'biz_h2', chance: 0.25 }, { id: 'biz_w4', chance: 0.04 }],
    skills: [{ name: 'Silenced Shot', pow: 1.2, type: 'attack', w: 2, sfx: 'gun' }, { name: 'Dead Aim', pow: 1.7, type: 'attack', w: 1, sfx: 'gun' }] });
  E('biz_guard', { name: 'Dock Muscle', spr: { kind: 'humanoid', o: { skin: '#c89068', hair: '#0e0e12', top: '#33363e', bottom: '#22242c', beard: true } },
    hp: 90, atk: 19, def: 8, spd: 8, exp: 74, gold: 66, drops: [{ id: 'biz_a4', chance: 0.04 }, { id: 'biz_h2', chance: 0.25 }],
    skills: [{ name: 'Crate Hook', pow: 1.1, type: 'attack', w: 2 }, { name: 'Bulk Up', type: 'buff', w: 1 }] });
  // bosses
  E('biz_boss1', { name: 'Debt Collector Mogi', boss: true, scale: 4, spr: { kind: 'humanoid', o: { skin: '#d8a87c', hair: '#15151a', top: '#22222c', bottom: '#17171e', tie: '#a02030', lapel: true, hat: 'visor', hatColor: '#101014' } },
    hp: 155, atk: 12, def: 4, spd: 9, exp: 95, gold: 170, drops: [{ id: 'biz_w2', chance: 1 }],
    skills: [{ name: 'Ledger Slam', pow: 1.1, type: 'attack', w: 3 }, { name: 'Compound Interest', pow: 0.8, type: 'aoe', w: 1 }, { name: 'Collections Call', type: 'buff', w: 1 }],
    barks: { rage: 'Your account is OVERDUE, Mori-san!' } });
  E('biz_boss2', { name: 'Club King Tetsu', boss: true, scale: 4, spr: { kind: 'humanoid', o: { skin: '#e0b090', hair: '#d4af37', top: '#4a2a4a', bottom: '#2e1a2e', lapel: true, tie: '#ffd23e' } },
    hp: 275, atk: 16, def: 6, spd: 11, exp: 190, gold: 260, drops: [{ id: 'biz_w3', chance: 1 }],
    skills: [{ name: 'Champagne Saber', pow: 1.3, type: 'attack', w: 2, sfx: 'slash' }, { name: 'Bouncer Whistle', type: 'buff', w: 1 }, { name: 'VIP Treatment', pow: 0.9, type: 'aoe', w: 1 }],
    barks: { rage: 'Nobody collects from the KING!' } });
  E('biz_boss3', { name: 'Fixer Queen Aoi', boss: true, scale: 4, spr: { kind: 'humanoid', o: { skin: '#e8bfa0', hair: '#2c2438', top: '#403050', bottom: '#2a2038', longHair: true, tie: '#c86bff' } },
    hp: 410, atk: 21, def: 8, spd: 12, exp: 320, gold: 380, drops: [{ id: 'biz_a3', chance: 1 }],
    skills: [{ name: 'Stiletto Strike', pow: 1.2, type: 'attack', w: 2 }, { name: 'Gag Order', pow: 0.8, type: 'attack', status: 'stun', w: 1 }, { name: 'Shred Everything', pow: 0.9, type: 'aoe', w: 1 }],
    barks: { rage: 'I have buried better men than you in PAPERWORK.' } });
  E('biz_boss4', { name: '"Smiling" Jiro', boss: true, scale: 4, spr: { kind: 'humanoid', o: { skin: '#d8b090', hair: '#3a3640', top: '#33222a', bottom: '#201519', hat: 'fedora', hatColor: '#26141c', gear: 'gun', gearColor: '#556', scar: true } },
    hp: 560, atk: 27, def: 9, spd: 12, exp: 480, gold: 540, drops: [{ id: 'biz_w4', chance: 1 }],
    skills: [{ name: 'Twin Pistols', pow: 0.8, hits: 2, type: 'attack', w: 2, sfx: 'gun' }, { name: 'Killshot', pow: 1.8, type: 'attack', w: 1, sfx: 'gun' }, { name: 'Spray', pow: 0.8, type: 'aoe', w: 1, sfx: 'gun' }],
    barks: { rage: 'Now THIS is worth smiling about!' } });
  E('biz_boss5', { name: 'Oyabun Kurosawa', boss: true, scale: 4, spr: { kind: 'humanoid', o: { skin: '#e0c0a0', hair: '#c8c8d0', top: '#1a1a22', bottom: '#101016', lapel: true, tie: '#c43a3a', beard: true } },
    hp: 800, atk: 31, def: 13, spd: 11, exp: 850, gold: 1000, drops: [{ id: 'biz_w5', chance: 1 }],
    skills: [{ name: 'Dragon Fist', pow: 1.4, type: 'attack', w: 2, sfx: 'crit' }, { name: 'Blood Oath', type: 'heal', w: 1 }, { name: 'Family Justice', pow: 1.1, type: 'aoe', w: 1 }],
    barks: { rage: 'I built this family from ash and knuckles. You are NEITHER.' } });

  // quest item
  G.items['biz_docs'] = { id: 'biz_docs', name: 'Shredded Ledger Page', type: 'key', desc: 'Half-destroyed accounting. Yui can reconstruct these.' };

  // ================= COMPANIONS =================
  G.registerCompanion('ryo', { name: 'Ryo', type: 'gambler', world: 'business', cost: 150,
    spr: { kind: 'humanoid', o: { skin: '#e0b090', hair: '#8a5a2a', top: '#6a3a5a', bottom: '#42243a', lapel: true, tie: '#ffd23e' } },
    bio: 'Lives in the pachinko parlor. Owes money to everyone, including you, probably.',
    pitch: 'Daiki-san! I hear you fight yakuza now. I will join for a modest fee. Think of it as a bet on yourself.',
    broke: 'No stake, no play. House rules.' });
  G.registerCompanion('keiko', { name: 'Keiko', type: 'tactician', world: 'business', cost: 200,
    spr: { kind: 'humanoid', o: { skin: '#e8bfa0', hair: '#1e1a24', top: '#38404e', bottom: '#242a36', longHair: true, lapel: true, tie: '#3a7bc4' } },
    bio: 'Ex-consultant. Was fired for being right too loudly. Keeps receipts. All of them.',
    pitch: 'You are taking on the Kurosawa-gumi with a briefcase. You need strategy. I bill hourly, results guaranteed.',
    broke: 'My rates are non-negotiable. Unlike your survival odds.' });
  G.registerCompanion('sho', { name: 'Big Sho', type: 'brute', world: 'business', cost: 100,
    spr: { kind: 'humanoid', o: { skin: '#c89068', hair: '#2a2018', top: '#4e5a3a', bottom: '#343c26', hat: 'headband', hatColor: '#e8e4da', beard: true } },
    bio: 'Farmhand, former sumo hopeful. His handshake has put men in physiotherapy.',
    pitch: 'City men hurt your family? In this village we settle that with a harvest. You bring the sickle, I bring me.',
    broke: 'Sho works for pay. Sho has learned this the hard way.' });

  // ================= SHOPS =================
  G.registerShop('biz_shop_conbini', { name: 'FamilyMart 24h', items: ['biz_h1', 'biz_m1', 'biz_w1', 'biz_a1'] });
  G.registerShop('biz_shop_pawn', { name: 'Kabukicho Pawn & Loan', items: ['biz_h1', 'biz_h2', 'biz_m1', 'biz_r1', 'biz_w2', 'biz_w3', 'biz_a2', 'biz_a3', 'biz_x1', 'biz_x2'] });
  G.registerShop('biz_shop_surplus', { name: "Gonzo's Barn Surplus", items: ['biz_h2', 'biz_r1', 'biz_m1', 'biz_w4', 'biz_a4', 'biz_x3'] });

  // ================= QUESTS =================
  G.registerQuest({ id: 'q_biz_papers', world: 'business', name: 'Paper Trail', giver: 'Intern Yui',
    desc: 'Yui can rebuild the shredded ledgers — if you liberate 3 pages from the thugs carrying them.',
    offerLines: ['Mori-san! I know what they did to your accounts. I was the one who flagged the discrepancy, I am SO sorry.', 'The thugs carry the shredded pages in their jackets — they are too lazy to burn them. Bring me three and I can rebuild a month of laundering.'],
    midLine: 'Check the thugs\' jackets! Paper doesn\'t punch back, I promise.',
    turninLines: [{ text: 'Yes… yes! Cross-referenced with the offshore transfers — Mori-san, this is a SMOKING GUN. Take my emergency fund. And my lucky tiepin!' }],
    stages: [{ text: 'Take Shredded Ledger Pages from Yakuza Thugs', type: 'item', target: 'biz_docs', n: 3 }],
    reward: { gold: 150, exp: 80, items: [{ id: 'biz_x1', n: 1 }] } });
  G.registerQuest({ id: 'q_biz_cat', world: 'business', name: 'The Hostess and the Cat', giver: 'Hostess Mari',
    desc: 'Mari\'s cat Tama bolted during a police raid. Last seen heading toward the corporate towers.',
    offerLines: ['They raided the club last night and Tama bolted. Little grey thing, judgmental eyes, answers to nothing.', 'She hunts in the tower district alleys — the salarymen feed her sashimi. Find my baby, Mori-san.'],
    midLine: 'Tama hunts near the towers. Bring treats. Or humility.',
    turninLines: [{ text: 'TAMA! You brought her back! You magnificent accountant. Here — tips from the VIP room. Don\'t tell the King.' }],
    stages: [{ text: 'Find Tama in the tower district', type: 'flag', target: 'foundTama', n: 1 }],
    reward: { gold: 200, exp: 100, items: [{ id: 'biz_h2', n: 2 }] } });
  G.registerQuest({ id: 'q_biz_dogs', world: 'business', name: 'Harvest Guard', giver: 'Farmer Gonzo',
    desc: 'The gumi released attack dogs into the rice fields to smoke out your family. Gonzo wants his fields back. Four dogs.',
    offerLines: ['City dogs in my rice! They tore up the east paddy looking for your people.', 'I don\'t blame your family. I blame the dogs. Well — the men who sent the dogs. But the dogs are what\'s HERE. Four of them.'],
    midLine: 'I can hear them barking at the scarecrow. The scarecrow is winning, but still.',
    turninLines: [{ text: 'Quiet fields, full harvest. You\'re alright for a city man. Take this from the barn — was my grandfather\'s, from the war.' }],
    stages: [{ text: 'Clear Attack Dogs from the fields', type: 'kill', target: 'biz_dog', n: 4 }],
    reward: { gold: 260, exp: 160, items: [{ id: 'biz_a4', n: 1 }] } });

  // ================= DIALOGS =================
  const D = G.registerDialog;
  D('biz_salaryman', ch => ['Overtime again. The lights in this district never turn off. Neither do we. We just… dim.']);
  D('biz_coworker', ch => [ch.chapter < 1
    ? 'Mori-san, accounting says you flagged something in the Fourth Ledger? Word of advice: unflag it. People who read that ledger get promoted to "missing".'
    : 'You\'re still alive! Don\'t take this wrong, but there was a betting pool.']);
  D('biz_hostess2', ch => ['The King upstairs waters the whisky and the gumi waters the King. Everyone drinks. Nobody swallows.']);
  D('biz_pachinko', ch => ['I\'ve been at this machine nine hours. It owes me. Machines remember, you know.']);
  D('biz_tower_exec', ch => [ch.chapter < 3
    ? 'Aoi-sama shreds documents for people who cannot afford to have documents. Floor 34. You did not hear it from me. You did not hear anything. Who are you?'
    : 'Aoi\'s office is a crime scene now. A very well-organized crime scene. Color-coded, even.']);
  D('biz_cat', ch => {
    if (ch.quests['q_biz_cat'] && !ch.quests['q_biz_cat'].done && !ch.flags.foundTama) {
      ch.flags.foundTama = 1;
      G.checkQuestStage('q_biz_cat');
      return [{ who: 'Tama', text: '…mrow. (She looks at your suit. She judges it. She allows you to carry her anyway.)', color: '#e8a0b8' }];
    }
    return [{ who: 'Alley Cat', text: 'Mrrrp. (It has somewhere important to be.)', color: '#e8a0b8' }];
  });
  D('biz_wife', ch => [ch.chapter < 4
    ? 'Daiki… the neighbors think we\'re on vacation. Kenta thinks it\'s camping. Please tell me you have a plan, because I told them you have a plan.'
    : 'Finish it, Daiki. Whatever it takes. Then come home and take out the trash. It\'s been three weeks.']);
  D('biz_detective', ch => ['Detective Ono, organized crime unit. Ten years building a case on Kurosawa. Ten years of shredded evidence. You bring me that ledger, and I bring the entire Metropolitan Police to the docks.']);
  D('biz_docker', ch => ['Container 7 gets loaded at midnight, no manifest, no questions. Been that way every week for six years. Nobody asks what\'s inside. Asking is how you get to BE inside.']);

  // ================= CUTSCENES =================
  const CS = G.registerCutscene;
  CS('biz_intro', () => [
    { music: 'business' },
    { say: [
      { text: 'TOKYO, PRESENT DAY. Mori Daiki, 42. Chief Financial Officer of Hoshizora Trading. Married, one son, one mortgage, zero enemies. Until Tuesday.' },
      { text: 'On Tuesday you found the Fourth Ledger — the one that isn\'t in the system. Two decades of laundered money flowing through your company like a sewer under a shrine.' },
      G.spk(DAIKI, 'I did everything right. Twenty years of doing everything right.'),
      { text: 'On Wednesday your CEO introduced you to a man with no neck and a Kurosawa-gumi pin. The message was simple: the ledger is yours now. The debt is yours now. The FAMILY is yours now.' },
      G.spk(DAIKI, 'Fine. I\'ll smile. I\'ll bow. I\'ll carry their filth in my briefcase… and I will document every single yen of it. You bought an accountant, Kurosawa. You have no idea what accountants remember.'),
    ] },
    { chapter: 0 },
  ]);
  CS('biz_cs1', () => [
    { say: [
      { text: 'The plaza east of your office. Mogi, the debt collector, waits with two thugs and your first "assignment" — beating a payment out of a man who looks like you did on Tuesday.' },
      G.spk({ name: 'Debt Collector Mogi', color: '#c43a3a' }, 'First day, salaryman! Here\'s the job: Watanabe owes. You collect. Or we collect YOU. Consider it… onboarding.'),
      G.spk(DAIKI, '(Play along. Play along. Play al—) He has a family, Mogi.'),
      G.spk({ name: 'Debt Collector Mogi', color: '#c43a3a' }, 'So do you. Oh — was that the wrong thing to say? Your face says it was the wrong thing to say.'),
      G.spk(DAIKI, 'You know what, Mogi? Let\'s review your performance instead.'),
    ] },
    { battle: { enemies: ['biz_boss1', 'biz_thug', 'biz_thug'], bg: 'office', boss: true } },
    { say: [
      { text: 'Mogi wheezes on the pavement between two neat rows of his own teeth.' },
      G.spk({ name: 'Mogi', color: '#c43a3a' }, 'You\'re… insane… The King runs collections in Kabukicho… he\'ll bury you under the club…'),
      G.spk(DAIKI, 'Kabukicho, then. (And Mogi — you just became my first exhibit.)'),
    ] },
    { give: { item: 'biz_h1', n: 2 } }, { gold: 90 },
    { chapter: 1 }, { heal: true },
  ]);
  CS('biz_cs2', () => [
    { say: [
      { text: 'Club VELVET DRAGON. Gold wallpaper, watered whisky, and the King himself — draped over a throne-shaped barstool.' },
      G.spk({ name: 'Club King Tetsu', color: '#ffd23e' }, 'The famous accountant! Kurosawa\'s new pet. You know what I skim in a week, pet? More than your salary. And NONE of it is in any ledger.'),
      G.spk(DAIKI, 'Actually, it is. Table 4 of the Fourth Ledger, lines 200 through 340. You skim from the gumi too, Tetsu. I checked. Twice.'),
      G.spk({ name: 'Club King Tetsu', color: '#ffd23e' }, '…Boys? Kill the accountant. Kill him VERY quietly.'),
    ] },
    { battle: { enemies: ['biz_boss2', 'biz_enforcer', 'biz_thug'], bg: 'street', boss: true } },
    { say: [
      { text: 'The King slides off his throne. Behind the bar: a floor safe, open, stuffed with documents someone was too greedy to shred.' },
      G.spk(DAIKI, 'Skim records, bribe lists, a photograph of Kurosawa shaking hands with… oh. OH. That is a deputy police commissioner.'),
      G.spk(DAIKI, 'The evidence goes in the briefcase. The briefcase goes wherever I go. This is either a life insurance policy or a suicide note. Filing it under both.'),
    ] },
    { chapter: 2 }, { heal: true },
  ]);
  CS('biz_cs3', () => [
    { say: [
      { text: 'Floor 34, Marunouchi. The shell company. Every crime the gumi ever committed passes through this office on its way to becoming legally nonexistent.' },
      G.spk({ name: 'Fixer Queen Aoi', color: '#c86bff' }, 'Mori Daiki. Forty-two. One wife, one son, one very stupid hobby. I shred PEOPLE\'S pasts for a living. Yours would take me four minutes.'),
      G.spk(DAIKI, 'Then I have four minutes to take the Black Ledger.'),
      G.spk({ name: 'Fixer Queen Aoi', color: '#c86bff' }, 'It\'s in the vault behind me. Between you and it: me, my heels, and my profound annoyance at unscheduled visitors.'),
    ] },
    { battle: { enemies: ['biz_boss3', 'biz_fixer', 'biz_fixer'], bg: 'office', boss: true } },
    { say: [
      { text: 'Aoi surrenders with the dignity of a queen abdicating. The vault opens. The Black Ledger is heavier than it looks. Most confessions are.' },
      { text: 'Your phone buzzes. A photo: your apartment door. Open. A voice message: "The family sends its regards to your family."' },
      G.spk(DAIKI, 'Yumi. YUMI—'),
      { text: 'Second message. Yumi\'s voice, steady as bedrock: "We\'re out. Kenta and I are at my uncle\'s farm in Chiba. Daiki — they came to our HOME. Finish this."' },
    ] },
    { give: { item: 'key_ledger' } },
    { chapter: 3 }, { heal: true },
  ]);
  CS('biz_cs4', () => [
    { say: [
      { text: 'Rice fields. Cicadas. Your son\'s laughter from the farmhouse — the first honest sound you\'ve heard in months. And then, on the ridge road: a man in a hat, smiling.' },
      G.spk({ name: '"Smiling" Jiro', color: '#ff6a6a' }, 'Lovely country. I did a job out here in \'09. The rice grew back wrong, they say. Redder.'),
      G.spk(DAIKI, 'You don\'t touch them. Whatever Kurosawa pays, I\'ll—'),
      G.spk({ name: '"Smiling" Jiro', color: '#ff6a6a' }, 'Pays? Mori-san. I would do YOU for free. The Oyabun says the accountant dies in front of his family, so the next accountant understands the terms of employment.'),
    ] },
    { battle: { enemies: ['biz_boss4', 'biz_dog', 'biz_dog'], bg: 'rural', boss: true } },
    { say: [
      { text: 'Jiro stops smiling. It takes dying to do it.' },
      G.spk(YUMI, 'Daiki! Detective Ono called the farm line — he says the ledger is enough, but Kurosawa is MOVING. Everything ships out of Yokohama tonight. Container 7.'),
      G.spk(DAIKI, 'Then tonight the Kurosawa-gumi discovers what an audit feels like from the inside.'),
    ] },
    { chapter: 4 }, { heal: true },
  ]);
  CS('biz_cs5', () => [
    { music: 'boss' },
    { say: [
      { text: 'Yokohama docks, midnight. Container 7 hangs from a crane like a verdict. Beneath it, in a grey suit that costs more than your house: Kurosawa.' },
      G.spk({ name: 'Oyabun Kurosawa', color: '#c43a3a' }, 'The accountant. Do you know why I chose you, Mori-san? Not the debt. Debts are seeds — I plant thousands. No. It was your face on Wednesday. A man discovering the world is a lie… and deciding to SMILE at it. That is a yakuza face.'),
      G.spk(DAIKI, 'You threatened my son.'),
      G.spk({ name: 'Oyabun Kurosawa', color: '#c43a3a' }, 'I motivate. Look at what you\'ve become under my management! Mogi, Tetsu, Aoi, even Jiro — you audited them all. One last promotion, Mori Daiki. Kill me, take the family… or the family takes yours.'),
      G.spk(DAIKI, 'Counter-offer: I decline, you fall, and the Metropolitan Police are already at the gate. The paperwork is filed, Kurosawa. You are ARITHMETIC now.'),
    ] },
    { battle: { enemies: ['biz_boss5', 'biz_guard', 'biz_hitman'], bg: 'docks', boss: true } },
    { shake: 10 }, { flash: true }, { sfx: 'rift' }, { music: 'rift' },
    { say: [
      { text: 'Kurosawa drops to one knee — and freezes. Not in defeat. In TIME. The crane stops mid-swing. Sirens hold one note. The harbor waves stand like glass teeth.' },
      { text: 'The air above Container 7 TEARS open. Purple light. And through the wound you glimpse — a burning village? A man with a katana? A neon desert?' },
      { who: '???', text: 'TWO OF THREE. FOUND. THE LOCK TURNS.', color: '#c86bff' },
      G.spk(DAIKI, 'The ledger — the numbers are moving — they\'re the same numbers, they were ALWAYS the same numbers— WHO ARE YOU?'),
      { text: 'Your reflection in the harbor answers. It draws a sword you have never held, and aims a gun you have never fired.' },
      { text: '— DAIKI\'S STORY REACHES THE RIFT —', color: '#c86bff' },
    ] },
    { give: { item: 'key_shard2' } },
    { fn: () => { const ch = G.ch(); ch.riftReached = true; G.save(); G.scenes.toSelect(); } },
  ]);

  // ================= MAPS =================
  const M = G.registerMap;
  // ---- overworld: Tokyo metro + Chiba countryside ----
  M({
    id: 'biz_over', name: 'Greater Tokyo', world: 'business', theme: 'tokyo',
    grade: 'city', amb: 'smog', music: 'business', bg: 'street',
    rows: [
      '####################################',
      '#BBBBBB..BBBB...BBB.....,,,,,,,,,,,#',
      '#BBBBBB..BBBB...BBB..T,,,,,T,,,,,,,#',
      '#....=....=......=....,,,,,,,,,,T,,#',
      '#....=====+=======....,,,,T,,,,,,,,#',
      '#BB..=....=......=..T,,,,,,,,,,,,,,#',
      '#BB..=....=......====,,,,,,,T,,,,,,#',
      '#....=..BBBB..BB....=,,,T,,,,,,,,,,#',
      '#....=..BBBB..BB....====,,,,,,,,,,,#',
      '#BB..=........==.......==,,,,,T,,,,#',
      '#BB..======...==.........====,,,,,,#',
      '#........=....==....T,,,,,,,==,,,,,#',
      '#BBBB....=....==,,,,,,,,T,,,,==,T,,#',
      '#BBBB....=....==,,,,,,,,,,,,,,=,,,,#',
      '#....=====....==,,T,,,,,,,,,,,=====#',
      '#....=........==,,,,,,~~~,,,,,,,,,,#',
      '#BB..=....~~..==,,,,,~~~~~,,,,,,,,,#',
      '#BB..=...~~~~.==,,,,,,~~~,,,T,,,,,,#',
      '#....=....~~..==,,,,,,,,,,,,,,,,,,,#',
      '#....=........==...,,,,,,,,,,,,,,,,#',
      '#....==========.....,,,,,,,,,,,,,,,#',
      '#..........=........,,,,T,,,,,,,,,,#',
      '#..........=.......,,,,,,,,,,,,,,,,#',
      '####################################',
    ],
    spawn: { x: 10, y: 4 },
    enc: { groups: [['biz_punk'], ['biz_punk', 'biz_punk'], ['biz_dog', 'biz_punk'], ['biz_thug'], ['biz_biker']] },
    exits: [
      { x: 10, y: 3, to: 'biz_office', tx: 15, ty: 17 },
      { x: 17, y: 3, to: 'biz_kabuki', tx: 16, ty: 18, cond: ch => ch.chapter >= 1, locked: 'Kabukicho\'s velvet rope is not for you yet. (Finish Chapter 1.)' },
      { x: 5, y: 3, to: 'biz_tower', tx: 14, ty: 19, cond: ch => ch.chapter >= 2, locked: 'Tower security wants a keycard you don\'t have. (Finish Chapter 2.)' },
      { x: 34, y: 14, to: 'biz_rural', tx: 2, ty: 11, cond: ch => ch.chapter >= 3, locked: 'The Chiba expressway is jammed. (Finish Chapter 3.)' },
      { x: 11, y: 22, to: 'biz_docks', tx: 16, ty: 3, cond: ch => ch.chapter >= 4, locked: 'The harbor gate is chained until midnight. (Finish Chapter 4.)' },
    ],
    npcs: [
      { id: 'biz_ow_salary', name: 'Tired Salaryman', x: 8, y: 10, color: '#b8b0d0', dialog: 'biz_salaryman',
        spr: { kind: 'humanoid', o: { skin: '#e0b090', hair: '#222', top: '#33363e', bottom: '#22242c', tie: '#456' } } },
    ],
    signs: [{ x: 11, y: 4, text: 'Metro junction: NORTH office district & towers & Kabukicho · EAST Chiba countryside · SOUTH Yokohama docks.' }],
    chests: [{ id: 1, x: 33, y: 2, items: [{ id: 'biz_h1', n: 2 }], gold: 50 }, { id: 2, x: 2, y: 22, items: [{ id: 'biz_m1', n: 2 }], gold: 60 }],
  });
  // ---- 1: Office district ----
  M({
    id: 'biz_office', name: 'Shinjuku Office District', world: 'business', theme: 'tokyo',
    grade: 'city', amb: 'rain', music: 'business', bg: 'office',
    rows: [
      '##############################',
      '#BBBB..BBBB....BBBB..BBBB...##',
      '#BBBB..BBBB....BBBB..BBBB...##',
      '#............................#',
      '#..===========+===========..#',
      '#..=......................=.#',
      '#..=..BB....cc.....BB.....=.#',
      '#..=..BB....cc.....BB.....=.#',
      '#..=......................=.#',
      '#..=====....====....======..#',
      '#......=....=..=....=.......#',
      '#..BB..=....=..=....=..BB...#',
      '#..BB..======..======..BB...#',
      '#............................#',
      '#...F.F.F..........F.F.F....#',
      '#............................#',
      '#....BBBB....==....BBBB.....#',
      '#....BBBB....==....BBBB.....#',
      '#############==###############',
    ],
    spawn: { x: 15, y: 17 },
    exits: [{ x: 13, y: 17, w: 2, h: 1, to: 'biz_over', tx: 10, ty: 4, cond: () => true },
      { x: 13, y: 18, w: 2, to: 'biz_over', tx: 10, ty: 4 }],
    npcs: [
      { id: 'biz_yui', name: 'Intern Yui', x: 8, y: 8, color: '#9adcff', quest: 'q_biz_papers',
        spr: { kind: 'humanoid', o: { skin: '#eebfa0', hair: '#3a2a40', top: '#5a6274', bottom: '#3a404e', longHair: true } } },
      { id: 'biz_coworker', name: 'Nakamura (Sales)', x: 20, y: 8, color: '#b8b0d0', dialog: 'biz_coworker',
        spr: { kind: 'humanoid', o: { skin: '#d8a87c', hair: '#26221e', top: '#3c4050', bottom: '#282c38', tie: '#833' } } },
      { id: 'biz_conbini', name: 'Clerk Po', x: 12, y: 5, color: '#ffd23e', shop: 'biz_shop_conbini', still: true,
        shopLine: 'Irasshaimase~ Point card? No? Bag? No? Receipt? …You just want the healing items. Understood.',
        spr: { kind: 'humanoid', o: { skin: '#e0b090', hair: '#4a8a4a', top: '#3a7a5a', bottom: '#2a5440', hat: 'cap', hatColor: '#2a5440' } } },
    ],
    chests: [{ id: 1, x: 3, y: 13, items: [{ id: 'biz_a1', n: 1 }] }, { id: 2, x: 26, y: 13, items: [{ id: 'biz_h1', n: 2 }], gold: 50 }],
    triggers: [{ id: 'boss1', x: 24, y: 3, w: 3, h: 1, event: 'biz_cs1', cond: ch => ch.chapter === 0 }],
    signs: [{ x: 14, y: 3, text: 'Hoshizora Trading HQ. "Integrity, Growth, Family." Two of these are lies.' }],
  });
  // ---- 2: Kabukicho ----
  M({
    id: 'biz_kabuki', name: 'Kabukicho Backstreets', world: 'business', theme: 'tokyo',
    grade: 'neon', amb: 'rain', music: 'business', bg: 'street',
    rows: [
      '##################################',
      '#BBBBBB,,BBBBBB,,,BBBBB,,,BBBBBB##',
      '#BBBBBB,,BBBBBB,,,BBBBB,,,BBBBBB##',
      '#,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,##',
      '#,,nnnnnnnn,,,,nnnnnn,,,nnnnnn,,##',
      '#,,n......n,,,,n....n,,,n....n,,##',
      '#,,n......n,,,,n....n,,,n....n,,##',
      '#,,nnnn,,nn,,,,nn,nnn,,,nn,nnn,,##',
      '#,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,##',
      '#,,BB,,,,BB,,+,,,BB,,,,BB,,,BB,,##',
      '#,,BB,,,,BB,,,,,,BB,,,,BB,,,BB,,##',
      '#,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,##',
      '#,,nnnnnn,,,,nnnnnnnn,,,nnnnnn,,##',
      '#,,n....n,,,,n......n,,,n....n,,##',
      '#,,n....n,,,,n......n,,,n....n,,##',
      '#,,nnnnnn,,,,nnnnnnnn,,,nn,nnn,,##',
      '#,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,##',
      '#,,,,F,F,,,,,,,,,,,,,,,,F,F,,,,,##',
      '#,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,##',
      '################==################',
    ],
    spawn: { x: 16, y: 19 },
    enc: { groups: [['biz_punk', 'biz_punk'], ['biz_thug', 'biz_punk'], ['biz_thug', 'biz_thug'], ['biz_enforcer'], ['biz_biker', 'biz_punk']] },
    exits: [{ x: 16, y: 19, w: 2, to: 'biz_over', tx: 17, ty: 4 }],
    npcs: [
      { id: 'biz_mari', name: 'Hostess Mari', x: 7, y: 8, color: '#e8a0b8', quest: 'q_biz_cat',
        spr: { kind: 'humanoid', o: { skin: '#eebfa0', hair: '#7a2a4a', top: '#8a3a5a', bottom: '#5a2438', longHair: true } } },
      { id: 'biz_hostess2', name: 'Hostess Rin', x: 20, y: 8, color: '#e8a0b8', dialog: 'biz_hostess2',
        spr: { kind: 'humanoid', o: { skin: '#e8bfa0', hair: '#2a2a4a', top: '#4a3a7a', bottom: '#2e2450', longHair: true } } },
      { id: 'biz_pawn', name: 'Pawnbroker Gen', x: 27, y: 13, color: '#ffd23e', shop: 'biz_shop_pawn', still: true,
        shopLine: 'Buy, sell, forget. Especially forget. The forgetting is complimentary.',
        spr: { kind: 'humanoid', o: { skin: '#d8a87c', hair: '#555', top: '#4a4438', bottom: '#302c24', hat: 'fedora', hatColor: '#3a3428', beard: true } } },
      { id: 'biz_ryo', name: 'Ryo', x: 6, y: 13, color: '#ffd23e', hire: 'ryo', spr: null },
      { id: 'biz_pachi', name: 'Pachinko Ghost', x: 8, y: 14, color: '#b8b0d0', dialog: 'biz_pachinko', still: true,
        spr: { kind: 'humanoid', o: { skin: '#d8b090', hair: '#333', top: '#4e4658', bottom: '#322c3a' } } },
    ],
    chests: [{ id: 1, x: 3, y: 16, items: [{ id: 'biz_w2', n: 1 }] }, { id: 2, x: 30, y: 16, items: [{ id: 'biz_h1', n: 3 }], gold: 80 }],
    triggers: [{ id: 'boss2', x: 14, y: 13, w: 2, h: 2, event: 'biz_cs2', cond: ch => ch.chapter === 1 }],
    signs: [{ x: 15, y: 16, text: 'CLUB VELVET DRAGON — VIPs, regrets, 8pm-5am. The King sees everyone. Eventually.' }],
  });
  // ---- 3: Corporate towers ----
  M({
    id: 'biz_tower', name: 'Marunouchi Towers', world: 'business', theme: 'tokyo',
    grade: 'city', amb: 'smog', music: 'business', bg: 'office',
    rows: [
      '##############################',
      '#BBBBBBBB..........BBBBBBBB###',
      '#BBBBBBBB..........BBBBBBBB###',
      '#..........PP..PP...........##',
      '#...=================........#',
      '#...=...............=........#',
      '#...=..BBBB...BBBB...=.......#',
      '#...=..BBBB...BBBB...=.......#',
      '#...=..BBBB...BBBB...=.......#',
      '#...=................=.......#',
      '#...======..+..=======.......#',
      '#........=.....=.............#',
      '#..BB....=.....=....BB.......#',
      '#..BB....=======....BB.......#',
      '#.....................       #',
      '#...F.F...........F.F........#',
      '#............................#',
      '#......BBBB....BBBB..........#',
      '#......BBBB....BBBB..........#',
      '##############==##############',
    ],
    spawn: { x: 14, y: 19 },
    exits: [{ x: 14, y: 18, w: 2, h: 1, to: 'biz_over', tx: 5, ty: 4 }],
    npcs: [
      { id: 'biz_exec', name: 'Nervous Exec', x: 8, y: 15, color: '#b8b0d0', dialog: 'biz_tower_exec',
        spr: { kind: 'humanoid', o: { skin: '#e0b090', hair: '#3a3640', top: '#38404e', bottom: '#242a36', tie: '#246', lapel: true } } },
      { id: 'biz_keiko', name: 'Keiko', x: 22, y: 12, color: '#9adcff', hire: 'keiko', spr: null },
      { id: 'biz_tama', name: 'Grey Cat', x: 25, y: 16, color: '#e8a0b8', dialog: 'biz_cat', still: true,
        spr: { kind: 'beast', o: { col: '#8a8a95', dark: '#5a5a64', eye: '#7d9' } } },
    ],
    chests: [{ id: 1, x: 26, y: 5, items: [{ id: 'biz_x2', n: 1 }] }, { id: 2, x: 3, y: 16, items: [{ id: 'biz_h2', n: 1 }], gold: 100 }],
    triggers: [{ id: 'boss3', x: 12, y: 6, w: 2, h: 2, event: 'biz_cs3', cond: ch => ch.chapter === 2 }],
    signs: [{ x: 12, y: 4, text: 'AOI CONSULTING — Records Management · Discretion Services · Floor 34. By appointment. You do not have an appointment.' }],
  });
  // ---- 4: Chiba countryside ----
  M({
    id: 'biz_rural', name: 'Chiba Countryside', world: 'business', theme: 'rural',
    grade: 'day', amb: 'petals', music: 'business', bg: 'rural',
    rows: [
      '##################################',
      '#TTTT,,,,,TT,,,,,,,,,TT,,,,,TTTTT#',
      '#TT,,,,,,,,,,,,,,,,,,,,,,,,,,,TTT#',
      '#T,,,~~~,,,,,,,,,,,,,,,,,,,,,,,,T#',
      '#,,,~~~~~,,,,dddddddd,,,,,,,,,,,,#',
      '#,,,,~~~,,,,,d......d,,,,HH,,,,,,#',
      '#,,,,,,,,,,,,d......d,,,,HH,,,,,,#',
      '#,,,,,,,,,,,,dddddddd,,,,,,,,,,,,#',
      '#,,wwww,,,,,,,,,,,,,,,,,,,,,,,,,,#',
      '#,,wwww,,,,,,,,+,,,,,,,,F,F,F,,,,#',
      '#,,wwww,,,,,,,,,,,,,,,,,,,,,,,,,,#',
      '#==,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,#',
      '#,==,,,,,,,,,,,,,,,,,,,,,HH,,,,,,#',
      '#,,==,,,,,,,,,,,,,,,,,,,,HH,,,,,,#',
      '#,,,=,,,,wwwww,,,,,,,,,,,,,,,,,,,#',
      '#,,,,,,,,wwwww,,,,,,,,,,,,,,,,,,,#',
      '#,,,,,,,,wwwww,,,,,T,,,,,,,,,,,,,#',
      '#,T,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,#',
      '#TT,,,,,,,,,,,,,,,,,,,,T,,,,,,,,T#',
      '#TTTT,,,,TT,,,,,,,,TT,,,,,,,,TTTT#',
      '##################################',
    ],
    spawn: { x: 2, y: 11 },
    enc: { groups: [['biz_dog'], ['biz_dog', 'biz_dog'], ['biz_thug', 'biz_dog'], ['biz_hitman'], ['biz_biker', 'biz_biker']] },
    exits: [{ x: 1, y: 11, to: 'biz_over', tx: 33, ty: 14 }],
    npcs: [
      { id: 'biz_gonzo', name: 'Farmer Gonzo', x: 24, y: 8, color: '#e8d4a8', quest: 'q_biz_dogs', shop: 'biz_shop_surplus',
        shopLine: 'Barn surplus. Some of it is farm equipment. Some of it is… surplus.',
        spr: { kind: 'humanoid', o: { skin: '#c89068', hair: '#7a6a4a', top: '#5c6136', bottom: '#3c4124', hat: 'kasa', hatColor: '#8a7a4a', beard: true } } },
      { id: 'biz_yumi', name: 'Yumi', x: 16, y: 5, color: '#e8a0b8', dialog: 'biz_wife', still: true, spr: YUMI.spr },
      { id: 'biz_sho', name: 'Big Sho', x: 27, y: 13, color: '#ff9a3c', hire: 'sho', spr: null },
      { id: 'biz_ono', name: 'Detective Ono', x: 10, y: 12, color: '#9adcff', dialog: 'biz_detective', cond: ch => ch.chapter >= 3,
        spr: { kind: 'humanoid', o: { skin: '#d8a87c', hair: '#4a4640', top: '#4a4438', bottom: '#302c24', hat: 'fedora', hatColor: '#3a3a30' } } },
    ],
    chests: [{ id: 1, x: 31, y: 3, items: [{ id: 'biz_h2', n: 2 }], gold: 120 }, { id: 2, x: 3, y: 18, items: [{ id: 'biz_x3', n: 1 }] }],
    triggers: [{ id: 'boss4', x: 30, y: 10, w: 3, h: 2, event: 'biz_cs4', cond: ch => ch.chapter === 3 }],
    signs: [{ x: 15, y: 9, text: 'UCHIDA FAMILY FARM — trespassers will be introduced to Big Sho.' }],
  });
  // ---- 5: Yokohama docks ----
  M({
    id: 'biz_docks', name: 'Yokohama Docks', world: 'business', theme: 'tokyo',
    grade: 'night', amb: 'rain', music: 'business', bg: 'docks',
    rows: [
      '##################################',
      '#~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#',
      '#~~~~~~~,,,,,,,,=,,,,,,,,~~~~~~~~#',
      '#~~~~,,,,,,,,,,,=,,,,,,,,,,,~~~~~#',
      '#~~,,,,cc,,,cc,,=,,cc,,,cc,,,,~~~#',
      '#~~,,,,cc,,,cc,,=,,cc,,,cc,,,,~~~#',
      '#~~,,,,,,,,,,,,,=,,,,,,,,,,,,,~~~#',
      '#~~,,ccc,,,,,,,,=,,,,,,,,ccc,,~~~#',
      '#~~,,ccc,,,+,,,,=,,,,,,,,ccc,,~~~#',
      '#~~,,,,,,,,,,,,,=,,,,,,,,,,,,,~~~#',
      '#~~,,,,,cc,,,,cc=cc,,,,cc,,,,,~~~#',
      '#~~,,,,,cc,,,,cc=cc,,,,cc,,,,,~~~#',
      '#~~,,,,,,,,,,,,,=,,,,,,,,,,,,,~~~#',
      '#~~~,,,,,,,,,,,,=,,,,,,,,,,,~~~~~#',
      '#~~~~,,,,,,,,,,,=,,,,,,,,,~~~~~~~#',
      '#~~~~~~,,,,,,,,,=,,,,,,,~~~~~~~~~#',
      '#~~~~~~~~,,,,,,,=,,,,,~~~~~~~~~~~#',
      '##################################',
    ],
    spawn: { x: 16, y: 2 },
    enc: { groups: [['biz_guard'], ['biz_guard', 'biz_thug'], ['biz_hitman', 'biz_thug'], ['biz_enforcer', 'biz_enforcer'], ['biz_hitman', 'biz_hitman']] },
    exits: [{ x: 16, y: 2, w: 1, h: 1, to: 'biz_over', tx: 11, ty: 21 }],
    npcs: [
      { id: 'biz_docker', name: 'Old Docker', x: 8, y: 6, color: '#b8b0d0', dialog: 'biz_docker',
        spr: { kind: 'humanoid', o: { skin: '#c89068', hair: '#777', top: '#4a5a6a', bottom: '#324050', hat: 'cap', hatColor: '#2a3644', beard: true } } },
    ],
    chests: [{ id: 1, x: 5, y: 13, items: [{ id: 'biz_a5', n: 1 }] }, { id: 2, x: 27, y: 3, items: [{ id: 'biz_h2', n: 3 }], gold: 200 }],
    triggers: [{ id: 'boss5', x: 15, y: 15, w: 3, h: 2, event: 'biz_cs5', cond: ch => ch.chapter === 4 }],
    signs: [{ x: 15, y: 4, text: 'PIER 7 — Authorized personnel only. Container 7 loading: 00:00. Manifest: none of your business.' }],
  });

  // hook companion sprites onto their hiring NPCs
  G.maps['biz_kabuki'].npcs.find(n => n.id === 'biz_ryo').spr = G.companions['ryo'].spr;
  G.maps['biz_tower'].npcs.find(n => n.id === 'biz_keiko').spr = G.companions['keiko'].spr;
  G.maps['biz_rural'].npcs.find(n => n.id === 'biz_sho').spr = G.companions['sho'].spr;

  // ================= WORLD =================
  G.registerWorld('business', {
    name: 'Tokyo · Present Day',
    start: { map: 'biz_office', x: 15, y: 17 },
    intro: () => G.cutscenes['biz_intro'](),
    chapters: [
      { goal: 'Ch.1 — Meet the "welcome committee" in the east plaza' },
      { goal: 'Ch.2 — Confront the Club King in Kabukicho' },
      { goal: 'Ch.3 — Steal the Black Ledger from the towers (floor 34)' },
      { goal: 'Ch.4 — Protect your family at the Chiba farm' },
      { goal: 'Ch.5 — End it at the Yokohama docks. Container 7.' },
    ],
  });
})();
