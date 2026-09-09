# Turning the back end on

Everything is built and wired. It is switched off because it needs two values
that only exist in your Supabase project, and I am not going to invent them.

When these two lines are filled in, the site stops being a front-end preview
and starts being a product: real accounts, passwords hashed on a server, and a
members list that everyone shares.

---

## 1. Paste two values

Supabase dashboard → your project → **Project Settings → Data API**.

Open `assets/js/config.js` and fill in:

```js
window.CIRCUIT_CONFIG = {
  supabase: {
    url: 'https://YOUR-PROJECT-REF.supabase.co',   // "Project URL"
    key: 'eyJhbGciOi…'                              // the "anon public" key
  }
};
```

**The anon key is safe to commit.** It ships in the JavaScript of every
Supabase site on the web and is not a secret — what protects the data is the
Row Level Security you switch on in step 2.

**The `service_role` key must never go in this file, or anywhere in this
repository.** That one bypasses every policy below.

---

## 2. Run this SQL

Supabase dashboard → **SQL Editor** → paste and run.

```sql
-- The shared list. One row per member, owned by the account that made it.
create table if not exists public.members (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  display_name text not null check (char_length(display_name) between 1 and 40),
  band        text not null default 'SPARK'
              check (band in ('SPARK', 'RELAY', 'APEX')),
  joined_at   timestamptz not null default now(),

  -- one row per person, so signing in twice does not create a second you
  unique (user_id)
);

-- Nothing below this line is optional. Without RLS the anon key really would
-- be a problem: it would let anyone read and write the whole table.
alter table public.members enable row level security;

-- Everyone signed in can see the list. That is the entire point of it.
create policy "members are visible to signed-in users"
  on public.members for select
  to authenticated
  using (true);

-- You may only ever write your own row.
create policy "you can add yourself"
  on public.members for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "you can edit yourself"
  on public.members for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Fill user_id from the token rather than trusting the browser to send it.
create or replace function public.set_member_user_id()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  new.user_id := auth.uid();
  return new;
end;
$$;

drop trigger if exists members_set_user_id on public.members;
create trigger members_set_user_id
  before insert on public.members
  for each row execute function public.set_member_user_id();

create index if not exists members_joined_at_idx
  on public.members (joined_at desc);
```

---

## 3. Turn off email confirmation, for tonight only

**Authentication → Sign In / Providers → Email** → turn **Confirm email** off.

With it on, a new account gets no session until the person clicks a link in
their inbox, and the sign-in will report *"Account created. Check your email to
confirm it."* That is correct behaviour and terrible for a demo in a room.

Turn it back on before anybody real uses this.

---

## What changes the moment those values are filled in

| | Front-end preview (now) | With Supabase |
|---|---|---|
| Password | Checked for being non-empty. Never stored. | Sent once over TLS, hashed by the server. This site still never stores it. |
| Account | A name in one browser tab | A row in `auth.users`, the same on every device |
| Close the tab | The account is gone | You are still signed in |
| Sign in on your phone | The laptop knows nothing | Same account, same name |
| The members list | Does not exist | Everyone sees everyone |
| The warning on the form | "Do not use a real password" | Replaced automatically — the page stops saying it, because it stops being true |

That last row is the point. The site reads its own configuration and changes
what it claims about itself. A page that says "this is a preview" while a real
server hashes your password is lying in the other direction.

---

## If nothing is filled in

Nothing breaks. Every call reports `no-backend`, the sign-in falls back to the
Day 3 mockup, and the warning on the form stays up because it is still true.

---

## Checking it worked

1. Open `/login`, sign in with an address you have never used.
2. Supabase dashboard → **Authentication → Users**. Your account is there.
3. **Table Editor → members**. Your row is there.
4. Close the browser entirely. Reopen `/dashboard`. You are still in.
5. Sign in on your phone with the same address. Same account.

Step 4 is the one worth doing in front of somebody. It is the exact thing that
could not happen yesterday.
