// src/app/auth/confirm/page.tsx
// 🔧 VERSÃO CORRIGIDA - Processamento completo de confirmação

"use client";
import { useEffect, useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

function ConfirmContent() {
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState("");
  const [debugInfo, setDebugInfo] = useState("");
  const router = useRouter();

  useEffect(() => {
    const handleEmailConfirmation = async () => {
      try {
        setStatus("loading");
        setMessage("Processando confirmação de email...");

        console.log("🔍 Iniciando processo de confirmação...");

        // 1. Verificar se usuário já está autenticado
        const {
          data: { user: currentUser },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) {
          console.error("❌ Erro ao verificar usuário:", userError);
          throw new Error("Erro ao verificar autenticação");
        }

        if (!currentUser) {
          console.error(
            "❌ Usuário não encontrado, pode não estar confirmado ainda"
          );
          throw new Error(
            "Usuário não encontrado. Verifique se clicou no link correto do email."
          );
        }

        console.log("✅ Usuário autenticado encontrado:", currentUser.id);
        console.log(
          "📧 Email confirmado:",
          currentUser.email_confirmed_at ? "Sim" : "Não"
        );

        // 2. Verificar se email foi confirmado
        if (!currentUser.email_confirmed_at) {
          console.warn("⚠️ Email ainda não confirmado");
          throw new Error(
            "Email ainda não foi confirmado. Verifique sua caixa de entrada."
          );
        }

        // 3. Detectar tipo de usuário
        const tipoUsuario =
          currentUser.user_metadata?.tipo_usuario ||
          (typeof window !== "undefined"
            ? localStorage.getItem("signup_user_type")
            : null);

        console.log("👤 Tipo de usuário detectado:", tipoUsuario);

        if (!tipoUsuario) {
          console.warn("⚠️ Tipo de usuário não encontrado");
          throw new Error(
            "Tipo de usuário não identificado. Entre em contato com o suporte."
          );
        }

        // 4. Verificar se já tem perfil criado
        let tabelaPerfil: string;
        switch (tipoUsuario) {
          case "paciente":
            tabelaPerfil = "perfis_pacientes";
            break;
          case "profissional":
            tabelaPerfil = "perfis_profissionais";
            break;
          case "clinica":
            tabelaPerfil = "perfis_clinicas";
            break;
          case "empresa":
            tabelaPerfil = "perfis_empresas";
            break;
          default:
            throw new Error(`Tipo de usuário inválido: ${tipoUsuario}`);
        }

        console.log("🔍 Verificando perfil na tabela:", tabelaPerfil);

        const { data: perfilExistente, error: perfilError } = await supabase
          .from(tabelaPerfil)
          .select("id, status_verificacao")
          .eq("user_id", currentUser.id)
          .maybeSingle();

        if (perfilError) {
          console.error("❌ Erro ao verificar perfil:", perfilError);
          // Não é erro crítico, pode continuar para onboarding
        }

        // 5. Decidir redirecionamento baseado no perfil
        if (perfilExistente) {
          console.log("✅ Perfil já existe:", perfilExistente);

          if (tipoUsuario === "profissional") {
            // Para profissionais, verificar status
            if (perfilExistente.status_verificacao === "pendente") {
              setStatus("success");
              setMessage(
                "Email confirmado! Seu perfil está aguardando aprovação."
              );
              setTimeout(() => {
                router.push("/dashboard/professional/waiting");
              }, 2000);
              return;
            } else if (perfilExistente.status_verificacao === "aprovado") {
              setStatus("success");
              setMessage("Email confirmado! Bem-vindo de volta.");
              setTimeout(() => {
                router.push("/dashboard");
              }, 2000);
              return;
            }
          } else {
            // Para outros tipos, ir direto para dashboard
            setStatus("success");
            setMessage("Email confirmado! Redirecionando para seu dashboard.");
            setTimeout(() => {
              router.push("/dashboard");
            }, 2000);
            return;
          }
        }

        // 6. Se não tem perfil, ir para onboarding
        console.log("📝 Perfil não encontrado, redirecionando para onboarding");

        // Limpar localStorage após uso
        if (typeof window !== "undefined") {
          localStorage.removeItem("signup_user_type");
        }

        setStatus("success");
        setMessage("Email confirmado! Vamos finalizar seu cadastro.");
        setTimeout(() => {
          router.push("/onboarding");
        }, 2000);
      } catch (error: any) {
        console.error("❌ Erro na confirmação:", error);

        setStatus("error");
        setMessage(error.message || "Erro inesperado na confirmação");

        // Adicionar informações de debug
        const debugData = {
          timestamp: new Date().toISOString(),
          error: error.message,
          url: typeof window !== "undefined" ? window.location.href : "N/A",
          userAgent:
            typeof window !== "undefined" ? navigator.userAgent : "N/A",
        };
        setDebugInfo(JSON.stringify(debugData, null, 2));
      }
    };

    // Executar após pequeno delay para garantir que a página carregou
    const timer = setTimeout(handleEmailConfirmation, 1000);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-emerald-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
        {/* Loading State */}
        {status === "loading" && (
          <>
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold mb-2 text-gray-900">
              Confirmando email...
            </h2>
            <p className="text-gray-600">{message}</p>
            <div className="mt-4 text-xs text-gray-400">
              <p>Verificando autenticação e configurando seu perfil</p>
            </div>
          </>
        )}

        {/* Success State */}
        {status === "success" && (
          <>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <div className="text-green-500 text-2xl">✓</div>
            </div>
            <h2 className="text-xl font-semibold mb-2 text-green-700">
              Email Confirmado!
            </h2>
            <p className="text-gray-600 mb-2">{message}</p>
            <p className="text-sm text-gray-500">
              Redirecionando automaticamente...
            </p>
          </>
        )}

        {/* Error State */}
        {status === "error" && (
          <>
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <div className="text-red-500 text-2xl">✗</div>
            </div>
            <h2 className="text-xl font-semibold mb-2 text-red-700">
              Erro na Confirmação
            </h2>
            <p className="text-gray-600 mb-4">{message}</p>

            {/* Debug Info */}
            {debugInfo && (
              <details className="mb-4 text-left">
                <summary className="text-xs text-gray-400 cursor-pointer">
                  ▼ Informações técnicas
                </summary>
                <pre className="text-xs text-gray-400 mt-2 whitespace-pre-wrap bg-gray-50 p-2 rounded">
                  {debugInfo}
                </pre>
              </details>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => router.push("/auth")}
                className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-xl hover:bg-blue-600 transition-colors"
              >
                Fazer Login Manual
              </button>
              <button
                onClick={() => window.location.reload()}
                className="flex-1 bg-gray-500 text-white px-4 py-2 rounded-xl hover:bg-gray-600 transition-colors"
              >
                Tentar Novamente
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function ConfirmPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-emerald-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando confirmação...</p>
          </div>
        </div>
      }
    >
      <ConfirmContent />
    </Suspense>
  );
}
