// src/types/notificacao.ts

import { StatusConsulta, TipoConsulta } from "./agenda";

// Tipos de notificações
export enum TipoNotificacao {
  EMAIL = "email",
  SMS = "sms",
  PUSH = "push",
  IN_APP = "in_app",
}

// Status de notificações
export enum StatusNotificacao {
  PENDENTE = "pendente",
  ENVIADO = "enviado",
  FALHA = "falha",
}

// Tipos de lembretes
export enum TipoLembrete {
  AGENDAMENTO = "agendamento",
  CONFIRMACAO = "confirmacao",
  LEMBRETE_24H = "lembrete_24h",
  LEMBRETE_1H = "lembrete_1h",
  CANCELAMENTO = "cancelamento",
}

// Notificação base
export interface Notificacao {
  id: string;
  tipo: TipoNotificacao;
  destinatario_id: string;
  conteudo: string;
  data_criacao: string;
  data_envio?: string;
  status: StatusNotificacao;
}

// Lembrete específico para consultas
export interface LembreteConsulta {
  id: string;
  consulta_id: string;
  tipo: TipoLembrete;
  destinatario_id: string;
  agendado_para: string;
  enviado_em?: string;
  status: StatusNotificacao;
  mensagem?: string;
  created_at: string;
}

// Para criar lembrete
export interface CriarLembreteConsulta {
  consulta_id: string;
  tipo: TipoLembrete;
  destinatario_id: string;
  agendado_para: string;
  mensagem?: string;
}

// Dados do template de email
export interface DadosTemplateEmail {
  consulta: {
    id: string;
    data_inicio: string;
    data_fim: string;
    status: StatusConsulta;
    tipo: TipoConsulta;
    link_videochamada?: string;
  };
  profissional: {
    nome: string;
    sobrenome: string;
    especialidade: string;
    foto_url?: string;
  };
  paciente: {
    nome: string;
    sobrenome: string;
    foto_url?: string;
  };
}
