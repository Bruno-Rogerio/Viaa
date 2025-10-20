// src/app/dashboard/rede/page.tsx
// 🌐 Página de Rede Social - Descoberta de Profissionais

"use client";

import { useAuth } from "@/contexts/AuthContext";
import { PatientLayout } from "@/components/dashboard/patient/layout";
import { ProfessionalLayout } from "@/components/dashboard/professional/layout";
import NetworkContent from "@/components/dashboard/rede/NetworkContent";

export default function NetworkPage() {
  const { profile } = useAuth();

  // Renderizar com layout apropriado baseado no tipo de usuário
  const content = <NetworkContent />;

  if (profile?.tipo === "profissional") {
    return <ProfessionalLayout>{content}</ProfessionalLayout>;
  }

  return <PatientLayout>{content}</PatientLayout>;
}
