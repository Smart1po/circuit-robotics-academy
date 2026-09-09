# The experience

Every moment on the site, described as what a visitor **feels** rather than
how it was built. Nothing here is tied to pixel art, to a colour, or to a
stack — you could build all of it in a completely different look.

Each one is: **what happens** → **why it works** → **get it wrong and…**

---

## 1 · Arriving

### The page is inhabited

The background is never an empty colour. Something is always alive in it —
things drifting across at different heights and speeds, a texture that moves
slowly against your scrolling, small motes floating up.

**Why it works.** A still page feels like a document. A page with movement in
the periphery feels like a place. The movement is ambient, not attention-
seeking: it never crosses text and never asks to be looked at.

**Get it wrong and…** it competes with reading. The test: if you notice it
while reading a sentence, it is too strong. Turn it right down on the pages
people actually sit and read.

### The pointer is part of the world

The cursor leaves a short trail behind it as it moves.

**Why it works.** It makes the page feel responsive before you have clicked
anything — the site acknowledges you are there.

**Get it wrong and…** it becomes a toy. Keep it dim, short-lived, and tied to
*distance moved* rather than to mouse events, so a fast sweep leaves an even
trail instead of a solid smear. On touch, replace it with a small burst on
tap; there is no cursor to follow.

### The logo is alive

The mark is not a static image. It changes state with the site's mood — open
in daylight, closed at night — and it catches light every few seconds.

**Why it works.** A logo that responds to something makes the whole page feel
like one connected system rather than a header sitting on top of a document.

**Get it wrong and…** it looks like a flashing GIF. The light should *travel
across* the mark, and then leave it alone for several seconds.

---

## 2 · Moving through

### Content arrives, it doesn't dump

Blocks are not all there when you land. Each one appears as you reach it.

**Why it works.** A long page stops feeling like a wall. It becomes a sequence
of arrivals, and you feel like you are making progress.

**Get it wrong and…** something never appears and a visitor never knows they
missed it. **The rule that matters: nothing may be invisible unless a script
has already confirmed everything on screen is visible.** If the script fails,
the page must simply be visible. Text that never arrives is far worse than a
missing animation.

### You press instead of read

Where there would be four blocks of prose, there are four things to press and
one answer at a time. A twelve-week programme is twelve boxes you can scrub
across, not twelve paragraphs. Questions are collapsed until asked.

**Why it works.** The same information, a fraction of the visible words. The
visitor chooses what they want rather than being handed everything and asked
to find it. On our page this cut on-screen text by about 70% while removing
nothing.

**Get it wrong and…** people can't find what they need because it's hidden
behind a control they didn't realise was a control. Make the pressable things
obviously pressable, and show one answer by default so the panel is never
empty.

### Numbers count up when you meet them

Headline figures animate from zero when they scroll into view, once.

**Why it works.** It draws the eye to the thing you most want remembered, at
exactly the moment it becomes visible.

**Get it wrong and…** it happens on every scroll and becomes irritating. Once
per visit, then it stays put.

### Each page has its own mood

The front page is a shop window and is allowed to be loud. A page somebody
sits on for twenty minutes drops the contrast, opens the spacing, turns the
background down and stops anything flashing.

**Why it works.** Same site, right temperature for the job. A heading that
catches the light is charming on a landing page and infuriating over a
timetable.

**Get it wrong and…** you build two sites. Change the *dial settings*, not the
components — same buttons, same cards, different intensity.

---

## 3 · Controls you can touch

### A switch that is an object

The day/night control is a physical thing — a cord you pull, a lever, a
handle. It reacts to being touched, not only to being used: brush it and it
moves.

**Why it works.** A toggle is a setting. An object is a moment. People pull it
for fun and discover the feature.

**Get it wrong and…** it becomes inaccessible. It must be a real button
underneath, reachable by keyboard, with one constant name and its state
announced separately. The physical thing is decoration layered on top.

### The change itself is an event

Switching to dark doesn't repaint the page — the light is visibly *taken
away*, pulled into the switch you just used, with everything on the page
dragged in after it.

**Why it works.** It connects cause and effect. You didn't change a setting;
you did something and the room responded.

**Get it wrong and…** it's slow. This is a half-second moment, not a
transition to sit through.

### Everything else fades, nothing snaps

Colours cross-fade over about half a second when the theme changes.

**Get it wrong and…** two traps. Fading *everything* (including layout) makes
the page feel like treacle — fade colour only. And suppress it on first load,
or the page visibly cross-fades from the browser default the moment it opens.

### A way back to the top that is also an object

After a screen or so of scrolling, a way back to the top appears — in the
opposite corner from anything else that lives down there.

**Get it wrong and…** it only scrolls. It should also move *focus* to the top,
or a keyboard user watches the page travel without going anywhere.

---

## 4 · Reaching the end

### Something is waiting for you

At the very bottom — past the footer, past everything — a group of characters
is asleep. Get all the way down and they wake up, move about freely, and
celebrate.

**Why it works.** It rewards the one visitor in twenty who read the whole
thing. It costs nothing and it is the single most-remembered thing on the
site.

**Get it wrong and…** it fires too early and means nothing. It must trigger on
genuinely reaching the end, not on the footer coming into view. And let them
break out of their box — something that visibly escapes its container is
funnier than something politely contained.

---

## 5 · Going somewhere else

### Waiting is a scene, not a spinner

Clicking a link that leaves the page brings up the site's mark, **something
worth reading**, and a scene that is different every time — weather, a crowd,
a character doing something absurd.

**Why it works.** A spinner says "this is broken or slow". A scene says "this
is a place with things going on in it". And a sentence worth reading turns
dead time into the one moment you have someone's full attention. None of ours
mention waiting — they are advice from the workshop.

**Get it wrong and…** three ways. It traps people if the navigation isn't on a
guaranteed timer. It reappears when someone presses Back and lands on a cached
page. And it must never last long enough to be noticed as a delay — under a
second, always.

### A character guards the door

The sign-in page has someone on it who paces, and every so often stops, turns
to you, and says one of a handful of things — every one of them true of that
page, including the safety warning.

**Why it works.** Nobody reads a notice box. Everybody watches a character
stop and look at them. It is the same information, delivered by something you
will actually look at.

**Get it wrong and…** you tie the *message* to the animation setting. The
pacing is decoration and should stop when motion is off. What he says is
content and must always appear.

---

## 6 · Being helped

### Help behind a flag that shrinks, never disappears

A small marker in the corner opens a short conversation. It answers from what
is actually on the site, and says plainly when it does not know rather than
inventing an answer.

**Get it wrong and…** "hide" makes it vanish and the only way back is a link
in the footer. That is a control the visitor has lost. **Minimise, never
remove** — shrink it to its own icon and leave it exactly where it was.

### Errors say what to do next

Every message a visitor can hit is written for the person stuck, not for
whoever built the server. Not *"email rate limit exceeded"* but *"too many
confirmation emails have gone out in the last hour — either wait, or turn off
X, which is here."*

**Why it works.** It is the single highest-value thing you can do for
somebody. A person who knows what to do next is not stuck.

**Get it wrong and…** you pass the raw error through and it tells the visitor
nothing: not what happened, not whether it was their fault, not what to do.

---

## 7 · Being told the truth

### The site changes what it claims about itself

The sign-in page says "do not use a real password" — **only while that is
true.** The moment a real server is handling passwords, that sentence rewrites
itself, because it has become the false statement.

**Why it works.** It is the difference between a site that has a disclaimer
and a site that is honest. The copy reads the real state and reports it.

**Get it wrong and…** you leave a warning up that has stopped being true, or
worse, take one down that still is.

### Remembering you, and letting you undo it

"Keep me signed in" is opt-in, never assumed. The page you'd see it on tells
you who is remembered, and offers a way to clear it right there.

**Get it wrong and…** on a shared computer the next person finds somebody
else's details filled in with no obvious way to shift them.

### A 404 that still feels like the site

A wrong address gets a page in the same world, with a way back — not the
host's default error screen.

**Get it wrong and…** it depends on the stylesheet that just failed to load.
The one page that must survive everything else breaking should carry enough of
its own styling to stay readable alone.

---

## 8 · The rule under all of it

### Every effect can be switched off, and the visitor's switch wins

One visible control turns off every animation on the site. The operating
system decides where that switch *starts*; it does not get to overrule
somebody who has moved it.

**Get it wrong and…** and this is the one that cost us most — you check the
system setting directly in your styles. Then six features are built, working,
and **completely invisible** to anyone whose machine asks for reduced motion,
including when they have deliberately turned motion back on. Check *your*
switch. Let the system preference only choose its opening position.

---

## The shortest version

| Instead of | Do |
|---|---|
| A spinner | A scene with something worth reading |
| A toggle | An object you pull |
| A repaint | The change happening in front of you |
| Paragraphs | Things to press, one answer at a time |
| A flat background | A place with something living in it |
| A notice box | A character who stops and tells you |
| The server's error | What to do next |
| A permanent disclaimer | Copy that reads the real state |
| Hiding a control | Shrinking it |
| Ending the page | Something waiting at the bottom for whoever got there |
