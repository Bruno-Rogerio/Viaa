// src/app/api/connections/following/route.ts
// API para listar quem o usuário está seguindo

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  console.log("👥 GET /api/connections/following");

  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("user_id");
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "user_id é obrigatório" },
        { status: 400 }
      );
    }

    console.log("📝 Listando quem o usuário segue:", userId);

    // Primeiro buscar as conexões
    const {
      data: connections,
      error: connectionsError,
      count,
    } = await supabase
      .from("connections")
      .select("following_id, created_at", { count: "exact" })
      .eq("follower_id", userId)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (connectionsError || !connections) {
      console.error("❌ Erro ao buscar conexões:", connectionsError);
      return NextResponse.json(
        { success: false, error: "Erro ao buscar seguindo" },
        { status: 500 }
      );
    }

    // Buscar perfis que está seguindo
    const followingIds = connections.map((c) => c.following_id);

    // Buscar perfis profissionais
    const { data: professionals } = await supabase
      .from("perfis_profissionais")
      .select(
        "id, user_id, nome, sobrenome, foto_perfil_url, especialidades, verificado, bio_profissional"
      )
      .in("user_id", followingIds);

    // Buscar perfis pacientes
    const { data: patients } = await supabase
      .from("perfis_pacientes")
      .select("id, user_id, nome, sobrenome, foto_perfil_url, bio_pessoal")
      .in("user_id", followingIds);

    // Combinar dados
    const following = connections
      .map((conn) => {
        const professional = professionals?.find(
          (p) => p.user_id === conn.following_id
        );
        const patient = patients?.find((p) => p.user_id === conn.following_id);
        const profile = professional || patient;

        if (!profile) return null;

        return {
          id: conn.following_id,
          user_id: profile.user_id,
          nome: profile.nome,
          sobrenome: profile.sobrenome,
          foto_perfil_url: profile.foto_perfil_url,
          tipo: professional ? "profissional" : "paciente",
          especialidades: professional?.especialidades,
          verificado: professional?.verificado || false,
          bio: professional?.bio_profissional || patient?.bio_pessoal,
          followed_at: conn.created_at,
        };
      })
      .filter(Boolean);

    console.log(`✅ Seguindo ${following.length} usuários`);

    return NextResponse.json({
      success: true,
      following,
      total: count || 0,
      count: following.length,
      limit,
      offset,
    });
  } catch (error: any) {
    console.error("💥 Erro:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
