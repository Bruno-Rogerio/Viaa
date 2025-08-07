// components/Hero.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

export default function Hero() {
  const [currentText, setCurrentText] = useState(0);

  const heroTexts = [
    "A rede social da saúde mental",
    "Conecte-se, aprenda e cresça",
    "Conteúdo terapêutico inteligente",
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentText((prev) => (prev + 1) % heroTexts.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-warm-50 via-rose-50/30 to-sky-50/30 pt-20 relative overflow-hidden">
      {/* Elementos decorativos de fundo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-rose-200/20 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute bottom-20 right-10 w-40 h-40 bg-sky-200/20 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
        <div
          className="absolute top-1/2 left-1/4 w-24 h-24 bg-emerald-200/20 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "4s" }}
        ></div>
      </div>

      <div className="container mx-auto relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Logo + frase especial + texto animado */}
            <div className="text-center lg:text-left space-y-8">
              {/* Logo ajustado */}
              <div className="transform hover:scale-105 transition-transform duration-700 ease-out">
                <Image
                  src="/logo-viaa.png"
                  alt="VIAA Logo"
                  width={200}
                  height={120}
                  style={{ height: "auto", width: "100%", maxWidth: "200px" }}
                  className="drop-shadow-2xl mx-auto lg:mx-0"
                  priority
                />
              </div>

              {/* Frase especial embaixo do logo */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-rose-200/30 via-sky-200/30 to-emerald-200/30 rounded-2xl blur-lg transform rotate-1"></div>
                <div className="relative bg-white/70 backdrop-blur-sm border border-warm-200/40 rounded-2xl p-6 lg:p-8 shadow-lg">
                  <div className="flex items-center justify-center lg:justify-start mb-3">
                    <div className="w-1.5 h-1.5 bg-rose-400 rounded-full mr-2 animate-pulse"></div>
                    <div
                      className="w-1 h-1 bg-sky-400 rounded-full mr-2 animate-pulse"
                      style={{ animationDelay: "1s" }}
                    ></div>
                    <div
                      className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"
                      style={{ animationDelay: "2s" }}
                    ></div>
                  </div>
                  <p className="text-base lg:text-lg text-slate-700 leading-relaxed font-medium italic">
                    "Este é um espaço para quem deseja se escutar de verdade. Um
                    lugar onde suas palavras, seus silêncios e aquilo que você
                    ainda não sabe dizer têm espaço para existir.
                    <br className="hidden sm:block" />
                    <span className="bg-gradient-to-r from-rose-500 via-sky-500 to-emerald-500 bg-clip-text text-transparent font-semibold">
                      Seja bem-vindo. Vamos juntos nessa jornada?
                    </span>
                    "
                  </p>
                  <div className="flex items-center justify-center lg:justify-start mt-3">
                    <div
                      className="w-1.5 h-1.5 bg-emerald-400 rounded-full mr-2 animate-pulse"
                      style={{ animationDelay: "3s" }}
                    ></div>
                    <div
                      className="w-1 h-1 bg-sky-400 rounded-full mr-2 animate-pulse"
                      style={{ animationDelay: "4s" }}
                    ></div>
                    <div
                      className="w-1.5 h-1.5 bg-rose-400 rounded-full animate-pulse"
                      style={{ animationDelay: "5s" }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Texto principal animado */}
              <div className="h-12 flex items-center justify-center lg:justify-start">
                <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-slate-800 transition-all duration-700 ease-in-out">
                  <span className="bg-gradient-to-r from-rose-500 via-sky-500 to-emerald-500 bg-clip-text text-transparent">
                    {heroTexts[currentText]}
                  </span>
                </h1>
              </div>

              <p className="text-lg md:text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                A primeira plataforma que conecta profissionais de saúde mental
                através de conteúdo inteligente, IA avançada e ferramentas
                colaborativas.
              </p>
            </div>

            {/* Balão com CTAs */}
            <div className="relative">
              <div className="relative">
                {/* Balão de fala */}
                <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 lg:p-10 shadow-2xl border border-warm-200/50 relative">
                  {/* Cauda do balão */}
                  <div className="absolute -left-4 top-1/2 transform -translate-y-1/2">
                    <div className="w-0 h-0 border-t-[20px] border-t-transparent border-b-[20px] border-b-transparent border-r-[20px] border-r-white/90"></div>
                  </div>
                  <h3 className="text-2xl lg:text-3xl font-bold text-slate-800 mb-6 text-center">
                    Como você quer começar?
                  </h3>

                  <div className="space-y-4">
                    <Link
                      href="/cadastro-profissional"
                      className="group w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-6 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center"
                    >
                      <span className="text-2xl mr-3 group-hover:animate-bounce">
                        🩺
                      </span>
                      Sou Profissional
                    </Link>
                    <Link
                      href="/cadastro-paciente"
                      className="group w-full bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white px-6 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center"
                    >
                      <span className="text-2xl mr-3 group-hover:animate-bounce">
                        💚
                      </span>
                      Sou Paciente
                    </Link>
                    <Link
                      href="/cadastro-clinica"
                      className="group w-full bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white px-6 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center"
                    >
                      <span className="text-2xl mr-3 group-hover:animate-bounce">
                        🏥
                      </span>
                      Sou Clínica
                    </Link>
                    <Link
                      href="/cadastro-empresa"
                      className="group w-full bg-gradient-to-r from-sky-500 to-blue-500 hover:from-sky-600 hover:to-blue-600 text-white px-6 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center"
                    >
                      <span className="text-2xl mr-3 group-hover:animate-bounce">
                        🏢
                      </span>
                      Sou Empresa
                    </Link>
                  </div>

                  {/* Indicador visual animado */}
                  <div className="flex justify-center mt-6">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-rose-400 rounded-full animate-bounce"></div>
                      <div
                        className="w-2 h-2 bg-sky-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Preview cards na parte inferior */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mt-16 lg:mt-20">
            <div className="group bg-white/60 backdrop-blur-sm p-6 rounded-2xl border border-warm-200/50 hover:shadow-lg transition-all duration-500 hover:-translate-y-2">
              <div className="text-4xl mb-4 group-hover:animate-pulse">🧠</div>
              <h3 className="font-semibold text-slate-800 mb-2">
                IA Terapêutica
              </h3>
              <p className="text-slate-600 text-sm">
                Análise de humor e insights automáticos
              </p>
            </div>
            <div
              className="group bg-white/60 backdrop-blur-sm p-6 rounded-2xl border border-warm-200/50 hover:shadow-lg transition-all duration-500 hover:-translate-y-2"
              style={{ transitionDelay: "0.1s" }}
            >
              <div className="text-4xl mb-4 group-hover:animate-pulse">🤝</div>
              <h3 className="font-semibold text-slate-800 mb-2">
                Rede Profissional
              </h3>
              <p className="text-slate-600 text-sm">
                Conecte-se com outros profissionais
              </p>
            </div>
            <div
              className="group bg-white/60 backdrop-blur-sm p-6 rounded-2xl border border-warm-200/50 hover:shadow-lg transition-all duration-500 hover:-translate-y-2"
              style={{ transitionDelay: "0.2s" }}
            >
              <div className="text-4xl mb-4 group-hover:animate-pulse">📈</div>
              <h3 className="font-semibold text-slate-800 mb-2">
                Evolução Inteligente
              </h3>
              <p className="text-slate-600 text-sm">
                Acompanhamento personalizado com IA
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
