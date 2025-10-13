// src/app/api/consultas/[id]/confirmar/route.ts

import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import {
  TipoLembrete,
  StatusNotificacao,
  CriarLembreteConsulta,
} from "@/types/notificacao";
import {
  criarLembrete,
  processarLembrete,
} from "@/services/lembretes/lembreteService";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const consultaId = params.id;
    const { acao, motivo } = await request.json();

    // Verificar autenticação
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session?.user) {
      return NextResponse.json(
        { error: "Usuário não autenticado" },
        { status: 401 }
      );
    }

    // Obter a consulta para verificar se o profissional é o dono
    const { data: consulta, error: consultaError } = await supabase
      .from("consultas")
      .select("*")
      .eq("id", consultaId)
      .single();

    if (consultaError || !consulta) {
      return NextResponse.json(
        { error: "Consulta não encontrada" },
        { status: 404 }
      );
    }

    // Verificar se o usuário é o profissional da consulta
    if (consulta.profissional_id !== session.user.id) {
      return NextResponse.json(
        { error: "Você não tem permissão para modificar esta consulta" },
        { status: 403 }
      );
    }

    // Atualizar status da consulta
    let novoStatus = "";
    if (acao === "confirmar") {
      novoStatus = "confirmada";
    } else if (acao === "rejeitar") {
      novoStatus = "rejeitada";
    } else {
      return NextResponse.json(
        { error: 'Ação inválida. Use "confirmar" ou "rejeitar"' },
        { status: 400 }
      );
    }

    const { data: consultaAtualizada, error: atualizacaoError } = await supabase
      .from("consultas")
      .update({
        status: novoStatus,
        observacoes: motivo || null,
      })
      .eq("id", consultaId)
      .select()
      .single();

    if (atualizacaoError) throw atualizacaoError;

    // Criar e enviar notificação
    if (novoStatus === "confirmada") {
      // Criar lembrete de confirmação
      const dadosLembrete: CriarLembreteConsulta = {
        consulta_id: consultaId,
        tipo: TipoLembrete.CONFIRMACAO,
        destinatario_id: consulta.paciente_id,
        agendado_para: new Date().toISOString(),
      };

      const lembreteCriado = await criarLembrete(dadosLembrete);

      // Processar o lembrete imediatamente
      if (lembreteCriado) {
        await processarLembrete(lembreteCriado.id);
      }
    } else if (novoStatus === "rejeitada") {
      // Criar lembrete de cancelamento
      const dadosLembrete: CriarLembreteConsulta = {
        consulta_id: consultaId,
        tipo: TipoLembrete.CANCELAMENTO,
        destinatario_id: consulta.paciente_id,
        agendado_para: new Date().toISOString(),
        mensagem: motivo || "A consulta foi rejeitada pelo profissional.",
      };

      const lembreteCriado = await criarLembrete(dadosLembrete);

      // Processar o lembrete imediatamente
      if (lembreteCriado) {
        await processarLembrete(lembreteCriado.id);
      }
    }

    return NextResponse.json({
      message: `Consulta ${novoStatus} com sucesso`,
      consulta: consultaAtualizada,
    });
  } catch (error) {
    console.error(`Erro ao processar ação na consulta:`, error);
    return NextResponse.json(
      { error: "Falha ao processar ação na consulta" },
      { status: 500 }
    );
  }
}
