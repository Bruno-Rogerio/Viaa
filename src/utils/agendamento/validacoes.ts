// src/utils/agendamento/validacoes.ts
// Utilitários para validação de agendamento

import { HorarioDisponivel, Consulta } from "@/types/agenda";

// Configurações padrão do sistema
export const REGRAS_AGENDAMENTO = {
  // Temporais
  antecedenciaMinima: 2, // horas
  antecedenciaMaxima: 30, // dias
  duracaoConsultaPadrao: 50, // minutos
  intervaloEntreConsultas: 10, // minutos

  // Horários permitidos
  horarioMinimoSistema: "06:00",
  horarioMaximoSistema: "22:00",

  // Cancelamento
  antecedenciaCancelamento: 24, // horas
  limiteCancelamentosMes: 3,

  // Remarcação
  limiteRemarcacoes: 2,
};

// Tipos de validação
export interface ValidacaoAgendamento {
  valido: boolean;
  erros: string[];
  avisos: string[];
}

// Validar se uma data pode receber agendamentos
export function validarDataAgendamento(data: Date): ValidacaoAgendamento {
  const agora = new Date();
  const erros: string[] = [];
  const avisos: string[] = [];

  // Resetar horas para comparar apenas datas
  const dataLimpa = new Date(data);
  dataLimpa.setHours(0, 0, 0, 0);

  const agoraLimpo = new Date(agora);
  agoraLimpo.setHours(0, 0, 0, 0);

  // Não permitir datas passadas
  if (dataLimpa < agoraLimpo) {
    erros.push("Não é possível agendar em datas passadas");
  }

  // Verificar antecedência máxima
  const diasAdiante = Math.floor(
    (dataLimpa.getTime() - agoraLimpo.getTime()) / (1000 * 60 * 60 * 24)
  );
  if (diasAdiante > REGRAS_AGENDAMENTO.antecedenciaMaxima) {
    erros.push(
      `Agendamentos podem ser feitos com até ${REGRAS_AGENDAMENTO.antecedenciaMaxima} dias de antecedência`
    );
  }

  // Avisar se for muito próximo
  if (diasAdiante === 0) {
    avisos.push(
      "Agendamento para hoje - verifique a disponibilidade de horário"
    );
  }

  return {
    valido: erros.length === 0,
    erros,
    avisos,
  };
}

// Validar horário específico
export function validarHorarioAgendamento(
  dataHora: Date,
  horariosDisponiveis: HorarioDisponivel[],
  consultasExistentes: Consulta[] = []
): ValidacaoAgendamento {
  const erros: string[] = [];
  const avisos: string[] = [];
  const agora = new Date();

  // Verificar se está no passado
  if (dataHora < agora) {
    erros.push("Não é possível agendar em horários passados");
    return { valido: false, erros, avisos };
  }

  // Verificar antecedência mínima
  const horasAntecedencia =
    (dataHora.getTime() - agora.getTime()) / (1000 * 60 * 60);
  if (horasAntecedencia < REGRAS_AGENDAMENTO.antecedenciaMinima) {
    erros.push(
      `É necessário agendar com pelo menos ${REGRAS_AGENDAMENTO.antecedenciaMinima} horas de antecedência`
    );
  }

  // Verificar se está dentro do horário do sistema
  const hora = dataHora.getHours();
  const minutos = dataHora.getMinutes();
  const horaFormatada = `${hora.toString().padStart(2, "0")}:${minutos
    .toString()
    .padStart(2, "0")}`;

  if (
    horaFormatada < REGRAS_AGENDAMENTO.horarioMinimoSistema ||
    horaFormatada >= REGRAS_AGENDAMENTO.horarioMaximoSistema
  ) {
    erros.push(
      `Horários disponíveis apenas entre ${REGRAS_AGENDAMENTO.horarioMinimoSistema} e ${REGRAS_AGENDAMENTO.horarioMaximoSistema}`
    );
  }

  // Verificar se o dia da semana tem horários configurados
  const diaSemana = dataHora.getDay();
  const horariosNoDia = horariosDisponiveis.filter(
    (h) => h.dia_semana === diaSemana && h.ativo
  );

  if (horariosNoDia.length === 0) {
    erros.push("O profissional não atende neste dia da semana");
    return { valido: false, erros, avisos };
  }

  // Verificar se está dentro do horário do profissional
  const dentroDoHorario = horariosNoDia.some((h) => {
    return horaFormatada >= h.hora_inicio && horaFormatada < h.hora_fim;
  });

  if (!dentroDoHorario) {
    erros.push("Horário fora do expediente do profissional");
  }

  // Verificar conflitos com consultas existentes
  const conflito = verificarConflitoHorario(dataHora, consultasExistentes);
  if (conflito) {
    erros.push("Já existe uma consulta agendada neste horário");
  }

  return {
    valido: erros.length === 0,
    erros,
    avisos,
  };
}

// Verificar se há conflito de horário
export function verificarConflitoHorario(
  dataHora: Date,
  consultasExistentes: Consulta[],
  duracaoMinutos: number = REGRAS_AGENDAMENTO.duracaoConsultaPadrao
): boolean {
  const inicio = new Date(dataHora);
  const fim = new Date(dataHora);
  fim.setMinutes(
    fim.getMinutes() +
      duracaoMinutos +
      REGRAS_AGENDAMENTO.intervaloEntreConsultas
  );

  return consultasExistentes.some((consulta) => {
    // Apenas consultas não canceladas
    if (consulta.status === "cancelada" || consulta.status === "rejeitada") {
      return false;
    }

    const consultaInicio = new Date(consulta.data_inicio);
    const consultaFim = new Date(consulta.data_fim);

    // Adicionar intervalo de segurança
    consultaFim.setMinutes(
      consultaFim.getMinutes() + REGRAS_AGENDAMENTO.intervaloEntreConsultas
    );

    // Verificar sobreposição
    return inicio < consultaFim && fim > consultaInicio;
  });
}

// Gerar slots disponíveis para um dia
export function gerarSlotsDisponiveis(
  data: Date,
  horariosDisponiveis: HorarioDisponivel[],
  consultasExistentes: Consulta[],
  duracaoMinutos: number = REGRAS_AGENDAMENTO.duracaoConsultaPadrao
): Date[] {
  const slots: Date[] = [];
  const diaSemana = data.getDay();

  // Filtrar horários do dia
  const horariosNoDia = horariosDisponiveis.filter(
    (h) => h.dia_semana === diaSemana && h.ativo
  );

  if (horariosNoDia.length === 0) return slots;

  // Para cada horário configurado
  horariosNoDia.forEach((horario) => {
    const [horaInicio, minutoInicio] = horario.hora_inicio
      .split(":")
      .map(Number);
    const [horaFim, minutoFim] = horario.hora_fim.split(":").map(Number);

    // Criar slot inicial
    const slotAtual = new Date(data);
    slotAtual.setHours(horaInicio, minutoInicio, 0, 0);

    const horarioFim = new Date(data);
    horarioFim.setHours(horaFim, minutoFim, 0, 0);

    // Gerar slots com base na duração
    while (slotAtual < horarioFim) {
      const fimSlot = new Date(slotAtual);
      fimSlot.setMinutes(fimSlot.getMinutes() + duracaoMinutos);

      // Verificar se cabe no horário
      if (fimSlot <= horarioFim) {
        // Validar o slot
        const validacao = validarHorarioAgendamento(
          slotAtual,
          horariosDisponiveis,
          consultasExistentes
        );

        if (validacao.valido) {
          slots.push(new Date(slotAtual));
        }
      }

      // Próximo slot (com intervalo)
      slotAtual.setMinutes(
        slotAtual.getMinutes() +
          duracaoMinutos +
          REGRAS_AGENDAMENTO.intervaloEntreConsultas
      );
    }
  });

  return slots.sort((a, b) => a.getTime() - b.getTime());
}

// Formatar slot para exibição
export function formatarSlotHorario(data: Date): string {
  const horas = data.getHours().toString().padStart(2, "0");
  const minutos = data.getMinutes().toString().padStart(2, "0");
  return `${horas}:${minutos}`;
}

// Agrupar slots por período
export function agruparSlotsPorPeriodo(slots: Date[]): {
  manha: Date[];
  tarde: Date[];
  noite: Date[];
} {
  return {
    manha: slots.filter((s) => s.getHours() < 12),
    tarde: slots.filter((s) => s.getHours() >= 12 && s.getHours() < 18),
    noite: slots.filter((s) => s.getHours() >= 18),
  };
}
