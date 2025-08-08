# Supabase Setup Guide

## 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up or log in
3. Create a new project
4. Note down your project URL and anon key

## 2. Environment Variables

Create a `.env.local` file in the root directory:

```bash
REACT_APP_SUPABASE_URL=your_supabase_project_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 3. Database Schema

Run these SQL commands in your Supabase SQL editor:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create playlists table
CREATE TABLE playlists (
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
CREATE TABLE audios (
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

-- Enable RLS
ALTER TABLE playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE audios ENABLE ROW LEVEL SECURITY;

-- RLS Policies for playlists
CREATE POLICY "Users can view own playlists"
ON playlists FOR SELECT
USING (owner_id = auth.uid());

CREATE POLICY "Users can insert own playlists"
ON playlists FOR INSERT
WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Users can update own playlists"
ON playlists FOR UPDATE
USING (owner_id = auth.uid());

CREATE POLICY "Users can delete own playlists"
ON playlists FOR DELETE
USING (owner_id = auth.uid());

-- RLS Policies for audios
CREATE POLICY "Users can view own audios"
ON audios FOR SELECT
USING (owner_id = auth.uid());

CREATE POLICY "Users can insert own audios"
ON audios FOR INSERT
WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Users can update own audios"
ON audios FOR UPDATE
USING (owner_id = auth.uid());

CREATE POLICY "Users can delete own audios"
ON audios FOR DELETE
USING (owner_id = auth.uid());

-- Create indexes for better performance
CREATE INDEX idx_playlists_owner_id ON playlists(owner_id);
CREATE INDEX idx_audios_owner_id ON audios(owner_id);
CREATE INDEX idx_audios_playlist_id ON audios(playlist_id);
```

## 4. Storage Setup

1. Go to Storage in your Supabase dashboard
2. Create a new bucket called "audios"
3. Set bucket to private
4. Add storage policies:

```sql
-- Storage policies for audios bucket
CREATE POLICY "Users can upload their own audio files"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'audios' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own audio files"
ON storage.objects FOR SELECT
USING (bucket_id = 'audios' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own audio files"
ON storage.objects FOR UPDATE
USING (bucket_id = 'audios' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own audio files"
ON storage.objects FOR DELETE
USING (bucket_id = 'audios' AND auth.uid()::text = (storage.foldername(name))[1]);
```

## 5. Authentication Settings

1. Go to Authentication > Settings in your Supabase dashboard
2. Configure email templates if needed
3. Set up redirect URLs for your domain

## 6. Testing

1. Start the development server: `npm start`
2. Test user registration and login
3. Test playlist creation and audio upload
4. Verify RLS policies are working

## 7. Deployment

1. Set environment variables in your hosting platform
2. Deploy the application
3. Update redirect URLs in Supabase dashboard
4. Test all functionality in production

## Troubleshooting

### Common Issues

1. **Environment variables not found**
   - Make sure `.env.local` is in the root directory
   - Restart the development server after adding variables

2. **Authentication not working**
   - Check Supabase project URL and anon key
   - Verify redirect URLs in Supabase dashboard

3. **Database operations failing**
   - Check RLS policies are enabled
   - Verify user is authenticated
   - Check database schema is created

4. **File uploads failing**
   - Verify storage bucket exists and is private
   - Check storage policies are set correctly
   - Verify file size limits

### Debug Commands

```bash
# Check environment variables
echo $REACT_APP_SUPABASE_URL

# Test Supabase connection
npm run test:supabase

# Check build for environment variables
npm run build
```
