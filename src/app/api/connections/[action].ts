// app/api/connections/[action].ts
// 🔗 API Routes para o sistema de conexões (follow/unfollow)

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  canFollow,
  createFollow,
  removeFollow,
  isFollowing,
  getFollowerCount,
  getFollowingCount,
  getFollowersList,
  getFollowingList,
} from "@/utils/connections";

// ============================================================
// 🔐 MIDDLEWARE - AUTENTICAÇÃO
// ============================================================

/**
 * Extrair user ID do token JWT no header Authorization
 */
async function getUserIdFromRequest(req: NextRequest): Promise<string | null> {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Tentar obter sessão do header Authorization
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return null;
    }

    const token = authHeader.substring(7);

    // Verificar token com Supabase
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      return null;
    }

    return user.id;
  } catch (error) {
    console.error("Erro ao extrair user ID:", error);
    return null;
  }
}

/**
 * Resposta de erro padrão
 */
function errorResponse(message: string, status: number = 400) {
  return NextResponse.json({ success: false, error: message }, { status });
}

/**
 * Resposta de sucesso padrão
 */
function successResponse(data: any, status: number = 200) {
  return NextResponse.json({ success: true, ...data }, { status });
}

// ============================================================
// 📝 POST - SEGUIR
// ============================================================

/**
 * POST /api/connections/follow
 * Seguir um usuário
 */
export async function POST(req: NextRequest) {
  try {
    // Obter user ID autenticado
    const userId = await getUserIdFromRequest(req);
    if (!userId) {
      return errorResponse("Não autenticado", 401);
    }

    // Extrair followingId do corpo
    const body = await req.json();
    const { following_id } = body;

    if (!following_id) {
      return errorResponse("following_id é obrigatório", 400);
    }

    // Criar follow
    const result = await createFollow(userId, following_id);

    if (!result.success) {
      return errorResponse(result.error || "Erro ao seguir", 400);
    }

    return successResponse(
      {
        data: result.data,
        message: "Seguindo com sucesso",
      },
      201
    );
  } catch (error: any) {
    console.error("Erro em POST /api/connections/follow:", error);
    return errorResponse("Erro interno do servidor", 500);
  }
}

// ============================================================
// 🔗 GET - INFORMAÇÕES DE CONEXÃO
// ============================================================

/**
 * GET /api/connections/[action]
 * Listar seguidores, following, contadores, etc
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { action: string } }
) {
  try {
    const { searchParams } = new URL(req.url);
    const action = params.action;

    // ========== FOLLOWERS ==========
    if (action === "followers") {
      const userId = searchParams.get("user_id");
      const limit = parseInt(searchParams.get("limit") ?? "20");
      const offset = parseInt(searchParams.get("offset") ?? "0");

      if (!userId) {
        return errorResponse("user_id é obrigatório", 400);
      }

      const result = await getFollowersList(userId, limit, offset);

      if (result.error) {
        return errorResponse(result.error, 400);
      }

      // ✅ FIX: Garantir que followers sempre existe
      return successResponse({
        followers: result.followers || [],
        total: result.total,
        count: result.followers?.length || 0,
        limit,
        offset,
      });
    }

    // ========== FOLLOWING ==========
    if (action === "following") {
      const userId = searchParams.get("user_id");
      const limit = parseInt(searchParams.get("limit") ?? "20");
      const offset = parseInt(searchParams.get("offset") ?? "0");

      if (!userId) {
        return errorResponse("user_id é obrigatório", 400);
      }

      const result = await getFollowingList(userId, limit, offset);

      if (result.error) {
        return errorResponse(result.error, 400);
      }

      // ✅ FIX: Garantir que following sempre existe
      return successResponse({
        following: result.following || [],
        total: result.total,
        count: result.following?.length || 0,
        limit,
        offset,
      });
    }

    // ========== FOLLOWER COUNT ==========
    if (action === "count-followers") {
      const userId = searchParams.get("user_id");

      if (!userId) {
        return errorResponse("user_id é obrigatório", 400);
      }

      const count = await getFollowerCount(userId);

      return successResponse({
        user_id: userId,
        follower_count: count,
      });
    }

    // ========== FOLLOWING COUNT ==========
    if (action === "count-following") {
      const userId = searchParams.get("user_id");

      if (!userId) {
        return errorResponse("user_id é obrigatório", 400);
      }

      const count = await getFollowingCount(userId);

      return successResponse({
        user_id: userId,
        following_count: count,
      });
    }

    // ========== CHECK IF FOLLOWING ==========
    if (action === "is-following") {
      const userId = await getUserIdFromRequest(req);
      if (!userId) {
        return errorResponse("Não autenticado", 401);
      }

      const targetUserId = searchParams.get("user_id");

      if (!targetUserId) {
        return errorResponse("user_id é obrigatório", 400);
      }

      const following = await isFollowing(userId, targetUserId);

      return successResponse({
        follower_id: userId,
        following_id: targetUserId,
        is_following: following,
      });
    }

    // Action não reconhecida
    return errorResponse("Ação não reconhecida", 404);
  } catch (error: any) {
    console.error("Erro em GET /api/connections:", error);
    return errorResponse("Erro interno do servidor", 500);
  }
}

// ============================================================
// ❌ DELETE - DEIXAR DE SEGUIR
// ============================================================

/**
 * DELETE /api/connections/unfollow
 * Deixar de seguir um usuário
 */
export async function DELETE(req: NextRequest) {
  try {
    // Obter user ID autenticado
    const userId = await getUserIdFromRequest(req);
    if (!userId) {
      return errorResponse("Não autenticado", 401);
    }

    // Extrair followingId do corpo ou query
    const body = await req.json().catch(() => ({}));
    const { following_id } = body;

    if (!following_id) {
      return errorResponse("following_id é obrigatório", 400);
    }

    // Remover follow
    const result = await removeFollow(userId, following_id);

    if (!result.success) {
      return errorResponse(result.error || "Erro ao deixar de seguir", 400);
    }

    return successResponse({
      message: "Deixou de seguir com sucesso",
    });
  } catch (error: any) {
    console.error("Erro em DELETE /api/connections/unfollow:", error);
    return errorResponse("Erro interno do servidor", 500);
  }
}

// ============================================================
// 📊 MÉTODOS NÃO PERMITIDOS
// ============================================================

export async function PATCH(req: NextRequest) {
  return errorResponse("Método PATCH não permitido", 405);
}

export async function PUT(req: NextRequest) {
  return errorResponse("Método PUT não permitido", 405);
}
