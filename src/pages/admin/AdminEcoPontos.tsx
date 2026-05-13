import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Trophy, Star } from "lucide-react";

interface RankItem { user_id: string; full_name: string; total: number }
interface HistoryItem {
  id: string; reason: string; action_name: string | null; amount: number;
  created_at: string; user_id: string; full_name?: string;
}
interface Profile { id: string; full_name: string; eco_points: number }
interface Redemption {
  id: string; created_at: string; status: string; points_spent: number;
  user_id: string; reward_id: string; volunteer_name?: string; reward_name?: string;
}

const STATUSES = ["pending", "approved", "delivered"] as const;
const STATUS_LABEL: Record<string, string> = {
  pending: "Pendente", approved: "Aprovado", delivered: "Entregue",
};

const AdminEcoPontos = () => {
  const { user } = useAuth();
  const [ranking, setRanking] = useState<RankItem[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [redemptions, setRedemptions] = useState<Redemption[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [distOpen, setDistOpen] = useState(false);
  const [targetUser, setTargetUser] = useState("");
  const [pointsValue, setPointsValue] = useState("");
  const [reason, setReason] = useState("");
  const [actionName, setActionName] = useState("");

  const load = async () => {
    const startMonth = new Date();
    startMonth.setDate(1); startMonth.setHours(0, 0, 0, 0);

    const [{ data: monthHist }, { data: recent }, { data: profs }, { data: reds }] = await Promise.all([
      supabase.from("points_history").select("user_id, amount").gte("created_at", startMonth.toISOString()),
      supabase.from("points_history").select("*").order("created_at", { ascending: false }).limit(30),
      supabase.from("profiles").select("id, full_name, eco_points").order("full_name"),
      supabase.from("redemptions").select("*").order("created_at", { ascending: false }),
    ]);

    setProfiles((profs as Profile[]) ?? []);
    const profMap = new Map((profs ?? []).map((p: any) => [p.id, p.full_name]));

    if (monthHist) {
      const totals = new Map<string, number>();
      monthHist.forEach((h: any) => {
        if (h.amount > 0) totals.set(h.user_id, (totals.get(h.user_id) || 0) + h.amount);
      });
      setRanking([...totals.entries()]
        .map(([id, total]) => ({ user_id: id, full_name: profMap.get(id) || "—", total }))
        .sort((a, b) => b.total - a.total));
    }

    setHistory((recent ?? []).map((r: any) => ({ ...r, full_name: profMap.get(r.user_id) })));

    if (reds) {
      const rids = [...new Set(reds.map((r) => r.reward_id))];
      const { data: rewards } = await supabase.from("rewards").select("id, name").in("id", rids);
      setRedemptions(reds.map((r) => ({
        ...r,
        volunteer_name: profMap.get(r.user_id),
        reward_name: rewards?.find((x) => x.id === r.reward_id)?.name,
      })));
    }
  };

  useEffect(() => { load(); }, []);

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("redemptions").update({ status }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Status atualizado"); load();
  };

  const openDistribute = (userId?: string) => {
    setTargetUser(userId ?? "");
    setPointsValue("");
    setReason("");
    setActionName("");
    setDistOpen(true);
  };

  const submitPoints = async () => {
    const amount = parseInt(pointsValue, 10);
    if (!targetUser || !amount || !reason) return toast.error("Preencha voluntário, pontos e motivo");
    const target = profiles.find((p) => p.id === targetUser);
    if (!target) return;
    const newTotal = Math.max(0, target.eco_points + amount);
    const { error: e1 } = await supabase.from("profiles").update({ eco_points: newTotal }).eq("id", target.id);
    if (e1) return toast.error(e1.message);
    const { error: e2 } = await supabase.from("points_history").insert({
      user_id: target.id, amount, reason, action_name: actionName || null, created_by: user?.id,
    });
    if (e2) return toast.error(e2.message);
    toast.success("Pontos distribuídos");
    setDistOpen(false); setTargetUser(""); setPointsValue(""); setReason(""); setActionName("");
    load();
  };

  const filteredRed = filter === "all" ? redemptions : redemptions.filter((r) => r.status === filter);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between gap-4 flex-wrap">
          <div>
            <h1 className="font-display text-3xl font-bold text-primary">EcoPontos</h1>
            <p className="text-muted-foreground">Distribuição de pontos e gestão dos resgates</p>
          </div>
          <Button onClick={() => openDistribute()}>
            <Star className="h-4 w-4 mr-2" /> Distribuir pontos
          </Button>
        </div>

        <Tabs defaultValue="voluntarios">
          <TabsList>
            <TabsTrigger value="voluntarios">Voluntários</TabsTrigger>
            <TabsTrigger value="resgates">Resgates</TabsTrigger>
            <TabsTrigger value="ranking">Ranking</TabsTrigger>
            <TabsTrigger value="historico">Histórico</TabsTrigger>
          </TabsList>

          <TabsContent value="voluntarios" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-accent" /> Voluntários
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Lista de todos os voluntários. Use o botão para creditar pontos — o lançamento aparece no Histórico.
                </p>
              </CardHeader>
              <CardContent className="p-0 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/40 text-left">
                    <tr>
                      <th className="p-3">Voluntário</th>
                      <th className="p-3">EcoPontos</th>
                      <th className="p-3 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {profiles.map((p) => (
                      <tr key={p.id} className="border-t border-border/50">
                        <td className="p-3">{p.full_name || "(sem nome)"}</td>
                        <td className="p-3 font-bold text-accent">{p.eco_points} pts</td>
                        <td className="p-3 text-right">
                          <Button size="sm" variant="outline" onClick={() => openDistribute(p.id)}>
                            <Star className="h-3 w-3 mr-1" /> Adicionar pontos
                          </Button>
                        </td>
                      </tr>
                    ))}
                    {profiles.length === 0 && (
                      <tr><td colSpan={3} className="p-6 text-center text-muted-foreground">Nenhum voluntário cadastrado.</td></tr>
                    )}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="resgates" className="space-y-4">
            <div className="flex justify-end">
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {STATUSES.map((s) => <SelectItem key={s} value={s}>{STATUS_LABEL[s]}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <Card>
              <CardContent className="p-0 overflow-x-auto">
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
                    {filteredRed.map((r) => (
                      <tr key={r.id} className="border-t border-border/50">
                        <td className="p-3">{r.volunteer_name || "—"}</td>
                        <td className="p-3">{r.reward_name || "—"}</td>
                        <td className="p-3 font-bold text-accent">{r.points_spent}</td>
                        <td className="p-3 text-muted-foreground">{new Date(r.created_at).toLocaleString("pt-BR")}</td>
                        <td className="p-3">
                          <Select value={r.status} onValueChange={(v) => updateStatus(r.id, v)}>
                            <SelectTrigger className="w-36 h-8"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {STATUSES.map((s) => <SelectItem key={s} value={s}>{STATUS_LABEL[s]}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </td>
                      </tr>
                    ))}
                    {filteredRed.length === 0 && (
                      <tr><td colSpan={5} className="p-6 text-center text-muted-foreground">Nenhum resgate.</td></tr>
                    )}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ranking">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-accent" /> Ranking do mês
                </CardTitle>
              </CardHeader>
              <CardContent>
                {ranking.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Sem pontuações neste mês.</p>
                ) : (
                  <div className="space-y-2">
                    {ranking.slice(0, 20).map((r, idx) => (
                      <div key={r.user_id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/30">
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
          </TabsContent>

          <TabsContent value="historico">
            <Card>
              <CardHeader><CardTitle>Movimentações recentes</CardTitle></CardHeader>
              <CardContent>
                {history.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Nada registrado.</p>
                ) : (
                  <div className="space-y-2 max-h-[500px] overflow-y-auto">
                    {history.map((a) => (
                      <div key={a.id} className="border-b border-border/50 pb-2">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">{a.full_name}</span>
                          <span className={`font-bold ${a.amount >= 0 ? "text-primary" : "text-destructive"}`}>
                            {a.amount > 0 ? "+" : ""}{a.amount}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {a.reason}{a.action_name && ` · ${a.action_name}`} · {new Date(a.created_at).toLocaleString("pt-BR")}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Dialog open={distOpen} onOpenChange={setDistOpen}>
          <DialogContent>
            <DialogHeader><DialogTitle>Distribuir pontos</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div>
                <Label>Voluntário</Label>
                <Select value={targetUser} onValueChange={setTargetUser}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    {profiles.map((p) => (
                      <SelectItem key={p.id} value={p.id}>{p.full_name || "(sem nome)"} — {p.eco_points} pts</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Quantidade (negativo para remover)</Label>
                <Input type="number" value={pointsValue} onChange={(e) => setPointsValue(e.target.value)} placeholder="Ex: 50 ou -20" />
              </div>
              <div>
                <Label>Motivo</Label>
                <Input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Ex: Participação em ação" />
              </div>
              <div>
                <Label>Ação (opcional)</Label>
                <Input value={actionName} onChange={(e) => setActionName(e.target.value)} placeholder="Nome da ação" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDistOpen(false)}>Cancelar</Button>
              <Button onClick={submitPoints}>Confirmar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default AdminEcoPontos;
