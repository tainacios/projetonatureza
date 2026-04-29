import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Trophy } from "lucide-react";

interface RankItem {
  user_id: string;
  full_name: string;
  total: number;
}

interface Action {
  id: string;
  reason: string;
  action_name: string | null;
  amount: number;
  created_at: string;
  user_id: string;
  full_name?: string;
}

const AdminEcoPontos = () => {
  const [ranking, setRanking] = useState<RankItem[]>([]);
  const [actions, setActions] = useState<Action[]>([]);

  useEffect(() => {
    (async () => {
      const startMonth = new Date();
      startMonth.setDate(1);
      startMonth.setHours(0, 0, 0, 0);

      const { data: history } = await supabase
        .from("points_history")
        .select("user_id, amount")
        .gte("created_at", startMonth.toISOString());

      if (history) {
        const totals = new Map<string, number>();
        history.forEach((h: any) => {
          if (h.amount > 0) totals.set(h.user_id, (totals.get(h.user_id) || 0) + h.amount);
        });
        const ids = [...totals.keys()];
        if (ids.length) {
          const { data: profiles } = await supabase
            .from("profiles")
            .select("id, full_name")
            .in("id", ids);
          const ranked = ids
            .map((id) => ({
              user_id: id,
              full_name: profiles?.find((p) => p.id === id)?.full_name || "—",
              total: totals.get(id)!,
            }))
            .sort((a, b) => b.total - a.total);
          setRanking(ranked);
        }
      }

      const { data: recent } = await supabase
        .from("points_history")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);
      if (recent) {
        const ids = [...new Set(recent.map((r: any) => r.user_id))];
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, full_name")
          .in("id", ids);
        setActions(
          recent.map((r: any) => ({
            ...r,
            full_name: profiles?.find((p) => p.id === r.user_id)?.full_name,
          }))
        );
      }
    })();
  }, []);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-3xl font-bold text-primary">EcoPontos</h1>
          <p className="text-muted-foreground">
            Para adicionar pontos manualmente, vá em Voluntários → ajustar pontos.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-accent" />
                Ranking do mês
              </CardTitle>
            </CardHeader>
            <CardContent>
              {ranking.length === 0 ? (
                <p className="text-sm text-muted-foreground">Sem pontuações neste mês.</p>
              ) : (
                <div className="space-y-2">
                  {ranking.slice(0, 10).map((r, idx) => (
                    <div
                      key={r.user_id}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/30"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-bold w-6 text-center text-primary">{idx + 1}º</span>
                        <span>{r.full_name}</span>
                      </div>
                      <span className="font-bold text-accent">{r.total} pts</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ações registradas</CardTitle>
            </CardHeader>
            <CardContent>
              {actions.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhuma ação registrada.</p>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {actions.map((a) => (
                    <div key={a.id} className="border-b border-border/50 pb-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{a.full_name}</span>
                        <span
                          className={`font-bold ${
                            a.amount >= 0 ? "text-primary" : "text-destructive"
                          }`}
                        >
                          {a.amount > 0 ? "+" : ""}
                          {a.amount}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {a.reason}
                        {a.action_name && ` · ${a.action_name}`} ·{" "}
                        {new Date(a.created_at).toLocaleString("pt-BR")}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminEcoPontos;
