// src/hooks/useConnections.ts
// 🔗 Hook para gerenciar o estado de seguir/deixar de seguir
// ✅ VERSÃO COMPLETA COM TOKEN SUPABASE

import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";

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
// 📊 HOOK - Versão com parâmetro opcional para compatibilidade
// ============================================================

export function useConnections(
  userId?: string,
  legacyAuthToken?: string | null
) {
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
  const [authToken, setAuthToken] = useState<string | null>(null);

  // ========== OBTER TOKEN DO SUPABASE ==========
  useEffect(() => {
    const getToken = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.access_token) {
          setAuthToken(session.access_token);
          console.log("✅ Token obtido do Supabase");
        }
      } catch (error) {
        console.error("❌ Erro ao obter token:", error);
        setError("Erro de autenticação");
      }
    };
    
    // Se não foi passado um token legacy, buscar do Supabase
    if (!legacyAuthToken) {
      getToken();
    } else {
      setAuthToken(legacyAuthToken);
    }

    // Escutar mudanças na sessão
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.access_token && !legacyAuthToken) {
        setAuthToken(session.access_token);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [legacyAuthToken]);

  // ========== VALIDAÇÕES INICIAIS ==========
  const canPerformActions = useCallback(() => {
    if (!userId) {
      console.error("🚫 useConnections: userId não fornecido");
      return false;
    }

    if (!authToken) {
      console.error("🚫 useConnections: authToken não fornecido");
      return false;
    }

    return true;
  }, [userId, authToken]);

  // ========== CONTAR SEGUIDORES (movido para cima para resolver erro de declaração) ==========
  const getFollowerCount = useCallback(async () => {
    if (!userId) return;

    console.log("🔢 useConnections.getFollowerCount() para userId:", userId);

    try {
      const response = await fetch(
        `/api/connections/count-followers?user_id=${userId}`
      );

      console.log("📥 Status da resposta:", response.status);
      const data = await response.json();
      console.log("📦 Dados da resposta:", data);

      if (data.success) {
        setFollowerCount(data.follower_count || 0);
        console.log("✅ Contagem de seguidores:", data.follower_count);
      } else {
        console.error("❌ Erro ao contar seguidores:", data.error);
      }
    } catch (err: any) {
      console.error("❌ Erro ao contar seguidores:", err);
    }
  }, [userId]);

  // ========== CONTAR SEGUINDO (movido para cima para resolver erro de declaração) ==========
  const getFollowingCount = useCallback(async () => {
    if (!userId) return;

    console.log("🔢 useConnections.getFollowingCount() para userId:", userId);

    try {
      const response = await fetch(
        `/api/connections/count-following?user_id=${userId}`
      );

      console.log("📥 Status da resposta:", response.status);
      const data = await response.json();
      console.log("📦 Dados da resposta:", data);

      if (data.success) {
        setFollowingCount(data.following_count || 0);
        console.log("✅ Contagem de seguindo:", data.following_count);
      } else {
        console.error("❌ Erro ao contar seguindo:", data.error);
      }
    } catch (err: any) {
      console.error("❌ Erro ao contar seguindo:", err);
    }
  }, [userId]);

  // ========== EFEITOS ==========
  useEffect(() => {
    if (canPerformActions()) {
      checkFollowStatus();
      getFollowerCount();
      getFollowingCount();
    }
  }, [userId, authToken]);

  // ========== SEGUIR USUÁRIO ==========
  const follow = useCallback(async () => {
    if (!canPerformActions()) return false;

    console.log("🔗 useConnections.follow() iniciado para userId:", userId);

    try {
      setIsLoading(true);
      setError(null);

      const requestBody = {
        following_id: userId,
      };

      console.log("📤 Dados sendo enviados:", requestBody);

      const response = await fetch("/api/connections/follow", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(requestBody),
      });

      console.log("📥 Status da resposta:", response.status);
      const data = await response.json();
      console.log("📦 Dados da resposta:", data);

      if (data.success) {
        setIsFollowing(true);
        getFollowerCount(); // Atualizar contagem
        console.log("✅ Seguiu com sucesso");
        return true;
      } else {
        console.error("❌ Erro ao seguir:", data.error);
        setError(data.error || "Erro ao seguir");
        return false;
      }
    } catch (err: any) {
      console.error("❌ Erro ao seguir:", err);
      setError(err.message || "Erro ao seguir");
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [userId, authToken, canPerformActions, getFollowerCount]);

  // ========== DEIXAR DE SEGUIR USUÁRIO ==========
  const unfollow = useCallback(async () => {
    if (!canPerformActions()) return false;

    console.log("🔗 useConnections.unfollow() iniciado para userId:", userId);

    try {
      setIsLoading(true);
      setError(null);

      const requestBody = {
        following_id: userId,
      };

      console.log("📤 Dados sendo enviados:", requestBody);

      const response = await fetch(`/api/connections/unfollow`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(requestBody),
      });

      console.log("📥 Status da resposta:", response.status);
      const data = await response.json();
      console.log("📦 Dados da resposta:", data);

      if (data.success) {
        setIsFollowing(false);
        getFollowerCount(); // Atualizar contagem
        console.log("✅ Deixou de seguir com sucesso");
        return true;
      } else {
        console.error("❌ Erro ao deixar de seguir:", data.error);
        setError(data.error || "Erro ao deixar de seguir");
        return false;
      }
    } catch (err: any) {
      console.error("❌ Erro ao deixar de seguir:", err);
      setError(err.message || "Erro ao deixar de seguir");
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [userId, authToken, canPerformActions, getFollowerCount]);

  // ========== VERIFICAR STATUS ==========
  const checkFollowStatus = useCallback(async () => {
    if (!canPerformActions()) return;

    console.log("🔍 useConnections.checkFollowStatus() para userId:", userId);

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

      console.log("📥 Status da resposta:", response.status);
      const data = await response.json();
      console.log("📦 Dados da resposta:", data);

      if (data.success) {
        setIsFollowing(data.is_following);
        console.log(
          "✅ Status de seguir:",
          data.is_following ? "Seguindo" : "Não seguindo"
        );
      } else {
        console.error("❌ Erro ao verificar status:", data.error);
        setError(data.error || "Erro ao verificar status");
      }
    } catch (err: any) {
      console.error("❌ Erro ao verificar status:", err);
      setError(err.message || "Erro ao verificar status");
    } finally {
      setIsLoading(false);
    }
  }, [userId, authToken, canPerformActions]);

  // ========== LISTAR SEGUIDORES ==========
    async (limit = 10, offset = 0) => {
      if (!canPerformActions()) return;

      console.log("📋 useConnections.getFollowersList() para userId:", userId);

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

        console.log("📥 Status da resposta:", response.status);
        const data: FollowersListResponse = await response.json();
        console.log("📦 Dados da resposta:", data);

        if (data.followers) {
          setFollowersList(data.followers);
          console.log(
            "✅ Lista de seguidores carregada:",
            data.followers.length
          );
        } else if (data.error) {
          console.error("❌ Erro ao listar seguidores:", data.error);
          setFollowersError(data.error);
        }
      } catch (err: any) {
        console.error("❌ Erro ao listar seguidores:", err);
        setFollowersError(err.message || "Erro ao listar seguidores");
      } finally {
        setFollowersLoading(false);
      }
    },
    [userId, authToken, canPerformActions]
  );

  // ========== LISTAR SEGUINDO ==========
  const getFollowingList = useCallback(
    async (limit = 10, offset = 0) => {
      if (!canPerformActions()) return;

      console.log("📋 useConnections.getFollowingList() para userId:", userId);

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

        console.log("📥 Status da resposta:", response.status);
        const data: FollowingListResponse = await response.json();
        console.log("📦 Dados da resposta:", data);

        if (data.following) {
          setFollowingList(data.following);
          console.log("✅ Lista de seguindo carregada:", data.following.length);
        } else if (data.error) {
          console.error("❌ Erro ao listar seguindo:", data.error);
          setFollowersError(data.error);
        }
      } catch (err: any) {
        console.error("❌ Erro ao listar seguindo:", err);
        setFollowersError(err.message || "Erro ao listar seguindo");
      } finally {
        setFollowersLoading(false);
      }
    },
    [userId, authToken, canPerformActions]
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