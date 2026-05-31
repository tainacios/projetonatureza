DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policy p
    JOIN pg_class c ON c.oid = p.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
      AND c.relname = 'ecopoints_terms_acceptance'
      AND p.polname = 'Users can update their own acceptance'
  ) THEN
    CREATE POLICY "Users can update their own acceptance"
    ON public.ecopoints_terms_acceptance
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

ALTER FUNCTION public.has_accepted_ecopoints_terms(TEXT) SECURITY INVOKER;
ALTER FUNCTION public.accept_ecopoints_terms(TEXT, TEXT) SECURITY INVOKER;