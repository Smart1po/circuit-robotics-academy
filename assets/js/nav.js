/* CIRCUIT — going somewhere
 *
 * Two things live here:
 *
 *   1. The waiting screen. Click a link that leaves the page and the mark
 *      takes over the window while the next page loads — the wings, a line
 *      worth reading, and a different scene every time: rain, snow, a flock
 *      crossing, the crowd having a party, or the big one sitting with a cup
 *      of tea putting a robot together.
 *   2. The rope back to the top.
 *
 * The waiting screen never blocks a navigation. It is a short cover over a
 * page change that was going to happen anyway, and if anything at all goes
 * wrong the link still behaves exactly like a link.
 */
(function (global) {
  'use strict';

  var doc = global.document;
  var FLIGHT = 900;   /* ms of scene before the browser is asked to navigate */

  /* Things worth reading in the second you are waiting. Nothing about
   * loading, nothing about patience — a workshop's worth of advice. */
  var LINES = [
    'A fast robot that goes the wrong way is just a fast mistake.',
    'Measure it. The tape does not care what you calculated.',
    'The first version is meant to be wrong. That is its whole job.',
    'Write down the number you rejected, not only the one you kept.',
    'If it works and you cannot say why, it does not work yet.',
    'Every good build was a pile of parts on a Tuesday.',
    'Break it here. Here is the cheap place to break it.',
    'The robot does what you told it. That is the problem and the fix.',
    'Read the first error, not the last one.',
    'Nobody has ever soldered a good joint in a hurry.',
    'Take it apart once more. You will build it better the second time.',
    'A thing that runs on your bench is halfway there, and only halfway.'
  ];

  /* Each scene sets the weather and picks who turns up. */
  var SCENES = [
    { key: 'rain',  weather: 'rain', cast: ['probe', 'bolt'] },
    { key: 'snow',  weather: 'snow', cast: ['hex', 'chip'] },
    { key: 'flock', weather: null,   cast: ['flit', 'mote', 'kite', 'mote'] },
    { key: 'party', weather: null,   cast: ['bolt', 'hex', 'chip', 'cog', 'arm'] },
    { key: 'tea',   weather: null,   cast: ['titan'] }
  ];

  function motionOff() {
    return doc.documentElement.getAttribute('data-motion') === 'off';
  }

  function pick(list) {
    return list[Math.floor(Math.random() * list.length)];
  }

  /* ------------------------------------------------------------------ *
   * Weather — rain falls in streaks, snow drifts in squares
   * ------------------------------------------------------------------ */
  function Weather(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.drops = [];
    this.kind = null;
  }

  Weather.prototype.start = function (kind) {
    this.kind = kind;
    this.drops.length = 0;
    if (!kind) return;

    var dpr = Math.min(global.devicePixelRatio || 1, 2);
    this.w = global.innerWidth;
    this.h = global.innerHeight;
    this.canvas.width = this.w * dpr;
    this.canvas.height = this.h * dpr;
    this.canvas.style.width = this.w + 'px';
    this.canvas.style.height = this.h + 'px';
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.ctx.imageSmoothingEnabled = false;

    var n = kind === 'rain' ? 130 : 90;

    for (var i = 0; i < n; i++) {
      this.drops.push({
        x: Math.random() * this.w,
        y: Math.random() * this.h,
        v: kind === 'rain' ? 420 + Math.random() * 320 : 34 + Math.random() * 44,
        drift: kind === 'rain' ? -40 : (Math.random() - 0.5) * 30,
        len: kind === 'rain' ? 9 + Math.random() * 11 : 3,
        a: kind === 'rain' ? 0.30 + Math.random() * 0.3 : 0.5 + Math.random() * 0.4
      });
    }
  };

  Weather.prototype.step = function (dt) {
    if (!this.kind) return;

    var c = this.ctx;
    c.clearRect(0, 0, this.w, this.h);

    for (var i = 0; i < this.drops.length; i++) {
      var d = this.drops[i];
      d.y += d.v * dt;
      d.x += d.drift * dt;

      if (d.y > this.h) { d.y = -12; d.x = Math.random() * this.w; }
      if (d.x < -12) d.x = this.w + 12;
      if (d.x > this.w + 12) d.x = -12;

      c.globalAlpha = d.a;

      if (this.kind === 'rain') {
        c.fillStyle = '#9FD8E8';
        c.fillRect(Math.round(d.x / 3) * 3, Math.round(d.y / 3) * 3, 3, Math.round(d.len));
      } else {
        c.fillStyle = '#FFFFFF';
        c.fillRect(Math.round(d.x / 3) * 3, Math.round(d.y / 3) * 3, 3, 3);
      }
    }

    c.globalAlpha = 1;
  };

  /* ------------------------------------------------------------------ *
   * The waiting screen
   * ------------------------------------------------------------------ */
  function buildVeil() {
    var veil = doc.createElement('div');
    veil.className = 'veil';
    veil.id = 'veil';
    veil.hidden = true;
    veil.setAttribute('role', 'status');
    veil.setAttribute('aria-live', 'polite');

    var sky = doc.createElement('canvas');
    sky.className = 'veil__sky';
    sky.setAttribute('aria-hidden', 'true');

    var stage = doc.createElement('div');
    stage.className = 'veil__stage';

    var logo = doc.createElement('span');
    logo.className = 'veil__logo sprite';
    logo.setAttribute('data-sprite', 'wing-open');
    logo.setAttribute('data-scale', '4');

    var word = doc.createElement('p');
    word.className = 'veil__word';

    var cast = doc.createElement('div');
    cast.className = 'veil__cast';
    cast.setAttribute('aria-hidden', 'true');

    stage.appendChild(logo);
    stage.appendChild(word);
    stage.appendChild(cast);

    veil.appendChild(sky);
    veil.appendChild(stage);
    doc.body.appendChild(veil);

    /* This file loads last, so app.js has already run mountAll(). Mount what
     * is inside the veil now that it exists, or the wings never draw. */
    if (global.Pixel && global.Pixel.mountAll) global.Pixel.mountAll(veil);

    return { veil: veil, sky: sky, word: word, cast: cast, weather: new Weather(sky) };
  }

  /* Fill the stage with whoever this scene calls for. */
  function dress(ui, scene) {
    ui.cast.innerHTML = '';
    ui.cast.className = 'veil__cast veil__cast--' + scene.key;

    for (var i = 0; i < scene.cast.length; i++) {
      var slot = doc.createElement('span');
      slot.className = 'veil__member';
      slot.style.setProperty('--i', String(i));

      var host = doc.createElement('span');
      host.className = 'sprite';
      host.setAttribute('data-sprite', scene.cast[i]);
      host.setAttribute('data-scale', scene.key === 'tea' ? '3' : '2');

      slot.appendChild(host);
      ui.cast.appendChild(slot);
    }

    if (global.Pixel && global.Pixel.mountAll) global.Pixel.mountAll(ui.cast);
    ui.weather.start(scene.weather);
  }

  /* A link counts as "leaving" only if it really is going somewhere else on
   * this site, in this tab, without a modifier key held. */
  function leavesThePage(a, e) {
    if (e.defaultPrevented || e.button !== 0) return false;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return false;
    if (!a.href || (a.target && a.target !== '_self')) return false;
    if (a.hasAttribute('download')) return false;

    var url;
    try {
      url = new global.URL(a.href, global.location.href);
    } catch (err) {
      return false;
    }

    if (url.origin !== global.location.origin) return false;
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return false;
    if (url.pathname === global.location.pathname && url.hash) return false;
    if (url.href === global.location.href) return false;

    return url.href;
  }

  function initVeil() {
    var ui = buildVeil();
    var flying = false;

    if (global.Pixel) {
      global.Pixel.ticker.add(function (dt) {
        if (!ui.veil.hidden) ui.weather.step(dt);
      });
    }

    doc.addEventListener('click', function (e) {
      if (flying) return;

      var a = e.target && e.target.closest ? e.target.closest('a[href]') : null;
      if (!a) return;

      var to = leavesThePage(a, e);
      if (!to) return;

      /* Motion off means no scene and no delay — just the link. */
      if (motionOff()) return;

      e.preventDefault();
      flying = true;

      ui.word.textContent = pick(LINES);
      dress(ui, pick(SCENES));

      ui.veil.hidden = false;
      void ui.veil.offsetWidth;
      ui.veil.classList.add('is-flying');

      /* The navigation is the point; the scene is the cover. If anything
       * delays it, this timeout still fires and the page still changes. */
      global.setTimeout(function () { global.location.href = to; }, FLIGHT);
    });

    /* Coming back via Back restores a cached page with the veil still up. */
    global.addEventListener('pageshow', function () {
      ui.veil.classList.remove('is-flying');
      ui.veil.hidden = true;
      flying = false;
    });
  }

  /* ------------------------------------------------------------------ *
   * Back to the top
   * ------------------------------------------------------------------ */
  function initTop() {
    var btn = doc.createElement('button');
    btn.type = 'button';
    btn.className = 'totop';
    btn.hidden = true;

    var rope = doc.createElement('span');
    rope.className = 'totop__rope';
    rope.setAttribute('aria-hidden', 'true');

    var arrow = doc.createElement('span');
    arrow.className = 'totop__arrow';
    arrow.setAttribute('aria-hidden', 'true');

    var label = doc.createElement('span');
    label.className = 'totop__label';
    label.textContent = 'Top';

    btn.appendChild(rope);
    btn.appendChild(arrow);
    btn.appendChild(label);
    doc.body.appendChild(btn);

    btn.addEventListener('click', function () {
      global.scrollTo({ top: 0, behavior: motionOff() ? 'auto' : 'smooth' });
      var first = doc.querySelector('.skip') || doc.body;
      first.focus({ preventScroll: true });
    });

    var shown = false;

    function check() {
      var want = global.scrollY > global.innerHeight * 0.8;
      if (want === shown) return;
      shown = want;
      btn.hidden = !want;
    }

    check();
    global.addEventListener('scroll', check, { passive: true });
  }

  function boot() {
    initVeil();
    initTop();
  }

  if (doc.readyState === 'loading') {
    doc.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})(window);
