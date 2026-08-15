-- Logging a spend should take two taps: amount, save. Requiring a description
-- put a keyboard in the middle of that, so descriptions are now optional and
-- the UI falls back to the category name when one is absent.
--
-- The 500-character upper bound from 20260809165929 stays: it is what keeps
-- user-controlled text bounded.

alter table public.expenses
  drop constraint if exists expenses_description_check;

alter table public.expenses
  alter column description set default '';
