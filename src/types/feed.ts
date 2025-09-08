// viaa\src\types\feed.ts

export interface Post {
  id: string;
  profissional_id: string;
  content: string;
  image_url?: string;
  video_url?: string;
  type: "text" | "image" | "video" | "article";
  likes_count: number;
  comments_count: number;
  shares_count: number;
  created_at: string;
  updated_at: string;
  is_active: boolean;

  // Dados do autor (join com perfis_profissionais)
  author: {
    id: string;
    nome: string;
    sobrenome: string;
    especialidades: string;
    foto_perfil_url?: string;
    verificado: boolean;
  };

  // Estado do usuário atual
  is_liked?: boolean;
  user_like_id?: string;
}

export interface PostLike {
  id: string;
  post_id: string;
  profissional_id: string;
  created_at: string;
}

export interface PostComment {
  id: string;
  post_id: string;
  profissional_id: string;
  content: string;
  parent_comment_id?: string;
  likes_count: number;
  created_at: string;
  updated_at: string;
  is_active: boolean;

  // Dados do autor (join com perfis_profissionais)
  author: {
    id: string;
    nome: string;
    sobrenome: string;
    especialidades: string;
    foto_perfil_url?: string;
    verificado: boolean;
  };

  // Respostas (se for um comentário pai)
  replies?: PostComment[];

  // Estado do usuário atual
  is_liked?: boolean;
  user_like_id?: string;
}

export interface CreatePostData {
  content: string;
  image_url?: string;
  video_url?: string;
  type?: "text" | "image" | "video" | "article";
}

export interface CreateCommentData {
  post_id: string;
  content: string;
  parent_comment_id?: string;
}

export interface FeedFilters {
  type: "all" | "connections" | "trending" | "recent";
  author_id?: string;
  search?: string;
}

export interface FeedPagination {
  page: number;
  limit: number;
  total: number;
  has_more: boolean;
}
