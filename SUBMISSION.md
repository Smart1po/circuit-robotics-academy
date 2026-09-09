# AIFC Day 3 — Build It, Ship It, Check It

**Mariam Madouh · AIFC-Sep/Sep-26**

---

## 1. The business, in one line

**CIRCUIT** — a robotics and AI academy in Kuwait City for ages 8 to 17: twelve-week terms,
one robot per team, and a scored run at the end of every term.

---

## 2. Live link

https://smart1po.github.io/circuit-robotics-academy/

Deployed from GitHub Pages rather than Vercel — Vercel needed an account sign-in that could not
be done in the session. Every commit to `main` republishes the live address automatically, which
is the same continuous deployment either way: save, push, and the page updates without doing
anything else.

## 3. GitHub link

https://github.com/Smart1po/circuit-robotics-academy

---

## 4. The window check — what I removed, and why

I ran the check on the whole of what was about to be published, not just what shows on the
screen: five HTML pages, the stylesheet, ten JavaScript files, `vercel.json`, the favicon and
the README.

### Removed

**1. My own full name, sitting in the deployed JavaScript.**
`assets/js/session.js` carried a comment documenting how the display name is worked out, and it
used my real first and last name as the worked example, in the form
`"firstname.lastname@example.com" -> "Firstname Lastname"`. `README.md` repeated the same pair.

Neither is ever rendered on screen — and that is exactly the case the brief warns about,
*"anything that is in the code but not visible on the screen."* Anyone can open the source of a
deployed page. Both now read `first.last@example.com` → `First Last`.

This document is itself served from the live site, so it does not reproduce the original line.
Quoting it here to prove I removed it would have published it a third time.

**2. `demo@demo.com`.**
The login page suggested it and used it as the input placeholder. `demo.com` is somebody's
real, registered domain — putting it in front of thirty people as a throwaway address sends
mail and traffic at a stranger. Replaced with `you@example.com`. IANA reserves `example.com`
for exactly this and it can never route anywhere.

**3. `autocomplete="current-password"` on the password field.**
That attribute is the specific signal a browser and a password manager use to decide a form is
a real sign-in, and to offer a **saved, real** credential for it. On a sign-in that checks
nothing, that is inviting the exact mistake the page warns against two lines above. Changed to
`autocomplete="off"`.

**4. A route by which an email and a password could have reached the URL bar.**
The form has no `action`, so its default target is the page itself. If JavaScript ever failed,
the browser would submit it — and a `GET` would have put `?email=…&password=…` straight into
the address bar, into browser history, and into any server log along the way. Three things now
stop that: `method="post"`, a `form-action 'none'` Content Security Policy, and a submit button
that ships `disabled` in the HTML and is only enabled by JavaScript that has actually run.

A note on that policy, because it nearly became a false claim. It was written as response
headers in `vercel.json` — and GitHub Pages does not read `vercel.json` and sends no headers of
its own, so on the live site there was **no policy at all**. Every page now carries the same
rules in a `<meta http-equiv="Content-Security-Policy">` tag, which the browser does enforce
wherever the site is hosted. `frame-ancestors` cannot be set from a meta tag and stays in
`vercel.json` for the day this moves to Vercel.

### Checked and deliberately kept

| Item | Where it lives | Verdict |
|---|---|---|
| "Kuwait City" | In the page | Safe — the brief's own list puts the city you live in in the window. |
| `hello@circuit.example` | In the page | Safe — `.example` is a reserved TLD. It cannot route to anyone. |
| Theme and motion preference | `localStorage` | Safe — two UI switches. Not a person. |
| The display name for this visit | `sessionStorage` | Derived from what the visitor typed. Gone when the tab closes. |
| **The typed email address, and the session** | **`localStorage`, only if "Keep me signed in" is ticked** | **Personal data, and treated as such.** It is written only on an explicit tick, never by default; it stays in that one browser on that one device; it is never sent anywhere, because there is nowhere to send it; and either Log out or "Not you? Forget this device" on the sign-in page erases it. |

That last row is the honest answer to "what changed since I first ran this check". A
**Keep me signed in** option was added after the first pass, and an email address is a person.
It is disclosed on the form, it is opt-in, and it is erasable from the page it appears on. What
matters is that it is written down here rather than quietly left out of the table.

### Never present in the first place

No phone number, no street address, no civil ID, no API key, no `.env`, no password stored or
transmitted anywhere. The password is read once to check it is not empty; its value is never
assigned to a variable, never logged and never written down.

---

## 5. Things Claude invented that I caught

**The name in the source, above.** 100 points. It wrote a helpful little example comment using
a real person's real full name and buried it where nothing on screen would ever reveal it.

**A contradiction between two invented tables.** The class timetable gave every band one fixed
room for the whole term (SPARK at Bench A, RELAY at Bench B, APEX at Bench C). The note under
it said the only room change all term is weeks nine and ten. But the term calendar three
sections further down had Bench B in weeks four and five, Bench C in weeks six to eight, and
the Mat Room in weeks eleven and twelve. Invented data that disagrees with itself is how a site
stops being believable. Rewrote the note to list every move.

**`demo.com` presented as a throwaway.** It is not a throwaway; it belongs to somebody.

---

## 6. The deploy that went green and still shipped a broken page

The Pages build succeeded — every run of it, green, site live. And the 404 page was broken.

It **loaded** — right title, right words — so nothing on the page itself looked wrong. But every
stylesheet, every script and every link on it came back `404` from the server:

```
assets/css/circuit.css   ->  /assets/css/circuit.css        404
assets/js/app.js         ->  /assets/js/app.js              404
favicon.svg              ->  /favicon.svg                   404
```

The paths were absolute. `/assets/css/circuit.css` resolves to
`smart1po.github.io/assets/css/circuit.css` — the top of the domain — and this site does not live
at the top of the domain. It lives at `/circuit-robotics-academy/`.

**Why it never showed up locally.** The dev server served the project *at the root*, so `/assets/…`
was correct there. The same line was right on my machine and wrong the second it was deployed.
That is the recipe-in-someone-else's-kitchen problem exactly, and no build log would ever have
caught it, because the build did not fail. I found it by asking the live server for each file the
page requests and reading the status codes it sent back.

**The fix.** Paths are relative now, so they resolve against the directory of the URL that was
asked for — which, for the one-level misses that are essentially all of them, is the project
root. All 27 of the page's requests come back `200`. A miss two levels deep still loses the
stylesheet, which is why the page also carries enough of its own styling inline to stay
readable with nothing else loaded. The page also carries a few of its own styles inline,
because a 404 page is the one page that has to stay readable when the stylesheet is the thing
that has gone missing. And `.nojekyll`, because Pages runs the site through Jekyll otherwise,
which nothing here needs and which silently drops any file whose name starts with `_`.

---

## 7. Score off the ship board

| Milestone | Points |
|---|---|
| Home page looks like a real business | 100 |
| The log in takes you inside | 150 |
| The members area greets you by name | 150 |
| Claude in Chrome put it on GitHub | 150 |
| Site is live at a real address | 200 |
| Caught something Claude invented | 100 |
| **Subtotal** | **850** |

**The 50 — "a build failed and you read the log and fixed it."** No build of mine failed; all
three Pages runs went green. What I am putting forward instead is section 6: a deploy that
reported success and shipped a page whose every asset 404'd, found by reading the live server's
own responses rather than a log. Same lesson, harder to spot, because nothing anywhere said it
was broken. Yours to judge.

**The 100 — "you unstuck somebody else in the room."** Earned in the room, not at the keyboard.

---

## 8. What is actually in it

Four screens, as specified: `/` public home, `/login`, `/dashboard` which greets you by the
name derived from the email you typed, and `/members` with the timetable, the kit library and
the competition rubric. `/dashboard` and `/members` are gated — open either without signing in
and a script in the `<head>` sends you to the login screen before a single pixel of member
content paints.

Plain HTML, CSS and JavaScript. No framework, no build step, and **no network request of any
kind at runtime** — no CDN, no web font, no analytics. It works offline and from a `file://`
path. A Content Security Policy in a meta tag on every page enforces that rather than trusting
it: `connect-src 'none'` means the browser refuses to let the site call out even if a future
change tried to.

**There is not one image file in the project.** The pixel art is text:

- The display type is a 5×7 bitmap typeface written by hand, seven rows of five characters per
  glyph, expanded into SVG rectangles at a whole-number pixel scale. The real sentence stays in
  the DOM for screen readers.
- Every character — the rover, the soldering iron, the drone, the hexapod, the arm, the probe —
  is a text pixel map painted onto a small canvas, and each one is tied to the content it sits
  beside rather than scattered as decoration.
- The cursor leaves a trail of 3px sparks, snapped to a 3px grid, capped and gated by pointer
  distance so a fast sweep leaves an even trail instead of a solid bar.
- The academy mark is a pair of silver wings, drawn rather than typed: five feathers a side,
  each three rows deep — a lit top edge, a body, and a dark groove separating it from the
  feather below. Spread when the lights are on, folded shut when they are off, flexing once on
  the way between. A specular band travels across the metal every few seconds and is gone
  again, which is the only honest way to make pixels look polished.
- Clicking a link that leaves the page sends a metal bird across it — wise stare, blue eyes —
  while the next page loads.
- The scrollbar is a braided rope. The light switch is a pull cord that swings when you touch
  it, and turning the lights off collapses a sheet of the lit colour into the bulb while ninety
  sparks are dragged in after it — the cord swallowing the light rather than the page simply
  repainting.
- Eleven machines sleep in a yard at the very bottom of the page. Read all the way down and
  they wake up, walk about at their own paces, turn round at the walls and hop.
- A help assistant behind a white flag in the corner, answering out of a hand-written table of
  the site's own content — no network, no model, and it says when it does not know rather than
  inventing. Minimise shrinks it to its own flag; it never disappears, because a control you
  have to go hunting for is a control you have lost.
- **Keep me signed in on this device**, which is the only thing here that outlives the tab. It
  is opt-in, it stores the address in one browser and never the password, and the sign-in page
  offers "Not you? Forget this device" to clear it.
- A rope back to the top, bottom left, out of the assistant's way.

All of it stops. There is a **MOTION** switch in the footer, and the site opens with motion off
for anyone whose system asks for reduced motion.

---

## 9. The thing this version cannot do

Sign in without ticking "Keep me signed in", then close the tab and open it again. The account
is gone, and the members area sends you back to the sign-in screen.

Ticking the box papers over that in one browser — but only in that browser, on that device.
Everything a visitor types still lives on their own machine and nowhere else. If somebody signed
in on their phone right now I would never know, because there is no shared place for it to be
written down. The tick makes the forgetting local instead of instant; it does not make an
account exist.

That shared place is a back end. Tomorrow: same business, same design, same live address, one
layer added behind it.
