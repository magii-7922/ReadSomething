-- Experience dates on reviews
alter table public.book_reviews
  add column if not exists experience_date date;

alter table public.movie_reviews
  add column if not exists experience_date date;

alter table public.game_reviews
  add column if not exists experience_date date;

-- Drafts (private unfinished reviews)
create table if not exists public.drafts (
  id uuid primary key default gen_random_uuid(),
  category text not null check (category in ('book', 'movie', 'game')),
  title text not null default '',
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists drafts_updated_idx
  on public.drafts (updated_at desc);

alter table public.drafts enable row level security;

drop policy if exists "Auth read drafts" on public.drafts;
drop policy if exists "Auth insert drafts" on public.drafts;
drop policy if exists "Auth update drafts" on public.drafts;
drop policy if exists "Auth delete drafts" on public.drafts;

create policy "Auth read drafts" on public.drafts
  for select using (auth.role() = 'authenticated');
create policy "Auth insert drafts" on public.drafts
  for insert with check (auth.role() = 'authenticated');
create policy "Auth update drafts" on public.drafts
  for update using (auth.role() = 'authenticated');
create policy "Auth delete drafts" on public.drafts
  for delete using (auth.role() = 'authenticated');

notify pgrst, 'reload schema';
