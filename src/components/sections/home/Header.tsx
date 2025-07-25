// src/components/Header.tsx
'use client'
import { useState } from 'react'
import Image from 'next/image'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#F9F9F6]/95 backdrop-blur-sm shadow-sm border-b border-[#A8C3A0]/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-10">
          {/* Logo - Sem fundo */}
          <div className="flex items-center">
            <Image
              src="/logo-viaa.png"
              alt="Viaa"
              width={80}
              height={50}
              className="hover:scale-105 transition-transform duration-300"
              priority
            />
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <button className="text-[#1E1E2F] hover:text-[#A8C3A0] transition-colors px-6 py-2 rounded-xl hover:bg-[#A8C3A0]/10 font-medium">
              Cadastrar
            </button>
            <button className="bg-[#FF6B6B] text-white px-8 py-0 rounded-full hover:bg-[#FF6B6B]/90 transition-all transform hover:scale-105 shadow-lg font-medium">
              Entrar
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-[#1E1E2F] hover:text-[#A8C3A0] transition-colors p-2"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-3 space-y-2 bg-[#F9F9F6]/95 backdrop-blur-sm">
            <button className="block w-full text-left text-[#1E1E2F] hover:text-[#A8C3A0] transition-colors px-4 py-2 rounded-xl hover:bg-[#A8C3A0]/10 font-medium">
              Cadastrar
            </button>
            <button className="block w-full bg-[#FF6B6B] text-white px-4 py-2 rounded-full hover:bg-[#FF6B6B]/90 transition-all font-medium">
              Entrar
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
