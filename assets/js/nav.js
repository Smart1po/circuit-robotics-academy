/* CIRCUIT — going somewhere
 *
 * Two things live here:
 *
 *   1. The bird. Click a link that leaves the page and a metal bird flies
 *      across while the next page loads. It has a wise stare and blue eyes,
 *      and it is the only loading screen on the site.
 *   2. The rope back to the top, for when you have read all the way down and
 *      would rather not scroll all the way up.
 *
 * The bird never blocks a navigation. It is a short cover over a page change
 * that was going to happen anyway, and if anything at all goes wrong the link
 * still works exactly as a link.
 */
(function (global) {
  'use strict';

  var doc = global.document;
  var FLIGHT = 620;   /* ms of bird before the browser is asked to navigate */

  function motionOff() {
    return doc.documentElement.getAttribute('data-motion') === 'off';
  }

  /* ------------------------------------------------------------------ *
   * 1. The bird
   * ------------------------------------------------------------------ */
  function buildBird() {
    var veil = doc.createElement('div');
    veil.className = 'veil';
    veil.id = 'veil';
    veil.hidden = true;
    veil.setAttribute('role', 'status');
    veil.setAttribute('aria-live', 'polite');

    var stage = doc.createElement('div');
    stage.className = 'veil__stage';

    var bird = doc.createElement('span');
    bird.className = 'veil__bird sprite';
    bird.setAttribute('data-sprite', 'bird');
    bird.setAttribute('data-scale', '5');

    var word = doc.createElement('p');
    word.className = 'veil__word';
    word.textContent = 'On the way…';

    stage.appendChild(bird);
    stage.appendChild(word);
    veil.appendChild(stage);
    doc.body.appendChild(veil);

    return veil;
  }

  /* A link counts as "leaving" only if it really is going somewhere else on
   * this site, in this tab, without a modifier key held. */
  function leavesThePage(a, e) {
    if (e.defaultPrevented) return false;
    if (e.button !== 0) return false;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return false;

    if (!a.href) return false;
    if (a.target && a.target !== '_self') return false;
    if (a.hasAttribute('download')) return false;

    var url;
    try {
      url = new global.URL(a.href, global.location.href);
    } catch (err) {
      return false;
    }

    if (url.origin !== global.location.origin) return false;
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return false;

    /* A jump to an anchor on this same page is not going anywhere. */
    if (url.pathname === global.location.pathname && url.hash) return false;
    if (url.href === global.location.href) return false;

    return url.href;
  }

  function initBird() {
    var veil = buildBird();
    var flying = false;

    doc.addEventListener('click', function (e) {
      if (flying) return;

      var a = e.target && e.target.closest ? e.target.closest('a[href]') : null;
      if (!a) return;

      var to = leavesThePage(a, e);
      if (!to) return;

      /* With motion off there is no bird and no delay — just the link. */
      if (motionOff()) return;

      e.preventDefault();
      flying = true;

      veil.hidden = false;
      /* Reflow between unhide and class add, so the entrance actually plays. */
      void veil.offsetWidth;
      veil.classList.add('is-flying');

      /* The navigation is the point; the bird is the cover. If anything at
       * all delays it, the timeout still fires and the page still changes. */
      global.setTimeout(function () {
        global.location.href = to;
      }, FLIGHT);
    });

    /* Coming back via the Back button restores a cached page with the veil
     * still up. Take it down. */
    global.addEventListener('pageshow', function () {
      veil.classList.remove('is-flying');
      veil.hidden = true;
      flying = false;
    });
  }

  /* ------------------------------------------------------------------ *
   * 2. Back to the top
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
      global.scrollTo({
        top: 0,
        behavior: motionOff() ? 'auto' : 'smooth'
      });

      /* Send focus back where the page starts, so a keyboard user actually
       * goes to the top rather than just watching it scroll there. */
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
    initBird();
    initTop();
  }

  if (doc.readyState === 'loading') {
    doc.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})(window);
