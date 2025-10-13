// src/app/api/lembretes/enviar/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { criarLembretesAutomaticos } from "@/services/lembretes/lembreteService";

export async function POST(request: NextRequest) {
  try {
    const { consulta_id } = await request.json();

    if (!consulta_id) {
      return NextResponse.json(
        { error: "consulta_id é obrigatório" },
        { status: 400 }
      );
    }

    // Usar service role key para buscar dados sem autenticação
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Buscar consulta completa
    const { data: consulta, error } = await supabase
      .from("consultas")
      .select("*")
      .eq("id", consulta_id)
      .single();

    if (error || !consulta) {
      console.error("❌ Consulta não encontrada:", error);
      return NextResponse.json(
        { error: "Consulta não encontrada" },
        { status: 404 }
      );
    }

    console.log("📧 Enviando lembretes para consulta:", consulta_id);

    // Criar e enviar lembretes
    await criarLembretesAutomaticos(consulta as any);

    console.log("✅ Lembretes enviados com sucesso");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("❌ Erro ao enviar lembretes:", error);
    return NextResponse.json(
      { error: "Erro ao enviar lembretes" },
      { status: 500 }
    );
  }
}
