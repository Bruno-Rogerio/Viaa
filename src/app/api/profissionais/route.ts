// src/app/api/profissionais/route.ts
// 🎯 API PARA LISTAR PROFISSIONAIS DISPONÍVEIS

import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { searchParams } = new URL(request.url);

    console.log(
      "🔍 API /profissionais chamada com params:",
      Object.fromEntries(searchParams)
    );

    // Parâmetros de busca e filtros
    const busca = searchParams.get("busca");
    const especialidade = searchParams.get("especialidade");
    const tipo = searchParams.get("tipo");
    const valorMin = searchParams.get("valor_min");
    const valorMax = searchParams.get("valor_max");
    const ordenacao = searchParams.get("ordenacao") || "rating";
    const limite = parseInt(searchParams.get("limite") || "20");
    const pagina = parseInt(searchParams.get("pagina") || "1");

    // Query base - apenas profissionais aprovados e ativos
    let query = supabase
      .from("perfis_profissionais")
      .select(
        `
        id,
        user_id,
        nome,
        sobrenome,
        especialidades,
        bio_profissional,
        foto_perfil_url,
        valor_sessao,
        experiencia_anos,
        tipo,
        crp,
        verificado,
        endereco_cidade,
        endereco_estado,
        formacao_principal,
        abordagem_terapeutica,
        created_at
      `,
        { count: "exact" }
      )
      .eq("status_verificacao", "aprovado")
      .eq("ativo", true);

    // Aplicar filtros
    if (busca) {
      query = query.or(
        `nome.ilike.%${busca}%,sobrenome.ilike.%${busca}%,especialidades.ilike.%${busca}%,bio_profissional.ilike.%${busca}%`
      );
    }

    if (especialidade) {
      query = query.ilike("especialidades", `%${especialidade}%`);
    }

    if (tipo) {
      query = query.eq("tipo", tipo);
    }

    if (valorMin) {
      query = query.gte("valor_sessao", parseInt(valorMin));
    }

    if (valorMax) {
      query = query.lte("valor_sessao", parseInt(valorMax));
    }

    // Aplicar ordenação
    switch (ordenacao) {
      case "valor_asc":
        query = query.order("valor_sessao", { ascending: true });
        break;
      case "valor_desc":
        query = query.order("valor_sessao", { ascending: false });
        break;
      case "nome":
        query = query.order("nome", { ascending: true });
        break;
      case "experiencia":
        query = query.order("experiencia_anos", { ascending: false });
        break;
      case "recente":
        query = query.order("created_at", { ascending: false });
        break;
      default:
        query = query
          .order("verificado", { ascending: false })
          .order("experiencia_anos", { ascending: false });
    }

    // Paginação
    const inicio = (pagina - 1) * limite;
    const fim = inicio + limite - 1;
    query = query.range(inicio, fim);

    const { data: profissionais, error, count } = await query;

    if (error) {
      console.error("❌ Erro ao buscar profissionais:", error);
      return NextResponse.json(
        {
          error: "Erro ao buscar profissionais",
          details: error.message,
        },
        { status: 500 }
      );
    }

    console.log(`✅ Encontrados ${profissionais?.length || 0} profissionais`);

    // Calcular estatísticas básicas para cada profissional
    const profissionaisComEstatisticas = await Promise.all(
      (profissionais || []).map(async (prof) => {
        // Buscar número de consultas realizadas
        const { count: consultasRealizadas } = await supabase
          .from("consultas")
          .select("*", { count: "exact", head: true })
          .eq("profissional_id", prof.id)
          .eq("status", "concluida");

        // Verificar se tem horários disponíveis (com fallback)
        let temHorariosDisponiveis = false;
        try {
          const { data: horarios, error: horariosError } = await supabase
            .from("horarios_disponiveis")
            .select("id")
            .eq("profissional_id", prof.id)
            .eq("ativo", true)
            .limit(1);

          if (!horariosError && horarios) {
            temHorariosDisponiveis = horarios.length > 0;
          }
        } catch (e) {
          // Se tabela não existir, assume false
          temHorariosDisponiveis = false;
        }

        // Calcular rating simulado
        const ratingBase = prof.verificado ? 4.5 : 4.0;
        const bonusConsultas = Math.min((consultasRealizadas || 0) * 0.1, 0.5);
        const rating = Math.min(ratingBase + bonusConsultas, 5.0);

        return {
          ...prof,
          consultas_realizadas: consultasRealizadas || 0,
          rating: parseFloat(rating.toFixed(1)),
          tem_horarios_disponiveis: temHorariosDisponiveis,
        };
      })
    );

    // Metadados da paginação
    const totalPaginas = Math.ceil((count || 0) / limite);
    const temProximaPagina = pagina < totalPaginas;
    const temPaginaAnterior = pagina > 1;

    return NextResponse.json({
      success: true,
      profissionais: profissionaisComEstatisticas,
      paginacao: {
        pagina_atual: pagina,
        total_paginas: totalPaginas,
        total_resultados: count || 0,
        limite,
        tem_proxima: temProximaPagina,
        tem_anterior: temPaginaAnterior,
      },
      filtros_aplicados: {
        busca,
        especialidade,
        tipo,
        valor_min: valorMin,
        valor_max: valorMax,
        ordenacao,
      },
    });
  } catch (error: any) {
    console.error("❌ Erro crítico na API de profissionais:", error);
    return NextResponse.json(
      {
        error: "Erro interno do servidor",
        message: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
