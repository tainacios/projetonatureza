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
          <span className="text-accent font-semibold uppercase tracking-widest text-sm">A Jornada de um Coração:</span>
          <h2 className="font-display text-4xl font-bold text-primary mt-3 mb-6">Como o Projeto Natureza Criou Raízes</h2>
          <div className="space-y-4 text-foreground/70 leading-relaxed">
            <p>
            O Projeto Natureza nasceu de um propósito cultivado desde a infância de sua fundadora, inspirada pelo exemplo de serviço e amor ao próximo. Durante anos, ela realizou ações solidárias de forma independente, levando apoio, carinho e esperança a crianças e famílias.

Com o tempo, esse propósito se expandiu: sua roça tornou-se um espaço de acolhimento para crianças viverem momentos de liberdade e contato com a natureza, além de servir como refúgio para animais resgatados e reabilitados. Com o tempo, a iniciativa se espalhou: amigos se juntaram, e o projeto Natureza começou a crescer. 
            </p>
            <p>
            Em fevereiro de 2025, através de um convite nas redes sociais, outros corações se uniram a essa missão, transformando uma jornada individual no Projeto Natureza. Hoje, cada ação realizada mantém viva a essência que deu origem ao projeto: servir pessoas e animais com amor, fé e propósito, mostrando que
              <strong className="text-primary"> a vida ganha mais sentido quando é vivida para fazer a diferença.</strong>
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
            { n: "500+", l: "Pessoas alcançadas", icon: Heart },
            { n: "30+", l: "Voluntários ativos", icon: Users },
            { n: "20+", l: "Animais doados", icon: Leaf },
            { n: "+12", l: "Ações realizadas", icon: Star },
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
