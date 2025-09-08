// viaa\src\hooks\dashboard\useFeed.ts

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
  likePost: (postId: string) => Promise<boolean>;
  unlikePost: (postId: string) => Promise<boolean>;
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

  // Query para buscar posts com dados do autor
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
        ),
        user_like:post_likes!post_likes_post_id_fkey (
          id
        )
      `
        )
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .range((page - 1) * limit, page * limit - 1);

      // Aplicar filtros
      if (filters.author_id) {
        query = query.eq("profissional_id", filters.author_id);
      }

      if (filters.search) {
        query = query.textSearch("content", filters.search);
      }

      // Filtrar curtidas do usuário atual se logado
      if (user) {
        query = query.eq("user_like.profissional_id", user.id);
      }

      return query;
    },
    [filters, user]
  );

  // Carregar posts
  const loadPosts = useCallback(
    async (page: number = 1, reset: boolean = true) => {
      try {
        setLoading(true);
        setError(null);

        const query = buildPostsQuery(page, pagination.limit);
        const { data, error: queryError, count } = await query;

        if (queryError) {
          throw queryError;
        }

        if (!data) {
          setPosts([]);
          return;
        }

        // Transformar dados para o formato esperado
        const transformedPosts: Post[] = data.map((item: any) => ({
          id: item.id,
          profissional_id: item.profissional_id,
          content: item.content,
          image_url: item.image_url,
          video_url: item.video_url,
          type: item.type,
          likes_count: item.likes_count,
          comments_count: item.comments_count,
          shares_count: item.shares_count,
          created_at: item.created_at,
          updated_at: item.updated_at,
          is_active: item.is_active,
          author: {
            id: item.author.id,
            nome: item.author.nome,
            sobrenome: item.author.sobrenome,
            especialidades: item.author.especialidades,
            foto_perfil_url: item.author.foto_perfil_url,
            verificado: item.author.verificado,
          },
          is_liked: item.user_like && item.user_like.length > 0,
          user_like_id: item.user_like?.[0]?.id,
        }));

        if (reset) {
          setPosts(transformedPosts);
        } else {
          setPosts((prev) => [...prev, ...transformedPosts]);
        }

        setPagination((prev) => ({
          ...prev,
          page,
          total: count || 0,
          has_more: transformedPosts.length === pagination.limit,
        }));
      } catch (err: any) {
        console.error("Erro ao carregar posts:", err);
        setError(err.message || "Erro ao carregar posts");
      } finally {
        setLoading(false);
      }
    },
    [buildPostsQuery, pagination.limit]
  );

  // Criar novo post
  const createPost = useCallback(
    async (data: CreatePostData): Promise<boolean> => {
      if (!user) {
        setError("Usuário não autenticado");
        return false;
      }

      try {
        setError(null);

        const { data: newPost, error: insertError } = await supabase
          .from("posts")
          .insert([
            {
              profissional_id: user.id,
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

        if (insertError) {
          throw insertError;
        }

        if (!newPost) {
          throw new Error("Erro ao criar post");
        }

        // Adicionar o novo post no início da lista
        const transformedPost: Post = {
          id: newPost.id,
          profissional_id: newPost.profissional_id,
          content: newPost.content,
          image_url: newPost.image_url,
          video_url: newPost.video_url,
          type: newPost.type,
          likes_count: 0,
          comments_count: 0,
          shares_count: 0,
          created_at: newPost.created_at,
          updated_at: newPost.updated_at,
          is_active: newPost.is_active,
          author: {
            id: newPost.author.id,
            nome: newPost.author.nome,
            sobrenome: newPost.author.sobrenome,
            especialidades: newPost.author.especialidades,
            foto_perfil_url: newPost.author.foto_perfil_url,
            verificado: newPost.author.verificado,
          },
          is_liked: false,
          user_like_id: undefined,
        };

        setPosts((prev) => [transformedPost, ...prev]);
        return true;
      } catch (err: any) {
        console.error("Erro ao criar post:", err);
        setError(err.message || "Erro ao criar post");
        return false;
      }
    },
    [user]
  );

  // Curtir post
  const likePost = useCallback(
    async (postId: string): Promise<boolean> => {
      if (!user) {
        setError("Usuário não autenticado");
        return false;
      }

      try {
        setError(null);

        const { data, error: likeError } = await supabase
          .from("post_likes")
          .insert([
            {
              post_id: postId,
              profissional_id: user.id,
            },
          ])
          .select()
          .single();

        if (likeError) {
          throw likeError;
        }

        // Atualizar estado local
        setPosts((prev) =>
          prev.map((post) =>
            post.id === postId
              ? {
                  ...post,
                  likes_count: post.likes_count + 1,
                  is_liked: true,
                  user_like_id: data.id,
                }
              : post
          )
        );

        return true;
      } catch (err: any) {
        console.error("Erro ao curtir post:", err);
        setError(err.message || "Erro ao curtir post");
        return false;
      }
    },
    [user]
  );

  // Descurtir post
  const unlikePost = useCallback(
    async (postId: string): Promise<boolean> => {
      if (!user) {
        setError("Usuário não autenticado");
        return false;
      }

      try {
        setError(null);

        const { error: unlikeError } = await supabase
          .from("post_likes")
          .delete()
          .eq("post_id", postId)
          .eq("profissional_id", user.id);

        if (unlikeError) {
          throw unlikeError;
        }

        // Atualizar estado local
        setPosts((prev) =>
          prev.map((post) =>
            post.id === postId
              ? {
                  ...post,
                  likes_count: Math.max(0, post.likes_count - 1),
                  is_liked: false,
                  user_like_id: undefined,
                }
              : post
          )
        );

        return true;
      } catch (err: any) {
        console.error("Erro ao descurtir post:", err);
        setError(err.message || "Erro ao descurtir post");
        return false;
      }
    },
    [user]
  );

  // Carregar mais posts (paginação)
  const loadMore = useCallback(async () => {
    if (!pagination.has_more || loading) return;
    await loadPosts(pagination.page + 1, false);
  }, [pagination.has_more, pagination.page, loading, loadPosts]);

  // Atualizar feed
  const refresh = useCallback(async () => {
    await loadPosts(1, true);
  }, [loadPosts]);

  // Atualizar filtros
  const setFilters = useCallback((newFilters: Partial<FeedFilters>) => {
    setFiltersState((prev) => ({ ...prev, ...newFilters }));
  }, []);

  // Carregar posts inicial e quando filtros mudarem
  useEffect(() => {
    loadPosts(1, true);
  }, [filters]); // Removi loadPosts das dependências para evitar loop

  return {
    posts,
    loading,
    error,
    pagination,
    createPost,
    likePost,
    unlikePost,
    loadMore,
    refresh,
    setFilters,
  };
};
