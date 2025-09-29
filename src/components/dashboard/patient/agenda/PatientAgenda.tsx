// src/components/dashboard/patient/agenda/PatientAgenda.tsx
// VERSÃO INTEGRADA - Modal funcional com API

"use client";

import { useState } from "react";
import { useHorariosDisponiveis } from "@/hooks/dashboard/useHorariosDisponiveis";
import AgendaCalendar from "../../common/agenda/AgendaCalendar";
import PatientAgendaHeader from "./PatientAgendaHeader";
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

interface PatientAgendaProps {
  profissionalId: string;
  profissionalInfo: ProfissionalInfo;
  usuarioId: string;
  tipoUsuario: "paciente" | "profissional";
  className?: string;
}

export default function PatientAgenda({
  profissionalId,
  profissionalInfo,
  usuarioId,
  tipoUsuario,
  className = "",
}: PatientAgendaProps) {
  // Estados locais
  const [dataAtual, setDataAtual] = useState(new Date());
  const [modoVisualizacao, setModoVisualizacao] =
    useState<ModoVisualizacao>("mes");
  const [modalAgendamento, setModalAgendamento] = useState<{
    aberto: boolean;
    data?: Date;
    horario?: string;
  }>({ aberto: false });
  const [tipoConsulta, setTipoConsulta] = useState<"online" | "presencial">(
    "online"
  );
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState<{
    tipo: "sucesso" | "erro";
    texto: string;
  } | null>(null);

  // Hook para horários disponíveis do profissional
  const {
    configuracao: horariosConfigurados,
    loading: loadingHorarios,
    temHorariosConfigurados,
  } = useHorariosDisponiveis(profissionalId);

  // TODO: Carregar consultas reais
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

  // Handlers
  const handleDiaClick = (data: Date) => {
    const diaSemana = data.getDay();
    const temHorario = horariosConfigurados[diaSemana]?.ativo;

    if (temHorario) {
      console.log("Dia com horários disponíveis:", data);
    }
  };

  const handleHorarioClick = (data: Date, horario: string) => {
    setModalAgendamento({
      aberto: true,
      data,
      horario,
    });
  };

  const handleConsultaClick = (consulta: Consulta) => {
    console.log("Consulta clicada:", consulta);
  };

  // 🔥 FUNÇÃO PRINCIPAL - Criar consulta
  const handleSolicitarAgendamento = async (data: Date, horario: string) => {
    setSalvando(true);
    setMensagem(null);

    try {
      // Calcular data_fim (1 hora depois do início)
      const dataInicio = new Date(data);
      const [horas, minutos] = horario.split(":");
      dataInicio.setHours(parseInt(horas), parseInt(minutos), 0, 0);

      const dataFim = new Date(dataInicio);
      dataFim.setHours(dataFim.getHours() + 1);

      const response = await fetch("/api/consultas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          profissional_id: profissionalId,
          data_inicio: dataInicio.toISOString(),
          data_fim: dataFim.toISOString(),
          tipo: tipoConsulta,
          titulo: `Consulta com ${profissionalInfo.nome} ${profissionalInfo.sobrenome}`,
          descricao: `Consulta ${tipoConsulta} agendada via plataforma`,
        }),
      });

      const resultado = await response.json();

      if (!response.ok) {
        throw new Error(resultado.error || "Erro ao agendar consulta");
      }

      // Sucesso!
      setMensagem({
        tipo: "sucesso",
        texto: resultado.message || "Consulta solicitada com sucesso!",
      });

      // Fechar modal após 2 segundos
      setTimeout(() => {
        setModalAgendamento({ aberto: false });
        setMensagem(null);

        // TODO: Recarregar consultas
        // router.push('/dashboard/paciente/consultas')
      }, 2000);
    } catch (error: any) {
      console.error("Erro ao solicitar agendamento:", error);
      setMensagem({
        tipo: "erro",
        texto: error.message || "Erro ao agendar consulta. Tente novamente.",
      });
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <PatientAgendaHeader
        profissionalInfo={profissionalInfo}
        temHorariosConfigurados={temHorariosConfigurados()}
        tipoUsuario={tipoUsuario}
        loadingHorarios={loadingHorarios}
      />

      {/* Calendário */}
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
          diasInativos: false,
        }}
        onDiaClick={handleDiaClick}
        onConsultaClick={handleConsultaClick}
        onHorarioClick={handleHorarioClick}
        onNavigateData={setDataAtual}
        onChangeModoVisualizacao={setModoVisualizacao}
        className="shadow-lg"
      />

      {/* Modal de confirmação */}
      {modalAgendamento.aberto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Confirmar Agendamento
            </h3>

            {/* Mensagem de feedback */}
            {mensagem && (
              <div
                className={`mb-4 p-4 rounded-lg ${
                  mensagem.tipo === "sucesso"
                    ? "bg-green-50 border border-green-200 text-green-800"
                    : "bg-red-50 border border-red-200 text-red-800"
                }`}
              >
                <div className="flex items-center">
                  <span className="mr-2">
                    {mensagem.tipo === "sucesso" ? "✓" : "⚠"}
                  </span>
                  <p className="text-sm font-medium">{mensagem.texto}</p>
                </div>
              </div>
            )}

            <div className="space-y-4 mb-6">
              {/* Profissional */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Profissional
                </label>
                <div className="flex items-center space-x-3">
                  {profissionalInfo.foto_perfil_url ? (
                    <img
                      src={profissionalInfo.foto_perfil_url}
                      alt={profissionalInfo.nome}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-bold">
                        {profissionalInfo.nome[0]}
                        {profissionalInfo.sobrenome[0]}
                      </span>
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-gray-900">
                      {profissionalInfo.nome} {profissionalInfo.sobrenome}
                    </p>
                    <p className="text-sm text-gray-600">
                      {profissionalInfo.especialidades}
                    </p>
                  </div>
                </div>
              </div>

              {/* Data e Horário */}
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
                <p className="text-sm text-gray-500 mt-1">Duração: 1 hora</p>
              </div>

              {/* Tipo de Consulta */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Consulta
                </label>
                <div className="flex space-x-3">
                  <button
                    onClick={() => setTipoConsulta("online")}
                    className={`flex-1 px-4 py-3 rounded-lg border-2 transition-all ${
                      tipoConsulta === "online"
                        ? "border-blue-600 bg-blue-50 text-blue-900"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-1">💻</div>
                      <div className="font-medium">Online</div>
                    </div>
                  </button>
                  <button
                    onClick={() => setTipoConsulta("presencial")}
                    className={`flex-1 px-4 py-3 rounded-lg border-2 transition-all ${
                      tipoConsulta === "presencial"
                        ? "border-blue-600 bg-blue-50 text-blue-900"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-1">🏢</div>
                      <div className="font-medium">Presencial</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Valor */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Valor da Sessão
                </label>
                <p className="text-2xl font-bold text-gray-900">
                  {profissionalInfo.valor_sessao
                    ? `R$ ${profissionalInfo.valor_sessao.toLocaleString(
                        "pt-BR",
                        {
                          minimumFractionDigits: 2,
                        }
                      )}`
                    : "A combinar"}
                </p>
              </div>
            </div>

            {/* Botões */}
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setModalAgendamento({ aberto: false });
                  setMensagem(null);
                }}
                disabled={salvando}
                className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
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
                disabled={salvando}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 flex items-center justify-center"
              >
                {salvando ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Agendando...
                  </>
                ) : (
                  "Confirmar Agendamento"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
//aa
