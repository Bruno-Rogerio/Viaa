// src/components/dashboard/common/index.ts
// CORRIGIDO: Sem referências aos novos componentes

// Componentes básicos existentes
export { default as Avatar } from "./Avatar";
export { default as LoadingSpinner } from "./LoadingSpinner";
export { default as ImageUpload } from "./ImageUpload";
export { default as NotificationBell } from "./NotificationBell";
export { default as SearchBar } from "./SearchBar";

// Widgets específicos (manter)
export { default as ProximasConsultasWidget } from "./ProximasConsultasWidget";

// ❌ REMOVIDO: Não exportar AgendaCalendar daqui
// Os novos componentes são importados diretamente onde necessário

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
