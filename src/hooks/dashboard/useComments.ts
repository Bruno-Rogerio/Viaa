// src/hooks/dashboard/useComments.ts
// 🎯 HOOK DE COMENTÁRIOS SIMPLES PARA MVP - COMPLETO

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

// Tipos simplificados
interface SimpleComment {
  id: string;
  content: string;
  post_id: string;
  profissional_id: string;
  likes_count: number;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  author: {
    id: string;
    nome: string;
    sobrenome: string;
    especialidades: string;
    foto_perfil_url?: string;
    verificado: boolean;
  };
}

interface UseSimpleCommentsReturn {
  comments: SimpleComment[];
  loading: boolean;
  error: string | null;
  createComment: (content: string) => Promise<boolean>;
  toggleLike: (commentId: string) => Promise<void>;
  userLikes: Set<string>;
  refresh: () => Promise<void>;
}

export const useComments = (postId: string): UseSimpleCommentsReturn => {
  const { user } = useAuth();

  // Estados básicos
  const [comments, setComments] = useState<SimpleComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userLikes, setUserLikes] = useState<Set<string>>(new Set());

  // 🔧 CARREGAR COMENTÁRIOS (SIMPLES)
  const loadComments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("🔍 Carregando comentários simples para post:", postId);

      const { data, error: queryError } = await supabase
        .from("post_comments")
        .select(
          `
          id,
          content,
          post_id,
          profissional_id,
          likes_count,
          created_at,
          updated_at,
          is_active,
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
        .eq("is_active", true)
        .is("parent_comment_id", null) // Só comentários principais
        .order("created_at", { ascending: false });

      if (queryError) throw queryError;

      const validComments = (data || []).filter(
        (comment) => comment && comment.author && comment.author.nome
      );

      console.log("✅ Comentários carregados:", validComments.length);
      setComments(validComments);
    } catch (err: any) {
      console.error("❌ Erro ao carregar comentários:", err);
      setError(err.message || "Erro ao carregar comentários");
    } finally {
      setLoading(false);
    }
  }, [postId]);

  // 🔧 CRIAR COMENTÁRIO (SIMPLES)
  const createComment = useCallback(
    async (content: string): Promise<boolean> => {
      if (!user || !content.trim()) return false;

      try {
        setError(null);

        console.log("📝 Criando comentário simples:", content.trim());

        const { data, error } = await supabase
          .from("post_comments")
          .insert([
            {
              content: content.trim(),
              post_id: postId,
              profissional_id: user.id,
            },
          ])
          .select(
            `
          id,
          content,
          post_id,
          profissional_id,
          likes_count,
          created_at,
          updated_at,
          is_active,
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
          .single();

        if (error) throw error;

        console.log("✅ Comentário criado:", data);

        // Adicionar no início da lista
        setComments((prev) => [data, ...prev]);
        return true;
      } catch (err: any) {
        console.error("❌ Erro ao criar comentário:", err);
        setError(err.message || "Erro ao criar comentário");
        return false;
      }
    },
    [user, postId]
  );

  // 🔧 CURTIR/DESCURTIR (SIMPLES)
  const toggleLike = useCallback(
    async (commentId: string) => {
      if (!user) return;

      const isLiked = userLikes.has(commentId);

      try {
        // Optimistic update
        if (isLiked) {
          setUserLikes((prev) => {
            const newSet = new Set(prev);
            newSet.delete(commentId);
            return newSet;
          });
        } else {
          setUserLikes((prev) => new Set([...prev, commentId]));
        }

        // Atualizar contador local
        setComments((prev) =>
          prev.map((comment) =>
            comment.id === commentId
              ? {
                  ...comment,
                  likes_count: comment.likes_count + (isLiked ? -1 : 1),
                }
              : comment
          )
        );

        // Atualizar no banco
        const { data: currentComment } = await supabase
          .from("post_comments")
          .select("likes_count")
          .eq("id", commentId)
          .single();

        const newCount = isLiked
          ? Math.max(0, (currentComment?.likes_count || 0) - 1)
          : (currentComment?.likes_count || 0) + 1;

        const { error } = await supabase
          .from("post_comments")
          .update({ likes_count: newCount })
          .eq("id", commentId);

        if (error) throw error;

        console.log("✅ Like atualizado:", isLiked ? "removido" : "adicionado");
      } catch (err: any) {
        console.error("❌ Erro ao atualizar like:", err);

        // Rollback em caso de erro
        if (isLiked) {
          setUserLikes((prev) => new Set([...prev, commentId]));
        } else {
          setUserLikes((prev) => {
            const newSet = new Set(prev);
            newSet.delete(commentId);
            return newSet;
          });
        }

        setComments((prev) =>
          prev.map((comment) =>
            comment.id === commentId
              ? {
                  ...comment,
                  likes_count: comment.likes_count + (isLiked ? 1 : -1),
                }
              : comment
          )
        );
      }
    },
    [user, userLikes]
  );

  // 🔧 REFRESH
  const refresh = useCallback(async () => {
    await loadComments();
  }, [loadComments]);

  // Carregar comentários no mount
  useEffect(() => {
    loadComments();
  }, [loadComments]);

  return {
    comments,
    loading,
    error,
    createComment,
    toggleLike,
    userLikes,
    refresh,
  };
};
