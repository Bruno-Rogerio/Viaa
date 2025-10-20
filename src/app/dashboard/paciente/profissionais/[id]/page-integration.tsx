// src/components/dashboard/patient/profissionais/ProfessionalDetailHeader.tsx
// 🎯 Componente reutilizável do header com Follow

"use client";

import { useState, useEffect } from "react";
import { UserGroupIcon } from "@heroicons/react/24/outline";
import { supabase } from "@/lib/supabase/client";
import FollowButton from "@/components/dashboard/common/FollowButton";
import FollowersModal from "@/components/dashboard/common/FollowersModal";

interface ProfessionalDetailHeaderProps {
  profissional: {
    id: string;
    user_id: string;
    nome: string;
    sobrenome: string;
    especialidades?: string;
    foto_perfil_url?: string;
    verificado?: boolean;
  };
}

export default function ProfessionalDetailHeader({
  profissional,
}: ProfessionalDetailHeaderProps) {
  const [showFollowers, setShowFollowers] = useState(false);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [followerCount, setFollowerCount] = useState(0);

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

  // Buscar contagem de followers
  useEffect(() => {
    const getFollowerCount = async () => {
      try {
        const response = await fetch(
          `/api/connections/count-followers?user_id=${profissional.user_id}`
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
  }, [profissional.user_id]);

  return (
    <>
      <div className="bg-white rounded-xl border border-gray-200 p-8">
        <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6 mb-6">
          {/* Avatar */}
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
                  {profissional.nome.charAt(0)}
                  {profissional.sobrenome.charAt(0)}
                </span>
              </div>
            )}
          </div>

          {/* Informações */}
          <div className="flex-1 space-y-4">
            {/* Nome e verificação */}
            <div className="flex items-center space-x-2">
              <h1 className="text-3xl font-bold text-gray-900">
                {profissional.nome} {profissional.sobrenome}
              </h1>
              {profissional.verificado && (
                <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                  Verificado
                </span>
              )}
            </div>

            {/* Especialidades */}
            {profissional.especialidades && (
              <p className="text-lg text-gray-600">
                {profissional.especialidades}
              </p>
            )}

            {/* Seguidores */}
            <div className="flex items-center space-x-4 py-2 border-y border-gray-200">
              <button
                onClick={() => setShowFollowers(true)}
                className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 transition-colors font-medium cursor-pointer"
              >
                <UserGroupIcon className="w-5 h-5" />
                <span>{followerCount} seguidores</span>
              </button>
            </div>

            {/* Botões de ação */}
            <div className="flex gap-3 flex-wrap">
              <button className="bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium">
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
      </div>

      {/* Modal de Seguidores */}
      <FollowersModal
        isOpen={showFollowers}
        onClose={() => setShowFollowers(false)}
        userId={profissional.user_id}
        mode="followers"
        authToken={authToken}
        title={`Seguidores de ${profissional.nome}`}
      />
    </>
  );
}
