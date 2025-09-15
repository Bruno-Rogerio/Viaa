// src/components/dashboard/shared/feed/PostCard.tsx
// 📱 VERSÃO TOTALMENTE RESPONSIVA PARA MOBILE

"use client";
import { useState } from "react";
import {
  ShareIcon,
  EllipsisHorizontalIcon,
  CalendarDaysIcon,
  HeartIcon,
  ChatBubbleLeftIcon,
} from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolidIcon } from "@heroicons/react/24/solid";
import Avatar from "../../common/Avatar";
import CommentSection from "./CommentSection";
import { usePostLikes } from "@/hooks/dashboard/usePostLikes";
import { useAuth } from "@/contexts/AuthContext";
import { PerfilProfissional } from "@/types/database";

interface PostCardProps {
  post: {
    id: string;
    author: {
      id: string;
      name: string;
      specialization: string;
      avatar?: string;
      verified: boolean;
    };
    content: string;
    image?: string;
    createdAt: string;
    likes: number;
    comments: number;
    shares: number;
    isLiked: boolean;
    type: string;
  };
  onLike?: () => void;
  canInteract?: boolean;
  canComment?: boolean;
  showScheduleButton?: boolean;
  onSchedule?: () => void;
}

export default function PostCard({
  post,
  onLike,
  canInteract = true,
  canComment = true,
  showScheduleButton = false,
  onSchedule,
}: PostCardProps) {
  // Estados locais para optimistic updates das curtidas
  const [localIsLiked, setLocalIsLiked] = useState(post.isLiked);
  const [localLikesCount, setLocalLikesCount] = useState(post.likes);
  const [isLiking, setIsLiking] = useState(false);
  const [showComments, setShowComments] = useState(false);

  // Usar o novo hook de curtidas
  const { toggleLike } = usePostLikes();

  // Funções auxiliares
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "Agora";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}min`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
    return `${Math.floor(diffInSeconds / 86400)}d`;
  };

  // Função para o novo sistema de curtidas com optimistic updates
  const handleLikeToggle = async (postId: string, isLiked: boolean) => {
    if (isLiking || !canInteract) return; // Evitar cliques múltiplos

    console.log("Clicou no like/unlike", { postId, isLiked });

    // Optimistic update - atualiza interface imediatamente
    const newIsLiked = !isLiked;
    const newCount = isLiked ? localLikesCount - 1 : localLikesCount + 1;

    setLocalIsLiked(newIsLiked);
    setLocalLikesCount(newCount);
    setIsLiking(true);

    try {
      const success = await toggleLike(postId, isLiked);

      if (!success) {
        // Reverter em caso de erro
        setLocalIsLiked(isLiked);
        setLocalLikesCount(post.likes);
      }
    } catch (error) {
      // Reverter em caso de erro
      setLocalIsLiked(isLiked);
      setLocalLikesCount(post.likes);
    } finally {
      setIsLiking(false);
    }
  };

  return (
    <article className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
      {/* 📱 HEADER DO POST - RESPONSIVO */}
      <div className="p-4 sm:p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3 flex-1 min-w-0">
            <Avatar
              src={post.author.avatar}
              alt={post.author.name}
              size="md"
              className="flex-shrink-0"
            />

            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 flex-wrap">
                <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">
                  {post.author.name}
                </h3>
                {post.author.verified && (
                  <span className="text-blue-500 flex-shrink-0">✓</span>
                )}
              </div>

              <p className="text-xs sm:text-sm text-gray-600 line-clamp-2 mt-1">
                {post.author.specialization}
              </p>

              <div className="flex items-center space-x-2 mt-1">
                <time className="text-xs text-gray-500">
                  {formatTimeAgo(post.createdAt)}
                </time>
                {post.type !== "text" && (
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                    {post.type === "image"
                      ? "📷"
                      : post.type === "video"
                      ? "🎥"
                      : "📝"}
                  </span>
                )}
              </div>
            </div>
          </div>

          <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0">
            <EllipsisHorizontalIcon className="w-5 h-5" />
          </button>
        </div>

        {/* 📱 CONTEÚDO DO POST - RESPONSIVO */}
        <div className="mt-4">
          <div className="prose prose-sm sm:prose max-w-none text-gray-900">
            <p className="whitespace-pre-wrap leading-relaxed text-sm sm:text-base">
              {post.content}
            </p>
          </div>

          {/* 📱 IMAGEM RESPONSIVA */}
          {post.image && (
            <div className="mt-4 rounded-lg overflow-hidden bg-gray-100">
              <img
                src={post.image}
                alt="Conteúdo do post"
                className="w-full h-auto max-h-96 object-cover"
                loading="lazy"
              />
            </div>
          )}
        </div>

        {/* 📱 MÉTRICAS - MOBILE FRIENDLY */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
          <div className="flex items-center space-x-4 text-xs sm:text-sm text-gray-500">
            <span>
              {localLikesCount} curtida{localLikesCount !== 1 ? "s" : ""}
            </span>
            <span>
              {post.comments} comentário{post.comments !== 1 ? "s" : ""}
            </span>
            <span>
              {post.shares} compartilhamento{post.shares !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        {/* 📱 AÇÕES - BOTÕES RESPONSIVOS */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-center space-x-1 sm:space-x-2">
            {/* Botão Curtir */}
            {canInteract && (
              <button
                onClick={() => handleLikeToggle(post.id, localIsLiked)}
                disabled={isLiking}
                className={`
                  flex items-center space-x-1.5 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200
                  ${
                    localIsLiked
                      ? "text-red-600 bg-red-50 hover:bg-red-100"
                      : "text-gray-600 hover:text-red-600 hover:bg-red-50"
                  }
                  ${
                    isLiking
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:scale-105"
                  }
                `}
              >
                {localIsLiked ? (
                  <HeartSolidIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                ) : (
                  <HeartIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                )}
                <span className="hidden sm:inline">Curtir</span>
              </button>
            )}

            {/* Botão Comentar */}
            {canComment && (
              <button
                onClick={() => setShowComments(!showComments)}
                className="flex items-center space-x-1.5 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 hover:scale-105"
              >
                <ChatBubbleLeftIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">Comentar</span>
              </button>
            )}

            {/* Botão Compartilhar */}
            <button className="flex items-center space-x-1.5 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium text-gray-600 hover:text-green-600 hover:bg-green-50 transition-all duration-200 hover:scale-105">
              <ShareIcon className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">Compartilhar</span>
            </button>
          </div>

          {/* 📱 BOTÃO AGENDAR - MOBILE FRIENDLY */}
          {showScheduleButton && onSchedule && (
            <button
              onClick={onSchedule}
              className="flex items-center space-x-1.5 px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 hover:scale-105 shadow-sm"
            >
              <CalendarDaysIcon className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Agendar</span>
            </button>
          )}
        </div>
      </div>

      {/* 📱 SEÇÃO DE COMENTÁRIOS - RESPONSIVA */}
      {showComments && canComment && (
        <div className="border-t border-gray-100">
          <CommentSection
            postId={post.id}
            initialCommentsCount={post.comments}
            canComment={canComment}
            postAuthorName={post.author.name}
            postAuthorId={post.author.id}
          />
        </div>
      )}
    </article>
  );
}
