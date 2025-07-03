/*
  # Add Storage INSERT Policy for Authenticated Users

  1. New Policy
    - Allow authenticated users to INSERT into storage.objects
    - Uses auth.role() = 'authenticated' condition

  2. Security
    - Only authenticated users can insert files
    - Maintains existing security model
*/

-- Add policy to allow authenticated users to insert into storage.objects
CREATE POLICY "Authenticated users can insert storage objects" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (auth.role() = 'authenticated');