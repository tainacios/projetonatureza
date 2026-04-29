import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Redemption {
  id: string;
  created_at: string;
  status: string;
  points_spent: number;
  user_id: string;
  reward_id: string;
  volunteer_name?: string;
  reward_name?: string;
}

const STATUSES = ["pending", "approved", "delivered"] as const;
const STATUS_LABEL: Record<string, string> = {
  pending: "Pendente",
  approved: "Aprovado",
  delivered: "Entregue",
};

const AdminLoja = () => {
  const [items, setItems] = useState<Redemption[]>([]);
  const [filter, setFilter] = useState<string>("all");

  const load = async () => {
    const { data } = await supabase
      .from("redemptions")
      .select("*")
      .order("created_at", { ascending: false });
    if (!data) return setItems([]);
    const ids = [...new Set(data.map((r) => r.user_id))];
    const rids = [...new Set(data.map((r) => r.reward_id))];
    const [{ data: profs }, { data: rewards }] = await Promise.all([
      supabase.from("profiles").select("id, full_name").in("id", ids),
      supabase.from("rewards").select("id, name").in("id", rids),
    ]);
    setItems(
      data.map((r) => ({
        ...r,
        volunteer_name: profs?.find((p) => p.id === r.user_id)?.full_name,
        reward_name: rewards?.find((x) => x.id === r.reward_id)?.name,
      }))
    );
  };

  useEffect(() => {
    load();
  }, []);

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("redemptions").update({ status }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Status atualizado");
    load();
  };

  const filtered = filter === "all" ? items : items.filter((i) => i.status === filter);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold text-primary">Loja</h1>
            <p className="text-muted-foreground">Gerencie as trocas de pontos</p>
          </div>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="sm:w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {STATUS_LABEL[s]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/40 text-left">
                  <tr>
                    <th className="p-3">Voluntário</th>
                    <th className="p-3">Item</th>
                    <th className="p-3">Pontos</th>
                    <th className="p-3">Data</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r) => (
                    <tr key={r.id} className="border-t border-border/50">
                      <td className="p-3">{r.volunteer_name || "—"}</td>
                      <td className="p-3">{r.reward_name || "—"}</td>
                      <td className="p-3 font-bold text-accent">{r.points_spent}</td>
                      <td className="p-3 text-muted-foreground">
                        {new Date(r.created_at).toLocaleString("pt-BR")}
                      </td>
                      <td className="p-3">
                        <Select
                          value={r.status}
                          onValueChange={(v) => updateStatus(r.id, v)}
                        >
                          <SelectTrigger className="w-36 h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {STATUSES.map((s) => (
                              <SelectItem key={s} value={s}>
                                {STATUS_LABEL[s]}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-6 text-center text-muted-foreground">
                        Nenhuma troca encontrada.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminLoja;
