// src/services/lembretes/lembreteService.ts

import { supabase } from "@/lib/supabase/client";
import {
  LembreteConsulta,
  CriarLembreteConsulta,
  TipoLembrete,
  StatusNotificacao,
  DadosTemplateEmail,
} from "@/types/notificacao";
import {
  enviarEmail,
  notificarProfissionalNovoAgendamento,
} from "../email/emailService";
import { Consulta } from "@/types/agenda";

// Função para criar um novo lembrete
export async function criarLembrete(
  dados: CriarLembreteConsulta
): Promise<LembreteConsulta | null> {
  try {
    const { data, error } = await supabase
      .from("lembretes_consulta")
      .insert([
        {
          consulta_id: dados.consulta_id,
          tipo: dados.tipo,
          destinatario_id: dados.destinatario_id,
          agendado_para: dados.agendado_para,
          mensagem: dados.mensagem || null,
          status: StatusNotificacao.PENDENTE,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Erro ao criar lembrete:", error);
    return null;
  }
}

// Função para atualizar status de lembrete
export async function atualizarStatusLembrete(
  lembreteId: string,
  status: StatusNotificacao,
  dataEnvio?: string
): Promise<boolean> {
  try {
    const updateData: any = { status };

    if (dataEnvio) {
      updateData.enviado_em = dataEnvio;
    }

    const { error } = await supabase
      .from("lembretes_consulta")
      .update(updateData)
      .eq("id", lembreteId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Erro ao atualizar status do lembrete:", error);
    return false;
  }
}

// Função para obter dados necessários para o template de email
export async function obterDadosTemplateEmail(
  consultaId: string
): Promise<DadosTemplateEmail | null> {
  try {
    // Obter dados da consulta com joins para profissional e paciente
    const { data, error } = await supabase
      .from("consultas")
      .select(
        `
        id, data_inicio, data_fim, status, tipo, link_videochamada,
        profissionais:profissional_id (
          id, nome, sobrenome, especialidades, foto_perfil_url
        ),
        pacientes:paciente_id (
          id, nome, sobrenome, foto_perfil_url
        )
      `
      )
      .eq("id", consultaId)
      .single();

    if (error) throw error;
    if (!data) return null;

    // Formatar os dados para o template
    return {
      consulta: {
        id: data.id,
        data_inicio: data.data_inicio,
        data_fim: data.data_fim,
        status: data.status,
        tipo: data.tipo,
        link_videochamada: data.link_videochamada,
      },
      profissional: {
        nome: data.profissionais.nome,
        sobrenome: data.profissionais.sobrenome,
        especialidade: data.profissionais.especialidades,
        foto_url: data.profissionais.foto_perfil_url,
      },
      paciente: {
        nome: data.pacientes.nome,
        sobrenome: data.pacientes.sobrenome,
        foto_url: data.pacientes.foto_perfil_url,
      },
    };
  } catch (error) {
    console.error("Erro ao obter dados para template:", error);
    return null;
  }
}

// Função para obter email do destinatário
async function obterEmailDestinatario(
  destinatarioId: string
): Promise<string | null> {
  try {
    // Primeiro tenta buscar na tabela de perfis de profissionais
    let { data, error } = await supabase
      .from("perfil_profissional")
      .select("email")
      .eq("user_id", destinatarioId)
      .single();

    // Se não encontrou ou deu erro, busca na tabela de perfis de pacientes
    if (error || !data) {
      const { data: pacienteData, error: pacienteError } = await supabase
        .from("perfil_paciente")
        .select("email")
        .eq("user_id", destinatarioId)
        .single();

      if (pacienteError) throw pacienteError;
      return pacienteData?.email || null;
    }

    return data.email;
  } catch (error) {
    console.error("Erro ao obter email do destinatário:", error);
    return null;
  }
}

// Função para processar um lembrete (enviar notificação)
export async function processarLembrete(lembreteId: string): Promise<boolean> {
  try {
    // Obter dados do lembrete
    const { data: lembrete, error } = await supabase
      .from("lembretes_consulta")
      .select("*")
      .eq("id", lembreteId)
      .single();

    if (error) throw error;
    if (!lembrete) return false;

    // Se o lembrete já foi enviado, não faz nada
    if (lembrete.status === StatusNotificacao.ENVIADO) {
      return true;
    }

    // Obter email do destinatário
    const emailDestinatario = await obterEmailDestinatario(
      lembrete.destinatario_id
    );
    if (!emailDestinatario) {
      throw new Error(
        `Email não encontrado para o destinatário: ${lembrete.destinatario_id}`
      );
    }

    // Obter dados para o template
    const dadosTemplate = await obterDadosTemplateEmail(lembrete.consulta_id);
    if (!dadosTemplate) {
      throw new Error(
        `Dados não encontrados para a consulta: ${lembrete.consulta_id}`
      );
    }

    // Enviar email baseado no tipo do lembrete
    const enviado = await enviarEmail(
      emailDestinatario,
      lembrete.tipo as TipoLembrete,
      dadosTemplate
    );

    // Atualizar status do lembrete
    if (enviado) {
      await atualizarStatusLembrete(
        lembreteId,
        StatusNotificacao.ENVIADO,
        new Date().toISOString()
      );
      return true;
    } else {
      await atualizarStatusLembrete(lembreteId, StatusNotificacao.FALHA);
      return false;
    }
  } catch (error) {
    console.error("Erro ao processar lembrete:", error);
    await atualizarStatusLembrete(lembreteId, StatusNotificacao.FALHA);
    return false;
  }
}

// Função para criar lembretes automáticos ao agendar consulta
export async function criarLembretesAutomaticos(
  consulta: Consulta
): Promise<boolean> {
  try {
    const dataConsulta = new Date(consulta.data_inicio);
    const agora = new Date();

    // Definir quando enviar os lembretes
    const lembretesParaCriar: CriarLembreteConsulta[] = [];

    // Lembrete de agendamento (imediato)
    lembretesParaCriar.push({
      consulta_id: consulta.id,
      tipo: TipoLembrete.AGENDAMENTO,
      destinatario_id: consulta.paciente_id,
      agendado_para: agora.toISOString(),
    });

    // Notificação para o profissional (imediato)
    // Vamos buscar o email do profissional e enviar diretamente
    const emailProfissional = await obterEmailDestinatario(
      consulta.profissional_id
    );
    const dadosTemplate = await obterDadosTemplateEmail(consulta.id);

    if (emailProfissional && dadosTemplate) {
      await notificarProfissionalNovoAgendamento(
        emailProfissional,
        dadosTemplate
      );
    }

    // Lembrete 24h antes (se ainda não passou do prazo)
    const data24h = new Date(dataConsulta);
    data24h.setHours(data24h.getHours() - 24);

    if (data24h > agora) {
      lembretesParaCriar.push({
        consulta_id: consulta.id,
        tipo: TipoLembrete.LEMBRETE_24H,
        destinatario_id: consulta.paciente_id,
        agendado_para: data24h.toISOString(),
      });
    }

    // Lembrete 1h antes (se ainda não passou do prazo)
    const data1h = new Date(dataConsulta);
    data1h.setHours(data1h.getHours() - 1);

    if (data1h > agora) {
      lembretesParaCriar.push({
        consulta_id: consulta.id,
        tipo: TipoLembrete.LEMBRETE_1H,
        destinatario_id: consulta.paciente_id,
        agendado_para: data1h.toISOString(),
      });
    }

    // Criar todos os lembretes na base de dados
    for (const lembrete of lembretesParaCriar) {
      await criarLembrete(lembrete);
    }

    // Processar o lembrete de agendamento imediatamente
    const lembreteAgendamento = await supabase
      .from("lembretes_consulta")
      .select("*")
      .eq("consulta_id", consulta.id)
      .eq("tipo", TipoLembrete.AGENDAMENTO)
      .eq("status", StatusNotificacao.PENDENTE)
      .single();

    if (lembreteAgendamento.data) {
      await processarLembrete(lembreteAgendamento.data.id);
    }

    return true;
  } catch (error) {
    console.error("Erro ao criar lembretes automáticos:", error);
    return false;
  }
}
