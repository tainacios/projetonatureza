import { Layout } from "@/components/Layout";
import { LeafShape } from "@/components/LeafShape";
import { Heart, Eye, Sprout, Users, Leaf, Star } from "lucide-react";
import heroImg from "@/assets/hero-volunteers.jpg";

const Sobre = () => (
  <Layout>
    <section className="relative overflow-hidden bg-gradient-soft py-20 md:py-28">
      <LeafShape className="absolute -top-10 -right-10 w-80 text-secondary/30 animate-float" />
      <div className="container mx-auto px-4 relative">
        <div className="max-w-3xl">
          <span className="text-accent font-semibold uppercase tracking-widest text-sm">Sobre nós</span>
          <h1 className="font-display text-5xl md:text-7xl font-bold text-primary mt-3 mb-6 text-balance">
            Plantamos esperança<br /><span className="italic text-accent">colhemos transformação.</span>
          </h1>
          <p className="text-lg text-foreground/70 leading-relaxed">
            O Projeto Natureza nasceu da convicção de que pequenos gestos, multiplicados por mãos
            unidas, mudam o mundo. Somos uma rede de voluntários movidos pela fé no ser humano e no poder da natureza.
          </p>
        </div>
      </div>
    </section>

    <section className="py-20">
      <div className="container mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
        <div className="organic-blob overflow-hidden shadow-leaf">
          <img src={heroImg} alt="Voluntários unidos plantando uma árvore" className="w-full h-[500px] object-cover" loading="lazy" />
        </div>
        <div>
          <span className="text-accent font-semibold uppercase tracking-widest text-sm">Nossa história</span>
          <h2 className="font-display text-4xl font-bold text-primary mt-3 mb-6">De um sonho a uma rede viva</h2>
          <div className="space-y-4 text-foreground/70 leading-relaxed">
            <p>
              Tudo começou com um pequeno grupo de amigos que decidiu transformar incômodo em ação.
              O que era um café aos sábados virou mutirão. O mutirão virou rede. A rede virou projeto.
            </p>
            <p>
              Hoje, somos centenas de voluntários atuando lado a lado com crianças, idosos, famílias
              em vulnerabilidade e o meio ambiente — sempre com a mesma certeza inicial:
              <strong className="text-primary"> ninguém transforma o mundo sozinho.</strong>
            </p>
          </div>
        </div>
      </div>
    </section>

    <section className="py-20 bg-secondary/20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-14">
          <h2 className="font-display text-4xl md:text-5xl font-bold text-primary">Missão, visão e valores</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          <Pillar icon={Heart} title="Missão" text="Transformar vidas através de ações de amor, solidariedade e cuidado com a natureza, promovendo dignidade e pertencimento." />
          <Pillar icon={Eye} title="Visão" text="Ser uma rede de impacto reconhecida pela autenticidade, profundidade espiritual e alcance social, inspirando novos voluntários a agir." />
          <Pillar icon={Sprout} title="Valores" text="Fé, acolhimento, respeito à vida em todas as formas, transparência, solidariedade e cuidado com a casa comum." />
        </div>
      </div>
    </section>

    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-14">
          <span className="text-accent font-semibold uppercase tracking-widest text-sm">Nosso impacto</span>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-primary mt-3">Números que falam por nós</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
          {[
            { n: "2.500+", l: "Vidas transformadas", icon: Heart },
            { n: "180+", l: "Voluntários ativos", icon: Users },
            { n: "12.000", l: "Árvores plantadas", icon: Leaf },
            { n: "98%", l: "Famílias acolhidas", icon: Star },
          ].map((s) => (
            <div key={s.l} className="text-center bg-card rounded-3xl p-8 shadow-soft hover:shadow-leaf transition-shadow">
              <s.icon className="h-8 w-8 text-accent mx-auto mb-4" />
              <div className="font-display text-4xl font-bold text-primary">{s.n}</div>
              <div className="text-sm text-muted-foreground mt-2">{s.l}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  </Layout>
);

const Pillar = ({ icon: Icon, title, text }: any) => (
  <div className="bg-card rounded-3xl p-8 shadow-soft hover:shadow-leaf hover:-translate-y-1 transition-all">
    <div className="h-14 w-14 rounded-2xl bg-gradient-warm flex items-center justify-center mb-5 shadow-warm">
      <Icon className="h-6 w-6 text-accent-foreground" />
    </div>
    <h3 className="font-display text-2xl font-bold text-primary mb-3">{title}</h3>
    <p className="text-foreground/70 leading-relaxed">{text}</p>
  </div>
);

export default Sobre;
