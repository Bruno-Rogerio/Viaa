// src/hooks/useConnections.ts
// ✅ VERSÃO COM DEBUG COMPLETO

import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";

interface UseConnectionsReturn {
  isFollowing: boolean;
  isLoading: boolean;
  error: string | null;
  followerCount: number;
  followingCount: number;
  follow: () => Promise<void>;
  unfollow: () => Promise<void>;
  checkFollowStatus: () => Promise<void>;
  getFollowerCount: () => Promise<void>;
  getFollowingCount: () => Promise<void>;
}

export function useConnections(
  targetProfileId: string | null,
  currentUserType: "paciente" | "profissional" | "clinica" | "empresa" | null
): UseConnectionsReturn {
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);

  // 🔍 DEBUG - Log inicial
  useEffect(() => {
    console.group("🔍 useConnections Init");
    console.log("targetProfileId:", targetProfileId);
    console.log("currentUserType:", currentUserType);
    console.groupEnd();
  }, [targetProfileId, currentUserType]);

  const getAuthToken = async (): Promise<string | null> => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      console.log("🔑 Token obtido:", session?.access_token ? "✅" : "❌");
      return session?.access_token || null;
    } catch (err) {
      console.error("❌ Erro ao obter token:", err);
      return null;
    }
  };

  const follow = useCallback(async () => {
    console.group("📤 useConnections.follow()");
    console.log("targetProfileId:", targetProfileId);
    console.log("currentUserType:", currentUserType);

    if (!targetProfileId || !currentUserType) {
      console.error("❌ Dados insuficientes");
      console.groupEnd();
      setError("Dados insuficientes para seguir");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const token = await getAuthToken();
      if (!token) {
        console.error("❌ Token não encontrado");
        throw new Error("Não autenticado");
      }

      console.log("📡 Enviando requisição para /api/connections/follow");
      console.log("Body:", { following_id: targetProfileId });

      const response = await fetch("/api/connections/follow", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ following_id: targetProfileId }),
      });

      console.log("📥 Status da resposta:", response.status);

      const data = await response.json();
      console.log("📦 Dados da resposta:", data);

      if (!data.success) {
        console.error("❌ API retornou erro:", data.error);
        throw new Error(data.error || "Erro ao seguir");
      }

      console.log("✅ Follow bem-sucedido");
      setIsFollowing(true);
      await getFollowerCount();
    } catch (err: any) {
      console.error("❌ Erro ao seguir:", err);
      setError(err.message || "Erro ao seguir");
      throw err;
    } finally {
      setIsLoading(false);
      console.groupEnd();
    }
  }, [targetProfileId, currentUserType]);

  const unfollow = useCallback(async () => {
    console.group("📤 useConnections.unfollow()");
    console.log("targetProfileId:", targetProfileId);

    if (!targetProfileId) {
      console.error("❌ ID não fornecido");
      console.groupEnd();
      setError("ID do usuário não fornecido");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const token = await getAuthToken();
      if (!token) {
        console.error("❌ Token não encontrado");
        throw new Error("Não autenticado");
      }

      console.log("📡 Enviando requisição para /api/connections/unfollow");

      const response = await fetch("/api/connections/unfollow", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ following_id: targetProfileId }),
      });

      console.log("📥 Status da resposta:", response.status);

      const data = await response.json();
      console.log("📦 Dados da resposta:", data);

      if (!data.success) {
        console.error("❌ API retornou erro:", data.error);
        throw new Error(data.error || "Erro ao deixar de seguir");
      }

      console.log("✅ Unfollow bem-sucedido");
      setIsFollowing(false);
      await getFollowerCount();
    } catch (err: any) {
      console.error("❌ Erro ao deixar de seguir:", err);
      setError(err.message || "Erro ao deixar de seguir");
      throw err;
    } finally {
      setIsLoading(false);
      console.groupEnd();
    }
  }, [targetProfileId]);

  const checkFollowStatus = useCallback(async () => {
    if (!targetProfileId) return;

    console.log("🔍 Verificando status de follow para:", targetProfileId);

    try {
      setIsLoading(true);
      setError(null);

      const token = await getAuthToken();
      if (!token) {
        console.warn("⚠️ Sem token, pulando verificação");
        return;
      }

      const url = `/api/connections/is-following?user_id=${targetProfileId}`;
      console.log("📡 GET:", url);

      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      console.log("📦 Status de follow:", data);

      if (data.success) {
        setIsFollowing(data.is_following);
        console.log("✅ isFollowing:", data.is_following);
      }
    } catch (err: any) {
      console.error("❌ Erro ao verificar status:", err);
      setError(err.message || "Erro ao verificar status");
    } finally {
      setIsLoading(false);
    }
  }, [targetProfileId]);

  const getFollowerCount = useCallback(async () => {
    if (!targetProfileId) return;

    try {
      const response = await fetch(
        `/api/connections/count-followers?user_id=${targetProfileId}`
      );

      const data = await response.json();

      if (data.success) {
        setFollowerCount(data.follower_count || 0);
        console.log("📊 Follower count:", data.follower_count);
      }
    } catch (err: any) {
      console.error("❌ Erro ao contar seguidores:", err);
    }
  }, [targetProfileId]);

  const getFollowingCount = useCallback(async () => {
    if (!targetProfileId) return;

    try {
      const response = await fetch(
        `/api/connections/count-following?user_id=${targetProfileId}`
      );

      const data = await response.json();

      if (data.success) {
        setFollowingCount(data.following_count || 0);
        console.log("📊 Following count:", data.following_count);
      }
    } catch (err: any) {
      console.error("❌ Erro ao contar seguindo:", err);
    }
  }, [targetProfileId]);

  useEffect(() => {
    if (targetProfileId && currentUserType) {
      console.log("🔄 Carregando dados iniciais do useConnections");
      checkFollowStatus();
      getFollowerCount();
      getFollowingCount();
    }
  }, [targetProfileId, currentUserType]);

  return {
    isFollowing,
    isLoading,
    error,
    followerCount,
    followingCount,
    follow,
    unfollow,
    checkFollowStatus,
    getFollowerCount,
    getFollowingCount,
  };
}

export default useConnections;
