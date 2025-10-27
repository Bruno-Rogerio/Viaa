// src/hooks/useConnections.ts
// 🔗 Hook para gerenciar o estado de seguir/deixar de seguir
// ✅ VERSÃO CORRIGIDA

import { useState, useCallback, useEffect } from "react";

// ============================================================
// 📋 TIPOS
// ============================================================

interface UserProfile {
  id: string;
  user_id: string;
  nome: string;
  sobrenome: string;
  tipo: "profissional" | "paciente";
  foto_perfil_url?: string;
  especialidades?: string;
}

interface FollowersListResponse {
  followers: UserProfile[];
  total: number;
  count: number;
  limit: number;
  offset: number;
  error?: string;
}

interface FollowingListResponse {
  following: UserProfile[];
  total: number;
  count: number;
  limit: number;
  offset: number;
  error?: string;
}

interface UseConnectionsReturn {
  // Estados
  isFollowing: boolean;
  followerCount: number;
  followingCount: number;
  isLoading: boolean;
  error: string | null;

  // Listas
  followersList: UserProfile[];
  followingList: UserProfile[];
  followersLoading: boolean;
  followersError: string | null;

  // Ações
  follow: () => Promise<void>;
  unfollow: () => Promise<void>;
  checkFollowStatus: () => Promise<void>;
  getFollowerCount: () => Promise<void>;
  getFollowingCount: () => Promise<void>;
  getFollowersList: (limit?: number, offset?: number) => Promise<void>;
  getFollowingList: (limit?: number, offset?: number) => Promise<void>;
}

// ============================================================
// 🪝 HOOK
// ============================================================

/**
 * Hook para gerenciar conexões (follow/unfollow)
 *
 * @param targetUserId - ID do usuário ALVO (quem você quer seguir/deixar de seguir)
 * @param authToken - Token JWT do usuário autenticado
 */
export function useConnections(
  targetUserId: string,
  authToken: string | null
): UseConnectionsReturn {
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [followersList, setFollowersList] = useState<UserProfile[]>([]);
  const [followingList, setFollowingList] = useState<UserProfile[]>([]);
  const [followersLoading, setFollowersLoading] = useState(false);
  const [followersError, setFollowersError] = useState<string | null>(null);

  // ========== HELPERS ==========

  const getAuthHeader = useCallback(() => {
    if (!authToken) {
      throw new Error("Não autenticado");
    }
    return {
      Authorization: `Bearer ${authToken}`,
      "Content-Type": "application/json",
    };
  }, [authToken]);

  // ========== FOLLOW ==========

  const follow = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log("🔗 Seguindo usuário:", targetUserId);

      const response = await fetch("/api/connections/follow", {
        method: "POST",
        headers: getAuthHeader(),
        body: JSON.stringify({ following_id: targetUserId }), // ✅ CORREÇÃO: usar targetUserId
      });

      const data = await response.json();
      console.log("📦 Resposta da API:", data);

      if (!response.ok) {
        throw new Error(data.error || "Erro ao seguir");
      }

      setIsFollowing(true);
      setFollowerCount((prev) => prev + 1);
      console.log("✅ Seguindo com sucesso!");
    } catch (err: any) {
      setError(err.message);
      console.error("❌ Erro ao seguir:", err);
    } finally {
      setIsLoading(false);
    }
  }, [targetUserId, getAuthHeader]);

  // ========== UNFOLLOW ==========

  const unfollow = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log("🔓 Deixando de seguir:", targetUserId);

      const response = await fetch("/api/connections/unfollow", {
        method: "DELETE",
        headers: getAuthHeader(),
        body: JSON.stringify({ following_id: targetUserId }), // ✅ CORREÇÃO: usar targetUserId
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao deixar de seguir");
      }

      setIsFollowing(false);
      setFollowerCount((prev) => Math.max(0, prev - 1));
      console.log("✅ Unfollow realizado!");
    } catch (err: any) {
      setError(err.message);
      console.error("❌ Erro ao deixar de seguir:", err);
    } finally {
      setIsLoading(false);
    }
  }, [targetUserId, getAuthHeader]);

  // ========== CHECK FOLLOW STATUS ==========

  const checkFollowStatus = useCallback(async () => {
    if (!authToken) return;

    try {
      const response = await fetch(
        `/api/connections/is-following?user_id=${targetUserId}`, // ✅ CORREÇÃO: usar targetUserId
        {
          headers: getAuthHeader(),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setIsFollowing(data.is_following || false);
      }
    } catch (err) {
      console.error("Erro ao verificar status de follow:", err);
    }
  }, [targetUserId, authToken, getAuthHeader]);

  // ========== GET FOLLOWER COUNT ==========

  const getFollowerCountAction = useCallback(async () => {
    try {
      const response = await fetch(
        `/api/connections/count-followers?user_id=${targetUserId}` // ✅ CORREÇÃO: usar targetUserId
      );

      const data = await response.json();

      if (response.ok) {
        setFollowerCount(data.follower_count || 0);
      }
    } catch (err) {
      console.error("Erro ao buscar contagem de followers:", err);
    }
  }, [targetUserId]);

  // ========== GET FOLLOWING COUNT ==========

  const getFollowingCountAction = useCallback(async () => {
    try {
      const response = await fetch(
        `/api/connections/count-following?user_id=${targetUserId}` // ✅ CORREÇÃO: usar targetUserId
      );

      const data = await response.json();

      if (response.ok) {
        setFollowingCount(data.following_count || 0);
      }
    } catch (err) {
      console.error("Erro ao buscar contagem de following:", err);
    }
  }, [targetUserId]);

  // ========== GET FOLLOWERS LIST ==========

  const getFollowersListAction = useCallback(
    async (limit: number = 20, offset: number = 0) => {
      try {
        setFollowersLoading(true);
        setFollowersError(null);

        const response = await fetch(
          `/api/connections/followers?user_id=${targetUserId}&limit=${limit}&offset=${offset}` // ✅ CORREÇÃO: usar targetUserId
        );

        const data: FollowersListResponse = await response.json();

        if (response.ok) {
          setFollowersList(data.followers || []);
        } else {
          setFollowersError(data.error || "Erro ao buscar followers");
        }
      } catch (err: any) {
        setFollowersError(err.message);
        console.error("Erro ao buscar followers:", err);
      } finally {
        setFollowersLoading(false);
      }
    },
    [targetUserId]
  );

  // ========== GET FOLLOWING LIST ==========

  const getFollowingListAction = useCallback(
    async (limit: number = 20, offset: number = 0) => {
      try {
        setFollowersLoading(true);
        setFollowersError(null);

        const response = await fetch(
          `/api/connections/following?user_id=${targetUserId}&limit=${limit}&offset=${offset}` // ✅ CORREÇÃO: usar targetUserId
        );

        const data: FollowingListResponse = await response.json();

        if (response.ok) {
          setFollowingList(data.following || []);
        } else {
          setFollowersError(data.error || "Erro ao buscar following");
        }
      } catch (err: any) {
        setFollowersError(err.message);
        console.error("Erro ao buscar following:", err);
      } finally {
        setFollowersLoading(false);
      }
    },
    [targetUserId]
  );

  // ========== AUTO-LOAD ON MOUNT ==========

  useEffect(() => {
    if (targetUserId) {
      getFollowerCountAction();
      getFollowingCountAction();
      if (authToken) {
        checkFollowStatus();
      }
    }
  }, [targetUserId, authToken]); // ✅ CORREÇÃO: remover funções das dependências

  return {
    isFollowing,
    followerCount,
    followingCount,
    isLoading,
    error,
    followersList,
    followingList,
    followersLoading,
    followersError,
    follow,
    unfollow,
    checkFollowStatus,
    getFollowerCount: getFollowerCountAction,
    getFollowingCount: getFollowingCountAction,
    getFollowersList: getFollowersListAction,
    getFollowingList: getFollowingListAction,
  };
}
