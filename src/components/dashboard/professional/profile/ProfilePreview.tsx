// src/components/dashboard/professional/profile/ProfilePreview.tsx
// 🔧 VERSÃO CORRIGIDA - Interface compatível com PerfilProfissional

// Relative imports
import React, { useState } from "react";
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
} from "@heroicons/react/24/solid";

// Tipos baseados no schema real do Supabase
interface PerfilProfissionalDisplay {
  nome: string;
  sobrenome: string;
  tipo: "psicologo" | "psicanalista" | "heike" | "holistico" | "coach_mentor";
  especialidades: string;
  bio_profissional?: string;
  formacao_principal?: string;
  experiencia_anos?: number;
  valor_sessao?: number;
  abordagem_terapeutica?: string;
  endereco_cidade?: string;
  endereco_estado?: string;
  foto_perfil_url?: string;
  link_linkedin?: string;
  link_instagram?: string;
  link_youtube?: string;
  site_pessoal?: string;
  crp?: string;
  conselho_tipo?: string;
  conselho_numero?: string;
  verificado?: boolean;
  status_verificacao?: "pendente" | "aprovado" | "rejeitado";
}

interface ProfilePreviewProps {
  profileData: PerfilProfissionalDisplay;
}

// Componente Avatar com tipagem correta
interface AvatarProps {
  src?: string;
  alt: string;
  size?: "lg" | "xl" | "2xl";
  className?: string;
}

const Avatar: React.FC<AvatarProps> = ({
  src,
  alt,
  size = "xl",
  className = "",
}) => {
  const [imageError, setImageError] = useState(false);

  const sizeClasses: Record<string, string> = {
    lg: "w-20 h-20",
    xl: "w-28 h-28",
    "2xl": "w-32 h-32",
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
    text-2xl
    bg-gradient-to-br 
    from-indigo-500 
    via-purple-500
    to-pink-500 
    text-white
    ring-4
    ring-white
    shadow-2xl
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

// Dados de exemplo para demonstração
const exampleProfile: PerfilProfissionalDisplay = {
  nome: "Dra. Marina",
  sobrenome: "Silva Santos",
  tipo: "psicologo",
  especialidades:
    "Terapia Cognitivo-Comportamental, Ansiedade, Depressão, Relacionamentos",
  bio_profissional:
    "Psicóloga clínica com mais de 8 anos de experiência em atendimento individual e em grupo. Especialista em TCC e técnicas de mindfulness. Acredito que cada pessoa tem seu próprio tempo e processo de cura.",
  formacao_principal: "Psicologia - Universidade de São Paulo (USP)",
  experiencia_anos: 8,
  valor_sessao: 150,
  abordagem_terapeutica:
    "Terapia Cognitivo-Comportamental integrada com técnicas de Mindfulness e Aceitação e Compromisso (ACT)",
  endereco_cidade: "São Paulo",
  endereco_estado: "SP",
  foto_perfil_url: "",
  link_linkedin: "https://linkedin.com/in/marina-silva",
  link_instagram: "https://instagram.com/dra.marinasilva",
  link_youtube: "",
  site_pessoal: "https://dramarinasilva.com.br",
  crp: "06/123456",
  conselho_tipo: "CRP",
  conselho_numero: "06/123456",
  verificado: true,
  status_verificacao: "aprovado",
};

export default function ProfilePreview({
  profileData = exampleProfile,
}: ProfilePreviewProps) {
  const [activeTab, setActiveTab] = useState<"sobre" | "formacao" | "contato">(
    "sobre"
  );

  const nomeCompleto = `${profileData.nome} ${profileData.sobrenome}`;
  const localizacao =
    profileData.endereco_cidade && profileData.endereco_estado
      ? `${profileData.endereco_cidade}, ${profileData.endereco_estado}`
      : "";

  // Mapear tipos de profissional com tipagem correta
  const tiposProfissional: Record<
    "psicologo" | "psicanalista" | "heike" | "holistico" | "coach_mentor",
    { nome: string; icon: string; cor: string }
  > = {
    psicologo: {
      nome: "Psicólogo(a)",
      icon: "🧠",
      cor: "from-blue-500 to-cyan-500",
    },
    psicanalista: {
      nome: "Psicanalista",
      icon: "🔍",
      cor: "from-purple-500 to-indigo-500",
    },
    heike: {
      nome: "Terapeuta Reiki",
      icon: "✨",
      cor: "from-emerald-500 to-teal-500",
    },
    holistico: {
      nome: "Terapeuta Holístico",
      icon: "🌿",
      cor: "from-green-500 to-emerald-500",
    },
    coach_mentor: {
      nome: "Coach/Mentor",
      icon: "🎯",
      cor: "from-orange-500 to-red-500",
    },
  };

  const tipoProfissional =
    tiposProfissional[profileData.tipo as keyof typeof tiposProfissional] ||
    tiposProfissional.psicologo;

  // Links sociais organizados
  const socialLinks = [
    {
      name: "LinkedIn",
      url: profileData.link_linkedin,
      icon: <LinkIcon className="w-5 h-5" />,
      color: "bg-blue-600 hover:bg-blue-700",
    },
    {
      name: "Instagram",
      url: profileData.link_instagram,
      icon: <LinkIcon className="w-5 h-5" />,
      color:
        "bg-gradient-to-br from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700",
    },
    {
      name: "YouTube",
      url: profileData.link_youtube,
      icon: <LinkIcon className="w-5 h-5" />,
      color: "bg-red-600 hover:bg-red-700",
    },
    {
      name: "Site Pessoal",
      url: profileData.site_pessoal,
      icon: <GlobeAmericasIcon className="w-5 h-5" />,
      color: "bg-slate-600 hover:bg-slate-700",
    },
  ].filter((link) => link.url && link.url.trim() !== "");

  return (
    <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
      {/* Header com gradiente dinâmico baseado no tipo profissional */}
      <div
        className={`bg-gradient-to-br ${tipoProfissional.cor} h-40 relative`}
      >
        {/* Padrão decorativo */}
        <div className="absolute inset-0 bg-white/10">
          <div className="absolute top-4 right-4 text-4xl opacity-30">
            {tipoProfissional.icon}
          </div>
          <div className="absolute bottom-4 left-4 text-6xl opacity-20">
            {tipoProfissional.icon}
          </div>
        </div>
      </div>

      <div className="relative px-8 pb-8">
        {/* Foto de perfil flutuante */}
        <div className="flex justify-center -mt-16 mb-6">
          <Avatar
            src={profileData.foto_perfil_url}
            alt={nomeCompleto}
            size="2xl"
          />
        </div>

        {/* Nome e informações principais */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-gray-900">{nomeCompleto}</h1>
            {profileData.verificado && (
              <CheckBadgeIcon className="w-8 h-8 text-blue-500" />
            )}
          </div>

          {/* Badge do tipo profissional */}
          <div
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r ${tipoProfissional.cor} text-white font-semibold text-sm mb-4`}
          >
            <span className="text-lg">{tipoProfissional.icon}</span>
            {tipoProfissional.nome}
          </div>

          {/* Localização */}
          {localizacao && (
            <div className="flex items-center justify-center gap-2 text-gray-600 mb-4">
              <MapPinIcon className="w-5 h-5" />
              <span className="font-medium">{localizacao}</span>
            </div>
          )}

          {/* CRP/Conselho se existir */}
          {(profileData.crp || profileData.conselho_numero) && (
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-sm font-semibold border border-emerald-200">
                <ShieldCheckIcon className="w-4 h-4 inline mr-1" />
                {profileData.conselho_tipo && profileData.conselho_numero
                  ? `${profileData.conselho_tipo} ${profileData.conselho_numero}`
                  : profileData.crp
                  ? `CRP ${profileData.crp}`
                  : "Profissional Registrado"}
              </div>
            </div>
          )}
        </div>

        {/* Tabs de navegação */}
        <div className="flex justify-center mb-8 bg-gray-50 rounded-2xl p-1">
          {[
            { id: "sobre" as const, label: "Sobre", icon: UserGroupIcon },
            {
              id: "formacao" as const,
              label: "Formação",
              icon: AcademicCapIcon,
            },
            {
              id: "contato" as const,
              label: "Contato",
              icon: GlobeAmericasIcon,
            },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-300 ${
                activeTab === tab.id
                  ? "bg-white text-blue-600 shadow-md"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Conteúdo das tabs */}
        <div className="space-y-6">
          {activeTab === "sobre" && (
            <div className="space-y-6">
              {/* Especialidades */}
              {profileData.especialidades && (
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <SparklesIcon className="w-5 h-5 text-purple-500" />
                    Especialidades
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {profileData.especialidades
                      .split(",")
                      .map((especialidade, index) => (
                        <span
                          key={index}
                          className="bg-purple-100 text-purple-800 px-3 py-2 rounded-xl text-sm font-medium border border-purple-200"
                        >
                          {especialidade.trim()}
                        </span>
                      ))}
                  </div>
                </div>
              )}

              {/* Bio profissional */}
              {profileData.bio_profissional && (
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3">
                    Sobre mim
                  </h3>
                  <p className="text-gray-700 leading-relaxed text-lg">
                    {profileData.bio_profissional}
                  </p>
                </div>
              )}

              {/* Cards de informações */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Experiência */}
                {profileData.experiencia_anos !== undefined && (
                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-6 rounded-2xl border border-blue-100">
                    <div className="flex items-center gap-3 mb-2">
                      <ClockIcon className="w-6 h-6 text-blue-600" />
                      <span className="font-semibold text-blue-900">
                        Experiência
                      </span>
                    </div>
                    <p className="text-2xl font-bold text-blue-700">
                      {profileData.experiencia_anos}{" "}
                      {profileData.experiencia_anos === 1 ? "ano" : "anos"}
                    </p>
                  </div>
                )}

                {/* Valor da sessão */}
                {profileData.valor_sessao && (
                  <div className="bg-gradient-to-br from-emerald-50 to-green-50 p-6 rounded-2xl border border-emerald-100">
                    <div className="flex items-center gap-3 mb-2">
                      <CurrencyDollarIcon className="w-6 h-6 text-emerald-600" />
                      <span className="font-semibold text-emerald-900">
                        Sessão
                      </span>
                    </div>
                    <p className="text-2xl font-bold text-emerald-700">
                      R$ {profileData.valor_sessao}
                    </p>
                  </div>
                )}

                {/* Rating placeholder */}
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-6 rounded-2xl border border-amber-100">
                  <div className="flex items-center gap-3 mb-2">
                    <StarIcon className="w-6 h-6 text-amber-600" />
                    <span className="font-semibold text-amber-900">
                      Avaliação
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <StarIcon key={star} className="w-5 h-5 text-amber-400" />
                    ))}
                    <span className="text-sm text-amber-600 ml-1">(4.9)</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "formacao" && (
            <div className="space-y-6">
              {/* Formação principal */}
              {profileData.formacao_principal && (
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-2xl border border-indigo-100">
                  <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <AcademicCapIcon className="w-5 h-5 text-indigo-600" />
                    Formação Principal
                  </h3>
                  <p className="text-indigo-700 font-medium text-lg">
                    {profileData.formacao_principal}
                  </p>
                </div>
              )}

              {/* Abordagem terapêutica */}
              {profileData.abordagem_terapeutica && (
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3">
                    Abordagem Terapêutica
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    {profileData.abordagem_terapeutica}
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === "contato" && (
            <div className="space-y-6">
              {/* Links sociais */}
              {socialLinks.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <LinkIcon className="w-5 h-5 text-gray-600" />
                    Redes Sociais
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    {socialLinks.map((link, index) => (
                      <a
                        key={index}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`${link.color} text-white p-4 rounded-2xl flex items-center gap-3 font-semibold transition-all duration-300 hover:scale-105 shadow-md hover:shadow-lg`}
                      >
                        {link.icon}
                        {link.name}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Botão de agendamento */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 rounded-2xl text-center text-white">
                <h3 className="text-xl font-bold mb-2">Agendar Consulta</h3>
                <p className="mb-4 opacity-90">
                  Comece sua jornada de autoconhecimento
                </p>
                <button className="bg-white text-blue-600 px-8 py-3 rounded-xl font-bold hover:bg-gray-50 transition-colors duration-300 shadow-lg">
                  Agendar Agora
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
