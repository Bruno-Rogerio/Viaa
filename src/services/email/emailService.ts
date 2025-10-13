// src/services/email/emailService.ts

import nodemailer from "nodemailer";
import { DadosTemplateEmail, TipoLembrete } from "@/types/notificacao";

// Configurações do serviço de email
const EMAIL_CONFIG = {
  host: process.env.EMAIL_HOST || "smtp.example.com",
  port: parseInt(process.env.EMAIL_PORT || "587"),
  secure: process.env.EMAIL_SECURE === "true",
  auth: {
    user: process.env.EMAIL_USER || "user@example.com",
    pass: process.env.EMAIL_PASSWORD || "password",
  },
  from:
    process.env.EMAIL_FROM || "Sistema de Agendamento <sistema@example.com>",
};

// Inicializar o transportador de email
const transporter = nodemailer.createTransport({
  host: EMAIL_CONFIG.host,
  port: EMAIL_CONFIG.port,
  secure: EMAIL_CONFIG.secure,
  auth: EMAIL_CONFIG.auth,
});

// Função para obter o template de email com base no tipo
function obterTemplate(
  tipoLembrete: TipoLembrete,
  dados: DadosTemplateEmail
): { assunto: string; corpo: string } {
  // Formatação da data para exibição
  const dataConsulta = new Date(dados.consulta.data_inicio);
  const dataFormatada = dataConsulta.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const horaInicio = dataConsulta.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const horaFim = new Date(dados.consulta.data_fim).toLocaleTimeString(
    "pt-BR",
    {
      hour: "2-digit",
      minute: "2-digit",
    }
  );

  switch (tipoLembrete) {
    case TipoLembrete.AGENDAMENTO:
      return {
        assunto: `Consulta agendada com ${dados.profissional.nome} ${dados.profissional.sobrenome}`,
        corpo: `
          <h2>Seu agendamento foi recebido!</h2>
          <p>Olá, ${dados.paciente.nome}!</p>
          <p>Seu agendamento foi recebido com sucesso e está aguardando confirmação do profissional.</p>
          <p><strong>Data:</strong> ${dataFormatada}</p>
          <p><strong>Horário:</strong> ${horaInicio} às ${horaFim}</p>
          <p><strong>Profissional:</strong> ${dados.profissional.nome} ${dados.profissional.sobrenome} (${dados.profissional.especialidade})</p>
          <p>Você receberá uma notificação assim que sua consulta for confirmada.</p>
          <p>Atenciosamente,<br>Equipe de Agendamento</p>
        `,
      };

    case TipoLembrete.CONFIRMACAO:
      return {
        assunto: `Consulta confirmada com ${dados.profissional.nome} ${dados.profissional.sobrenome}`,
        corpo: `
          <h2>Sua consulta foi confirmada!</h2>
          <p>Olá, ${dados.paciente.nome}!</p>
          <p>Sua consulta foi <strong>confirmada</strong> pelo profissional.</p>
          <p><strong>Data:</strong> ${dataFormatada}</p>
          <p><strong>Horário:</strong> ${horaInicio} às ${horaFim}</p>
          <p><strong>Profissional:</strong> ${dados.profissional.nome} ${
          dados.profissional.sobrenome
        } (${dados.profissional.especialidade})</p>
          ${
            dados.consulta.tipo === "online" && dados.consulta.link_videochamada
              ? `<p><strong>Link para consulta online:</strong> <a href="${dados.consulta.link_videochamada}">${dados.consulta.link_videochamada}</a></p>`
              : ""
          }
          <p>Atenciosamente,<br>Equipe de Agendamento</p>
        `,
      };

    case TipoLembrete.LEMBRETE_24H:
      return {
        assunto: `Lembrete: Consulta amanhã com ${dados.profissional.nome} ${dados.profissional.sobrenome}`,
        corpo: `
          <h2>Lembrete de consulta</h2>
          <p>Olá, ${dados.paciente.nome}!</p>
          <p>Este é um lembrete que você tem uma consulta agendada para <strong>amanhã</strong>.</p>
          <p><strong>Data:</strong> ${dataFormatada}</p>
          <p><strong>Horário:</strong> ${horaInicio} às ${horaFim}</p>
          <p><strong>Profissional:</strong> ${dados.profissional.nome} ${
          dados.profissional.sobrenome
        } (${dados.profissional.especialidade})</p>
          ${
            dados.consulta.tipo === "online" && dados.consulta.link_videochamada
              ? `<p><strong>Link para consulta online:</strong> <a href="${dados.consulta.link_videochamada}">${dados.consulta.link_videochamada}</a></p>`
              : ""
          }
          <p>Atenciosamente,<br>Equipe de Agendamento</p>
        `,
      };

    case TipoLembrete.LEMBRETE_1H:
      return {
        assunto: `Lembrete: Consulta em 1 hora com ${dados.profissional.nome} ${dados.profissional.sobrenome}`,
        corpo: `
          <h2>Sua consulta começa em 1 hora</h2>
          <p>Olá, ${dados.paciente.nome}!</p>
          <p>Este é um lembrete que você tem uma consulta agendada para <strong>daqui 1 hora</strong>.</p>
          <p><strong>Horário:</strong> ${horaInicio} às ${horaFim}</p>
          <p><strong>Profissional:</strong> ${dados.profissional.nome} ${
          dados.profissional.sobrenome
        }</p>
          ${
            dados.consulta.tipo === "online" && dados.consulta.link_videochamada
              ? `<p><strong>Link para consulta online:</strong> <a href="${dados.consulta.link_videochamada}">${dados.consulta.link_videochamada}</a></p>`
              : ""
          }
          <p>Por favor, prepare-se para a consulta.</p>
          <p>Atenciosamente,<br>Equipe de Agendamento</p>
        `,
      };

    case TipoLembrete.CANCELAMENTO:
      return {
        assunto: `Consulta cancelada com ${dados.profissional.nome} ${dados.profissional.sobrenome}`,
        corpo: `
          <h2>Consulta cancelada</h2>
          <p>Olá, ${dados.paciente.nome}!</p>
          <p>Informamos que a consulta agendada para <strong>${dataFormatada}</strong>, às <strong>${horaInicio}</strong> foi cancelada.</p>
          <p><strong>Profissional:</strong> ${dados.profissional.nome} ${dados.profissional.sobrenome}</p>
          <p>Entre em contato conosco para mais informações ou para reagendar.</p>
          <p>Atenciosamente,<br>Equipe de Agendamento</p>
        `,
      };

    default:
      return {
        assunto: `Informações sobre sua consulta`,
        corpo: `
          <h2>Informações sobre sua consulta</h2>
          <p>Olá, ${dados.paciente.nome}!</p>
          <p><strong>Data:</strong> ${dataFormatada}</p>
          <p><strong>Horário:</strong> ${horaInicio} às ${horaFim}</p>
          <p><strong>Profissional:</strong> ${dados.profissional.nome} ${dados.profissional.sobrenome} (${dados.profissional.especialidade})</p>
          <p>Atenciosamente,<br>Equipe de Agendamento</p>
        `,
      };
  }
}

// Função para enviar email
export async function enviarEmail(
  destinatario: string,
  tipoLembrete: TipoLembrete,
  dados: DadosTemplateEmail
): Promise<boolean> {
  try {
    const template = obterTemplate(tipoLembrete, dados);

    const mailOptions = {
      from: EMAIL_CONFIG.from,
      to: destinatario,
      subject: template.assunto,
      html: template.corpo,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email enviado: %s", info.messageId);
    return true;
  } catch (error) {
    console.error("Erro ao enviar email:", error);
    return false;
  }
}

// Função para notificar o profissional sobre novo agendamento
export async function notificarProfissionalNovoAgendamento(
  emailProfissional: string,
  dados: DadosTemplateEmail
): Promise<boolean> {
  try {
    const dataConsulta = new Date(dados.consulta.data_inicio);
    const dataFormatada = dataConsulta.toLocaleDateString("pt-BR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    const horaInicio = dataConsulta.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });

    const horaFim = new Date(dados.consulta.data_fim).toLocaleTimeString(
      "pt-BR",
      {
        hour: "2-digit",
        minute: "2-digit",
      }
    );

    const mailOptions = {
      from: EMAIL_CONFIG.from,
      to: emailProfissional,
      subject: `Novo agendamento de ${dados.paciente.nome} ${dados.paciente.sobrenome}`,
      html: `
        <h2>Novo agendamento recebido!</h2>
        <p>Olá, ${dados.profissional.nome}!</p>
        <p>Você recebeu um novo agendamento de <strong>${dados.paciente.nome} ${dados.paciente.sobrenome}</strong>.</p>
        <p><strong>Data:</strong> ${dataFormatada}</p>
        <p><strong>Horário:</strong> ${horaInicio} às ${horaFim}</p>
        <p>Por favor, acesse seu dashboard para confirmar ou rejeitar este agendamento.</p>
        <p>Atenciosamente,<br>Equipe de Agendamento</p>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email enviado para profissional: %s", info.messageId);
    return true;
  } catch (error) {
    console.error("Erro ao notificar profissional:", error);
    return false;
  }
}
