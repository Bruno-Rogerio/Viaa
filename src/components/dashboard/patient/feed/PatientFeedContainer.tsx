// src/components/dashboard/patient/feed/PatientFeedContainer.tsx
// 🎯 Feed Container do Paciente - Implementação completa

import { useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import PostFilters from "@/components/dashboard/shared/feed/PostFilters";
import { PostCard } from "@/components/dashboard/shared/feed";
import SuggestedProfessionals from "./SuggestedProfessionals";
import FollowButton from "@/components/dashboard/common/FollowButton";
import { LoadingSpinner } from "@/components/dashboard/common";
import { useFeed, FeedFilterType } from "@/hooks/dashboard/useFeed";
import {
  UserGroupIcon,
  SparklesIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";

export default function PatientFeedContainer() {
  const { user, profile } = useAuth();

  const {
    posts,
    loading,
    error,
    filter,
    pagination,
    setFilter,
    loadMore,
    togglePostLike,
    refresh,
  } = useFeed({
    initialFilter: "seguindo",
    autoLoad: true,
  });

  // Handler para mudar o filtro
  const handleFilterChange = useCallback(
    (newFilter: FeedFilterType) => {
      setFilter(newFilter);
    },
    [setFilter]
  );

  // Handler para carregar mais posts
  const handleLoadMore = useCallback(async () => {
    if (loading || !pagination.has_more) return;
    await loadMore();
  }, [loading, pagination.has_more, loadMore]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900">Feed de Bem-Estar</h1>
        <p className="text-gray-600 mt-1">
          Conteúdo terapêutico personalizado da sua Biblioteca Viva
        </p>
      </div>

      {/* Layout de 2 colunas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coluna principal - Posts */}
        <div className="lg:col-span-2 space-y-6">
          {/* Filtros */}
          <PostFilters
            currentFilter={filter}
            onFilterChange={handleFilterChange}
          />

          {/* Estado de erro */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <p className="text-red-800 font-medium">Erro ao carregar posts</p>
              <button
                onClick={refresh}
                className="mt-3 bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700 flex items-center"
              >
                <ArrowPathIcon className="w-4 h-4 mr-2" />
                Tentar novamente
              </button>
            </div>
          )}

          {/* Estado vazio - Filtro "Seguindo" sem seguir ninguém */}
          {!loading && posts.length === 0 && filter === "seguindo" && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 text-center">
              <UserGroupIcon className="w-12 h-12 text-blue-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Você ainda não segue nenhum profissional
              </h3>
              <p className="text-gray-600 mb-4">
                Siga profissionais para ver o conteúdo deles no seu feed
              </p>
              <button
                onClick={() => setFilter("para-voce")}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 inline-flex items-center"
              >
                <SparklesIcon className="w-4 h-4 mr-2" />
                Ver conteúdo recomendado
              </button>
            </div>
          )}

          {/* Estado vazio - Filtro "Para Você" sem recomendações */}
          {!loading && posts.length === 0 && filter === "para-voce" && (
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-6 text-center">
              <SparklesIcon className="w-12 h-12 text-purple-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Recomendações personalizadas
              </h3>
              <p className="text-gray-600 mb-4">
                Conforme você interagir com mais profissionais, mostraremos
                recomendações baseadas nos seus interesses
              </p>
              <button
                onClick={() => setFilter("recentes")}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-purple-700"
              >
                Ver posts recentes
              </button>
            </div>
          )}

          {/* Loading state */}
          {loading && posts.length === 0 && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <LoadingSpinner size="lg" />
                <p className="mt-4 text-gray-600">Carregando conteúdos...</p>
              </div>
            </div>
          )}

          {/* Lista de posts */}
          {posts.length > 0 && (
            <div className="space-y-6">
              {posts.map((post) => (
                <div key={post.id} className="space-y-2">
                  {/* Header do post com botão de seguir */}
                  <div className="flex items-center justify-between px-4 py-3 bg-white rounded-t-xl border border-b-0 border-gray-200">
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      {/* Avatar */}
                      <div className="flex-shrink-0">
                        {post.author?.foto_perfil_url ? (
                          <img
                            src={post.author.foto_perfil_url}
                            alt={post.author.nome}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-emerald-400 flex items-center justify-center text-white font-semibold text-sm">
                            {post.author?.nome?.charAt(0)}
                            {post.author?.sobrenome?.charAt(0)}
                          </div>
                        )}
                      </div>

                      {/* Info do autor */}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 truncate">
                          {post.author?.nome} {post.author?.sobrenome}
                        </p>
                        <p className="text-xs text-gray-600">
                          {post.author?.especialidades || "Profissional"}
                        </p>
                      </div>
                    </div>

                    {/* Botão de seguir */}
                    {user?.id && post.author?.id && (
                      <div className="flex-shrink-0 ml-2">
                        <FollowButton
                          userId={post.author.id}
                          variant="secondary"
                          size="sm"
                          showLabel={false}
                        />
                      </div>
                    )}
                  </div>

                  {/* Conteúdo do post */}
                  <PostCard
                    post={post}
                    onLike={() => togglePostLike(post.id)}
                    showComments={false}
                    linkToDetail={true}
                  />
                </div>
              ))}

              {/* Botão "Carregar Mais" */}
              {pagination.has_more && (
                <div className="flex justify-center pt-4">
                  <button
                    onClick={handleLoadMore}
                    disabled={loading}
                    className={`
                      px-4 py-2 text-sm font-medium rounded-lg
                      ${
                        loading
                          ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                          : "bg-emerald-600 text-white hover:bg-emerald-700"
                      }
                    `}
                  >
                    {loading ? (
                      <span className="flex items-center">
                        <LoadingSpinner size="sm" className="mr-2" />
                        Carregando...
                      </span>
                    ) : (
                      "Carregar mais posts"
                    )}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Coluna lateral - Sugestões e stats */}
        <div className="lg:col-span-1 space-y-6">
          {/* Sugestões de profissionais */}
          <SuggestedProfessionals limit={5} />

          {/* Card explicativo do Feed */}
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl border border-emerald-200 p-4">
            <h3 className="text-lg font-semibold text-emerald-900 mb-2">
              Sua Biblioteca Viva
            </h3>
            <p className="text-sm text-emerald-800 mb-4">
              Aqui você encontra conteúdo exclusivo dos profissionais que você
              segue. Quanto mais profissionais você seguir, mais rica será sua
              biblioteca.
            </p>
            <div className="space-y-2 text-xs text-emerald-700">
              <div className="flex items-center">
                <UserGroupIcon className="w-4 h-4 mr-2 text-emerald-600" />
                <span>
                  <strong>Seguindo:</strong> Veja posts apenas dos profissionais
                  que você segue
                </span>
              </div>
              <div className="flex items-center">
                <SparklesIcon className="w-4 h-4 mr-2 text-emerald-600" />
                <span>
                  <strong>Para Você:</strong> Conteúdo personalizado baseado nos
                  seus interesses
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
