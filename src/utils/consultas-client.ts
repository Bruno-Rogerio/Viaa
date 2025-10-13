// src/utils/consultas-client.ts
// Cria consulta direto no banco + chama serviço de lembretes

import { supabase } from "@/lib/supabase/client";

export interface DadosConsulta {
  titulo: string;
  descricao: string;
  data_inicio: string;
  data_fim: string;
  tipo: "online" | "presencial" | "telefone";
  profissional_id: string;
  paciente_id?: string;
  valor?: number;
  observacoes?: string;
}

export async function criarConsultaCliente(dados: DadosConsulta) {
  try {
    // Verificar autenticação
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

    if (!perfilPaciente && !dados.paciente_id) {
      const { data: perfilProfissional } = await supabase
        .from("perfis_profissionais")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (!perfilProfissional) {
        throw new Error("Perfil não encontrado. Complete seu cadastro.");
      }

      console.warn(
        "⚠️ Profissional tentando marcar consulta sem perfil de paciente"
      );
    }

    const pacienteId = dados.paciente_id || perfilPaciente?.id;

    if (!pacienteId) {
      console.error("❌ ID do paciente não encontrado");
      throw new Error("ID do paciente não encontrado");
    }

    console.log("✅ Paciente ID encontrado:", pacienteId);

    // Verificar conflitos de horário
    const { data: consultasExistentes, error: conflitosError } = await supabase
      .from("consultas")
      .select("id")
      .eq("profissional_id", dados.profissional_id)
      .in("status", ["agendada", "confirmada", "em_andamento"])
      .gte("data_fim", dados.data_inicio)
      .lte("data_inicio", dados.data_fim);

    if (conflitosError) {
      console.error("Erro ao verificar conflitos:", conflitosError);
    }

    if (consultasExistentes && consultasExistentes.length > 0) {
      throw new Error("Já existe uma consulta agendada neste horário");
    }

    // Criar consulta direto no banco
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

    // 🚀 CHAMAR EDGE FUNCTION PARA ENVIAR EMAILS (não bloqueia o usuário)
    try {
      fetch("/api/lembretes/enviar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ consulta_id: novaConsulta.id }),
      }).catch((err) => {
        console.error("⚠️ Erro ao enviar lembretes (não crítico):", err);
      });

      console.log("📧 Solicitação de envio de emails iniciada");
    } catch (emailError) {
      // Não falha se der erro nos emails
      console.error("⚠️ Erro ao iniciar envio de emails:", emailError);
    }

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

// Restante do código mantém igual...
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
