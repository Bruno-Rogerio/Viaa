// src/components/common/agenda/AgendaCalendar.tsx
// Componente PURO do calendário - sem lógica de negócio

"use client";

import { useState } from "react";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  CalendarIcon as CalendarSolid,
  ClockIcon,
  CogIcon,
} from "@heroicons/react/24/solid";
import {
  CalendarDaysIcon,
  ListBulletIcon,
  Squares2X2Icon,
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

const CORES_STATUS: Record<StatusConsulta, { bg: string; text: string }> = {
  agendada: { bg: "bg-yellow-100", text: "text-yellow-800" },
  confirmada: { bg: "bg-blue-100", text: "text-blue-800" },
  em_andamento: { bg: "bg-purple-100", text: "text-purple-800" },
  concluida: { bg: "bg-green-100", text: "text-green-800" },
  cancelada: { bg: "bg-red-100", text: "text-red-800" },
  rejeitada: { bg: "bg-gray-100", text: "text-gray-800" },
  nao_compareceu: { bg: "bg-orange-100", text: "text-orange-800" },
};

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
  // Estado local apenas para UI
  const [consultaSelecionada, setConsultaSelecionada] =
    useState<Consulta | null>(null);

  // Configurações padrão dos indicadores
  const indicadores: IndicadoresVisuais = {
    horariosConfigurados: false,
    horariosDisponiveis: false,
    consultas: true,
    diasInativos: false,
    ...mostrarIndicadores,
  };

  // Criar mapa de horários disponíveis por dia da semana
  const horariosMap = horariosDisponiveis.reduce((map, horario) => {
    if (!map[horario.dia_semana]) {
      map[horario.dia_semana] = [];
    }
    map[horario.dia_semana].push(horario);
    return map;
  }, {} as Record<number, HorarioDisponivel[]>);

  // Verificar se um dia tem horários configurados
  const temHorarioConfigurado = (data: Date): boolean => {
    const diaSemana = data.getDay();
    const horariosDoDia = horariosMap[diaSemana] || [];
    return horariosDoDia.some((h) => h.ativo);
  };

  // Verificar se um horário específico está disponível
  const verificarHorarioDisponivel = (data: Date, hora: string): boolean => {
    const diaSemana = data.getDay();
    const horariosDoDia = horariosMap[diaSemana] || [];

    const horaNum = parseInt(hora.split(":")[0]);

    return horariosDoDia.some((horario) => {
      if (!horario.ativo) return false;

      const inicioNum = parseInt(horario.hora_inicio.split(":")[0]);
      const fimNum = parseInt(horario.hora_fim.split(":")[0]);

      return horaNum >= inicioNum && horaNum < fimNum;
    });
  };

  // Obter consultas de um dia específico
  const consultasDoDia = (data: Date): Consulta[] => {
    return consultas.filter((consulta) => {
      const dataConsulta = new Date(consulta.data_inicio);
      return (
        dataConsulta.getDate() === data.getDate() &&
        dataConsulta.getMonth() === data.getMonth() &&
        dataConsulta.getFullYear() === data.getFullYear()
      );
    });
  };

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
      default:
        return dataAtual.toLocaleDateString("pt-BR", {
          month: "long",
          year: "numeric",
        });
    }
  };

  // Renderizar visualização mensal
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

    return (
      <div className="bg-white rounded-lg overflow-hidden">
        {/* Cabeçalho dos dias da semana */}
        <div className="grid grid-cols-7 bg-gray-50 border-b">
          {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((dia) => (
            <div
              key={dia}
              className="p-3 text-center text-sm font-semibold text-gray-600"
            >
              {dia}
            </div>
          ))}
        </div>

        {/* Grade de dias */}
        <div className="grid grid-cols-7">
          {dias.map((dia, index) => {
            const ehMesAtual = dia.getMonth() === dataAtual.getMonth();
            const ehHoje =
              dia.getDate() === new Date().getDate() &&
              dia.getMonth() === new Date().getMonth() &&
              dia.getFullYear() === new Date().getFullYear();

            const consultasDia = consultasDoDia(dia);
            const temHorario = temHorarioConfigurado(dia);

            return (
              <div
                key={index}
                className={`min-h-[120px] border-b border-r border-gray-100 p-2 relative group cursor-pointer hover:bg-gray-50 transition-colors ${
                  ehHoje ? "bg-blue-50 border-blue-200" : ""
                } ${!ehMesAtual ? "bg-gray-25 text-gray-400" : ""}`}
                onClick={() => onDiaClick?.(dia)}
              >
                {/* Número do dia */}
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`text-sm font-semibold ${
                      ehHoje
                        ? "text-blue-600"
                        : ehMesAtual
                        ? "text-gray-900"
                        : "text-gray-400"
                    }`}
                  >
                    {dia.getDate()}
                  </span>

                  {/* Indicadores visuais */}
                  <div className="flex items-center space-x-1">
                    {/* Indicador de horário configurado */}
                    {indicadores.horariosConfigurados &&
                      temHorario &&
                      ehMesAtual && (
                        <div
                          className="w-2 h-2 bg-green-500 rounded-full"
                          title="Horário configurado"
                        ></div>
                      )}

                    {/* Indicador de consultas */}
                    {indicadores.consultas && consultasDia.length > 0 && (
                      <div
                        className="w-2 h-2 bg-blue-500 rounded-full"
                        title={`${consultasDia.length} consulta(s)`}
                      ></div>
                    )}

                    {/* Indicador de dia inativo */}
                    {indicadores.diasInativos && !temHorario && ehMesAtual && (
                      <div
                        className="w-2 h-2 bg-gray-300 rounded-full"
                        title="Sem horários configurados"
                      ></div>
                    )}
                  </div>
                </div>

                {/* Lista de consultas */}
                <div className="space-y-1">
                  {consultasDia.slice(0, 2).map((consulta) => {
                    const cores = CORES_STATUS[consulta.status];
                    return (
                      <div
                        key={consulta.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          setConsultaSelecionada(consulta);
                          onConsultaClick?.(consulta);
                        }}
                        className={`text-xs p-1 rounded cursor-pointer hover:shadow-sm transition-shadow ${cores.bg} ${cores.text}`}
                      >
                        <div className="font-medium truncate">
                          {consulta.titulo}
                        </div>
                        <div className="opacity-75">
                          {new Date(consulta.data_inicio).toLocaleTimeString(
                            "pt-BR",
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {consultasDia.length > 2 && (
                    <div className="text-xs text-gray-500 font-medium">
                      +{consultasDia.length - 2} mais
                    </div>
                  )}
                </div>

                {/* Overlay para dias disponíveis */}
                {indicadores.horariosDisponiveis &&
                  temHorario &&
                  consultasDia.length === 0 &&
                  ehMesAtual && (
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-green-50/80">
                      <div className="text-xs text-green-700 font-medium text-center">
                        <ClockIcon className="w-4 h-4 mx-auto mb-1" />
                        Disponível
                      </div>
                    </div>
                  )}

                {/* Overlay para dias sem configuração */}
                {indicadores.diasInativos && !temHorario && ehMesAtual && (
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-gray-50/80">
                    <div className="text-xs text-gray-500 font-medium text-center">
                      <CogIcon className="w-4 h-4 mx-auto mb-1" />
                      Não configurado
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Estado de loading
  if (carregando) {
    return (
      <div
        className={`bg-white rounded-xl border border-gray-200 ${className}`}
      >
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
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
              >
                <ChevronLeftIcon className="w-4 h-4" />
              </button>

              <span className="px-4 py-2 font-semibold text-gray-900 min-w-[200px] text-center">
                {obterTextoData()}
              </span>

              <button
                onClick={() => navegarData("proximo")}
                className="p-2 hover:bg-white rounded-md transition-colors"
              >
                <ChevronRightIcon className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={() => onNavigateData?.(new Date())}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
            >
              Hoje
            </button>
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
            >
              <ListBulletIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Conteúdo da agenda */}
      <div className={`${altura} overflow-auto`}>
        {modoVisualizacao === "mes" && renderCalendarioMensal()}
        {/* TODO: Implementar visualização semanal e lista */}
        {modoVisualizacao !== "mes" && (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">
              Visualização {modoVisualizacao} em desenvolvimento
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
