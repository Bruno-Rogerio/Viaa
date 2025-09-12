// src/app/dashboard/agenda/page.tsx
// VERSÃO ATUALIZADA: Usando o novo container ProfessionalAgenda

"use client";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import ProfessionalAgenda from "@/components/dashboard/professional/agenda/ProfessionalAgenda";
import ModalHorariosDisponiveis from "@/components/dashboard/professional/agenda/ModalHorariosDisponiveis";

export default function AgendaPage() {
  const { user, profile } = useAuth();
  const [modalHorariosAberto, setModalHorariosAberto] = useState(false);

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

  // Se não é profissional, redirecionar ou mostrar erro
  if (!ehProfissional) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Acesso Negado</h1>
        <p className="text-gray-600">
          Esta página é apenas para profissionais. Pacientes podem agendar
          consultas através dos perfis dos profissionais.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Container específico para profissionais */}
      <ProfessionalAgenda
        profissionalId={user.id}
        onConfigurarHorarios={() => setModalHorariosAberto(true)}
      />

      {/* Modal de configuração de horários */}
      <ModalHorariosDisponiveis
        isOpen={modalHorariosAberto}
        onClose={() => setModalHorariosAberto(false)}
        profissionalId={user.id}
      />
    </div>
  );
}
