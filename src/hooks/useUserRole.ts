import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type PermissionModule = "loja" | "galeria" | "depoimentos" | "acoes" | "ecopontos";

const EMPTY: Record<PermissionModule, boolean> = {
  loja: false,
  galeria: false,
  depoimentos: false,
  acoes: false,
  ecopontos: false,
};

export const useUserRole = () => {
  const { user, loading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isMasterAdmin, setIsMasterAdmin] = useState(false);
  const [permissions, setPermissions] = useState<Record<PermissionModule, boolean>>({ ...EMPTY });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setIsAdmin(false);
      setIsMasterAdmin(false);
      setPermissions({ ...EMPTY });
      setLoading(false);
      return;
    }
    let active = true;
    setLoading(true);
    (async () => {
      const [{ data: roles }, { data: perms }] = await Promise.all([
        supabase.from("user_roles").select("role").eq("user_id", user.id),
        supabase.from("admin_permissions").select("module, granted").eq("user_id", user.id),
      ]);
      if (!active) return;
      const roleNames = (roles ?? []).map((r: any) => r.role as string);
      const master = roleNames.includes("master_admin");
      const admin = master || roleNames.includes("admin");
      setIsMasterAdmin(master);
      setIsAdmin(admin);
      const next: Record<PermissionModule, boolean> = {
        loja: master,
        galeria: master,
        depoimentos: master,
        acoes: master,
        ecopontos: master,
      };
      (perms ?? []).forEach((p: any) => {
        if (p.module in next) next[p.module as PermissionModule] = !!p.granted || master;
      });
      setPermissions(next);
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [user, authLoading]);

  return { isAdmin, isMasterAdmin, permissions, loading: loading || authLoading };
};
