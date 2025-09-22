// src/components/dashboard/patient/layout/PatientLayout.tsx
// 🔄 REUTILIZANDO 90% do ProfessionalLayout - mesma estrutura, componentes específicos

"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import PatientHeader from "./PatientHeader";
import PatientSidebar from "./PatientSidebar";
import PatientWidget from "./PatientWidget";
import { LoadingSpinner } from "../../common";

interface PatientLayoutProps {
  children: React.ReactNode;
}

export function PatientLayout({ children }: PatientLayoutProps) {
  const { user, profile, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // 🔄 REUTILIZADO: Lógica mobile igual ao ProfessionalLayout
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // 🔄 REUTILIZADO: Fechar sidebar em desktop
  useEffect(() => {
    if (!isMobile) setSidebarOpen(false);
  }, [isMobile]);

  // 🔄 REUTILIZADO: Loading
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Carregando seu espaço...</p>
        </div>
      </div>
    );
  }

  // 🔄 REUTILIZADO: Validação de usuário
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
            className="inline-block bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition-colors"
          >
            Fazer Login
          </a>
        </div>
      </div>
    );
  }

  // 🎯 VALIDAÇÃO ESPECÍFICA: Apenas pacientes
  if (profile?.tipo !== "paciente") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md w-full">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Área do Paciente
          </h2>
          <p className="text-gray-600 mb-4">
            Este espaço é exclusivo para pacientes.
          </p>
          <a
            href="/dashboard"
            className="inline-block bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition-colors"
          >
            Voltar ao Dashboard
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 🔄 REUTILIZADO: Header fixo */}
      <PatientHeader
        onMenuClick={() => setSidebarOpen(true)}
        user={user}
        profile={profile}
      />

      {/* 🔄 REUTILIZADO: Sidebar */}
      <PatientSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        profile={profile}
      />

      {/* 🔄 REUTILIZADO: Main content layout */}
      <main
        className={`
        transition-all duration-300
        ${isMobile ? "pt-16" : "lg:ml-72 pt-16"}
      `}
      >
        {/* 🔄 REUTILIZADO: Container e grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div
            className={`
            ${isMobile ? "block" : "grid grid-cols-1 xl:grid-cols-4 gap-6"}
          `}
          >
            {/* 🔄 REUTILIZADO: Conteúdo principal */}
            <div
              className={`
              ${isMobile ? "w-full" : "xl:col-span-3"}
            `}
            >
              {children}
            </div>

            {/* 🔄 REUTILIZADO: Widget lateral - só desktop */}
            {!isMobile && (
              <div className="xl:col-span-1">
                <div className="sticky top-24">
                  <PatientWidget />
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* 🔄 REUTILIZADO: Overlay mobile */}
      {sidebarOpen && isMobile && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* 🔧 DEBUG (REMOVER EM PRODUÇÃO) */}
      {process.env.NODE_ENV === "development" && (
        <div className="fixed bottom-4 left-4 z-50 bg-black/80 text-white text-xs p-2 rounded">
          <div>
            Paciente:{" "}
            {profile?.dados && "nome" in profile.dados
              ? profile.dados.nome
              : "N/A"}
          </div>
          <div>Mobile: {isMobile ? "Sim" : "Não"}</div>
          <div>Sidebar: {sidebarOpen ? "Aberta" : "Fechada"}</div>
        </div>
      )}
    </div>
  );
}
