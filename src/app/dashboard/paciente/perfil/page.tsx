// src/app/dashboard/paciente/perfil/page.tsx
// 👤 Perfil do Paciente - Editar informações pessoais

"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { PatientLayout } from "@/components/dashboard/patient/layout";
import {
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  CalendarDaysIcon,
  ShieldCheckIcon,
  CameraIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";

// ============================================================
// 📋 TIPOS
// ============================================================

interface FormData {
  nome: string;
  sobrenome: string;
  email: string;
  telefone: string;
  data_nascimento: string;
  genero: string;
  endereco_cep: string;
  endereco_logradouro: string;
  endereco_numero: string;
  endereco_bairro: string;
  cidade: string;
  estado: string;
  bio_pessoal: string;
}

// ============================================================
// 🎯 COMPONENTE PRINCIPAL
// ============================================================

export default function PerfilPage() {
  const { user, profile } = useAuth();

  // Estados
  const [formData, setFormData] = useState<FormData>({
    nome: "",
    sobrenome: "",
    email: "",
    telefone: "",
    data_nascimento: "",
    genero: "",
    endereco_cep: "",
    endereco_logradouro: "",
    endereco_numero: "",
    endereco_bairro: "",
    cidade: "",
    estado: "",
    bio_pessoal: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const [fotoFile, setFotoFile] = useState<File | null>(null);

  // ========== CARREGAR DADOS DO PERFIL ==========
  useEffect(() => {
    if (profile?.dados) {
      const dados = profile.dados as any;
      setFormData({
        nome: dados.nome || "",
        sobrenome: dados.sobrenome || "",
        email: user?.email || "",
        telefone: dados.telefone || "",
        data_nascimento: dados.data_nascimento || "",
        genero: dados.genero || "",
        endereco_cep: dados.endereco_cep || "",
        endereco_logradouro: dados.endereco_logradouro || "",
        endereco_numero: dados.endereco_numero || "",
        endereco_bairro: dados.endereco_bairro || "",
        cidade: dados.cidade || "",
        estado: dados.estado || "",
        bio_pessoal: dados.bio_pessoal || "",
      });

      if (dados.foto_perfil_url) {
        setFotoPreview(dados.foto_perfil_url);
      }
    }
    setLoading(false);
  }, [profile, user]);

  // ========== HANDLE INPUT CHANGE ==========
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ========== HANDLE FOTO UPLOAD ==========
  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // ========== BUSCAR ENDEREÇO POR CEP ==========
  const handleCepChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const cep = e.target.value.replace(/\D/g, "");
    setFormData((prev) => ({
      ...prev,
      endereco_cep: cep,
    }));

    if (cep.length === 8) {
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data = await response.json();

        if (!data.erro) {
          setFormData((prev) => ({
            ...prev,
            endereco_logradouro: data.logradouro || "",
            endereco_bairro: data.bairro || "",
            cidade: data.localidade || "",
            estado: data.uf || "",
          }));
        }
      } catch (err) {
        console.error("Erro ao buscar CEP:", err);
      }
    }
  };

  // ========== SALVAR PERFIL ==========
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError(null);
      setSuccess(false);

      // TODO: Implementar upload da foto e envio dos dados para API

      // Simular salvamento
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // ========== RENDER ==========

  if (loading) {
    return (
      <PatientLayout>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500" />
        </div>
      </PatientLayout>
    );
  }

  return (
    <PatientLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-6 text-white">
          <h1 className="text-3xl font-bold">Meu Perfil</h1>
          <p className="text-purple-100 mt-2">
            Mantenha suas informações pessoais atualizadas
          </p>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          {/* Success Message */}
          {success && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
              <CheckCircleIcon className="w-6 h-6 text-green-600" />
              <p className="text-green-800 font-medium">
                Perfil atualizado com sucesso!
              </p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <p className="text-red-800 font-medium">{error}</p>
            </div>
          )}

          {/* Foto de Perfil */}
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              Foto de Perfil
            </h2>

            <div className="flex items-center gap-6">
              {/* Avatar */}
              <div className="relative">
                {fotoPreview ? (
                  <img
                    src={fotoPreview}
                    alt="Foto de perfil"
                    className="w-24 h-24 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white text-2xl font-bold">
                    {formData.nome.charAt(0)}
                    {formData.sobrenome.charAt(0)}
                  </div>
                )}

                {/* Botão de câmera */}
                <label className="absolute bottom-0 right-0 bg-purple-500 hover:bg-purple-600 text-white p-2 rounded-full cursor-pointer transition-colors">
                  <CameraIcon className="w-5 h-5" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFotoChange}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Info */}
              <div>
                <p className="font-semibold text-gray-900 mb-1">Alterar foto</p>
                <p className="text-sm text-gray-600 mb-3">
                  JPG, PNG ou GIF. Máximo 5MB.
                </p>
                <label className="inline-block px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium rounded-lg cursor-pointer transition-colors">
                  Upload
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFotoChange}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Informações Pessoais */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 space-y-4">
            <h2 className="text-lg font-bold text-gray-900">
              Informações Pessoais
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Nome */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Nome
                </label>
                <input
                  type="text"
                  name="nome"
                  value={formData.nome}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Seu nome"
                />
              </div>

              {/* Sobrenome */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Sobrenome
                </label>
                <input
                  type="text"
                  name="sobrenome"
                  value={formData.sobrenome}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Seu sobrenome"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <EnvelopeIcon className="w-4 h-4" />
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
                />
                <p className="text-xs text-gray-600 mt-1">
                  Email não pode ser alterado
                </p>
              </div>

              {/* Telefone */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <PhoneIcon className="w-4 h-4" />
                  Telefone
                </label>
                <input
                  type="tel"
                  name="telefone"
                  value={formData.telefone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="(11) 99999-9999"
                />
              </div>

              {/* Data de Nascimento */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <CalendarDaysIcon className="w-4 h-4" />
                  Data de Nascimento
                </label>
                <input
                  type="date"
                  name="data_nascimento"
                  value={formData.data_nascimento}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Gênero */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Gênero
                </label>
                <select
                  name="genero"
                  value={formData.genero}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Selecionar</option>
                  <option value="masculino">Masculino</option>
                  <option value="feminino">Feminino</option>
                  <option value="outro">Outro</option>
                  <option value="prefiro_nao_dizer">Prefiro não dizer</option>
                </select>
              </div>
            </div>

            {/* Bio Pessoal */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Bio Pessoal
              </label>
              <textarea
                name="bio_pessoal"
                value={formData.bio_pessoal}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Conte um pouco sobre você..."
              />
              <p className="text-xs text-gray-600 mt-1">
                {formData.bio_pessoal.length}/500
              </p>
            </div>
          </div>

          {/* Endereço */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 space-y-4">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <MapPinIcon className="w-5 h-5" />
              Endereço
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* CEP */}
              <div className="md:col-span-1">
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  CEP
                </label>
                <input
                  type="text"
                  name="endereco_cep"
                  value={formData.endereco_cep}
                  onChange={handleCepChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="00000-000"
                />
              </div>

              {/* Rua */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Logradouro
                </label>
                <input
                  type="text"
                  name="endereco_logradouro"
                  value={formData.endereco_logradouro}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Rua, Avenida, etc"
                />
              </div>

              {/* Número */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Número
                </label>
                <input
                  type="text"
                  name="endereco_numero"
                  value={formData.endereco_numero}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="123"
                />
              </div>

              {/* Bairro */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Bairro
                </label>
                <input
                  type="text"
                  name="endereco_bairro"
                  value={formData.endereco_bairro}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Bairro"
                />
              </div>

              {/* Cidade */}
              <div className="md:col-span-1">
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Cidade
                </label>
                <input
                  type="text"
                  name="cidade"
                  value={formData.cidade}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Cidade"
                />
              </div>

              {/* Estado */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Estado
                </label>
                <input
                  type="text"
                  name="estado"
                  value={formData.estado}
                  onChange={handleInputChange}
                  maxLength={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="SP"
                />
              </div>
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => window.history.back()}
              className="flex-1 px-6 py-3 bg-gray-100 text-gray-800 font-semibold rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50"
            >
              {saving ? "Salvando..." : "Salvar Alterações"}
            </button>
          </div>
        </form>
      </div>
    </PatientLayout>
  );
}
