// src/types/comments.ts
// 🔥 SISTEMA DE COMENTÁRIOS RENOVADO - Tipos TypeScript

export interface CommentAuthor {
  id: string;
  nome: string;
  sobrenome: string;
  especialidades?: string;
  foto_perfil_url?: string;
  verificado: boolean;
  tipo_usuario: "profissional" | "paciente" | "clinica" | "empresa";
}

export interface CommentReaction {
  id: string;
  comment_id: string;
  user_id: string;
  type: "like" | "love" | "insightful" | "support" | "celebrate";
  created_at: string;
}

export interface CommentMention {
  id: string;
  user_id: string;
  nome: string;
  start_index: number;
  end_index: number;
}

export interface BaseComment {
  id: string;
  content: string;
  post_id: string;
  author_id: string;
  author: CommentAuthor;
  created_at: string;
  updated_at: string;
  edited: boolean;

  // Estatísticas
  reactions_count: number;
  replies_count: number;

  // Relacionamentos
  parent_comment_id?: string;
  thread_root_id?: string; // Sempre aponta para o comentário raiz da thread

  // Reações do usuário atual
  user_reaction?: CommentReaction;

  // Menções no comentário
  mentions: CommentMention[];

  // Estados de UI
  is_highlighted?: boolean;
  is_loading?: boolean;
}

export interface CommentWithReplies extends BaseComment {
  replies: CommentWithReplies[];
  has_more_replies: boolean;
  replies_loaded: boolean;
}

export interface CommentThread {
  root_comment: CommentWithReplies;
  total_replies: number;
  latest_reply_at?: string;
  participants: CommentAuthor[];
}

// Props para componentes
export interface CommentListProps {
  postId: string;
  postAuthorId: string;
  canComment?: boolean;
  maxDepth?: number; // Máximo 2 níveis como LinkedIn
  initialCommentsCount?: number;
}

export interface CommentItemProps {
  comment: CommentWithReplies;
  depth: number;
  maxDepth: number;
  postAuthorId: string;
  currentUserId?: string;
  onReply: (commentId: string, content: string) => Promise<boolean>;
  onReaction: (commentId: string, reactionType: string) => Promise<void>;
  onLoadReplies: (commentId: string) => Promise<void>;
  onEdit?: (commentId: string, newContent: string) => Promise<void>;
  onDelete?: (commentId: string) => Promise<void>;
  isHighlighted?: boolean;
  userLikes?: Set<string>; // Adicionar prop para controle de curtidas
}

export interface CommentComposerProps {
  postId: string;
  parentCommentId?: string;
  replyingTo?: string; // Nome do usuário sendo respondido
  placeholder?: string;
  autoFocus?: boolean;
  onSubmit: (content: string) => Promise<boolean>;
  onCancel?: () => void;
  maxLength?: number;
}

// Hooks return types
export interface UseCommentsReturn {
  comments: CommentThread[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;

  // Actions
  createComment: (content: string, parentId?: string) => Promise<boolean>;
  loadComments: (reset?: boolean) => Promise<void>;
  loadReplies: (commentId: string) => Promise<void>;
  addReaction: (commentId: string, type: string) => Promise<void>;
  removeReaction: (commentId: string) => Promise<void>;
  editComment: (commentId: string, content: string) => Promise<boolean>;
  deleteComment: (commentId: string) => Promise<boolean>;

  // Utils
  findComment: (commentId: string) => CommentWithReplies | null;
  getCommentPath: (commentId: string) => string[];
  refresh: () => Promise<void>;

  // Estado de curtidas do usuário
  userLikes: Set<string>;
}

export interface CommentFilters {
  sort_by: "newest" | "oldest" | "most_relevant";
  author_type?: "profissional" | "paciente" | "all";
  has_replies?: boolean;
}

export interface CommentMetadata {
  total_comments: number;
  total_reactions: number;
  unique_participants: number;
  last_activity_at: string;
}

// API Response types
export interface CreateCommentRequest {
  content: string;
  post_id: string;
  parent_comment_id?: string;
  mentions?: CommentMention[];
}

export interface CommentApiResponse {
  comment: BaseComment;
  thread_metadata?: CommentMetadata;
  parent_updated?: boolean;
}

// Reações disponíveis (LinkedIn style + extras para saúde mental)
export const COMMENT_REACTIONS = {
  like: { emoji: "👍", label: "Curtir", color: "text-blue-600" },
  love: { emoji: "❤️", label: "Amei", color: "text-red-600" },
  insightful: { emoji: "💡", label: "Interessante", color: "text-yellow-600" },
  support: { emoji: "🤝", label: "Apoio", color: "text-green-600" },
  celebrate: { emoji: "🎉", label: "Parabéns", color: "text-purple-600" },
} as const;

export type ReactionType = keyof typeof COMMENT_REACTIONS;
