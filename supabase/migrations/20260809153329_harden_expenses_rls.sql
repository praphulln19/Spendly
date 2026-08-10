-- Restrict table access to signed-in users and recreate the ownership policies
-- idempotently so they can be safely repaired or reapplied.
revoke all on table public.expenses from anon;
grant select, insert, update, delete on table public.expenses to authenticated;

alter table public.expenses enable row level security;

drop policy if exists "Users can view their own expenses" on public.expenses;
drop policy if exists "Users can add their own expenses" on public.expenses;
drop policy if exists "Users can update their own expenses" on public.expenses;
drop policy if exists "Users can delete their own expenses" on public.expenses;

create policy "Users can view their own expenses"
on public.expenses for select to authenticated
using (user_id = (select auth.uid()));

create policy "Users can add their own expenses"
on public.expenses for insert to authenticated
with check (user_id = (select auth.uid()));

create policy "Users can update their own expenses"
on public.expenses for update to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

create policy "Users can delete their own expenses"
on public.expenses for delete to authenticated
using (user_id = (select auth.uid()));
