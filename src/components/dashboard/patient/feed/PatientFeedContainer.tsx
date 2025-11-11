// src/components/dashboard/patient/feed/PatientFeedContainer.tsx
// ✅ FEED CONTAINER PARA PACIENTES - Apenas leitura

"use client";
import { useState } from "react";
import { usePatientFeed } from "@/hooks/dashboard/usePatientFeed";
import PostCardReadOnly from "./PostCardReadOnly";
import PostFilters from "../../professional/feed/PostFilters";
import { LoadingSpinner } from "../../common";
import Link from "next/link";

export default function PatientFeedContainer() {
  const [filter, setFilter] = useState("all");

  const { posts, loading, error, pagination, loadMore, refresh, setFilters } =
    usePatientFeed();

  const handleFilterChange = (newFilter: string) => {
    setFilter(newFilter);
    setFilters({ type: newFilter as any });
  };

  const handleLoadMore = async () => {
    if (!loading && pagination.has_more) {
      await loadMore();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
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
          <p className="text-red-800 font-medium">Erro ao carregar posts</p>
          <p className="text-red-600 text-sm mt-1">{error}</p>
          <button
            onClick={refresh}
            className="mt-3 bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700"
          >
            Tentar novamente
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading && posts.length === 0 && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <LoadingSpinner size="lg" />
            <p className="mt-4 text-gray-600">Carregando conteúdos...</p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && posts.length === 0 && !error && (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <div className="text-6xl mb-4">👥</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Nenhum conteúdo disponível
          </h3>
          <p className="text-gray-600 mb-6">
            Comece seguindo profissionais para ver seus conteúdos aqui!
          </p>
          <Link
            href="/dashboard/paciente/profissionais"
            className="inline-block bg-emerald-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-emerald-700 transition-colors"
          >
            Buscar Profissionais
          </Link>
        </div>
      )}

      {/* Posts */}
      {posts.length > 0 && (
        <div className="space-y-6">
          {posts.map((post) => (
            <PostCardReadOnly
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
                video: post.video_url,
                createdAt: post.created_at,
                likes: post.likes_count,
                comments: post.comments_count,
                type: post.type,
              }}
              showScheduleButton={true}
            />
          ))}
        </div>
      )}

      {/* Load More Button */}
      {pagination.has_more && !loading && posts.length > 0 && (
        <div className="text-center">
          <button
            onClick={handleLoadMore}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Carregar mais posts
          </button>
        </div>
      )}

      {/* Loading More */}
      {loading && posts.length > 0 && (
        <div className="text-center py-4">
          <LoadingSpinner size="md" />
        </div>
      )}
    </div>
  );
}
