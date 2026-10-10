-- Event reviews + extend category checks to include 'event'

create table if not exists public.event_reviews (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  organizer text not null default '',
  location text not null default '',
  ticket_price text not null default '',
  tags text[] not null default '{}',
  rating text not null check (rating in (
    '人生必去！', '陶冶性情', '挺好玩的', '中規中矩', '主辦在幹嘛', 'FFXIV'
  )),
  review text not null default '',
  photo_paths text[] not null default '{}',
  experience_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists event_reviews_rating_idx on public.event_reviews (rating);

alter table public.event_reviews enable row level security;

drop policy if exists "Public read event_reviews" on public.event_reviews;
drop policy if exists "Auth insert event_reviews" on public.event_reviews;
drop policy if exists "Auth update event_reviews" on public.event_reviews;
drop policy if exists "Auth delete event_reviews" on public.event_reviews;

create policy "Public read event_reviews" on public.event_reviews for select using (true);
create policy "Auth insert event_reviews" on public.event_reviews for insert with check (auth.role() = 'authenticated');
create policy "Auth update event_reviews" on public.event_reviews for update using (auth.role() = 'authenticated');
create policy "Auth delete event_reviews" on public.event_reviews for delete using (auth.role() = 'authenticated');

insert into storage.buckets (id, name, public)
values ('event-photos', 'event-photos', true)
on conflict (id) do nothing;

drop policy if exists "Public read event photos" on storage.objects;
drop policy if exists "Auth upload event photos" on storage.objects;
drop policy if exists "Auth update event photos" on storage.objects;
drop policy if exists "Auth delete event photos" on storage.objects;

create policy "Public read event photos"
  on storage.objects for select
  using (bucket_id = 'event-photos');

create policy "Auth upload event photos"
  on storage.objects for insert
  with check (bucket_id = 'event-photos' and auth.role() = 'authenticated');

create policy "Auth update event photos"
  on storage.objects for update
  using (bucket_id = 'event-photos' and auth.role() = 'authenticated');

create policy "Auth delete event photos"
  on storage.objects for delete
  using (bucket_id = 'event-photos' and auth.role() = 'authenticated');

alter table public.check_ins drop constraint if exists check_ins_category_check;
alter table public.check_ins
  add constraint check_ins_category_check
  check (category in ('book', 'movie', 'game', 'event'));

do $$
declare
  r record;
begin
  for r in
    select con.conname
    from pg_constraint con
    join pg_class rel on rel.oid = con.conrelid
    join pg_namespace nsp on nsp.oid = rel.relnamespace
    where nsp.nspname = 'public'
      and rel.relname = 'wish_items'
      and con.contype = 'c'
      and pg_get_constraintdef(con.oid) like '%category%'
  loop
    execute format('alter table public.wish_items drop constraint %I', r.conname);
  end loop;
end $$;

alter table public.wish_items
  add constraint wish_items_category_check
  check (category in ('book', 'movie', 'game', 'event'));

do $$
declare
  r record;
begin
  for r in
    select con.conname
    from pg_constraint con
    join pg_class rel on rel.oid = con.conrelid
    join pg_namespace nsp on nsp.oid = rel.relnamespace
    where nsp.nspname = 'public'
      and rel.relname = 'drafts'
      and con.contype = 'c'
      and pg_get_constraintdef(con.oid) like '%category%'
  loop
    execute format('alter table public.drafts drop constraint %I', r.conname);
  end loop;
end $$;

alter table public.drafts
  add constraint drafts_category_check
  check (category in ('book', 'movie', 'game', 'event'));

notify pgrst, 'reload schema';
