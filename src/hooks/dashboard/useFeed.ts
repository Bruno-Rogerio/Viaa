// src/hooks/dashboard/useFeed.ts
// 🔧 VERSÃO COMPLETA - Hook de Feed com todas funcionalidades

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type {
  Post,
  CreatePostData,
  FeedFilters,
  FeedPagination,
} from "@/types/feed";

interface UseFeedReturn {
  posts: Post[];
  loading: boolean;
  error: string | null;
  pagination: FeedPagination;
  createPost: (data: CreatePostData) => Promise<boolean>;
  togglePostLike: (postId: string) => Promise<boolean>;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
  setFilters: (filters: Partial<FeedFilters>) => void;
}

export const useFeed = (
  initialFilters: FeedFilters = { type: "all" }
): UseFeedReturn => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFiltersState] = useState<FeedFilters>(initialFilters);
  const [pagination, setPagination] = useState<FeedPagination>({
    page: 1,
    limit: 10,
    total: 0,
    has_more: true,
  });

  // 🔧 CONSULTA CORRIGIDA - SEM FILTRAR CURTIDAS NA QUERY
  const buildPostsQuery = useCallback(
    (page: number = 1, limit: number = 10) => {
      let query = supabase
        .from("posts")
        .select(
          `
          *,
          author:perfis_profissionais!posts_profissional_id_fkey (
            id,
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
        .order("created_at", { ascending: false })
        .range((page - 1) * limit, page * limit - 1);

      // Aplicar filtros de conteúdo
      if (filters.type === "connections") {
        // TODO: Implementar filtro de conexões
      } else if (filters.type === "trending") {
        query = query.order("likes_count", { ascending: false });
      }

      if (filters.author_id) {
        query = query.eq("profissional_id", filters.author_id);
      }

      if (filters.search) {
        query = query.textSearch("content", filters.search);
      }

      return query;
    },
    [filters]
  );

  // 🔧 BUSCAR CURTIDAS DO USUÁRIO SEPARADAMENTE
  const loadUserLikes = useCallback(
    async (postIds: string[]) => {
      if (!user || postIds.length === 0) return new Set<string>();

      try {
        const { data, error } = await supabase
          .from("post_likes")
          .select("post_id")
          .eq("user_id", user.id)
          .in("post_id", postIds);

        if (error) throw error;

        return new Set(data?.map((like) => like.post_id) || []);
      } catch (err) {
        console.error("❌ Erro ao carregar curtidas:", err);
        return new Set<string>();
      }
    },
    [user]
  );

  // 🔧 FUNÇÃO DE VALIDAÇÃO DE DADOS (MELHORADA)
  const validateAndTransformPost = useCallback((item: any): Post | null => {
    try {
      // Verificar se author existe
      if (!item.author) {
        console.warn(`⚠️ Post ${item.id} sem author - ignorando`);
        return null;
      }

      // Verificar campos obrigatórios do author
      if (!item.author.id || !item.author.nome) {
        console.warn(`⚠️ Post ${item.id} com author inválido:`, item.author);
        return null;
      }

      // Transformação segura
      return {
        id: item.id,
        profissional_id: item.profissional_id,
        content: item.content || "",
        image_url: item.image_url,
        video_url: item.video_url,
        type: item.type || "text",
        likes_count: item.likes_count || 0,
        comments_count: item.comments_count || 0,
        shares_count: item.shares_count || 0,
        created_at: item.created_at,
        updated_at: item.updated_at,
        is_active: item.is_active,
        author: {
          id: item.author.id,
          nome: item.author.nome,
          sobrenome: item.author.sobrenome || "",
          especialidades: item.author.especialidades || "Profissional",
          foto_perfil_url: item.author.foto_perfil_url,
          verificado: item.author.verificado || false,
        },
        is_liked: false, // Será atualizado depois
        user_like_id: undefined,
      };
    } catch (err) {
      console.error(`❌ Erro ao transformar post ${item.id}:`, err);
      return null;
    }
  }, []);

  // 🔧 CARREGAR POSTS (CORRIGIDO)
  const loadPosts = useCallback(
    async (page: number = 1, reset: boolean = true) => {
      try {
        setLoading(true);
        setError(null);

        console.log(`🔍 Carregando posts - Página ${page}`);

        const {
          data,
          error: queryError,
          count,
        } = await buildPostsQuery(page, pagination.limit);

        if (queryError) throw queryError;

        if (!data) {
          setPosts([]);
          return;
        }

        console.log(`📊 Posts recebidos do Supabase: ${data.length}`);

        // Transformar posts
        const transformedPosts: Post[] = data
          .map(validateAndTransformPost)
          .filter((post): post is Post => post !== null);

        console.log(
          `✅ Posts válidos transformados: ${transformedPosts.length}`
        );

        // Carregar curtidas do usuário para esses posts
        const postIds = transformedPosts.map((p) => p.id);
        const userLikes = await loadUserLikes(postIds);

        // Aplicar curtidas aos posts
        const postsWithLikes = transformedPosts.map((post) => ({
          ...post,
          is_liked: userLikes.has(post.id),
        }));

        // Atualizar estado
        if (reset) {
          setPosts(postsWithLikes);
        } else {
          setPosts((prev) => [...prev, ...postsWithLikes]);
        }

        setPagination((prev) => ({
          ...prev,
          page,
          total: count || 0,
          has_more: transformedPosts.length === pagination.limit,
        }));

        // Log de posts inválidos para debug
        if (data.length !== transformedPosts.length) {
          console.warn(
            `⚠️ ${
              data.length - transformedPosts.length
            } posts foram ignorados por dados inválidos`
          );
        }
      } catch (err: any) {
        console.error("❌ Erro ao carregar posts:", err);
        setError(err.message || "Erro ao carregar posts");
      } finally {
        setLoading(false);
      }
    },
    [buildPostsQuery, pagination.limit, validateAndTransformPost, loadUserLikes]
  );

  // 🔧 CRIAR NOVO POST
  const createPost = useCallback(
    async (data: CreatePostData): Promise<boolean> => {
      if (!user) {
        setError("Usuário não autenticado");
        return false;
      }

      try {
        setError(null);

        // Buscar perfil profissional do usuário
        const { data: profile } = await supabase
          .from("perfis_profissionais")
          .select("id")
          .eq("user_id", user.id)
          .single();

        if (!profile) {
          setError("Apenas profissionais podem criar posts");
          return false;
        }

        const { data: newPost, error: insertError } = await supabase
          .from("posts")
          .insert([
            {
              profissional_id: profile.id,
              content: data.content,
              image_url: data.image_url,
              video_url: data.video_url,
              type: data.type || "text",
            },
          ])
          .select(
            `
            *,
            author:perfis_profissionais!posts_profissional_id_fkey (
              id,
              nome,
              sobrenome,
              especialidades,
              foto_perfil_url,
              verificado
            )
          `
          )
          .single();

        if (insertError) throw insertError;
        if (!newPost) throw new Error("Erro ao criar post");

        // Transformar e validar novo post
        const transformedPost = validateAndTransformPost(newPost);
        if (!transformedPost)
          throw new Error("Post criado com dados inválidos");

        console.log("✅ Novo post criado e adicionado ao feed");
        setPosts((prev) => [transformedPost, ...prev]);
        return true;
      } catch (err: any) {
        console.error("❌ Erro ao criar post:", err);
        setError(err.message || "Erro ao criar post");
        return false;
      }
    },
    [user, validateAndTransformPost]
  );

  // 🔧 TOGGLE CURTIDA DE POST (IMPLEMENTADO)
  const togglePostLike = useCallback(
    async (postId: string): Promise<boolean> => {
      if (!user) {
        setError("Usuário não autenticado");
        return false;
      }

      try {
        setError(null);

        // Encontrar post atual
        const currentPost = posts.find((p) => p.id === postId);
        if (!currentPost) return false;

        const isCurrentlyLiked = currentPost.is_liked;

        // Optimistic update
        setPosts((prev) =>
          prev.map((post) =>
            post.id === postId
              ? {
                  ...post,
                  is_liked: !isCurrentlyLiked,
                  likes_count: post.likes_count + (isCurrentlyLiked ? -1 : 1),
                }
              : post
          )
        );

        console.log(
          `${
            isCurrentlyLiked ? "💔 Removendo" : "❤️ Adicionando"
          } curtida do post ${postId}`
        );

        if (isCurrentlyLiked) {
          // Remover curtida
          const { error } = await supabase
            .from("post_likes")
            .delete()
            .eq("post_id", postId)
            .eq("user_id", user.id);

          if (error) throw error;

          // Decrementar contador
          await supabase.rpc("decrement_post_likes", { post_id: postId });
        } else {
          // Adicionar curtida
          const { error } = await supabase.from("post_likes").insert({
            post_id: postId,
            user_id: user.id,
          });

          if (error) throw error;

          // Incrementar contador
          await supabase.rpc("increment_post_likes", { post_id: postId });
        }

        console.log("✅ Curtida atualizada com sucesso");
        return true;
      } catch (err: any) {
        console.error("❌ Erro ao atualizar curtida:", err);

        // Reverter optimistic update
        await loadPosts(pagination.page, true);
        setError("Erro ao atualizar curtida");
        return false;
      }
    },
    [user, posts, pagination.page, loadPosts]
  );

  // 🔧 CARREGAR MAIS POSTS
  const loadMore = useCallback(async () => {
    if (!pagination.has_more || loading) return;

    console.log("📄 Carregando mais posts...");
    await loadPosts(pagination.page + 1, false);
  }, [pagination.has_more, pagination.page, loading, loadPosts]);

  // 🔧 ATUALIZAR FEED
  const refresh = useCallback(async () => {
    console.log("🔄 Atualizando feed...");
    setPagination((prev) => ({ ...prev, page: 1 }));
    await loadPosts(1, true);
  }, [loadPosts]);

  // 🔧 ATUALIZAR FILTROS
  const setFilters = useCallback((newFilters: Partial<FeedFilters>) => {
    console.log("🎯 Aplicando novos filtros:", newFilters);
    setFiltersState((prev) => ({ ...prev, ...newFilters }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, []);

  // 🔧 EFEITO INICIAL E QUANDO FILTROS MUDAM
  useEffect(() => {
    loadPosts(1, true);
  }, [filters]);

  return {
    posts,
    loading,
    error,
    pagination,
    createPost,
    togglePostLike,
    loadMore,
    refresh,
    setFilters,
  };
};

export default useFeed;
