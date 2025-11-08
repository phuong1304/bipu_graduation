/*
  # Add Wish Reactions Table

  1. New Tables
    - `wish_reactions`
      - `id` (uuid, primary key) - Unique identifier for each reaction
      - `wish_id` (uuid, foreign key) - Reference to the wish being reacted to
      - `sticker` (text) - The emoji/sticker used for reaction
      - `session_id` (text) - Anonymous session identifier to prevent duplicate reactions
      - `created_at` (timestamptz) - Timestamp when reaction was added

  2. Security
    - Enable RLS on `wish_reactions` table
    - Allow anonymous users to insert reactions
    - Allow anyone to read reactions (for displaying reaction counts)

  3. Indexes
    - Add index on wish_id for efficient querying of reactions per wish
    - Add unique constraint to prevent duplicate reactions from same session on same wish
*/

CREATE TABLE IF NOT EXISTS wish_reactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wish_id uuid NOT NULL REFERENCES wishes(id) ON DELETE CASCADE,
  sticker text NOT NULL,
  session_id text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE wish_reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous users to insert reactions"
  ON wish_reactions
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow anyone to read reactions"
  ON wish_reactions
  FOR SELECT
  TO anon
  USING (true);

CREATE INDEX IF NOT EXISTS idx_wish_reactions_wish_id ON wish_reactions(wish_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_wish_reactions_unique_session_sticker 
  ON wish_reactions(wish_id, session_id, sticker);