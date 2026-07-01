-- ============================================
-- IDEMPOTENT MIGRATION: Subscription & Purchases
-- Safe to run multiple times
-- ============================================

-- 1. SUBSCRIPTIONS TABLE
CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan text NOT NULL DEFAULT 'free',
  status text NOT NULL DEFAULT 'active',
  stripe_customer_id text,
  stripe_subscription_id text,
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT unique_user_subscription UNIQUE (user_id)
);

-- Ensure Stripe columns exist if the table was created previously without them
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'subscriptions' AND column_name = 'stripe_customer_id') THEN
    ALTER TABLE subscriptions ADD COLUMN stripe_customer_id text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'subscriptions' AND column_name = 'stripe_subscription_id') THEN
    ALTER TABLE subscriptions ADD COLUMN stripe_subscription_id text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'subscriptions' AND column_name = 'current_period_start') THEN
    ALTER TABLE subscriptions ADD COLUMN current_period_start timestamptz;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'subscriptions' AND column_name = 'current_period_end') THEN
    ALTER TABLE subscriptions ADD COLUMN current_period_end timestamptz;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'subscriptions' AND column_name = 'cancel_at_period_end') THEN
    ALTER TABLE subscriptions ADD COLUMN cancel_at_period_end boolean DEFAULT false;
  END IF;
END $$;

-- 2. PURCHASED_CONTENT TABLE
CREATE TABLE IF NOT EXISTS purchased_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content_type text NOT NULL,
  content_id text NOT NULL,
  price numeric(10,2) NOT NULL DEFAULT 0.00,
  stripe_payment_id text,
  purchased_at timestamptz DEFAULT now(),
  CONSTRAINT unique_user_content UNIQUE (user_id, content_id)
);

-- Ensure purchased_content columns exist if the table was created previously without them
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'purchased_content' AND column_name = 'content_type') THEN
    ALTER TABLE purchased_content ADD COLUMN content_type text NOT NULL DEFAULT 'unknown';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'purchased_content' AND column_name = 'content_id') THEN
    ALTER TABLE purchased_content ADD COLUMN content_id text NOT NULL DEFAULT 'unknown';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'purchased_content' AND column_name = 'price') THEN
    ALTER TABLE purchased_content ADD COLUMN price numeric(10,2) NOT NULL DEFAULT 0.00;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'purchased_content' AND column_name = 'stripe_payment_id') THEN
    ALTER TABLE purchased_content ADD COLUMN stripe_payment_id text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'purchased_content' AND column_name = 'purchased_at') THEN
    ALTER TABLE purchased_content ADD COLUMN purchased_at timestamptz DEFAULT now();
  END IF;
END $$;

-- 3. ENABLE RLS
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchased_content ENABLE ROW LEVEL SECURITY;

-- 4. POLICIES (Drop and recreate to be idempotent)
DO $$
BEGIN
  -- Subscriptions policies
  DROP POLICY IF EXISTS "Users can view own subscription" ON subscriptions;
  DROP POLICY IF EXISTS "Users can insert own subscription" ON subscriptions;
  DROP POLICY IF EXISTS "Users can update own subscription" ON subscriptions;
  
  CREATE POLICY "Users can view own subscription" ON subscriptions
    FOR SELECT TO authenticated USING (auth.uid() = user_id);

  CREATE POLICY "Users can insert own subscription" ON subscriptions
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

  CREATE POLICY "Users can update own subscription" ON subscriptions
    FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

  -- Purchased content policies
  DROP POLICY IF EXISTS "Users can view own purchases" ON purchased_content;
  DROP POLICY IF EXISTS "Users can insert own purchases" ON purchased_content;

  CREATE POLICY "Users can view own purchases" ON purchased_content
    FOR SELECT TO authenticated USING (auth.uid() = user_id);

  CREATE POLICY "Users can insert own purchases" ON purchased_content
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
END $$;

-- 5. INDEXES for performance
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_sub_id ON subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_purchased_content_user_id ON purchased_content(user_id);
CREATE INDEX IF NOT EXISTS idx_purchased_content_content_id ON purchased_content(content_id);

-- 6. QUIZ_PROGRESS TABLE
CREATE TABLE IF NOT EXISTS quiz_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id text NOT NULL,
  questions_answered int DEFAULT 0,
  questions_correct int DEFAULT 0,
  last_updated timestamptz DEFAULT now(),
  CONSTRAINT unique_user_category UNIQUE (user_id, category_id)
);

-- Enable RLS
ALTER TABLE quiz_progress ENABLE ROW LEVEL SECURITY;

-- Quiz progress policies
DO $$
BEGIN
  DROP POLICY IF EXISTS "Users can view own quiz progress" ON quiz_progress;
  DROP POLICY IF EXISTS "Users can insert own quiz progress" ON quiz_progress;
  DROP POLICY IF EXISTS "Users can update own quiz progress" ON quiz_progress;

  CREATE POLICY "Users can view own quiz progress" ON quiz_progress
    FOR SELECT TO authenticated USING (auth.uid() = user_id);

  CREATE POLICY "Users can insert own quiz progress" ON quiz_progress
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

  CREATE POLICY "Users can update own quiz progress" ON quiz_progress
    FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
END $$;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_quiz_progress_user_id ON quiz_progress(user_id);
