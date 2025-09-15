// src/components/dashboard/professional/layout/ProfessionalLayout.tsx
// 🔧 VERSÃO SIMPLIFICADA - SEM COMPLICAÇÕES

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

  // 📱 DETECTAR MOBILE SIMPLES
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // 📱 FECHAR SIDEBAR EM DESKTOP
  useEffect(() => {
    if (!isMobile) setSidebarOpen(false);
  }, [isMobile]);

  // 📱 LOADING E VALIDAÇÕES
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
            href="/dashboard"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Voltar ao Dashboard
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ✅ HEADER FIXO */}
      <ProfessionalHeader
        onMenuClick={() => setSidebarOpen(true)}
        user={user}
        profile={profile}
      />

      {/* ✅ SIDEBAR */}
      <ProfessionalSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        profile={profile}
      />

      {/* 🔧 MAIN CONTENT - LAYOUT CORRIGIDO */}
      <main
        className={`
        transition-all duration-300
        ${isMobile ? "pt-16" : "lg:ml-72 pt-16"}
      `}
      >
        {/* 🔧 CONTAINER SIMPLES E DIRETO */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* 🔧 GRID SIMPLES */}
          <div
            className={`
            ${isMobile ? "block" : "grid grid-cols-1 xl:grid-cols-4 gap-6"}
          `}
          >
            {/* 📱 CONTEÚDO PRINCIPAL */}
            <div
              className={`
              ${isMobile ? "w-full" : "xl:col-span-3"}
            `}
            >
              {children}
            </div>

            {/* 📱 WIDGET LATERAL - SÓ DESKTOP */}
            {!isMobile && (
              <div className="xl:col-span-1">
                <div className="sticky top-24">
                  <ProfessionalWidget />
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* 📱 OVERLAY MOBILE */}
      {sidebarOpen && isMobile && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* 🔧 DEBUG (REMOVER EM PRODUÇÃO) */}
      {process.env.NODE_ENV === "development" && (
        <div className="fixed bottom-4 right-4 z-50 bg-black/80 text-white text-xs p-2 rounded">
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
