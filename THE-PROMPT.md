# The prompt that builds a working website

Paste this, fill in the brackets, delete nothing else. Everything below the
brackets is there because leaving it out cost us something tonight.

---

## The prompt

```
CONTEXT
I am building the website for [BUSINESS NAME], a [what it is] in [where].
The people using it are [who your customers are].
[One sentence on what makes it different from every other one of these.]

TASK
Build a [N] page website:
  /            [what the home page has to say in five seconds]
  /login       email and password, one button
  /dashboard   greets the person by name, shows [what only members see]
  /[page]      [what the business is actually for]

Gate the member pages: opening one without signing in sends you to the login
screen before any member content paints.

FORMAT
Plain HTML, CSS and JavaScript in one project. No frameworks, no build step.
No CDN, no web font, no analytics, no network request of any kind at runtime —
it must work offline and from a file:// path.
Mobile is the primary size. Design it at 375px wide first.
No image files: draw anything visual in CSS, inline SVG or canvas.

TONE
[three words]. Big type. It should look like a real company's site, not a
school exercise.

RULES — these are not optional
- Invent nothing that claims outside validation. No testimonials, no reviews,
  no partnerships, no awards, no press, no "trusted by 400 families".
- No phone number. No street address. No email on a domain somebody else owns:
  use a domain you have checked does not resolve, or a reserved one.
- No real person's name anywhere, including in code comments.
- Every invented figure must agree with every other invented figure. Prices,
  times, room names, week numbers — cross-check them before you finish.
- The login is a front-end mockup until I say otherwise. Any email and any
  password get in. Never store the password, never log it, never send it.
  Put one honest line on the form, in full-size type, before the password box:
  do not use a real password.

BUILD IT SO IT DOES NOT ROT
- Semantic HTML. One h1 per page, no skipped heading levels, real <button> for
  actions and real <a> for navigation.
- Every colour as a CSS custom property in one block at the top.
- Body text at 4.5:1 contrast minimum. Tell me the actual ratios you used.
- Respect prefers-reduced-motion, and give me a visible switch that overrides
  it in both directions.
- Never let an animation be the only reason content is visible. If a script
  fails, the words must still be there.
- Comment the WHY, not the what.

WHEN YOU ARE DONE
List every file you created, one line each on what it does.
Then tell me the three things most likely to break, and why.
```

---

## Then, before you show it to anyone

Four follow-up prompts. Run them in order. Each one caught something real.

**1. The window check**

```
Here is everything about to be published — every HTML, CSS and JS file, the
config and the README. List every piece of personal information in it,
including anything in the code but never rendered on screen: comments,
placeholders, example values, meta tags, file names. For each one say whether
it is safe to publish. Then tell me what you would remove.
```

**2. The invention check**

```
Go through every page and find anything you invented that a reader would take
as a real-world fact. Then cross-check every number, price, time, room name
and week against every other mention of it. Show me the contradictions.
```

**3. The deploy check — do this AFTER it is live, not before**

```
The site is deployed at [URL]. Fetch every page and every asset each page
asks for, and give me the HTTP status of each one. A green build does not
mean a working page.
```

**4. Naming the layer**

```
Somebody who had never seen my site could not work out how to [what happened].
This is a [HTML / CSS / JavaScript / deploy] problem. Change only that, and
tell me what you changed.
```

---

## Why each rule is in there

| Rule | What it cost us |
|---|---|
| No real names in comments | A real full name shipped in `session.js` and the README — invisible on screen, public in the source |
| No domain somebody else owns | `demo@demo.com` and `circuit.com` are both real domains belonging to real people |
| Cross-check invented figures | The timetable said one room per term; the calendar said four |
| Fetch every asset after deploy | The build went green and the 404 page 404'd on all 21 of its own files |
| Animation is never the only reason content shows | A reveal effect left a block permanently invisible |
| Reduced-motion switch works both ways | Six CSS rules keyed off the OS setting and silently killed features the visitor had turned back on |
| Say the actual contrast ratios | Asking for the number is what stops it being guessed |

---

## The one that matters most

Everything above is about the first draft. This is about every draft after it:

```
Do not rewrite anything I did not ask you to change. Show me the smallest
change that fixes this, and tell me what you changed and why.
```

Without that line you get a new file every time, and you lose the version that
was nearly right.
