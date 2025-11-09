/*
# Add ceremony invite flag

Adds invited_to_ceremony boolean to app_users to track graduation ceremony invites.
*/

ALTER TABLE app_users
    ADD COLUMN IF NOT EXISTS invited_to_ceremony boolean NOT NULL DEFAULT true;

UPDATE app_users
SET invited_to_ceremony = true
WHERE invited_to_ceremony IS NULL;
