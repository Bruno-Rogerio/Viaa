// src/hooks/dashboard/useHorariosDisponiveis.ts
// VERSÃO CORRIGIDA: Usando UPSERT para evitar conflitos de constraint

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";
import type { HorarioDisponivel, CriarHorarioDisponivel } from "@/types/agenda";

interface ConfiguracaoSemanal {
  [key: number]: {
    ativo: boolean;
    hora_inicio: string;
    hora_fim: string;
  };
}

interface UseHorariosDisponiveisReturn {
  // Estados
  configuracao: ConfiguracaoSemanal;
  loading: boolean;
  saving: boolean;
  error: string | null;

  // Actions
  carregarHorarios: () => Promise<void>;
  salvarHorarios: (config: ConfiguracaoSemanal) => Promise<boolean>;
  resetarHorarios: () => void;

  // Utilidades
  temHorariosConfigurados: () => boolean;
  obterDiasAtivos: () => number[];
  validarConfiguracao: (config: ConfiguracaoSemanal) => string[];
}

export const useHorariosDisponiveis = (
  profissionalId: string
): UseHorariosDisponiveisReturn => {
  // Estados
  const [configuracao, setConfiguracao] = useState<ConfiguracaoSemanal>({
    0: { ativo: false, hora_inicio: "09:00", hora_fim: "17:00" }, // Domingo
    1: { ativo: true, hora_inicio: "09:00", hora_fim: "17:00" }, // Segunda
    2: { ativo: true, hora_inicio: "09:00", hora_fim: "17:00" }, // Terça
    3: { ativo: true, hora_inicio: "09:00", hora_fim: "17:00" }, // Quarta
    4: { ativo: true, hora_inicio: "09:00", hora_fim: "17:00" }, // Quinta
    5: { ativo: true, hora_inicio: "09:00", hora_fim: "17:00" }, // Sexta
    6: { ativo: false, hora_inicio: "09:00", hora_fim: "17:00" }, // Sábado
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Limpar erro
  const clearError = useCallback(() => setError(null), []);

  // Carregar horários do Supabase
  const carregarHorarios = useCallback(async () => {
    if (!profissionalId) return;

    try {
      setLoading(true);
      clearError();

      console.log("🔍 Carregando horários para profissional:", profissionalId);

      // Buscar TODOS os horários (ativos e inativos) para montarmos a configuração completa
      const { data: horariosData, error: queryError } = await supabase
        .from("horarios_disponiveis")
        .select("*")
        .eq("profissional_id", profissionalId)
        .order("dia_semana", { ascending: true });

      if (queryError) {
        console.error("❌ Erro ao carregar horários:", queryError);
        throw new Error(`Erro no banco: ${queryError.message}`);
      }

      console.log("✅ Horários carregados:", horariosData?.length || 0);

      // Resetar configuração
      const novaConfiguracao: ConfiguracaoSemanal = {
        0: { ativo: false, hora_inicio: "09:00", hora_fim: "17:00" },
        1: { ativo: false, hora_inicio: "09:00", hora_fim: "17:00" },
        2: { ativo: false, hora_inicio: "09:00", hora_fim: "17:00" },
        3: { ativo: false, hora_inicio: "09:00", hora_fim: "17:00" },
        4: { ativo: false, hora_inicio: "09:00", hora_fim: "17:00" },
        5: { ativo: false, hora_inicio: "09:00", hora_fim: "17:00" },
        6: { ativo: false, hora_inicio: "09:00", hora_fim: "17:00" },
      };

      // Aplicar horários salvos
      if (horariosData && horariosData.length > 0) {
        horariosData.forEach((horario: HorarioDisponivel) => {
          novaConfiguracao[horario.dia_semana] = {
            ativo: horario.ativo,
            hora_inicio: horario.hora_inicio,
            hora_fim: horario.hora_fim,
          };
        });
      }

      setConfiguracao(novaConfiguracao);
    } catch (err: any) {
      const mensagem = err.message || "Erro ao carregar horários disponíveis";
      setError(mensagem);
      console.error("❌ Erro no carregarHorarios:", err);
    } finally {
      setLoading(false);
    }
  }, [profissionalId, clearError]);

  // Validar configuração
  const validarConfiguracao = useCallback(
    (config: ConfiguracaoSemanal): string[] => {
      const erros: string[] = [];

      // Verificar se tem pelo menos um dia ativo
      const diasAtivos = Object.values(config).filter((dia) => dia.ativo);
      if (diasAtivos.length === 0) {
        erros.push("Pelo menos um dia deve estar ativo");
      }

      // Validar horários de cada dia ativo
      Object.entries(config).forEach(([diaId, dia]) => {
        if (dia.ativo) {
          const inicioMinutos =
            parseInt(dia.hora_inicio.split(":")[0]) * 60 +
            parseInt(dia.hora_inicio.split(":")[1]);
          const fimMinutos =
            parseInt(dia.hora_fim.split(":")[0]) * 60 +
            parseInt(dia.hora_fim.split(":")[1]);

          const nomeDia =
            {
              "0": "Domingo",
              "1": "Segunda-feira",
              "2": "Terça-feira",
              "3": "Quarta-feira",
              "4": "Quinta-feira",
              "5": "Sexta-feira",
              "6": "Sábado",
            }[diaId] || `Dia ${diaId}`;

          if (fimMinutos <= inicioMinutos) {
            erros.push(`${nomeDia}: Horário de fim deve ser após o início`);
          }

          if (fimMinutos - inicioMinutos < 60) {
            erros.push(`${nomeDia}: Mínimo de 1 hora de trabalho`);
          }

          if (inicioMinutos < 6 * 60 || fimMinutos > 23 * 60) {
            erros.push(`${nomeDia}: Horários devem estar entre 06:00 e 23:00`);
          }
        }
      });

      return erros;
    },
    []
  );

  // Salvar horários usando UPSERT
  const salvarHorarios = useCallback(
    async (config: ConfiguracaoSemanal): Promise<boolean> => {
      if (!profissionalId) {
        setError("ID do profissional não encontrado");
        return false;
      }

      try {
        setSaving(true);
        clearError();

        // Validar antes de salvar
        const erros = validarConfiguracao(config);
        if (erros.length > 0) {
          setError(erros.join("; "));
          return false;
        }

        console.log("💾 Salvando horários para profissional:", profissionalId);

        // Preparar TODOS os horários (ativos e inativos) para UPSERT
        const horariosParaUpsert = Object.entries(config).map(
          ([diaId, dia]) => ({
            profissional_id: profissionalId,
            dia_semana: parseInt(diaId),
            hora_inicio: dia.hora_inicio,
            hora_fim: dia.hora_fim,
            ativo: dia.ativo,
          })
        );

        console.log(
          "📤 Fazendo UPSERT de",
          horariosParaUpsert.length,
          "horários"
        );

        // UPSERT: Insere se não existe, atualiza se existe
        const { error: upsertError } = await supabase
          .from("horarios_disponiveis")
          .upsert(horariosParaUpsert, {
            onConflict: "profissional_id,dia_semana,hora_inicio,hora_fim",
            ignoreDuplicates: false,
          });

        if (upsertError) {
          console.error("❌ Erro no UPSERT:", upsertError);
          throw new Error(`Erro ao salvar: ${upsertError.message}`);
        }

        console.log("✅ Horários salvos com sucesso!");

        // Atualizar estado local
        setConfiguracao(config);

        return true;
      } catch (err: any) {
        const mensagem = err.message || "Erro ao salvar horários disponíveis";
        setError(mensagem);
        console.error("❌ Erro no salvarHorarios:", err);
        return false;
      } finally {
        setSaving(false);
      }
    },
    [profissionalId, clearError, validarConfiguracao]
  );

  // Resetar para configuração padrão
  const resetarHorarios = useCallback(() => {
    setConfiguracao({
      0: { ativo: false, hora_inicio: "09:00", hora_fim: "17:00" },
      1: { ativo: true, hora_inicio: "09:00", hora_fim: "17:00" },
      2: { ativo: true, hora_inicio: "09:00", hora_fim: "17:00" },
      3: { ativo: true, hora_inicio: "09:00", hora_fim: "17:00" },
      4: { ativo: true, hora_inicio: "09:00", hora_fim: "17:00" },
      5: { ativo: true, hora_inicio: "09:00", hora_fim: "17:00" },
      6: { ativo: false, hora_inicio: "09:00", hora_fim: "17:00" },
    });
    clearError();
  }, [clearError]);

  // Verificar se tem horários configurados
  const temHorariosConfigurados = useCallback(() => {
    return Object.values(configuracao).some((dia) => dia.ativo);
  }, [configuracao]);

  // Obter dias ativos
  const obterDiasAtivos = useCallback(() => {
    return Object.entries(configuracao)
      .filter(([_, dia]) => dia.ativo)
      .map(([diaId, _]) => parseInt(diaId));
  }, [configuracao]);

  // Carregar horários automaticamente
  useEffect(() => {
    if (profissionalId) {
      carregarHorarios();
    }
  }, [profissionalId, carregarHorarios]);

  return {
    // Estados
    configuracao,
    loading,
    saving,
    error,

    // Actions
    carregarHorarios,
    salvarHorarios,
    resetarHorarios,

    // Utilidades
    temHorariosConfigurados,
    obterDiasAtivos,
    validarConfiguracao,
  };
};
