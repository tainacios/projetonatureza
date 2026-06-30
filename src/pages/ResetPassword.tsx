import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LeafShape } from "@/components/LeafShape";
import { toast } from "sonner";
import { Leaf } from "lucide-react";

const schema = z
  .object({
    password: z.string().min(8, "Mínimo 8 caracteres").max(72),
    confirm: z.string().min(8, "Mínimo 8 caracteres").max(72),
  })
  .refine((d) => d.password === d.confirm, {
    message: "As senhas não coincidem",
    path: ["confirm"],
  });

const ResetPassword = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Supabase coloca tokens no hash (#access_token=...&type=recovery)
    // O client detecta automaticamente; aguardamos sessão de recovery.
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") {
        setReady(true);
      }
    });
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const parsed = schema.safeParse({
      password: fd.get("password"),
      confirm: fd.get("confirm"),
    });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    await supabase.auth.signOut();
    toast.success("Senha redefinida com sucesso! Faça login novamente.");
    navigate("/auth");
  };

  return (
    <Layout>
      <section className="relative min-h-[80vh] flex items-center py-16 overflow-hidden">
        <LeafShape className="absolute -top-20 -left-20 w-96 text-secondary/30 animate-float" />
        <LeafShape className="absolute -bottom-20 -right-20 w-[420px] text-accent/15" color="hsl(var(--accent))" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-md mx-auto bg-card rounded-3xl shadow-leaf p-8 md:p-10">
            <div className="text-center mb-8">
              <div className="h-14 w-14 rounded-full bg-gradient-leaf mx-auto flex items-center justify-center shadow-soft mb-4">
                <Leaf className="h-6 w-6 text-primary-foreground" />
              </div>
              <h1 className="font-display text-3xl font-bold text-primary">Nova Senha</h1>
              <p className="text-sm text-muted-foreground mt-2">
                Defina uma nova senha para acessar sua conta
              </p>
            </div>

            {!ready ? (
              <p className="text-center text-sm text-muted-foreground">
                Validando link de recuperação...
              </p>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="password">Nova senha (mín. 8 caracteres)</Label>
                  <Input id="password" name="password" type="password" required minLength={8} autoComplete="new-password" />
                </div>
                <div>
                  <Label htmlFor="confirm">Confirmar nova senha</Label>
                  <Input id="confirm" name="confirm" type="password" required minLength={8} autoComplete="new-password" />
                </div>
                <Button type="submit" variant="hero" className="w-full" disabled={loading}>
                  {loading ? "Salvando..." : "Redefinir senha"}
                </Button>
              </form>
            )}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default ResetPassword;
