ALTER TABLE public.check_ins ENABLE ROW LEVEL SECURITY;

create policy "Allow user to see their own check-ins"
on check_ins for select
to authenticated
using ( (select auth.uid()) = user_id );
create policy "Allow user to check themselves in"
on check_ins for insert
to authenticated                          -- the Postgres Role (recommended)
with check ( (select auth.uid()) = user_id ); 

create policy "Allow user to check themselves out"
on check_ins for update
to authenticated                          -- the Postgres Role (recommended)
using ( (select auth.uid()) = user_id )       -- checks if the existing row complies with the policy expression
with check ( (select auth.uid()) = user_id );
-- create policy "Allow user to check themselves in" on "public"."check_ins" for insert to authenticated with check (auth.uid() = user_id);
-- CREATE POLICY "Allow user to check themselves out"
-- ON "public"."check_ins"
-- FOR UPDATE
-- TO authenticated
-- USING ( auth.uid() = user_id );
-- create unique index one_active_check_in_per_user
-- on public.check_ins (user_id)
-- where (check_out_time is null);
-- This function will be executed by our trigger
-- CREATE OR REPLACE FUNCTION public.handle_check_out_update()
-- RETURNS TRIGGER AS $$
-- BEGIN
--   -- RULE 1: Disallow changing the check_out_time if it's already set.
--   -- A user cannot "re-check-out" or change their checkout time.
--   IF OLD.check_out_time IS NOT NULL THEN
--     RAISE EXCEPTION 'Cannot update a completed check-in';
--   END IF;

--   -- RULE 2: Disallow changing the original check_in_time.
--   -- The NEW.check_in_time must be the same as the OLD one.
--   IF NEW.check_in_time IS DISTINCT FROM OLD.check_in_time THEN
--     RAISE EXCEPTION 'Cannot alter the original check_in_time';
--   END IF;
  
--   -- RULE 3: Disallow changing the user_id.
--   IF NEW.user_id IS DISTINCT FROM OLD.user_id THEN
--     RAISE EXCEPTION 'Cannot change the user associated with a check-in';
--   END IF;

--   -- If all checks pass, allow the update to proceed.
--   RETURN NEW;
-- END;
-- $$ LANGUAGE plpgsql SECURITY DEFINER;





