-- The client app uses PostgREST's parameterized API rather than executing
-- SQL. Keep client roles from creating objects in the application schema.
revoke create on schema public from public;

-- Bound user-controlled text stored by the API.
alter table public.expenses
  add constraint expenses_description_length_check
  check (char_length(trim(description)) <= 500);
