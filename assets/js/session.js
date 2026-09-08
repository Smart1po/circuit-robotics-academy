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

  /* "Keep me signed in" moves the same session into localStorage, which
   * survives closing the tab. Two things never go in either store: the
   * password, which is never read into a variable at all, and anything the
   * visitor did not type themselves. The email is kept only so the form can
   * fill itself in next time — on this device, in this browser, and nowhere
   * else. None of it is in the source code, because the source is public. */
  var KEEP = 'circuit.session.kept';
  var EMAIL = 'circuit.remember.email';

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

      /* Nothing in this tab — but the visitor may have asked to be kept
       * signed in on this device. If so, restore it into the tab. */
      if (!raw) {
        raw = global.localStorage.getItem(KEEP);
        if (raw) global.sessionStorage.setItem(KEY, raw);
      }

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
  function start(email, keep) {
    var session = { name: nameFromEmail(email), startedAt: Date.now() };
    var raw = JSON.stringify(session);

    try {
      global.sessionStorage.setItem(KEY, raw);
    } catch (err) {
      return null;
    }

    try {
      if (keep) {
        global.localStorage.setItem(KEEP, raw);
        global.localStorage.setItem(EMAIL, String(email));
      } else {
        global.localStorage.removeItem(KEEP);
        global.localStorage.removeItem(EMAIL);
      }
    } catch (err) {
      /* Storage refused. The tab session still works for this visit. */
    }

    return session;
  }

  /* The address this browser used last, so the form can fill itself in.
   * Never a password — there is no password to remember. */
  function rememberedEmail() {
    try { return global.localStorage.getItem(EMAIL) || ''; } catch (err) { return ''; }
  }

  function isKept() {
    try { return !!global.localStorage.getItem(KEEP); } catch (err) { return false; }
  }

  /* Signing out clears both stores. "Keep me signed in" is a convenience,
   * not a trap: one press of Log out and there is nothing left anywhere. */
  function end() {
    try { global.sessionStorage.removeItem(KEY); } catch (err) {}
    try {
      global.localStorage.removeItem(KEEP);
      global.localStorage.removeItem(EMAIL);
    } catch (err) {}
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
    rememberedEmail: rememberedEmail,
    isKept: isKept,
    end: end,
    require: requireSession
  };
})(window);
