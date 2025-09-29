// src/app/api/profissionais/[id]/route.ts
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const profissionalId = params.id;

    // Buscar dados do profissional
    const { data: profissional, error } = await supabase
      .from("perfis_profissionais")
      .select(
        `
        id,
        nome,
        sobrenome,
        tipo,
        especialidades,
        bio_profissional,
        foto_perfil_url,
        valor_sessao,
        experiencia_anos,
        abordagem_terapeutica,
        formacao_principal,
        crp,
        conselho_tipo,
        conselho_numero,
        verificado,
        status_verificacao,
        endereco_cidade,
        endereco_estado,
        link_linkedin,
        link_instagram,
        site_pessoal
      `
      )
      .eq("id", profissionalId)
      .eq("verificado", true) // Só mostra profissionais verificados
      .single();

    if (error) {
      console.error("Erro ao buscar profissional:", error);
      return NextResponse.json(
        { error: "Profissional não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(profissional);
  } catch (error) {
    console.error("Erro na API de profissionais:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
