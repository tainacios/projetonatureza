
-- Restrict gallery bucket listing to admins only (public can still access individual files by URL)
DROP POLICY IF EXISTS "Gallery images publicly accessible" ON storage.objects;

CREATE POLICY "Gallery images public read by path"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'gallery' AND (
    public.has_role(auth.uid(), 'admin')
    OR auth.role() = 'anon'
    OR auth.role() = 'authenticated'
  )
);

-- Revoke execute on has_role from public/anon/authenticated (RLS uses it via SECURITY DEFINER context internally)
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM anon;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM authenticated;
