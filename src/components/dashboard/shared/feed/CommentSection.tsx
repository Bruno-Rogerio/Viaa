// viaa\src\components\dashboard\shared\feed\CommentSection.tsx

"use client";
import { useState } from "react";
import {
  HeartIcon,
  ChatBubbleLeftIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolidIcon } from "@heroicons/react/24/solid";
import Avatar from "../../common/Avatar";
import { useComments } from "@/hooks/dashboard/useComments";
import { useAuth } from "@/contexts/AuthContext";
import { PerfilProfissional } from "@/types/database";

interface CommentSectionProps {
  postId: string;
  initialCommentsCount: number;
  canComment?: boolean;
  postAuthorName?: string;
  postAuthorId?: string;
}

// Definir tipos locais simples que funcionam
interface CommentAuthor {
  id: string;
  nome: string;
  sobrenome: string;
  especialidades: string;
  foto_perfil_url?: string;
  verificado: boolean;
}

interface SimpleComment {
  id: string;
  content: string;
  created_at: string;
  likes_count: number;
  post_id: string;
  profissional_id: string;
  parent_comment_id?: string;
  author: CommentAuthor;
  replies?: SimpleComment[];
}

interface CommentItemProps {
  comment: SimpleComment;
  onReply: (
    commentId: string,
    authorName: string,
    isPostAuthor: boolean
  ) => void;
  onLike: (commentId: string) => void;
  onSubmitReply: (content: string, parentCommentId: string) => Promise<boolean>;
  activeReplyId?: string | null;
  onCancelReply?: () => void;
  postAuthorName?: string;
  postAuthorId?: string;
  currentUserId?: string;
}

// Componente para formulário de resposta
function ReplyForm({
  commentId,
  authorName,
  onSubmit,
  onCancel,
  isPostAuthor = false,
  needsMention = false,
}: {
  commentId: string;
  authorName: string;
  onSubmit: (content: string, parentCommentId: string) => Promise<boolean>;
  onCancel: () => void;
  isPostAuthor?: boolean;
  needsMention?: boolean;
}) {
  // LinkedIn Logic: Só adiciona menção se não for o autor do post respondendo
  const initialText = needsMention && !isPostAuthor ? `${authorName} ` : "";
  const [replyText, setReplyText] = useState(initialText);
  const { profile } = useAuth();
  const profileData = profile?.dados as PerfilProfissional | null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    const success = await onSubmit(replyText.trim(), commentId);
    if (success) {
      setReplyText("");
      onCancel();
    }
  };

  const placeholderText = isPostAuthor
    ? "Responda ao seu post..."
    : `Responder para ${authorName}...`;

  return (
    <div className="ml-12 mt-3 bg-blue-50 rounded-lg p-3 border-l-2 border-blue-400">
      <div className="flex items-center justify-between mb-2 text-xs text-blue-700">
        <span>
          {isPostAuthor
            ? "Respondendo ao seu post"
            : `Respondendo para ${authorName}`}
        </span>
        <button
          onClick={onCancel}
          className="text-blue-800 hover:text-blue-900 p-1 rounded hover:bg-blue-200 transition-colors"
        >
          <XMarkIcon className="w-3 h-3" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-2">
        <div className="flex space-x-2">
          <Avatar
            src={profileData?.foto_perfil_url}
            alt={profileData?.nome || "Você"}
            size="sm"
          />
          <div className="flex-1">
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder={placeholderText}
              className="w-full p-2 border border-blue-200 rounded-lg resize-none focus:ring-1 focus:ring-blue-500 focus:border-transparent text-sm bg-white"
              rows={2}
              maxLength={500}
              autoFocus
            />

            <div className="flex justify-between items-center mt-2">
              <span className="text-xs text-blue-500">
                {replyText.length}/500
              </span>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={onCancel}
                  className="px-2 py-1 text-xs text-gray-600 hover:text-gray-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!replyText.trim()}
                  className="bg-blue-600 text-white px-3 py-1 rounded text-xs font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Responder
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

// Componente para uma resposta individual
function ReplyItem({
  reply,
  onReply,
  onLike,
  activeReplyId,
  onCancelReply,
  onSubmitReply,
  postAuthorId,
  currentUserId,
}: {
  reply: SimpleComment;
  onReply: (
    commentId: string,
    authorName: string,
    isPostAuthor: boolean
  ) => void;
  onLike: (commentId: string) => void;
  activeReplyId?: string | null;
  onCancelReply?: () => void;
  onSubmitReply: (content: string, parentCommentId: string) => Promise<boolean>;
  postAuthorId?: string;
  currentUserId?: string;
}) {
  const [isLiked, setIsLiked] = useState(false);

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "agora";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}min`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
    return `${Math.floor(diffInSeconds / 86400)}d`;
  };

  const authorName = `${reply.author.nome} ${reply.author.sobrenome}`;
  const isShowingReplyForm = activeReplyId === reply.id;
  const isPostAuthor = reply.author.id === postAuthorId;
  const isCurrentUserPostAuthor = currentUserId === postAuthorId;

  return (
    <div className="ml-12 border-l border-gray-200 pl-4 py-2">
      <div className="flex space-x-3">
        <Avatar src={reply.author.foto_perfil_url} alt={authorName} size="sm" />

        <div className="flex-1 min-w-0">
          {/* Header da resposta */}
          <div className="flex items-center space-x-2 mb-1">
            <span className="font-medium text-gray-900 text-sm">
              {authorName}
            </span>
            {reply.author.verificado && (
              <span className="text-blue-500 text-xs">✓</span>
            )}
            {isPostAuthor && (
              <span className="bg-gray-200 text-gray-700 text-xs px-2 py-0.5 rounded-full font-medium">
                Autor(a)
              </span>
            )}
            <span className="text-xs text-gray-500">
              • {formatTimeAgo(reply.created_at)}
            </span>
          </div>

          {/* Conteúdo da resposta */}
          <div className="mb-2">
            <p className="text-gray-800 text-sm leading-relaxed break-words">
              {reply.content}
            </p>
          </div>

          {/* Ações da resposta */}
          <div className="flex items-center space-x-3 text-xs">
            <button
              onClick={() => {
                setIsLiked(!isLiked);
                onLike(reply.id);
              }}
              className={`
                flex items-center space-x-1 transition-colors px-2 py-1 rounded
                ${
                  isLiked
                    ? "text-red-600 bg-red-50"
                    : "text-gray-500 hover:text-red-600 hover:bg-red-50"
                }
              `}
            >
              {isLiked ? (
                <HeartSolidIcon className="w-3 h-3" />
              ) : (
                <HeartIcon className="w-3 h-3" />
              )}
              <span>{isLiked ? reply.likes_count + 1 : reply.likes_count}</span>
            </button>

            {!isShowingReplyForm && (
              <button
                onClick={() =>
                  onReply(reply.id, authorName, isCurrentUserPostAuthor)
                }
                className="text-gray-500 hover:text-blue-600 px-2 py-1 rounded hover:bg-blue-50 transition-colors"
              >
                Responder
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Formulário de resposta */}
      {isShowingReplyForm && onCancelReply && (
        <ReplyForm
          commentId={reply.parent_comment_id || reply.id} // Sempre para o comentário principal
          authorName={authorName}
          onSubmit={onSubmitReply}
          onCancel={onCancelReply}
          isPostAuthor={isCurrentUserPostAuthor}
          needsMention={!isCurrentUserPostAuthor} // Só menciona se não for o autor do post
        />
      )}
    </div>
  );
}

// Componente principal do comentário
function CommentItem({
  comment,
  onReply,
  onLike,
  onSubmitReply,
  activeReplyId,
  onCancelReply,
  postAuthorName,
  postAuthorId,
  currentUserId,
}: CommentItemProps) {
  const [showReplies, setShowReplies] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "agora";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}min`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
    return `${Math.floor(diffInSeconds / 86400)}d`;
  };

  const authorName = `${comment.author.nome} ${comment.author.sobrenome}`;
  const isShowingReplyForm = activeReplyId === comment.id;
  const repliesCount = comment.replies?.length || 0;
  const isPostAuthor = comment.author.id === postAuthorId;
  const isCurrentUserPostAuthor = currentUserId === postAuthorId;

  return (
    <div className="border-b border-gray-100 last:border-b-0 pb-4 last:pb-0">
      {/* Comentário principal */}
      <div className="flex space-x-3 mb-3">
        <Avatar
          src={comment.author.foto_perfil_url}
          alt={authorName}
          size="md"
        />

        <div className="flex-1 min-w-0">
          {/* Header do comentário */}
          <div className="flex items-center space-x-2 mb-2">
            <span className="font-medium text-gray-900 text-sm">
              {authorName}
            </span>
            {comment.author.verificado && (
              <span className="text-blue-500 text-xs">✓</span>
            )}
            {isPostAuthor && (
              <span className="bg-gray-200 text-gray-700 text-xs px-2 py-0.5 rounded-full font-medium">
                Autor(a)
              </span>
            )}
            <span className="text-xs text-gray-500">
              • {formatTimeAgo(comment.created_at)}
            </span>
          </div>

          {/* Conteúdo do comentário */}
          <div className="mb-3">
            <p className="text-gray-800 text-sm leading-relaxed break-words">
              {comment.content}
            </p>
          </div>

          {/* Ações do comentário */}
          <div className="flex items-center space-x-4 text-xs mb-3">
            <button
              onClick={() => {
                setIsLiked(!isLiked);
                onLike(comment.id);
              }}
              className={`
                flex items-center space-x-1 transition-colors px-2 py-1 rounded
                ${
                  isLiked
                    ? "text-red-600 bg-red-50"
                    : "text-gray-500 hover:text-red-600 hover:bg-red-50"
                }
              `}
            >
              {isLiked ? (
                <HeartSolidIcon className="w-3 h-3" />
              ) : (
                <HeartIcon className="w-3 h-3" />
              )}
              <span>
                {isLiked ? comment.likes_count + 1 : comment.likes_count}
              </span>
            </button>

            {!isShowingReplyForm && (
              <button
                onClick={() =>
                  onReply(comment.id, authorName, isCurrentUserPostAuthor)
                }
                className="text-gray-500 hover:text-blue-600 px-2 py-1 rounded hover:bg-blue-50 transition-colors"
              >
                Responder
              </button>
            )}

            {repliesCount > 0 && (
              <button
                onClick={() => setShowReplies(!showReplies)}
                className="text-blue-600 hover:text-blue-700 font-medium px-2 py-1 rounded hover:bg-blue-50 transition-colors"
              >
                {showReplies ? "Ocultar" : "Ver"} {repliesCount} resposta
                {repliesCount !== 1 ? "s" : ""}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Formulário de resposta do comentário principal */}
      {isShowingReplyForm && onCancelReply && (
        <ReplyForm
          commentId={comment.id}
          authorName={authorName}
          onSubmit={onSubmitReply}
          onCancel={onCancelReply}
          isPostAuthor={isCurrentUserPostAuthor}
          needsMention={false} // Primeira resposta nunca precisa de menção
        />
      )}

      {/* Lista de respostas */}
      {showReplies && comment.replies && comment.replies.length > 0 && (
        <div className="space-y-3 mt-3">
          {comment.replies.map((reply) => (
            <ReplyItem
              key={reply.id}
              reply={reply}
              onReply={onReply}
              onLike={onLike}
              activeReplyId={activeReplyId}
              onCancelReply={onCancelReply}
              onSubmitReply={onSubmitReply}
              postAuthorId={postAuthorId}
              currentUserId={currentUserId}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function CommentSection({
  postId,
  initialCommentsCount,
  canComment = true,
  postAuthorName = "",
  postAuthorId = "",
}: CommentSectionProps) {
  const { profile, user } = useAuth();
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);
  const [localCommentsCount, setLocalCommentsCount] =
    useState(initialCommentsCount);

  const profileData = profile?.dados as PerfilProfissional | null;
  const currentUserId = user?.id;

  const {
    comments,
    loading: commentsLoading,
    error: commentsError,
    createComment,
    loadComments,
  } = useComments();

  // Converter para nosso tipo local (type assertion segura)
  const typedComments = comments as SimpleComment[];

  // Calcular total de respostas
  const totalReplies = typedComments.reduce((total, comment) => {
    return total + (comment.replies?.length || 0);
  }, 0);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !canComment) return;

    const success = await createComment({
      post_id: postId,
      content: commentText.trim(),
      parent_comment_id: undefined,
    });

    if (success) {
      setCommentText("");
      setLocalCommentsCount((prev) => prev + 1);
    }
  };

  const handleSubmitReply = async (
    content: string,
    parentCommentId: string
  ): Promise<boolean> => {
    console.log("🔄 Enviando resposta:", { content, parentCommentId, postId });

    const success = await createComment({
      post_id: postId,
      content: content,
      parent_comment_id: parentCommentId,
    });

    console.log("✅ Resultado da resposta:", success);

    if (success) {
      // Recarregar para garantir que está atualizado
      await loadComments(postId);
    }

    return success;
  };

  const handleToggleComments = async () => {
    if (!showComments && typedComments.length === 0) {
      await loadComments(postId);
    }
    setShowComments(!showComments);
  };

  const handleReply = (
    commentId: string,
    authorName: string,
    isPostAuthor: boolean
  ) => {
    console.log("💬 Clicou em responder:", {
      commentId,
      authorName,
      isPostAuthor,
    });
    setActiveReplyId(commentId);
  };

  const handleCancelReply = () => {
    setActiveReplyId(null);
  };

  const handleLikeComment = (commentId: string) => {
    console.log("❤️ Curtir comentário:", commentId);
    // TODO: Implementar sistema de curtidas dos comentários
  };

  return (
    <div className="w-full">
      {/* Barra de ações do post */}
      <div className="flex items-center justify-between py-3 border-t border-gray-100">
        <button
          onClick={handleToggleComments}
          className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 px-3 py-2 rounded-lg hover:bg-blue-50 transition-colors"
        >
          <ChatBubbleLeftIcon className="w-5 h-5" />
          <span className="text-sm font-medium">{localCommentsCount}</span>
          <span className="text-sm text-gray-500 hidden sm:inline">
            comentário{localCommentsCount !== 1 ? "s" : ""}
          </span>
        </button>
      </div>

      {/* Seção de comentários */}
      {showComments && (
        <div className="border-t border-gray-100 pt-4">
          {/* Formulário principal de comentário */}
          {canComment && (
            <div className="mb-6">
              <form onSubmit={handleSubmitComment}>
                <div className="flex space-x-3">
                  <Avatar
                    src={profileData?.foto_perfil_url}
                    alt={profileData?.nome || "Você"}
                    size="md"
                  />
                  <div className="flex-1">
                    <textarea
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder={`Adicione um comentário${
                        postAuthorName ? ` para ${postAuthorName}` : ""
                      }...`}
                      className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      rows={3}
                      maxLength={500}
                    />

                    <div className="flex justify-between items-center mt-2">
                      <span className="text-xs text-gray-400">
                        {commentText.length}/500 caracteres
                      </span>
                      <button
                        type="submit"
                        disabled={!commentText.trim()}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Comentar
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          )}

          {/* Lista de comentários */}
          {commentsLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-sm text-gray-600">
                Carregando comentários...
              </p>
            </div>
          ) : typedComments.length === 0 ? (
            <div className="text-center py-8">
              <ChatBubbleLeftIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-600 text-sm">Nenhum comentário ainda</p>
              <p className="text-gray-500 text-xs">
                Seja o primeiro a comentar!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {typedComments.map((comment: SimpleComment) => (
                <CommentItem
                  key={comment.id}
                  comment={comment}
                  onReply={handleReply}
                  onLike={handleLikeComment}
                  onSubmitReply={handleSubmitReply}
                  activeReplyId={activeReplyId}
                  onCancelReply={handleCancelReply}
                  postAuthorName={postAuthorName}
                  postAuthorId={postAuthorId}
                  currentUserId={currentUserId}
                />
              ))}
            </div>
          )}

          {/* Estado de erro */}
          {commentsError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
              <div className="flex items-center space-x-2">
                <span className="text-red-600">⚠️</span>
                <p className="text-red-800 font-medium">
                  Erro ao carregar comentários
                </p>
              </div>
              <p className="text-red-600 text-sm mt-1">{commentsError}</p>
              <button
                onClick={() => loadComments(postId)}
                className="mt-3 bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700 transition-colors"
              >
                Tentar novamente
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
