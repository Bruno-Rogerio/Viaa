// src/app/api/connections/unfollow/route.ts
// 👋 API de Conexões - Deixar de seguir

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function DELETE(req: NextRequest) {
  console.log("➖ DELETE /api/connections/unfollow");

  try {
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

    const body = await req.json();
    const { following_id } = body;

    if (!following_id) {
      return NextResponse.json(
        { success: false, error: "following_id é obrigatório" },
        { status: 400 }
      );
    }

    console.log(`📝 ${user.id} deixando de seguir ${following_id}`);

    // Remover conexão
    const { error } = await supabase
      .from("connections")
      .delete()
      .eq("follower_id", user.id)
      .eq("following_id", following_id);

    if (error) {
      console.error("❌ Erro ao deixar de seguir:", error);
      return NextResponse.json(
        { success: false, error: "Erro ao deixar de seguir" },
        { status: 500 }
      );
    }

    console.log("✅ Deixou de seguir com sucesso");

    return NextResponse.json({
      success: true,
      message: "Deixou de seguir com sucesso",
    });
  } catch (error: any) {
    console.error("💥 Erro:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
