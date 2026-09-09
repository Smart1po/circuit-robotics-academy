/* CIRCUIT — the home page, made of things you press
 *
 * The content did not shrink; it stopped arriving all at once. Four units and
 * twelve weeks used to be nine paragraphs stacked up the page. Now they are a
 * row of tiles and a row of weeks, and you get one answer at a time — the one
 * you asked for.
 *
 * Everything here degrades to plain text: without JavaScript the panels are
 * empty rather than broken, and the questions below are native <details>, so
 * they open and close with no script at all.
 */
(function (global) {
  'use strict';

  var doc = global.document;

  /* ------------------------------------------------------------------ *
   * Four units, one at a time
   * ------------------------------------------------------------------ */
  var UNITS = [
    {
      title: 'Unit 01 · Build &amp; Drive',
      line: 'Gear ratios, torque, and why a fast robot loses to a straight one.',
      out: 'A chassis that drives three metres straight — and the logbook page saying how far off it was on the first go.'
    },
    {
      title: 'Unit 02 · Circuits &amp; Soldering',
      line: 'Multimeter first, iron second. Nothing gets power until they can explain every leg of it.',
      out: 'A sensor board they soldered and tested themselves.'
    },
    {
      title: 'Unit 03 · Sensors, Code &amp; Vision',
      line: 'A proportional controller instead of a stack of if-statements. APEX adds a camera.',
      out: 'A robot that follows a line without wobbling, and code they can explain line by line.'
    },
    {
      title: 'Unit 04 · Drone Systems',
      line: 'Prop pitch, centre of gravity, and a pre-flight check that happens every single time.',
      out: 'A completed checklist and a supervised hover they flew themselves.'
    }
  ];

  function showUnit(i) {
    var panel = doc.getElementById('unit-panel');
    if (!panel) return;

    var u = UNITS[i] || UNITS[0];

    panel.innerHTML =
      '<p class="card__no">' + u.title + '</p>' +
      '<p class="t-lead" style="margin-top:12px">' + u.line + '</p>' +
      '<p class="card__out">They leave with: <b>' + u.out + '</b></p>';

    var tiles = doc.querySelectorAll('.picker__tile');
    for (var t = 0; t < tiles.length; t++) {
      tiles[t].setAttribute('aria-selected', t === i ? 'true' : 'false');
    }
  }

  function initUnits() {
    var tiles = doc.querySelectorAll('.picker__tile');
    if (!tiles.length) return;

    for (var i = 0; i < tiles.length; i++) {
      tiles[i].addEventListener('click', function () {
        showUnit(parseInt(this.getAttribute('data-unit'), 10));
      });
    }

    showUnit(0);
  }

  /* ------------------------------------------------------------------ *
   * Twelve weeks, one at a time
   * Four stages, colour-coded, so the shape of a term is visible before a
   * single word is read.
   * ------------------------------------------------------------------ */
  var WEEKS = [
    { s: 'build',   t: 'Chassis goes together, comes apart, goes together better.' },
    { s: 'build',   t: 'Distance per motor rotation measured, and written down.' },
    { s: 'build',   t: 'The numbers disagree with the tape measure. Rebuild.' },
    { s: 'control', t: 'Sensor board wired at Bench B.' },
    { s: 'control', t: 'Soldered, then tested with a multimeter before power.' },
    { s: 'control', t: 'Line following. The robot starts doing what it measures.' },
    { s: 'control', t: 'Tuning the gain. Wobble out, corner held.' },
    { s: 'control', t: 'A state machine for the mission run.' },
    { s: 'flight',  t: 'Flight Bay. Airframes and pre-flight checks.' },
    { s: 'flight',  t: 'A supervised hover, flown by them.' },
    { s: 'run',     t: 'Full dry run on the mat at competition timing.' },
    { s: 'run',     t: 'The real thing. Two attempts, best one counts.' }
  ];

  var STAGE_NAME = {
    build: 'Stage 1 · Build',
    control: 'Stage 2 · Control',
    flight: 'Stage 3 · Flight',
    run: 'Stage 4 · Run'
  };

  function showWeek(i) {
    var panel = doc.getElementById('week-panel');
    if (!panel) return;

    var w = WEEKS[i];

    panel.innerHTML =
      '<p class="stage__tag">Week ' + (i + 1) + ' · ' + STAGE_NAME[w.s] + '</p>' +
      '<p class="t-lead" style="margin-top:8px">' + w.t + '</p>';

    var cells = doc.querySelectorAll('.weeks__cell');
    for (var c = 0; c < cells.length; c++) {
      cells[c].setAttribute('aria-selected', c === i ? 'true' : 'false');
    }
  }

  function initWeeks() {
    var row = doc.getElementById('weeks');
    if (!row) return;

    for (var i = 0; i < WEEKS.length; i++) {
      var b = doc.createElement('button');
      b.type = 'button';
      b.className = 'weeks__cell weeks__cell--' + WEEKS[i].s;
      b.setAttribute('role', 'tab');
      b.setAttribute('aria-selected', 'false');
      b.setAttribute('data-week', String(i));
      b.textContent = String(i + 1);
      row.appendChild(b);
    }

    row.addEventListener('click', function (e) {
      var n = e.target && e.target.getAttribute && e.target.getAttribute('data-week');
      if (n !== null && n !== undefined) showWeek(parseInt(n, 10));
    });

    /* Hovering is browsing; it should show you things without a commitment. */
    row.addEventListener('mouseover', function (e) {
      var n = e.target && e.target.getAttribute && e.target.getAttribute('data-week');
      if (n !== null && n !== undefined) showWeek(parseInt(n, 10));
    });

    showWeek(0);
  }

  /* ------------------------------------------------------------------ *
   * The numbers count up when they arrive
   * ------------------------------------------------------------------ */
  function initCounters() {
    var cells = doc.querySelectorAll('[data-count]');
    if (!cells.length || !global.IntersectionObserver) return;

    if (doc.documentElement.getAttribute('data-motion') === 'off') return;

    var io = new global.IntersectionObserver(function (entries) {
      for (var i = 0; i < entries.length; i++) {
        if (!entries[i].isIntersecting) continue;

        (function (el) {
          var target = parseInt(el.getAttribute('data-count'), 10);
          var n = 0;

          var tick = global.setInterval(function () {
            n++;
            el.textContent = String(n);
            if (n >= target) global.clearInterval(tick);
          }, Math.max(40, 420 / Math.max(target, 1)));
        })(entries[i].target);

        io.unobserve(entries[i].target);
      }
    }, { threshold: 0.4 });

    for (var k = 0; k < cells.length; k++) io.observe(cells[k]);
  }

  function boot() {
    initUnits();
    initWeeks();
    initCounters();
  }

  if (doc.readyState === 'loading') {
    doc.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})(window);
