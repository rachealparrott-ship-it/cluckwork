CREATE TABLE public.birds (
  id uuid PRIMARY KEY,
  user_id uuid NOT NULL DEFAULT auth.uid(),
  name text NOT NULL DEFAULT '',
  breed text NOT NULL DEFAULT '',
  breed_uncertain boolean NOT NULL DEFAULT false,
  hatch_date text,
  sire text NOT NULL DEFAULT '',
  dam text NOT NULL DEFAULT '',
  notes text NOT NULL DEFAULT '',
  from_egg_id uuid,
  photo_at bigint,
  created_at bigint NOT NULL,
  updated_at bigint NOT NULL,
  deleted boolean NOT NULL DEFAULT false
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.birds TO authenticated;
GRANT ALL ON public.birds TO service_role;
ALTER TABLE public.birds ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own birds" ON public.birds FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE INDEX birds_user_id_idx ON public.birds (user_id);

CREATE POLICY "own bird photos read" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'bird-photos' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "own bird photos insert" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'bird-photos' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "own bird photos update" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'bird-photos' AND (storage.foldername(name))[1] = auth.uid()::text)
  WITH CHECK (bucket_id = 'bird-photos' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "own bird photos delete" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'bird-photos' AND (storage.foldername(name))[1] = auth.uid()::text);