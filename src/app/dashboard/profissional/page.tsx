// src/app/dashboard/profissional/page.tsx
// 🎯 DASHBOARD PRINCIPAL DO PROFISSIONAL APROVADO

"use client";
import { useAuth } from "@/contexts/AuthContext";
import { ProfessionalLayout } from "@/components/dashboard/professional/layout/ProfessionalLayout";
import { ProfessionalWidget } from "@/components/dashboard/professional/widgets";
import { FeedContainer } from "@/components/dashboard/professional/feed";

export default function ProfessionalDashboard() {
  const { profile } = useAuth();

  const nomeUsuario =
    profile?.dados && "nome" in profile.dados
      ? profile.dados.nome
      : "Profissional";

  return (
    <ProfessionalLayout>
      <div className="space-y-6">
        {/* Header de Boas-vindas */}
        <div className="bg-gradient-to-r from-emerald-600 to-blue-600 rounded-2xl p-8 text-white">
          <div className="max-w-4xl">
            <h1 className="text-3xl font-bold mb-2">
              Bem-vindo, {nomeUsuario}! 🩺
            </h1>
            <p className="text-emerald-100 text-lg">
              Conecte-se com colegas, compartilhe conhecimento e ajude mais
              pessoas.
            </p>
          </div>
        </div>

        {/* Feed Social Completo - MODO PROFISSIONAL */}
        <FeedContainer />
      </div>
    </ProfessionalLayout>
  );
}
