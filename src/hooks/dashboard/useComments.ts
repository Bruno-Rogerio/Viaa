// src/hooks/dashboard/useComments.ts
// 🔥 HOOK DE COMENTÁRIOS RENOVADO - LinkedIn Style + Melhorias

import { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type {
  CommentThread,
  CommentWithReplies,
  BaseComment,
  CommentFilters,
  UseCommentsReturn,
  CreateCommentRequest,
  CommentReaction,
} from "@/types/comments";

export const useComments = (
  postId: string,
  initialFilters: CommentFilters = { sort_by: "most_relevant" }
): UseCommentsReturn => {
  const { user } = useAuth();

  // Estados principais
  const [comments, setComments] = useState<CommentThread[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [filters, setFilters] = useState<CommentFilters>(initialFilters);

  // Cache para otimização
  const [commentsCache, setCommentsCache] = useState<
    Map<string, CommentWithReplies>
  >(new Map());

  // 🔧 QUERY BUILDER - Comentários com aninhamento correto
  const buildCommentsQuery = useCallback(() => {
    let query = supabase
      .from("comments")
      .select(
        `
        *,
        author:perfis_profissionais!comments_author_id_fkey (
          id,
          nome,
          sobrenome,
          especialidades,
          foto_perfil_url,
          verificado,
          tipo_usuario
        ),
        user_reaction:comment_reactions!comment_reactions_comment_id_fkey (
          id,
          type,
          created_at
        ),
        reactions_summary:comment_reactions(
          type,
          count
        )
      `
      )
      .eq("post_id", postId)
      .eq("is_active", true);

    // Aplicar filtros
    switch (filters.sort_by) {
      case "newest":
        query = query.order("created_at", { ascending: false });
        break;
      case "oldest":
        query = query.order("created_at", { ascending: true });
        break;
      case "most_relevant":
        // Ordenar por: reações + replies + recente
        query = query
          .order("reactions_count", { ascending: false })
          .order("replies_count", { ascending: false })
          .order("created_at", { ascending: false });
        break;
    }

    return query;
  }, [postId, filters]);

  // 🔧 TRANSFORMAR DADOS - Criar estrutura de threads
  const transformToThreads = useCallback(
    (rawComments: any[]): CommentThread[] => {
      // Separar comentários raiz e respostas
      const rootComments = rawComments.filter((c) => !c.parent_comment_id);
      const replies = rawComments.filter((c) => c.parent_comment_id);

      // Criar mapa de respostas por comentário pai
      const repliesMap = new Map<string, CommentWithReplies[]>();

      replies.forEach((reply) => {
        const parentId = reply.parent_comment_id;
        if (!repliesMap.has(parentId)) {
          repliesMap.set(parentId, []);
        }
        repliesMap.get(parentId)!.push(transformComment(reply));
      });

      // Construir threads completas
      return rootComments.map((rootComment) => {
        const transformedRoot = transformComment(rootComment);
        const commentReplies = repliesMap.get(rootComment.id) || [];

        // Adicionar respostas ao comentário raiz
        transformedRoot.replies = commentReplies;
        transformedRoot.has_more_replies =
          commentReplies.length < rootComment.replies_count;
        transformedRoot.replies_loaded = true;

        // Criar thread
        const thread: CommentThread = {
          root_comment: transformedRoot,
          total_replies: rootComment.replies_count || 0,
          latest_reply_at: commentReplies[0]?.created_at,
          participants: getUniqueParticipants([
            transformedRoot,
            ...commentReplies,
          ]),
        };

        return thread;
      });
    },
    []
  );

  // 🔧 TRANSFORMAR COMENTÁRIO INDIVIDUAL
  const transformComment = (rawComment: any): CommentWithReplies => {
    // Processar reações do usuário atual
    const userReaction = rawComment.user_reaction?.find(
      (r: any) => r.user_id === user?.id
    );

    return {
      id: rawComment.id,
      content: rawComment.content,
      post_id: rawComment.post_id,
      author_id: rawComment.author_id,
      created_at: rawComment.created_at,
      updated_at: rawComment.updated_at,
      edited: rawComment.edited || false,
      parent_comment_id: rawComment.parent_comment_id,
      thread_root_id: rawComment.thread_root_id || rawComment.id,

      // Dados do autor
      author: {
        id: rawComment.author.id,
        nome: rawComment.author.nome,
        sobrenome: rawComment.author.sobrenome || "",
        especialidades: rawComment.author.especialidades,
        foto_perfil_url: rawComment.author.foto_perfil_url,
        verificado: rawComment.author.verificado || false,
        tipo_usuario: rawComment.author.tipo_usuario || "profissional",
      },

      // Estatísticas
      reactions_count: rawComment.reactions_count || 0,
      replies_count: rawComment.replies_count || 0,

      // Reação do usuário
      user_reaction: userReaction
        ? {
            id: userReaction.id,
            comment_id: userReaction.comment_id || rawComment.id,
            user_id: userReaction.user_id || user?.id || "",
            type: userReaction.type as
              | "like"
              | "love"
              | "insightful"
              | "support"
              | "celebrate",
            created_at: userReaction.created_at,
          }
        : undefined,

      // Menções (implementar depois)
      mentions: [],

      // Estado das respostas
      replies: [],
      has_more_replies: false,
      replies_loaded: false,
    };
  };

  // 🔧 PARTICIPANTES ÚNICOS DA THREAD
  const getUniqueParticipants = (comments: CommentWithReplies[]) => {
    const participantsMap = new Map();
    comments.forEach((comment) => {
      participantsMap.set(comment.author.id, comment.author);
    });
    return Array.from(participantsMap.values());
  };

  // 🔧 CARREGAR COMENTÁRIOS PRINCIPAIS
  const loadComments = useCallback(
    async (reset: boolean = true) => {
      try {
        setLoading(true);
        setError(null);

        console.log("🔍 Carregando comentários para post:", postId);

        const query = buildCommentsQuery();
        const { data, error: queryError } = await query.limit(20);

        if (queryError) throw queryError;

        if (!data) {
          setComments([]);
          return;
        }

        console.log(`📊 Comentários recebidos: ${data.length}`);

        const threads = transformToThreads(data);

        if (reset) {
          setComments(threads);
        } else {
          setComments((prev) => [...prev, ...threads]);
        }

        setHasMore(data.length === 20);

        // Atualizar cache
        data.forEach((comment) => {
          commentsCache.set(comment.id, transformComment(comment));
        });
      } catch (err: any) {
        console.error("❌ Erro ao carregar comentários:", err);
        setError(err.message || "Erro ao carregar comentários");
      } finally {
        setLoading(false);
      }
    },
    [postId, buildCommentsQuery, transformToThreads, commentsCache]
  );

  // 🔧 CARREGAR RESPOSTAS DE UM COMENTÁRIO
  const loadReplies = useCallback(
    async (commentId: string) => {
      try {
        console.log("🔍 Carregando respostas para comentário:", commentId);

        const { data, error } = await supabase
          .from("comments")
          .select(
            `
          *,
          author:perfis_profissionais!comments_author_id_fkey (
            id, nome, sobrenome, especialidades, foto_perfil_url, verificado, tipo_usuario
          ),
          user_reaction:comment_reactions!comment_reactions_comment_id_fkey (
            id, type, created_at
          )
        `
          )
          .eq("parent_comment_id", commentId)
          .eq("is_active", true)
          .order("created_at", { ascending: true });

        if (error) throw error;

        // Atualizar thread com as respostas
        setComments((prev) =>
          prev.map((thread) => {
            if (thread.root_comment.id === commentId) {
              const replies = data?.map(transformComment) || [];
              return {
                ...thread,
                root_comment: {
                  ...thread.root_comment,
                  replies,
                  has_more_replies: false,
                  replies_loaded: true,
                },
              };
            }
            return thread;
          })
        );
      } catch (err: any) {
        console.error("❌ Erro ao carregar respostas:", err);
        setError(err.message || "Erro ao carregar respostas");
      }
    },
    [transformComment]
  );

  // 🔧 CRIAR NOVO COMENTÁRIO
  const createComment = useCallback(
    async (content: string, parentId?: string): Promise<boolean> => {
      if (!user || !content.trim()) return false;

      try {
        setError(null);

        const newComment: CreateCommentRequest = {
          content: content.trim(),
          post_id: postId,
          parent_comment_id: parentId,
          mentions: [], // Implementar depois
        };

        const { data, error } = await supabase
          .from("comments")
          .insert([
            {
              ...newComment,
              author_id: user.id,
              thread_root_id: parentId
                ? commentsCache.get(parentId)?.thread_root_id
                : undefined,
            },
          ])
          .select(
            `
          *,
          author:perfis_profissionais!comments_author_id_fkey (
            id, nome, sobrenome, especialidades, foto_perfil_url, verificado, tipo_usuario
          )
        `
          )
          .single();

        if (error) throw error;

        const transformedComment = transformComment(data);

        // Optimistic update
        if (parentId) {
          // Adicionar resposta ao comentário pai
          setComments((prev) =>
            prev.map((thread) => {
              if (thread.root_comment.id === parentId) {
                return {
                  ...thread,
                  root_comment: {
                    ...thread.root_comment,
                    replies: [
                      ...thread.root_comment.replies,
                      transformedComment,
                    ],
                    replies_count: thread.root_comment.replies_count + 1,
                  },
                  total_replies: thread.total_replies + 1,
                };
              }
              return thread;
            })
          );
        } else {
          // Adicionar novo comentário raiz
          const newThread: CommentThread = {
            root_comment: transformedComment,
            total_replies: 0,
            participants: [transformedComment.author],
          };
          setComments((prev) => [newThread, ...prev]);
        }

        return true;
      } catch (err: any) {
        console.error("❌ Erro ao criar comentário:", err);
        setError(err.message || "Erro ao criar comentário");
        return false;
      }
    },
    [user, postId, commentsCache]
  );

  // 🔧 SISTEMA DE REAÇÕES
  const addReaction = useCallback(
    async (commentId: string, type: string) => {
      if (!user) return;

      try {
        const { error } = await supabase.from("comment_reactions").insert([
          {
            comment_id: commentId,
            user_id: user.id,
            type,
          },
        ]);

        if (error) throw error;

        // Optimistic update
        setComments((prev) =>
          prev.map((thread) => ({
            ...thread,
            root_comment: updateCommentReaction(
              thread.root_comment,
              commentId,
              type,
              "add"
            ),
          }))
        );
      } catch (err: any) {
        console.error("❌ Erro ao adicionar reação:", err);
      }
    },
    [user]
  );

  const removeReaction = useCallback(
    async (commentId: string) => {
      if (!user) return;

      try {
        const { error } = await supabase
          .from("comment_reactions")
          .delete()
          .eq("comment_id", commentId)
          .eq("user_id", user.id);

        if (error) throw error;

        // Optimistic update
        setComments((prev) =>
          prev.map((thread) => ({
            ...thread,
            root_comment: updateCommentReaction(
              thread.root_comment,
              commentId,
              "",
              "remove"
            ),
          }))
        );
      } catch (err: any) {
        console.error("❌ Erro ao remover reação:", err);
      }
    },
    [user]
  );

  // Helper para atualizar reações
  const updateCommentReaction = (
    comment: CommentWithReplies,
    targetId: string,
    type: string,
    action: "add" | "remove"
  ): CommentWithReplies => {
    if (comment.id === targetId) {
      return {
        ...comment,
        reactions_count:
          action === "add"
            ? comment.reactions_count + 1
            : Math.max(0, comment.reactions_count - 1),
        user_reaction:
          action === "add"
            ? {
                id: "temp",
                comment_id: targetId,
                user_id: user?.id || "",
                type: type as
                  | "like"
                  | "love"
                  | "insightful"
                  | "support"
                  | "celebrate",
                created_at: new Date().toISOString(),
              }
            : undefined,
      };
    }

    return {
      ...comment,
      replies: comment.replies.map((reply) =>
        updateCommentReaction(reply, targetId, type, action)
      ),
    };
  };

  // Implementações futuras
  const editComment = useCallback(
    async (commentId: string, content: string): Promise<boolean> => {
      // TODO: Implementar edição
      return false;
    },
    []
  );

  const deleteComment = useCallback(
    async (commentId: string): Promise<boolean> => {
      // TODO: Implementar exclusão
      return false;
    },
    []
  );

  // Utils
  const findComment = useCallback(
    (commentId: string): CommentWithReplies | null => {
      for (const thread of comments) {
        if (thread.root_comment.id === commentId) {
          return thread.root_comment;
        }
        for (const reply of thread.root_comment.replies) {
          if (reply.id === commentId) {
            return reply;
          }
        }
      }
      return null;
    },
    [comments]
  );

  const getCommentPath = useCallback((commentId: string): string[] => {
    // TODO: Implementar caminho do comentário
    return [];
  }, []);

  const refresh = useCallback(async () => {
    await loadComments(true);
  }, [loadComments]);

  // Carregar comentários inicial
  useEffect(() => {
    if (postId) {
      loadComments(true);
    }
  }, [postId, filters]);

  return {
    comments,
    loading,
    error,
    hasMore,
    createComment,
    loadComments,
    loadReplies,
    addReaction,
    removeReaction,
    editComment,
    deleteComment,
    findComment,
    getCommentPath,
    refresh,
  };
};
