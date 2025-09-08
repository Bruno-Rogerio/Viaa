// viaa\src\types\database.ts

// Tipos base reutilizáveis
export type UserType = "paciente" | "profissional" | "clinica" | "empresa";
export type StatusVerificacao = "pendente" | "aprovado" | "rejeitado";
export type TipoPrivacidade = "public" | "private" | "friends";

// NOVOS TIPOS DE PROFISSIONAL ATUALIZADOS
export type TipoProfissional =
  | "psicologo"
  | "psicanalista"
  | "heike"
  | "holistico"
  | "coach_mentor";

// Simplificado - apenas CRP será usado
export type TipoConselho = "CRP";

export type TipoDocumento =
  | "diploma"
  | "pos_graduacao"
  | "especializacao"
  | "registro_profissional"
  | "certificado_curso"
  | "comprovante_formacao"
  | "outros";

export type StatusDocumento = "pendente" | "aprovado" | "rejeitado";

// Tipos para Pacientes (inalterado)
export interface PerfilPaciente {
  id: string;
  user_id: string;
  nome: string;
  sobrenome: string;
  data_nascimento: string;
  telefone: string;
  cpf: string;
  verificado: boolean;
  genero?: string;
  cidade?: string;
  estado?: string;
  contato_emergencia_nome?: string;
  contato_emergencia_telefone?: string;
  contato_emergencia_parentesco?: string;
  aceita_notificacoes: boolean;
  privacidade: TipoPrivacidade;
  created_at: string;
  updated_at: string;
}

export interface CriarPerfilPaciente {
  id: string;
  user_id: string;
  nome: string;
  sobrenome: string;
  data_nascimento: string;
  telefone: string;
  cpf: string;
  genero?: string;
  cidade?: string;
  estado?: string;
  contato_emergencia_nome?: string;
  contato_emergencia_telefone?: string;
  contato_emergencia_parentesco?: string;
  aceita_notificacoes?: boolean;
  privacidade?: TipoPrivacidade;
}

// TIPOS PARA PROFISSIONAIS ATUALIZADOS
export interface PerfilProfissional {
  id: string;
  user_id: string;
  nome: string;
  sobrenome: string;
  data_nascimento: string;
  telefone: string;
  cpf: string;
  tipo: TipoProfissional; // AGORA OBRIGATÓRIO
  crp?: string; // Apenas para psicólogos
  especialidades: string;
  verificado: boolean;
  status_verificacao: StatusVerificacao;
  email?: string;
  endereco_cep?: string;
  endereco_logradouro?: string;
  endereco_numero?: string;
  endereco_complemento?: string;
  endereco_bairro?: string;
  endereco_cidade?: string;
  endereco_estado?: string;
  registro_profissional?: string; // Opcional para não-psicólogos
  valor_sessao?: number;
  formacao_principal?: string;
  experiencia_anos?: number;
  abordagem_terapeutica?: string;
  bio_profissional?: string; // AGORA OPCIONAL
  foto_perfil_url?: string;
  link_linkedin?: string;
  link_instagram?: string;
  link_youtube?: string;
  site_pessoal?: string;
  created_at: string;
  updated_at: string;
}

export interface CriarPerfilProfissional {
  id: string;
  user_id: string;
  nome: string;
  sobrenome: string;
  data_nascimento: string;
  telefone: string;
  cpf: string;
  tipo: TipoProfissional; // OBRIGATÓRIO
  especialidades: string;
  email?: string;
  endereco_cep?: string;
  endereco_logradouro?: string;
  endereco_numero?: string;
  endereco_complemento?: string;
  endereco_bairro?: string;
  endereco_cidade?: string;
  endereco_estado?: string;
  crp?: string; // Apenas para psicólogos
  registro_profissional?: string; // Opcional
  valor_sessao?: number;
  formacao_principal?: string;
  experiencia_anos?: number;
  abordagem_terapeutica?: string;
  bio_profissional?: string; // OPCIONAL
  foto_perfil_url?: string;
  link_linkedin?: string;
  link_instagram?: string;
}

// NOVO: Interface para documentos de profissionais
export interface DocumentoProfissional {
  id: string;
  profissional_id: string;
  tipo: TipoDocumento;
  nome_arquivo: string;
  url_arquivo: string;
  status: StatusDocumento;
  observacoes?: string;
  created_at: string;
  updated_at: string;
}

export interface CriarDocumentoProfissional {
  profissional_id: string;
  tipo: TipoDocumento;
  nome_arquivo: string;
  url_arquivo: string;
  observacoes?: string;
}

// Tipos para Clínicas (inalterado)
export interface PerfilClinica {
  id: string;
  user_id: string;
  nome_fantasia: string;
  razao_social: string;
  cnpj: string;
  telefone: string;
  email_contato?: string;
  endereco_cep: string;
  endereco_logradouro: string;
  endereco_numero: string;
  endereco_complemento?: string;
  endereco_bairro: string;
  endereco_cidade: string;
  endereco_estado: string;
  responsavel_tecnico_nome: string;
  responsavel_tecnico_crp: string;
  verificado: boolean;
  status_verificacao: StatusVerificacao;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface CriarPerfilClinica {
  id: string;
  user_id: string;
  nome_fantasia: string;
  razao_social: string;
  cnpj: string;
  telefone: string;
  email_contato?: string;
  endereco_cep: string;
  endereco_logradouro: string;
  endereco_numero: string;
  endereco_complemento?: string;
  endereco_bairro: string;
  endereco_cidade: string;
  endereco_estado: string;
  responsavel_tecnico_nome: string;
  responsavel_tecnico_crp: string;
}

// Tipos para Empresas (inalterado)
export interface PerfilEmpresa {
  id: string;
  user_id: string;
  nome_fantasia: string;
  razao_social: string;
  cnpj: string;
  telefone: string;
  email_contato?: string;
  endereco_cep: string;
  endereco_logradouro: string;
  endereco_numero: string;
  endereco_complemento?: string;
  endereco_bairro: string;
  endereco_cidade: string;
  endereco_estado: string;
  responsavel_nome: string;
  responsavel_cargo?: string;
  responsavel_telefone?: string;
  responsavel_email?: string;
  verificado: boolean;
  status_verificacao: StatusVerificacao;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface CriarPerfilEmpresa {
  id: string;
  user_id: string;
  nome_fantasia: string;
  razao_social: string;
  cnpj: string;
  telefone: string;
  email_contato?: string;
  endereco_cep: string;
  endereco_logradouro: string;
  endereco_numero: string;
  endereco_complemento?: string;
  endereco_bairro: string;
  endereco_cidade: string;
  endereco_estado: string;
  responsavel_nome: string;
  responsavel_cargo?: string;
  responsavel_telefone?: string;
  responsavel_email?: string;
}

// Tipos para Questionários (inalterado)
export interface Questionario {
  id: string;
  user_id: string;
  motivacao?: string;
  tempo_necessidade?: string;
  terapia_anterior?: string;
  tempo_terapia_anterior?: string;
  motivo_interrupcao?: string;
  dificuldades_sono?: string;
  apoio_familiar?: string;
  areas_trabalhar?: string[];
  areas_trabalhar_outros?: string;
  preferencia_genero?: string;
  created_at: string;
  updated_at: string;
}

export interface CriarQuestionario {
  user_id: string;
  motivacao?: string;
  tempo_necessidade?: string;
  terapia_anterior?: string;
  tempo_terapia_anterior?: string;
  motivo_interrupcao?: string;
  dificuldades_sono?: string;
  apoio_familiar?: string;
  areas_trabalhar?: string[];
  areas_trabalhar_outros?: string;
  preferencia_genero?: string;
}

// Tipos para responses de API
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  success: boolean;
}

export interface UserProfile {
  tipo: UserType | null;
  dados:
    | PerfilPaciente
    | PerfilProfissional
    | PerfilClinica
    | PerfilEmpresa
    | null;
  verificado?: boolean;
}
