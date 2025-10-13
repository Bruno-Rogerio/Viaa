// src/services/notificacoes/notificacaoService.ts

import { supabase } from "@/lib/supabase/client";
import {
  NotificacaoInApp,
  CriarNotificacaoInApp,
  TipoNotificacaoInApp,
} from "@/types/notificacao-in-app";
import { Consulta } from "@/types/agenda";

// Função para criar uma notificação in-app
export async function criarNotificacaoInApp(
  dados: CriarNotificacaoInApp
): Promise<NotificacaoInApp | null> {
  try {
    const { data, error } = await supabase
      .from("notificacoes")
      .insert([
        {
          usuario_id: dados.usuario_id,
          titulo: dados.titulo,
          mensagem: dados.mensagem,
          tipo: dados.tipo,
          consulta_id: dados.consulta_id || null,
          link: dados.link || null,
          lida: false,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Erro ao criar notificação in-app:", error);
    return null;
  }
}

// Função para marcar notificação como lida
export async function marcarNotificacaoComoLida(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("notificacoes")
      .update({ lida: true })
      .eq("id", id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Erro ao marcar notificação como lida:", error);
    return false;
  }
}

// Função para buscar notificações de um usuário
export async function buscarNotificacoesUsuario(
  usuarioId: string,
  limite: number = 10,
  apenasNaoLidas: boolean = false
): Promise<NotificacaoInApp[]> {
  try {
    let query = supabase
      .from("notificacoes")
      .select("*")
      .eq("usuario_id", usuarioId)
      .order("created_at", { ascending: false })
      .limit(limite);

    if (apenasNaoLidas) {
      query = query.eq("lida", false);
    }

    const { data, error } = await query;
    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error("Erro ao buscar notificações:", error);
    return [];
  }
}

// Função para criar notificações automáticas para consulta
export async function criarNotificacoesConsulta(
  consulta: Consulta,
  acao: string
): Promise<void> {
  try {
    const dataConsulta = new Date(consulta.data_inicio);
    const dataFormatada = dataConsulta.toLocaleDateString("pt-BR", {
      weekday: "long",
      day: "2-digit",
      month: "long",
    });

    const horaFormatada = dataConsulta.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });

    // Buscar informações adicionais
    const { data: dadosConsulta } = await supabase
      .from("consultas")
      .select(
        `
        profissionais:profissional_id (nome, sobrenome),
        pacientes:paciente_id (nome, sobrenome)
      `
      )
      .eq("id", consulta.id)
      .single();

    if (!dadosConsulta) return;

    const nomeProfissional = `${dadosConsulta.profissionais.nome} ${dadosConsulta.profissionais.sobrenome}`;
    const nomePaciente = `${dadosConsulta.pacientes.nome} ${dadosConsulta.pacientes.sobrenome}`;

    // Definir notificações baseadas na ação
    if (acao === "agendamento") {
      // Notificar profissional sobre novo agendamento
      await criarNotificacaoInApp({
        usuario_id: consulta.profissional_id,
        titulo: "Nova consulta agendada",
        mensagem: `${nomePaciente} agendou uma consulta para ${dataFormatada} às ${horaFormatada}.`,
        tipo: TipoNotificacaoInApp.CONSULTA_AGENDADA,
        consulta_id: consulta.id,
        link: `/dashboard/profissional/consultas/${consulta.id}`,
      });

      // Notificar paciente sobre agendamento realizado
      await criarNotificacaoInApp({
        usuario_id: consulta.paciente_id,
        titulo: "Agendamento realizado",
        mensagem: `Sua consulta com ${nomeProfissional} foi agendada para ${dataFormatada} às ${horaFormatada}.`,
        tipo: TipoNotificacaoInApp.CONSULTA_AGENDADA,
        consulta_id: consulta.id,
        link: `/dashboard/paciente/consultas/${consulta.id}`,
      });
    } else if (acao === "confirmacao") {
      // Notificar paciente sobre confirmação
      await criarNotificacaoInApp({
        usuario_id: consulta.paciente_id,
        titulo: "Consulta confirmada",
        mensagem: `Sua consulta com ${nomeProfissional} para ${dataFormatada} às ${horaFormatada} foi confirmada.`,
        tipo: TipoNotificacaoInApp.CONSULTA_CONFIRMADA,
        consulta_id: consulta.id,
        link: `/dashboard/paciente/consultas/${consulta.id}`,
      });
    } else if (acao === "rejeicao") {
      // Notificar paciente sobre rejeição
      await criarNotificacaoInApp({
        usuario_id: consulta.paciente_id,
        titulo: "Consulta rejeitada",
        mensagem: `Sua consulta com ${nomeProfissional} para ${dataFormatada} às ${horaFormatada} foi rejeitada.`,
        tipo: TipoNotificacaoInApp.CONSULTA_REJEITADA,
        consulta_id: consulta.id,
        link: `/dashboard/paciente/consultas/${consulta.id}`,
      });
    } else if (acao === "cancelamento") {
      // Notificar profissional sobre cancelamento
      await criarNotificacaoInApp({
        usuario_id: consulta.profissional_id,
        titulo: "Consulta cancelada",
        mensagem: `${nomePaciente} cancelou a consulta agendada para ${dataFormatada} às ${horaFormatada}.`,
        tipo: TipoNotificacaoInApp.CONSULTA_CANCELADA,
        consulta_id: consulta.id,
        link: `/dashboard/profissional/consultas`,
      });
    } else if (acao === "lembrete") {
      // Lembrete para o paciente
      const horasRestantes = Math.round(
        (dataConsulta.getTime() - Date.now()) / (1000 * 60 * 60)
      );
      let mensagemLembrete = "";

      if (horasRestantes <= 1) {
        mensagemLembrete = `Sua consulta com ${nomeProfissional} começa em menos de 1 hora (${horaFormatada}).`;
      } else if (horasRestantes <= 24) {
        mensagemLembrete = `Lembrete: Sua consulta com ${nomeProfissional} será amanhã às ${horaFormatada}.`;
      } else {
        mensagemLembrete = `Lembrete: Sua consulta com ${nomeProfissional} será em ${dataFormatada} às ${horaFormatada}.`;
      }

      await criarNotificacaoInApp({
        usuario_id: consulta.paciente_id,
        titulo: "Lembrete de consulta",
        mensagem: mensagemLembrete,
        tipo: TipoNotificacaoInApp.LEMBRETE_CONSULTA,
        consulta_id: consulta.id,
        link: `/dashboard/paciente/consultas/${consulta.id}`,
      });

      // Lembrete para o profissional (apenas próximas consultas do dia)
      if (horasRestantes <= 24) {
        await criarNotificacaoInApp({
          usuario_id: consulta.profissional_id,
          titulo: "Lembrete de consulta",
          mensagem: `Lembrete: Você tem uma consulta com ${nomePaciente} ${
            horasRestantes <= 1 ? "em menos de 1 hora" : "amanhã"
          } às ${horaFormatada}.`,
          tipo: TipoNotificacaoInApp.LEMBRETE_CONSULTA,
          consulta_id: consulta.id,
          link: `/dashboard/profissional/consultas/${consulta.id}`,
        });
      }
    }
  } catch (error) {
    console.error("Erro ao criar notificações da consulta:", error);
  }
}
