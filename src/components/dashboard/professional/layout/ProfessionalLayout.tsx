// src/components/dashboard/professional/layout/ProfessionalLayout.tsx
// 📱 VERSÃO COMPLETAMENTE RESPONSIVA

"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import ProfessionalHeader from "./ProfessionalHeader";
import ProfessionalSidebar from "./ProfessionalSidebar";
import ProfessionalWidget from "./ProfessionalWidget";
import { LoadingSpinner } from "../../common";

interface ProfessionalLayoutProps {
  children: React.ReactNode;
}

export function ProfessionalLayout({ children }: ProfessionalLayoutProps) {
  const { user, profile, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // 📱 DETECTAR TAMANHO DA TELA
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 1024); // lg breakpoint
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  // 📱 FECHAR SIDEBAR AO REDIMENSIONAR PARA DESKTOP
  useEffect(() => {
    if (!isMobile) {
      setSidebarOpen(false);
    }
  }, [isMobile]);

  // 📱 PREVENIR SCROLL DO BODY QUANDO SIDEBAR ESTÁ ABERTA
  useEffect(() => {
    if (sidebarOpen && isMobile) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    // Cleanup
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [sidebarOpen, isMobile]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md w-full">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Acesso Restrito
          </h2>
          <p className="text-gray-600 mb-4">
            Você precisa estar logado para acessar o dashboard.
          </p>
          <a
            href="/auth"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Fazer Login
          </a>
        </div>
      </div>
    );
  }

  if (profile?.tipo !== "profissional") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md w-full">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Dashboard de Profissionais
          </h2>
          <p className="text-gray-600 mb-4">
            Este dashboard é exclusivo para profissionais aprovados.
          </p>
          <a
            href="/onboarding"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Completar Cadastro
          </a>
        </div>
      </div>
    );
  }

  const dados = profile.dados as any;
  if (dados?.status_verificacao === "pendente") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md w-full">
          <h2 className="text-xl font-semibold text-amber-600 mb-2">
            Aprovação Pendente
          </h2>
          <p className="text-gray-600 mb-4">
            Seu cadastro está sendo analisado pela nossa equipe.
          </p>
          <a
            href="/onboarding"
            className="inline-block bg-amber-600 text-white px-6 py-3 rounded-lg hover:bg-amber-700 transition-colors"
          >
            Ver Status
          </a>
        </div>
      </div>
    );
  }

  if (dados?.status_verificacao === "rejeitado") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md w-full">
          <h2 className="text-xl font-semibold text-red-600 mb-2">
            Cadastro Rejeitado
          </h2>
          <p className="text-gray-600 mb-4">
            Entre em contato com o suporte para mais informações.
          </p>
          <a
            href="/onboarding"
            className="inline-block bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors"
          >
            Refazer Cadastro
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 📱 HEADER FIXO */}
      <ProfessionalHeader
        onMenuClick={() => setSidebarOpen(true)}
        user={user}
        profile={profile}
      />

      {/* 📱 LAYOUT PRINCIPAL RESPONSIVO */}
      <div className="flex min-h-screen">
        {/* 📱 SIDEBAR RESPONSIVA */}
        <ProfessionalSidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          profile={profile}
        />

        {/* 📱 CONTEÚDO PRINCIPAL ADAPTATIVO */}
        <main
          className={`
          flex-1 transition-all duration-300 ease-in-out
          ${isMobile ? "pt-16" : "lg:ml-80 pt-16"}
          ${sidebarOpen && isMobile ? "overflow-hidden" : ""}
        `}
        >
          <div className="w-full max-w-7xl mx-auto">
            {/* 📱 GRID RESPONSIVO INTELIGENTE */}
            <div
              className={`
              grid gap-4 p-4
              sm:gap-6 sm:p-6
              ${isMobile ? "grid-cols-1" : "lg:grid-cols-1 xl:grid-cols-4"}
            `}
            >
              {/* 📱 ÁREA PRINCIPAL DO CONTEÚDO */}
              <div
                className={`
                w-full
                ${isMobile ? "col-span-1" : "xl:col-span-3"}
              `}
              >
                {children}
              </div>

              {/* 📱 WIDGET LATERAL - APENAS DESKTOP */}
              {!isMobile && (
                <div className="xl:col-span-1 hidden xl:block">
                  <div className="sticky top-20">
                    <ProfessionalWidget />
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* 📱 OVERLAY DE BACKDROP PARA MOBILE */}
      {sidebarOpen && isMobile && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* 📱 DEBUG INFO - REMOVER EM PRODUÇÃO */}
      {process.env.NODE_ENV === "development" && (
        <div className="fixed bottom-4 left-4 z-50 bg-black/80 text-white text-xs p-2 rounded">
          <div>Mobile: {isMobile ? "Sim" : "Não"}</div>
          <div>Sidebar: {sidebarOpen ? "Aberta" : "Fechada"}</div>
          <div>
            Largura: {typeof window !== "undefined" ? window.innerWidth : "N/A"}
            px
          </div>
        </div>
      )}
    </div>
  );
}
