import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useTermsAcceptance } from "@/hooks/useTermsAcceptance";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Sparkles, Trophy, Award, TrendingUp, HandHeart, Users, TreePine, Heart } from "lucide-react";
import { toast } from "sonner";

interface Reward {
  id: string;
  name: string;
  description: string;
  points_cost: number;
  image_url: string | null;
}
interface Profile {
  id: string;
  full_name: string;
  eco_points: number;
}
interface RankRow { id: string; full_name: string; eco_points: number; }

const NEXT_LEVELS = [500, 1000, 2000, 5000, 10000];
const levelOf = (pts: number) => NEXT_LEVELS.findIndex((p) => pts < p) + 1 || NEXT_LEVELS.length;
const nextOf = (pts: number) => NEXT_LEVELS.find((p) => pts < p) ?? NEXT_LEVELS[NEXT_LEVELS.length - 1];

const Loja = () => {
  const { user, loading: authLoading } = useAuth();
  const { hasAccepted, loading: termsLoading } = useTermsAcceptance();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [ranking, setRanking] = useState<RankRow[]>([]);
  const [redeeming, setRedeeming] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth");
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!authLoading && user && !termsLoading && !hasAccepted) {
      navigate("/termo-ecopontos", { replace: true });
    }
  }, [authLoading, user, termsLoading, hasAccepted, navigate]);

  const loadAll = async () => {
    if (!user) return;
    const [{ data: prof }, { data: rew }, { data: rank }] = await Promise.all([
      supabase.from("profiles").select("id, full_name, eco_points").eq("id", user.id).maybeSingle(),
      supabase.from("rewards").select("*").eq("active", true).order("points_cost"),
      supabase.from("profiles").select("id, full_name, eco_points").order("eco_points", { ascending: false }).limit(5),
    ]);
    if (prof) setProfile(prof as Profile);
    if (rew) setRewards(rew as Reward[]);
    if (rank) setRanking(rank as RankRow[]);
  };

  useEffect(() => { loadAll(); }, [user]);

  const handleRedeem = async (reward: Reward) => {
    if (!profile) return;
    if (profile.eco_points < reward.points_cost) {
      toast.error("Você ainda não tem EcoPontos suficientes — continue engajado! 🌱");
      return;
    }
    setRedeeming(reward.id);
    const { data, error } = await supabase.functions.invoke("redeem-reward", {
      body: { rewardId: reward.id },
    });
    setRedeeming(null);
    if (error || !data?.success) {
      toast.error(data?.error || "Não foi possível processar a troca");
      return;
    }
    toast.success(`🎉 Troca registrada! Em breve você receberá ${reward.name}.`);
    loadAll();
  };

  if (authLoading || termsLoading || !profile) {
    return <Layout><div className="container py-20 text-center text-muted-foreground">Carregando sua área...</div></Layout>;
  }

  const lvl = levelOf(profile.eco_points);
  const next = nextOf(profile.eco_points);
  const prev = NEXT_LEVELS[Math.max(0, lvl - 2)] || 0;
  const progress = Math.min(100, ((profile.eco_points - prev) / (next - prev)) * 100);
  const firstName = profile.full_name?.split(" ")[0] || "Voluntário";

  return (
    <Layout>
      {/* DASHBOARD */}
      <section className="bg-gradient-hero text-primary-foreground py-14 relative overflow-hidden">
        <div className="absolute inset-0 leaf-pattern opacity-30" />
        <div className="container mx-auto px-4 relative">
          <div className="grid md:grid-cols-3 gap-8 items-center">
            <div className="md:col-span-2">
              <p className="text-secondary uppercase text-xs tracking-widest font-semibold">Bem-vindo(a) de volta</p>
              <h1 className="font-display text-4xl md:text-5xl font-bold mt-1">Olá, {firstName} 🌿</h1>
              <p className="text-primary-foreground/80 mt-3 max-w-md">Continue plantando boas ações — cada uma vale pontos e impacto real.</p>
              <a href="/termo-ecopontos?view=1" className="inline-block mt-3 text-xs text-secondary underline underline-offset-4 hover:text-accent transition-colors">Ver termo de participação</a>
            </div>
            <div className="bg-primary-foreground/10 backdrop-blur rounded-3xl p-6 border border-primary-foreground/15 shadow-soft">
              <div className="flex items-center gap-3 mb-3">
                <Sparkles className="h-5 w-5 text-accent" />
                <span className="text-sm uppercase tracking-widest text-primary-foreground/70">Seus EcoPontos</span>
              </div>
              <div className="font-display text-5xl font-bold text-accent">{profile.eco_points.toLocaleString("pt-BR")}</div>
              <div className="mt-4">
                <div className="flex justify-between text-xs text-primary-foreground/70 mb-1.5">
                  <span>Nível {lvl}</span>
                  <span>{next - profile.eco_points} pts até o próximo</span>
                </div>
                <Progress value={progress} className="h-2 bg-primary-foreground/20" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* LOJA */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-end justify-between flex-wrap gap-4 mb-10">
            <div>
              <span className="text-accent font-semibold uppercase tracking-widest text-sm">Loja EcoPontos</span>
              <h2 className="font-display text-4xl font-bold text-primary mt-2">Recompensas para você</h2>
            </div>
            <p className="text-sm text-muted-foreground max-w-sm">Trocas geram um email automático com seus dados. Estoque limitado.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {rewards.map((r) => {
              const can = profile.eco_points >= r.points_cost;
              return (
                <div key={r.id} className="bg-card rounded-3xl shadow-soft hover:shadow-leaf transition-all hover:-translate-y-1 overflow-hidden flex flex-col">
                  <div className="aspect-[4/3] bg-gradient-leaf flex items-center justify-center">
                    {r.image_url ? (
                      <img src={r.image_url} alt={r.name} className="w-full h-full object-cover" />
                    ) : (
                      <Award className="h-20 w-20 text-primary-foreground/60" />
                    )}
                  </div>
                  <div className="p-6 flex-1 flex flex-col">
                    <h3 className="font-display text-xl font-bold text-primary">{r.name}</h3>
                    <p className="text-sm text-muted-foreground mt-2 flex-1">{r.description}</p>
                    <div className="mt-5 flex items-center justify-between gap-3">
                      <div className="text-accent font-display font-bold text-lg">
                        {r.points_cost.toLocaleString("pt-BR")} <span className="text-xs uppercase tracking-widest text-muted-foreground">pts</span>
                      </div>
                      <Button
                        variant={can ? "hero" : "outline"}
                        size="sm"
                        disabled={!can || redeeming === r.id}
                        onClick={() => handleRedeem(r)}
                      >
                        {redeeming === r.id ? "Trocando..." : can ? "Trocar" : "Faltam pontos"}
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* COMO GANHAR + RANKING */}
      <section className="py-16 bg-secondary/15">
        <div className="container mx-auto px-4 grid lg:grid-cols-2 gap-10">
          <div>
            <span className="text-accent font-semibold uppercase tracking-widest text-sm">Como ganhar</span>
            <h2 className="font-display text-3xl font-bold text-primary mt-2 mb-6">Quanto cada gesto vale</h2>
            <div className="space-y-3">
              <PointCard icon={HandHeart} label="Participar de uma ação" pts={100} />
              <PointCard icon={Users} label="Comparecer a reuniões" pts={50} />
              <PointCard icon={TreePine} label="Indicar novo voluntário" pts={200} />
              <PointCard icon={Heart} label="Engajamento nas redes sociais" pts={30} />
            </div>
          </div>

          <div>
            <span className="text-accent font-semibold uppercase tracking-widest text-sm flex items-center gap-2">
              <Trophy className="h-4 w-4" /> Ranking do mês
            </span>
            <h2 className="font-display text-3xl font-bold text-primary mt-2 mb-6">Destaques da rede</h2>
            <div className="bg-card rounded-3xl shadow-soft p-2">
              {ranking.map((r, i) => {
                const isMe = r.id === user?.id;
                return (
                  <div key={r.id} className={`flex items-center gap-4 p-4 rounded-2xl ${isMe ? "bg-accent/10" : ""}`}>
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center font-display font-bold ${i === 0 ? "bg-accent text-accent-foreground" : i === 1 ? "bg-secondary text-secondary-foreground" : i === 2 ? "bg-earth text-earth-foreground" : "bg-muted text-muted-foreground"}`}>
                      {i + 1}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-primary">{r.full_name || "Voluntário(a)"}{isMe && " (você)"}</div>
                      {i === 0 && <div className="text-xs text-accent flex items-center gap-1"><TrendingUp className="h-3 w-3" /> Voluntário do mês</div>}
                    </div>
                    <div className="font-display font-bold text-primary">{r.eco_points.toLocaleString("pt-BR")} pts</div>
                  </div>
                );
              })}
              {ranking.length === 0 && <div className="p-8 text-center text-muted-foreground text-sm">Em breve, novos destaques.</div>}
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

const PointCard = ({ icon: Icon, label, pts }: { icon: any; label: string; pts: number }) => (
  <div className="flex items-center gap-4 bg-card rounded-2xl p-4 shadow-soft">
    <div className="h-12 w-12 rounded-full bg-gradient-warm flex items-center justify-center shadow-warm">
      <Icon className="h-5 w-5 text-accent-foreground" />
    </div>
    <div className="flex-1 font-medium text-primary">{label}</div>
    <div className="font-display font-bold text-accent text-lg">+{pts}</div>
  </div>
);

export default Loja;
