/* CIRCUIT — pixel engine
 *
 * Three things live here, all sharing one animation frame:
 *   1. Ticker   — a single requestAnimationFrame loop everything subscribes to.
 *   2. Glitter  — the dim square-particle trail that follows the pointer.
 *   3. Sprites  — pixel characters drawn from text maps onto tiny canvases.
 *
 * No image files, no network requests, no libraries. Every character on this
 * site is a few lines of text expanded into pixels at runtime.
 */
(function (global) {
  'use strict';

  var doc = global.document;
  var reduceMotion = global.matchMedia
    ? global.matchMedia('(prefers-reduced-motion: reduce)')
    : { matches: false, addEventListener: function () {} };

  /* One switch for the whole engine. The OS preference sets its opening
   * position; the footer button moves it afterwards. Everything that animates
   * asks this rather than asking the media query, so the button actually
   * works instead of needing a reload to take effect. */
  var motionOn = !reduceMotion.matches;
  var onMotionChange = [];

  function setMotion(on) {
    on = !!on;
    if (on === motionOn) return;
    motionOn = on;
    for (var i = 0; i < onMotionChange.length; i++) onMotionChange[i](motionOn);
  }

  /* ------------------------------------------------------------------ *
   * 1. Ticker
   * One loop. Everything that moves subscribes to it, so the page never
   * runs eight competing animation loops fighting for the same frame.
   * ------------------------------------------------------------------ */
  var Ticker = (function () {
    var subs = [];
    var running = false;
    var last = 0;

    function frame(now) {
      var dt = Math.min((now - last) / 1000, 0.05); /* clamp after a tab switch */
      last = now;

      for (var i = 0; i < subs.length; i++) subs[i](dt, now);

      if (subs.length) {
        global.requestAnimationFrame(frame);
      } else {
        running = false;
      }
    }

    function add(fn) {
      subs.push(fn);
      if (!running) {
        running = true;
        last = global.performance ? global.performance.now() : Date.now();
        global.requestAnimationFrame(frame);
      }
      return function remove() {
        var i = subs.indexOf(fn);
        if (i > -1) subs.splice(i, 1);
      };
    }

    /* A hidden tab should not burn battery drawing sparkles nobody sees. */
    doc.addEventListener('visibilitychange', function () {
      if (!doc.hidden && subs.length && !running) {
        running = true;
        last = global.performance ? global.performance.now() : Date.now();
        global.requestAnimationFrame(frame);
      }
    });

    return { add: add };
  })();

  /* ------------------------------------------------------------------ *
   * 2. Glitter
   * Dim, square, short-lived. Pixel art has no round particles, so these
   * are 2px blocks snapped to a 2px grid. Spawn is gated by distance
   * travelled, not by event count, so a fast sweep across the page emits
   * an even trail instead of a solid bar.
   * ------------------------------------------------------------------ */
  var GRID = 3;          /* particle size and snap grid, in CSS pixels     */
  var MAX = 160;         /* hard cap on live particles                     */
  var SPAWN_EVERY = 10;  /* pointer must travel this far to drop a spark   */
  var LIFE_MIN = 0.55;   /* seconds                                        */
  var LIFE_MAX = 1.15;
  var ALPHA = 0.9;       /* starting alpha — bright enough to read as sparks */
  var GRAVITY = 22;      /* px/s², a slow settle rather than a fall        */

  function Glitter(canvas, colors) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.colors = colors;
    this.particles = [];
    this.lastX = null;
    this.lastY = null;
    this.dpr = 1;
    this.dirty = false;

    this.resize();
    this.bind();
  }

  Glitter.prototype.resize = function () {
    this.dpr = Math.min(global.devicePixelRatio || 1, 2);
    this.canvas.width = Math.floor(global.innerWidth * this.dpr);
    this.canvas.height = Math.floor(global.innerHeight * this.dpr);
    this.canvas.style.width = global.innerWidth + 'px';
    this.canvas.style.height = global.innerHeight + 'px';
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    this.ctx.imageSmoothingEnabled = false;
  };

  Glitter.prototype.spawn = function (x, y, count) {
    var snapX = Math.round(x / GRID) * GRID;
    var snapY = Math.round(y / GRID) * GRID;

    for (var i = 0; i < count; i++) {
      if (this.particles.length >= MAX) this.particles.shift();

      this.particles.push({
        x: snapX + (Math.random() * 10 - 5),
        y: snapY + (Math.random() * 10 - 5),
        vx: (Math.random() - 0.5) * 18,
        vy: (Math.random() - 0.5) * 18 - 6,
        life: LIFE_MIN + Math.random() * (LIFE_MAX - LIFE_MIN),
        age: 0,
        size: Math.random() < 0.22 ? GRID * 2 : GRID,
        color: this.colors[(Math.random() * this.colors.length) | 0]
      });
    }
  };

  Glitter.prototype.bind = function () {
    var self = this;

    global.addEventListener('resize', function () { self.resize(); }, { passive: true });

    global.addEventListener('pointermove', function (e) {
      if (!motionOn || e.pointerType === 'touch') return;

      if (self.lastX === null) {
        self.lastX = e.clientX;
        self.lastY = e.clientY;
        return;
      }

      var dx = e.clientX - self.lastX;
      var dy = e.clientY - self.lastY;

      if (dx * dx + dy * dy < SPAWN_EVERY * SPAWN_EVERY) return;

      self.lastX = e.clientX;
      self.lastY = e.clientY;
      self.spawn(e.clientX, e.clientY, 4);
    }, { passive: true });

    /* No mouse on a phone, so a tap gets a small burst instead. */
    global.addEventListener('pointerdown', function (e) {
      if (!motionOn) return;
      self.spawn(e.clientX, e.clientY, 16);
    }, { passive: true });

    onMotionChange.push(function (on) {
      if (!on) self.particles.length = 0;
    });

    Ticker.add(function (dt) { self.step(dt); });
  };

  Glitter.prototype.step = function (dt) {
    var ctx = this.ctx;

    /* An idle pointer costs nothing: with no particles and nothing left over
     * from last frame, there is no canvas to clear and no work to do. */
    if (!this.particles.length && !this.dirty) return;

    ctx.clearRect(0, 0, global.innerWidth, global.innerHeight);
    this.dirty = this.particles.length > 0;

    if (!this.particles.length) return;

    for (var i = this.particles.length - 1; i >= 0; i--) {
      var p = this.particles[i];
      p.age += dt;

      if (p.age >= p.life) {
        this.particles.splice(i, 1);
        continue;
      }

      p.vy += GRAVITY * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;

      /* Fade out, and step the alpha so it flickers like a sprite would. */
      var t = 1 - p.age / p.life;
      ctx.globalAlpha = ALPHA * (Math.round(t * 4) / 4);
      ctx.fillStyle = p.color;
      ctx.fillRect(
        Math.round(p.x / GRID) * GRID,
        Math.round(p.y / GRID) * GRID,
        p.size,
        p.size
      );
    }

    ctx.globalAlpha = 1;
  };

  /* ------------------------------------------------------------------ *
   * 3. Sprites
   * A frame is an array of strings. One character is one pixel. A space
   * is transparent. The palette maps characters to colours.
   *
   *   ['..##..',
   *    '.####.',
   *    '..##..']
   *
   * That is the whole format. Frames cycle at a fixed rate, and the
   * canvas is scaled with imageSmoothingEnabled off so pixels stay hard.
   * ------------------------------------------------------------------ */
  function Sprite(canvas, def) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.frames = def.frames;
    this.palette = def.palette;
    this.fps = def.fps || 4;
    this.scale = def.scale || 4;
    this.bob = def.bob || 0;        /* vertical idle drift, in pixels */
    this.bobSpeed = def.bobSpeed || 1.6;
    this.drift = def.drift || 0;    /* horizontal patrol, in pixels   */
    this.driftSpeed = def.driftSpeed || 0.5;

    this.frame = 0;
    this.acc = 0;
    this.phase = Math.random() * Math.PI * 2; /* so a row of sprites is not in lockstep */
    this.visible = true;

    this.measure();
    this.draw();
    this.observe();
  }

  Sprite.prototype.measure = function () {
    var rows = this.frames[0];
    this.rows = rows.length;
    this.cols = rows[0].length;

    var dpr = Math.min(global.devicePixelRatio || 1, 3);
    this.canvas.width = this.cols * this.scale * dpr;
    this.canvas.height = this.rows * this.scale * dpr;
    this.canvas.style.width = this.cols * this.scale + 'px';
    this.canvas.style.height = this.rows * this.scale + 'px';
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.ctx.imageSmoothingEnabled = false;
  };

  Sprite.prototype.draw = function () {
    var ctx = this.ctx;
    var map = this.frames[this.frame % this.frames.length];
    var s = this.scale;

    ctx.clearRect(0, 0, this.cols * s, this.rows * s);

    for (var y = 0; y < map.length; y++) {
      var row = map[y];
      for (var x = 0; x < row.length; x++) {
        var ch = row.charAt(x);
        var color = this.palette[ch];
        if (!color) continue;
        ctx.fillStyle = color;
        ctx.fillRect(x * s, y * s, s, s);
      }
    }
  };

  /* Sprites scrolled off the screen stop costing anything. */
  Sprite.prototype.observe = function () {
    var self = this;
    if (!global.IntersectionObserver) return;

    var io = new global.IntersectionObserver(function (entries) {
      /* The last record, not the first: one batch can carry several entries
       * for the same target, and only the newest one is still true. */
      self.visible = entries[entries.length - 1].isIntersecting;
    }, { rootMargin: '80px' });

    io.observe(this.canvas);
  };

  Sprite.prototype.park = function () {
    this.frame = 0;
    this.acc = 0;
    this.canvas.style.transform = '';
    this.draw();
  };

  Sprite.prototype.step = function (dt, now) {
    if (!this.visible || !motionOn) return;

    if (this.frames.length > 1) {
      this.acc += dt;
      if (this.acc >= 1 / this.fps) {
        this.acc = 0;
        this.frame = (this.frame + 1) % this.frames.length;
        this.draw();
      }
    }

    if (this.bob || this.drift) {
      var t = now / 1000 + this.phase;
      var ty = this.bob ? Math.round(Math.sin(t * this.bobSpeed) * this.bob) : 0;
      var tx = this.drift ? Math.round(Math.sin(t * this.driftSpeed) * this.drift) : 0;
      this.canvas.style.transform = 'translate3d(' + tx + 'px,' + ty + 'px,0)';
    }
  };

  /* ------------------------------------------------------------------ *
   * Mounting
   * ------------------------------------------------------------------ */
  var registry = {};
  var mounted = [];

  function define(name, def) {
    registry[name] = def;
  }

  function mountAll(root) {
    var nodes = (root || doc).querySelectorAll('[data-sprite]');

    for (var i = 0; i < nodes.length; i++) {
      var host = nodes[i];
      var def = registry[host.getAttribute('data-sprite')];
      if (!def) continue;

      var canvas = doc.createElement('canvas');
      canvas.className = 'sprite';
      canvas.setAttribute('aria-hidden', 'true');
      host.appendChild(canvas);

      var scale = parseInt(host.getAttribute('data-scale'), 10);

      mounted.push(new Sprite(canvas, {
        frames: def.frames,
        palette: def.palette,
        fps: def.fps,
        scale: scale || def.scale,
        bob: def.bob,
        bobSpeed: def.bobSpeed,
        drift: def.drift,
        driftSpeed: def.driftSpeed
      }));
    }

    if (!mounted.length) return;

    /* Motion off does not hide a character — it parks it. Each sprite drops
     * back to its at-rest frame and stays visible, because none of them was
     * ever saying anything with the movement itself. */
    onMotionChange.push(function (on) {
      if (on) return;
      for (var k = 0; k < mounted.length; k++) mounted[k].park();
    });

    Ticker.add(function (dt, now) {
      for (var j = 0; j < mounted.length; j++) mounted[j].step(dt, now);
    });
  }

  var glitter = null;

  function startGlitter(colors) {
    var canvas = doc.createElement('canvas');
    canvas.id = 'glitter';
    canvas.setAttribute('aria-hidden', 'true');
    doc.body.appendChild(canvas);

    glitter = new Glitter(canvas, colors);
    return glitter;
  }

  /* Anything on the page can ask for a handful of sparks at a point — the
   * welcoming party uses it to throw confetti when it wakes up. */
  function burst(x, y, count) {
    if (!glitter || !motionOn) return;
    glitter.spawn(x, y, Math.min(count || 10, 30));
  }

  function repaint() {
    for (var i = 0; i < mounted.length; i++) mounted[i].draw();
  }

  /* Swap the sprite inside one host that has already been mounted — used by
   * the wing mark, which changes which sprite it is rather than animating. */
  function remount(host) {
    var def = registry[host.getAttribute('data-sprite')];
    var canvas = host.querySelector('canvas');
    if (!def || !canvas) return;

    for (var i = 0; i < mounted.length; i++) {
      if (mounted[i].canvas !== canvas) continue;

      mounted[i].frames = def.frames;
      mounted[i].palette = def.palette;
      mounted[i].frame = 0;
      mounted[i].measure();
      mounted[i].draw();
      return;
    }
  }

  global.Pixel = {
    ticker: Ticker,
    define: define,
    mountAll: mountAll,
    startGlitter: startGlitter,
    burst: burst,
    repaint: repaint,
    remount: remount,
    setMotion: setMotion,
    motionOn: function () { return motionOn; },
    onMotionChange: onMotionChange,
    reduceMotion: reduceMotion
  };
})(window);
