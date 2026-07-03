// TRINITY RIFT — title, character select, credits
'use strict';
G.scenes = (function () {

  // ---------------- TITLE ----------------
  const title = {
    id: 'title', t: 0, eraseArm: 0,
    enter() { G.audio.play('title'); this.t = 0; },
    update(dt) {
      this.t += dt; this.eraseArm = Math.max(0, this.eraseArm - dt);
      if (G.input.take('confirm')) { G.audio.sfx('confirm'); G.setScene(select); }
      if (G.input.take('cancel')) {
        if (this.eraseArm > 0) { G.wipeSave(); G.gs = G.newGameState(); G.toast('Save erased.', '#ff8080'); this.eraseArm = 0; }
        else if (localStorage.getItem(G.SAVE_KEY)) { this.eraseArm = 3; }
      }
      G.updateToasts(dt);
    },
    draw(ctx) {
      const t = this.t;
      // rift sky
      const g = ctx.createLinearGradient(0, 0, 0, G.H);
      g.addColorStop(0, '#0a0616'); g.addColorStop(0.6, '#1c1034'); g.addColorStop(1, '#2a1048');
      ctx.fillStyle = g; ctx.fillRect(0, 0, G.W, G.H);
      // stars
      const rng = G.mulberry(9);
      for (let i = 0; i < 120; i++) {
        const x = rng() * G.W, y = rng() * G.H * 0.7;
        ctx.globalAlpha = 0.3 + Math.sin(t * 2 + i) * 0.25;
        ctx.fillStyle = i % 9 === 0 ? '#c86bff' : '#cfd4ff';
        ctx.fillRect(x, y, 2, 2);
      }
      ctx.globalAlpha = 1;
      // the rift
      ctx.save();
      ctx.translate(G.W / 2, 210);
      for (let i = 0; i < 3; i++) {
        ctx.strokeStyle = ['#c86bff', '#ff2d95', '#00e5c9'][i];
        ctx.lineWidth = 3 - i * 0.7;
        ctx.globalAlpha = 0.5 + Math.sin(t * 1.8 + i * 2) * 0.3;
        ctx.beginPath();
        ctx.moveTo(-160 - i * 22, 40);
        ctx.quadraticCurveTo(-40, -70 - Math.sin(t + i) * 20, 30 + i * 12, -10);
        ctx.quadraticCurveTo(90, 26, 170 + i * 20, -34);
        ctx.stroke();
      }
      ctx.restore();
      ctx.globalAlpha = 1;
      // three silhouettes
      const heroes = ['samurai', 'business', 'cyber'];
      heroes.forEach((h, i) => {
        const spr = G.sprites.build(G.heroDefs[h].spr);
        const img = spr.down[Math.floor(t * 2) % 2 === 0 ? 0 : 1];
        const x = G.W / 2 + (i - 1) * 150 - 32, y = 300 + Math.sin(t * 1.5 + i * 2.1) * 6;
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(img, x, y, 64, 96);
      });
      // logo
      ctx.textAlign = 'center';
      ctx.font = 'bold 64px "Courier New",monospace';
      ctx.fillStyle = '#000'; ctx.fillText('TRINITY RIFT', G.W / 2 + 3, 143);
      const lg = ctx.createLinearGradient(0, 80, 0, 150);
      lg.addColorStop(0, '#ffe98a'); lg.addColorStop(0.5, '#ff9a3c'); lg.addColorStop(1, '#c86bff');
      ctx.fillStyle = lg; ctx.fillText('TRINITY RIFT', G.W / 2, 140);
      ctx.font = '16px "Courier New",monospace'; ctx.fillStyle = '#b8b0d0';
      ctx.fillText('Three Lives. One Soul. Zero Time.', G.W / 2, 172);
      if (Math.floor(t * 1.6) % 2 === 0) {
        ctx.font = 'bold 18px "Courier New",monospace'; ctx.fillStyle = '#f0ecff';
        ctx.fillText('— PRESS  Z —', G.W / 2, 470);
      }
      ctx.font = '12px "Courier New",monospace'; ctx.fillStyle = '#5a5470';
      ctx.fillText(localStorage.getItem(G.SAVE_KEY)
        ? (this.eraseArm > 0 ? 'PRESS X AGAIN TO ERASE SAVE' : 'save data found — X twice to erase')
        : 'a 2.5D tale of vengeance, debt, and neon', G.W / 2, 512);
      G.drawToasts(ctx);
    },
  };

  // ---------------- CHARACTER SELECT ----------------
  const select = {
    id: 'select', idx: 0, t: 0,
    enter() {
      this.t = 0;
      G.audio.play('title');
      // unlock convergence when all three reached the rift
      const cs = G.gs.chars;
      if (cs.samurai.riftReached && cs.business.riftReached && cs.cyber.riftReached && !G.gs.convergence.unlocked) {
        G.gs.convergence.unlocked = true;
        G.save();
      }
    },
    panels() {
      const p = [
        { key: 'samurai', bg: 'ashvillage', setting: 'Sengoku Japan — 1573', blurb: 'Avenge your mother. Find your sister. Drown the warlord in his own war.' },
        { key: 'business', bg: 'street', setting: 'Tokyo — Present Day', blurb: 'The Kurosawa-gumi owns your debt, your desk, your life. Smile. Collect. Wait.' },
        { key: 'cyber', bg: 'neon', setting: 'Neo-Shizuoka — 2087', blurb: 'One last job went wrong. Now the Ministry hunts you for killing your only friend.' },
      ];
      if (G.gs.convergence.unlocked) p.push({ key: 'convergence', bg: 'rift', setting: 'Outside Time', blurb: 'The rifts scream in three voices. It is time to answer.' });
      return p;
    },
    update(dt) {
      this.t += dt;
      G.updateToasts(dt);
      const panels = this.panels();
      if (G.input.take('left')) { this.idx = (this.idx + panels.length - 1) % panels.length; G.audio.sfx('move'); }
      if (G.input.take('right')) { this.idx = (this.idx + 1) % panels.length; G.audio.sfx('move'); }
      if (G.input.take('cancel')) { G.audio.sfx('cancel'); G.setScene(title); }
      if (G.input.take('confirm')) {
        G.audio.sfx('confirm');
        const p = panels[this.idx];
        if (p.key === 'convergence') {
          if (!G.gs.convergence.done) { G.fadeTo(() => G.startConvergence(), 1); }
          else G.toast('The story is complete. (Erase save on title for a fresh start.)', '#ffe98a');
        } else {
          const ch = G.gs.chars[p.key];
          if (ch.riftReached) { G.toast('This life has reached the rift. Play the others!', '#c86bff'); return; }
          G.fadeTo(() => G.world.enterWorld(p.key), 1);
        }
      }
    },
    draw(ctx) {
      ctx.fillStyle = '#07060c'; ctx.fillRect(0, 0, G.W, G.H);
      const panels = this.panels();
      const n = panels.length;
      const pw = Math.min(280, (G.W - 60) / n - 16);
      const totalW = n * (pw + 16);
      panels.forEach((p, i) => {
        const sel = i === this.idx;
        const x = G.W / 2 - totalW / 2 + i * (pw + 16) + 8;
        const y = sel ? 74 : 90, h = 360;
        // backdrop strip
        ctx.save();
        G.rounded(ctx, x, y, pw, h, 10); ctx.clip();
        ctx.drawImage(G.tiles.battleBG(p.bg), x - 200, y - 40, 960 * 0.75, 540 * 0.75);
        ctx.fillStyle = sel ? 'rgba(6,4,14,0.35)' : 'rgba(6,4,14,0.66)';
        ctx.fillRect(x, y, pw, h);
        ctx.restore();
        const isConv = p.key === 'convergence';
        const hd = G.heroDefs[isConv ? 'divine' : p.key];
        const ch = isConv ? null : G.gs.chars[p.key];
        G.rounded(ctx, x, y, pw, h, 10);
        ctx.strokeStyle = sel ? '#ffe98a' : (hd.color || '#3a3454');
        ctx.lineWidth = sel ? 3 : 1.5;
        ctx.stroke();
        // hero sprite
        const spr = G.sprites.build(hd.spr);
        const img = spr.down[sel ? (Math.floor(this.t * 3) % 2 + 1) : 0];
        const scale = sel ? 2.4 : 2;
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(img, x + pw / 2 - 16 * scale, y + 56, 32 * scale, 48 * scale);
        ctx.textAlign = 'center';
        ctx.font = 'bold 20px "Courier New",monospace';
        ctx.fillStyle = hd.color;
        ctx.fillText(isConv ? '???' : hd.name, x + pw / 2, y + 36);
        ctx.font = '12px "Courier New",monospace'; ctx.fillStyle = '#b8b0d0';
        ctx.fillText(isConv ? 'THE CONVERGENCE' : hd.title, x + pw / 2, y + 54);
        ctx.fillStyle = '#8a82a8';
        ctx.fillText(p.setting, x + pw / 2, y + 210);
        ctx.fillStyle = '#cfc8e8'; ctx.font = '12px "Courier New",monospace';
        G.wrapText(ctx, p.blurb, pw - 30).forEach((r, j) => ctx.fillText(r, x + pw / 2, y + 236 + j * 17));
        // progress
        ctx.font = 'bold 13px "Courier New",monospace';
        if (isConv) {
          ctx.fillStyle = '#c86bff';
          ctx.fillText(G.gs.convergence.done ? '— COMPLETE —' : (Math.floor(this.t * 2) % 2 ? '◆ THE RIFT CALLS ◆' : '◇ THE RIFT CALLS ◇'), x + pw / 2, y + h - 20);
        } else if (ch.riftReached) {
          ctx.fillStyle = '#c86bff'; ctx.fillText('RIFT REACHED ◆', x + pw / 2, y + h - 20);
        } else if (ch.started) {
          ctx.fillStyle = '#7dffa0'; ctx.fillText(`Chapter ${Math.min(ch.chapter + 1, 5)}/5 — Lv ${ch.level}`, x + pw / 2, y + h - 20);
        } else {
          ctx.fillStyle = '#8a82a8'; ctx.fillText('NEW STORY', x + pw / 2, y + h - 20);
        }
      });
      ctx.textAlign = 'center';
      ctx.font = 'bold 22px "Courier New",monospace'; ctx.fillStyle = '#f0ecff';
      ctx.fillText('CHOOSE A LIFE', G.W / 2, 46);
      ctx.font = '13px "Courier New",monospace'; ctx.fillStyle = '#5a5470';
      const done = ['samurai', 'business', 'cyber'].filter(k => G.gs.chars[k].riftReached).length;
      ctx.fillText(G.gs.convergence.unlocked
        ? 'the three threads are cut loose — walk into the light between them'
        : `play each life to its rift — ${done}/3 threads complete`, G.W / 2, 486);
      G.drawTrans(ctx);
      G.drawToasts(ctx);
    },
  };

  // ---------------- CREDITS / ENDING ----------------
  function credits(lines, after) {
    const sc = {
      id: 'credits', t: 0,
      enter() { G.audio.play('divine'); },
      update(dt) {
        this.t += dt;
        if (this.t > 4 && G.input.take('confirm')) { G.setScene(title); }
        if (this.t > lines.length * 1.6 + 6) G.setScene(title);
      },
      draw(ctx) {
        ctx.fillStyle = '#06040c'; ctx.fillRect(0, 0, G.W, G.H);
        const rng = G.mulberry(4);
        for (let i = 0; i < 90; i++) {
          ctx.globalAlpha = 0.25 + Math.sin(this.t + i) * 0.2;
          ctx.fillStyle = '#cfd4ff';
          ctx.fillRect(rng() * G.W, rng() * G.H, 2, 2);
        }
        ctx.globalAlpha = 1; ctx.textAlign = 'center';
        const scroll = this.t * 34;
        lines.forEach((l, i) => {
          const y = G.H + 40 + i * 44 - scroll;
          if (y < -40 || y > G.H + 40) return;
          ctx.font = l.startsWith('#') ? 'bold 26px "Courier New",monospace' : '16px "Courier New",monospace';
          ctx.fillStyle = l.startsWith('#') ? '#ffe98a' : '#cfc8e8';
          ctx.fillText(l.replace(/^#/, ''), G.W / 2, y);
        });
        ctx.font = '12px "Courier New",monospace'; ctx.fillStyle = '#5a5470';
        if (this.t > 4) ctx.fillText('Z — return to title', G.W / 2, G.H - 16);
      },
    };
    G.setScene(sc);
  }

  function toSelect() { G.fadeTo(() => G.setScene(select), 0.8); }

  return { title, select, credits, toSelect };
})();
