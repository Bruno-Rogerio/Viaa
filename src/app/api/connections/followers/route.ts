// src/app/api/connections/followers/route.ts
// API para listar seguidores de um usuário

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  console.log("👥 GET /api/connections/followers");

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

    console.log("📝 Listando seguidores de:", userId);

    // Primeiro buscar as conexões
    const {
      data: connections,
      error: connectionsError,
      count,
    } = await supabase
      .from("connections")
      .select("follower_id, created_at", { count: "exact" })
      .eq("following_id", userId)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (connectionsError || !connections) {
      console.error("❌ Erro ao buscar conexões:", connectionsError);
      return NextResponse.json(
        { success: false, error: "Erro ao buscar seguidores" },
        { status: 500 }
      );
    }

    // Buscar perfis dos seguidores
    const followerIds = connections.map((c) => c.follower_id);

    // Buscar perfis profissionais
    const { data: professionals } = await supabase
      .from("perfis_profissionais")
      .select(
        "id, user_id, nome, sobrenome, foto_perfil_url, especialidades, verificado"
      )
      .in("user_id", followerIds);

    // Buscar perfis pacientes
    const { data: patients } = await supabase
      .from("perfis_pacientes")
      .select("id, user_id, nome, sobrenome, foto_perfil_url, bio_pessoal")
      .in("user_id", followerIds);

    // Combinar dados
    const followers = connections
      .map((conn) => {
        const professional = professionals?.find(
          (p) => p.user_id === conn.follower_id
        );
        const patient = patients?.find((p) => p.user_id === conn.follower_id);
        const profile = professional || patient;

        if (!profile) return null;

        return {
          id: conn.follower_id,
          user_id: profile.user_id,
          nome: profile.nome,
          sobrenome: profile.sobrenome,
          foto_perfil_url: profile.foto_perfil_url,
          tipo: professional ? "profissional" : "paciente",
          especialidades: professional?.especialidades,
          verificado: professional?.verificado || false,
          bio: patient?.bio_pessoal,
          followed_at: conn.created_at,
        };
      })
      .filter(Boolean);

    console.log(`✅ ${followers.length} seguidores encontrados`);

    return NextResponse.json({
      success: true,
      followers,
      total: count || 0,
      count: followers.length,
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
