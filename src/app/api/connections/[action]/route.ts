// app/api/connections/[action]/route.ts
// 🔧 VERSÃO SIMPLIFICADA PARA DEBUG - SEM UTILS

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

console.log("🚀 Arquivo route.ts carregado!");
console.log("📦 Environment vars disponíveis:", {
  hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
  hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
});

// Cliente Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Helper para pegar user ID
async function getUserIdFromRequest(req: NextRequest): Promise<string | null> {
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      console.log("❌ Sem Authorization header");
      return null;
    }

    const token = authHeader.substring(7);
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      console.log("❌ Erro ao validar token:", error);
      return null;
    }

    console.log("✅ User autenticado:", user.id);
    return user.id;
  } catch (error) {
    console.error("💥 Erro ao extrair user ID:", error);
    return null;
  }
}

// ============================================================
// OPTIONS - Para CORS
// ============================================================
export async function OPTIONS(req: NextRequest) {
  console.log("🔧 OPTIONS request recebido");

  return NextResponse.json(
    {},
    {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    }
  );
}

// ============================================================
// POST - SEGUIR
// ============================================================
export async function POST(
  req: NextRequest,
  { params }: { params: { action: string } }
) {
  console.log("🎯 ========== POST RECEBIDO ==========");
  console.log("📝 Params completos:", JSON.stringify(params));
  console.log("🔗 Action:", params.action);
  console.log("🌐 URL:", req.url);
  console.log("📋 Method:", req.method);
  console.log("🔑 Headers:", Object.fromEntries(req.headers.entries()));

  try {
    const action = params.action;

    console.log("✅ Action extraído:", action);

    if (action !== "follow") {
      console.log("⚠️ Action não é 'follow', retornando 405");
      return NextResponse.json(
        { success: false, error: "Ação não permitida" },
        { status: 405 }
      );
    }

    // Obter user ID
    console.log("🔍 Obtendo user ID...");
    const userId = await getUserIdFromRequest(req);

    if (!userId) {
      console.log("❌ Usuário não autenticado");
      return NextResponse.json(
        { success: false, error: "Não autenticado" },
        { status: 401 }
      );
    }

    console.log("✅ User ID obtido:", userId);

    // Parse body
    console.log("📦 Parseando body...");
    const body = await req.json();
    console.log("📄 Body recebido:", JSON.stringify(body));

    const { following_id } = body;

    if (!following_id) {
      console.log("❌ following_id não fornecido");
      return NextResponse.json(
        { success: false, error: "following_id é obrigatório" },
        { status: 400 }
      );
    }

    console.log("✅ following_id:", following_id);

    // Validações básicas
    if (userId === following_id) {
      console.log("❌ Tentando seguir a si mesmo");
      return NextResponse.json(
        { success: false, error: "Você não pode seguir a si mesmo" },
        { status: 400 }
      );
    }

    // Verificar se já está seguindo
    console.log("🔍 Verificando se já está seguindo...");
    const { data: existing } = await supabase
      .from("connections")
      .select("id")
      .eq("follower_id", userId)
      .eq("following_id", following_id)
      .single();

    if (existing) {
      console.log("⚠️ Já está seguindo");
      return NextResponse.json(
        { success: false, error: "Você já segue este usuário" },
        { status: 400 }
      );
    }

    // Criar conexão
    console.log("💾 Criando conexão no banco...");
    const { data, error } = await supabase
      .from("connections")
      .insert([
        {
          follower_id: userId,
          following_id: following_id,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("❌ Erro ao criar conexão:", error);
      return NextResponse.json(
        {
          success: false,
          error: "Erro ao seguir usuário",
          details: error.message,
        },
        { status: 500 }
      );
    }

    console.log("✅ Conexão criada com sucesso!");
    console.log("📦 Dados:", JSON.stringify(data));

    return NextResponse.json(
      {
        success: true,
        data: data,
        message: "Seguindo com sucesso",
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("💥 ERRO CRÍTICO em POST:", error);
    console.error("Stack:", error.stack);

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Erro interno do servidor",
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

// ============================================================
// GET - INFORMAÇÕES
// ============================================================
export async function GET(
  req: NextRequest,
  { params }: { params: { action: string } }
) {
  console.log("🔍 ========== GET RECEBIDO ==========");
  console.log("📝 Action:", params.action);
  console.log("🌐 URL:", req.url);

  try {
    const { searchParams } = new URL(req.url);
    const action = params.action;

    // IS FOLLOWING
    if (action === "is-following") {
      const userId = await getUserIdFromRequest(req);
      if (!userId) {
        return NextResponse.json(
          { success: false, error: "Não autenticado" },
          { status: 401 }
        );
      }

      const targetUserId = searchParams.get("user_id");
      if (!targetUserId) {
        return NextResponse.json(
          { success: false, error: "user_id é obrigatório" },
          { status: 400 }
        );
      }

      const { data } = await supabase
        .from("connections")
        .select("id")
        .eq("follower_id", userId)
        .eq("following_id", targetUserId)
        .single();

      return NextResponse.json({
        success: true,
        follower_id: userId,
        following_id: targetUserId,
        is_following: !!data,
      });
    }

    // COUNT FOLLOWERS
    if (action === "count-followers") {
      const userId = searchParams.get("user_id");
      if (!userId) {
        return NextResponse.json(
          { success: false, error: "user_id é obrigatório" },
          { status: 400 }
        );
      }

      const { count } = await supabase
        .from("connections")
        .select("*", { count: "exact", head: true })
        .eq("following_id", userId);

      return NextResponse.json({
        success: true,
        user_id: userId,
        follower_count: count || 0,
      });
    }

    // COUNT FOLLOWING
    if (action === "count-following") {
      const userId = searchParams.get("user_id");
      if (!userId) {
        return NextResponse.json(
          { success: false, error: "user_id é obrigatório" },
          { status: 400 }
        );
      }

      const { count } = await supabase
        .from("connections")
        .select("*", { count: "exact", head: true })
        .eq("follower_id", userId);

      return NextResponse.json({
        success: true,
        user_id: userId,
        following_count: count || 0,
      });
    }

    return NextResponse.json(
      { success: false, error: "Ação não reconhecida" },
      { status: 404 }
    );
  } catch (error: any) {
    console.error("💥 ERRO em GET:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// ============================================================
// DELETE - UNFOLLOW
// ============================================================
export async function DELETE(
  req: NextRequest,
  { params }: { params: { action: string } }
) {
  console.log("🗑️ ========== DELETE RECEBIDO ==========");
  console.log("📝 Action:", params.action);

  try {
    const action = params.action;

    if (action !== "unfollow") {
      return NextResponse.json(
        { success: false, error: "Ação não permitida" },
        { status: 405 }
      );
    }

    const userId = await getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Não autenticado" },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { following_id } = body;

    if (!following_id) {
      return NextResponse.json(
        { success: false, error: "following_id é obrigatório" },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("connections")
      .delete()
      .eq("follower_id", userId)
      .eq("following_id", following_id);

    if (error) {
      console.error("❌ Erro ao deletar:", error);
      return NextResponse.json(
        { success: false, error: "Erro ao deixar de seguir" },
        { status: 500 }
      );
    }

    console.log("✅ Unfollow realizado");

    return NextResponse.json({
      success: true,
      message: "Deixou de seguir com sucesso",
    });
  } catch (error: any) {
    console.error("💥 ERRO em DELETE:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
