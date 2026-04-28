import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface TermsAcceptance {
  id: string;
  signature_name: string;
  terms_version: string;
  accepted_at: string;
}

export const useTermsAcceptance = () => {
  const { user, loading: authLoading } = useAuth();
  const [acceptance, setAcceptance] = useState<TermsAcceptance | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    if (!user) {
      setAcceptance(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data } = await supabase
      .from("ecopoints_terms_acceptance")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();
    setAcceptance((data as TermsAcceptance) ?? null);
    setLoading(false);
  };

  useEffect(() => {
    if (authLoading) return;
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, authLoading]);

  return { acceptance, hasAccepted: !!acceptance, loading: authLoading || loading, refresh };
};
