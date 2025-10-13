// src/utils/consultas-client.ts
// Funções para criar consultas diretamente do cliente usando Supabase

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

    console.log("🔍 Criando consulta para usuário:", user.id);
    console.log("📋 Dados recebidos:", dados);

    // Buscar perfil do paciente
    const { data: perfilPaciente, error: perfilError } = await supabase
      .from("perfis_pacientes")
      .select("id")
      .eq("user_id", user.id)
      .single();

    console.log("👤 Resultado busca perfil paciente:", {
      perfilPaciente,
      perfilError,
    });

    // Se não encontrou perfil de paciente e não foi passado paciente_id
    if (!perfilPaciente && !dados.paciente_id) {
      // Tentar buscar perfil de profissional (caso seja um profissional marcando)
      const { data: perfilProfissional, error: profError } = await supabase
        .from("perfis_profissionais")
        .select("id")
        .eq("user_id", user.id)
        .single();

      console.log("👨‍⚕️ Resultado busca perfil profissional:", {
        perfilProfissional,
        profError,
      });

      if (!perfilProfissional) {
        throw new Error("Perfil não encontrado. Complete seu cadastro.");
      }

      // Se for profissional marcando para si mesmo, criar um perfil de paciente temporário
      // ou usar uma lógica diferente conforme regra de negócio
      console.warn(
        "⚠️ Profissional tentando marcar consulta sem perfil de paciente"
      );
    }

    const pacienteId = dados.paciente_id || perfilPaciente?.id;

    if (!pacienteId) {
      console.error("❌ ID do paciente não encontrado");
      console.log("Debug - dados:", dados);
      console.log("Debug - perfilPaciente:", perfilPaciente);
      throw new Error("ID do paciente não encontrado");
    }

    console.log("✅ Paciente ID encontrado:", pacienteId);

    // Verificar conflitos de horário
    const { data: consultasExistentes, error: conflitosError } = await supabase
      .from("consultas")
      .select("id")
      .eq("profissional_id", dados.profissional_id)
      .not("status", "in", "(cancelada,rejeitada)")
      .gte("data_fim", dados.data_inicio)
      .lte("data_inicio", dados.data_fim);

    if (conflitosError) {
      console.error("Erro ao verificar conflitos:", conflitosError);
    }

    if (consultasExistentes && consultasExistentes.length > 0) {
      throw new Error("Já existe uma consulta agendada neste horário");
    }

    // Criar consulta
    const { data: novaConsulta, error: insertError } = await supabase
      .from("consultas")
      .insert([
        {
          titulo: dados.titulo || "Consulta",
          descricao: dados.descricao,
          data_inicio: dados.data_inicio,
          data_fim: dados.data_fim,
          status: "agendada",
          tipo: dados.tipo,
          profissional_id: dados.profissional_id,
          paciente_id: pacienteId,
          observacoes: dados.observacoes,
          valor: dados.valor,
        },
      ])
      .select()
      .single();

    if (insertError) {
      console.error("Erro ao criar consulta:", insertError);
      throw new Error("Erro ao agendar consulta. Tente novamente.");
    }

    console.log("✅ Consulta criada com sucesso:", novaConsulta.id);

    return {
      success: true,
      message:
        "Consulta agendada com sucesso! Aguarde a confirmação do profissional.",
      consulta: novaConsulta,
    };
  } catch (error: any) {
    console.error("Erro ao criar consulta:", error);
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
