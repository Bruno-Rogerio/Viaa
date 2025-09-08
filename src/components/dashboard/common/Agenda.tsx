// viaa/src/components/dashboard/common/Agenda.tsx

"use client";
import { useState } from "react";
import {
  CalendarDaysIcon,
  ClockIcon,
  UserIcon,
  VideoCameraIcon,
  PhoneIcon,
  MapPinIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusIcon,
  FunnelIcon,
  Squares2X2Icon,
  ListBulletIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import {
  CalendarDaysIcon as CalendarSolid,
  ClockIcon as ClockSolid,
} from "@heroicons/react/24/solid";
import { useAgenda } from "@/hooks/dashboard/useAgenda";
import { LoadingSpinner, Avatar } from "./";
import type {
  AgendaProps,
  Consulta,
  ModoVisualizacao,
  StatusConsulta,
} from "@/types/agenda";

const Agenda: React.FC<AgendaProps> = ({
  tipoUsuario,
  usuarioId,
  modoVisualizacao: modoInicial = "mes",
  altura = "h-[800px]",
  onConsultaClick,
  onNovaConsulta,
  onEditarConsulta,
  onCancelarConsulta,
  onConfirmarConsulta,
  podeAgendar = true,
  podeCancelar = true,
  podeEditar = true,
  podeVerDetalhes = true,
  className = "",
  temaDark = false,
}) => {
  const {
    consultas,
    estatisticas,
    loading,
    error,
    dataAtual,
    modoVisualizacao,
    setModoVisualizacao,
    proximaSemana,
    semanaAnterior,
    proximoMes,
    mesAnterior,
    hoje,
    consultasNaData,
    proximaConsulta,
    setFiltros,
    filtros,
  } = useAgenda({
    tipoUsuario,
    usuarioId,
    modoInicial,
  });

  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [consultaSelecionada, setConsultaSelecionada] =
    useState<Consulta | null>(null);

  // Cores para status
  const coresStatus: Record<
    StatusConsulta,
    { bg: string; text: string; border: string }
  > = {
    agendada: {
      bg: "bg-blue-50",
      text: "text-blue-700",
      border: "border-blue-200",
    },
    confirmada: {
      bg: "bg-emerald-50",
      text: "text-emerald-700",
      border: "border-emerald-200",
    },
    em_andamento: {
      bg: "bg-amber-50",
      text: "text-amber-700",
      border: "border-amber-200",
    },
    concluida: {
      bg: "bg-gray-50",
      text: "text-gray-700",
      border: "border-gray-200",
    },
    cancelada: {
      bg: "bg-red-50",
      text: "text-red-700",
      border: "border-red-200",
    },
    nao_compareceu: {
      bg: "bg-orange-50",
      text: "text-orange-700",
      border: "border-orange-200",
    },
  };

  // Ícones para tipos de consulta
  const iconesTopo = {
    online: VideoCameraIcon,
    presencial: MapPinIcon,
    telefone: PhoneIcon,
  };

  // Renderizar cabeçalho com navegação
  const renderCabecalho = () => (
    <div className="bg-white border-b border-gray-200 p-6">
      {/* Linha superior - Título e ações */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-3 rounded-xl">
            <CalendarSolid className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {tipoUsuario === "profissional"
                ? "Minha Agenda"
                : "Minhas Consultas"}
            </h1>
            <p className="text-gray-600 text-sm">
              {estatisticas &&
                `${estatisticas.consultas_hoje} consultas hoje • ${estatisticas.consultas_semana} esta semana`}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* Botão Nova Consulta */}
          {podeAgendar && (
            <button
              onClick={() => onNovaConsulta?.()}
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl"
            >
              <PlusIcon className="w-5 h-5" />
              <span>Nova Consulta</span>
            </button>
          )}

          {/* Botão Filtros */}
          <button
            onClick={() => setMostrarFiltros(!mostrarFiltros)}
            className={`p-2 rounded-lg border transition-colors ${
              mostrarFiltros
                ? "bg-blue-50 border-blue-200 text-blue-700"
                : "border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            <FunnelIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Navegação de data e modos de visualização */}
      <div className="flex items-center justify-between">
        {/* Navegação de data */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center bg-gray-50 rounded-lg p-1">
            <button
              onClick={
                modoVisualizacao === "mes" ? mesAnterior : semanaAnterior
              }
              className="p-2 hover:bg-white rounded-md transition-colors"
            >
              <ChevronLeftIcon className="w-4 h-4 text-gray-600" />
            </button>

            <div className="px-4 py-2 min-w-[200px] text-center">
              <h2 className="font-semibold text-gray-900">
                {modoVisualizacao === "mes"
                  ? dataAtual.toLocaleDateString("pt-BR", {
                      month: "long",
                      year: "numeric",
                    })
                  : dataAtual.toLocaleDateString("pt-BR", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
              </h2>
            </div>

            <button
              onClick={modoVisualizacao === "mes" ? proximoMes : proximaSemana}
              className="p-2 hover:bg-white rounded-md transition-colors"
            >
              <ChevronRightIcon className="w-4 h-4 text-gray-600" />
            </button>
          </div>

          <button
            onClick={hoje}
            className="px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
          >
            Hoje
          </button>
        </div>

        {/* Modos de visualização */}
        <div className="flex items-center bg-gray-100 rounded-lg p-1">
          {[
            {
              modo: "mes" as ModoVisualizacao,
              icone: Squares2X2Icon,
              label: "Mês",
            },
            {
              modo: "semana" as ModoVisualizacao,
              icone: CalendarDaysIcon,
              label: "Semana",
            },
            {
              modo: "lista" as ModoVisualizacao,
              icone: ListBulletIcon,
              label: "Lista",
            },
          ].map(({ modo, icone: Icone, label }) => (
            <button
              key={modo}
              onClick={() => setModoVisualizacao(modo)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                modoVisualizacao === modo
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <Icone className="w-4 h-4" />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  // Renderizar filtros
  const renderFiltros = () => {
    if (!mostrarFiltros) return null;

    return (
      <div className="bg-gray-50 border-b border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Busca */}
          <div className="relative">
            <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar consultas..."
              value={filtros.busca || ""}
              onChange={(e) => setFiltros({ busca: e.target.value })}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Status */}
          <select
            value={filtros.status?.[0] || ""}
            onChange={(e) =>
              setFiltros({
                status: e.target.value
                  ? [e.target.value as StatusConsulta]
                  : undefined,
              })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Todos os status</option>
            <option value="agendada">Agendada</option>
            <option value="confirmada">Confirmada</option>
            <option value="em_andamento">Em andamento</option>
            <option value="concluida">Concluída</option>
            <option value="cancelada">Cancelada</option>
          </select>

          {/* Tipo */}
          <select
            value={filtros.tipo?.[0] || ""}
            onChange={(e) =>
              setFiltros({
                tipo: e.target.value ? [e.target.value as any] : undefined,
              })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Todos os tipos</option>
            <option value="presencial">Presencial</option>
            <option value="online">Online</option>
            <option value="telefone">Telefone</option>
          </select>

          {/* Limpar filtros */}
          <button
            onClick={() => setFiltros({})}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Limpar Filtros
          </button>
        </div>
      </div>
    );
  };

  // Renderizar card de consulta
  const renderCardConsulta = (consulta: Consulta, className?: string) => {
    const StatusIcon = iconesTopo[consulta.tipo];
    const cores = coresStatus[consulta.status];
    const dataInicio = new Date(consulta.data_inicio);
    const dataFim = new Date(consulta.data_fim);

    const participante =
      tipoUsuario === "profissional"
        ? consulta.paciente
        : consulta.profissional;

    return (
      <div
        key={consulta.id}
        onClick={() => {
          setConsultaSelecionada(consulta);
          onConsultaClick?.(consulta);
        }}
        className={`group bg-white border rounded-xl p-4 cursor-pointer hover:shadow-lg transition-all duration-200 ${
          cores.border
        } ${className || ""}`}
      >
        {/* Header do card */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${cores.bg}`}>
              <StatusIcon className={`w-4 h-4 ${cores.text}`} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                {consulta.titulo}
              </h3>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <ClockIcon className="w-4 h-4" />
                <span>
                  {dataInicio.toLocaleTimeString("pt-BR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}{" "}
                  -
                  {dataFim.toLocaleTimeString("pt-BR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
          </div>

          <div
            className={`px-2 py-1 rounded-full text-xs font-medium ${cores.bg} ${cores.text}`}
          >
            {consulta.status.replace("_", " ")}
          </div>
        </div>

        {/* Participante */}
        <div className="flex items-center space-x-3 mb-3">
          <Avatar
            src={participante.foto_perfil_url}
            alt={`${participante.nome} ${participante.sobrenome}`}
            size="sm"
          />
          <div>
            <p className="font-medium text-gray-900">
              {participante.nome} {participante.sobrenome}
            </p>
            {tipoUsuario === "paciente" && "especialidades" in participante && (
              <p className="text-sm text-gray-600">
                {participante.especialidades}
              </p>
            )}
          </div>
        </div>

        {/* Valor (apenas para profissionais) */}
        {tipoUsuario === "profissional" && consulta.valor && (
          <div className="text-sm text-gray-600">
            Valor: R$ {consulta.valor.toFixed(2)}
          </div>
        )}

        {/* Ações rápidas */}
        <div className="flex items-center justify-end space-x-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
          {consulta.status === "agendada" && podeEditar && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEditarConsulta?.(consulta);
              }}
              className="px-3 py-1 text-xs bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
            >
              Editar
            </button>
          )}

          {consulta.status === "agendada" && podeCancelar && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onCancelarConsulta?.(consulta);
              }}
              className="px-3 py-1 text-xs bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
            >
              Cancelar
            </button>
          )}

          {consulta.status === "agendada" && tipoUsuario === "profissional" && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onConfirmarConsulta?.(consulta);
              }}
              className="px-3 py-1 text-xs bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-colors"
            >
              Confirmar
            </button>
          )}
        </div>
      </div>
    );
  };

  // Renderizar vista de mês
  const renderVistaMes = () => {
    const hoje = new Date();
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

    // Ajustar para começar na segunda-feira
    const inicioCalendario = new Date(primeiroDiaMes);
    inicioCalendario.setDate(
      inicioCalendario.getDate() - (primeiroDiaMes.getDay() || 7) + 1
    );

    const fimCalendario = new Date(ultimoDiaMes);
    fimCalendario.setDate(
      fimCalendario.getDate() + (7 - (ultimoDiaMes.getDay() || 7))
    );

    const dias = [];
    const dataAtualLoop = new Date(inicioCalendario);

    while (dataAtualLoop <= fimCalendario) {
      dias.push(new Date(dataAtualLoop));
      dataAtualLoop.setDate(dataAtualLoop.getDate() + 1);
    }

    const diasSemana = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

    return (
      <div className="bg-white">
        {/* Cabeçalho dos dias da semana */}
        <div className="grid grid-cols-7 border-b border-gray-200">
          {diasSemana.map((dia) => (
            <div
              key={dia}
              className="p-4 text-center text-sm font-semibold text-gray-700"
            >
              {dia}
            </div>
          ))}
        </div>

        {/* Grid de dias */}
        <div className="grid grid-cols-7 gap-0">
          {dias.map((dia, index) => {
            const consultasDoDia = consultasNaData(dia);
            const mesAtual = dia.getMonth() === dataAtual.getMonth();
            const hojeFlag = dia.toDateString() === hoje.toDateString();

            return (
              <div
                key={index}
                className={`min-h-[120px] border-r border-b border-gray-200 p-2 ${
                  !mesAtual ? "bg-gray-50" : "bg-white"
                } hover:bg-gray-50 transition-colors`}
              >
                {/* Número do dia */}
                <div className="flex justify-between items-center mb-2">
                  <span
                    className={`text-sm font-medium ${
                      hojeFlag
                        ? "bg-blue-500 text-white w-6 h-6 rounded-full flex items-center justify-center"
                        : mesAtual
                        ? "text-gray-900"
                        : "text-gray-400"
                    }`}
                  >
                    {dia.getDate()}
                  </span>

                  {consultasDoDia.length > 0 && (
                    <span className="bg-blue-100 text-blue-600 text-xs px-2 py-1 rounded-full">
                      {consultasDoDia.length}
                    </span>
                  )}
                </div>

                {/* Consultas do dia */}
                <div className="space-y-1">
                  {consultasDoDia.slice(0, 2).map((consulta) => {
                    const cores = coresStatus[consulta.status];
                    return (
                      <div
                        key={consulta.id}
                        onClick={() => {
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

                  {consultasDoDia.length > 2 && (
                    <div className="text-xs text-gray-500 font-medium">
                      +{consultasDoDia.length - 2} mais
                    </div>
                  )}
                </div>

                {/* Indicador para adicionar consulta */}
                {mesAtual && podeAgendar && (
                  <button
                    onClick={() => onNovaConsulta?.(dia)}
                    className="w-full mt-1 py-1 text-xs text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded transition-colors opacity-0 hover:opacity-100"
                  >
                    + Adicionar
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Renderizar vista de semana
  const renderVistaSemana = () => {
    const inicioSemana = new Date(dataAtual);
    inicioSemana.setDate(dataAtual.getDate() - (dataAtual.getDay() || 7) + 1);

    const diasSemana = Array.from({ length: 7 }, (_, i) => {
      const dia = new Date(inicioSemana);
      dia.setDate(inicioSemana.getDate() + i);
      return dia;
    });

    const horasTrabalho = Array.from({ length: 12 }, (_, i) => i + 8); // 8h às 19h

    return (
      <div className="bg-white">
        {/* Cabeçalho dos dias */}
        <div className="grid grid-cols-8 border-b border-gray-200">
          <div className="p-4"></div> {/* Espaço para coluna de horas */}
          {diasSemana.map((dia) => {
            const hoje = new Date();
            const hojeFlag = dia.toDateString() === hoje.toDateString();

            return (
              <div
                key={dia.toISOString()}
                className={`p-4 text-center ${hojeFlag ? "bg-blue-50" : ""}`}
              >
                <div className="text-sm text-gray-600">
                  {dia.toLocaleDateString("pt-BR", { weekday: "short" })}
                </div>
                <div
                  className={`font-semibold ${
                    hojeFlag ? "text-blue-600" : "text-gray-900"
                  }`}
                >
                  {dia.getDate()}
                </div>
              </div>
            );
          })}
        </div>

        {/* Grid de horas */}
        <div className="overflow-y-auto max-h-[600px]">
          {horasTrabalho.map((hora) => (
            <div
              key={hora}
              className="grid grid-cols-8 border-b border-gray-100"
            >
              {/* Coluna de hora */}
              <div className="p-4 text-sm text-gray-600 border-r border-gray-200">
                {hora}:00
              </div>

              {/* Colunas dos dias */}
              {diasSemana.map((dia) => {
                const consultasNaHora = consultasNaData(dia).filter(
                  (consulta) => {
                    const horaConsulta = new Date(
                      consulta.data_inicio
                    ).getHours();
                    return horaConsulta === hora;
                  }
                );

                return (
                  <div
                    key={`${dia.toISOString()}-${hora}`}
                    className="p-2 min-h-[60px] border-r border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    {consultasNaHora.map((consulta) =>
                      renderCardConsulta(consulta, "text-xs p-2")
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Renderizar vista de lista
  const renderVistaLista = () => {
    const consultasOrdenadas = [...consultas].sort(
      (a, b) =>
        new Date(a.data_inicio).getTime() - new Date(b.data_inicio).getTime()
    );

    if (consultasOrdenadas.length === 0) {
      return (
        <div className="bg-white p-12 text-center">
          <CalendarDaysIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nenhuma consulta encontrada
          </h3>
          <p className="text-gray-600 mb-6">
            {podeAgendar
              ? "Que tal agendar sua primeira consulta?"
              : "Não há consultas agendadas no momento."}
          </p>
          {podeAgendar && (
            <button
              onClick={() => onNovaConsulta?.()}
              className="bg-blue-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors"
            >
              Agendar Consulta
            </button>
          )}
        </div>
      );
    }

    return (
      <div className="bg-white">
        <div className="divide-y divide-gray-200">
          {consultasOrdenadas.map((consulta) => {
            const dataConsulta = new Date(consulta.data_inicio);
            const hoje = new Date();
            const amanha = new Date();
            amanha.setDate(hoje.getDate() + 1);

            let labelData = dataConsulta.toLocaleDateString("pt-BR");
            if (dataConsulta.toDateString() === hoje.toDateString()) {
              labelData = "Hoje";
            } else if (dataConsulta.toDateString() === amanha.toDateString()) {
              labelData = "Amanhã";
            }

            return (
              <div key={consulta.id} className="p-6">
                <div className="flex items-center space-x-4">
                  {/* Data */}
                  <div className="flex-shrink-0 text-center">
                    <div className="text-sm text-gray-600">{labelData}</div>
                    <div className="text-2xl font-bold text-gray-900">
                      {dataConsulta.getDate()}
                    </div>
                    <div className="text-sm text-gray-600">
                      {dataConsulta.toLocaleDateString("pt-BR", {
                        month: "short",
                      })}
                    </div>
                  </div>

                  {/* Conteúdo da consulta */}
                  <div className="flex-1">{renderCardConsulta(consulta)}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Loading state
  if (loading && consultas.length === 0) {
    return (
      <div
        className={`${altura} ${className} bg-white rounded-xl border border-gray-200 flex items-center justify-center`}
      >
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Carregando agenda...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div
        className={`${altura} ${className} bg-white rounded-xl border border-gray-200 flex items-center justify-center`}
      >
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <CalendarDaysIcon className="w-16 h-16 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Erro ao carregar agenda
          </h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`${altura} ${className} bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col`}
    >
      {renderCabecalho()}
      {renderFiltros()}

      <div className="flex-1 overflow-hidden">
        {modoVisualizacao === "mes" && renderVistaMes()}
        {modoVisualizacao === "semana" && renderVistaSemana()}
        {modoVisualizacao === "lista" && renderVistaLista()}
      </div>
    </div>
  );
};

export default Agenda;
