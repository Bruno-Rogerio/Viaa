// src/hooks/dashboard/useProfile.ts
// Hook para gerenciar perfil profissional - VERSÃO LIMPA E FUNCIONAL

import { useState, useCallback, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase/client";
import type { PerfilProfissional, TipoProfissional } from "@/types/database";

// Interface expandida com TODOS os campos do schema Supabase
interface ProfileFormData {
  // Dados pessoais básicos
  nome: string;
  sobrenome: string;
  email: string;
  telefone: string;
  data_nascimento: string;
  cpf: string;

  // Dados profissionais
  tipo: TipoProfissional;
  especialidades: string;
  bio_profissional: string;
  formacao_principal: string;
  experiencia_anos: number;
  valor_sessao: number;
  abordagem_terapeutica: string;

  // Credenciais profissionais
  crp: string;
  conselho_tipo: string;
  conselho_numero: string;
  registro_profissional: string;

  // Status profissional (readonly - só para exibição)
  verificado: boolean;
  status_verificacao: "pendente" | "aprovado" | "rejeitado";

  // Localização completa
  endereco_cep: string;
  endereco_logradouro: string;
  endereco_numero: string;
  endereco_bairro: string;
  endereco_cidade: string;
  endereco_estado: string;
  endereco_complemento: string;

  // Links sociais
  link_linkedin: string;
  link_instagram: string;
  link_youtube: string;
  site_pessoal: string;

  // Foto de perfil
  foto_perfil_url: string;
}

interface UseProfileReturn {
  // Estados principais
  profileData: PerfilProfissional | null;
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
  updateField: (
    field: keyof ProfileFormData,
    value: string | number | boolean
  ) => void;
  saveProfile: () => Promise<boolean>;
  uploadPhoto: (file: File) => Promise<boolean>;
  refreshProfile: () => Promise<void>;
  resetForm: () => void;

  // Actions utilitárias
  validateForm: () => boolean;
  getFieldError: (field: keyof ProfileFormData) => string | undefined;
  clearFieldError: (field: keyof ProfileFormData) => void;
}

export const useProfile = (): UseProfileReturn => {
  const { user, profile, refreshProfile: refreshAuthProfile } = useAuth();

  // Estados principais
  const [profileData, setProfileData] = useState<PerfilProfissional | null>(
    null
  );
  const [formData, setFormData] = useState<ProfileFormData>({
    // Dados pessoais
    nome: "",
    sobrenome: "",
    email: "",
    telefone: "",
    data_nascimento: "",
    cpf: "",

    // Dados profissionais
    tipo: "psicologo",
    especialidades: "",
    bio_profissional: "",
    formacao_principal: "",
    experiencia_anos: 0,
    valor_sessao: 0,
    abordagem_terapeutica: "",

    // Credenciais
    crp: "",
    conselho_tipo: "",
    conselho_numero: "",
    registro_profissional: "",

    // Status (readonly)
    verificado: false,
    status_verificacao: "pendente",

    // Localização
    endereco_cep: "",
    endereco_logradouro: "",
    endereco_numero: "",
    endereco_bairro: "",
    endereco_cidade: "",
    endereco_estado: "",
    endereco_complemento: "",

    // Links sociais
    link_linkedin: "",
    link_instagram: "",
    link_youtube: "",
    site_pessoal: "",

    // Foto
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
        // Dados pessoais
        nome: dados.nome || "",
        sobrenome: dados.sobrenome || "",
        email: dados.email || "",
        telefone: dados.telefone || "",
        data_nascimento: dados.data_nascimento || "",
        cpf: dados.cpf || "",

        // Dados profissionais
        tipo: dados.tipo || "psicologo",
        especialidades: dados.especialidades || "",
        bio_profissional: dados.bio_profissional || "",
        formacao_principal: dados.formacao_principal || "",
        experiencia_anos: dados.experiencia_anos || 0,
        valor_sessao: dados.valor_sessao || 0,
        abordagem_terapeutica: dados.abordagem_terapeutica || "",

        // Credenciais
        crp: dados.crp || "",
        conselho_tipo: dados.conselho_tipo || "",
        conselho_numero: dados.conselho_numero || "",
        registro_profissional: dados.registro_profissional || "",

        // Status (readonly)
        verificado: dados.verificado || false,
        status_verificacao: dados.status_verificacao || "pendente",

        // Localização
        endereco_cep: dados.endereco_cep || "",
        endereco_logradouro: dados.endereco_logradouro || "",
        endereco_numero: dados.endereco_numero || "",
        endereco_bairro: dados.endereco_bairro || "",
        endereco_cidade: dados.endereco_cidade || "",
        endereco_estado: dados.endereco_estado || "",
        endereco_complemento: dados.endereco_complemento || "",

        // Links sociais
        link_linkedin: dados.link_linkedin || "",
        link_instagram: dados.link_instagram || "",
        link_youtube: dados.link_youtube || "",
        site_pessoal: dados.site_pessoal || "",

        // Foto
        foto_perfil_url: dados.foto_perfil_url || "",
      });
    }
  }, [profile]);

  // Calcular completude do perfil
  const profileCompleteness = useCallback((): number => {
    const requiredFields = [
      "nome",
      "sobrenome",
      "telefone",
      "especialidades",
      "endereco_cidade",
      "endereco_estado",
    ];

    const optionalFields = [
      "email",
      "data_nascimento",
      "bio_profissional",
      "formacao_principal",
      "valor_sessao",
      "endereco_cep",
      "endereco_logradouro",
      "foto_perfil_url",
    ];

    const professionalFields =
      formData.tipo === "psicologo" ? ["crp"] : ["registro_profissional"];

    const allFields = [
      ...requiredFields,
      ...optionalFields,
      ...professionalFields,
    ];

    let filledFields = 0;
    allFields.forEach((field) => {
      const value = formData[field as keyof ProfileFormData];
      if (value && value.toString().trim() !== "" && value !== 0) {
        filledFields++;
      }
    });

    return Math.round((filledFields / allFields.length) * 100);
  }, [formData]);

  // Campos obrigatórios faltando
  const missingFields = useCallback((): string[] => {
    const missing: string[] = [];
    const requiredFields = [
      { key: "nome", label: "Nome" },
      { key: "sobrenome", label: "Sobrenome" },
      { key: "telefone", label: "Telefone" },
      { key: "especialidades", label: "Especialidades" },
    ];

    requiredFields.forEach((field) => {
      const value = formData[field.key as keyof ProfileFormData];
      if (!value || value.toString().trim() === "") {
        missing.push(field.label);
      }
    });

    return missing;
  }, [formData]);

  // Verificar se pode salvar
  const canSave = useCallback((): boolean => {
    return missingFields().length === 0 && Object.keys(errors).length === 0;
  }, [missingFields, errors]);

  // Toggle modo edição
  const toggleEditing = useCallback(() => {
    if (isEditing) {
      resetForm(); // Se estava editando, resetar form
    }
    setIsEditing(!isEditing);
    setErrors({});
  }, [isEditing]);

  // Atualizar campo do formulário
  const updateField = useCallback(
    (field: keyof ProfileFormData, value: string | number | boolean) => {
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
        // Dados pessoais
        nome: profileData.nome || "",
        sobrenome: profileData.sobrenome || "",
        email: profileData.email || "",
        telefone: profileData.telefone || "",
        data_nascimento: profileData.data_nascimento || "",
        cpf: profileData.cpf || "",

        // Dados profissionais
        tipo: profileData.tipo || "psicologo",
        especialidades: profileData.especialidades || "",
        bio_profissional: profileData.bio_profissional || "",
        formacao_principal: profileData.formacao_principal || "",
        experiencia_anos: profileData.experiencia_anos || 0,
        valor_sessao: profileData.valor_sessao || 0,
        abordagem_terapeutica: profileData.abordagem_terapeutica || "",

        // Credenciais
        crp: profileData.crp || "",
        conselho_tipo: profileData.conselho_tipo || "",
        conselho_numero: profileData.conselho_numero || "",
        registro_profissional: profileData.registro_profissional || "",

        // Status
        verificado: profileData.verificado || false,
        status_verificacao: profileData.status_verificacao || "pendente",

        // Localização
        endereco_cep: profileData.endereco_cep || "",
        endereco_logradouro: profileData.endereco_logradouro || "",
        endereco_numero: profileData.endereco_numero || "",
        endereco_bairro: profileData.endereco_bairro || "",
        endereco_cidade: profileData.endereco_cidade || "",
        endereco_estado: profileData.endereco_estado || "",
        endereco_complemento: profileData.endereco_complemento || "",

        // Links sociais
        link_linkedin: profileData.link_linkedin || "",
        link_instagram: profileData.link_instagram || "",
        link_youtube: profileData.link_youtube || "",
        site_pessoal: profileData.site_pessoal || "",

        // Foto
        foto_perfil_url: profileData.foto_perfil_url || "",
      });
    }
    setErrors({});
  }, [profileData]);

  // Validar formulário completo
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

    // Validar email se preenchido
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "E-mail inválido";
    }

    // Validar CPF se preenchido
    if (formData.cpf) {
      const cpfNumbers = formData.cpf.replace(/\D/g, "");
      if (cpfNumbers.length !== 11) {
        newErrors.cpf = "CPF deve ter 11 dígitos";
      }
    }

    // Validar telefone
    if (formData.telefone) {
      const phoneNumbers = formData.telefone.replace(/\D/g, "");
      if (phoneNumbers.length < 10 || phoneNumbers.length > 11) {
        newErrors.telefone = "Telefone inválido";
      }
    }

    // Validar credenciais profissionais
    if (formData.tipo === "psicologo" && !formData.crp.trim()) {
      newErrors.crp = "CRP é obrigatório para psicólogos";
    }

    // Validar experiência
    if (formData.experiencia_anos < 0 || formData.experiencia_anos > 50) {
      newErrors.experiencia_anos = "Experiência deve estar entre 0 e 50 anos";
    }

    // Validar valor da sessão
    if (formData.valor_sessao < 0 || formData.valor_sessao > 10000) {
      newErrors.valor_sessao = "Valor da sessão inválido";
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

  // Função auxiliar para validar URL
  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  // Salvar perfil no Supabase
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
      // Preparar dados para atualização (excluir campos readonly)
      const { verificado, status_verificacao, ...updateData } = formData;

      const { data, error } = await supabase
        .from("perfis_profissionais")
        .update({
          ...updateData,
          updated_at: new Date().toISOString(),
        })
        .eq("id", profileData.id)
        .select()
        .single();

      if (error) {
        console.error("Erro ao salvar perfil:", error);
        return false;
      }

      // Atualizar dados locais
      setProfileData(data);
      await refreshAuthProfile();
      setIsEditing(false);
      setErrors({});

      return true;
    } catch (error) {
      console.error("Erro inesperado ao salvar:", error);
      return false;
    } finally {
      setSaving(false);
    }
  }, [user, profileData, formData, validateForm, refreshAuthProfile]);

  // Upload de foto
  const uploadPhoto = useCallback(
    async (file: File): Promise<boolean> => {
      if (!user || !profileData?.id) {
        console.error("Usuário não autenticado");
        return false;
      }

      setUploadingPhoto(true);
      try {
        // Gerar nome único para arquivo
        const fileExt = file.name.split(".").pop();
        const fileName = `${profileData.id}_${Date.now()}.${fileExt}`;
        const filePath = `perfil-profissionais/${fileName}`;

        // Upload para storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(filePath, file);

        if (uploadError) {
          console.error("Erro no upload:", uploadError);
          return false;
        }

        // Obter URL pública
        const { data: urlData } = supabase.storage
          .from("avatars")
          .getPublicUrl(filePath);

        if (!urlData?.publicUrl) {
          console.error("Erro ao obter URL da imagem");
          return false;
        }

        // Atualizar perfil com nova URL
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

        // Atualizar formulário local
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

  // Recarregar perfil
  const refreshProfile = useCallback(async (): Promise<void> => {
    await refreshAuthProfile();
  }, [refreshAuthProfile]);

  // Funções utilitárias
  const getFieldError = useCallback(
    (field: keyof ProfileFormData): string | undefined => {
      return errors[field];
    },
    [errors]
  );

  const clearFieldError = useCallback(
    (field: keyof ProfileFormData): void => {
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

  return {
    // Estados principais
    profileData,
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
    clearFieldError,
  };
};
