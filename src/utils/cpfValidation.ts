// src/utils/cpfValidation.ts
// 🔧 UTILITÁRIO - Validação de CPF duplicado

import { supabase } from "@/lib/supabase/client";

/**
 * Verifica se um CPF já está cadastrado em qualquer tabela de perfis
 */
export const checkCpfExists = async (
  cpf: string
): Promise<{
  exists: boolean;
  userType?: string;
  message?: string;
}> => {
  try {
    // Limpar CPF (remover pontos e hífen)
    const cleanCpf = cpf.replace(/[^\d]/g, "");

    if (cleanCpf.length !== 11) {
      return { exists: false, message: "CPF inválido" };
    }

    // Tabelas para verificar
    const tabelas = [
      { nome: "perfis_pacientes", tipo: "paciente" },
      { nome: "perfis_profissionais", tipo: "profissional" },
      { nome: "perfis_clinicas", tipo: "clínica" },
      { nome: "perfis_empresas", tipo: "empresa" },
    ];

    for (const tabela of tabelas) {
      const { data, error } = await supabase
        .from(tabela.nome)
        .select("id, cpf")
        .eq("cpf", cleanCpf)
        .maybeSingle();

      if (!error && data) {
        return {
          exists: true,
          userType: tabela.tipo,
          message: `CPF já cadastrado como ${tabela.tipo}`,
        };
      }
    }

    return { exists: false };
  } catch (error) {
    console.error("Erro ao verificar CPF:", error);
    return { exists: false, message: "Erro na verificação" };
  }
};

/**
 * Valida formato do CPF
 */
export const validateCpfFormat = (cpf: string): boolean => {
  const cleanCpf = cpf.replace(/[^\d]/g, "");

  if (cleanCpf.length !== 11 || /^(\d)\1{10}$/.test(cleanCpf)) {
    return false;
  }

  let sum = 0;
  let remainder;

  for (let i = 1; i <= 9; i++) {
    sum += parseInt(cleanCpf.substring(i - 1, i)) * (11 - i);
  }

  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCpf.substring(9, 10))) return false;

  sum = 0;
  for (let i = 1; i <= 10; i++) {
    sum += parseInt(cleanCpf.substring(i - 1, i)) * (12 - i);
  }

  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;

  return remainder === parseInt(cleanCpf.substring(10, 11));
};

/**
 * Formatar CPF para exibição
 */
export const formatCpf = (cpf: string): string => {
  const cleanCpf = cpf.replace(/[^\d]/g, "");
  if (cleanCpf.length > 11) return cleanCpf.substring(0, 11);

  return cleanCpf
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
};
