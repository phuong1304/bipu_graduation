/*
# Enforce unique RSVP per email and allow updates

1. Data Cleanup
- Remove older duplicate rows so each email has at most one record.

2. Constraints
- Add unique constraint on email to support UPSERT logic.

3. Security
- Allow anonymous clients to update rows (needed for upsert).
*/

WITH ranked AS (
    SELECT
        id,
        ROW_NUMBER() OVER (PARTITION BY email ORDER BY created_at DESC) AS rn
    FROM rsvp_responses
)
DELETE FROM rsvp_responses r
USING ranked
WHERE r.id = ranked.id
  AND ranked.rn > 1;

ALTER TABLE rsvp_responses
ADD CONSTRAINT rsvp_responses_email_key UNIQUE (email);

CREATE POLICY "Allow anonymous users to update RSVP"
ON rsvp_responses
FOR UPDATE
TO anon
USING (true)
WITH CHECK (true);
