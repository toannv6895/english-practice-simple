-- ===================================================================
-- ENGLISH PRACTICE APP - COMPLETE SUPABASE INITIALIZATION
-- ===================================================================
-- Version: 2.1 (Fixed Syntax)
-- Created: 2025-08-09
-- Description: Single script to initialize complete Supabase database
--              including auth, storage, tables, RLS, functions, and indexes
-- Usage: Run this script in Supabase SQL Editor after creating project
-- ===================================================================

-- ===================================================================
-- STEP 1: ENABLE EXTENSIONS
-- ===================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- ===================================================================
-- STEP 2: CREATE CORE TABLES
-- ===================================================================

-- Users table (extends Supabase Auth)
-- Note: auth.users is managed by Supabase, we add columns via triggers

-- Playlists table
CREATE TABLE IF NOT EXISTS playlists (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    visibility TEXT DEFAULT 'private' CHECK (visibility IN ('public', 'protected', 'private')),
    cover_image TEXT,
    audio_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Audios table with storage provider support
CREATE TABLE IF NOT EXISTS audios (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    playlist_id UUID REFERENCES playlists(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    url TEXT NOT NULL,
    duration INTEGER,
    file_size INTEGER,
    transcript TEXT,
    subtitle_url TEXT,
    storage_provider TEXT DEFAULT 'supabase' CHECK (storage_provider IN ('supabase', 's3', 'local')),
    storage_key TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Recording sessions for practice modes
CREATE TABLE IF NOT EXISTS recording_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    audio_id UUID REFERENCES audios(id) ON DELETE CASCADE,
    practice_mode TEXT NOT NULL CHECK (practice_mode IN ('listening', 'dictation', 'shadowing')),
    session_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    session_end TIMESTAMP WITH TIME ZONE,
    total_duration INTEGER DEFAULT 0, -- in seconds
    completed BOOLEAN DEFAULT FALSE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Dictation attempts tracking
CREATE TABLE IF NOT EXISTS dictation_attempts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID REFERENCES recording_sessions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    audio_id UUID REFERENCES audios(id) ON DELETE CASCADE,
    sentence_index INTEGER NOT NULL,
    original_text TEXT NOT NULL,
    user_input TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL,
    accuracy_score DECIMAL(5,2),
    time_taken INTEGER, -- in milliseconds
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Shadowing recordings with AI analysis
CREATE TABLE IF NOT EXISTS shadowing_recordings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID REFERENCES recording_sessions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    audio_id UUID REFERENCES audios(id) ON DELETE CASCADE,
    sentence_index INTEGER NOT NULL,
    original_text TEXT NOT NULL,
    audio_url TEXT,
    audio_duration INTEGER, -- in milliseconds
    pronunciation_score DECIMAL(5,2),
    fluency_score DECIMAL(5,2),
    completeness_score DECIMAL(5,2),
    overall_score DECIMAL(5,2),
    feedback JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Listening sessions tracking
CREATE TABLE IF NOT EXISTS listening_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID REFERENCES recording_sessions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    audio_id UUID REFERENCES audios(id) ON DELETE CASCADE,
    sentence_index INTEGER NOT NULL,
    original_text TEXT NOT NULL,
    time_listened INTEGER, -- in milliseconds
    repetitions INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===================================================================
-- STEP 3: ENABLE ROW LEVEL SECURITY (RLS)
-- ===================================================================
ALTER TABLE playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE audios ENABLE ROW LEVEL SECURITY;
ALTER TABLE recording_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE dictation_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE shadowing_recordings ENABLE ROW LEVEL SECURITY;
ALTER TABLE listening_sessions ENABLE ROW LEVEL SECURITY;

-- ===================================================================
-- STEP 4: CREATE RLS POLICIES (FIXED SYNTAX)
-- ===================================================================

-- Function to check if policy exists
CREATE OR REPLACE FUNCTION policy_exists(table_name text, policy_name text)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = table_name 
        AND policyname = policy_name
    );
END;
$$ LANGUAGE plpgsql;

-- Playlists policies
DO $$
BEGIN
    IF NOT policy_exists('playlists', 'Users can view own playlists') THEN
        CREATE POLICY "Users can view own playlists"
            ON playlists FOR SELECT
            USING (owner_id = auth.uid());
    END IF;
END $$;

DO $$
BEGIN
    IF NOT policy_exists('playlists', 'Users can insert own playlists') THEN
        CREATE POLICY "Users can insert own playlists"
            ON playlists FOR INSERT
            WITH CHECK (owner_id = auth.uid());
    END IF;
END $$;

DO $$
BEGIN
    IF NOT policy_exists('playlists', 'Users can update own playlists') THEN
        CREATE POLICY "Users can update own playlists"
            ON playlists FOR UPDATE
            USING (owner_id = auth.uid());
    END IF;
END $$;

DO $$
BEGIN
    IF NOT policy_exists('playlists', 'Users can delete own playlists') THEN
        CREATE POLICY "Users can delete own playlists"
            ON playlists FOR DELETE
            USING (owner_id = auth.uid());
    END IF;
END $$;

-- Audios policies
DO $$
BEGIN
    IF NOT policy_exists('audios', 'Users can view own audios') THEN
        CREATE POLICY "Users can view own audios"
            ON audios FOR SELECT
            USING (owner_id = auth.uid());
    END IF;
END $$;

DO $$
BEGIN
    IF NOT policy_exists('audios', 'Users can insert own audios') THEN
        CREATE POLICY "Users can insert own audios"
            ON audios FOR INSERT
            WITH CHECK (owner_id = auth.uid());
    END IF;
END $$;

DO $$
BEGIN
    IF NOT policy_exists('audios', 'Users can update own audios') THEN
        CREATE POLICY "Users can update own audios"
            ON audios FOR UPDATE
            USING (owner_id = auth.uid());
    END IF;
END $$;

DO $$
BEGIN
    IF NOT policy_exists('audios', 'Users can delete own audios') THEN
        CREATE POLICY "Users can delete own audios"
            ON audios FOR DELETE
            USING (owner_id = auth.uid());
    END IF;
END $$;

-- Recording sessions policies
DO $$
BEGIN
    IF NOT policy_exists('recording_sessions', 'Users can view own recording sessions') THEN
        CREATE POLICY "Users can view own recording sessions"
            ON recording_sessions FOR SELECT
            USING (user_id = auth.uid());
    END IF;
END $$;

DO $$
BEGIN
    IF NOT policy_exists('recording_sessions', 'Users can insert own recording sessions') THEN
        CREATE POLICY "Users can insert own recording sessions"
            ON recording_sessions FOR INSERT
            WITH CHECK (user_id = auth.uid());
    END IF;
END $$;

DO $$
BEGIN
    IF NOT policy_exists('recording_sessions', 'Users can update own recording sessions') THEN
        CREATE POLICY "Users can update own recording sessions"
            ON recording_sessions FOR UPDATE
            USING (user_id = auth.uid());
    END IF;
END $$;

-- Dictation attempts policies
DO $$
BEGIN
    IF NOT policy_exists('dictation_attempts', 'Users can view own dictation attempts') THEN
        CREATE POLICY "Users can view own dictation attempts"
            ON dictation_attempts FOR SELECT
            USING (user_id = auth.uid());
    END IF;
END $$;

DO $$
BEGIN
    IF NOT policy_exists('dictation_attempts', 'Users can insert own dictation attempts') THEN
        CREATE POLICY "Users can insert own dictation attempts"
            ON dictation_attempts FOR INSERT
            WITH CHECK (user_id = auth.uid());
    END IF;
END $$;

-- Shadowing recordings policies
DO $$
BEGIN
    IF NOT policy_exists('shadowing_recordings', 'Users can view own shadowing recordings') THEN
        CREATE POLICY "Users can view own shadowing recordings"
            ON shadowing_recordings FOR SELECT
            USING (user_id = auth.uid());
    END IF;
END $$;

DO $$
BEGIN
    IF NOT policy_exists('shadowing_recordings', 'Users can insert own shadowing recordings') THEN
        CREATE POLICY "Users can insert own shadowing recordings"
            ON shadowing_recordings FOR INSERT
            WITH CHECK (user_id = auth.uid());
    END IF;
END $$;

-- Listening sessions policies
DO $$
BEGIN
    IF NOT policy_exists('listening_sessions', 'Users can view own listening sessions') THEN
        CREATE POLICY "Users can view own listening sessions"
            ON listening_sessions FOR SELECT
            USING (user_id = auth.uid());
    END IF;
END $$;

DO $$
BEGIN
    IF NOT policy_exists('listening_sessions', 'Users can insert own listening sessions') THEN
        CREATE POLICY "Users can insert own listening sessions"
            ON listening_sessions FOR INSERT
            WITH CHECK (user_id = auth.uid());
    END IF;
END $$;

-- ===================================================================
-- STEP 5: CREATE INDEXES FOR PERFORMANCE
-- ===================================================================

-- Playlists indexes
CREATE INDEX IF NOT EXISTS idx_playlists_owner_id ON playlists(owner_id);
CREATE INDEX IF NOT EXISTS idx_playlists_created_at ON playlists(created_at DESC);

-- Audios indexes
CREATE INDEX IF NOT EXISTS idx_audios_owner_id ON audios(owner_id);
CREATE INDEX IF NOT EXISTS idx_audios_playlist_id ON audios(playlist_id);
CREATE INDEX IF NOT EXISTS idx_audios_created_at ON audios(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audios_storage_provider ON audios(storage_provider);

-- Recording sessions indexes
CREATE INDEX IF NOT EXISTS idx_recording_sessions_user_id ON recording_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_recording_sessions_audio_id ON recording_sessions(audio_id);
CREATE INDEX IF NOT EXISTS idx_recording_sessions_practice_mode ON recording_sessions(practice_mode);
CREATE INDEX IF NOT EXISTS idx_recording_sessions_created_at ON recording_sessions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_recording_sessions_completed ON recording_sessions(completed);

-- Dictation attempts indexes
CREATE INDEX IF NOT EXISTS idx_dictation_attempts_session_id ON dictation_attempts(session_id);
CREATE INDEX IF NOT EXISTS idx_dictation_attempts_user_id ON dictation_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_dictation_attempts_audio_id ON dictation_attempts(audio_id);
CREATE INDEX IF NOT EXISTS idx_dictation_attempts_is_correct ON dictation_attempts(is_correct);

-- Shadowing recordings indexes
CREATE INDEX IF NOT EXISTS idx_shadowing_recordings_session_id ON shadowing_recordings(session_id);
CREATE INDEX IF NOT EXISTS idx_shadowing_recordings_user_id ON shadowing_recordings(user_id);
CREATE INDEX IF NOT EXISTS idx_shadowing_recordings_audio_id ON shadowing_recordings(audio_id);
CREATE INDEX IF NOT EXISTS idx_shadowing_recordings_overall_score ON shadowing_recordings(overall_score);

-- Listening sessions indexes
CREATE INDEX IF NOT EXISTS idx_listening_sessions_session_id ON listening_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_listening_sessions_user_id ON listening_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_listening_sessions_audio_id ON listening_sessions(audio_id);

-- ===================================================================
-- STEP 6: CREATE UTILITY FUNCTIONS
-- ===================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Function to get audio count for playlists
CREATE OR REPLACE FUNCTION get_playlist_audio_count(playlist_uuid UUID)
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT COUNT(*) 
        FROM audios 
        WHERE playlist_id = playlist_uuid
    );
END;
$$ LANGUAGE plpgsql;

-- Function to get user practice statistics
CREATE OR REPLACE FUNCTION get_user_practice_stats(user_uuid UUID)
RETURNS TABLE (
    total_sessions BIGINT,
    total_duration BIGINT,
    total_dictation_attempts BIGINT,
    avg_dictation_accuracy DECIMAL(5,2),
    total_shadowing_recordings BIGINT,
    avg_shadowing_score DECIMAL(5,2),
    total_listening_sessions BIGINT,
    last_session TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(DISTINCT rs.id) as total_sessions,
        COALESCE(SUM(rs.total_duration), 0) as total_duration,
        COUNT(DISTINCT da.id) as total_dictation_attempts,
        (
            SELECT AVG(da.accuracy_score) 
            FROM dictation_attempts da 
            WHERE da.user_id = user_uuid AND da.accuracy_score IS NOT NULL
        ) as avg_dictation_accuracy,
        COUNT(DISTINCT sr.id) as total_shadowing_recordings,
        (
            SELECT AVG(sr.overall_score) 
            FROM shadowing_recordings sr 
            WHERE sr.user_id = user_uuid AND sr.overall_score IS NOT NULL
        ) as avg_shadowing_score,
        COUNT(DISTINCT ls.id) as total_listening_sessions,
        MAX(rs.session_start) as last_session
    FROM recording_sessions rs
    LEFT JOIN dictation_attempts da ON da.user_id = user_uuid
    LEFT JOIN shadowing_recordings sr ON sr.user_id = user_uuid
    LEFT JOIN listening_sessions ls ON ls.user_id = user_uuid
    WHERE rs.user_id = user_uuid
    GROUP BY user_uuid;
END;
$$ LANGUAGE plpgsql;

-- Function to get playlist with audio count
CREATE OR REPLACE FUNCTION get_playlists_with_count(user_uuid UUID)
RETURNS TABLE (
    id UUID,
    name TEXT,
    description TEXT,
    visibility TEXT,
    cover_image TEXT,
    audio_count INTEGER,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.name,
        p.description,
        p.visibility,
        p.cover_image,
        get_playlist_audio_count(p.id) as audio_count,
        p.created_at,
        p.updated_at
    FROM playlists p
    WHERE p.owner_id = user_uuid
    ORDER BY p.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- ===================================================================
-- STEP 7: CREATE TRIGGERS
-- ===================================================================

-- Triggers for automatic updated_at
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'update_playlists_updated_at' 
        AND tgrelid = 'playlists'::regclass
    ) THEN
        CREATE TRIGGER update_playlists_updated_at 
            BEFORE UPDATE ON playlists 
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'update_audios_updated_at' 
        AND tgrelid = 'audios'::regclass
    ) THEN
        CREATE TRIGGER update_audios_updated_at 
            BEFORE UPDATE ON audios 
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'update_recording_sessions_updated_at' 
        AND tgrelid = 'recording_sessions'::regclass
    ) THEN
        CREATE TRIGGER update_recording_sessions_updated_at 
            BEFORE UPDATE ON recording_sessions 
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- ===================================================================
-- STEP 8: STORAGE SETUP (MANUAL STEPS REQUIRED)
-- ===================================================================
/*
STORAGE SETUP INSTRUCTIONS:
1. Go to Supabase Dashboard > Storage
2. Create a new bucket named "audios"
3. Set bucket to private
4. Run the storage policies below after bucket creation
*/

-- Storage policies (run after creating bucket)
-- DO $$
-- BEGIN
--     IF NOT policy_exists('objects', 'Users can upload their own audio files') THEN
--         CREATE POLICY "Users can upload their own audio files"
--             ON storage.objects FOR INSERT
--             WITH CHECK (
--                 bucket_id = 'audios' 
--                 AND auth.uid()::text = (storage.foldername(name))[1]
--             );
--     END IF;
-- END $$;

-- ===================================================================
-- STEP 9: GRANT PERMISSIONS
-- ===================================================================
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- Storage permissions (if storage extension is available)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.schemata WHERE schema_name = 'storage') THEN
        GRANT USAGE ON SCHEMA storage TO anon, authenticated;
        GRANT ALL ON storage.objects TO anon, authenticated;
        GRANT ALL ON storage.buckets TO anon, authenticated;
    END IF;
END $$;

-- ===================================================================
-- STEP 10: SAMPLE DATA (OPTIONAL)
-- ===================================================================
/*
-- Sample playlists for testing
INSERT INTO playlists (owner_id, name, description, visibility) VALUES
    ('00000000-0000-0000-0000-000000000000', 'Basic English', 'Basic English conversations', 'public'),
    ('00000000-0000-0000-0000-000000000000', 'Business English', 'Business English scenarios', 'public');

-- Sample audios for testing
INSERT INTO audios (owner_id, playlist_id, name, url, duration, file_size) VALUES
    ('00000000-0000-0000-0000-000000000000', 
     (SELECT id FROM playlists WHERE name = 'Basic English' LIMIT 1),
     'Greeting Conversation', 
     'https://example.com/audio1.mp3', 
     180, 
     2048576);
*/

-- ===================================================================
-- COMPLETION MESSAGE
-- ===================================================================
SELECT 'English Practice App database initialization complete!' as status;