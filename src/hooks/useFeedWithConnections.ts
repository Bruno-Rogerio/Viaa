// src/hooks/useFeedWithConnections.ts
// 🔗 Hook que integra Feed com sistema de Conexões

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useFeed } from "./dashboard/useFeed";
import { useConnections } from "./useConnections";
import type { Post } from "@/types/feed";

interface UseFeedWithConnectionsReturn {
  // Feed
  posts: Post[];
  loading: boolean;
  error: string | null;
  pagination: any;
  createPost: (data: any) => Promise<boolean>;
  togglePostLike: (postId: string) => Promise<boolean>;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
  setFilters: (filters: any) => void;

  // Connections
  followUser: (userId: string) => Promise<boolean>;
  unfollowUser: (userId: string) => Promise<boolean>;
  isFollowing: (userId: string) => boolean;
  followingMap: Map<string, boolean>;

  // Adicionando propriedades faltantes
  filter?: string;
  setFilter?: (filter: string) => void;
  toggleLike?: (postId: string) => Promise<boolean>;
}

export { Post }; // Re-exportar tipo Post

export const useFeedWithConnections = (
  initialFilters?: any
): UseFeedWithConnectionsReturn => {
  const { user } = useAuth();
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [followingMap, setFollowingMap] = useState<Map<string, boolean>>(
    new Map()
  );

  // Usar hook de feed
  const feedData = useFeed(initialFilters);

  // Obter token de autenticação
  useEffect(() => {
    const getToken = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session?.access_token) {
          setAuthToken(session.access_token);
        }
      } catch (error) {
        console.error("Erro ao obter token:", error);
      }
    };
    getToken();
  }, []);

  // Verificar status de seguir para autores únicos dos posts
  useEffect(() => {
    const checkFollowingStatus = async () => {
      if (!authToken || !feedData.posts.length) return;

      // Obter IDs únicos dos autores
      const authorIds = [
        ...new Set(
          feedData.posts.map((post: Post) => post.author?.id).filter(Boolean)
        ),
      ];

      if (authorIds.length === 0) return;

      try {
        // Buscar conexões do usuário atual
        const { data: connections } = await supabase
          .from("connections")
          .select("following_id")
          .eq("follower_id", user?.id)
          .in("following_id", authorIds);

        // Criar mapa de seguindo
        const newMap = new Map<string, boolean>();
        authorIds.forEach((id: string) => {
          const isFollowing =
            connections?.some((c) => c.following_id === id) || false;
          newMap.set(id, isFollowing);
        });

        setFollowingMap(newMap);
      } catch (error) {
        console.error("Erro ao verificar status de seguir:", error);
      }
    };

    checkFollowingStatus();
  }, [feedData.posts, authToken, user?.id]);

  // Seguir usuário
  const followUser = useCallback(
    async (userId: string): Promise<boolean> => {
      if (!authToken) {
        console.error("Token não disponível");
        return false;
      }

      try {
        const response = await fetch("/api/connections/follow", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({ following_id: userId }),
        });

        const data = await response.json();

        if (data.success) {
          setFollowingMap((prev) => new Map(prev).set(userId, true));
          return true;
        }

        return false;
      } catch (error) {
        console.error("Erro ao seguir:", error);
        return false;
      }
    },
    [authToken]
  );

  // Deixar de seguir usuário
  const unfollowUser = useCallback(
    async (userId: string): Promise<boolean> => {
      if (!authToken) {
        console.error("Token não disponível");
        return false;
      }

      try {
        const response = await fetch("/api/connections/unfollow", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({ following_id: userId }),
        });

        const data = await response.json();

        if (data.success) {
          setFollowingMap((prev) => new Map(prev).set(userId, false));
          return true;
        }

        return false;
      } catch (error) {
        console.error("Erro ao deixar de seguir:", error);
        return false;
      }
    },
    [authToken]
  );

  // Verificar se está seguindo
  const isFollowing = useCallback(
    (userId: string): boolean => {
      return followingMap.get(userId) || false;
    },
    [followingMap]
  );

  return {
    ...feedData,
    followUser,
    unfollowUser,
    isFollowing,
    followingMap,
    // Adicionar aliases para compatibilidade
    toggleLike: feedData.togglePostLike,
    filter: undefined, // Ou adicionar estado real se necessário
    setFilter: (filter: string) => {
      feedData.setFilters({ type: filter as any });
    },
  };
};

export default useFeedWithConnections;
