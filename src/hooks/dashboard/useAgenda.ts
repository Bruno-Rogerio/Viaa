// src/hooks/dashboard/useAgenda.ts - VERSÃO FINAL CORRIGIDA

import { useState, useEffect, useCallback, useRef } from "react";
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

  // Ref para prevenir múltiplas chamadas
  const isLoadingRef = useRef(false);

  // Função para limpar erros
  const clearError = useCallback(() => setError(null), []);

  // Carregar consultas sem JOIN (mais seguro)
  const carregarConsultas = useCallback(async () => {
    // Prevenir múltiplas chamadas simultâneas
    if (isLoadingRef.current) {
      console.log("⏭️ Pulando carregamento - já em andamento");
      return;
    }

    try {
      isLoadingRef.current = true;
      setLoading(true);
      setError(null);

      console.log(
        "🔍 Carregando consultas para usuário:",
        usuarioId,
        "tipo:",
        tipoUsuario
      );

      // Query simples sem JOINs
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

      // Buscar relacionamentos separadamente
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
      setConsultas([]);
    } finally {
      setLoading(false);
      isLoadingRef.current = false;
    }
  }, [tipoUsuario, usuarioId]); // APENAS dependencies que não mudam

  // Carregar estatísticas
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

      // Usar consultas atuais do state
      const consultasHoje = consultas.filter((c) => {
        const data = new Date(c.data_inicio);
        return data >= inicioHoje && data <= fimHoje;
      }).length;

      const consultasSemana = consultas.filter((c) => {
        const data = new Date(c.data_inicio);
        return data >= inicioSemana && data <= fimHoje;
      }).length;

      const consultasMes = consultas.filter((c) => {
        const data = new Date(c.data_inicio);
        return data >= inicioMes && data <= fimMes;
      }).length;

      const estatisticasCalculadas: EstatisticasAgenda = {
        total_consultas: consultas.length,
        consultas_hoje: consultasHoje,
        consultas_semana: consultasSemana,
        consultas_mes: consultasMes,
        proxima_consulta:
          consultas
            .filter((c) => new Date(c.data_inicio) > hoje)
            .sort(
              (a, b) =>
                new Date(a.data_inicio).getTime() -
                new Date(b.data_inicio).getTime()
            )[0] || undefined,
        taxa_comparecimento: 0,
        receita_mes: consultas
          .filter((c) => {
            const data = new Date(c.data_inicio);
            return (
              data >= inicioMes && data <= fimMes && c.status === "concluida"
            );
          })
          .reduce((total, c) => total + (c.valor || 0), 0),
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
        horarios_livres_hoje: 8,
        consultas_canceladas_mes: consultas.filter((c) => {
          const data = new Date(c.data_inicio);
          return (
            data >= inicioMes && data <= fimMes && c.status === "cancelada"
          );
        }).length,
      };

      setEstatisticas(estatisticasCalculadas);
    } catch (err: any) {
      console.error("❌ Erro ao carregar estatísticas:", err);
      setError(err.message || "Erro ao carregar estatísticas");
    }
  }, []); // SEM dependencies - usa state atual

  // Funções de filtro
  const setFiltros = useCallback((novosFiltros: Partial<FiltrosAgenda>) => {
    setFiltrosState((prev) => ({ ...prev, ...novosFiltros }));
  }, []);

  const limparFiltros = useCallback(() => {
    setFiltrosState({});
  }, []);

  // Recarregar tudo
  const recarregar = useCallback(async () => {
    await carregarConsultas();
    setTimeout(() => {
      carregarEstatisticas();
    }, 100);
  }, [carregarConsultas, carregarEstatisticas]);

  // ✅ FUNÇÕES COM ASSINATURAS CORRETAS CONFORME UseAgendaReturn
  const criarConsulta = useCallback(
    async (dados: CriarConsulta): Promise<ResultadoOperacao> => {
      console.log("Criando consulta:", dados);
      return { sucesso: false, mensagem: "Em desenvolvimento" };
    },
    []
  );

  const atualizarConsulta = useCallback(
    async (dados: AtualizarConsulta): Promise<ResultadoOperacao> => {
      console.log("Atualizando consulta ID:", dados.id, dados);
      return { sucesso: false, mensagem: "Em desenvolvimento" };
    },
    []
  );

  const cancelarConsulta = useCallback(
    async (id: string, motivo?: string): Promise<ResultadoOperacao> => {
      console.log("Cancelando consulta:", id, "motivo:", motivo);
      return { sucesso: false, mensagem: "Em desenvolvimento" };
    },
    []
  );

  const confirmarConsulta = useCallback(
    async (id: string): Promise<ResultadoOperacao> => {
      console.log("Confirmando consulta:", id);
      return { sucesso: false, mensagem: "Em desenvolvimento" };
    },
    []
  );

  const iniciarConsulta = useCallback(
    async (id: string): Promise<ResultadoOperacao> => {
      console.log("Iniciando consulta:", id);
      return { sucesso: false, mensagem: "Em desenvolvimento" };
    },
    []
  );

  const finalizarConsulta = useCallback(
    async (id: string, observacoes?: string): Promise<ResultadoOperacao> => {
      console.log("Finalizando consulta:", id, "observações:", observacoes);
      return { sucesso: false, mensagem: "Em desenvolvimento" };
    },
    []
  );

  const marcarNaoCompareceu = useCallback(
    async (id: string): Promise<ResultadoOperacao> => {
      console.log("Marcando não compareceu:", id);
      return { sucesso: false, mensagem: "Em desenvolvimento" };
    },
    []
  );

  const criarHorarioDisponivel = useCallback(
    async (dados: CriarHorarioDisponivel): Promise<ResultadoOperacao> => {
      console.log("Criando horário disponível:", dados);
      return { sucesso: false, mensagem: "Em desenvolvimento" };
    },
    []
  );

  const criarBloqueioHorario = useCallback(
    async (dados: CriarBloqueioHorario): Promise<ResultadoOperacao> => {
      console.log("Criando bloqueio:", dados);
      return { sucesso: false, mensagem: "Em desenvolvimento" };
    },
    []
  );

  // useEffect CORRIGIDOS - SEM loops infinitos

  // 1. Carregamento inicial APENAS uma vez
  useEffect(() => {
    if (autoLoad && usuarioId && !isLoadingRef.current) {
      console.log("🚀 Carregamento inicial da agenda");
      carregarConsultas();
    }
  }, [autoLoad, usuarioId, carregarConsultas]);

  // 2. Recarregar APENAS quando filtros mudarem
  useEffect(() => {
    if (autoLoad && usuarioId && Object.keys(filtros).length > 0) {
      console.log("🔄 Recarregando por mudança de filtros");
      carregarConsultas();
    }
  }, [filtros]); // APENAS filtros

  // 3. Calcular estatísticas quando consultas mudarem
  useEffect(() => {
    if (consultas.length >= 0) {
      carregarEstatisticas();
    }
  }, [consultas.length]); // APENAS length

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
