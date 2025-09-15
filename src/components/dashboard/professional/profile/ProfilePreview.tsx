// src/components/dashboard/professional/profile/ProfilePreview.tsx
// 🔧 VERSÃO CORRIGIDA - Interface compatível com PerfilProfissional

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
import { PerfilProfissional } from "@/types/database";

interface ProfilePreviewProps {
  profileData: PerfilProfissional;
}

export default function ProfilePreview({ profileData }: ProfilePreviewProps) {
  const [activeTab, setActiveTab] = useState<
    "sobre" | "formacao" | "avaliacoes"
  >("sobre");

  const nomeCompleto = `${profileData.nome} ${profileData.sobrenome}`;
  const localizacao =
    profileData.endereco_cidade && profileData.endereco_estado
      ? `${profileData.endereco_cidade}, ${profileData.endereco_estado}`
      : "Localização não informada";

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

            {/* Badge de verificado */}
            {profileData.verificado && (
              <div className="absolute bottom-0 right-0 w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center ring-4 ring-white">
                <CheckBadgeIcon className="w-6 h-6 text-white" />
              </div>
            )}
          </div>
        </div>

        {/* Nome e título */}
        <div className="text-center mb-6">
          <h1 className="title-mobile-lg text-gray-900 mb-2">{nomeCompleto}</h1>
          <p className="text-mobile-base text-gray-600 mb-2">
            {profileData.especialidades}
          </p>

          {/* CRP se for psicólogo */}
          {profileData.crp && (
            <p className="text-mobile-sm text-blue-600 font-medium mb-2">
              CRP: {profileData.crp}
            </p>
          )}

          <div className="flex items-center justify-center text-mobile-sm text-gray-500 mb-4">
            <MapPinIcon className="icon-mobile-sm mr-1" />
            {localizacao}
          </div>

          {/* Informações principais */}
          <div className="grid-mobile-safe cols-3 gap-4 max-w-md mx-auto">
            {profileData.experiencia_anos && (
              <div className="text-center">
                <div className="title-mobile-sm text-blue-600">
                  {profileData.experiencia_anos}
                </div>
                <div className="text-mobile-xs text-gray-600">
                  {profileData.experiencia_anos === 1 ? "ano" : "anos"}
                </div>
              </div>
            )}

            {profileData.valor_sessao && (
              <div className="text-center">
                <div className="title-mobile-sm text-green-600">
                  R$ {profileData.valor_sessao}
                </div>
                <div className="text-mobile-xs text-gray-600">sessão</div>
              </div>
            )}

            <div className="text-center">
              <div className="title-mobile-sm text-purple-600">4.9</div>
              <div className="text-mobile-xs text-gray-600">avaliação</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex justify-center space-x-8">
            {[
              { id: "sobre", label: "Sobre" },
              { id: "formacao", label: "Formação" },
              { id: "avaliacoes", label: "Avaliações" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`
                  py-2 px-1 border-b-2 font-medium text-mobile-sm transition-colors
                  ${
                    activeTab === tab.id
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }
                `}
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
                  <h3 className="title-mobile-sm text-gray-900 mb-3">
                    Sobre mim
                  </h3>
                  <p className="text-mobile-base text-gray-700 leading-relaxed">
                    {profileData.bio_profissional}
                  </p>
                </div>
              )}

              {/* Abordagem terapêutica */}
              {profileData.abordagem_terapeutica && (
                <div>
                  <h3 className="title-mobile-sm text-gray-900 mb-3">
                    Abordagem Terapêutica
                  </h3>
                  <p className="text-mobile-base text-gray-700 leading-relaxed">
                    {profileData.abordagem_terapeutica}
                  </p>
                </div>
              )}

              {/* Links sociais */}
              {socialLinks.length > 0 && (
                <div>
                  <h3 className="title-mobile-sm text-gray-900 mb-3">
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
                <h3 className="title-mobile-sm text-gray-900 mb-3">
                  Formação Acadêmica
                </h3>
                {profileData.formacao_principal ? (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <AcademicCapIcon className="icon-mobile-md text-blue-600 flex-shrink-0 mt-1" />
                      <div>
                        <p className="text-mobile-base font-medium text-gray-900">
                          {profileData.formacao_principal}
                        </p>
                        <p className="text-mobile-sm text-gray-600 mt-1">
                          Formação Principal
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <AcademicCapIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p className="text-mobile-sm">Formação não informada</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "avaliacoes" && (
            <div className="space-y-6">
              <div className="text-center py-8">
                <StarIcon className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
                <h3 className="title-mobile-md text-gray-900 mb-2">
                  Avaliação: 4.9/5
                </h3>
                <p className="text-mobile-sm text-gray-600 mb-4">
                  Baseado em 47 avaliações
                </p>
                <div className="space-y-3 max-w-md mx-auto">
                  {/* Exemplo de avaliação */}
                  <div className="bg-gray-50 rounded-lg p-4 text-left">
                    <div className="flex items-center mb-2">
                      <div className="flex text-yellow-400 text-sm">★★★★★</div>
                      <span className="text-mobile-xs text-gray-500 ml-2">
                        há 2 semanas
                      </span>
                    </div>
                    <p className="text-mobile-sm text-gray-700">
                      "Profissional excelente, muito atenciosa e competente.
                      Recomendo!"
                    </p>
                    <p className="text-mobile-xs text-gray-500 mt-2">
                      - M. Silva
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Botão de ação */}
        <div className="mt-8 text-center">
          <button className="button-mobile bg-blue-600 text-white hover:bg-blue-700 shadow-lg">
            <CalendarDaysIcon className="icon-mobile-sm mr-2" />
            Agendar Consulta
          </button>
        </div>
      </div>
    </div>
  );
}
