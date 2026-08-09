create extension if not exists "pgcrypto";

create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  date date not null,
  category text not null check (category in (
    'Food', 'Transport', 'Education', 'Rent/Hostel', 'Mobile/Internet',
    'Shopping', 'Entertainment', 'Personal', 'Subscriptions', 'Other'
  )),
  description text not null check (char_length(trim(description)) > 0),
  amount numeric(12, 2) not null check (amount > 0),
  type text not null check (type in ('Need', 'Want')),
  created_at timestamptz not null default now()
);

create index if not exists expenses_user_id_date_idx on public.expenses (user_id, date desc);

alter table public.expenses enable row level security;

create policy "Users can view their own expenses" on public.expenses
  for select to authenticated using (auth.uid() = user_id);

create policy "Users can add their own expenses" on public.expenses
  for insert to authenticated with check (auth.uid() = user_id);

create policy "Users can update their own expenses" on public.expenses
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users can delete their own expenses" on public.expenses
  for delete to authenticated using (auth.uid() = user_id);
