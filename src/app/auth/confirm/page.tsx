// src/app/auth/confirm/page.tsx
// 🔧 VERSÃO CORRIGIDA - Tratamento robusto de tokens expirados

"use client";
import { useEffect, useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

function ConfirmContent() {
  const [status, setStatus] = useState<
    "loading" | "success" | "error" | "expired"
  >("loading");
  const [message, setMessage] = useState("");
  const [debugInfo, setDebugInfo] = useState("");
  const [showResendOption, setShowResendOption] = useState(false);
  const [resendEmail, setResendEmail] = useState("");
  const [resending, setResending] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleEmailConfirmation = async () => {
      try {
        setStatus("loading");
        setMessage("Processando confirmação de email...");

        const fullUrl = window.location.href;
        const hash = window.location.hash;

        console.log("🔍 Analisando confirmação:", { fullUrl, hash });

        // 1. Verificar se há erro na URL
        const urlParams = new URLSearchParams(hash.substring(1));
        const error = urlParams.get("error");
        const errorCode = urlParams.get("error_code");
        const errorDescription = urlParams.get("error_description");

        if (error) {
          console.error("❌ Erro detectado na URL:", {
            error,
            errorCode,
            errorDescription,
          });

          if (errorCode === "otp_expired" || error === "access_denied") {
            setStatus("expired");
            setMessage("O link de confirmação expirou ou é inválido.");
            setShowResendOption(true);
            return;
          } else {
            setStatus("error");
            setMessage(`Erro na confirmação: ${errorDescription || error}`);
            return;
          }
        }

        // 2. Verificar se usuário já está autenticado (pode ter vindo do callback)
        const {
          data: { user: currentUser },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) {
          console.error("❌ Erro ao verificar usuário:", userError);
          throw new Error("Erro ao verificar autenticação");
        }

        if (!currentUser) {
          console.warn("⚠️ Usuário não encontrado após callback");
          setStatus("expired");
          setMessage(
            "Sessão expirada. Faça login novamente ou solicite um novo link de confirmação."
          );
          setShowResendOption(true);
          return;
        }

        console.log("✅ Usuário autenticado encontrado:", currentUser.id);

        // 3. Verificar se email foi confirmado
        if (!currentUser.email_confirmed_at) {
          console.warn("⚠️ Email ainda não confirmado");
          setStatus("expired");
          setMessage(
            "Email ainda não foi confirmado. Solicite um novo link de confirmação."
          );
          setShowResendOption(true);
          setResendEmail(currentUser.email || "");
          return;
        }

        // 4. Detectar tipo de usuário
        const tipoUsuario =
          currentUser.user_metadata?.tipo_usuario ||
          (typeof window !== "undefined"
            ? localStorage.getItem("signup_user_type")
            : null);

        console.log("👤 Tipo de usuário detectado:", tipoUsuario);

        if (!tipoUsuario) {
          console.warn("⚠️ Tipo de usuário não encontrado");
          // Não é erro crítico, pode continuar para onboarding
          setStatus("success");
          setMessage("Email confirmado! Vamos configurar seu perfil.");
          setTimeout(() => router.push("/onboarding"), 2000);
          return;
        }

        // 5. Verificar perfil baseado no tipo - SCHEMA CORRETO
        let tabelaPerfil: string;
        let camposSelect: string;

        switch (tipoUsuario) {
          case "paciente":
            tabelaPerfil = "perfis_pacientes";
            camposSelect = "id, verificado";
            break;
          case "profissional":
            tabelaPerfil = "perfis_profissionais";
            camposSelect = "id, status_verificacao, verificado";
            break;
          case "clinica":
            tabelaPerfil = "perfis_clinicas";
            camposSelect = "id, status_verificacao, verificado";
            break;
          case "empresa":
            tabelaPerfil = "perfis_empresas";
            camposSelect = "id, status_verificacao, verificado";
            break;
          default:
            throw new Error(`Tipo de usuário inválido: ${tipoUsuario}`);
        }

        console.log("🔍 Verificando perfil na tabela:", tabelaPerfil);

        const { data: perfilExistente, error: perfilError } = await supabase
          .from(tabelaPerfil)
          .select(camposSelect)
          .eq("user_id", currentUser.id)
          .maybeSingle();

        if (perfilError && perfilError.code !== "PGRST116") {
          console.error("❌ Erro ao verificar perfil:", perfilError);
          // Não é erro crítico, pode continuar para onboarding
        }

        // 6. Decidir redirecionamento
        if (perfilExistente) {
          console.log("✅ Perfil já existe:", perfilExistente);

          if (tipoUsuario === "paciente") {
            setStatus("success");
            setMessage("Email confirmado! Bem-vindo de volta.");
            setTimeout(() => router.push("/dashboard"), 2000);
          } else {
            // Profissionais, clínicas, empresas
            const statusVerificacao = (perfilExistente as any)
              .status_verificacao;

            if (statusVerificacao === "pendente") {
              setStatus("success");
              setMessage(
                "Email confirmado! Seu perfil está aguardando aprovação."
              );
              setTimeout(() => router.push("/dashboard/waiting"), 2000);
            } else if (statusVerificacao === "aprovado") {
              setStatus("success");
              setMessage("Email confirmado! Bem-vindo de volta.");
              setTimeout(() => router.push("/dashboard"), 2000);
            } else {
              setStatus("success");
              setMessage("Email confirmado! Redirecionando...");
              setTimeout(() => router.push("/dashboard"), 2000);
            }
          }
        } else {
          // Perfil não existe, ir para onboarding
          console.log(
            "📝 Perfil não encontrado, redirecionando para onboarding"
          );

          // Limpar localStorage após uso
          if (typeof window !== "undefined") {
            localStorage.removeItem("signup_user_type");
          }

          setStatus("success");
          setMessage("Email confirmado! Vamos finalizar seu cadastro.");
          setTimeout(() => router.push("/onboarding"), 2000);
        }
      } catch (error: any) {
        console.error("❌ Erro na confirmação:", error);

        setStatus("error");
        setMessage(error.message || "Erro inesperado na confirmação");

        const debugData = {
          timestamp: new Date().toISOString(),
          error: error.message,
          url: typeof window !== "undefined" ? window.location.href : "N/A",
        };
        setDebugInfo(JSON.stringify(debugData, null, 2));
      }
    };

    // Executar após pequeno delay para garantir que a página carregou
    const timer = setTimeout(handleEmailConfirmation, 1000);
    return () => clearTimeout(timer);
  }, [router]);

  // Reenviar email de confirmação
  const handleResendEmail = async () => {
    if (!resendEmail) {
      alert("Por favor, digite seu email.");
      return;
    }

    setResending(true);
    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: resendEmail,
      });

      if (error) {
        throw error;
      }

      alert(
        "✅ Email de confirmação reenviado! Verifique sua caixa de entrada."
      );
      setShowResendOption(false);
    } catch (error: any) {
      console.error("❌ Erro ao reenviar email:", error);
      alert(`Erro ao reenviar email: ${error.message}`);
    } finally {
      setResending(false);
    }
  };

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

        {/* Expired Token State */}
        {status === "expired" && (
          <>
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <div className="text-yellow-500 text-2xl">⚠</div>
            </div>
            <h2 className="text-xl font-semibold mb-2 text-yellow-700">
              Link Expirado
            </h2>
            <p className="text-gray-600 mb-4">{message}</p>

            {showResendOption && (
              <div className="space-y-4">
                <div>
                  <input
                    type="email"
                    value={resendEmail}
                    onChange={(e) => setResendEmail(e.target.value)}
                    placeholder="Digite seu email"
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button
                  onClick={handleResendEmail}
                  disabled={resending}
                  className="w-full bg-blue-500 text-white px-4 py-2 rounded-xl hover:bg-blue-600 transition-colors disabled:opacity-50"
                >
                  {resending ? "Enviando..." : "Reenviar Email de Confirmação"}
                </button>
              </div>
            )}

            <div className="mt-4">
              <button
                onClick={() => router.push("/auth")}
                className="text-blue-600 hover:text-blue-700 text-sm"
              >
                Voltar para Login
              </button>
            </div>
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

            <div className="flex gap-2">
              <button
                onClick={() => router.push("/auth")}
                className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-xl hover:bg-blue-600 transition-colors"
              >
                Fazer Login
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
