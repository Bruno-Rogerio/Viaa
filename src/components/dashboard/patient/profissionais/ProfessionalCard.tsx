// src/components/dashboard/patient/profissionais/ProfessionalCard.tsx
// 🎯 Card do profissional com botão de seguir integrado
// ✅ VERSÃO CORRIGIDA

"use client";

import Link from "next/link";
import {
  StarIcon,
  CheckBadgeIcon,
  UserGroupIcon,
} from "@heroicons/react/24/solid";
import { MapPinIcon } from "@heroicons/react/24/outline";
import FollowButton from "@/components/dashboard/common/FollowButton";
import { useConnections } from "@/hooks/useConnections";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";

interface ProfessionalCardProps {
  profissional: {
    id: string;
    user_id: string;
    nome: string;
    sobrenome: string;
    especialidades?: string;
    bio_profissional?: string;
    foto_perfil_url?: string;
    endereco_cidade?: string;
    endereco_estado?: string;
    verificado?: boolean;
    valor_sessao?: number;
    rating?: number;
  };
  className?: string;
}

export default function ProfessionalCard({
  profissional,
  className = "",
}: ProfessionalCardProps) {
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [followerCount, setFollowerCount] = useState(0);

  // Log para debug
  console.log("🔎 ProfessionalCard renderizado com:", {
    profissionalId: profissional.id,
    userId: profissional.user_id,
    temUserId: !!profissional.user_id,
  });

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

  // Obter contagem de followers
  useEffect(() => {
    const getFollowerCount = async () => {
      if (!profissional.user_id) return;

      try {
        const { followerCount: count } = useConnections(
          profissional.user_id,
          authToken
        );
        setFollowerCount(count);
      } catch (error) {
        console.error("Erro ao obter contagem de seguidores:", error);
      }
    };

    if (authToken) {
      getFollowerCount();
    }
  }, [profissional.user_id, authToken]);

  // Renderizar estrelas
  const renderStars = (rating: number = 5) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <StarIcon
        key={i}
        className={`w-4 h-4 ${
          i < Math.floor(rating) ? "text-yellow-400" : "text-gray-300"
        }`}
      />
    ));
  };

  return (
    <div
      className={`bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 ${className}`}
    >
      {/* Imagem/Avatar */}
      <div className="relative h-32 bg-gradient-to-r from-blue-400 to-emerald-400 overflow-hidden">
        {profissional.foto_perfil_url ? (
          <img
            src={profissional.foto_perfil_url}
            alt={`${profissional.nome} ${profissional.sobrenome}`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-4xl font-bold text-white">
              {profissional.nome.charAt(0)}
              {profissional.sobrenome.charAt(0)}
            </div>
          </div>
        )}

        {/* Badge de verificado */}
        {profissional.verificado && (
          <div className="absolute top-2 right-2 bg-blue-100 text-blue-800 rounded-full p-1">
            <CheckBadgeIcon className="w-6 h-6" />
          </div>
        )}
      </div>

      {/* Conteúdo */}
      <div className="p-4">
        {/* Nome e especialidade */}
        <div className="mb-2">
          <h3 className="font-bold text-gray-900 text-lg leading-tight">
            {profissional.nome} {profissional.sobrenome}
          </h3>
          <p className="text-sm text-blue-600 mb-1">
            {profissional.especialidades || "Profissional"}
          </p>

          {/* Localização */}
          {(profissional.endereco_cidade || profissional.endereco_estado) && (
            <p className="text-xs text-gray-600 flex items-center mb-2">
              <MapPinIcon className="w-3 h-3 mr-1" />
              {profissional.endereco_cidade}{" "}
              {profissional.endereco_estado
                ? `- ${profissional.endereco_estado}`
                : ""}
            </p>
          )}
        </div>

        {/* Avaliação */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex">
            {renderStars(profissional.rating || 5)}
            <span className="text-xs text-gray-600 ml-1">
              {profissional.rating || 5}
            </span>
          </div>
          <div className="text-xs text-gray-500 flex items-center">
            <UserGroupIcon className="w-3 h-3 mr-1" />
            {followerCount} seguidores
          </div>
        </div>

        {/* Valor da sessão */}
        {profissional.valor_sessao && (
          <div className="text-lg font-semibold text-emerald-600">
            R$ {profissional.valor_sessao.toFixed(2)}/h
          </div>
        )}

        {/* Bio resumida */}
        {profissional.bio_profissional && (
          <p className="text-sm text-gray-600 line-clamp-2">
            {profissional.bio_profissional}
          </p>
        )}

        {/* Botões de ação */}
        <div className="flex gap-2 pt-2">
          {/* Botão de Agendar */}
          <Link
            href={`/dashboard/paciente/profissionais/${profissional.id}`}
            className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm text-center"
          >
            Ver Perfil
          </Link>

          {/* Botão de Seguir - CORRIGIDO */}
          <div className="flex-shrink-0">
            {authToken && profissional.user_id && (
              <FollowButton
                userId={profissional.user_id}
                variant="secondary"
                size="sm"
                showLabel={false}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
