-- Budget periods replace the single-row-per-user `user_budgets` model.
--
-- A period is an explicit window with its own amount ("₹12,000 until the 5th,
-- when my allowance lands"). The daily-allowance engine divides what is left of
-- that amount across the days remaining in the window, so a period -- not a
-- calendar month -- is the unit the whole app reasons about.
--
-- `stashed` is the piggy bank: money deliberately pulled out of the pool so it
-- stops being redistributed into future days.

create extension if not exists btree_gist;

create table if not exists public.budget_periods (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  amount numeric(12, 2) not null check (amount > 0),
  start_date date not null,
  end_date date not null,
  stashed numeric(12, 2) not null default 0 check (stashed >= 0),
  created_at timestamptz not null default now(),
  constraint budget_periods_range_check check (end_date >= start_date),
  constraint budget_periods_stash_within_amount check (stashed <= amount)
);

-- A user must never have two periods covering the same day: the daily allowance
-- for that day would be ambiguous.
alter table public.budget_periods
  drop constraint if exists budget_periods_no_overlap;

alter table public.budget_periods
  add constraint budget_periods_no_overlap
  exclude using gist (
    user_id with =,
    daterange(start_date, end_date, '[]') with &&
  );

create index if not exists budget_periods_user_start_idx
  on public.budget_periods (user_id, start_date desc);

alter table public.budget_periods enable row level security;
revoke all on table public.budget_periods from anon;
grant select, insert, update, delete on table public.budget_periods to authenticated;

drop policy if exists "Users can view their own budget periods" on public.budget_periods;
drop policy if exists "Users can add their own budget periods" on public.budget_periods;
drop policy if exists "Users can update their own budget periods" on public.budget_periods;
drop policy if exists "Users can delete their own budget periods" on public.budget_periods;

create policy "Users can view their own budget periods"
  on public.budget_periods for select to authenticated
  using (user_id = (select auth.uid()));

create policy "Users can add their own budget periods"
  on public.budget_periods for insert to authenticated
  with check (user_id = (select auth.uid()));

create policy "Users can update their own budget periods"
  on public.budget_periods for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "Users can delete their own budget periods"
  on public.budget_periods for delete to authenticated
  using (user_id = (select auth.uid()));

-- Carry existing budgets forward as a period covering the current calendar
-- month, so nobody signs in to a blank budget after deploy. `on conflict do
-- nothing` also covers the exclusion constraint, making this safe to re-run.
insert into public.budget_periods (user_id, amount, start_date, end_date)
select
  b.user_id,
  b.monthly_budget,
  date_trunc('month', current_date)::date,
  (date_trunc('month', current_date) + interval '1 month' - interval '1 day')::date
from public.user_budgets b
where b.monthly_budget > 0
on conflict do nothing;

-- `public.user_budgets` is intentionally left in place as a rollback safety net.
-- Once budget_periods is confirmed good in production it can be dropped.
