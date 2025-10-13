// src/types/notificacao-in-app.ts

export enum TipoNotificacaoInApp {
  CONSULTA_AGENDADA = "consulta_agendada",
  CONSULTA_CONFIRMADA = "consulta_confirmada",
  CONSULTA_REJEITADA = "consulta_rejeitada",
  CONSULTA_CANCELADA = "consulta_cancelada",
  LEMBRETE_CONSULTA = "lembrete_consulta",
  SISTEMA = "sistema",
}

export interface NotificacaoInApp {
  id: string;
  usuario_id: string;
  titulo: string;
  mensagem: string;
  tipo: TipoNotificacaoInApp;
  data: string;
  lida: boolean;
  consulta_id?: string;
  link?: string;
  created_at: string;
}

export interface CriarNotificacaoInApp {
  usuario_id: string;
  titulo: string;
  mensagem: string;
  tipo: TipoNotificacaoInApp;
  consulta_id?: string;
  link?: string;
}
