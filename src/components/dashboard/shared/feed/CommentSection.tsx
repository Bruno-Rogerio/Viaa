// src/components/dashboard/shared/feed/CommentSection.tsx
// 🔥 SEÇÃO DE COMENTÁRIOS RENOVADA - Sistema Completo LinkedIn-Style

"use client";
import { useState, useCallback, useMemo } from "react";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  FunnelIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import CommentComposer from "./CommentComposer";
import CommentThread from "./CommentThread";
import { useComments } from "@/hooks/dashboard/useComments";
import { LoadingSpinner } from "../../common";
import type { CommentFilters } from "@/types/comments";

interface CommentSectionProps {
  postId: string;
  postAuthorId: string;
  postAuthorName?: string;
  initialCommentsCount?: number;
  canComment?: boolean;
  maxDepth?: number;
  className?: string;
}

export default function CommentSection({
  postId,
  postAuthorId,
  postAuthorName = "Autor",
  initialCommentsCount = 0,
  canComment = true,
  maxDepth = 2,
  className = "",
}: CommentSectionProps) {
  // Estados locais
  const [isExpanded, setIsExpanded] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<"most_relevant" | "newest" | "oldest">(
    "most_relevant"
  );

  // Hook de comentários
  const {
    comments,
    loading,
    error,
    hasMore,
    createComment,
    loadComments,
    loadReplies,
    addReaction,
    removeReaction,
    refresh,
  } = useComments(postId, { sort_by: sortBy });

  // Dados derivados
  const totalComments = comments.reduce(
    (total, thread) => total + 1 + thread.total_replies,
    0
  );

  const hasComments = comments.length > 0;
  const showLoadMore = hasMore && hasComments;

  // 🔧 MANIPULAR CRIAÇÃO DE COMENTÁRIO
  const handleCreateComment = useCallback(
    async (content: string): Promise<boolean> => {
      const success = await createComment(content);

      if (success && !isExpanded) {
        setIsExpanded(true); // Expandir automaticamente após criar comentário
      }

      return success;
    },
    [createComment, isExpanded]
  );

  // 🔧 MANIPULAR RESPOSTA
  const handleReply = useCallback((commentId: string, authorName: string) => {
    console.log(`Respondendo ao comentário ${commentId} de ${authorName}`);
    // A lógica de resposta é gerenciada pelo CommentItem
  }, []);

  // 🔧 MANIPULAR REAÇÕES
  const handleReaction = useCallback(
    async (commentId: string, reactionType: string) => {
      if (reactionType) {
        await addReaction(commentId, reactionType);
      } else {
        await removeReaction(commentId);
      }
    },
    [addReaction, removeReaction]
  );

  // 🔧 CARREGAR MAIS COMENTÁRIOS
  const handleLoadMore = useCallback(async () => {
    await loadComments(false);
  }, [loadComments]);

  // 🔧 ATUALIZAR ORDENAÇÃO
  const handleSortChange = useCallback((newSort: typeof sortBy) => {
    setSortBy(newSort);
    // O useComments vai recarregar automaticamente quando filters mudarem
  }, []);

  // 🔧 OPÇÕES DE ORDENAÇÃO
  const sortOptions = [
    { value: "most_relevant", label: "Mais relevantes", icon: "🔥" },
    { value: "newest", label: "Mais recentes", icon: "⏰" },
    { value: "oldest", label: "Mais antigos", icon: "📅" },
  ] as const;

  return (
    <div className={`bg-white border border-gray-200 rounded-xl ${className}`}>
      {/* Header da seção */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <h3 className="font-semibold text-gray-900">
              Comentários {totalComments > 0 && `(${totalComments})`}
            </h3>

            {/* Botão expandir/colapsar */}
            {hasComments && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                {isExpanded ? (
                  <>
                    <ChevronUpIcon className="w-4 h-4" />
                    <span>Ocultar</span>
                  </>
                ) : (
                  <>
                    <ChevronDownIcon className="w-4 h-4" />
                    <span>Ver todos</span>
                  </>
                )}
              </button>
            )}
          </div>

          {/* Ações do header */}
          <div className="flex items-center space-x-2">
            {/* Filtros */}
            {hasComments && (
              <div className="relative">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`
                    p-2 rounded-lg transition-colors
                    ${
                      showFilters
                        ? "bg-blue-50 text-blue-600"
                        : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"
                    }
                  `}
                >
                  <FunnelIcon className="w-4 h-4" />
                </button>

                {/* Dropdown de filtros */}
                {showFilters && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
                    <div className="p-2">
                      <div className="text-xs font-medium text-gray-700 mb-2">
                        Ordenar por:
                      </div>
                      {sortOptions.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => {
                            handleSortChange(option.value);
                            setShowFilters(false);
                          }}
                          className={`
                            w-full flex items-center space-x-2 px-2 py-2 rounded text-sm
                            transition-colors text-left
                            ${
                              sortBy === option.value
                                ? "bg-blue-50 text-blue-700"
                                : "text-gray-700 hover:bg-gray-50"
                            }
                          `}
                        >
                          <span>{option.icon}</span>
                          <span>{option.label}</span>
                          {sortBy === option.value && (
                            <span className="ml-auto text-blue-600">✓</span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Refresh */}
            <button
              onClick={refresh}
              disabled={loading}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors disabled:opacity-50"
              title="Atualizar comentários"
            >
              <ArrowPathIcon
                className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
              />
            </button>
          </div>
        </div>

        {/* Estatísticas rápidas */}
        {hasComments && isExpanded && (
          <div className="mt-3 flex items-center space-x-4 text-xs text-gray-600">
            <span>
              {comments.length} comentário{comments.length !== 1 ? "s" : ""}
            </span>
            {totalComments > comments.length && (
              <span>
                {totalComments - comments.length} resposta
                {totalComments - comments.length !== 1 ? "s" : ""}
              </span>
            )}
            {comments.some((thread) => thread.participants.length > 1) && (
              <span>
                {Math.max(
                  ...comments.map((thread) => thread.participants.length)
                )}{" "}
                participante
                {Math.max(
                  ...comments.map((thread) => thread.participants.length)
                ) !== 1
                  ? "s"
                  : ""}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Composer para novos comentários */}
      {canComment && (
        <div className="p-4 border-b border-gray-100">
          <CommentComposer
            postId={postId}
            placeholder={`Comentar no post de ${postAuthorName}...`}
            onSubmit={handleCreateComment}
            maxLength={2000}
          />
        </div>
      )}

      {/* Estado de erro */}
      {error && (
        <div className="p-4 bg-red-50 border-b border-red-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-red-600">⚠️</span>
              <span className="text-red-800 text-sm font-medium">
                Erro ao carregar comentários
              </span>
            </div>
            <button
              onClick={refresh}
              className="text-red-600 hover:text-red-700 text-sm font-medium"
            >
              Tentar novamente
            </button>
          </div>
          {process.env.NODE_ENV === "development" && (
            <p className="text-red-600 text-xs mt-1">{error}</p>
          )}
        </div>
      )}

      {/* Loading inicial */}
      {loading && !hasComments && (
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <LoadingSpinner size="md" />
            <p className="mt-2 text-sm text-gray-600">
              Carregando comentários...
            </p>
          </div>
        </div>
      )}

      {/* Lista de comentários */}
      {isExpanded && hasComments && (
        <div className="divide-y divide-gray-100">
          {comments.map((thread, index) => (
            <CommentThread
              key={thread.root_comment.id}
              thread={thread}
              maxDepth={maxDepth}
              postAuthorId={postAuthorId}
              onReply={handleReply}
              onReaction={handleReaction}
              onLoadReplies={loadReplies}
              isFirst={index === 0}
              isLast={index === comments.length - 1}
            />
          ))}
        </div>
      )}

      {/* Preview de comentários (quando colapsado) */}
      {!isExpanded && hasComments && (
        <div className="p-4">
          <div className="space-y-3">
            {comments.slice(0, 2).map((thread) => (
              <div
                key={thread.root_comment.id}
                className="flex items-center space-x-3"
              >
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="text-xs font-medium text-gray-600">
                      {thread.root_comment.author.nome.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 truncate">
                    <span className="font-medium">
                      {thread.root_comment.author.nome}:
                    </span>{" "}
                    {thread.root_comment.content}
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

      {/* Carregar mais */}
      {isExpanded && showLoadMore && (
        <div className="p-4 border-t border-gray-100">
          <button
            onClick={handleLoadMore}
            disabled={loading}
            className="w-full py-2 text-sm text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center justify-center space-x-2">
                <LoadingSpinner size="sm" />
                <span>Carregando mais comentários...</span>
              </div>
            ) : (
              "Carregar mais comentários"
            )}
          </button>
        </div>
      )}

      {/* Empty state */}
      {!loading && !hasComments && !error && (
        <div className="text-center py-8">
          <div className="text-4xl mb-3">💬</div>
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

      {/* Debug info (desenvolvimento) */}
      {process.env.NODE_ENV === "development" && hasComments && (
        <div className="p-2 bg-gray-50 border-t text-xs text-gray-600">
          <div className="flex justify-between">
            <span>📊 Threads: {comments.length}</span>
            <span>💬 Total: {totalComments}</span>
            <span>🔄 Loading: {loading ? "Sim" : "Não"}</span>
            <span>📄 Mais: {hasMore ? "Sim" : "Não"}</span>
          </div>
        </div>
      )}
    </div>
  );
}
