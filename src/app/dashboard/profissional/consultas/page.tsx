// src/app/dashboard/profissional/consultas/page.tsx

"use client";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { ProfessionalLayout } from "@/components/dashboard/professional/layout";
import ConsultasList from "@/components/dashboard/professional/consultas/ConsultasList";
import {
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import type { StatusConsulta } from "@/types/agenda";

export default function ConsultasPage() {
  const { profile } = useAuth();
  const [filtroAtivo, setFiltroAtivo] = useState<
    "pendentes" | "confirmadas" | "historico"
  >("pendentes");
  const [recarregar, setRecarregar] = useState(0);

  // SE profile não existe ou não é profissional, restringe acesso (segurança extra)
  if (!profile || profile.tipo !== "profissional") {
    return (
      <ProfessionalLayout>
        <div className="bg-white rounded-xl p-6 text-center">
          <p className="text-gray-600">Acesso restrito a profissionais</p>
        </div>
      </ProfessionalLayout>
    );
  }

  // Aqui garantimos que profile existe (por causa do if acima), mas TypeScript não assume o shape.
  // Então, sempre check de segurança:
  const profissionalId: string | null = profile?.dados?.id ?? null;

  const filtros: Record<
    string,
    {
      label: string;
      icon: any;
      status: StatusConsulta[];
      cor: string;
    }
  > = {
    pendentes: {
      label: "Pendentes",
      icon: ExclamationTriangleIcon,
      status: ["agendada"],
      cor: "amber",
    },
    confirmadas: {
      label: "Confirmadas",
      icon: CheckCircleIcon,
      status: ["confirmada"],
      cor: "blue",
    },
    historico: {
      label: "Histórico",
      icon: ClockIcon,
      status: ["concluida", "cancelada", "rejeitada", "nao_compareceu"],
      cor: "gray",
    },
  };

  const handleConsultaAtualizada = () => {
    // Força recarregar a lista
    setRecarregar((prev) => prev + 1);
  };

  return (
    <ProfessionalLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Minhas Consultas</h1>
          <p className="text-gray-600 mt-1">
            Gerencie suas consultas e agendamentos
          </p>
        </div>
        {/* Tabs de filtro */}
        <div className="bg-white rounded-xl border border-gray-200 p-1 inline-flex">
          {Object.entries(filtros).map(([key, config]) => {
            const Icon = config.icon;
            const isAtivo = filtroAtivo === key;
            return (
              <button
                key={key}
                onClick={() => setFiltroAtivo(key as any)}
                className={`
                  flex items-center space-x-2 px-4 py-2.5 rounded-lg font-medium transition-all
                  ${
                    isAtivo
                      ? `bg-${config.cor}-50 text-${config.cor}-700`
                      : "text-gray-600 hover:text-gray-900"
                  }
                `}
              >
                <Icon className="w-5 h-5" />
                <span>{config.label}</span>
              </button>
            );
          })}
        </div>
        {/* Lista de consultas */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          {profissionalId && (
            <ConsultasList
              key={recarregar}
              profissionalId={profissionalId}
              filtroStatus={filtros[filtroAtivo].status}
              onConsultaAtualizada={handleConsultaAtualizada}
            />
          )}
        </div>
        {/* Dicas */}
        {filtroAtivo === "pendentes" && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <div className="flex items-start space-x-3">
              <ExclamationTriangleIcon className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-amber-800">
                <p className="font-medium mb-1">Dica importante:</p>
                <p>
                  Confirme as consultas o quanto antes para que o paciente possa
                  se programar. Consultas não confirmadas podem ser canceladas
                  automaticamente.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProfessionalLayout>
  );
}
