// src/app/dashboard/paciente/profissionais/[id]/page.tsx
// 🎯 COMPLETO COM FOLLOW INTEGRADO - SEM PERDER NADA

"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase/client";
import { PatientLayout } from "@/components/dashboard/patient/layout";
import FollowButton from "@/components/dashboard/common/FollowButton";
import FollowersModal from "@/components/dashboard/common/FollowersModal";
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
  UserGroupIcon,
} from "@heroicons/react/24/outline";
import {
  StarIcon as StarSolid,
  CheckCircleIcon as CheckSolid,
} from "@heroicons/react/24/solid";
import Link from "next/link";

interface ProfissionalDetalhado {
  id: string;
  user_id: string;
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

  // NOVO: States para Follow
  const [showFollowers, setShowFollowers] = useState(false);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [followerCount, setFollowerCount] = useState(0);

  const profissionalId = params.id as string;
  const diasSemana = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  // NOVO: Obter token
  useEffect(() => {
    const getToken = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session?.access_token) {
          setAuthToken(session.access_token);
        }
      } catch (error) {
        console.error("Erro ao obter token:", error);
      }
    };
    getToken();
  }, []);

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

  // NOVO: Buscar contagem de followers
  useEffect(() => {
    const getFollowerCount = async () => {
      try {
        const response = await fetch(
          `/api/connections/count-followers?user_id=${profissional?.user_id}`
        );
        const data = await response.json();
        if (data.success) {
          setFollowerCount(data.follower_count || 0);
        }
      } catch (error) {
        console.error("Erro ao buscar seguidores:", error);
      }
    };

    if (profissional?.user_id) {
      getFollowerCount();
    }
  }, [profissional?.user_id]);

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
          tipo: "online",
          observacoes_paciente: "",
        }),
      });

      const resultado = await response.json();

      if (!response.ok) {
        throw new Error(resultado.error || "Erro ao agendar consulta");
      }

      alert("✅ Consulta agendada com sucesso!");
      setModalAgendamento({ aberto: false });
      router.push("/dashboard/paciente/consultas");
    } catch (error: any) {
      console.error("Erro ao agendar:", error);
      alert(`❌ ${error.message}`);
    } finally {
      setAgendandoConsulta(false);
    }
  };

  const obterIniciais = (nome: string, sobrenome: string) => {
    return `${nome.charAt(0)}${sobrenome.charAt(0)}`.toUpperCase();
  };

  const renderEstrelas = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <span
        key={i}
        className={`text-lg ${
          i < Math.floor(rating) ? "text-yellow-400" : "text-gray-300"
        }`}
      >
        ★
      </span>
    ));
  };

  // Loading
  if (carregando) {
    return (
      <PatientLayout>
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando profissional...</p>
        </div>
      </PatientLayout>
    );
  }

  // Erro
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

        {/* Header do Profissional - COM FOLLOW INTEGRADO */}
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
            <div className="flex-1 space-y-4">
              <div>
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
                <div className="flex items-center space-x-2 mb-3">
                  <div className="flex items-center">
                    {renderEstrelas(profissional.rating)}
                  </div>
                  <span className="text-gray-600">
                    {profissional.rating.toFixed(1)}
                  </span>
                </div>
              </div>

              {/* NOVO: Seguidores */}
              <div className="flex items-center space-x-4 py-2 border-y border-gray-200">
                <button
                  onClick={() => setShowFollowers(true)}
                  className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 transition-colors font-medium cursor-pointer"
                >
                  <UserGroupIcon className="w-5 h-5" />
                  <span>{followerCount} seguidores</span>
                </button>
              </div>

              {/* NOVO: Botões com Follow */}
              <div className="flex gap-3 flex-wrap pt-2">
                <button
                  onClick={() => setModalAgendamento({ aberto: true })}
                  className="bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Agendar Consulta
                </button>

                {authToken && (
                  <FollowButton
                    userId={profissional.user_id}
                    variant="primary"
                    size="md"
                    showLabel={true}
                    onFollow={() => setFollowerCount((c: number) => c + 1)}
                    onUnfollow={() =>
                      setFollowerCount((c: number) => Math.max(0, c - 1))
                    }
                  />
                )}
              </div>
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

                {profissional.experiencia_anos && (
                  <div>
                    <h3 className="flex items-center text-sm font-medium text-gray-700 mb-2">
                      <ClockIcon className="w-4 h-4 mr-2" />
                      Experiência
                    </h3>
                    <p className="text-gray-900">
                      {profissional.experiencia_anos} anos de atuação
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
                        <span className="text-sm text-emerald-600 font-medium">
                          {horarios
                            .map((h) => `${h.inicio} - ${h.fim}`)
                            .join(", ")}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-400">Fechado</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Próximos Horários Disponíveis */}
            {profissional.proximos_horarios_disponiveis &&
              profissional.proximos_horarios_disponiveis.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    Próximos Horários
                  </h2>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {profissional.proximos_horarios_disponiveis.map(
                      (slot, idx) => (
                        <button
                          key={idx}
                          onClick={() =>
                            handleAgendar(slot.data, slot.hora_inicio)
                          }
                          disabled={!slot.disponivel || agendandoConsulta}
                          className={`p-3 rounded-lg text-sm font-medium transition-colors ${
                            slot.disponivel
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                              : "bg-gray-50 text-gray-400 border border-gray-200"
                          }`}
                        >
                          <div className="font-semibold">
                            {new Date(slot.data).toLocaleDateString("pt-BR", {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                            })}
                          </div>
                          <div className="text-xs">{slot.hora_inicio}</div>
                        </button>
                      )
                    )}
                  </div>
                </div>
              )}
          </div>

          {/* Coluna Lateral */}
          <div className="space-y-6">
            {/* Informações de Contato */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Informações
              </h3>

              <div className="space-y-3">
                {profissional.valor_sessao && (
                  <div className="flex items-start space-x-3">
                    <CurrencyDollarIcon className="w-5 h-5 text-emerald-600 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600">Valor da Sessão</p>
                      <p className="font-semibold text-gray-900">
                        R$ {profissional.valor_sessao.toFixed(2)}/h
                      </p>
                    </div>
                  </div>
                )}

                {profissional.endereco_cidade && (
                  <div className="flex items-start space-x-3">
                    <MapPinIcon className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600">Localização</p>
                      <p className="font-semibold text-gray-900">
                        {profissional.endereco_cidade},{" "}
                        {profissional.endereco_estado}
                      </p>
                    </div>
                  </div>
                )}

                {profissional.crp && (
                  <div className="flex items-start space-x-3">
                    <CheckCircleIcon className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600">Registro</p>
                      <p className="font-semibold text-gray-900">
                        CRP {profissional.crp}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* NOVO: Modal de Seguidores */}
      <FollowersModal
        isOpen={showFollowers}
        onClose={() => setShowFollowers(false)}
        userId={profissional.user_id}
        mode="followers"
        authToken={authToken}
        title={`Seguidores de ${profissional.nome}`}
      />
    </PatientLayout>
  );
}
