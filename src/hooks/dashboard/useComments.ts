// viaa\src\hooks\dashboard\useComments.ts

import { useState, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { PostComment, CreateCommentData } from "@/types/feed";

interface UseCommentsReturn {
  comments: PostComment[];
  loading: boolean;
  error: string | null;
  createComment: (data: CreateCommentData) => Promise<boolean>;
  loadComments: (postId: string) => Promise<void>;
}

export const useComments = (): UseCommentsReturn => {
  const { user } = useAuth();
  const [comments, setComments] = useState<PostComment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Carregar comentários de um post com respostas (VERSÃO HÍBRIDA)
  const loadComments = useCallback(async (postId: string) => {
    try {
      setLoading(true);
      setError(null);

      console.log("🔍 Carregando comentários para post:", postId);

      // ESTRATÉGIA HÍBRIDA: Buscar todos os comentários e organizar manualmente
      const { data: allComments, error: queryError } = await supabase
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
        .eq("is_active", true)
        .order("created_at", { ascending: true }); // Ordem cronológica para organizar

      if (queryError) {
        console.error("❌ Erro na query:", queryError);
        throw queryError;
      }

      console.log("📊 Comentários raw do Supabase:", allComments);

      if (!allComments || allComments.length === 0) {
        console.log("📭 Nenhum comentário encontrado");
        setComments([]);
        return;
      }

      // Separar comentários principais das respostas
      const mainComments = allComments.filter((c) => !c.parent_comment_id);
      const replies = allComments.filter((c) => c.parent_comment_id);

      console.log("💬 Comentários principais:", mainComments.length);
      console.log("💭 Respostas:", replies.length);

      // Organizar respostas por comentário pai
      const repliesByParent: { [key: string]: any[] } = {};
      replies.forEach((reply) => {
        const parentId = reply.parent_comment_id;
        if (!repliesByParent[parentId]) {
          repliesByParent[parentId] = [];
        }
        repliesByParent[parentId].push({
          id: reply.id,
          post_id: reply.post_id,
          profissional_id: reply.profissional_id,
          content: reply.content,
          parent_comment_id: reply.parent_comment_id,
          likes_count: reply.likes_count || 0,
          created_at: reply.created_at,
          updated_at: reply.updated_at,
          is_active: reply.is_active,
          author: {
            id: reply.author.id,
            nome: reply.author.nome,
            sobrenome: reply.author.sobrenome,
            especialidades: reply.author.especialidades,
            foto_perfil_url: reply.author.foto_perfil_url,
            verificado: reply.author.verificado,
          },
          replies: [], // Máximo 2 níveis (LinkedIn style)
        });
      });

      // Montar comentários principais com suas respostas
      const transformedComments: PostComment[] = mainComments.map(
        (item: any) => ({
          id: item.id,
          post_id: item.post_id,
          profissional_id: item.profissional_id,
          content: item.content,
          parent_comment_id: item.parent_comment_id,
          likes_count: item.likes_count || 0,
          created_at: item.created_at,
          updated_at: item.updated_at,
          is_active: item.is_active,
          author: {
            id: item.author.id,
            nome: item.author.nome,
            sobrenome: item.author.sobrenome,
            especialidades: item.author.especialidades,
            foto_perfil_url: item.author.foto_perfil_url,
            verificado: item.author.verificado,
          },
          // Adicionar respostas organizadas
          replies: repliesByParent[item.id] || [],
        })
      );

      // Ordenar comentários principais por data (mais recentes primeiro)
      transformedComments.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      console.log("✅ Comentários transformados:", transformedComments);
      setComments(transformedComments);
    } catch (err: any) {
      console.error("❌ Erro ao carregar comentários:", err);
      setError(err.message || "Erro ao carregar comentários");
    } finally {
      setLoading(false);
    }
  }, []);

  // Criar novo comentário
  const createComment = useCallback(
    async (data: CreateCommentData): Promise<boolean> => {
      if (!user) {
        setError("Usuário não autenticado");
        return false;
      }

      try {
        setError(null);

        console.log("📝 Criando comentário:", data);

        const { data: newComment, error: insertError } = await supabase
          .from("post_comments")
          .insert([
            {
              post_id: data.post_id,
              profissional_id: user.id,
              content: data.content,
              parent_comment_id: data.parent_comment_id || null,
            },
          ])
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
          .single();

        if (insertError) {
          console.error("❌ Erro ao inserir comentário:", insertError);
          throw insertError;
        }

        if (!newComment) {
          throw new Error("Erro ao criar comentário");
        }

        console.log("✅ Comentário criado com sucesso:", newComment);

        const transformedComment: PostComment = {
          id: newComment.id,
          post_id: newComment.post_id,
          profissional_id: newComment.profissional_id,
          content: newComment.content,
          parent_comment_id: newComment.parent_comment_id,
          likes_count: 0,
          created_at: newComment.created_at,
          updated_at: newComment.updated_at,
          is_active: newComment.is_active,
          author: {
            id: newComment.author.id,
            nome: newComment.author.nome,
            sobrenome: newComment.author.sobrenome,
            especialidades: newComment.author.especialidades,
            foto_perfil_url: newComment.author.foto_perfil_url,
            verificado: newComment.author.verificado,
          },
          replies: [],
        };

        // LÓGICA MELHORADA: Atualizar estado local de forma mais robusta
        if (data.parent_comment_id) {
          // É uma resposta - adicionar à lista de respostas do comentário pai
          console.log(
            "📎 Adicionando resposta ao comentário:",
            data.parent_comment_id
          );
          setComments((prev) =>
            prev.map((comment) =>
              comment.id === data.parent_comment_id
                ? {
                    ...comment,
                    replies: [...(comment.replies || []), transformedComment],
                  }
                : comment
            )
          );
        } else {
          // É um comentário principal - adicionar no início da lista
          console.log("💬 Adicionando comentário principal");
          setComments((prev) => [transformedComment, ...prev]);
        }

        return true;
      } catch (err: any) {
        console.error("❌ Erro ao criar comentário:", err);
        setError(err.message || "Erro ao criar comentário");
        return false;
      }
    },
    [user]
  );

  return {
    comments,
    loading,
    error,
    createComment,
    loadComments,
  };
};
