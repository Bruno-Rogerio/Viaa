// src/app/api/consultas/route.ts
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies, headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Tentar obter sessão de múltiplas formas
    let user = null;

    // 1. Tentar via cookies (padrão)
    const {
      data: { session: cookieSession },
    } = await supabase.auth.getSession();

    if (cookieSession?.user) {
      user = cookieSession.user;
      console.log("✅ Autenticado via cookie:", user.id);
    }

    // 2. Se não funcionou, tentar via Authorization header
    if (!user) {
      const authHeader = request.headers.get("authorization");

      if (authHeader?.startsWith("Bearer ")) {
        const token = authHeader.substring(7);

        // Criar cliente com a chave anon para validar o token
        const supabaseAuth = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        const {
          data: { user: tokenUser },
          error,
        } = await supabaseAuth.auth.getUser(token);

        if (tokenUser && !error) {
          user = tokenUser;
          console.log("✅ Autenticado via Bearer token:", user.id);
        }
      }
    }

    // 3. Se ainda não tem usuário, tentar pegar token dos cookies manualmente
    if (!user) {
      const cookieStore = await cookies();
      const accessToken =
        cookieStore.get("sb-access-token")?.value ||
        cookieStore.get("sb-pfthvckypamprtslfrxx-auth-token")?.value;

      if (accessToken) {
        console.log("🔑 Tentando autenticar com token do cookie");

        const supabaseAuth = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        const {
          data: { user: cookieUser },
          error,
        } = await supabaseAuth.auth.getUser(accessToken);

        if (cookieUser && !error) {
          user = cookieUser;
          console.log("✅ Autenticado via cookie token:", user.id);
        }
      }
    }

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
