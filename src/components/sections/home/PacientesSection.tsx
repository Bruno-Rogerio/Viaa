// viaa\src\components\sections\home\PacientesSection.tsx

export default function PacientesSection() {
  return (
    <section
      id="pacientes"
      className="py-16 lg:py-20 bg-gradient-to-br from-rose-50 to-pink-50"
    >
      <div className="container mx-auto">
        <div className="text-center mb-12 lg:mb-16">
          <h2 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-slate-800 mb-4 lg:mb-6">
            Para{" "}
            <span className="bg-gradient-to-r from-rose-400 to-pink-500 bg-clip-text text-transparent">
              Pacientes
            </span>
          </h2>
          <p className="text-lg lg:text-xl text-slate-600 max-w-3xl mx-auto">
            Conteúdo terapêutico personalizado, acompanhamento com IA e evolução
            inteligente
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Conteúdo */}
          <div className="space-y-6">
            {/* Feed Terapêutico */}
            <div className="bg-white/70 backdrop-blur-sm p-6 rounded-2xl border border-rose-200/50 hover:shadow-lg transition-all duration-300">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-rose-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">📱</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-slate-800 mb-2">
                    Feed Terapêutico
                  </h3>
                  <p className="text-slate-600">
                    Conteúdos de profissionais que você segue: vídeos, artigos e
                    dicas
                  </p>
                </div>
              </div>
            </div>

            {/* Sugestões IA */}
            <div className="bg-white/70 backdrop-blur-sm p-6 rounded-2xl border border-rose-200/50 hover:shadow-lg transition-all duration-300">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-rose-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">🎯</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-slate-800 mb-2">
                    Sugestões Inteligentes
                  </h3>
                  <p className="text-slate-600">
                    IA sugere conteúdos terapêuticos personalizados para seu
                    momento
                  </p>
                </div>
              </div>
            </div>

            {/* Acompanhamento */}
            <div className="bg-white/70 backdrop-blur-sm p-6 rounded-2xl border border-rose-200/50 hover:shadow-lg transition-all duration-300">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-rose-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">📈</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-slate-800 mb-2">
                    Evolução Terapêutica
                  </h3>
                  <p className="text-slate-600">
                    Acompanhe seu progresso com insights de IA sobre seu
                    bem-estar
                  </p>
                </div>
              </div>
            </div>

            {/* Privacidade */}
            <div className="bg-white/70 backdrop-blur-sm p-6 rounded-2xl border border-rose-200/50 hover:shadow-lg transition-all duration-300">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-rose-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">🔒</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-slate-800 mb-2">
                    Ambiente Seguro
                  </h3>
                  <p className="text-slate-600">
                    Apenas conteúdo profissional, sem contato direto entre
                    usuários
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-6">
              <button className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white px-8 py-4 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
                Começar Jornada
              </button>
            </div>
          </div>

          {/* Visual */}
          <div className="relative">
            <div className="bg-gradient-to-br from-rose-400/20 to-pink-500/20 rounded-3xl p-8 backdrop-blur-sm border border-rose-200/30">
              <div className="text-center space-y-6">
                <div className="text-6xl mb-6">🧠💚📱</div>
                <h3 className="text-2xl font-bold text-slate-800">
                  Evolução Inteligente
                </h3>
                <p className="text-slate-600">
                  Sua jornada de bem-estar guiada por IA e conteúdo profissional
                  de qualidade
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
