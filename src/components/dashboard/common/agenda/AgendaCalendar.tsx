// src/components/dashboard/common/agenda/AgendaCalendar.tsx
// 🔥 VERSÃO PREMIUM - Agenda linda e funcional

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

// 🎨 CORES E ESTILOS PREMIUM
const CORES_STATUS: Record<
  StatusConsulta,
  { bg: string; text: string; border: string; dot: string; icon: any }
> = {
  agendada: {
    bg: "bg-amber-50",
    text: "text-amber-800",
    border: "border-l-amber-400",
    dot: "bg-amber-400",
    icon: ClockIcon,
  },
  confirmada: {
    bg: "bg-blue-50",
    text: "text-blue-800",
    border: "border-l-blue-400",
    dot: "bg-blue-400",
    icon: CheckCircleIcon,
  },
  em_andamento: {
    bg: "bg-purple-50",
    text: "text-purple-800",
    border: "border-l-purple-400",
    dot: "bg-purple-400",
    icon: PlayCircleIcon,
  },
  concluida: {
    bg: "bg-emerald-50",
    text: "text-emerald-800",
    border: "border-l-emerald-400",
    dot: "bg-emerald-400",
    icon: CheckCircleIcon,
  },
  cancelada: {
    bg: "bg-red-50",
    text: "text-red-800",
    border: "border-l-red-400",
    dot: "bg-red-400",
    icon: XCircleIcon,
  },
  rejeitada: {
    bg: "bg-gray-50",
    text: "text-gray-800",
    border: "border-l-gray-400",
    dot: "bg-gray-400",
    icon: XCircleIcon,
  },
  nao_compareceu: {
    bg: "bg-orange-50",
    text: "text-orange-800",
    border: "border-l-orange-400",
    dot: "bg-orange-400",
    icon: XCircleIcon,
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
const DIAS_SEMANA_COMPLETO = [
  "Domingo",
  "Segunda",
  "Terça",
  "Quarta",
  "Quinta",
  "Sexta",
  "Sábado",
];

export default function AgendaCalendar({
  consultas = [],
  horariosDisponiveis = [],
  dataAtual,
  modoVisualizacao,
  mostrarIndicadores = {},
  altura = "min-h-[500px]",
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
  const [diaHover, setDiaHover] = useState<Date | null>(null);

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

  // 🔥 FUNÇÕES UTILITÁRIAS PREMIUM
  const temHorarioDisponivel = (data: Date) => {
    const diaSemana = data.getDay();
    return horariosDisponiveis.some(
      (horario) => horario.dia_semana === diaSemana && horario.ativo
    );
  };

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

  const isDataPessada = (data: Date) => {
    return consultasNaData(data).length >= 3;
  };

  const getStatusDia = (data: Date) => {
    const consultasDia = consultasNaData(data);
    const temHorario = temHorarioDisponivel(data);

    if (consultasDia.length > 0) return "ocupado";
    if (temHorario) return "disponivel";
    return "indisponivel";
  };

  // 🔥 VISUALIZAÇÃO MENSAL PREMIUM
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
      <div className="p-3 sm:p-4 lg:p-6">
        {/* 🎨 CABEÇALHO DOS DIAS ELEGANTE */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-3 sm:mb-4">
          {DIAS_SEMANA.map((dia, index) => (
            <div
              key={dia}
              className={`
                text-center py-2 sm:py-3 font-semibold text-mobile-xs sm:text-mobile-sm
                ${
                  index === 0 || index === 6 ? "text-blue-600" : "text-gray-700"
                }
              `}
            >
              {dia}
            </div>
          ))}
        </div>

        {/* 🔥 GRID DO CALENDÁRIO RESPONSIVO */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {dias.map((dia, index) => {
            if (!dia) {
              return <div key={index} className="aspect-square"></div>;
            }

            const data = new Date(
              dataAtual.getFullYear(),
              dataAtual.getMonth(),
              dia
            );
            const consultasDia = consultasNaData(data);
            const statusDia = getStatusDia(data);
            const ehHoje = data.toDateString() === new Date().toDateString();
            const ehPassado = data < new Date(new Date().setHours(0, 0, 0, 0));
            const isHover = diaHover?.getTime() === data.getTime();

            return (
              <div
                key={dia}
                onClick={() => onDiaClick?.(data)}
                onMouseEnter={() => setDiaHover(data)}
                onMouseLeave={() => setDiaHover(null)}
                className={`
                  aspect-square border rounded-lg cursor-pointer transition-all duration-200 
                  flex flex-col p-1 sm:p-2 relative group
                  ${
                    ehHoje
                      ? "ring-2 ring-blue-500 bg-blue-50 border-blue-300 shadow-lg"
                      : ""
                  }
                  ${
                    statusDia === "disponivel"
                      ? "border-emerald-300 bg-emerald-50/50 hover:bg-emerald-100"
                      : ""
                  }
                  ${
                    statusDia === "ocupado"
                      ? "border-blue-300 bg-blue-50/50 hover:bg-blue-100"
                      : ""
                  }
                  ${
                    statusDia === "indisponivel"
                      ? "border-gray-200 bg-gray-50/50 hover:bg-gray-100"
                      : ""
                  }
                  ${ehPassado ? "opacity-60" : ""}
                  ${isHover ? "scale-105 shadow-md z-10" : ""}
                  hover:shadow-md
                `}
              >
                {/* 📅 NÚMERO DO DIA */}
                <div
                  className={`
                  text-mobile-xs sm:text-mobile-sm font-semibold mb-0.5 sm:mb-1
                  ${ehHoje ? "text-blue-700" : "text-gray-900"}
                `}
                >
                  {dia}
                </div>

                {/* 🟢 INDICADORES VISUAIS PREMIUM */}
                <div className="flex items-center justify-between mb-1">
                  {statusDia === "disponivel" && consultasDia.length === 0 && (
                    <div className="flex items-center space-x-0.5">
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-emerald-400 rounded-full"></div>
                      <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-emerald-300 rounded-full"></div>
                    </div>
                  )}

                  {consultasDia.length > 3 && (
                    <div className="text-mobile-xs text-gray-500 bg-white/80 rounded px-1">
                      +{consultasDia.length - 3}
                    </div>
                  )}
                </div>

                {/* 📋 CONSULTAS DO DIA - LAYOUT OTIMIZADO */}
                <div className="space-y-0.5 flex-1 min-h-0">
                  {consultasDia.slice(0, 3).map((consulta, i) => {
                    const cores = CORES_STATUS[consulta.status];
                    const Icon = cores.icon;

                    return (
                      <div
                        key={consulta.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          onConsultaClick?.(consulta);
                        }}
                        className={`
                          ${cores.bg} ${cores.text} ${cores.border}
                          border-l-2 rounded-r text-mobile-xs p-0.5 sm:p-1
                          hover:shadow-sm transition-all cursor-pointer
                          flex items-center space-x-1 group/consulta
                        `}
                      >
                        <Icon className="w-2 h-2 sm:w-3 sm:h-3 flex-shrink-0" />
                        <div className="truncate flex-1 min-w-0">
                          <div className="font-medium">
                            {new Date(consulta.data_inicio)
                              .toTimeString()
                              .slice(0, 5)}
                          </div>
                          <div className="hidden sm:block truncate opacity-75">
                            {consulta.paciente?.nome || consulta.titulo}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* 💡 TOOLTIP NO HOVER */}
                {isHover && (
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 z-20">
                    <div className="bg-gray-900 text-white text-mobile-xs px-2 py-1 rounded shadow-lg whitespace-nowrap">
                      {consultasDia.length > 0
                        ? `${consultasDia.length} consulta${
                            consultasDia.length > 1 ? "s" : ""
                          }`
                        : statusDia === "disponivel"
                        ? "Horário disponível"
                        : "Sem horários"}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* 🎯 LEGENDA DOS INDICADORES */}
        <div className="mt-4 sm:mt-6 flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-mobile-xs bg-gray-50 rounded-lg p-2 sm:p-3">
          <div className="flex items-center space-x-1.5">
            <div className="w-3 h-3 bg-emerald-400 rounded-full"></div>
            <span className="text-gray-700">Disponível</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
            <span className="text-gray-700">Com consultas</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
            <span className="text-gray-700">Indisponível</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <div className="w-3 h-3 ring-2 ring-blue-500 bg-blue-50 rounded-full"></div>
            <span className="text-gray-700">Hoje</span>
          </div>
        </div>
      </div>
    );
  };

  // 🔥 VISUALIZAÇÃO SEMANAL PREMIUM
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
      <div className="flex flex-col h-full">
        {/* 🎨 HEADER DOS DIAS ELEGANTE */}
        <div className="grid grid-cols-8 gap-2 p-4 bg-gray-50 border-b">
          <div className="text-mobile-xs text-gray-500 font-medium">
            Horário
          </div>
          {diasSemana.map((data, index) => {
            const ehHoje = data.toDateString() === new Date().toDateString();
            const statusDia = getStatusDia(data);
            const consultasDia = consultasNaData(data);

            return (
              <div
                key={index}
                className={`
                  text-center p-2 rounded-lg transition-colors
                  ${
                    ehHoje
                      ? "bg-blue-100 text-blue-800 ring-2 ring-blue-300"
                      : statusDia === "disponivel"
                      ? "bg-emerald-50 text-emerald-700"
                      : "text-gray-700"
                  }
                `}
              >
                <div className="text-mobile-xs font-medium">
                  {DIAS_SEMANA[data.getDay()]}
                </div>
                <div className="text-mobile-sm font-bold">{data.getDate()}</div>
                <div className="text-mobile-xs opacity-75">
                  {consultasDia.length} consultas
                </div>
              </div>
            );
          })}
        </div>

        {/* 🕐 GRID DE HORÁRIOS PREMIUM */}
        <div className="flex-1 overflow-auto">
          <div className="grid grid-cols-8 gap-2 p-2">
            {/* Coluna de horários */}
            <div className="space-y-2">
              {HORARIOS_PADRAO.map((horario) => (
                <div
                  key={horario}
                  className="h-16 flex items-center justify-end pr-2 text-mobile-xs text-gray-500 font-medium"
                >
                  {horario}
                </div>
              ))}
            </div>

            {/* Colunas dos dias */}
            {diasSemana.map((data, diaIndex) => (
              <div key={diaIndex} className="space-y-2">
                {HORARIOS_PADRAO.map((horario) => {
                  const consultasHorario = consultas.filter((consulta) => {
                    const dataConsulta = new Date(consulta.data_inicio);
                    const horarioConsulta = dataConsulta
                      .toTimeString()
                      .slice(0, 5);
                    return (
                      dataConsulta.toDateString() === data.toDateString() &&
                      horarioConsulta === horario
                    );
                  });

                  const temHorario = temHorarioDisponivel(data);
                  const ehPassado =
                    new Date(`${data.toDateString()} ${horario}`) < new Date();

                  return (
                    <div
                      key={horario}
                      onClick={() => onHorarioClick?.(data, horario)}
                      className={`
                        h-16 border rounded-lg cursor-pointer transition-all duration-200 p-2
                        ${ehPassado ? "opacity-50" : ""}
                        ${
                          consultasHorario.length > 0
                            ? "border-blue-300 bg-blue-50"
                            : temHorario
                            ? "border-emerald-300 bg-emerald-50 hover:bg-emerald-100"
                            : "border-gray-200 bg-gray-50 hover:bg-gray-100"
                        }
                        hover:shadow-md group
                      `}
                    >
                      {consultasHorario.map((consulta) => {
                        const cores = CORES_STATUS[consulta.status];
                        const Icon = cores.icon;

                        return (
                          <div
                            key={consulta.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              onConsultaClick?.(consulta);
                            }}
                            className={`
                              ${cores.bg} ${cores.text} ${cores.border}
                              border-l-2 rounded-r p-1 h-full flex items-center space-x-2
                              hover:shadow-sm cursor-pointer group/consulta
                            `}
                          >
                            <Icon className="w-4 h-4 flex-shrink-0" />
                            <div className="min-w-0 flex-1">
                              <div className="text-mobile-xs font-medium truncate">
                                {consulta.paciente?.nome || "Cliente"}
                              </div>
                              <div className="text-mobile-xs opacity-75 truncate">
                                {consulta.titulo}
                              </div>
                            </div>
                          </div>
                        );
                      })}

                      {/* Placeholder para horários vazios disponíveis */}
                      {consultasHorario.length === 0 && temHorario && (
                        <div className="h-full flex items-center justify-center text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="text-mobile-xs text-center">
                            <div className="w-6 h-6 mx-auto mb-1 border-2 border-dashed border-emerald-400 rounded"></div>
                            Disponível
                          </div>
                        </div>
                      )}
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

  // 📋 VISUALIZAÇÃO LISTA PREMIUM (mantém a mesma)
  const renderLista = () => {
    return (
      <div className="h-full flex flex-col">
        {/* Filtros para lista */}
        <div className="p-4 border-b border-gray-200 space-y-4">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFiltroLista("todos")}
              className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                filtroLista === "todos"
                  ? "bg-blue-100 text-blue-800"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setFiltroLista("hoje")}
              className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                filtroLista === "hoje"
                  ? "bg-blue-100 text-blue-800"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Hoje
            </button>
            <button
              onClick={() => setFiltroLista("semana")}
              className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                filtroLista === "semana"
                  ? "bg-blue-100 text-blue-800"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Esta Semana
            </button>
            <button
              onClick={() => setFiltroLista("mes")}
              className={`px-3 py-1 text-sm rounded-lg transition-colors ${
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
              <CalendarSolid className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-mobile-base">Nenhuma consulta encontrada</p>
            </div>
          ) : (
            <div className="space-y-3">
              {consultasFiltradas.map((consulta) => {
                const cores = CORES_STATUS[consulta.status];
                const Icon = cores.icon;

                return (
                  <div
                    key={consulta.id}
                    onClick={() => onConsultaClick?.(consulta)}
                    className={`
                      ${cores.bg} ${cores.border}
                      border-l-4 rounded-lg p-4 cursor-pointer hover:shadow-md transition-all group
                    `}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center space-x-3 flex-1">
                        <Icon className={`w-5 h-5 ${cores.text}`} />
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 text-mobile-base">
                            {consulta.titulo}
                          </h3>
                          <p className="text-mobile-sm text-gray-600">
                            {consulta.paciente?.nome}{" "}
                            {consulta.paciente?.sobrenome}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`
                          px-2 py-1 text-mobile-xs font-medium rounded-full
                          ${cores.text} ${cores.bg} border
                        `}
                      >
                        {consulta.status}
                      </span>
                    </div>

                    <div className="flex items-center text-mobile-sm text-gray-600 space-x-4">
                      <div className="flex items-center">
                        <CalendarSolid className="w-4 h-4 mr-1" />
                        {new Date(consulta.data_inicio).toLocaleDateString(
                          "pt-BR"
                        )}
                      </div>
                      <div className="flex items-center">
                        <ClockIcon className="w-4 h-4 mr-1" />
                        {new Date(consulta.data_inicio)
                          .toTimeString()
                          .slice(0, 5)}
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
                      <p className="mt-2 text-mobile-sm text-gray-600 line-clamp-2">
                        {consulta.observacoes}
                      </p>
                    )}
                  </div>
                );
              })}
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
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 text-mobile-base">
              Carregando sua agenda...
            </p>
            <p className="text-gray-500 text-mobile-sm mt-1">
              Preparando o melhor para você
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden ${className}`}
    >
      {/* 🔥 HEADER PREMIUM COM CONTROLES */}
      <div className="border-b border-gray-200">
        <AgendaControls
          dataAtual={dataAtual}
          modoVisualizacao={modoVisualizacao}
          carregando={carregando}
          onNavigateData={onNavigateData}
          onChangeModoVisualizacao={onChangeModoVisualizacao}
        />
      </div>

      {/* 📊 ESTATÍSTICAS RÁPIDAS (somente se tiver consultas) */}
      {consultas.length > 0 && modoVisualizacao !== "lista" && (
        <div className="px-4 py-3 bg-gradient-to-r from-blue-50 to-emerald-50 border-b border-gray-100">
          <div className="flex items-center justify-center space-x-6 text-mobile-sm">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
              <span className="text-gray-700">
                {consultas.length} consulta{consultas.length !== 1 ? "s" : ""}{" "}
                total
              </span>
            </div>

            {modoVisualizacao === "mes" && (
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-emerald-400 rounded-full"></div>
                <span className="text-gray-700">
                  {horariosDisponiveis.length} dias disponíveis
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 🎨 CONTEÚDO PRINCIPAL */}
      <div className={`${altura} overflow-hidden`}>
        {carregandoHorarios ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center p-8">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin mx-auto mb-4"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <CalendarSolid className="w-6 h-6 text-emerald-500" />
                </div>
              </div>
              <p className="text-gray-600 text-mobile-base font-medium">
                Carregando horários disponíveis...
              </p>
              <p className="text-gray-500 text-mobile-sm mt-1">
                Organizando sua agenda
              </p>
            </div>
          </div>
        ) : (
          <div className="h-full">
            {modoVisualizacao === "mes" && renderMes()}
            {modoVisualizacao === "semana" && renderSemana()}
            {modoVisualizacao === "lista" && renderLista()}
          </div>
        )}
      </div>

      {/* 🎯 FOOTER COM DICAS (apenas em desktop e com espaço) */}
      {!carregando && !carregandoHorarios && modoVisualizacao !== "lista" && (
        <div className="hidden md:block border-t border-gray-100 px-4 py-2">
          <div className="flex items-center justify-center space-x-6 text-mobile-xs text-gray-500">
            <div className="flex items-center space-x-1">
              <span>💡</span>
              <span>Clique nos dias para ver detalhes</span>
            </div>
            <div className="flex items-center space-x-1">
              <span>🎯</span>
              <span>Clique nas consultas para gerenciar</span>
            </div>
            {modoVisualizacao === "semana" && (
              <div className="flex items-center space-x-1">
                <span>⚡</span>
                <span>Clique em horários livres para agendar</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
