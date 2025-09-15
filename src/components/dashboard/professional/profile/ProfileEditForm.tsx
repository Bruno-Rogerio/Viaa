// src/components/dashboard/professional/profile/ProfileEditForm.tsx

// Relative imports
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
} from "@heroicons/react/24/outline";

// Usando a interface expandida do hook atualizado
interface ProfileFormData {
  // Dados pessoais
  nome: string;
  sobrenome: string;
  email: string;
  telefone: string;
  data_nascimento: string;
  cpf: string;

  // Dados profissionais
  tipo: "psicologo" | "psicanalista" | "heike" | "holistico" | "coach_mentor";
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

  // Status (readonly)
  verificado: boolean;
  status_verificacao: "pendente" | "aprovado" | "rejeitado";

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

interface ProfileEditFormProps {
  formData: ProfileFormData;
  errors: Record<string, string>;
  uploadingPhoto: boolean;
  onUpdateField: (field: keyof ProfileFormData, value: string | number) => void;
  onUploadPhoto: (file: File) => Promise<boolean>;
}

// Componente Avatar para preview da foto
interface AvatarProps {
  src?: string;
  alt: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const Avatar: React.FC<AvatarProps> = ({
  src,
  alt,
  size = "lg",
  className = "",
}) => {
  const [imageError, setImageError] = useState(false);

  const sizeClasses: Record<string, string> = {
    sm: "w-12 h-12 text-sm",
    md: "w-16 h-16 text-base",
    lg: "w-20 h-20 text-lg",
    xl: "w-24 h-24 text-xl",
  };

  const getInitials = (name: string): string => {
    return name
      .split(" ")
      .map((word: string) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const baseClasses = `
    ${sizeClasses[size]}
    rounded-full 
    flex 
    items-center 
    justify-center 
    font-bold 
    bg-gradient-to-br 
    from-blue-500 
    to-purple-600 
    text-white
    ${className}
  `;

  if (src && !imageError) {
    return (
      <img
        src={src}
        alt={alt}
        className={`${baseClasses} object-cover`}
        onError={() => setImageError(true)}
      />
    );
  }

  return <div className={baseClasses}>{getInitials(alt)}</div>;
};

// Dados de exemplo compatíveis com a interface completa
const exampleFormData: ProfileFormData = {
  nome: "Marina",
  sobrenome: "Silva Santos",
  email: "marina@email.com",
  telefone: "(11) 99999-9999",
  data_nascimento: "1990-05-15",
  cpf: "123.456.789-00",
  tipo: "psicologo",
  especialidades: "Terapia Cognitivo-Comportamental, Ansiedade, Depressão",
  bio_profissional:
    "Psicóloga clínica especializada em TCC com foco em ansiedade e depressão.",
  formacao_principal: "Psicologia - USP",
  experiencia_anos: 8,
  valor_sessao: 150,
  abordagem_terapeutica:
    "Terapia Cognitivo-Comportamental integrada com Mindfulness",
  crp: "06/123456",
  conselho_tipo: "CRP",
  conselho_numero: "06/123456",
  registro_profissional: "123456",
  verificado: true,
  status_verificacao: "aprovado",
  endereco_cep: "01234-567",
  endereco_logradouro: "Rua das Flores",
  endereco_numero: "123",
  endereco_bairro: "Centro",
  endereco_cidade: "São Paulo",
  endereco_estado: "SP",
  endereco_complemento: "Sala 101",
  link_linkedin: "https://linkedin.com/in/marina-silva",
  link_instagram: "https://instagram.com/dra.marinasilva",
  link_youtube: "",
  site_pessoal: "https://dramarinasilva.com.br",
  foto_perfil_url: "",
};

export default function ProfileEditForm({
  formData = exampleFormData,
  errors = {},
  uploadingPhoto = false,
  onUpdateField = () => {},
  onUploadPhoto = async () => true,
}: ProfileEditFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Função para lidar com upload de foto
  const handlePhotoUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validar tipo de arquivo
      if (!file.type.startsWith("image/")) {
        alert("Por favor, selecione apenas arquivos de imagem.");
        return;
      }

      // Validar tamanho (máx 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("A imagem deve ter no máximo 5MB.");
        return;
      }

      await onUploadPhoto(file);
    }
  };

  // Função para aplicar máscara de telefone
  const formatPhone = (value: string): string => {
    const cleaned = value.replace(/\D/g, "");
    const match = cleaned.match(/^(\d{2})(\d{4,5})(\d{4})$/);
    if (match) {
      return `(${match[1]}) ${match[2]}-${match[3]}`;
    }
    return value;
  };

  // Função para aplicar máscara de CPF
  const formatCPF = (value: string): string => {
    const cleaned = value.replace(/\D/g, "");
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{3})(\d{2})$/);
    if (match) {
      return `${match[1]}.${match[2]}.${match[3]}-${match[4]}`;
    }
    return value;
  };

  // Função para aplicar máscara de CEP
  const formatCEP = (value: string): string => {
    const cleaned = value.replace(/\D/g, "");
    const match = cleaned.match(/^(\d{5})(\d{3})$/);
    if (match) {
      return `${match[1]}-${match[2]}`;
    }
    return value;
  };

  // Componente de campo com validação visual
  const InputField: React.FC<{
    label: string;
    type?: string;
    value: string | number;
    onChange: (value: string) => void;
    placeholder?: string;
    icon?: React.ReactNode;
    error?: string;
    required?: boolean;
    mask?: (value: string) => string;
    maxLength?: number;
  }> = ({
    label,
    type = "text",
    value,
    onChange,
    placeholder,
    icon,
    error,
    required = false,
    mask,
    maxLength,
  }) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      let newValue = e.target.value;
      if (mask) {
        newValue = mask(newValue);
      }
      onChange(newValue);
    };

    return (
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              {icon}
            </div>
          )}
          <input
            type={type}
            value={value}
            onChange={handleChange}
            maxLength={maxLength}
            className={`
              w-full 
              ${icon ? "pl-10" : "pl-4"} 
              pr-4 py-3 
              border rounded-xl 
              focus:ring-2 focus:ring-blue-500 focus:border-transparent
              transition-all duration-200
              ${
                error
                  ? "border-red-500 bg-red-50"
                  : "border-gray-300 hover:border-gray-400"
              }
              ${value ? "bg-blue-50/30" : "bg-white"}
            `}
            placeholder={placeholder}
          />
          {error && (
            <ExclamationCircleIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-red-500" />
          )}
          {value && !error && (
            <CheckIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-500" />
          )}
        </div>
        {error && (
          <p className="text-red-500 text-sm flex items-center gap-1">
            <ExclamationCircleIcon className="w-4 h-4" />
            {error}
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Seção: Foto de Perfil */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
        <div className="flex items-center gap-6 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
            <CameraIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Foto de Perfil</h3>
            <p className="text-gray-600">
              Sua foto ajuda pacientes a se conectarem com você
            </p>
          </div>
        </div>

        <div className="flex items-center gap-8">
          <div className="relative group">
            <Avatar
              src={formData.foto_perfil_url}
              alt={`${formData.nome} ${formData.sobrenome}`}
              size="xl"
              className="ring-4 ring-gray-200 group-hover:ring-blue-300 transition-all duration-300"
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingPhoto}
              className="absolute -bottom-2 -right-2 bg-blue-600 text-white p-3 rounded-full hover:bg-blue-700 transition-colors disabled:opacity-50 shadow-lg hover:shadow-xl"
            >
              {uploadingPhoto ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <CameraIcon className="w-5 h-5" />
              )}
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
            />
          </div>

          <div className="space-y-3">
            <p className="text-gray-700 font-medium">
              Dicas para uma boa foto:
            </p>
            <ul className="text-sm text-gray-600 space-y-1">
              <li className="flex items-center gap-2">
                <CheckIcon className="w-4 h-4 text-green-500" />
                Use uma foto profissional e recente
              </li>
              <li className="flex items-center gap-2">
                <CheckIcon className="w-4 h-4 text-green-500" />
                Certifique-se que seu rosto está bem iluminado
              </li>
              <li className="flex items-center gap-2">
                <CheckIcon className="w-4 h-4 text-green-500" />
                Formatos aceitos: JPG, PNG. Máximo: 5MB
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Seção: Dados Pessoais */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
        <div className="flex items-center gap-6 mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
            <UserIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Dados Pessoais</h3>
            <p className="text-gray-600">Informações básicas do seu perfil</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputField
            label="Nome"
            value={formData.nome}
            onChange={(value) => onUpdateField("nome", value)}
            placeholder="Seu primeiro nome"
            icon={<UserIcon className="w-5 h-5" />}
            error={errors.nome}
            required
          />

          <InputField
            label="Sobrenome"
            value={formData.sobrenome}
            onChange={(value) => onUpdateField("sobrenome", value)}
            placeholder="Seu sobrenome"
            icon={<UserIcon className="w-5 h-5" />}
            error={errors.sobrenome}
            required
          />

          <InputField
            label="E-mail"
            type="email"
            value={formData.email}
            onChange={(value) => onUpdateField("email", value)}
            placeholder="seu@email.com"
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
            mask={formatPhone}
            maxLength={15}
          />

          <InputField
            label="Data de Nascimento"
            type="date"
            value={formData.data_nascimento}
            onChange={(value) => onUpdateField("data_nascimento", value)}
            icon={<CalendarDaysIcon className="w-5 h-5" />}
            error={errors.data_nascimento}
          />

          <InputField
            label="CPF"
            value={formData.cpf}
            onChange={(value) => onUpdateField("cpf", value)}
            placeholder="123.456.789-00"
            icon={<DocumentTextIcon className="w-5 h-5" />}
            error={errors.cpf}
            mask={formatCPF}
            maxLength={14}
            required
          />
        </div>
      </div>

      {/* Seção: Informações Profissionais */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
        <div className="flex items-center gap-6 mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
            <AcademicCapIcon className="w-6 h-6 text-white" />
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
          {/* Tipo de Profissional */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Tipo de Profissional <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {[
                { value: "psicologo", label: "Psicólogo(a)", icon: "🧠" },
                { value: "psicanalista", label: "Psicanalista", icon: "🔍" },
                { value: "heike", label: "Terapeuta Reiki", icon: "✨" },
                {
                  value: "holistico",
                  label: "Terapeuta Holístico",
                  icon: "🌿",
                },
                { value: "coach_mentor", label: "Coach/Mentor", icon: "🎯" },
              ].map((tipo) => (
                <button
                  key={tipo.value}
                  type="button"
                  onClick={() => onUpdateField("tipo", tipo.value)}
                  className={`
                    p-4 rounded-xl border-2 transition-all duration-200 text-center
                    ${
                      formData.tipo === tipo.value
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-gray-200 hover:border-gray-300 text-gray-700"
                    }
                  `}
                >
                  <div className="text-2xl mb-1">{tipo.icon}</div>
                  <div className="text-sm font-medium">{tipo.label}</div>
                </button>
              ))}
            </div>
          </div>

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
              <p className="text-red-500 text-sm mt-1">
                {errors.especialidades}
              </p>
            )}
          </div>

          {/* Grid de informações profissionais */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField
              label="Formação Principal"
              value={formData.formacao_principal}
              onChange={(value) => onUpdateField("formacao_principal", value)}
              placeholder="Ex: Psicologia - USP"
              icon={<AcademicCapIcon className="w-5 h-5" />}
              error={errors.formacao_principal}
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

          {/* Credenciais Profissionais */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-100">
            <h4 className="text-lg font-bold text-blue-900 mb-4 flex items-center gap-2">
              <ShieldCheckIcon className="w-5 h-5" />
              Credenciais Profissionais
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* CRP - apenas para psicólogos */}
              {formData.tipo === "psicologo" && (
                <>
                  <InputField
                    label="CRP"
                    value={formData.crp}
                    onChange={(value) => onUpdateField("crp", value)}
                    placeholder="06/123456"
                    icon={<ShieldCheckIcon className="w-5 h-5" />}
                    error={errors.crp}
                    required
                  />

                  <InputField
                    label="Conselho"
                    value={formData.conselho_tipo}
                    onChange={(value) => onUpdateField("conselho_tipo", value)}
                    placeholder="CRP"
                    error={errors.conselho_tipo}
                  />
                </>
              )}

              {/* Registro profissional para outros tipos */}
              {formData.tipo !== "psicologo" && (
                <InputField
                  label="Registro Profissional"
                  value={formData.registro_profissional}
                  onChange={(value) =>
                    onUpdateField("registro_profissional", value)
                  }
                  placeholder="Número do registro ou certificação"
                  icon={<DocumentTextIcon className="w-5 h-5" />}
                  error={errors.registro_profissional}
                />
              )}
            </div>

            {/* Status de verificação (readonly) */}
            <div className="mt-4 flex items-center gap-3">
              <div
                className={`
                px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2
                ${
                  formData.verificado
                    ? "bg-green-100 text-green-800 border border-green-200"
                    : "bg-yellow-100 text-yellow-800 border border-yellow-200"
                }
              `}
              >
                {formData.verificado ? (
                  <>
                    <CheckIcon className="w-4 h-4" />
                    Perfil Verificado
                  </>
                ) : (
                  <>
                    <ClockIcon className="w-4 h-4" />
                    {formData.status_verificacao === "pendente" &&
                      "Aguardando Verificação"}
                    {formData.status_verificacao === "rejeitado" &&
                      "Verificação Rejeitada"}
                  </>
                )}
              </div>
            </div>
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

      {/* Seção: Endereço */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
        <div className="flex items-center gap-6 mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
            <MapPinIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Localização</h3>
            <p className="text-gray-600">Onde você atende seus pacientes</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <InputField
            label="CEP"
            value={formData.endereco_cep}
            onChange={(value) => onUpdateField("endereco_cep", value)}
            placeholder="01234-567"
            icon={<MapPinIcon className="w-5 h-5" />}
            error={errors.endereco_cep}
            mask={formatCEP}
            maxLength={9}
          />

          <div className="md:col-span-2">
            <InputField
              label="Logradouro"
              value={formData.endereco_logradouro}
              onChange={(value) => onUpdateField("endereco_logradouro", value)}
              placeholder="Rua das Flores"
              error={errors.endereco_logradouro}
            />
          </div>

          <InputField
            label="Número"
            value={formData.endereco_numero}
            onChange={(value) => onUpdateField("endereco_numero", value)}
            placeholder="123"
            error={errors.endereco_numero}
          />

          <InputField
            label="Bairro"
            value={formData.endereco_bairro}
            onChange={(value) => onUpdateField("endereco_bairro", value)}
            placeholder="Centro"
            error={errors.endereco_bairro}
          />

          <InputField
            label="Complemento"
            value={formData.endereco_complemento}
            onChange={(value) => onUpdateField("endereco_complemento", value)}
            placeholder="Sala 101"
            error={errors.endereco_complemento}
          />

          <InputField
            label="Cidade"
            value={formData.endereco_cidade}
            onChange={(value) => onUpdateField("endereco_cidade", value)}
            placeholder="São Paulo"
            error={errors.endereco_cidade}
          />

          <InputField
            label="Estado"
            value={formData.endereco_estado}
            onChange={(value) => onUpdateField("endereco_estado", value)}
            placeholder="SP"
            error={errors.endereco_estado}
            maxLength={2}
          />
        </div>
      </div>

      {/* Seção: Links e Redes Sociais */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
        <div className="flex items-center gap-6 mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl flex items-center justify-center">
            <LinkIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">
              Links e Redes Sociais
            </h3>
            <p className="text-gray-600">
              Conecte-se com seus pacientes online
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputField
            label="LinkedIn"
            type="url"
            value={formData.link_linkedin}
            onChange={(value) => onUpdateField("link_linkedin", value)}
            placeholder="https://linkedin.com/in/seu-perfil"
            icon={<LinkIcon className="w-5 h-5" />}
            error={errors.link_linkedin}
          />

          <InputField
            label="Instagram"
            type="url"
            value={formData.link_instagram}
            onChange={(value) => onUpdateField("link_instagram", value)}
            placeholder="https://instagram.com/seu.perfil"
            icon={<LinkIcon className="w-5 h-5" />}
            error={errors.link_instagram}
          />

          <InputField
            label="YouTube"
            type="url"
            value={formData.link_youtube}
            onChange={(value) => onUpdateField("link_youtube", value)}
            placeholder="https://youtube.com/@seucanal"
            icon={<LinkIcon className="w-5 h-5" />}
            error={errors.link_youtube}
          />

          <InputField
            label="Site Pessoal"
            type="url"
            value={formData.site_pessoal}
            onChange={(value) => onUpdateField("site_pessoal", value)}
            placeholder="https://seusite.com.br"
            icon={<LinkIcon className="w-5 h-5" />}
            error={errors.site_pessoal}
          />
        </div>
      </div>

      {/* Footer com estatísticas do perfil */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-lg font-semibold mb-1">Completude do Perfil</h4>
            <p className="text-blue-100">
              Quanto mais completo, melhor sua visibilidade
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">
              {Math.round(
                (Object.values(formData).filter(
                  (value) =>
                    value !== null &&
                    value !== undefined &&
                    value !== "" &&
                    value !== 0
                ).length /
                  Object.keys(formData).length) *
                  100
              )}
              %
            </div>
            <div className="text-sm text-blue-100">
              {Object.values(formData).filter(
                (value) =>
                  value !== null &&
                  value !== undefined &&
                  value !== "" &&
                  value !== 0
              ).length >
              Object.keys(formData).length * 0.8
                ? "Excelente!"
                : "Quase lá!"}
            </div>
          </div>
        </div>
        <div className="mt-4 bg-white/20 rounded-full h-2">
          <div
            className="bg-white h-2 rounded-full transition-all duration-500"
            style={{
              width: `${Math.round(
                (Object.values(formData).filter(
                  (value) =>
                    value !== null &&
                    value !== undefined &&
                    value !== "" &&
                    value !== 0
                ).length /
                  Object.keys(formData).length) *
                  100
              )}%`,
            }}
          ></div>
        </div>

        {/* Lista de campos importantes faltando */}
        {formData.nome && formData.sobrenome && formData.especialidades && (
          <div className="mt-4 text-sm text-blue-100">
            <div className="flex flex-wrap gap-2">
              {!formData.bio_profissional && (
                <span className="bg-white/20 px-2 py-1 rounded text-xs">
                  📝 Bio profissional
                </span>
              )}
              {!formData.foto_perfil_url && (
                <span className="bg-white/20 px-2 py-1 rounded text-xs">
                  📸 Foto de perfil
                </span>
              )}
              {!formData.formacao_principal && (
                <span className="bg-white/20 px-2 py-1 rounded text-xs">
                  🎓 Formação
                </span>
              )}
              {formData.valor_sessao === 0 && (
                <span className="bg-white/20 px-2 py-1 rounded text-xs">
                  💰 Valor da sessão
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
