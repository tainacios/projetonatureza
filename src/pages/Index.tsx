import { Link } from "react-router-dom";
import { ArrowRight, Heart, Leaf, Users, Sparkles, TreePine, HandHeart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/Layout";
import { LeafShape } from "@/components/LeafShape";
import heroImg from "@/assets/hero-volunteers.jpg";
import { Testimonials } from "@/components/Testimonials";
import childrenImg from "@/assets/action-children.jpg";
import elderlyImg from "@/assets/action-elderly.jpg";
import natureImg from "@/assets/action-nature.jpg";
import familyImg from "@/assets/action-family.jpg";

const actions = [
  { img: childrenImg, title: "Crianças", desc: "Acolhemos crianças em situação de vulnerabilidade com afeto, educação e oportunidades.", color: "accent" },
  { img: elderlyImg, title: "Idosos", desc: "Companhia, escuta e cuidado para quem nos ensinou tudo o que sabemos.", color: "leaf" },
  { img: familyImg, title: "Famílias", desc: "Campanhas de doação que conectam corações generosos a famílias em situação de vulnerabilidade.", color: "earth" },
  { img: natureImg, title: "Natureza & Animais", desc: "Viabilizamos o amparo animal e o reflorestamento através de redes de solidariedade, feiras de adoção e consciência ambiental.", color: "primary" },
];

const Index = () => {
  return (
    <Layout>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 leaf-pattern" />
        <LeafShape className="absolute -top-20 -left-16 w-72 text-secondary/30 animate-float" />
        <LeafShape className="absolute top-40 -right-24 w-96 text-accent/15 animate-float" color="hsl(var(--accent))" />

        <div className="container mx-auto px-4 pt-16 pb-24 md:pt-24 md:pb-32 relative">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-up">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/30 text-primary text-xs font-semibold uppercase tracking-widest mb-6">
                <Sparkles className="h-3 w-3" /> Rede de voluntariado com propósito
              </div>
              <h1 className="font-display text-5xl md:text-7xl font-bold leading-[1.05] text-primary mb-6 text-balance">
                O propósito da vida
                <span className="block italic text-accent">é uma vida com propósito.</span>
              </h1>
              <p className="text-lg text-foreground/70 mb-8 max-w-lg leading-relaxed">
                Somos uma rede de pessoas comuns realizando coisas extraordinárias,
                transformando vidas através do amor, da solidariedade e da fé.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button asChild variant="hero" size="xl">
                  <Link to="/auth">
                    Quero ser voluntário <ArrowRight className="h-5 w-5" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="xl">
                  <Link to="/acoes">Ver nossas ações</Link>
                </Button>
              </div>

              <div className="flex items-center gap-8 mt-12 pt-8 border-t border-border/50">
                <Stat number="500+" label="Pessoas alcançadas" />
                <Stat number="30+" label="Voluntários ativos" />
                <Stat number="20+" label="Animais doados" />
                <Stat number="+12" label="Ações realizadas" />
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-6 bg-gradient-warm organic-blob opacity-20 blur-2xl" />
              <div className="relative organic-blob overflow-hidden shadow-leaf">
                <img
                  src={heroImg}
                  alt="Voluntários do Projeto Natureza plantando juntos em uma floresta"
                  className="w-full h-[520px] md:h-[620px] object-cover"
                  width={1600}
                  height={1024}
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-card rounded-3xl p-5 shadow-warm flex items-center gap-3 max-w-[240px]">
                <div className="h-12 w-12 rounded-full bg-accent/15 flex items-center justify-center">
                  <Heart className="h-6 w-6 text-accent" fill="currentColor" />
                </div>
                <div>
                  <div className="font-display font-bold text-primary">Junte-se a nós</div>
                  <div className="text-xs text-muted-foreground">Cada gesto importa.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MANIFESTO */}
      <section className="py-20 md:py-28 bg-gradient-soft">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <Leaf className="h-10 w-10 text-accent mx-auto mb-6" />
          <h2 className="font-display text-3xl md:text-5xl font-bold text-primary mb-6 text-balance">
            Não acreditamos em milagres.<br />
            <span className="italic text-accent">Acreditamos em pessoas.</span>
          </h2>
          <p className="text-lg text-foreground/70 leading-relaxed">
          O Projeto Natureza nasceu da convicção de que pequenas ações mobilizadas podem transformar realidades complexas. Mais do que um projeto social, somos uma rede de apoio dedicada a promover o bem-estar integral da sociedade, atuando onde a vulnerabilidade se faz presente e onde a compaixão é necessária.
          titulo acho que pode ser: Inspirar. Acolher. Cuidar.
          </p>
        </div>
      </section>

      {/* AÇÕES */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="text-accent font-semibold uppercase tracking-widest text-sm">Nossas frentes</span>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-primary mt-3">
              Onde nossas mãos chegam
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {actions.map((a, i) => (
              <article
                key={a.title}
                className="group relative overflow-hidden rounded-3xl bg-card shadow-soft hover:shadow-leaf transition-all duration-500 hover:-translate-y-2"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="aspect-[4/5] overflow-hidden">
                  <img
                    src={a.img}
                    alt={a.title}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-earth/95 via-earth/40 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6 text-earth-foreground">
                  <h3 className="font-display text-2xl font-bold mb-2">{a.title}</h3>
                  <p className="text-sm text-earth-foreground/85 leading-relaxed">{a.desc}</p>
                </div>
              </article>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button asChild variant="leaf" size="lg">
              <Link to="/acoes">Conheça todas as ações <ArrowRight className="h-4 w-4" /></Link>
            </Button>
          </div>
        </div>
      </section>

      {/* DEPOIMENTOS */}
      <Testimonials limit={6} />

      {/* ECOPONTOS CTA */}
      <section className="py-20 md:py-28 bg-primary text-primary-foreground relative overflow-hidden">
        <LeafShape className="absolute top-0 -right-20 w-[480px] text-secondary/10 animate-float" color="hsl(var(--secondary))" />
        <LeafShape className="absolute -bottom-20 -left-20 w-[420px] text-accent/10" color="hsl(var(--accent))" />

        <div className="container mx-auto px-4 grid md:grid-cols-2 gap-12 items-center relative">
          <div>
            <span className="text-secondary font-semibold uppercase tracking-widest text-sm">Programa EcoPontos</span>
            <h2 className="font-display text-4xl md:text-5xl font-bold mt-3 mb-6 text-balance">
              Seu engajamento gera impacto e recompensa.
            </h2>
            <p className="text-lg text-primary-foreground/80 mb-8 leading-relaxed">
              Cada ação, cada reunião, cada gesto vira EcoPontos. Acumule, suba no ranking
              e troque por recompensas exclusivas do projeto.
            </p>
            <Button asChild variant="hero" size="lg">
              <Link to="/loja">Acessar minha área <ArrowRight className="h-4 w-4" /></Link>
            </Button>
          </div>

          <div className="grid gap-4">
            <PointRow icon={HandHeart} label="Participar de uma ação" pts="+100" />
            <PointRow icon={Users} label="Comparecer a reuniões" pts="+50" />
            <PointRow icon={TreePine} label="Indicar novo voluntário" pts="+200" />
            <PointRow icon={Sparkles} label="Engajar nas redes sociais" pts="+30" />
          </div>
        </div>
      </section>
    </Layout>
  );
};

const Stat = ({ number, label }: { number: string; label: string }) => (
  <div>
    <div className="font-display text-3xl md:text-4xl font-bold text-accent">{number}</div>
    <div className="text-xs text-muted-foreground uppercase tracking-wider mt-1">{label}</div>
  </div>
);

const PointRow = ({ icon: Icon, label, pts }: { icon: any; label: string; pts: string }) => (
  <div className="flex items-center gap-4 bg-primary-foreground/5 backdrop-blur rounded-2xl p-4 border border-primary-foreground/10 hover:bg-primary-foreground/10 transition-colors">
    <div className="h-12 w-12 rounded-full bg-secondary/20 flex items-center justify-center shrink-0">
      <Icon className="h-5 w-5 text-secondary" />
    </div>
    <div className="flex-1 font-medium">{label}</div>
    <div className="font-display font-bold text-accent text-lg">{pts}</div>
  </div>
);

export default Index;
