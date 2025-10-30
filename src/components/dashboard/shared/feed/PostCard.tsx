// src/components/dashboard/shared/feed/PostCard.tsx
// 🎯 Componente de card para exibir posts no feed (sem dependências externas)

import { useState } from "react";
import Link from "next/link";
import {
  HeartIcon,
  ChatBubbleLeftIcon,
  EyeIcon,
  ShareIcon,
  ArrowTopRightOnSquareIcon,
} from "@heroicons/react/24/outline";
import { HeartIcon as HeartIconSolid } from "@heroicons/react/24/solid";

interface PostCardProps {
  post: any;
  onLike: () => void;
  showComments?: boolean;
  linkToDetail?: boolean;
}

export default function PostCard({
  post,
  onLike,
  showComments = false,
  linkToDetail = false,
}: PostCardProps) {
  const [imageError, setImageError] = useState(false);

  // Formatador de tempo relativo simplificado (sem date-fns)
  const formatRelativeTime = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();

      // Converter para segundos
      const diffSec = Math.floor(diffMs / 1000);

      // Menos de um minuto
      if (diffSec < 60) {
        return "agora";
      }

      // Minutos
      const diffMin = Math.floor(diffSec / 60);
      if (diffMin < 60) {
        return `há ${diffMin} ${diffMin === 1 ? "minuto" : "minutos"}`;
      }

      // Horas
      const diffHours = Math.floor(diffMin / 60);
      if (diffHours < 24) {
        return `há ${diffHours} ${diffHours === 1 ? "hora" : "horas"}`;
      }

      // Dias
      const diffDays = Math.floor(diffHours / 24);
      if (diffDays < 30) {
        return `há ${diffDays} ${diffDays === 1 ? "dia" : "dias"}`;
      }

      // Meses
      const diffMonths = Math.floor(diffDays / 30);
      if (diffMonths < 12) {
        return `há ${diffMonths} ${diffMonths === 1 ? "mês" : "meses"}`;
      }

      // Anos
      const diffYears = Math.floor(diffMonths / 12);
      return `há ${diffYears} ${diffYears === 1 ? "ano" : "anos"}`;
    } catch (error) {
      console.error("Erro ao formatar data:", error);
      return "recentemente";
    }
  };

  // Formatar data de criação
  const formattedDate = formatRelativeTime(post.created_at);

  // Handler para curtir o post
  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    if (e.stopPropagation) e.stopPropagation();
    onLike();
  };

  return (
    <div className="bg-white rounded-b-xl border border-gray-200 overflow-hidden">
      {/* Conteúdo do post */}
      <div className="px-4 py-3">
        {/* Texto */}
        <div className="text-gray-800 text-sm whitespace-pre-line mb-3">
          {post.content}
        </div>

        {/* Imagem (se houver) */}
        {post.image_url && !imageError && (
          <div className="mt-3 mb-4 rounded-lg overflow-hidden bg-gray-100">
            <img
              src={post.image_url}
              alt="Imagem do post"
              className="w-full object-cover max-h-96"
              onError={() => setImageError(true)}
            />
          </div>
        )}

        {/* Vídeo (se houver) */}
        {post.video_url && (
          <div className="mt-3 mb-4 rounded-lg overflow-hidden bg-gray-100">
            <video controls className="w-full max-h-96" poster={post.image_url}>
              <source src={post.video_url} />
              Seu navegador não suporta a tag de vídeo.
            </video>
          </div>
        )}
      </div>

      {/* Footer com interações */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-t border-gray-100">
        {/* Data de publicação */}
        <div className="text-xs text-gray-500">{formattedDate}</div>

        {/* Interações */}
        <div className="flex space-x-4">
          {/* Likes */}
          <button
            onClick={handleLike}
            className={`flex items-center text-xs ${
              post.is_liked
                ? "text-red-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {post.is_liked ? (
              <HeartIconSolid className="w-4 h-4 mr-1" />
            ) : (
              <HeartIcon className="w-4 h-4 mr-1" />
            )}
            <span>{post.likes_count || 0}</span>
          </button>

          {/* Comentários */}
          {linkToDetail ? (
            <Link
              href={`/dashboard/post/${post.id}`}
              className="flex items-center text-xs text-gray-500 hover:text-gray-700"
            >
              <ChatBubbleLeftIcon className="w-4 h-4 mr-1" />
              <span>{post.comments_count || 0}</span>
            </Link>
          ) : (
            <button
              className="flex items-center text-xs text-gray-500 hover:text-gray-700"
              onClick={() => {
                /* Toggle comments */
              }}
            >
              <ChatBubbleLeftIcon className="w-4 h-4 mr-1" />
              <span>{post.comments_count || 0}</span>
            </button>
          )}

          {/* Visualizações (apenas visual) */}
          <div className="flex items-center text-xs text-gray-500">
            <EyeIcon className="w-4 h-4 mr-1" />
            <span>{Math.floor(Math.random() * 100) + 50}</span>
          </div>

          {/* Link para detalhes */}
          {linkToDetail && (
            <Link
              href={`/dashboard/post/${post.id}`}
              className="flex items-center text-xs text-gray-500 hover:text-gray-700"
            >
              <ArrowTopRightOnSquareIcon className="w-4 h-4 mr-1" />
              <span>Detalhes</span>
            </Link>
          )}
        </div>
      </div>

      {/* Seção de comentários (opcional) */}
      {showComments && post.comments?.length > 0 && (
        <div className="border-t border-gray-100 px-4 py-3 bg-gray-50">
          <h4 className="text-xs font-medium text-gray-700 mb-2">
            Comentários
          </h4>
          <div className="space-y-3">
            {post.comments.map((comment: any) => (
              <div key={comment.id} className="flex space-x-2">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs">
                  {comment.author?.nome?.charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="text-xs font-medium text-gray-700">
                    {comment.author?.nome} {comment.author?.sobrenome}
                  </div>
                  <div className="text-xs text-gray-600">{comment.content}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
