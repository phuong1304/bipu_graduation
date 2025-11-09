-- Add salutation column to app_users to store honorifics (e.g., Anh/Chị)
ALTER TABLE app_users
  ADD COLUMN IF NOT EXISTS salutation text;

UPDATE app_users
SET salutation = ''
WHERE salutation IS NULL;

ALTER TABLE app_users
  ALTER COLUMN salutation SET DEFAULT '';
