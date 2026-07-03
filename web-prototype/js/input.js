// TRINITY RIFT — keyboard input
'use strict';
G.input = (function () {
  const down = {}, pressed = {};
  const MAP = {
    ArrowUp: 'up', KeyW: 'up',
    ArrowDown: 'down', KeyS: 'down',
    ArrowLeft: 'left', KeyA: 'left',
    ArrowRight: 'right', KeyD: 'right',
    KeyZ: 'confirm', Enter: 'confirm', Space: 'confirm',
    KeyX: 'cancel', Backspace: 'cancel',
    Escape: 'menu',
    KeyM: 'mute', KeyF: 'fx',
    ShiftLeft: 'run', ShiftRight: 'run',
    KeyQ: 'boostdn', KeyE: 'boostup',
  };
  window.addEventListener('keydown', e => {
    const k = MAP[e.code];
    if (!k) return;
    e.preventDefault();
    if (!down[k]) pressed[k] = true;
    down[k] = true;
    if (G.audio && G.audio.unlock) G.audio.unlock();
  });
  window.addEventListener('keyup', e => {
    const k = MAP[e.code];
    if (!k) return;
    down[k] = false;
  });
  window.addEventListener('blur', () => { for (const k in down) down[k] = false; });
  return {
    down,
    hit(k) { return !!pressed[k]; },              // pressed this frame
    take(k) { const v = !!pressed[k]; pressed[k] = false; return v; }, // consume
    endFrame() { for (const k in pressed) pressed[k] = false; },
  };
})();
