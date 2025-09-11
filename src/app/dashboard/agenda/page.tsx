// viaa/src/app/dashboard/agenda/page.tsx

"use client";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Agenda from "@/components/dashboard/common/Agenda";
import type { Consulta } from "@/types/agenda";

export default function AgendaPage() {
  const { user, profile } = useAuth();
  const [consultaSelecionada, setConsultaSelecionada] =
    useState<Consulta | null>(null);

  // Se não tem usuário ou perfil, mostrar loading ou erro
  if (!user || !profile) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Minha Agenda</h1>
        <p className="text-gray-600">Carregando...</p>
      </div>
    );
  }

  // Verificar se é profissional
  const ehProfissional = profile.tipo === "profissional";

  // Para profissionais, sempre mostrar SUA própria agenda
  // Para pacientes, seria agenda de profissional específico (implementar depois)
  const profissionalId = ehProfissional ? user.id : "outro-profissional-id";

  // Callbacks para as ações da agenda
  const handleConsultaClick = (consulta: Consulta) => {
    setConsultaSelecionada(consulta);
    console.log("Consulta clicada:", consulta);
  };

  const handleEditarConsulta = (consulta: Consulta) => {
    console.log("Editar consulta:", consulta);
    // TODO: Abrir modal de edição da consulta
  };

  const handleCancelarConsulta = (consulta: Consulta) => {
    console.log("Cancelar consulta:", consulta);
    // TODO: Abrir modal de confirmação de cancelamento
  };

  const handleConfirmarConsulta = (consulta: Consulta) => {
    console.log("Confirmar consulta:", consulta);
    // TODO: Confirmar consulta via API
  };

  const handleRejeitarConsulta = (consulta: Consulta) => {
    console.log("Rejeitar consulta:", consulta);
    // TODO: Rejeitar consulta via API (com modal para motivo)
  };

  const handleIniciarConsulta = (consulta: Consulta) => {
    console.log("Iniciar consulta:", consulta);
    // TODO: Marcar consulta como em andamento e abrir link/modal
  };

  const handleFinalizarConsulta = (consulta: Consulta) => {
    console.log("Finalizar consulta:", consulta);
    // TODO: Finalizar consulta e abrir modal para observações
  };

  const handleSolicitarConsulta = (data: Date, horario: string) => {
    console.log("Solicitar consulta:", { data, horario });
    // TODO: Abrir modal de solicitação (já implementado no componente)
  };

  return (
    <div className="space-y-6">
      {/* Estatísticas rápidas - DIFERENTES por tipo de usuário */}
      {ehProfissional && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
            <h3 className="text-lg font-semibold mb-2">Consultas Hoje</h3>
            <p className="text-3xl font-bold">3</p>
          </div>

          {/* Card específico para consultas pendentes de confirmação */}
          <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl p-6 text-white">
            <h3 className="text-lg font-semibold mb-2">Pendentes</h3>
            <p className="text-3xl font-bold">2</p>
            <p className="text-sm opacity-90">Aguardando confirmação</p>
          </div>

          <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl p-6 text-white">
            <h3 className="text-lg font-semibold mb-2">Esta Semana</h3>
            <p className="text-3xl font-bold">12</p>
          </div>

          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
            <h3 className="text-lg font-semibold mb-2">Receita Mês</h3>
            <p className="text-3xl font-bold">R$ 2.840</p>
          </div>
        </div>
      )}

      {/* Para pacientes - estatísticas diferentes */}
      {!ehProfissional && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
            <h3 className="text-lg font-semibold mb-2">Próxima Consulta</h3>
            <p className="text-lg font-bold">Hoje às 14:00</p>
            <p className="text-sm opacity-90">Dr. João Silva</p>
          </div>

          <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl p-6 text-white">
            <h3 className="text-lg font-semibold mb-2">Este Mês</h3>
            <p className="text-3xl font-bold">4</p>
            <p className="text-sm opacity-90">Consultas realizadas</p>
          </div>

          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
            <h3 className="text-lg font-semibold mb-2">Investimento</h3>
            <p className="text-3xl font-bold">R$ 720</p>
            <p className="text-sm opacity-90">Total do mês</p>
          </div>
        </div>
      )}

      {/* Componente principal da agenda - NOVO COMPONENTE INTELIGENTE */}
      <Agenda
        tipoUsuario={ehProfissional ? "profissional" : "paciente"}
        usuarioId={user.id}
        profissionalId={profissionalId}
        // Informações do profissional (quando necessário)
        profissionalInfo={
          !ehProfissional
            ? {
                nome: "João",
                sobrenome: "Silva",
                especialidades:
                  "Psicologia Clínica, Terapia Cognitivo-Comportamental",
                foto_perfil_url: undefined,
                valor_sessao: 180,
                crp: "06/123456",
                verificado: true,
              }
            : undefined
        }
        modoVisualizacao="mes"
        altura="h-[700px]"
        onConsultaClick={handleConsultaClick}
        onEditarConsulta={handleEditarConsulta}
        onCancelarConsulta={handleCancelarConsulta}
        onConfirmarConsulta={handleConfirmarConsulta}
        onRejeitarConsulta={handleRejeitarConsulta}
        onIniciarConsulta={handleIniciarConsulta}
        onFinalizarConsulta={handleFinalizarConsulta}
        onSolicitarConsulta={handleSolicitarConsulta}
        className="shadow-lg"
      />

      {/* TODO: Modais específicos para o novo fluxo */}
      {/* Modal de detalhes da consulta */}
      {/* Modal de edição de consulta (profissionais) */}
      {/* Modal de confirmação de cancelamento */}
      {/* Modal de motivo de rejeição (profissionais) */}
      {/* Modal de observações finais (profissionais) */}
    </div>
  );
}
