-- Allow multiple category check-ins per day (book / movie / game)

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

notify pgrst, 'reload schema';

