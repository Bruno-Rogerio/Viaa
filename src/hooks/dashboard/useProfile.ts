// src/hooks/dashboard/useProfile.ts
// Hook para gerenciar perfil profissional - VERSÃO COMPLETA COM DEBUG

import { useState, useCallback, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase/client";
import type { PerfilProfissional } from "@/types/database";

interface ProfileFormData {
  // Dados pessoais
  nome: string;
  sobrenome: string;
  email: string;
  telefone: string;
  data_nascimento: string;

  // Dados profissionais
  especialidades: string;
  bio_profissional: string;
  formacao_principal: string;
  experiencia_anos: number;
  valor_sessao: number;
  abordagem_terapeutica: string;

  // Localização
  endereco_cidade: string;
  endereco_estado: string;
  endereco_cep: string;
  endereco_logradouro: string;
  endereco_numero: string;
  endereco_bairro: string;
  endereco_complemento: string;

  // Links sociais
  link_linkedin: string;
  link_instagram: string;
  link_youtube: string;
  site_pessoal: string;

  // Foto
  foto_perfil_url: string;
}

interface UseProfileReturn {
  // Estados
  profileData: PerfilProfissional | null;
  formData: ProfileFormData;
  isEditing: boolean;
  loading: boolean;
  saving: boolean;
  uploadingPhoto: boolean;
  errors: Record<string, string>;

  // Actions
  toggleEditing: () => void;
  updateField: (field: keyof ProfileFormData, value: string | number) => void;
  saveProfile: () => Promise<boolean>;
  uploadPhoto: (file: File) => Promise<boolean>;
  refreshProfile: () => Promise<void>;
  resetForm: () => void;
}

export const useProfile = (): UseProfileReturn => {
  const { user, profile, refreshProfile: refreshAuthProfile } = useAuth();

  // Estados
  const [profileData, setProfileData] = useState<PerfilProfissional | null>(
    null
  );
  const [formData, setFormData] = useState<ProfileFormData>({
    nome: "",
    sobrenome: "",
    email: "",
    telefone: "",
    data_nascimento: "",
    especialidades: "",
    bio_profissional: "",
    formacao_principal: "",
    experiencia_anos: 0,
    valor_sessao: 0,
    abordagem_terapeutica: "",
    endereco_cidade: "",
    endereco_estado: "",
    endereco_cep: "",
    endereco_logradouro: "",
    endereco_numero: "",
    endereco_bairro: "",
    endereco_complemento: "",
    link_linkedin: "",
    link_instagram: "",
    link_youtube: "",
    site_pessoal: "",
    foto_perfil_url: "",
  });

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Carregar dados do perfil do contexto de auth
  useEffect(() => {
    if (profile?.dados) {
      const dados = profile.dados as PerfilProfissional;
      setProfileData(dados);

      // Preencher formulário com dados existentes
      setFormData({
        nome: dados.nome || "",
        sobrenome: dados.sobrenome || "",
        email: dados.email || "",
        telefone: dados.telefone || "",
        data_nascimento: dados.data_nascimento || "",
        especialidades: dados.especialidades || "",
        bio_profissional: dados.bio_profissional || "",
        formacao_principal: dados.formacao_principal || "",
        experiencia_anos: dados.experiencia_anos || 0,
        valor_sessao: dados.valor_sessao || 0,
        abordagem_terapeutica: dados.abordagem_terapeutica || "",
        endereco_cidade: dados.endereco_cidade || "",
        endereco_estado: dados.endereco_estado || "",
        endereco_cep: dados.endereco_cep || "",
        endereco_logradouro: dados.endereco_logradouro || "",
        endereco_numero: dados.endereco_numero || "",
        endereco_bairro: dados.endereco_bairro || "",
        endereco_complemento: dados.endereco_complemento || "",
        link_linkedin: dados.link_linkedin || "",
        link_instagram: dados.link_instagram || "",
        link_youtube: dados.link_youtube || "",
        site_pessoal: dados.site_pessoal || "",
        foto_perfil_url: dados.foto_perfil_url || "",
      });
    }
  }, [profile]);

  // Toggle modo edição
  const toggleEditing = useCallback(() => {
    if (isEditing) {
      // Se estava editando, resetar form para dados originais
      resetForm();
    }
    setIsEditing(!isEditing);
    setErrors({});
  }, [isEditing]);

  // Atualizar campo do formulário
  const updateField = useCallback(
    (field: keyof ProfileFormData, value: string | number) => {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));

      // Limpar erro do campo quando usuário digita
      if (errors[field]) {
        setErrors((prev) => ({
          ...prev,
          [field]: "",
        }));
      }
    },
    [errors]
  );

  // Resetar formulário para dados originais
  const resetForm = useCallback(() => {
    if (profileData) {
      setFormData({
        nome: profileData.nome || "",
        sobrenome: profileData.sobrenome || "",
        email: profileData.email || "",
        telefone: profileData.telefone || "",
        data_nascimento: profileData.data_nascimento || "",
        especialidades: profileData.especialidades || "",
        bio_profissional: profileData.bio_profissional || "",
        formacao_principal: profileData.formacao_principal || "",
        experiencia_anos: profileData.experiencia_anos || 0,
        valor_sessao: profileData.valor_sessao || 0,
        abordagem_terapeutica: profileData.abordagem_terapeutica || "",
        endereco_cidade: profileData.endereco_cidade || "",
        endereco_estado: profileData.endereco_estado || "",
        endereco_cep: profileData.endereco_cep || "",
        endereco_logradouro: profileData.endereco_logradouro || "",
        endereco_numero: profileData.endereco_numero || "",
        endereco_bairro: profileData.endereco_bairro || "",
        endereco_complemento: profileData.endereco_complemento || "",
        link_linkedin: profileData.link_linkedin || "",
        link_instagram: profileData.link_instagram || "",
        link_youtube: profileData.link_youtube || "",
        site_pessoal: profileData.site_pessoal || "",
        foto_perfil_url: profileData.foto_perfil_url || "",
      });
    }
  }, [profileData]);

  // Validar formulário
  const validateForm = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    // Campos obrigatórios
    if (!formData.nome.trim()) {
      newErrors.nome = "Nome é obrigatório";
    }
    if (!formData.sobrenome.trim()) {
      newErrors.sobrenome = "Sobrenome é obrigatório";
    }
    if (!formData.especialidades.trim()) {
      newErrors.especialidades = "Especialidades são obrigatórias";
    }
    if (!formData.telefone.trim()) {
      newErrors.telefone = "Telefone é obrigatório";
    }

    // Validar email
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Email inválido";
    }

    // Validar URLs se preenchidas
    const urlFields = [
      "link_linkedin",
      "link_instagram",
      "link_youtube",
      "site_pessoal",
    ] as const;
    urlFields.forEach((field) => {
      if (formData[field] && !isValidUrl(formData[field])) {
        newErrors[field] = "URL inválida";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  // Função auxiliar para validar URL
  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  // Upload de foto - COM TIMEOUT PARA TESTAR
  const uploadPhoto = useCallback(
    async (file: File): Promise<boolean> => {
      console.log("🟢 STEP 1: Função uploadPhoto chamada");

      if (!user?.id) {
        console.log("🔴 STEP 2: Usuário não logado");
        return false;
      }

      console.log("🟢 STEP 2: Usuário logado:", user.id);

      setUploadingPhoto(true);
      console.log("🟢 STEP 3: setUploadingPhoto(true) executado");

      try {
        console.log("🟢 STEP 4: Entrando no try");

        const fileName = `test-${Date.now()}.jpg`;
        console.log("🟢 STEP 5: Nome do arquivo gerado:", fileName);

        const filePath = `profiles/${fileName}`;
        console.log("🟢 STEP 6: Path do arquivo:", filePath);

        console.log("🟢 STEP 7: Iniciando upload para Supabase...");

        // Criar uma Promise com timeout
        const uploadPromise = supabase.storage
          .from("avatars")
          .upload(filePath, file);

        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(
            () => reject(new Error("Upload timeout após 10 segundos")),
            10000
          );
        });

        console.log("🟢 STEP 7.5: Aguardando upload ou timeout...");

        // Race entre upload e timeout
        const uploadResult = (await Promise.race([
          uploadPromise,
          timeoutPromise,
        ])) as any;

        console.log("🟢 STEP 8: Upload result:", uploadResult);

        if (uploadResult.error) {
          console.log("🔴 STEP 9: Erro no upload:", uploadResult.error);
          return false;
        }

        console.log("🟢 STEP 9: Upload OK, gerando URL...");

        const {
          data: { publicUrl },
        } = supabase.storage.from("avatars").getPublicUrl(filePath);

        console.log("🟢 STEP 10: URL gerada:", publicUrl);

        updateField("foto_perfil_url", publicUrl);
        console.log("🟢 STEP 11: Campo atualizado");

        return true;
      } catch (error) {
        console.log("🔴 ERRO CATCH:", error);
        return false;
      } finally {
        console.log("🟢 STEP FINAL: setUploadingPhoto(false)");
        setUploadingPhoto(false);
      }
    },
    [user?.id, updateField]
  );

  // Salvar perfil
  const saveProfile = useCallback(async (): Promise<boolean> => {
    if (!user?.id || !validateForm()) {
      console.error("❌ Validação falhou ou usuário não logado");
      return false;
    }

    setSaving(true);
    try {
      console.log("💾 Salvando perfil:", formData);

      // Atualizar no Supabase
      const { error } = await supabase
        .from("perfis_profissionais")
        .update({
          nome: formData.nome,
          sobrenome: formData.sobrenome,
          email: formData.email,
          telefone: formData.telefone,
          data_nascimento: formData.data_nascimento,
          especialidades: formData.especialidades,
          bio_profissional: formData.bio_profissional,
          formacao_principal: formData.formacao_principal,
          experiencia_anos: formData.experiencia_anos || null,
          valor_sessao: formData.valor_sessao || null,
          abordagem_terapeutica: formData.abordagem_terapeutica,
          endereco_cidade: formData.endereco_cidade,
          endereco_estado: formData.endereco_estado,
          endereco_cep: formData.endereco_cep,
          endereco_logradouro: formData.endereco_logradouro,
          endereco_numero: formData.endereco_numero,
          endereco_bairro: formData.endereco_bairro,
          endereco_complemento: formData.endereco_complemento,
          link_linkedin: formData.link_linkedin,
          link_instagram: formData.link_instagram,
          link_youtube: formData.link_youtube,
          site_pessoal: formData.site_pessoal,
          foto_perfil_url: formData.foto_perfil_url,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id);

      if (error) {
        console.error("❌ Erro ao salvar perfil:", error);
        return false;
      }

      console.log("✅ Perfil salvo com sucesso!");

      // Refresh do perfil no contexto
      await refreshAuthProfile();
      setIsEditing(false);

      return true;
    } catch (error) {
      console.error("❌ Erro ao salvar perfil:", error);
      return false;
    } finally {
      setSaving(false);
    }
  }, [user?.id, formData, validateForm, refreshAuthProfile]);

  // Recarregar perfil
  const refreshProfile = useCallback(async () => {
    await refreshAuthProfile();
  }, [refreshAuthProfile]);

  return {
    // Estados
    profileData,
    formData,
    isEditing,
    loading,
    saving,
    uploadingPhoto,
    errors,

    // Actions
    toggleEditing,
    updateField,
    saveProfile,
    uploadPhoto,
    refreshProfile,
    resetForm,
  };
};
