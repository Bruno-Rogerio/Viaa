// src/app/api/posts/route.ts
// 🎯 API para buscar posts do feed com diferentes filtros (com tipagem corrigida)

import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

interface PerfilProfissional {
  id: string;
  user_id: string;
  especialidades?: string;
}

// Tipagem para a conexão com profissional
interface ConnectionWithProfissional {
  following_id: string;
  profissional?: {
    especialidades?: string | null;
  };
}

// Tipagem para o resultado do Supabase
interface SupabaseCountResult {
  count: number | null;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const filter = searchParams.get("filter") || "seguindo";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    if (page < 1 || limit < 1 || limit > 50) {
      return NextResponse.json(
        { error: "Parâmetros de paginação inválidos" },
        { status: 400 }
      );
    }

    // Obter usuário autenticado
    const supabase = createRouteHandlerClient({ cookies });
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const userId = session.user.id;
    const offset = (page - 1) * limit;

    // Buscar tipo de perfil do usuário (paciente ou profissional)
    const { data: perfilPaciente } = await supabase
      .from("perfis_pacientes")
      .select("id")
      .eq("user_id", userId)
      .single();

    const isPaciente = !!perfilPaciente;

    // Construir query base
    let query = supabase
      .from("posts")
      .select(
        `
        *,
        author:perfis_profissionais!profissional_id(
          id,
          user_id,
          nome,
          sobrenome,
          especialidades,
          foto_perfil_url,
          verificado
        )
      `,
        { count: "exact" }
      )
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    // Aplicar filtro específico
    if (filter === "seguindo" && isPaciente) {
      // Posts de profissionais que o usuário segue
      const { data: connections } = await supabase
        .from("connections")
        .select("following_id")
        .eq("follower_id", userId);

      if (connections && connections.length > 0) {
        const followingIds = connections.map((c) => c.following_id);
        query = query.in("author.user_id", followingIds);
      } else {
        // Se não segue ninguém, retornar array vazio
        return NextResponse.json({
          posts: [],
          total: 0,
          has_more: false,
        });
      }
    } else if (filter === "para-voce" && isPaciente) {
      // Posts personalizados baseado em interesse (por enquanto usamos especialidades)
      // Implementação inicial simplificada - depois implementar algoritmo completo

      // 1. Buscar especialidades dos profissionais que o usuário já segue
      const { data: seguindo } = await supabase
        .from("connections")
        .select(
          `
          profissional:perfis_profissionais!following_id(
            especialidades
          )
        `
        )
        .eq("follower_id", userId);

      // 2. Extrair especialidades mais comuns
      const especialidadesArray: string[] = [];

      // Verificar se há dados e processar de forma segura
      if (seguindo && seguindo.length > 0) {
        for (const conn of seguindo) {
          const especialidades = conn.profissional?.especialidades;
          if (especialidades) {
            const especialidadesItems = especialidades.split(",");
            for (const item of especialidadesItems) {
              if (item.trim()) {
                especialidadesArray.push(item.trim());
              }
            }
          }
        }
      }

      // 3. Se tiver especialidades, priorizar posts relacionados
      if (especialidadesArray.length > 0) {
        // Criar condição OR para cada especialidade
        const especialidadesFilter = especialidadesArray
          .map((e) => `author.especialidades.ilike.%${e}%`)
          .join(",");

        query = query.or(especialidadesFilter);
      }

      // 4. Priorizar posts com mais engajamento
      query = query.order("likes_count", { ascending: false });
    }
    // Para "recentes" não precisa filtro adicional, já está ordenado por created_at

    // Aplicar paginação
    query = query.range(offset, offset + limit - 1);

    // Executar query
    const { data: posts, error, count } = await query;

    if (error) {
      console.error("Erro ao buscar posts:", error);
      return NextResponse.json(
        { error: "Erro ao buscar posts" },
        { status: 500 }
      );
    }

    // Verificar quais posts o usuário curtiu
    if (posts && posts.length > 0) {
      const postIds = posts.map((post) => post.id);

      const { data: likes } = await supabase
        .from("post_likes")
        .select("post_id")
        .eq("user_id", userId)
        .in("post_id", postIds);

      const likedPostIds = likes?.map((like) => like.post_id) || [];

      // Adicionar flag is_liked aos posts
      posts.forEach((post) => {
        post.is_liked = likedPostIds.includes(post.id);
      });
    }

    // Usar o count que já foi retornado na query principal
    const totalCount = count || 0;
    const hasMore = offset + limit < totalCount;

    return NextResponse.json({
      posts: posts || [],
      total: totalCount,
      has_more: hasMore,
    });
  } catch (error: any) {
    console.error("Erro na API de posts:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
