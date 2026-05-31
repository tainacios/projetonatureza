import { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Loader2, Calendar as CalIcon, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Action {
  id: string;
  title: string;
  tag: string;
  story: string | null;
  description: string;
  image_url: string | null;
  location: string | null;
  scheduled_at: string | null;
}

const Acoes = () => {
  const [items, setItems] = useState<Action[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("actions" as any)
        .select("*")
        .eq("published", true)
        .order("scheduled_at", { ascending: false, nullsFirst: false });
      setItems((data as any) ?? []);
      setLoading(false);
    })();
  }, []);

  return (
    <Layout>
      <section className="bg-gradient-soft py-20">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <span className="text-accent font-semibold uppercase tracking-widest text-sm">Nossas ações</span>
          <h1 className="font-display text-5xl md:text-7xl font-bold text-primary mt-3 mb-6 text-balance">
            Cada história importa.
          </h1>
          <p className="text-lg text-foreground/70">
            Conheça as frentes em que atuamos, e as vidas por trás de cada número.
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4 space-y-24 max-w-6xl">
          {loading ? (
            <div className="flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
          ) : items.length === 0 ? (
            <p className="text-center text-muted-foreground">Em breve novas ações por aqui.</p>
          ) : (
            items.map((a, i) => (
              <article
                key={a.id}
                className={`grid md:grid-cols-2 gap-12 items-center ${i % 2 ? "md:[&>*:first-child]:order-2" : ""}`}
              >
                <div className="organic-blob overflow-hidden shadow-leaf bg-muted">
                  {a.image_url && (
                    <img src={a.image_url} alt={a.title} loading="lazy" className="w-full h-[480px] object-cover" />
                  )}
                </div>
                <div>
                  <span className="inline-block px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-semibold uppercase tracking-widest mb-4">
                    {a.tag}
                  </span>
                  <h2 className="font-display text-4xl md:text-5xl font-bold text-primary mb-6 text-balance">
                    {a.title}
                  </h2>
                  {(a.scheduled_at || a.location) && (
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                      {a.scheduled_at && (
                        <span className="flex items-center gap-1">
                          <CalIcon className="h-4 w-4" />
                          {new Date(a.scheduled_at).toLocaleString("pt-BR", { dateStyle: "long", timeStyle: "short" })}
                        </span>
                      )}
                      {a.location && (
                        <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{a.location}</span>
                      )}
                    </div>
                  )}
                  {a.story && (
                    <blockquote className="border-l-4 border-accent pl-5 py-2 italic text-foreground/80 leading-relaxed mb-6 font-display text-lg">
                      "{a.story}"
                    </blockquote>
                  )}
                  <p className="text-foreground/70 leading-relaxed">{a.description}</p>
                </div>
              </article>
            ))
          )}
        </div>
      </section>

      <section className="py-20 bg-primary text-primary-foreground text-center">
        <div className="container mx-auto px-4 max-w-2xl">
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-6">Sua história começa aqui.</h2>
          <p className="text-lg text-primary-foreground/80 mb-8">
            Junte-se a nós e descubra o que o seu propósito pode fazer.
          </p>
          <Button asChild variant="hero" size="xl">
            <Link to="/auth">Quero ser voluntário <ArrowRight className="h-5 w-5" /></Link>
          </Button>
        </div>
      </section>
    </Layout>
  );
};

export default Acoes;
