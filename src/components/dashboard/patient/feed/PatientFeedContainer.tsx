// src/components/dashboard/patient/feed/PatientFeedContainer.tsx
// 🎯 INTEGRADO COM FOLLOW - Prioridade Alta #1

"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase/client";
import { PostCard } from "../../shared/feed";
import PostFilters from "../../professional/feed/PostFilters";
import FollowButton from "../../common/FollowButton";
import { LoadingSpinner } from "../../common";
import { useFeed } from "@/hooks/dashboard/useFeed";
import { UserGroupIcon, CheckBadgeIcon } from "@heroicons/react/24/outline";

export default function PatientFeedContainer() {
  const { user } = useAuth();
  const [filter, setFilter] = useState("all");
  const [authToken, setAuthToken] = useState<string | null>(null);

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
          <p className="text-red-800 font-medium">Erro ao carregar posts</p>
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

      {/* Posts com Follow integrado */}
      {posts.length > 0 && (
        <div className="space-y-6">
          {posts.map((post) => (
            <div key={post.id} className="space-y-3">
              {/* Header do Post com Follow Button */}
              <div className="flex items-center justify-between px-4 py-2 bg-white rounded-t-xl border border-b-0 border-gray-200">
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

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">
                      {post.author?.nome} {post.author?.sobrenome}
                    </p>
                    <p className="text-xs text-gray-600">
                      {post.author?.especialidades || "Profissional"}
                    </p>
                  </div>
                </div>

                {/* Botão Follow */}
                {authToken && post.author?.id && (
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

              {/* Post Card */}
              <div className="border-t-0 border border-gray-200 rounded-b-xl overflow-hidden">
                <PostCard
                  post={{
                    id: post.id,
                    author: {
                      id: post.author?.id || "",
                      name: `${post.author?.nome} ${post.author?.sobrenome}`,
                      specialization:
                        post.author?.especialidades || "Profissional",
                      avatar: post.author?.foto_perfil_url,
                      verified: post.author?.verificado || false,
                    },
                    content: post.content || "",
                    image: post.image_url,
                    createdAt: post.created_at,
                    likes: post.likes_count || 0,
                    comments: post.comments_count || 0,
                    shares: post.shares_count || 0,
                    isLiked: post.is_liked || false,
                    type: post.type || "text",
                  }}
                  canInteract={false}
                  canComment={false}
                  showScheduleButton={true}
                />
              </div>

              {/* Estatísticas de Seguidor */}
              <div className="flex items-center space-x-4 px-4 py-2 bg-gray-50 rounded-b-xl border border-t-0 border-gray-200 text-xs text-gray-600">
                <button className="flex items-center space-x-1 hover:text-gray-900 cursor-pointer">
                  <UserGroupIcon className="w-4 h-4" />
                  <span>Ver seguidores</span>
                </button>
              </div>
            </div>
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

      {/* Empty State */}
      {!loading && posts.length === 0 && !error && (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <div className="text-6xl mb-4">📝</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Nenhum post ainda
          </h3>
          <p className="text-gray-600">
            Siga profissionais para ver seus conteúdos aqui!
          </p>
        </div>
      )}
    </div>
  );
}
