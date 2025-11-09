/*
# Track dinner attendance per RSVP and remove ceremony flag from app_users

1. Schema changes
   - Add boolean column `will_attend_dinner` to `rsvp_responses`
   - Drop `invited_to_ceremony` column from `app_users`

2. Data migration
   - Initialize `will_attend_dinner` using existing `invited_to_dinner` flag where possible
*/

ALTER TABLE rsvp_responses
    ADD COLUMN IF NOT EXISTS will_attend_dinner boolean;

UPDATE rsvp_responses r
SET will_attend_dinner = a.invited_to_dinner
FROM app_users a
WHERE a.email = r.email
  AND r.will_attend_dinner IS NULL;

ALTER TABLE app_users
    DROP COLUMN IF EXISTS invited_to_ceremony;
