// src/components/dashboard/common/FollowButton.tsx
// 🔗 Botão reutilizável de Seguir/Deixar de Seguir
// 🛠️ VERSÃO CORRIGIDA FINAL - RESOLUÇÃO DO PROBLEMA DE USER_ID

"use client";

import { useCallback, useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useConnections } from "@/hooks/useConnections";
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
  // ========== ESTADOS LOCAIS ==========
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);

  // ========== OBTER CONTEXTO ==========
  const { user, profile } = useAuth();

  // ========== DEBUG ==========
  console.log("🔍 FollowButton renderizado com userId:", userId);

  // ========== OBTER TOKEN ==========
  useEffect(() => {
    const getToken = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.access_token) {
          console.log("✅ Token obtido com sucesso");
          setAuthToken(session.access_token);

          // Verificar status de seguir quando temos o token
          checkFollowStatus(session.access_token);
        } else {
          console.warn("⚠️ Nenhum token encontrado na sessão");
        }
      } catch (error) {
        console.error("❌ Erro ao obter token:", error);
      }
    };

    getToken();
  }, [user, userId]);

  // ========== VERIFICAR STATUS ==========
  const checkFollowStatus = useCallback(
    async (token: string) => {
      if (!userId || !token) {
        console.error("🚫 Dados insuficientes para verificar status de seguir");
        return;
      }

      console.log("🔍 Verificando status de follow para userId:", userId);

      try {
        setIsLoading(true);
        setError(null);

        // Fazer a chamada para a API
        const response = await fetch(
          `/api/connections/is-following?user_id=${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
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
      } catch (err) {
        console.error("❌ Erro ao verificar status:", err);
      } finally {
        setIsLoading(false);
      }
    },
    [userId]
  );

  // ========== SEGUIR USUÁRIO ==========
  const follow = useCallback(async () => {
    if (!userId || !authToken) {
      console.error("🚫 Dados insuficientes para seguir usuário");
      return;
    }

    console.log("🔗 Seguindo usuário:", userId);

    try {
      setIsLoading(true);
      setError(null);

      // Preparar os dados para a requisição
      const requestBody = {
        following_id: userId,
      };

      console.log("📤 Dados sendo enviados:", requestBody);

      // Fazer a chamada para a API
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
        console.log("✅ Seguiu com sucesso");
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
  }, [userId, authToken, onFollow]);

  // ========== DEIXAR DE SEGUIR USUÁRIO ==========
  const unfollow = useCallback(async () => {
    if (!userId || !authToken) {
      console.error("🚫 Dados insuficientes para deixar de seguir usuário");
      return;
    }

    console.log("🔗 Deixando de seguir usuário:", userId);

    try {
      setIsLoading(true);
      setError(null);

      // Preparar os dados para a requisição
      const requestBody = {
        following_id: userId,
      };

      console.log("📤 Dados sendo enviados:", requestBody);

      // Fazer a chamada para a API
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
        console.log("✅ Deixou de seguir com sucesso");
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
  }, [userId, authToken, onUnfollow]);

  // ========== HANDLE CLICK ==========
  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      // Impedir comportamento padrão e propagação
      e.preventDefault();
      e.stopPropagation();

      console.log(
        "🖱️ Botão clicado, estado atual:",
        isFollowing ? "Seguindo" : "Não seguindo"
      );

      // Verificar se temos os dados necessários
      if (!userId) {
        console.error("🚫 userId não fornecido, impossível realizar ação");
        setError("ID de usuário inválido");
        return;
      }

      if (!authToken) {
        console.error("🚫 authToken não fornecido, impossível realizar ação");
        setError("Não autenticado");
        return;
      }

      // Executar ação correspondente
      if (isFollowing) {
        console.log("👋 Iniciando processo de deixar de seguir...");
        unfollow();
      } else {
        console.log("👋 Iniciando processo de seguir...");
        follow();
      }
    },
    [isFollowing, userId, authToken, follow, unfollow]
  );

  // ========== VALIDAÇÕES ==========
  // Não mostrar botão se não estiver autenticado
  if (!user) {
    console.log(
      "ℹ️ FollowButton: Usuário não autenticado, não renderizando botão"
    );
    return null;
  }

  // Não mostrar botão se for o próprio usuário
  if (user.id === userId) {
    console.log("ℹ️ FollowButton: É o próprio usuário, não renderizando botão");
    return null;
  }

  // Verificar se userId é válido
  if (!userId) {
    console.error("🚫 userId não fornecido ao componente FollowButton");
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
      type="button" // Importante para evitar submit em formulários
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
