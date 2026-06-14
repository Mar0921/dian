-- Add missing columns to games table
ALTER TABLE games ADD COLUMN IF NOT EXISTS buzzed_at timestamptz;
ALTER TABLE games ADD COLUMN IF NOT EXISTS question_deadline timestamptz;