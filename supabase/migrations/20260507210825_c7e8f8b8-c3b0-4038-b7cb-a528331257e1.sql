DROP POLICY IF EXISTS "Admins upload gallery" ON storage.objects;
DROP POLICY IF EXISTS "Admins update gallery" ON storage.objects;
DROP POLICY IF EXISTS "Admins delete gallery" ON storage.objects;

CREATE POLICY "Gallery upload by admins"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'gallery' AND (
    has_role(auth.uid(), 'admin'::app_role)
    OR has_role(auth.uid(), 'master_admin'::app_role)
    OR has_permission(auth.uid(), 'galeria'::permission_module)
    OR has_permission(auth.uid(), 'acoes'::permission_module)
    OR has_permission(auth.uid(), 'loja'::permission_module)
    OR has_permission(auth.uid(), 'depoimentos'::permission_module)
  )
);

CREATE POLICY "Gallery update by admins"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'gallery' AND (
    has_role(auth.uid(), 'admin'::app_role)
    OR has_role(auth.uid(), 'master_admin'::app_role)
    OR has_permission(auth.uid(), 'galeria'::permission_module)
    OR has_permission(auth.uid(), 'acoes'::permission_module)
    OR has_permission(auth.uid(), 'loja'::permission_module)
    OR has_permission(auth.uid(), 'depoimentos'::permission_module)
  )
);

CREATE POLICY "Gallery delete by admins"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'gallery' AND (
    has_role(auth.uid(), 'admin'::app_role)
    OR has_role(auth.uid(), 'master_admin'::app_role)
    OR has_permission(auth.uid(), 'galeria'::permission_module)
    OR has_permission(auth.uid(), 'acoes'::permission_module)
    OR has_permission(auth.uid(), 'loja'::permission_module)
    OR has_permission(auth.uid(), 'depoimentos'::permission_module)
  )
);