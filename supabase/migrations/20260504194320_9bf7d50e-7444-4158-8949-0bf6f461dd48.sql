REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.has_accepted_ecopoints_terms(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_accepted_ecopoints_terms(text) TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.accept_ecopoints_terms(text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.accept_ecopoints_terms(text, text) TO authenticated, service_role;

DROP POLICY IF EXISTS "Admins view all term acceptances" ON public.ecopoints_terms_acceptance;
CREATE POLICY "Admins view all term acceptances"
ON public.ecopoints_terms_acceptance
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "Admins delete photos" ON public.gallery_photos;
CREATE POLICY "Admins delete photos"
ON public.gallery_photos
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "Admins insert photos" ON public.gallery_photos;
CREATE POLICY "Admins insert photos"
ON public.gallery_photos
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "Admins update photos" ON public.gallery_photos;
CREATE POLICY "Admins update photos"
ON public.gallery_photos
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "Published photos viewable by everyone" ON public.gallery_photos;
CREATE POLICY "Published photos viewable by everyone"
ON public.gallery_photos
FOR SELECT
TO public
USING (published = true);

CREATE POLICY "Admins view all photos"
ON public.gallery_photos
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "Admins insert history" ON public.points_history;
CREATE POLICY "Admins insert history"
ON public.points_history
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "Users view own history" ON public.points_history;
CREATE POLICY "Users view own history"
ON public.points_history
FOR SELECT
TO authenticated
USING ((auth.uid() = user_id) OR public.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "Admins update any profile" ON public.profiles;
CREATE POLICY "Admins update any profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "Admins update redemptions" ON public.redemptions;
CREATE POLICY "Admins update redemptions"
ON public.redemptions
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "Admins view all redemptions" ON public.redemptions;
CREATE POLICY "Admins view all redemptions"
ON public.redemptions
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "Admins manage rewards - delete" ON public.rewards;
CREATE POLICY "Admins manage rewards - delete"
ON public.rewards
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "Admins manage rewards - insert" ON public.rewards;
CREATE POLICY "Admins manage rewards - insert"
ON public.rewards
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "Admins manage rewards - update" ON public.rewards;
CREATE POLICY "Admins manage rewards - update"
ON public.rewards
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "Admins delete any testimonial" ON public.testimonials;
CREATE POLICY "Admins delete any testimonial"
ON public.testimonials
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "Admins update any testimonial" ON public.testimonials;
CREATE POLICY "Admins update any testimonial"
ON public.testimonials
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "Admins view all testimonials" ON public.testimonials;
CREATE POLICY "Admins view all testimonials"
ON public.testimonials
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "Admins manage roles - delete" ON public.user_roles;
CREATE POLICY "Admins manage roles - delete"
ON public.user_roles
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "Admins manage roles - insert" ON public.user_roles;
CREATE POLICY "Admins manage roles - insert"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "Admins manage roles - update" ON public.user_roles;
CREATE POLICY "Admins manage roles - update"
ON public.user_roles
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role));