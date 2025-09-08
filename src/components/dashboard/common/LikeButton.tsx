// viaa/src/components/dashboard/common/LikeButton.tsx

"use client";
import { useState, useEffect } from "react";
import { HeartIcon } from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolidIcon } from "@heroicons/react/24/solid";

interface LikeButtonProps {
  postId: string;
  initialLiked: boolean;
  initialCount: number;
  onLike: (postId: string, isLiked: boolean) => Promise<boolean>;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
  showCount?: boolean;
  className?: string;
}

export default function LikeButton({
  postId,
  initialLiked,
  initialCount,
  onLike,
  disabled = false,
  size = "md",
  showCount = true,
  className = "",
}: LikeButtonProps) {
  // Estados locais para optimistic updates
  const [isLiked, setIsLiked] = useState(initialLiked);
  const [likeCount, setLikeCount] = useState(initialCount);
  const [isLoading, setIsLoading] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // Sincronizar com props quando mudarem
  useEffect(() => {
    setIsLiked(initialLiked);
    setLikeCount(initialCount);
  }, [initialLiked, initialCount]);

  // Definir tamanhos
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  const textSizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  // Handle like/unlike
  const handleLike = async () => {
    if (disabled || isLoading) return;

    // Optimistic update - atualiza interface imediatamente
    const wasLiked = isLiked;
    const oldCount = likeCount;

    setIsLiked(!wasLiked);
    setLikeCount(oldCount + (wasLiked ? -1 : 1));
    setIsLoading(true);

    // Animação de pulse
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 300);

    try {
      // Chamar função de like/unlike
      const success = await onLike(postId, wasLiked);

      if (!success) {
        // Rollback em caso de erro
        setIsLiked(wasLiked);
        setLikeCount(oldCount);
      }
    } catch (error) {
      console.error("Erro ao curtir post:", error);
      // Rollback em caso de erro
      setIsLiked(wasLiked);
      setLikeCount(oldCount);
    } finally {
      setIsLoading(false);
    }
  };

  // Formatação do contador
  const formatCount = (count: number): string => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  return (
    <button
      onClick={handleLike}
      disabled={disabled || isLoading}
      className={`
        group flex items-center space-x-2 transition-all duration-200 
        hover:bg-red-50 px-3 py-2 rounded-lg
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
      aria-label={isLiked ? "Descurtir post" : "Curtir post"}
    >
      {/* Ícone do coração */}
      <div className="relative">
        {isLiked ? (
          <HeartSolidIcon
            className={`
              ${sizeClasses[size]} text-red-500 transition-all duration-200
              ${isAnimating ? "animate-pulse scale-110" : ""}
              ${isLoading ? "animate-pulse" : ""}
              group-hover:scale-110
            `}
          />
        ) : (
          <HeartIcon
            className={`
              ${sizeClasses[size]} text-gray-500 transition-all duration-200
              group-hover:text-red-500 group-hover:scale-110
              ${isLoading ? "animate-pulse" : ""}
            `}
          />
        )}

        {/* Loading spinner */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-3 h-3 border border-red-300 border-t-red-500 rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* Contador de curtidas */}
      {showCount && (
        <span
          className={`
            ${textSizeClasses[size]} font-medium transition-colors duration-200
            ${isLiked ? "text-red-600" : "text-gray-600"}
            group-hover:text-red-600
          `}
        >
          {formatCount(likeCount)}
        </span>
      )}
    </button>
  );
}
