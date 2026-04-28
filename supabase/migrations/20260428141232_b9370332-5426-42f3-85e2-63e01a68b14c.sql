-- Tabela de aceites do Termo EcoPontos
CREATE TABLE public.ecopoints_terms_acceptance (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  signature_name TEXT NOT NULL,
  terms_version TEXT NOT NULL DEFAULT '1.0',
  accepted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.ecopoints_terms_acceptance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own acceptance"
ON public.ecopoints_terms_acceptance
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own acceptance"
ON public.ecopoints_terms_acceptance
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_ecopoints_terms_user ON public.ecopoints_terms_acceptance(user_id);