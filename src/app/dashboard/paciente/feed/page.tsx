// src/app/dashboard/paciente/feed/page.tsx
// 📱 Feed Personalizado do Paciente - "Biblioteca Viva"

"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { PatientLayout } from "@/components/dashboard/patient/layout";
import { useConnections } from "@/hooks/useConnections";
import {
  HeartIcon,
  ChatBubbleLeftIcon,
  ArrowUpTrayIcon,
  EllipsisHorizontalIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolid } from "@heroicons/react/24/solid";
import Link from "next/link";

// ============================================================
// 📋 TIPOS
// ============================================================

interface Post {
  id: string;
  profissional_id: string;
  content: string;
  image_url?: string;
  video_url?: string;
  type: "text" | "image" | "video" | "article";
  likes_count: number;
  comments_count: number;
  shares_count: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  author?: {
    id: string;
    nome: string;
    sobrenome: string;
    especialidades?: string;
    foto_perfil_url?: string;
    verificado?: boolean;
    ciudad?: string;
    estado?: string;
  };
  userLiked?: boolean;
}

interface FeedFilter {
  type: "seguindo" | "para-voce" | "recentes";
}

// ============================================================
// 🎯 COMPONENTE PRINCIPAL
// ============================================================

export default function FeedPage() {
  const { user, profile } = useAuth();
  const { isFollowing: checkFollow } = useConnections(
    profile?.dados?.id || "",
    user?.id || ""
  );

  // Estados
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FeedFilter["type"]>("seguindo");
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());

  // ========== CARREGAR POSTS ==========
  useEffect(() => {
    loadPosts();
  }, [filter, user]);

  const loadPosts = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/posts?filter=${filter}`, {
        headers: {
          Authorization: `Bearer ${user?.id}`,
        },
      });

      if (!response.ok) {
        throw new Error("Erro ao carregar posts");
      }

      const data = await response.json();
      setPosts(data.posts || []);
    } catch (err: any) {
      setError(err.message);
      console.error("Erro ao carregar posts:", err);
    } finally {
      setLoading(false);
    }
  };

  // ========== LIKE POST ==========
  const toggleLikePost = async (postId: string) => {
    try {
      const isLiked = likedPosts.has(postId);
      const method = isLiked ? "DELETE" : "POST";

      const response = await fetch(`/api/posts/${postId}/like`, {
        method,
        headers: {
          Authorization: `Bearer ${user?.id}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Erro ao atualizar like");
      }

      // Atualizar estado local
      if (isLiked) {
        likedPosts.delete(postId);
      } else {
        likedPosts.add(postId);
      }
      setLikedPosts(new Set(likedPosts));

      // Atualizar contador no post
      setPosts(
        posts.map((post) =>
          post.id === postId
            ? {
                ...post,
                likes_count: isLiked
                  ? post.likes_count - 1
                  : post.likes_count + 1,
              }
            : post
        )
      );
    } catch (err: any) {
      console.error("Erro ao dar like:", err);
    }
  };

  // ========== RENDER ==========

  return (
    <PatientLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white/95 backdrop-blur border-b border-gray-200 rounded-b-2xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Biblioteca Viva
              </h1>
              <p className="text-sm text-gray-600">
                Conteúdo dos profissionais que você segue
              </p>
            </div>
            <SparklesIcon className="w-8 h-8 text-emerald-500" />
          </div>

          {/* Filtros */}
          <div className="mt-4 flex gap-2">
            {(
              [
                { value: "seguindo", label: "Seguindo" },
                { value: "para-voce", label: "Para Você" },
                { value: "recentes", label: "Recentes" },
              ] as const
            ).map((f) => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  filter === f.value
                    ? "bg-emerald-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="text-red-800 font-medium">Erro ao carregar posts</p>
            <button
              onClick={loadPosts}
              className="mt-3 bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700 transition-colors"
            >
              Tentar novamente
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl p-6 animate-pulse">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gray-200" />
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-1/3 mb-2" />
                    <div className="h-3 bg-gray-200 rounded w-1/4" />
                  </div>
                </div>
                <div className="h-6 bg-gray-200 rounded w-full mb-2" />
                <div className="h-6 bg-gray-200 rounded w-4/5" />
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && posts.length === 0 && (
          <div className="bg-white rounded-xl p-12 text-center">
            <SparklesIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Nenhum post para mostrar
            </h3>
            <p className="text-gray-600 mb-6">
              Comece a seguir profissionais para ver seus posts aqui
            </p>
            <Link
              href="/dashboard/paciente/profissionais"
              className="inline-block bg-emerald-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-emerald-600 transition-colors"
            >
              Buscar Profissionais
            </Link>
          </div>
        )}

        {/* Posts */}
        {!loading && posts.length > 0 && (
          <div className="space-y-6">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                isLiked={likedPosts.has(post.id)}
                onLike={() => toggleLikePost(post.id)}
              />
            ))}
          </div>
        )}
      </div>
    </PatientLayout>
  );
}

// ============================================================
// 🎴 COMPONENTE DO CARD DE POST
// ============================================================

interface PostCardProps {
  post: Post;
  isLiked: boolean;
  onLike: () => void;
}

function PostCard({ post, isLiked, onLike }: PostCardProps) {
  const {
    follow,
    unfollow,
    isFollowing: checkFollowing,
  } = useConnections(
    post.author?.id || "",
    post.author?.id ? "dummy-auth-token" : ""
  );

  const [isFollowing, setIsFollowing] = useState(false);

  // Verificar se já segue ao montar
  useEffect(() => {
    setIsFollowing(checkFollowing);
  }, [checkFollowing]);

  const handleFollow = async () => {
    try {
      if (isFollowing) {
        await unfollow();
        setIsFollowing(false);
      } else {
        await follow();
        setIsFollowing(true);
      }
    } catch (err) {
      console.error("Erro ao seguir:", err);
    }
  };

  // Formatar data relativa
  const formatarDataRelativa = (data: string) => {
    const agora = new Date();
    const postData = new Date(data);
    const diferenca = Math.floor((agora.getTime() - postData.getTime()) / 1000);

    if (diferenca < 60) return "há poucos segundos";
    if (diferenca < 3600) return `há ${Math.floor(diferenca / 60)}m`;
    if (diferenca < 86400) return `há ${Math.floor(diferenca / 3600)}h`;
    if (diferenca < 604800) return `há ${Math.floor(diferenca / 86400)}d`;
    return postData.toLocaleDateString("pt-BR");
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
      {/* Header do Post */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {/* Avatar */}
            {post.author?.foto_perfil_url ? (
              <img
                src={post.author.foto_perfil_url}
                alt={post.author?.nome}
                className="w-12 h-12 rounded-full object-cover flex-shrink-0"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-emerald-400 flex items-center justify-center text-white font-semibold flex-shrink-0">
                {post.author?.nome?.charAt(0)}
                {post.author?.sobrenome?.charAt(0)}
              </div>
            )}

            {/* Info do Autor */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-semibold text-gray-900 truncate">
                  {post.author?.nome} {post.author?.sobrenome}
                </p>
                {post.author?.verificado && (
                  <span className="text-blue-500 text-sm">✓</span>
                )}
              </div>
              <p className="text-xs text-gray-600 truncate">
                {post.author?.especialidades || "Profissional"}
              </p>
            </div>
          </div>

          {/* Menu */}
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0">
            <EllipsisHorizontalIcon className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Botão Seguir */}
        {post.author?.id && (
          <button
            onClick={handleFollow}
            className={`mt-3 w-full py-2 px-4 rounded-lg font-medium transition-all text-sm ${
              isFollowing
                ? "bg-gray-100 text-gray-900 hover:bg-gray-200"
                : "bg-emerald-500 text-white hover:bg-emerald-600"
            }`}
          >
            {isFollowing ? "Deixar de seguir" : "Seguir"}
          </button>
        )}
      </div>

      {/* Conteúdo */}
      <div className="p-4">
        {/* Texto */}
        <p className="text-gray-900 leading-relaxed text-base mb-3">
          {post.content}
        </p>

        {/* Imagem */}
        {post.image_url && (
          <img
            src={post.image_url}
            alt="Post"
            className="w-full rounded-lg mb-3 max-h-96 object-cover"
          />
        )}

        {/* Vídeo */}
        {post.video_url && (
          <video
            src={post.video_url}
            controls
            className="w-full rounded-lg mb-3 max-h-96 bg-black"
          />
        )}

        {/* Data */}
        <p className="text-xs text-gray-600">
          {formatarDataRelativa(post.created_at)}
        </p>
      </div>

      {/* Footer - Interações */}
      <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-t border-gray-100">
        {/* Like */}
        <button
          onClick={onLike}
          className="flex items-center gap-2 text-sm transition-colors group"
        >
          {isLiked ? (
            <HeartSolid className="w-5 h-5 text-red-500" />
          ) : (
            <HeartIcon className="w-5 h-5 text-gray-600 group-hover:text-red-500" />
          )}
          <span
            className={
              isLiked
                ? "text-red-500 font-medium"
                : "text-gray-600 group-hover:text-red-500"
            }
          >
            {post.likes_count}
          </span>
        </button>

        {/* Comentários */}
        <Link
          href={`/dashboard/paciente/feed/${post.id}`}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-emerald-600 transition-colors"
        >
          <ChatBubbleLeftIcon className="w-5 h-5" />
          <span>{post.comments_count}</span>
        </Link>

        {/* Compartilhar */}
        <button className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 transition-colors">
          <ArrowUpTrayIcon className="w-5 h-5" />
          <span>{post.shares_count}</span>
        </button>
      </div>
    </div>
  );
}
