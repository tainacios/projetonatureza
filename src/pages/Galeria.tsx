import { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { LeafShape } from "@/components/LeafShape";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

interface Photo {
  id: string;
  title: string;
  description: string | null;
  category: string;
  image_url: string;
}

const CATEGORY_LABEL: Record<string, string> = {
  criancas: "Crianças",
  idosos: "Idosos",
  animais: "Animais",
  eventos: "Eventos",
};
const CATEGORIES = ["Todas", "Crianças", "Idosos", "Animais", "Eventos"];

const Galeria = () => {
  const [filter, setFilter] = useState<string>("Todas");
  const [open, setOpen] = useState<Photo | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("gallery_photos")
        .select("id, title, description, category, image_url")
        .eq("published", true)
        .order("created_at", { ascending: false });
      setPhotos((data as Photo[]) ?? []);
      setLoading(false);
    })();
  }, []);

  const visible = filter === "Todas"
    ? photos
    : photos.filter((p) => (CATEGORY_LABEL[p.category] || p.category) === filter);

  return (
    <Layout>
      <section className="relative overflow-hidden bg-gradient-soft py-20 md:py-24">
        <LeafShape className="absolute -top-10 -right-10 w-80 text-secondary/30 animate-float" />
        <div className="container mx-auto px-4 relative max-w-3xl text-center">
          <span className="text-accent font-semibold uppercase tracking-widest text-sm">Galeria</span>
          <h1 className="font-display text-5xl md:text-6xl font-bold text-primary mt-3 mb-6 text-balance">
            Imagens que <span className="italic text-accent">contam histórias.</span>
          </h1>
          <p className="text-lg text-foreground/70 leading-relaxed">
            Cada clique é um instante de transformação. Veja o impacto real das nossas ações.
          </p>
        </div>
      </section>

      <section className="py-8 sticky top-20 z-30 backdrop-blur-md bg-background/80 border-b border-border/40">
        <div className="container mx-auto px-4 flex flex-wrap gap-2 justify-center">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setFilter(c)}
              className={cn(
                "px-5 py-2 rounded-full text-sm font-medium transition-all",
                filter === c
                  ? "bg-primary text-primary-foreground shadow-soft"
                  : "bg-muted text-foreground/70 hover:bg-primary/10 hover:text-primary",
              )}
            >
              {c}
            </button>
          ))}
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
          ) : visible.length === 0 ? (
            <p className="text-center text-foreground/60 py-20">Nenhuma foto nesta categoria ainda.</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {visible.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setOpen(p)}
                  className="group relative overflow-hidden rounded-3xl shadow-soft hover:shadow-leaf transition-all aspect-square"
                >
                  <img
                    src={p.image_url}
                    alt={p.title}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/0 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                    <div>
                      <span className="inline-block bg-accent text-accent-foreground text-xs font-semibold px-2 py-1 rounded-full mb-2">
                        {CATEGORY_LABEL[p.category] || p.category}
                      </span>
                      <p className="text-primary-foreground text-sm font-medium leading-snug">{p.title}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      <Dialog open={!!open} onOpenChange={(v) => !v && setOpen(null)}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden border-0 bg-transparent shadow-none">
          {open && (
            <div className="relative">
              <img src={open.image_url} alt={open.title} className="w-full h-auto rounded-3xl shadow-leaf" />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-primary/90 to-transparent p-6 rounded-b-3xl">
                <span className="inline-block bg-accent text-accent-foreground text-xs font-semibold px-2 py-1 rounded-full mb-2">
                  {CATEGORY_LABEL[open.category] || open.category}
                </span>
                <p className="text-primary-foreground font-display text-xl">{open.title}</p>
                {open.description && <p className="text-primary-foreground/80 text-sm mt-1">{open.description}</p>}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Galeria;
