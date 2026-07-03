// TRINITY RIFT — THE CONVERGENCE: mirror battles, the truth, the divine union, Kuroyami
'use strict';
(function () {
  const KENJI = G.heroDefs.samurai, DAIKI = G.heroDefs.business, VEX = G.heroDefs.cyber, DIVINE = G.heroDefs.divine;
  const KURO = { name: 'KUROYAMI', color: '#ff2d95' };

  // ================= ENEMIES =================
  const E = G.registerEnemy;
  E('rift_wraith', { name: 'Rift Wraith', spr: { kind: 'blob', o: { col: '#5a4a8a', dark: '#352a58', eye: '#c86bff', ghost: true } },
    hp: 240, atk: 34, def: 12, spd: 12, exp: 320, gold: 90, drops: [{ id: 'div_h1', chance: 0.3 }],
    skills: [{ name: 'Unravel', pow: 1.1, type: 'attack', w: 2 }, { name: 'Hour Drain', pow: 0.8, type: 'attack', status: 'atkDn', w: 1 }] });
  E('time_devourer', { name: 'Time Devourer', spr: { kind: 'beast', o: { col: '#3a2a5a', dark: '#221838', eye: '#ff2d95', spikes: true } },
    hp: 320, atk: 40, def: 14, spd: 14, exp: 420, gold: 120, drops: [{ id: 'div_h1', chance: 0.35 }],
    skills: [{ name: 'Chrono Bite', pow: 1.2, type: 'attack', w: 2 }, { name: 'Second Swallow', pow: 1.6, type: 'attack', w: 1 }] });
  E('kuroyami1', { name: 'KUROYAMI, Demon God of the Hour', boss: true, scale: 4,
    spr: { kind: 'demon', o: { col: '#3a1030', dark: '#1a0518', glow: '#ff2d95' } },
    hp: 1700, atk: 42, def: 20, spd: 12, exp: 0, gold: 0,
    skills: [{ name: 'Maw of Minutes', pow: 1.2, type: 'attack', w: 2, sfx: 'crit' }, { name: 'Curse of Hours', pow: 0.9, type: 'aoe', status: 'atkDn', w: 1, sfx: 'explode' }, { name: 'Feast', type: 'heal', w: 1 }],
    barks: { rage: 'I HAVE EATEN CENTURIES. YOU ARE A SNACK WITH OPINIONS.' } });
  E('kuroyami2', { name: 'KUROYAMI UNBOUND', boss: true, scale: 5,
    spr: { kind: 'demon', o: { col: '#180620', dark: '#0a020e', glow: '#c86bff' } },
    hp: 2400, atk: 52, def: 24, spd: 14, exp: 0, gold: 0,
    skills: [{ name: 'Midnight Guillotine', pow: 1.4, type: 'attack', w: 2, sfx: 'crit' }, { name: 'Calendar of Ruin', pow: 1.1, type: 'aoe', w: 2, sfx: 'explode' }, { name: 'Devour Epoch', pow: 1.9, type: 'attack', w: 1 }],
    barks: { rage: 'WHEN I FINISH YOU, I WILL EAT THE MOMENT YOU WERE BORN.' } });

  // ================= helpers =================
  function mkHeroUnit(key) {
    const hd = G.heroDefs[key];
    const s = G.heroStats(key);
    const ch = G.gs.chars[key];
    return {
      name: hd.name, side: 'ally', world: key,
      spr: G.sprites.build(hd.spr), scale: 3,
      maxhp: s.hp, hp: s.hp, maxmp: s.mp, mp: s.mp,
      atk: s.atk, def: s.def, spd: s.spd, crit: s.crit,
      skills: G.combat.heroSkills(key, ch.level),
      atb: 0.6, bp: 1, statuses: {}, color: hd.color,
    };
  }
  function registerEchoes() {
    const mk = (key, id, skills) => {
      const s = G.heroStats(key);
      const hd = G.heroDefs[key];
      G.registerEnemy(id, {
        name: 'Echo of ' + hd.name, boss: true, scale: 4, spr: hd.spr,
        hp: Math.floor(s.hp * 3.2), atk: Math.floor(s.atk * 0.9), def: s.def, spd: s.spd,
        exp: 0, gold: 0, skills,
        barks: { rage: 'STOP. WEARING. MY. FACE.' },
      });
    };
    mk('business', 'echo_daiki', [
      { name: 'Severance', pow: 1.1, type: 'attack', w: 2, sfx: 'gun' },
      { name: 'Hostile Takeover', pow: 0.9, type: 'attack', status: 'atkDn', w: 1 }]);
    mk('cyber', 'echo_vex', [
      { name: 'Burst Fire', pow: 0.9, type: 'attack', w: 2, sfx: 'gun' },
      { name: 'EMP Round', pow: 1, type: 'attack', status: 'stun', w: 1, sfx: 'laser' }]);
  }

  // ================= CUTSCENES =================
  const CS = G.registerCutscene;
  CS('conv_opening', () => [
    { music: 'rift' },
    { say: [
      { text: 'There is a place between the ticks of every clock. A purple country where unfinished moments wash ashore. Three men arrive at the same instant, from three different centuries, through three different wounds in the world.' },
      G.spk(KENJI, 'Hana was HERE. I saw her pulled through the light— you! Suit-wearer! Your city was inside the rift that took her!'),
      G.spk(DAIKI, 'My city? My family froze mid-breath because of THAT one — the neon mercenary! This has cyber-nonsense written all over it!'),
      G.spk(VEX, 'Says the ghost in the gray suit wearing MY face. Both of you are wearing my face. Do you understand how far outside my job description this is?'),
      G.spk(KENJI, 'Your face? Look again, thief. That scar over your eye — I EARNED that scar. My mother\'s killer gave it to me.'),
      G.spk(DAIKI, 'No… I got mine falling down the stairs the day Kurosawa took me. Same eye. Same scar. That\'s— that\'s not possible.'),
      G.spk(VEX, 'Ministry checkpoint, 2081. Same eye. Same scar. …I don\'t like this math.'),
      { text: 'Three shards — vermilion, cobalt, violet — rise from three pockets and begin to HOWL. The suit swings his briefcase first.' },
    ] },
    { battle: { enemies: ['echo_daiki'], bg: 'arena', boss: true, stopAt: 0.45, music: 'boss', customParty: [mkHeroUnit('samurai')] } },
    { say: [
      G.spk(KENJI, 'Yield! Your stance breaks the same way mine does — low on the left, where the old wound aches. I know it because it is MY wound.'),
      G.spk(DAIKI, 'This is insane. Fighting you feels like… like arguing with myself in a mirror. And LOSING.'),
      G.spk(VEX, 'Cute reunion. My turn. The Ministry\'s three-voiced altar sent me here — which makes you two accessories to the worst week of my life.'),
    ] },
    { battle: { enemies: ['echo_vex'], bg: 'arena', boss: true, stopAt: 0.45, music: 'boss', customParty: [mkHeroUnit('business')] } },
    { shake: 10 }, { flash: true }, { sfx: 'rift' },
    { say: [
      { text: 'The third exchange never lands. The sky of the rift-country opens like a lidless eye, and something older than calendars leans down to watch.' },
      G.spk(KURO, 'OH, DON\'T STOP ON MY ACCOUNT. I HAVE WAITED THREE LIFETIMES FOR THIS DINNER THEATER.'),
      G.spk(KURO, 'YOU STILL DON\'T REMEMBER? VERY WELL. A STORY: ONCE, A TRAVELER LEARNED TO WALK BETWEEN THE HOURS. HE FOUND MY LARDER — THE MOMENTS I HARVEST FROM YOUR LITTLE WORLDS — AND HE OBJECTED.'),
      G.spk(KURO, 'HE FOUGHT ME. TOKIHITO, THE TIMELESS ONE. HE NEARLY WON. SO I DID WHAT ANY CHEF DOES WITH TOUGH MEAT: I CUT HIM IN THREE, WIPED THE MEMORY OFF EACH PIECE, AND SET THEM TO MARINATE IN SUFFERING.'),
      G.spk(KURO, 'A SON WHO LOSES A MOTHER. A FATHER WHO LOSES HIS NAME. A GUN WHO LOSES HIS ONLY FRIEND. GRIEF IS THE FINEST SEASONING, AND YOU THREE ARE *DONE*.'),
      G.spk(KENJI, '…The altar in the keep. Three voices.'),
      G.spk(DAIKI, 'The numbers that were always the same numbers.'),
      G.spk(VEX, 'The thing under the Ministry. It called me "splinter".'),
      G.spk(KURO, 'AND NOW THE SPLINTERS COME HOME TO THE WOUND. RESIST IF YOU LIKE. IT AERATES THE MEAT.'),
      { text: 'Three shards ignite. Three scars burn on the same eye. Three hands — calloused by sword, briefcase, and trigger — reach for each other across five hundred years.' },
      G.spk(KENJI, 'For my mother. For Hana.'),
      G.spk(DAIKI, 'For Yumi. For Kenta. For every cooked ledger.'),
      G.spk(VEX, 'For Ren. …For me. For US.'),
      { who: 'Three Voices, One Voice', text: 'I REMEMBER.', color: '#ffe98a' },
    ] },
    { flash: true }, { sfx: 'level' }, { music: 'divine' },
    { fn: () => {
      const conv = G.gs.convergence;
      conv.flags.unified = 1;
      conv.equip = { weapon: 'div_w1', armor: 'div_a1', acc: 'div_x1' };
      G.inv.add(conv, 'div_h1', 4);
      const s = G.heroStats('convergence');
      conv.hp = s.hp; conv.mp = s.mp;
      G.save();
    } },
    { say: [
      { text: 'Where three men stood, one figure remains — robes of unspent seconds, hair like dawn, and a blade that remembers every hand that ever held it.' },
      G.spk(DIVINE, 'Tokihito. That was the name. Kuroyami — you fed on my worlds long enough. The Gate of Ash stands at the north of this nowhere. I am coming through it, and the hour between hours is coming OFF the menu.'),
    ] },
    { chapter: 0 }, { heal: true },
  ]);
  CS('conv_final', () => [
    { music: 'boss' },
    { say: [
      { text: 'Beyond the Gate of Ash: a throne of stopped clocks, a floor of swallowed birthdays, and the Demon God of the Hour Between Hours, unbound and enormous.' },
      G.spk(KURO, 'THE MEAL SEATS ITSELF AT MY TABLE. BOLD. I ATE THE FOURTH CENTURY FOR LESS.'),
      G.spk(DIVINE, 'You cursed me into three griefs, demon. You made a boy bury his mother, a father sign away his name, a gunman kill his friend. Here is what you failed to understand: grief does not tenderize. It TEMPERS.'),
      G.spk(KURO, 'THEN LET US TEST THE BLADE, LITTLE ETERNITY. COURSE ONE.'),
    ] },
    { battle: { enemies: ['kuroyami1'], bg: 'arena', boss: true, music: 'boss' } },
    { shake: 12 }, { flash: true },
    { say: [
      { text: 'The demon god\'s form cracks like an egg of midnight — and what hatches is WORSE. The clocks on the throne begin to run backwards, screaming.' },
      G.spk(KURO, 'FINE DINING IS OVER. NOW I EAT THE TABLE, THE CHAIRS, THE RESTAURANT, AND THE CONCEPT OF LUNCH.'),
    ] },
    { battle: { enemies: ['kuroyami2'], bg: 'arena', boss: true, music: 'boss' } },
    { flash: true }, { sfx: 'rift' }, { music: 'divine' },
    { say: [
      { text: 'The Chrono Edge passes through Kuroyami and out the other side of midnight. For one instant, the demon god looks — relieved.' },
      G.spk(KURO, 'AH. …SO THAT IS WHAT AN ENDING TASTES LIKE. I ALWAYS WONDERED WHY YOU MORTALS HOARD THEM—'),
      { text: 'The hour between hours collapses gently, like a tent after a festival. And the Timeless One stands alone with three lifetimes in his hands and one choice left to make.' },
      G.spk(DIVINE, 'I could stay whole. Walk the centuries. But there is a sister waiting in a burning keep, a family waiting on a farm, and an empty table at a bazaar bar. They don\'t need a god. They need HIM. And him. And him.'),
      G.spk(DIVINE, 'So — one soul, three mornings. Kuroyami split me as a punishment. I return as a promise.'),
      { text: 'VERMILION: The rift in the great hall closes from the inside. Masakado finishes falling and does not get up. Kenji catches Hana\'s hand — solid, warm, real — and for the first time since the fire, the Arakawa siblings walk home. There is much to rebuild. They have time.' },
      { text: 'COBALT: The crane finishes its swing. The sirens finish their note. Kurosawa is arrested holding a ledger with his own name on every page. Three weeks later, in Chiba, an accountant takes out the trash while his son laughs at him — and it is the finest promotion he ever received.' },
      { text: 'VIOLET: Ren\'s truth loops on ten million screens until even the arcology stops smiling on command. Directive Zero dies in an empty senate chamber. And in the Rust Dunes, a free man with no tracker in his neck pours whisky into the sand — one glass, every year, forever.' },
      { text: 'Somewhere between the ticks of every clock, there is a quiet purple country where nothing is ever eaten again.' },
      { text: '— THE THREADS ARE ONE. THANK YOU FOR PLAYING. —', color: '#ffe98a' },
    ] },
    { fn: () => {
      G.gs.convergence.done = true;
      G.save();
      G.scenes.credits([
        '#TRINITY RIFT',
        'Three Lives. One Soul. Zero Time.',
        '',
        '#THE THREE',
        'Kenji Arakawa — the Broken Blade',
        'Mori Daiki — the Caged Suit',
        'Vex Kurono — the Unchained Gun',
        'Tokihito — the Timeless One',
        '',
        '#THE FALLEN',
        'Kuroyami, Demon God of the Hour Between Hours',
        'Lord Masakado · Oyabun Kurosawa · Director Sato',
        'Gorobei the Blade, who did not beg',
        '',
        '#THE COMPANIONS',
        'Goro · Kiku · Sadao',
        'Ryo · Keiko · Big Sho',
        'Bit · Dice · Nyx',
        '',
        '#IN MEMORY',
        'Senator Ren Osei, who voted no',
        'The mother of the Arakawa children',
        '',
        '#A GAME BUILT IN THE HD-2D SPIRIT',
        'pixel souls · painted light · tilted shift',
        '',
        'Every sprite, tile, note and word: procedural,',
        'no assets were harmed in the making',
        '',
        '#THANK YOU FOR PLAYING',
        'Z — return to title',
      ]);
      return 'async';
    } },
  ]);

  // ================= MAP: the Rift Nexus =================
  G.registerMap({
    id: 'conv_nexus', name: 'The Hour Between Hours', world: 'convergence', theme: 'rift',
    grade: 'rift', amb: 'motes', music: 'rift', bg: 'rift',
    rows: [
      '##############################',
      '#____________====____________#',
      '#___________=,,,,=___________#',
      '#______x,,,,,,,,,,,,,x_______#',
      '#____,,,,,,,,,,,,,,,,,,,_____#',
      '#___,,,,x,,,,,,,,,,,x,,,,____#',
      '#__,,,,,,,,,,,,,,,,,,,,,,,___#',
      '#__,,,x,,,,,P,,,,P,,,,,x,,___#',
      '#__,,,,,,,,,,,,,,,,,,,,,,,___#',
      '#___,,,,,,,,,,,,,,,,,,,,,____#',
      '#____,,,,,,,,,+,,,,,,,,,_____#',
      '#____,,,,,,,,,,,,,,,,,,,_____#',
      '#___,,,,x,,,,,,,,,,x,,,,,____#',
      '#__,,,,,,,,,,,,,,,,,,,,,,____#',
      '#__,,,,,P,,,,,,,,,,,P,,,,,___#',
      '#___,,,,,,,,,,,,,,,,,,,,,____#',
      '#____x,,,,,,,,,,,,,,,,x______#',
      '#_____,,,,,,,,,,,,,,,,_______#',
      '#______,,,,,,==,,,,,,________#',
      '#____________==______________#',
      '##############################',
    ],
    spawn: { x: 14, y: 18 },
    enc: { groups: [['rift_wraith'], ['rift_wraith', 'rift_wraith'], ['time_devourer'], ['time_devourer', 'rift_wraith']] },
    exits: [],
    npcs: [
      { id: 'conv_moment', name: 'A Stray Moment', x: 6, y: 8, color: '#c86bff', still: true, dialog: 'conv_moment',
        spr: { kind: 'blob', o: { col: '#4a3a6a', dark: '#2c2244', eye: '#ffe98a', ghost: true } } },
      { id: 'conv_moment2', name: 'An Unspent Sunday', x: 22, y: 12, color: '#c86bff', still: true, dialog: 'conv_moment2',
        spr: { kind: 'blob', o: { col: '#3a4a6a', dark: '#223044', eye: '#9adcff', ghost: true } } },
    ],
    chests: [
      { id: 1, x: 6, y: 4, items: [{ id: 'div_h1', n: 2 }] },
      { id: 2, x: 24, y: 5, items: [{ id: 'div_h1', n: 2 }], gold: 300 },
    ],
    triggers: [{ id: 'final', x: 13, y: 1, w: 4, h: 2, event: 'conv_final', cond: ch => !!ch.flags.unified, once: false }],
    signs: [{ x: 13, y: 10, text: 'The shrine hums with borrowed time. North: the Gate of Ash. It knows you are coming. It has always known.' }],
  });
  G.registerDialog('conv_moment', () => ['I am somebody\'s almost-kiss from 1857. The demon keeps us in jars. …You smell like an ENDING. How wonderful. We have waited so long for an ending.']);
  G.registerDialog('conv_moment2', () => ['I was going to be a nap in a hammock, June 2044. Beat the demon god, would you? Some of us would very much like to HAPPEN.']);

  G.registerWorld('convergence', {
    name: 'Outside Time',
    start: { map: 'conv_nexus', x: 14, y: 18 },
    chapters: [
      { goal: 'Pass the Gate of Ash. End Kuroyami.' },
    ],
  });

  // ================= entry point =================
  G.startConvergence = function () {
    G.gs.current = 'convergence';
    const conv = G.gs.convergence;
    if (!conv.init) {
      const keep = { unlocked: conv.unlocked, phase: conv.phase, done: conv.done };
      Object.assign(conv, G.newCharState('convergence'), keep, { init: true, started: true });
      conv.level = 1; conv.gold = 333;
      const s = G.heroStats('convergence');
      conv.hp = s.hp; conv.mp = s.mp;
    }
    registerEchoes();
    G.world.load('conv_nexus', 14, 18);
    if (!conv.flags.unified) G.runCutscene(G.cutscenes['conv_opening']());
  };
})();
