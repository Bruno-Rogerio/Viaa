// src/components/dashboard/patient/feed/ImprovedPatientFeed.tsx
// ✅ CORRIGIDO - targetProfileId sendo passado corretamente

"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase/client";
import { Post } from "@/types/feed";
import { LoadingSpinner } from "../../common";
import FollowButton from "../../common/FollowButton";
import {
  HeartIcon,
  ChatBubbleLeftIcon,
  CalendarIcon,
  CheckBadgeIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";

interface FilterTabsProps {
  currentFilter: string;
  onFilterChange: (filter: string) => void;
}

interface ImprovedPatientFeedProps {
  currentFilter?: string;
  onFilterChange?: (filter: string) => void;
}

export default function ImprovedPatientFeed({
  currentFilter = "all",
  onFilterChange,
}: ImprovedPatientFeedProps) {
  const { getProfileId, getUserType } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState(currentFilter);

  const currentUserType = getUserType();
  const currentProfileId = getProfileId();

  useEffect(() => {
    loadPosts();
  }, [filter]);

  const loadPosts = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: queryError } = await supabase
        .from("posts")
        .select(
          `
          *,
          author:perfis_profissionais!posts_profissional_id_fkey (
            id,
            nome,
            sobrenome,
            especialidades,
            foto_perfil_url,
            verificado
          )
        `
        )
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(10);

      if (queryError) throw queryError;

      setPosts(data || []);
    } catch (err: any) {
      console.error("Erro ao carregar posts:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilter: string) => {
    setFilter(newFilter);
    if (onFilterChange) {
      onFilterChange(newFilter);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-4">
        <p className="text-red-800 font-medium">Erro ao carregar posts</p>
        <p className="text-red-600 text-sm mt-1">{error}</p>
        <button
          onClick={loadPosts}
          className="mt-3 bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

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
      <FilterTabs currentFilter={filter} onFilterChange={handleFilterChange} />

      {/* Posts */}
      {posts.length === 0 ? (
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
      ) : (
        <div className="space-y-6">
          {posts.map((post) => (
            <PostCardReadOnly
              key={post.id}
              post={post}
              currentProfileId={currentProfileId}
              currentUserType={currentUserType}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function FilterTabs({ currentFilter, onFilterChange }: FilterTabsProps) {
  const filters = [
    { id: "all", label: "Todos", icon: "🏠" },
    { id: "connections", label: "Seguindo", icon: "👥" },
    { id: "trending", label: "Em alta", icon: "🔥" },
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex items-center space-x-2 overflow-x-auto">
        <span className="text-sm font-medium text-gray-700 whitespace-nowrap mr-4">
          Filtrar por:
        </span>
        {filters.map((filter) => (
          <button
            key={filter.id}
            onClick={() => onFilterChange(filter.id)}
            className={`
              flex items-center space-x-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors
              ${
                currentFilter === filter.id
                  ? "bg-blue-100 text-blue-700 border border-blue-200"
                  : "text-gray-600 hover:bg-gray-100"
              }
            `}
          >
            <span>{filter.icon}</span>
            <span className="text-sm font-medium">{filter.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

interface PostCardReadOnlyProps {
  post: Post;
  currentProfileId: string | null;
  currentUserType: "paciente" | "profissional" | "clinica" | "empresa" | null;
}

function PostCardReadOnly({
  post,
  currentProfileId,
  currentUserType,
}: PostCardReadOnlyProps) {
  const formatRelativeTime = (date: string) => {
    const now = new Date();
    const postDate = new Date(date);
    const diff = Math.floor((now.getTime() - postDate.getTime()) / 1000);

    if (diff < 60) return "há poucos segundos";
    if (diff < 3600) return `há ${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `há ${Math.floor(diff / 3600)}h`;
    if (diff < 604800) return `há ${Math.floor(diff / 86400)}d`;
    return postDate.toLocaleDateString("pt-BR");
  };

  // 🔍 DEBUG - Ver o que está sendo passado
  console.log("🎯 PostCardReadOnly:", {
    postAuthorId: post.author.id,
    currentProfileId,
    shouldShowButton: post.author.id !== currentProfileId,
  });

  return (
    <article className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {/* Avatar */}
            {post.author.foto_perfil_url ? (
              <img
                src={post.author.foto_perfil_url}
                alt={post.author.nome}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-emerald-400 flex items-center justify-center text-white font-semibold">
                {post.author.nome.charAt(0)}
                {post.author.sobrenome.charAt(0)}
              </div>
            )}

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-gray-900 truncate">
                  {post.author.nome} {post.author.sobrenome}
                </h3>
                {post.author.verificado && (
                  <CheckBadgeIcon className="w-5 h-5 text-blue-500 flex-shrink-0" />
                )}
              </div>
              <p className="text-sm text-gray-600 truncate">
                {post.author.especialidades || "Profissional"}
              </p>
            </div>
          </div>

          {/* Botão Seguir - 🔧 CORRIGIDO: Passando targetProfileId */}
          {currentProfileId &&
            currentUserType &&
            post.author.id &&
            post.author.id !== currentProfileId && (
              <div className="flex-shrink-0 ml-2">
                <FollowButton
                  targetProfileId={post.author.id}
                  variant="secondary"
                  size="sm"
                />
              </div>
            )}
        </div>

        <time className="text-sm text-gray-500 mt-2 block">
          {formatRelativeTime(post.created_at)}
        </time>
      </div>

      {/* Content */}
      <div className="p-4">
        <p className="text-gray-800 whitespace-pre-wrap">{post.content}</p>
      </div>

      {/* Media */}
      {post.image_url && (
        <div className="px-4 pb-4">
          <img
            src={post.image_url}
            alt="Post"
            className="w-full rounded-lg object-cover max-h-96"
          />
        </div>
      )}

      {post.video_url && (
        <div className="px-4 pb-4">
          <video
            src={post.video_url}
            controls
            className="w-full rounded-lg max-h-96"
          />
        </div>
      )}

      {/* Stats & Actions */}
      <div className="px-4 py-3 border-t border-gray-100">
        <div className="flex items-center justify-between">
          {/* Stats (Read-only) */}
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <HeartIcon className="w-5 h-5" />
              <span>{post.likes_count}</span>
            </div>
            <div className="flex items-center gap-1">
              <ChatBubbleLeftIcon className="w-5 h-5" />
              <span>{post.comments_count}</span>
            </div>
          </div>

          {/* Schedule Button */}
          <Link
            href={`/dashboard/paciente/profissionais/${post.author.id}`}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium"
          >
            <CalendarIcon className="w-4 h-4" />
            <span>Agendar</span>
          </Link>
        </div>
      </div>
    </article>
  );
}
