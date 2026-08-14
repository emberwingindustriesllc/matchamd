-- ============================================================
-- IDEMPOTENT MIGRATION: User Saved Searches System
-- MatchAMD Database Schema
-- ============================================================

CREATE TABLE IF NOT EXISTS user_saved_searches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users ON DELETE CASCADE,
  name text NOT NULL,
  filters jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE user_saved_searches ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  DROP POLICY IF EXISTS "Users can view own saved searches" ON user_saved_searches;
  DROP POLICY IF EXISTS "Users can insert own saved searches" ON user_saved_searches;
  DROP POLICY IF EXISTS "Users can delete own saved searches" ON user_saved_searches;

  CREATE POLICY "Users can view own saved searches" ON user_saved_searches FOR SELECT USING (auth.uid() = user_id);
  CREATE POLICY "Users can insert own saved searches" ON user_saved_searches FOR INSERT WITH CHECK (auth.uid() = user_id);
  CREATE POLICY "Users can delete own saved searches" ON user_saved_searches FOR DELETE USING (auth.uid() = user_id);
END $$;

CREATE INDEX IF NOT EXISTS idx_saved_searches_user_id ON user_saved_searches(user_id);
