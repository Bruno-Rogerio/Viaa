// src/app/api/consultas/route.ts
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Verificar autenticação
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const body = await request.json();
    const {
      profissional_id,
      data_inicio,
      data_fim,
      tipo,
      titulo,
      descricao,
      observacoes,
    } = body;

    // Validações básicas
    if (!profissional_id || !data_inicio || !data_fim || !tipo) {
      return NextResponse.json(
        { error: "Campos obrigatórios faltando" },
        { status: 400 }
      );
    }

    // Verificar se data_fim > data_inicio
    if (new Date(data_fim) <= new Date(data_inicio)) {
      return NextResponse.json(
        { error: "Data de fim deve ser posterior à data de início" },
        { status: 400 }
      );
    }

    // Buscar ID do perfil do paciente
    const { data: perfilPaciente, error: perfilError } = await supabase
      .from("perfis_pacientes")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (perfilError || !perfilPaciente) {
      return NextResponse.json(
        { error: "Perfil de paciente não encontrado" },
        { status: 404 }
      );
    }

    // Verificar se profissional existe e está verificado
    const { data: profissional, error: profError } = await supabase
      .from("perfis_profissionais")
      .select("id, nome, sobrenome, valor_sessao, verificado")
      .eq("id", profissional_id)
      .single();

    if (profError || !profissional) {
      return NextResponse.json(
        { error: "Profissional não encontrado" },
        { status: 404 }
      );
    }

    if (!profissional.verificado) {
      return NextResponse.json(
        { error: "Profissional não está verificado" },
        { status: 400 }
      );
    }

    // Verificar conflitos de horário (profissional)
    const { data: conflitos, error: conflitoError } = await supabase
      .from("consultas")
      .select("id")
      .eq("profissional_id", profissional_id)
      .in("status", ["agendada", "confirmada", "em_andamento"])
      .or(`data_inicio.lte.${data_fim},data_fim.gte.${data_inicio}`);

    if (conflitoError) {
      console.error("Erro ao verificar conflitos:", conflitoError);
    }

    if (conflitos && conflitos.length > 0) {
      return NextResponse.json(
        { error: "Horário não disponível - já existe uma consulta agendada" },
        { status: 409 }
      );
    }

    // Criar a consulta com status "agendada" (aguardando confirmação do profissional)
    const { data: novaConsulta, error: createError } = await supabase
      .from("consultas")
      .insert({
        titulo:
          titulo ||
          `Consulta com ${profissional.nome} ${profissional.sobrenome}`,
        descricao: descricao || null,
        data_inicio,
        data_fim,
        status: "agendada", // Aguardando confirmação do profissional
        tipo,
        profissional_id,
        paciente_id: perfilPaciente.id,
        valor: profissional.valor_sessao || null,
        observacoes: observacoes || null,
        lembretes_enviados: false,
      })
      .select(
        `
        *,
        profissional:perfis_profissionais!consultas_profissional_id_fkey(
          id, nome, sobrenome, foto_perfil_url, especialidades, crp, verificado
        ),
        paciente:perfis_pacientes!consultas_paciente_id_fkey(
          id, nome, sobrenome, foto_perfil_url, telefone, email:user_id
        )
      `
      )
      .single();

    if (createError) {
      console.error("Erro ao criar consulta:", createError);
      return NextResponse.json(
        { error: "Erro ao criar consulta" },
        { status: 500 }
      );
    }

    // TODO: Enviar notificação para o profissional
    // TODO: Criar lembretes automáticos

    return NextResponse.json(
      {
        success: true,
        message:
          "Solicitação de consulta enviada com sucesso! Aguarde a confirmação do profissional.",
        consulta: novaConsulta,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erro na API de consultas:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// GET para buscar consultas (usado pelo hook useAgenda)
export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { searchParams } = new URL(request.url);

    // Verificar autenticação
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    // Parâmetros de filtro
    const tipo_usuario = searchParams.get("tipo_usuario"); // profissional ou paciente
    const status = searchParams.getAll("status");
    const data_inicio = searchParams.get("data_inicio");
    const data_fim = searchParams.get("data_fim");

    // Buscar perfil do usuário
    let query = supabase.from("consultas").select(`
        *,
        profissional:perfis_profissionais!consultas_profissional_id_fkey(
          id, nome, sobrenome, foto_perfil_url, especialidades, crp, verificado
        ),
        paciente:perfis_pacientes!consultas_paciente_id_fkey(
          id, nome, sobrenome, foto_perfil_url, telefone
        )
      `);

    // Filtrar por tipo de usuário
    if (tipo_usuario === "profissional") {
      // Buscar perfil profissional
      const { data: perfil } = await supabase
        .from("perfis_profissionais")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (perfil) {
        query = query.eq("profissional_id", perfil.id);
      }
    } else if (tipo_usuario === "paciente") {
      // Buscar perfil paciente
      const { data: perfil } = await supabase
        .from("perfis_pacientes")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (perfil) {
        query = query.eq("paciente_id", perfil.id);
      }
    }

    // Aplicar filtros
    if (status.length > 0) {
      query = query.in("status", status);
    }

    if (data_inicio) {
      query = query.gte("data_inicio", data_inicio);
    }

    if (data_fim) {
      query = query.lte("data_inicio", data_fim);
    }

    query = query.order("data_inicio", { ascending: true });

    const { data: consultas, error } = await query;

    if (error) {
      console.error("Erro ao buscar consultas:", error);
      return NextResponse.json(
        { error: "Erro ao buscar consultas" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      consultas: consultas || [],
      total: consultas?.length || 0,
    });
  } catch (error) {
    console.error("Erro na API de consultas GET:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
