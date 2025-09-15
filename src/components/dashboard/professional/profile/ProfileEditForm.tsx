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

// Usando a mesma interface do hook para evitar conflitos
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

// Dados de exemplo compatíveis com o hook existente
const exampleFormData: ProfileFormData = {
  nome: "Marina",
  sobrenome: "Silva Santos",
  email: "marina@email.com",
  telefone: "(11) 99999-9999",
  data_nascimento: "1990-05-15",
  especialidades: "Terapia Cognitivo-Comportamental, Ansiedade, Depressão",
  bio_profissional:
    "Psicóloga clínica especializada em TCC com foco em ansiedade e depressão.",
  formacao_principal: "Psicologia - USP",
  experiencia_anos: 8,
  valor_sessao: 150,
  abordagem_terapeutica:
    "Terapia Cognitivo-Comportamental integrada com Mindfulness",
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

          {/* Placeholder para manter o grid 2x3 */}
          <div></div>
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

            {/* Valor da Sessão */}
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
            <div className="text-3xl font-bold">85%</div>
            <div className="text-sm text-blue-100">Quase lá!</div>
          </div>
        </div>
        <div className="mt-4 bg-white/20 rounded-full h-2">
          <div
            className="bg-white h-2 rounded-full"
            style={{ width: "85%" }}
          ></div>
        </div>
      </div>
    </div>
  );
}
