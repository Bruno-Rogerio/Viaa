// src/app/dashboard/layout.tsx
// 🔧 LAYOUT SIMPLES - Sem forçar ProfessionalLayout

import { AuthProvider } from "@/contexts/AuthContext";

export default function DashboardLayoutPage({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthProvider>{children}</AuthProvider>;
}
