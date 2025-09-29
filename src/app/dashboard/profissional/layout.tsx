// src/app/dashboard/profissional/layout.tsx
// 🎯 LAYOUT ESPECÍFICO PARA PÁGINAS DE PROFISSIONAIS

import { AuthProvider } from "@/contexts/AuthContext";

export default function ProfessionalDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthProvider>{children}</AuthProvider>;
}
