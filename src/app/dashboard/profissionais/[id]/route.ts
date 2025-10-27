// src/app/api/profissionais/[id]/route.ts
// ✅ VERSÃO CORRIGIDA - COM user_id

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

    // ✅ CORREÇÃO: Adicionado user_id no select
    const { data: profissional, error } = await supabase
      .from("perfis_profissionais")
      .select(
        `
        id,
        user_id,
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
        site_pessoal,
        rating,
        consultas_realizadas,
        consultas_este_ano
      `
      )
      .eq("id", profissionalId)
      .eq("verificado", true)
      .single();

    if (error) {
      console.error("Erro ao buscar profissional:", error);
      return NextResponse.json(
        { error: "Profissional não encontrado" },
        { status: 404 }
      );
    }

    console.log("✅ Profissional retornado pela API:", profissional);
    console.log("👤 user_id:", profissional.user_id);

    return NextResponse.json(profissional);
  } catch (error) {
    console.error("Erro na API de profissionais:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
