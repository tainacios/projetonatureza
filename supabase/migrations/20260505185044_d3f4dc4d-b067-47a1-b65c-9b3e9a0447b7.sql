
-- Permission module enum
DO $$ BEGIN
  CREATE TYPE public.permission_module AS ENUM ('loja', 'galeria', 'depoimentos', 'acoes');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- admin_permissions table
CREATE TABLE IF NOT EXISTS public.admin_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  module public.permission_module NOT NULL,
  granted boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, module)
);

ALTER TABLE public.admin_permissions ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER admin_permissions_set_updated_at
  BEFORE UPDATE ON public.admin_permissions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- has_permission: master_admin bypasses; admin needs explicit grant
CREATE OR REPLACE FUNCTION public.has_permission(_user_id uuid, _module public.permission_module)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = 'master_admin')
    OR EXISTS (
      SELECT 1 FROM public.admin_permissions ap
      JOIN public.user_roles ur ON ur.user_id = ap.user_id
      WHERE ap.user_id = _user_id
        AND ap.module = _module
        AND ap.granted = true
        AND ur.role IN ('admin','master_admin')
    )
$$;

REVOKE ALL ON FUNCTION public.has_permission(uuid, public.permission_module) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_permission(uuid, public.permission_module) TO authenticated, service_role;

-- RLS for admin_permissions: only master_admin manages; users see their own
CREATE POLICY "Master admin manages permissions - select"
  ON public.admin_permissions FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'master_admin') OR auth.uid() = user_id);

CREATE POLICY "Master admin manages permissions - insert"
  ON public.admin_permissions FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(),'master_admin'));

CREATE POLICY "Master admin manages permissions - update"
  ON public.admin_permissions FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(),'master_admin'))
  WITH CHECK (public.has_role(auth.uid(),'master_admin'));

CREATE POLICY "Master admin manages permissions - delete"
  ON public.admin_permissions FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(),'master_admin'));

-- Allow master_admin to manage user_roles freely (already covered by has_role admin/master)
DROP POLICY IF EXISTS "Admins manage roles - insert" ON public.user_roles;
DROP POLICY IF EXISTS "Admins manage roles - update" ON public.user_roles;
DROP POLICY IF EXISTS "Admins manage roles - delete" ON public.user_roles;

CREATE POLICY "Master admin manages roles - insert"
  ON public.user_roles FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(),'master_admin'));
CREATE POLICY "Master admin manages roles - update"
  ON public.user_roles FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(),'master_admin'));
CREATE POLICY "Master admin manages roles - delete"
  ON public.user_roles FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(),'master_admin'));

-- Update RLS for module-specific tables
-- REWARDS (loja)
DROP POLICY IF EXISTS "Admins manage rewards - insert" ON public.rewards;
DROP POLICY IF EXISTS "Admins manage rewards - update" ON public.rewards;
DROP POLICY IF EXISTS "Admins manage rewards - delete" ON public.rewards;
CREATE POLICY "Loja admins insert rewards" ON public.rewards FOR INSERT TO authenticated
  WITH CHECK (public.has_permission(auth.uid(),'loja'));
CREATE POLICY "Loja admins update rewards" ON public.rewards FOR UPDATE TO authenticated
  USING (public.has_permission(auth.uid(),'loja'));
CREATE POLICY "Loja admins delete rewards" ON public.rewards FOR DELETE TO authenticated
  USING (public.has_permission(auth.uid(),'loja'));

-- REDEMPTIONS (loja)
DROP POLICY IF EXISTS "Admins update redemptions" ON public.redemptions;
DROP POLICY IF EXISTS "Admins view all redemptions" ON public.redemptions;
CREATE POLICY "Loja admins update redemptions" ON public.redemptions FOR UPDATE TO authenticated
  USING (public.has_permission(auth.uid(),'loja'));
CREATE POLICY "Loja admins view all redemptions" ON public.redemptions FOR SELECT TO authenticated
  USING (public.has_permission(auth.uid(),'loja'));

-- GALLERY_PHOTOS (galeria)
DROP POLICY IF EXISTS "Admins delete photos" ON public.gallery_photos;
DROP POLICY IF EXISTS "Admins insert photos" ON public.gallery_photos;
DROP POLICY IF EXISTS "Admins update photos" ON public.gallery_photos;
DROP POLICY IF EXISTS "Admins view all photos" ON public.gallery_photos;
CREATE POLICY "Galeria admins insert photos" ON public.gallery_photos FOR INSERT TO authenticated
  WITH CHECK (public.has_permission(auth.uid(),'galeria'));
CREATE POLICY "Galeria admins update photos" ON public.gallery_photos FOR UPDATE TO authenticated
  USING (public.has_permission(auth.uid(),'galeria'));
CREATE POLICY "Galeria admins delete photos" ON public.gallery_photos FOR DELETE TO authenticated
  USING (public.has_permission(auth.uid(),'galeria'));
CREATE POLICY "Galeria admins view all photos" ON public.gallery_photos FOR SELECT TO authenticated
  USING (public.has_permission(auth.uid(),'galeria'));

-- TESTIMONIALS (depoimentos)
DROP POLICY IF EXISTS "Admins delete any testimonial" ON public.testimonials;
DROP POLICY IF EXISTS "Admins update any testimonial" ON public.testimonials;
DROP POLICY IF EXISTS "Admins view all testimonials" ON public.testimonials;
CREATE POLICY "Depoimentos admins delete testimonials" ON public.testimonials FOR DELETE TO authenticated
  USING (public.has_permission(auth.uid(),'depoimentos'));
CREATE POLICY "Depoimentos admins update testimonials" ON public.testimonials FOR UPDATE TO authenticated
  USING (public.has_permission(auth.uid(),'depoimentos'));
CREATE POLICY "Depoimentos admins view all testimonials" ON public.testimonials FOR SELECT TO authenticated
  USING (public.has_permission(auth.uid(),'depoimentos'));

-- POINTS_HISTORY (acoes)
DROP POLICY IF EXISTS "Admins insert history" ON public.points_history;
DROP POLICY IF EXISTS "Users view own history" ON public.points_history;
CREATE POLICY "Acoes admins insert history" ON public.points_history FOR INSERT TO authenticated
  WITH CHECK (public.has_permission(auth.uid(),'acoes'));
CREATE POLICY "Users and acoes admins view history" ON public.points_history FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_permission(auth.uid(),'acoes'));

-- Promote existing admins to master_admin and grant all permissions
UPDATE public.user_roles SET role = 'master_admin' WHERE role = 'admin';

INSERT INTO public.admin_permissions (user_id, module, granted)
SELECT ur.user_id, m.module, true
FROM public.user_roles ur
CROSS JOIN (VALUES ('loja'::public.permission_module),('galeria'),('depoimentos'),('acoes')) AS m(module)
WHERE ur.role = 'master_admin'
ON CONFLICT (user_id, module) DO NOTHING;
