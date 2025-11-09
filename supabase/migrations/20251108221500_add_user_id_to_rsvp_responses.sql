/*
# Link RSVPs to app users

1. Schema
- Add `user_id` (uuid) to `rsvp_responses`, referencing `app_users(id)` with cascade delete.
- Enforce one RSVP per user via unique constraint.

2. Data
- Backfill `user_id` for existing rows by matching emails / fallback guest emails.
- Remove duplicate responses per user before enforcing the constraint.
*/

ALTER TABLE rsvp_responses
    ADD COLUMN IF NOT EXISTS user_id uuid;

UPDATE rsvp_responses r
SET user_id = u.id
FROM app_users u
WHERE r.user_id IS NULL
  AND (
    r.email = u.email
    OR r.email = CONCAT(u.username, '@guests.local')
  );

-- Fallback: match by display name when emails were missing
UPDATE rsvp_responses r
SET user_id = u.id
FROM app_users u
WHERE r.user_id IS NULL
  AND r.name = u.display_name;

-- Drop duplicate RSVPs per user, keeping the most recent
WITH ranked AS (
  SELECT
    id,
    user_id,
    ROW_NUMBER() OVER (
      PARTITION BY user_id
      ORDER BY updated_at DESC NULLS LAST, created_at DESC NULLS LAST, id DESC
    ) AS rn
  FROM rsvp_responses
  WHERE user_id IS NOT NULL
)
DELETE FROM rsvp_responses
WHERE id IN (SELECT id FROM ranked WHERE rn > 1);

ALTER TABLE rsvp_responses
    ALTER COLUMN user_id SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE constraint_name = 'rsvp_responses_user_id_fkey'
      AND table_name = 'rsvp_responses'
  ) THEN
    ALTER TABLE rsvp_responses
      ADD CONSTRAINT rsvp_responses_user_id_fkey
      FOREIGN KEY (user_id)
      REFERENCES app_users (id)
      ON DELETE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE constraint_name = 'rsvp_responses_user_unique'
      AND table_name = 'rsvp_responses'
  ) THEN
    ALTER TABLE rsvp_responses
      ADD CONSTRAINT rsvp_responses_user_unique UNIQUE (user_id);
  END IF;
END $$;

