// viaa/src/types/agenda.ts

export type StatusConsulta =
  | "agendada" // Paciente agendou, aguardando confirmação do profissional
  | "confirmada" // Profissional confirmou a consulta
  | "em_andamento" // Consulta iniciada
  | "concluida" // Consulta finalizada
  | "cancelada" // Cancelada por qualquer parte
  | "rejeitada" // Profissional rejeitou a solicitação
  | "nao_compareceu"; // Paciente não compareceu

export type TipoConsulta = "presencial" | "online" | "telefone";

export type ModoVisualizacao = "mes" | "semana" | "dia" | "lista";

export type TipoUsuarioAgenda = "profissional" | "paciente";

export type TipoBloqueio = "ferias" | "doenca" | "evento" | "pessoal" | "outro";

export type StatusLembrete = "pendente" | "enviado" | "erro";

export type TipoLembrete = "email" | "sms" | "push";

// Interface base para consultas
export interface Consulta {
  id: string;
  titulo: string;
  descricao?: string;
  data_inicio: string; // ISO string
  data_fim: string; // ISO string
  status: StatusConsulta;
  tipo: TipoConsulta;

  // Participantes
  profissional_id: string;
  paciente_id: string;

  // Dados do profissional
  profissional: {
    id: string;
    nome: string;
    sobrenome: string;
    foto_perfil_url?: string;
    especialidades: string;
    crp?: string;
    verificado?: boolean;
  };

  // Dados do paciente
  paciente: {
    id: string;
    nome: string;
    sobrenome: string;
    foto_perfil_url?: string;
    telefone?: string;
    email?: string;
  };

  // Configurações
  valor?: number;
  observacoes?: string;
  link_videochamada?: string;
  lembretes_enviados: boolean;

  // Metadados
  created_at: string;
  updated_at: string;
}

// Para criar nova consulta (apenas pacientes fazem isso)
export interface CriarConsulta {
  titulo: string;
  descricao?: string;
  data_inicio: string;
  data_fim: string;
  tipo: TipoConsulta;
  profissional_id: string;
  paciente_id: string;
  valor?: number;
  observacoes?: string;
}

// Para atualizar consulta
export interface AtualizarConsulta {
  id: string;
  titulo?: string;
  descricao?: string;
  data_inicio?: string;
  data_fim?: string;
  status?: StatusConsulta;
  tipo?: TipoConsulta;
  valor?: number;
  observacoes?: string;
  link_videochamada?: string;
}

// Horário de disponibilidade do profissional
export interface HorarioDisponivel {
  id: string;
  profissional_id: string;
  dia_semana: number; // 0-6 (domingo a sábado)
  hora_inicio: string; // HH:mm
  hora_fim: string; // HH:mm
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

// Para criar horário disponível
export interface CriarHorarioDisponivel {
  profissional_id: string;
  dia_semana: number;
  hora_inicio: string;
  hora_fim: string;
  ativo?: boolean;
}

// Bloqueio de horário
export interface BloqueioHorario {
  id: string;
  profissional_id: string;
  data_inicio: string;
  data_fim: string;
  motivo: string;
  tipo: TipoBloqueio;
  created_at: string;
}

// Para criar bloqueio
export interface CriarBloqueioHorario {
  profissional_id: string;
  data_inicio: string;
  data_fim: string;
  motivo: string;
  tipo: TipoBloqueio;
}

// Lembrete/Notificação
export interface LembreteConsulta {
  id: string;
  consulta_id: string;
  tipo: TipoLembrete;
  destinatario_id: string;
  agendado_para: string;
  enviado_em?: string;
  status: StatusLembrete;
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

// Filtros para busca
export interface FiltrosAgenda {
  data_inicio?: string;
  data_fim?: string;
  status?: StatusConsulta[];
  tipo?: TipoConsulta[];
  profissional_id?: string;
  paciente_id?: string;
  busca?: string; // pesquisa por nome/título
}

// Estatísticas da agenda
export interface EstatisticasAgenda {
  total_consultas: number;
  consultas_hoje: number;
  consultas_semana: number;
  consultas_mes: number;
  proxima_consulta?: Consulta;
  taxa_comparecimento: number;
  receita_mes: number;
  consultas_por_status: Record<StatusConsulta, number>;
  horarios_livres_hoje: number;
  consultas_canceladas_mes: number;
  // Específico para profissionais
  consultas_pendentes_confirmacao?: number;
}

// Props do componente de agenda ATUALIZADAS PARA COMPONENTE INTELIGENTE
export interface AgendaProps {
  // Tipo de usuário (muda comportamento)
  tipoUsuario: TipoUsuarioAgenda;

  // ID do usuário logado
  usuarioId: string;

  // ID do profissional cuja agenda está sendo visualizada (OBRIGATÓRIO)
  profissionalId: string;

  // Informações do profissional (quando visualizando agenda de outro)
  profissionalInfo?: {
    nome: string;
    sobrenome: string;
    especialidades: string;
    foto_perfil_url?: string;
    valor_sessao?: number;
    crp?: string;
    verificado?: boolean;
  };

  // Configurações visuais
  modoVisualizacao?: ModoVisualizacao;
  altura?: string;

  // Callbacks personalizáveis
  onConsultaClick?: (consulta: Consulta) => void;
  onEditarConsulta?: (consulta: Consulta) => void;
  onCancelarConsulta?: (consulta: Consulta) => void;
  onConfirmarConsulta?: (consulta: Consulta) => void;
  onRejeitarConsulta?: (consulta: Consulta) => void;
  onIniciarConsulta?: (consulta: Consulta) => void;
  onFinalizarConsulta?: (consulta: Consulta) => void;
  onSolicitarConsulta?: (data: Date, horario: string) => void;

  // Configurações adicionais
  className?: string;
  desabilitado?: boolean;
}

// Interface para resultado de operações
export interface ResultadoOperacao {
  sucesso: boolean;
  mensagem: string;
  dados?: any;
}

// Interface para hook da agenda
export interface UseAgendaReturn {
  // Estado
  consultas: Consulta[];
  carregando: boolean;
  erro: string | null;
  dataAtual: Date;
  modoVisualizacao: ModoVisualizacao;
  filtros: FiltrosAgenda;
  estatisticas: EstatisticasAgenda | null;

  // Actions - Consultas (profissionais apenas confirmam/rejeitam)
  confirmarConsulta: (id: string) => Promise<ResultadoOperacao>;
  rejeitarConsulta: (id: string, motivo?: string) => Promise<ResultadoOperacao>;
  cancelarConsulta: (id: string, motivo?: string) => Promise<ResultadoOperacao>;
  iniciarConsulta: (id: string) => Promise<ResultadoOperacao>;
  finalizarConsulta: (
    id: string,
    observacoes?: string
  ) => Promise<ResultadoOperacao>;
  marcarNaoCompareceu: (id: string) => Promise<ResultadoOperacao>;

  // Actions - Horários e Bloqueios (profissionais)
  criarHorarioDisponivel: (
    dados: CriarHorarioDisponivel
  ) => Promise<ResultadoOperacao>;
  criarBloqueioHorario: (
    dados: CriarBloqueioHorario
  ) => Promise<ResultadoOperacao>;

  // Navegação
  irParaData: (data: Date) => void;
  proximaSemana: () => void;
  semanaAnterior: () => void;
  proximoMes: () => void;
  mesAnterior: () => void;
  hoje: () => void;

  // Filtros
  setFiltros: (filtros: Partial<FiltrosAgenda>) => void;
  limparFiltros: () => void;

  // Visualização
  setModoVisualizacao: (modo: ModoVisualizacao) => void;

  // Utilidades
  consultasNaData: (data: Date) => Consulta[];
  temConsultaNaData: (data: Date) => boolean;
  proximaConsulta: () => Consulta | null;
  verificarDisponibilidade: (data: Date, duracao: number) => boolean;
  obterHorariosLivres: (data: Date) => { inicio: string; fim: string }[];

  // Refresh
  recarregar: () => Promise<void>;
}

// Configurações de disponibilidade semanal
export interface ConfiguracaoSemanal {
  profissional_id: string;
  configuracao: {
    [key: number]: {
      // dia da semana (0-6)
      ativo: boolean;
      horarios: {
        inicio: string; // HH:mm
        fim: string; // HH:mm
      }[];
    };
  };
}

// Para o widget de próximas consultas
export interface ProximasConsultas {
  consultas: Consulta[];
  carregando: boolean;
  erro?: string;
}

// Props do widget de próximas consultas
export interface ProximasConsultasWidgetProps {
  tipoUsuario: TipoUsuarioAgenda;
  usuarioId: string;
  limite?: number;
  className?: string;
}

// Configurações de notificação
export interface ConfiguracaoNotificacao {
  profissional_id: string;
  email_enabled: boolean;
  sms_enabled: boolean;
  push_enabled: boolean;
  antecedencia_horas: number[];
  template_personalizado?: string;
}

// Relatório de consultas
export interface RelatorioConsultas {
  periodo: {
    inicio: string;
    fim: string;
  };
  resumo: {
    total_consultas: number;
    consultas_realizadas: number;
    consultas_canceladas: number;
    receita_total: number;
    tempo_total_minutos: number;
  };
  por_status: Record<StatusConsulta, number>;
  por_tipo: Record<TipoConsulta, number>;
  por_dia: {
    data: string;
    quantidade: number;
    receita: number;
  }[];
  pacientes_atendidos: number;
  taxa_ocupacao: number;
}

// Slot de horário disponível
export interface SlotHorario {
  inicio: Date;
  fim: Date;
  disponivel: boolean;
  motivo_indisponibilidade?: string;
  consulta_existente?: Consulta;
}

// Conflito de horário
export interface ConflitoHorario {
  tipo: "consulta" | "bloqueio";
  data_inicio: string;
  data_fim: string;
  descricao: string;
  consulta?: Consulta;
  bloqueio?: BloqueioHorario;
}

// Validação de consulta
export interface ValidacaoConsulta {
  valida: boolean;
  erros: string[];
  avisos: string[];
  conflitos: ConflitoHorario[];
}

// Evento do calendário (para integração com calendários externos)
export interface EventoCalendario {
  id: string;
  titulo: string;
  inicio: string;
  fim: string;
  descricao?: string;
  localizacao?: string;
  participantes: string[];
  link_reuniao?: string;
  cor?: string;
  tipo: "consulta" | "bloqueio" | "pessoal";
}

// Template de consulta (para consultas recorrentes)
export interface TemplateConsulta {
  id: string;
  nome: string;
  titulo: string;
  descricao?: string;
  duracao_minutos: number;
  tipo: TipoConsulta;
  valor?: number;
  profissional_id: string;
  ativo: boolean;
  created_at: string;
}
