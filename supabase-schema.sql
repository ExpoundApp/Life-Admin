-- Run this once in Supabase → SQL Editor → New query → Run.
-- (If you ran the earlier trial schema, this safely replaces its policies.)
--
-- Model:
--   households          – one row per family, holds the whole app state as JSON
--   household_members   – which signed-in users belong to which household
-- Access is gated by Row Level Security: you can only read/write a household
-- you are a member of. The public anon key alone grants nothing.

-- ── tables ────────────────────────────────────────────────────────────────
create table if not exists public.households (
  id          text primary key,            -- the household code, e.g. "OAK-4271"
  state       jsonb not null,
  writer      text,
  updated_at  timestamptz default now()
);

create table if not exists public.household_members (
  household_id text references public.households(id) on delete cascade,
  user_id      uuid references auth.users(id) on delete cascade,
  created_at   timestamptz default now(),
  primary key (household_id, user_id)
);

-- ── realtime (this is what makes "she adds it → my phone updates") ──────────
alter publication supabase_realtime add table public.households;

-- ── membership check, as a SECURITY DEFINER function ────────────────────────
-- Using a function avoids the recursive-policy trap (households policy needs to
-- read members, members policy needs to read households, …).
create or replace function public.is_member(hh text)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.household_members m
    where m.household_id = hh and m.user_id = auth.uid()
  );
$$;

-- ── enable RLS ──────────────────────────────────────────────────────────────
alter table public.households        enable row level security;
alter table public.household_members enable row level security;

-- clean re-run: drop old policies if they exist
drop policy if exists "open access for trial"  on public.households;
drop policy if exists "members read household"  on public.households;
drop policy if exists "anyone authed creates hh" on public.households;
drop policy if exists "members update household" on public.households;
drop policy if exists "see own memberships"     on public.household_members;
drop policy if exists "join by adding self"      on public.household_members;
drop policy if exists "leave own membership"     on public.household_members;

-- households: members can read & update; any signed-in user can create one
create policy "members read household"
  on public.households for select
  to authenticated using (public.is_member(id));

create policy "anyone authed creates hh"
  on public.households for insert
  to authenticated with check (true);

create policy "members update household"
  on public.households for update
  to authenticated using (public.is_member(id)) with check (public.is_member(id));

-- memberships: you can only see, add, or remove your OWN membership row.
-- (Adding yourself = joining. The household_id foreign key means you can only
--  join a household code that actually exists.)
create policy "see own memberships"
  on public.household_members for select
  to authenticated using (user_id = auth.uid());

create policy "join by adding self"
  on public.household_members for insert
  to authenticated with check (user_id = auth.uid());

create policy "leave own membership"
  on public.household_members for delete
  to authenticated using (user_id = auth.uid());
