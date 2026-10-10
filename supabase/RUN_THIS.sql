-- ============================================================
-- 請在 Supabase → SQL Editor 整份貼上執行（一次即可）
-- 修正打卡 category，並新增草稿箱、閱讀/觀看/遊玩日期
-- ============================================================

-- 1) check_ins.category（一天可多種類型）
alter table public.check_ins
  add column if not exists category text;

update public.check_ins
set category = 'book'
where category is null;

alter table public.check_ins
  alter column category set not null;

alter table public.check_ins
  drop constraint if exists check_ins_check_date_key;

alter table public.check_ins
  drop constraint if exists check_ins_date_category_unique;

alter table public.check_ins
  add constraint check_ins_date_category_unique unique (check_date, category);

alter table public.check_ins
  drop constraint if exists check_ins_category_check;

alter table public.check_ins
  add constraint check_ins_category_check
  check (category in ('book', 'movie', 'game'));

create index if not exists check_ins_date_category_idx
  on public.check_ins (check_date, category);

-- 2) 閱讀／觀看／遊玩日期
alter table public.book_reviews
  add column if not exists experience_date date;

alter table public.movie_reviews
  add column if not exists experience_date date;

alter table public.game_reviews
  add column if not exists experience_date date;

-- 3) 草稿箱
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

-- 重新整理 API schema cache（消除 category column 找不到）
notify pgrst, 'reload schema';
