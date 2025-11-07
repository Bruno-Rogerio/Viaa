// src/app/api/connections/following/route.ts
// 👥 API de Conexões - Listar seguindo

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  console.log("📋 GET /api/connections/following");

  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("user_id");
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = parseInt(searchParams.get("offset") || "0");

    if (!userId) {
      return NextResponse.json(
        {
          error: "user_id é obrigatório",
          following: [],
          total: 0,
          count: 0,
          limit,
          offset,
        },
        { status: 400 }
      );
    }

    console.log(`📝 Listando quem ${userId} está seguindo`);

    // Buscar conexões onde o usuário é seguidor
    const {
      data: connections,
      error: connectionsError,
      count,
    } = await supabase
      .from("connections")
      .select("following_id", { count: "exact" })
      .eq("follower_id", userId)
      .range(offset, offset + limit - 1);

    if (connectionsError) {
      console.error("❌ Erro ao buscar conexões:", connectionsError);
      return NextResponse.json(
        {
          error: "Erro ao buscar seguindo",
          following: [],
          total: 0,
          count: 0,
          limit,
          offset,
        },
        { status: 500 }
      );
    }

    if (!connections || connections.length === 0) {
      return NextResponse.json({
        following: [],
        total: count || 0,
        count: 0,
        limit,
        offset,
      });
    }

    // Buscar dados de quem está seguindo
    const followingIds = connections.map((c) => c.following_id);

    // Primeiro buscar em perfis_profissionais
    const { data: profissionais } = await supabase
      .from("perfis_profissionais")
      .select("id, user_id, nome, sobrenome, especialidades, foto_perfil_url")
      .in("user_id", followingIds);

    // Depois buscar em perfis_pacientes
    const { data: pacientes } = await supabase
      .from("perfis_pacientes")
      .select("id, user_id, nome, sobrenome, foto_perfil_url")
      .in("user_id", followingIds);

    // Combinar e formatar resultados
    const following = [];

    if (profissionais) {
      following.push(
        ...profissionais.map((p) => ({
          ...p,
          tipo: "profissional" as const,
        }))
      );
    }

    if (pacientes) {
      following.push(
        ...pacientes.map((p) => ({
          ...p,
          tipo: "paciente" as const,
          especialidades: undefined,
        }))
      );
    }

    console.log(`✅ Seguindo ${following.length} usuários`);

    return NextResponse.json({
      following,
      total: count || 0,
      count: following.length,
      limit,
      offset,
    });
  } catch (error: any) {
    console.error("💥 Erro:", error);
    return NextResponse.json(
      {
        error: error.message,
        following: [],
        total: 0,
        count: 0,
        limit: 10,
        offset: 0,
      },
      { status: 500 }
    );
  }
}
