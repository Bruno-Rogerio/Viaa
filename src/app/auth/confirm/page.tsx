// viaa\src\app\auth\confirm\page.tsx

"use client";
import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

function ConfirmContent() {
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState("");
  const [debugInfo, setDebugInfo] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleEmailConfirmation = async () => {
      try {
        const fullUrl = window.location.href;
        const hash = window.location.hash;
        const search = window.location.search;

        console.log("URL completa:", fullUrl);
        console.log("Hash:", hash);
        console.log("Search:", search);
        console.log("SearchParams:", searchParams.toString());

        setDebugInfo(`URL: ${fullUrl}\nHash: ${hash}\nSearch: ${search}`);

        let access_token, refresh_token, token_hash, urlTipoUsuario;

        // Tentar pegar parâmetros do hash primeiro (comum no Supabase)
        if (hash) {
          const hashParams = new URLSearchParams(hash.substring(1));
          access_token = hashParams.get("access_token");
          refresh_token = hashParams.get("refresh_token");
          token_hash = hashParams.get("token_hash");
          urlTipoUsuario = hashParams.get("type"); // Este 'type' é o nosso custom tipoUsuario
        }

        // Se não tiver no hash, pegar dos query params
        if (!access_token && !token_hash) {
          access_token = searchParams.get("access_token");
          refresh_token = searchParams.get("refresh_token");
          token_hash = searchParams.get("token_hash");
          urlTipoUsuario = searchParams.get("type"); // Este 'type' é o nosso custom tipoUsuario
        }

        console.log("Parâmetros encontrados:", {
          access_token: access_token ? "presente" : "ausente",
          refresh_token: refresh_token ? "presente" : "ausente",
          token_hash: token_hash ? "presente" : "ausente",
          urlTipoUsuario, // Log do tipo de usuário customizado
        });

        let authenticatedUser = null;

        if (access_token && refresh_token) {
          // Método para magic links
          const { data, error } = await supabase.auth.setSession({
            access_token,
            refresh_token,
          });
          if (error) throw error;
          console.log("Sessão criada com sucesso:", data);
          authenticatedUser = data.user;
        } else if (token_hash) {
          // Correção: O 'type' para verifyOtp deve ser 'signup' para confirmações de cadastro.
          const { data, error } = await supabase.auth.verifyOtp({
            token_hash,
            type: "signup", // Deve ser 'signup' para links de confirmação de email de cadastro
          });
          if (error) throw error;
          console.log("OTP verificado:", data);
          authenticatedUser = data.user;
        } else {
          // Tentar método automático do Supabase
          const { data: sessionData, error: sessionError } =
            await supabase.auth.getSession();
          if (sessionData?.session) {
            console.log("Sessão já existe:", sessionData.session);
            authenticatedUser = sessionData.session.user;
          } else {
            throw new Error(
              "Nenhum método de confirmação funcionou. Tente fazer login manualmente."
            );
          }
        }

        if (authenticatedUser) {
          // Priorizar tipoUsuario do user_metadata, fallback para o parâmetro da URL
          let finalTipoUsuario: string | null =
            authenticatedUser.user_metadata?.tipo_usuario || urlTipoUsuario;

          // Se ainda não encontrou, tentar do localStorage (salvo no signup)
          if (!finalTipoUsuario) {
            finalTipoUsuario = localStorage.getItem("signup_user_type");
            console.log(
              "Recuperado tipoUsuario de localStorage:",
              finalTipoUsuario
            );
          }

          console.log("=== VERIFICAÇÃO ONBOARDING ===");
          console.log("Tipo usuário final:", finalTipoUsuario);

          // Validar se o tipo de usuário é um dos esperados
          const validUserTypes = [
            "paciente",
            "profissional",
            "clinica",
            "empresa",
          ];
          if (!finalTipoUsuario || !validUserTypes.includes(finalTipoUsuario)) {
            console.log(
              "Redirecionando para login - tipo de usuário não definido ou inválido."
            );
            setStatus("error");
            setMessage(
              "Email confirmado, mas não foi possível determinar seu tipo de usuário. Por favor, faça login."
            );
            setTimeout(() => {
              router.push("/auth"); // Redireciona para a página de login
            }, 2000);
            return;
          }

          // Definir tabela do perfil baseada no tipo de usuário
          let profileTableName: string;
          switch (finalTipoUsuario) {
            case "paciente":
              profileTableName = "perfis_pacientes";
              break;
            case "profissional":
              profileTableName = "perfis_profissionais";
              break;
            case "clinica":
              profileTableName = "perfis_clinicas";
              break;
            case "empresa":
              profileTableName = "perfis_empresas";
              break;
            default:
              // Isso não deve ser alcançado devido à verificação anterior
              setStatus("error");
              setMessage(
                "Tipo de usuário inválido. Redirecionando para login."
              );
              setTimeout(() => router.push("/auth"), 2000);
              return;
          }

          // 1. Verificar se o perfil já existe na tabela correta
          console.log(
            `Verificando perfil de ${finalTipoUsuario} na tabela ${profileTableName}...`
          );
          const { data: existingProfile, error: fetchError } = await supabase
            .from(profileTableName)
            .select("id")
            .eq("user_id", authenticatedUser.id)
            .maybeSingle();

          if (fetchError && fetchError.code !== "PGRST116") {
            // PGRST116 = no rows found (nenhuma linha encontrada)
            throw fetchError;
          }

          const temPerfil = !!existingProfile;
          console.log(
            `Perfil ${finalTipoUsuario} encontrado:`,
            existingProfile
          );
          console.log(`Erro ao buscar perfil (se houver):`, fetchError);
          console.log("Tem perfil completo:", temPerfil);

          if (!temPerfil) {
            // 2. Se o perfil NÃO existe, redirecionar para o onboarding geral
            // O OnboardingContainer vai detectar o tipo e mostrar o formulário correto
            console.log(
              `Perfil não encontrado. Redirecionando para onboarding geral: /onboarding`
            );
            setStatus("success");
            setMessage("Email confirmado! Vamos finalizar seu perfil.");
            setTimeout(() => {
              router.push("/onboarding"); // REDIRECIONAMENTO PARA ONBOARDING GERAL
            }, 2000);
            return;
          } else {
            // 3. Se o perfil JÁ existe, redirecionar para o dashboard
            console.log(
              `Perfil de ${finalTipoUsuario} já existe. Redirecionando para dashboard: /dashboard`
            );
            setStatus("success");
            setMessage("Email confirmado e login realizado com sucesso!");
            setTimeout(() => {
              router.push("/dashboard"); // REDIRECIONAMENTO PARA DASHBOARD GERAL
            }, 2000);
            return;
          }
        }
      } catch (error: any) {
        console.error("Erro na confirmação:", error);
        setStatus("error");
        setMessage(`${error.message}`);
      }
    };

    const timer = setTimeout(handleEmailConfirmation, 500);
    return () => clearTimeout(timer);
  }, [searchParams, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-emerald-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
        {status === "loading" && (
          <>
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold mb-2">Confirmando email...</h2>
            <p className="text-gray-600">Aguarde um momento</p>
            {/* Debug info */}
            <details className="mt-4 text-left">
              <summary className="text-xs text-gray-400 cursor-pointer">
                Debug Info
              </summary>
              <pre className="text-xs text-gray-400 mt-2 whitespace-pre-wrap">
                {debugInfo}
              </pre>
            </details>
          </>
        )}
        {status === "success" && (
          <>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <div className="text-green-500 text-2xl">✓</div>
            </div>
            <h2 className="text-xl font-semibold mb-2 text-green-700">
              Email Confirmado!
            </h2>
            <p className="text-gray-600">{message}</p>
            <p className="text-sm text-gray-500 mt-2">Redirecionando...</p>
          </>
        )}
        {status === "error" && (
          <>
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <div className="text-red-500 text-2xl">✗</div>
            </div>
            <h2 className="text-xl font-semibold mb-2 text-red-700">
              Erro na Confirmação
            </h2>
            <p className="text-gray-600 mb-4">{message}</p>
            {/* Debug info */}
            <details className="mb-4 text-left">
              <summary className="text-xs text-gray-400 cursor-pointer">
                Informações técnicas
              </summary>
              <pre className="text-xs text-gray-400 mt-2 whitespace-pre-wrap">
                {debugInfo}
              </pre>
            </details>
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
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      }
    >
      <ConfirmContent />
    </Suspense>
  );
}
