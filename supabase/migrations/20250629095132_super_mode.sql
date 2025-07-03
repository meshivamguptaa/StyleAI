-- Create the chat-media bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'chat-media',
  'chat-media',
  true,
  10485760, -- 10MB
  ARRAY['image/*', 'audio/*']
)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can upload their own media files" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own media files" ON storage.objects;
DROP POLICY IF EXISTS "Public access to public folder" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own media files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own media files" ON storage.objects;

-- Create comprehensive storage policies for the chat-media bucket

-- Policy for public access to public folder (most permissive)
CREATE POLICY "Public access to public folder" ON storage.objects
FOR ALL TO public
USING (
  bucket_id = 'chat-media' AND 
  (storage.foldername(name))[1] = 'public'
);

-- Policy for authenticated users to upload to public folder
CREATE POLICY "Authenticated users can upload to public folder" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'chat-media' AND 
  (storage.foldername(name))[1] = 'public'
);

-- Policy for authenticated users to upload their own files
CREATE POLICY "Users can upload their own media files" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'chat-media' AND 
  (auth.uid()::text = (storage.foldername(name))[1] OR (storage.foldername(name))[1] = 'public')
);

-- Policy for authenticated users to view their own files and public files
CREATE POLICY "Users can view their own media files" ON storage.objects
FOR SELECT TO authenticated
USING (
  bucket_id = 'chat-media' AND 
  (auth.uid()::text = (storage.foldername(name))[1] OR (storage.foldername(name))[1] = 'public')
);

-- Policy for authenticated users to update their own files and public files
CREATE POLICY "Users can update their own media files" ON storage.objects
FOR UPDATE TO authenticated
USING (
  bucket_id = 'chat-media' AND 
  (auth.uid()::text = (storage.foldername(name))[1] OR (storage.foldername(name))[1] = 'public')
);

-- Policy for authenticated users to delete their own files and public files
CREATE POLICY "Users can delete their own media files" ON storage.objects
FOR DELETE TO authenticated
USING (
  bucket_id = 'chat-media' AND 
  (auth.uid()::text = (storage.foldername(name))[1] OR (storage.foldername(name))[1] = 'public')
);