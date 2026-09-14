-- getExpenses() (src/services/expenseService.ts) orders by
-- `date desc, created_at desc` -- the tie-breaker matters because several
-- expenses logged on the same day are common. The existing
-- expenses_user_id_date_idx only covers (user_id, date desc), so Postgres can
-- use it to find a user's rows in date order but still has to sort each
-- same-date group by created_at separately. Widening the index to match the
-- query's full ORDER BY makes that sort index-satisfied too.

drop index if exists public.expenses_user_id_date_idx;

create index if not exists expenses_user_id_date_created_idx
  on public.expenses (user_id, date desc, created_at desc);
