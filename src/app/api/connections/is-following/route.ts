// src/app/api/connections/is-following/route.ts
// ✅ ROTA FIXA - VERIFICAR SE ESTÁ SEGUINDO

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function getUserId(req: NextRequest): Promise<string | null> {
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) return null;

    const token = authHeader.substring(7);
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) return null;
    return user.id;
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  console.log("🔍 GET /api/connections/is-following recebido!");

  try {
    // Autenticação
    const userId = await getUserId(req);
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Não autenticado" },
        { status: 401 }
      );
    }

    // Obter user_id da query string
    const { searchParams } = new URL(req.url);
    const targetUserId = searchParams.get("user_id");

    if (!targetUserId) {
      return NextResponse.json(
        { success: false, error: "user_id é obrigatório" },
        { status: 400 }
      );
    }

    console.log("📝 Verificando follow:", { userId, targetUserId });

    // Verificar se está seguindo
    const { data } = await supabase
      .from("connections")
      .select("id")
      .eq("follower_id", userId)
      .eq("following_id", targetUserId)
      .single();

    const isFollowing = !!data;
    console.log("✅ Resultado:", isFollowing);

    return NextResponse.json({
      success: true,
      follower_id: userId,
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
