// src/components/dashboard/common/FollowButton.tsx
// 🔗 Botão reutilizável de Seguir/Deixar de Seguir - VERSÃO CORRIGIDA

"use client";

import { useCallback, useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { UserPlusIcon, UserMinusIcon } from "@heroicons/react/24/outline";
import { supabase } from "@/lib/supabase/client";

interface FollowButtonProps {
  userId: string; // ID do usuário a seguir
  variant?: "primary" | "secondary" | "ghost"; // Estilo do botão
  size?: "sm" | "md" | "lg"; // Tamanho do botão
  showLabel?: boolean; // Mostrar texto ou só ícone
  onFollow?: () => void; // Callback após seguir
  onUnfollow?: () => void; // Callback após deixar de seguir
  className?: string; // Classes adicionais
}

export default function FollowButton({
  userId,
  variant = "primary",
  size = "md",
  showLabel = true,
  onFollow,
  onUnfollow,
  className = "",
}: FollowButtonProps) {
  // ========== ESTADOS ==========
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);

  // ========== CONTEXTOS ==========
  const { user, profile } = useAuth();

  // ========== OBTER TOKEN ==========
  useEffect(() => {
    const getToken = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.access_token) {
          setAuthToken(session.access_token);

          // Verificar status de seguir quando temos o token
          checkFollowStatus(session.access_token);
        }
      } catch (error) {
        console.error("Erro ao obter token:", error);
      }
    };

    getToken();
  }, [user, userId]);

  // ========== VERIFICAR STATUS FOLLOW ==========
  const checkFollowStatus = async (token: string) => {
    if (!userId || !token) return;

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(
        `/api/connections/is-following?user_id=${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
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
      setError("Erro ao verificar status");
    } finally {
      setIsLoading(false);
    }
  };

  // ========== FOLLOW USER ==========
  const follow = async () => {
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
        onFollow?.();
      } else {
        console.error("❌ Erro ao seguir:", data.error);
        setError(data.error || "Erro ao seguir");
      }
    } catch (err: any) {
      console.error("❌ Erro ao seguir:", err);
      setError(err.message || "Erro ao seguir");
    } finally {
      setIsLoading(false);
    }
  };

  // ========== UNFOLLOW USER ==========
  const unfollow = async () => {
    if (!userId || !authToken) return;

    try {
      setIsLoading(true);
      setError(null);

      console.log("🔗 Deixando de seguir usuário:", userId);

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
        onUnfollow?.();
      } else {
        console.error("❌ Erro ao deixar de seguir:", data.error);
        setError(data.error || "Erro ao deixar de seguir");
      }
    } catch (err: any) {
      console.error("❌ Erro ao deixar de seguir:", err);
      setError(err.message || "Erro ao deixar de seguir");
    } finally {
      setIsLoading(false);
    }
  };

  // ========== HANDLE CLICK ==========
  const handleClick = useCallback(async () => {
    try {
      if (isFollowing) {
        await unfollow();
      } else {
        await follow();
      }
    } catch (err) {
      console.error("Erro ao seguir/deixar de seguir:", err);
    }
  }, [isFollowing, follow, unfollow]);

  // ========== VALIDAÇÕES ==========
  // Não mostrar botão se não estiver autenticado
  if (!user) {
    return null;
  }

  // Não mostrar botão se for o próprio usuário
  if (user.id === userId) {
    return null;
  }

  // ========== ESTILOS ==========
  const baseStyles =
    "flex items-center justify-center gap-2 font-medium transition-all duration-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed";

  const variantStyles = {
    primary: `${
      isFollowing
        ? "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300"
        : "bg-emerald-600 text-white hover:bg-emerald-700"
    }`,
    secondary: `${
      isFollowing
        ? "bg-gray-200 text-gray-800 hover:bg-gray-300"
        : "bg-blue-100 text-blue-700 hover:bg-blue-200"
    }`,
    ghost: `${
      isFollowing
        ? "bg-transparent text-gray-600 hover:bg-gray-100 border border-gray-300"
        : "bg-transparent text-emerald-600 hover:bg-emerald-50 border border-emerald-600"
    }`,
  };

  const sizeStyles = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
  };

  // ========== RENDERIZAR ==========
  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      title={isFollowing ? "Deixar de seguir" : "Seguir"}
    >
      {isLoading ? (
        <>
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          {showLabel && <span>Processando...</span>}
        </>
      ) : isFollowing ? (
        <>
          <UserMinusIcon className="w-5 h-5" />
          {showLabel && <span>Deixar de Seguir</span>}
        </>
      ) : (
        <>
          <UserPlusIcon className="w-5 h-5" />
          {showLabel && <span>Seguir</span>}
        </>
      )}

      {error && (
        <span className="text-xs text-red-600 absolute -bottom-6 left-0 whitespace-nowrap">
          {error}
        </span>
      )}
    </button>
  );
}
