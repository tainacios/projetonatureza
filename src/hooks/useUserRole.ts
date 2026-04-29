import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export const useUserRole = () => {
  const { user, loading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setIsAdmin(false);
      setLoading(false);
      return;
    }
    let active = true;
    setLoading(true);
    (async () => {
      // Try RPC first (most reliable, bypasses RLS via SECURITY DEFINER)
      const { data: rpcData, error: rpcError } = await supabase.rpc("has_role", {
        _user_id: user.id,
        _role: "admin",
      });
      if (active && !rpcError && typeof rpcData === "boolean") {
        setIsAdmin(rpcData);
        setLoading(false);
        return;
      }
      // Fallback: direct table query
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();
      if (active) {
        setIsAdmin(!!data);
        setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [user, authLoading]);

  return { isAdmin, loading: loading || authLoading };
};
