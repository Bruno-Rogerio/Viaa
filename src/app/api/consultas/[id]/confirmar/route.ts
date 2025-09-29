// src/app/api/consultas/[id]/confirmar/route.ts
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
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const consultaId = params.id;

    const { data: consulta, error: consultaError } = await supabase
      .from("consultas")
      .select(
        `
        *,
        paciente:perfis_pacientes!consultas_paciente_id_fkey(
          nome,
          sobrenome,
          email,
          telefone
        )
      `
      )
      .eq("id", consultaId)
      .eq("profissional_id", user.id)
      .single();

    if (consultaError || !consulta) {
      return NextResponse.json(
        { error: "Consulta não encontrada" },
        { status: 404 }
      );
    }

    if (consulta.status !== "agendada") {
      return NextResponse.json(
        { error: "Consulta não pode ser confirmada" },
        { status: 400 }
      );
    }

    const { error: updateError } = await supabase
      .from("consultas")
      .update({
        status: "confirmada",
        confirmada_em: new Date().toISOString(),
      })
      .eq("id", consultaId);

    if (updateError) {
      console.error("Erro ao confirmar consulta:", updateError);
      return NextResponse.json(
        { error: "Erro ao confirmar consulta" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Consulta confirmada com sucesso!",
      consulta: {
        ...consulta,
        status: "confirmada",
        confirmada_em: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Erro ao confirmar consulta:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
