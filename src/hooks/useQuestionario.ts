// viaa\src\hooks\useQuestionario.ts

import { useState, useCallback, useRef } from "react";
import { supabase } from "../lib/supabase/client";
import type { CriarQuestionario, ApiResponse } from "../types/database";

export function useQuestionario() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortController = useRef<AbortController | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const getCurrentUser = useCallback(async () => {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    if (error || !user) {
      throw new Error("Usuário não autenticado");
    }
    return user;
  }, []);

  const verificarQuestionarioExistente = useCallback(async (userId: string) => {
    const { data } = await supabase
      .from("questionarios")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();

    return !!data;
  }, []);

  const salvarQuestionario = useCallback(
    async (dados: Partial<CriarQuestionario>): Promise<ApiResponse<string>> => {
      // Cancelar operação anterior se existir
      if (abortController.current) {
        abortController.current.abort();
      }

      abortController.current = new AbortController();

      setLoading(true);
      setError(null);

      try {
        const user = await getCurrentUser();

        // Verificar se já existe questionário
        const questionarioExiste = await verificarQuestionarioExistente(
          user.id
        );

        if (questionarioExiste) {
          return {
            data: "already_exists",
            error: null,
            success: true,
          };
        }

        const questionarioData: CriarQuestionario = {
          user_id: user.id,
          motivacao: dados.motivacao || undefined,
          tempo_necessidade: dados.tempo_necessidade || undefined,
          terapia_anterior: dados.terapia_anterior || undefined,
          tempo_terapia_anterior: dados.tempo_terapia_anterior || undefined,
          motivo_interrupcao: dados.motivo_interrupcao || undefined,
          dificuldades_sono: dados.dificuldades_sono || undefined,
          apoio_familiar: dados.apoio_familiar || undefined,
          areas_trabalhar: dados.areas_trabalhar || undefined,
          areas_trabalhar_outros: dados.areas_trabalhar_outros || undefined,
          preferencia_genero: dados.preferencia_genero || undefined,
        };

        const { error: insertError } = await supabase
          .from("questionarios")
          .insert([questionarioData])
          .abortSignal(abortController.current.signal);

        if (insertError) throw insertError;

        return {
          data: "success",
          error: null,
          success: true,
        };
      } catch (err: any) {
        if (err.name === "AbortError") {
          return {
            data: null,
            error: "Operação cancelada",
            success: false,
          };
        }

        const errorMessage = err.message || "Erro ao salvar questionário";
        setError(errorMessage);
        return {
          data: null,
          error: errorMessage,
          success: false,
        };
      } finally {
        setLoading(false);
        abortController.current = null;
      }
    },
    [getCurrentUser, verificarQuestionarioExistente]
  );

  const atualizarQuestionario = useCallback(
    async (dados: Partial<CriarQuestionario>): Promise<ApiResponse<string>> => {
      setLoading(true);
      setError(null);

      try {
        const user = await getCurrentUser();

        const { error: updateError } = await supabase
          .from("questionarios")
          .update(dados)
          .eq("user_id", user.id);

        if (updateError) throw updateError;

        return {
          data: "updated",
          error: null,
          success: true,
        };
      } catch (err: any) {
        const errorMessage = err.message || "Erro ao atualizar questionário";
        setError(errorMessage);
        return {
          data: null,
          error: errorMessage,
          success: false,
        };
      } finally {
        setLoading(false);
      }
    },
    [getCurrentUser]
  );

  const buscarQuestionario = useCallback(async (): Promise<
    ApiResponse<CriarQuestionario>
  > => {
    setLoading(true);
    setError(null);

    try {
      const user = await getCurrentUser();

      const { data, error: selectError } = await supabase
        .from("questionarios")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (selectError) throw selectError;

      return {
        data: data as CriarQuestionario,
        error: null,
        success: true,
      };
    } catch (err: any) {
      const errorMessage = err.message || "Erro ao buscar questionário";
      setError(errorMessage);
      return {
        data: null,
        error: errorMessage,
        success: false,
      };
    } finally {
      setLoading(false);
    }
  }, [getCurrentUser]);

  // Cleanup ao desmontar
  const cleanup = useCallback(() => {
    if (abortController.current) {
      abortController.current.abort();
      abortController.current = null;
    }
  }, []);

  return {
    salvarQuestionario,
    atualizarQuestionario,
    buscarQuestionario,
    verificarQuestionarioExistente,
    loading,
    error,
    clearError,
    cleanup,
  };
}
