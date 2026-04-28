import { useEffect, useState } from "react";
import { Quote, Star, Plus, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { TestimonialDialog } from "@/components/TestimonialDialog";
import { LeafShape } from "@/components/LeafShape";

interface Testimonial {
  id: string;
  volunteer_name: string;
  action_name: string;
  content: string;
  rating: number;
  avatar_url: string | null;
  created_at: string;
}

export const Testimonials = ({ limit }: { limit?: number }) => {
  const { user } = useAuth();
  const [items, setItems] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  const load = async () => {
    setLoading(true);
    let query = supabase
      .from("testimonials")
      .select("id, volunteer_name, action_name, content, rating, avatar_url, created_at")
      .eq("approved", true)
      .order("created_at", { ascending: false });
    if (limit) query = query.limit(limit);
    const { data } = await query;
    setItems((data as Testimonial[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [limit]);

  return (
    <section className="py-20 md:py-28 bg-gradient-soft relative overflow-hidden">
      <LeafShape className="absolute -top-10 right-0 w-72 text-accent/10" color="hsl(var(--accent))" />
      <LeafShape className="absolute bottom-0 -left-16 w-80 text-secondary/30 animate-float" />

      <div className="container mx-auto px-4 relative">
        <div className="text-center mb-14 max-w-2xl mx-auto">
          <span className="text-accent font-semibold uppercase tracking-widest text-sm">Vozes do projeto</span>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-primary mt-3 mb-4 text-balance">
            Histórias que <span className="italic text-accent">florescem</span>
          </h2>
          <p className="text-foreground/70 leading-relaxed">
            Cada ação deixa marcas. Conheça o que nossos voluntários sentiram ao colocar
            o amor em movimento.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : items.length === 0 ? (
          <div className="text-center text-muted-foreground py-16">
            Ainda não há depoimentos. Seja o primeiro a compartilhar sua história!
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((t, i) => (
              <article
                key={t.id}
                className="group relative bg-card rounded-3xl p-7 shadow-soft hover:shadow-leaf transition-all duration-500 hover:-translate-y-1 border border-border/40"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <Quote className="absolute -top-4 -left-2 h-10 w-10 text-accent/20 rotate-180" fill="currentColor" />
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: 5 }).map((_, idx) => (
                    <Star
                      key={idx}
                      className={`h-4 w-4 ${idx < t.rating ? "text-accent fill-accent" : "text-muted-foreground/30"}`}
                    />
                  ))}
                </div>
                <p className="text-foreground/80 leading-relaxed mb-6 italic">
                  "{t.content}"
                </p>
                <div className="flex items-center gap-3 pt-4 border-t border-border/40">
                  <div className="h-12 w-12 rounded-full bg-gradient-leaf flex items-center justify-center text-primary-foreground font-display font-bold shrink-0">
                    {t.avatar_url ? (
                      <img src={t.avatar_url} alt={t.volunteer_name} className="h-full w-full rounded-full object-cover" />
                    ) : (
                      t.volunteer_name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="leading-tight">
                    <div className="font-display font-bold text-primary">{t.volunteer_name}</div>
                    <div className="text-xs text-muted-foreground">{t.action_name}</div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        <div className="text-center mt-12">
          {user ? (
            <Button variant="hero" size="lg" onClick={() => setOpen(true)}>
              <Plus className="h-4 w-4" /> Compartilhar meu depoimento
            </Button>
          ) : (
            <Button asChild variant="hero" size="lg">
              <Link to="/auth">Faça login para deixar seu depoimento</Link>
            </Button>
          )}
        </div>
      </div>

      <TestimonialDialog open={open} onOpenChange={setOpen} onSubmitted={load} />
    </section>
  );
};
