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
    if (!authHeader) return json({ error: "Não autenticado" }, 401);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

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
    if (reward.stock <= 0) return json({ error: "Recompensa esgotada" }, 400);

    // Registra a troca
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

    // Desconta pontos do perfil
    const newPoints = profile.eco_points - reward.points_cost;
    const { error: profErr } = await admin
      .from("profiles")
      .update({ eco_points: newPoints })
      .eq("id", user.id);
    if (profErr) {
      console.error("Erro ao descontar pontos:", profErr);
      // Reverte resgate
      await admin.from("redemptions").delete().eq("id", redemption.id);
      return json({ error: "Falha ao descontar pontos" }, 500);
    }

    // Decrementa estoque
    await admin
      .from("rewards")
      .update({ stock: Math.max(0, reward.stock - 1) })
      .eq("id", reward.id);

    // Histórico
    await admin.from("points_history").insert({
      user_id: user.id,
      amount: -reward.points_cost,
      reason: "Resgate de recompensa",
      action_name: reward.name,
      created_by: user.id,
    });

    console.log("📧 Resgate concluído:", {
      to: user.email,
      rewardName: reward.name,
      pointsSpent: reward.points_cost,
      remaining: newPoints,
    });

    return json({ success: true, redemption, eco_points: newPoints });
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
