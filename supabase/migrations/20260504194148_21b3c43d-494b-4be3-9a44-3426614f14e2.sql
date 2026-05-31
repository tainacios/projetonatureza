CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO anon, authenticated, service_role;

DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
CREATE POLICY "Users can view own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_accepted_ecopoints_terms(_terms_version text DEFAULT '1.0'::text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.ecopoints_terms_acceptance
    WHERE user_id = auth.uid()
      AND terms_version = _terms_version
      AND accepted = true
  )
$$;

REVOKE ALL ON FUNCTION public.has_accepted_ecopoints_terms(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_accepted_ecopoints_terms(text) TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.accept_ecopoints_terms(_signature_name text, _terms_version text DEFAULT '1.0'::text)
RETURNS public.ecopoints_terms_acceptance
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  acceptance public.ecopoints_terms_acceptance;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Usuário não autenticado';
  END IF;

  IF length(trim(coalesce(_signature_name, ''))) < 3 THEN
    RAISE EXCEPTION 'Assinatura inválida';
  END IF;

  INSERT INTO public.ecopoints_terms_acceptance (
    user_id,
    signature_name,
    terms_version,
    accepted,
    accepted_at
  )
  VALUES (
    auth.uid(),
    trim(_signature_name),
    _terms_version,
    true,
    now()
  )
  ON CONFLICT (user_id) DO UPDATE
  SET signature_name = EXCLUDED.signature_name,
      terms_version = EXCLUDED.terms_version,
      accepted = true,
      accepted_at = now()
  RETURNING * INTO acceptance;

  RETURN acceptance;
END;
$$;

REVOKE ALL ON FUNCTION public.accept_ecopoints_terms(text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.accept_ecopoints_terms(text, text) TO authenticated, service_role;