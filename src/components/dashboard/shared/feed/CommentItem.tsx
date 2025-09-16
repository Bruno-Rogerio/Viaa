// src/components/dashboard/shared/feed/CommentItem.tsx
// 🔥 COMENTÁRIO INDIVIDUAL RENOVADO - LinkedIn Style + Reações

"use client";
import { useState, useMemo } from "react";
import {
  HeartIcon,
  ChatBubbleLeftIcon,
  EllipsisHorizontalIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolidIcon } from "@heroicons/react/24/solid";
import Avatar from "../../common/Avatar";
import CommentComposer from "./CommentComposer";
import type { CommentItemProps } from "@/types/comments";
import { COMMENT_REACTIONS } from "@/types/comments";

export default function CommentItem({
  comment,
  depth,
  maxDepth,
  postAuthorId,
  currentUserId,
  onReply,
  onReaction,
  onLoadReplies,
  onEdit,
  onDelete,
  isHighlighted = false,
}: CommentItemProps) {
  // Estados locais
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [showReplies, setShowReplies] = useState(comment.replies_loaded);
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [isReacting, setIsReacting] = useState(false);

  // Dados derivados
  const authorName =
    `${comment.author.nome} ${comment.author.sobrenome}`.trim();
  const isPostAuthor = comment.author_id === postAuthorId;
  const isCurrentUser = comment.author_id === currentUserId;
  const canReply = depth < maxDepth;
  const hasReplies = comment.replies_count > 0;
  const isReply = depth > 0;

  // 🔧 FORMATAÇÃO DE TEMPO
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "agora";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}min`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d`;
    return date.toLocaleDateString("pt-BR");
  };

  // 🔧 MANIPULAR REAÇÃO
  const handleReaction = async (reactionType: string) => {
    if (isReacting) return;

    setIsReacting(true);
    setShowReactionPicker(false);

    try {
      // Se já tem a mesma reação, remove. Senão, adiciona a nova
      if (comment.user_reaction?.type === reactionType) {
        await onReaction(comment.id, ""); // Remove reação
      } else {
        await onReaction(comment.id, reactionType);
      }
    } catch (error) {
      console.error("Erro ao reagir:", error);
    } finally {
      setIsReacting(false);
    }
  };

  // 🔧 MANIPULAR RESPOSTA
  const handleReplyClick = () => {
    if (!canReply) return;
    setShowReplyForm(true);
    onReply(comment.id, authorName);
  };

  const handleReplySubmit = async (content: string): Promise<boolean> => {
    // Esta função será conectada ao hook useComments
    setShowReplyForm(false);
    return true;
  };

  const handleReplyCancel = () => {
    setShowReplyForm(false);
  };

  // 🔧 CARREGAR RESPOSTAS
  const handleLoadReplies = async () => {
    if (!hasReplies || comment.replies_loaded) return;

    try {
      await onLoadReplies(comment.id);
      setShowReplies(true);
    } catch (error) {
      console.error("Erro ao carregar respostas:", error);
    }
  };

  // 🔧 TOGGLE RESPOSTAS
  const handleToggleReplies = () => {
    if (!hasReplies) return;

    if (!comment.replies_loaded) {
      handleLoadReplies();
    } else {
      setShowReplies(!showReplies);
    }
  };

  // 🔧 REAÇÃO ATIVA
  const activeReaction = comment.user_reaction?.type;
  const reactionData = activeReaction
    ? COMMENT_REACTIONS[activeReaction as keyof typeof COMMENT_REACTIONS]
    : null;

  return (
    <div
      className={`
        ${isReply ? "ml-8 sm:ml-12" : ""} 
        ${isHighlighted ? "bg-blue-50 border-l-4 border-blue-400 pl-4" : ""}
        transition-colors duration-200
      `}
    >
      {/* Thread line para respostas */}
      {isReply && (
        <div className="absolute left-6 sm:left-9 top-0 w-0.5 h-full bg-gray-200 -z-10" />
      )}

      <div className="flex space-x-3 py-3">
        {/* Avatar */}
        <Avatar
          src={comment.author.foto_perfil_url}
          alt={authorName}
          size={isReply ? "sm" : "md"}
          className="flex-shrink-0"
        />

        {/* Conteúdo principal */}
        <div className="flex-1 min-w-0">
          {/* Header do comentário */}
          <div className="flex items-start justify-between mb-1">
            <div className="flex items-center space-x-2 flex-wrap">
              {/* Nome e badges */}
              <span className="font-semibold text-gray-900 text-sm hover:underline cursor-pointer">
                {authorName}
              </span>

              {/* Badge de verificação */}
              {comment.author.verificado && (
                <div className="flex items-center">
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
                </div>
              )}

              {/* Badge de autor do post */}
              {isPostAuthor && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                  Autor
                </span>
              )}

              {/* Especialização */}
              {comment.author.especialidades && (
                <span className="text-xs text-gray-600">
                  {comment.author.especialidades}
                </span>
              )}

              {/* Tempo */}
              <span className="text-xs text-gray-500">•</span>
              <time className="text-xs text-gray-500">
                {formatTimeAgo(comment.created_at)}
              </time>

              {/* Indicador de editado */}
              {comment.edited && (
                <span className="text-xs text-gray-500">(editado)</span>
              )}
            </div>

            {/* Menu de opções */}
            <div className="flex-shrink-0">
              <button
                className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                onClick={() => {
                  /* TODO: Implementar menu */
                }}
              >
                <EllipsisHorizontalIcon className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Conteúdo do comentário */}
          <div className="mb-2">
            <p className="text-gray-900 text-sm leading-relaxed break-words whitespace-pre-wrap">
              {comment.content}
            </p>
          </div>

          {/* Ações do comentário */}
          <div className="flex items-center space-x-4 mb-2">
            {/* Reações */}
            <div className="relative">
              <button
                onClick={() => setShowReactionPicker(!showReactionPicker)}
                disabled={isReacting}
                className={`
                  flex items-center space-x-1 px-2 py-1 rounded-lg text-xs font-medium
                  transition-all duration-200 hover:bg-gray-100
                  ${
                    activeReaction
                      ? `${reactionData?.color} bg-gray-50`
                      : "text-gray-600 hover:text-gray-900"
                  }
                  ${
                    isReacting
                      ? "opacity-50 cursor-not-allowed"
                      : "cursor-pointer"
                  }
                `}
              >
                {activeReaction ? (
                  <>
                    <span>{reactionData?.emoji}</span>
                    <span>{reactionData?.label}</span>
                  </>
                ) : (
                  <>
                    <HeartIcon className="w-4 h-4" />
                    <span>Curtir</span>
                  </>
                )}
                {comment.reactions_count > 0 && (
                  <span className="ml-1">({comment.reactions_count})</span>
                )}
              </button>

              {/* Picker de reações */}
              {showReactionPicker && (
                <div className="absolute bottom-full mb-2 left-0 bg-white border border-gray-200 rounded-lg shadow-lg p-2 z-20 flex space-x-1">
                  {Object.entries(COMMENT_REACTIONS).map(([type, data]) => (
                    <button
                      key={type}
                      onClick={() => handleReaction(type)}
                      className={`
                        w-8 h-8 rounded-lg transition-all duration-200 hover:scale-110 hover:bg-gray-100
                        ${
                          comment.user_reaction?.type === type
                            ? "bg-gray-100 ring-2 ring-blue-400"
                            : ""
                        }
                      `}
                      title={data.label}
                    >
                      <span className="text-lg">{data.emoji}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Responder */}
            {canReply && (
              <button
                onClick={handleReplyClick}
                className="flex items-center space-x-1 px-2 py-1 rounded-lg text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
              >
                <ChatBubbleLeftIcon className="w-4 h-4" />
                <span>Responder</span>
              </button>
            )}

            {/* Ver respostas */}
            {hasReplies && (
              <button
                onClick={handleToggleReplies}
                className="flex items-center space-x-1 px-2 py-1 rounded-lg text-xs font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-colors"
              >
                {showReplies ? (
                  <>
                    <ChevronUpIcon className="w-4 h-4" />
                    <span>
                      Ocultar {comment.replies_count} resposta
                      {comment.replies_count !== 1 ? "s" : ""}
                    </span>
                  </>
                ) : (
                  <>
                    <ChevronDownIcon className="w-4 h-4" />
                    <span>
                      Ver {comment.replies_count} resposta
                      {comment.replies_count !== 1 ? "s" : ""}
                    </span>
                  </>
                )}
              </button>
            )}
          </div>

          {/* Formulário de resposta */}
          {showReplyForm && (
            <div className="mt-3">
              <CommentComposer
                postId={comment.post_id}
                parentCommentId={comment.id}
                replyingTo={authorName}
                autoFocus={true}
                onSubmit={handleReplySubmit}
                onCancel={handleReplyCancel}
                maxLength={500}
              />
            </div>
          )}

          {/* Respostas aninhadas */}
          {showReplies &&
            comment.replies_loaded &&
            comment.replies.length > 0 && (
              <div className="mt-3 space-y-0">
                {comment.replies.map((reply) => (
                  <CommentItem
                    key={reply.id}
                    comment={reply}
                    depth={depth + 1}
                    maxDepth={maxDepth}
                    postAuthorId={postAuthorId}
                    currentUserId={currentUserId}
                    onReply={onReply}
                    onReaction={onReaction}
                    onLoadReplies={onLoadReplies}
                    onEdit={onEdit}
                    onDelete={onDelete}
                  />
                ))}
              </div>
            )}

          {/* Indicador de mais respostas */}
          {hasReplies && !comment.replies_loaded && (
            <div className="mt-2">
              <button
                onClick={handleLoadReplies}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium hover:underline"
              >
                Carregar {comment.replies_count} resposta
                {comment.replies_count !== 1 ? "s" : ""}...
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Separador sutil entre comentários principais */}
      {!isReply && <div className="border-b border-gray-100 last:border-b-0" />}
    </div>
  );
}
