-- ===================================================================
-- STORAGE POLICIES FOR ENGLISH PRACTICE APP
-- ===================================================================
-- Run this script after creating the "audios" bucket in Supabase Dashboard
-- ===================================================================

-- Function to check if storage policy exists
CREATE OR REPLACE FUNCTION storage_policy_exists(table_name text, policy_name text)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM pg_policies 
        WHERE schemaname = 'storage' 
        AND tablename = table_name 
        AND policyname = policy_name
    );
END;
$$ LANGUAGE plpgsql;

-- Storage policies for audios bucket
DO $$
BEGIN
    IF NOT storage_policy_exists('objects', 'Users can upload their own audio files') THEN
        CREATE POLICY "Users can upload their own audio files"
            ON storage.objects FOR INSERT
            WITH CHECK (
                bucket_id = 'audios' 
                AND auth.uid()::text = (storage.foldername(name))[1]
            );
    END IF;
END $$;

DO $$
BEGIN
    IF NOT storage_policy_exists('objects', 'Users can view their own audio files') THEN
        CREATE POLICY "Users can view their own audio files"
            ON storage.objects FOR SELECT
            USING (
                bucket_id = 'audios' 
                AND auth.uid()::text = (storage.foldername(name))[1]
            );
    END IF;
END $$;

DO $$
BEGIN
    IF NOT storage_policy_exists('objects', 'Users can update their own audio files') THEN
        CREATE POLICY "Users can update their own audio files"
            ON storage.objects FOR UPDATE
            USING (
                bucket_id = 'audios' 
                AND auth.uid()::text = (storage.foldername(name))[1]
            );
    END IF;
END $$;

DO $$
BEGIN
    IF NOT storage_policy_exists('objects', 'Users can delete their own audio files') THEN
        CREATE POLICY "Users can delete their own audio files"
            ON storage.objects FOR DELETE
            USING (
                bucket_id = 'audios' 
                AND auth.uid()::text = (storage.foldername(name))[1]
            );
    END IF;
END $$;

-- Policy for listing files in user's folder
DO $$
BEGIN
    IF NOT storage_policy_exists('objects', 'Users can list their own audio files') THEN
        CREATE POLICY "Users can list their own audio files"
            ON storage.objects FOR SELECT
            USING (
                bucket_id = 'audios' 
                AND auth.uid()::text = (storage.foldername(name))[1]
            );
    END IF;
END $$;

-- Grant necessary permissions for storage
GRANT USAGE ON SCHEMA storage TO anon, authenticated;
GRANT ALL ON storage.objects TO anon, authenticated;
GRANT ALL ON storage.buckets TO anon, authenticated;

-- ===================================================================
-- COMPLETION MESSAGE
-- ===================================================================
SELECT 'Storage policies for English Practice App created successfully!' as status;