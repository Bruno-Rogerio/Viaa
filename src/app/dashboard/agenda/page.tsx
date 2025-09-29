// src/app/dashboard/agenda/page.tsx
// 🔧 CORRIGIDO - Usa ProfessionalLayout para manter sidebar

"use client";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { ProfessionalLayout } from "@/components/dashboard/professional/layout";
import ProfessionalAgenda from "@/components/dashboard/professional/agenda/ProfessionalAgenda";
import ModalHorariosDisponiveis from "@/components/dashboard/professional/agenda/ModalHorariosDisponiveis";

export default function AgendaPage() {
  const { user, profile } = useAuth();
  const [modalHorariosAberto, setModalHorariosAberto] = useState(false);

  return (
    <ProfessionalLayout>
      <div className="space-y-6">
        {/* Verificações de segurança */}
        {!user || !profile ? (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Minha Agenda
            </h1>
            <p className="text-gray-600">Carregando...</p>
          </div>
        ) : profile.tipo !== "profissional" ? (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Acesso Negado
            </h1>
            <p className="text-gray-600">
              Esta página é apenas para profissionais. Pacientes podem agendar
              consultas através dos perfis dos profissionais.
            </p>
          </div>
        ) : (
          <>
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
          </>
        )}
      </div>
    </ProfessionalLayout>
  );
}
