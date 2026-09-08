# Unsticking somebody — Day 3 pocket sheet

The last 100 points on the ship board are for getting somebody else moving. Here is what
people are actually stuck on tonight, and the fastest thing to say.

---

## The five things that go wrong tonight

**1. "My live link works for me but not for anyone else."**
They are sending a `file:///C:/Users/...` path, not a web address. A file path is directions
inside their own house. Ask them to read the link out loud — if it starts with `file://` or has
a drive letter in it, that is the whole problem. They need the deploy step.

**2. "It works locally but the deployed page has no styling."**
Almost always absolute paths. `/assets/style.css` means *the top of the domain*, and on GitHub
Pages a project site does not live at the top of the domain — it lives at
`username.github.io/repo-name/`. Locally the dev server serves the project at the root, so the
same path is right on their machine and wrong the moment it deploys.
**Fix:** drop the leading slash. `assets/style.css`, not `/assets/style.css`.
*(This one bit me. It is section 6 of my submission.)*

**3. "The deploy went green but the page is still wrong."**
A green build does not mean a working page. Open the live URL, open DevTools → Network, reload,
and look for red rows. The build only checks that it could copy the files; it never checks that
the files ask for each other correctly.

**4. "My build failed and I can't read the log."**
Three rules: read from the **top down** — the first error, not the last. Everything after it is
damage spreading. Look for **a name you recognise** — a file they wrote, a folder they made.
Then hand the whole log to Claude:

> My build failed. Here is the whole log. Tell me in plain English what went wrong, which file
> it is in, and the smallest change that fixes it. Do not rewrite anything else.

Lines like `Build failed` and `exited with 1` are the *result*, not the cause.

**5. "GitHub says my repository is empty."**
They created the repo but never dragged the folder in, or they dragged the folder itself instead
of its contents. GitHub wants the files, not the wrapper. And if they used git, they committed
but did not push.

---

## The window check, run on somebody else's site in 60 seconds

Open their live page, then **View Source** (Ctrl+U). You are reading for things that are in the
code but never on the screen. In order of how often it is there:

1. **A real name** in a comment or an example. Search the source for their first name.
2. **A real email or phone number** — often in a footer, a `mailto:`, or a placeholder.
3. **`demo.com`, `test.com`, `example.org`** used as throwaways. Only `example.com`,
   `example.net`, `example.org` and anything ending `.example` are actually reserved. The rest
   belong to real people.
4. **A login form with `method="get"`** or no method at all. Type anything into it, submit, and
   look at the address bar. If their password is sitting in the URL, that is the find of the
   night — it goes into browser history and every server log on the way.
5. **A password field with `autocomplete="current-password"`** on a fake login. That is the exact
   signal that tells a password manager to offer a *real, saved* credential.
6. **No "do not use a real password" line** on the sign-in. Ask them to add one. People type the
   password they use everywhere into any box labelled *password*.

Then try to log in as a stranger, and try opening their `/dashboard` directly without signing in
first. If it opens, their members area has no gate at all.

---

## How to actually help without taking over

Do not touch their keyboard. Ask them to read the error out loud — most people solve it
themselves halfway through the sentence. If they do not, tell them **which layer** it is
(HTML, CSS, JavaScript, or the deploy) before you tell them anything else. Naming the layer is
the thing this week is teaching; handing over a fixed file is not.

Use the 30 Minute Rule on them too: if you have both been at it 15 minutes, get an instructor.
