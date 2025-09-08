// viaa\src\components\dashboard\patient\feed\PatientFeedContainer.tsx
"use client";
import { useState } from "react";
import { PostCard } from "../../shared/feed";
import PostFilters from "../../professional/feed/PostFilters";
import { LoadingSpinner } from "../../common";
import { useFeed } from "@/hooks/dashboard/useFeed";

export default function PatientFeedContainer() {
  const [filter, setFilter] = useState("all");

  const { posts, loading, error, pagination, loadMore, refresh, setFilters } =
    useFeed();

  const handleFilterChange = (newFilter: string) => {
    setFilter(newFilter);
    setFilters({ type: newFilter as any });
  };

  const handleLoadMore = async () => {
    if (!loading && pagination.has_more) {
      await loadMore();
    }
  };

  const handleSchedule = (professionalId: string) => {
    // Implementar lógica de agendamento
    console.log("Agendar com profissional:", professionalId);
    // router.push(`/patient/schedule/${professionalId}`);
  };

  return (
    <div className="space-y-6">
      {/* Header específico para pacientes */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Conteúdos dos Profissionais 📚
        </h1>
        <p className="text-gray-600">
          Acompanhe conteúdos exclusivos e agende consultas com profissionais
          verificados.
        </p>
      </div>

      {/* Filtros */}
      <PostFilters currentFilter={filter} onFilterChange={handleFilterChange} />

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center space-x-2">
            <span className="text-red-600">⚠️</span>
            <p className="text-red-800 font-medium">Erro ao carregar posts</p>
          </div>
          <p className="text-red-600 text-sm mt-1">{error}</p>
          <button
            onClick={refresh}
            className="mt-3 bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700"
          >
            Tentar novamente
          </button>
        </div>
      )}

      {/* Loading State Inicial */}
      {loading && posts.length === 0 && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <LoadingSpinner size="lg" />
            <p className="mt-4 text-gray-600">Carregando conteúdos...</p>
          </div>
        </div>
      )}

      {/* Lista de Posts - Modo Paciente */}
      {posts.length > 0 && (
        <div className="space-y-6">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={{
                id: post.id,
                author: {
                  id: post.author.id,
                  name: `${post.author.nome} ${post.author.sobrenome}`,
                  specialization: post.author.especialidades,
                  avatar: post.author.foto_perfil_url,
                  verified: post.author.verificado,
                },
                content: post.content,
                image: post.image_url,
                createdAt: post.created_at,
                likes: post.likes_count,
                comments: post.comments_count,
                shares: post.shares_count,
                isLiked: false, // Pacientes não curtem
                type: post.type,
              }}
              onLike={() => {}} // Pacientes não podem curtir
              canInteract={false} // Pacientes não interagem
              canComment={false} // Pacientes não comentam
              showScheduleButton={true} // Mostrar botão agendar
              onSchedule={() => handleSchedule(post.author.id)}
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && posts.length === 0 && !error && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">👨‍⚕️</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Nenhum conteúdo encontrado
          </h3>
          <p className="text-gray-600 mb-6">
            Os profissionais ainda não publicaram conteúdos. Volte em breve!
          </p>
        </div>
      )}

      {/* Load More Button */}
      {posts.length > 0 && pagination.has_more && (
        <div className="text-center py-8">
          <button
            onClick={handleLoadMore}
            disabled={loading}
            className="px-6 py-3 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 mx-auto"
          >
            {loading ? (
              <>
                <LoadingSpinner size="sm" />
                <span>Carregando...</span>
              </>
            ) : (
              <span>Ver mais conteúdos</span>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
