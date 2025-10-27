// src/components/dashboard/professional/widgets/ProfessionalWidget.tsx
// 🎯 Widget do Dashboard - Sugestões de Conexões
// ✅ VERSÃO CORRIGIDA com tipos corretos

"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ClockIcon,
  UserGroupIcon,
  BanknotesIcon,
  ChartBarIcon,
  CalendarDaysIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase/client";
import FollowButton from "../../common/FollowButton";
import ProximasConsultasWidget from "../../common/ProximasConsultasWidget";

interface Profissional {
  id: string;
  user_id: string;
  nome: string;
  sobrenome: string;
  especialidades?: string;
  foto_perfil_url?: string;
  tipo?: string;
  verificado?: boolean;
}

export default function ProfessionalWidget() {
  const { user, profile } = useAuth();
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [profissionaisSugeridos, setProfissionaisSugeridos] = useState<
    Profissional[]
  >([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

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

  // Carregar profissionais sugeridos (mesma especialidade ou região)
  useEffect(() => {
    if (!profile?.dados) return;

    const carregarSugestoes = async () => {
      try {
        setCarregando(true);
        setErro(null);

        const params = new URLSearchParams();
        params.append("limit", "4");
        params.append("page", "1");

        const dados = profile.dados;
        if (!dados) return;

        // Se tem especialidade, filtrar por ela
        if ("especialidades" in dados && dados.especialidades) {
          params.append("especialidade", dados.especialidades);
        }

        // Se tem estado, filtrar por ele
        if ("endereco_estado" in dados && dados.endereco_estado) {
          params.append("estado", dados.endereco_estado);
        }

        const response = await fetch(`/api/profissionais?${params.toString()}`);

        if (!response.ok) {
          throw new Error("Erro ao buscar sugestões");
        }

        const data = await response.json();

        // Filtrar profissionais que não são o próprio usuário
        const filtrados = (data.profissionais || [])
          .filter((prof: Profissional) => prof.user_id !== user?.id)
          // ✅ CORREÇÃO - Filtrar profissionais sem user_id
          .filter((prof: Profissional) => !!prof.user_id);

        setProfissionaisSugeridos(filtrados);

        // Log para debug
        console.log("🔎 Profissionais sugeridos carregados:", {
          total: filtrados.length,
          // ✅ CORREÇÃO - Adicionando tipo explícito para 'p'
          todosTemUserId: filtrados.every((p: Profissional) => !!p.user_id),
          primeiroProf: filtrados[0],
        });
      } catch (error) {
        console.error("Erro ao carregar sugestões:", error);
        setErro("Erro ao carregar sugestões");
      } finally {
        setCarregando(false);
      }
    };

    carregarSugestoes();
  }, [profile, user?.id]);

  if (!user || !profile) {
    return null;
  }

  // Obter iniciais
  const getInitials = (nome: string, sobrenome: string) => {
    return `${nome.charAt(0)}${sobrenome.charAt(0)}`.toUpperCase();
  };

  return (
    <div className="space-y-6">
      {/* Widget de Próximas Consultas */}
      <ProximasConsultasWidget
        tipoUsuario="profissional"
        usuarioId={user.id}
        limite={4}
      />

      {/* Estatísticas Rápidas */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Estatísticas de Hoje
        </h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <ClockIcon className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Consultas Hoje</p>
                <p className="text-sm text-gray-600">3 agendadas</p>
              </div>
            </div>
            <span className="text-2xl font-bold text-blue-600">3</span>
          </div>

          <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <UserGroupIcon className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Seguidores</p>
                <p className="text-sm text-gray-600">Seu público</p>
              </div>
            </div>
            <span className="text-2xl font-bold text-emerald-600">148</span>
          </div>

          <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-amber-100 rounded-lg">
                <BanknotesIcon className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Faturamento</p>
                <p className="text-sm text-gray-600">Esta semana</p>
              </div>
            </div>
            <span className="text-2xl font-bold text-amber-600">R$ 450</span>
          </div>
        </div>

        {/* Ações Rápidas */}
        <div className="mt-5 pt-4 border-t border-gray-100 space-y-3">
          <h4 className="font-medium text-gray-700 mb-2">Ações Rápidas:</h4>

          <Link
            href="/dashboard/profissional/agenda"
            className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-all duration-200 group"
          >
            <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
              <CalendarDaysIcon className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Minha Agenda</p>
              <p className="text-sm text-gray-600">Ver consultas pendentes</p>
            </div>
          </Link>

          <Link
            href="/dashboard/profissional/horarios"
            className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg hover:bg-purple-50 transition-all duration-200 group"
          >
            <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
              <ChartBarIcon className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Configurar Horários</p>
              <p className="text-sm text-gray-600">Definir disponibilidade</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Sugestões de Conexões - CORRIGIDA */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <SparklesIcon className="w-5 h-5 mr-2 text-blue-600" />
            Profissionais Sugeridos
          </h3>
          <Link
            href="/dashboard/rede"
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Ver mais
          </Link>
        </div>

        {/* Estado: Carregando */}
        {carregando && (
          <div className="text-center py-6">
            <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">Carregando sugestões...</p>
          </div>
        )}

        {/* Estado: Erro */}
        {erro && !carregando && (
          <div className="text-center py-4 text-sm text-red-600">
            <p>{erro}</p>
          </div>
        )}

        {/* Estado: Lista de profissionais */}
        {!carregando && profissionaisSugeridos.length > 0 && (
          <div className="space-y-3">
            {profissionaisSugeridos.map((prof) => (
              <div
                key={prof.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                {/* Avatar e Info */}
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  {prof.foto_perfil_url ? (
                    <img
                      src={prof.foto_perfil_url}
                      alt={prof.nome}
                      className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-emerald-400 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                      {getInitials(prof.nome, prof.sobrenome)}
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">
                      {prof.nome} {prof.sobrenome}
                    </p>
                    <p className="text-xs text-gray-600 truncate">
                      {prof.especialidades || "Profissional"}
                    </p>
                  </div>
                </div>

                {/* Follow Button - CORRIGIDO */}
                {authToken && prof.user_id && (
                  <div className="flex-shrink-0 ml-2">
                    <FollowButton
                      userId={prof.user_id}
                      size="sm"
                      showLabel={false}
                      variant="primary"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Estado: Sem sugestões */}
        {!carregando && profissionaisSugeridos.length === 0 && !erro && (
          <div className="text-center py-6">
            <p className="text-sm text-gray-600 mb-3">
              Nenhuma sugestão disponível no momento
            </p>
            <Link
              href="/dashboard/rede"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Explorar rede profissional →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
