import Link from 'next/link'
import Image from 'next/image'

export default function Footer() {
  return (
    <footer className="bg-gradient-to-br from-slate-800 via-slate-700 to-slate-800 text-white">
      {/* Main Footer Content */}
      <div className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center mb-6">
              <Image 
                src="/logo-viaa.png" 
                alt="VIAA Logo" 
                width={150}
                height={300}
                style={{ height: 'auto', width: '150px' }}
                className="max-h-16 drop-shadow-sm filter brightness-0 invert"
                priority
              />
            </div>
            <p className="text-slate-300 text-lg leading-relaxed mb-6 max-w-md">
              Transformando vidas através de conexões autênticas entre pacientes e profissionais de saúde mental.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="w-12 h-12 bg-rose-500/20 hover:bg-rose-500 rounded-xl flex items-center justify-center transition-all duration-300 group">
                <span className="text-xl group-hover:scale-110 transition-transform duration-300">📘</span>
              </a>
              <a href="#" className="w-12 h-12 bg-sky-500/20 hover:bg-sky-500 rounded-xl flex items-center justify-center transition-all duration-300 group">
                <span className="text-xl group-hover:scale-110 transition-transform duration-300">🐦</span>
              </a>
              <a href="#" className="w-12 h-12 bg-emerald-500/20 hover:bg-emerald-500 rounded-xl flex items-center justify-center transition-all duration-300 group">
                <span className="text-xl group-hover:scale-110 transition-transform duration-300">📸</span>
              </a>
              <a href="#" className="w-12 h-12 bg-rose-500/20 hover:bg-rose-500 rounded-xl flex items-center justify-center transition-all duration-300 group">
                <span className="text-xl group-hover:scale-110 transition-transform duration-300">💼</span>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-semibold mb-6 text-rose-300">Navegação</h3>
            <ul className="space-y-4">
              <li><Link href="/paciente" className="text-slate-300 hover:text-rose-300 transition-colors duration-300 flex items-center group">
                <span className="mr-2 group-hover:translate-x-1 transition-transform duration-300">→</span> Para Pacientes
              </Link></li>
              <li><Link href="/profissional" className="text-slate-300 hover:text-emerald-300 transition-colors duration-300 flex items-center group">
                <span className="mr-2 group-hover:translate-x-1 transition-transform duration-300">→</span> Para Profissionais
              </Link></li>
              <li><Link href="/clinica" className="text-slate-300 hover:text-sky-300 transition-colors duration-300 flex items-center group">
                <span className="mr-2 group-hover:translate-x-1 transition-transform duration-300">→</span> Para Clínicas
              </Link></li>
              <li><Link href="/sobre" className="text-slate-300 hover:text-rose-300 transition-colors duration-300 flex items-center group">
                <span className="mr-2 group-hover:translate-x-1 transition-transform duration-300">→</span> Sobre Nós
              </Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-xl font-semibold mb-6 text-sky-300">Suporte</h3>
            <ul className="space-y-4">
              <li><Link href="/ajuda" className="text-slate-300 hover:text-sky-300 transition-colors duration-300 flex items-center group">
                <span className="mr-2 group-hover:translate-x-1 transition-transform duration-300">→</span> Central de Ajuda
              </Link></li>
              <li><Link href="/contato" className="text-slate-300 hover:text-emerald-300 transition-colors duration-300 flex items-center group">
                <span className="mr-2 group-hover:translate-x-1 transition-transform duration-300">→</span> Contato
              </Link></li>
              <li><Link href="/privacidade" className="text-slate-300 hover:text-rose-300 transition-colors duration-300 flex items-center group">
                <span className="mr-2 group-hover:translate-x-1 transition-transform duration-300">→</span> Privacidade
              </Link></li>
              <li><Link href="/termos" className="text-slate-300 hover:text-sky-300 transition-colors duration-300 flex items-center group">
                <span className="mr-2 group-hover:translate-x-1 transition-transform duration-300">→</span> Termos de Uso
              </Link></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-slate-600/50 bg-slate-900/50">
        <div className="container mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-slate-400 text-sm">
              © 2024 VIAA. Todos os direitos reservados.
            </p>
            <div className="flex items-center space-x-6 mt-4 md:mt-0">
              <span className="text-slate-400 text-sm">Feito com</span>
              <div className="flex items-center space-x-1">
                <span className="text-rose-400 animate-pulse">💖</span>
                <span className="text-slate-400 text-sm">no Brasil</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
