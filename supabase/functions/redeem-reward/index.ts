// supabase/functions/redeem-reward/index.ts
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return json({ error: "Não autenticado" }, 401);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Cliente do usuário (para validar JWT)
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: userErr } = await userClient.auth.getUser();
    if (userErr || !user) return json({ error: "Sessão inválida" }, 401);

    const body = await req.json().catch(() => ({}));
    const rewardId = String(body?.rewardId || "");
    if (!rewardId || !/^[0-9a-f-]{36}$/i.test(rewardId)) {
      return json({ error: "Recompensa inválida" }, 400);
    }

    // Cliente admin (escrita segura)
    const admin = createClient(supabaseUrl, serviceKey);

    const [{ data: reward }, { data: profile }] = await Promise.all([
      admin.from("rewards").select("*").eq("id", rewardId).eq("active", true).maybeSingle(),
      admin.from("profiles").select("*").eq("id", user.id).maybeSingle(),
    ]);

    if (!reward) return json({ error: "Recompensa não encontrada" }, 404);
    if (!profile) return json({ error: "Perfil não encontrado" }, 404);
    if (profile.eco_points < reward.points_cost) {
      return json({ error: "EcoPontos insuficientes" }, 400);
    }
    if (reward.stock <= 0) {
      return json({ error: "Recompensa esgotada" }, 400);
    }

    // Registra a troca (estrutura preparada — desconto de pontos pode ser ativado depois)
    const { data: redemption, error: redErr } = await admin
      .from("redemptions")
      .insert({
        user_id: user.id,
        reward_id: reward.id,
        points_spent: reward.points_cost,
        status: "pending",
      })
      .select()
      .single();

    if (redErr) {
      console.error("Erro ao registrar troca:", redErr);
      return json({ error: "Falha ao registrar troca" }, 500);
    }

    // Envio de email (estrutura pronta) — registramos a intenção no log do servidor
    // Para envio real, configurar o domínio de email do projeto na Cloud.
    const emailPayload = {
      to: user.email,
      volunteerName: profile.full_name,
      rewardName: reward.name,
      pointsSpent: reward.points_cost,
      currentPoints: profile.eco_points,
      redemptionId: redemption.id,
    };
    console.log("📧 Email de troca pronto para envio:", emailPayload);

    return json({ success: true, redemption });
  } catch (e) {
    console.error("redeem-reward error:", e);
    return json({ error: "Erro inesperado" }, 500);
  }
});

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
