import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import childrenImg from "@/assets/action-children.jpg";
import elderlyImg from "@/assets/action-elderly.jpg";
import natureImg from "@/assets/action-nature.jpg";
import familyImg from "@/assets/action-family.jpg";

const acoes = [
  {
    img: childrenImg,
    tag: "Infância",
    title: "Sementes do amanhã",
    story: "Em uma tarde de sábado, Júlia, 7 anos, plantou seu primeiro pé de jabuticaba. Disse que ia voltar quando fosse mais alta que a árvore. Esse é o nosso trabalho — fazer com que ela queira voltar.",
    desc: "Atendemos crianças em situação de vulnerabilidade com oficinas de arte, reforço escolar, alimentação e, principalmente, escuta. Cada criança merece sentir que tem um lugar no mundo."
  },
  {
    img: elderlyImg,
    tag: "Terceira idade",
    title: "Mãos que ensinam",
    story: "Dona Cecília tinha 83 anos quando nos disse: 'Faz tempo que ninguém me pergunta como eu estou.' Hoje ela faz parte das nossas tardes de chá, e quem aprende somos nós.",
    desc: "Visitas, escuta ativa, atividades em grupo e cuidado integral para idosos em situação de solidão ou vulnerabilidade. Porque cuidar de quem nos formou é o mínimo que devemos."
  },
  {
    img: familyImg,
    tag: "Famílias",
    title: "Vínculos que sustentam",
    story: "Quando a família de Pedro perdeu tudo em um incêndio, foi a rede de voluntários que reconstruiu — não só a casa, mas a esperança. Hoje ele trabalha conosco.",
    desc: "Apoio integral a famílias em risco social: doações, orientação, acompanhamento psicossocial e oportunidades de geração de renda. Acreditamos no poder da reconstrução."
  },
  {
    img: natureImg,
    tag: "Meio ambiente",
    title: "Cuidando da casa comum",
    story: "Foram 12.000 árvores plantadas em três anos. Mas o número que nos emociona é outro: 1 — o filhote de bicho-preguiça que voltou à área reflorestada. Ele é o sinal.",
    desc: "Reflorestamento, mutirões de limpeza, resgate e cuidado animal, e educação ambiental em escolas. A natureza não pede muito de nós — só que paremos de destruir."
  },
];

const Acoes = () => (
  <Layout>
    <section className="bg-gradient-soft py-20">
      <div className="container mx-auto px-4 text-center max-w-3xl">
        <span className="text-accent font-semibold uppercase tracking-widest text-sm">Nossas ações</span>
        <h1 className="font-display text-5xl md:text-7xl font-bold text-primary mt-3 mb-6 text-balance">
          Cada história importa.
        </h1>
        <p className="text-lg text-foreground/70">
          Conheça as frentes em que atuamos — e as vidas por trás de cada número.
        </p>
      </div>
    </section>

    <section className="py-20">
      <div className="container mx-auto px-4 space-y-24 max-w-6xl">
        {acoes.map((a, i) => (
          <article key={a.title} className={`grid md:grid-cols-2 gap-12 items-center ${i % 2 ? 'md:[&>*:first-child]:order-2' : ''}`}>
            <div className="organic-blob overflow-hidden shadow-leaf">
              <img src={a.img} alt={a.title} loading="lazy" className="w-full h-[480px] object-cover" />
            </div>
            <div>
              <span className="inline-block px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-semibold uppercase tracking-widest mb-4">{a.tag}</span>
              <h2 className="font-display text-4xl md:text-5xl font-bold text-primary mb-6 text-balance">{a.title}</h2>
              <blockquote className="border-l-4 border-accent pl-5 py-2 italic text-foreground/80 leading-relaxed mb-6 font-display text-lg">
                "{a.story}"
              </blockquote>
              <p className="text-foreground/70 leading-relaxed">{a.desc}</p>
            </div>
          </article>
        ))}
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

export default Acoes;
