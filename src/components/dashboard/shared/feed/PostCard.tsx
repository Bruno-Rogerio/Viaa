// src/components/dashboard/shared/feed/PostCard.tsx
// 🔧 VERSÃO CORRIGIDA - Mobile responsivo sem ícones "voando"

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
    if (isLiking || !canInteract) return;

    // Optimistic update - atualiza interface imediatamente
    const newIsLiked = !isLiked;
    const newCount = isLiked ? localLikesCount - 1 : localLikesCount + 1;

    setLocalIsLiked(newIsLiked);
    setLocalLikesCount(newCount);
    setIsLiking(true);

    try {
      await toggleLike(postId, newIsLiked);
      onLike?.();
    } catch (error) {
      console.error("Erro ao curtir/descurtir:", error);
      // Reverter mudanças em caso de erro
      setLocalIsLiked(isLiked);
      setLocalLikesCount(post.likes);
    } finally {
      setIsLiking(false);
    }
  };

  return (
    <article className="dashboard-card viaa-safe-container">
      {/* 🔧 HEADER DO POST - LAYOUT RESPONSIVO CONTROLADO */}
      <div className="viaa-flex-safe space-x-3 mb-3 sm:mb-4">
        {/* Avatar */}
        <div className="flex-shrink-0">
          <Avatar
            src={post.author.avatar}
            alt={post.author.name}
            size="md"
            className="responsive-icon-lg"
          />
        </div>

        {/* Informações do autor - TEXTO RESPONSIVO */}
        <div className="flex-1 min-w-0">
          <div className="viaa-flex-safe space-x-2">
            <h3 className="responsive-body-lg font-semibold text-gray-900 viaa-text-safe">
              {post.author.name}
            </h3>
            {post.author.verified && (
              <div className="flex-shrink-0">
                <svg
                  className="responsive-icon-sm text-blue-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            )}
          </div>

          {/* Especialização e tempo - TEXTO RESPONSIVO */}
          <div className="viaa-flex-safe space-x-2 mt-0.5">
            <p className="responsive-body-sm text-gray-600 viaa-text-safe">
              {post.author.specialization}
            </p>
            <span className="responsive-body-sm text-gray-400">•</span>
            <time className="responsive-body-sm text-gray-500 flex-shrink-0">
              {formatTimeAgo(post.createdAt)}
            </time>
          </div>
        </div>

        {/* Menu de opções - TAMANHO RESPONSIVO */}
        <div className="flex-shrink-0">
          <button className="p-1 sm:p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
            <EllipsisHorizontalIcon className="responsive-icon-sm" />
          </button>
        </div>
      </div>

      {/* 🔧 CONTEÚDO DO POST - TEXTO RESPONSIVO */}
      <div className="mb-3 sm:mb-4">
        <p className="responsive-body-lg text-gray-900 text-break-mobile leading-relaxed">
          {post.content}
        </p>
      </div>

      {/* 🔧 IMAGEM - RESPONSIVA */}
      {post.image && (
        <div className="mb-3 sm:mb-4 -mx-3 sm:-mx-4 lg:-mx-6">
          <img
            src={post.image}
            alt="Post image"
            className="w-full h-48 sm:h-64 lg:h-80 object-cover"
          />
        </div>
      )}

      {/* 🔧 ESTATÍSTICAS - LAYOUT RESPONSIVO */}
      <div className="viaa-flex-safe justify-between py-2 sm:py-3 border-t border-gray-100">
        <div className="viaa-flex-safe space-x-4 sm:space-x-6">
          <span className="responsive-body-sm text-gray-600">
            {localLikesCount} curtidas
          </span>
          <span className="responsive-body-sm text-gray-600">
            {post.comments} comentários
          </span>
          <span className="responsive-body-sm text-gray-600">
            {post.shares} compartilhamentos
          </span>
        </div>
      </div>

      {/* 🔧 AÇÕES - BOTÕES RESPONSIVOS E SEGUROS */}
      <div className="viaa-flex-safe justify-between items-center pt-2 sm:pt-3 border-t border-gray-100">
        {/* Grupo de ações principais */}
        <div className="viaa-flex-safe space-x-1 sm:space-x-2">
          {/* Botão Curtir */}
          {canInteract && (
            <button
              onClick={() => handleLikeToggle(post.id, localIsLiked)}
              disabled={isLiking}
              className={`
                viaa-button-adaptive
                ${
                  localIsLiked
                    ? "text-red-600 bg-red-50 hover:bg-red-100"
                    : "text-gray-600 hover:text-red-600 hover:bg-red-50"
                }
                ${isLiking ? "opacity-50 cursor-not-allowed" : ""}
              `}
            >
              {localIsLiked ? (
                <HeartSolidIcon className="responsive-icon-sm" />
              ) : (
                <HeartIcon className="responsive-icon-sm" />
              )}
              <span className="hidden sm:inline">Curtir</span>
            </button>
          )}

          {/* Botão Comentar */}
          {canComment && (
            <button
              onClick={() => setShowComments(!showComments)}
              className="viaa-button-adaptive text-gray-600 hover:text-blue-600 hover:bg-blue-50"
            >
              <ChatBubbleLeftIcon className="responsive-icon-sm" />
              <span className="hidden sm:inline">Comentar</span>
            </button>
          )}

          {/* Botão Compartilhar */}
          <button className="viaa-button-adaptive text-gray-600 hover:text-green-600 hover:bg-green-50">
            <ShareIcon className="responsive-icon-sm" />
            <span className="hidden sm:inline">Compartilhar</span>
          </button>
        </div>

        {/* 🔧 BOTÃO AGENDAR - RESPONSIVO */}
        {showScheduleButton && onSchedule && (
          <button
            onClick={onSchedule}
            className="viaa-button-adaptive bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
          >
            <CalendarDaysIcon className="responsive-icon-sm" />
            <span className="hidden xs:inline">Agendar</span>
          </button>
        )}
      </div>

      {/* 🔧 SEÇÃO DE COMENTÁRIOS - RESPONSIVA */}
      {showComments && canComment && (
        <div className="border-t border-gray-100 mt-3 sm:mt-4">
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
