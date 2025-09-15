// src/components/dashboard/common/agenda/AgendaCalendar.tsx
// 🔧 VERSÃO ATUALIZADA - Usando AgendaControls mobile-friendly

"use client";

import { useState, useMemo } from "react";
import {
  CalendarIcon as CalendarSolid,
  ClockIcon,
  UserIcon,
  VideoCameraIcon,
  MapPinIcon,
  CheckCircleIcon,
  XCircleIcon,
  PlayCircleIcon,
  StopCircleIcon,
} from "@heroicons/react/24/solid";
import { EllipsisVerticalIcon } from "@heroicons/react/24/outline";
import AgendaControls from "./AgendaControls";
import type {
  Consulta,
  StatusConsulta,
  ModoVisualizacao,
  HorarioDisponivel,
} from "@/types/agenda";

interface IndicadoresVisuais {
  horariosConfigurados: boolean;
  horariosDisponiveis: boolean;
  consultas: boolean;
  diasInativos: boolean;
}

interface AgendaCalendarProps {
  // Dados puros
  consultas: Consulta[];
  horariosDisponiveis?: HorarioDisponivel[];
  dataAtual: Date;
  modoVisualizacao: ModoVisualizacao;

  // Configurações de exibição
  mostrarIndicadores?: Partial<IndicadoresVisuais>;
  altura?: string;
  className?: string;

  // Estados de loading
  carregando?: boolean;
  carregandoHorarios?: boolean;

  // Callbacks puros
  onDiaClick?: (data: Date) => void;
  onConsultaClick?: (consulta: Consulta) => void;
  onHorarioClick?: (data: Date, horario: string) => void;
  onNavigateData?: (data: Date) => void;
  onChangeModoVisualizacao?: (modo: ModoVisualizacao) => void;
}

// Configurações visuais
const CORES_STATUS: Record<
  StatusConsulta,
  { bg: string; text: string; border: string }
> = {
  agendada: {
    bg: "bg-yellow-50",
    text: "text-yellow-800",
    border: "border-yellow-200",
  },
  confirmada: {
    bg: "bg-blue-50",
    text: "text-blue-800",
    border: "border-blue-200",
  },
  em_andamento: {
    bg: "bg-purple-50",
    text: "text-purple-800",
    border: "border-purple-200",
  },
  concluida: {
    bg: "bg-green-50",
    text: "text-green-800",
    border: "border-green-200",
  },
  cancelada: {
    bg: "bg-red-50",
    text: "text-red-800",
    border: "border-red-200",
  },
  rejeitada: {
    bg: "bg-gray-50",
    text: "text-gray-800",
    border: "border-gray-200",
  },
  nao_compareceu: {
    bg: "bg-orange-50",
    text: "text-orange-800",
    border: "border-orange-200",
  },
};

const HORARIOS_PADRAO = [
  "07:00",
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
  "19:00",
  "20:00",
];

const DIAS_SEMANA = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export default function AgendaCalendar({
  consultas = [],
  horariosDisponiveis = [],
  dataAtual,
  modoVisualizacao,
  mostrarIndicadores = {},
  altura = "h-[600px]",
  className = "",
  carregando = false,
  carregandoHorarios = false,
  onDiaClick,
  onConsultaClick,
  onHorarioClick,
  onNavigateData,
  onChangeModoVisualizacao,
}: AgendaCalendarProps) {
  // Estados locais para UI
  const [filtroLista, setFiltroLista] = useState<
    "todos" | "hoje" | "semana" | "mes"
  >("todos");
  const [buscaLista, setBuscaLista] = useState("");

  // Filtrar consultas para modo lista
  const consultasFiltradas = useMemo(() => {
    let filtradas = consultas;

    // Filtro por período
    const agora = new Date();
    switch (filtroLista) {
      case "hoje":
        filtradas = filtradas.filter((consulta) => {
          const dataConsulta = new Date(consulta.data_inicio);
          return dataConsulta.toDateString() === agora.toDateString();
        });
        break;
      case "semana":
        const inicioSemana = new Date(agora);
        inicioSemana.setDate(agora.getDate() - agora.getDay());
        const fimSemana = new Date(inicioSemana);
        fimSemana.setDate(inicioSemana.getDate() + 6);
        filtradas = filtradas.filter((consulta) => {
          const dataConsulta = new Date(consulta.data_inicio);
          return dataConsulta >= inicioSemana && dataConsulta <= fimSemana;
        });
        break;
      case "mes":
        filtradas = filtradas.filter((consulta) => {
          const dataConsulta = new Date(consulta.data_inicio);
          return (
            dataConsulta.getMonth() === agora.getMonth() &&
            dataConsulta.getFullYear() === agora.getFullYear()
          );
        });
        break;
    }

    // Filtro por busca
    if (buscaLista.trim()) {
      filtradas = filtradas.filter((consulta) => {
        const searchLower = buscaLista.toLowerCase();
        const nomeCompleto = consulta.paciente?.nome
          ? `${consulta.paciente.nome} ${
              consulta.paciente?.sobrenome || ""
            }`.trim()
          : "";

        return (
          consulta.titulo.toLowerCase().includes(searchLower) ||
          nomeCompleto.toLowerCase().includes(searchLower) ||
          consulta.observacoes?.toLowerCase().includes(searchLower)
        );
      });
    }

    return filtradas.sort(
      (a, b) =>
        new Date(a.data_inicio).getTime() - new Date(b.data_inicio).getTime()
    );
  }, [consultas, filtroLista, buscaLista]);

  // Verificar se uma data tem horário disponível
  const temHorarioDisponivel = (data: Date) => {
    const diaSemana = data.getDay();
    return horariosDisponiveis.some(
      (horario) => horario.dia_semana === diaSemana && horario.ativo
    );
  };

  // Obter consultas de uma data específica
  const consultasNaData = (data: Date) => {
    return consultas.filter((consulta) => {
      const dataConsulta = new Date(consulta.data_inicio);
      return (
        dataConsulta.getDate() === data.getDate() &&
        dataConsulta.getMonth() === data.getMonth() &&
        dataConsulta.getFullYear() === data.getFullYear()
      );
    });
  };

  // ===== VISUALIZAÇÃO MENSAL =====
  const renderMes = () => {
    const primeiroDia = new Date(
      dataAtual.getFullYear(),
      dataAtual.getMonth(),
      1
    );
    const ultimoDia = new Date(
      dataAtual.getFullYear(),
      dataAtual.getMonth() + 1,
      0
    );
    const diasNoMes = ultimoDia.getDate();
    const primeiroDiaSemana = primeiroDia.getDay();

    const dias = [];

    // Adicionar dias vazios do início
    for (let i = 0; i < primeiroDiaSemana; i++) {
      dias.push(null);
    }

    // Adicionar dias do mês
    for (let dia = 1; dia <= diasNoMes; dia++) {
      dias.push(dia);
    }

    return (
      <div className="h-full">
        {/* Cabeçalho dos dias da semana */}
        <div className="grid grid-cols-7 gap-1 mb-2 text-center text-sm font-medium text-gray-500">
          {DIAS_SEMANA.map((dia) => (
            <div key={dia} className="p-2">
              {dia}
            </div>
          ))}
        </div>

        {/* Grid do calendário */}
        <div className="grid grid-cols-7 gap-1 h-full">
          {dias.map((dia, index) => {
            if (!dia) {
              return <div key={index} className="p-1"></div>;
            }

            const data = new Date(
              dataAtual.getFullYear(),
              dataAtual.getMonth(),
              dia
            );
            const temHorario = temHorarioDisponivel(data);
            const consultasDia = consultasNaData(data);
            const isHoje = data.toDateString() === new Date().toDateString();

            return (
              <div
                key={dia}
                onClick={() => onDiaClick?.(data)}
                className={`
                  relative p-2 min-h-[80px] border border-gray-200 rounded-lg cursor-pointer
                  hover:border-blue-300 transition-colors
                  ${
                    isHoje
                      ? "bg-blue-50 border-blue-300"
                      : "bg-white hover:bg-gray-50"
                  }
                  ${
                    !temHorario && mostrarIndicadores.diasInativos
                      ? "bg-gray-100"
                      : ""
                  }
                `}
              >
                <div className="text-sm font-medium text-gray-900 mb-1">
                  {dia}
                </div>

                {/* Indicador de horário disponível */}
                {temHorario && mostrarIndicadores.horariosDisponiveis && (
                  <div className="absolute top-1 right-1 w-2 h-2 bg-green-400 rounded-full"></div>
                )}

                {/* Consultas do dia */}
                <div className="space-y-1">
                  {consultasDia.slice(0, 2).map((consulta) => (
                    <div
                      key={consulta.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onConsultaClick?.(consulta);
                      }}
                      className={`
                        text-xs p-1 rounded truncate cursor-pointer
                        ${CORES_STATUS[consulta.status].bg}
                        ${CORES_STATUS[consulta.status].text}
                        ${CORES_STATUS[consulta.status].border}
                        hover:opacity-80
                      `}
                    >
                      {new Date(consulta.data_inicio).toLocaleTimeString(
                        "pt-BR",
                        {
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )}{" "}
                      - {consulta.titulo}
                    </div>
                  ))}
                  {consultasDia.length > 2 && (
                    <div className="text-xs text-gray-500 text-center">
                      +{consultasDia.length - 2} mais
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // ===== VISUALIZAÇÃO SEMANAL =====
  const renderSemana = () => {
    const inicioSemana = new Date(dataAtual);
    inicioSemana.setDate(dataAtual.getDate() - dataAtual.getDay());

    const diasSemana = [];
    for (let i = 0; i < 7; i++) {
      const data = new Date(inicioSemana);
      data.setDate(inicioSemana.getDate() + i);
      diasSemana.push(data);
    }

    return (
      <div className="h-full flex flex-col">
        {/* Header dos dias */}
        <div className="grid grid-cols-8 gap-1 mb-2">
          <div className="p-2"></div> {/* Espaço para horários */}
          {diasSemana.map((data, index) => {
            const isHoje = data.toDateString() === new Date().toDateString();
            return (
              <div
                key={index}
                className={`p-2 text-center text-sm font-medium rounded-lg ${
                  isHoje ? "bg-blue-100 text-blue-800" : "text-gray-600"
                }`}
              >
                <div>{DIAS_SEMANA[data.getDay()]}</div>
                <div className="text-lg font-bold">{data.getDate()}</div>
              </div>
            );
          })}
        </div>

        {/* Grid de horários */}
        <div className="flex-1 overflow-auto">
          <div className="grid grid-cols-8 gap-1">
            {/* Coluna de horários */}
            <div className="space-y-1">
              {HORARIOS_PADRAO.map((horario) => (
                <div
                  key={horario}
                  className="h-12 p-1 text-xs text-gray-500 text-right"
                >
                  {horario}
                </div>
              ))}
            </div>

            {/* Colunas dos dias */}
            {diasSemana.map((data, diaIndex) => (
              <div key={diaIndex} className="space-y-1">
                {HORARIOS_PADRAO.map((horario) => {
                  const consultasHorario = consultas.filter((consulta) => {
                    const dataConsulta = new Date(consulta.data_inicio);
                    const horarioConsulta = dataConsulta.toLocaleTimeString(
                      "pt-BR",
                      {
                        hour: "2-digit",
                        minute: "2-digit",
                      }
                    );
                    return (
                      dataConsulta.toDateString() === data.toDateString() &&
                      horarioConsulta === horario
                    );
                  });

                  const temHorario = temHorarioDisponivel(data);

                  return (
                    <div
                      key={horario}
                      onClick={() => onHorarioClick?.(data, horario)}
                      className={`
                        h-12 p-1 border border-gray-200 rounded cursor-pointer text-xs
                        hover:border-blue-300 transition-colors
                        ${temHorario ? "bg-green-50" : "bg-gray-50"}
                        ${consultasHorario.length > 0 ? "bg-blue-100" : ""}
                      `}
                    >
                      {consultasHorario.map((consulta) => (
                        <div
                          key={consulta.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            onConsultaClick?.(consulta);
                          }}
                          className={`
                            text-xs p-1 rounded truncate cursor-pointer mb-1
                            ${CORES_STATUS[consulta.status].bg}
                            ${CORES_STATUS[consulta.status].text}
                          `}
                        >
                          {consulta.titulo}
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // ===== VISUALIZAÇÃO LISTA =====
  const renderLista = () => {
    return (
      <div className="h-full flex flex-col">
        {/* Filtros para lista */}
        <div className="p-4 border-b border-gray-200 space-y-4">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFiltroLista("todos")}
              className={`px-3 py-1 text-sm rounded-lg ${
                filtroLista === "todos"
                  ? "bg-blue-100 text-blue-800"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setFiltroLista("hoje")}
              className={`px-3 py-1 text-sm rounded-lg ${
                filtroLista === "hoje"
                  ? "bg-blue-100 text-blue-800"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Hoje
            </button>
            <button
              onClick={() => setFiltroLista("semana")}
              className={`px-3 py-1 text-sm rounded-lg ${
                filtroLista === "semana"
                  ? "bg-blue-100 text-blue-800"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Esta Semana
            </button>
            <button
              onClick={() => setFiltroLista("mes")}
              className={`px-3 py-1 text-sm rounded-lg ${
                filtroLista === "mes"
                  ? "bg-blue-100 text-blue-800"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Este Mês
            </button>
          </div>

          <div className="relative">
            <input
              type="text"
              placeholder="Buscar por paciente ou título..."
              value={buscaLista}
              onChange={(e) => setBuscaLista(e.target.value)}
              className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Lista de consultas */}
        <div className="flex-1 overflow-auto p-4">
          {consultasFiltradas.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Nenhuma consulta encontrada
            </div>
          ) : (
            <div className="space-y-3">
              {consultasFiltradas.map((consulta) => (
                <div
                  key={consulta.id}
                  onClick={() => onConsultaClick?.(consulta)}
                  className={`
                    p-4 rounded-lg border cursor-pointer hover:shadow-md transition-all
                    ${CORES_STATUS[consulta.status].bg}
                    ${CORES_STATUS[consulta.status].border}
                  `}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">
                        {consulta.titulo}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {consulta.paciente?.nome} {consulta.paciente?.sobrenome}
                      </p>
                    </div>
                    <span
                      className={`
                        px-2 py-1 text-xs font-medium rounded-full
                        ${CORES_STATUS[consulta.status].text}
                        ${CORES_STATUS[consulta.status].bg}
                      `}
                    >
                      {consulta.status}
                    </span>
                  </div>

                  <div className="flex items-center text-sm text-gray-600 space-x-4">
                    <div className="flex items-center">
                      <CalendarSolid className="w-4 h-4 mr-1" />
                      {new Date(consulta.data_inicio).toLocaleDateString(
                        "pt-BR"
                      )}
                    </div>
                    <div className="flex items-center">
                      <ClockIcon className="w-4 h-4 mr-1" />
                      {new Date(consulta.data_inicio).toLocaleTimeString(
                        "pt-BR",
                        {
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )}
                    </div>
                    <div className="flex items-center">
                      {consulta.tipo === "online" ? (
                        <VideoCameraIcon className="w-4 h-4 mr-1" />
                      ) : (
                        <MapPinIcon className="w-4 h-4 mr-1" />
                      )}
                      {consulta.tipo}
                    </div>
                  </div>

                  {consulta.observacoes && (
                    <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                      {consulta.observacoes}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  // ===== RENDER PRINCIPAL =====
  if (carregando) {
    return (
      <div
        className={`bg-white rounded-xl border border-gray-200 shadow-sm ${className}`}
      >
        <div className={`flex items-center justify-center ${altura}`}>
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando agenda...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`bg-white rounded-xl border border-gray-200 shadow-sm ${className}`}
    >
      {/* 🔧 USAR O NOVO AGENDACONTROLS */}
      <AgendaControls
        dataAtual={dataAtual}
        modoVisualizacao={modoVisualizacao}
        carregando={carregando}
        onNavigateData={onNavigateData}
        onChangeModoVisualizacao={onChangeModoVisualizacao}
      />

      {/* Conteúdo da agenda */}
      <div className={`${altura} overflow-hidden`}>
        {carregandoHorarios ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-6 h-6 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-sm text-gray-600">
                Carregando horários disponíveis...
              </p>
            </div>
          </div>
        ) : (
          <div className="h-full overflow-auto">
            {modoVisualizacao === "mes" && renderMes()}
            {modoVisualizacao === "semana" && renderSemana()}
            {modoVisualizacao === "lista" && renderLista()}
          </div>
        )}
      </div>
    </div>
  );
}
