// src/hooks/dashboard/useFeed.ts
// 🎯 Hook para gerenciar o feed personalizado com filtros

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Post, FeedPagination } from "@/types/feed";

/**
 * Tipos de filtro para o feed
 */
export type FeedFilterType = "seguindo" | "para-voce" | "recentes";

/**
 * Interface para as opções do feed
 */
interface FeedOptions {
  initialFilter?: FeedFilterType;
  pageSize?: number;
  autoLoad?: boolean;
}

/**
 * Hook para gerenciar o feed de posts
 */
export function useFeed(options: FeedOptions = {}) {
  const {
    initialFilter = "seguindo",
    pageSize = 10,
    autoLoad = true,
  } = options;

  const { user, profile } = useAuth();

  // Estado para os posts e metadados
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FeedFilterType>(initialFilter);
  const [pagination, setPagination] = useState<FeedPagination>({
    page: 1,
    limit: pageSize,
    total: 0,
    has_more: false,
  });
  const [refreshKey, setRefreshKey] = useState(0);

  // Carregar posts do feed
  const loadPosts = useCallback(
    async (page: number = 1, replace: boolean = true) => {
      if (!user?.id) return false;

      try {
        setLoading(true);
        setError(null);

        // Construir a URL com os parâmetros de filtro e paginação
        const params = new URLSearchParams({
          filter: filter,
          page: page.toString(),
          limit: pageSize.toString(),
        });

        // Usar fetch com autenticação - o token JWT está nos cookies
        const response = await fetch(`/api/posts?${params.toString()}`);

        if (!response.ok) {
          throw new Error("Erro ao carregar feed");
        }

        const data = await response.json();

        // Atualizar os posts (substituir ou concatenar)
        setPosts((prev) => {
          if (replace) return data.posts || [];
          return [...prev, ...(data.posts || [])];
        });

        // Atualizar metadados de paginação
        setPagination({
          page: page,
          limit: pageSize,
          total: data.total || 0,
          has_more: data.has_more || false,
        });

        return true;
      } catch (err: any) {
        console.error("Erro ao carregar feed:", err);
        setError(err.message || "Erro ao carregar feed");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [user?.id, filter, pageSize]
  );

  // Atualizar o filtro
  const updateFilter = useCallback((newFilter: FeedFilterType) => {
    setFilter(newFilter);
    // Resetar para a página 1 ao mudar o filtro
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, []);

  // Carregar mais posts (paginação)
  const loadMore = useCallback(async () => {
    if (loading || !pagination.has_more) return false;
    return await loadPosts(pagination.page + 1, false);
  }, [loading, pagination.has_more, pagination.page, loadPosts]);

  // Curtir/descurtir post
  const togglePostLike = useCallback(
    async (postId: string) => {
      if (!user?.id) return false;

      try {
        // Encontrar o post e verificar se já está curtido
        const post = posts.find((p) => p.id === postId);
        if (!post) return false;

        const isLiked = post.is_liked || false;

        // Atualizar estado local imediatamente (otimista)
        setPosts((prevPosts) =>
          prevPosts.map((p) =>
            p.id === postId
              ? {
                  ...p,
                  is_liked: !isLiked,
                  likes_count: isLiked ? p.likes_count - 1 : p.likes_count + 1,
                }
              : p
          )
        );

        // Fazer requisição para a API
        const method = isLiked ? "DELETE" : "POST";
        const response = await fetch(`/api/posts/${postId}/like`, {
          method,
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          // Reverter estado local em caso de erro
          setPosts((prevPosts) =>
            prevPosts.map((p) =>
              p.id === postId
                ? {
                    ...p,
                    is_liked: isLiked,
                    likes_count: isLiked
                      ? p.likes_count + 1
                      : p.likes_count - 1,
                  }
                : p
            )
          );
          throw new Error("Erro ao curtir/descurtir post");
        }

        return true;
      } catch (err: any) {
        console.error("Erro ao curtir/descurtir post:", err);
        return false;
      }
    },
    [posts, user?.id]
  );

  // Atualizar feed (refresh)
  const refresh = useCallback(() => {
    setRefreshKey((prev) => prev + 1);
  }, []);

  // Efeito para carregar posts iniciais
  useEffect(() => {
    if (autoLoad && user?.id) {
      loadPosts(1, true);
    }
  }, [user?.id, filter, refreshKey, autoLoad, loadPosts]);

  return {
    posts,
    loading,
    error,
    filter,
    pagination,
    setFilter: updateFilter,
    loadMore,
    togglePostLike,
    refresh,
  };
}
