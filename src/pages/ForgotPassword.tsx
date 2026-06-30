import { useState } from "react";
import { Link } from "react-router-dom";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LeafShape } from "@/components/LeafShape";
import { toast } from "sonner";
import { Leaf, ArrowLeft } from "lucide-react";

const schema = z.object({
  email: z.string().email("Email inválido").max(120),
});

const ForgotPassword = () => {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const parsed = schema.safeParse({ email: fd.get("email") });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setLoading(true);
    await supabase.auth.resetPasswordForEmail(parsed.data.email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    setSent(true);
    toast.success("Se o e-mail estiver cadastrado, enviaremos um link.");
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
              <h1 className="font-display text-3xl font-bold text-primary">Recuperar Senha</h1>
              <p className="text-sm text-muted-foreground mt-2">
                Informe seu e-mail cadastrado e enviaremos um link para redefinição de senha.
              </p>
            </div>

            {sent ? (
              <div className="space-y-4 text-center">
                <p className="text-sm text-foreground">
                  Se o e-mail informado estiver cadastrado, enviaremos um link para redefinição de senha.
                  Verifique também sua caixa de spam.
                </p>
                <Link to="/auth">
                  <Button variant="outline" className="w-full">
                    <ArrowLeft className="h-4 w-4" /> Voltar ao login
                  </Button>
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="email">Email cadastrado</Label>
                  <Input id="email" name="email" type="email" required autoComplete="email" />
                </div>
                <Button type="submit" variant="hero" className="w-full" disabled={loading}>
                  {loading ? "Enviando..." : "Enviar link de recuperação"}
                </Button>
                <Link to="/auth" className="block text-center text-sm text-accent hover:underline">
                  Voltar ao login
                </Link>
              </form>
            )}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default ForgotPassword;
