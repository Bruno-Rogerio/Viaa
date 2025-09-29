// src/app/api/consultas/route.ts
// 🎯 API PRINCIPAL PARA CONSULTAS - CRUD Completo

import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

// GET /api/consultas - Listar consultas do usuário
export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const tipoUsuario = searchParams.get("tipo") || "auto-detect";
    const dataInicio = searchParams.get("data_inicio");
    const dataFim = searchParams.get("data_fim");
    const status = searchParams.getAll("status");

    // Detectar tipo de usuário se não especificado
    let consultasQuery;
    if (tipoUsuario === "profissional") {
      // Profissional vê suas consultas
      consultasQuery = supabase
        .from("consultas")
        .select(
          `
          *,
          paciente:perfis_pacientes!consultas_paciente_id_fkey(
            id,
            user_id,
            nome,
            sobrenome,
            telefone,
            email
          )
        `
        )
        .eq("profissional_id", user.id);
    } else {
      // Paciente vê suas consultas
      consultasQuery = supabase
        .from("consultas")
        .select(
          `
          *,
          profissional:perfis_profissionais!consultas_profissional_id_fkey(
            id,
            user_id,
            nome,
            sobrenome,
            especialidades,
            foto_perfil_url,
            valor_sessao,
            verificado
          )
        `
        )
        .eq("paciente_id", user.id);
    }

    // Aplicar filtros
    if (dataInicio) {
      consultasQuery = consultasQuery.gte("data_inicio", dataInicio);
    }
    if (dataFim) {
      consultasQuery = consultasQuery.lte("data_inicio", dataFim);
    }
    if (status.length > 0) {
      consultasQuery = consultasQuery.in("status", status);
    }

    // Ordenar por data
    consultasQuery = consultasQuery.order("data_inicio", { ascending: true });

    const { data: consultas, error } = await consultasQuery;

    if (error) {
      console.error("Erro ao buscar consultas:", error);
      return NextResponse.json({ error: "Erro interno" }, { status: 500 });
    }

    // Calcular estatísticas básicas
    const hoje = new Date();
    const estatisticas = {
      total_consultas: consultas?.length || 0,
      consultas_hoje:
        consultas?.filter((c) => {
          const dataConsulta = new Date(c.data_inicio);
          return dataConsulta.toDateString() === hoje.toDateString();
        }).length || 0,
      consultas_pendentes:
        consultas?.filter((c) => c.status === "agendada").length || 0,
      proxima_consulta:
        consultas?.find((c) => new Date(c.data_inicio) > hoje) || null,
    };

    return NextResponse.json({
      success: true,
      consultas,
      estatisticas,
    });
  } catch (error) {
    console.error("Erro na API de consultas:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

// POST /api/consultas - Criar nova consulta (agendamento)
export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const {
      profissional_id,
      data_inicio,
      duracao_minutos = 50,
      tipo = "online",
      observacoes_paciente,
    } = body;

    // Validações básicas
    if (!profissional_id || !data_inicio) {
      return NextResponse.json(
        { error: "Campos obrigatórios faltando" },
        { status: 400 }
      );
    }

    // Verificar se o profissional existe e está ativo
    const { data: profissional, error: profError } = await supabase
      .from("perfis_profissionais")
      .select("id, valor_sessao, status_verificacao")
      .eq("id", profissional_id)
      .single();

    if (profError || !profissional) {
      return NextResponse.json(
        { error: "Profissional não encontrado" },
        { status: 404 }
      );
    }

    if (profissional.status_verificacao !== "aprovado") {
      return NextResponse.json(
        { error: "Profissional não disponível" },
        { status: 400 }
      );
    }

    // Verificar disponibilidade do horário
    const dataFim = new Date(data_inicio);
    dataFim.setMinutes(dataFim.getMinutes() + duracao_minutos);

    const { data: conflitos } = await supabase
      .from("consultas")
      .select("id")
      .eq("profissional_id", profissional_id)
      .gte("data_inicio", data_inicio)
      .lt("data_inicio", dataFim.toISOString())
      .in("status", ["agendada", "confirmada", "em_andamento"]);

    if (conflitos && conflitos.length > 0) {
      return NextResponse.json(
        { error: "Horário não disponível" },
        { status: 409 }
      );
    }

    // Criar a consulta
    const { data: novaConsulta, error: createError } = await supabase
      .from("consultas")
      .insert({
        profissional_id,
        paciente_id: user.id,
        data_inicio,
        data_fim: dataFim.toISOString(),
        duracao_minutos,
        tipo,
        status: "agendada",
        valor: profissional.valor_sessao,
        observacoes_paciente,
      })
      .select(
        `
        *,
        profissional:perfis_profissionais!consultas_profissional_id_fkey(
          nome,
          sobrenome,
          especialidades
        )
      `
      )
      .single();

    if (createError) {
      console.error("Erro ao criar consulta:", createError);
      return NextResponse.json(
        { error: "Erro ao agendar consulta" },
        { status: 500 }
      );
    }

    // TODO: Enviar notificação para o profissional
    // TODO: Criar lembrete automático

    return NextResponse.json(
      {
        success: true,
        message: "Consulta agendada com sucesso!",
        consulta: novaConsulta,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erro ao criar consulta:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
