// src/app/dashboard/agenda/page.tsx

"use client";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import ModalHorariosDisponiveis from "@/components/dashboard/professional/agenda/ModalHorariosDisponiveis";

// Import direto do componente Agenda
import Agenda from "@/components/dashboard/common/Agenda";

// Tipos necessários
import type { Consulta } from "@/types/agenda";

// Ícone de configuração
const CogIcon = ({ className = "w-5 h-5" }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.893.149c-.425.07-.765.383-.93.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 01-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.397.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 01-.12-1.45l.527-.737c.25-.35.273-.806.108-1.204-.165-.397-.505-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.107-1.204l-.527-.738a1.125 1.125 0 01.12-1.45l.773-.773a1.125 1.125 0 011.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
    />
  </svg>
);

export default function AgendaPage() {
  const { user, profile } = useAuth();
  const [modalHorariosAberto, setModalHorariosAberto] = useState(false);
  const [consultaSelecionada, setConsultaSelecionada] =
    useState<Consulta | null>(null);

  // Se não tem usuário ou perfil, mostrar loading
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
  };

  const handleNovaConsulta = (data?: Date) => {
    console.log("Nova consulta:", data);
  };

  const handleEditarConsulta = (consulta: Consulta) => {
    console.log("Editar consulta:", consulta);
  };

  const handleCancelarConsulta = (consulta: Consulta) => {
    console.log("Cancelar consulta:", consulta);
  };

  const handleConfirmarConsulta = (consulta: Consulta) => {
    console.log("Confirmar consulta:", consulta);
  };

  return (
    <div className="space-y-6">
      {/* Header da página */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {ehProfissional
                ? "Minha Agenda Profissional"
                : "Minhas Consultas"}
            </h1>
            <p className="text-gray-600">
              {ehProfissional
                ? "Gerencie suas consultas e configure seus horários disponíveis"
                : "Acompanhe suas consultas agendadas e histórico"}
            </p>
          </div>

          {/* Botões de ação para profissionais */}
          {ehProfissional && (
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setModalHorariosAberto(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg hover:from-purple-600 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg"
              >
                <CogIcon className="w-5 h-5" />
                <span className="font-medium">Configurar Horários</span>
              </button>

              <button
                onClick={() => handleNovaConsulta()}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-lg hover:from-blue-600 hover:to-cyan-700 transition-all duration-200 shadow-md hover:shadow-lg"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                <span className="font-medium">Nova Consulta</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Estatísticas para profissionais */}
      {ehProfissional && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-2">Consultas Hoje</h3>
                <p className="text-3xl font-bold">3</p>
              </div>
              <div className="bg-white/20 p-3 rounded-lg">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-2">Esta Semana</h3>
                <p className="text-3xl font-bold">12</p>
              </div>
              <div className="bg-white/20 p-3 rounded-lg">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-2">Receita Mês</h3>
                <p className="text-3xl font-bold">R$ 2.840</p>
              </div>
              <div className="bg-white/20 p-3 rounded-lg">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-2">Taxa Presença</h3>
                <p className="text-3xl font-bold">94%</p>
              </div>
              <div className="bg-white/20 p-3 rounded-lg">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* COMPONENTE AGENDA ORIGINAL */}
      <Agenda
        tipoUsuario={ehProfissional ? "profissional" : "paciente"}
        usuarioId={user.id}
        onConsultaClick={handleConsultaClick}
        onNovaConsulta={handleNovaConsulta}
        onEditarConsulta={handleEditarConsulta}
        onCancelarConsulta={handleCancelarConsulta}
        onConfirmarConsulta={handleConfirmarConsulta}
      />

      {/* Modal de Horários */}
      {ehProfissional && (
        <ModalHorariosDisponiveis
          isOpen={modalHorariosAberto}
          onClose={() => setModalHorariosAberto(false)}
          profissionalId={user.id}
        />
      )}
    </div>
  );
}
