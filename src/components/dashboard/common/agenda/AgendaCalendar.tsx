// src/components/dashboard/common/agenda/AgendaCalendar.tsx
// Componente PURO do calendário com todas as visualizações - VERSÃO FINAL

"use client";

import { useState, useMemo } from "react";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  CalendarIcon as CalendarSolid,
  ClockIcon,
  CogIcon,
  UserIcon,
  VideoCameraIcon,
  MapPinIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/solid";
import {
  CalendarDaysIcon,
  ListBulletIcon,
  Squares2X2Icon,
  EllipsisVerticalIcon,
  CheckCircleIcon,
  XCircleIcon,
  PlayCircleIcon,
  StopCircleIcon,
} from "@heroicons/react/24/outline";
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

  // HOOK MOVIDO PARA NÍVEL SUPERIOR - Filtrar consultas para modo lista
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

  // Navegação de data
  const navegarData = (direcao: "anterior" | "proximo") => {
    const nova = new Date(dataAtual);

    switch (modoVisualizacao) {
      case "semana":
        nova.setDate(nova.getDate() + (direcao === "proximo" ? 7 : -7));
        break;
      case "dia":
        nova.setDate(nova.getDate() + (direcao === "proximo" ? 1 : -1));
        break;
      default:
        nova.setMonth(nova.getMonth() + (direcao === "proximo" ? 1 : -1));
    }

    onNavigateData?.(nova);
  };

  // Obter texto da data atual
  const obterTextoData = () => {
    const meses = [
      "Janeiro",
      "Fevereiro",
      "Março",
      "Abril",
      "Maio",
      "Junho",
      "Julho",
      "Agosto",
      "Setembro",
      "Outubro",
      "Novembro",
      "Dezembro",
    ];

    switch (modoVisualizacao) {
      case "semana":
        const inicioSemana = new Date(dataAtual);
        inicioSemana.setDate(dataAtual.getDate() - dataAtual.getDay());
        const fimSemana = new Date(inicioSemana);
        fimSemana.setDate(inicioSemana.getDate() + 6);
        return `${inicioSemana.getDate()} - ${fimSemana.getDate()} de ${
          meses[dataAtual.getMonth()]
        } ${dataAtual.getFullYear()}`;
      case "dia":
        return `${dataAtual.getDate()} de ${
          meses[dataAtual.getMonth()]
        } ${dataAtual.getFullYear()}`;
      default:
        return `${meses[dataAtual.getMonth()]} ${dataAtual.getFullYear()}`;
    }
  };

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
      <div className="p-6">
        {/* Cabeçalho dos dias da semana */}
        <div className="grid grid-cols-7 gap-1 mb-4">
          {DIAS_SEMANA.map((dia) => (
            <div
              key={dia}
              className="text-center text-sm font-medium text-gray-600 py-2"
            >
              {dia}
            </div>
          ))}
        </div>

        {/* Grid do calendário */}
        <div className="grid grid-cols-7 gap-1">
          {dias.map((dia, index) => {
            if (!dia) {
              return <div key={index} className="h-24"></div>;
            }

            const data = new Date(
              dataAtual.getFullYear(),
              dataAtual.getMonth(),
              dia
            );
            const consultasDia = consultasNaData(data);
            const temHorario = temHorarioDisponivel(data);
            const ehHoje = data.toDateString() === new Date().toDateString();

            return (
              <div
                key={dia}
                onClick={() => onDiaClick?.(data)}
                className={`
                  h-24 border border-gray-200 rounded-lg p-2 cursor-pointer transition-all hover:shadow-sm
                  ${
                    ehHoje
                      ? "ring-2 ring-blue-500 bg-blue-50"
                      : "bg-white hover:bg-gray-50"
                  }
                  ${temHorario ? "border-green-300" : ""}
                `}
              >
                <div
                  className={`
                    text-sm font-medium mb-1
                    ${ehHoje ? "text-blue-600" : "text-gray-900"}
                  `}
                >
                  {dia}
                </div>

                {/* Indicador de horário disponível */}
                {temHorario && consultasDia.length === 0 && (
                  <div className="w-2 h-2 bg-green-400 rounded-full mb-1"></div>
                )}

                {/* Consultas do dia */}
                <div className="space-y-1">
                  {consultasDia.slice(0, 3).map((consulta) => {
                    const cores = CORES_STATUS[consulta.status];
                    return (
                      <div
                        key={consulta.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          onConsultaClick?.(consulta);
                        }}
                        className={`
                          text-xs p-1 rounded border-l-2 truncate hover:shadow-sm
                          ${cores.bg} ${cores.text} ${cores.border}
                        `}
                      >
                        {new Date(consulta.data_inicio)
                          .toTimeString()
                          .slice(0, 5)}{" "}
                        -{" "}
                        {consulta.paciente?.nome
                          ? `${consulta.paciente.nome} ${
                              consulta.paciente?.sobrenome || ""
                            }`
                          : "Paciente"}
                      </div>
                    );
                  })}

                  {consultasDia.length > 3 && (
                    <div className="text-xs text-gray-500 font-medium">
                      +{consultasDia.length - 3} mais
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

    const diasSemana = Array.from({ length: 7 }, (_, i) => {
      const dia = new Date(inicioSemana);
      dia.setDate(inicioSemana.getDate() + i);
      return dia;
    });

    return (
      <div className="p-6">
        <div className="grid grid-cols-8 gap-1">
          {/* Coluna de horários */}
          <div className="space-y-12">
            <div className="h-16"></div> {/* Espaço para header dos dias */}
            {HORARIOS_PADRAO.map((horario) => (
              <div
                key={horario}
                className="text-xs text-gray-500 text-right pr-2 -mt-2"
              >
                {horario}
              </div>
            ))}
          </div>

          {/* Colunas dos dias */}
          {diasSemana.map((dia, diaIndex) => {
            const consultasDia = consultasNaData(dia);
            const temHorario = temHorarioDisponivel(dia);
            const ehHoje = dia.toDateString() === new Date().toDateString();

            return (
              <div key={diaIndex} className="min-h-full">
                {/* Header do dia */}
                <div
                  className={`
                    h-16 border-b border-gray-200 p-2 text-center cursor-pointer
                    ${ehHoje ? "bg-blue-50 text-blue-600" : "hover:bg-gray-50"}
                  `}
                  onClick={() => onDiaClick?.(dia)}
                >
                  <div className="text-xs text-gray-600">
                    {DIAS_SEMANA[dia.getDay()]}
                  </div>
                  <div
                    className={`text-lg font-semibold ${
                      ehHoje ? "text-blue-600" : "text-gray-900"
                    }`}
                  >
                    {dia.getDate()}
                  </div>
                </div>

                {/* Grid de horários */}
                <div className="space-y-12">
                  {HORARIOS_PADRAO.map((horario) => {
                    const consultaNoHorario = consultasDia.find((consulta) => {
                      const horaConsulta = new Date(consulta.data_inicio)
                        .toTimeString()
                        .slice(0, 5);
                      return horaConsulta === horario;
                    });

                    return (
                      <div
                        key={horario}
                        className={`
                          h-12 border border-gray-100 rounded cursor-pointer transition-colors
                          ${
                            consultaNoHorario
                              ? ""
                              : temHorario
                              ? "hover:bg-green-50 border-green-200"
                              : "bg-gray-50"
                          }
                        `}
                        onClick={() => {
                          if (consultaNoHorario) {
                            onConsultaClick?.(consultaNoHorario);
                          } else if (temHorario) {
                            onHorarioClick?.(dia, horario);
                          }
                        }}
                      >
                        {consultaNoHorario ? (
                          <div
                            className={`
                              h-full p-1 rounded text-xs
                              ${CORES_STATUS[consultaNoHorario.status].bg}
                              ${CORES_STATUS[consultaNoHorario.status].text}
                            `}
                          >
                            <div className="font-medium truncate">
                              {consultaNoHorario.paciente?.nome || "Paciente"}
                            </div>
                            <div className="text-xs opacity-75">
                              {consultaNoHorario.tipo}
                            </div>
                          </div>
                        ) : (
                          temHorario && (
                            <div className="h-full flex items-center justify-center text-green-600">
                              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                            </div>
                          )
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // ===== VISUALIZAÇÃO EM LISTA =====
  const renderLista = () => {
    return (
      <div className="p-6 space-y-6">
        {/* Controles de filtro */}
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Filtros por período */}
          <div className="flex space-x-2">
            {(["todos", "hoje", "semana", "mes"] as const).map((filtro) => (
              <button
                key={filtro}
                onClick={() => setFiltroLista(filtro)}
                className={`
                  px-3 py-2 text-sm font-medium rounded-lg transition-colors
                  ${
                    filtroLista === filtro
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-600 hover:bg-gray-100"
                  }
                `}
              >
                {filtro.charAt(0).toUpperCase() + filtro.slice(1)}
              </button>
            ))}
          </div>

          {/* Busca */}
          <div className="relative flex-1 max-w-sm">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar consultas..."
              value={buscaLista}
              onChange={(e) => setBuscaLista(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Lista de consultas */}
        <div className="space-y-4">
          {consultasFiltradas.length === 0 ? (
            <div className="text-center py-8">
              <CalendarSolid className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhuma consulta encontrada
              </h3>
              <p className="text-gray-600">
                {buscaLista.trim()
                  ? "Tente ajustar sua busca"
                  : "Nenhuma consulta para o período selecionado"}
              </p>
            </div>
          ) : (
            consultasFiltradas.map((consulta: Consulta) => {
              const cores = CORES_STATUS[consulta.status];
              const dataInicio = new Date(consulta.data_inicio);
              const dataFim = new Date(consulta.data_fim);

              return (
                <div
                  key={consulta.id}
                  onClick={() => onConsultaClick?.(consulta)}
                  className={`
                    p-4 rounded-xl border transition-all hover:shadow-lg cursor-pointer
                    ${cores.bg} ${cores.border} hover:scale-[1.02]
                  `}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                          {(consulta.paciente?.nome || "P")
                            .charAt(0)
                            .toUpperCase()}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {consulta.paciente?.nome || "Paciente"}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {dataInicio.toTimeString().slice(0, 5)} -{" "}
                            {dataFim.toTimeString().slice(0, 5)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <div className="flex items-center">
                          {consulta.tipo === "online" ? (
                            <VideoCameraIcon className="w-4 h-4 mr-1" />
                          ) : (
                            <MapPinIcon className="w-4 h-4 mr-1" />
                          )}
                          {consulta.tipo === "online" ? "Online" : "Presencial"}
                        </div>

                        {consulta.valor && (
                          <div className="flex items-center">
                            <span className="font-medium">
                              R$ {consulta.valor.toFixed(2)}
                            </span>
                          </div>
                        )}
                      </div>

                      {consulta.observacoes && (
                        <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                          {consulta.observacoes}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col items-end space-y-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${cores.bg} ${cores.text}`}
                      >
                        {consulta.status.replace("_", " ")}
                      </span>

                      <div className="flex space-x-1">
                        {consulta.status === "agendada" && (
                          <>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                // TODO: Confirmar consulta
                              }}
                              className="p-1 text-green-600 hover:bg-green-100 rounded"
                              title="Confirmar consulta"
                            >
                              <CheckCircleIcon className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                // TODO: Rejeitar consulta
                              }}
                              className="p-1 text-red-600 hover:bg-red-100 rounded"
                              title="Rejeitar consulta"
                            >
                              <XCircleIcon className="w-4 h-4" />
                            </button>
                          </>
                        )}

                        {consulta.status === "confirmada" && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              // TODO: Iniciar consulta
                            }}
                            className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                            title="Iniciar consulta"
                          >
                            <PlayCircleIcon className="w-4 h-4" />
                          </button>
                        )}

                        {consulta.status === "em_andamento" && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              // TODO: Finalizar consulta
                            }}
                            className="p-1 text-purple-600 hover:bg-purple-100 rounded"
                            title="Finalizar consulta"
                          >
                            <StopCircleIcon className="w-4 h-4" />
                          </button>
                        )}

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            // TODO: Menu de opções
                          }}
                          className="p-1 text-gray-600 hover:bg-gray-100 rounded"
                        >
                          <EllipsisVerticalIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
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
      {/* Header da agenda */}
      <div className="border-b border-gray-200 p-6">
        <div className="flex items-center justify-between">
          {/* Navegação de data */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center bg-gray-50 rounded-lg p-1">
              <button
                onClick={() => navegarData("anterior")}
                className="p-2 hover:bg-white rounded-md transition-colors"
                disabled={carregando}
              >
                <ChevronLeftIcon className="w-4 h-4" />
              </button>

              <span className="px-4 py-2 font-semibold text-gray-900 min-w-[200px] text-center">
                {obterTextoData()}
              </span>

              <button
                onClick={() => navegarData("proximo")}
                className="p-2 hover:bg-white rounded-md transition-colors"
                disabled={carregando}
              >
                <ChevronRightIcon className="w-4 h-4" />
              </button>
            </div>

            {modoVisualizacao !== "lista" && (
              <button
                onClick={() => onNavigateData?.(new Date())}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                disabled={carregando}
              >
                Hoje
              </button>
            )}
          </div>

          {/* Modos de visualização */}
          <div className="flex items-center bg-gray-50 rounded-lg p-1">
            <button
              onClick={() => onChangeModoVisualizacao?.("mes")}
              className={`p-2 rounded-md transition-colors ${
                modoVisualizacao === "mes"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
              title="Visualização Mensal"
              disabled={carregando}
            >
              <Squares2X2Icon className="w-5 h-5" />
            </button>
            <button
              onClick={() => onChangeModoVisualizacao?.("semana")}
              className={`p-2 rounded-md transition-colors ${
                modoVisualizacao === "semana"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
              title="Visualização Semanal"
              disabled={carregando}
            >
              <CalendarDaysIcon className="w-5 h-5" />
            </button>
            <button
              onClick={() => onChangeModoVisualizacao?.("lista")}
              className={`p-2 rounded-md transition-colors ${
                modoVisualizacao === "lista"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
              title="Visualização em Lista"
              disabled={carregando}
            >
              <ListBulletIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Indicadores (apenas para mês e semana) */}
        {(modoVisualizacao === "mes" || modoVisualizacao === "semana") && (
          <div className="flex items-center space-x-6 mt-4 text-sm">
            {mostrarIndicadores.consultas && (
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-200 rounded border border-blue-300"></div>
                <span className="text-gray-600">Consultas agendadas</span>
              </div>
            )}
            {mostrarIndicadores.horariosDisponiveis && (
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-200 rounded border-2 border-dashed border-green-300"></div>
                <span className="text-gray-600">Horários disponíveis</span>
              </div>
            )}
            {mostrarIndicadores.diasInativos && (
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-gray-200 rounded border border-gray-300"></div>
                <span className="text-gray-600">Indisponível</span>
              </div>
            )}
            <div className="flex items-center space-x-2">
              <ClockIcon className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600">
                {consultas.length} consulta{consultas.length !== 1 ? "s" : ""}{" "}
                no período
              </span>
            </div>
          </div>
        )}
      </div>

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
