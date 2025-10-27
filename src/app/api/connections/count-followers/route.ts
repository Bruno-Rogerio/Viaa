// src/app/api/connections/count-followers/route.ts
// ✅ ROTA FIXA - CONTAR SEGUIDORES

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  console.log("📊 GET /api/connections/count-followers");

  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("user_id");

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "user_id é obrigatório" },
        { status: 400 }
      );
    }

    console.log("📝 Contando followers de:", userId);

    // Contar seguidores
    const { count, error } = await supabase
      .from("connections")
      .select("*", { count: "exact", head: true })
      .eq("following_id", userId);

    if (error) {
      console.error("❌ Erro ao contar:", error);
      return NextResponse.json(
        { success: false, error: "Erro ao contar seguidores" },
        { status: 500 }
      );
    }

    console.log("✅ Total de followers:", count);

    return NextResponse.json({
      success: true,
      user_id: userId,
      follower_count: count || 0,
    });
  } catch (error: any) {
    console.error("💥 Erro:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
