-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE upload_type AS ENUM ('image', 'background', 'asset');

-- Create templates table
CREATE TABLE templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100) NOT NULL,
  canvas_data JSONB NOT NULL,
  preview_url TEXT,
  is_featured BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create designs table
CREATE TABLE designs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  canvas_data JSONB NOT NULL,
  preview_url TEXT,
  template_id UUID REFERENCES templates(id) ON DELETE SET NULL,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user_uploads table
CREATE TABLE user_uploads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  file_type VARCHAR(100) NOT NULL,
  upload_type upload_type NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_designs_user_id ON designs(user_id);
CREATE INDEX idx_designs_template_id ON designs(template_id);
CREATE INDEX idx_designs_is_public ON designs(is_public);
CREATE INDEX idx_designs_created_at ON designs(created_at DESC);

CREATE INDEX idx_templates_category ON templates(category);
CREATE INDEX idx_templates_is_featured ON templates(is_featured);
CREATE INDEX idx_templates_created_at ON templates(created_at DESC);

CREATE INDEX idx_user_uploads_user_id ON user_uploads(user_id);
CREATE INDEX idx_user_uploads_upload_type ON user_uploads(upload_type);
CREATE INDEX idx_user_uploads_created_at ON user_uploads(created_at DESC);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_designs_updated_at 
  BEFORE UPDATE ON designs 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_templates_updated_at 
  BEFORE UPDATE ON templates 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) policies

-- Enable RLS on all tables
ALTER TABLE designs ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_uploads ENABLE ROW LEVEL SECURITY;

-- Designs policies
CREATE POLICY "Users can view their own designs" ON designs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view public designs" ON designs
  FOR SELECT USING (is_public = true);

CREATE POLICY "Users can insert their own designs" ON designs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own designs" ON designs
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own designs" ON designs
  FOR DELETE USING (auth.uid() = user_id);

-- Templates policies
CREATE POLICY "Everyone can view templates" ON templates
  FOR SELECT TO authenticated, anon USING (true);

CREATE POLICY "Authenticated users can create templates" ON templates
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own templates" ON templates
  FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own templates" ON templates
  FOR DELETE USING (auth.uid() = created_by);

-- User uploads policies
CREATE POLICY "Users can view their own uploads" ON user_uploads
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own uploads" ON user_uploads
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own uploads" ON user_uploads
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own uploads" ON user_uploads
  FOR DELETE USING (auth.uid() = user_id);

-- Create storage buckets for file uploads (run these in Supabase Dashboard)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('designs', 'designs', false);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('templates', 'templates', true);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('uploads', 'uploads', false);

-- Storage policies (uncomment and run in Supabase Dashboard after creating buckets)
/*
-- Designs bucket policies
CREATE POLICY "Users can upload their own design previews" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'designs' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own design previews" ON storage.objects
  FOR SELECT USING (bucket_id = 'designs' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own design previews" ON storage.objects
  FOR UPDATE USING (bucket_id = 'designs' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own design previews" ON storage.objects
  FOR DELETE USING (bucket_id = 'designs' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Templates bucket policies (public read)
CREATE POLICY "Anyone can view template previews" ON storage.objects
  FOR SELECT USING (bucket_id = 'templates');

CREATE POLICY "Authenticated users can upload template previews" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'templates');

-- Uploads bucket policies
CREATE POLICY "Users can upload their own files" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'uploads' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own uploads" ON storage.objects
  FOR SELECT USING (bucket_id = 'uploads' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own uploads" ON storage.objects
  FOR UPDATE USING (bucket_id = 'uploads' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own uploads" ON storage.objects
  FOR DELETE USING (bucket_id = 'uploads' AND auth.uid()::text = (storage.foldername(name))[1]);
*/

-- Sample data (optional)
INSERT INTO templates (name, description, category, canvas_data, is_featured) VALUES
  ('iPhone App Store', 'Clean app store screenshot template', 'mobile', '{"width": 1242, "height": 2208, "elements": []}', true),
  ('Android Play Store', 'Modern Play Store screenshot template', 'mobile', '{"width": 1080, "height": 1920, "elements": []}', true),
  ('Web App Landing', 'Professional web application showcase', 'web', '{"width": 1920, "height": 1080, "elements": []}', true),
  ('Social Media Post', 'Eye-catching social media template', 'social', '{"width": 1080, "height": 1080, "elements": []}', false);

-- Create a function to get user's design count
CREATE OR REPLACE FUNCTION get_user_design_count(user_uuid UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (SELECT COUNT(*) FROM designs WHERE user_id = user_uuid);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to get featured templates
CREATE OR REPLACE FUNCTION get_featured_templates()
RETURNS SETOF templates AS $$
BEGIN
  RETURN QUERY SELECT * FROM templates WHERE is_featured = true ORDER BY created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;