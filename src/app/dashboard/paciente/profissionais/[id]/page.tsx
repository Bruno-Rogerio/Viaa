// src/app/dashboard/paciente/profissionais/[id]/page.tsx
// ✅ VERSÃO CORRIGIDA - COM user_id NO SELECT

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

  // States para Follow
  const [showFollowers, setShowFollowers] = useState(false);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [followerCount, setFollowerCount] = useState(0);

  const profissionalId = params.id as string;

  // Obter token
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

  // ✅ BUSCAR PROFISSIONAL - CORRIGIDO COM user_id
  useEffect(() => {
    const buscarProfissional = async () => {
      if (!profissionalId) return;

      try {
        setCarregando(true);
        setErro(null);

        console.log("🔍 Buscando profissional:", profissionalId);

        // ✅ CORREÇÃO: Adicionado user_id no select
        const { data, error } = await supabase
          .from("perfis_profissionais")
          .select("*") // ← Pega TODOS os campos incluindo user_id
          .eq("id", profissionalId)
          .single();

        if (error) {
          console.error("❌ Erro ao buscar:", error);
          throw error;
        }

        if (!data) {
          throw new Error("Profissional não encontrado");
        }

        console.log("✅ Profissional carregado:", data);
        console.log("👤 user_id:", data.user_id); // Debug

        setProfissional(data);
      } catch (error: any) {
        console.error("💥 Erro:", error);
        setErro(error.message || "Erro ao carregar profissional");
      } finally {
        setCarregando(false);
      }
    };

    buscarProfissional();
  }, [profissionalId]);

  // Buscar contagem de followers
  useEffect(() => {
    const getFollowerCount = async () => {
      if (!profissional?.user_id) return;

      try {
        console.log("📊 Buscando followers de:", profissional.user_id);

        const response = await fetch(
          `/api/connections/count-followers?user_id=${profissional.user_id}`
        );
        const data = await response.json();

        if (data.success) {
          setFollowerCount(data.follower_count || 0);
          console.log("✅ Followers:", data.follower_count);
        }
      } catch (error) {
        console.error("❌ Erro ao buscar seguidores:", error);
      }
    };

    getFollowerCount();
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

        {/* Header do Profissional */}
        <div className="bg-white rounded-xl border border-gray-200 p-8">
          <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6 mb-6">
            {/* Foto */}
            <div className="relative flex-shrink-0">
              {profissional.foto_perfil_url ? (
                <img
                  src={profissional.foto_perfil_url}
                  alt={`${profissional.nome} ${profissional.sobrenome}`}
                  className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold border-4 border-white shadow-lg">
                  {obterIniciais(profissional.nome, profissional.sobrenome)}
                </div>
              )}
              {profissional.verificado && (
                <div className="absolute bottom-2 right-2 bg-blue-500 rounded-full p-1">
                  <CheckCircleIcon className="w-6 h-6 text-white" />
                </div>
              )}
            </div>

            {/* Informações */}
            <div className="flex-1 space-y-3">
              {/* Nome */}
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {profissional.nome} {profissional.sobrenome}
                </h1>
                <p className="text-lg text-gray-600 mt-1">
                  {profissional.especialidades}
                </p>
              </div>

              {/* Rating e Consultas */}
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  {renderEstrelas(profissional.rating)}
                  <span className="text-sm text-gray-600 font-medium">
                    {profissional.rating.toFixed(1)}
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  <CheckCircleIcon className="w-4 h-4 inline mr-1" />
                  {profissional.consultas_realizadas} consultas
                </div>
              </div>

              {/* Seguidores */}
              <div className="flex items-center space-x-4 py-2 border-y border-gray-200">
                <button
                  onClick={() => setShowFollowers(true)}
                  className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 transition-colors font-medium"
                >
                  <UserGroupIcon className="w-5 h-5" />
                  <span>{followerCount} seguidores</span>
                </button>
              </div>

              {/* Botões de Ação */}
              <div className="flex gap-3 flex-wrap">
                <button
                  onClick={() =>
                    router.push(
                      `/dashboard/paciente/profissionais/${profissional.id}/agendar`
                    )
                  }
                  className="bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center"
                >
                  <CalendarDaysIcon className="w-5 h-5 mr-2" />
                  Agendar Consulta
                </button>

                {authToken && profissional.user_id && (
                  <FollowButton
                    userId={profissional.user_id}
                    variant="primary"
                    size="md"
                    showLabel={true}
                    onFollow={() => setFollowerCount((c) => c + 1)}
                    onUnfollow={() =>
                      setFollowerCount((c) => Math.max(0, c - 1))
                    }
                  />
                )}
              </div>
            </div>
          </div>

          {/* Informações Adicionais */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-gray-200">
            <div className="flex items-center space-x-3">
              <MapPinIcon className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Localização</p>
                <p className="font-medium text-gray-900">
                  {profissional.endereco_cidade}, {profissional.endereco_estado}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <CurrencyDollarIcon className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Valor da sessão</p>
                <p className="font-medium text-gray-900">
                  R$ {profissional.valor_sessao.toFixed(2)}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <ClockIcon className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Experiência</p>
                <p className="font-medium text-gray-900">
                  {profissional.experiencia_anos} anos
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bio */}
        {profissional.bio_profissional && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Sobre</h2>
            <p className="text-gray-700 leading-relaxed">
              {profissional.bio_profissional}
            </p>
          </div>
        )}

        {/* Formação e Abordagem */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {profissional.formacao_principal && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center space-x-2 mb-4">
                <AcademicCapIcon className="w-6 h-6 text-blue-600" />
                <h3 className="text-lg font-bold text-gray-900">Formação</h3>
              </div>
              <p className="text-gray-700">{profissional.formacao_principal}</p>
            </div>
          )}

          {profissional.abordagem_terapeutica && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center space-x-2 mb-4">
                <ChartBarIcon className="w-6 h-6 text-blue-600" />
                <h3 className="text-lg font-bold text-gray-900">Abordagem</h3>
              </div>
              <p className="text-gray-700">
                {profissional.abordagem_terapeutica}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Seguidores */}
      {profissional.user_id && (
        <FollowersModal
          isOpen={showFollowers}
          onClose={() => setShowFollowers(false)}
          userId={profissional.user_id}
          mode="followers"
          authToken={authToken}
          title={`Seguidores de ${profissional.nome}`}
        />
      )}
    </PatientLayout>
  );
}
