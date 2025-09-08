// viaa\src\hooks\dashboard\useImageUpload.ts

import { useState, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface UseImageUploadReturn {
  uploading: boolean;
  error: string | null;
  uploadImage: (file: File) => Promise<string | null>;
  deleteImage: (url: string) => Promise<boolean>;
}

export const useImageUpload = (): UseImageUploadReturn => {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateImage = (file: File): string | null => {
    // Verificar tipo de arquivo
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      return "Tipo de arquivo não suportado. Use JPEG, PNG, WebP ou GIF.";
    }

    // Verificar tamanho (5MB máximo)
    const maxSizeInBytes = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSizeInBytes) {
      return "Arquivo muito grande. Máximo permitido: 5MB.";
    }

    return null;
  };

  const generateFileName = (file: File): string => {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const extension = file.name.split(".").pop();
    return `${timestamp}_${randomString}.${extension}`;
  };

  const uploadImage = useCallback(
    async (file: File): Promise<string | null> => {
      if (!user) {
        setError("Usuário não autenticado");
        return null;
      }

      try {
        setUploading(true);
        setError(null);

        // Validar arquivo
        const validationError = validateImage(file);
        if (validationError) {
          setError(validationError);
          return null;
        }

        // Gerar nome único para o arquivo
        const fileName = generateFileName(file);
        const filePath = `${user.id}/${fileName}`;

        // Upload para Supabase Storage
        const { data, error: uploadError } = await supabase.storage
          .from("post-images")
          .upload(filePath, file, {
            cacheControl: "3600",
            upsert: false, // Não sobrescrever arquivos existentes
          });

        if (uploadError) {
          throw uploadError;
        }

        if (!data) {
          throw new Error("Upload falhou - dados não retornados");
        }

        // Obter URL pública da imagem
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
        setError(errorMessage);
        return null;
      } finally {
        setUploading(false);
      }
    },
    [user]
  );

  const deleteImage = useCallback(
    async (url: string): Promise<boolean> => {
      if (!user) {
        setError("Usuário não autenticado");
        return false;
      }

      try {
        setError(null);

        // Extrair o caminho do arquivo da URL
        const urlParts = url.split("/");
        const bucketIndex = urlParts.findIndex(
          (part) => part === "post-images"
        );

        if (bucketIndex === -1 || bucketIndex === urlParts.length - 1) {
          throw new Error("URL da imagem inválida");
        }

        const filePath = urlParts.slice(bucketIndex + 1).join("/");

        // Deletar do Storage
        const { error: deleteError } = await supabase.storage
          .from("post-images")
          .remove([filePath]);

        if (deleteError) {
          throw deleteError;
        }

        console.log("Imagem deletada com sucesso:", filePath);
        return true;
      } catch (err: any) {
        console.error("Erro ao deletar imagem:", err);
        setError(err.message || "Erro ao deletar imagem");
        return false;
      }
    },
    [user]
  );

  return {
    uploading,
    error,
    uploadImage,
    deleteImage,
  };
};
