// viaa\src\app\auth\callback\route.ts

import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);

  // Para verificação com token (novo fluxo)
  const token = requestUrl.searchParams.get("token");
  const email = requestUrl.searchParams.get("email");

  // Para confirmação tradicional (caso ainda precise)
  const code = requestUrl.searchParams.get("code");

  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

  // Fluxo com TOKEN (novo)
  if (token && email) {
    try {
      // Verificar se o token é válido
      const { data: tokenData, error: tokenError } = await supabase
        .from("verification_tokens")
        .select("user_id, user_type, expires_at")
        .eq("token", token)
        .eq("email", email)
        .single();

      if (tokenError || !tokenData) {
        return NextResponse.redirect(
          new URL("/signup?error=token_invalid", requestUrl.origin)
        );
      }

      // Verificar se não expirou
      if (new Date(tokenData.expires_at) < new Date()) {
        return NextResponse.redirect(
          new URL("/signup?error=token_expired", requestUrl.origin)
        );
      }

      // Token válido → marcar email como confirmado
      await supabase.auth.admin.updateUserById(tokenData.user_id, {
        email_confirm: true,
      });

      // Remover o token usado
      await supabase.from("verification_tokens").delete().eq("token", token);

      // Redirecionar para onboarding
      return NextResponse.redirect(
        new URL(`/onboarding/${tokenData.user_type}`, requestUrl.origin)
      );
    } catch (error) {
      return NextResponse.redirect(
        new URL("/signup?error=verification_failed", requestUrl.origin)
      );
    }
  }

  // Fluxo TRADICIONAL (código de confirmação - manter por compatibilidade)
  if (code) {
    await supabase.auth.exchangeCodeForSession(code);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      // Verificar se já tem perfil criado
      const tipoPerfil = await verificarTipoPerfil(supabase, user.id);

      if (tipoPerfil) {
        // Já tem perfil → dashboard
        return NextResponse.redirect(
          new URL(`/dashboard/${tipoPerfil}`, requestUrl.origin)
        );
      }

      // Não tem perfil → onboarding
      const tipoUsuario = user.user_metadata?.user_type;
      if (tipoUsuario) {
        return NextResponse.redirect(
          new URL(`/onboarding/${tipoUsuario}`, requestUrl.origin)
        );
      }

      // Fallback
      return NextResponse.redirect(new URL("/signup", requestUrl.origin));
    }
  }

  return NextResponse.redirect(requestUrl.origin);
}

// Manter sua função existente
async function verificarTipoPerfil(
  supabase: any,
  userId: string
): Promise<string | null> {
  const tabelas = [
    { nome: "perfis_pacientes", tipo: "paciente" },
    { nome: "perfis_profissionais", tipo: "profissional" },
    { nome: "perfis_clinicas", tipo: "clinica" },
    { nome: "perfis_empresas", tipo: "empresa" },
  ];

  for (const tabela of tabelas) {
    try {
      const { data, error } = await supabase
        .from(tabela.nome)
        .select("id")
        .eq("id", userId)
        .single();

      if (data && !error) {
        return tabela.tipo;
      }
    } catch (err) {
      continue;
    }
  }

  return null;
}
