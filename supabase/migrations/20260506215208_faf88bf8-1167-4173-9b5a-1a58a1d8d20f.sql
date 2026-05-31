-- Create actions table for managing scheduled volunteer actions
CREATE TABLE public.actions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  tag TEXT NOT NULL DEFAULT 'Eventos',
  story TEXT,
  description TEXT NOT NULL DEFAULT '',
  image_url TEXT,
  location TEXT,
  scheduled_at TIMESTAMP WITH TIME ZONE,
  published BOOLEAN NOT NULL DEFAULT true,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.actions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published actions viewable by everyone"
ON public.actions FOR SELECT
USING (published = true);

CREATE POLICY "Acoes admins view all actions"
ON public.actions FOR SELECT TO authenticated
USING (public.has_permission(auth.uid(), 'acoes'::permission_module));

CREATE POLICY "Acoes admins insert actions"
ON public.actions FOR INSERT TO authenticated
WITH CHECK (public.has_permission(auth.uid(), 'acoes'::permission_module));

CREATE POLICY "Acoes admins update actions"
ON public.actions FOR UPDATE TO authenticated
USING (public.has_permission(auth.uid(), 'acoes'::permission_module));

CREATE POLICY "Acoes admins delete actions"
ON public.actions FOR DELETE TO authenticated
USING (public.has_permission(auth.uid(), 'acoes'::permission_module));

CREATE TRIGGER update_actions_updated_at
BEFORE UPDATE ON public.actions
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX idx_actions_scheduled_at ON public.actions(scheduled_at);