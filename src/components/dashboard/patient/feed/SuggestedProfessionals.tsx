// src/components/dashboard/patient/feed/SuggestedProfessionals.tsx
// 🎯 Componente de sugestão de profissionais para seguir

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import FollowButton from "@/components/dashboard/common/FollowButton";
import { CheckBadgeIcon } from "@heroicons/react/24/solid";
import { MapPinIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

// Tipos
interface SuggestedProfessional {
  id: string;
  user_id: string;
  nome: string;
  sobrenome: string;
  especialidades?: string;
  foto_perfil_url?: string;
  endereco_cidade?: string;
  endereco_estado?: string;
  verificado?: boolean;
  score?: number; // Campo para ranking interno
}

// Propriedades do componente
interface SuggestedProfessionalsProps {
  limit?: number;
}

export default function SuggestedProfessionals({
  limit = 3,
}: SuggestedProfessionalsProps) {
  const { user } = useAuth();
  const [professionals, setProfessionals] = useState<SuggestedProfessional[]>(
    []
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Carregar profissionais sugeridos
  useEffect(() => {
    const loadSuggestions = async () => {
      if (!user?.id) return;

      setLoading(true);
      setError(null);

      try {
        // Endpoint específico para sugestões com algoritmo de relevância
        const response = await fetch(
          `/api/profissionais/sugestoes?limit=${limit}`
        );

        if (!response.ok) {
          throw new Error("Erro ao carregar sugestões");
        }

        const data = await response.json();
        setProfessionals(data.profissionais || []);
      } catch (err: any) {
        console.error("Erro ao carregar sugestões:", err);
        setError(err.message || "Erro ao carregar sugestões");
      } finally {
        setLoading(false);
      }
    };

    loadSuggestions();
  }, [user?.id, limit, refreshKey]);

  // Callback quando usuário segue um profissional
  const handleFollowChange = () => {
    // Atualizar a lista de sugestões após seguir
    setTimeout(() => setRefreshKey((prev) => prev + 1), 1000);
  };

  // Estado de loading
  if (loading && professionals.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-4 animate-pulse">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Sugestões para Seguir
        </h3>

        {Array.from({ length: limit }).map((_, index) => (
          <div
            key={index}
            className="flex items-center mb-4 pb-4 border-b border-gray-100 last:border-b-0 last:mb-0 last:pb-0"
          >
            <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
            <div className="ml-3 flex-1">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/3"></div>
            </div>
            <div className="w-20 h-8 bg-gray-200 rounded-lg"></div>
          </div>
        ))}
      </div>
    );
  }

  // Estado de erro
  if (error) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Sugestões para Seguir
        </h3>
        <p className="text-red-600 text-sm">{error}</p>
      </div>
    );
  }

  // Sem profissionais para sugerir
  if (professionals.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Sugestões para Seguir
        </h3>
        <p className="text-gray-600 text-sm">
          Nenhuma sugestão no momento. Explore mais profissionais na página de
          busca.
        </p>
        <Link
          href="/dashboard/paciente/profissionais"
          className="inline-block mt-3 text-sm text-emerald-600 hover:text-emerald-700 font-medium"
        >
          Ver todos os profissionais
        </Link>
      </div>
    );
  }

  // Renderização principal
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Sugestões para Seguir
      </h3>

      {professionals.map((prof) => (
        <div
          key={prof.id}
          className="flex items-center mb-4 pb-4 border-b border-gray-100 last:border-b-0 last:mb-0 last:pb-0"
        >
          {/* Avatar */}
          <div className="flex-shrink-0">
            {prof.foto_perfil_url ? (
              <img
                src={prof.foto_perfil_url}
                alt={prof.nome}
                className="w-12 h-12 rounded-full object-cover border border-gray-200"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-emerald-400 flex items-center justify-center text-white font-semibold text-sm">
                {prof.nome.charAt(0)}
                {prof.sobrenome.charAt(0)}
              </div>
            )}
          </div>

          {/* Informações */}
          <div className="ml-3 flex-1 min-w-0">
            <div className="flex items-center">
              <p className="font-medium text-gray-900 truncate">
                {prof.nome} {prof.sobrenome}
              </p>
              {prof.verificado && (
                <CheckBadgeIcon className="w-4 h-4 text-blue-500 ml-1" />
              )}
            </div>

            <p className="text-xs text-gray-600 truncate">
              {prof.especialidades || "Profissional"}
            </p>

            {(prof.endereco_cidade || prof.endereco_estado) && (
              <p className="text-xs text-gray-500 flex items-center mt-1">
                <MapPinIcon className="w-3 h-3 mr-1" />
                {prof.endereco_cidade}
                {prof.endereco_estado && prof.endereco_cidade && ", "}
                {prof.endereco_estado}
              </p>
            )}
          </div>

          {/* Botão de seguir */}
          <div className="flex-shrink-0">
            <FollowButton
              userId={prof.user_id}
              variant="secondary"
              size="sm"
              showLabel={false}
              onFollow={handleFollowChange}
              onUnfollow={handleFollowChange}
            />
          </div>
        </div>
      ))}

      {/* Link para ver mais */}
      <Link
        href="/dashboard/paciente/profissionais"
        className="block mt-3 text-center text-sm text-emerald-600 hover:text-emerald-700 font-medium"
      >
        Ver mais profissionais
      </Link>
    </div>
  );
}
