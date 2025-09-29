// src/app/dashboard/page.tsx
// 🎯 ROUTER INTELIGENTE - Redireciona para dashboard específico

"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { LoadingSpinner } from "@/components/dashboard/common";

export default function DashboardRouter() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    if (loading) return; // Aguardar carregamento do perfil

    if (!user) {
      console.log("🔐 Usuário não autenticado, redirecionando para login");
      router.replace("/auth");
      return;
    }

    if (!profile) {
      console.log("📝 Perfil não encontrado, redirecionando para onboarding");
      router.replace("/onboarding");
      return;
    }

    console.log("👤 Tipo de usuário detectado:", profile.tipo);
    setRedirecting(true);

    // Redirecionamento baseado no tipo de usuário
    switch (profile.tipo) {
      case "paciente":
        console.log("🏥 Redirecionando para dashboard de paciente");
        router.replace("/dashboard/paciente");
        break;

      case "profissional":
        // Verificar status de aprovação
        const statusVerificacao =
          profile.dados && "status_verificacao" in profile.dados
            ? (profile.dados as any).status_verificacao
            : null;

        if (statusVerificacao === "pendente") {
          console.log("⏳ Profissional pendente, redirecionando para waiting");
          router.replace("/dashboard/waiting");
        } else if (statusVerificacao === "aprovado") {
          console.log(
            "✅ Profissional aprovado, redirecionando para dashboard"
          );
          router.replace("/dashboard/profissional");
        } else if (statusVerificacao === "rejeitado") {
          console.log(
            "❌ Profissional rejeitado, redirecionando para onboarding"
          );
          router.replace("/onboarding?rejected=true");
        } else {
          console.log("❓ Status indefinido, redirecionando para waiting");
          router.replace("/dashboard/waiting");
        }
        break;

      case "clinica":
        console.log("🏥 Redirecionando para dashboard de clínica");
        router.replace("/dashboard/clinic");
        break;

      case "empresa":
        console.log("🏢 Redirecionando para dashboard de empresa");
        router.replace("/dashboard/company");
        break;

      default:
        console.warn("⚠️ Tipo de usuário desconhecido:", profile.tipo);
        router.replace("/onboarding");
        break;
    }
  }, [user, profile, loading, router]);

  // Mostrar loading enquanto redireciona
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <LoadingSpinner size="lg" />
        <h2 className="mt-4 text-xl font-semibold text-gray-900">
          {redirecting ? "Redirecionando..." : "Carregando dashboard..."}
        </h2>
        <p className="mt-2 text-gray-600">
          {redirecting
            ? "Preparando seu espaço personalizado"
            : "Verificando suas credenciais"}
        </p>

        {/* Debug info em desenvolvimento */}
        {process.env.NODE_ENV === "development" && (
          <div className="mt-6 text-xs text-gray-400 bg-gray-100 p-4 rounded-lg max-w-md mx-auto">
            <p>
              <strong>Debug Info:</strong>
            </p>
            <p>Loading: {loading ? "true" : "false"}</p>
            <p>User: {user ? "present" : "null"}</p>
            <p>Profile: {profile ? "present" : "null"}</p>
            <p>Tipo: {profile?.tipo || "N/A"}</p>
            <p>Redirecting: {redirecting ? "true" : "false"}</p>
          </div>
        )}
      </div>
    </div>
  );
}
