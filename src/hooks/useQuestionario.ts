// hooks/useQuestionario.ts
import { useState } from "react";
import { supabase } from "../lib/supabase/client";

interface QuestionarioData {
  motivacao: string;
  tempo_necessidade: string;
  terapia_anterior: string;
  tempo_terapia_anterior?: string;
  motivo_interrupcao?: string;
  dificuldades_sono: string;
  apoio_familiar: string;
  areas_trabalhar: string[];
  areas_trabalhar_outros?: string;
  preferencia_genero: string;
}

export function useQuestionario() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const salvarQuestionario = async (dados: QuestionarioData) => {
    setLoading(true);
    setError(null);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("Usuário não autenticado");
      }

      const { error: insertError } = await supabase
        .from("questionarios")
        .insert([
          {
            user_id: user.id,
            ...dados,
          },
        ]);

      if (insertError) {
        throw insertError;
      }

      return { success: true };
    } catch (err: any) {
      console.error("Erro ao salvar questionário:", err);
      setError(err.message || "Erro ao salvar questionário");
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  return {
    salvarQuestionario,
    loading,
    error,
  };
}
