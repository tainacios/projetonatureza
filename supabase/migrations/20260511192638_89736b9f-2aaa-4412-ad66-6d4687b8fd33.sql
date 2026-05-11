
CREATE TABLE IF NOT EXISTS public.donor_pledges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  monthly_amount numeric(10,2) NOT NULL DEFAULT 0,
  due_day int NOT NULL DEFAULT 10 CHECK (due_day BETWEEN 1 AND 28),
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.donor_pledges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own pledge"
ON public.donor_pledges FOR SELECT TO authenticated
USING (auth.uid() = user_id OR public.has_permission(auth.uid(), 'financeiro'::permission_module));

CREATE POLICY "Financeiro admins insert pledges"
ON public.donor_pledges FOR INSERT TO authenticated
WITH CHECK (public.has_permission(auth.uid(), 'financeiro'::permission_module));

CREATE POLICY "Financeiro admins update pledges"
ON public.donor_pledges FOR UPDATE TO authenticated
USING (public.has_permission(auth.uid(), 'financeiro'::permission_module));

CREATE POLICY "Financeiro admins delete pledges"
ON public.donor_pledges FOR DELETE TO authenticated
USING (public.has_permission(auth.uid(), 'financeiro'::permission_module));

CREATE TRIGGER trg_donor_pledges_updated
BEFORE UPDATE ON public.donor_pledges
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE IF NOT EXISTS public.donations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  amount numeric(10,2) NOT NULL,
  reference_month date NOT NULL,
  paid_at timestamptz,
  status text NOT NULL DEFAULT 'pending',
  notes text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, reference_month)
);
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own donations"
ON public.donations FOR SELECT TO authenticated
USING (auth.uid() = user_id OR public.has_permission(auth.uid(), 'financeiro'::permission_module));

CREATE POLICY "Financeiro admins insert donations"
ON public.donations FOR INSERT TO authenticated
WITH CHECK (public.has_permission(auth.uid(), 'financeiro'::permission_module));

CREATE POLICY "Financeiro admins update donations"
ON public.donations FOR UPDATE TO authenticated
USING (public.has_permission(auth.uid(), 'financeiro'::permission_module));

CREATE POLICY "Financeiro admins delete donations"
ON public.donations FOR DELETE TO authenticated
USING (public.has_permission(auth.uid(), 'financeiro'::permission_module));

CREATE TRIGGER trg_donations_updated
BEFORE UPDATE ON public.donations
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX IF NOT EXISTS idx_donations_user_month ON public.donations(user_id, reference_month);
