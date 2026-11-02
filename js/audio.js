/* ============================================================
   audio.js — chiptune y efectos sintetizados con WebAudio
   ============================================================ */
var Sound = (function () {
  'use strict';

  var BPM = 132;
  var STEP = 60 / BPM / 2; // corchea

  var ctx = null;
  var master, sfxBus, musicBus;
  var noiseBuf = null;
  var sfxOn = true;
  var musicOn = true;
  var timer = null;
  var step = 0;
  var nextTime = 0;
  var playing = false;

  /* Pentatónica de La menor. null = silencio. */
  var A4 = 440, C5 = 523.25, D5 = 587.33, E5 = 659.25;
  var G5 = 783.99, A5 = 880, G4 = 392, E4 = 329.63;
  var A2 = 110, F2 = 87.31, C3 = 130.81, G2 = 98;

  var MELODY = [
    A4, null, C5, null, E5, null, D5, null,
    C5, null, A4, null, G4, null, A4, null,
    C5, null, D5, null, E5, null, G5, null,
    E5, null, D5, null, C5, null, A4, null,
    A4, C5, E5, A5, null, G5, E5, D5,
    C5, null, D5, null, E5, null, D5, null,
    C5, A4, G4, A4, null, C5, null, null,
    E5, null, G5, null, A5, null, null, null
  ];

  var BASS = [
    A2, null, A2, null, A2, null, 82.41, null,
    F2, null, F2, null, F2, null, C3, null,
    C3, null, C3, null, C3, null, G2, null,
    G2, null, G2, null, G2, null, G2, null
  ];

  function init() {
    if (ctx) { resume(); return; }
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    try {
      ctx = new AC();
    } catch (e) { ctx = null; return; }

    master = ctx.createGain();
    master.gain.value = 0.85;
    master.connect(ctx.destination);

    sfxBus = ctx.createGain();
    sfxBus.gain.value = sfxOn ? 0.55 : 0;
    sfxBus.connect(master);

    musicBus = ctx.createGain();
    musicBus.gain.value = musicOn ? 0.32 : 0;
    musicBus.connect(master);

    /* ruido blanco para percusión y golpes */
    var len = Math.floor(ctx.sampleRate * 1.0);
    noiseBuf = ctx.createBuffer(1, len, ctx.sampleRate);
    var data = noiseBuf.getChannelData(0);
    for (var i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
  }

  function resume() {
    if (ctx && ctx.state === 'suspended') ctx.resume();
  }

  function ready() {
    if (!ctx) init();
    if (!ctx) return false;
    resume();
    return true;
  }

  /* ---------- primitivas ---------- */

  function tone(freq, dur, type, gain, slideTo, when) {
    if (!ctx) return;
    var t0 = when == null ? ctx.currentTime : when;
    var osc = ctx.createOscillator();
    var g = ctx.createGain();
    osc.type = type || 'square';
    osc.frequency.setValueAtTime(freq, t0);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(Math.max(20, slideTo), t0 + dur);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.linearRampToValueAtTime(gain, t0 + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(g);
    g.connect(sfxBus);
    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
  }

  function noise(dur, gain, cutoff, when, type) {
    if (!ctx || !noiseBuf) return;
    var t0 = when == null ? ctx.currentTime : when;
    var src = ctx.createBufferSource();
    src.buffer = noiseBuf;
    var f = ctx.createBiquadFilter();
    f.type = type || 'lowpass';
    f.frequency.setValueAtTime(cutoff || 1200, t0);
    var g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.linearRampToValueAtTime(gain, t0 + 0.006);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    src.connect(f);
    f.connect(g);
    g.connect(sfxBus);
    src.start(t0);
    src.stop(t0 + dur + 0.02);
  }

  /* ---------- efectos ---------- */

  function sfx(name) {
    if (!ready() || !sfxOn) return;
    var n = ctx.currentTime;
    switch (name) {
      case 'flap':
        tone(520, 0.09, 'square', 0.12, 340, n);
        noise(0.06, 0.05, 900, n);
        break;
      case 'point':
        tone(880, 0.06, 'square', 0.1, null, n);
        tone(1318.5, 0.1, 'square', 0.09, null, n + 0.055);
        break;
      case 'hit':
        noise(0.16, 0.22, 900, n);
        tone(190, 0.22, 'square', 0.16, 55, n);
        break;
      case 'die':
        tone(392, 0.18, 'triangle', 0.14, 220, n + 0.12);
        tone(220, 0.4, 'triangle', 0.12, 82, n + 0.28);
        break;
      case 'select':
        tone(740, 0.05, 'square', 0.07, null, n);
        break;
      case 'back':
        tone(392, 0.06, 'square', 0.06, 294, n);
        break;
      case 'pause':
        tone(523, 0.06, 'square', 0.08, null, n);
        tone(392, 0.08, 'square', 0.08, null, n + 0.08);
        break;
      case 'record':
        [523, 659, 784, 1046].forEach(function (f, i) {
          tone(f, 0.12, 'square', 0.08, null, n + i * 0.09);
        });
        break;
      case 'medal':
        tone(659, 0.1, 'square', 0.06, null, n);
        tone(880, 0.16, 'square', 0.06, null, n + 0.1);
        break;
      case 'crt':
        noise(0.08, 0.04, 2400, n, 'highpass');
        break;
    }
  }

  /* ---------- música ---------- */

  function musicTone(freq, when, dur, gain, type) {
    var osc = ctx.createOscillator();
    var g = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, when);
    g.gain.setValueAtTime(0.0001, when);
    g.gain.linearRampToValueAtTime(gain, when + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, when + dur);
    osc.connect(g);
    g.connect(musicBus);
    osc.start(when);
    osc.stop(when + dur + 0.02);
  }

  function playStep(i, when) {
    var mel = MELODY[i % MELODY.length];
    if (mel) musicTone(mel, when, STEP * 1.55, 0.05, 'square');
    var bass = BASS[i % BASS.length];
    if (bass) musicTone(bass, when, STEP * 1.7, 0.075, 'triangle');
    if (i % 8 === 0) musicTone(bass || A2, when, STEP * 0.7, 0.09, 'triangle');
    if (i % 4 === 2) {
      /* charles */
      var src = ctx.createBufferSource();
      src.buffer = noiseBuf;
      var f = ctx.createBiquadFilter();
      f.type = 'highpass';
      f.frequency.value = 6000;
      var g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, when);
      g.gain.linearRampToValueAtTime(0.02, when + 0.004);
      g.gain.exponentialRampToValueAtTime(0.0001, when + 0.05);
      src.connect(f); f.connect(g); g.connect(musicBus);
      src.start(when); src.stop(when + 0.06);
    }
    if (i % 8 === 4) {
      var s2 = ctx.createBufferSource();
      s2.buffer = noiseBuf;
      var f2 = ctx.createBiquadFilter();
      f2.type = 'bandpass';
      f2.frequency.value = 1600;
      var g2 = ctx.createGain();
      g2.gain.setValueAtTime(0.0001, when);
      g2.gain.linearRampToValueAtTime(0.035, when + 0.005);
      g2.gain.exponentialRampToValueAtTime(0.0001, when + 0.1);
      s2.connect(f2); f2.connect(g2); g2.connect(musicBus);
      s2.start(when); s2.stop(when + 0.12);
    }
  }

  function schedule() {
    if (!ctx || !playing) return;
    while (nextTime < ctx.currentTime + 0.15) {
      playStep(step, nextTime);
      nextTime += STEP;
      step = (step + 1) % 64;
    }
  }

  function startMusic() {
    if (!ready() || !musicOn || playing) return;
    playing = true;
    step = 0;
    nextTime = ctx.currentTime + 0.08;
    if (timer) clearInterval(timer);
    timer = setInterval(schedule, 25);
  }

  function stopMusic() {
    playing = false;
    if (timer) { clearInterval(timer); timer = null; }
  }

  /* ---------- opciones ---------- */

  function setSfx(on) {
    sfxOn = !!on;
    if (sfxBus) sfxBus.gain.setTargetAtTime(sfxOn ? 0.55 : 0, ctx.currentTime, 0.02);
  }

  function setMusic(on) {
    musicOn = !!on;
    if (musicBus) musicBus.gain.setTargetAtTime(musicOn ? 0.32 : 0, ctx.currentTime, 0.03);
    if (musicOn) startMusic();
    else stopMusic();
  }

  function suspend() {
    stopMusic();
    if (ctx && ctx.state === 'running') ctx.suspend();
  }

  function wake() {
    if (ctx && ctx.state === 'suspended') ctx.resume();
  }

  return {
    init: init,
    ready: ready,
    sfx: sfx,
    startMusic: startMusic,
    stopMusic: stopMusic,
    setSfx: setSfx,
    setMusic: setMusic,
    suspend: suspend,
    wake: wake
  };
})();
