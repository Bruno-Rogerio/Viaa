// src/hooks/dashboard/usePatientFeed.ts
// ✅ HOOK ESPECÍFICO PARA PACIENTES - Apenas leitura

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";
import type { Post, FeedFilters, FeedPagination } from "@/types/feed";

interface UsePatientFeedReturn {
  posts: Post[];
  loading: boolean;
  error: string | null;
  pagination: FeedPagination;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
  setFilters: (filters: Partial<FeedFilters>) => void;
}

export const usePatientFeed = (
  initialFilters: FeedFilters = { type: "all" }
): UsePatientFeedReturn => {
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

  const validateAndTransformPost = useCallback((post: any): Post | null => {
    if (!post?.id || !post?.author?.id || !post?.author?.nome) {
      return null;
    }

    return {
      id: post.id,
      profissional_id: post.profissional_id,
      content: post.content || "",
      image_url: post.image_url,
      video_url: post.video_url,
      type: post.type || "text",
      likes_count: post.likes_count || 0,
      comments_count: post.comments_count || 0,
      shares_count: post.shares_count || 0,
      created_at: post.created_at,
      updated_at: post.updated_at,
      is_active: post.is_active ?? true,
      author: {
        id: post.author.id,
        nome: post.author.nome,
        sobrenome: post.author.sobrenome || "",
        especialidades: post.author.especialidades || "",
        foto_perfil_url: post.author.foto_perfil_url,
        verificado: post.author.verificado || false,
      },
      is_liked: false, // Pacientes não curtem
      user_like_id: undefined,
    };
  }, []);

  const loadPosts = useCallback(
    async (page: number = 1, reset: boolean = true) => {
      try {
        setLoading(true);
        setError(null);

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

        const transformedPosts: Post[] = data
          .map(validateAndTransformPost)
          .filter((post): post is Post => post !== null);

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
        console.error("❌ Erro ao carregar posts:", err);
        setError(err.message || "Erro ao carregar posts");
      } finally {
        setLoading(false);
      }
    },
    [buildPostsQuery, pagination.limit, validateAndTransformPost]
  );

  const loadMore = useCallback(async () => {
    if (!pagination.has_more || loading) return;
    await loadPosts(pagination.page + 1, false);
  }, [pagination.has_more, pagination.page, loading, loadPosts]);

  const refresh = useCallback(async () => {
    await loadPosts(1, true);
  }, [loadPosts]);

  const setFilters = useCallback((newFilters: Partial<FeedFilters>) => {
    setFiltersState((prev) => ({ ...prev, ...newFilters }));
  }, []);

  useEffect(() => {
    loadPosts(1, true);
  }, [filters]);

  return {
    posts,
    loading,
    error,
    pagination,
    loadMore,
    refresh,
    setFilters,
  };
};
