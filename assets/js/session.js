/* CIRCUIT — mock session
 *
 * HONEST DESCRIPTION OF WHAT THIS IS:
 * This is a front-end mockup. There is no server, no database and no account.
 * Any email and any password get you in, because there is nothing behind the form.
 *
 * What it stores: one display name, derived from the email you typed. Always
 * in sessionStorage, which is the memory of this browser tab. Additionally in
 * localStorage — along with the address itself, so the form can fill itself in
 * — but only if the visitor ticked "Keep me signed in on this device".
 *
 * What it never stores, either way: the password. It is read for a non-empty
 * check and never assigned, never logged, never persisted, never sent.
 *
 * Without the tick, closing the tab loses the "account". That is not a bug —
 * it is what a front end without a back end actually does.
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
    var raw = null;

    /* Two independent stores, so two independent try blocks. Sharing one
     * would mean a browser that blocks localStorage also loses the perfectly
     * good session sitting in sessionStorage. */
    try {
      raw = global.sessionStorage.getItem(KEY);
    } catch (err) {
      raw = null;
    }

    var fromKept = false;

    if (!raw) {
      try {
        raw = global.localStorage.getItem(KEEP);
        fromKept = !!raw;
      } catch (err) {
        raw = null;
      }
    }

    if (!raw) return null;

    var data;
    try {
      data = JSON.parse(raw);
    } catch (err) {
      return null;
    }

    if (!data || typeof data.name !== 'string' || !data.name) return null;

    /* Only mirror it into the tab once it has been parsed and found sound.
     * Copying first would spread a corrupt value from one store to the other. */
    if (fromKept) {
      try {
        global.sessionStorage.setItem(KEY, raw);
      } catch (err) {
        /* The tab refused it. The value is still valid; use it anyway. */
      }
    }

    return data;
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

    session.kept = false;

    try {
      if (keep) {
        global.localStorage.setItem(KEEP, raw);
        global.localStorage.setItem(EMAIL, String(email));
        session.kept = true;
      } else {
        global.localStorage.removeItem(KEEP);
        global.localStorage.removeItem(EMAIL);
      }
    } catch (err) {
      /* Storage refused. The visit still works, but "keep me signed in" did
       * not happen, and session.kept says so rather than pretending. */
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

  /* Signing out clears both stores in THIS browser. Another tab that is
   * already open keeps its own copy in memory until it is reloaded — a
   * limitation of having no server to tell the other tab anything. */
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
