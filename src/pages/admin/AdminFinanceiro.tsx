import { useEffect, useMemo, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import { Navigate } from "react-router-dom";
import { toast } from "sonner";
import { Plus, Wallet, AlertTriangle, CheckCircle2, Pencil } from "lucide-react";

interface Profile { id: string; full_name: string }
interface Pledge {
  id: string; user_id: string; monthly_amount: number; due_day: number; active: boolean;
  full_name?: string;
}
interface Donation {
  id: string; user_id: string; amount: number; reference_month: string;
  paid_at: string | null; status: string; notes: string | null;
  full_name?: string;
}

const STATUSES = ["pending", "paid", "cancelled"] as const;
const STATUS_LABEL: Record<string, string> = {
  pending: "Pendente", paid: "Pago", cancelled: "Cancelado",
};

const monthKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
const monthLabel = (s: string) => {
  const d = new Date(s);
  return d.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
};
const fmtMoney = (n: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(n) || 0);

const AdminFinanceiro = () => {
  const { user } = useAuth();
  const { permissions, loading: roleLoading } = useUserRole();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [pledges, setPledges] = useState<Pledge[]>([]);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [month, setMonth] = useState<string>(monthKey(new Date()));

  const [pledgeOpen, setPledgeOpen] = useState(false);
  const [pledgeForm, setPledgeForm] = useState({ user_id: "", monthly_amount: "", due_day: "10", active: true });

  const [donOpen, setDonOpen] = useState(false);
  const [donEditing, setDonEditing] = useState<Donation | null>(null);
  const [donForm, setDonForm] = useState({
    user_id: "", amount: "", reference_month: monthKey(new Date()),
    status: "pending", paid_at: "", notes: "",
  });

  const load = async () => {
    const [{ data: p }, { data: pl }, { data: dn }] = await Promise.all([
      supabase.from("profiles").select("id, full_name").order("full_name"),
      supabase.from("donor_pledges" as any).select("*"),
      supabase.from("donations" as any).select("*").order("reference_month", { ascending: false }),
    ]);
    setProfiles((p as Profile[]) ?? []);
    const map = new Map((p ?? []).map((x: any) => [x.id, x.full_name]));
    setPledges(((pl as any) ?? []).map((x: any) => ({ ...x, full_name: map.get(x.user_id) })));
    setDonations(((dn as any) ?? []).map((x: any) => ({ ...x, full_name: map.get(x.user_id) })));
  };
  useEffect(() => { if (!roleLoading && permissions.financeiro) load(); }, [roleLoading, permissions.financeiro]);

  const monthDonations = useMemo(
    () => donations.filter((d) => d.reference_month.startsWith(month.slice(0, 7))),
    [donations, month]
  );
  const totalMonth = monthDonations
    .filter((d) => d.status === "paid")
    .reduce((s, d) => s + Number(d.amount), 0);
  const expectedMonth = pledges
    .filter((p) => p.active)
    .reduce((s, p) => s + Number(p.monthly_amount), 0);

  // Inadimplentes do mês selecionado: pledge ativo e sem doação 'paid' naquele mês
  const overdueRows = useMemo(() => {
    const paidByUser = new Set(
      monthDonations.filter((d) => d.status === "paid").map((d) => d.user_id)
    );
    return pledges
      .filter((p) => p.active && !paidByUser.has(p.user_id))
      .map((p) => ({
        ...p,
        donation: monthDonations.find((d) => d.user_id === p.user_id) || null,
      }));
  }, [pledges, monthDonations]);

  const submitPledge = async () => {
    if (!pledgeForm.user_id || !pledgeForm.monthly_amount) return toast.error("Preencha voluntário e valor");
    const payload = {
      user_id: pledgeForm.user_id,
      monthly_amount: Number(pledgeForm.monthly_amount),
      due_day: Math.max(1, Math.min(28, Number(pledgeForm.due_day) || 10)),
      active: pledgeForm.active,
    };
    const { error } = await supabase
      .from("donor_pledges" as any)
      .upsert(payload, { onConflict: "user_id" });
    if (error) return toast.error(error.message);
    toast.success("Compromisso salvo");
    setPledgeOpen(false);
    setPledgeForm({ user_id: "", monthly_amount: "", due_day: "10", active: true });
    load();
  };

  const editPledge = (p: Pledge) => {
    setPledgeForm({
      user_id: p.user_id,
      monthly_amount: String(p.monthly_amount),
      due_day: String(p.due_day),
      active: p.active,
    });
    setPledgeOpen(true);
  };

  const openNewDonation = (userId?: string, amount?: number) => {
    setDonEditing(null);
    setDonForm({
      user_id: userId ?? "",
      amount: amount ? String(amount) : "",
      reference_month: month,
      status: "paid",
      paid_at: new Date().toISOString().slice(0, 10),
      notes: "",
    });
    setDonOpen(true);
  };
  const openEditDonation = (d: Donation) => {
    setDonEditing(d);
    setDonForm({
      user_id: d.user_id,
      amount: String(d.amount),
      reference_month: d.reference_month,
      status: d.status,
      paid_at: d.paid_at ? d.paid_at.slice(0, 10) : "",
      notes: d.notes || "",
    });
    setDonOpen(true);
  };

  const submitDonation = async () => {
    if (!donForm.user_id || !donForm.amount || !donForm.reference_month) {
      return toast.error("Preencha voluntário, valor e mês");
    }
    const payload: any = {
      user_id: donForm.user_id,
      amount: Number(donForm.amount),
      reference_month: donForm.reference_month,
      status: donForm.status,
      paid_at: donForm.status === "paid" ? (donForm.paid_at ? new Date(donForm.paid_at).toISOString() : new Date().toISOString()) : null,
      notes: donForm.notes || null,
    };
    if (donEditing) {
      const { error } = await supabase.from("donations" as any).update(payload).eq("id", donEditing.id);
      if (error) return toast.error(error.message);
    } else {
      payload.created_by = user?.id;
      const { error } = await supabase.from("donations" as any).upsert(payload, { onConflict: "user_id,reference_month" });
      if (error) return toast.error(error.message);
    }
    toast.success("Doação registrada");
    setDonOpen(false); load();
  };

  if (roleLoading) {
    return <AdminLayout><div className="text-muted-foreground">Carregando...</div></AdminLayout>;
  }
  if (!permissions.financeiro) return <Navigate to="/admin" replace />;

  // Lista de meses para filtro (últimos 12)
  const months: string[] = [];
  const now = new Date();
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(monthKey(d));
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between gap-4 flex-wrap items-end">
          <div>
            <h1 className="font-display text-3xl font-bold text-primary flex items-center gap-2">
              <Wallet className="h-7 w-7" /> Financeiro
            </h1>
            <p className="text-muted-foreground">Doações mensais e inadimplência</p>
          </div>
          <div className="flex gap-2">
            <Select value={month} onValueChange={setMonth}>
              <SelectTrigger className="w-56"><SelectValue /></SelectTrigger>
              <SelectContent>
                {months.map((m) => (
                  <SelectItem key={m} value={m}>{monthLabel(m)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={() => openNewDonation()}>
              <Plus className="h-4 w-4 mr-2" /> Registrar doação
            </Button>
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          <Card><CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Recebido no mês</div>
            <div className="text-2xl font-bold text-primary">{fmtMoney(totalMonth)}</div>
          </CardContent></Card>
          <Card><CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Esperado (compromissos)</div>
            <div className="text-2xl font-bold">{fmtMoney(expectedMonth)}</div>
          </CardContent></Card>
          <Card><CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Inadimplentes</div>
            <div className="text-2xl font-bold text-destructive">{overdueRows.length}</div>
          </CardContent></Card>
        </div>

        <Tabs defaultValue="mes">
          <TabsList>
            <TabsTrigger value="mes">Doações do mês</TabsTrigger>
            <TabsTrigger value="inadimplentes">Inadimplentes</TabsTrigger>
            <TabsTrigger value="pledges">Compromissos</TabsTrigger>
          </TabsList>

          <TabsContent value="mes">
            <Card>
              <CardContent className="p-0 overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Voluntário</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Pago em</TableHead>
                      <TableHead>Obs.</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {monthDonations.map((d) => (
                      <TableRow key={d.id}>
                        <TableCell>{d.full_name || "—"}</TableCell>
                        <TableCell className="font-bold">{fmtMoney(Number(d.amount))}</TableCell>
                        <TableCell>
                          <span className={
                            d.status === "paid" ? "text-primary font-semibold" :
                            d.status === "cancelled" ? "text-muted-foreground" :
                            "text-destructive font-semibold"
                          }>{STATUS_LABEL[d.status]}</span>
                        </TableCell>
                        <TableCell>{d.paid_at ? new Date(d.paid_at).toLocaleDateString("pt-BR") : "—"}</TableCell>
                        <TableCell className="text-muted-foreground text-xs">{d.notes || ""}</TableCell>
                        <TableCell>
                          <Button size="sm" variant="ghost" onClick={() => openEditDonation(d)}>
                            <Pencil className="h-3 w-3" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {monthDonations.length === 0 && (
                      <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-6">Sem doações neste mês.</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="inadimplentes" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                  <AlertTriangle className="h-5 w-5" /> Doadores em {monthLabel(month)}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Todos os usuários cadastrados são considerados doadores. Marque o pagamento ou registre como inadimplente.
                </p>
              </CardHeader>
              <CardContent className="p-0 overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Doador</TableHead>
                      <TableHead>Compromisso</TableHead>
                      <TableHead>Status do mês</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {profiles.map((u) => {
                      const pledge = pledges.find((p) => p.user_id === u.id && p.active);
                      const donation = monthDonations.find((d) => d.user_id === u.id);
                      const isOverdue = !donation || donation.status !== "paid";
                      return (
                        <TableRow key={u.id}>
                          <TableCell>{u.full_name || "(sem nome)"}</TableCell>
                          <TableCell>
                            {pledge
                              ? <span>{fmtMoney(Number(pledge.monthly_amount))} · dia {pledge.due_day}</span>
                              : <span className="text-muted-foreground text-xs">Sem compromisso</span>}
                          </TableCell>
                          <TableCell>
                            {donation ? (
                              <span className={
                                donation.status === "paid" ? "text-primary font-semibold" :
                                donation.status === "cancelled" ? "text-muted-foreground" :
                                "text-destructive font-semibold"
                              }>{STATUS_LABEL[donation.status]}</span>
                            ) : (
                              <span className="text-destructive">Sem registro</span>
                            )}
                          </TableCell>
                          <TableCell className="space-x-1 whitespace-nowrap">
                            {isOverdue && (
                              <Button size="sm" variant="outline" onClick={() => openNewDonation(u.id, pledge ? Number(pledge.monthly_amount) : undefined)}>
                                <CheckCircle2 className="h-3 w-3 mr-1" /> Marcar pago
                              </Button>
                            )}
                            {!donation && (
                              <Button size="sm" variant="ghost" onClick={async () => {
                                const amount = pledge ? Number(pledge.monthly_amount) : 0;
                                const { error } = await supabase.from("donations" as any).upsert({
                                  user_id: u.id,
                                  amount,
                                  reference_month: month,
                                  status: "pending",
                                  paid_at: null,
                                  created_by: user?.id,
                                }, { onConflict: "user_id,reference_month" });
                                if (error) return toast.error(error.message);
                                toast.success("Inadimplência registrada"); load();
                              }}>
                                <AlertTriangle className="h-3 w-3 mr-1" /> Registrar inadimplência
                              </Button>
                            )}
                            {donation && (
                              <Button size="sm" variant="ghost" onClick={() => openEditDonation(donation)}>
                                <Pencil className="h-3 w-3" />
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    {profiles.length === 0 && (
                      <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-6">Nenhum usuário cadastrado.</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex-row items-center justify-between">
                <div>
                  <CardTitle>Padrinhos do projeto</CardTitle>
                  <p className="text-sm text-muted-foreground">Doadores com compromisso mensal ativo.</p>
                </div>
                <Button size="sm" onClick={() => { setPledgeForm({ user_id: "", monthly_amount: "", due_day: "10", active: true }); setPledgeOpen(true); }}>
                  <Plus className="h-4 w-4 mr-1" /> Adicionar padrinho
                </Button>
              </CardHeader>
              <CardContent className="p-0 overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Padrinho</TableHead>
                      <TableHead>Valor mensal</TableHead>
                      <TableHead>Dia venc.</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pledges.filter((p) => p.active).map((p) => (
                      <TableRow key={p.id}>
                        <TableCell>{p.full_name}</TableCell>
                        <TableCell className="font-bold">{fmtMoney(Number(p.monthly_amount))}</TableCell>
                        <TableCell>Dia {p.due_day}</TableCell>
                        <TableCell><span className="text-primary">Ativo</span></TableCell>
                        <TableCell>
                          <Button size="sm" variant="ghost" onClick={() => editPledge(p)}>
                            <Pencil className="h-3 w-3" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {pledges.filter((p) => p.active).length === 0 && (
                      <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-6">Nenhum padrinho ativo. Clique em "Adicionar padrinho" para começar.</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pledges">
            <Card>
              <CardHeader className="flex-row items-center justify-between">
                <CardTitle>Compromissos mensais</CardTitle>
                <Button size="sm" onClick={() => { setPledgeForm({ user_id: "", monthly_amount: "", due_day: "10", active: true }); setPledgeOpen(true); }}>
                  <Plus className="h-3 w-3 mr-1" /> Novo
                </Button>
              </CardHeader>
              <CardContent className="p-0 overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Voluntário</TableHead>
                      <TableHead>Valor mensal</TableHead>
                      <TableHead>Dia venc.</TableHead>
                      <TableHead>Ativo</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pledges.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell>{p.full_name}</TableCell>
                        <TableCell>{fmtMoney(Number(p.monthly_amount))}</TableCell>
                        <TableCell>{p.due_day}</TableCell>
                        <TableCell>{p.active ? "Sim" : "Não"}</TableCell>
                        <TableCell>
                          <Button size="sm" variant="ghost" onClick={() => editPledge(p)}>
                            <Pencil className="h-3 w-3" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {pledges.length === 0 && (
                      <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-6">Nenhum compromisso cadastrado.</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Dialog Pledge */}
        <Dialog open={pledgeOpen} onOpenChange={setPledgeOpen}>
          <DialogContent>
            <DialogHeader><DialogTitle>Compromisso mensal</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div>
                <Label>Voluntário</Label>
                <Select value={pledgeForm.user_id} onValueChange={(v) => setPledgeForm({ ...pledgeForm, user_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    {profiles.map((p) => <SelectItem key={p.id} value={p.id}>{p.full_name || "(sem nome)"}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Valor mensal (R$)</Label>
                  <Input type="number" step="0.01" value={pledgeForm.monthly_amount}
                    onChange={(e) => setPledgeForm({ ...pledgeForm, monthly_amount: e.target.value })} />
                </div>
                <div>
                  <Label>Dia do vencimento</Label>
                  <Input type="number" min={1} max={28} value={pledgeForm.due_day}
                    onChange={(e) => setPledgeForm({ ...pledgeForm, due_day: e.target.value })} />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  id="pl-active"
                  type="checkbox"
                  checked={pledgeForm.active}
                  onChange={(e) => setPledgeForm({ ...pledgeForm, active: e.target.checked })}
                />
                <Label htmlFor="pl-active">Ativo</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setPledgeOpen(false)}>Cancelar</Button>
              <Button onClick={submitPledge}>Salvar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog Donation */}
        <Dialog open={donOpen} onOpenChange={setDonOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{donEditing ? "Editar doação" : "Registrar doação"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <Label>Voluntário</Label>
                <Select value={donForm.user_id} onValueChange={(v) => setDonForm({ ...donForm, user_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    {profiles.map((p) => <SelectItem key={p.id} value={p.id}>{p.full_name || "(sem nome)"}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Valor (R$)</Label>
                  <Input type="number" step="0.01" value={donForm.amount}
                    onChange={(e) => setDonForm({ ...donForm, amount: e.target.value })} />
                </div>
                <div>
                  <Label>Mês de referência</Label>
                  <Select value={donForm.reference_month} onValueChange={(v) => setDonForm({ ...donForm, reference_month: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {months.map((m) => <SelectItem key={m} value={m}>{monthLabel(m)}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Status</Label>
                  <Select value={donForm.status} onValueChange={(v) => setDonForm({ ...donForm, status: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {STATUSES.map((s) => <SelectItem key={s} value={s}>{STATUS_LABEL[s]}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Pago em</Label>
                  <Input type="date" value={donForm.paid_at}
                    onChange={(e) => setDonForm({ ...donForm, paid_at: e.target.value })} />
                </div>
              </div>
              <div>
                <Label>Observações</Label>
                <Textarea value={donForm.notes} onChange={(e) => setDonForm({ ...donForm, notes: e.target.value })} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDonOpen(false)}>Cancelar</Button>
              <Button onClick={submitDonation}>Salvar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default AdminFinanceiro;
