# CIRCUIT — Robotics & AI Academy

A four-screen website for a **fictional** robotics and AI academy in Kuwait City, built for
Day 3 of the CODED *AI for Coding* course.

> **CIRCUIT is not a real company.** There is no academy, no class, no kit and no fee. Every
> name, timetable row, price and logbook entry in here is invented for a student project.

---

## The four screens

| Screen | Address | What it does |
|---|---|---|
| Home | `/` | What the business is, in five seconds. One button: log in. |
| Log in | `/login` | Email, password, one button. A front-end mockup. |
| Dashboard | `/dashboard` | Greets you by the name derived from the email you typed. |
| Members | `/members` | The point of the business — timetable, kits, competition rubric. |

`/dashboard` and `/members` are gated. Open either without logging in and you land on the
login screen instead.

---

## The login is a mockup, and the page says so

Any email and any password get you in, because there is nothing behind the form. That is not
a shortcut — it is the honest state of a front end with no back end yet.

What it does with what you type:

- **The email** is used to work out a display name (`first.last@example.com` → `First Last`). That
  name is written to `sessionStorage`, which is the memory of one browser tab. Close the tab
  and it is gone.
- **The password** is checked for being non-empty and nothing else. It is never assigned to a
  variable, never logged, never stored and never sent anywhere. There is nowhere for it to go.

The login screen says *"Do not use a real password"* in full-size type, above the fields,
before you reach them.

The gate on the members pages is JavaScript running in your own browser. That makes it a door,
not a lock — anyone can read the source of a deployed page. It is described that way on the
page itself, because implying a protection that does not exist is worse than having none.

---

## Built without a single line of hand-written code

Every file here was produced by directing Claude Code in sentences. No editor, no terminal
commands, no copy-pasted snippets. The job was deciding what the business is, reading what came
back, and saying no when it invented something.

---

## The pixel art is text

There are no image files in this project. Not one.

**The display type** (`assets/js/pixfont.js`) is a 5×7 bitmap typeface written by hand as
seven rows of five characters per glyph:

```
'A': '.###.|#...#|#...#|#####|#...#|#...#|#...#',
```

At runtime those become SVG rectangles, snapped to a whole-number pixel scale so the letters
stay hard-edged at any size. The real sentence stays in the DOM for screen readers.

**The characters** (`assets/js/sprites.js`) work the same way — one letter is one pixel, and a
palette maps letters to colours. Each one is tied to the content it sits beside: BOLT the rover
drives along the class timetable, TIP the soldering iron lives on the soldering unit, KITE the
drone hovers over the flight unit.

**The glitter** that follows the pointer is a canvas of 3px squares, snapped to a 3px grid,
capped at 110 live particles and gated by pointer distance rather than by events — so a fast
sweep leaves an even trail instead of a solid bar.

All of it stops when you ask it to. The footer carries a **MOTION: ON / OFF** switch, and the
site opens with motion off for anyone whose system asks for reduced motion.

---

## No network requests, ever

No CDN, no web font, no analytics, no `fetch`. The site works offline, from a `file://` path,
and on a live host. The Content Security Policy in `vercel.json` enforces it.

---

## Files

```
index.html          /            home
login.html          /login       the mockup login
dashboard.html      /dashboard   gated — greets you by name
members.html        /members     gated — the member content
favicon.svg                      a pixel robot head
vercel.json                      clean URLs, security headers, CSP
assets/css/circuit.css           tokens, pixel chrome, layout
assets/js/pixfont.js             the 5x7 bitmap typeface
assets/js/pixel.js               one animation loop, glitter, sprite engine
assets/js/sprites.js             the cast, as text pixel maps
assets/js/session.js             the mock session
assets/js/guard.js               the members-only gate, runs in <head>
assets/js/app.js                 page wiring
```

---

## Running it

Open `index.html` in a browser. That is the whole procedure — there is nothing to install and
nothing to build.

For clean URLs (`/login` rather than `/login.html`), serve it through anything static.

---

## Tomorrow

Accounts that survive closing the tab. Same business, same design, same address — one layer
added behind it.
