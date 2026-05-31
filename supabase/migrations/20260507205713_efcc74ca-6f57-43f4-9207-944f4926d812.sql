
-- points_history: distribuição de pontos passa a ser do módulo ecopontos
DROP POLICY IF EXISTS "Acoes admins insert history" ON public.points_history;
DROP POLICY IF EXISTS "Users and acoes admins view history" ON public.points_history;

CREATE POLICY "Ecopontos admins insert history"
ON public.points_history FOR INSERT TO authenticated
WITH CHECK (public.has_permission(auth.uid(), 'ecopontos'::permission_module));

CREATE POLICY "Users and ecopontos admins view history"
ON public.points_history FOR SELECT TO authenticated
USING ((auth.uid() = user_id) OR public.has_permission(auth.uid(), 'ecopontos'::permission_module));

-- redemptions: gestão dos resgates passa para ecopontos
DROP POLICY IF EXISTS "Loja admins update redemptions" ON public.redemptions;
DROP POLICY IF EXISTS "Loja admins view all redemptions" ON public.redemptions;

CREATE POLICY "Ecopontos admins update redemptions"
ON public.redemptions FOR UPDATE TO authenticated
USING (public.has_permission(auth.uid(), 'ecopontos'::permission_module));

CREATE POLICY "Ecopontos admins view all redemptions"
ON public.redemptions FOR SELECT TO authenticated
USING (public.has_permission(auth.uid(), 'ecopontos'::permission_module));
