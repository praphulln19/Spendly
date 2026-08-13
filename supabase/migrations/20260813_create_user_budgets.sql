-- Create table to store per-user monthly budgets in Supabase DB
create table if not exists public.user_budgets (
  user_id uuid primary key references auth.users(id) on delete cascade default auth.uid(),
  monthly_budget numeric(12, 2) not null check (monthly_budget >= 0),
  updated_at timestamptz not null default now()
);

-- Enable RLS and grant permissions
alter table public.user_budgets enable row level security;
revoke all on table public.user_budgets from anon;
grant select, insert, update, delete on table public.user_budgets to authenticated;

-- Policies for authenticated users to manage their own budget
drop policy if exists "Users can view their own budget" on public.user_budgets;
drop policy if exists "Users can insert their own budget" on public.user_budgets;
drop policy if exists "Users can update their own budget" on public.user_budgets;

create policy "Users can view their own budget"
  on public.user_budgets for select to authenticated
  using (user_id = (select auth.uid()));

create policy "Users can insert their own budget"
  on public.user_budgets for insert to authenticated
  with check (user_id = (select auth.uid()));

create policy "Users can update their own budget"
  on public.user_budgets for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));
