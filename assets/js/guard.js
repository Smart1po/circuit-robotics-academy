/* CIRCUIT — the members-only gate
 *
 * Runs in <head>, before the body is parsed, so a page that is not allowed to
 * open never paints a single pixel of member content first.
 *
 * Be honest about what this is: it is a front-end gate on a front-end mockup.
 * It stops a visitor wandering in, and that is all it stops. Anyone can read
 * the source of a deployed page, so this is a door, not a lock. Tomorrow, when
 * there is a server, the check moves behind it and starts meaning something.
 */
(function (global) {
  'use strict';

  var html = global.document.documentElement;

  if (html.getAttribute('data-guard') !== 'members') return;

  /* Fail closed. If session.js did not load, the gate cannot tell whether
   * anyone is signed in, and "cannot tell" must never mean "come in". */
  if (!global.CircuitSession) {
    global.location.replace('login.html');
    return;
  }

  if (!global.CircuitSession.read()) {
    global.location.replace('login.html?next=' + encodeURIComponent(
      global.location.pathname.split('/').pop() || 'dashboard.html'
    ));
  }
})(window);
