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

  function apply(theme) {
    doc.documentElement.setAttribute('data-theme', theme);

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

    function paint() {
      var lit = current() === 'light';
      btn.setAttribute('aria-pressed', lit ? 'true' : 'false');
      label.textContent = lit ? 'Turn the lights off' : 'Turn the lights on';
    }

    btn.addEventListener('click', function () {
      var next = current() === 'light' ? 'dark' : 'light';

      apply(next);
      save(next);
      paint();

      /* The chain gives, then springs back. */
      btn.classList.add('is-pulled');
      global.setTimeout(function () { btn.classList.remove('is-pulled'); }, 160);

      /* Sprites are painted from CSS custom properties resolved at draw time,
       * so a theme change has to repaint them or they keep the old palette. */
      if (global.Pixel && global.Pixel.repaint) global.Pixel.repaint();

      doc.dispatchEvent(new global.CustomEvent('circuit:theme', { detail: { theme: next } }));
    });

    paint();
    doc.body.appendChild(btn);
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
