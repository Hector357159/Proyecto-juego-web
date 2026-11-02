/* ============================================================
   background.js — cielo, volcanes, pueblo, milpa y suelo
   ============================================================ */
var Background = (function () {
  'use strict';

  var W = 320;
  var GROUND_Y = 424;
  var TILE = 640;

  var PHASES = [
    {
      id: 'dia',
      sky: ['#8ed8ea', '#c7ecd8'],
      sun: '#fff1b8', sunGlow: '#ffe9a0', sunPos: [250, 66], sunR: 24,
      stars: 0,
      far: '#4f8f93', farLight: '#72b3ab',
      mid: '#2f6b63', midLight: '#4d8f78',
      near: '#1f4f52', nearLight: '#357a66',
      ground: '#3b2f4e', groundDark: '#2c233d',
      grass: '#4f9a5e', grassLight: '#7dc47a',
      cloud: '#f4f6ef'
    },
    {
      id: 'tarde',
      sky: ['#f2995a', '#b8567e'],
      sun: '#ffd27a', sunGlow: '#f7a45e', sunPos: [238, 170], sunR: 30,
      stars: 3,
      far: '#7a4f6e', farLight: '#a06f80',
      mid: '#513a5e', midLight: '#76506f',
      near: '#2c2340', nearLight: '#4a3558',
      ground: '#2a2038', groundDark: '#1f1729',
      grass: '#6a7a4a', grassLight: '#9cae60',
      cloud: '#f6c8a8'
    },
    {
      id: 'noche',
      sky: ['#0a0f24', '#241a4a'],
      sun: '#e8ecff', sunGlow: '#9fb0e0', sunPos: [246, 62], sunR: 21,
      stars: 1,
      far: '#1d2a4a', farLight: '#33456e',
      mid: '#16203a', midLight: '#293a5c',
      near: '#0f1729', nearLight: '#1d2b48',
      ground: '#0b1120', groundDark: '#080c17',
      grass: '#2f6b46', grassLight: '#46955a',
      cloud: '#3c4a72'
    }
  ];

  var layers = [];      // [phase][far|mid|near|ground]
  var cloudsByPhase = [];
  var stars = [];
  var offsets = { far: 0, mid: 0, near: 0, ground: 0 };
  var clouds = [];
  var phase = 0;
  var target = 0;
  var blend = 1;
  var time = 0;

  function makeCanvas(w, h) {
    var c = document.createElement('canvas');
    c.width = w; c.height = h;
    var x = c.getContext('2d');
    x.imageSmoothingEnabled = false;
    return { c: c, x: x };
  }

  function rng(seed) {
    var s = seed * 16807 % 2147483647;
    return function () {
      s = s * 16807 % 2147483647;
      return (s - 1) / 2147483646;
    };
  }

  function hexToRgb(hex) {
    return [
      parseInt(hex.substr(1, 2), 16),
      parseInt(hex.substr(3, 2), 16),
      parseInt(hex.substr(5, 2), 16)
    ];
  }

  function mix(a, b, t) {
    return 'rgb(' + Math.round(a[0] + (b[0] - a[0]) * t) + ',' +
      Math.round(a[1] + (b[1] - a[1]) * t) + ',' +
      Math.round(a[2] + (b[2] - a[2]) * t) + ')';
  }

  function pxCircle(ctx, cx, cy, r, color) {
    ctx.fillStyle = color;
    for (var y = -r; y <= r; y++) {
      var w = Math.floor(Math.sqrt(Math.max(0, r * r - y * y)));
      ctx.fillRect(cx - w, cy + y, w * 2 + 1, 1);
    }
  }

  /* ---------- capas de paisaje ---------- */

  function buildFar(phaseIndex) {
    var h = 220;
    var o = makeCanvas(TILE, h);
    var r = rng(11 + phaseIndex * 53);
    var c = PHASES[phaseIndex];
    var volcanoes = [
      { cx: 150, peak: 158, hw: 122, crater: 16 },
      { cx: 420, peak: 122, hw: 102, crater: 0 },
      { cx: 560, peak: 74, hw: 76, crater: 0 }
    ];
    var heights = new Float32Array(TILE);
    for (var x = 0; x < TILE; x++) {
      var base = 34 + 7 * Math.sin(x * 2 * Math.PI / TILE * 2) +
        4 * Math.sin(x * 2 * Math.PI / TILE * 5 + 1.3);
      var hh = base;
      for (var v = 0; v < volcanoes.length; v++) {
        var vo = volcanoes[v];
        var d = Math.abs(x - vo.cx);
        if (d < vo.hw) {
          var t = 1 - d / vo.hw;
          var vh = vo.peak * Math.pow(t, 0.82);
          if (vo.crater && d < vo.crater) vh -= 9 * (1 - d / vo.crater);
          if (vh > hh) hh = vh;
        }
      }
      heights[x] = Math.max(6, hh + (r() - 0.5) * 2);
    }
    for (x = 0; x < TILE; x++) {
      var y = Math.round(h - heights[x]);
      o.x.fillStyle = c.far;
      o.x.fillRect(x, y, 1, h - y);
      /* luz en la ladera que mira al sol */
      if (heights[x] < heights[(x + 1) % TILE] - 0.6) {
        o.x.fillStyle = c.farLight;
        o.x.fillRect(x, y, 1, 2);
      }
    }
    return o.c;
  }

  function drawHouse(ctx, x, baseY, w, h, color, light, roof) {
    ctx.fillStyle = color;
    ctx.fillRect(x, baseY - h, w, h);
    /* techo escalonado */
    var steps = Math.ceil(w / 4);
    for (var i = 0; i < steps; i++) {
      ctx.fillRect(x + i * 2, baseY - h - 1 - i * 2, w - i * 4, 2);
    }
    ctx.fillStyle = light;
    ctx.fillRect(x + 2, baseY - h + 2, 2, 3);
    ctx.fillRect(x + w - 5, baseY - h + 2, 2, 3);
    if (roof) {
      ctx.fillStyle = light;
      ctx.fillRect(x + w / 2 - 1, baseY - h - 12, 2, 8);
      ctx.fillRect(x + w / 2 - 4, baseY - h - 10, 8, 2);
    }
  }

  function drawTree(ctx, x, baseY, h, color, light) {
    ctx.fillStyle = color;
    ctx.fillRect(x - 1, baseY - h, 3, h);
    ctx.fillRect(x - 5, baseY - h + 4, 4, 2);
    ctx.fillRect(x + 2, baseY - h + 9, 4, 2);
    var blobs = [
      [x, baseY - h - 6, 11, 5],
      [x - 8, baseY - h - 1, 8, 4],
      [x + 8, baseY - h - 2, 8, 4],
      [x - 3, baseY - h - 10, 8, 4]
    ];
    blobs.forEach(function (b) {
      ctx.fillRect(b[0] - b[2], b[1], b[2] * 2, b[3] * 2);
    });
    ctx.fillStyle = light;
    ctx.fillRect(x - 1, baseY - h - 4, 8, 2);
  }

  function buildMid(phaseIndex) {
    var h = 130;
    var o = makeCanvas(TILE, h);
    var c = PHASES[phaseIndex];
    var r = rng(31 + phaseIndex * 19);
    var baseY = h;
    var heights = new Float32Array(TILE);
    for (var x = 0; x < TILE; x++) {
      var hh = 22 + 9 * Math.sin(x * 2 * Math.PI / TILE * 3 + 0.7) +
        5 * Math.sin(x * 2 * Math.PI / TILE * 7 + 2.1) + r() * 3;
      heights[x] = Math.max(8, hh);
    }
    for (x = 0; x < TILE; x++) {
      var y = Math.round(baseY - heights[x]);
      o.x.fillStyle = c.mid;
      o.x.fillRect(x, y, 1, baseY - y);
      if (heights[x] < heights[(x + 1) % TILE]) {
        o.x.fillStyle = c.midLight;
        o.x.fillRect(x, y, 1, 2);
      }
    }

    /* iglesia del pueblo */
    var cx = 92, top = baseY - 34;
    o.x.fillStyle = c.mid;
    o.x.fillRect(cx - 26, top, 56, 34);
    o.x.fillRect(cx - 31, top + 8, 66, 26);
    /* torre */
    o.x.fillRect(cx - 8, top - 26, 18, 30);
    o.x.fillStyle = c.midLight;
    o.x.fillRect(cx - 6, top - 22, 3, 6);
    o.x.fillRect(cx + 2, top - 22, 3, 6);
    o.x.fillRect(cx + 4, top - 3, 2, 3);
    /* cruz */
    o.x.fillRect(cx + 0, top - 36, 2, 10);
    o.x.fillRect(cx - 3, top - 33, 8, 2);
    /* techo escalonado de la nave */
    for (var i = 0; i < 9; i++) {
      o.x.fillRect(cx - 30 + i * 2, top - 1 - i * 2, 64 - i * 4, 2);
    }
    /* casas */
    drawHouse(o.x, 152, baseY, 18, 10, c.mid, c.midLight, false);
    drawHouse(o.x, 196, baseY, 14, 8, c.mid, c.midLight, false);
    drawHouse(o.x, 350, baseY, 20, 12, c.mid, c.midLight, false);
    drawHouse(o.x, 470, baseY, 15, 8, c.mid, c.midLight, false);
    drawHouse(o.x, 585, baseY, 18, 10, c.mid, c.midLight, false);
    /* árboles */
    drawTree(o.x, 240, baseY, 22, c.mid, c.midLight);
    drawTree(o.x, 300, baseY, 17, c.mid, c.midLight);
    drawTree(o.x, 405, baseY, 24, c.mid, c.midLight);
    drawTree(o.x, 540, baseY, 20, c.mid, c.midLight);
    drawTree(o.x, 620, baseY, 15, c.mid, c.midLight);
    return o.c;
  }

  function drawCorn(ctx, x, baseY, h, color, light, r) {
    ctx.fillStyle = color;
    ctx.fillRect(x, baseY - h, 1, h);
    ctx.fillRect(x + 1, baseY - h + 1, 1, h - 1);
    var leaves = Math.floor(h / 9);
    for (var i = 0; i < leaves; i++) {
      var ly = baseY - 8 - i * 8 - Math.floor(r() * 2);
      var dir = i % 2 === 0 ? -1 : 1;
      ctx.fillRect(x + Math.min(0, dir * 2), ly, 4, 1);
      ctx.fillRect(x + (dir < 0 ? -3 : 2), ly - 2, 3, 1);
    }
    ctx.fillStyle = light;
    ctx.fillRect(x, baseY - h - 3, 1, 4);
    ctx.fillRect(x - 1, baseY - h - 1, 3, 1);
  }

  function buildNear(phaseIndex) {
    var h = 80;
    var o = makeCanvas(TILE, h);
    var c = PHASES[phaseIndex];
    var r = rng(71 + phaseIndex * 23);
    var baseY = h;
    /* arbustos */
    for (var x = 0; x < TILE; x += 9 + Math.floor(r() * 12)) {
      var bh = 5 + Math.floor(r() * 7);
      o.x.fillStyle = c.near;
      o.x.fillRect(x, baseY - bh, 7 + Math.floor(r() * 8), bh + 2);
      o.x.fillStyle = c.nearLight;
      o.x.fillRect(x + 1, baseY - bh, 3, 1);
    }
    /* milpa */
    for (x = 6; x < TILE; x += 26 + Math.floor(r() * 16)) {
      drawCorn(o.x, x, baseY, 30 + Math.floor(r() * 26), c.near, c.nearLight, r);
    }
    /* un par de ceibas */
    [60, 330, 520].forEach(function (tx) {
      drawTree(o.x, tx, baseY, 44, c.near, c.nearLight);
    });
    return o.c;
  }

  function buildGround(phaseIndex) {
    var h = 56;
    var o = makeCanvas(W, h);
    var c = PHASES[phaseIndex];
    var r = rng(101 + phaseIndex * 37);
    o.x.fillStyle = c.ground;
    o.x.fillRect(0, 0, W, h);
    /* pasto */
    o.x.fillStyle = c.grass;
    o.x.fillRect(0, 0, W, 8);
    o.x.fillStyle = c.grassLight;
    o.x.fillRect(0, 0, W, 2);
    for (var x = 0; x < W; x += 3) {
      var bh = 1 + Math.floor(r() * 3);
      o.x.fillStyle = r() > 0.5 ? c.grassLight : c.grass;
      o.x.fillRect(x, 0, 1, 2 + bh);
    }
    /* briznas que cuelgan */
    o.x.fillStyle = c.grass;
    for (x = 0; x < W; x += 7) {
      if (r() > 0.55) o.x.fillRect(x, 7, 1, 2 + Math.floor(r() * 3));
    }
    /* tierra */
    o.x.fillStyle = c.groundDark;
    for (var i = 0; i < 46; i++) {
      var px = Math.floor(r() * W), py = 10 + Math.floor(r() * (h - 14));
      o.x.fillRect(px, py, 1 + Math.floor(r() * 3), 1);
    }
    /* raíces y piedritas */
    o.x.fillStyle = '#5b4a3a';
    for (i = 0; i < 18; i++) {
      var rx = Math.floor(r() * W);
      var ry = 12 + Math.floor(r() * 30);
      o.x.fillRect(rx, ry, 2, 1);
      o.x.fillRect(rx + 2, ry + 1, 1, 1);
    }
    o.x.fillStyle = '#8a7a66';
    for (i = 0; i < 10; i++) {
      o.x.fillRect(Math.floor(r() * W), 16 + Math.floor(r() * 34), 2, 1);
    }
    return o.c;
  }

  function tintCloud(src, color) {
    var o = makeCanvas(src.width, src.height);
    o.x.drawImage(src, 0, 0);
    o.x.globalCompositeOperation = 'source-in';
    o.x.fillStyle = color;
    o.x.fillRect(0, 0, src.width, src.height);
    return o.c;
  }

  function init() {
    layers = [];
    cloudsByPhase = [];
    for (var p = 0; p < PHASES.length; p++) {
      layers.push({
        far: buildFar(p),
        mid: buildMid(p),
        near: buildNear(p),
        ground: buildGround(p)
      });
      var arr = [];
      for (var i = 0; i < 4; i++) arr.push(tintCloud(Sprites.cloud(i), PHASES[p].cloud));
      cloudsByPhase.push(arr);
    }

    /* estrellas fijas */
    stars = [];
    var r = rng(5);
    for (var s = 0; s < 54; s++) {
      stars.push({
        x: Math.floor(r() * W),
        y: Math.floor(r() * 300),
        size: r() > 0.85 ? 2 : 1,
        ph: r() * 6.28,
        sp: 1.2 + r() * 1.8
      });
    }

    /* nubes */
    clouds = [
      { x: 40, y: 74, s: 1, v: 5 },
      { x: 190, y: 126, s: 0.68, v: 3.4 },
      { x: 280, y: 52, s: 0.85, v: 4.2 },
      { x: 520, y: 150, s: 0.8, v: 2.6 },
      { x: 690, y: 96, s: 1.1, v: 4.8 },
      { x: 360, y: 42, s: 0.6, v: 3.1 },
      { x: 610, y: 196, s: 0.55, v: 2.2 }
    ];
  }

  function reset() {
    offsets.far = offsets.mid = offsets.near = offsets.ground = 0;
    phase = 0; target = 0; blend = 1;
  }

  function update(dt, speed) {
    time += dt;
    var sp = speed == null ? 26 : speed;
    offsets.far += sp * 0.13 * dt;
    offsets.mid += sp * 0.32 * dt;
    offsets.near += sp * 0.58 * dt;
    offsets.ground += sp * dt;

    clouds.forEach(function (cl) {
      cl.x -= (cl.v + sp * 0.03) * dt;
      if (cl.x < -70) {
        cl.x = W + 40 + Math.random() * 120;
        cl.y = 46 + Math.random() * 120;
        cl.s = 0.65 + Math.random() * 0.5;
      }
    });

    if (blend < 1) {
      blend = Math.min(1, blend + dt * 0.9);
      if (blend >= 1) phase = target;
    }
  }

  function setPhase(i, instant) {
    if (i === target) return;
    if (instant) { phase = target = i; blend = 1; return; }
    target = i;
    blend = 0;
  }

  function drawSky(ctx, p) {
    var c = PHASES[p];
    var top = hexToRgb(c.sky[0]);
    var bot = hexToRgb(c.sky[1]);
    var bands = 12;
    for (var i = 0; i < bands; i++) {
      ctx.fillStyle = mix(top, bot, i / (bands - 1));
      ctx.fillRect(0, i * (GROUND_Y / bands), W, GROUND_Y / bands + 1);
    }
  }

  function drawSun(ctx, p, t) {
    var c = PHASES[p];
    var x = c.sunPos[0], y = c.sunPos[1], r = c.sunR;
    ctx.save();
    ctx.globalAlpha = 0.16;
    pxCircle(ctx, x, y, r + 10, c.sunGlow);
    ctx.globalAlpha = 0.22;
    pxCircle(ctx, x, y, r + 5, c.sunGlow);
    ctx.restore();
    pxCircle(ctx, x, y, r, c.sun);
    if (p === 2) {
      ctx.fillStyle = '#c8d2f0';
      ctx.fillRect(x - 8, y - 5, 4, 3);
      ctx.fillRect(x + 3, y + 2, 5, 4);
      ctx.fillRect(x - 2, y + 9, 3, 2);
      ctx.fillRect(x + 8, y - 8, 2, 2);
    } else {
      ctx.fillStyle = c.sunGlow;
      ctx.fillRect(x - r / 2, y - r / 3, 4, 3);
      ctx.fillRect(x + 4, y + 6, 5, 3);
    }
  }

  function drawStars(ctx, p, t) {
    var st = PHASES[p].stars;
    if (!st) return;
    stars.forEach(function (s) {
      var a = (0.35 + 0.65 * (0.5 + 0.5 * Math.sin(t * s.sp + s.ph))) * (p === 2 ? 1 : 0.35);
      ctx.fillStyle = 'rgba(232,240,255,' + a.toFixed(3) + ')';
      var yy = Math.round(s.y + Math.sin(t * 0.4 + s.ph) * 1.5);
      ctx.fillRect(s.x, yy, s.size, s.size);
      if (s.size === 2 && a > 0.7) {
        ctx.fillRect(s.x - 1, yy + 1, 1, 1);
        ctx.fillRect(s.x + 2, yy + 1, 1, 1);
      }
    });
  }

  function drawLayer(ctx, img, y, offset, speedFactor) {
    var x = -(offset * speedFactor % TILE);
    if (x > 0) x -= TILE;
    ctx.drawImage(img, Math.round(x), y);
    if (x + TILE < W) ctx.drawImage(img, Math.round(x + TILE), y);
  }

  function drawClouds(ctx, p) {
    clouds.forEach(function (cl, i) {
      var img = cloudsByPhase[p][i % 4];
      ctx.globalAlpha = p === 2 ? 0.55 : 0.92;
      var w = img.width * cl.s, h = img.height * cl.s;
      ctx.drawImage(img, Math.round(cl.x), Math.round(cl.y + Math.sin(time * 0.6 + i) * 2),
        Math.round(w), Math.round(h));
      ctx.globalAlpha = 1;
    });
  }

  function drawGround(ctx, p) {
    var img = layers[p].ground;
    var off = offsets.ground % W;
    ctx.drawImage(img, -Math.round(off), GROUND_Y);
    ctx.drawImage(img, W - Math.round(off), GROUND_Y);
  }

  function drawPhase(ctx, p) {
    drawSky(ctx, p);
    drawSun(ctx, p, time);
    drawStars(ctx, p, time);
    drawClouds(ctx, p);
    drawLayer(ctx, layers[p].far, GROUND_Y - 220, offsets.far, 1);
    drawLayer(ctx, layers[p].mid, GROUND_Y - 130, offsets.mid, 1);
    drawLayer(ctx, layers[p].near, GROUND_Y - 80, offsets.near, 1);
    drawGround(ctx, p);
  }

  function draw(ctx, t) {
    drawPhase(ctx, phase);
    if (blend < 1) {
      ctx.save();
      ctx.globalAlpha = blend;
      drawPhase(ctx, target);
      ctx.restore();
    }
  }

  return {
    init: init,
    reset: reset,
    update: update,
    draw: draw,
    setPhase: setPhase,
    getPhase: function () { return target; },
    GROUND_Y: GROUND_Y,
    W: W,
    H: 480
  };
})();
