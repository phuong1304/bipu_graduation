/*
# Allow deleting participant accounts

1. Policies
- Add RLS policy so the admin UI (anon key) can delete rows in `app_users`
  where `role = 'user'`.
*/

CREATE POLICY IF NOT EXISTS "Allow admin portal to delete participants"
ON app_users
FOR DELETE
TO anon
USING (role = 'user');

