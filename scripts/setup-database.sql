-- English Practice App Database Setup
-- Run this script in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create playlists table
CREATE TABLE IF NOT EXISTS playlists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  visibility TEXT DEFAULT 'private' CHECK (visibility IN ('public', 'protected', 'private')),
  cover_image TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create audios table
CREATE TABLE IF NOT EXISTS audios (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  playlist_id UUID REFERENCES playlists(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  duration INTEGER,
  file_size INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE audios ENABLE ROW LEVEL SECURITY;

-- RLS Policies for playlists
CREATE POLICY IF NOT EXISTS "Users can view own playlists"
ON playlists FOR SELECT
USING (owner_id = auth.uid());

CREATE POLICY IF NOT EXISTS "Users can insert own playlists"
ON playlists FOR INSERT
WITH CHECK (owner_id = auth.uid());

CREATE POLICY IF NOT EXISTS "Users can update own playlists"
ON playlists FOR UPDATE
USING (owner_id = auth.uid());

CREATE POLICY IF NOT EXISTS "Users can delete own playlists"
ON playlists FOR DELETE
USING (owner_id = auth.uid());

-- RLS Policies for audios
CREATE POLICY IF NOT EXISTS "Users can view own audios"
ON audios FOR SELECT
USING (owner_id = auth.uid());

CREATE POLICY IF NOT EXISTS "Users can insert own audios"
ON audios FOR INSERT
WITH CHECK (owner_id = auth.uid());

CREATE POLICY IF NOT EXISTS "Users can update own audios"
ON audios FOR UPDATE
USING (owner_id = auth.uid());

CREATE POLICY IF NOT EXISTS "Users can delete own audios"
ON audios FOR DELETE
USING (owner_id = auth.uid());

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_playlists_owner_id ON playlists(owner_id);
CREATE INDEX IF NOT EXISTS idx_audios_owner_id ON audios(owner_id);
CREATE INDEX IF NOT EXISTS idx_audios_playlist_id ON audios(playlist_id);
CREATE INDEX IF NOT EXISTS idx_playlists_created_at ON playlists(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audios_created_at ON audios(created_at DESC);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
CREATE TRIGGER IF NOT EXISTS update_playlists_updated_at 
    BEFORE UPDATE ON playlists 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER IF NOT EXISTS update_audios_updated_at 
    BEFORE UPDATE ON audios 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to get audio count for playlists
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

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;
