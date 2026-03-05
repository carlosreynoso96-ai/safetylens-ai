-- ============================================
-- 003_storage_buckets.sql
-- ============================================

-- Create bucket for audit photos
INSERT INTO storage.buckets (id, name, public) VALUES ('audit-photos', 'audit-photos', false);

-- Policy: users can upload to their own folder
CREATE POLICY "Users can upload own photos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'audit-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Policy: users can view their own photos
CREATE POLICY "Users can view own photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'audit-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Policy: users can delete their own photos
CREATE POLICY "Users can delete own photos"
ON storage.objects FOR DELETE
USING (bucket_id = 'audit-photos' AND auth.uid()::text = (storage.foldername(name))[1]);
