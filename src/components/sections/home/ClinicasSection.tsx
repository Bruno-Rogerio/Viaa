// components/ClinicasSection.tsx
export default function ClinicasSection() {
  return (
    <section id="clinicas" className="py-16 lg:py-20 bg-gradient-to-br from-sky-50 to-blue-50">
      <div className="container mx-auto">
        <div className="text-center mb-12 lg:mb-16">
          <h2 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-slate-800 mb-4 lg:mb-6">
            Para <span className="bg-gradient-to-r from-sky-400 to-blue-500 bg-clip-text text-transparent">Clínicas</span>
          </h2>
          <p className="text-lg lg:text-xl text-slate-600 max-w-3xl mx-auto">
            Gestão inteligente, dashboard de produtividade e criação de conteúdo para sua clínica
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Visual */}
          <div className="relative order-2 lg:order-1">
            <div className="bg-gradient-to-br from-sky-400/20 to-blue-500/20 rounded-3xl p-8 backdrop-blur-sm border border-sky-200/30">
              <div className="text-center space-y-6">
                <div className="text-6xl mb-6">🏥📊</div>
                <h3 className="text-2xl font-bold text-slate-800">Gestão Inteligente</h3>
                <p className="text-slate-600">Dashboard completo com IA e ferramentas de produtividade para sua equipe</p>
              </div>
            </div>
          </div>

          {/* Conteúdo */}
          <div className="space-y-6 order-1 lg:order-2">
            {/* Gestão de Profissionais */}
            <div className="bg-white/70 backdrop-blur-sm p-6 rounded-2xl border border-sky-200/50 hover:shadow-lg transition-all duration-300">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-sky-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">👥</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-slate-800 mb-2">Gestão Personalizada</h3>
                  <p className="text-slate-600">Gerencie toda sua equipe de profissionais com ferramentas dedicadas</p>
                </div>
              </div>
            </div>

            {/* Dashboard */}
            <div className="bg-white/70 backdrop-blur-sm p-6 rounded-2xl border border-sky-200/50 hover:shadow-lg transition-all duration-300">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-sky-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">📊</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-slate-800 mb-2">Dashboard de Produtividade</h3>
                  <p className="text-slate-600">Analytics avançados e métricas de performance da clínica</p>
                </div>
              </div>
            </div>

            {/* Criação de Conteúdo */}
            <div className="bg-white/70 backdrop-blur-sm p-6 rounded-2xl border border-sky-200/50 hover:shadow-lg transition-all duration-300">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-sky-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">🎯</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-slate-800 mb-2">Marketing Terapêutico</h3>
                  <p className="text-slate-600">Crie conteúdos publicitários e terapêuticos para sua clínica</p>
                </div>
              </div>
            </div>

            {/* Acesso de Rede */}
            <div className="bg-white/70 backdrop-blur-sm p-6 rounded-2xl border border-sky-200/50 hover:shadow-lg transition-all duration-300">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-sky-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">🌐</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-slate-800 mb-2">Rede Profissional</h3>
                  <p className="text-slate-600">Todos os recursos de rede social para conectar com outros profissionais</p>
                </div>
              </div>
            </div>

            <div className="pt-6">
              <button className="bg-gradient-to-r from-sky-500 to-blue-500 hover:from-sky-600 hover:to-blue-600 text-white px-8 py-4 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
                Cadastrar Clínica
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
