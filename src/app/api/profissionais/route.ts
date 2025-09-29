// src/app/api/profissionais/route.ts
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { searchParams } = new URL(request.url);

    const tipo = searchParams.get("tipo");
    const especialidade = searchParams.get("especialidade");
    const cidade = searchParams.get("cidade");
    const estado = searchParams.get("estado");
    const busca = searchParams.get("busca");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");

    const offset = (page - 1) * limit;

    // 🔍 QUERY CORRIGIDA - Apenas status_verificacao
    let query = supabase
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
        endereco_cidade,
        endereco_estado,
        crp,
        verificado,
        status_verificacao
      `,
        { count: "exact" }
      )
      .eq("status_verificacao", "aprovado"); // ✅ Apenas esta condição

    // Aplicar filtros
    if (tipo) {
      query = query.eq("tipo", tipo);
    }

    if (especialidade) {
      query = query.ilike("especialidades", `%${especialidade}%`);
    }

    if (cidade) {
      query = query.ilike("endereco_cidade", `%${cidade}%`);
    }

    if (estado) {
      query = query.eq("endereco_estado", estado);
    }

    if (busca) {
      query = query.or(`nome.ilike.%${busca}%,sobrenome.ilike.%${busca}%`);
    }

    query = query.order("nome", { ascending: true });
    query = query.range(offset, offset + limit - 1);

    const { data: profissionais, error, count } = await query;

    if (error) {
      console.error("❌ Erro ao buscar profissionais:", error);
      return NextResponse.json(
        {
          error: "Erro ao buscar profissionais",
          details: error.message,
          profissionais: [],
          paginacao: {
            total: 0,
            pagina_atual: page,
            total_paginas: 0,
            limite_por_pagina: limit,
            tem_proxima: false,
            tem_anterior: false,
          },
        },
        { status: 500 }
      );
    }

    // 📊 Log para debug
    console.log("✅ Profissionais encontrados:", profissionais?.length || 0);
    console.log("📋 Total no DB:", count);

    return NextResponse.json({
      profissionais: profissionais || [],
      paginacao: {
        total: count || 0,
        pagina_atual: page,
        total_paginas: Math.ceil((count || 0) / limit),
        limite_por_pagina: limit,
        tem_proxima: offset + limit < (count || 0),
        tem_anterior: page > 1,
      },
    });
  } catch (error: any) {
    console.error("❌ Erro na API de profissionais:", error);
    return NextResponse.json(
      {
        error: "Erro interno do servidor",
        details: error.message,
        profissionais: [],
        paginacao: {
          total: 0,
          pagina_atual: 1,
          total_paginas: 0,
          limite_por_pagina: 12,
          tem_proxima: false,
          tem_anterior: false,
        },
      },
      { status: 500 }
    );
  }
}
