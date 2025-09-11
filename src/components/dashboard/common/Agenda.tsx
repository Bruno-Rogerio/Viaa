// viaa/src/components/dashboard/common/Agenda.tsx

"use client";

import { useState, useEffect, useMemo } from "react";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  CalendarIcon as CalendarSolid,
  VideoCameraIcon,
  MapPinIcon,
  PhoneIcon,
  FunnelIcon,
  ClockIcon,
  CheckIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  UserIcon,
} from "@heroicons/react/24/solid";
import {
  CalendarDaysIcon,
  ListBulletIcon,
  Squares2X2Icon,
} from "@heroicons/react/24/outline";
import type {
  AgendaProps,
  Consulta,
  StatusConsulta,
  ModoVisualizacao,
} from "@/types/agenda";

interface AgendaSmartProps extends Omit<AgendaProps, "profissionalId"> {
  // ID do profissional cuja agenda está sendo visualizada
  profissionalId: string;

  // Informações do profissional (quando visualizando agenda de outro)
  profissionalInfo?: {
    nome: string;
    sobrenome: string;
    especialidades: string;
    foto_perfil_url?: string;
    valor_sessao?: number;
    crp?: string;
    verificado?: boolean;
  };
}

export default function Agenda({
  tipoUsuario,
  usuarioId,
  profissionalId,
  profissionalInfo,
  modoVisualizacao = "mes",
  altura = "h-[600px]",
  onConsultaClick,
  onEditarConsulta,
  onCancelarConsulta,
  onConfirmarConsulta,
  onRejeitarConsulta,
  onIniciarConsulta,
  onFinalizarConsulta,
  onSolicitarConsulta,
  className = "",
  desabilitado = false,
}: AgendaSmartProps) {
  // Estados locais
  const [dataAtual, setDataAtual] = useState(new Date());
  const [consultaSelecionada, setConsultaSelecionada] =
    useState<Consulta | null>(null);
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [modalAgendamento, setModalAgendamento] = useState<{
    aberto: boolean;
    data?: Date;
    horario?: string;
  }>({ aberto: false });
  const [carregando, setCarregando] = useState(false);

  // Lógica inteligente de contexto
  const ehMinhaAgenda = useMemo(() => {
    return tipoUsuario === "profissional" && usuarioId === profissionalId;
  }, [tipoUsuario, usuarioId, profissionalId]);

  const comportarComoPaciente = useMemo(() => {
    return !ehMinhaAgenda; // Paciente OU profissional vendo outro profissional
  }, [ehMinhaAgenda]);

  // Permissões baseadas no contexto
  const permissoes = useMemo(
    () => ({
      // Solicitar consultas - apenas quando não é minha agenda
      podeSolicitarConsulta: comportarComoPaciente,

      // Gerenciar consultas - apenas na minha agenda
      podeConfirmar: ehMinhaAgenda,
      podeRejeitar: ehMinhaAgenda,
      podeIniciar: ehMinhaAgenda,
      podeFinalizar: ehMinhaAgenda,
      podeConfigurarHorarios: ehMinhaAgenda,

      // Editar/cancelar - todos podem (com regras específicas)
      podeEditar: ehMinhaAgenda, // Apenas profissional edita suas consultas
      podeCancelar: true, // Todos podem cancelar suas consultas

      // Visualizar detalhes - todos podem
      podeVerDetalhes: true,
    }),
    [ehMinhaAgenda, comportarComoPaciente]
  );

  // Estado mock - em produção virá do hook useAgenda
  const [consultas] = useState<Consulta[]>([
    // Dados mock para demonstração
  ]);

  const [estatisticas] = useState({
    consultas_hoje: 3,
    consultas_semana: 12,
    consultas_pendentes_confirmacao: ehMinhaAgenda ? 2 : 0,
  });

  // Cores para status de consulta
  const coresStatus: Record<
    StatusConsulta,
    { bg: string; text: string; border: string; dot: string }
  > = {
    agendada: {
      bg: "bg-blue-50",
      text: "text-blue-700",
      border: "border-blue-200",
      dot: "bg-blue-400",
    },
    confirmada: {
      bg: "bg-emerald-50",
      text: "text-emerald-700",
      border: "border-emerald-200",
      dot: "bg-emerald-400",
    },
    em_andamento: {
      bg: "bg-purple-50",
      text: "text-purple-700",
      border: "border-purple-200",
      dot: "bg-purple-400",
    },
    concluida: {
      bg: "bg-green-50",
      text: "text-green-700",
      border: "border-green-200",
      dot: "bg-green-400",
    },
    cancelada: {
      bg: "bg-red-50",
      text: "text-red-700",
      border: "border-red-200",
      dot: "bg-red-400",
    },
    rejeitada: {
      bg: "bg-orange-50",
      text: "text-orange-700",
      border: "border-orange-200",
      dot: "bg-orange-400",
    },
    nao_compareceu: {
      bg: "bg-gray-50",
      text: "text-gray-700",
      border: "border-gray-200",
      dot: "bg-gray-400",
    },
  };

  // Ícones para tipos de consulta
  const iconesTopo = {
    online: VideoCameraIcon,
    presencial: MapPinIcon,
    telefone: PhoneIcon,
  };

  // Handler para solicitar consulta (comportamento de paciente)
  const handleSolicitarConsulta = (data: Date, horario: string) => {
    if (!permissoes.podeSolicitarConsulta) return;

    setModalAgendamento({
      aberto: true,
      data,
      horario,
    });
  };

  // Handler para confirmar agendamento
  const handleConfirmarAgendamento = async (dadosConsulta: {
    tipo: "online" | "presencial" | "telefone";
    observacoes?: string;
  }) => {
    console.log("Solicitar consulta:", {
      profissional_id: profissionalId,
      solicitante_id: usuarioId,
      tipo_solicitante: tipoUsuario,
      data: modalAgendamento.data,
      horario: modalAgendamento.horario,
      ...dadosConsulta,
    });

    // TODO: Implementar API call para criar consulta
    // Status inicial será 'agendada' (aguardando confirmação do profissional)

    setModalAgendamento({ aberto: false });
  };

  // Renderizar cabeçalho - ajustado para contexto
  const renderCabecalho = () => (
    <div className="bg-white border-b border-gray-200 p-6">
      {/* Cabeçalho do profissional quando não é minha agenda */}
      {comportarComoPaciente && profissionalInfo && (
        <div className="mb-6 pb-6 border-b border-gray-100">
          <div className="flex items-start space-x-4">
            {/* Foto do profissional */}
            <div className="flex-shrink-0">
              {profissionalInfo.foto_perfil_url ? (
                <img
                  src={profissionalInfo.foto_perfil_url}
                  alt={`${profissionalInfo.nome} ${profissionalInfo.sobrenome}`}
                  className="w-16 h-16 rounded-full object-cover"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                  <UserIcon className="w-8 h-8 text-gray-600" />
                </div>
              )}
            </div>

            {/* Informações do profissional */}
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <h2 className="text-xl font-bold text-gray-900">
                  {profissionalInfo.nome} {profissionalInfo.sobrenome}
                </h2>
                {profissionalInfo.verificado && (
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">
                    Verificado
                  </span>
                )}
              </div>

              <p className="text-gray-600 mb-2">
                {profissionalInfo.especialidades}
              </p>

              <div className="flex items-center space-x-4">
                {profissionalInfo.crp && (
                  <span className="text-sm text-gray-500">
                    CRP: {profissionalInfo.crp}
                  </span>
                )}
                {profissionalInfo.valor_sessao && (
                  <span className="bg-emerald-50 text-emerald-800 px-2 py-1 rounded text-sm font-medium">
                    R${" "}
                    {profissionalInfo.valor_sessao.toFixed(2).replace(".", ",")}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Instruções quando comporta como paciente */}
          <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              <strong>
                {tipoUsuario === "profissional"
                  ? "Agendando como paciente:"
                  : "Como agendar:"}
              </strong>{" "}
              Clique em um horário disponível no calendário para solicitar uma
              consulta.
            </p>
          </div>
        </div>
      )}

      {/* Linha superior - Título e ações */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-3 rounded-xl">
            <CalendarSolid className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {ehMinhaAgenda
                ? "Minha Agenda"
                : comportarComoPaciente && profissionalInfo
                ? `Agenda - ${profissionalInfo.nome}`
                : "Agenda do Profissional"}
            </h1>
            <p className="text-gray-600 text-sm">
              {ehMinhaAgenda && estatisticas && (
                <>
                  {estatisticas.consultas_hoje} consultas hoje •
                  {estatisticas.consultas_pendentes_confirmacao} pendentes
                  confirmação
                </>
              )}
              {comportarComoPaciente && (
                <>
                  {tipoUsuario === "profissional"
                    ? "Visualizando como paciente"
                    : "Clique nos horários disponíveis para agendar"}
                </>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* Botão de Configurar Horários (apenas minha agenda) */}
          {permissoes.podeConfigurarHorarios && (
            <button
              onClick={() => {
                console.log("Configurar horários disponíveis");
              }}
              className="bg-emerald-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-emerald-600 transition-colors flex items-center space-x-2"
            >
              <ClockIcon className="w-5 h-5" />
              <span>Horários</span>
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
              onClick={() => {
                const nova = new Date(dataAtual);
                nova.setMonth(nova.getMonth() - 1);
                setDataAtual(nova);
              }}
              className="p-2 hover:bg-white rounded-md transition-colors"
            >
              <ChevronLeftIcon className="w-4 h-4" />
            </button>

            <span className="px-4 py-2 font-semibold text-gray-900 min-w-[200px] text-center">
              {dataAtual.toLocaleDateString("pt-BR", {
                month: "long",
                year: "numeric",
              })}
            </span>

            <button
              onClick={() => {
                const nova = new Date(dataAtual);
                nova.setMonth(nova.getMonth() + 1);
                setDataAtual(nova);
              }}
              className="p-2 hover:bg-white rounded-md transition-colors"
            >
              <ChevronRightIcon className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => setDataAtual(new Date())}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
          >
            Hoje
          </button>
        </div>

        {/* Modos de visualização */}
        <div className="flex items-center bg-gray-50 rounded-lg p-1">
          <button
            onClick={() => {}}
            className={`p-2 rounded-md transition-colors ${
              modoVisualizacao === "mes"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <Squares2X2Icon className="w-5 h-5" />
          </button>
          <button
            onClick={() => {}}
            className={`p-2 rounded-md transition-colors ${
              modoVisualizacao === "semana"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <CalendarDaysIcon className="w-5 h-5" />
          </button>
          <button
            onClick={() => {}}
            className={`p-2 rounded-md transition-colors ${
              modoVisualizacao === "lista"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <ListBulletIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );

  // Renderizar calendário mensal
  const renderCalendarioMensal = () => {
    const primeiroDiaDoMes = new Date(
      dataAtual.getFullYear(),
      dataAtual.getMonth(),
      1
    );
    const ultimoDiaDoMes = new Date(
      dataAtual.getFullYear(),
      dataAtual.getMonth() + 1,
      0
    );
    const primeiroDiaSemana = primeiroDiaDoMes.getDay();

    const dias: Date[] = [];

    // Dias do mês anterior
    for (let i = primeiroDiaSemana - 1; i >= 0; i--) {
      const dia = new Date(primeiroDiaDoMes);
      dia.setDate(dia.getDate() - i - 1);
      dias.push(dia);
    }

    // Dias do mês atual
    for (let dia = 1; dia <= ultimoDiaDoMes.getDate(); dia++) {
      dias.push(new Date(dataAtual.getFullYear(), dataAtual.getMonth(), dia));
    }

    // Dias do próximo mês para completar a grade
    const diasRestantes = 42 - dias.length;
    for (let i = 1; i <= diasRestantes; i++) {
      const dia = new Date(ultimoDiaDoMes);
      dia.setDate(dia.getDate() + i);
      dias.push(dia);
    }

    return (
      <div className="bg-white">
        {/* Cabeçalho da semana */}
        <div className="grid grid-cols-7 border-b border-gray-200">
          {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"].map((dia) => (
            <div
              key={dia}
              className="px-4 py-3 text-sm font-semibold text-gray-600 text-center"
            >
              {dia}
            </div>
          ))}
        </div>

        {/* Grade do calendário */}
        <div className="grid grid-cols-7">
          {dias.map((dia, index) => {
            const consultasDoDia = consultas.filter((consulta) => {
              const dataConsulta = new Date(consulta.data_inicio);
              return (
                dataConsulta.getDate() === dia.getDate() &&
                dataConsulta.getMonth() === dia.getMonth() &&
                dataConsulta.getFullYear() === dia.getFullYear()
              );
            });

            const mesAtual = dia.getMonth() === dataAtual.getMonth();
            const hoje =
              dia.getDate() === new Date().getDate() &&
              dia.getMonth() === new Date().getMonth() &&
              dia.getFullYear() === new Date().getFullYear();

            const podeClicarParaAgendar =
              permissoes.podeSolicitarConsulta && mesAtual && dia >= new Date();

            return (
              <div
                key={index}
                onClick={() => {
                  if (podeClicarParaAgendar) {
                    handleSolicitarConsulta(dia, "09:00");
                  }
                }}
                className={`min-h-[120px] p-3 border-r border-b border-gray-100 ${
                  mesAtual ? "bg-white" : "bg-gray-50"
                } ${
                  podeClicarParaAgendar
                    ? "cursor-pointer hover:bg-blue-50 transition-colors"
                    : ""
                } ${podeClicarParaAgendar ? "group" : ""}`}
              >
                {/* Número do dia */}
                <div className="flex justify-between items-center mb-2">
                  <span
                    className={`text-sm font-medium ${
                      hoje
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

                  {consultasDoDia.length > 2 && (
                    <div className="text-xs text-gray-500 font-medium">
                      +{consultasDoDia.length - 2} mais
                    </div>
                  )}
                </div>

                {/* Indicador para solicitar consulta */}
                {podeClicarParaAgendar && consultasDoDia.length === 0 && (
                  <div className="mt-2 text-center">
                    <div className="text-xs text-blue-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                      Clique para agendar
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

  // Renderizar visualização semanal
  const renderCalendarioSemanal = () => {
    // Calcular início e fim da semana
    const inicioSemana = new Date(dataAtual);
    const diaSemana = inicioSemana.getDay();
    inicioSemana.setDate(inicioSemana.getDate() - diaSemana);

    const diasSemana: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const dia = new Date(inicioSemana);
      dia.setDate(dia.getDate() + i);
      diasSemana.push(dia);
    }

    // Horários (das 6h às 22h)
    const horarios: string[] = [];
    for (let h = 6; h <= 22; h++) {
      horarios.push(`${h.toString().padStart(2, "0")}:00`);
    }

    return (
      <div className="bg-white">
        {/* Cabeçalho da semana */}
        <div className="grid grid-cols-8 border-b border-gray-200">
          <div className="p-4 text-sm font-semibold text-gray-600">Horário</div>
          {diasSemana.map((dia, index) => {
            const hoje =
              dia.getDate() === new Date().getDate() &&
              dia.getMonth() === new Date().getMonth() &&
              dia.getFullYear() === new Date().getFullYear();

            return (
              <div
                key={index}
                className={`p-4 text-center border-r border-gray-100 ${
                  hoje ? "bg-blue-50" : ""
                }`}
              >
                <div className="text-xs text-gray-600 mb-1">
                  {dia.toLocaleDateString("pt-BR", { weekday: "short" })}
                </div>
                <div
                  className={`text-lg font-semibold ${
                    hoje ? "text-blue-600" : "text-gray-900"
                  }`}
                >
                  {dia.getDate()}
                </div>
              </div>
            );
          })}
        </div>

        {/* Grade de horários */}
        <div className="max-h-96 overflow-y-auto">
          {horarios.map((horario) => (
            <div
              key={horario}
              className="grid grid-cols-8 border-b border-gray-100"
            >
              {/* Coluna do horário */}
              <div className="p-3 text-sm text-gray-600 border-r border-gray-100 bg-gray-50">
                {horario}
              </div>

              {/* Colunas dos dias */}
              {diasSemana.map((dia, indexDia) => {
                const dataHora = new Date(dia);
                const [hora] = horario.split(":");
                dataHora.setHours(parseInt(hora), 0, 0, 0);

                const consultasNoHorario = consultas.filter((consulta) => {
                  const dataConsulta = new Date(consulta.data_inicio);
                  return (
                    dataConsulta.getDate() === dia.getDate() &&
                    dataConsulta.getMonth() === dia.getMonth() &&
                    dataConsulta.getFullYear() === dia.getFullYear() &&
                    dataConsulta.getHours() === parseInt(hora)
                  );
                });

                const podeClicarParaAgendar =
                  permissoes.podeSolicitarConsulta &&
                  dataHora >= new Date() &&
                  consultasNoHorario.length === 0;

                return (
                  <div
                    key={indexDia}
                    onClick={() => {
                      if (podeClicarParaAgendar) {
                        handleSolicitarConsulta(dia, horario);
                      }
                    }}
                    className={`p-2 border-r border-gray-100 min-h-[60px] ${
                      podeClicarParaAgendar
                        ? "cursor-pointer hover:bg-blue-50 transition-colors"
                        : ""
                    }`}
                  >
                    {consultasNoHorario.map((consulta) => {
                      const cores = coresStatus[consulta.status];
                      return (
                        <div
                          key={consulta.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            setConsultaSelecionada(consulta);
                            onConsultaClick?.(consulta);
                          }}
                          className={`text-xs p-1 rounded cursor-pointer mb-1 ${cores.bg} ${cores.text}`}
                        >
                          <div className="font-medium truncate">
                            {consulta.titulo}
                          </div>
                          <div className="opacity-75">
                            {ehMinhaAgenda
                              ? `${consulta.paciente.nome} ${consulta.paciente.sobrenome}`
                              : `${consulta.profissional.nome} ${consulta.profissional.sobrenome}`}
                          </div>
                        </div>
                      );
                    })}

                    {/* Indicador de horário disponível */}
                    {podeClicarParaAgendar && (
                      <div className="text-center">
                        <div className="text-xs text-blue-600 opacity-0 hover:opacity-100 transition-opacity">
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
    );
  };

  // Renderizar visualização em lista
  const renderVisualizacaoLista = () => {
    // Filtrar e ordenar consultas
    const consultasOrdenadas = consultas.sort(
      (a, b) =>
        new Date(a.data_inicio).getTime() - new Date(b.data_inicio).getTime()
    );

    // Agrupar por data
    const consultasPorData = consultasOrdenadas.reduce((grupos, consulta) => {
      const data = new Date(consulta.data_inicio).toDateString();
      if (!grupos[data]) {
        grupos[data] = [];
      }
      grupos[data].push(consulta);
      return grupos;
    }, {} as Record<string, Consulta[]>);

    return (
      <div className="bg-white">
        {Object.entries(consultasPorData).length === 0 ? (
          <div className="text-center py-12">
            <CalendarSolid className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {ehMinhaAgenda
                ? "Nenhuma consulta agendada"
                : "Nenhuma consulta encontrada"}
            </h3>
            <p className="text-gray-600">
              {ehMinhaAgenda
                ? "Suas consultas aparecerão aqui quando pacientes agendarem."
                : comportarComoPaciente
                ? "Clique na visualização mensal ou semanal para agendar consultas."
                : "Nenhuma consulta encontrada para o período selecionado."}
            </p>
          </div>
        ) : (
          <div className="space-y-6 p-6">
            {Object.entries(consultasPorData).map(
              ([dataStr, consultasDoDia]) => {
                const data = new Date(dataStr);
                const hoje =
                  data.getDate() === new Date().getDate() &&
                  data.getMonth() === new Date().getMonth() &&
                  data.getFullYear() === new Date().getFullYear();

                return (
                  <div key={dataStr} className="space-y-3">
                    {/* Cabeçalho da data */}
                    <div
                      className={`flex items-center space-x-3 pb-2 border-b ${
                        hoje ? "border-blue-200" : "border-gray-200"
                      }`}
                    >
                      <div
                        className={`w-3 h-3 rounded-full ${
                          hoje ? "bg-blue-500" : "bg-gray-300"
                        }`}
                      ></div>
                      <h3
                        className={`text-lg font-semibold ${
                          hoje ? "text-blue-900" : "text-gray-900"
                        }`}
                      >
                        {data.toLocaleDateString("pt-BR", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                        {hoje && (
                          <span className="ml-2 text-sm font-normal text-blue-600">
                            (Hoje)
                          </span>
                        )}
                      </h3>
                      <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                        {consultasDoDia.length} consulta
                        {consultasDoDia.length !== 1 ? "s" : ""}
                      </span>
                    </div>

                    {/* Lista de consultas do dia */}
                    <div className="space-y-2">
                      {consultasDoDia.map((consulta) => {
                        const cores = coresStatus[consulta.status];
                        const IconeTipo = iconesTopo[consulta.tipo];
                        const participante = ehMinhaAgenda
                          ? consulta.paciente
                          : consulta.profissional;

                        return (
                          <div
                            key={consulta.id}
                            onClick={() => {
                              setConsultaSelecionada(consulta);
                              onConsultaClick?.(consulta);
                            }}
                            className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                          >
                            <div className="flex items-start space-x-4">
                              {/* Ícone do tipo de consulta */}
                              <div
                                className={`p-2 rounded-lg ${cores.bg} flex-shrink-0`}
                              >
                                <IconeTipo
                                  className={`w-5 h-5 ${cores.text}`}
                                />
                              </div>

                              {/* Informações principais */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between">
                                  <div>
                                    <h4 className="text-lg font-semibold text-gray-900 truncate">
                                      {consulta.titulo}
                                    </h4>
                                    <p className="text-sm text-gray-600">
                                      {new Date(
                                        consulta.data_inicio
                                      ).toLocaleTimeString("pt-BR", {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })}{" "}
                                      -{" "}
                                      {new Date(
                                        consulta.data_fim
                                      ).toLocaleTimeString("pt-BR", {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })}
                                    </p>
                                  </div>

                                  <span
                                    className={`px-3 py-1 rounded-full text-xs font-medium ${cores.bg} ${cores.text} flex-shrink-0`}
                                  >
                                    {consulta.status === "agendada" &&
                                      "Aguardando"}
                                    {consulta.status === "confirmada" &&
                                      "Confirmada"}
                                    {consulta.status === "em_andamento" &&
                                      "Em Andamento"}
                                    {consulta.status === "concluida" &&
                                      "Concluída"}
                                    {consulta.status === "cancelada" &&
                                      "Cancelada"}
                                    {consulta.status === "rejeitada" &&
                                      "Rejeitada"}
                                    {consulta.status === "nao_compareceu" &&
                                      "Não Compareceu"}
                                  </span>
                                </div>

                                {/* Informações do participante */}
                                <div className="flex items-center space-x-2 mt-2">
                                  {participante.foto_perfil_url ? (
                                    <img
                                      src={participante.foto_perfil_url}
                                      alt={`${participante.nome} ${participante.sobrenome}`}
                                      className="w-6 h-6 rounded-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
                                      <UserIcon className="w-3 h-3 text-gray-600" />
                                    </div>
                                  )}
                                  <span className="text-sm text-gray-600">
                                    {ehMinhaAgenda
                                      ? "Paciente: "
                                      : "Profissional: "}
                                    {participante.nome} {participante.sobrenome}
                                  </span>
                                </div>

                                {/* Observações (se houver) */}
                                {consulta.observacoes && (
                                  <p className="text-sm text-gray-600 mt-2 truncate">
                                    "{consulta.observacoes}"
                                  </p>
                                )}

                                {/* Valor (se houver) */}
                                {consulta.valor && (
                                  <p className="text-sm font-medium text-emerald-600 mt-1">
                                    R${" "}
                                    {consulta.valor
                                      .toFixed(2)
                                      .replace(".", ",")}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              }
            )}
          </div>
        )}
      </div>
    );
  };

  // Renderizar detalhes da consulta selecionada
  const renderDetalhesConsulta = () => {
    if (!consultaSelecionada) return null;

    const cores = coresStatus[consultaSelecionada.status];
    const IconeTipo = iconesTopo[consultaSelecionada.tipo];
    const participante = ehMinhaAgenda
      ? consultaSelecionada.paciente
      : consultaSelecionada.profissional;

    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start space-x-3">
            <div className={`p-2 rounded-lg ${cores.bg}`}>
              <IconeTipo className={`w-5 h-5 ${cores.text}`} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {consultaSelecionada.titulo}
              </h3>
              <p className="text-sm text-gray-600">
                {new Date(consultaSelecionada.data_inicio).toLocaleDateString(
                  "pt-BR",
                  {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  }
                )}
              </p>
              <p className="text-sm text-gray-600">
                {new Date(consultaSelecionada.data_inicio).toLocaleTimeString(
                  "pt-BR",
                  {
                    hour: "2-digit",
                    minute: "2-digit",
                  }
                )}{" "}
                -{" "}
                {new Date(consultaSelecionada.data_fim).toLocaleTimeString(
                  "pt-BR",
                  {
                    hour: "2-digit",
                    minute: "2-digit",
                  }
                )}
              </p>
            </div>
          </div>

          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${cores.bg} ${cores.text}`}
          >
            {consultaSelecionada.status === "agendada" &&
              "Aguardando Confirmação"}
            {consultaSelecionada.status === "confirmada" && "Confirmada"}
            {consultaSelecionada.status === "em_andamento" && "Em Andamento"}
            {consultaSelecionada.status === "concluida" && "Concluída"}
            {consultaSelecionada.status === "cancelada" && "Cancelada"}
            {consultaSelecionada.status === "rejeitada" && "Rejeitada"}
            {consultaSelecionada.status === "nao_compareceu" &&
              "Não Compareceu"}
          </span>
        </div>

        {/* Informações do participante */}
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">
            {ehMinhaAgenda ? "Paciente" : "Profissional"}
          </h4>
          <div className="flex items-center space-x-3">
            {participante.foto_perfil_url ? (
              <img
                src={participante.foto_perfil_url}
                alt={`${participante.nome} ${participante.sobrenome}`}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                <UserIcon className="w-5 h-5 text-gray-600" />
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-gray-900">
                {participante.nome} {participante.sobrenome}
              </p>
              {!ehMinhaAgenda &&
                "especialidades" in consultaSelecionada.profissional && (
                  <p className="text-xs text-gray-600">
                    {consultaSelecionada.profissional.especialidades}
                  </p>
                )}
            </div>
          </div>
        </div>

        {/* Observações */}
        {consultaSelecionada.observacoes && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-900 mb-2">
              Observações
            </h4>
            <p className="text-sm text-gray-600">
              {consultaSelecionada.observacoes}
            </p>
          </div>
        )}

        {/* Valor */}
        {consultaSelecionada.valor && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Valor</h4>
            <p className="text-sm text-gray-600">
              R$ {consultaSelecionada.valor.toFixed(2).replace(".", ",")}
            </p>
          </div>
        )}

        {/* Ações baseadas no contexto e permissões */}
        <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-200">
          {/* Ações para PROFISSIONAIS na SUA agenda */}
          {permissoes.podeConfirmar && (
            <>
              {/* Confirmar consulta agendada */}
              {consultaSelecionada.status === "agendada" && (
                <button
                  onClick={() => onConfirmarConsulta?.(consultaSelecionada)}
                  className="bg-emerald-500 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-emerald-600 transition-colors flex items-center space-x-1"
                >
                  <CheckIcon className="w-4 h-4" />
                  <span>Confirmar</span>
                </button>
              )}

              {/* Rejeitar consulta agendada */}
              {consultaSelecionada.status === "agendada" &&
                permissoes.podeRejeitar && (
                  <button
                    onClick={() => onRejeitarConsulta?.(consultaSelecionada)}
                    className="bg-red-500 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-red-600 transition-colors flex items-center space-x-1"
                  >
                    <XMarkIcon className="w-4 h-4" />
                    <span>Rejeitar</span>
                  </button>
                )}

              {/* Iniciar consulta confirmada */}
              {consultaSelecionada.status === "confirmada" &&
                permissoes.podeIniciar && (
                  <button
                    onClick={() => onIniciarConsulta?.(consultaSelecionada)}
                    className="bg-blue-500 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors flex items-center space-x-1"
                  >
                    <VideoCameraIcon className="w-4 h-4" />
                    <span>Iniciar</span>
                  </button>
                )}

              {/* Finalizar consulta em andamento */}
              {consultaSelecionada.status === "em_andamento" &&
                permissoes.podeFinalizar && (
                  <button
                    onClick={() => onFinalizarConsulta?.(consultaSelecionada)}
                    className="bg-purple-500 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-purple-600 transition-colors"
                  >
                    Finalizar
                  </button>
                )}
            </>
          )}

          {/* Ações para comportamento de PACIENTE */}
          {comportarComoPaciente && (
            <>
              {/* Cancelar consulta */}
              {(consultaSelecionada.status === "agendada" ||
                consultaSelecionada.status === "confirmada") &&
                permissoes.podeCancelar && (
                  <button
                    onClick={() => onCancelarConsulta?.(consultaSelecionada)}
                    className="bg-red-500 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-red-600 transition-colors flex items-center space-x-1"
                  >
                    <XMarkIcon className="w-4 h-4" />
                    <span>Cancelar</span>
                  </button>
                )}

              {/* Entrar na consulta (se online) */}
              {consultaSelecionada.status === "confirmada" &&
                consultaSelecionada.tipo === "online" &&
                consultaSelecionada.link_videochamada && (
                  <a
                    href={consultaSelecionada.link_videochamada}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-blue-500 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors flex items-center space-x-1"
                  >
                    <VideoCameraIcon className="w-4 h-4" />
                    <span>Entrar</span>
                  </a>
                )}
            </>
          )}

          {/* Ações comuns */}
          {permissoes.podeEditar &&
            (consultaSelecionada.status === "agendada" ||
              consultaSelecionada.status === "confirmada") && (
              <button
                onClick={() => onEditarConsulta?.(consultaSelecionada)}
                className="bg-gray-500 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-gray-600 transition-colors"
              >
                Editar
              </button>
            )}

          <button
            onClick={() => setConsultaSelecionada(null)}
            className="bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-gray-300 transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    );
  };

  // Renderizar painel de filtros
  const renderFiltros = () => {
    if (!mostrarFiltros) return null;

    return (
      <div className="bg-gray-50 border-b border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Filtro por status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option value="">Todos</option>
              <option value="agendada">Agendada</option>
              <option value="confirmada">Confirmada</option>
              <option value="concluida">Concluída</option>
              <option value="cancelada">Cancelada</option>
              {ehMinhaAgenda && <option value="rejeitada">Rejeitada</option>}
            </select>
          </div>

          {/* Filtro por tipo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo
            </label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option value="">Todos</option>
              <option value="online">Online</option>
              <option value="presencial">Presencial</option>
              <option value="telefone">Telefone</option>
            </select>
          </div>

          {/* Filtro por período */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Período
            </label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option value="">Todos</option>
              <option value="hoje">Hoje</option>
              <option value="semana">Esta semana</option>
              <option value="mes">Este mês</option>
            </select>
          </div>

          {/* Busca */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Buscar
            </label>
            <input
              type="text"
              placeholder={
                ehMinhaAgenda ? "Nome do paciente..." : "Buscar consultas..."
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>
    );
  };

  // Modal de agendamento (quando comporta como paciente)
  const renderModalAgendamento = () => {
    if (!modalAgendamento.aberto || !permissoes.podeSolicitarConsulta)
      return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {tipoUsuario === "profissional"
              ? "Agendar como Paciente"
              : "Agendar Consulta"}
          </h3>

          {/* Informações da consulta */}
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <p className="text-sm text-gray-600 mb-1">Data e horário</p>
            <p className="font-medium text-gray-900">
              {modalAgendamento.data?.toLocaleDateString("pt-BR", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}{" "}
              às {modalAgendamento.horario}
            </p>

            <p className="text-sm text-gray-600 mt-2 mb-1">
              {tipoUsuario === "profissional"
                ? "Solicitando consulta com"
                : "Profissional"}
            </p>
            <p className="font-medium text-gray-900">
              {profissionalInfo
                ? `${profissionalInfo.nome} ${profissionalInfo.sobrenome}`
                : "Profissional"}
            </p>

            {profissionalInfo?.valor_sessao && (
              <>
                <p className="text-sm text-gray-600 mt-2 mb-1">Valor</p>
                <p className="font-medium text-gray-900">
                  R${" "}
                  {profissionalInfo.valor_sessao.toFixed(2).replace(".", ",")}
                </p>
              </>
            )}
          </div>

          {/* Formulário de agendamento */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              handleConfirmarAgendamento({
                tipo: formData.get("tipo") as
                  | "online"
                  | "presencial"
                  | "telefone",
                observacoes: formData.get("observacoes") as string,
              });
            }}
            className="space-y-4"
          >
            {/* Tipo de consulta */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de consulta
              </label>
              <select
                name="tipo"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Selecione o tipo</option>
                <option value="online">Online (Videochamada)</option>
                <option value="presencial">Presencial</option>
                <option value="telefone">Telefone</option>
              </select>
            </div>

            {/* Observações */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Observações (opcional)
              </label>
              <textarea
                name="observacoes"
                rows={3}
                placeholder={
                  tipoUsuario === "profissional"
                    ? "Motivo da consulta como paciente..."
                    : "Conte um pouco sobre o que gostaria de trabalhar na consulta..."
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>

            {/* Aviso */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-sm text-yellow-800">
                <strong>Importante:</strong> Esta é uma solicitação de consulta.
                O profissional precisará confirmar sua disponibilidade. Você
                receberá uma notificação com a resposta.
              </p>
            </div>

            {/* Botões */}
            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setModalAgendamento({ aberto: false })}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Solicitar Consulta
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div
      className={`bg-white rounded-xl border border-gray-200 shadow-sm ${altura} ${className}`}
    >
      {renderCabecalho()}
      {renderFiltros()}

      <div className="flex-1 overflow-hidden">
        <div className="flex h-full">
          {/* Área principal do calendário */}
          <div className="flex-1 overflow-auto">
            {/* Debug - indicador do modo atual */}
            <div className="p-2 bg-yellow-100 text-yellow-800 text-xs font-mono">
              DEBUG: Modo atual = {modoVisualizacao}
            </div>

            {modoVisualizacao === "mes" && renderCalendarioMensal()}
            {modoVisualizacao === "semana" && renderCalendarioSemanal()}
            {modoVisualizacao === "lista" && renderVisualizacaoLista()}
          </div>

          {/* Painel lateral com detalhes da consulta */}
          {consultaSelecionada && (
            <div className="w-80 border-l border-gray-200 overflow-auto">
              {renderDetalhesConsulta()}
            </div>
          )}
        </div>
      </div>

      {/* Indicadores na parte inferior */}
      {ehMinhaAgenda &&
        estatisticas?.consultas_pendentes_confirmacao &&
        estatisticas.consultas_pendentes_confirmacao > 0 && (
          <div className="bg-yellow-50 border-t border-yellow-200 p-3">
            <div className="flex items-center space-x-2 text-yellow-800">
              <ExclamationTriangleIcon className="w-5 h-5" />
              <span className="text-sm font-medium">
                Você tem {estatisticas.consultas_pendentes_confirmacao}{" "}
                consulta(s) aguardando confirmação
              </span>
            </div>
          </div>
        )}

      {/* Modal de agendamento */}
      {renderModalAgendamento()}
    </div>
  );
}
