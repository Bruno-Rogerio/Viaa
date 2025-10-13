// src/utils/formatadores.ts
// Funções utilitárias para formatação de dados

/**
 * Formata data e hora em formato brasileiro
 */
export function formatarDataHora(data: string | Date): string {
  const dataObj = new Date(data);
  return dataObj.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Formata apenas a data
 */
export function formatarData(data: string | Date): string {
  const dataObj = new Date(data);
  return dataObj.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

/**
 * Formata apenas a hora
 */
export function formatarHora(data: string | Date): string {
  const dataObj = new Date(data);
  return dataObj.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Formata duração em minutos
 */
export function formatarDuracao(minutos: number): string {
  if (minutos < 60) {
    return `${minutos} min`;
  }

  const horas = Math.floor(minutos / 60);
  const mins = minutos % 60;

  if (mins === 0) {
    return `${horas}h`;
  }

  return `${horas}h ${mins}min`;
}

/**
 * Formata valor monetário
 */
export function formatarMoeda(valor: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valor);
}

/**
 * Formata telefone brasileiro
 */
export function formatarTelefone(telefone: string): string {
  // Remove tudo que não é número
  const numeros = telefone.replace(/\D/g, "");

  // Formata conforme o tamanho
  if (numeros.length === 11) {
    return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 7)}-${numeros.slice(
      7
    )}`;
  } else if (numeros.length === 10) {
    return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 6)}-${numeros.slice(
      6
    )}`;
  }

  return telefone;
}

/**
 * Calcula idade a partir da data de nascimento
 */
export function calcularIdade(dataNascimento: string | Date): number {
  const hoje = new Date();
  const nascimento = new Date(dataNascimento);
  let idade = hoje.getFullYear() - nascimento.getFullYear();
  const mes = hoje.getMonth() - nascimento.getMonth();

  if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) {
    idade--;
  }

  return idade;
}

/**
 * Formata data relativa (ex: "há 2 horas", "em 3 dias")
 */
export function formatarDataRelativa(data: string | Date): string {
  const agora = new Date();
  const dataObj = new Date(data);
  const diferenca = dataObj.getTime() - agora.getTime();
  const diferencaAbs = Math.abs(diferenca);

  const minutos = Math.floor(diferencaAbs / 60000);
  const horas = Math.floor(diferencaAbs / 3600000);
  const dias = Math.floor(diferencaAbs / 86400000);

  if (diferenca > 0) {
    // Futuro
    if (dias > 0) return `em ${dias} dia${dias > 1 ? "s" : ""}`;
    if (horas > 0) return `em ${horas} hora${horas > 1 ? "s" : ""}`;
    if (minutos > 0) return `em ${minutos} minuto${minutos > 1 ? "s" : ""}`;
    return "agora";
  } else {
    // Passado
    if (dias > 0) return `há ${dias} dia${dias > 1 ? "s" : ""}`;
    if (horas > 0) return `há ${horas} hora${horas > 1 ? "s" : ""}`;
    if (minutos > 0) return `há ${minutos} minuto${minutos > 1 ? "s" : ""}`;
    return "agora";
  }
}
