// src/app/dashboard/paciente/consultas/page.tsx
// 📅 Minhas Consultas - Paciente pode ver, reagendar e cancelar

"use client";
import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { PatientLayout } from "@/components/dashboard/patient/layout";
import {
  CalendarDaysIcon,
  ClockIcon,
  VideoCameraIcon,
  MapPinIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";

// ============================================================
// 📋 TIPOS
// ============================================================

interface Consulta {
  id: string;
  profissional_id: string;
  paciente_id: string;
  data_inicio: string;
  data_fim: string;
  status:
    | "agendada"
    | "confirmada"
    | "em-andamento"
    | "finalizada"
    | "cancelada";
  tipo: "online" | "presencial";
  observacoes?: string;
  valor?: number;
  profissional?: {
    id: string;
    nome: string;
    sobrenome: string;
    especialidades?: string;
    foto_perfil_url?: string;
    email?: string;
  };
}

type StatusFilter = "todas" | "proximas" | "passadas" | "canceladas";

// ============================================================
// 🎯 COMPONENTE PRINCIPAL
// ============================================================

export default function ConsultasPage() {
  const { user, profile } = useAuth();

  // Estados
  const [consultas, setConsultas] = useState<Consulta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<StatusFilter>("proximas");
  const [showModal, setShowModal] = useState(false);
  const [selectedConsulta, setSelectedConsulta] = useState<Consulta | null>(
    null
  );

  // ========== CARREGAR CONSULTAS ==========
  useEffect(() => {
    loadConsultas();
  }, [user]);

  const loadConsultas = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/consultas?tipo=paciente", {
        headers: {
          Authorization: `Bearer ${user?.id}`,
        },
      });

      if (!response.ok) {
        throw new Error("Erro ao carregar consultas");
      }

      const data = await response.json();
      setConsultas(data.consultas || []);
    } catch (err: any) {
      setError(err.message);
      console.error("Erro ao carregar consultas:", err);
    } finally {
      setLoading(false);
    }
  };

  // ========== FILTRAR CONSULTAS ==========
  const consultasFiltradas = consultas.filter((c) => {
    const agora = new Date();
    const dataConsulta = new Date(c.data_inicio);

    switch (filter) {
      case "proximas":
        return dataConsulta > agora && c.status !== "cancelada";
      case "passadas":
        return dataConsulta < agora && c.status !== "cancelada";
      case "canceladas":
        return c.status === "cancelada";
      case "todas":
      default:
        return true;
    }
  });

  // ========== CANCELAR CONSULTA ==========
  const handleCancelConsulta = async (consultaId: string) => {
    if (!confirm("Tem certeza que deseja cancelar esta consulta?")) return;

    try {
      const response = await fetch(`/api/consultas/${consultaId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${user?.id}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Erro ao cancelar consulta");
      }

      // Atualizar estado
      loadConsultas();
      setShowModal(false);
    } catch (err: any) {
      alert("Erro ao cancelar: " + err.message);
    }
  };

  // ========== REAGENDAR CONSULTA ==========
  const handleReagendarConsulta = (consulta: Consulta) => {
    // Redirecionar para página de agendamento com consulta pré-selecionada
    window.location.href = `/dashboard/paciente/consultas/${consulta.id}/reagendar`;
  };

  // ========== RENDER ==========

  return (
    <PatientLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
          <h1 className="text-3xl font-bold">Minhas Consultas</h1>
          <p className="text-blue-100 mt-2">
            Gerencie seus agendamentos com profissionais
          </p>
        </div>

        {/* Filtros */}
        <div className="flex flex-wrap gap-2">
          {(
            [
              { value: "proximas", label: "Próximas" },
              { value: "passadas", label: "Passadas" },
              { value: "canceladas", label: "Canceladas" },
              { value: "todas", label: "Todas" },
            ] as const
          ).map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-4 py-2 rounded-full font-medium transition-all ${
                filter === f.value
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-800 hover:bg-gray-300"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="text-red-800 font-medium">{error}</p>
            <button
              onClick={loadConsultas}
              className="mt-3 bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700"
            >
              Tentar novamente
            </button>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl p-6 animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-1/3 mb-2" />
                <div className="h-4 bg-gray-200 rounded w-1/4" />
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && consultasFiltradas.length === 0 && (
          <div className="bg-white rounded-xl p-12 text-center border border-gray-200">
            <CalendarDaysIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Nenhuma consulta encontrada
            </h3>
            <p className="text-gray-600 mb-6">
              {filter === "proximas"
                ? "Você ainda não tem consultas agendadas."
                : filter === "passadas"
                ? "Você ainda não tem consultas passadas."
                : "Você ainda não cancelou nenhuma consulta."}
            </p>
            {filter === "proximas" && (
              <button
                onClick={() =>
                  (window.location.href = "/dashboard/paciente/profissionais")
                }
                className="bg-blue-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-600 transition-colors"
              >
                Buscar Profissionais
              </button>
            )}
          </div>
        )}

        {/* Lista de Consultas */}
        {!loading && consultasFiltradas.length > 0 && (
          <div className="space-y-4">
            {consultasFiltradas.map((consulta) => (
              <ConsultaCard
                key={consulta.id}
                consulta={consulta}
                onDetails={() => {
                  setSelectedConsulta(consulta);
                  setShowModal(true);
                }}
                onCancel={() => handleCancelConsulta(consulta.id)}
                onReschedule={() => handleReagendarConsulta(consulta)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modal de Detalhes */}
      {showModal && selectedConsulta && (
        <ConsultaModal
          consulta={selectedConsulta}
          onClose={() => setShowModal(false)}
          onCancel={() => {
            handleCancelConsulta(selectedConsulta.id);
          }}
          onReschedule={() => {
            handleReagendarConsulta(selectedConsulta);
          }}
        />
      )}
    </PatientLayout>
  );
}

// ============================================================
// 🎴 CARD DE CONSULTA
// ============================================================

interface ConsultaCardProps {
  consulta: Consulta;
  onDetails: () => void;
  onCancel: () => void;
  onReschedule: () => void;
}

function ConsultaCard({
  consulta,
  onDetails,
  onCancel,
  onReschedule,
}: ConsultaCardProps) {
  const agora = new Date();
  const dataConsulta = new Date(consulta.data_inicio);
  const isPassed = dataConsulta < agora;

  // Cores por status
  const getStatusColor = () => {
    switch (consulta.status) {
      case "confirmada":
        return "text-green-600 bg-green-50";
      case "em-andamento":
        return "text-blue-600 bg-blue-50";
      case "finalizada":
        return "text-gray-600 bg-gray-50";
      case "cancelada":
        return "text-red-600 bg-red-50";
      case "agendada":
      default:
        return "text-yellow-600 bg-yellow-50";
    }
  };

  // Status badge
  const getStatusBadge = () => {
    const badges: Record<Consulta["status"], any> = {
      agendada: (
        <span className="flex items-center gap-1 text-xs font-semibold text-yellow-700 bg-yellow-100 px-3 py-1 rounded-full">
          <ExclamationTriangleIcon className="w-4 h-4" />
          Agendada
        </span>
      ),
      confirmada: (
        <span className="flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-100 px-3 py-1 rounded-full">
          <CheckCircleIcon className="w-4 h-4" />
          Confirmada
        </span>
      ),
      "em-andamento": (
        <span className="flex items-center gap-1 text-xs font-semibold text-blue-700 bg-blue-100 px-3 py-1 rounded-full">
          <VideoCameraIcon className="w-4 h-4" />
          Em andamento
        </span>
      ),
      finalizada: (
        <span className="flex items-center gap-1 text-xs font-semibold text-gray-700 bg-gray-100 px-3 py-1 rounded-full">
          <CheckCircleIcon className="w-4 h-4" />
          Finalizada
        </span>
      ),
      cancelada: (
        <span className="flex items-center gap-1 text-xs font-semibold text-red-700 bg-red-100 px-3 py-1 rounded-full">
          <XCircleIcon className="w-4 h-4" />
          Cancelada
        </span>
      ),
    };

    return badges[consulta.status] || badges.agendada;
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
      <div className="p-6">
        <div className="flex items-start justify-between gap-4">
          {/* Informações */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900">
                {consulta.profissional?.nome} {consulta.profissional?.sobrenome}
              </h3>
              {getStatusBadge()}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-600">
              {/* Data */}
              <div className="flex items-center gap-2">
                <CalendarDaysIcon className="w-5 h-5 text-gray-400" />
                <span>
                  {new Date(consulta.data_inicio).toLocaleDateString("pt-BR", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                  })}
                </span>
              </div>

              {/* Hora */}
              <div className="flex items-center gap-2">
                <ClockIcon className="w-5 h-5 text-gray-400" />
                <span>
                  {new Date(consulta.data_inicio).toLocaleTimeString("pt-BR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}{" "}
                  -{" "}
                  {new Date(consulta.data_fim).toLocaleTimeString("pt-BR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>

              {/* Tipo */}
              <div className="flex items-center gap-2">
                {consulta.tipo === "online" ? (
                  <>
                    <VideoCameraIcon className="w-5 h-5 text-gray-400" />
                    <span>Consulta Online</span>
                  </>
                ) : (
                  <>
                    <MapPinIcon className="w-5 h-5 text-gray-400" />
                    <span>Presencial</span>
                  </>
                )}
              </div>

              {/* Especialidade */}
              {consulta.profissional?.especialidades && (
                <div className="text-gray-600">
                  {consulta.profissional.especialidades}
                </div>
              )}
            </div>
          </div>

          {/* Botão Expandir */}
          <button
            onClick={onDetails}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
          >
            <ChevronRightIcon className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Ações */}
        {!isPassed && consulta.status !== "cancelada" && (
          <div className="mt-4 pt-4 border-t border-gray-100 flex gap-2">
            <button
              onClick={onReschedule}
              className="flex-1 px-4 py-2 bg-blue-50 text-blue-600 font-medium rounded-lg hover:bg-blue-100 transition-colors text-sm"
            >
              Reagendar
            </button>
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-2 bg-red-50 text-red-600 font-medium rounded-lg hover:bg-red-100 transition-colors text-sm"
            >
              Cancelar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// 🔍 MODAL DE DETALHES
// ============================================================

interface ConsultaModalProps {
  consulta: Consulta;
  onClose: () => void;
  onCancel: () => void;
  onReschedule: () => void;
}

function ConsultaModal({
  consulta,
  onClose,
  onCancel,
  onReschedule,
}: ConsultaModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 text-white flex items-center justify-between">
          <h2 className="text-xl font-bold">Detalhes da Consulta</h2>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Conteúdo */}
        <div className="p-6 space-y-4">
          {/* Profissional */}
          <div>
            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
              Profissional
            </p>
            <div className="flex items-center gap-3">
              {consulta.profissional?.foto_perfil_url ? (
                <img
                  src={consulta.profissional.foto_perfil_url}
                  alt={consulta.profissional?.nome}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                  {consulta.profissional?.nome?.charAt(0)}
                </div>
              )}
              <div>
                <p className="font-semibold text-gray-900">
                  {consulta.profissional?.nome}{" "}
                  {consulta.profissional?.sobrenome}
                </p>
                <p className="text-sm text-gray-600">
                  {consulta.profissional?.especialidades}
                </p>
              </div>
            </div>
          </div>

          {/* Data e Hora */}
          <div>
            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
              Data e Hora
            </p>
            <p className="text-gray-900 font-semibold">
              {new Date(consulta.data_inicio).toLocaleDateString("pt-BR", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
            <p className="text-gray-900 font-semibold">
              {new Date(consulta.data_inicio).toLocaleTimeString("pt-BR", {
                hour: "2-digit",
                minute: "2-digit",
              })}
              {" - "}
              {new Date(consulta.data_fim).toLocaleTimeString("pt-BR", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>

          {/* Tipo */}
          <div>
            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
              Tipo
            </p>
            <p className="text-gray-900 font-semibold capitalize">
              {consulta.tipo === "online" ? "Consulta Online" : "Presencial"}
            </p>
          </div>

          {/* Status */}
          <div>
            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
              Status
            </p>
            <p className="text-gray-900 font-semibold capitalize">
              {consulta.status.replace("-", " ")}
            </p>
          </div>

          {/* Observações */}
          {consulta.observacoes && (
            <div>
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                Observações
              </p>
              <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                {consulta.observacoes}
              </p>
            </div>
          )}

          {/* Botões de Ação */}
          <div className="pt-4 border-t border-gray-200 flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-100 text-gray-800 font-medium rounded-lg hover:bg-gray-200 transition-colors"
            >
              Fechar
            </button>
            <button
              onClick={onReschedule}
              className="flex-1 px-4 py-2 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 transition-colors"
            >
              Reagendar
            </button>
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-2 bg-red-500 text-white font-medium rounded-lg hover:bg-red-600 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
