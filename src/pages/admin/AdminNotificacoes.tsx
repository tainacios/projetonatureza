import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { ShoppingBag, FileCheck, UserPlus } from "lucide-react";

interface Notif {
  id: string;
  type: "redemption" | "term" | "user";
  title: string;
  description: string;
  date: string;
}

const AdminNotificacoes = () => {
  const [items, setItems] = useState<Notif[]>([]);

  useEffect(() => {
    (async () => {
      const since = new Date();
      since.setDate(since.getDate() - 30);

      const [
        { data: redemptions },
        { data: terms },
        { data: profiles },
      ] = await Promise.all([
        supabase
          .from("redemptions")
          .select("id, created_at, points_spent, user_id, reward_id")
          .gte("created_at", since.toISOString())
          .order("created_at", { ascending: false }),
        supabase
          .from("ecopoints_terms_acceptance")
          .select("id, accepted_at, signature_name, user_id")
          .gte("accepted_at", since.toISOString())
          .order("accepted_at", { ascending: false }),
        supabase
          .from("profiles")
          .select("id, full_name, created_at")
          .gte("created_at", since.toISOString())
          .order("created_at", { ascending: false }),
      ]);

      const ids = [
        ...(redemptions?.map((r) => r.user_id) || []),
        ...(terms?.map((t) => t.user_id) || []),
      ];
      const rIds = redemptions?.map((r) => r.reward_id) || [];
      const [{ data: profs }, { data: rewards }] = await Promise.all([
        ids.length
          ? supabase.from("profiles").select("id, full_name").in("id", ids)
          : Promise.resolve({ data: [] as any[] }),
        rIds.length
          ? supabase.from("rewards").select("id, name").in("id", rIds)
          : Promise.resolve({ data: [] as any[] }),
      ]);

      const list: Notif[] = [];

      redemptions?.forEach((r) => {
        list.push({
          id: `r-${r.id}`,
          type: "redemption",
          title: "Nova troca de pontos",
          description: `${
            profs?.find((p) => p.id === r.user_id)?.full_name || "Voluntário"
          } resgatou ${rewards?.find((x) => x.id === r.reward_id)?.name || "item"} (${
            r.points_spent
          } pts)`,
          date: r.created_at,
        });
      });

      terms?.forEach((t) => {
        list.push({
          id: `t-${t.id}`,
          type: "term",
          title: "Novo aceite de termo",
          description: `${
            profs?.find((p) => p.id === t.user_id)?.full_name || t.signature_name
          } aceitou o termo EcoPontos`,
          date: t.accepted_at,
        });
      });

      profiles?.forEach((p) => {
        list.push({
          id: `u-${p.id}`,
          type: "user",
          title: "Novo voluntário",
          description: `${p.full_name || "Sem nome"} se cadastrou`,
          date: p.created_at,
        });
      });

      list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setItems(list);
    })();
  }, []);

  const ICONS = {
    redemption: ShoppingBag,
    term: FileCheck,
    user: UserPlus,
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-3xl font-bold text-primary">Notificações</h1>
          <p className="text-muted-foreground">Atividades dos últimos 30 dias</p>
        </div>

        <Card>
          <CardContent className="p-4 space-y-3">
            {items.length === 0 && (
              <p className="text-center text-muted-foreground py-6">Sem novidades.</p>
            )}
            {items.map((n) => {
              const Icon = ICONS[n.type];
              return (
                <div
                  key={n.id}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/30 border-b border-border/30 last:border-0"
                >
                  <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-sm">{n.title}</div>
                    <div className="text-sm text-muted-foreground">{n.description}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {new Date(n.date).toLocaleString("pt-BR")}
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminNotificacoes;
