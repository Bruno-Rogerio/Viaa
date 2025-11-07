// src/app/api/posts/route.ts
// 📝 API de Posts - Lista e criação de posts

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET - Listar posts
export async function GET(req: NextRequest) {
  console.log("📋 GET /api/posts");

  try {
    const { searchParams } = new URL(req.url);
    const filter = searchParams.get("filter") || "recentes";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const authorId = searchParams.get("author_id");

    // Token de autenticação
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json(
        { error: "Token não fornecido" },
        { status: 401 }
      );
    }

    // Buscar dados do usuário autenticado
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 });
    }

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
          endereco_cidade,
          endereco_estado
        )
      `,
        { count: "exact" }
      )
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    // Aplicar filtros
    if (filter === "seguindo") {
      // Buscar IDs dos profissionais que o usuário segue
      const { data: connections } = await supabase
        .from("connections")
        .select("following_id")
        .eq("follower_id", user.id);

      if (connections && connections.length > 0) {
        const followingIds = connections.map((c) => c.following_id);
        query = query.in("profissional_id", followingIds);
      } else {
        // Se não segue ninguém, retornar vazio
        return NextResponse.json({
          posts: [],
          total: 0,
          page,
          limit,
          has_more: false,
        });
      }
    } else if (filter === "para-voce") {
      // Por enquanto, retornar posts com mais engajamento
      query = query.order("likes_count", { ascending: false });
    }

    if (authorId) {
      query = query.eq("profissional_id", authorId);
    }

    const { data: posts, error, count } = await query;

    if (error) {
      console.error("❌ Erro ao buscar posts:", error);
      return NextResponse.json(
        { error: "Erro ao buscar posts" },
        { status: 500 }
      );
    }

    // Buscar curtidas do usuário para esses posts
    const postIds = posts?.map((p) => p.id) || [];
    const { data: userLikes } = await supabase
      .from("post_likes")
      .select("post_id")
      .eq("user_id", user.id)
      .in("post_id", postIds);

    const likedPostIds = new Set(userLikes?.map((l) => l.post_id) || []);

    // Adicionar flag is_liked aos posts
    const postsWithLikes =
      posts?.map((post) => ({
        ...post,
        is_liked: likedPostIds.has(post.id),
      })) || [];

    console.log(`✅ ${postsWithLikes.length} posts retornados`);

    return NextResponse.json({
      posts: postsWithLikes,
      total: count || 0,
      page,
      limit,
      has_more: (count || 0) > page * limit,
    });
  } catch (error: any) {
    console.error("💥 Erro:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - Criar novo post
export async function POST(req: NextRequest) {
  console.log("✍️ POST /api/posts");

  try {
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json(
        { error: "Token não fornecido" },
        { status: 401 }
      );
    }

    // Buscar dados do usuário autenticado
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 });
    }

    // Verificar se é profissional
    const { data: profile } = await supabase
      .from("perfis_profissionais")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!profile) {
      return NextResponse.json(
        { error: "Apenas profissionais podem criar posts" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { content, type = "text", image_url, video_url } = body;

    if (!content) {
      return NextResponse.json(
        { error: "Conteúdo é obrigatório" },
        { status: 400 }
      );
    }

    // Criar post
    const { data: post, error } = await supabase
      .from("posts")
      .insert({
        profissional_id: profile.id,
        content,
        type,
        image_url,
        video_url,
        is_active: true,
        likes_count: 0,
        comments_count: 0,
        shares_count: 0,
      })
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
          verificado
        )
      `
      )
      .single();

    if (error) {
      console.error("❌ Erro ao criar post:", error);
      return NextResponse.json(
        { error: "Erro ao criar post" },
        { status: 500 }
      );
    }

    console.log("✅ Post criado:", post.id);

    return NextResponse.json({
      success: true,
      post,
    });
  } catch (error: any) {
    console.error("💥 Erro:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
