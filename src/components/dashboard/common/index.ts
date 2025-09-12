// src/components/dashboard/common/index.ts
// ATUALIZADO: Removendo Agenda antigo

// Componentes básicos existentes
export { default as Avatar } from "./Avatar";
export { default as LoadingSpinner } from "./LoadingSpinner";
export { default as ImageUpload } from "./ImageUpload";
export { default as NotificationBell } from "./NotificationBell";
export { default as SearchBar } from "./SearchBar";

// ❌ REMOVIDO: Agenda antigo
// export { default as Agenda } from "./Agenda";

// Widgets específicos (manter)
export { default as ProximasConsultasWidget } from "./ProximasConsultasWidget";

// Novos componentes da agenda
export { default as AgendaCalendar } from "../../common/agenda/AgendaCalendar";

// Tipos da agenda (manter todos)
export type {
  Consulta,
  CriarConsulta,
  AtualizarConsulta,
  StatusConsulta,
  TipoConsulta,
  ModoVisualizacao,
  TipoUsuarioAgenda,
  AgendaProps,
  EstatisticasAgenda,
  FiltrosAgenda,
  HorarioDisponivel,
  BloqueioHorario,
  LembreteConsulta,
  ResultadoOperacao,
  UseAgendaReturn,
  ProximasConsultas,
} from "@/types/agenda";

// Hooks da agenda (manter)
export { useAgenda } from "@/hooks/dashboard/useAgenda";
export { useHorariosDisponiveis } from "@/hooks/dashboard/useHorariosDisponiveis";
