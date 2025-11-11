// src/components/dashboard/patient/feed/PostCardReadOnly.tsx
// ✅ POST CARD PARA PACIENTES - Apenas leitura

import {
  HeartIcon,
  ChatBubbleLeftIcon,
  CalendarIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";

interface Author {
  id: string;
  name: string;
  specialization: string;
  avatar?: string;
  verified: boolean;
}

interface Post {
  id: string;
  author: Author;
  content: string;
  image?: string;
  video?: string;
  createdAt: string;
  likes: number;
  comments: number;
  type: "text" | "image" | "video" | "article";
}

interface PostCardReadOnlyProps {
  post: Post;
  showScheduleButton?: boolean;
}

export default function PostCardReadOnly({
  post,
  showScheduleButton = true,
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

  return (
    <article className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Avatar */}
            {post.author.avatar ? (
              <img
                src={post.author.avatar}
                alt={post.author.name}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-emerald-400 flex items-center justify-center text-white font-semibold">
                {post.author.name.charAt(0)}
              </div>
            )}

            {/* Author Info */}
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-gray-900">
                  {post.author.name}
                </h3>
                {post.author.verified && (
                  <svg
                    className="w-4 h-4 text-blue-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </div>
              <p className="text-sm text-gray-600">
                {post.author.specialization}
              </p>
            </div>
          </div>

          <time className="text-sm text-gray-500">
            {formatRelativeTime(post.createdAt)}
          </time>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <p className="text-gray-800 whitespace-pre-wrap">{post.content}</p>
      </div>

      {/* Media */}
      {post.image && (
        <div className="px-4 pb-4">
          <img
            src={post.image}
            alt="Post image"
            className="w-full rounded-lg object-cover max-h-96"
          />
        </div>
      )}

      {post.video && (
        <div className="px-4 pb-4">
          <video
            src={post.video}
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
              <span>{post.likes}</span>
            </div>
            <div className="flex items-center gap-1">
              <ChatBubbleLeftIcon className="w-5 h-5" />
              <span>{post.comments}</span>
            </div>
          </div>

          {/* Schedule Button */}
          {showScheduleButton && (
            <Link
              href={`/dashboard/paciente/profissionais/${post.author.id}`}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium"
            >
              <CalendarIcon className="w-4 h-4" />
              <span>Agendar Consulta</span>
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
