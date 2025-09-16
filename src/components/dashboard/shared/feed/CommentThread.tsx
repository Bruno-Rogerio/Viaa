// src/components/dashboard/shared/feed/CommentThread.tsx
// 🔥 GERENCIADOR DE THREADS OTIMIZADO - Performance + UX

"use client";
import { useState, useCallback, useMemo, memo } from "react";
import {
  ChevronDownIcon,
  ChevronRightIcon,
  UsersIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import CommentItem from "./CommentItem";
import { useAuth } from "@/contexts/AuthContext";
import type { CommentThread as CommentThreadType } from "@/types/comments";

interface CommentThreadProps {
  thread: CommentThreadType;
  maxDepth: number;
  postAuthorId: string;
  onReply: (commentId: string, authorName: string) => void;
  onReaction: (commentId: string, reactionType: string) => Promise<void>;
  onLoadReplies: (commentId: string) => Promise<void>;
  onEdit?: (commentId: string, content: string) => Promise<void>;
  onDelete?: (commentId: string) => Promise<void>;
  isFirst?: boolean;
  isLast?: boolean;
  className?: string;
}

const CommentThread = memo(function CommentThread({
  thread,
  maxDepth,
  postAuthorId,
  onReply,
  onReaction,
  onLoadReplies,
  onEdit,
  onDelete,
  isFirst = false,
  isLast = false,
  className = "",
}: CommentThreadProps) {
  const { user } = useAuth();

  // Estados locais para otimização
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showAllReplies, setShowAllReplies] = useState(false);
  const [isLoadingReplies, setIsLoadingReplies] = useState(false);

  // Dados derivados
  const {
    root_comment: rootComment,
    total_replies,
    participants,
    latest_reply_at,
  } = thread;
  const hasReplies = total_replies > 0;
  const hasUnloadedReplies = hasReplies && !rootComment.replies_loaded;
  const currentUserId = user?.id;

  // 🔧 REPLIES VISÍVEIS (LAZY LOADING)
  const visibleReplies = useMemo(() => {
    if (!rootComment.replies.length) return [];

    // Se não está mostrando todas, limita a 3 primeiras
    if (!showAllReplies && rootComment.replies.length > 3) {
      return rootComment.replies.slice(0, 3);
    }

    return rootComment.replies;
  }, [rootComment.replies, showAllReplies]);

  const hiddenRepliesCount = rootComment.replies.length - visibleReplies.length;

  // 🔧 METADATA DA THREAD
  const threadMetadata = useMemo(() => {
    if (!hasReplies) return null;

    const uniqueParticipants = participants.length;
    const lastActivity = latest_reply_at ? new Date(latest_reply_at) : null;

    return {
      participants: uniqueParticipants,
      lastActivity,
      formattedLastActivity: lastActivity
        ? formatRelativeTime(lastActivity)
        : null,
    };
  }, [participants, latest_reply_at, hasReplies]);

  // 🔧 FORMATAÇÃO DE TEMPO RELATIVO
  function formatRelativeTime(date: Date): string {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "agora";
    if (diffInSeconds < 3600)
      return `${Math.floor(diffInSeconds / 60)}min atrás`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)}h atrás`;
    if (diffInSeconds < 604800)
      return `${Math.floor(diffInSeconds / 86400)}d atrás`;
    return date.toLocaleDateString("pt-BR");
  }

  // 🔧 CARREGAR RESPOSTAS COM LOADING STATE
  const handleLoadReplies = useCallback(async () => {
    if (isLoadingReplies || rootComment.replies_loaded) return;

    setIsLoadingReplies(true);
    try {
      await onLoadReplies(rootComment.id);
    } catch (error) {
      console.error("Erro ao carregar respostas:", error);
    } finally {
      setIsLoadingReplies(false);
    }
  }, [
    rootComment.id,
    rootComment.replies_loaded,
    isLoadingReplies,
    onLoadReplies,
  ]);

  // 🔧 TOGGLE THREAD COLLAPSE
  const handleToggleCollapse = useCallback(() => {
    setIsCollapsed(!isCollapsed);
  }, [isCollapsed]);

  // 🔧 MOSTRAR TODAS AS RESPOSTAS
  const handleShowAllReplies = useCallback(() => {
    setShowAllReplies(true);
  }, []);

  // 🔧 CALLBACK OTIMIZADO PARA REAÇÕES
  const handleReaction = useCallback(
    async (commentId: string, reactionType: string) => {
      try {
        await onReaction(commentId, reactionType);
      } catch (error) {
        console.error("Erro ao reagir:", error);
      }
    },
    [onReaction]
  );

  return (
    <div className={`relative ${className}`}>
      {/* Thread header com metadata (apenas se tem respostas) */}
      {hasReplies && !isCollapsed && (
        <div className="px-4 py-2 bg-gray-50/50 border-b border-gray-100">
          <div className="flex items-center justify-between">
            {/* Metadata da thread */}
            <div className="flex items-center space-x-4 text-xs text-gray-600">
              {threadMetadata && (
                <>
                  <div className="flex items-center space-x-1">
                    <UsersIcon className="w-3 h-3" />
                    <span>
                      {threadMetadata.participants} participante
                      {threadMetadata.participants !== 1 ? "s" : ""}
                    </span>
                  </div>

                  {threadMetadata.formattedLastActivity && (
                    <div className="flex items-center space-x-1">
                      <ClockIcon className="w-3 h-3" />
                      <span>
                        Última atividade {threadMetadata.formattedLastActivity}
                      </span>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Controles da thread */}
            <div className="flex items-center space-x-2">
              {/* Colapsar thread */}
              <button
                onClick={handleToggleCollapse}
                className="flex items-center space-x-1 px-2 py-1 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
                title="Colapsar thread"
              >
                <ChevronRightIcon className="w-3 h-3" />
                <span>Colapsar</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Thread colapsada (preview) */}
      {isCollapsed && (
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={handleToggleCollapse}
                className="flex items-center space-x-1 text-gray-600 hover:text-gray-800"
              >
                <ChevronDownIcon className="w-4 h-4" />
              </button>

              <div className="flex-1">
                <p className="text-sm text-gray-700 truncate">
                  <span className="font-medium">
                    {rootComment.author.nome}:
                  </span>{" "}
                  {rootComment.content}
                </p>
                {hasReplies && (
                  <p className="text-xs text-gray-500 mt-1">
                    {total_replies} resposta{total_replies !== 1 ? "s" : ""} •{" "}
                    {threadMetadata?.participants} participante
                    {(threadMetadata?.participants || 0) !== 1 ? "s" : ""}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Thread expandida */}
      {!isCollapsed && (
        <div className="relative">
          {/* Comentário raiz */}
          <div className="px-4">
            <CommentItem
              comment={rootComment}
              depth={0}
              maxDepth={maxDepth}
              postAuthorId={postAuthorId}
              currentUserId={currentUserId}
              onReply={onReply}
              onReaction={handleReaction}
              onLoadReplies={onLoadReplies}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          </div>

          {/* Respostas */}
          {hasReplies && (
            <div className="relative">
              {/* Indicador visual de thread */}
              <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-200 to-transparent" />

              {/* Carregar respostas se necessário */}
              {hasUnloadedReplies && (
                <div className="px-4 py-3">
                  <button
                    onClick={handleLoadReplies}
                    disabled={isLoadingReplies}
                    className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50"
                  >
                    {isLoadingReplies ? (
                      <>
                        <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                        <span>
                          Carregando {total_replies} resposta
                          {total_replies !== 1 ? "s" : ""}...
                        </span>
                      </>
                    ) : (
                      <>
                        <ChevronDownIcon className="w-4 h-4" />
                        <span>
                          Ver {total_replies} resposta
                          {total_replies !== 1 ? "s" : ""}
                        </span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Respostas carregadas */}
              {rootComment.replies_loaded && visibleReplies.length > 0 && (
                <div className="space-y-0">
                  {visibleReplies.map((reply, index) => (
                    <div key={reply.id} className="px-4">
                      <CommentItem
                        comment={reply}
                        depth={1}
                        maxDepth={maxDepth}
                        postAuthorId={postAuthorId}
                        currentUserId={currentUserId}
                        onReply={onReply}
                        onReaction={handleReaction}
                        onLoadReplies={onLoadReplies}
                        onEdit={onEdit}
                        onDelete={onDelete}
                        isHighlighted={reply.is_highlighted}
                      />
                    </div>
                  ))}

                  {/* Mostrar respostas ocultas */}
                  {hiddenRepliesCount > 0 && (
                    <div className="px-4 py-2">
                      <button
                        onClick={handleShowAllReplies}
                        className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
                      >
                        <ChevronDownIcon className="w-4 h-4" />
                        <span>
                          Ver mais {hiddenRepliesCount} resposta
                          {hiddenRepliesCount !== 1 ? "s" : ""}
                        </span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Separador entre threads */}
      {!isLast && <div className="border-b border-gray-100" />}

      {/* Debug info para desenvolvimento */}
      {process.env.NODE_ENV === "development" && (
        <div className="px-4 py-1 bg-yellow-50 border-b text-xs text-yellow-800">
          Thread ID: {rootComment.id} | Respostas: {total_replies} | Carregadas:{" "}
          {rootComment.replies.length} | Participantes: {participants.length}
        </div>
      )}
    </div>
  );
});

// 🔧 COMPARAÇÃO PARA MEMO (OTIMIZAÇÃO)
CommentThread.displayName = "CommentThread";

export default CommentThread;
