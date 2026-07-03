// TRINITY RIFT — dialog boxes, choices, cutscene runner
'use strict';

// A dialog overlay. lines: [{who,text,portrait,color,choices:[{label,then}]}] or strings.
G.Dialog = function (lines, onDone) {
  this.lines = (Array.isArray(lines) ? lines : [lines]).map(l =>
    typeof l === 'string' ? { text: l } : l);
  this.i = 0; this.chars = 0; this.done = onDone;
  this.choice = 0; this.blocking = true;
};
G.Dialog.prototype = {
  cur() { return this.lines[this.i]; },
  update(dt) {
    const line = this.cur();
    if (!line) { this.finish(); return; }
    const full = line.text.length;
    if (this.chars < full) this.chars = Math.min(full, this.chars + dt * 60);
    const typed = this.chars >= full;
    if (line.choices && typed) {
      if (G.input.take('up')) { this.choice = (this.choice + line.choices.length - 1) % line.choices.length; G.audio.sfx('move'); }
      if (G.input.take('down')) { this.choice = (this.choice + 1) % line.choices.length; G.audio.sfx('move'); }
      if (G.input.take('confirm')) {
        G.audio.sfx('confirm');
        const pick = line.choices[this.choice];
        this.finish();
        if (pick.then) pick.then();
        return;
      }
    } else if (G.input.take('confirm') || G.input.take('cancel')) {
      if (!typed) { this.chars = full; return; }
      G.audio.sfx('confirm');
      this.i++; this.chars = 0; this.choice = 0;
      if (this.i >= this.lines.length) this.finish();
    }
  },
  finish() {
    if (G.overlay === this) G.overlay = null;
    if (this.done) { const d = this.done; this.done = null; d(); }
  },
  draw(ctx) {
    const line = this.cur();
    if (!line) return;
    const H = 128, y = G.H - H - 14;
    let x = 20, w = G.W - 40;
    G.panel(ctx, x, y, w, H, { border: line.color || '#8878c8' });
    let tx = x + 22, tw = w - 44;
    if (line.portrait) {
      ctx.save();
      G.panel(ctx, x + 14, y - 34, 92, 92, { border: line.color || '#8878c8', bg: '#0c0a18' });
      ctx.drawImage(line.portrait, x + 20, y - 28, 80, 80);
      ctx.restore();
      tx = x + 122; tw = w - 144;
    }
    if (line.who) {
      ctx.font = 'bold 15px "Courier New",monospace';
      const nw = ctx.measureText(line.who).width + 24;
      G.panel(ctx, tx - 6, y - 16, nw, 26, { border: line.color || '#8878c8', bg: '#161228', r: 6 });
      ctx.fillStyle = line.color || '#cfc4ff'; ctx.textAlign = 'left';
      ctx.fillText(line.who, tx + 6, y + 2);
    }
    ctx.font = '15px "Courier New",monospace'; ctx.textAlign = 'left';
    ctx.fillStyle = '#e8e4f4';
    const shown = line.text.slice(0, Math.floor(this.chars));
    const rows = G.wrapText(ctx, shown, tw);
    rows.slice(0, 4).forEach((r, i) => ctx.fillText(r, tx, y + 34 + i * 21));
    const typed = this.chars >= line.text.length;
    if (typed && !line.choices) {
      ctx.fillStyle = '#8878c8';
      const bob = Math.sin(G.time * 6) * 3;
      ctx.fillText('▼', x + w - 30, y + H - 14 + bob);
    }
    if (typed && line.choices) {
      const cw = 300, cx = G.W - cw - 34, cy = y - line.choices.length * 30 - 18;
      G.panel(ctx, cx, cy, cw, line.choices.length * 30 + 14, { border: '#ffd23e' });
      line.choices.forEach((c, i) => {
        ctx.fillStyle = i === this.choice ? '#ffd23e' : '#b8b0d0';
        ctx.fillText((i === this.choice ? '▶ ' : '  ') + c.label, cx + 16, cy + 26 + i * 30);
      });
    }
  },
};
G.say = function (lines, onDone) {
  const d = new G.Dialog(lines, onDone);
  G.overlay = d;
  return d;
};

// speaker helper: build a line with portrait from a hero key / npc def
G.spk = function (who, text, opts = {}) {
  return Object.assign({ who: who.name || who, text,
    portrait: who.portrait || (who.spr && G.sprites.build(who.spr).portrait) || null,
    color: who.color || opts.color }, opts);
};

// ---------------- cutscene runner ----------------
// steps: {say}|{fn}|{flag}|{give}|{gold}|{battle}|{tp}|{wait}|{shake}|{flash}|{sfx}|{music}|{chapter}|{quest}|{heal}
G.cut = null;
G.runCutscene = function (steps, onDone) {
  G.cut = { steps, i: -1, onDone, waiting: 0, flash: 0, blocking: true };
  G.cutNext();
};
G.cutNext = function () {
  const c = G.cut;
  if (!c) return;
  c.i++;
  if (c.i >= c.steps.length) {
    G.cut = null;
    if (c.onDone) c.onDone();
    return;
  }
  const s = c.steps[c.i];
  const ch = G.ch();
  if (s.say) { G.say(s.say, () => G.cutNext()); return; }
  if (s.wait) { c.waiting = s.wait; return; }
  if (s.flag) { ch.flags[s.flag[0]] = s.flag[1]; G.cutNext(); return; }
  if (s.give) { G.inv.add(ch, s.give.item, s.give.n || 1); G.cutNext(); return; }
  if (s.gold) { ch.gold += s.gold; G.audio.sfx('gold'); G.toast(`+${s.gold} ${G.currency()}`, '#ffd23e'); G.cutNext(); return; }
  if (s.heal) { const st = G.heroStats(G.gs.current); ch.hp = st.hp; ch.mp = st.mp; G.audio.sfx('heal'); G.cutNext(); return; }
  if (s.shake) { G.doShake(s.shake === true ? 8 : s.shake, 0.5); G.cutNext(); return; }
  if (s.flash) { c.flash = 0.5; G.cutNext(); return; }
  if (s.sfx) { G.audio.sfx(s.sfx); G.cutNext(); return; }
  if (s.music) { G.audio.play(s.music); G.cutNext(); return; }
  if (s.chapter !== undefined) {
    ch.chapter = s.chapter;
    const wd = G.worlds[ch.world];
    if (wd && wd.chapters[s.chapter]) G.toast('◆ ' + wd.chapters[s.chapter].goal, '#9adcff');
    G.cutNext(); return;
  }
  if (s.quest) { G.startQuest(s.quest); G.cutNext(); return; }
  if (s.tp) {
    G.fadeTo(() => { G.world.load(s.tp.map, s.tp.x, s.tp.y); G.cutNext(); }, 0.7);
    return;
  }
  if (s.battle) {
    G.startBattle(Object.assign({}, s.battle, {
      onWin: () => {
        G.world.resume();
        if (s.battle.onWin) s.battle.onWin();
        G.cutNext();
      },
      scripted: true,
    }));
    return;
  }
  if (s.fn) { const r = s.fn(() => G.cutNext()); if (r !== 'async') G.cutNext(); return; }
  G.cutNext();
};
G.updateCut = function (dt) {
  const c = G.cut;
  if (!c) return;
  if (c.flash > 0) c.flash -= dt;
  if (c.waiting > 0) {
    c.waiting -= dt;
    if (c.waiting <= 0) G.cutNext();
  }
};
G.drawCutFx = function (ctx) {
  const c = G.cut;
  if (!c) return;
  if (c.flash > 0) {
    ctx.fillStyle = `rgba(255,255,255,${Math.min(1, c.flash * 2)})`;
    ctx.fillRect(0, 0, G.W, G.H);
  }
  // letterbox during cutscenes
  ctx.fillStyle = 'rgba(0,0,0,0.85)';
  ctx.fillRect(0, 0, G.W, 26); ctx.fillRect(0, G.H - 26, G.W, 26);
};

G.currency = function () {
  const w = G.gs.current;
  return w === 'samurai' ? 'mon' : w === 'business' ? '¥k' : w === 'cyber' ? 'eddies' : 'shards';
};
