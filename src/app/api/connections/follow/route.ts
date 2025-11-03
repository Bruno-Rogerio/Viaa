// src/app/api/connections/follow/route.ts
// API para criar uma conexão (seguir usuário)

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Cliente Supabase com service role para bypass RLS
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Função para obter o ID do usuário autenticado
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

// Função para obter o tipo de perfil do usuário
async function getUserProfileType(
  userId: string
): Promise<"profissional" | "paciente" | null> {
  // Verificar primeiro em perfis_profissionais
  const { data: profissional } = await supabase
    .from("perfis_profissionais")
    .select("id")
    .eq("user_id", userId)
    .single();

  if (profissional) return "profissional";

  // Se não for profissional, verificar em perfis_pacientes
  const { data: paciente } = await supabase
    .from("perfis_pacientes")
    .select("id")
    .eq("user_id", userId)
    .single();

  if (paciente) return "paciente";

  return null;
}

export async function POST(req: NextRequest) {
  console.log("🔗 POST /api/connections/follow recebido!");

  try {
    // 1. Autenticação
    const followerId = await getUserId(req);
    if (!followerId) {
      console.log("❌ Não autenticado");
      return NextResponse.json(
        { success: false, error: "Não autenticado" },
        { status: 401 }
      );
    }

    console.log("✅ User autenticado:", followerId);

    // 2. Parse body
    const body = await req.json();
    const { following_id } = body;

    if (!following_id) {
      console.log("❌ following_id não fornecido");
      return NextResponse.json(
        { success: false, error: "following_id é obrigatório" },
        { status: 400 }
      );
    }

    console.log("📝 Tentando seguir:", following_id);

    // 3. Validação: Não pode seguir a si mesmo
    if (followerId === following_id) {
      return NextResponse.json(
        { success: false, error: "Você não pode seguir a si mesmo" },
        { status: 400 }
      );
    }

    // 4. Obter tipos de perfil
    const [followerType, followingType] = await Promise.all([
      getUserProfileType(followerId),
      getUserProfileType(following_id),
    ]);

    console.log("📊 Tipos de perfil:", { followerType, followingType });

    // 5. Validação de regras de negócio
    // REGRA: Profissional NÃO pode seguir paciente
    if (followerType === "profissional" && followingType === "paciente") {
      return NextResponse.json(
        {
          success: false,
          error: "Profissionais não podem seguir pacientes",
        },
        { status: 403 }
      );
    }

    // 6. Verificar se já está seguindo
    const { data: existingConnection } = await supabase
      .from("connections")
      .select("id")
      .eq("follower_id", followerId)
      .eq("following_id", following_id)
      .single();

    if (existingConnection) {
      return NextResponse.json(
        { success: false, error: "Você já segue este usuário" },
        { status: 400 }
      );
    }

    // 7. Criar conexão
    console.log("✨ Criando conexão...");
    const { data, error } = await supabase
      .from("connections")
      .insert([
        {
          follower_id: followerId,
          following_id: following_id,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("❌ Erro ao criar conexão:", error);
      return NextResponse.json(
        { success: false, error: "Erro ao seguir usuário" },
        { status: 500 }
      );
    }

    console.log("✅ Conexão criada:", data);

    return NextResponse.json(
      {
        success: true,
        message: "Seguindo com sucesso",
        data,
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
