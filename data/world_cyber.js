// TRINITY RIFT — WORLD 3: Vex, Neo-Shizuoka 2087 (hired gun vs. the Ministry)
'use strict';
(function () {
  const VEX = G.heroDefs.cyber;
  const REN = { name: 'Ren', color: '#7dffa0', spr: { kind: 'humanoid', o: { skin: '#c8956a', hair: '#1a1a20', top: '#4a4438', bottom: '#302c24', hat: 'hood', hatColor: '#3a3428' } } };

  // ================= ENEMIES =================
  const E = G.registerEnemy;
  E('cyb_drone', { name: 'Scav Drone', spr: { kind: 'mech', o: { col: '#5a6470', dark: '#333a44', glow: '#f80', fly: true, antenna: true } },
    hp: 32, atk: 8, def: 2, spd: 11, exp: 16, gold: 14, drops: [{ id: 'cyb_scrap', chance: 0.5 }, { id: 'cyb_h1', chance: 0.2 }],
    skills: [{ name: 'Zap', pow: 1, type: 'attack', w: 3, sfx: 'laser' }, { name: 'Dive Bomb', pow: 1.4, type: 'attack', w: 1 }] });
  E('cyb_ganger', { name: 'Chrome Ganger', spr: { kind: 'humanoid', o: { skin: '#d8a087', hair: '#e33', top: '#33234a', bottom: '#1e1830', hat: 'visor', hatColor: '#222' } },
    hp: 44, atk: 10, def: 3, spd: 10, exp: 22, gold: 22, drops: [{ id: 'cyb_h1', chance: 0.25 }],
    skills: [{ name: 'Shiv', pow: 1, type: 'attack', w: 3, sfx: 'slash' }, { name: 'Chrome Fist', pow: 1.4, type: 'attack', w: 1 }] });
  E('cyb_hound', { name: 'Cyber-Hound', spr: { kind: 'beast', o: { col: '#3a3a48', dark: '#22222c', eye: '#0ff', cyber: true } },
    hp: 38, atk: 12, def: 2, spd: 14, exp: 24, gold: 12, drops: [{ id: 'cyb_scrap', chance: 0.3 }],
    skills: [{ name: 'Servo Bite', pow: 1, type: 'attack', w: 3 }, { name: 'Pounce', pow: 1.5, type: 'attack', w: 1 }] });
  E('cyb_scorp', { name: 'Dune Scorpion', spr: { kind: 'blob', o: { col: '#8a6a3a', dark: '#5a4424', eye: '#f80', spikes: true } },
    hp: 62, atk: 14, def: 6, spd: 7, exp: 40, gold: 30, drops: [{ id: 'cyb_h1', chance: 0.3 }],
    skills: [{ name: 'Pincer', pow: 1, type: 'attack', w: 2 }, { name: 'Venom Sting', pow: 1.2, type: 'attack', status: 'poison', w: 1 }] });
  E('cyb_secbot', { name: 'Sec-Bot', spr: { kind: 'mech', o: { col: '#4a5464', dark: '#2a3038', glow: '#f33', cannon: true } },
    hp: 80, atk: 15, def: 9, spd: 7, exp: 48, gold: 40, drops: [{ id: 'cyb_scrap', chance: 0.5 }, { id: 'cyb_a2', chance: 0.06 }],
    skills: [{ name: 'Suppression Fire', pow: 1, type: 'attack', w: 2, sfx: 'gun' }, { name: 'Riot Mode', type: 'buff', w: 1 }] });
  E('cyb_runner', { name: 'Rogue Netrunner', spr: { kind: 'humanoid', o: { skin: '#e8bfa0', hair: '#3ad', top: '#1e2a3a', bottom: '#141c28', hat: 'hood', hatColor: '#16202e' } },
    hp: 58, atk: 16, def: 3, spd: 12, exp: 52, gold: 48, drops: [{ id: 'cyb_m1', chance: 0.35 }],
    skills: [{ name: 'Ice Pick', pow: 1.1, type: 'attack', w: 2, sfx: 'laser' }, { name: 'Neural Spike', pow: 0.8, type: 'attack', status: 'stun', w: 1 }] });
  E('cyb_mutant', { name: 'Sewer Mutant', spr: { kind: 'blob', o: { col: '#5a7a4a', dark: '#3a5230', eye: '#df6', drip: true } },
    hp: 86, atk: 19, def: 7, spd: 8, exp: 70, gold: 44, drops: [{ id: 'cyb_h2', chance: 0.25 }],
    skills: [{ name: 'Sludge Slam', pow: 1.1, type: 'attack', w: 2 }, { name: 'Toxic Belch', pow: 0.8, type: 'aoe', status: 'poison', w: 1 }] });
  E('cyb_agent', { name: 'Ministry Agent', spr: { kind: 'humanoid', o: { skin: '#d8b090', hair: '#222', top: '#20202a', bottom: '#15151c', hat: 'visor', hatColor: '#101018', tie: '#c86bff', gear: 'gun', gearColor: '#445' } },
    hp: 94, atk: 21, def: 8, spd: 11, exp: 80, gold: 68, drops: [{ id: 'cyb_h2', chance: 0.25 }, { id: 'cyb_w4', chance: 0.04 }],
    skills: [{ name: 'Service Pistol', pow: 1.1, type: 'attack', w: 2, sfx: 'gun' }, { name: 'Directive Strike', pow: 1.5, type: 'attack', w: 1, sfx: 'laser' }] });
  // bosses
  E('cyb_boss1', { name: 'Razor, Bazaar King', boss: true, scale: 4, spr: { kind: 'humanoid', o: { skin: '#c8956a', hair: '#f2d', top: '#4a1a3a', bottom: '#2e1024', hat: 'visor', hatColor: '#1a0a14', gear: 'gun', gearColor: '#667' } },
    hp: 160, atk: 12, def: 4, spd: 10, exp: 95, gold: 170, drops: [{ id: 'cyb_w2', chance: 1 }],
    skills: [{ name: 'Mono-Machete', pow: 1.1, type: 'attack', w: 3, sfx: 'slash' }, { name: 'Gang Sign', type: 'buff', w: 1 }, { name: 'Spray & Pray', pow: 0.8, type: 'aoe', w: 1, sfx: 'gun' }],
    barks: { rage: 'MY bazaar! MY rules! YOUR organs!' } });
  E('cyb_boss2', { name: 'Dune Stalker', boss: true, scale: 4, spr: { kind: 'mech', o: { col: '#7a6a4a', dark: '#4a4030', glow: '#f80', cannon: true, antenna: true } },
    hp: 280, atk: 17, def: 10, spd: 8, exp: 190, gold: 240, drops: [{ id: 'cyb_w3', chance: 1 }],
    skills: [{ name: 'Rail Cannon', pow: 1.4, type: 'attack', w: 2, sfx: 'laser' }, { name: 'Sand Blast', pow: 0.9, type: 'aoe', w: 1, sfx: 'explode' }, { name: 'Self-Repair', type: 'heal', w: 1 }],
    barks: { rage: 'TARGET PRIORITY: EVERYTHING.' } });
  E('cyb_boss3', { name: 'Sec Chief Vega', boss: true, scale: 4, spr: { kind: 'humanoid', o: { skin: '#c89068', hair: '#111', top: '#2a3444', bottom: '#1c2430', hat: 'cap', hatColor: '#141c28', gear: 'gun', gearColor: '#556', scar: true } },
    hp: 420, atk: 22, def: 9, spd: 11, exp: 320, gold: 380, drops: [{ id: 'cyb_a3', chance: 1 }],
    skills: [{ name: 'Shock Baton', pow: 1.2, type: 'attack', status: 'stun', w: 2 }, { name: 'Call Backup', type: 'buff', w: 1 }, { name: 'Full Auto', pow: 0.9, type: 'aoe', w: 1, sfx: 'gun' }],
    barks: { rage: 'Dead or alive, the bounty spends the same!' } });
  E('cyb_boss4', { name: 'The Broodmother', boss: true, scale: 4, spr: { kind: 'blob', o: { col: '#4a6a5a', dark: '#2c4436', eye: '#df6', spikes: true, drip: true } },
    hp: 580, atk: 27, def: 10, spd: 8, exp: 480, gold: 520, drops: [{ id: 'cyb_a4', chance: 1 }],
    skills: [{ name: 'Crushing Coil', pow: 1.3, type: 'attack', w: 2, sfx: 'crit' }, { name: 'Spawn Swarm', pow: 0.9, type: 'aoe', status: 'poison', w: 1 }, { name: 'Regenerate', type: 'heal', w: 1 }],
    barks: { rage: 'THE TUNNELS REMEMBER WHAT YOU BURIED IN THEM.' } });
  E('cyb_boss5', { name: 'Director Sato', boss: true, scale: 4, spr: { kind: 'humanoid', o: { skin: '#e0c0a0', hair: '#8a8a92', top: '#2a2038', bottom: '#1a1424', lapel: true, tie: '#c86bff', hat: 'visor', hatColor: '#141020' } },
    hp: 820, atk: 31, def: 13, spd: 12, exp: 850, gold: 1000, drops: [{ id: 'cyb_w5', chance: 1 }],
    skills: [{ name: 'Directive Zero', pow: 1.5, type: 'attack', w: 2, sfx: 'laser' }, { name: 'Redact', pow: 1, type: 'attack', status: 'atkDn', w: 1 }, { name: 'Orbital Ping', pow: 1.1, type: 'aoe', w: 1, sfx: 'explode' }],
    barks: { rage: 'I ERASED CITIES FROM THE RECORD. YOU ARE A TYPO.' } });

  // quest item
  G.items['cyb_scrap'] = { id: 'cyb_scrap', name: 'Milspec Scrap', type: 'key', desc: 'Salvaged servo cores. Juno pays well for these.' };

  // ================= COMPANIONS =================
  G.registerCompanion('bit', { name: 'Bit', type: 'tech', world: 'cyber', cost: 150,
    spr: { kind: 'humanoid', o: { skin: '#e8bfa0', hair: '#3ad', top: '#2a4a4a', bottom: '#1c3232', hat: 'visor', hatColor: '#0ff', gear: 'staff', gearColor: '#7ff' } },
    bio: 'Fifteen years old, banned from four networks, builds drones out of vending machines.',
    pitch: 'You\'re the merc everyone\'s scared of? Cool. I\'m the reason the vending machines fear ME. Team up?',
    broke: 'No creds, no code. I have vending machines to feed.' });
  G.registerCompanion('dice', { name: 'Dice', type: 'gambler', world: 'cyber', cost: 180,
    spr: { kind: 'humanoid', o: { skin: '#c8956a', hair: '#fd4', top: '#4a3a1a', bottom: '#302610', lapel: true, tie: '#0ff' } },
    bio: 'Won his own citizenship in a card game. Lost it twice. Won it back with interest.',
    pitch: 'Vex Kurono! I had 8-to-1 you\'d die last month. Lost big. Let me ride along and win it back.',
    broke: 'Casino rules, choom: no chips, no chair.' });
  G.registerCompanion('nyx', { name: 'Nyx', type: 'thief', world: 'cyber', cost: 200,
    spr: { kind: 'humanoid', o: { skin: '#d8a087', hair: '#c86bff', top: '#241c34', bottom: '#161020', hat: 'hood', hatColor: '#1c1428', longHair: true } },
    bio: 'The Undercity\'s finest hands. Has stolen from the Ministry twice. They still don\'t know about the second time.',
    pitch: 'The man who shot a senator, in MY tunnels. Take me along — you need someone who knows which shadows bite.',
    broke: 'I steal FOR pay, not AS pay. Details matter.' });

  // ================= SHOPS =================
  G.registerShop('cyb_shop_bazaar', { name: "Juno's Salvage Stall", items: ['cyb_h1', 'cyb_m1', 'cyb_w1', 'cyb_a1'] });
  G.registerShop('cyb_shop_plaza', { name: 'Arcology Outfitters', items: ['cyb_h1', 'cyb_h2', 'cyb_m1', 'cyb_r1', 'cyb_w2', 'cyb_w3', 'cyb_a2', 'cyb_a3', 'cyb_x1', 'cyb_x2'] });
  G.registerShop('cyb_shop_under', { name: 'Black Circuit Market', items: ['cyb_h2', 'cyb_r1', 'cyb_m1', 'cyb_w4', 'cyb_a4', 'cyb_x3'] });

  // ================= QUESTS =================
  G.registerQuest({ id: 'q_cyb_parts', world: 'cyber', name: 'Servo Salvage', giver: 'Mechanic Juno',
    desc: 'Juno needs 3 milspec servo cores. Scav drones and sec-bots are full of them. Full of bullets works too.',
    offerLines: ['Vex! My supplier got "nationalized". I need milspec servo cores — three of them — or half this bazaar stops running.', 'Drones carry them. Sec-bots carry better ones. Both explode if you ask nicely with a railgun.'],
    midLine: 'Cores, Vex. The noodle stall\'s fryer is running on hope and one capacitor.',
    turninLines: [{ text: 'Beautiful. Barely dented! The bazaar eats tonight. Here — creds, and take the boots. Fell off a courier. The courier was fine. Mostly.' }],
    stages: [{ text: 'Salvage Milspec Scrap from drones & sec-bots', type: 'item', target: 'cyb_scrap', n: 3 }],
    reward: { gold: 150, exp: 80, items: [{ id: 'cyb_x2', n: 1 }] } });
  G.registerQuest({ id: 'q_cyb_rats', world: 'cyber', name: 'Something in the Pipes', giver: 'Undercity Pip',
    desc: 'Mutants have been snatching people near the lower vents. Pip wants three of them gone.',
    offerLines: ['Mister gun-man! The pipes eat people now. Old Sana went to fix a valve and only her boots came back.', 'Three of the big green ones nest by the vents. Make them not. Please.'],
    midLine: 'You can hear them gurgle if you put your ear to the floor. Don\'t put your ear to the floor.',
    turninLines: [{ text: 'The gurgling stopped! Everyone can sleep again. Here — we all chipped in. It\'s not much, but it\'s EVERYONE\'s.' }],
    stages: [{ text: 'Cull Sewer Mutants near the vents', type: 'kill', target: 'cyb_mutant', n: 3 }],
    reward: { gold: 260, exp: 160, items: [{ id: 'cyb_r1', n: 1 }] } });
  G.registerQuest({ id: 'q_cyb_repo', world: 'cyber', name: 'Repossession Notice', giver: 'Bookie Felix',
    desc: 'Felix "lent" four sec-bots to plaza security. They stopped paying. Repossess the hardware. Violently.',
    offerLines: ['Friend! Business proposal. Four sec-bots on plaza patrol are technically MY sec-bots. Leasing dispute. Very boring, very legal.', 'Scrap them and we\'ll call the lease settled. I pay finder\'s fees in real creds.'],
    midLine: 'Four units, friend. The paperwork is watertight. The paperwork does not exist.',
    turninLines: [{ text: 'Settled in full! A pleasure doing violence with you. Here\'s your fee — pre-laundered, don\'t ask.' }],
    stages: [{ text: 'Scrap Sec-Bots around the plaza', type: 'kill', target: 'cyb_secbot', n: 4 }],
    reward: { gold: 300, exp: 170, items: [{ id: 'cyb_h2', n: 2 }] } });

  // ================= DIALOGS =================
  const D = G.registerDialog;
  D('cyb_noodle', ch => ['Synth-ramen, best in the sprawl. The secret ingredient is that there are no ingredients.']);
  D('cyb_ren_bar', ch => [ch.chapter < 1
    ? 'Same table as always, Vex. You look thin. Bad jobs or no jobs? …Listen. Soon I might need your help with something real. Not creds-real. WORLD-real. When I\'m ready, you\'ll know.'
    : 'The bartender keeps Ren\'s table empty. Nobody sits there. Nobody ever will.']);
  D('cyb_scavver', ch => ['The dunes were a city once. Shizuoka-proper. Then the Ministry tested something and now it\'s beach, all the way down.']);
  D('cyb_plaza_pr', ch => ['Welcome to Arcology Plaza! Crime is at 0.02%! Happiness is MANDATORY at 98%! Please enjoy responsibly and report all unenjoyment.']);
  D('cyb_under_elder', ch => [ch.chapter < 4
    ? 'The Ministry says the Undercity doesn\'t exist. Good. You can\'t bomb what you can\'t admit to. The resistance meets past the vents — tell them the Elder counts you.'
    : 'The spire junction was a trap, then? The aide sold you. Kid — up here everyone sells everyone. The trick is being worth more alive.']);
  D('cyb_resistance', ch => ['Ren\'s chip proves Directive Zero — the Ministry\'s plan to "archive" the Undercity. Archive. With thermobarics. Broadcast it from the Citadel and even the arcology sheep will wake up.']);
  D('cyb_citadel_prisoner', ch => ['They process people here, merc. In, a person. Out, a "record". The Director says data is the only citizen that never lies. He TALKS to something in the deep server room. It answers in three voices.']);

  // ================= CUTSCENES =================
  const CS = G.registerCutscene;
  CS('cyb_intro', () => [
    { music: 'cyber' },
    { say: [
      { text: 'NEO-SHIZUOKA, 2087. Population 40 million, employment rate "classified". The Ministry of Continuity governs by algorithm and drone. Everyone else governs by getting paid.' },
      { text: 'You are Vex Kurono: hired gun, licensed and rated four-and-a-half stars. You kill people who bad people say are worse people. The math usually holds.' },
      G.spk(VEX, 'One more year of jobs. One more year, then I buy out my debt-contract, get the Ministry tracker cut out of my neck, and walk into the dunes a free man.'),
      G.spk(VEX, 'Tonight: drinks with Ren at the bazaar bar — the only person in this city who talks to me like I\'m a person. Then tomorrow, back to work.'),
      { text: 'The work finds you first. It always does.' },
    ] },
    { chapter: 0 },
  ]);
  CS('cyb_cs1', () => [
    { say: [
      { text: 'Razor\'s gang has the bazaar\'s north gate chained. Stall-keepers pay in creds, teeth, or inventory.' },
      G.spk({ name: 'Razor', color: '#ff2d95' }, 'Vex Kurono! Four-and-a-half stars! Walk away, merc. The bazaar pays ME rent now.'),
      G.spk(VEX, 'Juno fixes my gun. The noodle guy feeds me. The bar stocks Ren\'s whisky. You\'re threatening my entire support network, Razor.'),
      G.spk({ name: 'Razor', color: '#ff2d95' }, 'It\'s not personal, choom. It\'s business.'),
      G.spk(VEX, 'Funny. That\'s exactly what I say.'),
    ] },
    { battle: { enemies: ['cyb_boss1', 'cyb_ganger', 'cyb_ganger'], bg: 'neon', boss: true } },
    { say: [
      { text: 'Razor\'s chrome stops twitching. The bazaar exhales. Your agent pings: NEW CONTRACT — priority, anonymous, pays SIX MONTHS of debt in one job.' },
      G.spk(VEX, '"Data smuggler operating from a rig in the Rust Dunes. Terminate, retrieve cargo." …Six months of freedom for one trigger-pull.'),
      G.spk(VEX, '(Ren didn\'t show tonight. First time in three years. Probably senate business — the feeds say the vote on the Undercity is soon.) Whatever. Dunes at dawn.'),
    ] },
    { give: { item: 'cyb_h1', n: 2 } }, { gold: 90 },
    { chapter: 1 }, { heal: true },
  ]);
  CS('cyb_cs2', () => [
    { say: [
      { text: 'The smuggler\'s rig, half-buried in rust-colored sand. Its guardian machine is scrap now. Inside: one figure in a smuggler\'s cloak, back turned, hunched over a transmitter.' },
      G.spk(VEX, 'Contract says no words. Sorry, choom. Business.'),
      { text: 'The figure spins — something glinting in hand— your body does what four-and-a-half stars of muscle memory does.' },
    ] },
    { sfx: 'gun' }, { flash: true }, { shake: 9 }, { wait: 1 },
    { say: [
      { text: 'The glinting thing hits the sand. Not a weapon. A whisky flask. YOUR whisky — the brand only one person ever bought you.' },
      G.spk(REN, 'V-Vex…? Of course… of course they\'d send… the one merc I\'d never see coming…'),
      G.spk(VEX, 'REN. No no no — pressure, keep pressure on it — WHY ARE YOU IN A SMUGGLER RIG?'),
      G.spk(REN, 'Senator Ren Osei… votes NO on Directive Zero tomorrow… so the Ministry needed me… gone, quietly… listen. LISTEN. Take the chip. It\'s all on the chip. The vote, the lie, the Undercity… finish my no vote, Vex. You\'re the only… honest gun… I ever…'),
      { text: 'The transmitter keeps blinking. The flask empties into the sand. Overhead, a Ministry satellite adjusts its gaze, and your neck-tracker burns white hot: CITIZEN VEX KURONO — WANTED. CRIME: ASSASSINATION OF A SENATOR.' },
      G.spk(VEX, 'They contracted ME to do it. Clean hands. MY hands. …Ren, I swear on the flask — they will play your chip on every screen in this city.'),
    ] },
    { give: { item: 'key_chip' } },
    { chapter: 2 }, { heal: true },
  ]);
  CS('cyb_cs3', () => [
    { say: [
      { text: 'Arcology Plaza. Ren\'s aide agreed to meet by the fountain. Instead: Sec Chief Vega, twelve bots, and your face on every ad-board — WANTED, 2,000,000 creds.' },
      G.spk({ name: 'Sec Chief Vega', color: '#ff6a6a' }, 'Vex Kurono. You know what\'s funny? I VOUCHED for your license renewal. Five stars, I said. And then you go and shoot a senator.'),
      G.spk(VEX, 'The Ministry wrote that contract, Vega. I have the proof on me. You want to see what your paycheck signs off on?'),
      G.spk({ name: 'Sec Chief Vega', color: '#ff6a6a' }, 'What I WANT is irrelevant. That\'s what a paycheck means.'),
    ] },
    { battle: { enemies: ['cyb_boss3', 'cyb_secbot', 'cyb_agent'], bg: 'under', boss: true } },
    { say: [
      { text: 'Vega slumps against the fountain, laughing at something. "Check the chip reader," he coughs. "The aide sold you to us — but he sold US the meeting location too. Kid plays every side. Undercity kind of move."' },
      G.spk(VEX, 'Then the Undercity is where I go. The resistance wanted Ren\'s vote. They\'ll want his chip more.'),
    ] },
    { chapter: 3 }, { heal: true },
  ]);
  CS('cyb_cs4', () => [
    { say: [
      { text: 'The Undercity vents. The resistance\'s route to the broadcast spire runs through the nest — and the nest\'s owner is awake.' },
      { who: 'The Broodmother', text: 'SMALL WARM THING. THE MINISTRY POURED ITS MISTAKES DOWN HERE FOR FIFTY YEARS. I AM MADE OF MISTAKES. WHAT ARE YOU MADE OF?', color: '#df6' },
      G.spk(VEX, 'Bad decisions and one promise. Move, or become a smaller pile of mistakes.'),
    ] },
    { battle: { enemies: ['cyb_boss4', 'cyb_mutant'], bg: 'under', boss: true } },
    { say: [
      { text: 'The Broodmother deflates into the dark water. Beyond the nest: the spire junction, the resistance\'s uplink crew… and a dead drop from the aide: "Sorry about the plaza. Ministry pays better. PS: Citadel codes attached. Call it a refund."' },
      G.spk(VEX, 'Everyone plays every side. Fine. Tomorrow the Citadel learns what MY side looks like.'),
    ] },
    { chapter: 4 }, { heal: true },
  ]);
  CS('cyb_cs5', () => [
    { music: 'boss' },
    { say: [
      { text: 'The Ministry Citadel\'s broadcast core. One socket for the chip. One man in the way — Director Sato, backlit by a wall of every camera feed in the city. Including, somehow, feeds of YOU. Sleeping. Eating. At Ren\'s table.' },
      G.spk({ name: 'Director Sato', color: '#c86bff' }, 'Citizen Kurono. We\'ve watched you for years. Do you know why the contract went to you? The algorithm chose the one gun Osei trusted. Optimal. Elegant. NOTHING personal.'),
      G.spk(VEX, 'You made me shoot my friend and filed it under OPTIMAL.'),
      G.spk({ name: 'Director Sato', color: '#c86bff' }, 'I made you FREE. Debt cleared, per contract. You could walk into the dunes tonight. Instead you\'re here, holding a dead man\'s data like it means something. Data doesn\'t grieve, Kurono. Give me the chip.'),
      G.spk(VEX, 'Come take it. Consider it… nothing personal.'),
    ] },
    { battle: { enemies: ['cyb_boss5', 'cyb_agent', 'cyb_agent'], bg: 'citadel', boss: true } },
    { shake: 10 }, { flash: true }, { sfx: 'rift' }, { music: 'rift' },
    { say: [
      { text: 'Sato falls. The chip slides home. On ten million screens at once: Ren\'s face, Ren\'s voice, Ren\'s truth — and the city ROARS—' },
      { text: '—and stops. Mid-roar. The screens freeze on Ren\'s smile. The rain hangs in the air like glass beads. Your tracker reads a time that does not exist: 25:61.' },
      { who: '???', text: 'THREE OF THREE. FOUND. THE LOCK TURNS. COME HOME, SPLINTER.', color: '#c86bff' },
      G.spk(VEX, 'The deep server room. Sato\'s three-voiced thing. It\'s been under EVERYTHING—'),
      { text: 'The wall of frozen screens tears open like wet paper. Beyond it: a burning village, a midnight dock, and two men wearing your soul.' },
      { text: '— VEX\'S STORY REACHES THE RIFT —', color: '#c86bff' },
    ] },
    { give: { item: 'key_shard3' } },
    { fn: () => { const ch = G.ch(); ch.riftReached = true; G.save(); G.scenes.toSelect(); } },
  ]);

  // ================= MAPS =================
  const M = G.registerMap;
  // ---- overworld ----
  M({
    id: 'cyb_over', name: 'Neo-Shizuoka Sprawl', world: 'cyber', theme: 'cyber',
    grade: 'neon', amb: 'neonrain', music: 'cyber', bg: 'neon',
    rows: [
      '####################################',
      '#BBBB..BBBBBB....BBBB,,,,ssssssssss#',
      '#BBBB..BBBBBB....BBBB,,,sssssssssss#',
      '#......=....=......=,,,,ssssossssss#',
      '#..=====....========,,,ssss,,,sssss#',
      '#..=....nn......=,,,,,,sss,,,,,ssss#',
      '#..=....nn......=,,,,,,ss,,o,,,,sss#',
      '#..=............=,,,,,,ss,,,,,,,sss#',
      '#..====..===..===,,,,,,sss,,,,ssss=#',
      '#.....=..=.=....=,,,,,,,sss,,sssss=#',
      '#.BB..=..=.=....==,,,,,,,ss,,,ssss=#',
      '#.BB..====.======+=,,,,,,,,,,,sss==#',
      '#.....=....=....==,,,,,,,,,,,,,,===#',
      '#..o..=....=....=,,,,,o,,,,,,,,,,,,#',
      '#..... =...=....=,,,,,,,,,,,o,,,,,,#',
      '#..=====...======,,,,,,,,,,,,,,,,,,#',
      '#..=...........=,,,,,,,,,,,,,,,,,,,#',
      '#..=..BB..BB...=,,,o,,,,,,,,,,,,,,,#',
      '#..=..BB..BB...==,,,,,,,,,,,,,,,,,,#',
      '#..=...........==,,,,,,,,,,,,,,,,,,#',
      '#..==========..==,,,,,,,,,,,,,,,,,,#',
      '#...........=...=,,,,,,,,,,,,,,,,,,#',
      '#...........=...=,,,,,,,,,,,,,,,,,,#',
      '####################################',
    ],
    spawn: { x: 9, y: 5 },
    enc: { groups: [['cyb_drone'], ['cyb_drone', 'cyb_drone'], ['cyb_hound', 'cyb_ganger'], ['cyb_ganger', 'cyb_ganger'], ['cyb_scorp']] },
    exits: [
      { x: 9, y: 4, to: 'cyb_bazaar', tx: 16, ty: 18 },
      { x: 34, y: 8, w: 1, h: 2, to: 'cyb_waste', tx: 2, ty: 11, cond: ch => ch.chapter >= 1, locked: 'A Ministry checkpoint blocks the dune road. (Finish Chapter 1.)' },
      { x: 5, y: 3, to: 'cyb_plaza', tx: 14, ty: 18, cond: ch => ch.chapter >= 2, locked: 'The arcology scans you and disapproves. (Finish Chapter 2.)' },
      { x: 12, y: 22, to: 'cyb_under', tx: 2, ty: 3, cond: ch => ch.chapter >= 3, locked: 'The Undercity hatch is sealed from below. (Finish Chapter 3.)' },
      { x: 18, y: 3, to: 'cyb_fort', tx: 14, ty: 19, cond: ch => ch.chapter >= 4, locked: 'The Citadel wall reads: DIRECTIVE ZERO IN EFFECT. (Finish Chapter 4.)' },
    ],
    npcs: [
      { id: 'cyb_ow_scavver', name: 'Dune Scavver', x: 22, y: 12, color: '#b8b0d0', dialog: 'cyb_scavver',
        spr: { kind: 'humanoid', o: { skin: '#c8956a', hair: '#654', top: '#6a5a48', bottom: '#4a4034', hat: 'hood', hatColor: '#5a4a38' } } },
    ],
    signs: [{ x: 16, y: 11, text: 'Sprawl junction: NW bazaar · NE Citadel · W arcology plaza · E Rust Dunes · S Undercity hatch. Mind the drones.' }],
    chests: [{ id: 1, x: 30, y: 6, items: [{ id: 'cyb_h1', n: 2 }], gold: 50 }, { id: 2, x: 4, y: 22, items: [{ id: 'cyb_m1', n: 2 }], gold: 60 }],
  });
  // ---- 1: Neon Bazaar ----
  M({
    id: 'cyb_bazaar', name: 'Neon Bazaar', world: 'cyber', theme: 'cyber',
    grade: 'neon', amb: 'neonrain', music: 'cyber', bg: 'neon',
    rows: [
      '##################################',
      '#BBBBBB,,BBBBBB,,BBBBBB,,BBBBBB###',
      '#BBBBBB,,BBBBBB,,BBBBBB,,BBBBBB###',
      '#,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,##',
      '#,,nnnn,,,cc,cc,,,cc,cc,,,nnnn,,##',
      '#,,nnnn,,,cc,cc,,,cc,cc,,,nnnn,,##',
      '#,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,##',
      '#,,cc,cc,,,nnnnnnnn,,,,cc,cc,,,,##',
      '#,,cc,cc,,,n......n,,,,cc,cc,,,,##',
      '#,,,,,,,,,,n......n,,,,,,,,,,,,,##',
      '#,,,,,,,,,,nn,,,nnn,,,,,,,,,,,,,##',
      '#,,BB,,,,,,,,,,,,,,,,,,,,,BB,,,,##',
      '#,,BB,,,+,,,,,,,,,,,,,,,,,BB,,,,##',
      '#,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,##',
      '#,,,nnnnnn,,,,,,,,,,,,nnnnnn,,,,##',
      '#,,,n....n,,,,,,,,,,,,n....n,,,,##',
      '#,,,nnnnnn,,,,,,,,,,,,nn,nnn,,,,##',
      '#,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,##',
      '#,,,,F,F,,,,,,,,,,,,,,,,F,F,,,,,##',
      '################==################',
    ],
    spawn: { x: 16, y: 19 },
    enc: { groups: [['cyb_ganger'], ['cyb_ganger', 'cyb_hound'], ['cyb_drone', 'cyb_drone'], ['cyb_drone', 'cyb_ganger']] },
    exits: [{ x: 16, y: 19, w: 2, to: 'cyb_over', tx: 9, ty: 5 }],
    npcs: [
      { id: 'cyb_juno', name: 'Mechanic Juno', x: 6, y: 5, color: '#9adcff', quest: 'q_cyb_parts', shop: 'cyb_shop_bazaar', still: true,
        shopLine: 'Salvage, stims, and second chances. Warranty void the moment you leave my stall. Or before.',
        spr: { kind: 'humanoid', o: { skin: '#d8a087', hair: '#f80', top: '#4a4438', bottom: '#302c24', hat: 'headband', hatColor: '#f80' } } },
      { id: 'cyb_noodle', name: 'Noodle Saint', x: 20, y: 5, color: '#ffd23e', dialog: 'cyb_noodle', still: true,
        spr: { kind: 'humanoid', o: { skin: '#e0b090', hair: '#222', top: '#7a3030', bottom: '#4e2020', hat: 'headband', hatColor: '#fff' } } },
      { id: 'cyb_ren', name: "Ren's Table", x: 14, y: 8, color: '#7dffa0', dialog: 'cyb_ren_bar', still: true, spr: REN.spr },
      { id: 'cyb_bit', name: 'Bit', x: 21, y: 8, color: '#0ff', hire: 'bit', spr: null },
    ],
    chests: [{ id: 1, x: 3, y: 17, items: [{ id: 'cyb_w2', n: 1 }] }, { id: 2, x: 30, y: 13, items: [{ id: 'cyb_h1', n: 3 }], gold: 80 }],
    triggers: [{ id: 'boss1', x: 15, y: 1, w: 2, h: 2, event: 'cyb_cs1', cond: ch => ch.chapter === 0 }],
    signs: [{ x: 15, y: 10, text: 'THE LAST DROP — bar & bad decisions. Ren\'s table is the one by the heat vent.' }],
  });
  // ---- 2: Rust Dunes (desert biome) ----
  M({
    id: 'cyb_waste', name: 'The Rust Dunes', world: 'cyber', theme: 'desert',
    grade: 'sand', amb: 'dust', music: 'cyber', bg: 'desert',
    rows: [
      '##################################',
      '#sssooosssssssss,,,ssssssoossssss#',
      '#ssssossssss,,ssss,,,sssssooossss#',
      '#sss,,,,,ss,,,,,ss,,,,ss,,,,,ssss#',
      '#ss,,,,,,,,,,,,,,,,,,,,,,,,,,,sss#',
      '#ss,,o,,,,,,YY,,,,,,,o,,,,,,,,sss#',
      '#s,,,,,,,,,,,,,,,,,,,,,,,,o,,,sss#',
      '#s,,,,,,ooo,,,,,,,,,,,,,,,,,,,,ss#',
      '#s,,,,,oo,oo,,,,,,,,Y,,,,,,,,,,ss#',
      '#ss,,,,,,,,,,,,,,,,,,,,,,,,,,,,ss#',
      '#ss,,,,,,,,,,,,+,,,,,,,,,oo,,,,ss#',
      '#==,,,,,,,,,,,,,,,,,,,,,oooo,,,ss#',
      '#,==,,,,,,,,,,,,,,,,,,,,,oo,,,,ss#',
      '#,,=,,,,,Y,,,,,,,,,,,,,,,,,,,,sss#',
      '#,,,,,,,,,,,,,,,,,,,,Y,,,,,,,ssss#',
      '#ss,,,,,,,,,,,oo,,,,,,,,,,,,,ssss#',
      '#sss,,,,,,,,,oooo,,,,,,,,,,,sssss#',
      '#ssss,,,,,,,,,oo,,,,,,,,,,,ssssss#',
      '#sssss,,,,,,,,,,,,,,,,,,,sssossss#',
      '#ssssssssss,,,,,,,,,ssssssssosbss#',
      '##################################',
    ],
    spawn: { x: 2, y: 11 },
    enc: { groups: [['cyb_scorp'], ['cyb_scorp', 'cyb_scorp'], ['cyb_drone', 'cyb_drone'], ['cyb_hound', 'cyb_hound'], ['cyb_secbot']] },
    exits: [{ x: 1, y: 11, to: 'cyb_over', tx: 32, ty: 9 }],
    npcs: [
      { id: 'cyb_hermit', name: 'Dune Hermit', x: 10, y: 5, color: '#b8b0d0', dialog: 'cyb_scavver',
        spr: { kind: 'humanoid', o: { skin: '#c8956a', hair: '#888', top: '#7a6a52', bottom: '#54483a', hat: 'hood', hatColor: '#6a5a44', beard: true } } },
    ],
    chests: [{ id: 1, x: 30, y: 4, items: [{ id: 'cyb_x1', n: 1 }] }, { id: 2, x: 5, y: 18, items: [{ id: 'cyb_h2', n: 2 }], gold: 100 }],
    triggers: [{ id: 'boss2', x: 27, y: 18, w: 3, h: 2, event: 'cyb_cs2_pre', cond: ch => ch.chapter === 1 }],
    signs: [{ x: 4, y: 11, text: 'GEIGER ADVISORY: the dunes glow gently after dark. The Ministry assures you this is aesthetic.' }],
  });
  // pre-boss wrapper: fight the Stalker, then the rig scene
  CS('cyb_cs2_pre', () => [
    { say: [
      { text: 'A smuggler\'s rig crests the last dune — and the sand under your boots rises with it. The rig\'s guardian has been waiting all along.' },
      { who: 'Dune Stalker', text: 'PERIMETER BREACH. HELLO. GOODBYE.', color: '#f80' },
    ] },
    { battle: { enemies: ['cyb_boss2', 'cyb_drone'], bg: 'desert', boss: true } },
    { fn: () => { G.runCutscene(G.cutscenes['cyb_cs2']()); return 'async'; } },
  ]);
  // ---- 3: Arcology Plaza ----
  M({
    id: 'cyb_plaza', name: 'Arcology Plaza', world: 'cyber', theme: 'cyber',
    grade: 'dusk', amb: 'neonrain', music: 'cyber', bg: 'citadel',
    rows: [
      '##############################',
      '#BBBBBBBB....PP....BBBBBBBB###',
      '#BBBBBBBB..........BBBBBBBB###',
      '#,,,,,,,,,,,,,,,,,,,,,,,,,,,##',
      '#...nnnnnnnnnnnnnnnnnn......##',
      '#...n................n......##',
      '#...n..~~~..PP..~~~..n......##',
      '#...n..~~~......~~~..n......##',
      '#...n................n......##',
      '#...nnnnnn..+..nnnnnnn......##',
      '#........n.....n............##',
      '#..BB....n.....n....BB......##',
      '#..BB....nnnnnnn....BB......##',
      '#,,,,,,,,,,,,,,,,,,,,,,,,,,,##',
      '#,,,PP,,,,,,,,,,,,,,,PP,,,,,##',
      '#,,,,,,,,,,,,,,,,,,,,,,,,,,,##',
      '#,,,,,BBBB,,,,,,,BBBB,,,,,,,##',
      '#,,,,,BBBB,,,,,,,BBBB,,,,,,,##',
      '#,,,,,,,,,,,,,,,,,,,,,,,,,,,##',
      '##############==##############',
    ],
    spawn: { x: 14, y: 19 },
    enc: { groups: [['cyb_secbot'], ['cyb_secbot', 'cyb_drone'], ['cyb_agent'], ['cyb_runner', 'cyb_drone']] },
    exits: [{ x: 14, y: 19, w: 2, to: 'cyb_over', tx: 5, ty: 4 }],
    npcs: [
      { id: 'cyb_pr', name: 'PR Hologram', x: 14, y: 3, color: '#9adcff', dialog: 'cyb_plaza_pr', still: true,
        spr: { kind: 'humanoid', o: { skin: '#bcd', hair: '#dff', top: '#3a5a7a', bottom: '#264056', hat: 'halo' } } },
      { id: 'cyb_felix', name: 'Bookie Felix', x: 23, y: 14, color: '#ffd23e', quest: 'q_cyb_repo',
        spr: { kind: 'humanoid', o: { skin: '#e0b090', hair: '#654', top: '#5a4a2a', bottom: '#3c321c', hat: 'fedora', hatColor: '#4a3c22' } } },
      { id: 'cyb_outfitter', name: 'Outfitter Prime', x: 6, y: 14, color: '#ffd23e', shop: 'cyb_shop_plaza', still: true,
        shopLine: 'Arcology-certified equipment. Ballistic ratings independently falsified.',
        spr: { kind: 'humanoid', o: { skin: '#d8b090', hair: '#222', top: '#38404e', bottom: '#242a36', tie: '#0ff', lapel: true } } },
      { id: 'cyb_dice', name: 'Dice', x: 22, y: 8, color: '#ffd23e', hire: 'dice', spr: null },
    ],
    chests: [{ id: 1, x: 26, y: 3, items: [{ id: 'cyb_h2', n: 1 }], gold: 100 }, { id: 2, x: 2, y: 18, items: [{ id: 'cyb_a3', n: 1 }] }],
    triggers: [{ id: 'boss3', x: 12, y: 6, w: 2, h: 2, event: 'cyb_cs3', cond: ch => ch.chapter === 2 }],
    signs: [{ x: 13, y: 4, text: 'ARCOLOGY PLAZA — happiness checkpoint. Smile for the scanners. SMILE FOR THE SCANNERS.' }],
  });
  // ---- 4: The Undercity ----
  M({
    id: 'cyb_under', name: 'The Undercity', world: 'cyber', theme: 'cyber',
    grade: 'toxic', amb: 'motes', music: 'cyber', bg: 'under',
    rows: [
      '##################################',
      '#,,,,,,#####,,,,,,,####,,,,,,,,,##',
      '#,,,,,,#####,,,,,,,####,,,,,,,,,##',
      '#,,,,,,,,,,,,,~~,,,,,,,,,,####,,##',
      '####,,,,,,,,,,~~,,,,,,,,,,####,,##',
      '####,,,####,,,~~~,,,####,,,,,,,,##',
      '#,,,,,,####,,,,~~,,,####,,,,,,,,##',
      '#,,,,,,####,,,,~~,,,,,,,,,,,,,,,##',
      '#,,,,,,,,,,,,,,~~~,,,,,,,,####,,##',
      '#,####,,,,,,,,,,~~,,,####,####,,##',
      '#,####,,,+,,,,,,~~,,,####,,,,,,,##',
      '#,,,,,,,,,,,,,,,~~,,,,,,,,,,,,,,##',
      '#,,,,,,,,,,,,,,,-,,,,,,,,,,,,,,,##',
      '#,,####,,,####,,~,,####,,,,####,##',
      '#,,####,,,####,,~~,####,,,,####,##',
      '#,,,,,,,,,,,,,,,~~,,,,,,,,,,,,,,##',
      '#,,,,,,,,,,,,,,,~~~,,,,,,,,,,,,,##',
      '#,,####,,,,,,,,,,~~,,,,####,,,,,##',
      '#,,####,,,####,,,~~,,,,####,,,,,##',
      '#,,,,,,,,,####,,,~~,,,,,,,,,,,,,##',
      '##################################',
    ],
    spawn: { x: 2, y: 3 },
    enc: { groups: [['cyb_mutant'], ['cyb_mutant', 'cyb_hound'], ['cyb_runner'], ['cyb_runner', 'cyb_mutant'], ['cyb_agent', 'cyb_drone']] },
    exits: [{ x: 1, y: 3, w: 1, h: 1, to: 'cyb_over', tx: 12, ty: 21 }],
    npcs: [
      { id: 'cyb_elder', name: 'Vent Elder', x: 6, y: 8, color: '#b8b0d0', dialog: 'cyb_under_elder', still: true,
        spr: { kind: 'humanoid', o: { skin: '#c8956a', hair: '#aaa', top: '#4a4a58', bottom: '#32323c', beard: true, gear: 'staff', gearColor: '#556' } } },
      { id: 'cyb_pip', name: 'Undercity Pip', x: 20, y: 7, color: '#9adcff', quest: 'q_cyb_rats',
        spr: { kind: 'humanoid', o: { skin: '#d8a087', hair: '#3ad', top: '#3a4a3a', bottom: '#263226' } } },
      { id: 'cyb_blackmarket', name: 'Circuit Broker', x: 27, y: 11, color: '#ffd23e', shop: 'cyb_shop_under', still: true,
        shopLine: 'Everything here is legal somewhere. Not here. But somewhere.',
        spr: { kind: 'humanoid', o: { skin: '#d8a087', hair: '#111', top: '#241c34', bottom: '#161020', hat: 'hood', hatColor: '#1c1428' } } },
      { id: 'cyb_resist', name: 'Resistance Ash', x: 8, y: 16, color: '#7dffa0', dialog: 'cyb_resistance', cond: ch => ch.chapter >= 3,
        spr: { kind: 'humanoid', o: { skin: '#e8bfa0', hair: '#7dffa0', top: '#2a3a2a', bottom: '#1c281c', hat: 'headband', hatColor: '#7dffa0' } } },
      { id: 'cyb_nyx', name: 'Nyx', x: 24, y: 16, color: '#c86bff', hire: 'nyx', spr: null },
    ],
    chests: [{ id: 1, x: 31, y: 8, items: [{ id: 'cyb_w4', n: 1 }] }, { id: 2, x: 4, y: 19, items: [{ id: 'cyb_h2', n: 2 }], gold: 140 }],
    triggers: [{ id: 'boss4', x: 29, y: 19, w: 3, h: 1, event: 'cyb_cs4', cond: ch => ch.chapter === 3 }],
    signs: [{ x: 4, y: 3, text: 'UNDERCITY LEVEL 3 — "the city the city stands on". Vents south. Mutants everywhere. Welcome home.' }],
  });
  // ---- 5: Ministry Citadel ----
  M({
    id: 'cyb_fort', name: 'Ministry Citadel', world: 'cyber', theme: 'cyber',
    grade: 'rift', amb: 'motes', music: 'boss', bg: 'citadel',
    rows: [
      '##############################',
      '#####......########......#####',
      '####...nn...######...nn...####',
      '####........P....P........####',
      '#####,,,,,,........,,,,,,#####',
      '####,,,P,,,,,,,,,,,,,,P,,,####',
      '####,,,,,,,,,,,,,,,,,,,,,,####',
      '###,,,P,,,,P,,,,,,P,,,,P,,,###',
      '###,,,,,,,,,,,,,,,,,,,,,,,,###',
      '###,,,,,,,,,,,,,,,,,,,,,,,,###',
      '####,,,,,,,,,,,,,,,,,,,,,,####',
      '####,,,,P,,,,,,,,,,,,P,,,,####',
      '#####,,,,,,,,,+,,,,,,,,,,#####',
      '#####,,,,,,,,,,,,,,,,,,,,#####',
      '######,,,,,,,,,,,,,,,,,,######',
      '######,,,,,P,,,,,,P,,,,,######',
      '#######,,,,,,,,,,,,,,,,#######',
      '#######,,,,,,,,,,,,,,,,#######',
      '########,,,,,,,,,,,,,,########',
      '########,,,,,,nn,,,,,,########',
      '##############nn##############',
    ],
    spawn: { x: 14, y: 19 },
    enc: { groups: [['cyb_agent'], ['cyb_agent', 'cyb_secbot'], ['cyb_secbot', 'cyb_secbot'], ['cyb_agent', 'cyb_runner']] },
    exits: [{ x: 14, y: 20, w: 2, to: 'cyb_over', tx: 18, ty: 4 }],
    npcs: [
      { id: 'cyb_prisoner', name: 'Processing Queue #88', x: 6, y: 3, color: '#b8b0d0', dialog: 'cyb_citadel_prisoner', still: true,
        spr: { kind: 'humanoid', o: { skin: '#e0c0a0', hair: '#999', top: '#4a4458', bottom: '#322e3c' } } },
    ],
    chests: [{ id: 1, x: 24, y: 3, items: [{ id: 'cyb_a5', n: 1 }] }, { id: 2, x: 7, y: 15, items: [{ id: 'cyb_h2', n: 3 }], gold: 200 }],
    triggers: [{ id: 'boss5', x: 12, y: 3, w: 6, h: 1, event: 'cyb_cs5', cond: ch => ch.chapter === 4 }],
    signs: [{ x: 13, y: 19, text: 'MINISTRY OF CONTINUITY — "Yesterday, Curated. Tomorrow, Approved." Broadcast core: top floor.' }],
  });

  // hook companion sprites
  G.maps['cyb_bazaar'].npcs.find(n => n.id === 'cyb_bit').spr = G.companions['bit'].spr;
  G.maps['cyb_plaza'].npcs.find(n => n.id === 'cyb_dice').spr = G.companions['dice'].spr;
  G.maps['cyb_under'].npcs.find(n => n.id === 'cyb_nyx').spr = G.companions['nyx'].spr;

  // ================= WORLD =================
  G.registerWorld('cyber', {
    name: 'Neo-Shizuoka · 2087',
    start: { map: 'cyb_bazaar', x: 16, y: 19 },
    intro: () => G.cutscenes['cyb_intro'](),
    chapters: [
      { goal: 'Ch.1 — Break Razor\'s hold on the bazaar (north gate)' },
      { goal: 'Ch.2 — The big contract: a smuggler rig in the Rust Dunes' },
      { goal: 'Ch.3 — Meet Ren\'s aide at the Arcology Plaza fountain' },
      { goal: 'Ch.4 — Reach the broadcast spire through the Undercity vents' },
      { goal: 'Ch.5 — Storm the Ministry Citadel. Play the chip.' },
    ],
  });
})();
