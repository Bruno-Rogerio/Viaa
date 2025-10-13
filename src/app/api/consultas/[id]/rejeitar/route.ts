// src/app/api/consultas/[id]/rejeitar/route.ts
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { TipoLembrete, CriarLembreteConsulta } from "@/types/notificacao";
import {
  criarLembrete,
  processarLembrete,
} from "@/services/lembretes/lembreteService";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const body = await request.json();
    const { motivo } = body;
    const consultaId = params.id;

    // Buscar perfil profissional
    const { data: perfil } = await supabase
      .from("perfis_profissionais")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!perfil) {
      return NextResponse.json(
        { error: "Perfil profissional não encontrado" },
        { status: 404 }
      );
    }

    // Buscar consulta
    const { data: consulta } = await supabase
      .from("consultas")
      .select("*, profissional_id, paciente_id, status")
      .eq("id", consultaId)
      .single();

    if (!consulta) {
      return NextResponse.json(
        { error: "Consulta não encontrada" },
        { status: 404 }
      );
    }

    if (consulta.profissional_id !== perfil.id) {
      return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
    }

    if (consulta.status !== "agendada") {
      return NextResponse.json(
        {
          error: `Consulta não pode ser rejeitada. Status: ${consulta.status}`,
        },
        { status: 400 }
      );
    }

    // Atualizar para rejeitada
    const { data: consultaAtualizada, error: updateError } = await supabase
      .from("consultas")
      .update({
        status: "rejeitada",
        observacoes: motivo || consulta.observacoes,
        updated_at: new Date().toISOString(),
      })
      .eq("id", consultaId)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json(
        { error: "Erro ao rejeitar consulta" },
        { status: 500 }
      );
    }

    // Notificar paciente
    try {
      const dadosLembrete: CriarLembreteConsulta = {
        consulta_id: consultaId,
        tipo: TipoLembrete.CANCELAMENTO,
        destinatario_id: consulta.paciente_id,
        agendado_para: new Date().toISOString(),
        mensagem: motivo || "A consulta foi rejeitada pelo profissional.",
      };

      const lembreteCriado = await criarLembrete(dadosLembrete);

      if (lembreteCriado) {
        await processarLembrete(lembreteCriado.id);
      }
    } catch (notificacaoError) {
      console.error(
        "Erro ao enviar notificação de rejeição:",
        notificacaoError
      );
      // Não falha a rejeição por causa da notificação
    }

    return NextResponse.json({
      success: true,
      message: "Consulta rejeitada",
      consulta: consultaAtualizada,
    });
  } catch (error) {
    console.error("Erro ao rejeitar consulta:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
