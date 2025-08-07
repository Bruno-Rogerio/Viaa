// types/database.ts

// Tipos de profissionais
export type TipoProfissional =
  | "psicologo"
  | "psicanalista"
  | "terapeuta_holistico"
  | "terapeuta_transpessoal"
  | "constelador_familiar"
  | "coach"
  | "hipnoterapeuta"
  | "reikiano"
  | "fitoterapeuta";

// Tipos para Pacientes
export interface PerfilPaciente {
  id: string;
  nome: string;
  sobrenome: string;
  data_nascimento: string; // formato: 'YYYY-MM-DD'
  telefone: string;
  cpf: string;
  // Contato de emergência
  contato_emergencia_nome?: string;
  contato_emergencia_telefone?: string;
  contato_emergencia_parentesco?: string;
  // Preferências
  aceita_notificacoes: boolean;
  privacidade: "public" | "private";
  // Status
  status_verificacao: "pendente" | "aprovado" | "rejeitado";
  // Metadados
  created_at: string;
  updated_at: string;
}

export interface InserirPerfilPaciente {
  id: string; // UUID do auth.users
  nome: string;
  sobrenome: string;
  data_nascimento: string;
  telefone: string;
  cpf: string;
  contato_emergencia_nome?: string;
  contato_emergencia_telefone?: string;
  contato_emergencia_parentesco?: string;
  aceita_notificacoes?: boolean;
  privacidade?: "public" | "private";
}

// Tipos para Profissionais
export interface PerfilProfissional {
  id: string;
  nome: string;
  sobrenome: string;
  data_nascimento: string;
  telefone: string;
  cpf: string;
  crp?: string; // Obrigatório apenas para psicólogos
  tipo: TipoProfissional;
  especialidades: string; // Campo livre
  // Status
  status_verificacao: "pendente" | "aprovado" | "rejeitado";
  // Metadados
  created_at: string;
  updated_at: string;
}

export interface InserirPerfilProfissional {
  id: string;
  nome: string;
  sobrenome: string;
  data_nascimento: string;
  telefone: string;
  cpf: string;
  crp?: string;
  tipo: TipoProfissional;
  especialidades: string;
}

// Tipos para Clínicas
export interface PerfilClinica {
  id: string;
  nome_fantasia: string;
  razao_social: string;
  cnpj: string;
  telefone: string;
  email_contato?: string;
  // Endereço
  endereco_cep: string;
  endereco_logradouro: string;
  endereco_numero: string;
  endereco_complemento?: string;
  endereco_bairro: string;
  endereco_cidade: string;
  endereco_estado: string;
  // Responsável técnico
  responsavel_tecnico_nome: string;
  responsavel_tecnico_crp: string;
  // Status
  status_verificacao: "pendente" | "aprovado" | "rejeitado";
  ativo: boolean;
  // Metadados
  created_at: string;
  updated_at: string;
}

export interface InserirPerfilClinica {
  id: string;
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
  nome_fantasia: string;
  razao_social: string;
  cnpj: string;
  telefone: string;
  email_contato?: string;
  // Endereço
  endereco_cep: string;
  endereco_logradouro: string;
  endereco_numero: string;
  endereco_complemento?: string;
  endereco_bairro: string;
  endereco_cidade: string;
  endereco_estado: string;
  // Responsável
  responsavel_nome: string;
  responsavel_cargo?: string;
  responsavel_telefone?: string;
  responsavel_email?: string;
  // Status
  status_verificacao: "pendente" | "aprovado" | "rejeitado";
  ativo: boolean;
  // Metadados
  created_at: string;
  updated_at: string;
}

export interface InserirPerfilEmpresa {
  id: string;
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

// Relacionamentos entre entidades
export interface ProfissionalClinica {
  id: string;
  profissional_id: string;
  clinica_id: string;
  ativo: boolean;
  created_at: string;
}

export interface InserirProfissionalClinica {
  profissional_id: string;
  clinica_id: string;
  ativo?: boolean;
}

export interface PacienteEmpresa {
  id: string;
  paciente_id: string; // referência ao PerfilPaciente
  empresa_id: string;
  ativo: boolean;
  created_at: string;
}

export interface InserirPacienteEmpresa {
  paciente_id: string;
  empresa_id: string;
  ativo?: boolean;
}
