// src/components/dashboard/shared/feed/PostCard.tsx
// 🔥 POSTCARD PREMIUM - Glassmorphism + Micro-animações

"use client";
import { useState, useRef, useEffect } from "react";
import {
  ShareIcon,
  EllipsisHorizontalIcon,
  CalendarDaysIcon,
  HeartIcon,
  ChatBubbleLeftIcon,
  BookmarkIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import {
  HeartIcon as HeartSolidIcon,
  BookmarkIcon as BookmarkSolidIcon,
} from "@heroicons/react/24/solid";
import Avatar from "../../common/Avatar";
import CommentSection from "./CommentSection";
import { usePostLikes } from "@/hooks/dashboard/usePostLikes";
import { useAuth } from "@/contexts/AuthContext";

interface PostCardProps {
  post: {
    id: string;
    author: {
      id: string;
      name: string;
      specialization: string;
      avatar?: string;
      verified: boolean;
    };
    content: string;
    image?: string;
    createdAt: string;
    likes: number;
    comments: number;
    shares: number;
    isLiked: boolean;
    type: string;
  };
  onLike?: () => void;
  canInteract?: boolean;
  canComment?: boolean;
  showScheduleButton?: boolean;
  onSchedule?: () => void;
}

export default function PostCard({
  post,
  onLike,
  canInteract = true,
  canComment = true,
  showScheduleButton = false,
  onSchedule,
}: PostCardProps) {
  // Estados para interações
  const [localIsLiked, setLocalIsLiked] = useState(post.isLiked);
  const [localLikesCount, setLocalLikesCount] = useState(post.likes);
  const [isLiking, setIsLiking] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Estados para animações
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Hook de curtidas
  const { toggleLike } = usePostLikes();

  // Intersection Observer para animação de entrada
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // 🎨 GRADIENTES POR TIPO DE POST
  const getPostGradient = (type: string) => {
    const gradients = {
      article: "from-blue-500/10 via-cyan-500/5 to-blue-600/10",
      image: "from-purple-500/10 via-pink-500/5 to-purple-600/10",
      video: "from-red-500/10 via-orange-500/5 to-red-600/10",
      text: "from-green-500/10 via-emerald-500/5 to-green-600/10",
      announcement: "from-yellow-500/10 via-amber-500/5 to-yellow-600/10",
    };
    return gradients[type as keyof typeof gradients] || gradients.text;
  };

  // 🎨 BORDA DINÂMICA POR TIPO
  const getBorderGradient = (type: string) => {
    const borders = {
      article: "from-blue-400/20 via-cyan-400/10 to-blue-500/20",
      image: "from-purple-400/20 via-pink-400/10 to-purple-500/20",
      video: "from-red-400/20 via-orange-400/10 to-red-500/20",
      text: "from-green-400/20 via-emerald-400/10 to-green-500/20",
      announcement: "from-yellow-400/20 via-amber-400/10 to-yellow-500/20",
    };
    return borders[type as keyof typeof borders] || borders.text;
  };

  // 🔧 FORMATAÇÃO DE TEMPO
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "Agora";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}min`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
    return `${Math.floor(diffInSeconds / 86400)}d`;
  };

  // 🔧 MANIPULAR CURTIDA
  const handleLikeToggle = async () => {
    if (isLiking || !canInteract) return;

    const newIsLiked = !localIsLiked;
    const newCount = localIsLiked ? localLikesCount - 1 : localLikesCount + 1;

    setLocalIsLiked(newIsLiked);
    setLocalLikesCount(newCount);
    setIsLiking(true);

    try {
      await toggleLike(post.id, newIsLiked);
      onLike?.();
    } catch (error) {
      // Reverter em caso de erro
      setLocalIsLiked(!newIsLiked);
      setLocalLikesCount(localLikesCount);
      console.error("Erro ao curtir:", error);
    } finally {
      setIsLiking(false);
    }
  };

  // 🔧 MANIPULAR BOOKMARK
  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    // TODO: Integrar com API de salvos
  };

  return (
    <article
      ref={cardRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        group relative overflow-hidden transition-all duration-500 ease-out
        ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}
        ${isHovered ? "scale-[1.02] -translate-y-1" : "scale-100 translate-y-0"}
      `}
    >
      {/* 🎨 CONTAINER PRINCIPAL COM GLASSMORPHISM */}
      <div
        className={`
        relative backdrop-blur-xl bg-gradient-to-br ${getPostGradient(
          post.type
        )}
        border border-white/20 rounded-2xl overflow-hidden
        shadow-lg hover:shadow-2xl transition-all duration-300
        before:absolute before:inset-0 before:bg-white/5 before:backdrop-blur-3xl
        ${isHovered ? "before:bg-white/10" : ""}
      `}
      >
        {/* 🌟 BORDA GRADIENTE ANIMADA */}
        <div
          className={`
          absolute inset-0 bg-gradient-to-r ${getBorderGradient(post.type)} 
          opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl
          animate-gradient-x
        `}
        />

        {/* 💫 PARTÍCULAS FLUTUANTES (SUTIL) */}
        <div className="absolute inset-0 pointer-events-none">
          <div
            className={`
            absolute top-4 right-4 w-1 h-1 bg-white/30 rounded-full
            ${isHovered ? "animate-pulse" : ""}
          `}
          />
          <div
            className={`
            absolute bottom-8 left-6 w-0.5 h-0.5 bg-white/20 rounded-full
            ${isHovered ? "animate-bounce delay-75" : ""}
          `}
          />
        </div>

        {/* 📱 CONTEÚDO PRINCIPAL */}
        <div className="relative z-10 p-6">
          {/* 👤 HEADER DO POST */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              {/* Avatar com anel gradiente */}
              <div className="relative">
                <div
                  className={`
                  absolute inset-0 bg-gradient-to-r ${getBorderGradient(
                    post.type
                  )}
                  rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity
                `}
                >
                  <div className="w-full h-full bg-white rounded-full" />
                </div>
                <Avatar
                  src={post.author.avatar}
                  alt={post.author.name}
                  size="md"
                  className="relative z-10 ring-2 ring-white/10 hover:ring-white/30 transition-all"
                />
              </div>

              {/* Info do autor */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <h3 className="font-semibold text-gray-900 truncate hover:text-blue-600 transition-colors cursor-pointer">
                    {post.author.name}
                  </h3>

                  {/* Badge verificado com glassmorphism */}
                  {post.author.verified && (
                    <div className="flex items-center">
                      <div className="relative">
                        <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-sm" />
                        <svg
                          className="relative w-5 h-5 text-blue-500"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    </div>
                  )}

                  {/* Badge tipo de post */}
                  <span
                    className={`
                    inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium
                    bg-white/10 backdrop-blur-sm border border-white/20 text-gray-700
                    group-hover:bg-white/20 transition-all
                  `}
                  >
                    {post.type === "article" && "📄 Artigo"}
                    {post.type === "image" && "🖼️ Imagem"}
                    {post.type === "video" && "🎥 Vídeo"}
                    {post.type === "text" && "💭 Reflexão"}
                    {post.type === "announcement" && "📢 Anúncio"}
                  </span>
                </div>

                <div className="flex items-center space-x-2 mt-1">
                  <p className="text-sm text-gray-600 truncate">
                    {post.author.specialization}
                  </p>
                  <span className="text-gray-400">•</span>
                  <time className="text-sm text-gray-500 flex-shrink-0">
                    {formatTimeAgo(post.createdAt)}
                  </time>
                </div>
              </div>
            </div>

            {/* Menu com glassmorphism */}
            <button
              className={`
              p-2 rounded-xl transition-all duration-200
              bg-white/5 hover:bg-white/10 backdrop-blur-sm
              border border-white/10 hover:border-white/20
              text-gray-400 hover:text-gray-600
              ${isHovered ? "scale-105" : "scale-100"}
            `}
            >
              <EllipsisHorizontalIcon className="w-5 h-5" />
            </button>
          </div>

          {/* 📝 CONTEÚDO DO POST */}
          <div className="mb-4">
            <p className="text-gray-900 leading-relaxed whitespace-pre-wrap">
              {post.content}
            </p>
          </div>

          {/* 🖼️ IMAGEM COM OVERLAY GRADIENTE */}
          {post.image && (
            <div className="relative mb-4 -mx-6 group/image">
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover/image:opacity-100 transition-opacity z-10" />
              <img
                src={post.image}
                alt="Post image"
                className="w-full h-48 sm:h-64 lg:h-80 object-cover transition-transform duration-300 group-hover/image:scale-105"
              />

              {/* Overlay de zoom */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/image:opacity-100 transition-opacity z-20">
                <div className="bg-white/20 backdrop-blur-sm rounded-full p-3 border border-white/30">
                  <SparklesIcon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          )}

          {/* 📊 ESTATÍSTICAS COM GLASSMORPHISM */}
          <div className="flex items-center justify-between py-3 border-t border-white/10">
            <div className="flex items-center space-x-6 text-sm text-gray-600">
              <span className="flex items-center space-x-1">
                <span className="font-medium">{localLikesCount}</span>
                <span>curtidas</span>
              </span>
              <span className="flex items-center space-x-1">
                <span className="font-medium">{post.comments}</span>
                <span>comentários</span>
              </span>
              <span className="flex items-center space-x-1">
                <span className="font-medium">{post.shares}</span>
                <span>compartilhamentos</span>
              </span>
            </div>
          </div>

          {/* 🎮 AÇÕES INTERATIVAS */}
          <div className="flex items-center justify-between pt-3 border-t border-white/10">
            <div className="flex items-center space-x-2">
              {/* Botão curtir com animação */}
              {canInteract && (
                <button
                  onClick={handleLikeToggle}
                  disabled={isLiking}
                  className={`
                    flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-200
                    ${
                      localIsLiked
                        ? "bg-red-50/80 text-red-600 border border-red-200/50"
                        : "bg-white/5 hover:bg-white/10 text-gray-600 hover:text-red-600 border border-white/10 hover:border-red-200/50"
                    }
                    backdrop-blur-sm hover:scale-105 active:scale-95
                    ${isLiking ? "opacity-50 cursor-not-allowed" : ""}
                  `}
                >
                  {localIsLiked ? (
                    <HeartSolidIcon className="w-5 h-5 animate-pulse" />
                  ) : (
                    <HeartIcon className="w-5 h-5" />
                  )}
                  <span className="text-sm font-medium">
                    {localIsLiked ? "Curtido" : "Curtir"}
                  </span>
                </button>
              )}

              {/* Botão comentar */}
              {canComment && (
                <button
                  onClick={() => setShowComments(!showComments)}
                  className={`
                    flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-200
                    bg-white/5 hover:bg-white/10 text-gray-600 hover:text-blue-600
                    border border-white/10 hover:border-blue-200/50 backdrop-blur-sm
                    hover:scale-105 active:scale-95
                  `}
                >
                  <ChatBubbleLeftIcon className="w-5 h-5" />
                  <span className="text-sm font-medium">Comentar</span>
                </button>
              )}

              {/* Botão salvar */}
              <button
                onClick={handleBookmark}
                className={`
                  flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-200
                  ${
                    isBookmarked
                      ? "bg-yellow-50/80 text-yellow-600 border border-yellow-200/50"
                      : "bg-white/5 hover:bg-white/10 text-gray-600 hover:text-yellow-600 border border-white/10 hover:border-yellow-200/50"
                  }
                  backdrop-blur-sm hover:scale-105 active:scale-95
                `}
              >
                {isBookmarked ? (
                  <BookmarkSolidIcon className="w-5 h-5" />
                ) : (
                  <BookmarkIcon className="w-5 h-5" />
                )}
                <span className="text-sm font-medium">
                  {isBookmarked ? "Salvo" : "Salvar"}
                </span>
              </button>
            </div>

            {/* Botão agendar (para pacientes) */}
            {showScheduleButton && onSchedule && (
              <button
                onClick={onSchedule}
                className={`
                  flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-200
                  bg-gradient-to-r from-blue-500 to-purple-600 text-white
                  hover:from-blue-600 hover:to-purple-700 shadow-lg hover:shadow-xl
                  border border-white/20 backdrop-blur-sm
                  hover:scale-105 active:scale-95 font-medium
                `}
              >
                <CalendarDaysIcon className="w-5 h-5" />
                <span>Agendar</span>
              </button>
            )}

            {/* Botão compartilhar */}
            <button
              className={`
              p-2 rounded-xl transition-all duration-200
              bg-white/5 hover:bg-white/10 text-gray-600 hover:text-green-600
              border border-white/10 hover:border-green-200/50 backdrop-blur-sm
              hover:scale-105 active:scale-95
            `}
            >
              <ShareIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* 💬 SEÇÃO DE COMENTÁRIOS EXPANSÍVEL */}
      {showComments && (
        <div
          className={`
          mt-4 transition-all duration-300 ease-out
          ${
            showComments
              ? "opacity-100 translate-y-0"
              : "opacity-0 -translate-y-4"
          }
        `}
        >
          <CommentSection
            postId={post.id}
            postAuthorId={post.author.id}
            postAuthorName={post.author.name}
            initialCommentsCount={post.comments}
            canComment={canComment}
            className="backdrop-blur-xl bg-white/30 border border-white/20"
          />
        </div>
      )}
    </article>
  );
}
