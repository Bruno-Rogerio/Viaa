// viaa\src\components\dashboard\common\ImageUpload.tsx

"use client";
import { useState, useRef } from "react";
import { PhotoIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useImageUpload } from "@/hooks/dashboard/useImageUpload";
import LoadingSpinner from "./LoadingSpinner";

interface ImageUploadProps {
  onImageUploaded: (url: string) => void;
  onImageRemoved: () => void;
  currentImage?: string;
  className?: string;
}

export default function ImageUpload({
  onImageUploaded,
  onImageRemoved,
  currentImage,
  className = "",
}: ImageUploadProps) {
  const { uploading, error, uploadImage, deleteImage } = useImageUpload();
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    handleUpload(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    // Verificar se é imagem
    if (!file.type.startsWith("image/")) {
      alert("Por favor, selecione apenas arquivos de imagem.");
      return;
    }

    handleUpload(file);
  };

  const handleUpload = async (file: File) => {
    // Criar preview local imediatamente
    const previewUrl = URL.createObjectURL(file);
    setPreview(previewUrl);

    // Upload para Supabase
    const uploadedUrl = await uploadImage(file);

    if (uploadedUrl) {
      // Limpar preview local e usar URL real
      URL.revokeObjectURL(previewUrl);
      setPreview(uploadedUrl);
      onImageUploaded(uploadedUrl);
    } else {
      // Erro no upload - remover preview
      URL.revokeObjectURL(previewUrl);
      setPreview(null);
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemove = async () => {
    if (!preview) return;

    if (currentImage && preview === currentImage) {
      // Deletar do storage se for uma imagem já salva
      await deleteImage(currentImage);
    } else if (preview.startsWith("blob:")) {
      // Limpar preview local
      URL.revokeObjectURL(preview);
    }

    setPreview(null);
    onImageRemoved();
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={className}>
      {/* Preview da Imagem */}
      {preview && (
        <div className="relative mb-4">
          <img
            src={preview}
            alt="Preview"
            className="w-full max-h-64 object-cover rounded-lg border border-gray-300"
          />

          {/* Botão Remover */}
          <button
            type="button"
            onClick={handleRemove}
            disabled={uploading}
            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 disabled:opacity-50"
          >
            <XMarkIcon className="w-4 h-4" />
          </button>

          {/* Loading Overlay */}
          {uploading && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
              <div className="bg-white rounded-lg p-4 flex items-center space-x-2">
                <LoadingSpinner size="sm" />
                <span className="text-sm font-medium">Enviando...</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Área de Upload */}
      {!preview && (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onDragEnter={(e) => e.preventDefault()}
          className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors cursor-pointer"
          onClick={openFileDialog}
        >
          <PhotoIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-sm text-gray-600 mb-2">
            Clique para selecionar ou arraste uma imagem aqui
          </p>
          <p className="text-xs text-gray-500">PNG, JPG, WebP ou GIF até 5MB</p>

          {uploading && (
            <div className="mt-4 flex items-center justify-center space-x-2">
              <LoadingSpinner size="sm" />
              <span className="text-sm text-gray-600">Enviando...</span>
            </div>
          )}
        </div>
      )}

      {/* Input File Oculto */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        disabled={uploading}
      />

      {/* Error Message */}
      {error && (
        <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
    </div>
  );
}
