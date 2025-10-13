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

    // Obter dados do body
    const body = await request.json();
    const {
      titulo,
      descricao,
      data_inicio,
      data_fim,
      tipo,
      profissional_id,
      observacoes,
    } = body;

    console.log("📋 Dados da consulta:", {
      titulo,
      data_inicio,
      data_fim,
      tipo,
      profissional_id,
      user_id: user.id,
    });

    // Validações básicas
    if (!data_inicio || !data_fim || !tipo || !profissional_id) {
      return NextResponse.json(
        { error: "Dados obrigatórios faltando" },
        { status: 400 }
      );
    }

    // Verificar se data_fim é maior que data_inicio
    if (new Date(data_fim) <= new Date(data_inicio)) {
      return NextResponse.json(
        { error: "Data de término deve ser posterior à data de início" },
        { status: 400 }
      );
    }

    // Obter perfil do paciente
    const { data: perfilPaciente, error: perfilError } = await supabase
      .from("perfis_pacientes")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (perfilError) {
      console.error("❌ Erro ao buscar perfil do paciente:", perfilError);

      // Se não é paciente, pode ser profissional fazendo auto-consulta
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

    // Verificar conflitos de horário - CORRIGIDO
    const { data: consultasExistentes } = await supabase
      .from("consultas")
      .select("id")
      .eq("profissional_id", profissional_id)
      .in("status", ["agendada", "confirmada", "em_andamento"])
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
      console.error("❌ Erro ao criar consulta:", insertError);
      return NextResponse.json(
        { error: "Erro ao agendar consulta" },
        { status: 500 }
      );
    }

    console.log("✅ Consulta criada:", novaConsulta?.id);

    // Criar lembretes automáticos (email imediato + lembretes futuros)
    try {
      const { criarLembretesAutomaticos } = await import(
        "@/services/lembretes/lembreteService"
      );

      await criarLembretesAutomaticos({
        id: novaConsulta.id,
        titulo: novaConsulta.titulo,
        descricao: novaConsulta.descricao,
        data_inicio: novaConsulta.data_inicio,
        data_fim: novaConsulta.data_fim,
        status: novaConsulta.status,
        tipo: novaConsulta.tipo,
        profissional_id: novaConsulta.profissional_id,
        paciente_id: novaConsulta.paciente_id,
        valor: novaConsulta.valor,
        observacoes: novaConsulta.observacoes,
        link_videochamada: novaConsulta.link_videochamada,
        lembretes_enviados: novaConsulta.lembretes_enviados || false,
        created_at: novaConsulta.created_at,
        updated_at: novaConsulta.updated_at,
        profissional: novaConsulta.profissional,
        paciente: novaConsulta.paciente,
      });

      console.log("✅ Lembretes criados com sucesso");
    } catch (lembreteError) {
      console.error("⚠️ Erro ao criar lembretes (não crítico):", lembreteError);
      // Não falha a criação da consulta por causa dos lembretes
    }

    return NextResponse.json({
      success: true,
      message:
        "Consulta agendada com sucesso! Aguarde a confirmação do profissional.",
      consulta: novaConsulta,
    });
  } catch (error) {
    console.error("❌ Erro ao criar consulta:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
