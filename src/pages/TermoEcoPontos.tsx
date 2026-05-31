import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useTermsAcceptance } from "@/hooks/useTermsAcceptance";
import { useUserRole } from "@/hooks/useUserRole";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CheckCircle2, FileText, Leaf, ShieldCheck, Sparkles } from "lucide-react";

const TERMS_VERSION = "1.0";

const TermoEcoPontos = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const viewOnly = params.get("view") === "1";
  const { acceptance, hasAccepted, loading: termsLoading, refresh } = useTermsAcceptance();
  const { isAdmin, loading: roleLoading } = useUserRole();

  const [checked, setChecked] = useState(false);
  const [signature, setSignature] = useState("");
  const [scrolledEnd, setScrolledEnd] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth");
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!termsLoading && !roleLoading && !viewOnly) {
      if (isAdmin) navigate("/admin", { replace: true });
      else if (hasAccepted) navigate("/loja", { replace: true });
    }
  }, [termsLoading, roleLoading, isAdmin, hasAccepted, viewOnly, navigate]);

  const onScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 8) setScrolledEnd(true);
  };

  const canSubmit = useMemo(
    () => checked && signature.trim().length >= 3 && scrolledEnd && !submitting,
    [checked, signature, scrolledEnd, submitting],
  );

  const handleAccept = async () => {
    if (!user || submitting || !canSubmit) return;
    setSubmitting(true);
    const { error } = await supabase.rpc("accept_ecopoints_terms", {
      _signature_name: signature.trim(),
      _terms_version: TERMS_VERSION,
    });
    if (error) {
      console.error("Erro ao aceitar termo EcoPontos:", error);
      setSubmitting(false);
      toast.error("Não foi possível registrar o aceite. Tente novamente.");
      return;
    }
    toast.success("🌿 Termo aceito! Bem-vindo(a) ao EcoPontos.");
    await refresh();
    setSubmitting(false);
    navigate("/loja", { replace: true });
  };

  if (authLoading || termsLoading || roleLoading) {
    return (
      <Layout>
        <div className="container py-20 text-center text-muted-foreground">Carregando termo...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* HERO */}
      <section className="bg-gradient-hero text-primary-foreground py-14 relative overflow-hidden">
        <div className="absolute inset-0 leaf-pattern opacity-30" />
        <div className="container mx-auto px-4 relative max-w-4xl">
          <div className="flex items-center gap-2 text-secondary uppercase text-xs tracking-widest font-semibold">
            <ShieldCheck className="h-4 w-4" /> Programa EcoPontos
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold mt-2">
            Termo de Participação <span className="text-accent">– EcoPontos</span>
          </h1>
          <p className="text-primary-foreground/80 mt-3 max-w-2xl">
            Antes de acessar a loja e trocar seus EcoPontos, leia atentamente o termo e confirme sua
            concordância. Esse passo nos ajuda a manter um programa transparente e justo para todos.
          </p>
        </div>
      </section>

      {/* CONTEÚDO */}
      <section className="py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          {viewOnly && hasAccepted && acceptance && (
            <div className="mb-6 rounded-2xl border border-primary/20 bg-primary/5 p-5 flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-primary">Você já aceitou este termo</p>
                <p className="text-muted-foreground">
                  Assinatura: <span className="font-medium">{acceptance.signature_name}</span> •
                  Versão {acceptance.terms_version} •{" "}
                  {new Date(acceptance.accepted_at).toLocaleString("pt-BR")}
                </p>
              </div>
            </div>
          )}

          <div className="bg-card rounded-3xl shadow-soft overflow-hidden border border-border">
            <div className="flex items-center gap-3 px-6 py-4 border-b border-border bg-secondary/10">
              <div className="h-10 w-10 rounded-full bg-gradient-warm flex items-center justify-center shadow-warm">
                <FileText className="h-5 w-5 text-accent-foreground" />
              </div>
              <div>
                <h2 className="font-display text-lg font-bold text-primary">
                  Termo de Participação e Aceite
                </h2>
                <p className="text-xs text-muted-foreground">
                  Versão {TERMS_VERSION} • Projeto Natureza
                </p>
              </div>
            </div>

            <div
              ref={scrollRef}
              onScroll={onScroll}
              className="max-h-[460px] overflow-y-auto px-6 md:px-10 py-8 space-y-6 text-foreground/90 leading-relaxed"
            >
              <p className="text-base">
                O presente Termo de Participação tem como objetivo estabelecer as diretrizes para
                utilização do sistema de pontuação <strong>EcoPontos</strong>, desenvolvido pelo{" "}
                <strong>Projeto Natureza</strong> como forma de reconhecimento e incentivo ao
                engajamento de seus voluntários.
              </p>
              <p>
                Ao aderir ao programa, o voluntário declara estar ciente e de acordo com as
                condições abaixo descritas.
              </p>

              <Section icon={<Leaf className="h-4 w-4" />} title="Sobre o programa EcoPontos">
                O EcoPontos é o sistema oficial de pontuação e recompensas do Projeto Natureza,
                criado para valorizar a participação ativa dos voluntários nas ações e iniciativas
                do projeto.
              </Section>

              <Section icon={<Sparkles className="h-4 w-4" />} title="Acúmulo de pontos">
                A pontuação é atribuída conforme critérios definidos pelo projeto, podendo ser
                ajustada a qualquer momento, sempre com transparência junto à comunidade de
                voluntários.
              </Section>

              <Section icon={<Sparkles className="h-4 w-4" />} title="Utilização dos pontos">
                Os pontos podem ser trocados por recompensas disponíveis na loja EcoPontos,
                conforme regras, estoque e disponibilidade vigentes no momento da troca.
              </Section>

              <Section icon={<ShieldCheck className="h-4 w-4" />} title="Regras importantes">
                <ul className="list-disc pl-5 space-y-1.5 mt-2">
                  <li>Os pontos são pessoais e intransferíveis.</li>
                  <li>
                    Podem expirar em caso de inatividade superior a <strong>60 dias</strong>.
                  </li>
                  <li>
                    O projeto pode revisar pontuações sempre que necessário, mantendo o histórico
                    do voluntário.
                  </li>
                </ul>
              </Section>

              <Section icon={<Leaf className="h-4 w-4" />} title="Compromisso do voluntário">
                O voluntário se compromete a agir com ética, respeito e alinhamento com o propósito
                do projeto, contribuindo para um ambiente colaborativo e regenerativo.
              </Section>

              <Section icon={<CheckCircle2 className="h-4 w-4" />} title="Aceite">
                Ao aceitar este termo, o voluntário confirma sua concordância com todas as regras
                do programa EcoPontos e autoriza o registro do seu aceite com data, hora e
                assinatura digital.
              </Section>

              <p className="text-sm text-muted-foreground italic pt-4 border-t border-border">
                Role até o final do termo para habilitar a área de aceite. 🌱
              </p>
            </div>
          </div>

          {/* ÁREA DE ACEITE */}
          {!viewOnly && (
            <div className="mt-8 bg-card rounded-3xl shadow-soft border border-border p-6 md:p-8">
              <h3 className="font-display text-xl font-bold text-primary mb-5">
                Confirme sua participação
              </h3>

              <div className="space-y-5">
                <label className="flex items-start gap-3 cursor-pointer group">
                  <Checkbox
                    checked={checked}
                    onCheckedChange={(v) => setChecked(v === true)}
                    className="mt-1"
                    disabled={!scrolledEnd}
                  />
                  <span className="text-sm md:text-base text-foreground group-hover:text-primary transition-colors">
                    Declaro que li e concordo com os termos do programa{" "}
                    <strong>EcoPontos</strong>.
                  </span>
                </label>

                <div>
                  <Label htmlFor="signature" className="text-sm font-medium text-primary">
                    Digite seu nome completo como assinatura
                  </Label>
                  <Input
                    id="signature"
                    value={signature}
                    onChange={(e) => setSignature(e.target.value)}
                    placeholder="Ex: Maria da Silva Souza"
                    className="mt-2"
                    disabled={!scrolledEnd}
                    maxLength={120}
                  />
                </div>

                {!scrolledEnd && (
                  <p className="text-xs text-muted-foreground">
                    💡 Role o texto do termo até o final para liberar o aceite.
                  </p>
                )}

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <Button
                    variant="hero"
                    size="lg"
                    disabled={!canSubmit}
                    onClick={handleAccept}
                    className="sm:flex-1"
                  >
                    {submitting ? "Registrando..." : "Aceitar e continuar"}
                  </Button>
                  <Button variant="outline" size="lg" onClick={() => navigate(-1)}>
                    Voltar
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

const Section = ({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) => (
  <div>
    <h3 className="flex items-center gap-2 font-display text-lg font-bold text-primary">
      <span className="h-7 w-7 rounded-full bg-secondary/30 flex items-center justify-center text-primary">
        {icon}
      </span>
      {title}
    </h3>
    <div className="mt-2 text-sm md:text-base">{children}</div>
  </div>
);

export default TermoEcoPontos;
