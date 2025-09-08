// Componentes existentes
export { default as Avatar } from "./Avatar";
export { default as LoadingSpinner } from "./LoadingSpinner";
export { default as ImageUpload } from "./ImageUpload";
export { default as NotificationBell } from "./NotificationBell";
export { default as SearchBar } from "./SearchBar";

// Novos componentes da agenda
export { default as Agenda } from "./Agenda";
export { default as ProximasConsultasWidget } from "./ProximasConsultasWidget";

// Tipos da agenda
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

// Hook da agenda
export { useAgenda } from "@/hooks/dashboard/useAgenda";
