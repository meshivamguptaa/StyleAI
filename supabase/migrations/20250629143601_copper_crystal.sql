/*
  # Storage Policies for chat-media bucket

  1. Storage Policies
    - Public access to public folder for all users
    - Authenticated users can upload to public folder
    - Authenticated users can manage their own files
    - Proper MIME type restrictions

  2. Security
    - RLS enabled on storage.objects
    - Policies ensure users can only access appropriate files
    - Public folder accessible to all for PicaOS integration
*/

-- Ensure the chat-media bucket exists with proper configuration
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

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Public access to public folder" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload to public folder" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own media files" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own media files" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own media files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own media files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can insert storage objects" ON storage.objects;

-- Create comprehensive storage policies for the chat-media bucket

-- 1. Public access to public folder (most permissive for PicaOS integration)
CREATE POLICY "Public access to public folder" ON storage.objects
FOR ALL TO public
USING (
  bucket_id = 'chat-media' AND 
  (storage.foldername(name))[1] = 'public'
);

-- 2. Authenticated users can upload to public folder
CREATE POLICY "Authenticated users can upload to public folder" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'chat-media' AND 
  (storage.foldername(name))[1] = 'public'
);

-- 3. Authenticated users can upload their own files
CREATE POLICY "Users can upload their own media files" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'chat-media' AND 
  (auth.uid()::text = (storage.foldername(name))[1] OR (storage.foldername(name))[1] = 'public')
);

-- 4. Authenticated users can view their own files and public files
CREATE POLICY "Users can view their own media files" ON storage.objects
FOR SELECT TO authenticated
USING (
  bucket_id = 'chat-media' AND 
  (auth.uid()::text = (storage.foldername(name))[1] OR (storage.foldername(name))[1] = 'public')
);

-- 5. Authenticated users can update their own files and public files
CREATE POLICY "Users can update their own media files" ON storage.objects
FOR UPDATE TO authenticated
USING (
  bucket_id = 'chat-media' AND 
  (auth.uid()::text = (storage.foldername(name))[1] OR (storage.foldername(name))[1] = 'public')
);

-- 6. Authenticated users can delete their own files and public files
CREATE POLICY "Users can delete their own media files" ON storage.objects
FOR DELETE TO authenticated
USING (
  bucket_id = 'chat-media' AND 
  (auth.uid()::text = (storage.foldername(name))[1] OR (storage.foldername(name))[1] = 'public')
);

-- 7. General authenticated insert policy (backup)
CREATE POLICY "Authenticated users can insert storage objects" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'chat-media' AND 
  auth.role() = 'authenticated'
);