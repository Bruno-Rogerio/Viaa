// src/app/api/connections/unfollow/route.ts
// ✅ ROTA CORRIGIDA - Unfollow

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

async function getUserProfileId(userId: string): Promise<string | null> {
  const tables = [
    "perfis_profissionais",
    "perfis_pacientes",
    "perfis_clinicas",
    "perfis_empresas",
  ];

  for (const table of tables) {
    const { data, error } = await supabase
      .from(table)
      .select("id")
      .eq("user_id", userId)
      .single();

    if (!error && data) {
      return data.id;
    }
  }

  return null;
}

export async function DELETE(req: NextRequest) {
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

    const followerProfileId = await getUserProfileId(user.id);
    if (!followerProfileId) {
      return NextResponse.json(
        { success: false, error: "Perfil não encontrado" },
        { status: 404 }
      );
    }

    // Verificar se está seguindo
    const { data: existingConnection } = await supabase
      .from("connections")
      .select("id")
      .eq("follower_id", followerProfileId)
      .eq("following_id", following_id)
      .single();

    if (!existingConnection) {
      return NextResponse.json(
        { success: false, error: "Você não segue este usuário" },
        { status: 400 }
      );
    }

    // Remover conexão
    const { error } = await supabase
      .from("connections")
      .delete()
      .eq("follower_id", followerProfileId)
      .eq("following_id", following_id);

    if (error) {
      console.error("❌ Erro ao remover conexão:", error);
      return NextResponse.json(
        { success: false, error: "Erro ao deixar de seguir usuário" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Deixou de seguir com sucesso",
      },
      { status: 200 }
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
