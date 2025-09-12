// src/components/dashboard/professional/profile/ProfilePreview.tsx
// Preview de como o perfil aparece publicamente - VERSÃO CORRIGIDA COMPLETA

"use client";

import { useState } from "react";
import {
  MapPinIcon,
  StarIcon,
  ClockIcon,
  CurrencyDollarIcon,
  LinkIcon,
  CheckBadgeIcon,
  CalendarDaysIcon,
  AcademicCapIcon,
} from "@heroicons/react/24/solid";
import { Avatar } from "@/components/dashboard/common";

interface ProfilePreviewProps {
  profileData: {
    nome: string;
    sobrenome: string;
    especialidades: string;
    bio_profissional: string;
    formacao_principal: string;
    experiencia_anos: number;
    valor_sessao: number;
    abordagem_terapeutica: string;
    endereco_cidade: string;
    endereco_estado: string;
    foto_perfil_url: string;
    link_linkedin: string;
    link_instagram: string;
    link_youtube: string;
    site_pessoal: string;
    crp?: string;
    verificado?: boolean;
  };
}

export default function ProfilePreview({ profileData }: ProfilePreviewProps) {
  const [activeTab, setActiveTab] = useState<
    "sobre" | "formacao" | "avaliacoes"
  >("sobre");

  const nomeCompleto = `${profileData.nome} ${profileData.sobrenome}`;
  const localizacao = `${profileData.endereco_cidade}, ${profileData.endereco_estado}`;

  // Links sociais com ícones usando Heroicons
  const socialLinks = [
    {
      name: "LinkedIn",
      url: profileData.link_linkedin,
      icon: <LinkIcon className="w-5 h-5" />,
      color: "text-blue-600 hover:bg-blue-50",
    },
    {
      name: "Instagram",
      url: profileData.link_instagram,
      icon: <LinkIcon className="w-5 h-5" />,
      color: "text-pink-600 hover:bg-pink-50",
    },
    {
      name: "YouTube",
      url: profileData.link_youtube,
      icon: <LinkIcon className="w-5 h-5" />,
      color: "text-red-600 hover:bg-red-50",
    },
    {
      name: "Site Pessoal",
      url: profileData.site_pessoal,
      icon: <LinkIcon className="w-5 h-5" />,
      color: "text-gray-600 hover:bg-gray-50",
    },
  ].filter((link) => link.url); // Só mostrar links preenchidos

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
      {/* Header com gradiente */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-emerald-600 h-32"></div>

      <div className="relative px-6 pb-6">
        {/* Foto de perfil */}
        <div className="flex justify-center -mt-16 mb-4">
          <div className="relative">
            <div className="w-32 h-32 rounded-full ring-4 ring-white shadow-lg overflow-hidden">
              <Avatar
                src={profileData.foto_perfil_url}
                alt={nomeCompleto}
                size="xl"
                className="w-full h-full"
              />
            </div>
            {profileData.verificado && (
              <div className="absolute -bottom-1 -right-1 bg-blue-600 rounded-full p-1">
                <CheckBadgeIcon className="w-6 h-6 text-white" />
              </div>
            )}
          </div>
        </div>

        {/* Informações principais */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {nomeCompleto}
          </h1>

          <p className="text-lg text-gray-600 mb-3">
            {profileData.especialidades}
          </p>

          <div className="flex items-center justify-center space-x-4 text-sm text-gray-500 mb-4">
            <div className="flex items-center">
              <MapPinIcon className="w-4 h-4 mr-1" />
              {localizacao}
            </div>
            {profileData.experiencia_anos > 0 && (
              <div className="flex items-center">
                <ClockIcon className="w-4 h-4 mr-1" />
                {profileData.experiencia_anos} anos de experiência
              </div>
            )}
            {profileData.crp && (
              <div className="flex items-center">
                <AcademicCapIcon className="w-4 h-4 mr-1" />
                {profileData.crp}
              </div>
            )}
          </div>

          {/* Avaliação mock */}
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <StarIcon key={i} className="w-5 h-5 text-yellow-400" />
              ))}
            </div>
            <span className="text-sm text-gray-600">4.9 (127 avaliações)</span>
          </div>

          {/* Preço e botão de agendamento */}
          <div className="flex items-center justify-center space-x-6 mb-6">
            {profileData.valor_sessao > 0 && (
              <div className="text-center">
                <div className="flex items-center text-2xl font-bold text-gray-900">
                  <CurrencyDollarIcon className="w-6 h-6 text-green-600 mr-1" />
                  R$ {profileData.valor_sessao.toFixed(0)}
                </div>
                <p className="text-sm text-gray-600">por sessão</p>
              </div>
            )}

            <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-full font-semibold hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg">
              <CalendarDaysIcon className="w-5 h-5 inline mr-2" />
              Agendar Consulta
            </button>
          </div>
        </div>

        {/* Abas de navegação */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex space-x-8">
            {[
              { id: "sobre", label: "Sobre" },
              { id: "formacao", label: "Formação" },
              { id: "avaliacoes", label: "Avaliações" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Conteúdo das abas */}
        <div className="min-h-[200px]">
          {activeTab === "sobre" && (
            <div className="space-y-6">
              {/* Bio profissional */}
              {profileData.bio_profissional && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Sobre mim
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    {profileData.bio_profissional}
                  </p>
                </div>
              )}

              {/* Abordagem terapêutica */}
              {profileData.abordagem_terapeutica && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Abordagem Terapêutica
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    {profileData.abordagem_terapeutica}
                  </p>
                </div>
              )}

              {/* Links sociais */}
              {socialLinks.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Redes Sociais
                  </h3>
                  <div className="flex space-x-3">
                    {socialLinks.map((link) => (
                      <a
                        key={link.name}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`p-3 rounded-full border transition-colors ${link.color}`}
                        title={link.name}
                      >
                        {link.icon}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "formacao" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Formação Acadêmica
                </h3>
                {profileData.formacao_principal ? (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-700">
                      {profileData.formacao_principal}
                    </p>
                  </div>
                ) : (
                  <p className="text-gray-500 italic">
                    Informações de formação não disponíveis
                  </p>
                )}
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Experiência Profissional
                </h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-700">
                    {profileData.experiencia_anos > 0
                      ? `${profileData.experiencia_anos} anos de experiência na área`
                      : "Experiência não informada"}
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "avaliacoes" && (
            <div className="space-y-6">
              <div className="text-center py-8">
                <StarIcon className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Avaliações em Breve
                </h3>
                <p className="text-gray-600">
                  O sistema de avaliações ainda está em desenvolvimento.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
