// src/components/dashboard/patient/agenda/PatientAgenda.tsx
// Container principal para agendamento - VERSÃO CORRIGIDA

"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useHorariosDisponiveis } from "@/hooks/dashboard/useHorariosDisponiveis";
import { apiClient } from "@/utils/api-client";
import {
  validarDataAgendamento,
  gerarSlotsDisponiveis,
  formatarSlotHorario,
  REGRAS_AGENDAMENTO,
} from "@/utils/agendamento/validacoes";
import AgendaCalendar from "../../common/agenda/AgendaCalendar";
import PatientAgendaHeader from "./PatientAgendaHeader";
import AgendaControlsLimited from "./AgendaControlsLimited";
import type {
  Consulta,
  ModoVisualizacao,
  TipoConsulta,
  HorarioDisponivel,
} from "@/types/agenda";

interface PatientAgendaProps {
  tipoUsuario: "paciente" | "profissional";
  usuarioId: string;
  profissionalId: string;
  profissionalInfo: {
    nome: string;
    sobrenome: string;
    especialidades: string;
    foto_perfil_url?: string;
    valor_sessao?: number;
    crp?: string;
    verificado?: boolean;
  };
  className?: string;
}

interface ModalAgendamento {
  aberto: boolean;
  data?: Date;
  horario?: Date;
  tipo?: TipoConsulta;
}

export default function PatientAgenda({
  tipoUsuario,
  usuarioId,
  profissionalId,
  profissionalInfo,
  className = "",
}: PatientAgendaProps) {
  // Hook de autenticação
  const { user } = useAuth();

  // Estados principais
  const [dataAtual, setDataAtual] = useState(new Date());
  const [modoVisualizacao, setModoVisualizacao] =
    useState<ModoVisualizacao>("semana");
  const [modalAgendamento, setModalAgendamento] = useState<ModalAgendamento>({
    aberto: false,
  });
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState<{
    tipo: "sucesso" | "erro" | "aviso";
    texto: string;
  } | null>(null);

  // Estados de dados
  const [consultas, setConsultas] = useState<Consulta[]>([]);
  const [carregando, setCarregando] = useState(false);

  // Hook para horários configurados do profissional
  const {
    configuracao: horariosConfigurados,
    loading: loadingHorarios,
    temHorariosConfigurados,
  } = useHorariosDisponiveis(profissionalId);

  // Converter configuração para array de HorarioDisponivel
  const horariosDisponiveis: HorarioDisponivel[] = useMemo(() => {
    return Object.entries(horariosConfigurados)
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
  }, [horariosConfigurados, profissionalId]);

  // Carregar consultas existentes
  const carregarConsultas = useCallback(async () => {
    setCarregando(true);
    try {
      const response = await apiClient.get(
        `/api/consultas/profissional/${profissionalId}`
      );
      setConsultas(response.consultas || []);
    } catch (error) {
      console.error("Erro ao carregar consultas:", error);
    } finally {
      setCarregando(false);
    }
  }, [profissionalId]);

  // Carregar dados iniciais
  useEffect(() => {
    if (profissionalId) {
      carregarConsultas();
    }
  }, [profissionalId, carregarConsultas]);

  // Handler para clique em dia
  const handleDiaClick = useCallback(
    (data: Date) => {
      if (!temHorariosConfigurados()) {
        setMensagem({
          tipo: "aviso",
          texto: "Este profissional ainda não configurou horários disponíveis.",
        });
        return;
      }

      // Resetar mensagens anteriores
      setMensagem(null);

      // Validar a data
      const validacao = validarDataAgendamento(data);
      if (!validacao.valido) {
        setMensagem({
          tipo: "erro",
          texto: validacao.erros[0],
        });
        return;
      }

      // Gerar slots para o dia selecionado
      const slots = gerarSlotsDisponiveis(
        data,
        horariosDisponiveis,
        consultas,
        REGRAS_AGENDAMENTO.duracaoConsultaPadrao
      );

      if (slots.length === 0) {
        setMensagem({
          tipo: "aviso",
          texto: "Não há horários disponíveis nesta data.",
        });
        return;
      }

      // Selecionar primeiro horário disponível como padrão
      const primeiroSlot = slots[0];

      setModalAgendamento({
        aberto: true,
        data: data,
        horario: primeiroSlot,
        tipo: "online",
      });

      // Mostrar avisos se houver
      if (validacao.avisos.length > 0) {
        setMensagem({
          tipo: "aviso",
          texto: validacao.avisos[0],
        });
      }
    },
    [temHorariosConfigurados, horariosDisponiveis, consultas]
  );

  // Handler para clique em horário (para visão semanal)
  const handleHorarioClick = useCallback((data: Date, horario: string) => {
    const [hora, minuto] = horario.split(":").map(Number);
    const dataCompleta = new Date(data);
    dataCompleta.setHours(hora, minuto, 0, 0);

    // Validar se o horário é válido
    const validacao = validarDataAgendamento(dataCompleta);
    if (!validacao.valido) {
      setMensagem({
        tipo: "erro",
        texto: validacao.erros[0],
      });
      return;
    }

    setModalAgendamento({
      aberto: true,
      data: data,
      horario: dataCompleta,
      tipo: "online",
    });
  }, []);

  // Handler para confirmar agendamento
  const handleConfirmarAgendamento = async () => {
    if (!modalAgendamento.horario) {
      setMensagem({
        tipo: "erro",
        texto: "Por favor, selecione um horário.",
      });
      return;
    }

    setSalvando(true);
    setMensagem(null);

    try {
      // Calcular horário de fim baseado na duração
      const dataInicio = new Date(modalAgendamento.horario);
      const dataFim = new Date(modalAgendamento.horario);
      dataFim.setMinutes(
        dataFim.getMinutes() + REGRAS_AGENDAMENTO.duracaoConsultaPadrao
      );

      // Preparar dados da consulta
      const dadosConsulta = {
        titulo: `Consulta com ${profissionalInfo.nome} ${profissionalInfo.sobrenome}`,
        descricao: "Consulta Online",
        data_inicio: dataInicio.toISOString(),
        data_fim: dataFim.toISOString(),
        tipo: "online" as TipoConsulta,
        profissional_id: profissionalId,
        paciente_id: usuarioId,
        valor: profissionalInfo.valor_sessao,
      };

      console.log("📅 Enviando agendamento:", dadosConsulta);

      // Fazer requisição
      const response = await apiClient.post("/api/consultas", dadosConsulta);

      // Sucesso
      setMensagem({
        tipo: "sucesso",
        texto:
          "Consulta agendada com sucesso! Aguarde a confirmação do profissional.",
      });

      // Recarregar consultas
      await carregarConsultas();

      // Fechar modal após 2 segundos
      setTimeout(() => {
        setModalAgendamento({ aberto: false });
        setMensagem(null);
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

  // Gerar slots para o modal
  const slotsDisponiveis = useMemo(() => {
    if (!modalAgendamento.data) return [];

    return gerarSlotsDisponiveis(
      modalAgendamento.data,
      horariosDisponiveis,
      consultas,
      REGRAS_AGENDAMENTO.duracaoConsultaPadrao
    );
  }, [modalAgendamento.data, horariosDisponiveis, consultas]);

  return (
    <div className={`space-y-6 ${className}`}>
      <PatientAgendaHeader
        profissionalInfo={profissionalInfo}
        temHorariosConfigurados={temHorariosConfigurados()}
        tipoUsuario={tipoUsuario}
        loadingHorarios={loadingHorarios}
      />

      {/* Wrapper customizado para a agenda com controles limitados */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Controles limitados */}
        <div className="border-b border-gray-200">
          <AgendaControlsLimited
            dataAtual={dataAtual}
            modoVisualizacao={modoVisualizacao}
            carregando={carregando}
            onNavigateData={setDataAtual}
            onChangeModoVisualizacao={(modo) => {
              if (modo === "semana" || modo === "lista") {
                setModoVisualizacao(modo);
              }
            }}
          />
        </div>

        {/* Calendário sem os controles padrão */}
        <div style={{ marginTop: "-1px" }}>
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
            onHorarioClick={handleHorarioClick}
            onConsultaClick={(consulta) => {
              console.log("Consulta clicada:", consulta);
              // TODO: Mostrar detalhes da consulta
            }}
            onNavigateData={setDataAtual}
            onChangeModoVisualizacao={(modo) => {
              if (modo === "semana" || modo === "lista") {
                setModoVisualizacao(modo);
              }
            }}
            className=""
          />
        </div>
      </div>

      {/* Modal de Agendamento */}
      {modalAgendamento.aberto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Confirmar Agendamento
            </h3>

            {mensagem && (
              <div
                className={`mb-4 p-4 rounded-lg ${
                  mensagem.tipo === "sucesso"
                    ? "bg-green-50 border border-green-200 text-green-800"
                    : mensagem.tipo === "erro"
                    ? "bg-red-50 border border-red-200 text-red-800"
                    : "bg-amber-50 border border-amber-200 text-amber-800"
                }`}
              >
                <div className="flex items-center">
                  <span className="mr-2">
                    {mensagem.tipo === "sucesso"
                      ? "✓"
                      : mensagem.tipo === "erro"
                      ? "✗"
                      : "⚠"}
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
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-gray-600 font-medium">
                        {profissionalInfo.nome[0]}
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
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="font-medium text-gray-900">
                    {modalAgendamento.data?.toLocaleDateString("pt-BR", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>

                  {/* Seletor de horários */}
                  {slotsDisponiveis.length > 0 && (
                    <div className="mt-3">
                      <label className="block text-xs font-medium text-gray-600 mb-2">
                        Escolha o horário:
                      </label>
                      <select
                        value={modalAgendamento.horario?.toISOString() || ""}
                        onChange={(e) => {
                          const novoHorario = new Date(e.target.value);
                          setModalAgendamento((prev) => ({
                            ...prev,
                            horario: novoHorario,
                          }));
                        }}
                        className="w-full p-2 border border-gray-300 rounded-md text-sm"
                      >
                        {slotsDisponiveis.map((slot, index) => (
                          <option key={index} value={slot.toISOString()}>
                            {formatarSlotHorario(slot)}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              </div>

              {/* Tipo de consulta - sempre online */}
              <div className="border-t pt-3">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <svg
                    className="w-5 h-5 text-blue-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                  <span className="font-medium">Consulta Online</span>
                </div>
              </div>

              {/* Valor */}
              {profissionalInfo.valor_sessao && (
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">
                      Valor da consulta:
                    </span>
                    <span className="text-lg font-bold text-gray-900">
                      R${" "}
                      {profissionalInfo.valor_sessao
                        .toFixed(2)
                        .replace(".", ",")}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Botões */}
            <div className="flex space-x-3">
              <button
                onClick={() => setModalAgendamento({ aberto: false })}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmarAgendamento}
                disabled={salvando}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                  salvando
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                {salvando ? "Agendando..." : "Confirmar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
