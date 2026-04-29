import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { History, Star } from "lucide-react";

interface Profile {
  id: string;
  full_name: string;
  eco_points: number;
  active: boolean;
  created_at: string;
}

interface PointEntry {
  id: string;
  amount: number;
  reason: string;
  action_name: string | null;
  created_at: string;
}

const AdminVoluntarios = () => {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Profile | null>(null);
  const [history, setHistory] = useState<PointEntry[] | null>(null);
  const [historyName, setHistoryName] = useState("");
  const [pointsValue, setPointsValue] = useState("");
  const [reason, setReason] = useState("");
  const [action, setAction] = useState("");

  const load = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("id, full_name, eco_points, active, created_at")
      .order("created_at", { ascending: false });
    setProfiles((data as Profile[]) ?? []);
  };

  useEffect(() => {
    load();
  }, []);

  const toggleActive = async (p: Profile) => {
    const { error } = await supabase
      .from("profiles")
      .update({ active: !p.active })
      .eq("id", p.id);
    if (error) return toast.error(error.message);
    toast.success(p.active ? "Voluntário desativado" : "Voluntário ativado");
    load();
  };

  const submitPoints = async () => {
    if (!editing) return;
    const amount = parseInt(pointsValue, 10);
    if (!amount || !reason) return toast.error("Preencha pontos e motivo");
    const newTotal = Math.max(0, editing.eco_points + amount);
    const { error: e1 } = await supabase
      .from("profiles")
      .update({ eco_points: newTotal })
      .eq("id", editing.id);
    if (e1) return toast.error(e1.message);
    const { error: e2 } = await supabase.from("points_history").insert({
      user_id: editing.id,
      amount,
      reason,
      action_name: action || null,
      created_by: user?.id,
    });
    if (e2) return toast.error(e2.message);
    toast.success("Pontos atualizados");
    setEditing(null);
    setPointsValue("");
    setReason("");
    setAction("");
    load();
  };

  const showHistory = async (p: Profile) => {
    setHistoryName(p.full_name);
    const { data } = await supabase
      .from("points_history")
      .select("*")
      .eq("user_id", p.id)
      .order("created_at", { ascending: false });
    setHistory((data as PointEntry[]) ?? []);
  };

  const filtered = profiles.filter((p) =>
    p.full_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold text-primary">Voluntários</h1>
            <p className="text-muted-foreground">Gerencie pontos e status dos voluntários</p>
          </div>
          <Input
            placeholder="Buscar por nome..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="sm:w-64"
          />
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/40 text-left">
                  <tr>
                    <th className="p-3">Nome</th>
                    <th className="p-3">Pontos</th>
                    <th className="p-3">Ativo</th>
                    <th className="p-3 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p) => (
                    <tr key={p.id} className="border-t border-border/50">
                      <td className="p-3">
                        <div className="font-medium">{p.full_name || "Sem nome"}</div>
                        <div className="text-xs text-muted-foreground">
                          Cadastrado em {new Date(p.created_at).toLocaleDateString("pt-BR")}
                        </div>
                      </td>
                      <td className="p-3 font-bold text-accent">{p.eco_points}</td>
                      <td className="p-3">
                        <Switch checked={p.active} onCheckedChange={() => toggleActive(p)} />
                      </td>
                      <td className="p-3 text-right space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditing(p);
                            setPointsValue("");
                            setReason("");
                            setAction("");
                          }}
                        >
                          <Star className="h-3 w-3 mr-1" /> Pontos
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => showHistory(p)}>
                          <History className="h-3 w-3 mr-1" /> Histórico
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={4} className="p-6 text-center text-muted-foreground">
                        Nenhum voluntário encontrado.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ajustar pontos — {editing?.full_name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <Label>Quantidade (use negativo para remover)</Label>
                <Input
                  type="number"
                  value={pointsValue}
                  onChange={(e) => setPointsValue(e.target.value)}
                  placeholder="Ex: 50 ou -20"
                />
              </div>
              <div>
                <Label>Motivo</Label>
                <Input
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Ex: Participação em ação"
                />
              </div>
              <div>
                <Label>Ação (opcional)</Label>
                <Input
                  value={action}
                  onChange={(e) => setAction(e.target.value)}
                  placeholder="Nome da ação"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditing(null)}>
                Cancelar
              </Button>
              <Button onClick={submitPoints}>Confirmar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={!!history} onOpenChange={(o) => !o && setHistory(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Histórico — {historyName}</DialogTitle>
            </DialogHeader>
            <div className="max-h-96 overflow-y-auto space-y-2">
              {history && history.length === 0 && (
                <p className="text-sm text-muted-foreground">Sem movimentações.</p>
              )}
              {history?.map((h) => (
                <div
                  key={h.id}
                  className="flex justify-between border-b border-border/50 pb-2"
                >
                  <div>
                    <div className="text-sm font-medium">{h.reason}</div>
                    <div className="text-xs text-muted-foreground">
                      {h.action_name && `${h.action_name} · `}
                      {new Date(h.created_at).toLocaleString("pt-BR")}
                    </div>
                  </div>
                  <div
                    className={`font-bold ${
                      h.amount >= 0 ? "text-primary" : "text-destructive"
                    }`}
                  >
                    {h.amount > 0 ? "+" : ""}
                    {h.amount}
                  </div>
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default AdminVoluntarios;
