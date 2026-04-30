import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface TermsAcceptance {
  id: string;
  signature_name: string;
  terms_version: string;
  accepted_at: string;
  accepted: boolean;
}

const TERMS_VERSION = "1.0";

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
    const { data, error } = await supabase
      .from("ecopoints_terms_acceptance")
      .select("*")
      .eq("user_id", user.id)
      .eq("terms_version", TERMS_VERSION)
      .eq("accepted", true)
      .maybeSingle();
    if (error) {
      console.error("Erro ao verificar aceite do termo EcoPontos:", error);
    }
    setAcceptance((data as TermsAcceptance) ?? null);
    setLoading(false);
  };

  useEffect(() => {
    if (authLoading) return;
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, authLoading]);

  return { acceptance, hasAccepted: acceptance?.accepted === true, loading: authLoading || loading, refresh };
};
