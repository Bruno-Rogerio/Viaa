// src/hooks/useFeedWithConnections.tsx
// Hook melhorado para o feed com sistema de conexões integrado

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";

export interface Post {
  id: string;
  profissional_id: string;
  content: string;
  image_url?: string;
  video_url?: string;
  type: "text" | "image" | "video" | "article";
  likes_count: number;
  comments_count: number;
  shares_count: number;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  author?: {
    id: string;
    user_id: string;
    nome: string;
    sobrenome: string;
    especialidades?: string;
    foto_perfil_url?: string;
    verificado?: boolean;
    cidade?: string;
    estado?: string;
  };
  userLiked?: boolean;
}

export interface UseFeedReturn {
  posts: Post[];
  loading: boolean;
  error: string | null;
  filter: string;
  pagination: {
    total: number;
    offset: number;
    limit: number;
    hasMore: boolean;
  };
  setFilter: (filter: string) => void;
  refresh: () => Promise<void>;
  loadMore: () => Promise<void>;
  toggleLike: (postId: string) => Promise<boolean>;
}

export function useFeedWithConnections(): UseFeedReturn {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState("seguindo");
  const [pagination, setPagination] = useState({
    total: 0,
    offset: 0,
    limit: 10,
    hasMore: true,
  });

  // Carregar posts
  const loadPosts = useCallback(
    async (reset = false) => {
      try {
        setLoading(true);
        setError(null);

        const offset = reset ? 0 : pagination.offset;

        const response = await fetch(
          `/api/posts/feed?filter=${filter}&limit=${pagination.limit}&offset=${offset}`,
          {
            headers: user
              ? {
                  Authorization: `Bearer ${user.id}`,
                }
              : {},
          }
        );

        if (!response.ok) {
          throw new Error("Erro ao carregar posts");
        }

        const data = await response.json();

        if (data.success) {
          if (reset) {
            setPosts(data.posts);
          } else {
            setPosts((prev) => [...prev, ...data.posts]);
          }

          setPagination((prev) => ({
            ...prev,
            total: data.total,
            offset: offset + data.posts.length,
            hasMore: offset + data.posts.length < data.total,
          }));
        }
      } catch (err: any) {
        console.error("Erro ao carregar posts:", err);
        setError(err.message || "Erro ao carregar posts");
      } finally {
        setLoading(false);
      }
    },
    [filter, pagination.limit, pagination.offset, user]
  );

  // Alternar curtida
  const toggleLike = useCallback(
    async (postId: string): Promise<boolean> => {
      if (!user) {
        setError("Você precisa estar logado para curtir");
        return false;
      }

      try {
        const post = posts.find((p) => p.id === postId);
        if (!post) return false;

        const method = post.userLiked ? "DELETE" : "POST";

        const response = await fetch(`/api/posts/${postId}/like`, {
          method,
          headers: {
            Authorization: `Bearer ${user.id}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Erro ao processar curtida");
        }

        const data = await response.json();

        if (data.success) {
          // Atualizar o estado local
          setPosts((prev) =>
            prev.map((p) => {
              if (p.id === postId) {
                return {
                  ...p,
                  userLiked: !p.userLiked,
                  likes_count: p.userLiked
                    ? p.likes_count - 1
                    : p.likes_count + 1,
                };
              }
              return p;
            })
          );

          return true;
        }

        return false;
      } catch (err: any) {
        console.error("Erro ao curtir post:", err);
        setError(err.message || "Erro ao curtir");
        return false;
      }
    },
    [user, posts]
  );

  // Carregar mais posts
  const loadMore = useCallback(async () => {
    if (!pagination.hasMore || loading) return;
    await loadPosts();
  }, [pagination.hasMore, loading, loadPosts]);

  // Atualizar feed
  const refresh = useCallback(async () => {
    setPagination((prev) => ({ ...prev, offset: 0, hasMore: true }));
    await loadPosts(true);
  }, [loadPosts]);

  // Efeito para carregar posts quando o filtro muda
  useEffect(() => {
    setPagination((prev) => ({ ...prev, offset: 0, hasMore: true }));
    loadPosts(true);
  }, [filter]);

  // Carregar posts iniciais
  useEffect(() => {
    loadPosts(true);
  }, []);

  return {
    posts,
    loading,
    error,
    filter,
    pagination,
    setFilter,
    refresh,
    loadMore,
    toggleLike,
  };
}
