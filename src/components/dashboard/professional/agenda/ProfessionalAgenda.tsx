// src/components/dashboard/professional/agenda/ProfessionalAgenda.tsx
// Container específico para profissionais - com lógica de negócio

"use client";

import { useState } from "react";
import { useHorariosDisponiveis } from "@/hooks/dashboard/useHorariosDisponiveis";
import AgendaCalendar from "../../common/agenda/AgendaCalendar";
import ProfessionalAgendaHeader from "./ProfessionalAgendaHeader";
import type { Consulta, ModoVisualizacao } from "@/types/agenda";

interface ProfessionalAgendaProps {
  profissionalId: string;
  onConfigurarHorarios?: () => void;
  className?: string;
}

export default function ProfessionalAgenda({
  profissionalId,
  onConfigurarHorarios,
  className = "",
}: ProfessionalAgendaProps) {
  // Estados locais
  const [dataAtual, setDataAtual] = useState(new Date());
  const [modoVisualizacao, setModoVisualizacao] =
    useState<ModoVisualizacao>("mes");
  const [consultaSelecionada, setConsultaSelecionada] =
    useState<Consulta | null>(null);

  // Hook para horários configurados
  const {
    configuracao: horariosConfigurados,
    loading: loadingHorarios,
    temHorariosConfigurados,
    obterDiasAtivos,
  } = useHorariosDisponiveis(profissionalId);

  // TODO: Integrar com useAgenda quando estiver pronto
  // const { consultas, carregando, erro } = useAgenda({
  //   tipoUsuario: "profissional",
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

  // Handlers específicos do profissional
  const handleConsultaClick = (consulta: Consulta) => {
    setConsultaSelecionada(consulta);
    console.log("Profissional - Consulta clicada:", consulta);
    // TODO: Abrir modal de detalhes da consulta
  };

  const handleDiaClick = (data: Date) => {
    console.log("Profissional - Dia clicado:", data);
    // TODO: Lógica específica do profissional (criar bloqueio, ver agenda do dia, etc.)
  };

  const handleConfirmarConsulta = (consulta: Consulta) => {
    console.log("Confirmar consulta:", consulta);
    // TODO: Chamar API para confirmar consulta
  };

  const handleRejeitarConsulta = (consulta: Consulta) => {
    console.log("Rejeitar consulta:", consulta);
    // TODO: Chamar API para rejeitar consulta
  };

  const handleIniciarConsulta = (consulta: Consulta) => {
    console.log("Iniciar consulta:", consulta);
    // TODO: Iniciar videochamada ou marcar como em andamento
  };

  const handleFinalizarConsulta = (consulta: Consulta) => {
    console.log("Finalizar consulta:", consulta);
    // TODO: Marcar como concluída e adicionar observações
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header específico do profissional */}
      <ProfessionalAgendaHeader
        profissionalId={profissionalId}
        horariosConfigurados={horariosConfigurados}
        temHorariosConfigurados={temHorariosConfigurados()}
        diasAtivos={obterDiasAtivos()}
        loadingHorarios={loadingHorarios}
        onConfigurarHorarios={onConfigurarHorarios}
        consultas={consultas}
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
          horariosConfigurados: true,
          consultas: true,
          diasInativos: true,
        }}
        onDiaClick={handleDiaClick}
        onConsultaClick={handleConsultaClick}
        onNavigateData={setDataAtual}
        onChangeModoVisualizacao={setModoVisualizacao}
        className="shadow-lg"
      />

      {/* TODO: Modais específicos do profissional */}
      {/* - Modal de detalhes da consulta
          - Modal de confirmação/rejeição
          - Modal de observações
          - Modal de bloqueio de horário */}
    </div>
  );
}
