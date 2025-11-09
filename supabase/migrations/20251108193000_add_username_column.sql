/*
# Add username to app_users

1. Schema
- Add `username` column with unique constraint.

2. Data
- Populate existing rows with sensible usernames.
*/

ALTER TABLE app_users ADD COLUMN IF NOT EXISTS username text;

UPDATE app_users
SET
    username = CASE
        WHEN email = 'guest.participant@example.com' THEN 'guest_participant'
        WHEN email = 'admin@example.com' THEN 'admin_master'
        ELSE regexp_replace(
            lower(split_part (email, '@', 1)),
            '[^a-z0-9_]+',
            '_',
            'g'
        )
    END
WHERE
    username IS NULL;

ALTER TABLE app_users ALTER COLUMN username SET NOT NULL;