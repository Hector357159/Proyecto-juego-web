/* ============================================================
   main.js — arranque, bucle, escalado e input
   ============================================================ */
(function () {
  'use strict';

  var canvas = document.getElementById('game');
  var ctx = canvas.getContext('2d');
  var frameEl = document.getElementById('frame');
  var stageEl = document.getElementById('stage');
  var last = performance.now();
  var unlocked = false;

  /* ---------- escalado nítido ---------- */

  function resize() {
    var vw = window.innerWidth;
    var vh = window.innerHeight;
    var padX = vw < 420 ? 8 : 24;
    var padY = 16;
    var s = Math.min((vw - padX * 2) / 320, (vh - padY * 2) / 480);
    s = Math.max(0.4, Math.min(4, s));
    /* pasos de 0.05 para mantener el texto legible */
    s = Math.round(s * 20) / 20;
    stageEl.style.transform = 'scale(' + s + ')';
    frameEl.style.width = Math.round(320 * s) + 'px';
    frameEl.style.height = Math.round(480 * s) + 'px';
    document.documentElement.style.setProperty('--scale', s);
  }

  /* ---------- audio ---------- */

  function unlockAudio() {
    if (unlocked) return;
    unlocked = true;
    Sound.init();
    var o = Store.getOptions();
    Sound.setSfx(o.sfx);
    Sound.setMusic(o.music);
  }

  function toggleMute() {
    unlockAudio();
    var o = Store.getOptions();
    var silence = o.sfx || o.music;
    Store.setOption('sfx', !silence);
    Store.setOption('music', !silence);
    Sound.setSfx(!silence);
    Sound.setMusic(!silence);
    UI.refreshOptions();
    UI.toast(silence ? 'SILENCIO: SÍ' : 'SONIDO: SÍ');
    if (!silence) Sound.sfx('select');
  }

  /* ---------- entrada ---------- */

  function onPointerDown(e) {
    unlockAudio();
    if (e.cancelable) e.preventDefault();
    Game.tap();
  }

  function isButtonFocused() {
    var a = document.activeElement;
    return a && (a.tagName === 'BUTTON' || a.tagName === 'A' || a.tagName === 'INPUT');
  }

  function onKeyDown(e) {
    var k = e.code;
    unlockAudio();

    if (k === 'Space' || k === 'ArrowUp' || k === 'KeyW') {
      if (isButtonFocused()) return;
      e.preventDefault();
      var st = Game.getState();
      if (st === 'menu') {
        if (UI.currentScreen() === 'menu') Game.startRun();
      } else if (st === 'paused') {
        Game.resume();
      } else {
        Game.tap();
      }
      return;
    }

    if (k === 'Escape' || k === 'KeyP') {
      var state = Game.getState();
      if (state === 'play') {
        Game.pause();
      } else if (state === 'paused') {
        Game.resume();
      } else if (state === 'menu' && UI.currentScreen() !== 'menu') {
        UI.open('menu');
        if (Sound.ready()) Sound.sfx('back');
      }
      return;
    }

    if (k === 'KeyM') {
      toggleMute();
      return;
    }

    if (k === 'Enter') {
      if (isButtonFocused()) return;
      var st2 = Game.getState();
      if (st2 === 'menu' && UI.currentScreen() === 'menu') Game.startRun();
      else if (st2 === 'paused') Game.resume();
      else if (st2 === 'over' && Game.tap) Game.tap();
    }
  }

  /* ---------- bucle ---------- */

  function loop(now) {
    var dt = (now - last) / 1000;
    last = now;
    if (!isFinite(dt) || dt < 0) dt = 0;
    if (dt > 0.05) dt = 0.05;

    Game.update(dt);

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, 320, 480);

    var shake = Game.getShake();
    if (shake > 0.01) {
      var mag = shake * 7;
      ctx.save();
      ctx.translate(
        Math.round((Math.random() * 2 - 1) * mag),
        Math.round((Math.random() * 2 - 1) * mag)
      );
      Game.draw(ctx);
      ctx.restore();
    } else {
      Game.draw(ctx);
    }

    requestAnimationFrame(loop);
  }

  /* ---------- visibilidad ---------- */

  function onVisibility() {
    if (document.hidden) {
      if (Game.getState() === 'play') Game.pause();
      Sound.suspend();
    } else {
      last = performance.now();
      Sound.wake();
      if (Store.getOptions().music) Sound.startMusic();
    }
  }

  /* ---------- arranque ---------- */

  function boot() {
    Store.init();
    Sprites.init();
    Background.init();
    UI.init();

    UI.setState('menu');
    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('orientationchange', function () {
      window.setTimeout(resize, 120);
    });
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', resize);
    }

    canvas.addEventListener('pointerdown', onPointerDown, { passive: false });
    canvas.addEventListener('contextmenu', function (e) { e.preventDefault(); });
    window.addEventListener('keydown', onKeyDown);
    document.addEventListener('pointerdown', unlockAudio, true);
    document.addEventListener('visibilitychange', onVisibility);

    /* evita el zoom por doble toque en móviles */
    document.addEventListener('gesturestart', function (e) { e.preventDefault(); });

    last = performance.now();
    requestAnimationFrame(loop);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
