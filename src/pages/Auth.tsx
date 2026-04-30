import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LeafShape } from "@/components/LeafShape";
import { toast } from "sonner";
import { Leaf } from "lucide-react";

const signUpSchema = z.object({
  fullName: z.string().min(2, "Informe seu nome").max(80),
  email: z.string().email("Email inválido").max(120),
  password: z.string().min(8, "Mínimo 8 caracteres").max(72),
});
const signInSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "Informe sua senha"),
});

const TERMS_VERSION = "1.0";

const Auth = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const parsed = signUpSchema.safeParse({
      fullName: fd.get("fullName"),
      email: fd.get("email"),
      password: fd.get("password"),
    });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        emailRedirectTo: window.location.origin,
        data: { full_name: parsed.data.fullName },
      },
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Bem-vindo(a) à rede! 🌱");
    navigate("/dashboard");
  };

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const parsed = signInSchema.safeParse({ email: fd.get("email"), password: fd.get("password") });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setLoading(true);
    const { data: signInData, error } = await supabase.auth.signInWithPassword({
      email: parsed.data.email,
      password: parsed.data.password,
    });
    if (error || !signInData.user) {
      setLoading(false);
      toast.error("Email ou senha inválidos");
      return;
    }
    const [{ data: isAdmin, error: roleError }, { data: termsAccepted, error: termsError }] =
      await Promise.all([
        supabase.rpc("has_role", {
          _user_id: signInData.user.id,
          _role: "admin",
        }),
        supabase.rpc("has_accepted_ecopoints_terms", {
          _terms_version: TERMS_VERSION,
        }),
      ]);
    if (roleError) console.error("Erro ao verificar perfil admin:", roleError);
    if (termsError) console.error("Erro ao verificar aceite do termo:", termsError);
    setLoading(false);
    toast.success("Que bom te ver de novo!");
    navigate(isAdmin ? "/admin" : termsAccepted ? "/dashboard" : "/termo-ecopontos");
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
              <h1 className="font-display text-3xl font-bold text-primary">Área do Voluntário</h1>
              <p className="text-sm text-muted-foreground mt-2">Acesse seus EcoPontos e recompensas</p>
            </div>

            <Tabs defaultValue="signin">
              <TabsList className="grid grid-cols-2 w-full mb-6">
                <TabsTrigger value="signin">Entrar</TabsTrigger>
                <TabsTrigger value="signup">Cadastrar</TabsTrigger>
              </TabsList>

              <TabsContent value="signin">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div>
                    <Label htmlFor="signin-email">Email</Label>
                    <Input id="signin-email" name="email" type="email" required autoComplete="email" />
                  </div>
                  <div>
                    <Label htmlFor="signin-pass">Senha</Label>
                    <Input id="signin-pass" name="password" type="password" required autoComplete="current-password" />
                  </div>
                  <Button type="submit" variant="hero" className="w-full" disabled={loading}>
                    {loading ? "Entrando..." : "Entrar na minha área"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div>
                    <Label htmlFor="signup-name">Nome completo</Label>
                    <Input id="signup-name" name="fullName" required />
                  </div>
                  <div>
                    <Label htmlFor="signup-email">Email</Label>
                    <Input id="signup-email" name="email" type="email" required autoComplete="email" />
                  </div>
                  <div>
                    <Label htmlFor="signup-pass">Senha (mín. 8 caracteres)</Label>
                    <Input id="signup-pass" name="password" type="password" required autoComplete="new-password" minLength={8} />
                  </div>
                  <Button type="submit" variant="hero" className="w-full" disabled={loading}>
                    {loading ? "Criando..." : "Sou voluntário 🌱"}
                  </Button>
                  <p className="text-xs text-center text-muted-foreground">
                    Você ganha <strong className="text-accent">100 EcoPontos</strong> de boas-vindas.
                  </p>
                </form>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Auth;
