// src/components/dashboard/shared/feed/CommentItem.tsx
// 🎯 COMENTÁRIO INDIVIDUAL SIMPLES PARA MVP - NÃO USADO NO SISTEMA ATUAL

"use client";
import { useState } from "react";
import { HeartIcon } from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolidIcon } from "@heroicons/react/24/solid";
import Avatar from "../../common/Avatar";

interface SimpleCommentItemProps {
  comment: {
    id: string;
    content: string;
    created_at: string;
    likes_count: number;
    author: {
      id: string;
      nome: string;
      sobrenome: string;
      especialidades: string;
      foto_perfil_url?: string;
      verificado: boolean;
    };
  };
  isLiked: boolean;
  onToggleLike: (commentId: string) => Promise<void>;
  currentUserId?: string;
}

export default function CommentItem({
  comment,
  isLiked,
  onToggleLike,
  currentUserId,
}: SimpleCommentItemProps) {
  const [isLiking, setIsLiking] = useState(false);

  // 🔧 FORMATAÇÃO DE TEMPO
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "agora";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}min`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
    return `${Math.floor(diffInSeconds / 86400)}d`;
  };

  // 🔧 MANIPULAR CURTIDA
  const handleLike = async () => {
    if (isLiking || !currentUserId) return;

    setIsLiking(true);
    try {
      await onToggleLike(comment.id);
    } catch (error) {
      console.error("Erro ao curtir:", error);
    } finally {
      setIsLiking(false);
    }
  };

  const authorName =
    `${comment.author.nome} ${comment.author.sobrenome}`.trim();

  return (
    <div className="p-4">
      <div className="flex space-x-3">
        <Avatar
          src={comment.author.foto_perfil_url}
          alt={authorName}
          size="md"
        />

        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center space-x-2 mb-1">
            <span className="font-semibold text-gray-900 text-sm">
              {authorName}
            </span>

            {comment.author.verificado && (
              <svg
                className="w-4 h-4 text-blue-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            )}

            <span className="text-xs text-gray-600">
              {comment.author.especialidades}
            </span>

            <span className="text-xs text-gray-500">
              • {formatTimeAgo(comment.created_at)}
            </span>
          </div>

          {/* Content */}
          <p className="text-gray-900 text-sm leading-relaxed mb-3 whitespace-pre-wrap">
            {comment.content}
          </p>

          {/* Ação simples - só curtir */}
          <div className="flex items-center">
            <button
              onClick={handleLike}
              disabled={isLiking || !currentUserId}
              className={`
                flex items-center space-x-1 px-2 py-1 rounded-lg text-xs font-medium
                transition-all duration-200 hover:bg-gray-50
                ${
                  isLiked
                    ? "text-red-600 bg-red-50"
                    : "text-gray-600 hover:text-red-600"
                }
                ${
                  !currentUserId || isLiking
                    ? "opacity-50 cursor-not-allowed"
                    : "cursor-pointer"
                }
              `}
            >
              {isLiked ? (
                <HeartSolidIcon className="w-4 h-4" />
              ) : (
                <HeartIcon className="w-4 h-4" />
              )}
              <span>
                {comment.likes_count > 0 && comment.likes_count}
                {isLiked ? " Curtido" : " Curtir"}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
