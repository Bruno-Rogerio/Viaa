// src/app/api/posts/feed/route.ts
// API para buscar posts do feed personalizado

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
  console.log("📰 GET /api/posts/feed");

  try {
    const userId = await getUserId(req);
    const { searchParams } = new URL(req.url);

    const filter = searchParams.get("filter") || "all";
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = parseInt(searchParams.get("offset") || "0");

    console.log("📝 Buscando posts:", { filter, userId, limit, offset });

    let query = supabase
      .from("posts")
      .select(
        `
        *,
        author:perfis_profissionais!posts_profissional_id_fkey (
          id,
          user_id,
          nome,
          sobrenome,
          especialidades,
          foto_perfil_url,
          verificado,
          cidade,
          estado
        ),
        likes:post_likes (
          id,
          profissional_id
        ),
        comments:post_comments (
          id
        )
      `,
        { count: "exact" }
      )
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    // Aplicar filtros específicos
    if (filter === "seguindo" && userId) {
      // Buscar primeiro quem o usuário está seguindo
      const { data: connections } = await supabase
        .from("connections")
        .select("following_id")
        .eq("follower_id", userId);

      if (connections && connections.length > 0) {
        const followingIds = connections.map((c) => c.following_id);
        query = query.in("profissional_id", followingIds);
      } else {
        // Se não segue ninguém, retornar vazio
        return NextResponse.json({
          success: true,
          posts: [],
          total: 0,
          count: 0,
          limit,
          offset,
        });
      }
    } else if (filter === "trending") {
      // Posts com mais engajamento nos últimos 7 dias
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      query = query
        .gte("created_at", sevenDaysAgo.toISOString())
        .order("likes_count", { ascending: false });
    }

    const { data: posts, error, count } = await query;

    if (error) {
      console.error("❌ Erro ao buscar posts:", error);
      return NextResponse.json(
        { success: false, error: "Erro ao buscar posts" },
        { status: 500 }
      );
    }

    // Formatar posts e incluir se o usuário curtiu
    const formattedPosts = (posts || []).map((post) => {
      const userLiked = userId
        ? post.likes?.some((like: any) => like.profissional_id === userId)
        : false;

      return {
        ...post,
        userLiked,
        likes: undefined, // Remover array de likes da resposta
        comments_count: post.comments?.length || 0,
        comments: undefined, // Remover array de comments da resposta
      };
    });

    console.log(`✅ ${formattedPosts.length} posts encontrados`);

    return NextResponse.json({
      success: true,
      posts: formattedPosts,
      total: count || 0,
      count: formattedPosts.length,
      limit,
      offset,
      filter,
    });
  } catch (error: any) {
    console.error("💥 Erro:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
