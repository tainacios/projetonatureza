import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";

interface Acceptance {
  id: string;
  user_id: string;
  signature_name: string;
  terms_version: string;
  accepted_at: string;
  full_name?: string;
}

const AdminTermos = () => {
  const [items, setItems] = useState<Acceptance[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("ecopoints_terms_acceptance")
        .select("*")
        .order("accepted_at", { ascending: false });
      if (!data) return;
      const ids = [...new Set(data.map((a) => a.user_id))];
      const { data: profs } = await supabase
        .from("profiles")
        .select("id, full_name")
        .in("id", ids);
      setItems(
        data.map((a) => ({
          ...a,
          full_name: profs?.find((p) => p.id === a.user_id)?.full_name,
        }))
      );
    })();
  }, []);

  const filtered = items.filter(
    (i) =>
      (i.full_name || "").toLowerCase().includes(search.toLowerCase()) ||
      i.signature_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold text-primary">Termos de Aceite</h1>
            <p className="text-muted-foreground">Voluntários que aceitaram o termo EcoPontos</p>
          </div>
          <Input
            placeholder="Buscar..."
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
                    <th className="p-3">Voluntário</th>
                    <th className="p-3">Assinatura digital</th>
                    <th className="p-3">Versão</th>
                    <th className="p-3">Data e hora</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((a) => (
                    <tr key={a.id} className="border-t border-border/50">
                      <td className="p-3 font-medium">{a.full_name || "—"}</td>
                      <td className="p-3 italic">{a.signature_name}</td>
                      <td className="p-3 text-muted-foreground">v{a.terms_version}</td>
                      <td className="p-3 text-muted-foreground">
                        {new Date(a.accepted_at).toLocaleString("pt-BR")}
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={4} className="p-6 text-center text-muted-foreground">
                        Nenhum aceite encontrado.
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

export default AdminTermos;
