-- Check-ins (manual daily check-in; multiple categories per day)
create table if not exists public.check_ins (
  id uuid primary key default gen_random_uuid(),
  check_date date not null,
  category text not null check (category in ('book', 'movie', 'game', 'event')),
  created_at timestamptz not null default now(),
  unique (check_date, category)
);

-- Wish list items
create table if not exists public.wish_items (
  id uuid primary key default gen_random_uuid(),
  category text not null check (category in ('book', 'movie', 'game', 'event')),
  title text not null,
  note text not null default '',
  is_done boolean not null default false,
  done_at timestamptz,
  created_at timestamptz not null default now()
);

-- Book reviews
create table if not exists public.book_reviews (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  author text not null default '',
  publisher text not null default '',
  link text,
  tags text[] not null default '{}',
  rating text not null check (rating in (
    '超級推薦！', '有棒的地方', '中規中矩', '能理解但為什麼', 'WTF', '我是土狗'
  )),
  review text not null default '',
  excerpt text not null default '',
  experience_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Movie reviews
create table if not exists public.movie_reviews (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  director text not null default '',
  studio text not null default '',
  original_work text not null default '',
  tags text[] not null default '{}',
  rating text not null check (rating in (
    '超級推薦！', '有棒的地方', '中規中矩', '能理解但為什麼', 'WTF', '商業片'
  )),
  review text not null default '',
  excerpt text not null default '',
  ticket_stub_path text,
  experience_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Game reviews
create table if not exists public.game_reviews (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  company text not null default '',
  publisher text not null default '',
  price text not null default '',
  tags text[] not null default '{}',
  rating text not null check (rating in (
    '人生遊戲！', '挺好玩的', '偶爾開開', '不好玩', '可惜我是手殘'
  )),
  review text not null default '',
  screenshot_paths text[] not null default '{}',
  experience_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Event reviews
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

-- Drafts
create table if not exists public.drafts (
  id uuid primary key default gen_random_uuid(),
  category text not null check (category in ('book', 'movie', 'game', 'event')),
  title text not null default '',
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Indexes
create index if not exists book_reviews_rating_idx on public.book_reviews (rating);
create index if not exists movie_reviews_rating_idx on public.movie_reviews (rating);
create index if not exists game_reviews_rating_idx on public.game_reviews (rating);
create index if not exists event_reviews_rating_idx on public.event_reviews (rating);
create index if not exists wish_items_category_idx on public.wish_items (category, is_done);
create index if not exists check_ins_date_idx on public.check_ins (check_date);

-- RLS
alter table public.check_ins enable row level security;
alter table public.wish_items enable row level security;
alter table public.book_reviews enable row level security;
alter table public.movie_reviews enable row level security;
alter table public.game_reviews enable row level security;
alter table public.event_reviews enable row level security;
alter table public.drafts enable row level security;

-- Public read
create policy "Public read check_ins" on public.check_ins for select using (true);
create policy "Public read wish_items" on public.wish_items for select using (true);
create policy "Public read book_reviews" on public.book_reviews for select using (true);
create policy "Public read movie_reviews" on public.movie_reviews for select using (true);
create policy "Public read game_reviews" on public.game_reviews for select using (true);
create policy "Public read event_reviews" on public.event_reviews for select using (true);

-- Authenticated write (owner = any logged-in user; create only one account)
create policy "Auth insert check_ins" on public.check_ins for insert with check (auth.role() = 'authenticated');
create policy "Auth delete check_ins" on public.check_ins for delete using (auth.role() = 'authenticated');

create policy "Auth insert wish_items" on public.wish_items for insert with check (auth.role() = 'authenticated');
create policy "Auth update wish_items" on public.wish_items for update using (auth.role() = 'authenticated');
create policy "Auth delete wish_items" on public.wish_items for delete using (auth.role() = 'authenticated');

create policy "Auth insert book_reviews" on public.book_reviews for insert with check (auth.role() = 'authenticated');
create policy "Auth update book_reviews" on public.book_reviews for update using (auth.role() = 'authenticated');
create policy "Auth delete book_reviews" on public.book_reviews for delete using (auth.role() = 'authenticated');

create policy "Auth insert movie_reviews" on public.movie_reviews for insert with check (auth.role() = 'authenticated');
create policy "Auth update movie_reviews" on public.movie_reviews for update using (auth.role() = 'authenticated');
create policy "Auth delete movie_reviews" on public.movie_reviews for delete using (auth.role() = 'authenticated');

create policy "Auth insert game_reviews" on public.game_reviews for insert with check (auth.role() = 'authenticated');
create policy "Auth update game_reviews" on public.game_reviews for update using (auth.role() = 'authenticated');
create policy "Auth delete game_reviews" on public.game_reviews for delete using (auth.role() = 'authenticated');

create policy "Auth insert event_reviews" on public.event_reviews for insert with check (auth.role() = 'authenticated');
create policy "Auth update event_reviews" on public.event_reviews for update using (auth.role() = 'authenticated');
create policy "Auth delete event_reviews" on public.event_reviews for delete using (auth.role() = 'authenticated');

create policy "Auth read drafts" on public.drafts for select using (auth.role() = 'authenticated');
create policy "Auth insert drafts" on public.drafts for insert with check (auth.role() = 'authenticated');
create policy "Auth update drafts" on public.drafts for update using (auth.role() = 'authenticated');
create policy "Auth delete drafts" on public.drafts for delete using (auth.role() = 'authenticated');

-- Storage buckets
insert into storage.buckets (id, name, public)
values ('ticket-stubs', 'ticket-stubs', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('game-screenshots', 'game-screenshots', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('event-photos', 'event-photos', true)
on conflict (id) do nothing;

create policy "Public read ticket stubs"
  on storage.objects for select
  using (bucket_id = 'ticket-stubs');

create policy "Auth upload ticket stubs"
  on storage.objects for insert
  with check (bucket_id = 'ticket-stubs' and auth.role() = 'authenticated');

create policy "Auth update ticket stubs"
  on storage.objects for update
  using (bucket_id = 'ticket-stubs' and auth.role() = 'authenticated');

create policy "Auth delete ticket stubs"
  on storage.objects for delete
  using (bucket_id = 'ticket-stubs' and auth.role() = 'authenticated');

create policy "Public read game screenshots"
  on storage.objects for select
  using (bucket_id = 'game-screenshots');

create policy "Auth upload game screenshots"
  on storage.objects for insert
  with check (bucket_id = 'game-screenshots' and auth.role() = 'authenticated');

create policy "Auth update game screenshots"
  on storage.objects for update
  using (bucket_id = 'game-screenshots' and auth.role() = 'authenticated');

create policy "Auth delete game screenshots"
  on storage.objects for delete
  using (bucket_id = 'game-screenshots' and auth.role() = 'authenticated');

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
