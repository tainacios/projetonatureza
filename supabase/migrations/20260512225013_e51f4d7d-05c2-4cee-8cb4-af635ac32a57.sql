
CREATE TABLE public.treasury_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind text NOT NULL CHECK (kind IN ('income','expense')),
  amount numeric NOT NULL CHECK (amount >= 0),
  category text NOT NULL DEFAULT 'geral',
  description text,
  occurred_at date NOT NULL DEFAULT (now()::date),
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.treasury_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Financeiro admins view treasury"
ON public.treasury_transactions FOR SELECT TO authenticated
USING (has_permission(auth.uid(), 'financeiro'::permission_module));

CREATE POLICY "Financeiro admins insert treasury"
ON public.treasury_transactions FOR INSERT TO authenticated
WITH CHECK (has_permission(auth.uid(), 'financeiro'::permission_module));

CREATE POLICY "Financeiro admins update treasury"
ON public.treasury_transactions FOR UPDATE TO authenticated
USING (has_permission(auth.uid(), 'financeiro'::permission_module));

CREATE POLICY "Financeiro admins delete treasury"
ON public.treasury_transactions FOR DELETE TO authenticated
USING (has_permission(auth.uid(), 'financeiro'::permission_module));

CREATE TRIGGER set_updated_at_treasury
BEFORE UPDATE ON public.treasury_transactions
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
