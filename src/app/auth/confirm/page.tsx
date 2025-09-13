// src/app/auth/confirm/page.tsx - VERSÃO CORRIGIDA COM SUSPENSE

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

        // Tentar pegar parâmetros do hash primeiro
        if (hash) {
          const hashParams = new URLSearchParams(hash.substring(1));
          access_token = hashParams.get("access_token");
          refresh_token = hashParams.get("refresh_token");
          token_hash = hashParams.get("token_hash");
          urlTipoUsuario = hashParams.get("type");
        }

        // Se não tiver no hash, pegar dos query params
        if (!access_token && !token_hash) {
          access_token = searchParams.get("access_token");
          refresh_token = searchParams.get("refresh_token");
          token_hash = searchParams.get("token_hash");
          urlTipoUsuario = searchParams.get("type");
        }

        console.log("Parâmetros encontrados:", {
          access_token: access_token ? "presente" : "ausente",
          refresh_token: refresh_token ? "presente" : "ausente",
          token_hash: token_hash ? "presente" : "ausente",
          urlTipoUsuario,
        });

        let authenticatedUser = null;

        if (access_token && refresh_token) {
          const { data, error } = await supabase.auth.setSession({
            access_token,
            refresh_token,
          });
          if (error) throw error;
          console.log("Sessão criada com sucesso:", data);
          authenticatedUser = data.user;
        } else if (token_hash) {
          const { data, error } = await supabase.auth.verifyOtp({
            token_hash,
            type: "signup",
          });
          if (error) throw error;
          console.log("Token verificado com sucesso:", data);
          authenticatedUser = data.user;
        } else {
          throw new Error("Tokens de confirmação não encontrados na URL.");
        }

        if (authenticatedUser) {
          console.log("Usuário autenticado:", authenticatedUser);

          const finalTipoUsuario =
            urlTipoUsuario ||
            authenticatedUser.user_metadata?.tipo_usuario ||
            localStorage.getItem("signup_user_type");

          if (finalTipoUsuario) {
            console.log("Tipo detectado:", finalTipoUsuario);

            // Verificar se já tem perfil criado
            let tabelaPerfil;
            switch (finalTipoUsuario) {
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
                tabelaPerfil = null;
            }

            if (tabelaPerfil) {
              const { data: perfilExistente } = await supabase
                .from(tabelaPerfil)
                .select("id")
                .eq("user_id", authenticatedUser.id)
                .maybeSingle();

              if (!perfilExistente) {
                console.log(
                  "Perfil não existe, redirecionando para onboarding"
                );
                setStatus("success");
                setMessage("Email confirmado! Vamos finalizar seu perfil.");
                setTimeout(() => {
                  router.push("/onboarding");
                }, 2000);
                return;
              } else {
                console.log("Perfil já existe, redirecionando para dashboard");
                setStatus("success");
                setMessage("Email confirmado e login realizado com sucesso!");
                setTimeout(() => {
                  router.push("/dashboard");
                }, 2000);
                return;
              }
            }
          }

          // Fallback - redirecionar para onboarding geral
          console.log("Fallback - redirecionando para onboarding");
          setStatus("success");
          setMessage("Email confirmado! Vamos configurar seu perfil.");
          setTimeout(() => {
            router.push("/onboarding");
          }, 2000);
        }
      } catch (error: unknown) {
        console.error("Erro na confirmação:", error);
        const errorMessage =
          error instanceof Error ? error.message : "Erro desconhecido";
        setStatus("error");
        setMessage(errorMessage);
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

// Componente principal exportado com Suspense
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
