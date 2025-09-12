// src/components/dashboard/professional/profile/ProfileEditForm.tsx
// Formulário completo para edição do perfil profissional

"use client";

import { useRef } from "react";
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
} from "@heroicons/react/24/outline";
import { Avatar } from "@/components/dashboard/common";

interface ProfileFormData {
  nome: string;
  sobrenome: string;
  email: string;
  telefone: string;
  data_nascimento: string;
  especialidades: string;
  bio_profissional: string;
  formacao_principal: string;
  experiencia_anos: number;
  valor_sessao: number;
  abordagem_terapeutica: string;
  endereco_cidade: string;
  endereco_estado: string;
  endereco_cep: string;
  endereco_logradouro: string;
  endereco_numero: string;
  endereco_bairro: string;
  endereco_complemento: string;
  link_linkedin: string;
  link_instagram: string;
  link_youtube: string;
  site_pessoal: string;
  foto_perfil_url: string;
}

interface ProfileEditFormProps {
  formData: ProfileFormData;
  errors: Record<string, string>;
  uploadingPhoto: boolean;
  onUpdateField: (field: keyof ProfileFormData, value: string | number) => void;
  onUploadPhoto: (file: File) => Promise<boolean>;
}

export default function ProfileEditForm({
  formData,
  errors,
  uploadingPhoto,
  onUpdateField,
  onUploadPhoto,
}: ProfileEditFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  return (
    <div className="space-y-8">
      {/* Seção: Foto de Perfil */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Foto de Perfil
        </h3>

        <div className="flex items-center space-x-6">
          <div className="relative">
            <Avatar
              src={formData.foto_perfil_url}
              alt={`${formData.nome} ${formData.sobrenome}`}
              size="xl"
              className="ring-2 ring-gray-200"
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingPhoto}
              className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {uploadingPhoto ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <CameraIcon className="w-4 h-4" />
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

          <div>
            <p className="text-sm text-gray-600 mb-2">
              Escolha uma foto profissional que represente você.
            </p>
            <p className="text-xs text-gray-500">
              Formatos aceitos: JPG, PNG. Tamanho máximo: 5MB.
            </p>
          </div>
        </div>
      </div>

      {/* Seção: Dados Pessoais */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Dados Pessoais
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Nome */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nome *
            </label>
            <div className="relative">
              <UserIcon className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={formData.nome}
                onChange={(e) => onUpdateField("nome", e.target.value)}
                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.nome ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Seu nome"
              />
            </div>
            {errors.nome && (
              <p className="text-red-500 text-sm mt-1">{errors.nome}</p>
            )}
          </div>

          {/* Sobrenome */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sobrenome *
            </label>
            <div className="relative">
              <UserIcon className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={formData.sobrenome}
                onChange={(e) => onUpdateField("sobrenome", e.target.value)}
                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.sobrenome ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Seu sobrenome"
              />
            </div>
            {errors.sobrenome && (
              <p className="text-red-500 text-sm mt-1">{errors.sobrenome}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <div className="relative">
              <EnvelopeIcon className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => onUpdateField("email", e.target.value)}
                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.email ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="seu.email@exemplo.com"
              />
            </div>
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          {/* Telefone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Telefone *
            </label>
            <div className="relative">
              <PhoneIcon className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="tel"
                value={formData.telefone}
                onChange={(e) => onUpdateField("telefone", e.target.value)}
                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.telefone ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="(11) 99999-9999"
              />
            </div>
            {errors.telefone && (
              <p className="text-red-500 text-sm mt-1">{errors.telefone}</p>
            )}
          </div>

          {/* Data de Nascimento */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Data de Nascimento
            </label>
            <input
              type="date"
              value={formData.data_nascimento}
              onChange={(e) => onUpdateField("data_nascimento", e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Seção: Informações Profissionais */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Informações Profissionais
        </h3>

        <div className="space-y-6">
          {/* Especialidades */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Especialidades *
            </label>
            <textarea
              value={formData.especialidades}
              onChange={(e) => onUpdateField("especialidades", e.target.value)}
              rows={3}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.especialidades ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Descreva suas especialidades (ex: Terapia Cognitivo-Comportamental, Ansiedade, Depressão...)"
            />
            {errors.especialidades && (
              <p className="text-red-500 text-sm mt-1">
                {errors.especialidades}
              </p>
            )}
          </div>

          {/* Bio Profissional */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Biografia Profissional
            </label>
            <textarea
              value={formData.bio_profissional}
              onChange={(e) =>
                onUpdateField("bio_profissional", e.target.value)
              }
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Conte um pouco sobre você, sua experiência e abordagem terapêutica..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Experiência */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Anos de Experiência
              </label>
              <div className="relative">
                <ClockIcon className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={formData.experiencia_anos}
                  onChange={(e) =>
                    onUpdateField(
                      "experiencia_anos",
                      parseInt(e.target.value) || 0
                    )
                  }
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0"
                />
              </div>
            </div>

            {/* Valor da Sessão */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Valor da Sessão (R$)
              </label>
              <div className="relative">
                <CurrencyDollarIcon className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.valor_sessao}
                  onChange={(e) =>
                    onUpdateField(
                      "valor_sessao",
                      parseFloat(e.target.value) || 0
                    )
                  }
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="150.00"
                />
              </div>
            </div>
          </div>

          {/* Formação */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Formação Principal
            </label>
            <div className="relative">
              <AcademicCapIcon className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={formData.formacao_principal}
                onChange={(e) =>
                  onUpdateField("formacao_principal", e.target.value)
                }
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ex: Psicologia - Universidade de São Paulo"
              />
            </div>
          </div>

          {/* Abordagem Terapêutica */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Abordagem Terapêutica
            </label>
            <textarea
              value={formData.abordagem_terapeutica}
              onChange={(e) =>
                onUpdateField("abordagem_terapeutica", e.target.value)
              }
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Descreva sua abordagem terapêutica e metodologias utilizadas..."
            />
          </div>
        </div>
      </div>

      {/* Seção: Endereço */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Localização
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* CEP */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              CEP
            </label>
            <input
              type="text"
              value={formData.endereco_cep}
              onChange={(e) => onUpdateField("endereco_cep", e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="00000-000"
            />
          </div>

          {/* Cidade */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cidade
            </label>
            <div className="relative">
              <MapPinIcon className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={formData.endereco_cidade}
                onChange={(e) =>
                  onUpdateField("endereco_cidade", e.target.value)
                }
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="São Paulo"
              />
            </div>
          </div>

          {/* Estado */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estado
            </label>
            <select
              value={formData.endereco_estado}
              onChange={(e) => onUpdateField("endereco_estado", e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Selecione...</option>
              <option value="AC">Acre</option>
              <option value="AL">Alagoas</option>
              <option value="AP">Amapá</option>
              <option value="AM">Amazonas</option>
              <option value="BA">Bahia</option>
              <option value="CE">Ceará</option>
              <option value="DF">Distrito Federal</option>
              <option value="ES">Espírito Santo</option>
              <option value="GO">Goiás</option>
              <option value="MA">Maranhão</option>
              <option value="MT">Mato Grosso</option>
              <option value="MS">Mato Grosso do Sul</option>
              <option value="MG">Minas Gerais</option>
              <option value="PA">Pará</option>
              <option value="PB">Paraíba</option>
              <option value="PR">Paraná</option>
              <option value="PE">Pernambuco</option>
              <option value="PI">Piauí</option>
              <option value="RJ">Rio de Janeiro</option>
              <option value="RN">Rio Grande do Norte</option>
              <option value="RS">Rio Grande do Sul</option>
              <option value="RO">Rondônia</option>
              <option value="RR">Roraima</option>
              <option value="SC">Santa Catarina</option>
              <option value="SP">São Paulo</option>
              <option value="SE">Sergipe</option>
              <option value="TO">Tocantins</option>
            </select>
          </div>

          {/* Logradouro */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Logradouro
            </label>
            <input
              type="text"
              value={formData.endereco_logradouro}
              onChange={(e) =>
                onUpdateField("endereco_logradouro", e.target.value)
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Rua das Flores"
            />
          </div>

          {/* Número */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Número
            </label>
            <input
              type="text"
              value={formData.endereco_numero}
              onChange={(e) => onUpdateField("endereco_numero", e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="123"
            />
          </div>

          {/* Bairro */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bairro
            </label>
            <input
              type="text"
              value={formData.endereco_bairro}
              onChange={(e) => onUpdateField("endereco_bairro", e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Centro"
            />
          </div>

          {/* Complemento */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Complemento
            </label>
            <input
              type="text"
              value={formData.endereco_complemento}
              onChange={(e) =>
                onUpdateField("endereco_complemento", e.target.value)
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Apt 101"
            />
          </div>
        </div>
      </div>

      {/* Seção: Links Sociais */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Links e Redes Sociais
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* LinkedIn */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              LinkedIn
            </label>
            <div className="relative">
              <LinkIcon className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="url"
                value={formData.link_linkedin}
                onChange={(e) => onUpdateField("link_linkedin", e.target.value)}
                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.link_linkedin ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="https://linkedin.com/in/seuperfil"
              />
            </div>
            {errors.link_linkedin && (
              <p className="text-red-500 text-sm mt-1">
                {errors.link_linkedin}
              </p>
            )}
          </div>

          {/* Instagram */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Instagram
            </label>
            <div className="relative">
              <LinkIcon className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="url"
                value={formData.link_instagram}
                onChange={(e) =>
                  onUpdateField("link_instagram", e.target.value)
                }
                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.link_instagram ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="https://instagram.com/seuperfil"
              />
            </div>
            {errors.link_instagram && (
              <p className="text-red-500 text-sm mt-1">
                {errors.link_instagram}
              </p>
            )}
          </div>

          {/* YouTube */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              YouTube
            </label>
            <div className="relative">
              <LinkIcon className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="url"
                value={formData.link_youtube}
                onChange={(e) => onUpdateField("link_youtube", e.target.value)}
                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.link_youtube ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="https://youtube.com/c/seucanal"
              />
            </div>
            {errors.link_youtube && (
              <p className="text-red-500 text-sm mt-1">{errors.link_youtube}</p>
            )}
          </div>

          {/* Site Pessoal */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Site Pessoal
            </label>
            <div className="relative">
              <LinkIcon className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="url"
                value={formData.site_pessoal}
                onChange={(e) => onUpdateField("site_pessoal", e.target.value)}
                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.site_pessoal ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="https://seusite.com"
              />
            </div>
            {errors.site_pessoal && (
              <p className="text-red-500 text-sm mt-1">{errors.site_pessoal}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
