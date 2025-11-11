// src/app/api/connections/is-following/route.ts
// ✅ ROTA CORRIGIDA - Verificar se está seguindo

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

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromToken(req);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Não autenticado" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const targetUserId = searchParams.get("user_id");

    if (!targetUserId) {
      return NextResponse.json(
        { success: false, error: "user_id é obrigatório" },
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
    const { data } = await supabase
      .from("connections")
      .select("id")
      .eq("follower_id", followerProfileId)
      .eq("following_id", targetUserId)
      .single();

    const isFollowing = !!data;

    return NextResponse.json({
      success: true,
      follower_id: followerProfileId,
      following_id: targetUserId,
      is_following: isFollowing,
    });
  } catch (error: any) {
    console.error("💥 Erro:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Erro interno do servidor",
      },
      { status: 500 }
    );
  }
}
