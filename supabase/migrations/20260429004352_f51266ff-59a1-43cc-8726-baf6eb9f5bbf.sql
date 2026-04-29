
-- 1. Create app_role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'volunteer');

-- 2. Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 3. has_role security definer function
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- 4. RLS for user_roles
CREATE POLICY "Users can view own roles"
ON public.user_roles FOR SELECT
USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins manage roles - insert"
ON public.user_roles FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins manage roles - update"
ON public.user_roles FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins manage roles - delete"
ON public.user_roles FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- 5. points_history table
CREATE TABLE public.points_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  amount INTEGER NOT NULL,
  reason TEXT NOT NULL,
  action_name TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.points_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own history"
ON public.points_history FOR SELECT
USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins insert history"
ON public.points_history FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 6. Add active to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS active BOOLEAN NOT NULL DEFAULT true;

CREATE POLICY "Admins update any profile"
ON public.profiles FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

-- 7. Gallery photos table
CREATE TABLE public.gallery_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'eventos',
  image_url TEXT NOT NULL,
  published BOOLEAN NOT NULL DEFAULT true,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.gallery_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published photos viewable by everyone"
ON public.gallery_photos FOR SELECT
USING (published = true OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins insert photos"
ON public.gallery_photos FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins update photos"
ON public.gallery_photos FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins delete photos"
ON public.gallery_photos FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_gallery_photos_updated_at
BEFORE UPDATE ON public.gallery_photos
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 8. Admin policies on existing tables
CREATE POLICY "Admins view all testimonials"
ON public.testimonials FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins update any testimonial"
ON public.testimonials FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins delete any testimonial"
ON public.testimonials FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins view all redemptions"
ON public.redemptions FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins update redemptions"
ON public.redemptions FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins manage rewards - insert"
ON public.rewards FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins manage rewards - update"
ON public.rewards FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins manage rewards - delete"
ON public.rewards FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins view all term acceptances"
ON public.ecopoints_terms_acceptance FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- 9. Storage bucket for gallery
INSERT INTO storage.buckets (id, name, public)
VALUES ('gallery', 'gallery', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Gallery images publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'gallery');

CREATE POLICY "Admins upload gallery"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'gallery' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins update gallery"
ON storage.objects FOR UPDATE
USING (bucket_id = 'gallery' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins delete gallery"
ON storage.objects FOR DELETE
USING (bucket_id = 'gallery' AND public.has_role(auth.uid(), 'admin'));
