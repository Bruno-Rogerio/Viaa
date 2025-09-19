// src/hooks/dashboard/useProfile.ts
// 🔧 VERSÃO CORRIGIDA - Apenas campos editáveis permitidos

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { PerfilProfissional } from "@/types/database";

// 🔧 INTERFACE APENAS COM CAMPOS EDITÁVEIS
interface ProfileFormData {
  // 📧 CONTATO (editável)
  email: string;
  telefone: string;

  // 💼 PROFISSIONAL (editável)
  especialidades: string;
  bio_profissional: string;
  formacao_principal: string;
  experiencia_anos: number;
  valor_sessao: number;
  abordagem_terapeutica: string;

  // 📍 ENDEREÇO (editável)
  endereco_cidade: string;
  endereco_estado: string;
  endereco_cep: string;
  endereco_logradouro: string;
  endereco_numero: string;
  endereco_bairro: string;
  endereco_complemento: string;

  // 🔗 REDES SOCIAIS (editável)
  link_linkedin: string;
  link_instagram: string;
  link_youtube: string;
  site_pessoal: string;

  // 📸 FOTO (editável)
  foto_perfil_url: string;
}

// 🔧 DADOS READONLY SEPARADOS
interface ReadOnlyProfileData {
  // 👤 IDENTIDADE (não editável)
  nome: string;
  sobrenome: string;
  cpf: string;
  data_nascimento: string;

  // 🏆 CATEGORIA (não editável)
  tipo: string;

  // 🏅 CREDENCIAIS (não editável - requer verificação manual)
  crp: string;
  conselho_tipo: string;
  conselho_numero: string;
  registro_profissional: string;

  // ✅ STATUS (controlado pelo sistema)
  verificado: boolean;
  status_verificacao: string;
}

interface UseProfileReturn {
  // Estados principais
  profileData: PerfilProfissional | null;
  readOnlyData: ReadOnlyProfileData | null;
  formData: ProfileFormData;
  isEditing: boolean;
  loading: boolean;
  saving: boolean;
  uploadingPhoto: boolean;
  errors: Record<string, string>;

  // Estados calculados
  profileCompleteness: number;
  missingFields: string[];
  canSave: boolean;

  // Actions principais
  toggleEditing: () => void;
  updateField: (field: keyof ProfileFormData, value: string | number) => void;
  saveProfile: () => Promise<boolean>;
  uploadPhoto: (file: File) => Promise<boolean>;
  refreshProfile: () => Promise<void>;
  resetForm: () => void;

  // Actions utilitárias
  validateForm: () => boolean;
  getFieldError: (field: keyof ProfileFormData) => string | undefined;
}

export const useProfile = (): UseProfileReturn => {
  const { user, profile, refreshProfile: refreshAuthProfile } = useAuth();

  // Estados principais
  const [profileData, setProfileData] = useState<PerfilProfissional | null>(
    null
  );
  const [readOnlyData, setReadOnlyData] = useState<ReadOnlyProfileData | null>(
    null
  );
  const [formData, setFormData] = useState<ProfileFormData>({
    // Contato
    email: "",
    telefone: "",

    // Profissional
    especialidades: "",
    bio_profissional: "",
    formacao_principal: "",
    experiencia_anos: 0,
    valor_sessao: 0,
    abordagem_terapeutica: "",

    // Endereço
    endereco_cep: "",
    endereco_logradouro: "",
    endereco_numero: "",
    endereco_bairro: "",
    endereco_cidade: "",
    endereco_estado: "",
    endereco_complemento: "",

    // Redes sociais
    link_linkedin: "",
    link_instagram: "",
    link_youtube: "",
    site_pessoal: "",

    // Foto
    foto_perfil_url: "",
  });

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // 🔧 CARREGAR DADOS DO PERFIL
  useEffect(() => {
    const loadProfile = async () => {
      if (!profile?.dados) {
        setLoading(false);
        return;
      }

      const data = profile.dados as PerfilProfissional;
      setProfileData(data);

      // Separar dados readonly dos editáveis
      setReadOnlyData({
        nome: data.nome || "",
        sobrenome: data.sobrenome || "",
        cpf: data.cpf || "",
        data_nascimento: data.data_nascimento || "",
        tipo: data.tipo || "",
        crp: data.crp || "",
        conselho_tipo: data.conselho_tipo || "",
        conselho_numero: data.conselho_numero || "",
        registro_profissional: data.registro_profissional || "",
        verificado: data.verificado || false,
        status_verificacao: data.status_verificacao || "pendente",
      });

      // Carregar apenas campos editáveis no formulário
      setFormData({
        email: data.email || "",
        telefone: data.telefone || "",
        especialidades: data.especialidades || "",
        bio_profissional: data.bio_profissional || "",
        formacao_principal: data.formacao_principal || "",
        experiencia_anos: data.experiencia_anos || 0,
        valor_sessao: data.valor_sessao || 0,
        abordagem_terapeutica: data.abordagem_terapeutica || "",
        endereco_cep: data.endereco_cep || "",
        endereco_logradouro: data.endereco_logradouro || "",
        endereco_numero: data.endereco_numero || "",
        endereco_bairro: data.endereco_bairro || "",
        endereco_cidade: data.endereco_cidade || "",
        endereco_estado: data.endereco_estado || "",
        endereco_complemento: data.endereco_complemento || "",
        link_linkedin: data.link_linkedin || "",
        link_instagram: data.link_instagram || "",
        link_youtube: data.link_youtube || "",
        site_pessoal: data.site_pessoal || "",
        foto_perfil_url: data.foto_perfil_url || "",
      });

      setLoading(false);
    };

    loadProfile();
  }, [profile]);

  // 🔧 CALCULAR COMPLETUDE DO PERFIL
  const profileCompleteness = useCallback((): number => {
    if (!formData) return 0;

    const requiredFields = [
      "telefone",
      "especialidades",
      "formacao_principal",
      "experiencia_anos",
      "valor_sessao",
      "endereco_cidade",
      "endereco_estado",
    ];

    const filledRequired = requiredFields.filter(
      (field) =>
        formData[field as keyof ProfileFormData] &&
        String(formData[field as keyof ProfileFormData]).trim() !== ""
    ).length;

    const optionalFields = [
      "bio_profissional",
      "abordagem_terapeutica",
      "endereco_cep",
      "link_linkedin",
      "foto_perfil_url",
    ];

    const filledOptional = optionalFields.filter(
      (field) =>
        formData[field as keyof ProfileFormData] &&
        String(formData[field as keyof ProfileFormData]).trim() !== ""
    ).length;

    const totalFields = requiredFields.length + optionalFields.length;
    const filledFields = filledRequired + filledOptional;

    return Math.round((filledFields / totalFields) * 100);
  }, [formData]);

  // 🔧 CAMPOS OBRIGATÓRIOS FALTANDO
  const missingFields = useCallback((): string[] => {
    const required = [
      { field: "telefone", label: "Telefone" },
      { field: "especialidades", label: "Especialidades" },
      { field: "formacao_principal", label: "Formação Principal" },
      { field: "endereco_cidade", label: "Cidade" },
      { field: "endereco_estado", label: "Estado" },
    ];

    return required
      .filter(
        ({ field }) =>
          !formData[field as keyof ProfileFormData] ||
          String(formData[field as keyof ProfileFormData]).trim() === ""
      )
      .map(({ label }) => label);
  }, [formData]);

  // 🔧 PODE SALVAR?
  const canSave = useCallback((): boolean => {
    return missingFields().length === 0 && Object.keys(errors).length === 0;
  }, [missingFields, errors]);

  // 🔧 TOGGLE EDIÇÃO
  const toggleEditing = useCallback(() => {
    setIsEditing((prev) => !prev);
    if (isEditing) {
      setErrors({});
    }
  }, [isEditing]);

  // 🔧 ATUALIZAR CAMPO
  const updateField = useCallback(
    (field: keyof ProfileFormData, value: string | number) => {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));

      // Limpar erro do campo
      if (errors[field]) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[field];
          return newErrors;
        });
      }
    },
    [errors]
  );

  // 🔧 VALIDAR FORMULÁRIO
  const validateForm = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    // Telefone obrigatório
    if (!formData.telefone?.trim()) {
      newErrors.telefone = "Telefone é obrigatório";
    }

    // Especialidades obrigatório
    if (!formData.especialidades?.trim()) {
      newErrors.especialidades = "Especialidades são obrigatórias";
    }

    // Formação obrigatória
    if (!formData.formacao_principal?.trim()) {
      newErrors.formacao_principal = "Formação principal é obrigatória";
    }

    // Localização obrigatória
    if (!formData.endereco_cidade?.trim()) {
      newErrors.endereco_cidade = "Cidade é obrigatória";
    }
    if (!formData.endereco_estado?.trim()) {
      newErrors.endereco_estado = "Estado é obrigatório";
    }

    // Validar valores numéricos
    if (formData.experiencia_anos < 0 || formData.experiencia_anos > 50) {
      newErrors.experiencia_anos = "Experiência deve ser entre 0 e 50 anos";
    }

    if (formData.valor_sessao < 0) {
      newErrors.valor_sessao = "Valor da sessão deve ser positivo";
    }

    // Validar CEP se preenchido
    if (formData.endereco_cep) {
      const cepNumbers = formData.endereco_cep.replace(/\D/g, "");
      if (cepNumbers.length !== 8) {
        newErrors.endereco_cep = "CEP deve ter 8 dígitos";
      }
    }

    // Validar URLs se preenchidas
    const urlFields = [
      "link_linkedin",
      "link_instagram",
      "link_youtube",
      "site_pessoal",
    ];
    urlFields.forEach((field) => {
      const value = formData[field as keyof ProfileFormData] as string;
      if (value && !isValidUrl(value)) {
        newErrors[field] = "URL inválida";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  // 🔧 VALIDAR URL
  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  // 🔧 SALVAR PERFIL
  const saveProfile = useCallback(async (): Promise<boolean> => {
    if (!user || !profileData?.id) {
      console.error("Usuário não autenticado ou perfil não encontrado");
      return false;
    }

    if (!validateForm()) {
      console.error("Formulário inválido");
      return false;
    }

    setSaving(true);
    try {
      console.log("💾 Salvando perfil...", formData);

      // 🔧 ATUALIZAR APENAS CAMPOS EDITÁVEIS
      const { data, error } = await supabase
        .from("perfis_profissionais")
        .update({
          // Contato
          email: formData.email || null,
          telefone: formData.telefone,

          // Profissional
          especialidades: formData.especialidades,
          bio_profissional: formData.bio_profissional || null,
          formacao_principal: formData.formacao_principal || null,
          experiencia_anos: formData.experiencia_anos || null,
          valor_sessao: formData.valor_sessao || null,
          abordagem_terapeutica: formData.abordagem_terapeutica || null,

          // Endereço
          endereco_cep: formData.endereco_cep || null,
          endereco_logradouro: formData.endereco_logradouro || null,
          endereco_numero: formData.endereco_numero || null,
          endereco_bairro: formData.endereco_bairro || null,
          endereco_cidade: formData.endereco_cidade || null,
          endereco_estado: formData.endereco_estado || null,
          endereco_complemento: formData.endereco_complemento || null,

          // Redes sociais
          link_linkedin: formData.link_linkedin || null,
          link_instagram: formData.link_instagram || null,
          link_youtube: formData.link_youtube || null,
          site_pessoal: formData.site_pessoal || null,

          // Foto
          foto_perfil_url: formData.foto_perfil_url || null,

          // Timestamp
          updated_at: new Date().toISOString(),
        })
        .eq("id", profileData.id)
        .select()
        .single();

      if (error) {
        console.error("❌ Erro ao salvar perfil:", error);
        return false;
      }

      console.log("✅ Perfil salvo com sucesso:", data);

      // Atualizar dados locais
      setProfileData(data);
      await refreshAuthProfile();
      setIsEditing(false);
      setErrors({});

      return true;
    } catch (error) {
      console.error("❌ Erro inesperado ao salvar:", error);
      return false;
    } finally {
      setSaving(false);
    }
  }, [user, profileData, formData, validateForm, refreshAuthProfile]);

  // 🔧 UPLOAD DE FOTO
  const uploadPhoto = useCallback(
    async (file: File): Promise<boolean> => {
      if (!user || !profileData?.id) {
        console.error("Usuário não autenticado");
        return false;
      }

      setUploadingPhoto(true);
      try {
        // Gerar nome único
        const fileExt = file.name.split(".").pop();
        const fileName = `${profileData.id}_${Date.now()}.${fileExt}`;
        const filePath = `perfil-profissionais/${fileName}`;

        // Upload
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(filePath, file);

        if (uploadError) {
          console.error("Erro no upload:", uploadError);
          return false;
        }

        // Obter URL
        const { data: urlData } = supabase.storage
          .from("avatars")
          .getPublicUrl(filePath);

        if (!urlData?.publicUrl) {
          console.error("Erro ao obter URL da imagem");
          return false;
        }

        // Atualizar banco
        const { error: updateError } = await supabase
          .from("perfis_profissionais")
          .update({
            foto_perfil_url: urlData.publicUrl,
            updated_at: new Date().toISOString(),
          })
          .eq("id", profileData.id);

        if (updateError) {
          console.error("Erro ao atualizar URL da foto:", updateError);
          return false;
        }

        // Atualizar local
        updateField("foto_perfil_url", urlData.publicUrl);
        await refreshAuthProfile();

        return true;
      } catch (error) {
        console.error("Erro inesperado no upload:", error);
        return false;
      } finally {
        setUploadingPhoto(false);
      }
    },
    [user, profileData, updateField, refreshAuthProfile]
  );

  // 🔧 RESETAR FORMULÁRIO
  const resetForm = useCallback(() => {
    if (profileData) {
      setFormData({
        email: profileData.email || "",
        telefone: profileData.telefone || "",
        especialidades: profileData.especialidades || "",
        bio_profissional: profileData.bio_profissional || "",
        formacao_principal: profileData.formacao_principal || "",
        experiencia_anos: profileData.experiencia_anos || 0,
        valor_sessao: profileData.valor_sessao || 0,
        abordagem_terapeutica: profileData.abordagem_terapeutica || "",
        endereco_cep: profileData.endereco_cep || "",
        endereco_logradouro: profileData.endereco_logradouro || "",
        endereco_numero: profileData.endereco_numero || "",
        endereco_bairro: profileData.endereco_bairro || "",
        endereco_cidade: profileData.endereco_cidade || "",
        endereco_estado: profileData.endereco_estado || "",
        endereco_complemento: profileData.endereco_complemento || "",
        link_linkedin: profileData.link_linkedin || "",
        link_instagram: profileData.link_instagram || "",
        link_youtube: profileData.link_youtube || "",
        site_pessoal: profileData.site_pessoal || "",
        foto_perfil_url: profileData.foto_perfil_url || "",
      });
      setErrors({});
    }
  }, [profileData]);

  // 🔧 REFRESH
  const refreshProfile = useCallback(async (): Promise<void> => {
    await refreshAuthProfile();
  }, [refreshAuthProfile]);

  // 🔧 GET ERROR
  const getFieldError = useCallback(
    (field: keyof ProfileFormData): string | undefined => {
      return errors[field];
    },
    [errors]
  );

  return {
    // Estados principais
    profileData,
    readOnlyData,
    formData,
    isEditing,
    loading,
    saving,
    uploadingPhoto,
    errors,

    // Estados calculados
    profileCompleteness: profileCompleteness(),
    missingFields: missingFields(),
    canSave: canSave(),

    // Actions principais
    toggleEditing,
    updateField,
    saveProfile,
    uploadPhoto,
    refreshProfile,
    resetForm,

    // Actions utilitárias
    validateForm,
    getFieldError,
  };
};
