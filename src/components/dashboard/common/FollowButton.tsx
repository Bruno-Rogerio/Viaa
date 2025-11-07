// src/components/dashboard/common/FollowButton.tsx
// 👥 Botão de Seguir/Deixar de Seguir - Versão Melhorada

"use client";
import { useState, useEffect } from "react";
import { useConnections } from "@/hooks/useConnections";
import { UserPlusIcon, CheckIcon } from "@heroicons/react/24/outline";

interface FollowButtonProps {
  userId: string;
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
  onFollowChange?: (isFollowing: boolean) => void;
}

export default function FollowButton({
  userId,
  variant = "primary",
  size = "md",
  showLabel = true,
  className = "",
  onFollowChange,
}: FollowButtonProps) {
  const { isFollowing, isLoading, follow, unfollow, error } =
    useConnections(userId);
  const [localFollowing, setLocalFollowing] = useState(isFollowing);
  const [localLoading, setLocalLoading] = useState(false);

  useEffect(() => {
    setLocalFollowing(isFollowing);
  }, [isFollowing]);

  const handleToggle = async () => {
    if (localLoading || isLoading) return;

    try {
      setLocalLoading(true);
      let success = false;

      if (localFollowing) {
        success = await unfollow();
        if (success) {
          setLocalFollowing(false);
          onFollowChange?.(false);
        }
      } else {
        success = await follow();
        if (success) {
          setLocalFollowing(true);
          onFollowChange?.(true);
        }
      }

      if (!success && error) {
        console.error("Erro ao alterar status de seguir:", error);
      }
    } catch (error) {
      console.error("Erro ao alterar status:", error);
    } finally {
      setLocalLoading(false);
    }
  };

  // Classes de tamanho
  const sizeClasses = {
    sm: "px-2 py-1 text-xs",
    md: "px-3 py-1.5 text-sm",
    lg: "px-4 py-2 text-base",
  };

  // Classes de variante
  const getVariantClasses = () => {
    if (variant === "primary") {
      return localFollowing
        ? "bg-gray-200 text-gray-700 hover:bg-gray-300 border border-gray-300"
        : "bg-blue-600 text-white hover:bg-blue-700 border border-blue-600";
    }
    if (variant === "secondary") {
      return localFollowing
        ? "border border-gray-300 text-gray-700 hover:bg-gray-100 bg-white"
        : "border border-blue-600 text-blue-600 hover:bg-blue-50 bg-white";
    }
    // ghost
    return localFollowing
      ? "text-gray-700 hover:bg-gray-100"
      : "text-blue-600 hover:bg-blue-50";
  };

  // Ícone baseado no estado
  const Icon = localFollowing ? CheckIcon : UserPlusIcon;
  const isDisabled = localLoading || isLoading;

  return (
    <button
      onClick={handleToggle}
      disabled={isDisabled}
      className={`
        inline-flex items-center justify-center gap-1.5 rounded-lg font-medium
        transition-all duration-200 
        ${isDisabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
        ${sizeClasses[size]}
        ${getVariantClasses()}
        ${className}
      `}
    >
      {!isDisabled && (
        <Icon
          className={`
          ${size === "sm" ? "w-3 h-3" : ""}
          ${size === "md" ? "w-4 h-4" : ""}
          ${size === "lg" ? "w-5 h-5" : ""}
        `}
        />
      )}

      {isDisabled && (
        <div
          className={`
          animate-spin rounded-full border-b-2 border-current
          ${size === "sm" ? "w-3 h-3" : ""}
          ${size === "md" ? "w-4 h-4" : ""}
          ${size === "lg" ? "w-5 h-5" : ""}
        `}
        />
      )}

      {showLabel && (
        <span>
          {isDisabled ? "..." : localFollowing ? "Seguindo" : "Seguir"}
        </span>
      )}
    </button>
  );
}
