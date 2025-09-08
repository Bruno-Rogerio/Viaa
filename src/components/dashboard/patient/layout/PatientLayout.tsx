// viaa\src\components\dashboard\patient\layout\PatientLayout.tsx
"use client";
import { useState } from "react";
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

  if (!user || profile?.tipo !== "paciente") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Área do Paciente
          </h2>
          <p className="text-gray-600 mb-4">
            Este espaço é exclusivo para pacientes.
          </p>
          <a
            href="/auth"
            className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700"
          >
            Fazer Login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PatientHeader
        onMenuClick={() => setSidebarOpen(true)}
        user={user}
        profile={profile}
      />

      <div className="flex">
        <PatientSidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          profile={profile}
        />

        <main className="flex-1 lg:ml-80 pt-16">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 p-6">
              <div className="xl:col-span-3">{children}</div>
              <div className="xl:col-span-1">
                <PatientWidget />
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
