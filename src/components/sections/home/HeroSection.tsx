// src/components/HeroSection.tsx
'use client'
import Image from 'next/image'

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F9F9F6] via-[#A8C3A0]/10 to-[#FF6B6B]/10 pt-16">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-[#A8C3A0]/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#FF6B6B]/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-3/4 left-1/3 w-48 h-48 bg-[#A8C3A0]/15 rounded-full blur-2xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="flex justify-center -mt-8">
              <Image
                src="/logo-viaa.png"
                alt="Viaa"
                width={200}
                height={0}
                className="hover:scale-105 transition-transform duration-500"
                priority
              />
            </div>
            <div className="w-32 h-1 bg-gradient-to-r from-[#FF6B6B] to-[#A8C3A0] mx-auto rounded-full"></div>
            
            <div className="relative">
              <h1 className="text-lg md:text-xl lg:text-2xl text-[#A8C3A0] font-medium uppercase tracking-wider relative">
                <span className="relative inline-block">
                  <span className="absolute inset-0 bg-gradient-to-r from-[#A8C3A0] to-[#FF6B6B] bg-clip-text text-transparent animate-pulse">
                    Sua jornada de autoconhecimento
                  </span>
                  <span className="relative bg-gradient-to-r from-[#A8C3A0] via-[#FF6B6B] to-[#A8C3A0] bg-clip-text text-transparent animate-shimmer bg-[length:200%_100%]">
                    Sua jornada de autoconhecimento
                  </span>
                </span>
              </h1>
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-[#A8C3A0] to-[#FF6B6B] animate-expand-line"></div>
            </div>
          </div>
          
          <p className="text-base md:text-lg lg:text-xl text-[#1E1E2F]/80 max-w-4xl mx-auto leading-relaxed font-light">
            Este é um espaço para quem deseja se escutar de verdade. Um lugar onde suas palavras,
            seus silêncios e aquilo que você ainda não sabe dizer têm espaço para existir.
            <span className="block mt-3 text-[#FF6B6B] font-medium text-base md:text-lg">
              Seja bem-vindo. Vamos juntos nessa jornada?
            </span>
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center pt-4">
            <button className="group bg-[#FF6B6B] text-white px-6 py-2.5 rounded-full hover:bg-[#FF6B6B]/90 transition-all transform hover:scale-105 shadow-md text-sm font-medium">
              <span className="flex items-center gap-2">
                Começar Agora
                <svg className="w-3 h-3 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </span>
            </button>
            <button className="group border-2 border-[#A8C3A0] text-[#A8C3A0] px-6 py-2.5 rounded-full hover:bg-[#A8C3A0] hover:text-white transition-all transform hover:scale-105 text-sm font-medium">
              <span className="flex items-center gap-2">
                Saiba Mais
                <svg className="w-3 h-3 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </span>
            </button>
          </div>

          {/* Scroll indicator - movido para baixo dos botões */}
          <div className="flex justify-center pt-8">
            <div className="w-6 h-10 border-2 border-[#A8C3A0] rounded-full flex justify-center animate-bounce">
              <div className="w-1 h-3 bg-[#A8C3A0] rounded-full mt-2 animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
