// src/app/api/profissionais/route.ts
// 🎯 API SIMPLIFICADA PARA DEBUG

import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  console.log("🔍 === INÍCIO DA API DE PROFISSIONAIS ===");

  try {
    // 1. Testar conexão básica
    const supabase = createRouteHandlerClient({ cookies });
    console.log("✅ Cliente Supabase criado");

    // 2. Teste de query SUPER SIMPLES
    console.log("🔍 Tentando buscar profissionais...");
    console.log("Query params:", {
      status_verificacao: "aprovado",
      limit: 10,
    });

    const { data, error, count } = await supabase
      .from("perfis_profissionais")
      .select("id, nome, sobrenome, especialidades, valor_sessao, verificado", {
        count: "exact",
      })
      .eq("status_verificacao", "aprovado")
      .limit(10);

    console.log("📊 Resultado da query:", {
      encontrados: data?.length || 0,
      total: count,
      erro: error?.message || "nenhum",
    });

    if (data && data.length > 0) {
      console.log("✅ Primeiro profissional:", data[0]);
    }

    if (error) {
      console.error("❌ Erro no Supabase:", error);
      return NextResponse.json(
        {
          success: false,
          error: "Erro ao buscar no banco",
          details: error.message,
          code: error.code,
          hint: error.hint,
        },
        { status: 500 }
      );
    }

    console.log(
      `✅ Query executada com sucesso! Encontrados: ${
        data?.length || 0
      } profissionais`
    );

    // Retornar dados simplificados
    const profissionaisSimples = (data || []).map((prof) => ({
      id: prof.id,
      nome: prof.nome,
      sobrenome: prof.sobrenome,
      especialidades: prof.especialidades || "Psicologia",
      valor_sessao: prof.valor_sessao || 150,
      verificado: prof.verificado || false,
      rating: 4.5,
      consultas_realizadas: 10,
      tem_horarios_disponiveis: true,
      experiencia_anos: 5,
      endereco_cidade: "São Paulo",
      endereco_estado: "SP",
      bio_profissional: "Profissional dedicado ao seu bem-estar.",
      foto_perfil_url: null,
    }));

    console.log("✅ Dados formatados com sucesso");

    return NextResponse.json({
      success: true,
      profissionais: profissionaisSimples,
      paginacao: {
        pagina_atual: 1,
        total_paginas: 1,
        total_resultados: profissionaisSimples.length,
        limite: 10,
        tem_proxima: false,
        tem_anterior: false,
      },
      filtros_aplicados: {},
    });
  } catch (error: any) {
    console.error("❌ ERRO CRÍTICO:", error);
    console.error("Stack:", error.stack);

    return NextResponse.json(
      {
        success: false,
        error: "Erro crítico no servidor",
        message: error.message,
        type: error.constructor.name,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
