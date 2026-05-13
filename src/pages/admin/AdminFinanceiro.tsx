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
import { Plus, Wallet, AlertTriangle, CheckCircle2, Pencil, Trash2, ArrowDownCircle, ArrowUpCircle } from "lucide-react";

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
interface TreasuryTx {
  id: string; kind: "income" | "expense"; amount: number;
  category: string; description: string | null; occurred_at: string;
}

const STATUSES = ["pending", "paid", "overdue", "cancelled"] as const;
const STATUS_LABEL: Record<string, string> = {
  pending: "Pendente", paid: "Pago", overdue: "Inadimplente", cancelled: "Cancelado",
};

const monthKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
const monthLabel = (s: string) => {
  const d = new Date(s);
  return d.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
};
const fmtMoney = (n: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(n) || 0);

const statusClass = (s: string) =>
  s === "paid" ? "text-primary font-semibold" :
  s === "overdue" ? "text-destructive font-semibold" :
  s === "cancelled" ? "text-muted-foreground" :
  "text-amber-600 font-semibold";

const AdminFinanceiro = () => {
  const { user } = useAuth();
  const { permissions, loading: roleLoading } = useUserRole();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [pledges, setPledges] = useState<Pledge[]>([]);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [treasury, setTreasury] = useState<TreasuryTx[]>([]);
  const [month, setMonth] = useState<string>(monthKey(new Date()));

  const [pledgeOpen, setPledgeOpen] = useState(false);
  const [pledgeForm, setPledgeForm] = useState({ user_id: "", monthly_amount: "", due_day: "10", active: true });

  const [donOpen, setDonOpen] = useState(false);
  const [donEditing, setDonEditing] = useState<Donation | null>(null);
  const [donForm, setDonForm] = useState({
    user_id: "", amount: "", reference_month: monthKey(new Date()),
    status: "pending", paid_at: "", notes: "",
  });

  const [txOpen, setTxOpen] = useState(false);
  const [txEditing, setTxEditing] = useState<TreasuryTx | null>(null);
  const [txForm, setTxForm] = useState({
    kind: "income" as "income" | "expense",
    amount: "", category: "geral", description: "",
    occurred_at: new Date().toISOString().slice(0, 10),
  });

  const [historyPledge, setHistoryPledge] = useState<Pledge | null>(null);

  const load = async () => {
    const [{ data: p }, { data: pl }, { data: dn }, { data: tx }] = await Promise.all([
      supabase.from("profiles").select("id, full_name").order("full_name"),
      supabase.from("donor_pledges" as any).select("*"),
      supabase.from("donations" as any).select("*").order("reference_month", { ascending: false }),
      supabase.from("treasury_transactions" as any).select("*").order("occurred_at", { ascending: false }),
    ]);
    setProfiles((p as Profile[]) ?? []);
    const map = new Map((p ?? []).map((x: any) => [x.id, x.full_name]));
    setPledges(((pl as any) ?? []).map((x: any) => ({ ...x, full_name: map.get(x.user_id) })));
    setDonations(((dn as any) ?? []).map((x: any) => ({ ...x, full_name: map.get(x.user_id) })));
    setTreasury((tx as any) ?? []);
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

  // Status do mês para o usuário (considera vencimento)
  const monthIsCurrentOrPast = (() => {
    const now = new Date();
    const ref = new Date(month);
    return ref.getFullYear() < now.getFullYear() ||
      (ref.getFullYear() === now.getFullYear() && ref.getMonth() <= now.getMonth());
  })();
  const today = new Date();

  const computeUserStatus = (userId: string) => {
    const donation = monthDonations.find((d) => d.user_id === userId);
    const pledge = pledges.find((p) => p.user_id === userId && p.active);
    if (donation) return { donation, pledge, status: donation.status };
    // Sem registro: se mês passou ou está vencido neste mês, marca como overdue
    const ref = new Date(month);
    const isPastMonth = ref.getFullYear() < today.getFullYear() ||
      (ref.getFullYear() === today.getFullYear() && ref.getMonth() < today.getMonth());
    const dueDay = pledge?.due_day ?? 10;
    const isOverdueThisMonth =
      ref.getFullYear() === today.getFullYear() &&
      ref.getMonth() === today.getMonth() &&
      today.getDate() > dueDay;
    const status = (isPastMonth || isOverdueThisMonth) && pledge ? "overdue" : "pending";
    return { donation: null as Donation | null, pledge, status };
  };

  const overdueCount = useMemo(
    () => profiles.filter((u) => computeUserStatus(u.id).status === "overdue").length,
    [profiles, monthDonations, pledges, month]
  );

  // Tesouraria — totais filtrados pelo mês selecionado
  const monthTreasury = useMemo(
    () => treasury.filter((t) => t.occurred_at.startsWith(month.slice(0, 7))),
    [treasury, month]
  );
  const treasuryIncome = monthTreasury.filter((t) => t.kind === "income").reduce((s, t) => s + Number(t.amount), 0);
  const treasuryExpense = monthTreasury.filter((t) => t.kind === "expense").reduce((s, t) => s + Number(t.amount), 0);
  const treasuryBalance = treasuryIncome - treasuryExpense;

  const submitPledge = async () => {
    if (!pledgeForm.user_id || !pledgeForm.monthly_amount) return toast.error("Preencha doador e valor");
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

  const openNewDonation = (userId?: string, amount?: number, status: string = "paid") => {
    setDonEditing(null);
    setDonForm({
      user_id: userId ?? "",
      amount: amount ? String(amount) : "",
      reference_month: month,
      status,
      paid_at: status === "paid" ? new Date().toISOString().slice(0, 10) : "",
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
      return toast.error("Preencha doador, valor e mês");
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

  const openNewTx = (kind: "income" | "expense") => {
    setTxEditing(null);
    setTxForm({
      kind, amount: "", category: "geral", description: "",
      occurred_at: new Date().toISOString().slice(0, 10),
    });
    setTxOpen(true);
  };
  const openEditTx = (t: TreasuryTx) => {
    setTxEditing(t);
    setTxForm({
      kind: t.kind,
      amount: String(t.amount),
      category: t.category,
      description: t.description || "",
      occurred_at: t.occurred_at.slice(0, 10),
    });
    setTxOpen(true);
  };
  const submitTx = async () => {
    if (!txForm.amount || Number(txForm.amount) <= 0) return toast.error("Informe um valor válido");
    const payload: any = {
      kind: txForm.kind,
      amount: Number(txForm.amount),
      category: txForm.category || "geral",
      description: txForm.description || null,
      occurred_at: txForm.occurred_at,
    };
    if (txEditing) {
      const { error } = await supabase.from("treasury_transactions" as any).update(payload).eq("id", txEditing.id);
      if (error) return toast.error(error.message);
    } else {
      payload.created_by = user?.id;
      const { error } = await supabase.from("treasury_transactions" as any).insert(payload);
      if (error) return toast.error(error.message);
    }
    toast.success("Lançamento salvo");
    setTxOpen(false); load();
  };
  const deleteTx = async (id: string) => {
    if (!confirm("Excluir este lançamento?")) return;
    const { error } = await supabase.from("treasury_transactions" as any).delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Lançamento excluído"); load();
  };

  if (roleLoading) {
    return <AdminLayout><div className="text-muted-foreground">Carregando...</div></AdminLayout>;
  }
  if (!permissions.financeiro) return <Navigate to="/admin" replace />;

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
            <p className="text-muted-foreground">Doadores, transações e tesouraria</p>
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
          </div>
        </div>

        <div className="grid sm:grid-cols-4 gap-4">
          <Card><CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Recebido (doações)</div>
            <div className="text-2xl font-bold text-primary">{fmtMoney(totalMonth)}</div>
          </CardContent></Card>
          <Card><CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Esperado (compromissos)</div>
            <div className="text-2xl font-bold">{fmtMoney(expectedMonth)}</div>
          </CardContent></Card>
          <Card><CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Inadimplentes</div>
            <div className="text-2xl font-bold text-destructive">{overdueCount}</div>
          </CardContent></Card>
          <Card><CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Saldo de caixa (mês)</div>
            <div className={`text-2xl font-bold ${treasuryBalance >= 0 ? "text-primary" : "text-destructive"}`}>
              {fmtMoney(treasuryBalance)}
            </div>
          </CardContent></Card>
        </div>

        <Tabs defaultValue="doadores">
          <TabsList>
            <TabsTrigger value="doadores">Doadores</TabsTrigger>
            <TabsTrigger value="historico">Histórico de transações</TabsTrigger>
            <TabsTrigger value="tesouraria">Tesouraria</TabsTrigger>
            <TabsTrigger value="pledges">Compromissos</TabsTrigger>
          </TabsList>

          {/* DOADORES */}
          <TabsContent value="doadores" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary">
                  <Wallet className="h-5 w-5" /> Doadores em {monthLabel(month)}
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
                      const { donation, pledge, status } = computeUserStatus(u.id);
                      return (
                        <TableRow key={u.id}>
                          <TableCell>{u.full_name || "(sem nome)"}</TableCell>
                          <TableCell>
                            {pledge
                              ? <span>{fmtMoney(Number(pledge.monthly_amount))} · dia {pledge.due_day}</span>
                              : <span className="text-muted-foreground text-xs">Sem compromisso</span>}
                          </TableCell>
                          <TableCell>
                            <span className={statusClass(status)}>{STATUS_LABEL[status]}</span>
                          </TableCell>
                          <TableCell className="space-x-1 whitespace-nowrap">
                            {status !== "paid" && (
                              <Button size="sm" variant="outline" onClick={() => openNewDonation(u.id, pledge ? Number(pledge.monthly_amount) : undefined, "paid")}>
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
                                  status: "overdue",
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

          {/* HISTÓRICO DE TRANSAÇÕES (DOAÇÕES) */}
          <TabsContent value="historico">
            <Card>
              <CardHeader className="flex-row items-center justify-between">
                <div>
                  <CardTitle>Histórico de transações</CardTitle>
                  <p className="text-sm text-muted-foreground">Doações registradas em {monthLabel(month)}.</p>
                </div>
                <Button onClick={() => openNewDonation()}>
                  <Plus className="h-4 w-4 mr-2" /> Registrar doação
                </Button>
              </CardHeader>
              <CardContent className="p-0 overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Doador</TableHead>
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
                        <TableCell><span className={statusClass(d.status)}>{STATUS_LABEL[d.status]}</span></TableCell>
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
                      <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-6">Sem transações neste mês.</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TESOURARIA */}
          <TabsContent value="tesouraria">
            <div className="grid sm:grid-cols-3 gap-4 mb-4">
              <Card><CardContent className="p-4">
                <div className="text-sm text-muted-foreground">Entradas no mês</div>
                <div className="text-2xl font-bold text-primary">{fmtMoney(treasuryIncome)}</div>
              </CardContent></Card>
              <Card><CardContent className="p-4">
                <div className="text-sm text-muted-foreground">Saídas no mês</div>
                <div className="text-2xl font-bold text-destructive">{fmtMoney(treasuryExpense)}</div>
              </CardContent></Card>
              <Card><CardContent className="p-4">
                <div className="text-sm text-muted-foreground">Saldo do mês</div>
                <div className={`text-2xl font-bold ${treasuryBalance >= 0 ? "text-primary" : "text-destructive"}`}>
                  {fmtMoney(treasuryBalance)}
                </div>
              </CardContent></Card>
            </div>
            <Card>
              <CardHeader className="flex-row items-center justify-between">
                <div>
                  <CardTitle>Tesouraria do projeto</CardTitle>
                  <p className="text-sm text-muted-foreground">Controle de entradas e saídas do caixa.</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => openNewTx("income")}>
                    <ArrowDownCircle className="h-4 w-4 mr-1" /> Nova entrada
                  </Button>
                  <Button variant="outline" onClick={() => openNewTx("expense")}>
                    <ArrowUpCircle className="h-4 w-4 mr-1" /> Nova saída
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0 overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {monthTreasury.map((t) => (
                      <TableRow key={t.id}>
                        <TableCell>{new Date(t.occurred_at).toLocaleDateString("pt-BR")}</TableCell>
                        <TableCell>
                          <span className={t.kind === "income" ? "text-primary font-semibold" : "text-destructive font-semibold"}>
                            {t.kind === "income" ? "Entrada" : "Saída"}
                          </span>
                        </TableCell>
                        <TableCell className="capitalize">{t.category}</TableCell>
                        <TableCell className="text-muted-foreground text-xs">{t.description || ""}</TableCell>
                        <TableCell className={`font-bold ${t.kind === "income" ? "text-primary" : "text-destructive"}`}>
                          {t.kind === "income" ? "+" : "−"} {fmtMoney(Number(t.amount))}
                        </TableCell>
                        <TableCell className="space-x-1 whitespace-nowrap">
                          <Button size="sm" variant="ghost" onClick={() => openEditTx(t)}>
                            <Pencil className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => deleteTx(t.id)}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {monthTreasury.length === 0 && (
                      <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-6">Sem lançamentos neste mês.</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* COMPROMISSOS */}
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
                      <TableHead>Doador</TableHead>
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
                <Label>Doador</Label>
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
                <Label>Doador</Label>
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

        {/* Dialog Treasury */}
        <Dialog open={txOpen} onOpenChange={setTxOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{txEditing ? "Editar lançamento" : (txForm.kind === "income" ? "Nova entrada" : "Nova saída")}</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Tipo</Label>
                  <Select value={txForm.kind} onValueChange={(v: "income" | "expense") => setTxForm({ ...txForm, kind: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="income">Entrada</SelectItem>
                      <SelectItem value="expense">Saída</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Data</Label>
                  <Input type="date" value={txForm.occurred_at}
                    onChange={(e) => setTxForm({ ...txForm, occurred_at: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Valor (R$)</Label>
                  <Input type="number" step="0.01" value={txForm.amount}
                    onChange={(e) => setTxForm({ ...txForm, amount: e.target.value })} />
                </div>
                <div>
                  <Label>Categoria</Label>
                  <Input value={txForm.category}
                    onChange={(e) => setTxForm({ ...txForm, category: e.target.value })}
                    placeholder="Ex: doação, material, transporte" />
                </div>
              </div>
              <div>
                <Label>Descrição</Label>
                <Textarea value={txForm.description}
                  onChange={(e) => setTxForm({ ...txForm, description: e.target.value })} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setTxOpen(false)}>Cancelar</Button>
              <Button onClick={submitTx}>Salvar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default AdminFinanceiro;
