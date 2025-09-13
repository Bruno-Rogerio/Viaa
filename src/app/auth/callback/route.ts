// src/app/auth/callback/route.ts - VERSÃO SIMPLIFICADA

import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  if (code) {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    try {
      await supabase.auth.exchangeCodeForSession(code);

      // Redirecionar para confirm page que faz o processamento
      return NextResponse.redirect(new URL("/auth/confirm", requestUrl.origin));
    } catch (error) {
      console.error("Erro no callback:", error);
      return NextResponse.redirect(
        new URL("/auth?error=callback_failed", requestUrl.origin)
      );
    }
  }

  // Se não tem code, redirecionar para login
  return NextResponse.redirect(new URL("/auth", requestUrl.origin));
}
