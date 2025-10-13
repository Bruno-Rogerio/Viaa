// src/services/email/resendService.ts

import { Resend } from "resend";
import { DadosTemplateEmail, TipoLembrete } from "@/types/notificacao";

const resend = new Resend(process.env.RESEND_API_KEY);

// Cores da marca Viaa (extraídas do logo)
const COLORS = {
  primary: "#4A9FD8", // Azul
  secondary: "#B084B5", // Roxo
  accent: "#E8A5A5", // Rosa
  text: "#2C3E50",
  lightGray: "#F7F9FC",
  border: "#E1E8ED",
};

// Template base HTML com a identidade visual da Viaa
function templateBase(conteudo: string): string {
  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Viaa - Plataforma de Saúde Mental</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f7f9fc;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f7f9fc; padding: 40px 0;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              
              <!-- Header com gradiente -->
              <tr>
                <td style="background: linear-gradient(135deg, ${
                  COLORS.primary
                } 0%, ${COLORS.secondary} 50%, ${
    COLORS.accent
  } 100%); padding: 30px; text-align: center;">
                  <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: 300; letter-spacing: 2px;">Viaa</h1>
                  <p style="color: #ffffff; margin: 5px 0 0 0; font-size: 14px; opacity: 0.9;">Plataforma de Saúde Mental</p>
                </td>
              </tr>

              <!-- Conteúdo -->
              <tr>
                <td style="padding: 40px 30px;">
                  ${conteudo}
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="background-color: ${
                  COLORS.lightGray
                }; padding: 30px; text-align: center; border-top: 1px solid ${
    COLORS.border
  };">
                  <p style="color: #7f8c8d; font-size: 12px; margin: 0 0 10px 0;">
                    Este é um e-mail automático, por favor não responda.
                  </p>
                  <p style="color: #7f8c8d; font-size: 12px; margin: 0;">
                    © ${new Date().getFullYear()} Viaa - Todos os direitos reservados
                  </p>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

// Botão estilizado
function botao(texto: string, url: string): string {
  return `
    <table width="100%" cellpadding="0" cellspacing="0" style="margin: 25px 0;">
      <tr>
        <td align="center">
          <a href="${url}" style="display: inline-block; background: linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.secondary} 100%); color: #ffffff; padding: 14px 40px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            ${texto}
          </a>
        </td>
      </tr>
    </table>
  `;
}

// Card de informações da consulta
function cardConsulta(dados: DadosTemplateEmail): string {
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

  return `
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: ${
      COLORS.lightGray
    }; border-radius: 8px; margin: 20px 0; border-left: 4px solid ${
    COLORS.primary
  };">
      <tr>
        <td style="padding: 20px;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding-bottom: 12px;">
                <span style="color: ${
                  COLORS.text
                }; font-size: 14px; font-weight: 600;">📅 Data</span><br>
                <span style="color: ${
                  COLORS.text
                }; font-size: 16px;">${dataFormatada}</span>
              </td>
            </tr>
            <tr>
              <td style="padding-bottom: 12px;">
                <span style="color: ${
                  COLORS.text
                }; font-size: 14px; font-weight: 600;">⏰ Horário</span><br>
                <span style="color: ${
                  COLORS.text
                }; font-size: 16px;">${horaInicio} às ${horaFim}</span>
              </td>
            </tr>
            <tr>
              <td style="padding-bottom: 12px;">
                <span style="color: ${
                  COLORS.text
                }; font-size: 14px; font-weight: 600;">👨‍⚕️ Profissional</span><br>
                <span style="color: ${COLORS.text}; font-size: 16px;">${
    dados.profissional.nome
  } ${dados.profissional.sobrenome}</span><br>
                <span style="color: #7f8c8d; font-size: 14px;">${
                  dados.profissional.especialidade
                }</span>
              </td>
            </tr>
            ${
              dados.consulta.tipo === "online" &&
              dados.consulta.link_videochamada
                ? `
            <tr>
              <td>
                <span style="color: ${COLORS.text}; font-size: 14px; font-weight: 600;">🎥 Tipo</span><br>
                <span style="color: ${COLORS.text}; font-size: 16px;">Consulta Online</span>
              </td>
            </tr>
            `
                : ""
            }
          </table>
        </td>
      </tr>
    </table>
  `;
}

// Templates de email por tipo
function obterConteudoEmail(
  tipo: TipoLembrete,
  dados: DadosTemplateEmail
): string {
  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL || "https://viaa-six.vercel.app";

  switch (tipo) {
    case TipoLembrete.AGENDAMENTO:
      return `
        <h2 style="color: ${
          COLORS.text
        }; margin: 0 0 20px 0;">Agendamento Recebido! 🎉</h2>
        <p style="color: ${COLORS.text}; font-size: 16px; line-height: 1.6;">
          Olá, <strong>${dados.paciente.nome}</strong>!
        </p>
        <p style="color: ${COLORS.text}; font-size: 16px; line-height: 1.6;">
          Seu agendamento foi recebido com sucesso e está <strong>aguardando confirmação</strong> do profissional.
        </p>
        ${cardConsulta(dados)}
        <p style="color: ${COLORS.text}; font-size: 16px; line-height: 1.6;">
          Você receberá uma notificação assim que o profissional confirmar sua consulta.
        </p>
        ${botao("Acessar Minhas Consultas", `${appUrl}/dashboard/consultas`)}
      `;

    case TipoLembrete.CONFIRMACAO:
      return `
        <h2 style="color: ${
          COLORS.text
        }; margin: 0 0 20px 0;">Consulta Confirmada! ✅</h2>
        <p style="color: ${COLORS.text}; font-size: 16px; line-height: 1.6;">
          Olá, <strong>${dados.paciente.nome}</strong>!
        </p>
        <p style="color: ${COLORS.text}; font-size: 16px; line-height: 1.6;">
          Ótimas notícias! Sua consulta foi <strong>confirmada</strong> pelo profissional.
        </p>
        ${cardConsulta(dados)}
        ${
          dados.consulta.tipo === "online" && dados.consulta.link_videochamada
            ? `
        <p style="color: ${COLORS.text}; font-size: 16px; line-height: 1.6;">
          <strong>Link da consulta online:</strong><br>
          <a href="${dados.consulta.link_videochamada}" style="color: ${COLORS.primary}; text-decoration: none;">${dados.consulta.link_videochamada}</a>
        </p>
        `
            : ""
        }
        ${botao("Ver Detalhes da Consulta", `${appUrl}/dashboard/consultas`)}
      `;

    case TipoLembrete.LEMBRETE_24H:
      return `
        <h2 style="color: ${
          COLORS.text
        }; margin: 0 0 20px 0;">Lembrete: Consulta Amanhã 📅</h2>
        <p style="color: ${COLORS.text}; font-size: 16px; line-height: 1.6;">
          Olá, <strong>${dados.paciente.nome}</strong>!
        </p>
        <p style="color: ${COLORS.text}; font-size: 16px; line-height: 1.6;">
          Este é um lembrete de que você tem uma consulta agendada para <strong>amanhã</strong>.
        </p>
        ${cardConsulta(dados)}
        ${
          dados.consulta.tipo === "online" && dados.consulta.link_videochamada
            ? `
        <p style="color: ${COLORS.text}; font-size: 16px; line-height: 1.6;">
          <strong>Link da consulta online:</strong><br>
          <a href="${dados.consulta.link_videochamada}" style="color: ${COLORS.primary}; text-decoration: none;">${dados.consulta.link_videochamada}</a>
        </p>
        `
            : ""
        }
        ${botao("Preparar-me para a Consulta", `${appUrl}/dashboard/consultas`)}
      `;

    case TipoLembrete.LEMBRETE_1H:
      return `
        <h2 style="color: ${
          COLORS.text
        }; margin: 0 0 20px 0;">Sua Consulta Começa em 1 Hora! ⏰</h2>
        <p style="color: ${COLORS.text}; font-size: 16px; line-height: 1.6;">
          Olá, <strong>${dados.paciente.nome}</strong>!
        </p>
        <p style="color: ${COLORS.text}; font-size: 16px; line-height: 1.6;">
          Este é um lembrete de que sua consulta começará em <strong>1 hora</strong>.
        </p>
        ${cardConsulta(dados)}
        ${
          dados.consulta.tipo === "online" && dados.consulta.link_videochamada
            ? `
        <p style="color: ${COLORS.text}; font-size: 16px; line-height: 1.6;">
          <strong>Link da consulta online:</strong><br>
          <a href="${dados.consulta.link_videochamada}" style="color: ${
                COLORS.primary
              }; text-decoration: none; font-size: 18px; font-weight: 600;">${
                dados.consulta.link_videochamada
              }</a>
        </p>
        ${botao("Entrar na Consulta", dados.consulta.link_videochamada)}
        `
            : botao("Ver Detalhes", `${appUrl}/dashboard/consultas`)
        }
      `;

    case TipoLembrete.CANCELAMENTO:
      return `
        <h2 style="color: ${
          COLORS.text
        }; margin: 0 0 20px 0;">Consulta Cancelada ❌</h2>
        <p style="color: ${COLORS.text}; font-size: 16px; line-height: 1.6;">
          Olá, <strong>${dados.paciente.nome}</strong>!
        </p>
        <p style="color: ${COLORS.text}; font-size: 16px; line-height: 1.6;">
          Informamos que a consulta abaixo foi <strong>cancelada</strong>.
        </p>
        ${cardConsulta(dados)}
        <p style="color: ${COLORS.text}; font-size: 16px; line-height: 1.6;">
          Entre em contato conosco se precisar de mais informações ou para reagendar.
        </p>
        ${botao("Agendar Nova Consulta", `${appUrl}/dashboard/agendar`)}
      `;

    default:
      return "";
  }
}

// Função principal para enviar email
export async function enviarEmailResend(
  destinatario: string,
  tipoLembrete: TipoLembrete,
  dados: DadosTemplateEmail
): Promise<boolean> {
  try {
    const conteudo = obterConteudoEmail(tipoLembrete, dados);
    const htmlCompleto = templateBase(conteudo);

    // Definir assunto baseado no tipo
    let assunto = "";
    switch (tipoLembrete) {
      case TipoLembrete.AGENDAMENTO:
        assunto = `Agendamento recebido - ${dados.profissional.nome} ${dados.profissional.sobrenome}`;
        break;
      case TipoLembrete.CONFIRMACAO:
        assunto = `Consulta confirmada - ${dados.profissional.nome} ${dados.profissional.sobrenome}`;
        break;
      case TipoLembrete.LEMBRETE_24H:
        assunto = `Lembrete: Consulta amanhã - ${dados.profissional.nome} ${dados.profissional.sobrenome}`;
        break;
      case TipoLembrete.LEMBRETE_1H:
        assunto = `Sua consulta começa em 1 hora!`;
        break;
      case TipoLembrete.CANCELAMENTO:
        assunto = `Consulta cancelada - ${dados.profissional.nome} ${dados.profissional.sobrenome}`;
        break;
      default:
        assunto = "Notificação da Viaa";
    }

    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || "Viaa <onboarding@resend.dev>",
      to: destinatario,
      subject: assunto,
      html: htmlCompleto,
    });

    if (error) {
      console.error("❌ Erro ao enviar email:", error);
      return false;
    }

    console.log("✅ Email enviado com sucesso:", data?.id);
    return true;
  } catch (error) {
    console.error("❌ Erro ao enviar email:", error);
    return false;
  }
}

// Email para notificar profissional sobre novo agendamento
export async function notificarProfissionalNovoAgendamentoResend(
  emailProfissional: string,
  dados: DadosTemplateEmail
): Promise<boolean> {
  try {
    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL || "https://viaa-six.vercel.app";
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

    const conteudo = `
      <h2 style="color: ${
        COLORS.text
      }; margin: 0 0 20px 0;">Novo Agendamento Recebido! 🎉</h2>
      <p style="color: ${COLORS.text}; font-size: 16px; line-height: 1.6;">
        Olá, <strong>${dados.profissional.nome}</strong>!
      </p>
      <p style="color: ${COLORS.text}; font-size: 16px; line-height: 1.6;">
        Você recebeu um novo agendamento de <strong>${dados.paciente.nome} ${
      dados.paciente.sobrenome
    }</strong>.
      </p>
      
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: ${
        COLORS.lightGray
      }; border-radius: 8px; margin: 20px 0; border-left: 4px solid ${
      COLORS.secondary
    };">
        <tr>
          <td style="padding: 20px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding-bottom: 12px;">
                  <span style="color: ${
                    COLORS.text
                  }; font-size: 14px; font-weight: 600;">👤 Paciente</span><br>
                  <span style="color: ${COLORS.text}; font-size: 16px;">${
      dados.paciente.nome
    } ${dados.paciente.sobrenome}</span>
                </td>
              </tr>
              <tr>
                <td style="padding-bottom: 12px;">
                  <span style="color: ${
                    COLORS.text
                  }; font-size: 14px; font-weight: 600;">📅 Data</span><br>
                  <span style="color: ${
                    COLORS.text
                  }; font-size: 16px;">${dataFormatada}</span>
                </td>
              </tr>
              <tr>
                <td>
                  <span style="color: ${
                    COLORS.text
                  }; font-size: 14px; font-weight: 600;">⏰ Horário</span><br>
                  <span style="color: ${
                    COLORS.text
                  }; font-size: 16px;">${horaInicio}</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>

      <p style="color: ${COLORS.text}; font-size: 16px; line-height: 1.6;">
        Por favor, acesse seu dashboard para <strong>confirmar ou rejeitar</strong> este agendamento.
      </p>
      ${botao("Gerenciar Agendamento", `${appUrl}/dashboard/consultas`)}
    `;

    const htmlCompleto = templateBase(conteudo);

    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || "Viaa <onboarding@resend.dev>",
      to: emailProfissional,
      subject: `Novo agendamento de ${dados.paciente.nome} ${dados.paciente.sobrenome}`,
      html: htmlCompleto,
    });

    if (error) {
      console.error("❌ Erro ao notificar profissional:", error);
      return false;
    }

    console.log("✅ Profissional notificado com sucesso:", data?.id);
    return true;
  } catch (error) {
    console.error("❌ Erro ao notificar profissional:", error);
    return false;
  }
}
