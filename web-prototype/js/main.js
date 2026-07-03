// TRINITY RIFT — boot & main loop
'use strict';
(function () {
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;

  G.load(); // restore save if present

  let last = performance.now();
  function frame(now) {
    let dt = (now - last) / 1000;
    last = now;
    if (dt > 0.1) dt = 0.1;
    G.time += dt; G.frame++;

    // global toggles
    if (G.input.take('mute')) { G.muted = !G.muted; G.toast('Music ' + (G.muted ? 'muted' : 'on'), '#b8b0d0'); }
    if (G.input.take('fx')) { G.fx = !G.fx; G.toast('HD-2D effects ' + (G.fx ? 'on' : 'off'), '#b8b0d0'); }

    G.updateTrans(dt);
    if (G.scene && G.scene.update) G.scene.update(dt);

    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, G.W, G.H);
    if (G.scene && G.scene.draw) G.scene.draw(ctx);
    G.drawTrans(ctx);

    G.input.endFrame();
    requestAnimationFrame(frame);
  }

  G.setScene(G.scenes.title);
  requestAnimationFrame(frame);
})();
