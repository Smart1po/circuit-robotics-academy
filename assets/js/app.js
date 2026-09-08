/* CIRCUIT — page wiring
 *
 * Boots the bitmap type and the sprite cast, drives the rails, and handles
 * the one form on the site. Nothing here talks to a network, because there
 * is nothing to talk to.
 */
(function (global) {
  'use strict';

  var doc = global.document;

  /* Demo figures. One number, used everywhere it appears, so the picture and
   * the words can never disagree with each other. */
  var TERM_WEEKS = 12;
  var WEEK_NOW = 7;

  /* ------------------------------------------------------------------ *
   * The motion switch
   * The OS preference decides the default. The footer button overrides it
   * and the choice is remembered — that is the only thing this site keeps
   * beyond the tab, and it is a preference, not a person.
   * ------------------------------------------------------------------ */
  function initMotionToggle() {
    var btn = doc.querySelector('[data-motion-toggle]');
    var html = doc.documentElement;
    var prefersReduce = global.matchMedia &&
      global.matchMedia('(prefers-reduced-motion: reduce)').matches;

    var saved = null;
    try { saved = global.localStorage.getItem('circuit.motion'); } catch (err) { /* private mode */ }

    /* The visitor's own choice wins over the OS default, in both directions.
     * Someone who has turned motion back on should not have it turned off
     * again on every page they open. */
    var off = saved === 'off' || (saved === null && prefersReduce);
    html.setAttribute('data-motion', off ? 'off' : 'on');

    if (!btn) return;

    /* This button's visible words ARE its state, so it does not also carry
     * aria-pressed. A control that changes its name and its pressed state in
     * the same breath announces a contradiction. */
    btn.removeAttribute('aria-pressed');

    function paint() {
      var isOff = html.getAttribute('data-motion') === 'off';
      btn.textContent = isOff ? 'MOTION: OFF' : 'MOTION: ON';
    }

    btn.addEventListener('click', function () {
      var nowOff = html.getAttribute('data-motion') !== 'off';
      html.setAttribute('data-motion', nowOff ? 'off' : 'on');

      try { global.localStorage.setItem('circuit.motion', nowOff ? 'off' : 'on'); } catch (err) {}
      if (global.Pixel) global.Pixel.setMotion(!nowOff);
      paint();
    });

    paint();
  }

  function motionOff() {
    return doc.documentElement.getAttribute('data-motion') === 'off';
  }

  /* ------------------------------------------------------------------ *
   * Rails — BOLT drives along one, in hard pixel steps.
   * A smooth glide would break the pixel language instantly, so the
   * position is snapped to 4px before it is written.
   * ------------------------------------------------------------------ */
  function initRails() {
    var rails = doc.querySelectorAll('[data-rail]');
    if (!rails.length || !global.Pixel) return;

    var cars = [];

    for (var i = 0; i < rails.length; i++) {
      var car = rails[i].querySelector('.rail__car');
      if (car) cars.push({ rail: rails[i], car: car, phase: i * 3 });
    }

    if (!cars.length) return;

    /* Measure once, not every frame. Reading clientWidth inside the animation
     * loop forces the browser to recompute layout sixty times a second, which
     * is the difference between a smooth page and a page that judders. */
    function measure() {
      for (var k = 0; k < cars.length; k++) {
        cars[k].run = cars[k].rail.clientWidth - cars[k].car.offsetWidth;
      }
    }

    measure();

    var t0 = null;
    global.addEventListener('resize', function () {
      if (t0) global.clearTimeout(t0);
      t0 = global.setTimeout(measure, 150);
    }, { passive: true });

    global.Pixel.onMotionChange.push(function (on) {
      if (on) return;
      for (var m = 0; m < cars.length; m++) {
        cars[m].car.style.transform = '';
        cars[m].last = null;
      }
    });

    global.Pixel.ticker.add(function (dt, now) {
      if (!global.Pixel.motionOn()) return;

      for (var j = 0; j < cars.length; j++) {
        var c = cars[j];
        if (!c.run || c.run <= 0) continue;

        /* A 22-second round trip: slow enough to be ambient, not a distraction. */
        var t = ((now / 1000) + c.phase) % 22;
        var p = t < 11 ? t / 11 : 1 - (t - 11) / 11;
        var x = Math.round((c.run * p) / 4) * 4;

        if (x === c.last) continue;   /* nothing moved this frame */
        c.last = x;
        c.car.style.transform = 'translate3d(' + x + 'px,0,0)';
      }
    });
  }

  /* ------------------------------------------------------------------ *
   * Login
   * ------------------------------------------------------------------ */
  /* Where to send someone after they log in. The value arrives in the URL, so
   * it is checked against a list of pages this site actually has. Sending a
   * visitor to whatever a query string asks for is how open redirects happen,
   * and a query string is the one input on this page a stranger controls. */
  function nextPage() {
    /* An array, not an object. A bare object literal inherits from
     * Object.prototype, so ?next=constructor would have passed a truthiness
     * test on allowed[want] and sent the visitor to constructor.html. */
    var allowed = ['dashboard.html', 'members.html', 'dashboard', 'members'];
    var match = /[?&]next=([^&]+)/.exec(global.location.search || '');
    var want = '';

    if (match) {
      /* A malformed percent-escape makes decodeURIComponent throw, and this
       * runs inside the submit handler. An uncaught throw here would leave a
       * visitor signed in on a page that then never navigates anywhere. */
      try {
        want = decodeURIComponent(match[1]);
      } catch (err) {
        want = '';
      }
    }

    if (allowed.indexOf(want) === -1) return 'dashboard.html';
    return want.indexOf('.html') > -1 ? want : want + '.html';
  }

  function initLogin() {
    var form = doc.getElementById('login-form');
    if (!form) return;

    /* The button ships disabled in the HTML. Nothing on this form can work
     * without JavaScript, and a button that looks alive but does nothing is
     * worse than one that says so. Reaching this line proves JS is running. */
    var submit = form.querySelector('button[type="submit"]');
    if (submit) {
      submit.disabled = false;
      submit.removeAttribute('aria-disabled');
    }

    var email = doc.getElementById('email');
    var pass = doc.getElementById('password');
    var summary = doc.getElementById('errsum');
    var list = doc.getElementById('errsum-list');

    /* Read the base description once, before anything overwrites it, so the
     * error id can be added and removed without eating the hint. */
    function baseDescribedBy(input) {
      if (!input.__baseDesc) {
        input.__baseDesc = input.getAttribute('aria-describedby') || '';
      }
      return input.__baseDesc;
    }

    function setBad(input, bad) {
      var field = input.closest('.field');
      if (field) field.classList.toggle('field--bad', bad);

      input.setAttribute('aria-invalid', bad ? 'true' : 'false');

      var base = baseDescribedBy(input);
      var errId = input.id + '-err';

      /* Point the input at its own error text, so a screen reader reads the
       * message when focus lands on the field — not only in the summary. */
      input.setAttribute('aria-describedby', bad ? (base + ' ' + errId).trim() : base);
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var problems = [];

      if (!email.value.trim()) {
        problems.push(['email', 'Email — enter an email address so we know what to call you.']);
      }

      /* The password is checked for length and nothing else. Its value is
       * never assigned to a variable, never logged, never stored, never sent. */
      if (!pass.value.length) {
        problems.push(['password', 'Password — type anything at all; it is not checked.']);
      }

      setBad(email, false);
      setBad(pass, false);

      if (problems.length) {
        list.innerHTML = '';

        for (var i = 0; i < problems.length; i++) {
          var li = doc.createElement('li');
          var a = doc.createElement('a');
          a.href = '#' + problems[i][0];
          a.textContent = problems[i][1];
          li.appendChild(a);
          list.appendChild(li);

          setBad(doc.getElementById(problems[i][0]), true);
        }

        summary.querySelector('h2').textContent =
          problems.length === 1 ? '1 thing needs filling in' : problems.length + ' things need filling in';

        summary.setAttribute('data-open', 'true');
        summary.focus();
        return;
      }

      summary.setAttribute('data-open', 'false');

      /* If the browser refuses storage - private mode, or blocked cookies -
       * the session cannot be written, the gate on the next page bounces the
       * visitor straight back here, and the loop has no visible cause. Say it
       * instead of letting them bounce. */
      if (!global.CircuitSession.start(email.value)) {
        list.innerHTML = '';

        var stuck = doc.createElement('li');
        stuck.textContent = 'This browser will not let the site remember anything for ' +
          'this tab, so the members area cannot open. Private browsing usually causes it.';
        list.appendChild(stuck);

        summary.querySelector('h2').textContent = 'Cannot sign in on this browser';
        summary.setAttribute('data-open', 'true');
        summary.focus();
        return;
      }

      global.location.href = nextPage();
    });
  }

  /* ------------------------------------------------------------------ *
   * Members-only pages
   * ------------------------------------------------------------------ */
  function initGuarded() {
    var page = doc.body.getAttribute('data-page');
    if (page !== 'dashboard' && page !== 'members') return;

    /* location.replace, not assign — a bounced visitor's Back button should
     * take them where they came from, not back into the bounce. */
    /* If session.js failed to load there is no way to tell who is signed in,
     * so fail closed rather than rendering member content to whoever is here. */
    if (!global.CircuitSession) {
      global.location.replace('login.html');
      return;
    }

    var session = global.CircuitSession.require('login.html');
    if (!session) return;

    var names = doc.querySelectorAll('[data-member-name]');
    for (var i = 0; i < names.length; i++) {
      names[i].textContent = session.name;
    }

    /* The greeting is bitmap type, so the pixel version gets the name too. */
    var greet = doc.getElementById('greeting');
    if (greet) {
      greet.setAttribute('data-px', 'WELCOME BACK|' + session.name);
      var sr = greet.querySelector('.sr-only');
      if (sr) sr.textContent = 'Welcome back, ' + session.name;
      else greet.textContent = 'Welcome back, ' + session.name;
    }

    var out = doc.querySelector('[data-logout]');
    if (out) {
      out.addEventListener('click', function (e) {
        e.preventDefault();
        global.CircuitSession.end();
        global.location.href = 'index.html';
      });
    }
  }

  /* Twelve cells, seven lit, the seventh flagged as current. Both the cells
   * and the "week 7 of 12" sentence read the same two numbers. */
  function initMeter() {
    var meter = doc.getElementById('meter');
    if (!meter) return;

    for (var i = 1; i <= TERM_WEEKS; i++) {
      var cell = doc.createElement('span');
      cell.className = 'meter__cell';
      if (i <= WEEK_NOW) cell.setAttribute('data-on', 'true');
      if (i === WEEK_NOW) cell.setAttribute('data-now', 'true');
      meter.appendChild(cell);
    }

    meter.setAttribute('role', 'img');
    meter.setAttribute('aria-label', 'Week ' + WEEK_NOW + ' of ' + TERM_WEEKS + ' in the term.');

    var readout = doc.getElementById('meter-readout');
    if (readout) readout.textContent = 'WEEK ' + WEEK_NOW + ' OF ' + TERM_WEEKS;
  }

  /* ------------------------------------------------------------------ *
   * Boot
   * ------------------------------------------------------------------ */
  function boot() {
    initMotionToggle();
    initGuarded();
    initMeter();
    initLogin();

    if (global.PixFont) {
      global.PixFont.renderAll();
      global.PixFont.watch();
    }

    if (global.Pixel) {
      global.Pixel.mountAll();
      initRails();
      global.Pixel.startGlitter(['#58E7FF', '#7B72D4', '#B4FF3D', '#FFC247']);

      /* Built either way, then switched to wherever the visitor left it. That
       * is what lets the footer button work without a page reload. */
      global.Pixel.setMotion(!motionOff());
    }
  }

  if (doc.readyState === 'loading') {
    doc.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})(window);
