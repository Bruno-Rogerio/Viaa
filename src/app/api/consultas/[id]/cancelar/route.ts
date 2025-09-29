// src/app/api/consultas/[id]/cancelar/route.ts
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

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

    // Buscar perfil (pode ser paciente ou profissional)
    const { data: perfilProfissional } = await supabase
      .from("perfis_profissionais")
      .select("id")
      .eq("user_id", user.id)
      .single();

    const { data: perfilPaciente } = await supabase
      .from("perfis_pacientes")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!perfilProfissional && !perfilPaciente) {
      return NextResponse.json(
        { error: "Perfil não encontrado" },
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

    // Verificar permissão
    const temPermissao =
      (perfilProfissional &&
        consulta.profissional_id === perfilProfissional.id) ||
      (perfilPaciente && consulta.paciente_id === perfilPaciente.id);

    if (!temPermissao) {
      return NextResponse.json(
        { error: "Sem permissão para cancelar esta consulta" },
        { status: 403 }
      );
    }

    // Verificar se pode ser cancelada
    if (!["agendada", "confirmada"].includes(consulta.status)) {
      return NextResponse.json(
        {
          error: `Consulta não pode ser cancelada. Status: ${consulta.status}`,
        },
        { status: 400 }
      );
    }

    // Cancelar
    const { data: consultaAtualizada, error: updateError } = await supabase
      .from("consultas")
      .update({
        status: "cancelada",
        observacoes: motivo ? `Cancelamento: ${motivo}` : consulta.observacoes,
        updated_at: new Date().toISOString(),
      })
      .eq("id", consultaId)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json(
        { error: "Erro ao cancelar consulta" },
        { status: 500 }
      );
    }

    // TODO: Notificar a outra parte

    return NextResponse.json({
      success: true,
      message: "Consulta cancelada",
      consulta: consultaAtualizada,
    });
  } catch (error) {
    console.error("Erro ao cancelar consulta:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
