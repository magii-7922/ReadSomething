-- 正在看置頂 + 評論序號：請在 Supabase SQL Editor 整份執行

alter table public.wish_items
  add column if not exists is_watching boolean not null default false;

alter table public.book_reviews
  add column if not exists serial_no integer;

alter table public.movie_reviews
  add column if not exists serial_no integer;

alter table public.game_reviews
  add column if not exists serial_no integer;

alter table public.event_reviews
  add column if not exists serial_no integer;

with numbered as (
  select id, row_number() over (order by created_at asc) as n
  from public.book_reviews
)
update public.book_reviews b
set serial_no = numbered.n
from numbered
where b.id = numbered.id and b.serial_no is null;

with numbered as (
  select id, row_number() over (order by created_at asc) as n
  from public.movie_reviews
)
update public.movie_reviews b
set serial_no = numbered.n
from numbered
where b.id = numbered.id and b.serial_no is null;

with numbered as (
  select id, row_number() over (order by created_at asc) as n
  from public.game_reviews
)
update public.game_reviews b
set serial_no = numbered.n
from numbered
where b.id = numbered.id and b.serial_no is null;

with numbered as (
  select id, row_number() over (order by created_at asc) as n
  from public.event_reviews
)
update public.event_reviews b
set serial_no = numbered.n
from numbered
where b.id = numbered.id and b.serial_no is null;

create unique index if not exists book_reviews_serial_uidx on public.book_reviews (serial_no);
create unique index if not exists movie_reviews_serial_uidx on public.movie_reviews (serial_no);
create unique index if not exists game_reviews_serial_uidx on public.game_reviews (serial_no);
create unique index if not exists event_reviews_serial_uidx on public.event_reviews (serial_no);

notify pgrst, 'reload schema';
