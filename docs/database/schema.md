# Database Schema & RLS Policies

## Overview

This document outlines the complete database schema for CWSbooks using Supabase (PostgreSQL) and the Row Level Security (RLS) policies to ensure data protection.

## Database Schema

### Users & Authentication

Supabase handles the `auth.users` table automatically. We extend it with a public profile:

```sql
-- Public user profiles
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  subscription_status TEXT DEFAULT 'free' CHECK (subscription_status IN ('free', 'active', 'cancelled', 'past_due')),
  subscription_expires_at TIMESTAMPTZ,
  stripe_customer_id TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger to create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (new.id, new.email);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

### Books & Content

```sql
-- Books table
CREATE TABLE books (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  description TEXT,
  cover_image_url TEXT,
  isbn TEXT UNIQUE,
  published_date DATE,
  genre TEXT[],
  language TEXT DEFAULT 'en',
  total_chapters INTEGER NOT NULL,
  preview_chapters INTEGER DEFAULT 1,
  price DECIMAL(10,2),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chapters table
CREATE TABLE chapters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  chapter_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  word_count INTEGER,
  estimated_reading_time INTEGER, -- in minutes
  is_preview BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(book_id, chapter_number)
);

-- Create indexes for better performance
CREATE INDEX idx_chapters_book_id ON chapters(book_id);
CREATE INDEX idx_chapters_preview ON chapters(is_preview);
```

### User Library & Progress

```sql
-- User's book library (for individual purchases)
CREATE TABLE user_books (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  purchased_at TIMESTAMPTZ DEFAULT NOW(),
  access_expires_at TIMESTAMPTZ, -- NULL means permanent access
  stripe_payment_id TEXT,
  UNIQUE(user_id, book_id)
);

-- Reading progress tracking
CREATE TABLE reading_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  current_chapter_id UUID REFERENCES chapters(id),
  current_position INTEGER DEFAULT 0, -- Character position in chapter
  completion_percentage DECIMAL(5,2) DEFAULT 0,
  total_reading_time INTEGER DEFAULT 0, -- in seconds
  last_read_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, book_id)
);

-- Bookmarks
CREATE TABLE bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  chapter_id UUID NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
  position INTEGER NOT NULL,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, chapter_id, position)
);

-- Reading sessions for analytics
CREATE TABLE reading_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  chapter_id UUID NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  duration INTEGER, -- in seconds
  pages_read INTEGER DEFAULT 0
);
```

### Subscriptions & Payments

```sql
-- Subscription plans
CREATE TABLE subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  interval TEXT NOT NULL CHECK (interval IN ('month', 'year')),
  features JSONB,
  stripe_price_id TEXT UNIQUE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User subscriptions
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES subscription_plans(id),
  stripe_subscription_id TEXT UNIQUE,
  status TEXT NOT NULL,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payment history
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'usd',
  status TEXT NOT NULL,
  stripe_payment_intent_id TEXT UNIQUE,
  description TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Row Level Security (RLS) Policies

### Enable RLS on all tables

```sql
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_books ENABLE ROW LEVEL SECURITY;
ALTER TABLE reading_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE reading_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
```

### Profiles Policies

```sql
-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Public profiles for social features (optional)
CREATE POLICY "Public profiles are viewable" ON profiles
  FOR SELECT USING (true);
```

### Books Policies

```sql
-- Everyone can view active books
CREATE POLICY "Active books are public" ON books
  FOR SELECT USING (is_active = true);

-- Only admins can insert/update/delete books
CREATE POLICY "Admins can manage books" ON books
  FOR ALL USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE email IN ('admin@example.com')
    )
  );
```

### Chapters Policies

```sql
-- Preview chapters are public
CREATE POLICY "Preview chapters are public" ON chapters
  FOR SELECT USING (is_preview = true);

-- Paid chapters require subscription or purchase
CREATE POLICY "Paid chapters for subscribers" ON chapters
  FOR SELECT USING (
    is_preview = true
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND subscription_status = 'active'
      AND subscription_expires_at > NOW()
    )
    OR EXISTS (
      SELECT 1 FROM user_books
      WHERE user_id = auth.uid()
      AND book_id = chapters.book_id
      AND (access_expires_at IS NULL OR access_expires_at > NOW())
    )
  );
```

### Reading Progress Policies

```sql
-- Users can only access their own reading progress
CREATE POLICY "Users can view own reading progress" ON reading_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own reading progress" ON reading_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reading progress" ON reading_progress
  FOR UPDATE USING (auth.uid() = user_id);
```

### Bookmarks Policies

```sql
-- Users can manage their own bookmarks
CREATE POLICY "Users can manage own bookmarks" ON bookmarks
  FOR ALL USING (auth.uid() = user_id);
```

### Subscriptions & Payments Policies

```sql
-- Users can view their own subscriptions
CREATE POLICY "Users can view own subscriptions" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- Users can view their own payments
CREATE POLICY "Users can view own payments" ON payments
  FOR SELECT USING (auth.uid() = user_id);

-- Only system can insert/update subscriptions and payments
-- (handled by Supabase Edge Functions with service role)
```

## Helper Functions

```sql
-- Function to check if user has access to a book
CREATE OR REPLACE FUNCTION user_has_book_access(book_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND subscription_status = 'active'
    AND subscription_expires_at > NOW()
  ) OR EXISTS (
    SELECT 1 FROM user_books
    WHERE user_id = auth.uid()
    AND book_id = book_uuid
    AND (access_expires_at IS NULL OR access_expires_at > NOW())
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's reading statistics
CREATE OR REPLACE FUNCTION get_reading_stats(user_uuid UUID)
RETURNS TABLE (
  total_books_read INTEGER,
  total_reading_time INTEGER,
  current_streak INTEGER,
  books_in_progress INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(DISTINCT book_id)::INTEGER as total_books_read,
    SUM(total_reading_time)::INTEGER as total_reading_time,
    -- Streak calculation would go here
    0 as current_streak,
    COUNT(DISTINCT CASE WHEN completion_percentage < 100 THEN book_id END)::INTEGER as books_in_progress
  FROM reading_progress
  WHERE user_id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## Indexes for Performance

```sql
-- Performance indexes
CREATE INDEX idx_reading_progress_user_book ON reading_progress(user_id, book_id);
CREATE INDEX idx_bookmarks_user_book ON bookmarks(user_id, book_id);
CREATE INDEX idx_user_books_user ON user_books(user_id);
CREATE INDEX idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX idx_payments_user ON payments(user_id);
CREATE INDEX idx_books_genre ON books USING GIN(genre);
CREATE INDEX idx_reading_sessions_user_dates ON reading_sessions(user_id, started_at);
```

## Migration Notes

1. Run migrations in order
2. Ensure RLS policies are applied after table creation
3. Test policies thoroughly in Supabase dashboard
4. Use `supabase db reset` for fresh starts during development
5. Always backup before running migrations in production