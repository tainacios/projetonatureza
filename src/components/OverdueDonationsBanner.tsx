import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { AlertTriangle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface OverdueInfo {
  monthsOverdue: number;
  totalDue: number;
  dueDay: number | null;
}

export const OverdueDonationsBanner = () => {
  const { user } = useAuth();
  const [info, setInfo] = useState<OverdueInfo | null>(null);
  const [closed, setClosed] = useState(false);

  useEffect(() => {
    if (!user) { setInfo(null); return; }
    (async () => {
      const [{ data: pledge }, { data: donations }] = await Promise.all([
        supabase.from("donor_pledges" as any).select("*").eq("user_id", user.id).maybeSingle(),
        supabase.from("donations" as any).select("reference_month, status, amount").eq("user_id", user.id),
      ]);

      const now = new Date();
      const today = now.getDate();
      const currentKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

      // 1) Doações já registradas como pending/overdue contam direto
      const recordedUnpaid = ((donations as any) ?? []).filter(
        (d: any) => d.status === "pending" || d.status === "overdue"
      );
      const recordedTotal = recordedUnpaid.reduce((s: number, d: any) => s + Number(d.amount || 0), 0);

      let unpaidMonths = recordedUnpaid.length;
      let totalDue = recordedTotal;
      const dueDay = pledge && (pledge as any).active ? (pledge as any).due_day : null;

      // 2) Se tem compromisso ativo, projeta inadimplências de meses não pagos
      if (pledge && (pledge as any).active) {
        const monthlyAmount = Number((pledge as any).monthly_amount);
        const paidMonths = new Set(
          ((donations as any) ?? [])
            .filter((d: any) => d.status === "paid")
            .map((d: any) => d.reference_month.slice(0, 7))
        );
        const recordedKeys = new Set(
          recordedUnpaid.map((d: any) => d.reference_month.slice(0, 7))
        );
        // Meses anteriores não pagos (até 12)
        for (let i = 1; i <= 12; i++) {
          const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
          if (paidMonths.has(key)) break;
          if (!recordedKeys.has(key)) {
            unpaidMonths += 1;
            totalDue += monthlyAmount;
          }
        }
        // Mês atual já vencido
        if (!paidMonths.has(currentKey) && !recordedKeys.has(currentKey) && today > (dueDay ?? 10)) {
          unpaidMonths += 1;
          totalDue += monthlyAmount;
        }
      }

      if (unpaidMonths === 0) return;
      setInfo({ monthsOverdue: unpaidMonths, totalDue, dueDay });
    })();
  }, [user]);

  if (!info || closed) return null;

  return (
    <div className="fixed top-20 right-4 z-50 max-w-sm rounded-2xl border border-destructive/40 bg-card shadow-leaf p-4 animate-fade-in">
      <button
        onClick={() => setClosed(true)}
        className="absolute top-2 right-2 text-muted-foreground hover:text-foreground"
        aria-label="Fechar"
      >
        <X className="h-4 w-4" />
      </button>
      <div className="flex gap-3">
        <div className="h-10 w-10 rounded-full bg-destructive/15 flex items-center justify-center shrink-0">
          <AlertTriangle className="h-5 w-5 text-destructive" />
        </div>
        <div className="space-y-2 pr-4">
          <div className="font-semibold text-destructive">
            Doação em atraso
          </div>
          <p className="text-sm text-foreground/80">
            Você está com <strong>{info.monthsOverdue}</strong> {info.monthsOverdue === 1 ? "mês" : "meses"} em atraso
            {info.dueDay ? <> (vencimento dia {info.dueDay})</> : null}. Total devido:{" "}
            <strong>
              {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(info.totalDue)}
            </strong>.
          </p>
          <Button asChild size="sm" variant="outline">
            <Link to="/apadrinhe">Quero regularizar</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};
