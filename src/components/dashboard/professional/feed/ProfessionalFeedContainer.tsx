// viaa/src/components/dashboard/professional/feed/ProfessionalFeedContainer.tsx

"use client";
import { useState } from "react";
import PostCreator from "./PostCreator";
import PostFilters from "./PostFilters";
import { PostCard } from "../../shared/feed";
import { LoadingSpinner } from "../../common";
import { useFeed } from "@/hooks/dashboard/useFeed";

export default function ProfessionalFeedContainer() {
  const [filter, setFilter] = useState("all");

  const {
    posts,
    loading,
    error,
    pagination,
    createPost,
    loadMore,
    refresh,
    setFilters,
  } = useFeed();

  const handleNewPost = async (postData: {
    content: string;
    type: "text" | "image" | "video" | "article";
    image_url?: string;
    video_url?: string;
  }) => {
    const success = await createPost({
      content: postData.content,
      type: postData.type || "text",
      image_url: postData.image_url,
      video_url: postData.video_url,
    });

    if (!success) {
      alert("Erro ao criar post. Tente novamente.");
    }
  };

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
      {/* Criador de Post */}
      <PostCreator onPostCreated={handleNewPost} />

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

      {/* Lista de Posts */}
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
                isLiked: post.is_liked || false,
                type: post.type,
              }}
              // REMOVIDO: onLike - deixar o PostCard usar o usePostLikes
              canInteract={true}
              canComment={true}
              showScheduleButton={false}
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && posts.length === 0 && !error && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📝</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Nenhum post ainda
          </h3>
          <p className="text-gray-600 mb-6">
            Seja o primeiro a compartilhar conhecimento com a comunidade!
          </p>
        </div>
      )}

      {/* Load More Button */}
      {pagination.has_more && !loading && (
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
