// src/app/api/consultas/profissional/[id]/slots/route.ts
// Endpoint para buscar slots disponíveis de um profissional em uma data

import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import {
  gerarSlotsDisponiveis,
  REGRAS_AGENDAMENTO,
} from "@/utils/agendamento/validacoes";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { searchParams } = new URL(request.url);
    const profissionalId = params.id;
    const dataParam = searchParams.get("data");

    if (!dataParam) {
      return NextResponse.json(
        { error: "Data é obrigatória" },
        { status: 400 }
      );
    }

    const data = new Date(dataParam);
    if (isNaN(data.getTime())) {
      return NextResponse.json({ error: "Data inválida" }, { status: 400 });
    }

    // Buscar horários disponíveis do profissional
    const { data: horariosDisponiveis, error: errorHorarios } = await supabase
      .from("horarios_disponiveis")
      .select("*")
      .eq("profissional_id", profissionalId)
      .eq("ativo", true);

    if (errorHorarios) {
      console.error("Erro ao buscar horários:", errorHorarios);
      return NextResponse.json(
        { error: "Erro ao buscar horários disponíveis" },
        { status: 500 }
      );
    }

    // Buscar consultas do dia (não canceladas/rejeitadas)
    const inicioDia = new Date(data);
    inicioDia.setHours(0, 0, 0, 0);

    const fimDia = new Date(data);
    fimDia.setHours(23, 59, 59, 999);

    const { data: consultas, error: errorConsultas } = await supabase
      .from("consultas")
      .select("*")
      .eq("profissional_id", profissionalId)
      .gte("data_inicio", inicioDia.toISOString())
      .lte("data_inicio", fimDia.toISOString())
      .not("status", "in", "(cancelada,rejeitada)");

    if (errorConsultas) {
      console.error("Erro ao buscar consultas:", errorConsultas);
      return NextResponse.json(
        { error: "Erro ao buscar consultas existentes" },
        { status: 500 }
      );
    }

    // Buscar bloqueios do profissional para a data
    const { data: bloqueios, error: errorBloqueios } = await supabase
      .from("bloqueios_horario")
      .select("*")
      .eq("profissional_id", profissionalId)
      .lte("data_inicio", fimDia.toISOString())
      .gte("data_fim", inicioDia.toISOString());

    if (errorBloqueios) {
      console.error("Erro ao buscar bloqueios:", errorBloqueios);
    }

    // Gerar slots disponíveis
    const slots = gerarSlotsDisponiveis(
      data,
      horariosDisponiveis || [],
      consultas || [],
      REGRAS_AGENDAMENTO.duracaoConsultaPadrao
    );

    // Filtrar slots que estão em horários bloqueados
    const slotsFiltrados = bloqueios
      ? slots.filter((slot) => {
          const slotTime = slot.getTime();
          return !bloqueios.some((bloqueio) => {
            const bloqueioInicio = new Date(bloqueio.data_inicio).getTime();
            const bloqueioFim = new Date(bloqueio.data_fim).getTime();
            return slotTime >= bloqueioInicio && slotTime < bloqueioFim;
          });
        })
      : slots;

    // Formatar resposta
    const slotsFormatados = slotsFiltrados.map((slot) => ({
      horario: slot.toISOString(),
      hora: slot.toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      disponivel: true,
    }));

    return NextResponse.json({
      data: data.toISOString(),
      slots: slotsFormatados,
      total: slotsFormatados.length,
      configuracao: {
        duracaoConsulta: REGRAS_AGENDAMENTO.duracaoConsultaPadrao,
        intervaloEntreConsultas: REGRAS_AGENDAMENTO.intervaloEntreConsultas,
      },
    });
  } catch (error) {
    console.error("Erro ao buscar slots:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
