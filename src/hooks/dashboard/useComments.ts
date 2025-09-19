// src/hooks/dashboard/useComments.ts
// 🎯 HOOK DE COMENTÁRIOS SIMPLES PARA MVP - VERSÃO CORRIGIDA

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

  // 🔧 CARREGAR COMENTÁRIOS (CORRIGIDO)
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

      // 🔧 CORREÇÃO: Transformar a resposta do Supabase
      const transformedComments: SimpleComment[] = [];

      for (const item of data || []) {
        // Verificar se author é um array e pegar o primeiro item
        const authorData = Array.isArray(item.author)
          ? item.author[0]
          : item.author;

        // Validar se todos os dados necessários existem
        if (!authorData || !authorData.nome || !authorData.id) {
          console.warn("Comentário com author inválido:", item);
          continue; // Pular este comentário
        }

        // Criar comentário válido
        const validComment: SimpleComment = {
          id: item.id,
          content: item.content,
          post_id: item.post_id,
          profissional_id: item.profissional_id,
          likes_count: item.likes_count || 0,
          created_at: item.created_at,
          updated_at: item.updated_at,
          is_active: item.is_active,
          author: {
            id: authorData.id,
            nome: authorData.nome,
            sobrenome: authorData.sobrenome || "",
            especialidades: authorData.especialidades || "",
            foto_perfil_url: authorData.foto_perfil_url || undefined,
            verificado: authorData.verificado || false,
          },
        };

        transformedComments.push(validComment);
      }

      console.log("✅ Comentários transformados:", transformedComments.length);
      setComments(transformedComments);
    } catch (err: any) {
      console.error("❌ Erro ao carregar comentários:", err);
      setError(err.message || "Erro ao carregar comentários");
    } finally {
      setLoading(false);
    }
  }, [postId]);

  // 🔧 CRIAR COMENTÁRIO (CORRIGIDO)
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

        // 🔧 CORREÇÃO: Transformar a resposta antes de adicionar
        const authorData = Array.isArray(data.author)
          ? data.author[0]
          : data.author;

        if (!authorData || !authorData.nome) {
          throw new Error("Dados do autor inválidos");
        }

        const transformedComment: SimpleComment = {
          id: data.id,
          content: data.content,
          post_id: data.post_id,
          profissional_id: data.profissional_id,
          likes_count: data.likes_count || 0,
          created_at: data.created_at,
          updated_at: data.updated_at,
          is_active: data.is_active,
          author: {
            id: authorData.id,
            nome: authorData.nome,
            sobrenome: authorData.sobrenome || "",
            especialidades: authorData.especialidades || "",
            foto_perfil_url: authorData.foto_perfil_url || undefined,
            verificado: authorData.verificado || false,
          },
        };

        console.log("✅ Comentário criado e transformado:", transformedComment);

        // Adicionar no início da lista
        setComments((prev) => [transformedComment, ...prev]);
        return true;
      } catch (err: any) {
        console.error("❌ Erro ao criar comentário:", err);
        setError(err.message || "Erro ao criar comentário");
        return false;
      }
    },
    [user, postId]
  );

  // 🔧 CURTIR/DESCURTIR (MANTIDO IGUAL)
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

        // Chamar API (implementação simples)
        const { error } = await supabase.rpc("toggle_comment_like", {
          comment_id: commentId,
          user_id: user.id,
        });

        if (error) {
          // Reverter em caso de erro
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

          throw error;
        }
      } catch (err: any) {
        console.error("❌ Erro ao curtir comentário:", err);
      }
    },
    [user, userLikes]
  );

  // 🔧 REFRESH
  const refresh = useCallback(async () => {
    await loadComments();
  }, [loadComments]);

  // Carregar comentários na inicialização
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
