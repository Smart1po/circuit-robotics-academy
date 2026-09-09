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

  /* The real thing. Try to sign in; if this address has never been seen
   * before, create the account instead. Either way the password is handled
   * by the server and this site never holds it. */
  function signInForReal(email, password, submit, summary, list) {
    var B = global.CircuitBackend;

    function fail(message) {
      list.innerHTML = '';
      var li = doc.createElement('li');
      li.textContent = message;
      list.appendChild(li);
      summary.querySelector('h2').textContent = 'Could not sign you in';
      summary.setAttribute('data-open', 'true');
      summary.focus();

      if (submit) { submit.disabled = false; submit.textContent = 'Sign in'; }
    }

    if (submit) { submit.disabled = true; submit.textContent = 'Signing in…'; }

    B.signIn(email, password)['catch'](function (err) {
      /* "Invalid login credentials" covers both a wrong password and an
       * address the server has never seen. Try creating it; if THAT fails
       * because it already exists, the password really was wrong. */
      if (err.status !== 400 && err.status !== 401) throw err;

      return B.signUp(email, password).then(function (data) {
        /* No token means the project asks people to confirm their address
         * first. That is not a failure — it is the account being created
         * properly — so it must not be dressed up as an error. */
        if (!data || !data.access_token) {
          var e = new Error('confirm-sent');
          e.confirmSent = true;
          throw e;
        }
        return data;
      });
    }).then(function () {
      return B.me();
    }).then(function (user) {
      var name = (user && user.user_metadata && user.user_metadata.display_name) ||
                 global.CircuitSession.nameFromEmail(email);

      global.CircuitSession.start(email, true);

      /* Put them on the shared list, so everybody else sees them too. */
      return B.joinMembers(name)['catch'](function () {})
        .then(function () { global.location.href = nextPage(); });
    })['catch'](function (err) {
      if (err && err.confirmSent) return confirmSent(email);
      fail(err && err.message ? err.message : 'Something went wrong. Try again.');
    });
  }

  /* An account was made and needs confirming. This is good news, so it reads
   * as good news: the form is replaced, not decorated with a red box. */
  function confirmSent(email) {
    var cabinet = doc.querySelector('.cabinet .frame');
    if (!cabinet) return;

    cabinet.innerHTML = '';

    var h = doc.createElement('h1');
    h.className = 'px px--head';
    h.setAttribute('data-px', 'CHECK YOUR|INBOX');
    h.setAttribute('data-px-align', 'center');
    h.setAttribute('data-px-max', '6');
    h.textContent = 'Check your inbox';

    var p1 = doc.createElement('p');
    p1.className = 't-lead';
    p1.style.marginTop = '24px';
    p1.textContent = 'Your account is made. We have sent a link to ' + email +
      ' — click it and you are a member.';

    var p2 = doc.createElement('p');
    p2.className = 'notice';
    p2.style.marginTop = '20px';
    p2.textContent = 'Nothing else to do here. Once you have clicked the link, ' +
      'come back and sign in with the same address and password.';

    var back = doc.createElement('p');
    back.style.marginTop = '24px';
    var a = doc.createElement('a');
    a.href = 'index.html';
    a.textContent = '← Back to home';
    back.appendChild(a);

    cabinet.appendChild(h);
    cabinet.appendChild(p1);
    cabinet.appendChild(p2);
    cabinet.appendChild(back);

    if (global.PixFont) global.PixFont.render(h);
  }

  /* An escape hatch on the one page where a remembered address is visible.
   * A kept session outlives the browser, so there has to be a way to end it
   * from outside the members area — otherwise the only way out of somebody
   * else's session is to know to go and find the Log out button inside it. */
  function showForgetOption(known) {
    var host = doc.querySelector('.keepme');
    if (!host || doc.getElementById('forget-me')) return;

    var wrap = doc.createElement('p');
    wrap.className = 'forget';

    var who = doc.createElement('span');
    who.textContent = 'Signed in as ' + known + ' on this device.';

    var btn = doc.createElement('button');
    btn.type = 'button';
    btn.id = 'forget-me';
    btn.className = 'forget__btn';
    btn.textContent = 'Not you? Forget this device';

    btn.addEventListener('click', function () {
      global.CircuitSession.end();

      var email = doc.getElementById('email');
      var keep = doc.getElementById('keepme');
      if (email) { email.value = ''; email.focus(); }
      if (keep) keep.checked = false;

      wrap.parentNode.removeChild(wrap);
    });

    wrap.appendChild(who);
    wrap.appendChild(btn);
    host.parentNode.insertBefore(wrap, host.nextSibling);
  }

  /* The warning on the form is true only while there is nothing behind it.
   * Once a server is hashing the password, saying "this is a preview, do not
   * use a real password" would itself be the false statement. */
  function tellTheTruthAboutTheForm() {
    if (!global.CircuitBackend || !global.CircuitBackend.configured()) return;

    var notice = doc.querySelector('.notice');
    if (notice) {
      notice.innerHTML = '';
      var b = doc.createElement('b');
      b.textContent = 'This is a real account now.';
      notice.appendChild(b);
      notice.appendChild(doc.createTextNode(
        ' Your password is sent once, hashed on the server, and never stored ' +
        'by this site in any form. A new address signs you up; one we have ' +
        'seen before signs you in.'));
    }

    var hint = doc.getElementById('pw-hint');
    if (hint) hint.textContent = 'At least six characters.';

    var pw = doc.getElementById('password');
    if (pw) pw.setAttribute('autocomplete', 'current-password');
  }

  function initLogin() {
    var form = doc.getElementById('login-form');
    if (!form) return;

    tellTheTruthAboutTheForm();

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
    var keep = doc.getElementById('keepme');

    /* Fill the address in from last time, so a member does not retype it on
     * every visit. Only the address: there is no password to remember, and
     * the box below is deliberately left empty.
     *
     * Guarded, because this runs before the submit button is enabled — an
     * exception here would leave the form permanently dead. */
    var known = global.CircuitSession ? global.CircuitSession.rememberedEmail() : '';

    if (known && !email.value) {
      email.value = known;
      if (keep) keep.checked = true;

      /* Somebody else's address should not be stuck in the box on a shared
       * machine with no way to shift it. */
      showForgetOption(known);
    }
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

      /* With a back end configured, this stops being a mockup: the password
       * goes to a server, is hashed there, and never comes back. Sign in
       * first; a brand new address is a sign-up rather than a failure. */
      if (global.CircuitBackend && global.CircuitBackend.configured()) {
        return signInForReal(email.value, pass.value, submit, summary, list);
      }

      /* If the browser refuses storage - private mode, or blocked cookies -
       * the session cannot be written, the gate on the next page bounces the
       * visitor straight back here, and the loop has no visible cause. Say it
       * instead of letting them bounce. */
      if (!global.CircuitSession.start(email.value, keep && keep.checked)) {
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

        /* End it on the server too, or the token outlives the sign-out and
         * the next visit walks straight back in. */
        if (global.CircuitBackend && global.CircuitBackend.configured()) {
          global.CircuitBackend.signOut()['catch'](function () {})
            .then(function () { global.location.href = 'index.html'; });
          return;
        }

        global.location.href = 'index.html';
      });
    }
  }

  /* The shared list. This panel is the whole difference between a front end
   * and a product, so it stays hidden rather than showing an empty box when
   * there is no back end to fill it from. */
  function initShared() {
    var panel = doc.getElementById('shared-panel');
    if (!panel) return;
    if (!global.CircuitBackend || !global.CircuitBackend.configured()) return;

    panel.hidden = false;

    var list = doc.getElementById('shared-list');
    var count = doc.getElementById('shared-count');

    global.CircuitBackend.listMembers(20).then(function (rows) {
      rows = rows || [];
      count.textContent = rows.length === 1 ? '1 member' : rows.length + ' members';

      list.innerHTML = '';

      for (var i = 0; i < rows.length; i++) {
        var li = doc.createElement('li');

        var who = doc.createElement('b');
        who.className = 't-mark';
        who.textContent = rows[i].display_name;

        li.appendChild(who);
        li.appendChild(doc.createTextNode(' · ' + (rows[i].band || 'SPARK')));
        list.appendChild(li);
      }

      if (!rows.length) {
        count.textContent = 'Nobody yet. You will be the first.';
      }
    })['catch'](function (err) {
      count.textContent = 'Could not reach the members list: ' +
        (err && err.message ? err.message : 'unknown error');
    });
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
   * Reveal
   * A page of solid text is a wall. Each block waits until it is nearly on
   * screen and then arrives, so reading it feels like being handed one thing
   * at a time rather than all of it at once.
   * ------------------------------------------------------------------ */
  function initReveal() {
    var blocks = doc.querySelectorAll('[data-reveal]');
    if (!blocks.length) return;

    /* Without the observer, or with motion off, everything is simply shown.
     * The effect is a nicety; the words are the point. */
    if (!global.IntersectionObserver || motionOff()) return;

    function onScreen(el) {
      var r = el.getBoundingClientRect();
      return r.top < global.innerHeight && r.bottom > 0;
    }

    /* Anything already on screen is revealed before the hidden state is ever
     * applied, so nothing above the fold can flash or, worse, stay blank. */
    var i;
    for (i = 0; i < blocks.length; i++) {
      if (onScreen(blocks[i])) blocks[i].classList.add('is-in');
    }

    doc.documentElement.classList.add('reveal-armed');

    var io = new global.IntersectionObserver(function (entries) {
      for (var j = 0; j < entries.length; j++) {
        if (!entries[j].isIntersecting) continue;
        entries[j].target.classList.add('is-in');
        io.unobserve(entries[j].target);
      }
    }, { rootMargin: '0px 0px -5% 0px', threshold: 0 });

    for (i = 0; i < blocks.length; i++) io.observe(blocks[i]);

    /* Backstop. If the observer somehow never fires for a block that is
     * plainly on screen, show it anyway a moment later. No paragraph on this
     * site is allowed to depend on an animation to become readable. */
    global.setTimeout(function () {
      for (var m = 0; m < blocks.length; m++) {
        if (!blocks[m].classList.contains('is-in') && onScreen(blocks[m])) {
          blocks[m].classList.add('is-in');
        }
      }
    }, 1200);
  }

  /* ------------------------------------------------------------------ *
   * Boot
   * ------------------------------------------------------------------ */
  function boot() {
    initMotionToggle();
    initReveal();
    initGuarded();
    initShared();
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
