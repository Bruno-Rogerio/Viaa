// viaa/src/components/dashboard/professional/feed/PostCreator.tsx

"use client";
import { useState, useRef } from "react";
import {
  PhotoIcon,
  VideoCameraIcon,
  DocumentTextIcon,
  PaperAirplaneIcon,
  XMarkIcon,
  FaceSmileIcon,
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

const POST_TYPES = {
  text: { label: "Texto", icon: "📝", color: "blue" },
  image: { label: "Imagem", icon: "🖼️", color: "green" },
  video: { label: "Vídeo", icon: "🎥", color: "purple" },
  article: { label: "Artigo", icon: "📄", color: "orange" },
};

const MAX_CHARACTERS = 2000;

export default function PostCreator({
  onPostCreated,
  loading = false,
}: PostCreatorProps) {
  const { profile, user } = useAuth();

  // Extrair dados do profissional corretamente
  const profileData = profile?.dados as PerfilProfissional | null;

  // States
  const [isExpanded, setIsExpanded] = useState(false);
  const [content, setContent] = useState("");
  const [postType, setPostType] = useState<keyof typeof POST_TYPES>("text");
  const [selectedMedia, setSelectedMedia] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Upload image function
  const uploadImage = async (file: File): Promise<string | null> => {
    if (!user) {
      setUploadError("Usuário não autenticado");
      return null;
    }

    try {
      setIsUploading(true);
      setUploadError(null);

      // Validate file
      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/gif",
      ];
      if (!allowedTypes.includes(file.type)) {
        throw new Error(
          "Tipo de arquivo não suportado. Use JPEG, PNG, WebP ou GIF."
        );
      }

      const maxSizeInBytes = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSizeInBytes) {
        throw new Error("Arquivo muito grande. Máximo permitido: 5MB.");
      }

      // Generate unique filename
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 15);
      const extension = file.name.split(".").pop();
      const fileName = `${timestamp}_${randomString}.${extension}`;
      const filePath = `${user.id}/${fileName}`;

      // Upload to Supabase Storage
      const { data, error: uploadError } = await supabase.storage
        .from("post-images")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        throw uploadError;
      }

      if (!data) {
        throw new Error("Upload falhou - dados não retornados");
      }

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("post-images").getPublicUrl(filePath);

      if (!publicUrl) {
        throw new Error("Falha ao obter URL pública");
      }

      console.log("Imagem uploaded com sucesso:", publicUrl);
      return publicUrl;
    } catch (err: any) {
      console.error("Erro no upload:", err);
      const errorMessage = err.message || "Erro no upload da imagem";
      setUploadError(errorMessage);
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  // Auto-resize textarea
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= MAX_CHARACTERS) {
      setContent(value);
    }

    // Auto-resize
    const textarea = e.target;
    textarea.style.height = "auto";
    textarea.style.height = textarea.scrollHeight + "px";
  };

  // Handle media selection
  const handleMediaSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      alert("Arquivo muito grande. Máximo 10MB.");
      return;
    }

    // Validate file type
    const isImage = file.type.startsWith("image/");
    const isVideo = file.type.startsWith("video/");

    if (!isImage && !isVideo) {
      alert("Apenas imagens e vídeos são suportados.");
      return;
    }

    setSelectedMedia(file);
    setPostType(isImage ? "image" : "video");

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setMediaPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Remove media
  const removeMedia = () => {
    setSelectedMedia(null);
    setMediaPreview(null);
    setPostType("text");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Handle submit
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

      // Upload da mídia se existir
      if (selectedMedia) {
        if (selectedMedia.type.startsWith("image/")) {
          const uploadedUrl = await uploadImage(selectedMedia);
          if (!uploadedUrl) {
            throw new Error("Falha no upload da imagem");
          }
          imageUrl = uploadedUrl;
        } else if (selectedMedia.type.startsWith("video/")) {
          // Por enquanto, vídeos usam o mesmo sistema de upload
          const uploadedUrl = await uploadImage(selectedMedia);
          if (!uploadedUrl) {
            throw new Error("Falha no upload do vídeo");
          }
          videoUrl = uploadedUrl;
        }
      }

      // Criar o post com as URLs da mídia
      await onPostCreated({
        content: content.trim(),
        type: postType,
        image_url: imageUrl,
        video_url: videoUrl,
      });

      // Reset form
      setContent("");
      setSelectedMedia(null);
      setMediaPreview(null);
      setPostType("text");
      setIsExpanded(false);

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

  const charactersLeft = MAX_CHARACTERS - content.length;
  const isNearLimit = charactersLeft < 100;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <form onSubmit={handleSubmit}>
        {/* Header */}
        <div className="flex items-start space-x-4 mb-4">
          <Avatar
            src={profileData?.foto_perfil_url}
            alt={profileData?.nome || "Usuário"}
            size="md"
          />

          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <h3 className="font-medium text-gray-900">
                {profileData?.nome} {profileData?.sobrenome}
              </h3>
              {profileData?.verificado && (
                <span className="text-blue-500">✓</span>
              )}
            </div>

            {/* Type selector */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Tipo:</span>
              <div className="flex space-x-1">
                {Object.entries(POST_TYPES).map(([type, config]) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setPostType(type as keyof typeof POST_TYPES)}
                    className={`
                      px-3 py-1 text-xs rounded-full border transition-colors
                      ${
                        postType === type
                          ? "bg-blue-100 text-blue-700 border-blue-300"
                          : "bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-200"
                      }
                    `}
                  >
                    {config.icon} {config.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Content area */}
        <div className="space-y-4">
          <div className="relative">
            <textarea
              ref={textareaRef}
              value={content}
              onChange={handleTextareaChange}
              onClick={() => setIsExpanded(true)}
              placeholder="Compartilhe seu conhecimento, experiências ou insights..."
              className="w-full resize-none border-0 focus:ring-0 text-gray-900 placeholder-gray-500 text-lg min-h-[120px] p-0"
              rows={isExpanded ? 6 : 3}
            />

            {/* Character counter */}
            {isExpanded && (
              <div
                className={`
                absolute bottom-2 right-2 text-xs
                ${isNearLimit ? "text-red-500" : "text-gray-400"}
              `}
              >
                {charactersLeft}
              </div>
            )}
          </div>

          {/* Error messages */}
          {uploadError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-600 text-sm">{uploadError}</p>
            </div>
          )}

          {/* Media preview */}
          {mediaPreview && (
            <div className="relative">
              <div className="relative rounded-lg overflow-hidden border">
                {selectedMedia?.type.startsWith("image/") ? (
                  <img
                    src={mediaPreview}
                    alt="Preview"
                    className="w-full h-64 object-cover"
                  />
                ) : (
                  <video
                    src={mediaPreview}
                    className="w-full h-64 object-cover"
                    controls
                  />
                )}

                <button
                  type="button"
                  onClick={removeMedia}
                  className="absolute top-2 right-2 bg-black bg-opacity-50 text-white p-1 rounded-full hover:bg-opacity-70"
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Actions */}
          {isExpanded && (
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="flex items-center space-x-4">
                {/* Media upload */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleMediaSelect}
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
                  disabled={!!selectedMedia}
                >
                  <PhotoIcon className="w-5 h-5" />
                  <span className="text-sm">Mídia</span>
                </button>

                {/* Future: Emoji picker */}
                <button
                  type="button"
                  className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  <FaceSmileIcon className="w-5 h-5" />
                  <span className="text-sm">Emoji</span>
                </button>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsExpanded(false);
                    setContent("");
                    removeMedia();
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={
                    (!content.trim() && !selectedMedia) ||
                    isSubmitting ||
                    loading ||
                    isUploading
                  }
                  className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting || isUploading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>
                        {isUploading ? "Enviando mídia..." : "Publicando..."}
                      </span>
                    </>
                  ) : (
                    <>
                      <PaperAirplaneIcon className="w-4 h-4" />
                      <span>Publicar</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </form>
    </div>
  );
}
