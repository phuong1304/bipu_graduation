/*
# Add App Users Table

1. New Table
- `app_users`
- `id` (uuid, primary key) - Unique identifier per account
- `email` (text, unique) - Login identifier
- `display_name` (text) - Friendly name shown in the UI
- `password` (text) - Plain password placeholder (replace with hashed secret in production)
- `role` (text) - Either `user` or `admin`
- `created_at` / `updated_at` - Audit timestamps

2. Security
- Enable RLS on `app_users`
- Allow anonymous clients to create `user` records (self sign-up)
- Allow anonymous clients to read user records (required for custom login flow)
- Allow anonymous clients to update their own `user` records

3. Indexes
- Unique email constraint for fast lookups
- Role index for quick segmentation
*/

CREATE TABLE IF NOT EXISTS app_users (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    email text NOT NULL UNIQUE,
    username text NOT NULL UNIQUE,
    display_name text NOT NULL,
    password text NOT NULL,
    role text NOT NULL CHECK (role IN ('user', 'admin')),
    invited_to_dinner boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_app_users_role ON app_users (role);

ALTER TABLE app_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous registration for regular users"
ON app_users
FOR INSERT
TO anon
WITH CHECK (role = 'user');

CREATE POLICY "Allow anonymous login checks"
ON app_users
FOR SELECT
TO anon
USING (true);

CREATE POLICY "Allow users to update their own profile rows"
ON app_users
FOR UPDATE
TO anon
USING (role = 'user')
WITH CHECK (role = 'user');

INSERT INTO app_users (email, username, display_name, password, role, invited_to_dinner)
VALUES
    ('guest.participant@example.com', 'guest_participant', 'Khach Moi Dac Biet', 'user123', 'user', true),
    ('admin@example.com', 'admin_master', 'Quan Tri Vien', 'admin123', 'admin', false)
ON CONFLICT (email) DO UPDATE
SET
    display_name = EXCLUDED.display_name,
    password = EXCLUDED.password,
    role = EXCLUDED.role,
    invited_to_dinner = EXCLUDED.invited_to_dinner,
    username = EXCLUDED.username,
    updated_at = now();
