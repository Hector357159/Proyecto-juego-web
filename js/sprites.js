/* ============================================================
   sprites.js — horneado de sprites, rotaciones y dibujo de tubos
   ============================================================ */
var Sprites = (function () {
  'use strict';

  var ANGLES = [-28, -14, 0, 16, 34, 52, 70, 86];
  var birdFrames = [];   // [frame][angle] -> {c, ox, oy}
  var birdBlink = [];    // [angle]
  var medals = {};
  var clouds = [];

  /* ---------- utilidades ---------- */

  function makeCanvas(w, h) {
    var c = document.createElement('canvas');
    c.width = w; c.height = h;
    var x = c.getContext('2d');
    x.imageSmoothingEnabled = false;
    return { c: c, x: x };
  }

  /* Convierte una matriz de caracteres en un canvas de 1 píxel por celda. */
  function bake(matrix, palette) {
    var h = matrix.length;
    var w = matrix[0].length;
    var o = makeCanvas(w, h);
    for (var y = 0; y < h; y++) {
      var row = matrix[y];
      for (var x = 0; x < w; x++) {
        var col = palette[row.charAt(x)];
        if (col) {
          o.x.fillStyle = col;
          o.x.fillRect(x, y, 1, 1);
        }
      }
    }
    return o.c;
  }

  /* Rota un sprite sin suavizado y lo centra con relleno. */
  function rotate(src, degrees, pad) {
    var rad = degrees * Math.PI / 180;
    var w = src.width, h = src.height;
    var diag = Math.ceil(Math.sqrt(w * w + h * h)) + pad * 2;
    var o = makeCanvas(diag, diag);
    o.x.translate(diag / 2, diag / 2);
    o.x.rotate(rad);
    o.x.drawImage(src, -w / 2, -h / 2);
    return { c: o.c, ox: diag / 2, oy: diag / 2 };
  }

  /* PRNG determinista para variar la corteza. */
  function rng(seed) {
    var s = seed * 16807 % 2147483647;
    return function () {
      s = s * 16807 % 2147483647;
      return (s - 1) / 2147483646;
    };
  }

  /* ---------- inicialización ---------- */

  function init() {
    var pal = ART.palette;

    for (var f = 0; f < 3; f++) {
      var base = bake(ART.bird.frames[f], pal);
      birdFrames[f] = ANGLES.map(function (a) { return rotate(base, a, 10); });
    }

    /* Parpadeo: párpado sobre la pose central. */
    var m = ART.bird.frames[1].map(function (r) { return r.split(''); });
    [[6, 22], [6, 23], [6, 24], [8, 22], [8, 23], [8, 24]].forEach(function (p) {
      m[p[0]][p[1]] = 'K';
    });
    m[7][22] = 'b'; m[7][23] = 'b'; m[7][24] = 'b';
    var blink = bake(m.map(function (r) { return r.join(''); }), pal);
    birdBlink = ANGLES.map(function (a) { return rotate(blink, a, 10); });

    /* Medallas por nivel. */
    ART.medalTiers.forEach(function (tier) {
      var p = {};
      for (var k in tier.palette) p[k] = tier.palette[k];
      p['.'] = null;
      medals[tier.id] = bake(ART.medal, p);
    });

    /* Nubes. */
    for (var i = 0; i < 4; i++) clouds.push(makeCloud(i + 3));
  }

  /* ---------- nubes ---------- */

  function makeCloud(seed) {
    var w = 54, h = 22;
    var r = rng(seed);
    var mask = [];
    var blobs = [
      { x: 14 + r() * 4, y: 13, rx: 10, ry: 5 },
      { x: 27 + r() * 4, y: 10, rx: 12, ry: 7 },
      { x: 42 + r() * 3, y: 14, rx: 9, ry: 5 }
    ];
    for (var y = 0; y < h; y++) {
      mask[y] = [];
      for (var x = 0; x < w; x++) {
        var inside = false;
        for (var b = 0; b < blobs.length; b++) {
          var bl = blobs[b];
          var dx = (x - bl.x) / bl.rx;
          var dy = (y - bl.y) / bl.ry;
          if (dx * dx + dy * dy <= 1) { inside = true; break; }
        }
        mask[y][x] = inside;
      }
    }
    var o = makeCanvas(w, h);
    for (var yy = 0; yy < h; yy++) {
      for (var xx = 0; xx < w; xx++) {
        if (!mask[yy][xx]) continue;
        var edge = false;
        for (var d = 0; d < 4; d++) {
          var nx = xx + [1, -1, 0, 0][d];
          var ny = yy + [0, 0, 1, -1][d];
          if (nx < 0 || ny < 0 || nx >= w || ny >= h || !mask[ny][nx]) edge = true;
        }
        if (!mask[yy - 1] || !mask[yy - 1][xx]) edge = true;
        o.x.fillStyle = edge ? '#d6e4e8' : '#f4f6ef';
        o.x.fillRect(xx, yy, 1, 1);
      }
    }
    return o.c;
  }

  /* ---------- consultas ---------- */

  function bird(frame, angleIndex) {
    var f = birdFrames[Math.max(0, Math.min(2, frame))];
    return f[Math.max(0, Math.min(ANGLES.length - 1, angleIndex))];
  }

  function blink(angleIndex) {
    return birdBlink[Math.max(0, Math.min(ANGLES.length - 1, angleIndex))];
  }

  function angleFor(vy) {
    var t = (vy + 380) / 980; // -380 => 0, 600 => 1
    t = Math.max(0, Math.min(1, t));
    return Math.round(t * (ANGLES.length - 1));
  }

  function medal(tierId) {
    return medals[tierId] || medals.barro;
  }

  function cloud(i) {
    return clouds[i % clouds.length];
  }

  /* ---------- tubos: troncos de ceiba ---------- */

  var PIPE_W = 54;
  var CAP_H = 22;
  var CAP_OVER = 4;

  function trunkPixel(ctx, x, y, w, h, variant) {
    var r = rng(variant * 97 + Math.floor(y / 26) + 1);
    ctx.fillStyle = '#6b4a2f';
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = '#8a6239';
    ctx.fillRect(x + 4, y, 10, h);
    ctx.fillStyle = '#4a3120';
    ctx.fillRect(x + w - 4, y, 4, h);
    ctx.fillRect(x, y, 3, h);
    /* vetas */
    var cols = [9, 17, 25, 33, 41, 48];
    for (var i = 0; i < cols.length; i++) {
      var cx = x + cols[i];
      var seg = 10 + Math.floor(r() * 14);
      var off = Math.floor(r() * 24);
      ctx.fillStyle = i % 2 ? '#5a3d27' : '#7a5635';
      for (var yy = y + off; yy < y + h; yy += seg + 12) {
        var len = Math.min(seg, y + h - yy);
        if (len > 0) ctx.fillRect(cx, yy, 1, len);
      }
    }
    /* anillos */
    ctx.fillStyle = 'rgba(47,32,22,0.55)';
    for (var ry = y + 18; ry < y + h; ry += 34) {
      ctx.fillRect(x + 3, ry, w - 6, 1);
    }
    /* musgo */
    ctx.fillStyle = '#3f7a4a';
    for (var m = 0; m < 7; m++) {
      var mx = x + (m % 2 === 0 ? 2 : w - 7) + Math.floor(r() * 4);
      var my = y + Math.floor(r() * Math.max(1, h - 8));
      ctx.fillRect(mx, my, 3 + Math.floor(r() * 3), 2);
    }
    ctx.fillStyle = '#63a35c';
    ctx.fillRect(x + (variant % 2 === 0 ? 3 : w - 6), y + Math.floor(h * 0.35), 3, 2);
  }

  function cap(ctx, x, y, variant, flip) {
    var w = PIPE_W + CAP_OVER * 2;
    ctx.fillStyle = '#3a2a1c';
    ctx.fillRect(x - CAP_OVER, y, w, CAP_H);
    ctx.fillStyle = '#7a5635';
    ctx.fillRect(x - CAP_OVER + 2, y + 2, w - 4, CAP_H - 4);
    ctx.fillStyle = '#a9793f';
    ctx.fillRect(x - CAP_OVER + 3, y + 4, w - 6, 3);
    ctx.fillStyle = '#c79a5c';
    ctx.fillRect(x - CAP_OVER + 5, y + 4, w - 10, 1);
    /* vetas horizontales del borde */
    ctx.fillStyle = '#5a3d27';
    ctx.fillRect(x - CAP_OVER + 3, y + 10, w - 6, 1);
    ctx.fillRect(x - CAP_OVER + 3, y + 17, w - 6, 1);
    ctx.fillStyle = '#8a6239';
    ctx.fillRect(x + 6, y + 7, 2, CAP_H - 10);
    ctx.fillRect(x + w - 12, y + 7, 2, CAP_H - 10);
    /* remate oscuro hacia el hueco */
    ctx.fillStyle = '#2f2016';
    if (flip) ctx.fillRect(x - CAP_OVER, y + CAP_H - 2, w, 2);
    else ctx.fillRect(x - CAP_OVER, y, w, 2);
    /* enredadera */
    ctx.fillStyle = '#2f6b46';
    var vx = x + (variant % 2 === 0 ? 7 : PIPE_W - 12);
    if (flip) {
      ctx.fillRect(vx, y + CAP_H, 2, 10);
      ctx.fillRect(vx + 2, y + CAP_H + 8, 3, 2);
    } else {
      ctx.fillRect(vx, y - 10, 2, 10);
      ctx.fillRect(vx - 3, y - 10, 3, 2);
    }
    ctx.fillStyle = '#63a35c';
    if (flip) ctx.fillRect(vx + 2, y + CAP_H + 4, 3, 2);
    else ctx.fillRect(vx - 3, y - 8, 3, 2);
  }

  /* Dibuja un tubo completo (superior e inferior). pipe = {x, gapY, gapH, variant} */
  function drawPipe(ctx, pipe, groundY) {
    var x = Math.round(pipe.x);
    var variant = pipe.variant | 0;
    var topEnd = Math.round(pipe.gapY);
    var botStart = Math.round(pipe.gapY + pipe.gapH);

    if (topEnd > CAP_H) trunkPixel(ctx, x, 0, PIPE_W, topEnd - CAP_H, variant);
    cap(ctx, x, topEnd - CAP_H, variant, true);

    trunkPixel(ctx, x, botStart + CAP_H, PIPE_W, Math.max(0, groundY - botStart - CAP_H), variant + 3);
    cap(ctx, x, botStart, variant + 3, false);
  }

  /* ---------- rama del menú ---------- */

  function drawBranch(ctx, cx, y, width) {
    var x0 = cx - width / 2;
    var x1 = cx + width / 2;
    ctx.fillStyle = '#3a2a1c';
    ctx.fillRect(x0, y, width, 9);
    ctx.fillRect(x0 + 6, y + 9, width - 20, 3);
    ctx.fillStyle = '#6b4a2f';
    ctx.fillRect(x0 + 2, y + 2, width - 4, 4);
    ctx.fillStyle = '#8a6239';
    ctx.fillRect(x0 + 8, y + 2, width - 24, 1);
    /* hojas */
    var leaves = [
      [x0 + 10, y + 2, -1], [x0 + 26, y + 12, 1], [x1 - 18, y - 3, -1],
      [x1 - 6, y + 10, 1], [x0 + 48, y - 2, 1], [x1 - 34, y + 11, -1]
    ];
    ctx.fillStyle = '#2b7a43';
    leaves.forEach(function (l) {
      var dir = l[2];
      for (var i = 0; i < 3; i++) {
        ctx.fillRect(l[0] + dir * i * 2, l[1] + i, 4, 3);
      }
    });
    ctx.fillStyle = '#4aae5d';
    leaves.forEach(function (l) {
      ctx.fillRect(l[0] + (l[2] > 0 ? 1 : 0), l[1], 2, 1);
    });
    /* pequeños frutos */
    ctx.fillStyle = '#e8873a';
    ctx.fillRect(x0 + 34, y + 11, 2, 2);
    ctx.fillRect(x1 - 26, y - 4, 2, 2);
  }

  return {
    init: init,
    bird: bird,
    blink: blink,
    angleFor: angleFor,
    medal: medal,
    cloud: cloud,
    drawPipe: drawPipe,
    drawBranch: drawBranch,
    PIPE_W: PIPE_W,
    CAP_H: CAP_H
  };
})();
