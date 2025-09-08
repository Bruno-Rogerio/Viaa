// viaa\src\components\dashboard\shared\feed\PostCard.tsx

"use client";
import { useState } from "react";
import {
  ShareIcon,
  EllipsisHorizontalIcon,
  CalendarDaysIcon,
  HeartIcon,
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
    if (isLiking) return; // Evitar cliques múltiplos

    console.log("Clicou no like/unlike", { postId, isLiked });

    // Optimistic update - atualiza interface imediatamente
    const newIsLiked = !isLiked;
    const newCount = isLiked ? localLikesCount - 1 : localLikesCount + 1;

    setLocalIsLiked(newIsLiked);
    setLocalLikesCount(newCount);
    setIsLiking(true);

    try {
      // Fazer chamada real para API
      const success = await toggleLike(postId, isLiked);

      if (!success) {
        // Reverter em caso de erro
        setLocalIsLiked(isLiked);
        setLocalLikesCount(localLikesCount);
        console.error("Erro ao processar curtida");
      }
    } catch (error) {
      // Reverter em caso de erro
      setLocalIsLiked(isLiked);
      setLocalLikesCount(localLikesCount);
      console.error("Erro na requisição de curtida:", error);
    } finally {
      setIsLiking(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      {/* Header do Post */}
      <div className="p-6 pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Avatar src={post.author.avatar} alt={post.author.name} size="md" />
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold text-gray-900 text-sm">
                  {post.author.name}
                </h3>
                {post.author.verified && (
                  <span className="text-blue-500 text-sm">✓</span>
                )}
              </div>
              <p className="text-gray-600 text-xs">
                {post.author.specialization}
              </p>
              <p className="text-gray-500 text-xs">
                {formatTimeAgo(post.createdAt)}
              </p>
            </div>
          </div>

          {/* Menu de opções */}
          <button className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100">
            <EllipsisHorizontalIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Conteúdo do Post */}
      <div className="px-6 pb-4">
        <p className="text-gray-900 text-sm leading-relaxed whitespace-pre-wrap">
          {post.content}
        </p>
      </div>

      {/* Imagem do Post */}
      {post.image && (
        <div className="px-6 pb-4">
          <img
            src={post.image}
            alt="Imagem do post"
            className="w-full rounded-lg object-cover max-h-96"
          />
        </div>
      )}

      {/* Ações do Post */}
      <div className="px-6 py-4 border-t border-gray-100">
        <div className="flex items-center justify-between">
          {/* Botão de Curtir */}
          {canInteract && (
            <button
              onClick={() => handleLikeToggle(post.id, localIsLiked)}
              disabled={isLiking}
              className={`
                group flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors
                ${
                  localIsLiked
                    ? "text-red-600"
                    : "text-gray-600 hover:text-red-600"
                }
                ${isLiking ? "opacity-70" : ""}
              `}
            >
              {localIsLiked ? (
                <HeartSolidIcon className="w-5 h-5 text-red-500 group-hover:scale-110 transition-transform" />
              ) : (
                <HeartIcon className="w-5 h-5 group-hover:text-red-500 group-hover:scale-110 transition-transform" />
              )}
              <span className="text-sm font-medium">{localLikesCount}</span>
              {isLiking && (
                <div className="w-3 h-3 border border-red-300 border-t-red-500 rounded-full animate-spin" />
              )}
            </button>
          )}

          {/* Sistema de Comentários */}
          <CommentSection
            postId={post.id}
            initialCommentsCount={post.comments}
            canComment={canComment}
            postAuthorName={post.author.name}
            postAuthorId={post.author.id} // LINHA ADICIONADA - ID do autor para lógica de menções
          />

          {/* Botão de Compartilhar */}
          {canInteract && (
            <button className="flex items-center space-x-2 text-gray-600 hover:text-green-600 px-3 py-2 rounded-lg hover:bg-green-50 transition-colors">
              <ShareIcon className="w-5 h-5" />
              <span className="text-sm font-medium">{post.shares}</span>
            </button>
          )}
        </div>

        {/* Botão de Agendar (para pacientes) */}
        {showScheduleButton && onSchedule && (
          <button
            onClick={onSchedule}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors mt-4"
          >
            <CalendarDaysIcon className="w-4 h-4" />
            <span className="text-sm font-medium">Agendar</span>
          </button>
        )}
      </div>
    </div>
  );
}
