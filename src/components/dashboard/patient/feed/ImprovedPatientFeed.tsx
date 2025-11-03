// src/components/dashboard/patient/feed/ImprovedPatientFeed.tsx
// Componente de Feed Melhorado para Pacientes com Sistema de Conexões

"use client";

import { useState, useEffect } from "react";
import {
  useFeedWithConnections,
  type Post,
} from "@/hooks/useFeedWithConnections";
import { useAuth } from "@/contexts/AuthContext";
import {
  HeartIcon,
  ChatBubbleLeftIcon,
  UserPlusIcon,
  UserMinusIcon,
  SparklesIcon,
  ClockIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolid } from "@heroicons/react/24/solid";

// ============================================================
// COMPONENTES AUXILIARES
// ============================================================

interface FilterTabsProps {
  currentFilter: string;
  onFilterChange: (filter: string) => void;
  followingCount: number;
}

function FilterTabs({
  currentFilter,
  onFilterChange,
  followingCount,
}: FilterTabsProps) {
  const filters = [
    {
      id: "seguindo",
      label: "Seguindo",
      icon: UsersIcon,
      description: `${followingCount} profissionais`,
    },
    {
      id: "para-voce",
      label: "Para Você",
      icon: SparklesIcon,
      description: "Recomendados",
    },
    {
      id: "recentes",
      label: "Recentes",
      icon: ClockIcon,
      description: "Mais novos",
    },
    {
      id: "trending",
      label: "Em Alta",
      icon: HeartSolid,
      description: "Populares",
    },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-2 mb-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {filters.map((filter) => {
          const Icon = filter.icon;
          const isActive = currentFilter === filter.id;

          return (
            <button
              key={filter.id}
              onClick={() => onFilterChange(filter.id)}
              className={`
                relative p-3 rounded-lg transition-all duration-200
                ${
                  isActive
                    ? "bg-emerald-50 border-2 border-emerald-500"
                    : "bg-gray-50 border-2 border-transparent hover:bg-gray-100"
                }
              `}
            >
              <div className="flex flex-col items-center space-y-1">
                <Icon
                  className={`w-5 h-5 ${
                    isActive ? "text-emerald-600" : "text-gray-600"
                  }`}
                />
                <span
                  className={`text-sm font-medium ${
                    isActive ? "text-emerald-700" : "text-gray-700"
                  }`}
                >
                  {filter.label}
                </span>
                <span
                  className={`text-xs ${
                    isActive ? "text-emerald-600" : "text-gray-500"
                  }`}
                >
                  {filter.description}
                </span>
              </div>

              {isActive && (
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================

export default function ImprovedPatientFeed() {
  const { user, profile } = useAuth();
  const {
    posts,
    loading,
    error,
    filter,
    pagination,
    setFilter,
    refresh,
    loadMore,
    toggleLike,
  } = useFeedWithConnections();

  const [followingCount, setFollowingCount] = useState(0);
  const [followingStatus, setFollowingStatus] = useState<
    Record<string, boolean>
  >({});

  // Carregar contagem de seguindo
  useEffect(() => {
    if (user) {
      loadFollowingCount();
    }
  }, [user]);

  const loadFollowingCount = async () => {
    try {
      const response = await fetch(
        `/api/connections/count-following?user_id=${user?.id}`
      );
      const data = await response.json();
      if (data.success) {
        setFollowingCount(data.following_count);
      }
    } catch (error) {
      console.error("Erro ao carregar contagem:", error);
    }
  };

  // Função para seguir/deixar de seguir
  const handleFollow = async (authorId: string) => {
    if (!user) {
      alert("Você precisa estar logado para seguir profissionais");
      return;
    }

    try {
      const isFollowing = followingStatus[authorId];
      const method = isFollowing ? "DELETE" : "POST";
      const endpoint = isFollowing
        ? "/api/connections/unfollow"
        : "/api/connections/follow";

      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.id}`,
        },
        body: JSON.stringify({ following_id: authorId }),
      });

      const data = await response.json();

      if (data.success) {
        setFollowingStatus((prev) => ({
          ...prev,
          [authorId]: !isFollowing,
        }));

        // Atualizar contagem
        setFollowingCount((prev) => (isFollowing ? prev - 1 : prev + 1));

        // Se estiver no filtro "seguindo", atualizar o feed
        if (filter === "seguindo") {
          refresh();
        }
      } else {
        alert(data.error || "Erro ao processar ação");
      }
    } catch (error) {
      console.error("Erro ao seguir/deixar de seguir:", error);
    }
  };

  // Estados de carregamento e erro
  if (loading && posts.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500 mx-auto mb-4" />
          <p className="text-gray-600">Carregando conteúdos terapêuticos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6">
        <p className="text-red-800 font-medium mb-3">Erro ao carregar feed</p>
        <p className="text-red-600 text-sm mb-4">{error}</p>
        <button
          onClick={refresh}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
        >
          Tentar Novamente
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Biblioteca Viva
        </h1>
        <p className="text-gray-600">
          Conteúdo terapêutico selecionado para sua jornada de bem-estar
        </p>
      </div>

      {/* Filtros */}
      <FilterTabs
        currentFilter={filter}
        onFilterChange={setFilter}
        followingCount={followingCount}
      />

      {/* Posts */}
      <div className="space-y-6">
        {posts.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            {filter === "seguindo" ? (
              <>
                <UsersIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 font-medium mb-2">
                  Você ainda não segue nenhum profissional
                </p>
                <p className="text-gray-500 text-sm mb-4">
                  Explore a aba "Para Você" para descobrir profissionais
                  incríveis
                </p>
                <button
                  onClick={() => setFilter("para-voce")}
                  className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700"
                >
                  Descobrir Profissionais
                </button>
              </>
            ) : (
              <p className="text-gray-600">
                Nenhum conteúdo disponível no momento
              </p>
            )}
          </div>
        ) : (
          posts.map((post: Post) => (
            <div
              key={post.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200"
            >
              {/* Header do Post */}
              <div className="p-4 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {/* Avatar */}
                    {post.author?.foto_perfil_url ? (
                      <img
                        src={post.author.foto_perfil_url}
                        alt={post.author.nome}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-blue-500 flex items-center justify-center text-white font-bold">
                        {post.author?.nome?.[0]}
                      </div>
                    )}

                    {/* Info do Autor */}
                    <div>
                      <div className="flex items-center space-x-2">
                        <p className="font-semibold text-gray-900">
                          {post.author?.nome} {post.author?.sobrenome}
                        </p>
                        {post.author?.verificado && (
                          <span className="text-blue-500">✓</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">
                        {post.author?.especialidades || "Profissional"}
                      </p>
                    </div>
                  </div>

                  {/* Botão Seguir */}
                  {user &&
                    post.author?.user_id &&
                    post.author.user_id !== user.id && (
                      <button
                        onClick={() => handleFollow(post.author!.user_id)}
                        className={`
                        flex items-center space-x-1 px-4 py-2 rounded-lg font-medium transition-all
                        ${
                          followingStatus[post.author.user_id]
                            ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            : "bg-emerald-600 text-white hover:bg-emerald-700"
                        }
                      `}
                      >
                        {followingStatus[post.author.user_id] ? (
                          <>
                            <UserMinusIcon className="w-4 h-4" />
                            <span>Seguindo</span>
                          </>
                        ) : (
                          <>
                            <UserPlusIcon className="w-4 h-4" />
                            <span>Seguir</span>
                          </>
                        )}
                      </button>
                    )}
                </div>
              </div>

              {/* Conteúdo do Post */}
              <div className="p-4">
                <p className="text-gray-800 whitespace-pre-wrap">
                  {post.content}
                </p>

                {/* Imagem se houver */}
                {post.image_url && (
                  <img
                    src={post.image_url}
                    alt="Post"
                    className="mt-4 rounded-lg w-full object-cover max-h-96"
                  />
                )}
              </div>

              {/* Footer com Interações */}
              <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {/* Curtir */}
                  <button
                    onClick={() => toggleLike(post.id)}
                    className="flex items-center space-x-1 text-gray-600 hover:text-red-500 transition-colors"
                  >
                    {post.userLiked ? (
                      <HeartSolid className="w-5 h-5 text-red-500" />
                    ) : (
                      <HeartIcon className="w-5 h-5" />
                    )}
                    <span className="text-sm">{post.likes_count}</span>
                  </button>

                  {/* Comentários */}
                  <div className="flex items-center space-x-1 text-gray-600">
                    <ChatBubbleLeftIcon className="w-5 h-5" />
                    <span className="text-sm">{post.comments_count}</span>
                  </div>
                </div>

                {/* Data */}
                <span className="text-xs text-gray-500">
                  {new Date(post.created_at).toLocaleDateString("pt-BR")}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Botão Carregar Mais */}
      {pagination.hasMore && posts.length > 0 && (
        <div className="mt-6 flex justify-center">
          <button
            onClick={loadMore}
            disabled={loading}
            className="bg-white border-2 border-emerald-500 text-emerald-600 px-6 py-3 rounded-lg font-medium hover:bg-emerald-50 disabled:opacity-50"
          >
            {loading ? "Carregando..." : "Carregar Mais"}
          </button>
        </div>
      )}
    </div>
  );
}
