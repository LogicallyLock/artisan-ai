-- Create storage bucket for project media
INSERT INTO storage.buckets (id, name, public) VALUES ('project-media', 'project-media', true);

-- Allow authenticated users to upload to their own folder
CREATE POLICY "Users can upload their own media"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'project-media' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow public read access
CREATE POLICY "Project media is publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'project-media');

-- Allow users to update their own media
CREATE POLICY "Users can update their own media"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'project-media' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow users to delete their own media
CREATE POLICY "Users can delete their own media"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'project-media' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create avatars bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);

CREATE POLICY "Avatar images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);