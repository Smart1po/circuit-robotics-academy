/* CIRCUIT — the scene
 *
 * Three things that make the page feel inhabited rather than printed:
 *
 *   1. A background that is not flat black. A pixel grid with circuit traces
 *      and solder pads on it, drifting slowly against the scroll, plus a
 *      canvas of dust motes floating through the room.
 *   2. Flyers. Drones and an ornithopter crossing the window at their own
 *      heights and speeds, behind every panel so they never cover a word.
 *   3. The welcoming party. Machines asleep at the very bottom of the page
 *      that wake up and cheer when somebody actually gets all the way down.
 *
 * All of it sits behind the content, none of it takes a click, and every bit
 * of it stops when motion is switched off.
 */
(function (global) {
  'use strict';

  var doc = global.document;

  /* ------------------------------------------------------------------ *
   * Dust
   * Slow, low-contrast pixel motes drifting upward. Different from the
   * cursor glitter: this never reacts to you, it is just the room.
   * ------------------------------------------------------------------ */
  var DUST_COUNT = 34;
  var DUST_MAX_ALPHA = 0.30;

  function Dust(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.motes = [];
    this.colors = ['#58E7FF', '#7B72D4', '#B4FF3D', '#FFC247'];
    this.dpr = 1;

    this.resize();
    this.seed();

    var self = this;
    global.addEventListener('resize', function () { self.resize(); }, { passive: true });
    doc.addEventListener('circuit:theme', function () { self.readColors(); });

    this.readColors();
  }

  /* The motes borrow the palette, so they change with the lights. */
  Dust.prototype.readColors = function () {
    var css = global.getComputedStyle(doc.documentElement);
    var names = ['--cyan', '--edge', '--lime', '--amber'];
    var out = [];

    for (var i = 0; i < names.length; i++) {
      var v = css.getPropertyValue(names[i]).trim();
      if (v) out.push(v);
    }

    if (out.length) this.colors = out;

    for (var j = 0; j < this.motes.length; j++) {
      this.motes[j].color = this.colors[(Math.random() * this.colors.length) | 0];
    }
  };

  Dust.prototype.resize = function () {
    this.dpr = Math.min(global.devicePixelRatio || 1, 2);
    this.w = global.innerWidth;
    this.h = global.innerHeight;
    this.canvas.width = Math.floor(this.w * this.dpr);
    this.canvas.height = Math.floor(this.h * this.dpr);
    this.canvas.style.width = this.w + 'px';
    this.canvas.style.height = this.h + 'px';
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    this.ctx.imageSmoothingEnabled = false;
  };

  Dust.prototype.seed = function () {
    this.motes.length = 0;

    for (var i = 0; i < DUST_COUNT; i++) {
      this.motes.push({
        x: Math.random() * this.w,
        y: Math.random() * this.h,
        size: Math.random() < 0.25 ? 6 : 3,
        vy: -(4 + Math.random() * 10),
        drift: (Math.random() - 0.5) * 6,
        phase: Math.random() * Math.PI * 2,
        alpha: 0.10 + Math.random() * (DUST_MAX_ALPHA - 0.10),
        color: this.colors[(Math.random() * this.colors.length) | 0]
      });
    }
  };

  Dust.prototype.step = function (dt, now) {
    var ctx = this.ctx;
    ctx.clearRect(0, 0, this.w, this.h);

    var t = now / 1000;

    for (var i = 0; i < this.motes.length; i++) {
      var m = this.motes[i];

      m.y += m.vy * dt;
      m.x += Math.sin(t * 0.4 + m.phase) * m.drift * dt;

      if (m.y < -8) {
        m.y = this.h + 8;
        m.x = Math.random() * this.w;
      }
      if (m.x < -8) m.x = this.w + 8;
      if (m.x > this.w + 8) m.x = -8;

      ctx.globalAlpha = m.alpha;
      ctx.fillStyle = m.color;
      ctx.fillRect(
        Math.round(m.x / 3) * 3,
        Math.round(m.y / 3) * 3,
        m.size,
        m.size
      );
    }

    ctx.globalAlpha = 1;
  };

  /* ------------------------------------------------------------------ *
   * The flying cast
   * Each one crosses at its own height, speed and direction. They are
   * aria-hidden and sit at z-index 0, behind every opaque panel.
   * ------------------------------------------------------------------ */
  var FLYERS = [
    { sprite: 'mote',  top: 14, speed: 26, scale: 2, dir:  1 },
    { sprite: 'flit',  top: 30, speed: 17, scale: 3, dir: -1 },
    { sprite: 'kite',  top: 52, speed: 21, scale: 2, dir:  1 },
    { sprite: 'probe', top: 68, speed: 12, scale: 2, dir: -1 },
    { sprite: 'mote',  top: 84, speed: 31, scale: 2, dir:  1 }
  ];

  function buildFlyers(host) {
    var made = [];

    for (var i = 0; i < FLYERS.length; i++) {
      var f = FLYERS[i];

      var el = doc.createElement('span');
      el.className = 'flyer';
      el.style.top = f.top + '%';
      el.setAttribute('aria-hidden', 'true');

      var inner = doc.createElement('span');
      inner.className = 'sprite';
      inner.setAttribute('data-sprite', f.sprite);
      inner.setAttribute('data-scale', String(f.scale));
      el.appendChild(inner);

      host.appendChild(el);

      made.push({
        el: el,
        speed: f.speed,
        dir: f.dir,
        offset: (i * 37) % 100   /* spread them out so they never line up */
      });
    }

    return made;
  }

  /* ------------------------------------------------------------------ *
   * The welcoming party
   * ------------------------------------------------------------------ */
  var PARTY = [
    { sprite: 'chip',  cheer: 'Yes!',        scale: 2, size: 'sm' },
    { sprite: 'hex',   cheer: 'You made it', scale: 3, size: '' },
    { sprite: 'bolt',  cheer: 'Nice',        scale: 4, size: 'lg' },
    { sprite: 'arm',   cheer: 'Bravo',       scale: 3, size: '' },
    { sprite: 'cog',   cheer: 'Woo',         scale: 2, size: 'sm' },
    { sprite: 'dash',  cheer: 'Hooray',      scale: 4, size: 'lg' },
    { sprite: 'probe', cheer: 'Well read',   scale: 3, size: '' },
    { sprite: 'flit',  cheer: 'Top marks',   scale: 3, size: '' },
    { sprite: 'mote',  cheer: 'Whee',        scale: 2, size: 'sm' },
    { sprite: 'tip',   cheer: 'Good one',    scale: 2, size: 'sm' },
    { sprite: 'pip',   cheer: 'Ha!',         scale: 3, size: '' }
  ];

  function buildParty() {
    var party = doc.createElement('div');
    party.className = 'party';
    party.id = 'party';

    for (var i = 0; i < PARTY.length; i++) {
      var one = doc.createElement('div');
      one.className = 'party__one' +
        (PARTY[i].size ? ' party__one--' + PARTY[i].size : '');

      var z = doc.createElement('span');
      z.className = 'party__z';
      z.setAttribute('aria-hidden', 'true');
      z.textContent = 'z';

      var host = doc.createElement('span');
      host.className = 'sprite';
      host.setAttribute('data-sprite', PARTY[i].sprite);
      host.setAttribute('data-scale', String(PARTY[i].scale));

      var cheer = doc.createElement('span');
      cheer.className = 'party__cheer';
      cheer.textContent = PARTY[i].cheer;

      one.appendChild(z);
      one.appendChild(host);
      one.appendChild(cheer);
      party.appendChild(one);
    }

    var caption = doc.createElement('p');
    caption.className = 'party__caption';
    caption.textContent = 'You read the whole thing. The workshop appreciates it.';
    party.appendChild(caption);

    return party;
  }

  function wakeTheParty(party) {
    if (party.classList.contains('is-awake')) return;

    party.classList.add('is-awake');

    /* A little confetti from the machines themselves. */
    if (global.Pixel && global.Pixel.burst && !motionOff()) {
      var kids = party.querySelectorAll('.party__one');

      for (var i = 0; i < kids.length; i++) {
        var k = kids[i].getBoundingClientRect();
        global.Pixel.burst(k.left + k.width / 2, k.top + k.height / 2, 14);
      }
    }
  }

  function motionOff() {
    return doc.documentElement.getAttribute('data-motion') === 'off';
  }

  /* ------------------------------------------------------------------ *
   * Boot
   * ------------------------------------------------------------------ */
  function build() {
    /* --- the scene layer --- */
    var scene = doc.createElement('div');
    scene.className = 'scene';
    scene.setAttribute('aria-hidden', 'true');

    var grid = doc.createElement('div');
    grid.className = 'scene__grid';

    var dustCanvas = doc.createElement('canvas');
    dustCanvas.className = 'scene__dust';

    var flyHost = doc.createElement('div');
    flyHost.className = 'scene__fly';

    scene.appendChild(grid);
    scene.appendChild(dustCanvas);
    scene.appendChild(flyHost);
    doc.body.insertBefore(scene, doc.body.firstChild);

    var flyers = buildFlyers(flyHost);

    /* --- the party, at the very bottom, after the footer --- */
    var party = buildParty();
    var foot = doc.querySelector('.foot');

    if (foot && foot.parentNode) {
      foot.parentNode.insertBefore(party, foot.nextSibling);
    } else {
      doc.body.appendChild(party);
    }

    /* Wake them when the party itself is properly on screen — which, sitting
     * below the footer, means the visitor has reached the end of the page. */
    if (global.IntersectionObserver) {
      var io = new global.IntersectionObserver(function (entries) {
        if (entries[0].isIntersecting) {
          wakeTheParty(party);
          io.disconnect();
        }
      }, { threshold: 0.55 });

      io.observe(party);
    } else {
      wakeTheParty(party);
    }

    /* --- parallax + the animation subscriptions --- */
    var dust = new Dust(dustCanvas);
    var lastShift = null;

    function parallax() {
      var shift = Math.round(global.scrollY * -0.12);
      if (shift === lastShift) return;
      lastShift = shift;
      grid.style.transform = 'translate3d(0,' + shift + 'px,0)';
    }

    parallax();

    if (!global.Pixel) return;

    global.Pixel.ticker.add(function (dt, now) {
      parallax();

      if (!global.Pixel.motionOn()) return;

      dust.step(dt, now);

      var w = global.innerWidth;

      for (var i = 0; i < flyers.length; i++) {
        var f = flyers[i];

        /* A full crossing, plus a sprite's width of margin at each end so
         * nothing ever pops into existence mid-screen. */
        var span = w + 160;
        var travelled = ((now / 1000) * f.speed + f.offset) % span;
        var x = f.dir > 0 ? travelled - 80 : span - travelled - 80;

        f.el.style.transform =
          'translate3d(' + (Math.round(x / 3) * 3) + 'px,0,0)' +
          (f.dir > 0 ? '' : ' scaleX(-1)');
      }
    });

    global.Pixel.onMotionChange.push(function (on) {
      if (on) return;
      dust.ctx.clearRect(0, 0, dust.w, dust.h);
    });
  }

  if (doc.readyState === 'loading') {
    doc.addEventListener('DOMContentLoaded', build);
  } else {
    build();
  }
})(window);
