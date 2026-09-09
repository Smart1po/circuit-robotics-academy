/* CIRCUIT — the part that remembers
 *
 * This is the layer Day 3 did not have. With a Supabase project configured in
 * config.js it does three things the front end never could:
 *
 *   1. Real accounts. The password goes to a server, is hashed there, and is
 *      never stored by this site in any form. That is what finally makes the
 *      "do not use a real password" warning unnecessary.
 *   2. A session that is the same session on your phone and on your laptop,
 *      because it lives on a server rather than in one browser.
 *   3. A members list everyone shares. Somebody signs up in Salmiya and their
 *      name appears on your screen, and it is still there next week.
 *
 * With nothing configured, every function here reports "not available" and
 * the site falls back to the Day 3 mockup. Nothing breaks; it just forgets.
 *
 * No SDK. Supabase's REST and auth endpoints are ordinary HTTP, and pulling a
 * library off a CDN would break both the no-network rule and the CSP.
 */
(function (global) {
  'use strict';

  var cfg = (global.CIRCUIT_CONFIG && global.CIRCUIT_CONFIG.supabase) || {};
  var URL_BASE = (cfg.url || '').replace(/\/+$/, '');
  var KEY = cfg.key || '';

  var TOKEN_KEY = 'circuit.token';

  function configured() {
    return !!(URL_BASE && KEY);
  }

  function headers(extra) {
    var h = {
      'apikey': KEY,
      'Content-Type': 'application/json'
    };

    var t = token();
    if (t) h['Authorization'] = 'Bearer ' + t;

    for (var k in extra) {
      if (Object.prototype.hasOwnProperty.call(extra, k)) h[k] = extra[k];
    }
    return h;
  }

  function token() {
    try {
      var raw = global.localStorage.getItem(TOKEN_KEY);
      if (!raw) return null;
      var t = JSON.parse(raw);
      /* An expired token is worse than none: it produces confusing 401s
       * instead of a clean "you are signed out". */
      if (t.expires_at && Date.now() > t.expires_at) return null;
      return t.access_token;
    } catch (err) {
      return null;
    }
  }

  function keepToken(data) {
    try {
      global.localStorage.setItem(TOKEN_KEY, JSON.stringify({
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        /* expires_in is seconds; a minute of slack avoids using a token that
         * dies between the check and the request. */
        expires_at: Date.now() + ((data.expires_in || 3600) - 60) * 1000
      }));
    } catch (err) { /* private mode */ }
  }

  function dropToken() {
    try { global.localStorage.removeItem(TOKEN_KEY); } catch (err) {}
  }

  /* Every call goes through here, so there is one place that knows how this
   * server reports a problem and one place that turns it into plain English. */
  function call(path, options) {
    if (!configured()) {
      return Promise.reject(new Error('no-backend'));
    }

    var opts = options || {};

    return global.fetch(URL_BASE + path, {
      method: opts.method || 'GET',
      headers: headers(opts.headers),
      body: opts.body ? JSON.stringify(opts.body) : undefined
    }).then(function (res) {
      return res.text().then(function (text) {
        var data = null;
        try { data = text ? JSON.parse(text) : null; } catch (err) { data = null; }

        if (res.ok) return data;

        var msg = (data && (data.msg || data.message || data.error_description ||
                            data.error || data.hint)) || ('Request failed (' + res.status + ')');
        var e = new Error(msg);
        e.status = res.status;
        throw e;
      });
    });
  }

  /* ------------------------------------------------------------------ *
   * Accounts
   * ------------------------------------------------------------------ */

  /* Supabase hashes the password on its side. It is sent once, over TLS, and
   * this site never sees it again — there is nothing here to store. */
  function signUp(email, password, name) {
    return call('/auth/v1/signup', {
      method: 'POST',
      body: {
        email: email,
        password: password,
        data: { display_name: name || '' }
      }
    }).then(function (data) {
      if (data && data.access_token) keepToken(data);
      return data;
    });
  }

  function signIn(email, password) {
    return call('/auth/v1/token?grant_type=password', {
      method: 'POST',
      body: { email: email, password: password }
    }).then(function (data) {
      keepToken(data);
      return data;
    });
  }

  function signOut() {
    var had = token();
    dropToken();

    if (!had) return Promise.resolve();

    /* Best effort. The token is already gone locally, so a failure here
     * changes nothing the visitor can see. */
    return call('/auth/v1/logout', { method: 'POST' })['catch'](function () {});
  }

  /* Who the server thinks you are, which is the only opinion that counts
   * once there is a server. */
  function me() {
    if (!token()) return Promise.resolve(null);

    return call('/auth/v1/user')['catch'](function (err) {
      if (err.status === 401) { dropToken(); return null; }
      throw err;
    });
  }

  /* ------------------------------------------------------------------ *
   * The members table — the shared part
   * ------------------------------------------------------------------ */

  function joinMembers(name, band) {
    return call('/rest/v1/members', {
      method: 'POST',
      headers: { 'Prefer': 'resolution=merge-duplicates,return=representation' },
      body: { display_name: name, band: band || 'SPARK' }
    });
  }

  function listMembers(limit) {
    return call('/rest/v1/members?select=display_name,band,joined_at' +
                '&order=joined_at.desc&limit=' + (limit || 20));
  }

  function countMembers() {
    return call('/rest/v1/members?select=id', {
      headers: { 'Prefer': 'count=exact', 'Range': '0-0' }
    }).then(function (rows) {
      return rows ? rows.length : 0;
    });
  }

  global.CircuitBackend = {
    configured: configured,
    signUp: signUp,
    signIn: signIn,
    signOut: signOut,
    me: me,
    token: token,
    joinMembers: joinMembers,
    listMembers: listMembers,
    countMembers: countMembers
  };
})(window);
