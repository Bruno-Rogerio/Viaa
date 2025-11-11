// src/components/dashboard/common/FollowButton.tsx
// ✅ BOTÃO DE SEGUIR CORRIGIDO

"use client";
import { useAuth } from "@/contexts/AuthContext";
import { useConnections } from "@/hooks/useConnections";
import { UserPlusIcon, UserMinusIcon } from "@heroicons/react/24/outline";

interface FollowButtonProps {
  targetProfileId: string;
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  onFollow?: () => void;
  onUnfollow?: () => void;
}

export default function FollowButton({
  targetProfileId,
  variant = "primary",
  size = "md",
  onFollow,
  onUnfollow,
}: FollowButtonProps) {
  const { getProfileId, getUserType, getAuthId } = useAuth();

  const currentUserType = getUserType();
  const currentProfileId = getProfileId();
  const authId = getAuthId();

  const { isFollowing, isLoading, error, follow, unfollow } = useConnections(
    targetProfileId,
    currentUserType
  );

  // Não mostrar se não está autenticado
  if (!authId || !currentUserType) {
    return null;
  }

  // Não mostrar se for o próprio usuário
  if (currentProfileId === targetProfileId) {
    return null;
  }

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      if (isFollowing) {
        await unfollow();
        onUnfollow?.();
      } else {
        await follow();
        onFollow?.();
      }
    } catch (err) {
      console.error("Erro ao seguir/deixar de seguir:", err);
    }
  };

  // Estilos
  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
  };

  const variantClasses = {
    primary: isFollowing
      ? "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300"
      : "bg-emerald-600 text-white hover:bg-emerald-700",
    secondary: isFollowing
      ? "bg-gray-200 text-gray-800 hover:bg-gray-300"
      : "bg-blue-100 text-blue-700 hover:bg-blue-200",
    ghost: isFollowing
      ? "text-gray-700 hover:bg-gray-100"
      : "text-emerald-700 hover:bg-emerald-50",
  };

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className={`
        flex items-center justify-center gap-2 font-medium rounded-lg
        transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
        ${sizeClasses[size]} ${variantClasses[variant]}
      `}
    >
      {isLoading ? (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : isFollowing ? (
        <>
          <UserMinusIcon className="w-5 h-5" />
          <span>Seguindo</span>
        </>
      ) : (
        <>
          <UserPlusIcon className="w-5 h-5" />
          <span>Seguir</span>
        </>
      )}
    </button>
  );
}
