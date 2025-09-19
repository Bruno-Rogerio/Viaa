// src/components/dashboard/professional/profile/ProfileEditForm.tsx
// 🔧 VERSÃO CORRIGIDA - Separação campos editáveis vs readonly

"use client";
import React, { useRef, useState } from "react";
import {
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  LinkIcon,
  CameraIcon,
  AcademicCapIcon,
  ClockIcon,
  DocumentTextIcon,
  ShieldCheckIcon,
  ExclamationCircleIcon,
  CheckIcon,
  XMarkIcon,
  EyeIcon,
  EyeSlashIcon,
  CalendarDaysIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";

// 🔧 INTERFACES ATUALIZADAS
interface ProfileFormData {
  // Contato (editável)
  email: string;
  telefone: string;

  // Profissional (editável)
  especialidades: string;
  bio_profissional: string;
  formacao_principal: string;
  experiencia_anos: number;
  valor_sessao: number;
  abordagem_terapeutica: string;

  // Endereço (editável)
  endereco_cidade: string;
  endereco_estado: string;
  endereco_cep: string;
  endereco_logradouro: string;
  endereco_numero: string;
  endereco_bairro: string;
  endereco_complemento: string;

  // Redes sociais (editável)
  link_linkedin: string;
  link_instagram: string;
  link_youtube: string;
  site_pessoal: string;

  // Foto (editável)
  foto_perfil_url: string;
}

interface ReadOnlyProfileData {
  // Identidade (readonly)
  nome: string;
  sobrenome: string;
  cpf: string;
  data_nascimento: string;

  // Categoria (readonly)
  tipo: string;

  // Credenciais (readonly)
  crp: string;
  conselho_tipo: string;
  conselho_numero: string;
  registro_profissional: string;

  // Status (readonly)
  verificado: boolean;
  status_verificacao: string;
}

interface ProfileEditFormProps {
  formData: ProfileFormData;
  readOnlyData: ReadOnlyProfileData;
  errors: Record<string, string>;
  uploadingPhoto: boolean;
  onUpdateField: (field: keyof ProfileFormData, value: string | number) => void;
  onUploadPhoto: (file: File) => Promise<boolean>;
}

// 🔧 COMPONENTE AVATAR
interface AvatarProps {
  src?: string;
  alt: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const Avatar: React.FC<AvatarProps> = ({
  src,
  alt,
  size = "md",
  className = "",
}) => {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
    xl: "w-24 h-24",
  };

  return (
    <div
      className={`${sizeClasses[size]} ${className} rounded-full overflow-hidden bg-gray-100 flex items-center justify-center`}
    >
      {src ? (
        <img src={src} alt={alt} className="w-full h-full object-cover" />
      ) : (
        <UserIcon className="w-1/2 h-1/2 text-gray-400" />
      )}
    </div>
  );
};

// 🔧 COMPONENTE CAMPO DE INPUT
interface InputFieldProps {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  icon?: React.ReactNode;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

const InputField: React.FC<InputFieldProps> = ({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  icon,
  error,
  required = false,
  disabled = false,
  className = "",
}) => {
  return (
    <div className={className}>
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            {icon}
          </div>
        )}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className={`
            w-full px-4 py-3 border rounded-xl
            ${icon ? "pl-10" : ""}
            ${error ? "border-red-500 bg-red-50" : "border-gray-300"}
            ${
              disabled
                ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                : "focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            }
            transition-colors
          `}
        />
      </div>
      {error && (
        <p className="text-red-500 text-sm mt-1 flex items-center">
          <ExclamationCircleIcon className="w-4 h-4 mr-1" />
          {error}
        </p>
      )}
    </div>
  );
};

// 🔧 COMPONENTE CAMPO READONLY
interface ReadOnlyFieldProps {
  label: string;
  value: string;
  icon?: React.ReactNode;
  className?: string;
}

const ReadOnlyField: React.FC<ReadOnlyFieldProps> = ({
  label,
  value,
  icon,
  className = "",
}) => {
  return (
    <div className={className}>
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        {label}
      </label>
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            {icon}
          </div>
        )}
        <div
          className={`
          w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-700
          ${icon ? "pl-10" : ""}
        `}
        >
          {value || "Não informado"}
        </div>
      </div>
    </div>
  );
};

// 🔧 COMPONENTE PRINCIPAL
export default function ProfileEditForm({
  formData,
  readOnlyData,
  errors,
  uploadingPhoto,
  onUpdateField,
  onUploadPhoto,
}: ProfileEditFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 🔧 MAPEAR TIPOS PARA EXIBIÇÃO
  const getTipoLabel = (tipo: string): string => {
    const tipos = {
      psicologo: "Psicólogo(a)",
      psicanalista: "Psicanalista",
      heike: "Terapeuta Reiki",
      holistico: "Terapeuta Holístico",
      coach_mentor: "Coach/Mentor",
    };
    return tipos[tipo as keyof typeof tipos] || tipo;
  };

  // 🔧 MAPEAR STATUS PARA EXIBIÇÃO
  const getStatusLabel = (status: string): string => {
    const statusMap = {
      pendente: "Aguardando Verificação",
      aprovado: "Verificado",
      rejeitado: "Verificação Rejeitada",
    };
    return statusMap[status as keyof typeof statusMap] || status;
  };

  // 🔧 FORMATار DATA
  const formatDate = (dateString: string): string => {
    if (!dateString) return "Não informado";
    try {
      return new Date(dateString).toLocaleDateString("pt-BR");
    } catch {
      return dateString;
    }
  };

  // 🔧 MASCARAR CPF
  const formatCPF = (cpf: string): string => {
    if (!cpf) return "Não informado";
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.***.**$4");
  };

  // 🔧 UPLOAD DE FOTO
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo
    if (!file.type.startsWith("image/")) {
      alert("Por favor, selecione apenas arquivos de imagem.");
      return;
    }

    // Validar tamanho (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("A imagem deve ter no máximo 5MB.");
      return;
    }

    await onUploadPhoto(file);
  };

  const triggerPhotoUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-8">
      {/* 🔒 SEÇÃO: DADOS PESSOAIS (READONLY) */}
      <div className="bg-gradient-to-br from-gray-50 to-blue-50 p-6 rounded-2xl border border-gray-200">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-blue-100 p-3 rounded-xl">
            <ShieldCheckIcon className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Dados Pessoais</h3>
            <p className="text-gray-600 flex items-center gap-2">
              <InformationCircleIcon className="w-4 h-4" />
              Estes dados não podem ser alterados por segurança
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ReadOnlyField
            label="Nome Completo"
            value={`${readOnlyData?.nome} ${readOnlyData?.sobrenome}`}
            icon={<UserIcon className="w-5 h-5" />}
          />

          <ReadOnlyField
            label="CPF"
            value={formatCPF(readOnlyData?.cpf || "")}
            icon={<DocumentTextIcon className="w-5 h-5" />}
          />

          <ReadOnlyField
            label="Data de Nascimento"
            value={formatDate(readOnlyData?.data_nascimento || "")}
            icon={<CalendarDaysIcon className="w-5 h-5" />}
          />

          <ReadOnlyField
            label="Tipo de Profissional"
            value={getTipoLabel(readOnlyData?.tipo || "")}
            icon={<AcademicCapIcon className="w-5 h-5" />}
          />
        </div>

        {/* Status de Verificação */}
        <div className="mt-6">
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-gray-700">Status:</span>
            <div
              className={`
              flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium
              ${
                readOnlyData?.verificado
                  ? "bg-green-100 text-green-800 border border-green-200"
                  : "bg-yellow-100 text-yellow-800 border border-yellow-200"
              }
            `}
            >
              {readOnlyData?.verificado ? (
                <CheckIcon className="w-4 h-4" />
              ) : (
                <ClockIcon className="w-4 h-4" />
              )}
              {getStatusLabel(readOnlyData?.status_verificacao || "")}
            </div>
          </div>
        </div>

        {/* Credenciais Profissionais (readonly) */}
        {(readOnlyData?.crp || readOnlyData?.registro_profissional) && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">
              Credenciais Profissionais
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {readOnlyData?.crp && (
                <ReadOnlyField
                  label="CRP"
                  value={readOnlyData.crp}
                  icon={<ShieldCheckIcon className="w-5 h-5" />}
                />
              )}
              {readOnlyData?.registro_profissional && (
                <ReadOnlyField
                  label="Registro Profissional"
                  value={readOnlyData.registro_profissional}
                  icon={<DocumentTextIcon className="w-5 h-5" />}
                />
              )}
            </div>
          </div>
        )}
      </div>

      {/* ✏️ SEÇÃO: FOTO DE PERFIL (EDITÁVEL) */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-purple-100 p-3 rounded-xl">
            <CameraIcon className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Foto de Perfil</h3>
            <p className="text-gray-600">Adicione uma foto profissional</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <Avatar
            src={formData.foto_perfil_url}
            alt="Foto de perfil"
            size="xl"
            className="ring-4 ring-purple-100"
          />

          <div className="flex-1">
            <button
              onClick={triggerPhotoUpload}
              disabled={uploadingPhoto}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {uploadingPhoto ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Enviando...
                </>
              ) : (
                <>
                  <CameraIcon className="w-5 h-5" />
                  {formData.foto_perfil_url ? "Alterar Foto" : "Adicionar Foto"}
                </>
              )}
            </button>
            <p className="text-sm text-gray-500 mt-2">
              JPG, PNG ou GIF. Máximo 5MB.
            </p>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handlePhotoUpload}
            className="hidden"
          />
        </div>
      </div>

      {/* ✏️ SEÇÃO: CONTATO (EDITÁVEL) */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-green-100 p-3 rounded-xl">
            <PhoneIcon className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">
              Informações de Contato
            </h3>
            <p className="text-gray-600">
              Como pacientes podem entrar em contato
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputField
            label="Email"
            value={formData.email}
            onChange={(value) => onUpdateField("email", value)}
            type="email"
            placeholder="seu.email@exemplo.com"
            icon={<EnvelopeIcon className="w-5 h-5" />}
            error={errors.email}
          />

          <InputField
            label="Telefone"
            value={formData.telefone}
            onChange={(value) => onUpdateField("telefone", value)}
            placeholder="(11) 99999-9999"
            icon={<PhoneIcon className="w-5 h-5" />}
            error={errors.telefone}
            required
          />
        </div>
      </div>

      {/* ✏️ SEÇÃO: INFORMAÇÕES PROFISSIONAIS (EDITÁVEL) */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-blue-100 p-3 rounded-xl">
            <AcademicCapIcon className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">
              Informações Profissionais
            </h3>
            <p className="text-gray-600">
              Dados sobre sua formação e experiência
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Especialidades */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Especialidades <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.especialidades}
              onChange={(e) => onUpdateField("especialidades", e.target.value)}
              rows={3}
              className={`
                w-full px-4 py-3 border rounded-xl resize-none
                focus:ring-2 focus:ring-blue-500 focus:border-transparent
                ${
                  errors.especialidades
                    ? "border-red-500 bg-red-50"
                    : "border-gray-300"
                }
              `}
              placeholder="Ex: Terapia Cognitivo-Comportamental, Ansiedade, Depressão, Relacionamentos..."
            />
            {errors.especialidades && (
              <p className="text-red-500 text-sm mt-1 flex items-center">
                <ExclamationCircleIcon className="w-4 h-4 mr-1" />
                {errors.especialidades}
              </p>
            )}
          </div>

          {/* Grid de informações profissionais */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <InputField
              label="Formação Principal"
              value={formData.formacao_principal}
              onChange={(value) => onUpdateField("formacao_principal", value)}
              placeholder="Ex: Psicologia - USP"
              icon={<AcademicCapIcon className="w-5 h-5" />}
              error={errors.formacao_principal}
              required
            />

            <InputField
              label="Anos de Experiência"
              type="number"
              value={formData.experiencia_anos}
              onChange={(value) =>
                onUpdateField("experiencia_anos", parseInt(value) || 0)
              }
              placeholder="0"
              icon={<ClockIcon className="w-5 h-5" />}
              error={errors.experiencia_anos}
            />

            <InputField
              label="Valor da Sessão (R$)"
              type="number"
              value={formData.valor_sessao}
              onChange={(value) =>
                onUpdateField("valor_sessao", parseInt(value) || 0)
              }
              placeholder="150"
              icon={<CurrencyDollarIcon className="w-5 h-5" />}
              error={errors.valor_sessao}
            />
          </div>

          {/* Bio e Abordagem */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Biografia Profissional
              </label>
              <textarea
                value={formData.bio_profissional}
                onChange={(e) =>
                  onUpdateField("bio_profissional", e.target.value)
                }
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Conte um pouco sobre você, sua trajetória e filosofia de trabalho..."
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Abordagem Terapêutica
              </label>
              <textarea
                value={formData.abordagem_terapeutica}
                onChange={(e) =>
                  onUpdateField("abordagem_terapeutica", e.target.value)
                }
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Descreva sua abordagem e métodos terapêuticos..."
              />
            </div>
          </div>
        </div>
      </div>

      {/* ✏️ SEÇÃO: ENDEREÇO (EDITÁVEL) */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-orange-100 p-3 rounded-xl">
            <MapPinIcon className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Localização</h3>
            <p className="text-gray-600">Onde você atende seus pacientes</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <InputField
            label="CEP"
            value={formData.endereco_cep}
            onChange={(value) => onUpdateField("endereco_cep", value)}
            placeholder="00000-000"
            icon={<MapPinIcon className="w-5 h-5" />}
            error={errors.endereco_cep}
          />

          <InputField
            label="Cidade"
            value={formData.endereco_cidade}
            onChange={(value) => onUpdateField("endereco_cidade", value)}
            placeholder="São Paulo"
            icon={<MapPinIcon className="w-5 h-5" />}
            error={errors.endereco_cidade}
            required
          />

          <InputField
            label="Estado"
            value={formData.endereco_estado}
            onChange={(value) => onUpdateField("endereco_estado", value)}
            placeholder="SP"
            icon={<MapPinIcon className="w-5 h-5" />}
            error={errors.endereco_estado}
            required
          />

          <InputField
            label="Logradouro"
            value={formData.endereco_logradouro}
            onChange={(value) => onUpdateField("endereco_logradouro", value)}
            placeholder="Rua das Flores"
            className="md:col-span-2"
          />

          <InputField
            label="Número"
            value={formData.endereco_numero}
            onChange={(value) => onUpdateField("endereco_numero", value)}
            placeholder="123"
          />

          <InputField
            label="Bairro"
            value={formData.endereco_bairro}
            onChange={(value) => onUpdateField("endereco_bairro", value)}
            placeholder="Centro"
          />

          <InputField
            label="Complemento"
            value={formData.endereco_complemento}
            onChange={(value) => onUpdateField("endereco_complemento", value)}
            placeholder="Apt 45, Bloco B"
          />
        </div>
      </div>

      {/* ✏️ SEÇÃO: REDES SOCIAIS (EDITÁVEL) */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-indigo-100 p-3 rounded-xl">
            <LinkIcon className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">
              Redes Sociais e Links
            </h3>
            <p className="text-gray-600">
              Conecte seus perfis nas redes sociais
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputField
            label="LinkedIn"
            value={formData.link_linkedin}
            onChange={(value) => onUpdateField("link_linkedin", value)}
            placeholder="https://linkedin.com/in/seuperfil"
            icon={<LinkIcon className="w-5 h-5" />}
            error={errors.link_linkedin}
          />

          <InputField
            label="Instagram"
            value={formData.link_instagram}
            onChange={(value) => onUpdateField("link_instagram", value)}
            placeholder="https://instagram.com/seuperfil"
            icon={<LinkIcon className="w-5 h-5" />}
            error={errors.link_instagram}
          />

          <InputField
            label="YouTube"
            value={formData.link_youtube}
            onChange={(value) => onUpdateField("link_youtube", value)}
            placeholder="https://youtube.com/c/seucanal"
            icon={<LinkIcon className="w-5 h-5" />}
            error={errors.link_youtube}
          />

          <InputField
            label="Site Pessoal"
            value={formData.site_pessoal}
            onChange={(value) => onUpdateField("site_pessoal", value)}
            placeholder="https://seusite.com.br"
            icon={<LinkIcon className="w-5 h-5" />}
            error={errors.site_pessoal}
          />
        </div>
      </div>
    </div>
  );
}
