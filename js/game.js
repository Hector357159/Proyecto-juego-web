/* ============================================================
   game.js — física, tubos, puntuación y escena del menú
   ============================================================ */
var Game = (function () {
  'use strict';

  var W = 320;
  var H = 480;
  var GROUND = 424;
  var BIRD_X = 86;

  var GRAVITY = 1280;
  var FLAP = -400;
  var MAX_FALL = 640;

  var DIFFS = {
    facil:   { label: 'FÁCIL',   gap: 176, speed: 110, spacing: 176, ramp: 0.5 },
    normal:  { label: 'NORMAL',  gap: 150, speed: 126, spacing: 158, ramp: 0.75 },
    dificil: { label: 'DIFÍCIL', gap: 126, speed: 144, spacing: 142, ramp: 0.95 }
  };

  var state = 'menu';
  var stateTime = 0;
  var time = 0;
  var score = 0;
  var best = 0;
  var diff = 'normal';
  var speed = 0;
  var pipes = [];
  var particles = [];
  var shake = 0;
  var flash = 0;
  var saved = false;
  var overData = null;

  var bird = { x: BIRD_X, y: 240, vy: 0, frame: 1, frameTime: 0 };
  var menu = { t: 0, frame: 1, frameTime: 0, blinkIn: 3, blinking: 0 };

  /* ---------- ciclo de partida ---------- */

  function startRun() {
    diff = Store.getOptions().difficulty;
    var d = DIFFS[diff] || DIFFS.normal;
    state = 'ready';
    stateTime = 0;
    time = 0;
    score = 0;
    best = Store.getBest();
    speed = d.speed;
    pipes = [];
    particles = [];
    shake = 0;
    flash = 0;
    saved = false;
    overData = null;
    bird.x = BIRD_X;
    bird.y = 240;
    bird.vy = 0;
    bird.frame = 1;
    bird.frameTime = 0;

    Background.reset();
    Background.setPhase(0, true);
    UI.setState('ready');
    UI.updateScore(0, best);
    Sound.init();
    Sound.startMusic();
  }

  function toMenu() {
    state = 'menu';
    stateTime = 0;
    pipes = [];
    particles = [];
    shake = 0;
    menu.t = 0;
    Background.reset();
    Background.setPhase(0, true);
    UI.setState('menu');
    UI.updateScore(0, Store.getBest());
    Sound.startMusic();
  }

  function flap() {
    if (state === 'ready') {
      state = 'play';
      stateTime = 0;
      UI.setState('play');
    }
    if (state !== 'play') return;
    bird.vy = FLAP;
    bird.frame = 2;
    bird.frameTime = 0;
    spawnPuff();
    Sound.sfx('flap');
  }

  function pause() {
    if (state !== 'play') return;
    state = 'paused';
    UI.setState('paused');
    Sound.sfx('pause');
  }

  function resume() {
    if (state !== 'paused') return;
    state = 'play';
    UI.setState('play');
    Sound.sfx('select');
  }

  function tap() {
    if (state === 'ready' || state === 'play') flap();
    else if (state === 'over' && stateTime > 0.45) startRun();
    else if (state === 'menu' && UI.currentScreen() === 'menu') startRun();
    else if (state === 'paused') resume();
  }

  /* ---------- tubos ---------- */

  function spawnPipe(x) {
    var d = DIFFS[diff];
    var margin = 58;
    var maxTop = GROUND - d.gap - margin - 34;
    var gapY = Math.round(margin + Math.random() * Math.max(10, maxTop - margin));
    pipes.push({
      x: x,
      gapY: gapY,
      gapH: d.gap,
      variant: Math.floor(Math.random() * 7),
      scored: false
    });
  }

  function hitTest() {
    var bx = bird.x - 10;
    var by = bird.y - 7;
    var bw = 20;
    var bh = 14;
    if (bird.y + 9 >= GROUND) return true;
    for (var i = 0; i < pipes.length; i++) {
      var p = pipes[i];
      if (bx + bw > p.x && bx < p.x + Sprites.PIPE_W) {
        if (by < p.gapY || by + bh > p.gapY + p.gapH) return true;
      }
    }
    return false;
  }

  function onPoint() {
    score++;
    UI.updateScore(score, best);
    UI.popScore();
    Sound.sfx('point');
    sparkle();
    var phase = Math.floor(score / 15) % 3;
    if (score % 15 === 0 && score > 0) Background.setPhase(phase, false);
  }

  function die() {
    if (state !== 'play') return;
    state = 'dying';
    stateTime = 0;
    bird.vy = -230;
    bird.frame = 3;
    shake = 0.55;
    flash = 0.9;
    Sound.sfx('hit');
    window.setTimeout(function () { Sound.sfx('die'); }, 190);
    spawnFeathers(16);
    if (!saved) {
      overData = Store.addScore(score, diff);
      best = overData.best;
      UI.setBest(best);
      saved = true;
    }
    UI.setState('dying');
  }

  function showOver() {
    if (state !== 'dying') return;
    state = 'over';
    stateTime = 0;
    UI.showGameOver({
      score: score,
      best: best,
      isRecord: overData ? overData.isRecord : false,
      rank: overData ? overData.rank : -1
    });
  }

  /* ---------- partículas ---------- */

  function addParticle(x, y, vx, vy, life, size, color, gravity) {
    particles.push({
      x: x, y: y, vx: vx, vy: vy,
      life: life, max: life, size: size,
      color: color, gravity: gravity == null ? 180 : gravity
    });
  }

  function spawnFeathers(n) {
    var colors = ['#54f0d4', '#4aae5d', '#e8873a', '#2fc9d8', '#8fdc6a'];
    for (var i = 0; i < n; i++) {
      addParticle(
        bird.x + (Math.random() * 14 - 7),
        bird.y + (Math.random() * 10 - 5),
        -40 - Math.random() * 110,
        -120 + Math.random() * 90,
        0.9 + Math.random() * 0.7,
        Math.random() > 0.5 ? 2 : 3,
        colors[Math.floor(Math.random() * colors.length)],
        210
      );
    }
  }

  function sparkle() {
    var colors = ['#f2c14e', '#54f0d4', '#fff6d8'];
    for (var i = 0; i < 8; i++) {
      addParticle(
        bird.x + 6, bird.y,
        -30 + Math.random() * 110,
        -110 + Math.random() * 90,
        0.45 + Math.random() * 0.25,
        1 + (Math.random() > 0.7 ? 1 : 0),
        colors[Math.floor(Math.random() * colors.length)],
        120
      );
    }
  }

  function spawnPuff() {
    for (var i = 0; i < 3; i++) {
      addParticle(
        bird.x - 8, bird.y + 4,
        -50 - Math.random() * 30,
        10 + Math.random() * 30,
        0.3, 2, '#cfe6ff', 20
      );
    }
  }

  function dust() {
    for (var i = 0; i < 8; i++) {
      addParticle(
        bird.x + (Math.random() * 18 - 9),
        GROUND - 2,
        -40 + Math.random() * 80,
        -40 - Math.random() * 60,
        0.5, 2, '#8a7a66', 260
      );
    }
  }

  function updateParticles(dt) {
    for (var i = particles.length - 1; i >= 0; i--) {
      var p = particles[i];
      p.life -= dt;
      if (p.life <= 0) { particles.splice(i, 1); continue; }
      p.vy += p.gravity * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
    }
  }

  function drawParticles(ctx) {
    for (var i = 0; i < particles.length; i++) {
      var p = particles[i];
      ctx.globalAlpha = Math.max(0, Math.min(1, p.life / p.max));
      ctx.fillStyle = p.color;
      ctx.fillRect(Math.round(p.x), Math.round(p.y), p.size, p.size);
    }
    ctx.globalAlpha = 1;
  }

  /* ---------- actualización ---------- */

  function update(dt) {
    if (dt > 0.05) dt = 0.05;
    time += dt;
    stateTime += dt;
    shake = Math.max(0, shake - dt * 2.6);
    flash = Math.max(0, flash - dt * 4.2);

    if (state === 'paused') return;

    if (state === 'menu') {
      menu.t += dt;
      menu.frameTime += dt;
      if (menu.frameTime > 0.18) {
        menu.frameTime = 0;
        menu.frame = (menu.frame + 1) % 3;
      }
      menu.blinkIn -= dt;
      if (menu.blinking > 0) menu.blinking -= dt;
      else if (menu.blinkIn <= 0) {
        menu.blinking = 0.16;
        menu.blinkIn = 2.8 + Math.random() * 2.4;
      }
      Background.update(dt, 26);
      updateParticles(dt);
      return;
    }

    Background.update(dt, state === 'play' ? speed : 0);
    updateParticles(dt);

    if (state === 'ready') {
      bird.y = 240 + Math.sin(time * 3) * 4;
      bird.vy = 0;
      bird.frameTime += dt;
      if (bird.frameTime > 0.16) {
        bird.frameTime = 0;
        bird.frame = (bird.frame + 1) % 3;
      }
      return;
    }

    if (state === 'play' || state === 'dying') {
      var g = state === 'dying' ? GRAVITY * 1.1 : GRAVITY;
      bird.vy = Math.min(MAX_FALL, bird.vy + g * dt);
      bird.y += bird.vy * dt;

      if (bird.y < 10) {
        bird.y = 10;
        bird.vy = Math.max(bird.vy, 0);
      }

      if (state === 'play') {
        bird.frameTime += dt;
        if (bird.frameTime > (bird.vy < 0 ? 0.08 : 0.16)) {
          bird.frameTime = 0;
          bird.frame = (bird.frame + 1) % 3;
        }

        speed = DIFFS[diff].speed + Math.min(56, score * DIFFS[diff].ramp);
        var d = DIFFS[diff];

        for (var i = 0; i < pipes.length; i++) pipes[i].x -= speed * dt;

        if (!pipes.length && stateTime > 0.8) {
          spawnPipe(W + 50);
        } else if (pipes.length) {
          var last = pipes[pipes.length - 1];
          if (last.x < W - d.spacing + 40) spawnPipe(last.x + d.spacing);
        }
        while (pipes.length && pipes[0].x + Sprites.PIPE_W < -20) pipes.shift();

        if (hitTest()) {
          die();
        } else {
          for (i = 0; i < pipes.length; i++) {
            var p = pipes[i];
            if (!p.scored && p.x + Sprites.PIPE_W < bird.x - 10) {
              p.scored = true;
              onPoint();
            }
          }
        }
      } else {
        /* cayendo tras el golpe */
        if (bird.y + 9 >= GROUND) {
          bird.y = GROUND - 9;
          if (bird.vy > 180) {
            shake = 0.4;
            dust();
            Sound.sfx('hit');
          }
          bird.vy = 0;
          if (stateTime > 0.55) showOver();
        } else if (stateTime > 1.6) {
          showOver();
        }
      }
    }
  }

  /* ---------- dibujo ---------- */

  function drawBird(ctx) {
    var idx = Sprites.angleFor(bird.vy);
    var spr = Sprites.bird(bird.frame, idx);
    ctx.drawImage(spr.c, Math.round(bird.x - spr.ox), Math.round(bird.y - spr.oy));
  }

  function drawMenuScene(ctx) {
    var bob = Math.sin(menu.t * 2.1) * 2;
    var x = 160;
    var y = 240 + bob;

    /* rama */
    Sprites.drawBranch(ctx, 160, 276, 226);

    /* patitas */
    ctx.fillStyle = '#2f2016';
    ctx.fillRect(164, Math.round(y + 16), 2, 20);
    ctx.fillRect(170, Math.round(y + 15), 2, 21);
    ctx.fillStyle = '#e8873a';
    ctx.fillRect(163, 278, 4, 2);
    ctx.fillRect(169, 277, 4, 2);

    var spr = menu.blinking > 0 ? Sprites.blink(2) : Sprites.bird(menu.frame, 2);
    var s = 2;
    ctx.drawImage(
      spr.c,
      Math.round(x - spr.ox * s),
      Math.round(y - spr.oy * s),
      spr.c.width * s,
      spr.c.height * s
    );

    /* bandada lejana */
    ctx.fillStyle = 'rgba(23,70,58,0.55)';
    for (var b = 0; b < 3; b++) {
      var bx = 62 + b * 17 + Math.sin(menu.t * 0.8 + b) * 5;
      var by = 152 + Math.sin(menu.t * 1.3 + b * 2) * 4;
      ctx.fillRect(Math.round(bx), Math.round(by), 4, 1);
      ctx.fillRect(Math.round(bx - 1), Math.round(by - 1), 2, 1);
      ctx.fillRect(Math.round(bx + 3), Math.round(by - 1), 2, 1);
    }

    /* motas flotantes */
    for (var i = 0; i < 4; i++) {
      var mx = 60 + i * 58 + Math.sin(menu.t * 0.7 + i * 2) * 8;
      var my = 160 + Math.cos(menu.t * 0.9 + i * 1.7) * 14 + i * 6;
      ctx.fillStyle = i % 2 ? 'rgba(84,240,212,0.55)' : 'rgba(242,193,78,0.45)';
      ctx.fillRect(Math.round(mx), Math.round(my), 2, 2);
    }
  }

  function draw(ctx) {
    Background.draw(ctx, time);

    if (state === 'menu') {
      drawMenuScene(ctx);
      return;
    }

    for (var i = 0; i < pipes.length; i++) {
      Sprites.drawPipe(ctx, pipes[i], GROUND);
    }

    drawParticles(ctx);
    drawBird(ctx);

    if (flash > 0.01) {
      ctx.fillStyle = 'rgba(255, 248, 232, ' + (flash * 0.8).toFixed(3) + ')';
      ctx.fillRect(0, 0, W, H);
    }
  }

  return {
    startRun: startRun,
    toMenu: toMenu,
    flap: flap,
    tap: tap,
    pause: pause,
    resume: resume,
    update: update,
    draw: draw,
    getState: function () { return state; },
    getShake: function () { return shake; },
    getScore: function () { return score; },
    getBest: function () { return best; },
    /* Solo para pruebas automatizadas. */
    _debug: function () {
      return { bird: bird, pipes: pipes, speed: speed, diff: diff };
    },
    GROUND: GROUND,
    W: W,
    H: H
  };
})();
