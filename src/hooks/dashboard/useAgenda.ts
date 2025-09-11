// viaa/src/hooks/dashboard/useAgenda.ts

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import type {
  Consulta,
  EstatisticasAgenda,
  FiltrosAgenda,
  ModoVisualizacao,
  ResultadoOperacao,
  CriarHorarioDisponivel,
  CriarBloqueioHorario,
  UseAgendaReturn,
} from "@/types/agenda";

interface UseAgendaProps {
  tipoUsuario: "profissional" | "paciente";
  profissionalId: string; // ID do profissional cuja agenda está sendo visualizada
}

export function useAgenda({
  tipoUsuario,
  profissionalId,
}: UseAgendaProps): UseAgendaReturn {
  const { user } = useAuth();

  // Estados
  const [consultas, setConsultas] = useState<Consulta[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [dataAtual, setDataAtual] = useState(new Date());
  const [modoVisualizacao, setModoVisualizacao] =
    useState<ModoVisualizacao>("mes");
  const [filtros, setFiltros] = useState<FiltrosAgenda>({});
  const [estatisticas, setEstatisticas] = useState<EstatisticasAgenda | null>(
    null
  );

  // Lógica inteligente de contexto
  const ehMinhaAgenda =
    tipoUsuario === "profissional" && user?.id === profissionalId;
  const comportarComoPaciente = !ehMinhaAgenda;

  // Carregar consultas baseado no contexto
  const carregarConsultas = useCallback(async () => {
    if (!user) return;

    setCarregando(true);
    setErro(null);

    try {
      let endpoint = "";
      let params = new URLSearchParams();

      if (ehMinhaAgenda) {
        // Profissional vendo SUA própria agenda - vê TODAS as consultas
        endpoint = `/api/consultas/profissional/${profissionalId}`;
      } else {
        // Comportamento de paciente - vê apenas:
        // 1. Horários disponíveis do profissional
        // 2. Suas próprias consultas com esse profissional
        endpoint = `/api/consultas/profissional/${profissionalId}/publicas`;
        params.append("solicitante_id", user.id);
        params.append("incluir_disponiveis", "true");
      }

      // Adicionar filtros
      if (filtros.data_inicio)
        params.append("data_inicio", filtros.data_inicio);
      if (filtros.data_fim) params.append("data_fim", filtros.data_fim);
      if (filtros.status)
        filtros.status.forEach((s) => params.append("status", s));
      if (filtros.tipo) filtros.tipo.forEach((t) => params.append("tipo", t));
      if (filtros.busca) params.append("busca", filtros.busca);

      const url = `${endpoint}?${params.toString()}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Erro ao carregar consultas");
      }

      const data = await response.json();
      setConsultas(data.consultas || []);
      setEstatisticas(data.estatisticas || null);
    } catch (error) {
      console.error("Erro ao carregar consultas:", error);
      setErro("Erro ao carregar consultas. Tente novamente.");
    } finally {
      setCarregando(false);
    }
  }, [user, ehMinhaAgenda, profissionalId, comportarComoPaciente, filtros]);

  // Carregar consultas quando componente monta ou dependências mudam
  useEffect(() => {
    carregarConsultas();
  }, [carregarConsultas]);

  // AÇÕES PARA PROFISSIONAIS EM SUA PRÓPRIA AGENDA
  const confirmarConsulta = useCallback(
    async (id: string): Promise<ResultadoOperacao> => {
      if (!ehMinhaAgenda) {
        return {
          sucesso: false,
          mensagem:
            "Apenas profissionais podem confirmar consultas em sua agenda",
        };
      }

      try {
        const response = await fetch(`/api/consultas/${id}/confirmar`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ profissional_id: user?.id }),
        });

        if (!response.ok) throw new Error("Erro ao confirmar consulta");

        const data = await response.json();

        // Atualizar estado local
        setConsultas((prev) =>
          prev.map((consulta) =>
            consulta.id === id
              ? { ...consulta, status: "confirmada" as const }
              : consulta
          )
        );

        // TODO: Enviar notificação para o paciente/solicitante

        return {
          sucesso: true,
          mensagem: "Consulta confirmada com sucesso",
          dados: data,
        };
      } catch (error) {
        console.error("Erro ao confirmar consulta:", error);
        return {
          sucesso: false,
          mensagem: "Erro ao confirmar consulta. Tente novamente.",
        };
      }
    },
    [ehMinhaAgenda, user?.id]
  );

  const rejeitarConsulta = useCallback(
    async (id: string, motivo?: string): Promise<ResultadoOperacao> => {
      if (!ehMinhaAgenda) {
        return {
          sucesso: false,
          mensagem:
            "Apenas profissionais podem rejeitar consultas em sua agenda",
        };
      }

      try {
        const response = await fetch(`/api/consultas/${id}/rejeitar`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ profissional_id: user?.id, motivo }),
        });

        if (!response.ok) throw new Error("Erro ao rejeitar consulta");

        const data = await response.json();

        // Atualizar estado local
        setConsultas((prev) =>
          prev.map((consulta) =>
            consulta.id === id
              ? { ...consulta, status: "rejeitada" as const }
              : consulta
          )
        );

        return {
          sucesso: true,
          mensagem: "Consulta rejeitada",
          dados: data,
        };
      } catch (error) {
        console.error("Erro ao rejeitar consulta:", error);
        return {
          sucesso: false,
          mensagem: "Erro ao rejeitar consulta. Tente novamente.",
        };
      }
    },
    [ehMinhaAgenda, user?.id]
  );

  const iniciarConsulta = useCallback(
    async (id: string): Promise<ResultadoOperacao> => {
      if (!ehMinhaAgenda) {
        return {
          sucesso: false,
          mensagem:
            "Apenas profissionais podem iniciar consultas em sua agenda",
        };
      }

      try {
        const response = await fetch(`/api/consultas/${id}/iniciar`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ profissional_id: user?.id }),
        });

        if (!response.ok) throw new Error("Erro ao iniciar consulta");

        const data = await response.json();

        setConsultas((prev) =>
          prev.map((consulta) =>
            consulta.id === id
              ? { ...consulta, status: "em_andamento" as const }
              : consulta
          )
        );

        return {
          sucesso: true,
          mensagem: "Consulta iniciada",
          dados: data,
        };
      } catch (error) {
        console.error("Erro ao iniciar consulta:", error);
        return {
          sucesso: false,
          mensagem: "Erro ao iniciar consulta. Tente novamente.",
        };
      }
    },
    [ehMinhaAgenda, user?.id]
  );

  const finalizarConsulta = useCallback(
    async (id: string, observacoes?: string): Promise<ResultadoOperacao> => {
      if (!ehMinhaAgenda) {
        return {
          sucesso: false,
          mensagem:
            "Apenas profissionais podem finalizar consultas em sua agenda",
        };
      }

      try {
        const response = await fetch(`/api/consultas/${id}/finalizar`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ profissional_id: user?.id, observacoes }),
        });

        if (!response.ok) throw new Error("Erro ao finalizar consulta");

        const data = await response.json();

        setConsultas((prev) =>
          prev.map((consulta) =>
            consulta.id === id
              ? {
                  ...consulta,
                  status: "concluida" as const,
                  observacoes: observacoes || consulta.observacoes,
                }
              : consulta
          )
        );

        return {
          sucesso: true,
          mensagem: "Consulta finalizada com sucesso",
          dados: data,
        };
      } catch (error) {
        console.error("Erro ao finalizar consulta:", error);
        return {
          sucesso: false,
          mensagem: "Erro ao finalizar consulta. Tente novamente.",
        };
      }
    },
    [ehMinhaAgenda, user?.id]
  );

  const marcarNaoCompareceu = useCallback(
    async (id: string): Promise<ResultadoOperacao> => {
      if (!ehMinhaAgenda) {
        return {
          sucesso: false,
          mensagem:
            "Apenas profissionais podem marcar não comparecimento em sua agenda",
        };
      }

      try {
        const response = await fetch(`/api/consultas/${id}/nao-compareceu`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ profissional_id: user?.id }),
        });

        if (!response.ok) throw new Error("Erro ao marcar não comparecimento");

        const data = await response.json();

        setConsultas((prev) =>
          prev.map((consulta) =>
            consulta.id === id
              ? { ...consulta, status: "nao_compareceu" as const }
              : consulta
          )
        );

        return {
          sucesso: true,
          mensagem: "Marcado como não compareceu",
          dados: data,
        };
      } catch (error) {
        console.error("Erro ao marcar não comparecimento:", error);
        return {
          sucesso: false,
          mensagem: "Erro ao marcar não comparecimento. Tente novamente.",
        };
      }
    },
    [ehMinhaAgenda, user?.id]
  );

  // AÇÕES COMUNS - Cancelar consulta (ambos os tipos de usuário)
  const cancelarConsulta = useCallback(
    async (id: string, motivo?: string): Promise<ResultadoOperacao> => {
      try {
        const response = await fetch(`/api/consultas/${id}/cancelar`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            usuario_id: user?.id,
            tipo_usuario: tipoUsuario,
            eh_minha_agenda: ehMinhaAgenda,
            motivo,
          }),
        });

        if (!response.ok) throw new Error("Erro ao cancelar consulta");

        const data = await response.json();

        setConsultas((prev) =>
          prev.map((consulta) =>
            consulta.id === id
              ? { ...consulta, status: "cancelada" as const }
              : consulta
          )
        );

        return {
          sucesso: true,
          mensagem: "Consulta cancelada com sucesso",
          dados: data,
        };
      } catch (error) {
        console.error("Erro ao cancelar consulta:", error);
        return {
          sucesso: false,
          mensagem: "Erro ao cancelar consulta. Tente novamente.",
        };
      }
    },
    [tipoUsuario, ehMinhaAgenda, user?.id]
  );

  // AÇÕES PARA GERENCIAR AGENDA (apenas profissionais em sua própria agenda)
  const criarHorarioDisponivel = useCallback(
    async (dados: CriarHorarioDisponivel): Promise<ResultadoOperacao> => {
      if (!ehMinhaAgenda) {
        return {
          sucesso: false,
          mensagem:
            "Apenas profissionais podem configurar horários em sua agenda",
        };
      }

      try {
        const response = await fetch("/api/horarios-disponiveis", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(dados),
        });

        if (!response.ok) throw new Error("Erro ao criar horário disponível");

        const data = await response.json();

        return {
          sucesso: true,
          mensagem: "Horário disponível criado",
          dados: data,
        };
      } catch (error) {
        console.error("Erro ao criar horário disponível:", error);
        return {
          sucesso: false,
          mensagem: "Erro ao criar horário disponível. Tente novamente.",
        };
      }
    },
    [ehMinhaAgenda]
  );

  const criarBloqueioHorario = useCallback(
    async (dados: CriarBloqueioHorario): Promise<ResultadoOperacao> => {
      if (!ehMinhaAgenda) {
        return {
          sucesso: false,
          mensagem:
            "Apenas profissionais podem bloquear horários em sua agenda",
        };
      }

      try {
        const response = await fetch("/api/bloqueios-horario", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(dados),
        });

        if (!response.ok) throw new Error("Erro ao criar bloqueio de horário");

        const data = await response.json();

        return {
          sucesso: true,
          mensagem: "Horário bloqueado",
          dados: data,
        };
      } catch (error) {
        console.error("Erro ao bloquear horário:", error);
        return {
          sucesso: false,
          mensagem: "Erro ao bloquear horário. Tente novamente.",
        };
      }
    },
    [ehMinhaAgenda]
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
  const aplicarFiltros = useCallback((novosFiltros: Partial<FiltrosAgenda>) => {
    setFiltros((prev) => ({ ...prev, ...novosFiltros }));
  }, []);

  const limparFiltros = useCallback(() => {
    setFiltros({});
  }, []);

  // Funções utilitárias
  const consultasNaData = useCallback(
    (data: Date): Consulta[] => {
      return consultas.filter((consulta) => {
        const dataConsulta = new Date(consulta.data_inicio);
        return (
          dataConsulta.getDate() === data.getDate() &&
          dataConsulta.getMonth() === data.getMonth() &&
          dataConsulta.getFullYear() === data.getFullYear()
        );
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
    const consultasFuturas = consultas
      .filter((consulta) => new Date(consulta.data_inicio) > agora)
      .sort(
        (a, b) =>
          new Date(a.data_inicio).getTime() - new Date(b.data_inicio).getTime()
      );

    return consultasFuturas[0] || null;
  }, [consultas]);

  const verificarDisponibilidade = useCallback(
    (data: Date, duracao: number): boolean => {
      // TODO: Implementar lógica de verificação de disponibilidade
      // Verificar horários disponíveis vs consultas agendadas vs bloqueios
      return true;
    },
    []
  );

  const obterHorariosLivres = useCallback(
    (data: Date): { inicio: string; fim: string }[] => {
      // TODO: Implementar lógica para obter horários livres
      // Baseado nos horários disponíveis configurados pelo profissional
      // Menos as consultas já agendadas e bloqueios
      return [];
    },
    []
  );

  const recarregar = useCallback(async () => {
    await carregarConsultas();
  }, [carregarConsultas]);

  return {
    // Estado
    consultas,
    carregando,
    erro,
    dataAtual,
    modoVisualizacao,
    filtros,
    estatisticas,

    // Actions - Consultas
    confirmarConsulta,
    rejeitarConsulta,
    cancelarConsulta,
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
    setFiltros: aplicarFiltros,
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
}
