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

// ============================================================
// 📊 HOOK
// ============================================================

export function useConnections(userId: string, authToken: string | null) {
  // ========== ESTADOS ==========
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [followersList, setFollowersList] = useState<UserProfile[]>([]);
  const [followingList, setFollowingList] = useState<UserProfile[]>([]);
  const [followersLoading, setFollowersLoading] = useState(false);
  const [followersError, setFollowersError] = useState<string | null>(null);

  // ========== EFEITOS ==========

  // Verificar status inicial quando temos userId e token
  useEffect(() => {
    if (userId && authToken) {
      checkFollowStatus();
      getFollowerCount();
      getFollowingCount();
    }
  }, [userId, authToken]);

  // ========== SEGUIR USUÁRIO ==========
  const follow = useCallback(async () => {
    if (!userId || !authToken) return;

    try {
      setIsLoading(true);
      setError(null);

      console.log("🔗 Seguindo usuário:", userId);

      const response = await fetch("/api/connections/follow", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          following_id: userId,
        }),
      });

      console.log("📦 Resposta da API:", response);

      const data = await response.json();

      if (data.success) {
        setIsFollowing(true);
        getFollowerCount(); // Atualizar contagem
      } else {
        console.error("❌ Erro ao seguir:", data.error);
        setError(data.error || "Erro ao seguir");
        throw new Error(data.error || "Erro ao seguir");
      }
    } catch (err: any) {
      console.error("❌ Erro ao seguir:", err);
      setError(err.message || "Erro ao seguir");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [userId, authToken]);

  // ========== DEIXAR DE SEGUIR USUÁRIO ==========
  const unfollow = useCallback(async () => {
    if (!userId || !authToken) return;

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/connections/unfollow`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          following_id: userId,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setIsFollowing(false);
        getFollowerCount(); // Atualizar contagem
      } else {
        console.error("❌ Erro ao deixar de seguir:", data.error);
        setError(data.error || "Erro ao deixar de seguir");
        throw new Error(data.error || "Erro ao deixar de seguir");
      }
    } catch (err: any) {
      console.error("❌ Erro ao deixar de seguir:", err);
      setError(err.message || "Erro ao deixar de seguir");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [userId, authToken]);

  // ========== VERIFICAR STATUS ==========
  const checkFollowStatus = useCallback(async () => {
    if (!userId || !authToken) return;

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(
        `/api/connections/is-following?user_id=${userId}`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      const data = await response.json();

      if (data.success) {
        setIsFollowing(data.is_following);
      } else {
        console.error("Erro ao verificar status de follow:", data.error);
      }
    } catch (err) {
      console.error("Erro ao verificar follow status:", err);
    } finally {
      setIsLoading(false);
    }
  }, [userId, authToken]);

  // ========== CONTAR SEGUIDORES ==========
  const getFollowerCount = useCallback(async () => {
    if (!userId) return;

    try {
      const response = await fetch(
        `/api/connections/count-followers?user_id=${userId}`
      );
      const data = await response.json();

      if (data.success) {
        setFollowerCount(data.follower_count || 0);
      }
    } catch (error) {
      console.error("Erro ao buscar contagem de seguidores:", error);
    }
  }, [userId]);

  // ========== CONTAR SEGUINDO ==========
  const getFollowingCount = useCallback(async () => {
    if (!userId) return;

    try {
      const response = await fetch(
        `/api/connections/count-following?user_id=${userId}`
      );
      const data = await response.json();

      if (data.success) {
        setFollowingCount(data.following_count || 0);
      }
    } catch (error) {
      console.error("Erro ao buscar contagem de seguindo:", error);
    }
  }, [userId]);

  // ========== LISTAR SEGUIDORES ==========
  const getFollowersList = useCallback(
    async (limit = 10, offset = 0) => {
      if (!userId || !authToken) return;

      try {
        setFollowersLoading(true);
        setFollowersError(null);

        const response = await fetch(
          `/api/connections/followers?user_id=${userId}&limit=${limit}&offset=${offset}`,
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          }
        );

        const data: FollowersListResponse = await response.json();

        if (data.followers) {
          setFollowersList(data.followers);
        } else if (data.error) {
          setFollowersError(data.error);
        }
      } catch (err: any) {
        console.error("Erro ao listar seguidores:", err);
        setFollowersError(err.message || "Erro ao listar seguidores");
      } finally {
        setFollowersLoading(false);
      }
    },
    [userId, authToken]
  );

  // ========== LISTAR SEGUINDO ==========
  const getFollowingList = useCallback(
    async (limit = 10, offset = 0) => {
      if (!userId || !authToken) return;

      try {
        setFollowersLoading(true);
        setFollowersError(null);

        const response = await fetch(
          `/api/connections/following?user_id=${userId}&limit=${limit}&offset=${offset}`,
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          }
        );

        const data: FollowingListResponse = await response.json();

        if (data.following) {
          setFollowingList(data.following);
        } else if (data.error) {
          setFollowersError(data.error);
        }
      } catch (err: any) {
        console.error("Erro ao listar seguindo:", err);
        setFollowersError(err.message || "Erro ao listar seguindo");
      } finally {
        setFollowersLoading(false);
      }
    },
    [userId, authToken]
  );

  // ========== RETORNAR VALORES E FUNÇÕES ==========
  return {
    // Estados
    isFollowing,
    isLoading,
    error,
    followerCount,
    followingCount,
    followersList,
    followingList,
    followersLoading,
    followersError,

    // Ações
    follow,
    unfollow,
    checkFollowStatus,
    getFollowerCount,
    getFollowingCount,
    getFollowersList,
    getFollowingList,
  };
}

export default useConnections;
