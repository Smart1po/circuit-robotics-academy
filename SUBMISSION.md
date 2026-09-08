# AIFC Day 3 — Build It, Ship It, Check It

**Mariam Madouh · AIFC-Sep/Sep-26**

---

## 1. The business, in one line

**CIRCUIT** — a robotics and AI academy in Kuwait City for ages 8 to 17: twelve-week terms,
one robot per team, and a scored run at the end of every term.

---

## 2. Live link

`PASTE THE VERCEL URL HERE`

## 3. GitHub link

`PASTE THE GITHUB URL HERE`

---

## 4. The window check — what I removed, and why

I ran the check on the whole of what was about to be published, not just what shows on the
screen: four HTML pages, the stylesheet, nine JavaScript files, `vercel.json`, the favicon and
the README.

### Removed

**1. My own full name, sitting in the deployed JavaScript.**
`assets/js/session.js` carried a comment documenting how the display name is worked out:

```js
/* "mariam.madouh@example.com" -> "Mariam Madouh" */
```

and `README.md` repeated the same pair. Neither is ever rendered on screen — and that is
exactly the case the brief warns about, *"anything that is in the code but not visible on the
screen."* Anyone can open the source of a deployed page. Replaced both with
`first.last@example.com` → `First Last`.

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

### Checked and deliberately kept

| Item | Verdict |
|---|---|
| "Kuwait City" | Safe — the brief's own list puts the city you live in in the window. |
| `hello@circuit.example` | Safe — `.example` is a reserved TLD. It cannot route to anyone. |
| `localStorage`: theme + motion preference | Safe — two UI switches. Not a person. |
| `sessionStorage`: one display name | Safe — tab lifetime only, and derived from what the visitor typed. |

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

## 6. Score off the ship board

| Milestone | Points |
|---|---|
| Home page looks like a real business | 100 |
| The log in takes you inside | 150 |
| The members area greets you by name | 150 |
| Claude in Chrome put it on GitHub | 150 |
| Site is live at a real address | 200 |
| Caught something Claude invented | 100 |
| **Total** | **850** |

Not claimed: the failed-build 50 (the build did not fail), and the unstuck-somebody 100.

---

## 7. What is actually in it

Four screens, as specified: `/` public home, `/login`, `/dashboard` which greets you by the
name derived from the email you typed, and `/members` with the timetable, the kit library and
the competition rubric. `/dashboard` and `/members` are gated — open either without signing in
and a script in the `<head>` sends you to the login screen before a single pixel of member
content paints.

Plain HTML, CSS and JavaScript. No framework, no build step, and **no network request of any
kind at runtime** — no CDN, no web font, no analytics. It works offline and from a `file://`
path. The Content Security Policy enforces it rather than trusting it.

**There is not one image file in the project.** The pixel art is text:

- The display type is a 5×7 bitmap typeface written by hand, seven rows of five characters per
  glyph, expanded into SVG rectangles at a whole-number pixel scale. The real sentence stays in
  the DOM for screen readers.
- Every character — the rover, the soldering iron, the drone, the hexapod, the arm, the probe —
  is a text pixel map painted onto a small canvas, and each one is tied to the content it sits
  beside rather than scattered as decoration.
- The cursor leaves a trail of 3px sparks, snapped to a 3px grid, capped and gated by pointer
  distance so a fast sweep leaves an even trail instead of a solid bar.
- The scrollbar is a braided rope. The light switch is a pull cord hanging from the top corner.
  Machines asleep at the very bottom of the page wake up and cheer if you read all the way down.

All of it stops. There is a **MOTION** switch in the footer, and the site opens with motion off
for anyone whose system asks for reduced motion.

---

## 8. The thing this version cannot do

Sign in, then close the tab and open it again. The account is gone, and the members area sends
you back to the login screen.

Nothing is broken. Everything a visitor types lives in the memory of one browser tab and
nowhere else. If somebody signed in on their phone right now I would never know, because there
is no shared place for it to be written down.

That shared place is a back end. Tomorrow: same business, same design, same live address, one
layer added behind it.
