-- Supabase Storage Setup for Audio Files
-- Run this script in your Supabase SQL Editor

-- Storage policies for audios bucket
-- Note: You need to create the "audios" bucket in Supabase Dashboard first

-- Policy for uploading audio files
CREATE POLICY IF NOT EXISTS "Users can upload their own audio files"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'audios' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy for viewing audio files
CREATE POLICY IF NOT EXISTS "Users can view their own audio files"
ON storage.objects FOR SELECT
USING (
    bucket_id = 'audios' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy for updating audio files
CREATE POLICY IF NOT EXISTS "Users can update their own audio files"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'audios' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy for deleting audio files
CREATE POLICY IF NOT EXISTS "Users can delete their own audio files"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'audios' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy for listing audio files
CREATE POLICY IF NOT EXISTS "Users can list their own audio files"
ON storage.objects FOR SELECT
USING (
    bucket_id = 'audios' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);
