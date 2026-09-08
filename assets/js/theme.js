/* CIRCUIT — the pull cord
 *
 * A chain hangs from the top corner of every page with a ring on the end.
 * Pull it and the lights come on: the whole site swaps from the dark cabinet
 * palette to the lit one. The choice is remembered.
 *
 * Underneath the chain is a real <button> with aria-pressed, so it works from
 * a keyboard and announces what it did. The chain is decoration on top of it.
 */
(function (global) {
  'use strict';

  var doc = global.document;
  var KEY = 'circuit.theme';

  function stored() {
    try { return global.localStorage.getItem(KEY); } catch (err) { return null; }
  }

  function save(value) {
    try { global.localStorage.setItem(KEY, value); } catch (err) { /* private mode */ }
  }

  /* The mark is a metal wing: spread when the lights are on, folded shut when
   * they are off. Both states are sprites, so the swap is a class change. */
  function paintWing(theme) {
    var hosts = doc.querySelectorAll('[data-wing]');
    var want = theme === 'light' ? 'wing-open' : 'wing-shut';

    for (var i = 0; i < hosts.length; i++) {
      if (hosts[i].getAttribute('data-sprite') === want) continue;

      hosts[i].setAttribute('data-sprite', want);
      hosts[i].classList.remove('is-flexing');

      /* Re-trigger the flex animation by forcing a reflow between removing
       * and re-adding the class. */
      void hosts[i].offsetWidth;
      hosts[i].classList.add('is-flexing');

      if (global.Pixel && global.Pixel.remount) global.Pixel.remount(hosts[i]);
    }
  }

  function apply(theme) {
    doc.documentElement.setAttribute('data-theme', theme);
    paintWing(theme);

    /* Keep the browser chrome in step with the room. */
    var meta = doc.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', theme === 'light' ? '#E9E6F5' : '#07060E');
  }

  function current() {
    return doc.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
  }

  function build() {
    var btn = doc.createElement('button');
    btn.type = 'button';
    btn.className = 'cord';
    btn.setAttribute('data-cord', '');

    var bulb = doc.createElement('span');
    bulb.className = 'cord__bulb';
    bulb.setAttribute('aria-hidden', 'true');

    var wire = doc.createElement('span');
    wire.className = 'cord__wire';
    wire.setAttribute('aria-hidden', 'true');

    var ring = doc.createElement('span');
    ring.className = 'cord__ring';
    ring.setAttribute('aria-hidden', 'true');

    var label = doc.createElement('span');
    label.className = 'sr-only';

    btn.appendChild(bulb);
    btn.appendChild(wire);
    btn.appendChild(ring);
    btn.appendChild(label);

    /* A toggle button keeps ONE name and lets aria-pressed carry the state.
     * Changing both at once tells a screen-reader user two contradictory
     * things in the same breath. The lit bulb is the visual state. */
    label.textContent = 'Lights';

    function paint() {
      btn.setAttribute('aria-pressed', current() === 'light' ? 'true' : 'false');
    }

    btn.addEventListener('click', function () {
      var next = current() === 'light' ? 'dark' : 'light';

      apply(next);
      save(next);
      paint();

      /* The chain gives, then springs back, and the whole thing swings. */
      btn.classList.add('is-pulled');
      global.setTimeout(function () { btn.classList.remove('is-pulled'); }, 160);
      swing(btn);

      /* Sprites are painted from CSS custom properties resolved at draw time,
       * so a theme change has to repaint them or they keep the old palette. */
      if (global.Pixel && global.Pixel.repaint) global.Pixel.repaint();

      doc.dispatchEvent(new global.CustomEvent('circuit:theme', { detail: { theme: next } }));
    });

    /* Swing it whenever it is touched, not only when it is pulled. */
    btn.addEventListener('pointerenter', function () { swing(btn); });

    paint();

    /* Mount it after the header rather than at the end of the body. It is
     * painted in the top corner from the first frame, so a keyboard user
     * should reach it there too, not after the entire page and footer. */
    var hud = doc.querySelector('.hud');

    if (hud && hud.parentNode === doc.body) {
      doc.body.insertBefore(btn, hud.nextSibling);
    } else {
      doc.body.insertBefore(btn, doc.body.firstChild);
    }

    paintWing(current());
  }

  var swingTimer = null;

  function swing(btn) {
    if (doc.documentElement.getAttribute('data-motion') === 'off') return;

    btn.classList.remove('is-swinging');
    void btn.offsetWidth;
    btn.classList.add('is-swinging');

    if (swingTimer) global.clearTimeout(swingTimer);
    swingTimer = global.setTimeout(function () {
      btn.classList.remove('is-swinging');
    }, 1400);
  }

  /* Set the theme before first paint so the page never flashes the wrong one.
   * This file is loaded in <head> order but runs at parse time; the attribute
   * lands on <html>, which exists by then. */
  var saved = stored();
  var prefersLight = global.matchMedia &&
    global.matchMedia('(prefers-color-scheme: light)').matches;

  apply(saved === 'light' || saved === 'dark' ? saved : (prefersLight ? 'light' : 'dark'));

  if (doc.readyState === 'loading') {
    doc.addEventListener('DOMContentLoaded', build);
  } else {
    build();
  }

  global.CircuitTheme = { apply: apply, current: current };
})(window);
