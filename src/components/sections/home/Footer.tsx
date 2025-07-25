export default function Footer() {
  return (
    <footer className="bg-[#1E1E2F] text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="space-y-3">
            <h3 className="text-base font-semibold text-[#FF6B6B]">Viaa</h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              Transformando vidas através da tecnologia e do cuidado humano.
            </p>
          </div>
          <div className="space-y-3">
            <h4 className="text-base font-semibold">Atendimento</h4>
            <ul className="space-y-1 text-gray-300">
              <li><a href="#" className="hover:text-[#A8C3A0] transition-colors text-sm">Central de Ajuda</a></li>
              <li><a href="#" className="hover:text-[#A8C3A0] transition-colors text-sm">Suporte Técnico</a></li>
              <li><a href="#" className="hover:text-[#A8C3A0] transition-colors text-sm">Chat Online</a></li>
              <li><a href="#" className="hover:text-[#A8C3A0] transition-colors text-sm">FAQ</a></li>
            </ul>
          </div>
          <div className="space-y-3">
            <h4 className="text-base font-semibold">Empresa</h4>
            <ul className="space-y-1 text-gray-300">
              <li><a href="#" className="hover:text-[#A8C3A0] transition-colors text-sm">Sobre Nós</a></li>
              <li><a href="#" className="hover:text-[#A8C3A0] transition-colors text-sm">Carreiras</a></li>
              <li><a href="#" className="hover:text-[#A8C3A0] transition-colors text-sm">Imprensa</a></li>
              <li><a href="#" className="hover:text-[#A8C3A0] transition-colors text-sm">Parcerias</a></li>
            </ul>
          </div>
          <div className="space-y-3">
            <h4 className="text-base font-semibold">Legal</h4>
            <ul className="space-y-1 text-gray-300">
              <li><a href="#" className="hover:text-[#A8C3A0] transition-colors text-sm">Termos de Uso</a></li>
              <li><a href="#" className="hover:text-[#A8C3A0] transition-colors text-sm">Privacidade</a></li>
              <li><a href="#" className="hover:text-[#A8C3A0] transition-colors text-sm">Cookies</a></li>
              <li><a href="#" className="hover:text-[#A8C3A0] transition-colors text-sm">LGPD</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-6 text-center text-gray-400">
          <p className="text-sm">&copy; 2024 Viaa. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  )
}
