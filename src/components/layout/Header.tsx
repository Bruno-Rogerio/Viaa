//viaa\src\components\layout\Header.tsx

"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Efeito de scroll
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Fechar menu mobile ao redimensionar
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-white/95 backdrop-blur-md shadow-lg py-3"
            : "bg-white/90 backdrop-blur-sm py-4"
        }`}
      >
        <div className="container mx-auto px-4">
          <nav className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link
                href="/"
                className="text-2xl font-bold bg-gradient-to-r from-rose-500 via-sky-500 to-emerald-500 bg-clip-text text-transparent hover:scale-105 transition-transform duration-300"
              ></Link>
            </div>

            {/* Navegação principal - Desktop */}
            <div className="hidden lg:flex items-center space-x-8">
              <Link
                href="#pacientes"
                className="text-slate-700 hover:text-rose-500 font-medium transition-colors duration-300 relative group"
              >
                Para Pacientes
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-rose-500 transition-all duration-300 group-hover:w-full"></span>
              </Link>
              <Link
                href="#profissionais"
                className="text-slate-700 hover:text-emerald-500 font-medium transition-colors duration-300 relative group"
              >
                Para Profissionais
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-emerald-500 transition-all duration-300 group-hover:w-full"></span>
              </Link>
              <Link
                href="#clinicas"
                className="text-slate-700 hover:text-purple-500 font-medium transition-colors duration-300 relative group"
              >
                Para Clínicas
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-purple-500 transition-all duration-300 group-hover:w-full"></span>
              </Link>
              <Link
                href="#empresas"
                className="text-slate-700 hover:text-sky-500 font-medium transition-colors duration-300 relative group"
              >
                Para Empresas
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-sky-500 transition-all duration-300 group-hover:w-full"></span>
              </Link>
              <Link
                href="#sobre"
                className="text-slate-700 hover:text-slate-900 font-medium transition-colors duration-300"
              >
                Sobre
              </Link>
            </div>

            {/* Navegação Tablet */}
            <div className="hidden md:flex lg:hidden items-center space-x-6">
              <Link
                href="#pacientes"
                className="text-slate-700 hover:text-rose-500 font-medium text-sm transition-colors"
              >
                Pacientes
              </Link>
              <Link
                href="#profissionais"
                className="text-slate-700 hover:text-emerald-500 font-medium text-sm transition-colors"
              >
                Profissionais
              </Link>
              <Link
                href="#clinicas"
                className="text-slate-700 hover:text-purple-500 font-medium text-sm transition-colors"
              >
                Clínicas
              </Link>
              <Link
                href="#empresas"
                className="text-slate-700 hover:text-sky-500 font-medium text-sm transition-colors"
              >
                Empresas
              </Link>
            </div>

            {/* CTAs Desktop */}
            <div className="hidden md:flex items-center space-x-4">
              <Link
                href="/auth"
                className="text-slate-700 hover:text-slate-900 font-medium transition-colors duration-300"
              >
                Entrar
              </Link>

              <Link
                href="/signup"
                className="bg-gradient-to-r from-rose-500 via-sky-500 to-emerald-500 hover:from-rose-600 hover:via-sky-600 hover:to-emerald-600 text-white px-6 py-2.5 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                Cadastre-se
              </Link>
            </div>

            {/* Menu Mobile Button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-slate-700 hover:text-slate-900 transition-colors duration-300 p-2"
              >
                {isMobileMenuOpen ? (
                  <XMarkIcon className="w-6 h-6" />
                ) : (
                  <Bars3Icon className="w-6 h-6" />
                )}
              </button>
            </div>
          </nav>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          ></div>
          <div className="fixed top-0 right-0 h-full w-80 bg-white/95 backdrop-blur-md shadow-2xl transform transition-transform duration-300">
            <div className="p-6 pt-20">
              {/* Navegação Mobile */}
              <div className="space-y-4 mb-8">
                <Link
                  href="#pacientes"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block text-slate-700 hover:text-rose-500 font-medium py-2 transition-colors duration-300"
                >
                  Para Pacientes
                </Link>
                <Link
                  href="#profissionais"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block text-slate-700 hover:text-emerald-500 font-medium py-2 transition-colors duration-300"
                >
                  Para Profissionais
                </Link>
                <Link
                  href="#clinicas"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block text-slate-700 hover:text-purple-500 font-medium py-2 transition-colors duration-300"
                >
                  Para Clínicas
                </Link>
                <Link
                  href="#empresas"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block text-slate-700 hover:text-sky-500 font-medium py-2 transition-colors duration-300"
                >
                  Para Empresas
                </Link>
                <Link
                  href="#sobre"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block text-slate-700 hover:text-slate-900 font-medium py-2 transition-colors duration-300"
                >
                  Sobre
                </Link>
              </div>

              {/* Login Mobile */}
              <div className="mb-6">
                <Link
                  href="/auth"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block w-full text-center text-slate-700 hover:text-slate-900 font-medium py-3 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all duration-300"
                >
                  Entrar
                </Link>
              </div>

              {/* Cadastro Mobile */}
              <div>
                <Link
                  href="/signup"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block w-full bg-gradient-to-r from-rose-500 via-sky-500 to-emerald-500 text-white px-4 py-3 rounded-xl font-semibold text-center transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  Cadastre-se
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
