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

  // Callbacks para as ações da agenda
  const handleConsultaClick = (consulta: Consulta) => {
    setConsultaSelecionada(consulta);
    console.log("Consulta clicada:", consulta);
    // TODO: Abrir modal de detalhes da consulta
  };

  const handleNovaConsulta = (data?: Date) => {
    console.log("Nova consulta:", data);
    // TODO: Abrir modal de criação de consulta
    // Se data foi passada, pré-preencher com essa data
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
    // TODO: Confirmar consulta (ou abrir modal se necessário)
  };

  return (
    <div className="space-y-6">
      {/* Estatísticas rápidas (opcional) */}
      {ehProfissional && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
            <h3 className="text-lg font-semibold mb-2">Consultas Hoje</h3>
            <p className="text-3xl font-bold">3</p>
          </div>
          <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl p-6 text-white">
            <h3 className="text-lg font-semibold mb-2">Esta Semana</h3>
            <p className="text-3xl font-bold">12</p>
          </div>
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
            <h3 className="text-lg font-semibold mb-2">Receita Mês</h3>
            <p className="text-3xl font-bold">R$ 2.840</p>
          </div>
          <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-xl p-6 text-white">
            <h3 className="text-lg font-semibold mb-2">Taxa Presença</h3>
            <p className="text-3xl font-bold">94%</p>
          </div>
        </div>
      )}

      {/* Componente principal da agenda */}
      <Agenda
        tipoUsuario={ehProfissional ? "profissional" : "paciente"}
        usuarioId={user.id}
        modoVisualizacao="mes"
        altura="h-[700px]"
        onConsultaClick={handleConsultaClick}
        onNovaConsulta={handleNovaConsulta}
        onEditarConsulta={handleEditarConsulta}
        onCancelarConsulta={handleCancelarConsulta}
        onConfirmarConsulta={handleConfirmarConsulta}
        // Permissões baseadas no tipo de usuário
        podeAgendar={ehProfissional} // Profissionais podem agendar, pacientes só veem
        podeCancelar={true}
        podeEditar={ehProfissional}
        podeVerDetalhes={true}
        className="shadow-lg"
      />

      {/* TODO: Modais */}
      {/* Modal de detalhes da consulta */}
      {/* Modal de nova consulta */}
      {/* Modal de edição de consulta */}
      {/* Modal de cancelamento */}
    </div>
  );
}
