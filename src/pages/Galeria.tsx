import { useState } from "react";
import { Layout } from "@/components/Layout";
import { LeafShape } from "@/components/LeafShape";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import childrenImg from "@/assets/action-children.jpg";
import elderlyImg from "@/assets/action-elderly.jpg";
import familyImg from "@/assets/action-family.jpg";
import natureImg from "@/assets/action-nature.jpg";
import heroImg from "@/assets/hero-volunteers.jpg";

type Category = "Todas" | "Crianças" | "Idosos" | "Animais" | "Eventos";

interface Photo {
  src: string;
  alt: string;
  category: Exclude<Category, "Todas">;
}

const photos: Photo[] = [
  { src: childrenImg, alt: "Crianças em oficina criativa", category: "Crianças" },
  { src: elderlyImg, alt: "Tarde com idosos no asilo", category: "Idosos" },
  { src: familyImg, alt: "Famílias recebendo cestas", category: "Eventos" },
  { src: natureImg, alt: "Plantio comunitário", category: "Eventos" },
  { src: heroImg, alt: "Voluntários reunidos", category: "Eventos" },
  { src: childrenImg, alt: "Brincadeiras na praça", category: "Crianças" },
  { src: elderlyImg, alt: "Visita ao lar São Vicente", category: "Idosos" },
  { src: natureImg, alt: "Resgate animal Patinhas", category: "Animais" },
  { src: familyImg, alt: "Distribuição de agasalhos", category: "Eventos" },
  { src: childrenImg, alt: "Aula de leitura", category: "Crianças" },
  { src: natureImg, alt: "Cães adotados", category: "Animais" },
  { src: elderlyImg, alt: "Café com os avós", category: "Idosos" },
];

const categories: Category[] = ["Todas", "Crianças", "Idosos", "Animais", "Eventos"];

const Galeria = () => {
  const [filter, setFilter] = useState<Category>("Todas");
  const [open, setOpen] = useState<Photo | null>(null);

  const visible = filter === "Todas" ? photos : photos.filter((p) => p.category === filter);

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

      {/* Filtros */}
      <section className="py-8 sticky top-20 z-30 backdrop-blur-md bg-background/80 border-b border-border/40">
        <div className="container mx-auto px-4 flex flex-wrap gap-2 justify-center">
          {categories.map((c) => (
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

      {/* Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {visible.length === 0 ? (
            <p className="text-center text-foreground/60 py-20">Nenhuma foto nesta categoria ainda.</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {visible.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => setOpen(p)}
                  className="group relative overflow-hidden rounded-3xl shadow-soft hover:shadow-leaf transition-all aspect-square"
                >
                  <img
                    src={p.src}
                    alt={p.alt}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/0 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                    <div>
                      <span className="inline-block bg-accent text-accent-foreground text-xs font-semibold px-2 py-1 rounded-full mb-2">
                        {p.category}
                      </span>
                      <p className="text-primary-foreground text-sm font-medium leading-snug">{p.alt}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Lightbox */}
      <Dialog open={!!open} onOpenChange={(v) => !v && setOpen(null)}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden border-0 bg-transparent shadow-none">
          {open && (
            <div className="relative">
              <img src={open.src} alt={open.alt} className="w-full h-auto rounded-3xl shadow-leaf" />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-primary/90 to-transparent p-6 rounded-b-3xl">
                <span className="inline-block bg-accent text-accent-foreground text-xs font-semibold px-2 py-1 rounded-full mb-2">
                  {open.category}
                </span>
                <p className="text-primary-foreground font-display text-xl">{open.alt}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Galeria;
