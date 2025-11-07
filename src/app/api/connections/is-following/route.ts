// src/app/api/connections/is-following/route.ts
// 🔍 API de Conexões - Verificar se está seguindo

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  console.log("🔍 GET /api/connections/is-following");

  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("user_id");

    const authHeader = req.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json(
        { success: false, error: "Token não fornecido" },
        { status: 401 }
      );
    }

    // Buscar dados do usuário autenticado
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: "Token inválido" },
        { status: 401 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "user_id é obrigatório" },
        { status: 400 }
      );
    }

    console.log(`📝 Verificando se ${user.id} segue ${userId}`);

    // Verificar conexão
    const { data, error } = await supabase
      .from("connections")
      .select("id")
      .eq("follower_id", user.id)
      .eq("following_id", userId)
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("❌ Erro ao verificar:", error);
      return NextResponse.json(
        { success: false, error: "Erro ao verificar status" },
        { status: 500 }
      );
    }

    const isFollowing = !!data;
    console.log(`✅ Status: ${isFollowing ? "Seguindo" : "Não seguindo"}`);

    return NextResponse.json({
      success: true,
      is_following: isFollowing,
      user_id: userId,
    });
  } catch (error: any) {
    console.error("💥 Erro:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
