// src/app/api/consultas/profissional/[id]/route.ts
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { searchParams } = new URL(request.url);
    const profissionalId = params.id;

    // Filtros
    const status = searchParams.getAll("status");
    const data_inicio = searchParams.get("data_inicio");
    const data_fim = searchParams.get("data_fim");

    let query = supabase
      .from("consultas")
      .select(
        `
        *,
        profissional:perfis_profissionais!consultas_profissional_id_fkey(
          id, nome, sobrenome, foto_perfil_url, especialidades
        ),
        paciente:perfis_pacientes!consultas_paciente_id_fkey(
          id, nome, sobrenome, foto_perfil_url, telefone
        )
      `
      )
      .eq("profissional_id", profissionalId);

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
      return NextResponse.json(
        { error: "Erro ao buscar consultas" },
        { status: 500 }
      );
    }

    // Calcular estatísticas
    const hoje = new Date().toISOString().split("T")[0];
    const consultasHoje =
      consultas?.filter((c) => c.data_inicio.split("T")[0] === hoje).length ||
      0;

    const consultasPendentes =
      consultas?.filter((c) => c.status === "agendada").length || 0;

    return NextResponse.json({
      consultas: consultas || [],
      estatisticas: {
        total_consultas: consultas?.length || 0,
        consultas_hoje: consultasHoje,
        consultas_pendentes_confirmacao: consultasPendentes,
      },
    });
  } catch (error) {
    console.error("Erro ao buscar consultas do profissional:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
