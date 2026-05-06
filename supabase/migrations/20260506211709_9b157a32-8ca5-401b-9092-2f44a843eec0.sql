CREATE POLICY "Master admin views all roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'master_admin'));