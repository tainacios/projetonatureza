import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useUserRole } from "@/hooks/useUserRole";
import { toast } from "sonner";
import { Navigate } from "react-router-dom";
import { Shield } from "lucide-react";

type Role = "admin" | "master_admin" | "volunteer";
type Module = "loja" | "galeria" | "depoimentos" | "acoes";
const MODULES: Module[] = ["loja", "galeria", "depoimentos", "acoes"];
const MODULE_LABELS: Record<Module, string> = {
  loja: "Loja/Pedidos",
  galeria: "Galeria",
  depoimentos: "Depoimentos",
  acoes: "Ações",
};

interface Row {
  user_id: string;
  full_name: string;
  role: Role;
  perms: Record<Module, boolean>;
}

const AdminPermissoes = () => {
  const { isMasterAdmin, loading: roleLoading } = useUserRole();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const [{ data: profiles }, { data: roles }, { data: perms }] = await Promise.all([
      supabase.from("profiles").select("id, full_name").order("full_name"),
      supabase.from("user_roles").select("user_id, role"),
      supabase.from("admin_permissions").select("user_id, module, granted"),
    ]);
    const roleMap = new Map<string, Role>();
    (roles ?? []).forEach((r: any) => {
      const existing = roleMap.get(r.user_id);
      // master_admin > admin > volunteer
      if (!existing || r.role === "master_admin" || (r.role === "admin" && existing === "volunteer")) {
        roleMap.set(r.user_id, r.role);
      }
    });
    const permMap = new Map<string, Record<Module, boolean>>();
    (perms ?? []).forEach((p: any) => {
      const cur = permMap.get(p.user_id) ?? { loja: false, galeria: false, depoimentos: false, acoes: false };
      cur[p.module as Module] = !!p.granted;
      permMap.set(p.user_id, cur);
    });
    const built: Row[] = (profiles ?? []).map((p: any) => ({
      user_id: p.id,
      full_name: p.full_name || "(sem nome)",
      role: roleMap.get(p.id) ?? "volunteer",
      perms: permMap.get(p.id) ?? { loja: false, galeria: false, depoimentos: false, acoes: false },
    }));
    setRows(built);
    setLoading(false);
  };

  useEffect(() => {
    if (!roleLoading && isMasterAdmin) load();
  }, [roleLoading, isMasterAdmin]);

  const changeRole = async (userId: string, newRole: Role) => {
    // Remove existing roles, insert new one (volunteer = no row needed but keep simple)
    const { error: delErr } = await supabase.from("user_roles").delete().eq("user_id", userId);
    if (delErr) {
      toast.error("Erro ao remover cargo anterior: " + delErr.message);
      return;
    }
    const { error: insErr } = await supabase
      .from("user_roles")
      .insert({ user_id: userId, role: newRole });
    if (insErr) {
      toast.error("Erro ao definir cargo: " + insErr.message);
      return;
    }
    if (newRole === "volunteer") {
      // Remove todas as permissões granulares ao rebaixar para voluntário
      const { error: permErr } = await supabase
        .from("admin_permissions")
        .delete()
        .eq("user_id", userId);
      if (permErr) {
        toast.error("Erro ao limpar permissões: " + permErr.message);
        return;
      }
    } else if (newRole === "admin") {
      // Concede todas as permissões de módulo por padrão ao promover a admin
      const rows = MODULES.map((m) => ({ user_id: userId, module: m, granted: true }));
      const { error: permErr } = await supabase
        .from("admin_permissions")
        .upsert(rows, { onConflict: "user_id,module" });
      if (permErr) {
        toast.error("Erro ao conceder permissões: " + permErr.message);
        return;
      }
    }
    toast.success("Cargo atualizado");
    load();
  };

  const togglePerm = async (userId: string, module: Module, granted: boolean) => {
    const { error } = await supabase
      .from("admin_permissions")
      .upsert({ user_id: userId, module, granted }, { onConflict: "user_id,module" });
    if (error) {
      toast.error("Erro ao salvar permissão: " + error.message);
      return;
    }
    setRows((r) =>
      r.map((row) =>
        row.user_id === userId ? { ...row, perms: { ...row.perms, [module]: granted } } : row,
      ),
    );
  };

  if (roleLoading) {
    return (
      <AdminLayout>
        <div className="text-muted-foreground">Carregando...</div>
      </AdminLayout>
    );
  }
  if (!isMasterAdmin) return <Navigate to="/admin" replace />;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-gradient-leaf flex items-center justify-center">
            <Shield className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-primary">Gestão de Permissões</h1>
            <p className="text-sm text-muted-foreground">
              Defina cargos e permissões por módulo. Master Admin tem acesso total.
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Usuários ({rows.length})</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            {loading ? (
              <p className="text-muted-foreground">Carregando...</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuário</TableHead>
                    <TableHead className="w-[180px]">Cargo</TableHead>
                    {MODULES.map((m) => (
                      <TableHead key={m} className="text-center">
                        {MODULE_LABELS[m]}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((r) => {
                    const isMaster = r.role === "master_admin";
                    const isAdmin = r.role === "admin" || isMaster;
                    return (
                      <TableRow key={r.user_id}>
                        <TableCell className="font-medium">{r.full_name}</TableCell>
                        <TableCell>
                          <Select
                            value={r.role}
                            onValueChange={(v) => changeRole(r.user_id, v as Role)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="volunteer">Voluntário</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                              <SelectItem value="master_admin">Master Admin</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        {MODULES.map((m) => (
                          <TableCell key={m} className="text-center">
                            <Checkbox
                              checked={isMaster ? true : r.perms[m]}
                              disabled={!isAdmin || isMaster}
                              onCheckedChange={(v) => togglePerm(r.user_id, m, !!v)}
                            />
                          </TableCell>
                        ))}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminPermissoes;
