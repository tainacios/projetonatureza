CREATE TABLE public.testimonials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  volunteer_name TEXT NOT NULL,
  action_name TEXT NOT NULL,
  content TEXT NOT NULL,
  rating INTEGER NOT NULL DEFAULT 5 CHECK (rating BETWEEN 1 AND 5),
  avatar_url TEXT,
  approved BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Approved testimonials are viewable by everyone"
ON public.testimonials FOR SELECT
USING (approved = true OR auth.uid() = user_id);

CREATE POLICY "Users can create their own testimonials"
ON public.testimonials FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own testimonials"
ON public.testimonials FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own testimonials"
ON public.testimonials FOR DELETE
USING (auth.uid() = user_id);

CREATE TRIGGER set_testimonials_updated_at
BEFORE UPDATE ON public.testimonials
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

-- Seed inicial
INSERT INTO public.testimonials (user_id, volunteer_name, action_name, content, rating, approved) VALUES
(gen_random_uuid(), 'Mariana Silva', 'Plantio na Mata Atlântica', 'Foi uma experiência transformadora. Plantar uma árvore com as próprias mãos e saber que ela vai crescer e dar vida a tantos seres é indescritível. Voltei para casa com o coração cheio.', 5, true),
(gen_random_uuid(), 'Carlos Eduardo', 'Visita ao Lar de Idosos', 'Cheguei achando que ia ajudar, mas foi eu quem fui acolhido. Cada sorriso, cada história compartilhada me ensinou mais sobre a vida do que muitos livros. Vou voltar sempre.', 5, true),
(gen_random_uuid(), 'Juliana Mendes', 'Café com as Crianças', 'Ver os olhinhos das crianças brilhando ao receberem um simples lanche e atenção me lembrou do verdadeiro propósito de existir. Gratidão por fazer parte do Projeto Natureza.', 5, true);