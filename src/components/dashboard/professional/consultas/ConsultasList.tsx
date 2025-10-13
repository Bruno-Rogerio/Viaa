// src/components/dashboard/professional/consultas/ConsultasList.tsx
// Lista de consultas com ações para o profissional

"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import {
  CalendarIcon,
  ClockIcon,
  UserIcon,
  CheckCircleIcon,
  XCircleIcon,
  PhoneIcon,
  EnvelopeIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { formatarDataHora, formatarDuracao } from "@/utils/formatadores";
import type { Consulta, StatusConsulta } from "@/types/agenda";

interface ConsultasListProps {
  profissionalId: string;
  filtroStatus?: StatusConsulta[];
  onConsultaAtualizada?: () => void;
}

// Configuração de cores por status
const STATUS_CONFIG = {
  agendada: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
    icon: ExclamationTriangleIcon,
    label: "Pendente",
  },
  confirmada: {
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
    icon: CheckCircleIcon,
    label: "Confirmada",
  },
  rejeitada: {
    bg: "bg-red-50",
    text: "text-red-700",
    border: "border-red-200",
    icon: XCircleIcon,
    label: "Rejeitada",
  },
  cancelada: {
    bg: "bg-gray-50",
    text: "text-gray-700",
    border: "border-gray-200",
    icon: XCircleIcon,
    label: "Cancelada",
  },
  concluida: {
    bg: "bg-green-50",
    text: "text-green-700",
    border: "border-green-200",
    icon: CheckCircleIcon,
    label: "Concluída",
  },
  em_andamento: {
    bg: "bg-purple-50",
    text: "text-purple-700",
    border: "border-purple-200",
    icon: ClockIcon,
    label: "Em Andamento",
  },
  nao_compareceu: {
    bg: "bg-orange-50",
    text: "text-orange-700",
    border: "border-orange-200",
    icon: XCircleIcon,
    label: "Não Compareceu",
  },
};

export default function ConsultasList({
  profissionalId,
  filtroStatus = ["agendada", "confirmada"],
  onConsultaAtualizada,
}: ConsultasListProps) {
  const [consultas, setConsultas] = useState<Consulta[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [processando, setProcessando] = useState<string | null>(null);
  const [modalRejeitar, setModalRejeitar] = useState<{
    aberto: boolean;
    consultaId: string | null;
  }>({ aberto: false, consultaId: null });
  const [motivoRejeicao, setMotivoRejeicao] = useState("");

  // Carregar consultas
  const carregarConsultas = async () => {
    try {
      setCarregando(true);

      const { data, error } = await supabase
        .from("consultas")
        .select(
          `
          *,
          paciente:perfis_pacientes!consultas_paciente_id_fkey(
            id,
            nome,
            sobrenome,
            foto_perfil_url,
            telefone,
            email,
            data_nascimento
          )
        `
        )
        .eq("profissional_id", profissionalId)
        .in("status", filtroStatus)
        .order("data_inicio", { ascending: true });

      if (error) throw error;

      setConsultas(data || []);
    } catch (error) {
      console.error("Erro ao carregar consultas:", error);
    } finally {
      setCarregando(false);
    }
  };

  // Confirmar consulta
  const confirmarConsulta = async (consultaId: string) => {
    try {
      setProcessando(consultaId);

      const { error } = await supabase
        .from("consultas")
        .update({
          status: "confirmada",
          updated_at: new Date().toISOString(),
        })
        .eq("id", consultaId);

      if (error) throw error;

      // Atualizar lista local
      setConsultas((prev) =>
        prev.map((c) =>
          c.id === consultaId
            ? { ...c, status: "confirmada" as StatusConsulta }
            : c
        )
      );

      onConsultaAtualizada?.();

      // TODO: Enviar email de confirmação para o paciente
    } catch (error) {
      console.error("Erro ao confirmar consulta:", error);
      alert("Erro ao confirmar consulta. Tente novamente.");
    } finally {
      setProcessando(null);
    }
  };

  // Rejeitar consulta
  const rejeitarConsulta = async () => {
    if (!modalRejeitar.consultaId || !motivoRejeicao.trim()) {
      alert("Por favor, informe o motivo da rejeição.");
      return;
    }

    try {
      setProcessando(modalRejeitar.consultaId);

      const { error } = await supabase
        .from("consultas")
        .update({
          status: "rejeitada",
          observacoes: motivoRejeicao,
          updated_at: new Date().toISOString(),
        })
        .eq("id", modalRejeitar.consultaId);

      if (error) throw error;

      // Atualizar lista local
      setConsultas((prev) =>
        prev.filter((c) => c.id !== modalRejeitar.consultaId)
      );

      setModalRejeitar({ aberto: false, consultaId: null });
      setMotivoRejeicao("");
      onConsultaAtualizada?.();

      // TODO: Enviar email de rejeição para o paciente
    } catch (error) {
      console.error("Erro ao rejeitar consulta:", error);
      alert("Erro ao rejeitar consulta. Tente novamente.");
    } finally {
      setProcessando(null);
    }
  };

  useEffect(() => {
    carregarConsultas();
  }, [profissionalId, filtroStatus]);

  if (carregando) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-2">Carregando consultas...</p>
        </div>
      </div>
    );
  }

  if (consultas.length === 0) {
    return (
      <div className="text-center py-8">
        <CalendarIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-600">Nenhuma consulta encontrada</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {consultas.map((consulta) => {
          const statusConfig = STATUS_CONFIG[consulta.status];
          const StatusIcon = statusConfig.icon;

          return (
            <div
              key={consulta.id}
              className={`
                bg-white rounded-lg border-2 p-6 transition-all
                ${statusConfig.border}
                ${processando === consulta.id ? "opacity-50" : ""}
              `}
            >
              {/* Header com status */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${statusConfig.bg}`}>
                    <StatusIcon className={`w-5 h-5 ${statusConfig.text}`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {consulta.titulo}
                    </h3>
                    <span
                      className={`text-sm font-medium ${statusConfig.text}`}
                    >
                      {statusConfig.label}
                    </span>
                  </div>
                </div>

                {/* Ações rápidas */}
                {consulta.status === "agendada" && !processando && (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => confirmarConsulta(consulta.id)}
                      className="px-3 py-1.5 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Confirmar
                    </button>
                    <button
                      onClick={() =>
                        setModalRejeitar({
                          aberto: true,
                          consultaId: consulta.id,
                        })
                      }
                      className="px-3 py-1.5 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Rejeitar
                    </button>
                  </div>
                )}
              </div>

              {/* Informações da consulta */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Data e hora */}
                <div className="flex items-start space-x-3">
                  <CalendarIcon className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">Data e Hora</p>
                    <p className="font-medium text-gray-900">
                      {new Date(consulta.data_inicio).toLocaleDateString(
                        "pt-BR",
                        {
                          weekday: "long",
                          day: "numeric",
                          month: "long",
                        }
                      )}
                    </p>
                    <p className="text-sm text-gray-700">
                      {new Date(consulta.data_inicio).toLocaleTimeString(
                        "pt-BR",
                        {
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )}{" "}
                      - Duração:{" "}
                      {Math.round(
                        (new Date(consulta.data_fim).getTime() -
                          new Date(consulta.data_inicio).getTime()) /
                          60000
                      )}{" "}
                      min
                    </p>
                  </div>
                </div>

                {/* Paciente */}
                <div className="flex items-start space-x-3">
                  <UserIcon className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">Paciente</p>
                    <p className="font-medium text-gray-900">
                      {consulta.paciente?.nome} {consulta.paciente?.sobrenome}
                    </p>
                    {consulta.paciente?.telefone && (
                      <div className="flex items-center space-x-1 text-sm text-gray-600">
                        <PhoneIcon className="w-3 h-3" />
                        <span>{consulta.paciente.telefone}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Tipo de consulta */}
              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Tipo:</span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {consulta.tipo === "online" ? "Online" : "Presencial"}
                  </span>
                </div>
                {consulta.valor && (
                  <span className="text-sm font-medium text-gray-900">
                    R$ {consulta.valor.toFixed(2).replace(".", ",")}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal de rejeição */}
      {modalRejeitar.aberto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Rejeitar Consulta
            </h3>
            <p className="text-gray-600 mb-4">
              Por favor, informe o motivo da rejeição. O paciente receberá essa
              informação.
            </p>
            <textarea
              value={motivoRejeicao}
              onChange={(e) => setMotivoRejeicao(e.target.value)}
              placeholder="Motivo da rejeição..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              rows={4}
            />
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => {
                  setModalRejeitar({ aberto: false, consultaId: null });
                  setMotivoRejeicao("");
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={rejeitarConsulta}
                disabled={!motivoRejeicao.trim() || processando !== null}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                Confirmar Rejeição
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
