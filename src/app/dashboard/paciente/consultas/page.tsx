// src/app/dashboard/paciente/consultas/page.tsx
// 🎯 MINHAS CONSULTAS - Visão do Paciente

"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase/client";
import { PatientLayout } from "@/components/dashboard/patient/layout";
import {
  CalendarDaysIcon,
  ClockIcon,
  VideoCameraIcon,
  MapPinIcon,
  XMarkIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  StarIcon,
  PhoneIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";

interface Consulta {
  id: string;
  profissional_id: string;
  data_inicio: string;
  data_fim: string;
  duracao_minutos: number;
  tipo: "online" | "presencial";
  status: "agendada" | "confirmada" | "cancelada" | "concluida" | "rejeitada";
  valor: number;
  observacoes_paciente?: string;
  observacoes_profissional?: string;
  profissional: {
    nome: string;
    sobrenome: string;
    especialidades: string;
    foto_perfil_url?: string;
    verificado: boolean;
    telefone?: string;
  };
}

export default function ConsultasPage() {
  const { user } = useAuth();
  const [consultas, setConsultas] = useState<Consulta[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [filtroStatus, setFiltroStatus] = useState<string>("todas");
  const [consultaCancelar, setConsultaCancelar] = useState<string | null>(null);
  const [motivoCancelamento, setMotivoCancelamento] = useState("");
  const [cancelando, setCancelando] = useState(false);

  // Carregar consultas
  useEffect(() => {
    const carregarConsultas = async () => {
      if (!user) return;

      try {
        setCarregando(true);
        setErro(null);

        let query = supabase
          .from("consultas")
          .select(
            `
            *,
            profissional:perfis_profissionais!consultas_profissional_id_fkey(
              nome,
              sobrenome,
              especialidades,
              foto_perfil_url,
              verificado,
              telefone
            )
          `
          )
          .eq("paciente_id", user.id)
          .order("data_inicio", { ascending: false });

        // Aplicar filtro de status
        if (filtroStatus !== "todas") {
          query = query.eq("status", filtroStatus);
        }

        const { data, error } = await query;

        if (error) throw error;

        setConsultas(data || []);
      } catch (error: any) {
        console.error("Erro ao carregar consultas:", error);
        setErro(error.message);
      } finally {
        setCarregando(false);
      }
    };

    carregarConsultas();

    // Realtime - atualiza automaticamente
    const subscription = supabase
      .channel("minhas_consultas")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "consultas",
          filter: `paciente_id=eq.${user?.id}`,
        },
        () => {
          carregarConsultas();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user, filtroStatus]);

  // Cancelar consulta
  const handleCancelar = async () => {
    if (!consultaCancelar || !motivoCancelamento.trim()) {
      alert("Por favor, informe o motivo do cancelamento");
      return;
    }

    setCancelando(true);

    try {
      const response = await fetch(
        `/api/consultas/${consultaCancelar}/cancelar`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            motivo: motivoCancelamento,
            cancelado_por: "paciente",
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao cancelar consulta");
      }

      alert(data.message + (data.aviso ? `\n\n⚠️ ${data.aviso}` : ""));
      setConsultaCancelar(null);
      setMotivoCancelamento("");

      // Recarregar consultas
      const novasConsultas = consultas.map((c) =>
        c.id === consultaCancelar ? { ...c, status: "cancelada" as const } : c
      );
      setConsultas(novasConsultas);
    } catch (error: any) {
      console.error("Erro ao cancelar:", error);
      alert(`Erro: ${error.message}`);
    } finally {
      setCancelando(false);
    }
  };

  // Formatadores
  const formatarData = (dataString: string) => {
    const data = new Date(dataString);
    const hoje = new Date();
    const amanha = new Date();
    amanha.setDate(hoje.getDate() + 1);

    if (data.toDateString() === hoje.toDateString()) {
      return "Hoje";
    } else if (data.toDateString() === amanha.toDateString()) {
      return "Amanhã";
    } else {
      return data.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    }
  };

  const formatarHorario = (dataString: string) => {
    return new Date(dataString).toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatarValor = (valor: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(valor);
  };

  const obterIniciais = (nome: string, sobrenome: string) => {
    return `${nome[0]}${sobrenome[0]}`.toUpperCase();
  };

  const getStatusConfig = (status: string) => {
    const configs = {
      agendada: {
        cor: "bg-blue-100 text-blue-800 border-blue-200",
        icone: ClockIcon,
        texto: "Aguardando Confirmação",
      },
      confirmada: {
        cor: "bg-emerald-100 text-emerald-800 border-emerald-200",
        icone: CheckCircleIcon,
        texto: "Confirmada",
      },
      cancelada: {
        cor: "bg-gray-100 text-gray-800 border-gray-200",
        icone: XMarkIcon,
        texto: "Cancelada",
      },
      concluida: {
        cor: "bg-purple-100 text-purple-800 border-purple-200",
        icone: CheckCircleIcon,
        texto: "Concluída",
      },
      rejeitada: {
        cor: "bg-red-100 text-red-800 border-red-200",
        icone: ExclamationCircleIcon,
        texto: "Rejeitada",
      },
    };
    return configs[status as keyof typeof configs] || configs.agendada;
  };

  // Agrupar consultas por período
  const consultasPorPeriodo = {
    proximas: consultas.filter(
      (c) =>
        new Date(c.data_inicio) >= new Date() &&
        (c.status === "agendada" || c.status === "confirmada")
    ),
    passadas: consultas.filter(
      (c) =>
        new Date(c.data_inicio) < new Date() ||
        c.status === "concluida" ||
        c.status === "cancelada" ||
        c.status === "rejeitada"
    ),
  };

  return (
    <PatientLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Minhas Consultas
              </h1>
              <p className="text-gray-600">
                {consultas.length > 0
                  ? `${consultas.length} consulta${
                      consultas.length !== 1 ? "s" : ""
                    }`
                  : "Nenhuma consulta ainda"}
              </p>
            </div>

            <Link
              href="/dashboard/paciente/profissionais"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Agendar Nova Consulta
            </Link>
          </div>

          {/* Filtros */}
          <div className="flex flex-wrap gap-2">
            {[
              { value: "todas", label: "Todas" },
              { value: "agendada", label: "Aguardando" },
              { value: "confirmada", label: "Confirmadas" },
              { value: "concluida", label: "Concluídas" },
              { value: "cancelada", label: "Canceladas" },
            ].map((filtro) => (
              <button
                key={filtro.value}
                onClick={() => setFiltroStatus(filtro.value)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filtroStatus === filtro.value
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {filtro.label}
              </button>
            ))}
          </div>
        </div>

        {/* Loading */}
        {carregando ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando consultas...</p>
          </div>
        ) : erro ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <p className="text-red-600 mb-4">{erro}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Tentar Novamente
            </button>
          </div>
        ) : consultas.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <CalendarDaysIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhuma consulta encontrada
            </h3>
            <p className="text-gray-600 mb-6">
              Comece agendando sua primeira consulta com um profissional.
            </p>
            <Link
              href="/dashboard/paciente/profissionais"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Buscar Profissionais
            </Link>
          </div>
        ) : (
          <>
            {/* Próximas Consultas */}
            {consultasPorPeriodo.proximas.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Próximas Consultas ({consultasPorPeriodo.proximas.length})
                </h2>
                {consultasPorPeriodo.proximas.map((consulta) => {
                  const statusConfig = getStatusConfig(consulta.status);
                  const StatusIcon = statusConfig.icone;
                  const dataConsulta = new Date(consulta.data_inicio);
                  const podeEntrarNaSala =
                    consulta.status === "confirmada" &&
                    consulta.tipo === "online" &&
                    dataConsulta.toDateString() === new Date().toDateString();

                  return (
                    <div
                      key={consulta.id}
                      className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start space-x-4">
                          {consulta.profissional.foto_perfil_url ? (
                            <img
                              src={consulta.profissional.foto_perfil_url}
                              alt={consulta.profissional.nome}
                              className="w-14 h-14 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-blue-700 font-semibold">
                                {obterIniciais(
                                  consulta.profissional.nome,
                                  consulta.profissional.sobrenome
                                )}
                              </span>
                            </div>
                          )}

                          <div>
                            <h3 className="font-semibold text-gray-900">
                              {consulta.profissional.nome}{" "}
                              {consulta.profissional.sobrenome}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {consulta.profissional.especialidades}
                            </p>
                            {consulta.profissional.verificado && (
                              <span className="inline-flex items-center text-xs text-blue-600 mt-1">
                                <CheckCircleIcon className="w-3 h-3 mr-1" />
                                Verificado
                              </span>
                            )}
                          </div>
                        </div>

                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${statusConfig.cor}`}
                        >
                          <StatusIcon className="w-4 h-4 mr-1" />
                          {statusConfig.texto}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                        <div className="flex items-center text-gray-600">
                          <CalendarDaysIcon className="w-4 h-4 mr-2" />
                          {formatarData(consulta.data_inicio)}
                        </div>
                        <div className="flex items-center text-gray-600">
                          <ClockIcon className="w-4 h-4 mr-2" />
                          {formatarHorario(consulta.data_inicio)}
                        </div>
                        <div className="flex items-center text-gray-600">
                          {consulta.tipo === "online" ? (
                            <VideoCameraIcon className="w-4 h-4 mr-2" />
                          ) : (
                            <MapPinIcon className="w-4 h-4 mr-2" />
                          )}
                          {consulta.tipo === "online" ? "Online" : "Presencial"}
                        </div>
                        <div className="text-gray-900 font-medium">
                          {formatarValor(consulta.valor)}
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div className="flex space-x-3">
                          <Link
                            href={`/dashboard/paciente/profissionais/${consulta.profissional_id}`}
                            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                          >
                            Ver Perfil
                          </Link>

                          {consulta.profissional.telefone && (
                            <a
                              href={`tel:${consulta.profissional.telefone}`}
                              className="flex items-center text-gray-600 hover:text-gray-700 text-sm font-medium"
                            >
                              <PhoneIcon className="w-4 h-4 mr-1" />
                              Contato
                            </a>
                          )}
                        </div>

                        <div className="flex space-x-3">
                          {podeEntrarNaSala && (
                            <Link
                              href={`/dashboard/consultas/${consulta.id}/sala`}
                              className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors font-medium"
                            >
                              Entrar na Sala
                            </Link>
                          )}

                          {(consulta.status === "agendada" ||
                            consulta.status === "confirmada") && (
                            <button
                              onClick={() => setConsultaCancelar(consulta.id)}
                              className="text-red-600 hover:text-red-700 text-sm font-medium"
                            >
                              Cancelar
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Consultas Passadas */}
            {consultasPorPeriodo.passadas.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Histórico ({consultasPorPeriodo.passadas.length})
                </h2>
                {consultasPorPeriodo.passadas.map((consulta) => {
                  const statusConfig = getStatusConfig(consulta.status);
                  const StatusIcon = statusConfig.icone;

                  return (
                    <div
                      key={consulta.id}
                      className="bg-white rounded-xl border border-gray-200 p-6 opacity-75"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4">
                          {consulta.profissional.foto_perfil_url ? (
                            <img
                              src={consulta.profissional.foto_perfil_url}
                              alt={consulta.profissional.nome}
                              className="w-12 h-12 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                              <span className="text-gray-600 font-semibold text-sm">
                                {obterIniciais(
                                  consulta.profissional.nome,
                                  consulta.profissional.sobrenome
                                )}
                              </span>
                            </div>
                          )}

                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900">
                              {consulta.profissional.nome}{" "}
                              {consulta.profissional.sobrenome}
                            </h3>
                            <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                              <span>{formatarData(consulta.data_inicio)}</span>
                              <span>
                                {formatarHorario(consulta.data_inicio)}
                              </span>
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded text-xs ${statusConfig.cor}`}
                              >
                                {statusConfig.texto}
                              </span>
                            </div>
                          </div>
                        </div>

                        {consulta.status === "concluida" && (
                          <button className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center">
                            <StarIcon className="w-4 h-4 mr-1" />
                            Avaliar
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal de Cancelamento */}
      {consultaCancelar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Cancelar Consulta
            </h3>

            <p className="text-gray-600 mb-4">
              Tem certeza que deseja cancelar esta consulta? Esta ação não pode
              ser desfeita.
            </p>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Motivo do cancelamento *
              </label>
              <textarea
                value={motivoCancelamento}
                onChange={(e) => setMotivoCancelamento(e.target.value)}
                placeholder="Explique brevemente o motivo..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                required
              />
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setConsultaCancelar(null);
                  setMotivoCancelamento("");
                }}
                disabled={cancelando}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Voltar
              </button>
              <button
                onClick={handleCancelar}
                disabled={cancelando || !motivoCancelamento.trim()}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {cancelando ? "Cancelando..." : "Confirmar Cancelamento"}
              </button>
            </div>
          </div>
        </div>
      )}
    </PatientLayout>
  );
}
//aa
