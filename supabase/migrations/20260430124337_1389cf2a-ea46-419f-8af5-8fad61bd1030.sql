ALTER TABLE public.ecopoints_terms_acceptance
ADD COLUMN IF NOT EXISTS accepted BOOLEAN NOT NULL DEFAULT true;

CREATE OR REPLACE FUNCTION public.has_accepted_ecopoints_terms(_terms_version TEXT DEFAULT '1.0')
RETURNS BOOLEAN
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

CREATE OR REPLACE FUNCTION public.accept_ecopoints_terms(_signature_name TEXT, _terms_version TEXT DEFAULT '1.0')
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

GRANT EXECUTE ON FUNCTION public.has_accepted_ecopoints_terms(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.accept_ecopoints_terms(TEXT, TEXT) TO authenticated;