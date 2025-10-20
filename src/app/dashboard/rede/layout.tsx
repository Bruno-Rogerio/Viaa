// src/app/dashboard/rede/layout.tsx
// Layout específico para a página de rede

import { AuthProvider } from "@/contexts/AuthContext";

export const metadata = {
  title: "Rede Profissional | VIAA",
  description: "Conecte-se com profissionais de saúde mental",
};

export default function NetworkLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthProvider>{children}</AuthProvider>;
}
