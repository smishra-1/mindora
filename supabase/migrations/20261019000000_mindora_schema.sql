-- Mindora schema: one profile per user, one check-in per user per day.
-- Every table uses row-level security so each user can only see their own rows.

create table public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  name        text not null default 'friend' check (char_length(name) <= 40),
  buddy       text not null default 'bunny'
                check (buddy in ('bear', 'fox', 'bunny', 'dragon')),
  buddy_name  text not null default 'Bubbles' check (char_length(buddy_name) <= 40),
  grown_ups   jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table public.checkins (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null default auth.uid()
                 references auth.users (id) on delete cascade,
  date         date not null default current_date,
  mood         text not null
                 check (mood in ('happy', 'calm', 'sad', 'angry', 'worried', 'tired')),
  stress       smallint not null check (stress between 1 and 5),
  sleep_hours  numeric(3,1) not null check (sleep_hours between 0 and 24),
  tags         text[] not null default '{}'
                 check (tags <@ array['school','exams','friends','family',
                                      'outside','sports','screens','alone']),
  note         text not null default '' check (char_length(note) <= 300),
  created_at   timestamptz not null default now(),
  unique (user_id, date)
);

create index checkins_user_date_idx on public.checkins (user_id, date desc);

create table public.good_things (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid()
                references auth.users (id) on delete cascade,
  date        date not null default current_date,
  items       text[] not null check (cardinality(items) between 1 and 3),
  created_at  timestamptz not null default now()
);

create index good_things_user_date_idx on public.good_things (user_id, date desc);

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

alter table public.profiles    enable row level security;
alter table public.checkins    enable row level security;
alter table public.good_things enable row level security;

create policy "Own profile" on public.profiles
  for all to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

create policy "Own check-ins" on public.checkins
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Own good things" on public.good_things
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
