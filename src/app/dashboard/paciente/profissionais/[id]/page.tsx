// src/app/dashboard/paciente/profissionais/[id]/page.tsx
// 🎯 DETALHES DO PROFISSIONAL + AGENDAMENTO INTEGRADO

"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { PatientLayout } from "@/components/dashboard/patient/layout";
import {
  StarIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  ClockIcon,
  CheckCircleIcon,
  CalendarDaysIcon,
  UserIcon,
  AcademicCapIcon,
  ChartBarIcon,
  ArrowLeftIcon,
  VideoCameraIcon,
  BuildingOfficeIcon,
} from "@heroicons/react/24/outline";
import {
  StarIcon as StarSolid,
  CheckCircleIcon as CheckSolid,
} from "@heroicons/react/24/solid";
import Link from "next/link";

interface ProfissionalDetalhado {
  id: string;
  nome: string;
  sobrenome: string;
  especialidades: string;
  bio_profissional: string;
  foto_perfil_url?: string;
  valor_sessao: number;
  experiencia_anos: number;
  tipo: string;
  crp?: string;
  verificado: boolean;
  endereco_cidade: string;
  endereco_estado: string;
  formacao_principal: string;
  abordagem_terapeutica: string;
  rating: number;
  consultas_realizadas: number;
  consultas_este_ano: number;
  horarios_por_dia: Record<number, Array<{ inicio: string; fim: string }>>;
  proximos_horarios_disponiveis: Array<{
    data: string;
    dia_semana: number;
    hora_inicio: string;
    hora_fim: string;
    disponivel: boolean;
  }>;
}

interface ModalAgendamento {
  aberto: boolean;
  data?: string;
  horario?: string;
}

export default function ProfissionalDetalhePage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();

  const [profissional, setProfissional] =
    useState<ProfissionalDetalhado | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [modalAgendamento, setModalAgendamento] = useState<ModalAgendamento>({
    aberto: false,
  });
  const [agendandoConsulta, setAgendandoConsulta] = useState(false);

  const profissionalId = params.id as string;
  const diasSemana = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  // Carregar detalhes do profissional
  useEffect(() => {
    const carregarProfissional = async () => {
      if (!user || !profissionalId) return;

      try {
        setCarregando(true);
        setErro(null);

        const response = await fetch(`/api/profissionais/${profissionalId}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Erro ao carregar profissional");
        }

        setProfissional(data.profissional);
      } catch (error: any) {
        console.error("Erro ao carregar profissional:", error);
        setErro(error.message);
      } finally {
        setCarregando(false);
      }
    };

    carregarProfissional();
  }, [user, profissionalId]);

  // Agendar consulta
  const handleAgendar = async (data: string, horarioInicio: string) => {
    if (!user || !profissional) return;

    setAgendandoConsulta(true);

    try {
      const dataHorarioCompleto = `${data}T${horarioInicio}:00.000Z`;

      const response = await fetch("/api/consultas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          profissional_id: profissional.id,
          data_inicio: dataHorarioCompleto,
          duracao_minutos: 50,
          tipo: "online", // Por padrão online, pode ser alterado depois
          observacoes_paciente: "",
        }),
      });

      const resultado = await response.json();

      if (!response.ok) {
        throw new Error(resultado.error || "Erro ao agendar consulta");
      }

      // Sucesso - redirecionar para minhas consultas
      alert(
        "✅ Consulta agendada com sucesso! O profissional receberá sua solicitação."
      );
      router.push("/dashboard/paciente/consultas");
    } catch (error: any) {
      console.error("Erro ao agendar:", error);
      alert(`❌ ${error.message}`);
    } finally {
      setAgendandoConsulta(false);
      setModalAgendamento({ aberto: false });
    }
  };

  // Formatadores
  const formatarValor = (valor: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(valor);
  };

  const formatarData = (dataString: string) => {
    const data = new Date(dataString);
    return data.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const renderEstrelas = (rating: number) => {
    const estrelas = [];
    const estrelasCompletas = Math.floor(rating);
    const temMeiaEstrela = rating % 1 !== 0;

    for (let i = 0; i < 5; i++) {
      if (i < estrelasCompletas) {
        estrelas.push(
          <StarSolid key={i} className="w-5 h-5 text-yellow-400" />
        );
      } else if (i === estrelasCompletas && temMeiaEstrela) {
        estrelas.push(
          <div key={i} className="relative w-5 h-5">
            <StarIcon className="w-5 h-5 text-gray-300 absolute" />
            <div className="overflow-hidden w-1/2">
              <StarSolid className="w-5 h-5 text-yellow-400" />
            </div>
          </div>
        );
      } else {
        estrelas.push(<StarIcon key={i} className="w-5 h-5 text-gray-300" />);
      }
    }
    return estrelas;
  };

  const obterIniciais = (nome: string, sobrenome: string) => {
    return `${nome[0]}${sobrenome[0]}`.toUpperCase();
  };

  // Loading state
  if (carregando) {
    return (
      <PatientLayout>
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-8">
            <div className="animate-pulse space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-24 h-24 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </PatientLayout>
    );
  }

  // Error state
  if (erro || !profissional) {
    return (
      <PatientLayout>
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
          <div className="text-red-500 text-lg mb-2">Erro ao carregar</div>
          <p className="text-gray-600 mb-4">
            {erro || "Profissional não encontrado"}
          </p>
          <Link
            href="/dashboard/paciente/profissionais"
            className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Voltar para lista
          </Link>
        </div>
      </PatientLayout>
    );
  }

  return (
    <PatientLayout>
      <div className="space-y-6">
        {/* Botão Voltar */}
        <Link
          href="/dashboard/paciente/profissionais"
          className="inline-flex items-center text-blue-600 hover:text-blue-700"
        >
          <ArrowLeftIcon className="w-4 h-4 mr-2" />
          Voltar para profissionais
        </Link>

        {/* Header do Profissional */}
        <div className="bg-white rounded-xl border border-gray-200 p-8">
          <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6 mb-6">
            {/* Foto */}
            <div className="relative flex-shrink-0">
              {profissional.foto_perfil_url ? (
                <img
                  src={profissional.foto_perfil_url}
                  alt={`${profissional.nome} ${profissional.sobrenome}`}
                  className="w-24 h-24 rounded-full object-cover"
                />
              ) : (
                <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-700 font-semibold text-2xl">
                    {obterIniciais(profissional.nome, profissional.sobrenome)}
                  </span>
                </div>
              )}

              {profissional.verificado && (
                <CheckSolid className="absolute -bottom-2 -right-2 w-8 h-8 text-blue-500 bg-white rounded-full" />
              )}
            </div>

            {/* Informações Principais */}
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">
                  {profissional.nome} {profissional.sobrenome}
                </h1>
                {profissional.verificado && (
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                    Verificado
                  </span>
                )}
              </div>

              <p className="text-lg text-gray-600 mb-3">
                {profissional.especialidades}
              </p>

              {/* Rating */}
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex items-center space-x-2">
                  <div className="flex items-center">
                    {renderEstrelas(profissional.rating)}
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {profissional.rating}
                  </span>
                  <span className="text-sm text-gray-500">
                    ({profissional.consultas_realizadas} avaliações)
                  </span>
                </div>
              </div>

              {/* Badges */}
              <div className="flex flex-wrap gap-2">
                <div className="flex items-center px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-sm">
                  <ClockIcon className="w-4 h-4 mr-1" />
                  {profissional.experiencia_anos} anos de experiência
                </div>

                <div className="flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                  <MapPinIcon className="w-4 h-4 mr-1" />
                  {profissional.endereco_cidade}, {profissional.endereco_estado}
                </div>

                {profissional.crp && (
                  <div className="flex items-center px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                    <AcademicCapIcon className="w-4 h-4 mr-1" />
                    CRP {profissional.crp}
                  </div>
                )}
              </div>
            </div>

            {/* Valor e CTA */}
            <div className="flex-shrink-0 text-center">
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {formatarValor(profissional.valor_sessao)}
              </div>
              <p className="text-sm text-gray-500 mb-4">por sessão (50 min)</p>

              <button
                onClick={() => setModalAgendamento({ aberto: true })}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Agendar Consulta
              </button>
            </div>
          </div>

          {/* Estatísticas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-gray-200">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {profissional.consultas_realizadas}
              </div>
              <div className="text-sm text-gray-600">Consultas Realizadas</div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {profissional.consultas_este_ano}
              </div>
              <div className="text-sm text-gray-600">Este Ano</div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {Object.keys(profissional.horarios_por_dia).length}
              </div>
              <div className="text-sm text-gray-600">Dias Disponíveis</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Coluna Principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Sobre */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Sobre
              </h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {profissional.bio_profissional ||
                  "Profissional dedicado ao seu bem-estar."}
              </p>
            </div>

            {/* Formação e Abordagem */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Formação e Abordagem
              </h2>

              <div className="space-y-4">
                {profissional.formacao_principal && (
                  <div>
                    <h3 className="flex items-center text-sm font-medium text-gray-700 mb-2">
                      <AcademicCapIcon className="w-4 h-4 mr-2" />
                      Formação Principal
                    </h3>
                    <p className="text-gray-900">
                      {profissional.formacao_principal}
                    </p>
                  </div>
                )}

                {profissional.abordagem_terapeutica && (
                  <div>
                    <h3 className="flex items-center text-sm font-medium text-gray-700 mb-2">
                      <ChartBarIcon className="w-4 h-4 mr-2" />
                      Abordagem Terapêutica
                    </h3>
                    <p className="text-gray-900">
                      {profissional.abordagem_terapeutica}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Horários de Atendimento */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Horários de Atendimento
              </h2>

              <div className="space-y-3">
                {diasSemana.map((dia, index) => {
                  const horarios = profissional.horarios_por_dia[index];

                  return (
                    <div
                      key={index}
                      className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                    >
                      <span className="font-medium text-gray-700">{dia}</span>
                      {horarios && horarios.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {horarios.map((horario, idx) => (
                            <span
                              key={idx}
                              className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded"
                            >
                              {horario.inicio} - {horario.fim}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">
                          Indisponível
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Sidebar - Próximos Horários */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6 sticky top-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Próximos Horários
              </h3>

              {profissional.proximos_horarios_disponiveis.length > 0 ? (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {profissional.proximos_horarios_disponiveis
                    .slice(0, 10)
                    .map((horario, index) => (
                      <button
                        key={index}
                        onClick={() =>
                          setModalAgendamento({
                            aberto: true,
                            data: horario.data,
                            horario: horario.hora_inicio,
                          })
                        }
                        className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors text-left"
                      >
                        <div>
                          <div className="font-medium text-gray-900">
                            {formatarData(horario.data)}
                          </div>
                          <div className="text-sm text-gray-600">
                            {diasSemana[horario.dia_semana]}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium text-blue-600">
                            {horario.hora_inicio}
                          </div>
                          <div className="text-xs text-gray-500">50 min</div>
                        </div>
                      </button>
                    ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <CalendarDaysIcon className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">Sem horários disponíveis no momento</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Agendamento */}
      {modalAgendamento.aberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Confirmar Agendamento
            </h3>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Profissional
                </label>
                <p className="text-gray-900">
                  {profissional.nome} {profissional.sobrenome}
                </p>
              </div>

              {modalAgendamento.data && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data e Horário
                  </label>
                  <p className="text-gray-900">
                    {formatarData(modalAgendamento.data)} às{" "}
                    {modalAgendamento.horario}
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Valor
                </label>
                <p className="text-gray-900 font-semibold">
                  {formatarValor(profissional.valor_sessao)}
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-2">
                  <VideoCameraIcon className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">Consulta Online</p>
                    <p>
                      Você receberá o link da videochamada após a confirmação do
                      profissional.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setModalAgendamento({ aberto: false })}
                disabled={agendandoConsulta}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={() =>
                  handleAgendar(
                    modalAgendamento.data || "",
                    modalAgendamento.horario || ""
                  )
                }
                disabled={agendandoConsulta}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {agendandoConsulta ? "Agendando..." : "Confirmar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </PatientLayout>
  );
}
