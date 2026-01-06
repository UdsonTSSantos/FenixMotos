-- Create storage bucket for 'images' (Motos, Company Logo) if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('images', 'images', true)
ON CONFLICT (id) DO NOTHING;

-- Policy to allow public read access to images
CREATE POLICY "Images are publicly accessible."
  ON storage.objects FOR SELECT
  USING ( bucket_id = 'images' );

-- Policy to allow authenticated users to upload images
CREATE POLICY "Anyone can upload an image."
  ON storage.objects FOR INSERT
  WITH CHECK ( bucket_id = 'images' AND auth.role() = 'authenticated' );

-- Ensure 'avatars' bucket exists (User Profiles)
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Policy to allow public read access to avatars (if not already created)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'objects' 
        AND policyname = 'Avatar images are publicly accessible.'
    ) THEN
        CREATE POLICY "Avatar images are publicly accessible."
          ON storage.objects FOR SELECT
          USING ( bucket_id = 'avatars' );
    END IF;
END
$$;

-- Policy to allow authenticated users to upload avatars (if not already created)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'objects' 
        AND policyname = 'Anyone can upload an avatar.'
    ) THEN
        CREATE POLICY "Anyone can upload an avatar."
          ON storage.objects FOR INSERT
          WITH CHECK ( bucket_id = 'avatars' AND auth.role() = 'authenticated' );
    END IF;
END
$$;
