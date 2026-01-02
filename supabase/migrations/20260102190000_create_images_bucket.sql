-- Create the images bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('images', 'images', true)
ON CONFLICT (id) DO NOTHING;

-- Policy for public read access to images
DROP POLICY IF EXISTS "Public Access Images" ON storage.objects;
CREATE POLICY "Public Access Images"
ON storage.objects FOR SELECT
USING (bucket_id = 'images');

-- Policy for authenticated users to upload images
DROP POLICY IF EXISTS "Authenticated Upload Images" ON storage.objects;
CREATE POLICY "Authenticated Upload Images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'images' AND auth.role() = 'authenticated');
