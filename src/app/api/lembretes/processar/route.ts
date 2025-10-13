// src/app/api/lembretes/processar/route.ts

import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/server";
import { StatusNotificacao } from "@/types/notificacao";
import { processarLembrete } from "@/services/lembretes/lembreteService";

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticação via API key
    const apiKey = request.headers.get("x-api-key");
    if (apiKey !== process.env.LEMBRETES_API_KEY) {
      return NextResponse.json(
        { error: "Acesso não autorizado" },
        { status: 401 }
      );
    }

    // Obter lembretes pendentes que estão agendados para agora ou no passado
    const agora = new Date().toISOString();
    const { data: lembretes, error } = await supabase
      .from("lembretes_consulta")
      .select("*")
      .eq("status", StatusNotificacao.PENDENTE)
      .lte("agendado_para", agora)
      .limit(50); // Processar em lotes para evitar timeout

    if (error) throw error;

    if (!lembretes || lembretes.length === 0) {
      return NextResponse.json(
        { message: "Nenhum lembrete pendente para processar" },
        { status: 200 }
      );
    }

    // Processar cada lembrete
    const resultados = await Promise.all(
      lembretes.map(async (lembrete) => {
        const sucesso = await processarLembrete(lembrete.id);
        return {
          id: lembrete.id,
          tipo: lembrete.tipo,
          sucesso,
        };
      })
    );

    return NextResponse.json({
      message: `Processados ${lembretes.length} lembretes`,
      resultados,
    });
  } catch (error) {
    console.error("Erro ao processar lembretes:", error);
    return NextResponse.json(
      { error: "Falha ao processar lembretes" },
      { status: 500 }
    );
  }
}
