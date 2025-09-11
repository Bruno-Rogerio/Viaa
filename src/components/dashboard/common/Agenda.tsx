// src/components/dashboard/common/Agenda.tsx - COMPONENTE COMPLETO CORRIGIDO

"use client";
import { useState, useEffect } from "react";
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
  ExclamationTriangleIcon,
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
  const [autoScrollExecuted, setAutoScrollExecuted] = useState(false);

  // Cores para status (incluindo status de solicitação)
  const coresStatus: Record<
    StatusConsulta | "solicitada",
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
    solicitada: {
      bg: "bg-purple-50",
      text: "text-purple-700",
      border: "border-purple-200",
    },
  };

  // Ícones para tipos de consulta
  const iconesTopo = {
    online: VideoCameraIcon,
    presencial: MapPinIcon,
    telefone: PhoneIcon,
  };

  // Renderizar cabeçalho com navegação (AJUSTADO)
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
          {/* Botão Nova Consulta - APENAS para profissionais */}
          {podeAgendar && tipoUsuario === "profissional" && (
            <button
              onClick={() => onNovaConsulta?.()}
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl"
            >
              <PlusIcon className="w-5 h-5" />
              <span>Consulta com Profissional</span>
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

      {/* Aviso para pacientes sobre agendamento */}
      {tipoUsuario === "paciente" && (
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <CalendarDaysIcon className="w-5 h-5 text-blue-600 mt-0.5" />
            </div>
            <div>
              <h3 className="font-semibold text-blue-800 mb-1">
                Como agendar uma nova consulta
              </h3>
              <p className="text-blue-700 text-sm mb-3">
                Para agendar uma consulta, visite o perfil do profissional
                desejado na seção "Buscar Profissionais". Aqui você visualiza
                apenas suas consultas já agendadas.
              </p>
              <button
                onClick={() =>
                  (window.location.href = "/dashboard/profissionais")
                }
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
              >
                <PlusIcon className="w-4 h-4 mr-2" />
                Buscar Profissionais
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Navegação de data e modos de visualização */}
      <div className="flex items-center justify-between">
        {/* Navegação de data */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center bg-gray-50 rounded-lg p-1">
            <button
              onClick={
                modoVisualizacao === "mes" ? mesAnterior : semanaAnterior
              }
              className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-white transition-colors"
            >
              <ChevronLeftIcon className="w-5 h-5" />
            </button>

            <button
              onClick={hoje}
              className="px-4 py-2 text-gray-900 font-medium hover:text-blue-600 transition-colors"
            >
              {modoVisualizacao === "mes"
                ? dataAtual.toLocaleDateString("pt-BR", {
                    month: "long",
                    year: "numeric",
                  })
                : `Semana de ${dataAtual.toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "short",
                  })}`}
            </button>

            <button
              onClick={modoVisualizacao === "mes" ? proximoMes : proximaSemana}
              className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-white transition-colors"
            >
              <ChevronRightIcon className="w-5 h-5" />
            </button>
          </div>

          <button
            onClick={hoje}
            className="px-3 py-1 text-sm text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
          >
            Hoje
          </button>
        </div>

        {/* Modos de visualização */}
        <div className="flex items-center bg-gray-50 rounded-lg p-1">
          {[
            { mode: "mes", icon: Squares2X2Icon, label: "Mês" },
            { mode: "semana", icon: CalendarDaysIcon, label: "Semana" },
            { mode: "lista", icon: ListBulletIcon, label: "Lista" },
          ].map(({ mode, icon: Icone, label }) => (
            <button
              key={mode}
              onClick={() => setModoVisualizacao(mode as ModoVisualizacao)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                modoVisualizacao === mode
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

  // Renderizar filtros (AJUSTADO)
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
            <option value="solicitada">Solicitada</option>
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

  // Renderizar card de consulta (AJUSTADO)
  const renderCardConsulta = (consulta: Consulta, className: string = "") => {
    const StatusIcon = iconesTopo[consulta.tipo];
    const cores = coresStatus[consulta.status as keyof typeof coresStatus];
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
        className={`group ${cores.bg} ${cores.border} border rounded-lg p-3 mb-2 cursor-pointer hover:shadow-md transition-all duration-200 ${className}`}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <h4 className={`font-medium ${cores.text} truncate`}>
                {consulta.titulo}
              </h4>
              {consulta.status === "solicitada" && (
                <ExclamationTriangleIcon className="w-4 h-4 text-purple-500 flex-shrink-0" />
              )}
            </div>
            <p className="text-xs text-gray-600 flex items-center mt-1">
              <ClockIcon className="w-3 h-3 mr-1" />
              {dataInicio.toLocaleTimeString("pt-BR", {
                hour: "2-digit",
                minute: "2-digit",
              })}
              {" - "}
              {dataFim.toLocaleTimeString("pt-BR", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
            <p className="text-xs text-gray-600 flex items-center mt-1">
              <UserIcon className="w-3 h-3 mr-1" />
              {participante.nome} {participante.sobrenome}
            </p>
            {StatusIcon && (
              <div className="flex items-center mt-1">
                <StatusIcon className="w-3 h-3 text-gray-500 mr-1" />
                <span className="text-xs text-gray-500 capitalize">
                  {consulta.tipo}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Ações (AJUSTADAS baseadas no tipo de usuário e status) */}
        <div className="flex space-x-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
          {/* Ações para profissionais */}
          {tipoUsuario === "profissional" && (
            <>
              {consulta.status === "solicitada" && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onConfirmarConsulta?.(consulta);
                    }}
                    className="px-3 py-1 text-xs bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-colors"
                  >
                    Confirmar
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onCancelarConsulta?.(consulta);
                    }}
                    className="px-3 py-1 text-xs bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                  >
                    Rejeitar
                  </button>
                </>
              )}

              {podeEditar &&
                ["agendada", "confirmada"].includes(consulta.status) && (
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

              {podeCancelar &&
                ["agendada", "confirmada"].includes(consulta.status) && (
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
            </>
          )}

          {/* Ações para pacientes */}
          {tipoUsuario === "paciente" && (
            <>
              {podeVerDetalhes && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onConsultaClick?.(consulta);
                  }}
                  className="px-3 py-1 text-xs bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Ver Detalhes
                </button>
              )}

              {consulta.status === "solicitada" && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onCancelarConsulta?.(consulta);
                  }}
                  className="px-3 py-1 text-xs bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                >
                  Cancelar Solicitação
                </button>
              )}
            </>
          )}
        </div>
      </div>
    );
  };

  // Renderizar vista de mês (mantida igual)
  const renderVistaMes = () => {
    const hoje = new Date();
    const primeiroDiaMes = new Date(
      dataAtual.getFullYear(),
      dataAtual.getMonth(),
      1
    );

    // Ajustar para começar na segunda-feira
    const inicioCalendario = new Date(primeiroDiaMes);
    inicioCalendario.setDate(
      inicioCalendario.getDate() - (primeiroDiaMes.getDay() || 7) + 1
    );

    // Garantir sempre 6 semanas completas (42 dias)
    const fimCalendario = new Date(inicioCalendario);
    fimCalendario.setDate(inicioCalendario.getDate() + 41);

    const dias = [];
    const dataAtualLoop = new Date(inicioCalendario);

    while (dataAtualLoop <= fimCalendario) {
      dias.push(new Date(dataAtualLoop));
      dataAtualLoop.setDate(dataAtualLoop.getDate() + 1);
    }

    const diasSemana = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

    return (
      <div className="bg-white h-full flex flex-col">
        {/* Cabeçalho dos dias da semana */}
        <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50">
          {diasSemana.map((dia) => (
            <div
              key={dia}
              className="p-3 text-center text-sm font-bold text-gray-700 bg-gray-50"
            >
              {dia}
            </div>
          ))}
        </div>

        {/* Grid com altura fixa e 6 linhas exatas */}
        <div
          className="grid grid-cols-7 flex-1 gap-0"
          style={{
            gridTemplateRows: "repeat(6, 1fr)",
            minHeight: "480px",
          }}
        >
          {dias.map((dia, index) => {
            const consultasDoDia = consultasNaData(dia);
            const mesAtual = dia.getMonth() === dataAtual.getMonth();
            const hojeFlag = dia.toDateString() === hoje.toDateString();

            return (
              <div
                key={index}
                className={`border-r border-b border-gray-200 p-2 overflow-y-auto flex flex-col ${
                  !mesAtual
                    ? "bg-gray-50/50 text-gray-400"
                    : hojeFlag
                    ? "bg-blue-50/80"
                    : "bg-white hover:bg-gray-50/50"
                } transition-colors ${
                  // Só clicável para profissionais
                  tipoUsuario === "profissional" && podeAgendar && mesAtual
                    ? "cursor-pointer group"
                    : ""
                }`}
                onClick={() =>
                  tipoUsuario === "profissional" &&
                  podeAgendar &&
                  mesAtual &&
                  onNovaConsulta?.(dia)
                }
              >
                {/* Cabeçalho do dia */}
                <div className="flex items-center justify-between mb-2 flex-shrink-0">
                  <span
                    className={`text-sm font-semibold ${
                      hojeFlag
                        ? "bg-blue-500 text-white w-7 h-7 rounded-full flex items-center justify-center text-xs shadow-md"
                        : mesAtual
                        ? "text-gray-900"
                        : "text-gray-400"
                    }`}
                  >
                    {dia.getDate()}
                  </span>
                  {consultasDoDia.length > 0 && mesAtual && (
                    <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full font-medium shadow-sm">
                      {consultasDoDia.length}
                    </span>
                  )}
                </div>

                {/* Consultas do dia */}
                <div className="space-y-1 flex-1 min-h-0">
                  {consultasDoDia
                    .slice(0, 4)
                    .map((consulta) =>
                      renderCardConsulta(consulta, "text-xs p-2 shadow-sm")
                    )}
                  {consultasDoDia.length > 4 && (
                    <div className="text-xs text-gray-500 text-center p-1 bg-gray-100 rounded">
                      +{consultasDoDia.length - 4} mais
                    </div>
                  )}
                </div>

                {/* Botão adicionar (APENAS para profissionais) */}
                {tipoUsuario === "profissional" && podeAgendar && mesAtual && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onNovaConsulta?.(dia);
                    }}
                    className="w-full mt-1 py-1 text-xs text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0"
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

  // Renderizar vista de semana (CORRIGIDA)
  const renderVistaSemana = () => {
    const inicioSemana = new Date(dataAtual);
    inicioSemana.setDate(dataAtual.getDate() - (dataAtual.getDay() || 7) + 1);

    const diasSemana = Array.from({ length: 7 }, (_, i) => {
      const dia = new Date(inicioSemana);
      dia.setDate(inicioSemana.getDate() + i);
      return dia;
    });

    const horasTrabalho = Array.from({ length: 18 }, (_, i) => i + 6);

    const consultasForaHorario = consultas.some((consulta) => {
      const hora = new Date(consulta.data_inicio).getHours();
      return hora < 8 || hora > 18;
    });

    const scrollToCurrentTime = () => {
      const agora = new Date();
      const horaAtual = agora.getHours();
      if (horaAtual >= 6 && horaAtual <= 23) {
        const elemento = document.getElementById(`hora-${horaAtual}`);
        if (elemento) {
          elemento.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }
    };

    return (
      <div className="bg-white h-full flex flex-col">
        {/* Cabeçalho e controles */}
        <div className="flex-shrink-0">
          <div className="flex items-center justify-between p-4 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <button
                onClick={scrollToCurrentTime}
                className="px-3 py-1.5 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors flex items-center space-x-1"
              >
                <ClockIcon className="w-4 h-4" />
                <span>Agora</span>
              </button>

              {consultasForaHorario && (
                <div className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded flex items-center">
                  <span>⚠️ Consultas fora do horário comum detectadas</span>
                </div>
              )}
            </div>

            <div className="text-sm text-gray-600">
              {diasSemana[0].toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "short",
              })}{" "}
              -{" "}
              {diasSemana[6].toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "short",
              })}
            </div>
          </div>

          {/* Cabeçalho dos dias */}
          <div className="grid grid-cols-8 border-b border-gray-200 bg-white sticky top-0 z-10">
            <div className="p-3 border-r border-gray-200 bg-gray-50">
              <span className="text-xs text-gray-500 font-medium">Horário</span>
            </div>

            {diasSemana.map((dia) => {
              const hoje = new Date();
              const hojeFlag = dia.toDateString() === hoje.toDateString();
              const consultasDoDia = consultasNaData(dia);

              return (
                <div
                  key={dia.toISOString()}
                  className={`p-3 text-center border-r border-gray-200 transition-colors ${
                    hojeFlag ? "bg-blue-50 border-blue-200" : "bg-white"
                  }`}
                >
                  <div className="text-xs text-gray-600 mb-1">
                    {dia.toLocaleDateString("pt-BR", { weekday: "short" })}
                  </div>
                  <div
                    className={`text-lg font-bold ${
                      hojeFlag ? "text-blue-600" : "text-gray-900"
                    }`}
                  >
                    {dia.getDate()}
                  </div>
                  {consultasDoDia.length > 0 && (
                    <div className="text-xs text-blue-600 mt-1">
                      {consultasDoDia.length}{" "}
                      {consultasDoDia.length === 1 ? "consulta" : "consultas"}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Grid de horas */}
        <div
          className="flex-1 overflow-y-auto overflow-x-hidden"
          style={{ maxHeight: "calc(100vh - 320px)" }}
        >
          <div className="min-w-full">
            {horasTrabalho.map((hora) => {
              const agora = new Date();
              const horaAtual = agora.getHours();
              const minutoAtual = agora.getMinutes();
              const isHoraAtual = hora === horaAtual;
              // ✅ CORREÇÃO: Declarar isHorarioComum aqui
              const isHorarioComum = hora >= 8 && hora <= 18;

              return (
                <div
                  key={hora}
                  id={`hora-${hora}`}
                  className={`grid grid-cols-8 border-b transition-colors ${
                    isHoraAtual
                      ? "bg-blue-50/50 border-blue-200"
                      : isHorarioComum
                      ? "border-gray-100"
                      : "border-gray-50 bg-gray-50/30"
                  }`}
                  style={{ minHeight: "80px" }}
                >
                  {/* Coluna de hora */}
                  <div
                    className={`p-3 text-center border-r border-gray-200 flex flex-col justify-center ${
                      isHorarioComum ? "bg-white" : "bg-gray-50"
                    }`}
                  >
                    <div
                      className={`text-sm font-semibold ${
                        isHoraAtual
                          ? "text-blue-600"
                          : isHorarioComum
                          ? "text-gray-700"
                          : "text-gray-500"
                      }`}
                    >
                      {hora.toString().padStart(2, "0")}:00
                    </div>
                    {isHoraAtual && (
                      <div className="text-xs text-blue-500 mt-1">
                        {minutoAtual.toString().padStart(2, "0")} min
                      </div>
                    )}
                    {!isHorarioComum && (
                      <div className="text-xs text-gray-400 mt-1">
                        {hora < 8 ? "Cedo" : "Tarde"}
                      </div>
                    )}
                  </div>

                  {/* Colunas dos dias */}
                  {diasSemana.map((dia, diaIndex) => {
                    const consultasNaHora = consultasNaData(dia).filter(
                      (consulta) => {
                        const horaConsulta = new Date(
                          consulta.data_inicio
                        ).getHours();
                        return horaConsulta === hora;
                      }
                    );

                    const isHoje = dia.toDateString() === agora.toDateString();
                    const podeAdicionarHora =
                      tipoUsuario === "profissional" &&
                      podeAgendar &&
                      hora >= 7 &&
                      hora <= 22;

                    return (
                      <div
                        key={`${dia.toISOString()}-${hora}`}
                        className={`p-2 border-r border-gray-200 transition-colors relative group ${
                          isHoje && isHoraAtual
                            ? "bg-blue-50"
                            : isHoje
                            ? "bg-blue-50/20"
                            : isHorarioComum
                            ? "hover:bg-gray-50"
                            : "hover:bg-gray-50/50"
                        }`}
                        onClick={() =>
                          podeAdicionarHora &&
                          onNovaConsulta?.(
                            new Date(
                              dia.getFullYear(),
                              dia.getMonth(),
                              dia.getDate(),
                              hora,
                              0
                            )
                          )
                        }
                        style={{
                          cursor: podeAdicionarHora ? "pointer" : "default",
                        }}
                      >
                        {/* Indicador de hora atual */}
                        {isHoje && isHoraAtual && (
                          <div
                            className="absolute left-0 w-full h-0.5 bg-red-500 z-10"
                            style={{
                              top: `${(minutoAtual / 60) * 100}%`,
                              boxShadow: "0 0 4px rgba(239, 68, 68, 0.5)",
                            }}
                          />
                        )}

                        {/* Consultas */}
                        <div className="space-y-1 relative z-20">
                          {consultasNaHora.map((consulta) => (
                            <div
                              key={consulta.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                onConsultaClick?.(consulta);
                              }}
                              className="group/consulta"
                            >
                              {renderCardConsulta(
                                consulta,
                                "text-xs p-2 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                              )}
                            </div>
                          ))}
                        </div>

                        {/* Botão adicionar (APENAS para profissionais) */}
                        {podeAdicionarHora && consultasNaHora.length === 0 && (
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onNovaConsulta?.(
                                  new Date(
                                    dia.getFullYear(),
                                    dia.getMonth(),
                                    dia.getDate(),
                                    hora,
                                    0
                                  )
                                );
                              }}
                              className="text-xs text-gray-400 hover:text-blue-500 bg-white/80 hover:bg-blue-50 px-2 py-1 rounded border border-gray-200 hover:border-blue-300 transition-all"
                            >
                              + Adicionar
                            </button>
                          </div>
                        )}

                        {/* Slot vazio para múltiplas consultas */}
                        {consultasNaHora.length > 0 && podeAdicionarHora && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onNovaConsulta?.(
                                new Date(
                                  dia.getFullYear(),
                                  dia.getMonth(),
                                  dia.getDate(),
                                  hora,
                                  30
                                )
                              );
                            }}
                            className="w-full text-xs text-gray-400 hover:text-blue-500 hover:bg-blue-50 py-1 rounded transition-colors opacity-0 group-hover:opacity-100"
                          >
                            + Mais
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>

        {/* Rodapé com legenda */}
        <div className="flex-shrink-0 p-3 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center justify-between text-xs text-gray-600">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-blue-50 border border-blue-200 rounded"></div>
                <span>Horário atual</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-white border border-gray-200 rounded"></div>
                <span>Horário comercial</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-gray-50 border border-gray-200 rounded"></div>
                <span>Horário estendido</span>
              </div>
            </div>

            <div className="text-right">Visualizando: 6h às 23h</div>
          </div>
        </div>
      </div>
    );
  };

  // Renderizar vista de lista (AJUSTADA)
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
            {tipoUsuario === "profissional"
              ? "Sua agenda está vazia. Você pode agendar consultas com outros profissionais."
              : "Você ainda não tem consultas agendadas."}
          </p>
          {tipoUsuario === "profissional" && podeAgendar && (
            <button
              onClick={() => onNovaConsulta?.()}
              className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Agendar com Profissional
            </button>
          )}
          {tipoUsuario === "paciente" && (
            <button
              onClick={() =>
                (window.location.href = "/dashboard/profissionais")
              }
              className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Buscar Profissionais
            </button>
          )}
        </div>
      );
    }

    return (
      <div className="bg-white p-6">
        <div className="space-y-4">
          {consultasOrdenadas.map((consulta) => (
            <div
              key={consulta.id}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="font-semibold text-gray-900">
                      {consulta.titulo}
                    </h3>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        coresStatus[consulta.status as keyof typeof coresStatus]
                          .bg
                      } ${
                        coresStatus[consulta.status as keyof typeof coresStatus]
                          .text
                      }`}
                    >
                      {consulta.status === "solicitada"
                        ? "Aguardando confirmação"
                        : consulta.status.replace("_", " ")}
                    </span>
                    {consulta.status === "solicitada" && (
                      <ExclamationTriangleIcon className="w-4 h-4 text-purple-500" />
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <CalendarDaysIcon className="w-4 h-4 mr-2" />
                      {new Date(consulta.data_inicio).toLocaleDateString(
                        "pt-BR"
                      )}
                    </div>
                    <div className="flex items-center">
                      <ClockIcon className="w-4 h-4 mr-2" />
                      {new Date(consulta.data_inicio).toLocaleTimeString(
                        "pt-BR",
                        {
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )}
                      {" - "}
                      {new Date(consulta.data_fim).toLocaleTimeString("pt-BR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                    <div className="flex items-center">
                      <UserIcon className="w-4 h-4 mr-2" />
                      {tipoUsuario === "profissional"
                        ? `${consulta.paciente.nome} ${consulta.paciente.sobrenome}`
                        : `${consulta.profissional.nome} ${consulta.profissional.sobrenome}`}
                    </div>
                  </div>

                  {consulta.descricao && (
                    <p className="text-sm text-gray-600 mt-2">
                      {consulta.descricao}
                    </p>
                  )}
                </div>

                <div className="flex space-x-2 ml-4">
                  {/* Ações baseadas no tipo de usuário */}
                  {tipoUsuario === "profissional" ? (
                    <>
                      {consulta.status === "solicitada" && (
                        <>
                          <button
                            onClick={() => onConfirmarConsulta?.(consulta)}
                            className="px-3 py-1 text-xs bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-colors"
                          >
                            Confirmar
                          </button>
                          <button
                            onClick={() => onCancelarConsulta?.(consulta)}
                            className="px-3 py-1 text-xs bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                          >
                            Rejeitar
                          </button>
                        </>
                      )}
                      {podeVerDetalhes && (
                        <button
                          onClick={() => onConsultaClick?.(consulta)}
                          className="px-3 py-1 text-xs bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                          Ver Detalhes
                        </button>
                      )}
                      {podeEditar &&
                        ["agendada", "confirmada"].includes(
                          consulta.status
                        ) && (
                          <button
                            onClick={() => onEditarConsulta?.(consulta)}
                            className="px-3 py-1 text-xs bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                          >
                            Editar
                          </button>
                        )}
                    </>
                  ) : (
                    <>
                      {podeVerDetalhes && (
                        <button
                          onClick={() => onConsultaClick?.(consulta)}
                          className="px-3 py-1 text-xs bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                          Ver Detalhes
                        </button>
                      )}
                      {consulta.status === "solicitada" && (
                        <button
                          onClick={() => onCancelarConsulta?.(consulta)}
                          className="px-3 py-1 text-xs bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                        >
                          Cancelar Solicitação
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // useEffect para autoscroll na vista semana
  useEffect(() => {
    if (modoVisualizacao === "semana" && !autoScrollExecuted) {
      const timer = setTimeout(() => {
        const agora = new Date();
        const horaAtual = agora.getHours();
        if (horaAtual >= 6 && horaAtual <= 23) {
          const elemento = document.getElementById(`hora-${horaAtual}`);
          if (elemento) {
            elemento.scrollIntoView({ behavior: "smooth", block: "center" });
            setAutoScrollExecuted(true);
          }
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [modoVisualizacao, autoScrollExecuted]);

  // Reset autoscroll quando muda o modo
  useEffect(() => {
    if (modoVisualizacao !== "semana") {
      setAutoScrollExecuted(false);
    }
  }, [modoVisualizacao]);

  // Loading
  if (loading) {
    return (
      <div
        className={`${altura} ${className} bg-white rounded-xl border border-gray-200 shadow-sm flex items-center justify-center`}
      >
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Carregando agenda...</p>
        </div>
      </div>
    );
  }

  // Error
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
