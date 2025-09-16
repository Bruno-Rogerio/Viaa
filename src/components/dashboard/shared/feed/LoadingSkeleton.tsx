// src/components/dashboard/shared/feed/LoadingSkeleton.tsx
// 🔄 LOADING SKELETON PREMIUM - Glassmorphism + Animações

"use client";
import { memo } from "react";

interface LoadingSkeletonProps {
  variant?: "post" | "comment" | "feed" | "compact";
  count?: number;
  showImage?: boolean;
  showActions?: boolean;
  className?: string;
}

// 🔧 COMPONENTE SKELETON BASE
const SkeletonBase = memo(function SkeletonBase({
  className = "",
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div
      className={`
      relative overflow-hidden rounded-lg
      bg-gradient-to-r from-white/5 via-white/10 to-white/5
      backdrop-blur-sm border border-white/10
      ${className}
    `}
    >
      {/* Efeito shimmer */}
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      {children}
    </div>
  );
});

// 🔧 SKELETON DE AVATAR
const AvatarSkeleton = memo(function AvatarSkeleton({
  size = "md",
}: {
  size?: "sm" | "md" | "lg";
}) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
  };

  return (
    <SkeletonBase className={`${sizeClasses[size]} rounded-full flex-shrink-0`}>
      <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-100/20 to-purple-100/20" />
    </SkeletonBase>
  );
});

// 🔧 SKELETON DE TEXTO
const TextSkeleton = memo(function TextSkeleton({
  lines = 1,
  className = "",
  widths = ["100%"],
}: {
  lines?: number;
  className?: string;
  widths?: string[];
}) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, index) => (
        <SkeletonBase
          key={index}
          className="h-4"
          style={{
            width: widths[index % widths.length] || widths[0],
          }}
        >
          <div className="w-full h-full bg-gradient-to-r from-gray-200/20 to-gray-300/20 rounded" />
        </SkeletonBase>
      ))}
    </div>
  );
});

// 🔧 SKELETON DE BOTÃO
const ButtonSkeleton = memo(function ButtonSkeleton({
  width = "w-20",
  height = "h-9",
}: {
  width?: string;
  height?: string;
}) {
  return (
    <SkeletonBase className={`${width} ${height} rounded-xl`}>
      <div className="w-full h-full bg-gradient-to-r from-blue-100/20 to-blue-200/20 rounded-xl" />
    </SkeletonBase>
  );
});

// 🔧 SKELETON DE IMAGEM
const ImageSkeleton = memo(function ImageSkeleton({
  height = "h-48",
  className = "",
}: {
  height?: string;
  className?: string;
}) {
  return (
    <SkeletonBase className={`w-full ${height} ${className}`}>
      <div className="w-full h-full bg-gradient-to-br from-purple-100/20 via-pink-100/20 to-purple-200/20">
        {/* Ícone de imagem no centro */}
        <div className="flex items-center justify-center w-full h-full">
          <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center">
            <svg
              className="w-6 h-6 text-white/30"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        </div>
      </div>
    </SkeletonBase>
  );
});

// 🔧 SKELETON POST COMPLETO
const PostSkeleton = memo(function PostSkeleton({
  showImage = true,
  showActions = true,
}: {
  showImage?: boolean;
  showActions?: boolean;
}) {
  return (
    <article className="group relative">
      {/* Container principal com glassmorphism */}
      <div className="relative backdrop-blur-xl bg-gradient-to-br from-white/5 via-white/8 to-white/5 border border-white/10 rounded-2xl overflow-hidden shadow-lg">
        {/* Borda gradiente animada */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 via-purple-400/10 to-blue-500/10 opacity-50 animate-gradient-x rounded-2xl" />

        {/* Conteúdo */}
        <div className="relative z-10 p-6 space-y-4">
          {/* Header do post */}
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3 flex-1">
              {/* Avatar */}
              <AvatarSkeleton size="md" />

              {/* Info do autor */}
              <div className="flex-1 space-y-2">
                <div className="flex items-center space-x-2">
                  <TextSkeleton lines={1} widths={["140px"]} />
                  {/* Badge verificado */}
                  <SkeletonBase className="w-5 h-5 rounded-full">
                    <div className="w-full h-full bg-blue-200/20 rounded-full" />
                  </SkeletonBase>
                  {/* Badge tipo */}
                  <SkeletonBase className="w-16 h-5 rounded-full">
                    <div className="w-full h-full bg-green-200/20 rounded-full" />
                  </SkeletonBase>
                </div>
                <TextSkeleton lines={1} widths={["180px"]} />
              </div>
            </div>

            {/* Menu */}
            <SkeletonBase className="w-8 h-8 rounded-xl">
              <div className="w-full h-full bg-gray-200/20 rounded-xl" />
            </SkeletonBase>
          </div>

          {/* Conteúdo do post */}
          <div className="space-y-3">
            <TextSkeleton lines={3} widths={["100%", "95%", "75%"]} />
          </div>

          {/* Imagem (opcional) */}
          {showImage && (
            <ImageSkeleton height="h-48 sm:h-64" className="-mx-6 mt-4" />
          )}

          {/* Estatísticas */}
          <div className="flex items-center justify-between py-3 border-t border-white/10">
            <div className="flex items-center space-x-6">
              <TextSkeleton lines={1} widths={["60px"]} />
              <TextSkeleton lines={1} widths={["80px"]} />
              <TextSkeleton lines={1} widths={["90px"]} />
            </div>
          </div>

          {/* Ações (opcional) */}
          {showActions && (
            <div className="flex items-center justify-between pt-3 border-t border-white/10">
              <div className="flex items-center space-x-2">
                <ButtonSkeleton width="w-20" />
                <ButtonSkeleton width="w-24" />
                <ButtonSkeleton width="w-16" />
              </div>
              <ButtonSkeleton width="w-8" height="h-8" />
            </div>
          )}
        </div>
      </div>
    </article>
  );
});

// 🔧 SKELETON COMENTÁRIO
const CommentSkeleton = memo(function CommentSkeleton({
  depth = 0,
  showReplies = false,
}: {
  depth?: number;
  showReplies?: boolean;
}) {
  const marginLeft = depth > 0 ? "ml-8 sm:ml-12" : "";

  return (
    <div className={marginLeft}>
      {/* Thread line para respostas */}
      {depth > 0 && (
        <div className="absolute left-6 sm:left-9 top-0 w-0.5 h-full bg-white/10" />
      )}

      <div className="flex space-x-3 py-3">
        {/* Avatar */}
        <AvatarSkeleton size={depth > 0 ? "sm" : "md"} />

        {/* Conteúdo */}
        <div className="flex-1 space-y-2">
          {/* Header */}
          <div className="flex items-center space-x-2">
            <TextSkeleton lines={1} widths={["120px"]} />
            <SkeletonBase className="w-4 h-4 rounded-full">
              <div className="w-full h-full bg-blue-200/20 rounded-full" />
            </SkeletonBase>
            <TextSkeleton lines={1} widths={["40px"]} />
          </div>

          {/* Conteúdo do comentário */}
          <TextSkeleton lines={2} widths={["100%", "70%"]} />

          {/* Ações */}
          <div className="flex items-center space-x-4 pt-2">
            <ButtonSkeleton width="w-12" height="h-6" />
            <ButtonSkeleton width="w-16" height="h-6" />
            {showReplies && <ButtonSkeleton width="w-20" height="h-6" />}
          </div>
        </div>
      </div>
    </div>
  );
});

// 🔧 SKELETON FEED COMPLETO
const FeedSkeleton = memo(function FeedSkeleton({
  count = 3,
}: {
  count?: number;
}) {
  return (
    <div className="space-y-6">
      {Array.from({ length: count }).map((_, index) => (
        <PostSkeleton
          key={index}
          showImage={index % 2 === 0} // Alternar posts com/sem imagem
          showActions={true}
        />
      ))}
    </div>
  );
});

// 🔧 SKELETON COMPACTO
const CompactSkeleton = memo(function CompactSkeleton({
  count = 5,
}: {
  count?: number;
}) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl p-4"
        >
          <div className="flex items-center space-x-3">
            <AvatarSkeleton size="sm" />
            <div className="flex-1 space-y-2">
              <TextSkeleton lines={1} widths={["150px"]} />
              <TextSkeleton lines={1} widths={["200px"]} />
            </div>
            <TextSkeleton lines={1} widths={["40px"]} />
          </div>
        </div>
      ))}
    </div>
  );
});

// 🔧 COMPONENTE PRINCIPAL
export default function LoadingSkeleton({
  variant = "post",
  count = 1,
  showImage = true,
  showActions = true,
  className = "",
}: LoadingSkeletonProps) {
  const renderSkeleton = () => {
    switch (variant) {
      case "post":
        return count === 1 ? (
          <PostSkeleton showImage={showImage} showActions={showActions} />
        ) : (
          <div className="space-y-6">
            {Array.from({ length: count }).map((_, index) => (
              <PostSkeleton
                key={index}
                showImage={showImage && index % 2 === 0}
                showActions={showActions}
              />
            ))}
          </div>
        );

      case "comment":
        return (
          <div className="space-y-4">
            {Array.from({ length: count }).map((_, index) => (
              <CommentSkeleton
                key={index}
                depth={index > 2 ? 1 : 0}
                showReplies={index === 0}
              />
            ))}
          </div>
        );

      case "feed":
        return <FeedSkeleton count={count} />;

      case "compact":
        return <CompactSkeleton count={count} />;

      default:
        return <PostSkeleton showImage={showImage} showActions={showActions} />;
    }
  };

  return (
    <div className={`animate-slide-in-up ${className}`}>{renderSkeleton()}</div>
  );
}

// 🔧 EXPORTS ADICIONAIS
export {
  PostSkeleton,
  CommentSkeleton,
  FeedSkeleton,
  CompactSkeleton,
  AvatarSkeleton,
  TextSkeleton,
  ButtonSkeleton,
  ImageSkeleton,
};
