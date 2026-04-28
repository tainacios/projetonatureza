import { Layout } from "@/components/Layout";
import { LeafShape } from "@/components/LeafShape";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Wallet,
  TrendingUp,
  PiggyBank,
  Users,
  Heart,
  PawPrint,
  Sparkles,
  ShieldCheck,
  Award,
  Leaf,
} from "lucide-react";

const finance = [
  { icon: Wallet, label: "Doações recebidas", value: "R$ 48.720", hint: "Acumulado em 2026" },
  { icon: TrendingUp, label: "Aplicado em ações", value: "R$ 41.150", hint: "84% destinado a ações sociais" },
  { icon: PiggyBank, label: "Saldo atual", value: "R$ 7.570", hint: "Reserva para próximos mutirões" },
];

const reports = [
  {
    title: "Mutirão Comunidade Verde",
    description: "Reforma e pintura de praça pública no bairro São Mateus.",
    impact: "120 famílias beneficiadas · 30 voluntários",
  },
  {
    title: "Campanha do Agasalho",
    description: "Arrecadação e distribuição de roupas no inverno.",
    impact: "1.450 peças doadas · 380 pessoas atendidas",
  },
  {
    title: "Lar dos Idosos São Vicente",
    description: "Tarde de carinho com música, lanche e atividades.",
    impact: "60 idosos acolhidos · 18 voluntários",
  },
  {
    title: "Resgate Animal Patinhas",
    description: "Castração e adoção responsável em parceria com ONGs.",
    impact: "45 animais resgatados · 22 adoções",
  },
];

const impact = [
  { icon: Sparkles, value: "86", label: "Ações realizadas" },
  { icon: Users, value: "320", label: "Voluntários ativos" },
  { icon: Heart, value: "5.400", label: "Pessoas impactadas" },
  { icon: PawPrint, value: "210", label: "Animais ajudados" },
];

const partners = [
  "Padaria Pão da Vida",
  "Mercado Verde",
  "Clínica Vet Patinhas",
  "Escola Semente",
  "Rádio Comunitária FM",
  "Loja Raízes",
  "Café Florescer",
  "Construtora Terra Boa",
];

const policies = [
  {
    title: "Regras do EcoPontos",
    text: "Voluntários acumulam pontos a cada participação verificada em ações. Pontos não expiram e podem ser trocados por brindes na Loja.",
  },
  {
    title: "Participação no projeto",
    text: "Aberta a qualquer pessoa maior de 16 anos. Menores precisam de autorização. Pedimos respeito, pontualidade e cuidado com as comunidades atendidas.",
  },
  {
    title: "Uso dos recursos",
    text: "100% das doações são aplicadas em ações sociais e custos operacionais essenciais. Publicamos relatório trimestral aberto à comunidade.",
  },
];

const Transparencia = () => (
  <Layout>
    <section className="relative overflow-hidden bg-gradient-soft py-20 md:py-28">
      <LeafShape className="absolute -top-10 -right-10 w-80 text-secondary/30 animate-float" />
      <div className="container mx-auto px-4 relative max-w-3xl">
        <span className="text-accent font-semibold uppercase tracking-widest text-sm">Portal aberto</span>
        <h1 className="font-display text-5xl md:text-6xl font-bold text-primary mt-3 mb-6 text-balance">
          Transparência <span className="italic text-accent">de raiz a copa.</span>
        </h1>
        <p className="text-lg text-foreground/70 leading-relaxed">
          Acreditamos que confiança se constrói com clareza. Aqui você acompanha cada doação, cada ação
          e cada vida transformada pelo Projeto Natureza.
        </p>
      </div>
    </section>

    {/* Resumo financeiro */}
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
          <div>
            <span className="text-accent font-semibold uppercase tracking-widest text-sm">📊 Resumo financeiro</span>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-primary mt-2">Para onde vai cada real</h2>
          </div>
          <p className="text-sm text-muted-foreground">Atualizado em abril de 2026</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {finance.map((f) => (
            <Card key={f.label} className="border-border/60 shadow-soft hover:shadow-leaf transition-all">
              <CardHeader>
                <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-2">
                  <f.icon className="h-6 w-6 text-primary" />
                </div>
                <CardDescription className="uppercase tracking-wide text-xs">{f.label}</CardDescription>
                <CardTitle className="font-display text-4xl text-primary">{f.value}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-foreground/60">{f.hint}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>

    {/* Relatório de ações */}
    <section className="py-16 bg-muted/40">
      <div className="container mx-auto px-4">
        <span className="text-accent font-semibold uppercase tracking-widest text-sm">📦 Relatório de ações</span>
        <h2 className="font-display text-3xl md:text-4xl font-bold text-primary mt-2 mb-8">O que realizamos</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {reports.map((r) => (
            <Card key={r.title} className="border-border/60">
              <CardHeader>
                <CardTitle className="font-display text-2xl text-primary">{r.title}</CardTitle>
                <CardDescription>{r.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
                  <Leaf className="h-4 w-4" /> {r.impact}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>

    {/* Impacto */}
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-accent font-semibold uppercase tracking-widest text-sm">👥 Impacto do projeto</span>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-primary mt-2">Números que falam por nós</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {impact.map((i) => (
            <div
              key={i.label}
              className="rounded-3xl bg-gradient-leaf text-primary-foreground p-8 text-center shadow-leaf"
            >
              <i.icon className="h-8 w-8 mx-auto mb-3 opacity-90" />
              <div className="font-display text-4xl md:text-5xl font-bold">{i.value}</div>
              <div className="text-sm opacity-90 mt-1">{i.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* Parceiros */}
    <section className="py-16 bg-muted/40">
      <div className="container mx-auto px-4">
        <span className="text-accent font-semibold uppercase tracking-widest text-sm">🤝 Parceiros</span>
        <h2 className="font-display text-3xl md:text-4xl font-bold text-primary mt-2 mb-8">Quem caminha conosco</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {partners.map((p) => (
            <div
              key={p}
              className="rounded-2xl border-2 border-dashed border-primary/30 bg-background p-6 text-center font-display text-primary hover:border-primary hover:bg-primary/5 transition-colors"
            >
              {p}
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* EcoPontos */}
    <section className="py-16">
      <div className="container mx-auto px-4 grid md:grid-cols-2 gap-10 items-center">
        <div>
          <span className="text-accent font-semibold uppercase tracking-widest text-sm">⭐ EcoPontos</span>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-primary mt-2 mb-4">Como funciona o sistema</h2>
          <p className="text-foreground/70 leading-relaxed mb-4">
            A cada ação que você participa, ganha EcoPontos. Eles representam seu impacto e podem ser
            trocados por brindes ecológicos, cursos e experiências na nossa Loja.
          </p>
          <ul className="space-y-2 text-foreground/80">
            <li className="flex gap-2"><Award className="h-5 w-5 text-accent shrink-0" /> Ação leve (até 2h): <strong className="ml-1">10 pontos</strong></li>
            <li className="flex gap-2"><Award className="h-5 w-5 text-accent shrink-0" /> Ação completa (meio dia): <strong className="ml-1">25 pontos</strong></li>
            <li className="flex gap-2"><Award className="h-5 w-5 text-accent shrink-0" /> Mutirão (dia inteiro): <strong className="ml-1">50 pontos</strong></li>
          </ul>
        </div>
        <Card className="bg-gradient-soft border-border/60 shadow-leaf">
          <CardHeader>
            <CardTitle className="font-display text-2xl text-primary">🏆 Ranking mensal</CardTitle>
            <CardDescription>Top voluntários de abril</CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="space-y-3">
              {[
                { n: "Maria Clara", p: 180 },
                { n: "João Pedro", p: 165 },
                { n: "Ana Beatriz", p: 140 },
                { n: "Lucas Almeida", p: 120 },
                { n: "Sofia Lima", p: 100 },
              ].map((v, i) => (
                <li key={v.n} className="flex items-center justify-between rounded-2xl bg-background/70 px-4 py-3">
                  <span className="flex items-center gap-3">
                    <span className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                      {i + 1}
                    </span>
                    <span className="font-medium">{v.n}</span>
                  </span>
                  <span className="font-display text-primary font-bold">{v.p} pts</span>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      </div>
    </section>

    {/* Políticas */}
    <section className="py-16 bg-muted/40">
      <div className="container mx-auto px-4">
        <span className="text-accent font-semibold uppercase tracking-widest text-sm">📜 Regras e políticas</span>
        <h2 className="font-display text-3xl md:text-4xl font-bold text-primary mt-2 mb-8">Clareza em cada passo</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {policies.map((p) => (
            <Card key={p.title} className="border-border/60">
              <CardHeader>
                <div className="h-12 w-12 rounded-2xl bg-accent/10 flex items-center justify-center mb-2">
                  <ShieldCheck className="h-6 w-6 text-accent" />
                </div>
                <CardTitle className="font-display text-xl text-primary">{p.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground/70 leading-relaxed">{p.text}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  </Layout>
);

export default Transparencia;
