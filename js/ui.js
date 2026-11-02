/* ============================================================
   ui.js — pantallas, HUD, opciones y game over
   ============================================================ */
var UI = (function () {
  'use strict';

  var el = {};
  var current = 'menu';
  var resetArmed = false;
  var resetTimer = null;
  var toastTimer = null;

  var SCREENS = ['menu', 'options', 'scores', 'how', 'pause', 'over'];

  function $(id) { return document.getElementById(id); }

  function init() {
    el.hud = $('hud');
    el.pauseBtn = $('btn-pause');
    el.score = $('score');
    el.hudBest = $('hud-best');
    el.menuBest = $('menu-best');
    el.tip = $('tip');
    el.medal = $('medal');
    el.crt = $('crt');
    el.toast = $('toast');
    el.overScore = $('over-score');
    el.overBest = $('over-best');
    el.overMedalName = $('over-medal-name');
    el.overRecord = $('over-record');
    el.scoreList = $('score-list');
    el.scoreEmpty = $('score-empty');

    SCREENS.forEach(function (name) { el[name] = $('screen-' + name); });

    /* --- menú --- */
    $('btn-play').addEventListener('click', function () {
      click();
      Game.startRun();
    });
    $('btn-options').addEventListener('click', function () { click(); open('options'); });
    $('btn-scores').addEventListener('click', function () { click(); open('scores'); });
    $('btn-how').addEventListener('click', function () { click(); open('how'); });

    /* --- volver --- */
    Array.prototype.forEach.call(document.querySelectorAll('[data-action="back"]'), function (b) {
      b.addEventListener('click', function () { click(); soundBack(); open('menu'); });
    });

    /* --- pausa --- */
    $('btn-pause').addEventListener('click', function () { click(); Game.pause(); });
    $('btn-resume').addEventListener('click', function () { click(); Game.resume(); });
    $('btn-restart').addEventListener('click', function () { click(); Game.startRun(); });
    $('btn-quit').addEventListener('click', function () { click(); Game.toMenu(); });

    /* --- game over --- */
    $('btn-retry').addEventListener('click', function () { click(); Game.startRun(); });
    $('btn-over-menu').addEventListener('click', function () { click(); Game.toMenu(); });

    /* --- opciones --- */
    $('opt-sfx').addEventListener('click', function () {
      var on = !Store.getOptions().sfx;
      Store.setOption('sfx', on);
      Sound.setSfx(on);
      if (on) { Sound.init(); Sound.sfx('select'); }
      refreshOptions();
      toast('SONIDO: ' + (on ? 'SÍ' : 'NO'));
    });
    $('opt-music').addEventListener('click', function () {
      var on = !Store.getOptions().music;
      Store.setOption('music', on);
      Sound.init();
      Sound.setMusic(on);
      refreshOptions();
      toast('MÚSICA: ' + (on ? 'SÍ' : 'NO'));
    });
    $('opt-crt').addEventListener('click', function () {
      var on = !Store.getOptions().crt;
      Store.setOption('crt', on);
      applyCrt(on);
      if (Sound.ready()) Sound.sfx('crt');
      refreshOptions();
      toast('CRT: ' + (on ? 'SÍ' : 'NO'));
    });
    Array.prototype.forEach.call(document.querySelectorAll('#opt-diff button'), function (b) {
      b.addEventListener('click', function () {
        var diff = b.getAttribute('data-diff');
        Store.setOption('difficulty', diff);
        refreshOptions();
        if (Sound.ready()) Sound.sfx('select');
        toast('DIFICULTAD: ' + b.textContent);
      });
    });
    $('opt-reset').addEventListener('click', function () {
      var btn = $('opt-reset');
      if (!resetArmed) {
        resetArmed = true;
        btn.textContent = '¿SEGURO?';
        if (Sound.ready()) Sound.sfx('back');
        clearTimeout(resetTimer);
        resetTimer = setTimeout(function () {
          resetArmed = false;
          btn.textContent = 'BORRAR RÉCORDS';
        }, 2600);
        return;
      }
      resetArmed = false;
      clearTimeout(resetTimer);
      btn.textContent = 'BORRAR RÉCORDS';
      Store.resetScores();
      refreshScores();
      updateScore(0, 0);
      if (Sound.ready()) Sound.sfx('record');
      toast('RÉCORDS BORRADOS');
    });

    refreshOptions();
    refreshScores();
    updateScore(0, Store.getBest());
    applyCrt(Store.getOptions().crt);
  }

  function click() {
    Sound.init();
    var o = Store.getOptions();
    Sound.setSfx(o.sfx);
    Sound.setMusic(o.music);
    if (Sound.ready()) Sound.sfx('select');
  }
  function soundBack() {
    if (Sound.ready()) Sound.sfx('back');
  }

  /* ---------- navegación ---------- */

  function open(name) {
    if (name === 'scores') refreshScores();
    if (name === 'options') refreshOptions();
    showScreen(name);
  }

  function showScreen(name) {
    current = name || null;
    SCREENS.forEach(function (n) {
      el[n].classList.toggle('active', n === name);
    });
  }

  function setState(state) {
    if (state === 'menu') {
      showScreen('menu');
      el.hud.classList.add('is-hidden');
      el.hud.setAttribute('aria-hidden', 'true');
      el.tip.classList.add('is-hidden');
      updateScore(0, Store.getBest());
    } else if (state === 'ready') {
      showScreen(null);
      hudShow();
      el.tip.classList.remove('is-hidden');
    } else if (state === 'play') {
      showScreen(null);
      hudShow();
      el.tip.classList.add('is-hidden');
    } else if (state === 'dying') {
      showScreen(null);
      hudShow();
      el.tip.classList.add('is-hidden');
    } else if (state === 'paused') {
      showScreen('pause');
      hudShow();
      el.tip.classList.add('is-hidden');
    } else if (state === 'over') {
      showScreen('over');
      el.hud.classList.add('is-hidden');
      el.hud.setAttribute('aria-hidden', 'true');
      el.tip.classList.add('is-hidden');
    }
    el.pauseBtn.classList.toggle('is-hidden', state !== 'play');
  }

  function hudShow() {
    el.hud.classList.remove('is-hidden');
    el.hud.setAttribute('aria-hidden', 'false');
  }

  function currentScreen() { return current; }

  /* ---------- marcadores ---------- */

  function updateScore(score, best) {
    el.score.textContent = score;
    el.hudBest.textContent = best;
    el.menuBest.textContent = best;
  }

  function popScore() {
    el.score.classList.remove('pop');
    /* reinicia la animación */
    void el.score.offsetWidth;
    el.score.classList.add('pop');
  }

  function setBest(best) {
    el.hudBest.textContent = best;
    el.menuBest.textContent = best;
    el.overBest.textContent = best;
  }

  /* ---------- opciones ---------- */

  function refreshOptions() {
    var o = Store.getOptions();
    setToggle($('opt-sfx'), o.sfx);
    setToggle($('opt-music'), o.music);
    setToggle($('opt-crt'), o.crt);
    Array.prototype.forEach.call(document.querySelectorAll('#opt-diff button'), function (b) {
      b.classList.toggle('active', b.getAttribute('data-diff') === o.difficulty);
    });
    applyCrt(o.crt);
  }

  function setToggle(btn, on) {
    btn.textContent = on ? 'SÍ' : 'NO';
    btn.setAttribute('aria-pressed', on ? 'true' : 'false');
  }

  function applyCrt(on) {
    el.crt.classList.toggle('off', !on);
  }

  /* ---------- récords ---------- */

  function refreshScores() {
    var top = Store.getTop();
    el.scoreList.innerHTML = '';
    if (!top.length) {
      el.scoreEmpty.classList.remove('is-hidden');
      el.scoreList.classList.add('is-hidden');
      return;
    }
    el.scoreEmpty.classList.add('is-hidden');
    el.scoreList.classList.remove('is-hidden');
    top.forEach(function (entry, i) {
      var tier = ART.medalFor(entry.score);
      var li = document.createElement('li');
      if (i === 0) li.className = 'first';
      var rank = document.createElement('span');
      rank.className = 'rank';
      rank.textContent = (i + 1) + '.';
      var dot = document.createElement('span');
      dot.className = 'dot';
      dot.style.background = tier.palette.Y;
      var name = document.createElement('span');
      name.className = 'mname';
      name.textContent = TIER_LABEL(tier.id) + ' · ' + diffLabel(entry.diff);
      var pts = document.createElement('span');
      pts.className = 'mpts';
      pts.textContent = entry.score;
      li.appendChild(rank);
      li.appendChild(dot);
      li.appendChild(name);
      li.appendChild(pts);
      el.scoreList.appendChild(li);
    });
  }

  function TIER_LABEL(id) {
    var labels = { barro: 'BARRO', copal: 'COPAL', oro: 'ORO', anil: 'AÑIL' };
    return labels[id] || id.toUpperCase();
  }

  function diffLabel(d) {
    return { facil: 'FÁCIL', normal: 'NORMAL', dificil: 'DIFÍCIL' }[d] || 'NORMAL';
  }

  /* ---------- game over ---------- */

  function showGameOver(data) {
    setState('over');
    el.overScore.textContent = data.score;
    el.overBest.textContent = data.best;
    var tier = ART.medalFor(data.score);
    el.overMedalName.textContent = TIER_LABEL(tier.id);
    el.overRecord.classList.toggle('is-hidden', !data.isRecord);

    var ctx = el.medal.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, el.medal.width, el.medal.height);
    ctx.drawImage(Sprites.medal(tier.id), 0, 0, 16, 18, 3, 4, 64, 72);

    if (data.isRecord) Sound.sfx('record');
    else Sound.sfx('medal');
  }

  /* ---------- efectos ---------- */

  function toast(msg) {
    el.toast.textContent = msg;
    el.toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      el.toast.classList.remove('show');
    }, 1700);
  }

  return {
    init: init,
    open: open,
    setState: setState,
    currentScreen: currentScreen,
    updateScore: updateScore,
    popScore: popScore,
    setBest: setBest,
    showGameOver: showGameOver,
    toast: toast,
    refreshOptions: refreshOptions,
    refreshScores: refreshScores
  };
})();
