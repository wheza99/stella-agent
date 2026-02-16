-- LinkedIn Profile Search Tables
-- Run this migration in Supabase SQL Editor or via Supabase CLI

-- ============================================
-- Table: linkedin_searches
-- Stores metadata about LinkedIn profile searches
-- ============================================

CREATE TABLE IF NOT EXISTS linkedin_searches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    query TEXT NOT NULL,
    search_params JSONB NOT NULL DEFAULT '{}',
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
    total_results INTEGER DEFAULT 0,
    apify_run_id TEXT,
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- Create indexes for linkedin_searches
CREATE INDEX IF NOT EXISTS idx_linkedin_searches_project ON linkedin_searches(project_id);
CREATE INDEX IF NOT EXISTS idx_linkedin_searches_user ON linkedin_searches(user_id);
CREATE INDEX IF NOT EXISTS idx_linkedin_searches_status ON linkedin_searches(status);
CREATE INDEX IF NOT EXISTS idx_linkedin_searches_created ON linkedin_searches(created_at DESC);

-- Add table comment
COMMENT ON TABLE linkedin_searches IS 'Stores LinkedIn profile search metadata and status';

-- ============================================
-- Table: linkedin_profiles
-- Stores scraped LinkedIn profile data
-- ============================================

CREATE TABLE IF NOT EXISTS linkedin_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    search_id UUID NOT NULL REFERENCES linkedin_searches(id) ON DELETE CASCADE,
    linkedin_id TEXT NOT NULL,
    linkedin_url TEXT NOT NULL,
    first_name TEXT,
    last_name TEXT,
    summary TEXT,
    picture_url TEXT,
    location TEXT,
    current_positions JSONB DEFAULT '[]',
    open_profile BOOLEAN DEFAULT FALSE,
    premium BOOLEAN DEFAULT FALSE,
    raw_data JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Prevent duplicate profiles in the same search
    CONSTRAINT unique_profile_per_search UNIQUE (search_id, linkedin_id)
);

-- Create indexes for linkedin_profiles
CREATE INDEX IF NOT EXISTS idx_linkedin_profiles_search ON linkedin_profiles(search_id);
CREATE INDEX IF NOT EXISTS idx_linkedin_profiles_linkedin_id ON linkedin_profiles(linkedin_id);

-- Add table comment
COMMENT ON TABLE linkedin_profiles IS 'Stores scraped LinkedIn profile data';

-- ============================================
-- Row Level Security (RLS) Policies
-- ============================================

-- Enable RLS on linkedin_searches
ALTER TABLE linkedin_searches ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own searches
CREATE POLICY "Users can view own searches"
    ON linkedin_searches FOR SELECT
    USING (auth.uid() = user_id);

-- Policy: Users can insert own searches
CREATE POLICY "Users can insert own searches"
    ON linkedin_searches FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update own searches
CREATE POLICY "Users can update own searches"
    ON linkedin_searches FOR UPDATE
    USING (auth.uid() = user_id);

-- Policy: Users can delete own searches
CREATE POLICY "Users can delete own searches"
    ON linkedin_searches FOR DELETE
    USING (auth.uid() = user_id);

-- Enable RLS on linkedin_profiles
ALTER TABLE linkedin_profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view profiles from their own searches
CREATE POLICY "Users can view profiles from own searches"
    ON linkedin_profiles FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM linkedin_searches
            WHERE linkedin_searches.id = linkedin_profiles.search_id
            AND linkedin_searches.user_id = auth.uid()
        )
    );

-- Policy: Users can insert profiles to their own searches
CREATE POLICY "Users can insert profiles to own searches"
    ON linkedin_profiles FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM linkedin_searches
            WHERE linkedin_searches.id = linkedin_profiles.search_id
            AND linkedin_searches.user_id = auth.uid()
        )
    );

-- Policy: Users can delete profiles from their own searches
CREATE POLICY "Users can delete profiles from own searches"
    ON linkedin_profiles FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM linkedin_searches
            WHERE linkedin_searches.id = linkedin_profiles.search_id
            AND linkedin_searches.user_id = auth.uid()
        )
    );
