// src/hooks/dashboard/useAgenda.ts

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type {
  Consulta,
  CriarConsulta,
  AtualizarConsulta,
  CriarHorarioDisponivel,
  CriarBloqueioHorario,
  FiltrosAgenda,
  EstatisticasAgenda,
  ModoVisualizacao,
  TipoUsuarioAgenda,
  UseAgendaReturn,
  ResultadoOperacao,
} from "@/types/agenda";

interface UseAgendaOptions {
  tipoUsuario: TipoUsuarioAgenda;
  usuarioId: string;
  autoLoad?: boolean;
  modoInicial?: ModoVisualizacao;
}

export const useAgenda = (options: UseAgendaOptions): UseAgendaReturn => {
  const { user } = useAuth();
  const {
    tipoUsuario,
    usuarioId,
    autoLoad = true,
    modoInicial = "mes",
  } = options;

  // Estados principais
  const [consultas, setConsultas] = useState<Consulta[]>([]);
  const [estatisticas, setEstatisticas] = useState<EstatisticasAgenda | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Estados de navegação e filtros
  const [dataAtual, setDataAtual] = useState(new Date());
  const [modoVisualizacao, setModoVisualizacao] =
    useState<ModoVisualizacao>(modoInicial);
  const [filtros, setFiltrosState] = useState<FiltrosAgenda>({});

  // Função para limpar erros
  const clearError = useCallback(() => setError(null), []);

  // Carregar consultas sem JOIN (mais seguro)
  const carregarConsultas = useCallback(async () => {
    try {
      setLoading(true);
      clearError();

      console.log(
        "🔍 Carregando consultas para usuário:",
        usuarioId,
        "tipo:",
        tipoUsuario
      );

      // Query simples sem JOINs primeiro
      let query = supabase.from("consultas").select(`
          id,
          titulo,
          descricao,
          data_inicio,
          data_fim,
          status,
          tipo,
          profissional_id,
          paciente_id,
          valor,
          observacoes,
          link_videochamada,
          lembretes_enviados,
          created_at,
          updated_at
        `);

      // Filtrar por tipo de usuário
      if (tipoUsuario === "profissional") {
        query = query.eq("profissional_id", usuarioId);
      } else {
        query = query.eq("paciente_id", usuarioId);
      }

      // Aplicar filtros se existirem
      if (filtros.data_inicio) {
        query = query.gte("data_inicio", filtros.data_inicio);
      }
      if (filtros.data_fim) {
        query = query.lte("data_inicio", filtros.data_fim);
      }
      if (filtros.status?.length) {
        query = query.in("status", filtros.status);
      }
      if (filtros.tipo?.length) {
        query = query.in("tipo", filtros.tipo);
      }

      query = query.order("data_inicio", { ascending: true });

      const { data, error: queryError } = await query;

      if (queryError) {
        console.error("❌ Erro na query:", queryError);
        throw queryError;
      }

      console.log("✅ Consultas carregadas:", data?.length || 0);

      // Transformar dados e buscar relacionamentos separadamente
      const consultasComRelacionamentos: Consulta[] = [];

      for (const item of data || []) {
        // Buscar dados do profissional
        const { data: profissionalData } = await supabase
          .from("perfis_profissionais")
          .select(
            "id, nome, sobrenome, foto_perfil_url, especialidades, crp, verificado"
          )
          .eq("id", item.profissional_id)
          .single();

        // Buscar dados do paciente
        const { data: pacienteData } = await supabase
          .from("perfis_pacientes")
          .select("id, nome, sobrenome, foto_perfil_url, telefone, email")
          .eq("id", item.paciente_id)
          .single();

        const consulta: Consulta = {
          id: item.id,
          titulo: item.titulo,
          descricao: item.descricao,
          data_inicio: item.data_inicio,
          data_fim: item.data_fim,
          status: item.status,
          tipo: item.tipo,
          profissional_id: item.profissional_id,
          paciente_id: item.paciente_id,
          valor: item.valor,
          observacoes: item.observacoes,
          link_videochamada: item.link_videochamada,
          lembretes_enviados: item.lembretes_enviados,
          created_at: item.created_at,
          updated_at: item.updated_at,
          profissional: profissionalData || {
            id: item.profissional_id,
            nome: "Profissional",
            sobrenome: "Não encontrado",
            especialidades: "N/A",
            verificado: false,
          },
          paciente: pacienteData || {
            id: item.paciente_id,
            nome: "Paciente",
            sobrenome: "Não encontrado",
            telefone: "N/A",
            email: "N/A",
          },
        };

        consultasComRelacionamentos.push(consulta);
      }

      setConsultas(consultasComRelacionamentos);
    } catch (err: any) {
      console.error("❌ Erro ao carregar consultas:", err);
      setError(err.message || "Erro ao carregar consultas");
      setConsultas([]); // Array vazio em caso de erro
    } finally {
      setLoading(false);
    }
  }, [tipoUsuario, usuarioId, filtros, clearError]);

  // Carregar estatísticas de forma simples
  const carregarEstatisticas = useCallback(async () => {
    try {
      const hoje = new Date();
      const inicioHoje = new Date(hoje);
      inicioHoje.setHours(0, 0, 0, 0);
      const fimHoje = new Date(hoje);
      fimHoje.setHours(23, 59, 59, 999);

      const inicioSemana = new Date(hoje);
      inicioSemana.setDate(hoje.getDate() - hoje.getDay());

      const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
      const fimMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);

      // Query base para contagens
      let baseQuery = supabase
        .from("consultas")
        .select("*", { count: "exact", head: true });

      if (tipoUsuario === "profissional") {
        baseQuery = baseQuery.eq("profissional_id", usuarioId);
      } else {
        baseQuery = baseQuery.eq("paciente_id", usuarioId);
      }

      // Total de consultas
      const { count: totalConsultas } = await baseQuery;

      // Consultas hoje
      let consultasHojeQuery = supabase
        .from("consultas")
        .select("*", { count: "exact", head: true });
      if (tipoUsuario === "profissional") {
        consultasHojeQuery = consultasHojeQuery.eq(
          "profissional_id",
          usuarioId
        );
      } else {
        consultasHojeQuery = consultasHojeQuery.eq("paciente_id", usuarioId);
      }
      const { count: consultasHoje } = await consultasHojeQuery
        .gte("data_inicio", inicioHoje.toISOString())
        .lte("data_inicio", fimHoje.toISOString());

      // Usando dados locais para estatísticas mais rápidas
      const stats: EstatisticasAgenda = {
        total_consultas: totalConsultas || 0,
        consultas_hoje: consultasHoje || 0,
        consultas_semana: consultas.filter((c) => {
          const dataConsulta = new Date(c.data_inicio);
          return dataConsulta >= inicioSemana && dataConsulta <= fimHoje;
        }).length,
        consultas_mes: consultas.filter((c) => {
          const dataConsulta = new Date(c.data_inicio);
          return dataConsulta >= inicioMes && dataConsulta <= fimMes;
        }).length,
        taxa_comparecimento: 95, // Mock por enquanto
        receita_mes:
          tipoUsuario === "profissional"
            ? consultas
                .filter((c) => c.status === "concluida" && c.valor)
                .reduce((total, c) => total + (c.valor || 0), 0)
            : 0,
        consultas_por_status: {
          agendada: consultas.filter((c) => c.status === "agendada").length,
          confirmada: consultas.filter((c) => c.status === "confirmada").length,
          em_andamento: consultas.filter((c) => c.status === "em_andamento")
            .length,
          concluida: consultas.filter((c) => c.status === "concluida").length,
          cancelada: consultas.filter((c) => c.status === "cancelada").length,
          nao_compareceu: consultas.filter((c) => c.status === "nao_compareceu")
            .length,
        },
        horarios_livres_hoje: 8 - (consultasHoje || 0),
        consultas_canceladas_mes: consultas.filter(
          (c) =>
            c.status === "cancelada" &&
            new Date(c.data_inicio) >= inicioMes &&
            new Date(c.data_inicio) <= fimMes
        ).length,
      };

      setEstatisticas(stats);
    } catch (err: any) {
      console.error("❌ Erro ao carregar estatísticas:", err);
      // Estatísticas padrão em caso de erro
      setEstatisticas({
        total_consultas: 0,
        consultas_hoje: 0,
        consultas_semana: 0,
        consultas_mes: 0,
        taxa_comparecimento: 0,
        receita_mes: 0,
        consultas_por_status: {
          agendada: 0,
          confirmada: 0,
          em_andamento: 0,
          concluida: 0,
          cancelada: 0,
          nao_compareceu: 0,
        },
        horarios_livres_hoje: 8,
        consultas_canceladas_mes: 0,
      });
    }
  }, [tipoUsuario, usuarioId, consultas]);

  // Criar consulta
  const criarConsulta = useCallback(
    async (dados: CriarConsulta): Promise<ResultadoOperacao> => {
      try {
        setLoading(true);
        clearError();

        const { data, error: insertError } = await supabase
          .from("consultas")
          .insert([
            {
              ...dados,
              status: "agendada",
              lembretes_enviados: false,
            },
          ])
          .select()
          .single();

        if (insertError) throw insertError;

        // Recarregar dados
        await carregarConsultas();

        return {
          sucesso: true,
          mensagem: "Consulta criada com sucesso!",
          dados: data,
        };
      } catch (err: any) {
        const mensagem = err.message || "Erro ao criar consulta";
        setError(mensagem);
        return { sucesso: false, mensagem };
      } finally {
        setLoading(false);
      }
    },
    [carregarConsultas, clearError]
  );

  // Implementações básicas para outras funções
  const atualizarConsulta = useCallback(
    async (dados: AtualizarConsulta): Promise<ResultadoOperacao> => {
      return { sucesso: false, mensagem: "Em desenvolvimento" };
    },
    []
  );

  const cancelarConsulta = useCallback(
    async (id: string, motivo?: string): Promise<ResultadoOperacao> => {
      return { sucesso: false, mensagem: "Em desenvolvimento" };
    },
    []
  );

  const confirmarConsulta = useCallback(
    async (id: string): Promise<ResultadoOperacao> => {
      return { sucesso: false, mensagem: "Em desenvolvimento" };
    },
    []
  );

  const iniciarConsulta = useCallback(
    async (id: string): Promise<ResultadoOperacao> => {
      return { sucesso: false, mensagem: "Em desenvolvimento" };
    },
    []
  );

  const finalizarConsulta = useCallback(
    async (id: string, observacoes?: string): Promise<ResultadoOperacao> => {
      return { sucesso: false, mensagem: "Em desenvolvimento" };
    },
    []
  );

  const marcarNaoCompareceu = useCallback(
    async (id: string): Promise<ResultadoOperacao> => {
      return { sucesso: false, mensagem: "Em desenvolvimento" };
    },
    []
  );

  const criarHorarioDisponivel = useCallback(
    async (dados: CriarHorarioDisponivel): Promise<ResultadoOperacao> => {
      return { sucesso: false, mensagem: "Em desenvolvimento" };
    },
    []
  );

  const criarBloqueioHorario = useCallback(
    async (dados: CriarBloqueioHorario): Promise<ResultadoOperacao> => {
      return { sucesso: false, mensagem: "Em desenvolvimento" };
    },
    []
  );

  // Funções de navegação
  const irParaData = useCallback((data: Date) => {
    setDataAtual(new Date(data));
  }, []);

  const proximaSemana = useCallback(() => {
    setDataAtual((prev) => {
      const nova = new Date(prev);
      nova.setDate(nova.getDate() + 7);
      return nova;
    });
  }, []);

  const semanaAnterior = useCallback(() => {
    setDataAtual((prev) => {
      const nova = new Date(prev);
      nova.setDate(nova.getDate() - 7);
      return nova;
    });
  }, []);

  const proximoMes = useCallback(() => {
    setDataAtual((prev) => {
      const nova = new Date(prev);
      nova.setMonth(nova.getMonth() + 1);
      return nova;
    });
  }, []);

  const mesAnterior = useCallback(() => {
    setDataAtual((prev) => {
      const nova = new Date(prev);
      nova.setMonth(nova.getMonth() - 1);
      return nova;
    });
  }, []);

  const hoje = useCallback(() => {
    setDataAtual(new Date());
  }, []);

  // Funções de filtro
  const setFiltros = useCallback((novosFiltros: Partial<FiltrosAgenda>) => {
    setFiltrosState((prev) => ({ ...prev, ...novosFiltros }));
  }, []);

  const limparFiltros = useCallback(() => {
    setFiltrosState({});
  }, []);

  // Funções utilitárias
  const consultasNaData = useCallback(
    (data: Date): Consulta[] => {
      const inicio = new Date(data);
      inicio.setHours(0, 0, 0, 0);
      const fim = new Date(data);
      fim.setHours(23, 59, 59, 999);
      return consultas.filter((consulta) => {
        const dataConsulta = new Date(consulta.data_inicio);
        return dataConsulta >= inicio && dataConsulta <= fim;
      });
    },
    [consultas]
  );

  const temConsultaNaData = useCallback(
    (data: Date): boolean => {
      return consultasNaData(data).length > 0;
    },
    [consultasNaData]
  );

  const proximaConsulta = useCallback((): Consulta | null => {
    const agora = new Date();
    const futuras = consultas
      .filter((consulta) => new Date(consulta.data_inicio) > agora)
      .sort(
        (a, b) =>
          new Date(a.data_inicio).getTime() - new Date(b.data_inicio).getTime()
      );
    return futuras[0] || null;
  }, [consultas]);

  const verificarDisponibilidade = useCallback(
    (data: Date, duracao: number): boolean => {
      return !temConsultaNaData(data);
    },
    [temConsultaNaData]
  );

  const obterHorariosLivres = useCallback(
    (data: Date): { inicio: string; fim: string }[] => {
      const horarios = [];
      for (let hora = 9; hora < 17; hora++) {
        horarios.push({
          inicio: `${hora.toString().padStart(2, "0")}:00`,
          fim: `${(hora + 1).toString().padStart(2, "0")}:00`,
        });
      }
      return horarios;
    },
    []
  );

  const recarregar = useCallback(async () => {
    await carregarConsultas();
    await carregarEstatisticas();
  }, [carregarConsultas, carregarEstatisticas]);

  // Efeitos
  useEffect(() => {
    if (autoLoad && usuarioId) {
      console.log("🚀 Iniciando carregamento automático da agenda");
      recarregar();
    }
  }, [autoLoad, usuarioId, recarregar]);

  useEffect(() => {
    if (autoLoad && usuarioId) {
      carregarConsultas();
    }
  }, [filtros, autoLoad, usuarioId, carregarConsultas]);

  // Recarregar estatísticas quando consultas mudarem
  useEffect(() => {
    if (consultas.length >= 0) {
      // Sempre recarregar, mesmo com 0 consultas
      carregarEstatisticas();
    }
  }, [consultas, carregarEstatisticas]);

  return {
    // Estado
    consultas,
    estatisticas,
    loading,
    error,

    // Filtros e visualização
    filtros,
    modoVisualizacao,
    dataAtual,

    // Actions - Consultas
    criarConsulta,
    atualizarConsulta,
    cancelarConsulta,
    confirmarConsulta,
    iniciarConsulta,
    finalizarConsulta,
    marcarNaoCompareceu,

    // Actions - Horários e Bloqueios
    criarHorarioDisponivel,
    criarBloqueioHorario,

    // Navegação
    irParaData,
    proximaSemana,
    semanaAnterior,
    proximoMes,
    mesAnterior,
    hoje,

    // Filtros
    setFiltros,
    limparFiltros,

    // Visualização
    setModoVisualizacao,

    // Utilidades
    consultasNaData,
    temConsultaNaData,
    proximaConsulta,
    verificarDisponibilidade,
    obterHorariosLivres,

    // Refresh
    recarregar,
  };
};
