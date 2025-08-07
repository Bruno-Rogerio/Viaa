// components/ProfissionaisSection.tsx
export default function ProfissionaisSection() {
  return (
    <section id="profissionais" className="py-16 lg:py-20 bg-gradient-to-br from-emerald-50 to-teal-50">
      <div className="container mx-auto">
        <div className="text-center mb-12 lg:mb-16">
          <h2 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-slate-800 mb-4 lg:mb-6">
            Para <span className="bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent">Profissionais</span>
          </h2>
          <p className="text-lg lg:text-xl text-slate-600 max-w-3xl mx-auto">
            Sua rede profissional com IA, criação de conteúdo e ferramentas avançadas de terapia
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="space-y-6">
            {/* IA Terapêutica */}
            <div className="bg-white/70 backdrop-blur-sm p-6 rounded-2xl border border-emerald-200/50 hover:shadow-lg transition-all duration-300">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">🧠</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-slate-800 mb-2">IA Terapêutica Avançada</h3>
                  <p className="text-slate-600">Análise de humor em tempo real e transcrição automática com insights das consultas</p>
                </div>
              </div>
            </div>

            {/* Rede Profissional */}
            <div className="bg-white/70 backdrop-blur-sm p-6 rounded-2xl border border-emerald-200/50 hover:shadow-lg transition-all duration-300">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">🤝</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-slate-800 mb-2">Rede Profissional Ativa</h3>
                  <p className="text-slate-600">Conecte-se, colabore e aprenda com outros profissionais da saúde mental</p>
                </div>
              </div>
            </div>

            {/* Criação de Conteúdo */}
            <div className="bg-white/70 backdrop-blur-sm p-6 rounded-2xl border border-emerald-200/50 hover:shadow-lg transition-all duration-300">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">📱</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-slate-800 mb-2">Criação de Conteúdo</h3>
                  <p className="text-slate-600">Publique vídeos, artigos e posts para educar pacientes e colegas</p>
                </div>
              </div>
            </div>

            {/* Landing Page */}
            <div className="bg-white/70 backdrop-blur-sm p-6 rounded-2xl border border-emerald-200/50 hover:shadow-lg transition-all duration-300">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">🌐</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-slate-800 mb-2">Landing Page Exclusiva</h3>
                  <p className="text-slate-600">Seu perfil profissional personalizado como vitrine do seu trabalho</p>
                </div>
              </div>
            </div>

            <div className="pt-6">
              <button className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-8 py-4 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
                Cadastrar como Profissional
              </button>
            </div>
          </div>

          {/* Visual */}
          <div className="relative">
            <div className="bg-gradient-to-br from-emerald-400/20 to-teal-500/20 rounded-3xl p-8 backdrop-blur-sm border border-emerald-200/30">
              <div className="text-center space-y-6">
                <div className="text-6xl mb-6">👩‍⚕️🤝🧠</div>
                <h3 className="text-2xl font-bold text-slate-800">Rede Inteligente</h3>
                <p className="text-slate-600">Conecte-se, crie conteúdo e use IA para potencializar sua prática terapêutica</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
