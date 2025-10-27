// src/app/api/connections/follow/route.ts
// ✅ ROTA FIXA - SEGUIR

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

export async function POST(req: NextRequest) {
  console.log("🎯 POST /api/connections/follow recebido!");

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

    console.log("📝 Seguindo:", following_id);

    // Validação: não pode seguir a si mesmo
    if (userId === following_id) {
      return NextResponse.json(
        { success: false, error: "Você não pode seguir a si mesmo" },
        { status: 400 }
      );
    }

    // Verificar se já está seguindo
    const { data: existing } = await supabase
      .from("connections")
      .select("id")
      .eq("follower_id", userId)
      .eq("following_id", following_id)
      .single();

    if (existing) {
      return NextResponse.json(
        { success: false, error: "Você já segue este usuário" },
        { status: 400 }
      );
    }

    // Criar conexão
    console.log("💾 Criando conexão...");
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
      console.error("❌ Erro ao criar:", error);
      return NextResponse.json(
        { success: false, error: "Erro ao seguir usuário" },
        { status: 500 }
      );
    }

    console.log("✅ Conexão criada!");

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
