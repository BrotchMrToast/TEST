// TRINITY RIFT — WORLD 1: Kenji, Sengoku Japan (dark, bloody revenge tale)
'use strict';
(function () {
  const KENJI = G.heroDefs.samurai;
  const HANA = { name: 'Hana', spr: { kind: 'humanoid', o: { skin: '#eebfa0', hair: '#1a1a22', top: '#a24545', bottom: '#6a3535', longHair: true } }, color: '#e8a0b8' };

  // ================= ENEMIES =================
  const E = G.registerEnemy;
  E('sam_bandit', { name: 'Ash Bandit', spr: { kind: 'humanoid', o: { skin: '#d8a87c', hair: '#2a2018', top: '#6a4a3a', bottom: '#3a3028', hat: 'headband', hatColor: '#a03030' } },
    hp: 34, atk: 8, def: 2, spd: 8, exp: 16, gold: 14, drops: [{ id: 'sam_sake', chance: 0.5 }, { id: 'sam_h1', chance: 0.2 }],
    skills: [{ name: 'Slash', pow: 1, type: 'attack', w: 3, sfx: 'slash' }, { name: 'Dirty Cut', pow: 1.3, type: 'attack', status: 'bleed', w: 1, sfx: 'slash' }] });
  E('sam_wolf', { name: 'Grey Wolf', spr: { kind: 'beast', o: { col: '#6a6470', dark: '#3a3640', eye: '#ffd23e' } },
    hp: 30, atk: 9, def: 1, spd: 12, exp: 14, gold: 8, drops: [{ id: 'sam_h1', chance: 0.25 }],
    skills: [{ name: 'Bite', pow: 1, type: 'attack', w: 3 }, { name: 'Lunge', pow: 1.4, type: 'attack', w: 1 }] });
  E('sam_kappa', { name: 'Kappa', spr: { kind: 'blob', o: { col: '#3a7a4a', dark: '#25522f', eye: '#ffe98a' } },
    hp: 48, atk: 11, def: 4, spd: 7, exp: 26, gold: 22, drops: [{ id: 'sam_m1', chance: 0.3 }],
    skills: [{ name: 'Splash', pow: 1, type: 'attack', w: 2 }, { name: 'Shell Bash', pow: 1.3, type: 'attack', w: 1 }] });
  E('sam_ronin', { name: 'Fallen Ronin', spr: { kind: 'humanoid', o: { skin: '#d8b090', hair: '#5a5a62', top: '#44464e', bottom: '#2c2e34', topknot: true, gear: 'katana', gearColor: '#889' } },
    hp: 58, atk: 13, def: 4, spd: 10, exp: 36, gold: 32, drops: [{ id: 'sam_w2', chance: 0.07 }, { id: 'sam_h1', chance: 0.3 }],
    skills: [{ name: 'Cut', pow: 1, type: 'attack', w: 2, sfx: 'slash' }, { name: 'Iai Draw', pow: 1.6, type: 'attack', w: 1, sfx: 'slash' }] });
  E('sam_ashigaru', { name: 'Ashigaru', spr: { kind: 'humanoid', o: { skin: '#d8a87c', hair: '#222', top: '#3a4a6a', bottom: '#2a3448', hat: 'kasa', hatColor: '#5a4a2a', gear: 'staff', gearColor: '#8a7358' } },
    hp: 74, atk: 15, def: 7, spd: 8, exp: 46, gold: 38, drops: [{ id: 'sam_a2', chance: 0.07 }],
    skills: [{ name: 'Spear Thrust', pow: 1, type: 'attack', w: 2 }, { name: 'Phalanx', type: 'buff', w: 1 }] });
  E('sam_yurei', { name: 'Yurei', spr: { kind: 'blob', o: { col: '#c8ccdd', dark: '#8a8fa8', eye: '#3af', ghost: true } },
    hp: 60, atk: 16, def: 2, spd: 11, exp: 52, gold: 26, drops: [{ id: 'sam_m1', chance: 0.35 }],
    skills: [{ name: 'Chill Touch', pow: 1.1, type: 'attack', w: 2 }, { name: 'Wail', pow: 0.7, type: 'attack', status: 'atkDn', w: 1 }] });
  E('sam_oni', { name: 'Marsh Oni', spr: { kind: 'blob', o: { col: '#a24545', dark: '#5e2525', eye: '#ffe98a', spikes: true } },
    hp: 98, atk: 19, def: 8, spd: 7, exp: 72, gold: 62, drops: [{ id: 'sam_h2', chance: 0.3 }, { id: 'sam_w4', chance: 0.04 }],
    skills: [{ name: 'Club Smash', pow: 1.1, type: 'attack', w: 2, sfx: 'crit' }, { name: 'Roar', type: 'buff', w: 1 }] });
  E('sam_redcap', { name: 'Redcap Zealot', spr: { kind: 'humanoid', o: { skin: '#c88a6a', hair: '#111', top: '#7a2020', bottom: '#4a1414', hat: 'oni', hatColor: '#a03030' } },
    hp: 90, atk: 21, def: 6, spd: 10, exp: 78, gold: 66, drops: [{ id: 'sam_h2', chance: 0.25 }, { id: 'sam_a4', chance: 0.04 }],
    skills: [{ name: 'Frenzy Cut', pow: 1.2, type: 'attack', status: 'bleed', w: 2, sfx: 'slash' }, { name: 'Blood Rite', type: 'heal', w: 1 }] });
  // bosses
  E('sam_boss1', { name: 'Bandit Chief Tetsuo', boss: true, scale: 4, spr: { kind: 'humanoid', o: { skin: '#c89068', hair: '#1a1410', top: '#7a5a3a', bottom: '#4a3828', hat: 'headband', hatColor: '#c43a3a', gear: 'katana', gearColor: '#a8b0c0', beard: true } },
    hp: 155, atk: 12, def: 3, spd: 9, exp: 95, gold: 150, drops: [{ id: 'sam_w2', chance: 1 }],
    skills: [{ name: 'Cleave', pow: 1.1, type: 'attack', w: 3, sfx: 'slash' }, { name: 'Rally Cry', type: 'buff', w: 1 }, { name: 'Wide Swing', pow: 0.8, type: 'aoe', w: 1 }],
    barks: { rage: 'You burn like the rest of them, boy!' } });
  E('sam_boss2', { name: 'Gorobei the Blade', boss: true, scale: 4, spr: { kind: 'humanoid', o: { skin: '#d8b090', hair: '#e8e4da', top: '#22242e', bottom: '#16181e', topknot: true, gear: 'katana', gearColor: '#fff', scar: true } },
    hp: 270, atk: 17, def: 6, spd: 13, exp: 190, gold: 240, drops: [{ id: 'sam_w3', chance: 1 }],
    skills: [{ name: 'Iaijutsu', pow: 1.7, type: 'attack', w: 2, sfx: 'slash' }, { name: 'Crescent Moon', pow: 1, type: 'aoe', w: 1, sfx: 'slash' }, { name: 'Severing Wind', pow: 1.3, type: 'attack', status: 'bleed', w: 1 }],
    barks: { rage: 'Yes! YES! Show me the mother in you!' } });
  E('sam_boss3', { name: 'Captain Iwao', boss: true, scale: 4, spr: { kind: 'humanoid', o: { skin: '#d8a87c', hair: '#2a2a30', top: '#2c3a5c', bottom: '#1e2840', hat: 'cap', hatColor: '#1a2438', gear: 'staff', gearColor: '#8a7358' } },
    hp: 410, atk: 21, def: 10, spd: 9, exp: 320, gold: 360, drops: [{ id: 'sam_a3', chance: 1 }],
    skills: [{ name: 'Halberd Sweep', pow: 1.1, type: 'attack', w: 2 }, { name: 'Iron Wall', type: 'buff', w: 1 }, { name: 'Volley Signal', pow: 0.9, type: 'aoe', w: 1, sfx: 'gun' }],
    barks: { rage: 'The castle stands. You will not.' } });
  E('sam_boss4', { name: 'War Oni Kurajishi', boss: true, scale: 4, spr: { kind: 'blob', o: { col: '#7a2a2a', dark: '#3e1212', eye: '#ffd23e', spikes: true, drip: true } },
    hp: 580, atk: 26, def: 11, spd: 8, exp: 480, gold: 520, drops: [{ id: 'sam_a4', chance: 1 }],
    skills: [{ name: 'Skull Crusher', pow: 1.3, type: 'attack', w: 2, sfx: 'crit' }, { name: 'Earthshaker', pow: 0.9, type: 'aoe', w: 2, sfx: 'explode' }, { name: 'Devour', type: 'heal', w: 1 }],
    barks: { rage: 'MORE. BONES.' } });
  E('sam_boss5', { name: 'Lord Masakado', boss: true, scale: 4, spr: { kind: 'humanoid', o: { skin: '#e0c0a0', hair: '#0e0e14', top: '#3a1030', bottom: '#240a20', hat: 'crown', gear: 'katana', gearColor: '#ffd23e', longHair: true } },
    hp: 780, atk: 31, def: 13, spd: 12, exp: 850, gold: 950, drops: [{ id: 'sam_w5', chance: 1 }],
    skills: [{ name: 'Sight-Stealer', pow: 1.4, type: 'attack', w: 2, sfx: 'slash' }, { name: 'Curse of Hours', pow: 1, type: 'aoe', status: 'atkDn', w: 1 }, { name: 'Crimson Tide', pow: 1.7, type: 'attack', status: 'bleed', w: 1 }],
    barks: { rage: 'The demon promised me TIME, boy! I will not die before I collect!' } });

  // quest item
  G.items['sam_sake'] = { id: 'sam_sake', name: 'Stolen Sake', type: 'key', desc: 'A jug looted from the Ashen Village storehouse.' };

  // ================= COMPANIONS =================
  G.registerCompanion('goro', { name: 'Goro', type: 'brute', world: 'samurai', cost: 100,
    spr: { kind: 'humanoid', o: { skin: '#c89068', hair: '#3a2a1a', top: '#5a4632', bottom: '#3a3028', beard: true, gear: 'staff', gearColor: '#6a4a2a' } },
    bio: 'The village woodcutter. His axe has stopped asking what it cuts.',
    pitch: 'They burned my woodshed too, Kenji. Give me a share and my axe walks with you.',
    broke: 'Wood is free. My arm is not.' });
  G.registerCompanion('kiku', { name: 'Kiku', type: 'thief', world: 'samurai', cost: 150,
    spr: { kind: 'humanoid', o: { skin: '#e8bfa0', hair: '#2a2a35', top: '#4a3a5a', bottom: '#2e2438', hat: 'hood', hatColor: '#3a2e4a', longHair: true } },
    bio: 'A shinobi without a clan. Sells secrets, keeps a few.',
    pitch: 'You walk loud, ronin. Pay me and I will teach the dark to like you.',
    broke: 'Secrets are expensive. So am I.' });
  G.registerCompanion('sadao', { name: 'Sadao', type: 'tactician', world: 'samurai', cost: 200,
    spr: { kind: 'humanoid', o: { skin: '#d8b090', hair: '#8a8a92', top: '#3c4458', bottom: '#282e3e', hat: 'kasa', hatColor: '#443a28', beard: true } },
    bio: 'Disgraced strategist of the Takeda. Lost an army; kept the lessons.',
    pitch: 'Masakado bested me once at Nagashino. I have been redrawing that map for nine years. Take me.',
    broke: 'Strategy without funding is called dreaming.' });

  // ================= SHOPS =================
  G.registerShop('sam_shop_v', { name: "Oyu's General Store", items: ['sam_h1', 'sam_m1', 'sam_w1', 'sam_a1'] });
  G.registerShop('sam_shop_t', { name: 'Kurogane Smithy & Wares', items: ['sam_h1', 'sam_h2', 'sam_m1', 'sam_r1', 'sam_w2', 'sam_w3', 'sam_a2', 'sam_a3', 'sam_x1', 'sam_x2'] });
  G.registerShop('sam_shop_m', { name: "Deserter's Black Market", items: ['sam_h2', 'sam_r1', 'sam_m1', 'sam_w4', 'sam_a4', 'sam_x3'] });

  // ================= QUESTS =================
  G.registerQuest({ id: 'q_sam_wolves', world: 'samurai', name: 'Fangs in the Ash', giver: 'Elder Michi',
    desc: 'Wolves grown bold on corpse-meat circle the village at night. Thin the pack — four should do.',
    offerLines: ['The wolves have learned what battlefields leave behind. They circle us at night now.', 'Four of them wear the pack. Kill them on the roads and my people sleep again.'],
    midLine: 'The howling was closer last night. Please hurry.',
    turninLines: [{ text: 'The nights are quiet again. Take this — the village owes you more than it can pay.' }],
    stages: [{ text: 'Hunt Grey Wolves on the roads', type: 'kill', target: 'sam_wolf', n: 4 }],
    reward: { gold: 120, exp: 60, items: [{ id: 'sam_h2', n: 2 }] } });
  G.registerQuest({ id: 'q_sam_sake', world: 'samurai', name: 'The Storehouse Debt', giver: 'Innkeep Oyu',
    desc: 'Bandits drank the village dry. Recover 3 jugs of stolen sake from the Ash Bandits.',
    offerLines: ['Those bandits took every last jug of the autumn brew. A village without sake is a village without weddings, funerals, or forgiveness.', 'Bring me back three jugs and drinks are on the house. Forever. Within reason.'],
    midLine: 'Any jug that survives a bandit is a strong jug.',
    turninLines: [{ text: 'The autumn brew! You beautiful, bloodstained man. Here — and the charm too. It kept my husband alive through two wars.' }],
    stages: [{ text: 'Recover Stolen Sake from Ash Bandits', type: 'item', target: 'sam_sake', n: 3 }],
    reward: { gold: 150, exp: 80, items: [{ id: 'sam_x1', n: 1 }] } });
  G.registerQuest({ id: 'q_sam_spirits', world: 'samurai', name: 'Rest for the Drowned', giver: 'Monk Junsei',
    desc: 'The Red Reed Marsh will not let its dead sleep. Put three yurei to rest.',
    offerLines: ['Ten thousand men fed this marsh in the last war. The water remembers all of them, and it is angry.', 'Cut down three of the wandering yurei. It is not killing — it is mercy delayed.'],
    midLine: 'When they wail, do not answer. Just swing.',
    turninLines: [{ text: 'The reeds bend easier tonight. The dead thank you in the only language they have left: silence.' }],
    stages: [{ text: 'Lay Yurei to rest in the marsh', type: 'kill', target: 'sam_yurei', n: 3 }],
    reward: { gold: 260, exp: 160, items: [{ id: 'sam_r1', n: 1 }] } });

  // ================= DIALOGS =================
  const D = G.registerDialog;
  D('sam_villager1', ch => [ch.chapter < 1
    ? 'They came at dusk. Masakado\'s banner, but bandit manners. What kind of lord flies a flag over arson?'
    : 'You broke the Chief\'s band? Then there is justice left in this province. A spoonful, anyway.']);
  D('sam_villager2', ch => ['My boy watched them drag the girls east. He hasn\'t spoken since. Bring your sister back, Kenji. Bring them all back.']);
  D('sam_kid', ch => ['When I grow up I\'ll have a sword too!', 'Mister, your sword is bigger than me. That\'s so unfair.'][ch.chapter % 2 ? 1 : 0]);
  D('sam_forest_hermit', ch => ['The bamboo whispers, traveler. It says a white-haired swordsman passed north, wiping his blade on a child\'s ribbon.', 'North clearing. Walk soft. Grief walks loud and he will hear you.']);
  D('sam_town_guard', ch => [ch.chapter < 3
    ? 'Castle\'s closed to ronin. Captain Iwao\'s orders. Move along before I remember my quota.'
    : 'Captain\'s dead and the garrison marched east to the marsh. Gods help whoever they\'re marching at.']);
  D('sam_town_gossip', ch => ['They say the Lord buys children who "see the other hour". Whatever that means, he pays in silver and takes them up Mount Onikura.', 'The forge master quenches blades in ox blood. Says the castle ordered a hundred. A hundred! For what war?']);
  D('sam_marsh_deserter', ch => ['I left Masakado\'s army when they started feeding prisoners to that... thing in the fortress basement. You want my armor stock? Cheap. I want to be far from here.']);
  D('sam_keep_prisoner', ch => ['The Lord speaks to an altar, samurai. And the altar answers in three voices. I heard it say YOUR name. All three of it.']);

  // ================= CUTSCENES =================
  const CS = G.registerCutscene;
  CS('sam_intro', () => [
    { music: 'samurai' },
    { say: [
      { text: 'SENGOKU JAPAN, 1573. The province burns by inches. Lord Masakado taxes in rice, in iron, and lately — in children.' },
      { text: 'Three nights ago the Ashen Village learned why they call it that. You buried your mother this morning. There was not enough of her left to fill the urn.' },
      G.spk(KENJI, '…The soil is still warm, mother. That is how I know the world is wrong.'),
      G.spk(KENJI, 'They took Hana east. Chains. She looked back — I was under the floorboards where you shoved me. I heard everything. I did nothing.'),
      G.spk(KENJI, 'Never again. I take your kitchen blade and I will trade up. Bandit, blade-master, captain, lord. Whatever stands between me and my sister — it bleeds.'),
    ] },
    { chapter: 0 },
  ]);
  CS('sam_cs1', () => [
    { say: [
      { text: 'A wall of scarred men blocks the east road. Their chief picks his teeth with a knife you recognize — it hung above your mother\'s stove.' },
      G.spk({ name: 'Bandit Chief Tetsuo', color: '#c43a3a' }, 'Ohh, the floorboard boy! We wondered if we missed one. Come to ask about the little sister?'),
      G.spk({ name: 'Bandit Chief Tetsuo', color: '#c43a3a' }, 'Sold her up the chain, boy. Gorobei took the pretty ones through the bamboo. The Lord pays triple for the ones with the "sight".'),
      G.spk(KENJI, 'That knife. You will give it back now.'),
      G.spk({ name: 'Bandit Chief Tetsuo', color: '#c43a3a' }, 'Heh. Point first, then.'),
    ] },
    { battle: { enemies: ['sam_boss1', 'sam_bandit', 'sam_bandit'], bg: 'ashvillage', boss: true } },
    { shake: 8 },
    { say: [
      { text: 'Tetsuo folds into the mud. The rain starts, as if the sky waited for permission.' },
      G.spk(KENJI, 'The kitchen knife goes home. The rest of you — feed the crows.'),
      { text: 'The east road is open. The Whispering Bamboo waits, and somewhere in it, the man who held the blade.' },
    ] },
    { give: { item: 'sam_h1', n: 2 } }, { gold: 80 },
    { chapter: 1 }, { heal: true },
  ]);
  CS('sam_cs2', () => [
    { say: [
      { text: 'The clearing is too quiet. Bamboo does not whisper here — it holds its breath. A white-haired man kneels in the center, blade across his knees, waiting.' },
      G.spk({ name: 'Gorobei the Blade', color: '#e8e4da' }, 'The woman in the village. Grey kimono, kitchen knife, stood in the doorway so the children could run.'),
      G.spk({ name: 'Gorobei the Blade', color: '#e8e4da' }, 'I remember her because she did not beg. I gave her a clean end. It is the only kindness I am permitted.'),
      G.spk(KENJI, 'You will not get one.'),
      G.spk({ name: 'Gorobei the Blade', color: '#e8e4da' }, 'Good. Then teach me what her son is made of.'),
    ] },
    { battle: { enemies: ['sam_boss2'], bg: 'bamboo', boss: true } },
    { say: [
      { text: 'Gorobei kneels in a spreading red circle, smiling like a man finally allowed to rest.' },
      G.spk({ name: 'Gorobei', color: '#e8e4da' }, 'Kurogane castle… the Captain ships the sighted children to the marsh camp… ask him… why the Lord fears… the hour between hours…'),
      G.spk(KENJI, 'Die knowing she was better than both of us.'),
      { text: 'You clean the blade on the grass. Your hands have stopped shaking. You are not sure that is a good sign.' },
    ] },
    { chapter: 2 }, { heal: true },
  ]);
  CS('sam_cs3', () => [
    { say: [
      { text: 'The castle gate. Captain Iwao reads a scroll and does not look up.' },
      G.spk({ name: 'Captain Iwao', color: '#9adcff' }, 'Gorobei is dead. You are the reason my week is ruined. The Lord wants the sighted ones moved to the marsh camp tonight — and wants you in a jar.'),
      G.spk(KENJI, 'Where is my sister?'),
      G.spk({ name: 'Captain Iwao', color: '#9adcff' }, 'In a wagon. Where you are about to be is a different container.'),
    ] },
    { battle: { enemies: ['sam_boss3', 'sam_ashigaru', 'sam_ashigaru'], bg: 'castle', boss: true } },
    { say: [
      { text: 'The captain\'s halberd splits the flagstones as he falls. The garrison scatters like startled birds.' },
      G.spk(KENJI, 'The marsh. Hana, hold on. Your brother has stopped being under the floorboards.'),
    ] },
    { chapter: 3 }, { heal: true },
  ]);
  CS('sam_ribbon', () => [
    { say: [
      { text: 'Something red in the black water. Silk. You know this ribbon — you tied it badly a hundred times.' },
      G.spk(KENJI, 'Hana\'s. Still knotted. She took it off herself — she is leaving a trail. Clever girl. Cleverer than her brother.'),
    ] },
    { give: { item: 'key_ribbon' } }, { sfx: 'chest' },
  ]);
  CS('sam_cs4', () => [
    { say: [
      { text: 'The war camp is a wound in the marsh: cages, banners, and a thing in rusted armor that was never a man.' },
      G.spk({ name: 'War Oni Kurajishi', color: '#ff6a6a' }, 'LORD SAYS: SIGHTED GO UP MOUNTAIN. LEFTOVER MEAT STAYS WITH KURAJISHI.'),
      G.spk(KENJI, 'The cages are empty. Where.'),
      G.spk({ name: 'War Oni Kurajishi', color: '#ff6a6a' }, 'MOUNTAIN. ALL BUT ONE. LOUD ONE. RIBBON GIRL. LORD KEEPS HER CLOSE NOW.'),
      G.spk(KENJI, 'Then I have no reason to leave you standing.'),
    ] },
    { battle: { enemies: ['sam_boss4', 'sam_oni'], bg: 'marsh', boss: true } },
    { say: [
      { text: 'The oni collapses like a landslide. In the mud beside it: a child\'s sandal, a soldier\'s prayer tag, and the road up Mount Onikura.' },
      G.spk(KENJI, 'One more door, Hana. One more.'),
    ] },
    { chapter: 4 }, { heal: true },
  ]);
  CS('sam_cs5', () => [
    { music: 'boss' },
    { say: [
      { text: 'The keep\'s great hall. A hundred candles, a black altar, and Lord Masakado — with Hana\'s wrist in his fist.' },
      G.spk(HANA, 'KENJI! It talks, Kenji — the altar TALKS — it knows your name, it knows THREE of your names—'),
      G.spk({ name: 'Lord Masakado', color: '#c86bff' }, 'Quiet, key. Your brother and I are speaking.'),
      G.spk({ name: 'Lord Masakado', color: '#c86bff' }, 'Do you know what the sighted children see, ronin? The hour between hours. The crack in the day. My patron lives there, and it is HUNGRY, and it pays for what it eats with years.'),
      G.spk(KENJI, 'You fed it my village.'),
      G.spk({ name: 'Lord Masakado', color: '#c86bff' }, 'I fed it a province. I would feed it the world to stop being old. Your sister is the finest key it has ever tasted — and you… oh. OH. It says you are the LOCK.'),
    ] },
    { battle: { enemies: ['sam_boss5'], bg: 'fortress', boss: true } },
    { shake: 10 }, { flash: true }, { sfx: 'rift' }, { music: 'rift' },
    { say: [
      { text: 'Masakado falls — and does not finish falling. He hangs mid-air, blood frozen in ropes of red glass. The candles burn backwards. Hana screams without sound.' },
      { text: 'The air above the altar TEARS. Purple light pours through the wound in the world, and inside it you see — a city of glass towers? A man in a suit? A gun made of light?' },
      { who: '???', text: 'ONE OF THREE. FOUND. THE LOCK TURNS.', color: '#c86bff' },
      G.spk(KENJI, 'HANA! Take my hand—!'),
      { text: 'Her fingers pass through yours like smoke. The rift swallows the hall, the mountain, the sky. The last thing you hear is your own voice — twice, from two other throats.' },
      { text: '— KENJI\'S STORY REACHES THE RIFT —', color: '#c86bff' },
    ] },
    { give: { item: 'key_shard1' } },
    { fn: () => { const ch = G.ch(); ch.riftReached = true; G.save(); G.scenes.toSelect(); } },
  ]);

  // ================= MAPS =================
  const M = G.registerMap;
  // ---- overworld ----
  M({
    id: 'sam_over', name: 'Ashen Province', world: 'samurai', theme: 'sengoku',
    grade: 'day', amb: 'petals', music: 'samurai', bg: 'rural',
    rows: [
      '####################################',
      '#^^^^^^^^^^^^^^^^^^^^^^^^^^^===^^^^#',
      '#^^^^^,,,,,T,,,T,,,,,,,T,,,,===,,^^#',
      '#^^,,,,,,,,,,,,,,,,,,,,,,,,,,=,,,,^#',
      '#^,,,T,,,,,,T,,,,,,,,T,,,,,,,=,,,,,#',
      '#,,,,,,,,,,,,,,,,,,,,,,,,,,,,=,,T,,#',
      '#,T,,,,,,,,,,,,,,,,,,,,,,,,,,=,,,,,#',
      '#,,,,,,,,,,,,,,,,,,,,,,,,~~,,=,,,,,#',
      '#=,,,,T,,,,,,,,,,,,,,,,,~~~,,=,,,,,#',
      '#=,,,,,,,,,,,,,,,,,,,,,,~~,,,=,,,,,#',
      '#==,,,,,,,,,T,,,,,,,,,,,~~,,,=,,T,,#',
      '#%%==,,,,,,,,,,,,,,,,,,,~~,,==,,,,,#',
      '#%%%=,,,,T,,,====H=H====~~===,,,,,,#',
      '#%%%=======++=====D=====------,,,,,#',
      '#%%%,,,,,,,==,,,,,,,,,,,~~,,,==,,,,#',
      '#,,,,,T,,,,=,,,,,,T,,,,,~~,,,,=,,,,#',
      '#,,,,,,,,,,=,,,,,,,,,,,,~~,,,,====,#',
      '#,T,,,,,,,,=,,,,,,,,,,,,~~,T,,,,,==#',
      '#,,,,,,,,,,=,,,,,T,,,,,,~~,,,,,,,,=#',
      '#,,,,T,,,,,=,,,,,,,,,,,,~~~,,,,T,,=#',
      '#,,,,,,,,,,=,,,,,,,,,,,,,~~~,,,,,,,#',
      '#,,,,,,,,,,=,,T,,,,,,,,,,,~~,,,,,,,#',
      '#,,,,,,,,==,,,,,,,,,,,,,,,,,,,,,,,,#',
      '####################################',
    ],
    spawn: { x: 9, y: 21 },
    enc: { groups: [['sam_bandit'], ['sam_bandit', 'sam_bandit'], ['sam_wolf', 'sam_wolf'], ['sam_wolf', 'sam_bandit'], ['sam_ronin']] },
    exits: [
      { x: 9, y: 22, w: 2, to: 'sam_village', tx: 15, ty: 2 },
      { x: 4, y: 11, h: 3, to: 'sam_forest', tx: 31, ty: 12, cond: ch => ch.chapter >= 1, locked: 'The bamboo road is a wall of green. (Finish Chapter 1 first.)' },
      { x: 18, y: 12, to: 'sam_town', tx: 16, ty: 19, cond: ch => ch.chapter >= 2, locked: 'The town gate is barred to ronin. (Finish Chapter 2 first.)' },
      { x: 34, y: 16, h: 3, to: 'sam_marsh', tx: 2, ty: 12, cond: ch => ch.chapter >= 3, locked: 'The marsh road is flooded with soldiers. (Finish Chapter 3 first.)' },
      { x: 29, y: 1, w: 2, to: 'sam_keep', tx: 14, ty: 19, cond: ch => ch.chapter >= 4, locked: 'The mountain pass is chained shut. (Finish Chapter 4 first.)' },
    ],
    npcs: [
      { id: 'sam_ow_pilgrim', name: 'Pilgrim', x: 14, y: 14, color: '#b8b0d0', dialog: 'sam_forest_hermit',
        spr: { kind: 'humanoid', o: { skin: '#d8b090', hair: '#777', top: '#6a5a42', bottom: '#4a3e2c', hat: 'kasa', hatColor: '#5a4a2a' } } },
    ],
    signs: [{ x: 10, y: 13, text: 'Crossroads: WEST bamboo · NORTH mountain keep · EAST marsh · SOUTH Ashen Village. The shrine heals and remembers.' }],
    chests: [{ id: 1, x: 3, y: 4, items: [{ id: 'sam_h1', n: 2 }], gold: 40 }, { id: 2, x: 33, y: 20, items: [{ id: 'sam_m1', n: 2 }], gold: 60 }],
  });
  // ---- 1: Ashen Village ----
  M({
    id: 'sam_village', name: 'Ashen Village', world: 'samurai', theme: 'sengoku',
    grade: 'ash', amb: 'ash', music: 'samurai', bg: 'ashvillage',
    rows: [
      '##############################',
      '#YY*..Y......====......Y..YYY#',
      '#Y*.*.......=..........Y....Y#',
      '#*.*.Y......=...HH..HH......Y#',
      '#............=..HH..HH.......#',
      '#.Y..........=...d....d......#',
      '#....F.F.F...=...d....d......#',
      '#............====d====d......#',
      '#..HH..HH.......=............#',
      '#..HH..HH.......=..+.........#',
      '#....d..........=............#',
      '#....d..========d========....#',
      '#....d..=.......d.......=====#',
      '#....dddd.......d............#',
      '#......=........d....HH......#',
      '#..Y...=....................Y#',
      '#.YY...=......F.F.F..........#',
      '#YYY...=.....................#',
      '#############==###############',
    ],
    spawn: { x: 15, y: 2 },
    exits: [{ x: 13, y: 18, w: 2, to: 'sam_over', tx: 9, ty: 21 },
      { x: 28, y: 12, to: 'sam_over', tx: 9, ty: 21, cond: ch => ch.chapter >= 1, locked: 'The east gate is blocked by hard men with soft morals.' }],
    npcs: [
      { id: 'sam_elder', name: 'Elder Michi', x: 18, y: 9, color: '#e8d4a8', quest: 'q_sam_wolves', still: true,
        spr: { kind: 'humanoid', o: { skin: '#d8b090', hair: '#ddd', top: '#5a5242', bottom: '#3e382c', beard: true, gear: 'staff', gearColor: '#8a7358' } } },
      { id: 'sam_oyu', name: 'Innkeep Oyu', x: 5, y: 9, color: '#e8a0b8', quest: 'q_sam_sake',
        spr: { kind: 'humanoid', o: { skin: '#eebfa0', hair: '#3a2a20', top: '#7a4a5a', bottom: '#4e3038', longHair: true } } },
      { id: 'sam_shopkeep', name: 'Merchant Fuyu', x: 19, y: 14, color: '#ffd23e', shop: 'sam_shop_v', still: true,
        shopLine: 'Half my stock burned. The other half is priced accordingly. Apologies.',
        spr: { kind: 'humanoid', o: { skin: '#d8a87c', hair: '#222', top: '#6a5a3a', bottom: '#443a24', hat: 'headband', hatColor: '#8a7358' } } },
      { id: 'sam_goro', name: 'Goro', x: 8, y: 4, color: '#ff9a3c', hire: 'goro',
        spr: G.companions ? null : null },
      { id: 'sam_v1', name: 'Widow Take', x: 12, y: 13, color: '#b8b0d0', dialog: 'sam_villager2',
        spr: { kind: 'humanoid', o: { skin: '#e0b090', hair: '#4a4048', top: '#4e4658', bottom: '#322c3a', longHair: true } } },
      { id: 'sam_v2', name: 'Farmer Ryo', x: 24, y: 5, color: '#b8b0d0', dialog: 'sam_villager1',
        spr: { kind: 'humanoid', o: { skin: '#c89068', hair: '#2a2018', top: '#5c6136', bottom: '#3c4124', hat: 'kasa', hatColor: '#6a5a2a' } } },
      { id: 'sam_v3', name: 'Little Ume', x: 17, y: 13, color: '#b8b0d0', dialog: 'sam_kid',
        spr: { kind: 'humanoid', o: { skin: '#eebfa0', hair: '#1a1a22', top: '#a24545', bottom: '#6a3535' } } },
    ],
    chests: [{ id: 1, x: 2, y: 2, items: [{ id: 'sam_a1', n: 1 }] }, { id: 2, x: 27, y: 16, items: [{ id: 'sam_h1', n: 2 }], gold: 50 }],
    triggers: [{ id: 'boss1', x: 26, y: 11, w: 2, h: 3, event: 'sam_cs1', cond: ch => ch.chapter === 0 }],
    signs: [{ x: 14, y: 11, text: 'Ashen Village. Population: fewer.' }],
  });
  // fix goro spr (declared after companions):
  G.maps['sam_village'].npcs.find(n => n.id === 'sam_goro').spr = G.companions['goro'].spr;

  // ---- 2: Whispering Bamboo ----
  M({
    id: 'sam_forest', name: 'Whispering Bamboo', world: 'samurai', theme: 'sengoku',
    grade: 'forest', amb: 'fireflies', music: 'samurai', bg: 'bamboo',
    rows: [
      '##################################',
      '#%%%%%%%%,,,,,%%%%%,,,,,%%%%%%%%%#',
      '#%%,,,,,,,,,,,,,%,,,,,,,,,,,,,%%%#',
      '#%,,,%%,,,%%%,,,,,,%%%,,,%%,,,,%%#',
      '#%,,%%%,,,,,%%,,,,%%,,,,,,,,,,,,%#',
      '#%,,,,,,,,,,,,,,,,,,,,,%%%,,%%,,%#',
      '#%%,,,%%%,,,,,~~~,,,,,,,%,,,,%,,%#',
      '#%%,,,,,,,,,,~~~~~,,,,,,,,,,,,,,%#',
      '#%,,,%,,,,,,,,~~~,,,,,%%,,,%%%,,%#',
      '#%,,%%%,,,,,,,,,,,,,,,,,,,,,,,,,%#',
      '#%,,,%,,,,%%,,,,,,,,%,,,,%,,,,,,%#',
      '#%,,,,,,,%%%%,,,,,,%%%,,%%%,,,===#',
      '#%,,%%,,,,%%,,,,,,,,%,,,,%,,,====#',
      '#%,,,%,,,,,,,,,,+,,,,,,,,,,,,,,,%#',
      '#%,,,,,,%%%,,,,,,,,,,%%,,,,%%,,,%#',
      '#%%,,,,,,,,,,,,,,,,,,,,,,,%%%,,,%#',
      '#%%%,,,%%,,,,%%%,,,,,%,,,,,%,,,%%#',
      '#%,,,,,,,,,,%%,%%,,,,,,,,,,,,,,%%#',
      '#%,,,%,,,,,,,,,,,,,,,%%,,,,%%,,,%#',
      '#%%,,,,,%%,,,,,,,,,,,,,,,,,,,,,%%#',
      '#%%%%,,,,,,,,%%,,,,,%%,,,,,%%%%%%#',
      '##################################',
    ],
    spawn: { x: 31, y: 12 },
    enc: { groups: [['sam_wolf', 'sam_wolf'], ['sam_bandit', 'sam_wolf'], ['sam_kappa'], ['sam_kappa', 'sam_wolf'], ['sam_ronin'], ['sam_ronin', 'sam_bandit']] },
    exits: [{ x: 32, y: 11, w: 1, h: 2, to: 'sam_over', tx: 6, ty: 13 }],
    npcs: [
      { id: 'sam_hermit', name: 'Hermit Baiko', x: 16, y: 14, color: '#b8b0d0', dialog: 'sam_forest_hermit', still: true,
        spr: { kind: 'humanoid', o: { skin: '#d8b090', hair: '#888', top: '#4a5240', bottom: '#323828', hat: 'kasa', hatColor: '#4a4a30', beard: true } } },
      { id: 'sam_kiku', name: 'Kiku', x: 6, y: 17, color: '#c86bff', hire: 'kiku', spr: null },
    ],
    chests: [
      { id: 1, x: 3, y: 2, items: [{ id: 'sam_w2', n: 1 }] },
      { id: 2, x: 30, y: 19, items: [{ id: 'sam_h1', n: 3 }], gold: 70 },
      { id: 3, x: 20, y: 8, items: [{ id: 'sam_x2', n: 1 }] },
    ],
    triggers: [{ id: 'boss2', x: 13, y: 1, w: 7, h: 2, event: 'sam_cs2', cond: ch => ch.chapter === 1 }],
    signs: [{ x: 29, y: 12, text: 'The Whispering Bamboo. Travelers report the grove "holds its breath" near the north clearing.' }],
  });
  G.maps['sam_forest'].npcs.find(n => n.id === 'sam_kiku').spr = G.companions['kiku'].spr;

  // ---- 3: Kurogane Castle Town ----
  M({
    id: 'sam_town', name: 'Kurogane Castle Town', world: 'samurai', theme: 'sengoku',
    grade: 'dusk', amb: 'smog', music: 'samurai', bg: 'castle',
    rows: [
      '##################################',
      '#########HHHHHH###HHHHHH##########',
      '######...HHHHHH...HHHHHH...#######',
      '######......P..===..P......#######',
      '#.....HH.......===.......HH.....##',
      '#.....HH..d....===....d..HH.....##',
      '#..........d...===...d..........##',
      '#...========================....##',
      '#...=......................=....##',
      '#...=..HH..HH....HH..HH....=....##',
      '#...=..HH..HH..d.HH..HH....=....##',
      '#...=....d.....d.......d...=....##',
      '#...=====d=====+=====d======....##',
      '#........d.....d.....d..........##',
      '#....HH.....HH...HH.....HH......##',
      '#....HH.....HH...HH.....HH......##',
      '#.....d......d....d......d......##',
      '#.....d......d....d......d......##',
      '#..........====================.##',
      '#..........=....................##',
      '################=#################',
    ],
    spawn: { x: 16, y: 19 },
    exits: [{ x: 16, y: 20, to: 'sam_over', tx: 18, ty: 13 }],
    npcs: [
      { id: 'sam_smith', name: 'Forge Master Tan', x: 8, y: 5, color: '#ffd23e', shop: 'sam_shop_t', still: true,
        shopLine: 'Castle steel, honest prices. Ask no questions about the bloodstains and I will extend the courtesy.',
        spr: { kind: 'humanoid', o: { skin: '#c88a6a', hair: '#333', top: '#5a3a2a', bottom: '#3a2418', hat: 'headband', hatColor: '#7a3030', beard: true } } },
      { id: 'sam_guard1', name: 'Gate Guard', x: 15, y: 4, color: '#9adcff', dialog: 'sam_town_guard', still: true,
        spr: { kind: 'humanoid', o: { skin: '#d8a87c', hair: '#222', top: '#3a4a6a', bottom: '#2a3448', hat: 'cap', hatColor: '#26324a', gear: 'staff', gearColor: '#8a7358' } } },
      { id: 'sam_gossip', name: 'Tea Auntie', x: 20, y: 13, color: '#e8a0b8', dialog: 'sam_town_gossip',
        spr: { kind: 'humanoid', o: { skin: '#eebfa0', hair: '#55444a', top: '#8a5a6a', bottom: '#5a3a44', longHair: true } } },
      { id: 'sam_sadao', name: 'Sadao', x: 26, y: 15, color: '#9adcff', hire: 'sadao', spr: null },
    ],
    chests: [{ id: 1, x: 2, y: 16, items: [{ id: 'sam_h2', n: 1 }], gold: 90 }, { id: 2, x: 31, y: 4, items: [{ id: 'sam_x1', n: 1 }] }],
    triggers: [{ id: 'boss3', x: 14, y: 1, w: 6, h: 2, event: 'sam_cs3', cond: ch => ch.chapter === 2 }],
    signs: [{ x: 14, y: 12, text: 'Kurogane: iron for the castle, ash for the rest. Castle gate NORTH.' }],
  });
  G.maps['sam_town'].npcs.find(n => n.id === 'sam_sadao').spr = G.companions['sadao'].spr;

  // ---- 4: Red Reed Marsh ----
  M({
    id: 'sam_marsh', name: 'Red Reed Marsh', world: 'samurai', theme: 'sengoku',
    grade: 'blood', amb: 'embers', music: 'samurai', bg: 'marsh',
    rows: [
      '##################################',
      '#YYwwwwYY,,,wwww,,,,wwYY,,,wwwYYY#',
      '#Yww~~www,,,w~~w,,,,www,,,,ww~~wY#',
      '#ww~~~~ww,,ww~~ww,,,,,,,,,ww~~~ww#',
      '#www~~www,,,w~~w,,,Y,,,,,,w~~~www#',
      '#,wwwwww,,,,wwww,,,,,,,,,,ww~ww,,#',
      '#,,,,,,,,,,,,,,,,,,,wwww,,,www,,,#',
      '#,,,Y,,,,,,,,,,,,,,ww~~ww,,,,,,,,#',
      '#,,,,,,,wwww,,,,,,,w~~~~w,,,,,Y,,#',
      '#,,,,,,ww~~ww,,,,,,ww~~ww,,,,,,,,#',
      '#,,,,,,w~~~~w,,,,,,,wwww,,,,,,,,,#',
      '#,,,,,,ww~~ww,,,,,,,,,,,,,,,,,,,,#',
      '#==,,,,,wwww,,,+,,,,,,,,,,,,,,,,,#',
      '#,==,,,,,,,,,,,,,,,,,,,,,,,,Y,,,,#',
      '#,,=,,,Y,,,,,,,,,,,wwww,,,,,,,,,,#',
      '#,,,,,,,,,,,wwYw,,ww~~ww,,,,,,,,,#',
      '#,,Y,,,,,,,ww~~w,,w~~~~w,,,,,,,,,#',
      '#,,,,,,,,,,w~~~w,,ww~~ww,,,,,,Y,,#',
      '#,,,,,,,,,,ww~ww,,,wwww,,,,,,,,,,#',
      '#,Y,,,,,,,,,www,,,,,,,,,,,,,,,,,,#',
      '#,,,,YY,,,,,,,,,,,,,,,,,,YY,,,,,,#',
      '##################################',
    ],
    spawn: { x: 2, y: 12 },
    enc: { groups: [['sam_yurei'], ['sam_yurei', 'sam_yurei'], ['sam_oni'], ['sam_ashigaru', 'sam_ashigaru'], ['sam_oni', 'sam_yurei'], ['sam_redcap']] },
    exits: [{ x: 1, y: 12, to: 'sam_over', tx: 33, ty: 17 }],
    npcs: [
      { id: 'sam_monk', name: 'Monk Junsei', x: 17, y: 13, color: '#e8d4a8', quest: 'q_sam_spirits', still: true,
        spr: { kind: 'humanoid', o: { skin: '#d8b090', hair: '#0000', top: '#7a5a2a', bottom: '#54401e', gear: 'staff', gearColor: '#8a7358' } } },
      { id: 'sam_deserter', name: 'Deserter Bun', x: 27, y: 13, color: '#ffd23e', shop: 'sam_shop_m', dialog: 'sam_marsh_deserter',
        shopLine: 'Everything fell off a wagon. The wagon fell off a war.',
        spr: { kind: 'humanoid', o: { skin: '#d8a87c', hair: '#443', top: '#4a4438', bottom: '#302c24', hat: 'cap', hatColor: '#3a3428' } } },
    ],
    chests: [
      { id: 1, x: 31, y: 2, items: [{ id: 'sam_a3', n: 1 }] },
      { id: 2, x: 3, y: 19, items: [{ id: 'sam_h2', n: 2 }], gold: 120 },
    ],
    triggers: [
      { id: 'ribbon', x: 19, y: 7, w: 3, h: 2, event: 'sam_ribbon', cond: ch => ch.chapter >= 3 && !ch.flags.gotRibbon },
      { id: 'boss4', x: 28, y: 19, w: 5, h: 2, event: 'sam_cs4', cond: ch => ch.chapter === 3 },
    ],
    signs: [{ x: 4, y: 12, text: 'Red Reed Marsh. Ten thousand dead in the last war. The reeds grow red now. Draw your own conclusion.' }],
  });
  G.registerCutscene('sam_ribbon_flag', []); // reserved
  // mark ribbon flag inside cutscene:
  (function () { const orig = G.cutscenes['sam_ribbon']; G.cutscenes['sam_ribbon'] = () => { const s = orig(); s.push({ flag: ['gotRibbon', 1] }); return s; }; })();

  // ---- 5: Mount Onikura Keep ----
  M({
    id: 'sam_keep', name: 'Mount Onikura Keep', world: 'samurai', theme: 'sengoku',
    grade: 'night', amb: 'embers', music: 'boss', bg: 'fortress',
    rows: [
      '##############################',
      '#####......########......#####',
      '####...HH...######...HH...####',
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
      '########,,,,,,==,,,,,,########',
      '##############==##############',
    ],
    spawn: { x: 14, y: 19 },
    enc: { groups: [['sam_redcap'], ['sam_redcap', 'sam_ashigaru'], ['sam_oni', 'sam_redcap'], ['sam_ronin', 'sam_ronin', 'sam_ashigaru']] },
    exits: [{ x: 14, y: 20, w: 2, to: 'sam_over', tx: 29, ty: 2 }],
    npcs: [
      { id: 'sam_prisoner', name: 'Caged Scholar', x: 6, y: 3, color: '#b8b0d0', dialog: 'sam_keep_prisoner', still: true,
        spr: { kind: 'humanoid', o: { skin: '#e0c0a0', hair: '#999', top: '#4a4458', bottom: '#322e3c', beard: true } } },
    ],
    chests: [
      { id: 1, x: 24, y: 3, items: [{ id: 'sam_a5', n: 1 }] },
      { id: 2, x: 7, y: 15, items: [{ id: 'sam_h2', n: 3 }], gold: 200 },
    ],
    triggers: [{ id: 'boss5', x: 12, y: 3, w: 6, h: 1, event: 'sam_cs5', cond: ch => ch.chapter === 4 }],
    signs: [{ x: 13, y: 19, text: 'The keep of Lord Masakado. Turn back. (The sign is written in dried brown ink. It is not ink.)' }],
  });

  // ================= WORLD =================
  G.registerWorld('samurai', {
    name: 'Sengoku Japan · 1573',
    start: { map: 'sam_village', x: 15, y: 2 },
    intro: () => G.cutscenes['sam_intro'](),
    chapters: [
      { goal: 'Ch.1 — Cut down the Bandit Chief at the east gate' },
      { goal: 'Ch.2 — Find the white-haired killer in the Whispering Bamboo' },
      { goal: 'Ch.3 — Reach Captain Iwao at the castle gate of Kurogane' },
      { goal: 'Ch.4 — Search the Red Reed Marsh war camp for Hana' },
      { goal: 'Ch.5 — Storm Mount Onikura. Save her.' },
    ],
  });
})();
