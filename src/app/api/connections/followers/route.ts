// src/app/api/connections/followers/route.ts
// 👥 API de Conexões - Listar seguidores

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  console.log("📋 GET /api/connections/followers");

  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("user_id");
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = parseInt(searchParams.get("offset") || "0");

    if (!userId) {
      return NextResponse.json(
        {
          error: "user_id é obrigatório",
          followers: [],
          total: 0,
          count: 0,
          limit,
          offset,
        },
        { status: 400 }
      );
    }

    console.log(`📝 Listando seguidores de: ${userId}`);

    // Buscar conexões onde o usuário é seguido
    const {
      data: connections,
      error: connectionsError,
      count,
    } = await supabase
      .from("connections")
      .select("follower_id", { count: "exact" })
      .eq("following_id", userId)
      .range(offset, offset + limit - 1);

    if (connectionsError) {
      console.error("❌ Erro ao buscar conexões:", connectionsError);
      return NextResponse.json(
        {
          error: "Erro ao buscar seguidores",
          followers: [],
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
        followers: [],
        total: count || 0,
        count: 0,
        limit,
        offset,
      });
    }

    // Buscar dados dos seguidores
    const followerIds = connections.map((c) => c.follower_id);

    // Primeiro buscar em perfis_profissionais
    const { data: profissionais } = await supabase
      .from("perfis_profissionais")
      .select("id, user_id, nome, sobrenome, especialidades, foto_perfil_url")
      .in("user_id", followerIds);

    // Depois buscar em perfis_pacientes
    const { data: pacientes } = await supabase
      .from("perfis_pacientes")
      .select("id, user_id, nome, sobrenome, foto_perfil_url")
      .in("user_id", followerIds);

    // Combinar e formatar resultados
    const followers = [];

    if (profissionais) {
      followers.push(
        ...profissionais.map((p) => ({
          ...p,
          tipo: "profissional" as const,
        }))
      );
    }

    if (pacientes) {
      followers.push(
        ...pacientes.map((p) => ({
          ...p,
          tipo: "paciente" as const,
          especialidades: undefined,
        }))
      );
    }

    console.log(`✅ ${followers.length} seguidores encontrados`);

    return NextResponse.json({
      followers,
      total: count || 0,
      count: followers.length,
      limit,
      offset,
    });
  } catch (error: any) {
    console.error("💥 Erro:", error);
    return NextResponse.json(
      {
        error: error.message,
        followers: [],
        total: 0,
        count: 0,
        limit: 10,
        offset: 0,
      },
      { status: 500 }
    );
  }
}
