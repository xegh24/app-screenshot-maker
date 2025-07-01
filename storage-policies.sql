-- Storage policies SQL script
-- Run this in Supabase SQL Editor after creating the buckets

-- Designs bucket policies
CREATE POLICY "Users can upload their own design previews" ON storage.objects
  FOR INSERT TO authenticated 
  WITH CHECK (bucket_id = 'designs' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own design previews" ON storage.objects
  FOR SELECT TO authenticated 
  USING (bucket_id = 'designs' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own design previews" ON storage.objects
  FOR UPDATE TO authenticated 
  USING (bucket_id = 'designs' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own design previews" ON storage.objects
  FOR DELETE TO authenticated 
  USING (bucket_id = 'designs' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Templates bucket policies (public read)
CREATE POLICY "Anyone can view template previews" ON storage.objects
  FOR SELECT TO authenticated, anon 
  USING (bucket_id = 'templates');

CREATE POLICY "Authenticated users can upload template previews" ON storage.objects
  FOR INSERT TO authenticated 
  WITH CHECK (bucket_id = 'templates');

-- Uploads bucket policies
CREATE POLICY "Users can upload their own files" ON storage.objects
  FOR INSERT TO authenticated 
  WITH CHECK (bucket_id = 'uploads' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own uploads" ON storage.objects
  FOR SELECT TO authenticated 
  USING (bucket_id = 'uploads' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own uploads" ON storage.objects
  FOR UPDATE TO authenticated 
  USING (bucket_id = 'uploads' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own uploads" ON storage.objects
  FOR DELETE TO authenticated 
  USING (bucket_id = 'uploads' AND auth.uid()::text = (storage.foldername(name))[1]);