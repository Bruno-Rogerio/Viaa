// src/types/database.ts - VERSÃO ATUALIZADA com todos os campos do schema

// Tipos base reutilizáveis
export type UserType = "paciente" | "profissional" | "clinica" | "empresa";
export type StatusVerificacao = "pendente" | "aprovado" | "rejeitado";
export type TipoPrivacidade = "public" | "private" | "friends";

// TIPOS DE PROFISSIONAL ATUALIZADOS
export type TipoProfissional =
  | "psicologo"
  | "psicanalista"
  | "heike"
  | "holistico"
  | "coach_mentor";

// Tipo de conselho profissional
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

// ✅ INTERFACE PROFISSIONAL ATUALIZADA COM TODOS OS CAMPOS DO SCHEMA
export interface PerfilProfissional {
  id: string;
  user_id: string;
  nome: string;
  sobrenome: string;
  data_nascimento?: string; // Opcional no schema
  telefone: string;
  cpf: string;

  // Dados profissionais obrigatórios
  tipo: TipoProfissional;
  especialidades: string;
  verificado: boolean;
  status_verificacao: StatusVerificacao;

  // Campos opcionais pessoais
  email?: string;

  // Endereço completo (todos opcionais)
  endereco_cep?: string;
  endereco_logradouro?: string;
  endereco_numero?: string;
  endereco_complemento?: string;
  endereco_bairro?: string;
  endereco_cidade?: string;
  endereco_estado?: string;

  // ✅ CREDENCIAIS PROFISSIONAIS - NOVOS CAMPOS ADICIONADOS
  crp?: string; // Para psicólogos especificamente
  conselho_tipo?: TipoConselho; // "CRP" ou null
  conselho_numero?: string; // Número completo do conselho (ex: "06/123456")
  registro_profissional?: string; // Para outros tipos de profissionais

  // Dados profissionais opcionais
  valor_sessao?: number;
  formacao_principal?: string;
  experiencia_anos?: number;
  abordagem_terapeutica?: string;
  bio_profissional?: string;

  // Links e redes sociais
  foto_perfil_url?: string;
  link_linkedin?: string;
  link_instagram?: string;
  link_youtube?: string;
  site_pessoal?: string;

  // Timestamps
  created_at: string;
  updated_at: string;
}

export interface CriarPerfilProfissional {
  id: string;
  user_id: string;
  nome: string;
  sobrenome: string;
  data_nascimento?: string;
  telefone: string;
  cpf: string;
  tipo: TipoProfissional;
  especialidades: string;
  email?: string;

  // Endereço
  endereco_cep?: string;
  endereco_logradouro?: string;
  endereco_numero?: string;
  endereco_complemento?: string;
  endereco_bairro?: string;
  endereco_cidade?: string;
  endereco_estado?: string;

  // ✅ CREDENCIAIS ATUALIZADAS
  crp?: string;
  conselho_tipo?: TipoConselho;
  conselho_numero?: string;
  registro_profissional?: string;

  // Dados profissionais
  valor_sessao?: number;
  formacao_principal?: string;
  experiencia_anos?: number;
  abordagem_terapeutica?: string;
  bio_profissional?: string;

  // Links
  foto_perfil_url?: string;
  link_linkedin?: string;
  link_instagram?: string;
  link_youtube?: string;
  site_pessoal?: string;
}

// Interface para documentos de profissionais
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

// Tipos para Empresas
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

// Tipos para Questionários
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
