// viaa/src/hooks/dashboard/usePostLikes.ts

import { useState, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface UsePostLikesReturn {
  loading: boolean;
  error: string | null;
  toggleLike: (postId: string, isCurrentlyLiked: boolean) => Promise<boolean>;
}

export const usePostLikes = (): UsePostLikesReturn => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Toggle like simplificado
  const toggleLike = useCallback(
    async (postId: string, isCurrentlyLiked: boolean): Promise<boolean> => {
      if (!user) {
        setError("Usuário não autenticado");
        return false;
      }

      try {
        setLoading(true);
        setError(null);

        if (isCurrentlyLiked) {
          // DESCURTIR: Remover da tabela post_likes
          const { error: deleteError } = await supabase
            .from("post_likes")
            .delete()
            .eq("post_id", postId)
            .eq("profissional_id", user.id);

          if (deleteError) {
            console.error("Erro ao descurtir:", deleteError);
            throw deleteError;
          }

          // Decrementar contador
          const { error: decrementError } = await supabase.rpc(
            "decrement_likes",
            {
              post_id: postId,
            }
          );

          if (decrementError) {
            console.error("Erro ao decrementar:", decrementError);
            throw decrementError;
          }
        } else {
          // CURTIR: Inserir na tabela post_likes usando upsert
          const { error: insertError } = await supabase
            .from("post_likes")
            .upsert(
              {
                post_id: postId,
                profissional_id: user.id,
              },
              {
                onConflict: "post_id,profissional_id",
                ignoreDuplicates: true,
              }
            );

          if (insertError) {
            console.error("Erro ao curtir:", insertError);
            throw insertError;
          }

          // Incrementar contador
          const { error: incrementError } = await supabase.rpc(
            "increment_likes",
            {
              post_id: postId,
            }
          );

          if (incrementError) {
            console.error("Erro ao incrementar:", incrementError);
            throw incrementError;
          }
        }

        return true;
      } catch (err: any) {
        console.error("Erro no toggle like:", err);
        setError(err.message || "Erro ao curtir/descurtir post");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [user]
  );

  return {
    loading,
    error,
    toggleLike,
  };
};
