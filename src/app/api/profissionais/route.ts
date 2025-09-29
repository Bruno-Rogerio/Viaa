// src/app/api/profissionais/route.ts
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { searchParams } = new URL(request.url);

    // 📋 PARÂMETROS DE FILTRO
    const tipo = searchParams.get("tipo"); // psicologo, psicanalista, etc
    const especialidade = searchParams.get("especialidade");
    const cidade = searchParams.get("cidade");
    const estado = searchParams.get("estado");
    const busca = searchParams.get("busca"); // busca por nome
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");

    // Calcular offset para paginação
    const offset = (page - 1) * limit;

    // 🔍 CONSTRUIR QUERY COM FILTROS
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
        verificado
      `,
        { count: "exact" }
      )
      .eq("verificado", true) // Apenas profissionais verificados
      .eq("status_verificacao", "aprovado"); // Status aprovado

    // Aplicar filtros condicionalmente
    if (tipo) {
      query = query.eq("tipo", tipo);
    }

    if (especialidade) {
      // Busca parcial em especialidades (campo de texto)
      query = query.ilike("especialidades", `%${especialidade}%`);
    }

    if (cidade) {
      query = query.ilike("endereco_cidade", `%${cidade}%`);
    }

    if (estado) {
      query = query.eq("endereco_estado", estado);
    }

    if (busca) {
      // Busca por nome ou sobrenome
      query = query.or(`nome.ilike.%${busca}%,sobrenome.ilike.%${busca}%`);
    }

    // Ordenar por nome
    query = query.order("nome", { ascending: true });

    // Aplicar paginação
    query = query.range(offset, offset + limit - 1);

    const { data: profissionais, error, count } = await query;

    if (error) {
      console.error("Erro ao buscar profissionais:", error);
      return NextResponse.json(
        { error: "Erro ao buscar profissionais" },
        { status: 500 }
      );
    }

    // 📊 RETORNAR COM METADADOS DE PAGINAÇÃO
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
  } catch (error) {
    console.error("Erro na API de profissionais:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
