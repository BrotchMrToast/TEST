// TRINITY RIFT — procedural WebAudio music + sfx
'use strict';
G.audio = (function () {
  let ac = null, master = null, musicGain = null, sfxGain = null;
  let cur = null, nextNote = 0, step = 0, seqTimer = null, curName = null;
  let rng = G.mulberry(7);

  function unlock() {
    if (ac) { if (ac.state === 'suspended') ac.resume(); return; }
    try {
      ac = new (window.AudioContext || window.webkitAudioContext)();
      master = ac.createGain(); master.gain.value = 0.55; master.connect(ac.destination);
      musicGain = ac.createGain(); musicGain.gain.value = 0.5; musicGain.connect(master);
      sfxGain = ac.createGain(); sfxGain.gain.value = 0.8; sfxGain.connect(master);
      if (curName) play(curName, true);
      seqTimer = setInterval(schedule, 40);
    } catch (e) { ac = null; }
  }

  const THEMES = {
    samurai: { bpm: 76, root: 57, scale: [0, 2, 3, 7, 8, 12, 14, 15], bass: 'triangle', lead: 'triangle', perc: 'taiko', density: 0.5, dark: 0.5 },
    business:{ bpm: 104, root: 60, scale: [0, 2, 4, 7, 9, 11, 12, 14], bass: 'sine', lead: 'square', perc: 'kit', density: 0.65, dark: 0.15 },
    cyber:   { bpm: 122, root: 45, scale: [0, 3, 5, 7, 10, 12, 15, 17], bass: 'sawtooth', lead: 'sawtooth', perc: 'kit', density: 0.8, dark: 0.6 },
    battle:  { bpm: 140, root: 50, scale: [0, 2, 3, 5, 7, 8, 11, 12], bass: 'sawtooth', lead: 'square', perc: 'kit', density: 0.9, dark: 0.7 },
    boss:    { bpm: 150, root: 43, scale: [0, 1, 4, 5, 7, 8, 11, 12], bass: 'sawtooth', lead: 'sawtooth', perc: 'kit', density: 1, dark: 0.9 },
    rift:    { bpm: 60, root: 49, scale: [0, 1, 5, 6, 10, 12, 13], bass: 'sine', lead: 'sine', perc: 'none', density: 0.3, dark: 1 },
    divine:  { bpm: 96, root: 62, scale: [0, 2, 4, 5, 7, 9, 11, 12], bass: 'triangle', lead: 'triangle', perc: 'taiko', density: 0.6, dark: 0 },
    title:   { bpm: 66, root: 52, scale: [0, 3, 5, 7, 10, 12, 15], bass: 'sine', lead: 'triangle', perc: 'none', density: 0.35, dark: 0.7 },
  };

  const n2f = n => 440 * Math.pow(2, (n - 69) / 12);

  function env(g, t, a, d, peak) {
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + a);
    g.gain.exponentialRampToValueAtTime(0.0001, t + a + d);
  }
  function tone(dest, wave, freq, t, a, d, peak, bend) {
    const o = ac.createOscillator(), g = ac.createGain();
    o.type = wave; o.frequency.setValueAtTime(freq, t);
    if (bend) o.frequency.exponentialRampToValueAtTime(Math.max(20, freq * bend), t + a + d);
    env(g, t, a, d, peak);
    o.connect(g); g.connect(dest);
    o.start(t); o.stop(t + a + d + 0.05);
  }
  function noise(dest, t, d, peak, hp) {
    const len = Math.max(1, Math.floor(ac.sampleRate * d));
    const buf = ac.createBuffer(1, len, ac.sampleRate);
    const ch = buf.getChannelData(0);
    for (let i = 0; i < len; i++) ch[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = ac.createBufferSource(); src.buffer = buf;
    const g = ac.createGain(); g.gain.setValueAtTime(peak, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + d);
    let node = src;
    if (hp) { const f = ac.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = hp; src.connect(f); node = f; }
    node.connect(g); g.connect(dest);
    src.start(t);
  }

  function schedule() {
    if (!ac || !cur || G.muted) return;
    const spb = 60 / cur.bpm / 2; // 8th notes
    while (nextNote < ac.currentTime + 0.2) {
      const t = nextNote, s = step;
      const th = cur, sc = th.scale, root = th.root;
      const bar = Math.floor(s / 8) % 4;
      // bass on beats
      if (s % 4 === 0) {
        const deg = [0, 0, 3, 4][bar] % sc.length;
        tone(musicGain, th.bass, n2f(root - 12 + sc[deg]), t, 0.01, spb * 3.2, 0.16, 0.995);
      }
      // lead melody, seeded wander
      if (rng() < th.density && s % 2 === 0) {
        const deg = Math.floor(rng() * sc.length);
        const oct = rng() < 0.25 ? 12 : 0;
        tone(musicGain, th.lead, n2f(root + sc[deg] + oct), t, 0.015, spb * (rng() < 0.3 ? 2.4 : 1.2), 0.07, th.dark > 0.6 ? 0.99 : 1);
        if (th.dark < 0.3 && rng() < 0.35) // brighter worlds get harmony
          tone(musicGain, th.lead, n2f(root + sc[deg] + 7), t + spb * 0.5, 0.015, spb, 0.04, 1);
      }
      // percussion
      if (th.perc === 'kit') {
        if (s % 8 === 0) tone(musicGain, 'sine', 110, t, 0.005, 0.1, 0.3, 0.3); // kick
        if (s % 8 === 4) noise(musicGain, t, 0.08, 0.12, 2000);                // snare
        if (s % 2 === 1 && rng() < 0.7) noise(musicGain, t, 0.03, 0.04, 6000); // hat
      } else if (th.perc === 'taiko') {
        if (s % 8 === 0 || (s % 16 === 6)) tone(musicGain, 'sine', 80, t, 0.004, 0.22, 0.32, 0.4);
        if (s % 16 === 12) noise(musicGain, t, 0.1, 0.06, 1200);
      }
      nextNote += spb; step++;
    }
  }

  function play(name, force) {
    if (name === curName && !force) return;
    curName = name;
    cur = THEMES[name] || THEMES.title;
    rng = G.mulberry(G.hash(name));
    if (ac) { nextNote = ac.currentTime + 0.05; step = 0; }
  }

  // ---------- sfx ----------
  function sfx(kind) {
    if (!ac || G.muted) return;
    const t = ac.currentTime;
    switch (kind) {
      case 'move': tone(sfxGain, 'square', 880, t, 0.005, 0.04, 0.05, 1); break;
      case 'confirm': tone(sfxGain, 'square', 660, t, 0.005, 0.06, 0.08, 1.4); break;
      case 'cancel': tone(sfxGain, 'square', 330, t, 0.005, 0.08, 0.08, 0.7); break;
      case 'slash': noise(sfxGain, t, 0.12, 0.25, 2500); tone(sfxGain, 'sawtooth', 200, t, 0.005, 0.1, 0.1, 0.4); break;
      case 'gun': noise(sfxGain, t, 0.09, 0.35, 900); tone(sfxGain, 'square', 140, t, 0.003, 0.07, 0.2, 0.5); break;
      case 'laser': tone(sfxGain, 'sawtooth', 1400, t, 0.01, 0.18, 0.15, 0.15); break;
      case 'hit': noise(sfxGain, t, 0.08, 0.2, 600); tone(sfxGain, 'sine', 90, t, 0.004, 0.12, 0.25, 0.6); break;
      case 'crit': noise(sfxGain, t, 0.16, 0.3, 400); tone(sfxGain, 'sine', 60, t, 0.004, 0.2, 0.35, 0.5); break;
      case 'heal': tone(sfxGain, 'sine', 520, t, 0.01, 0.2, 0.1, 1.5); tone(sfxGain, 'sine', 780, t + 0.09, 0.01, 0.25, 0.08, 1.3); break;
      case 'chest': tone(sfxGain, 'square', 520, t, 0.01, 0.08, 0.09, 1); tone(sfxGain, 'square', 660, t + 0.09, 0.01, 0.08, 0.09, 1); tone(sfxGain, 'square', 880, t + 0.18, 0.01, 0.16, 0.1, 1); break;
      case 'gold': tone(sfxGain, 'triangle', 987, t, 0.005, 0.07, 0.1, 1); tone(sfxGain, 'triangle', 1318, t + 0.06, 0.005, 0.1, 0.08, 1); break;
      case 'level': [523, 659, 784, 1046].forEach((f, i) => tone(sfxGain, 'square', f, t + i * 0.1, 0.01, 0.18, 0.09, 1)); break;
      case 'die': tone(sfxGain, 'sawtooth', 300, t, 0.01, 0.5, 0.15, 0.2); break;
      case 'boost': tone(sfxGain, 'sawtooth', 220, t, 0.01, 0.15, 0.12, 2.2); break;
      case 'rift': tone(sfxGain, 'sine', 100, t, 0.05, 1.2, 0.2, 4); noise(sfxGain, t + 0.2, 0.8, 0.1, 300); break;
      case 'explode': noise(sfxGain, t, 0.4, 0.4, 200); tone(sfxGain, 'sine', 55, t, 0.005, 0.35, 0.4, 0.4); break;
      case 'step': noise(sfxGain, t, 0.03, 0.02, 900); break;
    }
  }

  return { unlock, play, sfx, get ctx() { return ac; } };
})();
