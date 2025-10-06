// src/app/api/consultas/route.ts
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // 🔧 PRIMEIRO: Tentar obter sessão via cookie (padrão)
    let session = null;
    let user = null;

    const {
      data: { session: cookieSession },
      error: sessionError,
    } = await supabase.auth.getSession();

    console.log("🔍 Debug sessão (cookie):", {
      hasSession: !!cookieSession,
      hasUser: !!cookieSession?.user,
      userId: cookieSession?.user?.id,
      error: sessionError,
    });

    // Se não tem sessão via cookie, tentar via Bearer token
    if (!cookieSession) {
      const authHeader = request.headers.get("authorization");
      console.log("🔑 Tentando autenticação via Bearer token:", !!authHeader);

      if (authHeader?.startsWith("Bearer ")) {
        const token = authHeader.substring(7);

        // Verificar o token com Supabase
        const {
          data: { user: tokenUser },
          error: tokenError,
        } = await supabase.auth.getUser(token);

        if (tokenUser && !tokenError) {
          console.log("✅ Usuário autenticado via Bearer token:", tokenUser.id);
          user = tokenUser;
        } else {
          console.error("❌ Erro ao validar Bearer token:", tokenError);
        }
      }
    } else {
      user = cookieSession.user;
    }

    // Se ainda não tem usuário, retornar erro
    if (!user) {
      console.error("❌ Nenhuma forma de autenticação funcionou");
      return NextResponse.json(
        {
          error: "Não autenticado",
          details: "Sessão não encontrada. Faça login novamente.",
        },
        { status: 401 }
      );
    }

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
      // Tentar buscar se é um profissional agendando
      const { data: perfilProfissional } = await supabase
        .from("perfis_profissionais")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (!perfilProfissional) {
        return NextResponse.json(
          { error: "Perfil não encontrado. Complete seu cadastro." },
          { status: 404 }
        );
      }

      // Se é um profissional, usar o ID dele como paciente (auto-consulta)
      // ou implementar lógica específica
    }

    const pacienteId = perfilPaciente?.id;

    if (!pacienteId) {
      return NextResponse.json(
        { error: "ID do paciente não encontrado" },
        { status: 400 }
      );
    }

    // Verificar conflitos de horário
    const { data: consultasExistentes } = await supabase
      .from("consultas")
      .select("id")
      .eq("profissional_id", profissional_id)
      .not("status", "in", "(cancelada,rejeitada)")
      .or(`and(data_inicio.lt.${data_fim},data_fim.gt.${data_inicio})`);

    if (consultasExistentes && consultasExistentes.length > 0) {
      return NextResponse.json(
        { error: "Já existe uma consulta agendada neste horário" },
        { status: 409 }
      );
    }

    // Criar consulta
    const { data: novaConsulta, error: insertError } = await supabase
      .from("consultas")
      .insert([
        {
          titulo: titulo || "Consulta",
          descricao,
          data_inicio,
          data_fim,
          status: "agendada",
          tipo,
          profissional_id,
          paciente_id: pacienteId,
          observacoes,
        },
      ])
      .select(
        `
        *,
        profissional:perfis_profissionais!consultas_profissional_id_fkey(
          id, nome, sobrenome, foto_perfil_url
        ),
        paciente:perfis_pacientes!consultas_paciente_id_fkey(
          id, nome, sobrenome, foto_perfil_url
        )
      `
      )
      .single();

    if (insertError) {
      console.error("Erro ao criar consulta:", insertError);
      return NextResponse.json(
        { error: "Erro ao agendar consulta" },
        { status: 500 }
      );
    }

    console.log("✅ Consulta criada:", novaConsulta?.id);

    // TODO: Enviar notificação para o profissional
    // TODO: Criar lembretes automáticos

    return NextResponse.json({
      success: true,
      message:
        "Consulta agendada com sucesso! Aguarde a confirmação do profissional.",
      consulta: novaConsulta,
    });
  } catch (error) {
    console.error("Erro ao criar consulta:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
