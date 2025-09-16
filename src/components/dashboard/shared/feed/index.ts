// src/components/dashboard/shared/feed/index.ts
// 🔥 EXPORTS ORGANIZADOS - Sistema de Feed Renovado

// ==========================================
// COMPONENTES PRINCIPAIS
// ==========================================

// PostCard (mantido para compatibilidade)
export { default as PostCard } from "./PostCard";

// Sistema de comentários renovado
export { default as CommentSection } from "./CommentSection";
export { default as CommentComposer } from "./CommentComposer";
export { default as CommentItem } from "./CommentItem";
export { default as CommentThread } from "./CommentThread";

// ==========================================
// TIPOS E INTERFACES
// ==========================================

// Tipos principais de comentários
export type {
  CommentAuthor,
  CommentReaction,
  CommentMention,
  BaseComment,
  CommentWithReplies,
  CommentThread as CommentThreadType,
  CommentMetadata,
} from "@/types/comments";

// Props de componentes
export type {
  CommentListProps,
  CommentItemProps,
  CommentComposerProps,
} from "@/types/comments";

// Hooks e utilitários
export type {
  UseCommentsReturn,
  CommentFilters,
  CreateCommentRequest,
  CommentApiResponse,
} from "@/types/comments";

// Constantes de reações
export { COMMENT_REACTIONS, type ReactionType } from "@/types/comments";

// ==========================================
// HOOKS CUSTOMIZADOS
// ==========================================

// Hook principal de comentários
export { useComments } from "@/hooks/dashboard/useComments";

// Hooks relacionados (se existirem no futuro)
// export { useCommentMentions } from '@/hooks/dashboard/useCommentMentions';
// export { useCommentNotifications } from '@/hooks/dashboard/useCommentNotifications';

// ==========================================
// UTILITÁRIOS E HELPERS
// ==========================================

/**
 * Utilitário para validar conteúdo de comentário
 */
export const validateCommentContent = (
  content: string,
  maxLength: number = 2000
): {
  isValid: boolean;
  error?: string;
  wordCount: number;
  charCount: number;
} => {
  const trimmed = content.trim();
  const wordCount = trimmed
    .split(/\s+/)
    .filter((word) => word.length > 0).length;
  const charCount = trimmed.length;

  if (charCount === 0) {
    return {
      isValid: false,
      error: "Comentário não pode estar vazio",
      wordCount: 0,
      charCount: 0,
    };
  }

  if (charCount > maxLength) {
    return {
      isValid: false,
      error: `Comentário excede o limite de ${maxLength} caracteres`,
      wordCount,
      charCount,
    };
  }

  if (wordCount < 1) {
    return {
      isValid: false,
      error: "Comentário deve ter pelo menos uma palavra",
      wordCount,
      charCount,
    };
  }

  return {
    isValid: true,
    wordCount,
    charCount,
  };
};

/**
 * Utilitário para detectar menções no texto
 */
export const detectMentions = (
  content: string
): Array<{
  id: string;
  user_id: string;
  nome: string;
  start_index: number;
  end_index: number;
}> => {
  const mentions: Array<{
    id: string;
    user_id: string;
    nome: string;
    start_index: number;
    end_index: number;
  }> = [];
  const mentionRegex = /@(\w+)/g;
  let match;

  while ((match = mentionRegex.exec(content)) !== null) {
    mentions.push({
      id: "", // Será preenchido pelo backend
      user_id: "", // Será resolvido pelo backend
      nome: match[1],
      start_index: match.index,
      end_index: match.index + match[0].length,
    });
  }

  return mentions;
};

/**
 * Utilitário para formatar tempo relativo
 */
export const formatRelativeTime = (date: string | Date): string => {
  const targetDate = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor(
    (now.getTime() - targetDate.getTime()) / 1000
  );

  if (diffInSeconds < 60) return "agora";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}min`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d`;
  if (diffInSeconds < 2592000)
    return `${Math.floor(diffInSeconds / 604800)}sem`;

  return targetDate.toLocaleDateString("pt-BR");
};

/**
 * Utilitário para sanitizar conteúdo do comentário
 */
export const sanitizeCommentContent = (content: string): string => {
  return content
    .trim()
    .replace(/\s+/g, " ") // Normalizar espaços múltiplos
    .replace(/\n{3,}/g, "\n\n") // Limitar quebras de linha consecutivas
    .substring(0, 2000); // Garantir limite máximo
};

/**
 * Utilitário para calcular estatísticas de thread
 */
export const calculateThreadStats = (thread: {
  root_comment: any;
  total_replies: number;
  participants: any[];
  latest_reply_at?: string;
}) => {
  const { root_comment, total_replies, participants } = thread;

  return {
    totalComments: 1 + total_replies,
    uniqueParticipants: participants.length,
    hasActivity: total_replies > 0,
    latestActivity: thread.latest_reply_at || root_comment.created_at,
    engagementScore: root_comment.reactions_count + total_replies * 2, // Replies valem 2x
    threadDepth: Math.max(...getAllReplies(root_comment).map(getReplyDepth)),
  };
};

// Helpers internos
const getAllReplies = (comment: any): any[] => {
  const replies: any[] = [];

  if (comment.replies) {
    comment.replies.forEach((reply: any) => {
      replies.push(reply);
      replies.push(...getAllReplies(reply));
    });
  }

  return replies;
};

const getReplyDepth = (comment: any): number => {
  if (!comment.parent_comment_id) return 0;
  // A profundidade seria calculada recursivamente, mas limitamos a 2 níveis
  return comment.parent_comment_id ? 1 : 0;
};

// ==========================================
// CONSTANTES DE CONFIGURAÇÃO
// ==========================================

export const COMMENT_CONFIG = {
  MAX_LENGTH: 2000,
  MAX_DEPTH: 2, // LinkedIn style
  PREVIEW_LENGTH: 150,
  INITIAL_LOAD_COUNT: 10,
  REPLIES_PREVIEW_COUNT: 3,
  PAGINATION_SIZE: 20,
  DEBOUNCE_DELAY: 300, // Para busca/validação
  AUTO_SAVE_DELAY: 5000, // Para drafts futuros
} as const;

export const COMMENT_ERRORS = {
  EMPTY_CONTENT: "Comentário não pode estar vazio",
  TOO_LONG: "Comentário muito longo",
  INVALID_MENTION: "Menção inválida",
  NETWORK_ERROR: "Erro de conexão",
  PERMISSION_DENIED: "Sem permissão para comentar",
  RATE_LIMITED: "Muitos comentários em pouco tempo",
} as const;

// ==========================================
// VERSIONING & MIGRATION
// ==========================================

/**
 * Versão atual do sistema de comentários
 * Usado para migrações futuras
 */
export const COMMENT_SYSTEM_VERSION = "2.0.0";

/**
 * Compatibilidade com sistema anterior
 * Remove quando migração estiver completa
 */
export const LEGACY_SUPPORT = {
  enabled: true,
  deprecatedComponents: ["OldCommentSection", "SimpleCommentForm"],
  migrationPath: "/docs/comment-migration",
} as const;

// ==========================================
// FUTURE FEATURES (PREPARAÇÃO)
// ==========================================

// Tipos para funcionalidades futuras
export interface CommentDraft {
  id: string;
  content: string;
  post_id: string;
  parent_comment_id?: string;
  created_at: string;
  expires_at: string;
}

export interface CommentNotification {
  id: string;
  type: "mention" | "reply" | "reaction";
  comment_id: string;
  recipient_id: string;
  sender_id: string;
  read: boolean;
  created_at: string;
}

// Placeholders para hooks futuros
// export const useCommentDrafts = () => { /* TODO */ };
// export const useCommentNotifications = () => { /* TODO */ };
// export const useCommentModerationv = () => { /* TODO */ };

// ==========================================
// PERFORMANCE MONITORING
// ==========================================

/**
 * Métricas para monitoramento (desenvolvimento)
 */
export const trackCommentMetrics = (action: string, data?: any) => {
  if (process.env.NODE_ENV === "development") {
    console.log(`📊 Comment Metric: ${action}`, data);
  }

  // Em produção, enviar para analytics
  // analytics.track('comment_action', { action, ...data });
};

// ==========================================
// EXPORTS DEFAULT PARA COMPATIBILIDADE
// ==========================================

// Manter export padrão do PostCard para não quebrar imports existentes
export { default } from "./PostCard";
