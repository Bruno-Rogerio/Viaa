// src/components/dashboard/shared/feed/CommentSection.tsx
// 🎯 SEÇÃO DE COMENTÁRIOS SIMPLIFICADA PARA MVP - ARQUIVO COMPLETO

"use client";
import { useState, useCallback } from "react";
import { HeartIcon, ChatBubbleLeftIcon } from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolidIcon } from "@heroicons/react/24/solid";
import { useComments } from "@/hooks/dashboard/useComments";
import { useAuth } from "@/contexts/AuthContext";
import { LoadingSpinner } from "../../common";
import Avatar from "../../common/Avatar";

interface CommentSectionProps {
  postId: string;
  postAuthorId: string;
  postAuthorName?: string;
  initialCommentsCount?: number;
  canComment?: boolean;
  className?: string;
}

export default function CommentSection({
  postId,
  postAuthorId,
  postAuthorName = "Autor",
  initialCommentsCount = 0,
  canComment = true,
  className = "",
}: CommentSectionProps) {
  const { user } = useAuth();

  // Estados locais
  const [isExpanded, setIsExpanded] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Hook simplificado
  const {
    comments,
    loading,
    error,
    createComment,
    toggleLike,
    userLikes,
    refresh,
  } = useComments(postId);

  // 🔧 CRIAR COMENTÁRIO
  const handleCreateComment = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!newComment.trim() || submitting) return;

      setSubmitting(true);
      try {
        const success = await createComment(newComment.trim());
        if (success) {
          setNewComment("");
          if (!isExpanded) setIsExpanded(true);
        }
      } finally {
        setSubmitting(false);
      }
    },
    [newComment, submitting, createComment, isExpanded]
  );

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

  const hasComments = comments.length > 0;

  return (
    <div className={`bg-white border border-gray-200 rounded-xl ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">
            Comentários {hasComments && `(${comments.length})`}
          </h3>

          {hasComments && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              {isExpanded ? "Ocultar" : "Ver todos"}
            </button>
          )}
        </div>
      </div>

      {/* Composer */}
      {canComment && (
        <div className="p-4 border-b border-gray-100">
          <form onSubmit={handleCreateComment} className="flex space-x-3">
            <Avatar
              src={user?.user_metadata?.avatar_url}
              alt="Seu avatar"
              size="sm"
              className="flex-shrink-0"
            />
            <div className="flex-1">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder={`Comentar no post de ${postAuthorName}...`}
                className="w-full p-3 border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={2}
                disabled={submitting}
              />
              <div className="mt-2 flex justify-between items-center">
                <span className="text-xs text-gray-500">
                  {newComment.length}/500 caracteres
                </span>
                <button
                  type="submit"
                  disabled={
                    !newComment.trim() || submitting || newComment.length > 500
                  }
                  className={`
                    px-4 py-2 rounded-lg text-sm font-medium transition-colors
                    ${
                      !newComment.trim() ||
                      submitting ||
                      newComment.length > 500
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-blue-600 text-white hover:bg-blue-700"
                    }
                  `}
                >
                  {submitting ? "Enviando..." : "Comentar"}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="p-4 bg-red-50 border-b border-red-100">
          <p className="text-red-800 text-sm">{error}</p>
          <button
            onClick={refresh}
            className="mt-2 text-red-600 hover:text-red-700 text-sm font-medium"
          >
            Tentar novamente
          </button>
        </div>
      )}

      {/* Loading */}
      {loading && !hasComments && (
        <div className="flex items-center justify-center py-8">
          <LoadingSpinner size="md" />
        </div>
      )}

      {/* Preview (collapsed) */}
      {!isExpanded && hasComments && (
        <div className="p-4">
          <div className="space-y-3">
            {comments.slice(0, 2).map((comment) => (
              <div key={comment.id} className="flex items-start space-x-3">
                <Avatar
                  src={comment.author.foto_perfil_url}
                  alt={`${comment.author.nome} ${comment.author.sobrenome}`}
                  size="sm"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 line-clamp-2">
                    <span className="font-medium">{comment.author.nome}:</span>{" "}
                    {comment.content}
                  </p>
                </div>
              </div>
            ))}

            {comments.length > 2 && (
              <button
                onClick={() => setIsExpanded(true)}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Ver mais {comments.length - 2} comentário
                {comments.length - 2 !== 1 ? "s" : ""}...
              </button>
            )}
          </div>
        </div>
      )}

      {/* Full list (expanded) */}
      {isExpanded && hasComments && (
        <div className="divide-y divide-gray-100">
          {comments.map((comment) => {
            const isLiked = userLikes.has(comment.id);

            return (
              <div key={comment.id} className="p-4">
                <div className="flex space-x-3">
                  <Avatar
                    src={comment.author.foto_perfil_url}
                    alt={`${comment.author.nome} ${comment.author.sobrenome}`}
                    size="md"
                  />

                  <div className="flex-1 min-w-0">
                    {/* Header */}
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-semibold text-gray-900 text-sm">
                        {`${comment.author.nome} ${comment.author.sobrenome}`.trim()}
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

                    {/* Actions - só curtir */}
                    <div className="flex items-center">
                      <button
                        onClick={() => toggleLike(comment.id)}
                        disabled={!user}
                        className={`
                          flex items-center space-x-1 px-2 py-1 rounded-lg text-xs font-medium
                          transition-all duration-200 hover:bg-gray-50
                          ${
                            isLiked
                              ? "text-red-600 bg-red-50"
                              : "text-gray-600 hover:text-red-600"
                          }
                          ${
                            !user
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
          })}
        </div>
      )}

      {/* Empty state */}
      {!loading && !hasComments && !error && (
        <div className="text-center py-8">
          <ChatBubbleLeftIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">
            Ainda não há comentários
          </h4>
          <p className="text-gray-600 mb-4">
            {canComment
              ? "Seja o primeiro a comentar e iniciar uma conversa!"
              : "Quando houver comentários, eles aparecerão aqui."}
          </p>
        </div>
      )}
    </div>
  );
}
