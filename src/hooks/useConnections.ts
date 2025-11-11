// src/hooks/useConnections.ts
// ✅ HOOK CORRIGIDO - Com validações de tipo de usuário

import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";

interface UserProfile {
  id: string;
  user_id: string;
  nome: string;
  sobrenome: string;
  tipo: "profissional" | "paciente";
  foto_perfil_url?: string;
  especialidades?: string;
}

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

  const getAuthToken = async (): Promise<string | null> => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      return session?.access_token || null;
    } catch {
      return null;
    }
  };

  const follow = useCallback(async () => {
    if (!targetProfileId || !currentUserType) {
      setError("Dados insuficientes para seguir");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const token = await getAuthToken();
      if (!token) throw new Error("Não autenticado");

      const response = await fetch("/api/connections/follow", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ following_id: targetProfileId }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Erro ao seguir");
      }

      setIsFollowing(true);
      await getFollowerCount();
    } catch (err: any) {
      console.error("❌ Erro ao seguir:", err);
      setError(err.message || "Erro ao seguir");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [targetProfileId, currentUserType]);

  const unfollow = useCallback(async () => {
    if (!targetProfileId) {
      setError("ID do usuário não fornecido");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const token = await getAuthToken();
      if (!token) throw new Error("Não autenticado");

      const response = await fetch("/api/connections/unfollow", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ following_id: targetProfileId }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Erro ao deixar de seguir");
      }

      setIsFollowing(false);
      await getFollowerCount();
    } catch (err: any) {
      console.error("❌ Erro ao deixar de seguir:", err);
      setError(err.message || "Erro ao deixar de seguir");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [targetProfileId]);

  const checkFollowStatus = useCallback(async () => {
    if (!targetProfileId) return;

    try {
      setIsLoading(true);
      setError(null);

      const token = await getAuthToken();
      if (!token) return;

      const response = await fetch(
        `/api/connections/is-following?user_id=${targetProfileId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await response.json();

      if (data.success) {
        setIsFollowing(data.is_following);
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
      }
    } catch (err: any) {
      console.error("❌ Erro ao contar seguindo:", err);
    }
  }, [targetProfileId]);

  useEffect(() => {
    if (targetProfileId && currentUserType) {
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
