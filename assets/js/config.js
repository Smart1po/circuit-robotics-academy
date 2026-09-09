/* CIRCUIT — where the back end lives
 *
 * Paste the two values from your Supabase project below and the whole site
 * changes behaviour: real accounts, real passwords hashed on a server, and a
 * members list that everyone shares. Leave them empty and it carries on as
 * the front-end preview it was on Day 3.
 *
 * Supabase Dashboard → Project Settings → Data API
 *   url  is "Project URL"        e.g. https://abcdefgh.supabase.co
 *   key  is the publishable key (sb_publishable_...) from Settings → API Keys,
 *        or the legacy anon key (eyJ...) from the tab beside it. Either works
 *        as the apikey header; the publishable one is the current form.
 *
 * ON PUTTING A KEY IN A PUBLIC REPOSITORY. The anon key is designed to be
 * public — it ships in the JavaScript of every Supabase site on the web, and
 * it is not a secret. What actually protects the data is Row Level Security,
 * which is why SUPABASE.md turns RLS on before anything else and why the
 * policies there are written the way they are.
 *
 * The key that must NEVER appear here, or anywhere in this repository, is the
 * `service_role` key. That one bypasses every policy you just wrote.
 */
window.CIRCUIT_CONFIG = {
  supabase: {
    url: 'https://xdaivsrzyrewasuurldp.supabase.co',
    key: 'sb_publishable_zHBHBN1LondtcRDYAvednw_R7M3ycvA'
  }
};
