/* CIRCUIT — the one on the door
 *
 * He paces the width of the sign-in panel, turns at each end, and every so
 * often stops, puts a hand up, goes red-eyed and says something. Then he goes
 * back to walking.
 *
 * Everything he says is true of this page. A guard who warns you about things
 * that are not happening is decoration; this one is the notice, delivered by
 * something you will actually look at.
 */
(function (global) {
  'use strict';

  var doc = global.document;

  var LINES = [
    'Members only past this point.',
    'Do not give me a password you use anywhere else.',
    'I check every badge. Every time.',
    'New here? Create an account. I will wait.',
    'Your password goes to the server and is never written down here.',
    'Nobody gets in on somebody else\u2019s name.'
  ];

  var WALK_MS = 5200;    /* one length of the panel   */
  var WARN_EVERY = 9000; /* how often he stops to talk */
  var WARN_FOR = 3400;   /* how long he holds it       */

  function boot() {
    var host = doc.getElementById('guard');
    var say = doc.getElementById('guard-say');
    var beat = doc.querySelector('.guard__beat');
    if (!host || !beat) return;

    var line = 0;
    var warning = false;

    /* What he SAYS is content, not decoration, so it appears whether or not
     * motion is switched on. Only the pacing is motion — and the CSS stops
     * that on its own. */
    function warn() {
      if (warning) return;
      warning = true;

      host.setAttribute('data-sprite', 'guard-halt');
      if (global.Pixel && global.Pixel.remount) global.Pixel.remount(host);

      beat.classList.add('is-halted');

      if (say) {
        say.textContent = LINES[line % LINES.length];
        say.classList.add('is-up');
        line++;
      }

      global.setTimeout(function () {
        host.setAttribute('data-sprite', 'guard');
        if (global.Pixel && global.Pixel.remount) global.Pixel.remount(host);

        beat.classList.remove('is-halted');
        if (say) say.classList.remove('is-up');

        warning = false;
      }, WARN_FOR);
    }

    /* He says the first one early — a guard who waits nine seconds before
     * mentioning the password rule has already missed the moment. */
    global.setTimeout(warn, 1600);
    global.setInterval(warn, WARN_EVERY);

    /* Touch him and he stops and tells you something, rather than ignoring
     * you and carrying on walking. */
    host.addEventListener('pointerenter', warn);

    beat.style.setProperty('--walk', WALK_MS + 'ms');
  }

  if (doc.readyState === 'loading') {
    doc.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})(window);
