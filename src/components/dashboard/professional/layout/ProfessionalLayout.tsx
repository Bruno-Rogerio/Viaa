// viaa\src\components\dashboard\professional\layout\ProfessionalLayout.tsx
"use client";
import { useState } from "react";
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Acesso Restrito
          </h2>
          <p className="text-gray-600 mb-4">
            Você precisa estar logado para acessar o dashboard.
          </p>
          <a
            href="/auth"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Fazer Login
          </a>
        </div>
      </div>
    );
  }

  if (profile?.tipo !== "profissional") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Dashboard de Profissionais
          </h2>
          <p className="text-gray-600 mb-4">
            Este dashboard é exclusivo para profissionais aprovados.
          </p>
          <a
            href="/onboarding"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-amber-600 mb-2">
            Aprovação Pendente
          </h2>
          <p className="text-gray-600 mb-4">
            Seu cadastro está sendo analisado pela nossa equipe.
          </p>
          <a
            href="/onboarding"
            className="bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700"
          >
            Ver Status
          </a>
        </div>
      </div>
    );
  }

  if (dados?.status_verificacao === "rejeitado") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-2">
            Cadastro Rejeitado
          </h2>
          <p className="text-gray-600 mb-4">
            Entre em contato com o suporte para mais informações.
          </p>
          <a
            href="/onboarding"
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
          >
            Refazer Cadastro
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ProfessionalHeader
        onMenuClick={() => setSidebarOpen(true)}
        user={user}
        profile={profile}
      />

      <div className="flex">
        <ProfessionalSidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          profile={profile}
        />

        <main className="flex-1 lg:ml-80 pt-16">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 p-6">
              <div className="xl:col-span-3">{children}</div>
              <div className="xl:col-span-1">
                <ProfessionalWidget />
              </div>
            </div>
          </div>
        </main>
      </div>

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
