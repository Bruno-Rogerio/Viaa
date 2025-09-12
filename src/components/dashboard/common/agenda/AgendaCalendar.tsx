// src/components/dashboard/common/agenda/AgendaCalendar.tsx
// Componente PURO do calendário com todas as visualizações

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
  const [consultaSelecionada, setConsultaSelecionada] =
    useState<Consulta | null>(null);
  const [filtroLista, setFiltroLista] = useState<
    "todos" | "hoje" | "semana" | "mes"
  >("todos");
  const [buscaLista, setBuscaLista] = useState("");

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

  // Obter texto da data baseado no modo
  const obterTextoData = () => {
    switch (modoVisualizacao) {
      case "mes":
        return dataAtual.toLocaleDateString("pt-BR", {
          month: "long",
          year: "numeric",
        });
      case "semana":
        const inicioSemana = new Date(dataAtual);
        const diaSemana = inicioSemana.getDay();
        inicioSemana.setDate(inicioSemana.getDate() - diaSemana);

        const fimSemana = new Date(inicioSemana);
        fimSemana.setDate(fimSemana.getDate() + 6);

        if (inicioSemana.getMonth() === fimSemana.getMonth()) {
          return `${inicioSemana.getDate()} - ${fimSemana.getDate()} de ${fimSemana.toLocaleDateString(
            "pt-BR",
            { month: "long", year: "numeric" }
          )}`;
        } else {
          return `${inicioSemana.toLocaleDateString("pt-BR", {
            day: "numeric",
            month: "short",
          })} - ${fimSemana.toLocaleDateString("pt-BR", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}`;
        }
      case "lista":
        return "Lista de Consultas";
      default:
        return dataAtual.toLocaleDateString("pt-BR", {
          month: "long",
          year: "numeric",
        });
    }
  };

  // ===== VISTA SEMANAL =====
  const renderCalendarioSemanal = () => {
    // Calcular dias da semana
    const inicioSemana = new Date(dataAtual);
    const diaSemana = inicioSemana.getDay();
    inicioSemana.setDate(inicioSemana.getDate() - diaSemana);

    const diasSemana = Array.from({ length: 7 }, (_, i) => {
      const dia = new Date(inicioSemana);
      dia.setDate(dia.getDate() + i);
      return dia;
    });

    // Obter horários baseados na disponibilidade
    const horariosUnicos = new Set<string>();
    horariosDisponiveis.forEach((h) => {
      for (
        let hora = parseInt(h.hora_inicio.split(":")[0]);
        hora < parseInt(h.hora_fim.split(":")[0]);
        hora++
      ) {
        horariosUnicos.add(`${hora.toString().padStart(2, "0")}:00`);
      }
    });

    const horarios =
      horariosUnicos.size > 0
        ? Array.from(horariosUnicos).sort()
        : HORARIOS_PADRAO.slice(7, 19); // 8h às 18h por padrão

    // Organizar consultas por slot
    const consultasPorSlot = useMemo(() => {
      const slots: Record<string, Consulta[]> = {};

      consultas.forEach((consulta) => {
        const dataConsulta = new Date(consulta.data_inicio);
        const diaKey = dataConsulta.toDateString();
        const horaKey = dataConsulta.toTimeString().slice(0, 5);
        const slotKey = `${diaKey}-${horaKey}`;

        if (!slots[slotKey]) {
          slots[slotKey] = [];
        }
        slots[slotKey].push(consulta);
      });

      return slots;
    }, [consultas]);

    // Verificar se horário está disponível
    const isHorarioDisponivel = (dia: Date, hora: string) => {
      const diaSemanaNum = dia.getDay();
      return horariosDisponiveis.some(
        (h) =>
          h.dia_semana === diaSemanaNum &&
          h.hora_inicio <= hora &&
          h.hora_fim > hora &&
          h.ativo
      );
    };

    // Renderizar slot individual
    const renderSlot = (dia: Date, hora: string) => {
      const slotKey = `${dia.toDateString()}-${hora}`;
      const consultasSlot = consultasPorSlot[slotKey] || [];
      const disponivel = isHorarioDisponivel(dia, hora);
      const hoje = new Date();
      const isPassado =
        dia.toDateString() === hoje.toDateString()
          ? hora < hoje.toTimeString().slice(0, 5)
          : dia < hoje;

      if (consultasSlot.length > 0) {
        const consulta = consultasSlot[0];
        const cores = CORES_STATUS[consulta.status];

        return (
          <div
            key={slotKey}
            onClick={() => onConsultaClick?.(consulta)}
            className={`
              p-2 rounded-lg border-l-4 cursor-pointer transition-all hover:shadow-md
              ${cores.bg} ${cores.text} ${cores.border}
            `}
          >
            <div className="text-xs font-medium truncate">
              {consulta.paciente_nome || "Paciente"}
            </div>
            <div className="text-xs opacity-75 flex items-center mt-1">
              {consulta.tipo === "online" ? (
                <VideoCameraIcon className="w-3 h-3 mr-1" />
              ) : (
                <MapPinIcon className="w-3 h-3 mr-1" />
              )}
              {consulta.tipo}
            </div>
          </div>
        );
      }

      if (!disponivel) {
        return (
          <div
            key={slotKey}
            className="p-2 bg-gray-50 rounded-lg border border-gray-100 opacity-50"
          >
            <div className="text-xs text-gray-400 text-center">
              Indisponível
            </div>
          </div>
        );
      }

      return (
        <div
          key={slotKey}
          onClick={() => !isPassado && onHorarioClick?.(dia, hora)}
          className={`
            p-2 rounded-lg border-2 border-dashed transition-all
            ${
              isPassado
                ? "border-gray-200 bg-gray-50 cursor-not-allowed opacity-50"
                : "border-green-200 bg-green-50 hover:border-green-300 hover:bg-green-100 cursor-pointer"
            }
          `}
        >
          <div className="text-xs text-center text-green-600">
            {isPassado ? "Passado" : "Disponível"}
          </div>
        </div>
      );
    };

    return (
      <div className="bg-white rounded-lg overflow-hidden">
        {/* Cabeçalho dos dias */}
        <div className="grid grid-cols-8 bg-gray-50 border-b">
          <div className="p-4 text-sm font-medium text-gray-500">Horário</div>
          {diasSemana.map((dia, index) => {
            const isHoje = dia.toDateString() === new Date().toDateString();
            return (
              <div
                key={index}
                className={`p-4 text-center border-l border-gray-200 ${
                  isHoje ? "bg-blue-50 text-blue-900 font-semibold" : ""
                }`}
              >
                <div className="text-sm font-medium">{DIAS_SEMANA[index]}</div>
                <div
                  className={`text-lg ${
                    isHoje ? "text-blue-600" : "text-gray-900"
                  }`}
                >
                  {dia.getDate()}
                </div>
              </div>
            );
          })}
        </div>

        {/* Grade de horários */}
        <div className="max-h-[500px] overflow-y-auto">
          {horarios.map((hora) => (
            <div
              key={hora}
              className="grid grid-cols-8 border-b border-gray-100 hover:bg-gray-25"
            >
              <div className="p-3 text-sm font-medium text-gray-500 bg-gray-50 border-r border-gray-200 flex items-center">
                {hora}
              </div>
              {diasSemana.map((dia, index) => (
                <div
                  key={index}
                  className="p-2 border-l border-gray-100 min-h-[60px]"
                >
                  {renderSlot(dia, hora)}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // ===== VISTA LISTA =====
  const renderListaConsultas = () => {
    // Filtrar consultas
    const consultasFiltradas = useMemo(() => {
      let filtradas = [...consultas];
      const hoje = new Date();

      // Filtro por período
      switch (filtroLista) {
        case "hoje":
          filtradas = filtradas.filter((c) => {
            const dataConsulta = new Date(c.data_inicio);
            return dataConsulta.toDateString() === hoje.toDateString();
          });
          break;
        case "semana":
          const inicioSemana = new Date(hoje);
          inicioSemana.setDate(hoje.getDate() - hoje.getDay());
          const fimSemana = new Date(inicioSemana);
          fimSemana.setDate(inicioSemana.getDate() + 6);

          filtradas = filtradas.filter((c) => {
            const dataConsulta = new Date(c.data_inicio);
            return dataConsulta >= inicioSemana && dataConsulta <= fimSemana;
          });
          break;
        case "mes":
          filtradas = filtradas.filter((c) => {
            const dataConsulta = new Date(c.data_inicio);
            return (
              dataConsulta.getMonth() === hoje.getMonth() &&
              dataConsulta.getFullYear() === hoje.getFullYear()
            );
          });
          break;
      }

      // Filtro por busca
      if (buscaLista.trim()) {
        const termo = buscaLista.toLowerCase();
        filtradas = filtradas.filter(
          (c) =>
            c.paciente_nome?.toLowerCase().includes(termo) ||
            c.observacoes?.toLowerCase().includes(termo)
        );
      }

      // Ordenar por data
      return filtradas.sort(
        (a, b) =>
          new Date(a.data_inicio).getTime() - new Date(b.data_inicio).getTime()
      );
    }, [consultas, filtroLista, buscaLista]);

    // Agrupar consultas por data
    const consultasAgrupadas = useMemo(() => {
      const grupos: Record<string, Consulta[]> = {};

      consultasFiltradas.forEach((consulta) => {
        const data = new Date(consulta.data_inicio).toDateString();
        if (!grupos[data]) {
          grupos[data] = [];
        }
        grupos[data].push(consulta);
      });

      return grupos;
    }, [consultasFiltradas]);

    // Renderizar card de consulta
    const renderCardConsulta = (consulta: Consulta) => {
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
                  {(consulta.paciente_nome || "P").charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {consulta.paciente_nome || "Paciente"}
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
                      title="Confirmar"
                    >
                      <CheckCircleIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        // TODO: Cancelar consulta
                      }}
                      className="p-1 text-red-600 hover:bg-red-100 rounded"
                      title="Cancelar"
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
                    title="Iniciar"
                  >
                    <PlayCircleIcon className="w-4 h-4" />
                  </button>
                )}

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    // TODO: Mais opções
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
    };

    return (
      <div className="space-y-6">
        {/* Filtros e busca */}
        <div className="bg-white rounded-lg border p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Filtros de período */}
            <div className="flex items-center space-x-2">
              <FunnelIcon className="w-5 h-5 text-gray-400" />
              <div className="flex bg-gray-100 rounded-lg p-1">
                {[
                  { key: "todos", label: "Todos" },
                  { key: "hoje", label: "Hoje" },
                  { key: "semana", label: "Esta Semana" },
                  { key: "mes", label: "Este Mês" },
                ].map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => setFiltroLista(key as any)}
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                      filtroLista === key
                        ? "bg-white text-blue-600 shadow-sm"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Busca */}
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por paciente ou observações..."
                value={buscaLista}
                onChange={(e) => setBuscaLista(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Lista de consultas */}
        <div className="space-y-6">
          {Object.keys(consultasAgrupadas).length === 0 ? (
            <div className="text-center py-12">
              <CalendarSolid className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhuma consulta encontrada
              </h3>
              <p className="text-gray-600">
                {buscaLista
                  ? "Tente ajustar os filtros de busca"
                  : "Ainda não há consultas agendadas para este período"}
              </p>
            </div>
          ) : (
            Object.entries(consultasAgrupadas).map(
              ([dataStr, consultasGrupo]) => {
                const data = new Date(dataStr);
                const isHoje =
                  data.toDateString() === new Date().toDateString();

                return (
                  <div key={dataStr} className="space-y-3">
                    <div
                      className={`sticky top-0 z-10 py-2 px-4 rounded-lg ${
                        isHoje
                          ? "bg-blue-50 border border-blue-200"
                          : "bg-gray-50"
                      }`}
                    >
                      <h3
                        className={`font-semibold ${
                          isHoje ? "text-blue-900" : "text-gray-900"
                        }`}
                      >
                        {isHoje
                          ? "Hoje"
                          : data.toLocaleDateString("pt-BR", {
                              weekday: "long",
                              day: "numeric",
                              month: "long",
                            })}
                        <span className="ml-2 text-sm font-normal text-gray-500">
                          ({consultasGrupo.length} consulta
                          {consultasGrupo.length !== 1 ? "s" : ""})
                        </span>
                      </h3>
                    </div>

                    <div className="space-y-3">
                      {consultasGrupo.map(renderCardConsulta)}
                    </div>
                  </div>
                );
              }
            )
          )}
        </div>
      </div>
    );
  };

  // ===== VISTA MENSAL (já existente, vou manter e melhorar) =====
  const renderCalendarioMensal = () => {
    const primeiroDiaMes = new Date(
      dataAtual.getFullYear(),
      dataAtual.getMonth(),
      1
    );
    const ultimoDiaMes = new Date(
      dataAtual.getFullYear(),
      dataAtual.getMonth() + 1,
      0
    );

    const primeiroDiaCalendario = new Date(primeiroDiaMes);
    primeiroDiaCalendario.setDate(
      primeiroDiaCalendario.getDate() - primeiroDiaMes.getDay()
    );

    const dias: Date[] = [];
    for (let i = 0; i < 42; i++) {
      const dia = new Date(primeiroDiaCalendario);
      dia.setDate(dia.getDate() + i);
      dias.push(dia);
    }

    // Agrupar consultas por dia
    const consultasPorDia = useMemo(() => {
      const grupos: Record<string, Consulta[]> = {};
      consultas.forEach((consulta) => {
        const data = new Date(consulta.data_inicio).toDateString();
        if (!grupos[data]) {
          grupos[data] = [];
        }
        grupos[data].push(consulta);
      });
      return grupos;
    }, [consultas]);

    return (
      <div className="bg-white rounded-lg overflow-hidden">
        {/* Cabeçalho dos dias da semana */}
        <div className="grid grid-cols-7 bg-gray-50 border-b">
          {DIAS_SEMANA.map((dia) => (
            <div
              key={dia}
              className="p-4 text-center text-sm font-medium text-gray-500"
            >
              {dia}
            </div>
          ))}
        </div>

        {/* Grid do calendário */}
        <div className="grid grid-cols-7">
          {dias.map((dia, index) => {
            const isHoje = dia.toDateString() === new Date().toDateString();
            const isMesAtual = dia.getMonth() === dataAtual.getMonth();
            const consultasDia = consultasPorDia[dia.toDateString()] || [];

            return (
              <div
                key={index}
                onClick={() => onDiaClick?.(dia)}
                className={`
                  min-h-[120px] p-2 border-b border-r border-gray-100 cursor-pointer
                  hover:bg-gray-50 transition-colors
                  ${!isMesAtual ? "bg-gray-25 text-gray-400" : ""}
                  ${isHoje ? "bg-blue-50 border-blue-200" : ""}
                `}
              >
                <div
                  className={`text-sm font-medium mb-2 ${
                    isHoje ? "text-blue-600" : ""
                  }`}
                >
                  {dia.getDate()}
                </div>

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
              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-sm text-gray-600">Carregando horários...</p>
            </div>
          </div>
        ) : (
          <div className="h-full overflow-auto">
            {modoVisualizacao === "mes" && renderCalendarioMensal()}
            {modoVisualizacao === "semana" && renderCalendarioSemanal()}
            {modoVisualizacao === "lista" && renderListaConsultas()}
          </div>
        )}
      </div>

      {/* Rodapé com estatísticas rápidas */}
      {consultas.length > 0 && (
        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-6">
              <span className="text-gray-600">
                <span className="font-medium text-blue-600">
                  {consultas.filter((c) => c.status === "confirmada").length}
                </span>{" "}
                confirmadas
              </span>
              <span className="text-gray-600">
                <span className="font-medium text-yellow-600">
                  {consultas.filter((c) => c.status === "agendada").length}
                </span>{" "}
                pendentes
              </span>
              <span className="text-gray-600">
                <span className="font-medium text-green-600">
                  {consultas.filter((c) => c.status === "concluida").length}
                </span>{" "}
                concluídas
              </span>
            </div>

            {consultas.some((c) => c.valor) && (
              <div className="text-gray-600">
                Receita estimada:{" "}
                <span className="font-medium text-green-600">
                  R${" "}
                  {consultas
                    .reduce((acc, c) => acc + (c.valor || 0), 0)
                    .toFixed(2)}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
