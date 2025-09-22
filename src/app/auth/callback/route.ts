// src/app/auth/callback/route.ts
// 🔧 VERSÃO CORRIGIDA - Melhor tratamento de tokens e redirecionamento

import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const error = requestUrl.searchParams.get("error");
  const error_description = requestUrl.searchParams.get("error_description");

  console.log("🔍 Callback recebido:", {
    code: code ? "presente" : "ausente",
    error,
    error_description,
    url: requestUrl.toString(),
  });

  // Se há erro na URL, redirecionar para página de erro
  if (error) {
    console.error("❌ Erro no callback:", error, error_description);
    return NextResponse.redirect(
      new URL(
        `/auth?error=${error}&message=${encodeURIComponent(
          error_description || "Erro na autenticação"
        )}`,
        requestUrl.origin
      )
    );
  }

  // Se há código de autorização, processar
  if (code) {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    try {
      console.log("🔑 Trocando código por sessão...");

      // Trocar código por sessão
      const { data: sessionData, error: sessionError } =
        await supabase.auth.exchangeCodeForSession(code);

      if (sessionError) {
        console.error("❌ Erro ao trocar código por sessão:", sessionError);
        throw sessionError;
      }

      if (!sessionData.user) {
        console.error("❌ Usuário não encontrado na sessão");
        throw new Error("Usuário não encontrado");
      }

      console.log(
        "✅ Sessão criada com sucesso para usuário:",
        sessionData.user.id
      );
      console.log("👤 Metadados do usuário:", sessionData.user.user_metadata);

      // Verificar se é confirmação de email ou login
      const isEmailConfirmation =
        sessionData.user.email_confirmed_at &&
        new Date(sessionData.user.email_confirmed_at).getTime() >
          Date.now() - 60000; // Confirmado nos últimos 60 segundos

      if (isEmailConfirmation) {
        console.log(
          "📧 Confirmação de email detectada, redirecionando para /auth/confirm"
        );
        return NextResponse.redirect(
          new URL("/auth/confirm", requestUrl.origin)
        );
      } else {
        console.log("🔐 Login normal detectado, redirecionando para dashboard");
        return NextResponse.redirect(new URL("/dashboard", requestUrl.origin));
      }
    } catch (error: any) {
      console.error("❌ Erro no processamento do callback:", error);

      return NextResponse.redirect(
        new URL(
          `/auth?error=callback_failed&message=${encodeURIComponent(
            error.message || "Erro ao processar autenticação"
          )}`,
          requestUrl.origin
        )
      );
    }
  }

  // Se não tem code nem error, algo está errado
  console.warn("⚠️ Callback sem código nem erro, redirecionando para login");
  return NextResponse.redirect(
    new URL(
      "/auth?message=Redirecionamento incompleto, tente novamente",
      requestUrl.origin
    )
  );
}
