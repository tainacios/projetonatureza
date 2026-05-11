import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { AlertTriangle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface OverdueInfo {
  monthsOverdue: number;
  totalDue: number;
  dueDay: number;
}

const monthKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;

export const OverdueDonationsBanner = () => {
  const { user } = useAuth();
  const [info, setInfo] = useState<OverdueInfo | null>(null);
  const [closed, setClosed] = useState(false);

  useEffect(() => {
    if (!user) { setInfo(null); return; }
    (async () => {
      const { data: pledge } = await supabase
        .from("donor_pledges" as any)
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      if (!pledge || !(pledge as any).active) return;

      const now = new Date();
      const today = now.getDate();
      const dueDay = (pledge as any).due_day;
      const monthlyAmount = Number((pledge as any).monthly_amount);

      const { data: donations } = await supabase
        .from("donations" as any)
        .select("reference_month, status")
        .eq("user_id", user.id);

      const paidMonths = new Set(
        ((donations as any) ?? [])
          .filter((d: any) => d.status === "paid")
          .map((d: any) => d.reference_month.slice(0, 7))
      );

      // Verifica meses anteriores não pagos (até 12 meses atrás)
      const unpaid: string[] = [];
      for (let i = 1; i <= 12; i++) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        if (!paidMonths.has(key)) unpaid.push(key);
        else break; // para no primeiro pago
      }
      // Mês atual: só conta como inadimplente se já passou o vencimento
      const currentKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
      if (!paidMonths.has(currentKey) && today > dueDay) {
        unpaid.unshift(currentKey);
      }

      if (unpaid.length === 0) return;
      setInfo({
        monthsOverdue: unpaid.length,
        totalDue: monthlyAmount * unpaid.length,
        dueDay,
      });
    })();
  }, [user]);

  if (!info || closed) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm rounded-2xl border border-destructive/40 bg-card shadow-leaf p-4 animate-fade-in">
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
        <div className="space-y-2">
          <div className="font-semibold text-destructive">
            Doação em atraso
          </div>
          <p className="text-sm text-foreground/80">
            Você está com <strong>{info.monthsOverdue}</strong> {info.monthsOverdue === 1 ? "mês" : "meses"} em
            atraso (vencimento dia {info.dueDay}). Total devido:{" "}
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
