// src/utils/consultas-client.ts
// Funções para criar consultas chamando a API

import { supabase } from "@/lib/supabase/client";

export interface DadosConsulta {
  titulo: string;
  descricao: string;
  data_inicio: string;
  data_fim: string;
  tipo: "online" | "presencial" | "telefone";
  profissional_id: string;
  paciente_id?: string; // Tornando opcional
  valor?: number;
  observacoes?: string;
}

export async function criarConsultaCliente(dados: DadosConsulta) {
  try {
    // Verificar se está autenticado
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error("❌ Erro de autenticação:", authError);
      throw new Error("Usuário não autenticado");
    }

    console.log("🔍 Criando consulta via API para usuário:", user.id);
    console.log("📋 Dados da consulta:", dados);

    // 🚀 CHAMAR A API AO INVÉS DE INSERIR DIRETO NO BANCO
    const response = await fetch("/api/consultas", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dados),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error("❌ Erro na resposta da API:", result);
      throw new Error(result.error || "Erro ao agendar consulta");
    }

    console.log("✅ Consulta criada com sucesso via API:", result.consulta?.id);

    return {
      success: true,
      message: result.message || "Consulta agendada com sucesso!",
      consulta: result.consulta,
    };
  } catch (error: any) {
    console.error("❌ Erro ao criar consulta:", error);
    throw new Error(error.message || "Erro ao agendar consulta");
  }
}

// Função para listar consultas do profissional
export async function listarConsultasProfissional(profissionalId: string) {
  try {
    const { data: consultas, error } = await supabase
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
      .eq("profissional_id", profissionalId)
      .order("data_inicio", { ascending: true });

    if (error) {
      console.error("Erro ao buscar consultas:", error);
      throw error;
    }

    return { consultas: consultas || [] };
  } catch (error) {
    console.error("Erro ao listar consultas:", error);
    throw error;
  }
}

/**
 * Conta o número de consultas 'pendentes' (status = 'agendada') do profissional.
 * @param profissionalId O uuid do profissional.
 * @returns A quantidade (number) de consultas pendentes
 */
export async function contarConsultasPendentesProfissional(
  profissionalId: string
): Promise<number> {
  try {
    const { count, error } = await supabase
      .from("consultas")
      .select("id", { count: "exact", head: true })
      .eq("profissional_id", profissionalId)
      .eq("status", "agendada");

    if (error) {
      console.error("Erro ao buscar consultas pendentes:", error);
      return 0;
    }
    return count ?? 0;
  } catch (error) {
    console.error("Erro crítico ao buscar consultas pendentes:", error);
    return 0;
  }
}
