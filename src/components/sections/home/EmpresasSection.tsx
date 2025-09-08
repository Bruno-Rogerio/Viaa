// viaa\src\components\sections\home\EmpresasSection.tsx
export default function EmpresasSection() {
  return (
    <section
      id="empresas"
      className="py-16 lg:py-20 bg-gradient-to-br from-sky-50 to-blue-50"
    >
      <div className="container mx-auto">
        <div className="text-center mb-12 lg:mb-16">
          <h2 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-slate-800 mb-4 lg:mb-6">
            Para{" "}
            <span className="bg-gradient-to-r from-sky-400 to-blue-500 bg-clip-text text-transparent">
              Empresas
            </span>
          </h2>
          <p className="text-lg lg:text-xl text-slate-600 max-w-3xl mx-auto">
            Transforme o bem-estar dos seus colaboradores com nossa plataforma
            inteligente de saúde mental corporativa
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Visual */}
          <div className="relative order-2 lg:order-1">
            <div className="bg-gradient-to-br from-sky-400/20 to-blue-500/20 rounded-3xl p-8 backdrop-blur-sm border border-sky-200/30">
              <div className="text-center space-y-6">
                <div className="text-6xl mb-6">🏢💙📊</div>
                <h3 className="text-2xl font-bold text-slate-800">
                  Gestão Inteligente
                </h3>
                <p className="text-slate-600">
                  Métricas de bem-estar sem comprometer a privacidade dos
                  colaboradores
                </p>

                {/* Dashboard preview */}
                <div className="bg-white/50 rounded-2xl p-6 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 text-sm">
                      Índice de Bem-estar
                    </span>
                    <span className="text-emerald-600 font-semibold">78%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-emerald-400 to-emerald-500 h-2 rounded-full"
                      style={{ width: "78%" }}
                    ></div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-sky-600">92%</div>
                      <div className="text-xs text-slate-500">Engajamento</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-emerald-600">
                        156
                      </div>
                      <div className="text-xs text-slate-500">
                        Usuários Ativos
                      </div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-rose-600">
                        -23%
                      </div>
                      <div className="text-xs text-slate-500">Stress Geral</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Conteúdo */}
          <div className="space-y-6 order-1 lg:order-2">
            {/* Plataforma Corporativa */}
            <div className="bg-white/70 backdrop-blur-sm p-6 rounded-2xl border border-sky-200/50 hover:shadow-lg transition-all duration-300">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-sky-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">🎯</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-slate-800 mb-2">
                    Plataforma Corporativa
                  </h3>
                  <p className="text-slate-600">
                    Acesso completo à VIAA para todos os colaboradores como
                    benefício empresarial
                  </p>
                </div>
              </div>
            </div>

            {/* Dashboard Gerencial */}
            <div className="bg-white/70 backdrop-blur-sm p-6 rounded-2xl border border-sky-200/50 hover:shadow-lg transition-all duration-300">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-sky-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">📊</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-slate-800 mb-2">
                    Dashboard Inteligente
                  </h3>
                  <p className="text-slate-600">
                    Métricas gerais de bem-estar e engajamento sem comprometer a
                    privacidade individual
                  </p>
                </div>
              </div>
            </div>

            {/* IA Corporativa */}
            <div className="bg-white/70 backdrop-blur-sm p-6 rounded-2xl border border-sky-200/50 hover:shadow-lg transition-all duration-300">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-sky-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">🤖</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-slate-800 mb-2">
                    IA Corporativa
                  </h3>
                  <p className="text-slate-600">
                    Insights sobre clima organizacional e tendências de saúde
                    mental da equipe
                  </p>
                </div>
              </div>
            </div>

            {/* Relatórios */}
            <div className="bg-white/70 backdrop-blur-sm p-6 rounded-2xl border border-sky-200/50 hover:shadow-lg transition-all duration-300">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-sky-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">📈</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-slate-800 mb-2">
                    Relatórios Estratégicos
                  </h3>
                  <p className="text-slate-600">
                    Relatórios mensais com indicadores de ROI em bem-estar e
                    produtividade
                  </p>
                </div>
              </div>
            </div>

            {/* Privacidade */}
            <div className="bg-white/70 backdrop-blur-sm p-6 rounded-2xl border border-sky-200/50 hover:shadow-lg transition-all duration-300">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-sky-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">🔒</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-slate-800 mb-2">
                    Privacidade Total
                  </h3>
                  <p className="text-slate-600">
                    Dados individuais 100% protegidos. Empresa acessa apenas
                    métricas agregadas e anônimas
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-6">
              <button className="bg-gradient-to-r from-sky-500 to-blue-500 hover:from-sky-600 hover:to-blue-600 text-white px-8 py-4 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
                Solicitar Demonstração
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
