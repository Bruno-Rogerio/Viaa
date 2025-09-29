// src/app/dashboard/layout.tsx
// 🔧 LAYOUT NEUTRO - Não assume tipo de usuário

import { AuthProvider } from "@/contexts/AuthContext";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthProvider>{children}</AuthProvider>;
}
