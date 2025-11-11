// src/components/dashboard/patient/feed/SuggestedProfessionals.tsx
// ✅ CORRIGIDO - Usando targetProfileId ao invés de userId

"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import FollowButton from "../../common/FollowButton";
import { LoadingSpinner } from "../../common";
import { CheckBadgeIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

interface Professional {
  id: string;
  nome: string;
  sobrenome: string;
  especialidades: string;
  foto_perfil_url?: string;
  verificado: boolean;
}

interface SuggestedProfessionalsProps {
  limit?: number;
}

export default function SuggestedProfessionals({
  limit = 5,
}: SuggestedProfessionalsProps) {
  const { getProfileId, getUserType } = useAuth();
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const currentProfileId = getProfileId();
  const currentUserType = getUserType();

  useEffect(() => {
    loadSuggestions();
  }, [currentProfileId]);

  const loadSuggestions = async () => {
    try {
      setLoading(true);
      setError(null);

      // Buscar profissionais que o usuário NÃO segue
      const { data: connections } = await supabase
        .from("connections")
        .select("following_id")
        .eq("follower_id", currentProfileId || "");

      const followingIds = connections?.map((c) => c.following_id) || [];

      let query = supabase
        .from("perfis_profissionais")
        .select(
          "id, nome, sobrenome, especialidades, foto_perfil_url, verificado"
        )
        .eq("verificado", true)
        .limit(limit);

      if (followingIds.length > 0) {
        query = query.not("id", "in", `(${followingIds.join(",")})`);
      }

      if (currentProfileId) {
        query = query.neq("id", currentProfileId);
      }

      const { data, error: queryError } = await query;

      if (queryError) throw queryError;

      setProfessionals(data || []);
    } catch (err: any) {
      console.error("Erro ao carregar sugestões:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFollowSuccess = () => {
    loadSuggestions();
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">
          Profissionais Sugeridos
        </h2>
        <div className="flex items-center justify-center py-8">
          <LoadingSpinner size="md" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">
          Profissionais Sugeridos
        </h2>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 text-sm">{error}</p>
          <button
            onClick={loadSuggestions}
            className="mt-2 text-red-600 text-sm hover:underline"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  if (professionals.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">
          Profissionais Sugeridos
        </h2>
        <p className="text-gray-600 text-sm">
          Nenhuma sugestão disponível no momento.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-900">
          Profissionais Sugeridos
        </h2>
        <Link
          href="/dashboard/paciente/profissionais"
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          Ver todos
        </Link>
      </div>

      <div className="space-y-4">
        {professionals.map((professional) => (
          <div
            key={professional.id}
            className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Link
              href={`/dashboard/paciente/profissionais/${professional.id}`}
              className="flex items-center gap-3 flex-1 min-w-0"
            >
              {/* Avatar */}
              {professional.foto_perfil_url ? (
                <img
                  src={professional.foto_perfil_url}
                  alt={professional.nome}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-emerald-400 flex items-center justify-center text-white font-semibold">
                  {professional.nome.charAt(0)}
                  {professional.sobrenome.charAt(0)}
                </div>
              )}

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1">
                  <p className="font-semibold text-gray-900 truncate">
                    {professional.nome} {professional.sobrenome}
                  </p>
                  {professional.verificado && (
                    <CheckBadgeIcon className="w-4 h-4 text-blue-500 flex-shrink-0" />
                  )}
                </div>
                <p className="text-sm text-gray-600 truncate">
                  {professional.especialidades}
                </p>
              </div>
            </Link>

            {/* Follow Button - CORRIGIDO: targetProfileId */}
            <div className="flex-shrink-0 ml-2">
              <FollowButton
                targetProfileId={professional.id}
                variant="secondary"
                size="sm"
                onFollow={handleFollowSuccess}
                onUnfollow={handleFollowSuccess}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
