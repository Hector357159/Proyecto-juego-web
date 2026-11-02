/* ============================================================
   storage.js — récords y opciones en localStorage
   ============================================================ */
var Store = (function () {
  'use strict';

  var KEY = 'torogoz_vuelo_anil_v1';
  var DIFFS = ['facil', 'normal', 'dificil'];

  var defaults = {
    best: 0,
    top: [],
    options: { sfx: true, music: true, crt: true, difficulty: 'normal' }
  };

  var data = null;
  var available = true;

  function clone(obj) { return JSON.parse(JSON.stringify(obj)); }

  function validEntry(e) {
    return e && typeof e.score === 'number' && isFinite(e.score) && e.score >= 0;
  }

  function init() {
    data = clone(defaults);
    try {
      var raw = window.localStorage.getItem(KEY);
      if (raw) {
        var parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          data.best = Math.max(0, Math.floor(Number(parsed.best) || 0));
          if (Array.isArray(parsed.top)) {
            data.top = parsed.top.filter(validEntry).slice(0, 5).map(function (e) {
              return {
                score: Math.floor(e.score),
                diff: DIFFS.indexOf(e.diff) >= 0 ? e.diff : 'normal',
                date: Number(e.date) || Date.now()
              };
            });
          }
          if (parsed.options && typeof parsed.options === 'object') {
            var o = parsed.options;
            data.options.sfx = o.sfx !== false;
            data.options.music = o.music !== false;
            data.options.crt = o.crt !== false;
            if (DIFFS.indexOf(o.difficulty) >= 0) data.options.difficulty = o.difficulty;
          }
        }
      }
    } catch (e) {
      available = false;
    }
    data.top.forEach(function (e) {
      if (e.score > data.best) data.best = e.score;
    });
    data.top.sort(function (a, b) { return b.score - a.score || a.date - b.date; });
    data.top = data.top.slice(0, 5);
  }

  function save() {
    if (!available) return false;
    try {
      window.localStorage.setItem(KEY, JSON.stringify(data));
      return true;
    } catch (e) {
      available = false;
      return false;
    }
  }

  function getBest() { return data.best; }
  function getTop() { return data.top.slice(); }
  function getOptions() { return clone(data.options); }

  function setOption(key, value) {
    if (key === 'difficulty') {
      if (DIFFS.indexOf(value) < 0) return false;
    } else if (key === 'sfx' || key === 'music' || key === 'crt') {
      value = !!value;
    } else {
      return false;
    }
    data.options[key] = value;
    save();
    return true;
  }

  function addScore(score, diff) {
    score = Math.max(0, Math.floor(score));
    var prevBest = data.best;
    var isRecord = score > prevBest && score > 0;
    var entry = null;
    if (score > 0) {
      entry = {
        score: score,
        diff: DIFFS.indexOf(diff) >= 0 ? diff : 'normal',
        date: Date.now()
      };
      data.top.push(entry);
      data.top.sort(function (a, b) { return b.score - a.score || a.date - b.date; });
      data.top = data.top.slice(0, 5);
    }
    if (score > data.best) data.best = score;
    save();
    var rank = entry ? data.top.indexOf(entry) : -1;
    return { best: data.best, isRecord: isRecord, rank: rank };
  }

  function resetScores() {
    data.best = 0;
    data.top = [];
    save();
  }

  function isAvailable() { return available; }

  return {
    init: init,
    getBest: getBest,
    getTop: getTop,
    getOptions: getOptions,
    setOption: setOption,
    addScore: addScore,
    resetScores: resetScores,
    isAvailable: isAvailable,
    DIFFS: DIFFS
  };
})();
