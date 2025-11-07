// src/app/api/connections/follow/route.ts
// 👥 API de Conexões - Seguir usuário

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  console.log("➕ POST /api/connections/follow");

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

    // Não pode seguir a si mesmo
    if (user.id === following_id) {
      return NextResponse.json(
        { success: false, error: "Não pode seguir a si mesmo" },
        { status: 400 }
      );
    }

    console.log(`📝 ${user.id} seguindo ${following_id}`);

    // Verificar se já segue
    const { data: existing } = await supabase
      .from("connections")
      .select("id")
      .eq("follower_id", user.id)
      .eq("following_id", following_id)
      .single();

    if (existing) {
      return NextResponse.json(
        { success: false, error: "Já está seguindo este usuário" },
        { status: 400 }
      );
    }

    // Criar conexão
    const { data, error } = await supabase
      .from("connections")
      .insert({
        follower_id: user.id,
        following_id: following_id,
      })
      .select()
      .single();

    if (error) {
      console.error("❌ Erro ao seguir:", error);
      return NextResponse.json(
        { success: false, error: "Erro ao seguir usuário" },
        { status: 500 }
      );
    }

    console.log("✅ Conexão criada:", data.id);

    return NextResponse.json({
      success: true,
      connection: data,
    });
  } catch (error: any) {
    console.error("💥 Erro:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
