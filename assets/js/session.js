/* CIRCUIT — mock session
 *
 * HONEST DESCRIPTION OF WHAT THIS IS:
 * This is a front-end mockup. There is no server, no database and no account.
 * Any email and any password get you in, because there is nothing behind the form.
 *
 * What it stores: one display name, derived from the email you typed, in
 * sessionStorage — the memory of this browser tab only.
 * What it never stores: the password. It is read for a non-empty check and
 * never assigned, never logged, never persisted, never sent anywhere.
 *
 * Close the tab and the "account" is gone. That is not a bug. That is what a
 * front end without a back end actually does.
 */
(function (global) {
  'use strict';

  var KEY = 'circuit.session';

  /* "first.last@example.com" -> "First Last" */
  function nameFromEmail(email) {
    var local = String(email || '').split('@')[0] || 'Member';
    var words = local
      .replace(/[._+\-]+/g, ' ')
      .replace(/\d+/g, ' ')
      /* The bitmap headings use "|" as a line break, so a name must never
       * carry one - it would inject an extra line into the greeting. */
      .replace(/\|+/g, ' ')
      .trim()
      .split(/\s+/)
      .filter(Boolean);

    if (!words.length) return 'Member';

    var name = words
      .slice(0, 3)
      .map(function (w) {
        return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
      })
      .join(' ');

    /* Long enough for a real name, short enough that the bitmap greeting
     * still has a whole-number pixel scale left to render at. */
    return name.length > 18 ? name.slice(0, 18).trim() : name;
  }

  function read() {
    try {
      var raw = global.sessionStorage.getItem(KEY);
      if (!raw) return null;
      var data = JSON.parse(raw);
      if (!data || typeof data.name !== 'string' || !data.name) return null;
      return data;
    } catch (err) {
      return null;
    }
  }

  /* Returns the session, or null if the browser refused to store it. The
   * caller needs to know: without that write, the next page's gate sends the
   * visitor straight back to the form with nothing to explain why. */
  function start(email) {
    var session = { name: nameFromEmail(email), startedAt: Date.now() };

    try {
      global.sessionStorage.setItem(KEY, JSON.stringify(session));
    } catch (err) {
      return null;
    }

    return session;
  }

  function end() {
    try {
      global.sessionStorage.removeItem(KEY);
    } catch (err) {
      /* nothing to clean up */
    }
  }

  /* Members-only pages call this. No session, no entry. */
  function requireSession(redirectTo) {
    var session = read();
    if (!session) {
      global.location.replace(redirectTo || 'login.html');
      return null;
    }
    return session;
  }

  global.CircuitSession = {
    key: KEY,
    nameFromEmail: nameFromEmail,
    read: read,
    start: start,
    end: end,
    require: requireSession
  };
})(window);
