// src/components/dashboard/shared/feed/CommentComposer.tsx
// 🔥 COMPOSER DE COMENTÁRIOS RENOVADO - LinkedIn Style + Melhorias

"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import {
  FaceSmileIcon,
  PhotoIcon,
  PaperAirplaneIcon,
  XMarkIcon,
  AtSymbolIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "@/contexts/AuthContext";
import { PerfilProfissional } from "@/types/database";
import Avatar from "../../common/Avatar";
import type { CommentComposerProps } from "@/types/comments";

export default function CommentComposer({
  postId,
  parentCommentId,
  replyingTo,
  placeholder = "Adicione um comentário...",
  autoFocus = false,
  onSubmit,
  onCancel,
  maxLength = 1000,
}: CommentComposerProps) {
  const { user, profile } = useAuth();
  const profileData = profile?.dados as PerfilProfissional | null;

  // Estados
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExpanded, setIsExpanded] = useState(autoFocus || !!replyingTo);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");
  const [showMentions, setShowMentions] = useState(false);

  // Refs
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const composerRef = useRef<HTMLDivElement>(null);

  // Estados derivados
  const isReply = !!parentCommentId;
  const isEmpty = !content.trim();
  const isNearLimit = content.length > maxLength * 0.8;
  const isOverLimit = content.length > maxLength;
  const remainingChars = maxLength - content.length;

  // 🔧 AUTO-RESIZE DO TEXTAREA
  const adjustTextareaHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    // Reset height to calculate new height
    textarea.style.height = "auto";

    // Calculate new height (min 20px, max 120px for replies, 160px for main comments)
    const maxHeight = isReply ? 120 : 160;
    const newHeight = Math.min(textarea.scrollHeight, maxHeight);

    textarea.style.height = `${Math.max(newHeight, 40)}px`;
  }, [isReply]);

  // 🔧 EXPANDIR COMPOSER AO FOCAR
  const handleFocus = () => {
    if (!isExpanded) {
      setIsExpanded(true);
    }
  };

  // 🔧 COLAPSAR SE VAZIO E PERDER FOCO
  const handleBlur = (e: React.FocusEvent) => {
    // Só colapsa se não for resposta e estiver vazio
    if (
      !isReply &&
      isEmpty &&
      !composerRef.current?.contains(e.relatedTarget as Node)
    ) {
      setIsExpanded(false);
    }
  };

  // 🔧 MANIPULAR MUDANÇAS NO CONTEÚDO
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;

    // Detectar menções (@)
    const lastAtIndex = value.lastIndexOf("@");
    const cursorPosition = e.target.selectionStart;

    if (lastAtIndex >= 0 && lastAtIndex < cursorPosition) {
      const afterAt = value.slice(lastAtIndex + 1, cursorPosition);
      if (!afterAt.includes(" ") && afterAt.length <= 20) {
        setMentionQuery(afterAt);
        setShowMentions(true);
      } else {
        setShowMentions(false);
      }
    } else {
      setShowMentions(false);
    }

    setContent(value);
  };

  // 🔧 ENVIAR COMENTÁRIO
  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();

    if (isEmpty || isOverLimit || isSubmitting) return;

    setIsSubmitting(true);

    try {
      const success = await onSubmit(content.trim());

      if (success) {
        setContent("");
        setIsExpanded(!isReply); // Manter expandido para comentários principais

        // Focar novamente se for comentário principal
        if (!isReply) {
          setTimeout(() => textareaRef.current?.focus(), 100);
        }
      }
    } catch (error) {
      console.error("Erro ao enviar comentário:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 🔧 CANCELAR (PARA RESPOSTAS)
  const handleCancel = () => {
    setContent("");
    setIsExpanded(false);
    onCancel?.();
  };

  // 🔧 INSERIR EMOJI
  const insertEmoji = (emoji: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newContent = content.slice(0, start) + emoji + content.slice(end);

    setContent(newContent);
    setShowEmojiPicker(false);

    // Restaurar cursor após emoji
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + emoji.length, start + emoji.length);
    }, 0);
  };

  // 🔧 EMOJIS RÁPIDOS PARA SAÚDE MENTAL
  const quickEmojis = ["😊", "❤️", "🙏", "💪", "🌟", "🤗", "💜", "✨"];

  // 🔧 TECLAS DE ATALHO
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Ctrl/Cmd + Enter para enviar
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    }

    // Escape para cancelar (apenas respostas)
    if (e.key === "Escape" && isReply) {
      handleCancel();
    }
  };

  // Effects
  useEffect(() => {
    adjustTextareaHeight();
  }, [content, adjustTextareaHeight]);

  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [autoFocus]);

  // Preparar placeholder dinâmico
  const dynamicPlaceholder = replyingTo
    ? `Responder para ${replyingTo}...`
    : placeholder;

  return (
    <div
      ref={composerRef}
      className={`
        transition-all duration-200 ease-in-out
        ${
          isReply
            ? "bg-blue-50/50 border border-blue-200 rounded-lg p-3"
            : "bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow"
        }
        ${isExpanded ? "ring-2 ring-blue-500/20" : ""}
      `}
      onBlur={handleBlur}
    >
      {/* Header da resposta */}
      {isReply && replyingTo && (
        <div className="flex items-center justify-between mb-2 text-sm text-blue-700">
          <div className="flex items-center space-x-1">
            <AtSymbolIcon className="w-4 h-4" />
            <span>
              Respondendo para <strong>{replyingTo}</strong>
            </span>
          </div>
          {onCancel && (
            <button
              onClick={handleCancel}
              className="p-1 hover:bg-blue-100 rounded text-blue-600"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* Main composer */}
      <div className="flex space-x-3">
        {/* Avatar */}
        <Avatar
          src={profileData?.foto_perfil_url}
          alt={profileData?.nome || "Usuário"}
          size={isReply ? "sm" : "md"}
          className="flex-shrink-0 mt-1"
        />

        {/* Input area */}
        <div className="flex-1 min-w-0">
          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Textarea */}
            <div className="relative">
              <textarea
                ref={textareaRef}
                value={content}
                onChange={handleContentChange}
                onFocus={handleFocus}
                onKeyDown={handleKeyDown}
                placeholder={dynamicPlaceholder}
                className={`
                  w-full resize-none border-0 outline-none bg-transparent
                  placeholder-gray-500 text-gray-900
                  ${isExpanded ? "min-h-[40px]" : "h-10"}
                  ${isReply ? "text-sm" : "text-base"}
                  ${isOverLimit ? "text-red-600" : ""}
                `}
                style={{
                  scrollbarWidth: "thin",
                  scrollbarColor: "#cbd5e0 transparent",
                }}
                disabled={isSubmitting}
                maxLength={maxLength + 50} // Soft limit
              />

              {/* Character counter */}
              {isExpanded && (isNearLimit || isOverLimit) && (
                <div
                  className={`
                  absolute bottom-2 right-2 text-xs
                  ${isOverLimit ? "text-red-600" : "text-yellow-600"}
                `}
                >
                  {remainingChars < 0
                    ? `${Math.abs(remainingChars)} caracteres excedidos`
                    : `${remainingChars} restantes`}
                </div>
              )}
            </div>

            {/* Expanded controls */}
            {isExpanded && (
              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                {/* Left actions */}
                <div className="flex items-center space-x-2">
                  {/* Emoji picker */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      disabled={isSubmitting}
                    >
                      <FaceSmileIcon className="w-5 h-5" />
                    </button>

                    {/* Quick emojis */}
                    {showEmojiPicker && (
                      <div className="absolute bottom-full mb-2 left-0 bg-white border border-gray-200 rounded-lg shadow-lg p-2 z-10">
                        <div className="flex space-x-1">
                          {quickEmojis.map((emoji, index) => (
                            <button
                              key={index}
                              type="button"
                              onClick={() => insertEmoji(emoji)}
                              className="w-8 h-8 hover:bg-gray-100 rounded text-lg leading-none flex items-center justify-center"
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Future: Media upload */}
                  <button
                    type="button"
                    className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg transition-colors opacity-50 cursor-not-allowed"
                    disabled
                    title="Em breve: Upload de imagens"
                  >
                    <PhotoIcon className="w-5 h-5" />
                  </button>
                </div>

                {/* Right actions */}
                <div className="flex items-center space-x-2">
                  {/* Cancel button (replies only) */}
                  {isReply && onCancel && (
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                      disabled={isSubmitting}
                    >
                      Cancelar
                    </button>
                  )}

                  {/* Submit button */}
                  <button
                    type="submit"
                    disabled={isEmpty || isOverLimit || isSubmitting}
                    className={`
                      flex items-center space-x-1.5 px-4 py-1.5 rounded-lg text-sm font-medium
                      transition-all duration-200
                      ${
                        isEmpty || isOverLimit || isSubmitting
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-blue-600 text-white hover:bg-blue-700 hover:scale-105 active:scale-95"
                      }
                    `}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Enviando...</span>
                      </>
                    ) : (
                      <>
                        <PaperAirplaneIcon className="w-4 h-4" />
                        <span>{isReply ? "Responder" : "Comentar"}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </form>

          {/* Keyboard shortcuts hint */}
          {isExpanded && !isSubmitting && (
            <div className="mt-2 text-xs text-gray-500">
              Pressione{" "}
              <kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">
                Ctrl+Enter
              </kbd>{" "}
              para enviar
              {isReply &&
                ' • <kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">Esc</kbd> para cancelar'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
