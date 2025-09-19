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

  // 🔧 QUERY BUILDER - Comentários SIMPLES (sem reações por enquanto)
  const buildCommentsQuery = useCallback(() => {
    let query = supabase
      .from("post_comments")
      .select(
        `
        *,
        author:perfis_profissionais!post_comments_profissional_id_fkey (
          id,
          nome,
          sobrenome,
          especialidades,
          foto_perfil_url,
          verificado
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
        // Por enquanto, só por data (sem reactions_count que não existe)
        query = query.order("created_at", { ascending: false });
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
    return {
      id: rawComment.id,
      content: rawComment.content,
      post_id: rawComment.post_id,
      author_id: rawComment.profissional_id, // Usar profissional_id como author_id
      created_at: rawComment.created_at,
      updated_at: rawComment.updated_at,
      edited: false, // Campo não existe ainda
      parent_comment_id: rawComment.parent_comment_id,
      thread_root_id: rawComment.parent_comment_id || rawComment.id, // Se tem pai, usa pai como root

      // Dados do autor
      author: {
        id: rawComment.author.id,
        nome: rawComment.author.nome,
        sobrenome: rawComment.author.sobrenome || "",
        especialidades: rawComment.author.especialidades,
        foto_perfil_url: rawComment.author.foto_perfil_url,
        verificado: rawComment.author.verificado || false,
        tipo_usuario: "profissional",
      },

      // Estatísticas (usar campos reais da tabela)
      reactions_count: rawComment.likes_count || 0, // Usar likes_count que existe
      replies_count: 0, // Será calculado na transformToThreads

      // Reação do usuário (não implementado ainda)
      user_reaction: undefined,

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
          .from("post_comments")
          .select(
            `
          *,
          author:perfis_profissionais!post_comments_profissional_id_fkey (
            id, nome, sobrenome, especialidades, foto_perfil_url, verificado
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
      if (!user || !content.trim()) {
        console.warn("❌ Usuário não autenticado ou conteúdo vazio");
        return false;
      }

      try {
        setError(null);

        console.log("📝 Criando comentário:", {
          content: content.trim(),
          parentId,
          userId: user.id,
        });

        // Dados simples baseados no schema real
        const commentData = {
          content: content.trim(),
          post_id: postId,
          profissional_id: user.id,
          parent_comment_id: parentId || null,
        };

        console.log("📊 Dados do comentário:", commentData);

        const { data, error } = await supabase
          .from("post_comments")
          .insert([commentData])
          .select(
            `
          *,
          author:perfis_profissionais!post_comments_profissional_id_fkey (
            id, nome, sobrenome, especialidades, foto_perfil_url, verificado
          )
        `
          )
          .single();

        if (error) {
          console.error("❌ Erro ao inserir comentário:", error);
          throw error;
        }

        if (!data) {
          throw new Error("Erro ao criar comentário - sem dados retornados");
        }

        console.log("✅ Comentário criado:", data);

        const transformedComment = transformComment(data);
        console.log("🔄 Comentário transformado:", transformedComment);

        // Optimistic update
        if (parentId) {
          console.log("📎 Adicionando resposta ao comentário pai:", parentId);
          // Adicionar resposta ao comentário pai
          setComments((prev) =>
            prev.map((thread) => {
              if (thread.root_comment.id === parentId) {
                const updatedThread = {
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
                console.log(
                  "✅ Thread atualizada com resposta:",
                  updatedThread
                );
                return updatedThread;
              }
              return thread;
            })
          );
        } else {
          console.log("💬 Adicionando comentário principal");
          // Adicionar novo comentário raiz
          const newThread: CommentThread = {
            root_comment: transformedComment,
            total_replies: 0,
            participants: [transformedComment.author],
          };
          console.log("✅ Nova thread criada:", newThread);
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

  // 🔧 SISTEMA DE LIKES SIMPLIFICADO (SEM TABELA DE COMMENT_LIKES)
  const addReaction = useCallback(
    async (commentId: string, type: string) => {
      if (!user) return;

      try {
        // Por enquanto, apenas incrementar likes_count diretamente
        // TODO: Criar tabela comment_likes se necessário
        const { data: currentComment } = await supabase
          .from("post_comments")
          .select("likes_count")
          .eq("id", commentId)
          .single();

        const newCount = (currentComment?.likes_count || 0) + 1;

        const { error } = await supabase
          .from("post_comments")
          .update({ likes_count: newCount })
          .eq("id", commentId);

        if (error) throw error;

        // Optimistic update
        setComments((prev) =>
          prev.map((thread) => ({
            ...thread,
            root_comment: updateCommentLikes(thread.root_comment, commentId, 1),
          }))
        );

        console.log("✅ Comentário curtido");
      } catch (err: any) {
        console.error("❌ Erro ao curtir comentário:", err);
        setError("Erro ao curtir comentário");
      }
    },
    [user]
  );

  const removeReaction = useCallback(
    async (commentId: string) => {
      if (!user) return;

      try {
        // Decrementar likes_count
        const { data: currentComment } = await supabase
          .from("post_comments")
          .select("likes_count")
          .eq("id", commentId)
          .single();

        const newCount = Math.max(0, (currentComment?.likes_count || 0) - 1);

        const { error } = await supabase
          .from("post_comments")
          .update({ likes_count: newCount })
          .eq("id", commentId);

        if (error) throw error;

        // Optimistic update
        setComments((prev) =>
          prev.map((thread) => ({
            ...thread,
            root_comment: updateCommentLikes(
              thread.root_comment,
              commentId,
              -1
            ),
          }))
        );

        console.log("✅ Curtida removida");
      } catch (err: any) {
        console.error("❌ Erro ao descurtir comentário:", err);
        setError("Erro ao descurtir comentário");
      }
    },
    [user]
  );

  // Helper para atualizar likes
  const updateCommentLikes = (
    comment: CommentWithReplies,
    targetId: string,
    delta: number
  ): CommentWithReplies => {
    if (comment.id === targetId) {
      return {
        ...comment,
        reactions_count: Math.max(0, comment.reactions_count + delta),
      };
    }

    return {
      ...comment,
      replies: comment.replies.map((reply) =>
        updateCommentLikes(reply, targetId, delta)
      ),
    };
  };

  // Implementações futuras
  const editComment = useCallback(
    async (commentId: string, content: string): Promise<boolean> => {
      // TODO: Implementar edição
      console.log("TODO: Editar comentário", commentId, content);
      return false;
    },
    []
  );

  const deleteComment = useCallback(
    async (commentId: string): Promise<boolean> => {
      // TODO: Implementar exclusão
      console.log("TODO: Deletar comentário", commentId);
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
