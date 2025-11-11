// src/app/api/connections/follow/route.ts
// ✅ ROTA CORRIGIDA - Com validações de tipo de usuário

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function getUserFromToken(req: NextRequest) {
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) return null;

    const token = authHeader.substring(7);
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) return null;
    return user;
  } catch {
    return null;
  }
}

async function getUserProfile(userId: string) {
  const tables = [
    { name: "perfis_profissionais", type: "profissional" },
    { name: "perfis_pacientes", type: "paciente" },
    { name: "perfis_clinicas", type: "clinica" },
    { name: "perfis_empresas", type: "empresa" },
  ];

  for (const table of tables) {
    const { data, error } = await supabase
      .from(table.name)
      .select("id, user_id")
      .eq("user_id", userId)
      .single();

    if (!error && data) {
      return { profileId: data.id, type: table.type };
    }
  }

  return null;
}

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromToken(req);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Não autenticado" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { following_id } = body;

    if (!following_id) {
      return NextResponse.json(
        { success: false, error: "following_id é obrigatório" },
        { status: 400 }
      );
    }

    // Buscar perfil do usuário atual
    const followerProfile = await getUserProfile(user.id);
    if (!followerProfile) {
      return NextResponse.json(
        { success: false, error: "Perfil do usuário não encontrado" },
        { status: 404 }
      );
    }

    // Buscar perfil do usuário a ser seguido
    const { data: followingData, error: followingError } = await supabase
      .from("perfis_profissionais")
      .select("id")
      .eq("id", following_id)
      .single();

    let followingType = "profissional";

    if (followingError) {
      const { data: patientData } = await supabase
        .from("perfis_pacientes")
        .select("id")
        .eq("id", following_id)
        .single();

      if (!patientData) {
        return NextResponse.json(
          { success: false, error: "Usuário a ser seguido não encontrado" },
          { status: 404 }
        );
      }
      followingType = "paciente";
    }

    // VALIDAÇÃO: Profissional NÃO pode seguir paciente
    if (
      followerProfile.type === "profissional" &&
      followingType === "paciente"
    ) {
      return NextResponse.json(
        { success: false, error: "Profissionais não podem seguir pacientes" },
        { status: 403 }
      );
    }

    // Não pode seguir a si mesmo
    if (followerProfile.profileId === following_id) {
      return NextResponse.json(
        { success: false, error: "Você não pode seguir a si mesmo" },
        { status: 400 }
      );
    }

    // Verificar se já está seguindo
    const { data: existing } = await supabase
      .from("connections")
      .select("id")
      .eq("follower_id", followerProfile.profileId)
      .eq("following_id", following_id)
      .single();

    if (existing) {
      return NextResponse.json(
        { success: false, error: "Você já segue este usuário" },
        { status: 400 }
      );
    }

    // Criar conexão
    const { data, error } = await supabase
      .from("connections")
      .insert([
        {
          follower_id: followerProfile.profileId,
          following_id: following_id,
          follower_type: followerProfile.type,
          following_type: followingType,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("❌ Erro ao criar conexão:", error);
      return NextResponse.json(
        { success: false, error: "Erro ao seguir usuário" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: data,
        message: "Seguindo com sucesso",
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("💥 Erro crítico:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Erro interno do servidor",
      },
      { status: 500 }
    );
  }
}
