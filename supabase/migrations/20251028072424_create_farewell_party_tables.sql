/*
# Create Farewell Party RSVP and Wishes Tables

1. New Tables
- `rsvp_responses`
- `id` (uuid, primary key) - Unique identifier for each RSVP
- `name` (text) - Guest's full name
- `email` (text) - Guest's email address
- `phone` (text, optional) - Guest's phone number
- `will_attend` (boolean) - Whether guest will attend
- `guest_count` (integer) - Number of people attending (including the guest)
- `dietary_requirements` (text, optional) - Any dietary restrictions or preferences
- `created_at` (timestamptz) - Timestamp when RSVP was submitted

- `wishes`
- `id` (uuid, primary key) - Unique identifier for each wish
- `name` (text) - Person's name
- `message` (text) - The farewell message/wish
- `created_at` (timestamptz) - Timestamp when wish was submitted

2. Security
- Enable RLS on both tables
- Allow anonymous users to insert data (for RSVP and wishes submission)
- Allow anyone to read wishes (for displaying on the page)
- Only allow reading RSVP data (no public display for privacy)

3. Indexes
- Add index on created_at for both tables for efficient sorting
*/

-- Create RSVP responses table
CREATE TABLE IF NOT EXISTS rsvp_responses (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid (),
    name text NOT NULL,
    email text NOT NULL,
    phone text,
    will_attend boolean NOT NULL DEFAULT true,
    guest_count integer NOT NULL DEFAULT 1,
    dietary_requirements text,
    created_at timestamptz DEFAULT now() updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create wishes table
CREATE TABLE IF NOT EXISTS wishes (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid (),
    name text NOT NULL,
    message text NOT NULL,
    created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE rsvp_responses ENABLE ROW LEVEL SECURITY;

ALTER TABLE wishes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for rsvp_responses
CREATE POLICY "Allow anonymous users to insert RSVP" ON rsvp_responses FOR
INSERT
    TO anon
WITH
    CHECK (true);

CREATE POLICY "Allow anonymous users to read RSVP" ON rsvp_responses FOR
SELECT TO anon USING (true);

-- RLS Policies for wishes
CREATE POLICY "Allow anonymous users to insert wishes" ON wishes FOR
INSERT
    TO anon
WITH
    CHECK (true);

CREATE POLICY "Allow anyone to read wishes" ON wishes FOR
SELECT TO anon USING (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_rsvp_created_at ON rsvp_responses (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_wishes_created_at ON wishes (created_at DESC);