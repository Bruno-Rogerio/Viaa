// src/app/dashboard/paciente/layout.tsx
// 🎯 LAYOUT ESPECÍFICO PARA PÁGINAS DE PACIENTES

import { AuthProvider } from "@/contexts/AuthContext";

export default function PatientDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthProvider>{children}</AuthProvider>;
}
