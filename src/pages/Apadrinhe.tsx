import { useState } from "react";
import { z } from "zod";
import { Layout } from "@/components/Layout";
import { LeafShape } from "@/components/LeafShape";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Heart, Users, PawPrint, Sprout, Check, Sparkles } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const plans = [
  {
    name: "Semente",
    price: 25,
    tag: "Plano Básico",
    color: "bg-secondary/30",
    perks: [
      "Apoia 1 criança em atividades educativas",
      "Carta mensal de impacto",
      "Selo de apoiador no seu perfil",
    ],
  },
  {
    name: "Raiz",
    price: 60,
    tag: "Plano Intermediário",
    color: "bg-primary/15",
    featured: true,
    perks: [
      "Sustenta 3 cestas básicas por mês",
      "Convite para mutirões exclusivos",
      "Brinde ecológico trimestral",
    ],
  },
  {
    name: "Floresta",
    price: 150,
    tag: "Plano Premium",
    color: "bg-accent/15",
    perks: [
      "Patrocina uma ação completa por mês",
      "Visita guiada às comunidades atendidas",
      "Reconhecimento na lista de parceiros",
    ],
  },
];

const impact = [
  { icon: Heart, title: "Apoio a crianças", text: "Material escolar, lanches e oficinas criativas." },
  { icon: Users, title: "Ajuda a idosos", text: "Visitas, kits de higiene e tardes de companhia." },
  { icon: PawPrint, title: "Cuidados com animais", text: "Castração, vacinas e adoções responsáveis." },
  { icon: Sprout, title: "Ações sociais", text: "Mutirões, hortas comunitárias e eventos." },
];

const formSchema = z.object({
  name: z.string().trim().min(2, "Informe seu nome").max(100),
  email: z.string().trim().email("Email inválido").max(255),
  amount: z.coerce.number().min(10, "Valor mínimo de R$ 10").max(10000, "Valor muito alto"),
});

const Apadrinhe = () => {
  const [selected, setSelected] = useState<number>(60);
  const [form, setForm] = useState({ name: "", email: "", amount: "" });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = form.amount ? Number(form.amount) : selected;
    const result = formSchema.safeParse({ ...form, amount });
    if (!result.success) {
      toast({
        title: "Verifique os dados",
        description: result.error.issues[0].message,
        variant: "destructive",
      });
      return;
    }
    setSubmitting(true);
    // Simulação — integração real virá depois (gateway de pagamento)
    setTimeout(() => {
      toast({
        title: "💚 Obrigado por apadrinhar!",
        description: `Em breve enviaremos as instruções para ${result.data.email}.`,
      });
      setForm({ name: "", email: "", amount: "" });
      setSubmitting(false);
    }, 700);
  };

  return (
    <Layout>
      <section className="relative overflow-hidden bg-gradient-soft py-20 md:py-28">
        <LeafShape className="absolute -top-10 -right-10 w-80 text-secondary/30 animate-float" />
        <div className="container mx-auto px-4 relative grid md:grid-cols-2 gap-10 items-center">
          <div>
            <span className="text-accent font-semibold uppercase tracking-widest text-sm">Apadrinhe o projeto</span>
            <h1 className="font-display text-5xl md:text-6xl font-bold text-primary mt-3 mb-6 text-balance">
              Sua contribuição <span className="italic text-accent">vira semente.</span>
            </h1>
            <p className="text-lg text-foreground/70 leading-relaxed mb-6">
              Quando você apadrinha o Projeto Natureza, ajuda a manter ações que transformam vidas
              todos os meses. Pequenos valores, grandes raízes.
            </p>
            <Button
              variant="hero"
              size="lg"
              onClick={() => document.getElementById("planos")?.scrollIntoView({ behavior: "smooth" })}
            >
              <Heart className="h-5 w-5" /> Quero apadrinhar
            </Button>
          </div>
          <div className="relative">
            <div className="organic-blob bg-gradient-leaf p-10 text-primary-foreground shadow-leaf">
              <Sparkles className="h-10 w-10 mb-4" />
              <p className="font-display text-2xl leading-snug">
                "Cada padrinho é uma raiz que sustenta a árvore inteira do projeto."
              </p>
              <p className="text-sm opacity-80 mt-4">— Fundadores do Projeto Natureza</p>
            </div>
          </div>
        </div>
      </section>

      {/* Planos */}
      <section id="planos" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-accent font-semibold uppercase tracking-widest text-sm">💳 Planos de contribuição</span>
            <h2 className="font-display text-4xl font-bold text-primary mt-2">Escolha como quer ajudar</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {plans.map((p) => {
              const isSelected = selected === p.price;
              return (
                <Card
                  key={p.name}
                  className={`relative cursor-pointer transition-all border-2 ${
                    isSelected ? "border-primary shadow-leaf -translate-y-1" : "border-transparent shadow-soft"
                  } ${p.color}`}
                  onClick={() => setSelected(p.price)}
                >
                  {p.featured && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-accent-foreground text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-warm">
                      Mais escolhido
                    </span>
                  )}
                  <CardHeader>
                    <CardDescription className="uppercase tracking-wide text-xs">{p.tag}</CardDescription>
                    <CardTitle className="font-display text-3xl text-primary">{p.name}</CardTitle>
                    <div className="flex items-baseline gap-1 pt-2">
                      <span className="font-display text-5xl font-bold text-primary">R${p.price}</span>
                      <span className="text-foreground/60">/mês</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 mb-6">
                      {p.perks.map((perk) => (
                        <li key={perk} className="flex gap-2 text-sm text-foreground/80">
                          <Check className="h-5 w-5 text-primary shrink-0" /> {perk}
                        </li>
                      ))}
                    </ul>
                    <Button
                      variant={isSelected ? "hero" : "outline"}
                      className="w-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelected(p.price);
                        document.getElementById("formulario")?.scrollIntoView({ behavior: "smooth" });
                      }}
                    >
                      {isSelected ? "Plano selecionado" : "Escolher plano"}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Impacto */}
      <section className="py-16 bg-muted/40">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-accent font-semibold uppercase tracking-widest text-sm">🌱 Impacto da contribuição</span>
            <h2 className="font-display text-4xl font-bold text-primary mt-2">O que sua doação realiza</h2>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            {impact.map((i) => (
              <Card key={i.title} className="border-border/60 text-center">
                <CardHeader>
                  <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-2">
                    <i.icon className="h-7 w-7 text-primary" />
                  </div>
                  <CardTitle className="font-display text-xl text-primary">{i.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-foreground/70">{i.text}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Formulário */}
      <section id="formulario" className="py-20">
        <div className="container mx-auto px-4 max-w-2xl">
          <Card className="border-border/60 shadow-leaf">
            <CardHeader className="text-center">
              <span className="text-accent font-semibold uppercase tracking-widest text-sm">🧾 Quase lá</span>
              <CardTitle className="font-display text-3xl text-primary">Quero apadrinhar</CardTitle>
              <CardDescription>Preencha seus dados e nossa equipe entrará em contato.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome completo</Label>
                  <Input
                    id="name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Seu nome"
                    maxLength={100}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="voce@email.com"
                    maxLength={255}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount">
                    Valor mensal (R$){" "}
                    <span className="text-muted-foreground font-normal">— deixe vazio para usar R$ {selected}</span>
                  </Label>
                  <Input
                    id="amount"
                    type="number"
                    min={10}
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                    placeholder={`Ex: ${selected}`}
                  />
                </div>
                <Button type="submit" variant="hero" size="lg" className="w-full" disabled={submitting}>
                  <Heart className="h-5 w-5" /> {submitting ? "Enviando..." : "Quero Apadrinhar"}
                </Button>
                <p className="text-xs text-center text-muted-foreground">
                  Você pode cancelar quando quiser. Seus dados são tratados com cuidado.
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>
    </Layout>
  );
};

export default Apadrinhe;
