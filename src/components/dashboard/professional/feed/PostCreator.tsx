// src/components/dashboard/professional/feed/PostCreator.tsx
// 🔧 VERSÃO MOBILE CORRIGIDA - UI simplificada e funcional

"use client";
import { useState, useRef } from "react";
import {
  PhotoIcon,
  VideoCameraIcon,
  PaperAirplaneIcon,
  XMarkIcon,
  FaceSmileIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "@/contexts/AuthContext";
import { PerfilProfissional } from "@/types/database";
import { supabase } from "@/lib/supabase/client";
import Avatar from "../../common/Avatar";

interface PostCreatorProps {
  onPostCreated: (postData: {
    content: string;
    type: "text" | "image" | "video" | "article";
    image_url?: string;
    video_url?: string;
  }) => Promise<void>;
  loading?: boolean;
}

const MAX_CHARACTERS = 2000;

export default function PostCreator({
  onPostCreated,
  loading = false,
}: PostCreatorProps) {
  const { profile, user } = useAuth();
  const profileData = profile?.dados as PerfilProfissional | null;

  // Estados principais
  const [isExpanded, setIsExpanded] = useState(false);
  const [content, setContent] = useState("");
  const [selectedMedia, setSelectedMedia] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showMoreOptions, setShowMoreOptions] = useState(false);

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Upload de imagem
  const uploadImage = async (file: File): Promise<string | null> => {
    if (!user) return null;

    try {
      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/gif",
      ];
      if (!allowedTypes.includes(file.type)) {
        alert("Tipo de arquivo não suportado. Use JPEG, PNG, WebP ou GIF.");
        return null;
      }

      const maxSizeInBytes = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSizeInBytes) {
        alert("Arquivo muito grande. Máximo: 5MB.");
        return null;
      }

      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 15);
      const extension = file.name.split(".").pop();
      const fileName = `${timestamp}_${randomString}.${extension}`;
      const filePath = `${user.id}/${fileName}`;

      const { data, error } = await supabase.storage
        .from("post-images")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (error) throw error;

      const {
        data: { publicUrl },
      } = supabase.storage.from("post-images").getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error("Erro no upload:", error);
      alert("Erro no upload da imagem");
      return null;
    }
  };

  // Auto-resize textarea
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= MAX_CHARACTERS) {
      setContent(value);
    }

    const textarea = e.target;
    textarea.style.height = "auto";
    textarea.style.height = textarea.scrollHeight + "px";
  };

  // Selecionar mídia
  const handleMediaSelect = (type: "image" | "video") => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = type === "image" ? "image/*" : "video/*";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      if (file.size > 10 * 1024 * 1024) {
        alert("Arquivo muito grande. Máximo: 10MB.");
        return;
      }

      setSelectedMedia(file);
      setShowMoreOptions(false);

      // Preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setMediaPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    };
    input.click();
  };

  // Remover mídia
  const removeMedia = () => {
    setSelectedMedia(null);
    setMediaPreview(null);
  };

  // Submeter post
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim() && !selectedMedia) {
      alert("Escreva algo ou adicione uma mídia.");
      return;
    }

    setIsSubmitting(true);

    try {
      let imageUrl: string | undefined;
      let videoUrl: string | undefined;

      if (selectedMedia) {
        if (selectedMedia.type.startsWith("image/")) {
          imageUrl = (await uploadImage(selectedMedia)) || undefined;
        } else if (selectedMedia.type.startsWith("video/")) {
          videoUrl = (await uploadImage(selectedMedia)) || undefined;
        }
      }

      await onPostCreated({
        content: content.trim(),
        type: selectedMedia
          ? selectedMedia.type.startsWith("image/")
            ? "image"
            : "video"
          : "text",
        image_url: imageUrl,
        video_url: videoUrl,
      });

      // Reset
      setContent("");
      setSelectedMedia(null);
      setMediaPreview(null);
      setIsExpanded(false);
      setShowMoreOptions(false);

      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    } catch (error) {
      console.error("Erro ao criar post:", error);
      alert("Erro ao publicar. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="card-mobile space-mobile-md">
      {/* 📱 HEADER COM AVATAR */}
      <div className="flex-mobile-safe space-x-3 mb-3">
        <Avatar
          src={profileData?.foto_perfil_url}
          alt={`${profileData?.nome} ${profileData?.sobrenome}`}
          size="md"
          className="avatar-mobile-md flex-shrink-0"
        />
        <div className="flex-grow">
          <h3 className="text-mobile-base font-semibold text-gray-900">
            {profileData?.nome} {profileData?.sobrenome}
          </h3>
          <p className="text-mobile-xs text-gray-600">
            {profileData?.especialidades || "Profissional de Saúde Mental"}
          </p>
        </div>
      </div>

      {/* 🔧 FORMULÁRIO SIMPLIFICADO */}
      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Textarea */}
        <div>
          <textarea
            ref={textareaRef}
            value={content}
            onChange={handleTextareaChange}
            onFocus={() => setIsExpanded(true)}
            placeholder="O que você gostaria de compartilhar?"
            className="w-full min-h-[80px] p-3 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-mobile-base"
            disabled={isSubmitting}
          />
          <div className="flex justify-between items-center mt-1">
            <span className="text-mobile-xs text-gray-500">
              {content.length}/{MAX_CHARACTERS}
            </span>
          </div>
        </div>

        {/* 📱 PREVIEW DA MÍDIA */}
        {mediaPreview && (
          <div className="relative">
            {selectedMedia?.type.startsWith("image/") ? (
              <img
                src={mediaPreview}
                alt="Preview"
                className="w-full max-h-64 object-cover rounded-lg"
              />
            ) : (
              <video
                src={mediaPreview}
                controls
                className="w-full max-h-64 rounded-lg"
              />
            )}
            <button
              type="button"
              onClick={removeMedia}
              className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full hover:bg-black/70"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* 🔧 AÇÕES RESPONSIVAS - LAYOUT CORRIGIDO */}
        {isExpanded && (
          <div className="flex-mobile-safe justify-between">
            {/* Botões de mídia */}
            <div className="flex-mobile-safe space-x-2">
              <button
                type="button"
                onClick={() => handleMediaSelect("image")}
                className="button-mobile bg-green-50 text-green-600 hover:bg-green-100 border border-green-200"
                disabled={isSubmitting}
              >
                <PhotoIcon className="icon-mobile-sm mr-1" />
                <span className="hidden sm:inline">Mídia</span>
              </button>

              <button
                type="button"
                onClick={() => setShowMoreOptions(!showMoreOptions)}
                className="button-mobile bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200"
                disabled={isSubmitting}
              >
                <PlusIcon className="icon-mobile-sm mr-1" />
                <span className="hidden sm:inline">Mais</span>
              </button>

              {/* Emoji (simples) */}
              <button
                type="button"
                className="button-mobile bg-yellow-50 text-yellow-600 hover:bg-yellow-100 border border-yellow-200"
                disabled={isSubmitting}
                onClick={() => setContent(content + "😊")}
              >
                <FaceSmileIcon className="icon-mobile-sm" />
              </button>
            </div>

            {/* Botão Publicar */}
            <button
              type="submit"
              disabled={isSubmitting || (!content.trim() && !selectedMedia)}
              className="button-mobile bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
            >
              {isSubmitting ? (
                <div className="flex-mobile-safe">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-1"></div>
                  <span className="hidden sm:inline">Enviando...</span>
                </div>
              ) : (
                <div className="flex-mobile-safe">
                  <PaperAirplaneIcon className="icon-mobile-sm mr-1" />
                  <span>Publicar</span>
                </div>
              )}
            </button>
          </div>
        )}

        {/* 🔧 OPÇÕES EXTRAS (DROPDOWN SIMPLES) */}
        {showMoreOptions && (
          <div className="grid-mobile-safe cols-2 gap-2 p-3 bg-gray-50 rounded-lg">
            <button
              type="button"
              onClick={() => handleMediaSelect("video")}
              className="button-mobile bg-purple-50 text-purple-600 hover:bg-purple-100 border border-purple-200"
              disabled={isSubmitting}
            >
              <VideoCameraIcon className="icon-mobile-sm mr-1" />
              Vídeo
            </button>
            <button
              type="button"
              className="button-mobile bg-orange-50 text-orange-600 hover:bg-orange-100 border border-orange-200"
              disabled={isSubmitting}
              onClick={() => alert("Artigo em breve!")}
            >
              📄 Artigo
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
