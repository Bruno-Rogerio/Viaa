// src/components/public/agenda/PublicAgenda.tsx
// Container para agendamento público (pacientes e outros profissionais)

"use client";

import { useState } from "react";
import { useHorariosDisponiveis } from "@/hooks/dashboard/useHorariosDisponiveis";
import AgendaCalendar from "@/components/common/agenda/AgendaCalendar";
import PublicAgendaHeader from "./PublicAgendaHeader";
import type { Consulta, ModoVisualizacao } from "@/types/agenda";

interface ProfissionalInfo {
  nome: string;
  sobrenome: string;
  especialidades: string;
  foto_perfil_url?: string;
  valor_sessao?: number;
  crp?: string;
  verificado?: boolean;
}

interface PublicAgendaProps {
  profissionalId: string;
  profissionalInfo: ProfissionalInfo;
  usuarioId: string;
  tipoUsuario: "paciente" | "profissional";
  className?: string;
}

export default function PublicAgenda({
  profissionalId,
  profissionalInfo,
  usuarioId,
  tipoUsuario,
  className = "",
}: PublicAgendaProps) {
  // Estados locais
  const [dataAtual, setDataAtual] = useState(new Date());
  const [modoVisualizacao, setModoVisualizacao] =
    useState<ModoVisualizacao>("mes");
  const [modalAgendamento, setModalAgendamento] = useState<{
    aberto: boolean;
    data?: Date;
    horario?: string;
  }>({ aberto: false });

  // Hook para horários disponíveis do profissional
  const {
    configuracao: horariosConfigurados,
    loading: loadingHorarios,
    temHorariosConfigurados,
  } = useHorariosDisponiveis(profissionalId);

  // TODO: Carregar consultas públicas (apenas horários disponíveis + minhas consultas com este profissional)
  // const { consultas, carregando } = useAgenda({
  //   tipoUsuario: "paciente",
  //   profissionalId
  // });

  // Mock de dados temporário
  const consultas: Consulta[] = [];
  const carregando = false;

  // Converter configuração semanal para HorarioDisponivel[]
  const horariosDisponiveis = Object.entries(horariosConfigurados)
    .filter(([_, config]) => config.ativo)
    .map(([diaId, config]) => ({
      id: `${profissionalId}-${diaId}`,
      profissional_id: profissionalId,
      dia_semana: parseInt(diaId),
      hora_inicio: config.hora_inicio,
      hora_fim: config.hora_fim,
      ativo: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));

  // Handlers específicos para agendamento público
  const handleDiaClick = (data: Date) => {
    // Verificar se o dia tem horários disponíveis
    const diaSemana = data.getDay();
    const temHorario = horariosConfigurados[diaSemana]?.ativo;

    if (temHorario) {
      console.log("Dia com horários disponíveis clicado:", data);
      // TODO: Mostrar horários específicos disponíveis no dia
    } else {
      console.log("Dia sem horários configurados:", data);
    }
  };

  const handleHorarioClick = (data: Date, horario: string) => {
    console.log("Solicitar agendamento:", {
      data,
      horario,
      profissionalId,
      usuarioId,
    });

    setModalAgendamento({
      aberto: true,
      data,
      horario,
    });

    // TODO: Abrir modal de confirmação de agendamento
  };

  const handleConsultaClick = (consulta: Consulta) => {
    console.log("Consulta clicada:", consulta);
    // TODO: Mostrar detalhes da consulta (se for do usuário logado)
  };

  const handleSolicitarAgendamento = async (data: Date, horario: string) => {
    console.log("Enviando solicitação de agendamento:", {
      profissional_id: profissionalId,
      solicitante_id: usuarioId,
      data: data.toISOString().split("T")[0],
      horario,
      tipo_consulta: "online", // ou permitir escolha
    });

    // TODO: Chamar API para criar solicitação de consulta
    // const resultado = await criarSolicitacaoConsulta({...});

    setModalAgendamento({ aberto: false });
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header específico para agendamento público */}
      <PublicAgendaHeader
        profissionalInfo={profissionalInfo}
        temHorariosConfigurados={temHorariosConfigurados()}
        tipoUsuario={tipoUsuario}
        loadingHorarios={loadingHorarios}
      />

      {/* Componente puro do calendário */}
      <AgendaCalendar
        consultas={consultas}
        horariosDisponiveis={horariosDisponiveis}
        dataAtual={dataAtual}
        modoVisualizacao={modoVisualizacao}
        carregando={carregando}
        carregandoHorarios={loadingHorarios}
        mostrarIndicadores={{
          horariosDisponiveis: true,
          consultas: true,
          diasInativos: false, // Não mostrar dias inativos para agendamento público
        }}
        onDiaClick={handleDiaClick}
        onConsultaClick={handleConsultaClick}
        onHorarioClick={handleHorarioClick}
        onNavigateData={setDataAtual}
        onChangeModoVisualizacao={setModoVisualizacao}
        className="shadow-lg"
      />

      {/* Modal de confirmação de agendamento */}
      {modalAgendamento.aberto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Confirmar Agendamento
            </h3>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Profissional
                </label>
                <p className="text-gray-900">
                  {profissionalInfo.nome} {profissionalInfo.sobrenome}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data e Horário
                </label>
                <p className="text-gray-900">
                  {modalAgendamento.data?.toLocaleDateString("pt-BR", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}{" "}
                  às {modalAgendamento.horario}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Valor da Sessão
                </label>
                <p className="text-gray-900">
                  {profissionalInfo.valor_sessao
                    ? `R$ ${profissionalInfo.valor_sessao.toLocaleString(
                        "pt-BR"
                      )}`
                    : "Consultar com o profissional"}
                </p>
              </div>
            </div>

            <div className="flex space-x-4">
              <button
                onClick={() => setModalAgendamento({ aberto: false })}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() =>
                  modalAgendamento.data &&
                  modalAgendamento.horario &&
                  handleSolicitarAgendamento(
                    modalAgendamento.data,
                    modalAgendamento.horario
                  )
                }
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Confirmar Agendamento
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
