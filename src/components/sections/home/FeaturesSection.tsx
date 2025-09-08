// viaa\src\components\sections\home\FeaturesSection.tsx

"use client";

import { useState } from "react";

export default function Features() {
  const [activeFeature, setActiveFeature] = useState(0);

  const features = [
    {
      icon: "🎯",
      title: "Matching Inteligente",
      description:
        "Nossa IA conecta pacientes aos profissionais mais adequados baseado em perfil, localização e especialidades.",
      color: "rose",
      gradient: "from-rose-400 to-rose-600",
    },
    {
      icon: "📅",
      title: "Agendamento Simplificado",
      description:
        "Agende consultas em segundos, receba lembretes automáticos e gerencie sua agenda de forma intuitiva.",
      color: "sky",
      gradient: "from-sky-400 to-sky-600",
    },
    {
      icon: "🔒",
      title: "Segurança Total",
      description:
        "Seus dados estão protegidos com criptografia de ponta e seguimos rigorosamente a LGPD.",
      color: "emerald",
      gradient: "from-emerald-400 to-emerald-600",
    },
    {
      icon: "💬",
      title: "Chat Integrado",
      description:
        "Comunicação direta e segura entre pacientes e profissionais através de nossa plataforma.",
      color: "violet",
      gradient: "from-violet-400 to-violet-600",
    },
    {
      icon: "📊",
      title: "Dashboard Completo",
      description:
        "Acompanhe seu progresso, histórico de sessões e evolução através de relatórios detalhados.",
      color: "orange",
      gradient: "from-orange-400 to-orange-600",
    },
    {
      icon: "🌙",
      title: "Disponibilidade 24/7",
      description:
        "Acesse a plataforma quando precisar, com suporte para emergências e crises.",
      color: "indigo",
      gradient: "from-indigo-400 to-indigo-600",
    },
  ];

  return (
    <section
      className="py-24 bg-gradient-to-br from-warm-50 via-white to-slate-50 relative overflow-hidden"
      id="features"
    >
      {/* Background Elements */}
      <div className="absolute top-20 right-10 w-72 h-72 bg-gradient-to-br from-rose-100/30 to-sky-100/30 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 left-10 w-80 h-80 bg-gradient-to-tr from-emerald-100/20 to-violet-100/20 rounded-full blur-3xl"></div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center bg-gradient-to-r from-rose-100 via-sky-100 to-emerald-100 rounded-full px-6 py-3 mb-6">
            <span className="text-slate-600 font-medium">
              ✨ Recursos Incríveis
            </span>
          </div>
          <h2 className="text-4xl md:text-6xl font-bold text-slate-800 mb-6">
            Tudo que você precisa em
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-rose-500 via-sky-500 to-emerald-500">
              um só lugar
            </span>
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Desenvolvemos uma plataforma completa para conectar pessoas e
            transformar vidas através do cuidado mental.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`group relative bg-white/80 backdrop-blur-sm rounded-3xl p-8 border transition-all duration-500 cursor-pointer transform hover:-translate-y-3 ${
                activeFeature === index
                  ? `border-${feature.color}-200 shadow-2xl shadow-${feature.color}-500/20`
                  : "border-slate-200/50 hover:border-slate-300 shadow-lg hover:shadow-xl"
              }`}
              onMouseEnter={() => setActiveFeature(index)}
            >
              {/* Icon Container */}
              <div
                className={`relative w-20 h-20 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
              >
                <span className="text-3xl">{feature.icon}</span>
                <div className="absolute inset-0 bg-white/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>

              {/* Content */}
              <h3 className="text-2xl font-bold text-slate-800 mb-4 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-slate-800 group-hover:to-slate-600 transition-all duration-300">
                {feature.title}
              </h3>
              <p className="text-slate-600 leading-relaxed group-hover:text-slate-700 transition-colors duration-300">
                {feature.description}
              </p>

              {/* Hover Effect */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 rounded-3xl transition-opacity duration-300`}
              ></div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <div className="bg-gradient-to-r from-slate-50 to-white rounded-3xl p-12 border border-slate-200/50 shadow-xl">
            <h3 className="text-3xl font-bold text-slate-800 mb-4">
              Pronto para começar?
            </h3>
            <p className="text-lg text-slate-600 mb-8 max-w-2xl mx-auto">
              Junte-se a milhares de pessoas que já transformaram suas vidas com
              nossa plataforma.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-gradient-to-r from-rose-400 via-sky-400 to-emerald-400 hover:from-rose-500 hover:via-sky-500 hover:to-emerald-500 text-white px-8 py-4 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
                Começar Gratuitamente
              </button>
              <button className="border-2 border-slate-300 hover:border-rose-300 text-slate-700 hover:text-rose-600 px-8 py-4 rounded-full font-semibold transition-all duration-300 hover:bg-rose-50">
                Agendar Demo
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
