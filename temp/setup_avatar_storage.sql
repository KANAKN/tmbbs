-- 1. Create a new storage bucket named "avatars"
-- This bucket is set to public so that anyone can view the images.
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Set up Row Level Security (RLS) policies for the "avatars" bucket.
-- These policies control who can upload, view, update, and delete files.

-- Policy 1: Allow public, anonymous access to view all avatars.
CREATE POLICY "Public read access for avatars"
ON storage.objects FOR SELECT
USING ( bucket_id = 'avatars' );

-- Policy 2: Allow logged-in users to upload their own avatar.
-- The policy checks that the uploaded file path starts with the user's ID.
CREATE POLICY "Allow authenticated users to upload their own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text );

-- Policy 3: Allow logged-in users to update their own avatar.
CREATE POLICY "Allow authenticated users to update their own avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING ( bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text );

-- Policy 4: Allow logged-in users to delete their own avatar.
CREATE POLICY "Allow authenticated users to delete their own avatar"
ON storage.objects FOR DELETE
TO authenticated
USING ( bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text );
