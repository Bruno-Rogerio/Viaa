// src/app/api/connections/unfollow/route.ts
// ✅ ROTA FIXA - DEIXAR DE SEGUIR (UNFOLLOW)

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

export async function DELETE(req: NextRequest) {
  console.log("🚫 DELETE /api/connections/unfollow recebido!");

  try {
    // Autenticação
    const userId = await getUserId(req);
    if (!userId) {
      console.log("❌ Não autenticado");
      return NextResponse.json(
        { success: false, error: "Não autenticado" },
        { status: 401 }
      );
    }

    console.log("✅ User autenticado:", userId);

    // Parse body
    const body = await req.json();
    const { following_id } = body;

    if (!following_id) {
      console.log("❌ following_id não fornecido");
      return NextResponse.json(
        { success: false, error: "following_id é obrigatório" },
        { status: 400 }
      );
    }

    console.log("📝 Deixando de seguir:", following_id);

    // Verificar se já está seguindo
    const { data: existingConnection } = await supabase
      .from("connections")
      .select("id")
      .eq("follower_id", userId)
      .eq("following_id", following_id)
      .single();

    if (!existingConnection) {
      return NextResponse.json(
        { success: false, error: "Você não segue este usuário" },
        { status: 400 }
      );
    }

    // Remover conexão
    console.log("🗑️ Removendo conexão...");
    const { error } = await supabase
      .from("connections")
      .delete()
      .eq("follower_id", userId)
      .eq("following_id", following_id);

    if (error) {
      console.error("❌ Erro ao remover:", error);
      return NextResponse.json(
        { success: false, error: "Erro ao deixar de seguir usuário" },
        { status: 500 }
      );
    }

    console.log("✅ Conexão removida!");

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
