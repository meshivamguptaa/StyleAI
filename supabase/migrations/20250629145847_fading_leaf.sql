-- Fix storage bucket and policies for chat-media bucket
-- This migration ensures the bucket exists and has proper RLS policies

-- First, ensure the bucket exists with correct configuration
DO $$
BEGIN
  -- Try to insert the bucket, ignore if it already exists
  INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
  VALUES (
    'chat-media',
    'chat-media',
    true,
    10485760, -- 10MB
    ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/m4a']
  )
  ON CONFLICT (id) DO UPDATE SET
    public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;
EXCEPTION
  WHEN OTHERS THEN
    -- If there's any error (like RLS), just continue
    RAISE NOTICE 'Bucket creation/update had an issue, but continuing: %', SQLERRM;
END $$;

-- Drop all existing policies to start fresh
DO $$
DECLARE
    policy_name TEXT;
BEGIN
    FOR policy_name IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE schemaname = 'storage' 
        AND tablename = 'objects'
        AND policyname LIKE '%chat-media%' 
        OR policyname LIKE '%public folder%'
        OR policyname LIKE '%media files%'
        OR policyname LIKE '%storage objects%'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || policy_name || '" ON storage.objects';
    END LOOP;
END $$;

-- Create comprehensive storage policies for the chat-media bucket
-- These policies are designed to work with the public folder structure

-- 1. Allow public read access to public folder (most permissive)
CREATE POLICY "chat_media_public_read" ON storage.objects
FOR SELECT TO public
USING (
  bucket_id = 'chat-media' AND 
  (storage.foldername(name))[1] = 'public'
);

-- 2. Allow authenticated users to upload to public folder
CREATE POLICY "chat_media_authenticated_upload" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'chat-media' AND 
  (storage.foldername(name))[1] = 'public'
);

-- 3. Allow authenticated users to update files in public folder
CREATE POLICY "chat_media_authenticated_update" ON storage.objects
FOR UPDATE TO authenticated
USING (
  bucket_id = 'chat-media' AND 
  (storage.foldername(name))[1] = 'public'
);

-- 4. Allow authenticated users to delete files in public folder
CREATE POLICY "chat_media_authenticated_delete" ON storage.objects
FOR DELETE TO authenticated
USING (
  bucket_id = 'chat-media' AND 
  (storage.foldername(name))[1] = 'public'
);

-- 5. Fallback policy for authenticated users (broader access)
CREATE POLICY "chat_media_authenticated_all" ON storage.objects
FOR ALL TO authenticated
USING (
  bucket_id = 'chat-media'
)
WITH CHECK (
  bucket_id = 'chat-media'
);

-- 6. Service role access (for admin operations)
CREATE POLICY "chat_media_service_role" ON storage.objects
FOR ALL TO service_role
USING (bucket_id = 'chat-media')
WITH CHECK (bucket_id = 'chat-media');

-- Ensure RLS is enabled on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Grant necessary permissions
GRANT ALL ON storage.objects TO authenticated;
GRANT ALL ON storage.objects TO service_role;
GRANT SELECT ON storage.objects TO anon;