// src/components/dashboard/professional/profile/ProfilePreview.tsx
// 🎨 PROFILE PREVIEW REDESENHADO - Design moderno e atrativo

"use client";
import React from "react";
import {
  MapPinIcon,
  StarIcon,
  ClockIcon,
  CurrencyDollarIcon,
  LinkIcon,
  CheckBadgeIcon,
  CalendarDaysIcon,
  AcademicCapIcon,
  ShieldCheckIcon,
  GlobeAmericasIcon,
  UserGroupIcon,
  SparklesIcon,
  PencilIcon,
  PhoneIcon,
  EnvelopeIcon,
  HeartIcon,
} from "@heroicons/react/24/outline";
import {
  CheckBadgeIcon as CheckBadgeSolidIcon,
  StarIcon as StarSolidIcon,
} from "@heroicons/react/24/solid";

interface ProfilePreviewProps {
  formData: any;
  readOnlyData: any;
  onStartEdit: () => void;
}

export default function ProfilePreview({
  formData,
  readOnlyData,
  onStartEdit,
}: ProfilePreviewProps) {
  // Funções utilitárias
  const getTipoDisplay = (tipo: string) => {
    const tipos = {
      psicologo: { label: "Psicólogo(a)", icon: "🧠", color: "blue" },
      psicanalista: { label: "Psicanalista", icon: "🔍", color: "purple" },
      heike: { label: "Terapeuta Reiki", icon: "✨", color: "pink" },
      holistico: { label: "Terapeuta Holístico", icon: "🌿", color: "green" },
      coach_mentor: { label: "Coach/Mentor", icon: "🎯", color: "orange" },
    };
    return (
      tipos[tipo as keyof typeof tipos] || {
        label: tipo,
        icon: "👨‍⚕️",
        color: "gray",
      }
    );
  };

  const getInitials = (nome: string, sobrenome: string) => {
    return `${nome.charAt(0)}${sobrenome.charAt(0)}`.toUpperCase();
  };

  const formatExperiencia = (anos: number) => {
    if (anos === 0) return "Iniciando carreira";
    if (anos === 1) return "1 ano de experiência";
    return `${anos} anos de experiência`;
  };

  const formatValor = (valor: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(valor);
  };

  const tipoInfo = getTipoDisplay(readOnlyData?.tipo || "");
  const nomeCompleto = `${readOnlyData?.nome || ""} ${
    readOnlyData?.sobrenome || ""
  }`;
  const localizacao =
    formData.endereco_cidade && formData.endereco_estado
      ? `${formData.endereco_cidade}, ${formData.endereco_estado}`
      : null;

  return (
    <div className="space-y-6">
      {/* 🎨 HERO SECTION - Header Principal */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-3xl shadow-2xl">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent"></div>

        {/* Floating Elements */}
        <div className="absolute top-10 right-10 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
        <div className="absolute bottom-10 left-10 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>

        <div className="relative z-10 p-8 md:p-12">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            {/* Avatar Premium */}
            <div className="relative">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-3xl overflow-hidden bg-white/20 backdrop-blur-sm border-4 border-white/30 shadow-2xl">
                {formData.foto_perfil_url ? (
                  <img
                    src={formData.foto_perfil_url}
                    alt="Foto de perfil"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-white/30 to-white/10 text-white text-4xl md:text-5xl font-bold">
                    {getInitials(
                      readOnlyData?.nome || "",
                      readOnlyData?.sobrenome || ""
                    )}
                  </div>
                )}
              </div>

              {/* Status Badge */}
              {readOnlyData?.verificado && (
                <div className="absolute -bottom-2 -right-2 bg-green-500 rounded-full p-2 border-4 border-white shadow-lg">
                  <CheckBadgeSolidIcon className="w-6 h-6 text-white" />
                </div>
              )}
            </div>

            {/* Info Principal */}
            <div className="flex-1 text-center md:text-left text-white">
              <h1 className="text-3xl md:text-4xl font-bold mb-2 drop-shadow-sm">
                {nomeCompleto}
              </h1>

              {/* Tipo Profissional */}
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-4">
                <span className="text-2xl">{tipoInfo.icon}</span>
                <span className="font-semibold text-lg">{tipoInfo.label}</span>
              </div>

              {/* Localização */}
              {localizacao && (
                <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
                  <MapPinIcon className="w-5 h-5 text-white/80" />
                  <span className="text-white/90">{localizacao}</span>
                </div>
              )}

              {/* CRP se tiver */}
              {readOnlyData?.crp && (
                <div className="flex items-center justify-center md:justify-start gap-2">
                  <ShieldCheckIcon className="w-5 h-5 text-white/80" />
                  <span className="text-white/90">CRP: {readOnlyData.crp}</span>
                </div>
              )}
            </div>

            {/* Botão Editar */}
            <div className="flex flex-col gap-3">
              <button
                onClick={onStartEdit}
                className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-6 py-3 rounded-2xl font-semibold transition-all duration-300 hover:scale-105 border border-white/30 flex items-center gap-2"
              >
                <PencilIcon className="w-5 h-5" />
                Editar Perfil
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 📊 CARDS DE ESTATÍSTICAS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Experiência */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <ClockIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Experiência</h3>
              <p className="text-blue-600 font-medium">
                {formatExperiencia(formData.experiencia_anos || 0)}
              </p>
            </div>
          </div>
        </div>

        {/* Valor */}
        {formData.valor_sessao > 0 && (
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <CurrencyDollarIcon className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Valor da Sessão</h3>
                <p className="text-green-600 font-medium text-lg">
                  {formatValor(formData.valor_sessao)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Status */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
          <div className="flex items-center gap-3 mb-3">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                readOnlyData?.verificado ? "bg-green-100" : "bg-yellow-100"
              }`}
            >
              <ShieldCheckIcon
                className={`w-6 h-6 ${
                  readOnlyData?.verificado
                    ? "text-green-600"
                    : "text-yellow-600"
                }`}
              />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Status</h3>
              <p
                className={`font-medium ${
                  readOnlyData?.verificado
                    ? "text-green-600"
                    : "text-yellow-600"
                }`}
              >
                {readOnlyData?.verificado ? "Verificado" : "Pendente"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 🎯 SEÇÕES DE INFORMAÇÕES */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sobre Mim */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
              <UserGroupIcon className="w-5 h-5 text-purple-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Sobre Mim</h3>
          </div>

          {formData.bio_profissional ? (
            <p className="text-gray-700 leading-relaxed">
              {formData.bio_profissional}
            </p>
          ) : (
            <p className="text-gray-500 italic">Biografia não preenchida</p>
          )}
        </div>

        {/* Especialidades */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
              <SparklesIcon className="w-5 h-5 text-indigo-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Especialidades</h3>
          </div>

          {formData.especialidades ? (
            <div className="flex flex-wrap gap-2">
              {formData.especialidades
                .split(",")
                .map((especialidade: string, index: number) => (
                  <span
                    key={index}
                    className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-sm font-medium border border-indigo-200"
                  >
                    {especialidade.trim()}
                  </span>
                ))}
            </div>
          ) : (
            <p className="text-gray-500 italic">
              Especialidades não preenchidas
            </p>
          )}
        </div>
      </div>

      {/* 🎓 FORMAÇÃO E ABORDAGEM */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Formação */}
        {formData.formacao_principal && (
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <AcademicCapIcon className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Formação</h3>
            </div>
            <p className="text-gray-700">{formData.formacao_principal}</p>
          </div>
        )}

        {/* Abordagem */}
        {formData.abordagem_terapeutica && (
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-pink-100 rounded-xl flex items-center justify-center">
                <HeartIcon className="w-5 h-5 text-pink-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Abordagem</h3>
            </div>
            <p className="text-gray-700">{formData.abordagem_terapeutica}</p>
          </div>
        )}
      </div>

      {/* 📞 CONTATO E REDES SOCIAIS */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
            <LinkIcon className="w-5 h-5 text-emerald-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">Contato e Redes</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Email */}
          {formData.email && (
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <EnvelopeIcon className="w-5 h-5 text-gray-600" />
              <span className="text-sm text-gray-700 truncate">
                {formData.email}
              </span>
            </div>
          )}

          {/* Telefone */}
          {formData.telefone && (
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <PhoneIcon className="w-5 h-5 text-gray-600" />
              <span className="text-sm text-gray-700">{formData.telefone}</span>
            </div>
          )}

          {/* LinkedIn */}
          {formData.link_linkedin && (
            <a
              href={formData.link_linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors"
            >
              <div className="w-5 h-5 bg-blue-600 rounded text-white text-xs flex items-center justify-center font-bold">
                in
              </div>
              <span className="text-sm text-blue-700">LinkedIn</span>
            </a>
          )}

          {/* Instagram */}
          {formData.link_instagram && (
            <a
              href={formData.link_instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 bg-pink-50 rounded-xl hover:bg-pink-100 transition-colors"
            >
              <div className="w-5 h-5 bg-gradient-to-r from-purple-500 to-pink-500 rounded text-white text-xs flex items-center justify-center font-bold">
                📷
              </div>
              <span className="text-sm text-pink-700">Instagram</span>
            </a>
          )}

          {/* Site Pessoal */}
          {formData.site_pessoal && (
            <a
              href={formData.site_pessoal}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 bg-emerald-50 rounded-xl hover:bg-emerald-100 transition-colors"
            >
              <GlobeAmericasIcon className="w-5 h-5 text-emerald-600" />
              <span className="text-sm text-emerald-700">Site Pessoal</span>
            </a>
          )}
        </div>
      </div>

      {/* 🎨 FOOTER CALL TO ACTION */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-center text-white">
        <h3 className="text-2xl font-bold mb-2">Perfil em Construção</h3>
        <p className="text-blue-100 mb-4">
          Continue preenchendo suas informações para ter um perfil mais completo
        </p>
        <button
          onClick={onStartEdit}
          className="bg-white text-blue-600 px-8 py-3 rounded-xl font-semibold hover:bg-blue-50 transition-colors"
        >
          Completar Perfil
        </button>
      </div>
    </div>
  );
}
