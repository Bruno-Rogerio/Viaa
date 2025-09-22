// src/components/dashboard/professional/profile/ProfilePreview.tsx
// 🎨 PROFILE PREVIEW - Design limpo e profissional

"use client";
import React from "react";
import {
  MapPinIcon,
  ClockIcon,
  CurrencyDollarIcon,
  AcademicCapIcon,
  ShieldCheckIcon,
  PencilIcon,
  HeartIcon,
  UserGroupIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import { CheckBadgeIcon as CheckBadgeSolidIcon } from "@heroicons/react/24/solid";

interface ProfilePreviewProps {
  formData: any;
  readOnlyData: any;
  onStartEdit: () => void;
  profileCompleteness: number;
}

export default function ProfilePreview({
  formData,
  readOnlyData,
  onStartEdit,
  profileCompleteness,
}: ProfilePreviewProps) {
  // Funções utilitárias
  const getTipoDisplay = (tipo: string) => {
    const tipos = {
      psicologo: "Psicólogo(a)",
      psicanalista: "Psicanalista",
      heike: "Terapeuta Reiki",
      holistico: "Terapeuta Holístico",
      coach_mentor: "Coach/Mentor",
    };
    return tipos[tipo as keyof typeof tipos] || tipo;
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

  const getStatusInfo = (verificado: boolean, status: string) => {
    if (verificado) {
      return {
        label: "Perfil Verificado",
        bgColor: "bg-green-50",
        textColor: "text-green-700",
        borderColor: "border-green-200",
      };
    }

    switch (status) {
      case "pendente":
        return {
          label: "Em Análise",
          bgColor: "bg-blue-50",
          textColor: "text-blue-700",
          borderColor: "border-blue-200",
        };
      case "rejeitado":
        return {
          label: "Requer Atenção",
          bgColor: "bg-amber-50",
          textColor: "text-amber-700",
          borderColor: "border-amber-200",
        };
      default:
        return {
          label: "Em Análise",
          bgColor: "bg-gray-50",
          textColor: "text-gray-700",
          borderColor: "border-gray-200",
        };
    }
  };

  const nomeCompleto = `${readOnlyData?.nome || ""} ${
    readOnlyData?.sobrenome || ""
  }`;
  const localizacao =
    formData.endereco_cidade && formData.endereco_estado
      ? `${formData.endereco_cidade}, ${formData.endereco_estado}`
      : null;
  const statusInfo = getStatusInfo(
    readOnlyData?.verificado,
    readOnlyData?.status_verificacao
  );

  return (
    <div className="space-y-6">
      {/* 🎨 HERO SECTION - Mais limpo e suave */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 rounded-2xl border border-slate-200">
        <div className="relative z-10 p-8">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            {/* Avatar Limpo */}
            <div className="relative">
              <div className="w-32 h-32 md:w-36 md:h-36 rounded-2xl overflow-hidden bg-white shadow-lg border border-slate-200">
                {formData.foto_perfil_url ? (
                  <img
                    src={formData.foto_perfil_url}
                    alt="Foto de perfil"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-slate-600 text-3xl md:text-4xl font-semibold">
                    {getInitials(
                      readOnlyData?.nome || "",
                      readOnlyData?.sobrenome || ""
                    )}
                  </div>
                )}
              </div>

              {/* Status Badge */}
              {readOnlyData?.verificado && (
                <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1.5 border-3 border-white shadow-md">
                  <CheckBadgeSolidIcon className="w-4 h-4 text-white" />
                </div>
              )}
            </div>

            {/* Info Principal */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">
                {nomeCompleto}
              </h1>

              {/* Tipo Profissional */}
              <p className="text-lg text-slate-600 mb-3 font-medium">
                {getTipoDisplay(readOnlyData?.tipo || "")}
              </p>

              {/* Localização */}
              {localizacao && (
                <div className="flex items-center justify-center md:justify-start gap-2 mb-3">
                  <MapPinIcon className="w-4 h-4 text-slate-500" />
                  <span className="text-slate-600">{localizacao}</span>
                </div>
              )}

              {/* Status */}
              <div
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium border ${statusInfo.bgColor} ${statusInfo.textColor} ${statusInfo.borderColor}`}
              >
                <ShieldCheckIcon className="w-4 h-4" />
                {statusInfo.label}
              </div>
            </div>

            {/* Botão Editar e Progresso */}
            <div className="flex flex-col gap-4 items-center">
              <button
                onClick={onStartEdit}
                className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-xl font-medium transition-colors flex items-center gap-2 shadow-sm"
              >
                <PencilIcon className="w-4 h-4" />
                Editar Perfil
              </button>

              {/* Progresso do Perfil */}
              <div className="text-center">
                <div className="w-16 h-16 relative">
                  <svg
                    className="w-16 h-16 transform -rotate-90"
                    viewBox="0 0 36 36"
                  >
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#e2e8f0"
                      strokeWidth="2"
                    />
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#3b82f6"
                      strokeWidth="2"
                      strokeDasharray={`${profileCompleteness}, 100`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-semibold text-slate-700">
                      {profileCompleteness}%
                    </span>
                  </div>
                </div>
                <p className="text-xs text-slate-500 mt-1">Completo</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 📊 CARDS DE ESTATÍSTICAS - Cores mais suaves */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Experiência */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
              <ClockIcon className="w-5 h-5 text-slate-600" />
            </div>
            <div>
              <h3 className="font-medium text-slate-900">Experiência</h3>
              <p className="text-slate-600 text-sm">
                {formatExperiencia(formData.experiencia_anos || 0)}
              </p>
            </div>
          </div>
        </div>

        {/* Valor */}
        {formData.valor_sessao > 0 && (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                <CurrencyDollarIcon className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h3 className="font-medium text-slate-900">Valor da Sessão</h3>
                <p className="text-emerald-600 font-semibold">
                  {formatValor(formData.valor_sessao)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* CRP se tiver */}
        {readOnlyData?.crp && (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <ShieldCheckIcon className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium text-slate-900">Registro</h3>
                <p className="text-blue-600 font-medium text-sm">
                  CRP: {readOnlyData.crp}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 🎯 SEÇÕES DE INFORMAÇÕES */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sobre Mim */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
              <UserGroupIcon className="w-4 h-4 text-slate-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">Sobre Mim</h3>
          </div>

          {formData.bio_profissional ? (
            <p className="text-slate-700 leading-relaxed">
              {formData.bio_profissional}
            </p>
          ) : (
            <p className="text-slate-400 italic">Biografia não preenchida</p>
          )}
        </div>

        {/* Especialidades - Design limpo sem ícones */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
              <SparklesIcon className="w-4 h-4 text-slate-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">
              Especialidades
            </h3>
          </div>

          {formData.especialidades ? (
            <div className="space-y-2">
              {formData.especialidades
                .split(",")
                .map((especialidade: string, index: number) => (
                  <div
                    key={index}
                    className="bg-slate-50 text-slate-700 px-3 py-2 rounded-lg text-sm font-medium border border-slate-200 hover:bg-slate-100 transition-colors"
                  >
                    {especialidade.trim()}
                  </div>
                ))}
            </div>
          ) : (
            <p className="text-slate-400 italic">
              Especialidades não preenchidas
            </p>
          )}
        </div>
      </div>

      {/* 🎓 FORMAÇÃO E ABORDAGEM */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Formação */}
        {formData.formacao_principal && (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                <AcademicCapIcon className="w-4 h-4 text-slate-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">Formação</h3>
            </div>
            <p className="text-slate-700">{formData.formacao_principal}</p>
          </div>
        )}

        {/* Abordagem */}
        {formData.abordagem_terapeutica && (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                <HeartIcon className="w-4 h-4 text-slate-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">
                Abordagem
              </h3>
            </div>
            <p className="text-slate-700">{formData.abordagem_terapeutica}</p>
          </div>
        )}
      </div>
    </div>
  );
}
