// src/app/api/consultas/route.ts
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // 🔧 VERIFICAÇÃO MELHORADA
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    console.log("🔍 Debug sessão:", {
      hasSession: !!session,
      hasUser: !!session?.user,
      userId: session?.user?.id,
      error: sessionError,
    });

    if (sessionError || !session || !session.user) {
      console.error("❌ Erro de autenticação:", sessionError);
      return NextResponse.json(
        {
          error: "Não autenticado",
          details: "Sessão não encontrada. Faça login novamente.",
          debug: {
            hasSession: !!session,
            sessionError: sessionError?.message,
          },
        },
        { status: 401 }
      );
    }

    const user = session.user;
    const body = await request.json();

    console.log("📋 Dados recebidos:", {
      userId: user.id,
      profissional_id: body.profissional_id,
      data_inicio: body.data_inicio,
      tipo: body.tipo,
    });

    const {
      profissional_id,
      data_inicio,
      data_fim,
      tipo,
      titulo,
      descricao,
      observacoes,
    } = body;

    // Validações
    if (!profissional_id || !data_inicio || !data_fim || !tipo) {
      return NextResponse.json(
        { error: "Campos obrigatórios faltando" },
        { status: 400 }
      );
    }

    if (new Date(data_fim) <= new Date(data_inicio)) {
      return NextResponse.json(
        { error: "Data de fim deve ser posterior à data de início" },
        { status: 400 }
      );
    }

    // Buscar perfil do paciente
    const { data: perfilPaciente, error: perfilError } = await supabase
      .from("perfis_pacientes")
      .select("id")
      .eq("user_id", user.id)
      .single();

    console.log("👤 Perfil paciente:", { perfilPaciente, perfilError });

    if (perfilError || !perfilPaciente) {
      return NextResponse.json(
        { error: "Perfil de paciente não encontrado" },
        { status: 404 }
      );
    }

    // Verificar profissional
    const { data: profissional, error: profError } = await supabase
      .from("perfis_profissionais")
      .select(
        "id, nome, sobrenome, valor_sessao, verificado, status_verificacao"
      )
      .eq("id", profissional_id)
      .single();

    console.log("👨‍⚕️ Profissional:", { profissional, profError });

    if (profError || !profissional) {
      return NextResponse.json(
        { error: "Profissional não encontrado" },
        { status: 404 }
      );
    }

    if (profissional.status_verificacao !== "aprovado") {
      return NextResponse.json(
        { error: "Profissional não está aprovado" },
        { status: 400 }
      );
    }

    // Verificar conflitos
    const { data: conflitos } = await supabase
      .from("consultas")
      .select("id")
      .eq("profissional_id", profissional_id)
      .in("status", ["agendada", "confirmada", "em_andamento"])
      .or(`and(data_inicio.lte.${data_fim},data_fim.gte.${data_inicio})`);

    if (conflitos && conflitos.length > 0) {
      return NextResponse.json(
        { error: "Horário não disponível - já existe uma consulta agendada" },
        { status: 409 }
      );
    }

    // Criar consulta
    const { data: novaConsulta, error: createError } = await supabase
      .from("consultas")
      .insert({
        titulo:
          titulo ||
          `Consulta com ${profissional.nome} ${profissional.sobrenome}`,
        descricao: descricao || null,
        data_inicio,
        data_fim,
        status: "agendada",
        tipo,
        profissional_id,
        paciente_id: perfilPaciente.id,
        valor: profissional.valor_sessao || null,
        observacoes: observacoes || null,
        lembretes_enviados: false,
      })
      .select()
      .single();

    console.log("✅ Consulta criada:", { novaConsulta, createError });

    if (createError) {
      console.error("❌ Erro ao criar:", createError);
      return NextResponse.json(
        { error: "Erro ao criar consulta", details: createError.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Solicitação enviada! Aguarde a confirmação do profissional.",
        consulta: novaConsulta,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("❌ Erro geral:", error);
    return NextResponse.json(
      { error: "Erro interno", details: error.message },
      { status: 500 }
    );
  }
}
