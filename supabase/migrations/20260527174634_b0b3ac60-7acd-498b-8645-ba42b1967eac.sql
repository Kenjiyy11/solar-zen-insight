
UPDATE storage.buckets SET public = false WHERE id = 'floor-plans';
DROP POLICY IF EXISTS "floor-plans read" ON storage.objects;
CREATE POLICY "floor-plans owner read" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'floor-plans' AND auth.uid()::text = (storage.foldername(name))[1]);
