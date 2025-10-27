// src/app/api/profissionais/route.ts
// ✅ VERSÃO CORRIGIDA COMPLETA

import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

// Interface simplificada para o profissional
interface Profissional {
  id: string;
  user_id?: string;
  nome: string;
  sobrenome: string;
  tipo?: string;
  especialidades?: string;
  bio_profissional?: string;
  foto_perfil_url?: string;
  valor_sessao?: number;
  experiencia_anos?: number;
  endereco_cidade?: string;
  endereco_estado?: string;
  crp?: string;
  verificado?: boolean;
}

export async function GET(request: NextRequest) {
  try {
    // Parâmetros de busca e filtros
    const searchParams = request.nextUrl.searchParams;
    const busca = searchParams.get("busca");
    const tipo = searchParams.get("tipo");
    const especialidade = searchParams.get("especialidade");
    const cidade = searchParams.get("cidade");
    const estado = searchParams.get("estado");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const sort = searchParams.get("sort") || "relevancia"; // relevancia, recentes, seguidores

    if (page < 1) {
      return NextResponse.json(
        { error: "Página inválida", profissionais: [], paginacao: {} },
        { status: 400 }
      );
    }

    const offset = (page - 1) * limit;

    const supabase = createRouteHandlerClient({ cookies });

    // Consulta base
    let query = supabase
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
        endereco_cidade,
        endereco_estado,
        crp,
        verificado
      `,
        { count: "exact" }
      )
      .eq("verificado", true); // Só mostrar verificados

    // Aplicar filtros se fornecidos
    if (busca && busca.trim() !== "") {
      const termoBusca = `%${busca.trim().toLowerCase()}%`;
      query = query.or(
        `nome.ilike.${termoBusca},sobrenome.ilike.${termoBusca},especialidades.ilike.${termoBusca},bio_profissional.ilike.${termoBusca}`
      );
    }

    if (tipo && tipo !== "") {
      query = query.eq("tipo", tipo);
    }

    if (especialidade && especialidade !== "") {
      query = query.ilike("especialidades", `%${especialidade}%`);
    }

    if (cidade && cidade !== "") {
      query = query.ilike("endereco_cidade", `%${cidade}%`);
    }

    if (estado && estado !== "") {
      query = query.eq("endereco_estado", estado);
    }

    // Ordenação
    if (sort === "recentes") {
      query = query.order("created_at", { ascending: false });
    } else if (sort === "seguidores") {
      // Isso seria ideal implementar posteriormente com uma contagem real
      query = query.order("id", { ascending: false });
    } else {
      // Padrão "relevancia" - implementar com algoritmo posteriormente
      query = query.order("id", { ascending: false });
    }

    // Paginação
    query = query.range(offset, offset + limit - 1);

    // Executar consulta
    const { data: profissionaisData, error, count } = await query;

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

    // ✅ CORREÇÃO: Tratar o resultado como um array de Profissional
    const profissionais = (profissionaisData as Profissional[]) || [];

    // Garantir que todos têm user_id
    const profissionaisCorrigidos = profissionais.map((prof) => {
      // Se não tem user_id, usar o id como fallback
      if (!prof.user_id) {
        console.warn(`⚠️ Profissional ${prof.id} sem user_id, usando fallback`);
        return {
          ...prof,
          user_id: prof.id, // Usar o próprio ID como user_id temporário
        };
      }
      return prof;
    });

    // Log para debug
    console.log(
      "✅ Profissionais encontrados:",
      profissionaisCorrigidos.length || 0
    );
    console.log("📋 Total no DB:", count);

    return NextResponse.json({
      profissionais: profissionaisCorrigidos,
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
