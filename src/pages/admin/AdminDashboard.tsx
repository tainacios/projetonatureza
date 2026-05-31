import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Users, Star, ShoppingBag, MessageSquare } from "lucide-react";
import { Link } from "react-router-dom";

interface Stats {
  volunteers: number;
  totalPoints: number;
  redemptions: number;
  pendingTestimonials: number;
}

interface RecentRedemption {
  id: string;
  created_at: string;
  status: string;
  points_spent: number;
  reward_name?: string;
  volunteer_name?: string;
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<Stats>({
    volunteers: 0,
    totalPoints: 0,
    redemptions: 0,
    pendingTestimonials: 0,
  });
  const [recent, setRecent] = useState<RecentRedemption[]>([]);

  useEffect(() => {
    (async () => {
      const [{ count: vCount }, { data: profiles }, { count: rCount }, { count: tCount }] =
        await Promise.all([
          supabase.from("profiles").select("*", { count: "exact", head: true }),
          supabase.from("profiles").select("eco_points"),
          supabase.from("redemptions").select("*", { count: "exact", head: true }),
          supabase
            .from("testimonials")
            .select("*", { count: "exact", head: true })
            .eq("approved", false),
        ]);

      const totalPoints = (profiles ?? []).reduce(
        (acc, p: any) => acc + (p.eco_points || 0),
        0
      );

      setStats({
        volunteers: vCount ?? 0,
        totalPoints,
        redemptions: rCount ?? 0,
        pendingTestimonials: tCount ?? 0,
      });

      const { data: red } = await supabase
        .from("redemptions")
        .select("id, created_at, status, points_spent, reward_id, user_id")
        .order("created_at", { ascending: false })
        .limit(5);

      if (red && red.length) {
        const rewardIds = [...new Set(red.map((r) => r.reward_id))];
        const userIds = [...new Set(red.map((r) => r.user_id))];
        const [{ data: rewards }, { data: users }] = await Promise.all([
          supabase.from("rewards").select("id, name").in("id", rewardIds),
          supabase.from("profiles").select("id, full_name").in("id", userIds),
        ]);
        setRecent(
          red.map((r) => ({
            id: r.id,
            created_at: r.created_at,
            status: r.status,
            points_spent: r.points_spent,
            reward_name: rewards?.find((x) => x.id === r.reward_id)?.name,
            volunteer_name: users?.find((x) => x.id === r.user_id)?.full_name,
          }))
        );
      }
    })();
  }, []);

  const cards = [
    { title: "Voluntários", value: stats.volunteers, icon: Users, to: "/admin/voluntarios" },
    { title: "Pontos distribuídos", value: stats.totalPoints, icon: Star, to: "/admin/ecopontos" },
    { title: "Trocas realizadas", value: stats.redemptions, icon: ShoppingBag, to: "/admin/loja" },
    {
      title: "Depoimentos pendentes",
      value: stats.pendingTestimonials,
      icon: MessageSquare,
      to: "/admin/depoimentos",
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-3xl font-bold text-primary">Dashboard</h1>
          <p className="text-muted-foreground">Visão geral do projeto</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((c) => (
            <Link key={c.title} to={c.to}>
              <Card className="hover:shadow-soft transition-shadow cursor-pointer h-full">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {c.title}
                  </CardTitle>
                  <c.icon className="h-4 w-4 text-accent" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-primary">{c.value}</div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Trocas recentes</CardTitle>
          </CardHeader>
          <CardContent>
            {recent.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhuma troca ainda.</p>
            ) : (
              <div className="space-y-3">
                {recent.map((r) => (
                  <div
                    key={r.id}
                    className="flex items-center justify-between border-b border-border/50 pb-2 last:border-0"
                  >
                    <div>
                      <div className="font-medium">{r.volunteer_name || "—"}</div>
                      <div className="text-xs text-muted-foreground">
                        {r.reward_name} · {new Date(r.created_at).toLocaleString("pt-BR")}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-accent">{r.points_spent} pts</div>
                      <div className="text-xs capitalize text-muted-foreground">{r.status}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
