// src/components/dashboard/shared/feed/index.ts
// 🎯 EXPORTS SIMPLIFICADOS PARA MVP

// ==========================================
// COMPONENTES PRINCIPAIS
// ==========================================

// PostCard (mantido para compatibilidade)
export { default as PostCard } from "./PostCard";

// Sistema de comentários simplificado
export { default as CommentSection } from "./CommentSection";

// ==========================================
// HOOKS CUSTOMIZADOS
// ==========================================

// Hook simplificado de comentários
export { useComments } from "@/hooks/dashboard/useComments";

// ==========================================
// UTILITÁRIOS SIMPLES
// ==========================================

/**
 * Utilitário para validar conteúdo de comentário
 */
export const validateCommentContent = (
  content: string,
  maxLength: number = 500
): {
  isValid: boolean;
  error?: string;
  charCount: number;
} => {
  const trimmed = content.trim();
  const charCount = trimmed.length;

  if (charCount === 0) {
    return {
      isValid: false,
      error: "Comentário não pode estar vazio",
      charCount: 0,
    };
  }

  if (charCount > maxLength) {
    return {
      isValid: false,
      error: `Comentário excede o limite de ${maxLength} caracteres`,
      charCount,
    };
  }

  return {
    isValid: true,
    charCount,
  };
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
    .substring(0, 500); // Garantir limite máximo
};

// ==========================================
// CONSTANTES SIMPLES
// ==========================================

export const COMMENT_CONFIG = {
  MAX_LENGTH: 500,
  PREVIEW_COUNT: 2,
  INITIAL_LOAD_COUNT: 20,
} as const;

export const COMMENT_ERRORS = {
  EMPTY_CONTENT: "Comentário não pode estar vazio",
  TOO_LONG: "Comentário muito longo",
  NETWORK_ERROR: "Erro de conexão",
  PERMISSION_DENIED: "Sem permissão para comentar",
} as const;

// ==========================================
// EXPORTS DEFAULT PARA COMPATIBILIDADE
// ==========================================

// Manter export padrão do PostCard para não quebrar imports existentes
export { default } from "./PostCard";
