// src/components/dashboard/professional/agenda/ProfessionalAgendaHeader.tsx
// Header específico para agenda de profissionais

"use client";

import {
  CheckIcon,
  ExclamationTriangleIcon,
  CogIcon,
  CalendarIcon,
} from "@heroicons/react/24/solid";
import type { Consulta } from "@/types/agenda";

interface ConfiguracaoSemanal {
  [key: number]: {
    ativo: boolean;
    hora_inicio: string;
    hora_fim: string;
  };
}

interface ProfessionalAgendaHeaderProps {
  profissionalId: string;
  horariosConfigurados: ConfiguracaoSemanal;
  temHorariosConfigurados: boolean;
  diasAtivos: number[];
  loadingHorarios: boolean;
  consultas: Consulta[];
  onConfigurarHorarios?: () => void;
}

const NOMES_DIAS = {
  0: "Dom",
  1: "Seg",
  2: "Ter",
  3: "Qua",
  4: "Qui",
  5: "Sex",
  6: "Sáb",
};

export default function ProfessionalAgendaHeader({
  profissionalId,
  horariosConfigurados,
  temHorariosConfigurados,
  diasAtivos,
  loadingHorarios,
  consultas,
  onConfigurarHorarios,
}: ProfessionalAgendaHeaderProps) {
  // Calcular estatísticas básicas
  const hoje = new Date();
  const consultasHoje = consultas.filter((consulta) => {
    const dataConsulta = new Date(consulta.data_inicio);
    return (
      dataConsulta.getDate() === hoje.getDate() &&
      dataConsulta.getMonth() === hoje.getMonth() &&
      dataConsulta.getFullYear() === hoje.getFullYear()
    );
  }).length;

  const consultasPendentes = consultas.filter(
    (consulta) => consulta.status === "agendada"
  ).length;

  // Obter resumo dos horários configurados
  const resumoHorarios = diasAtivos.map((dia) => ({
    dia: NOMES_DIAS[dia as keyof typeof NOMES_DIAS],
    horario: `${horariosConfigurados[dia].hora_inicio} - ${horariosConfigurados[dia].hora_fim}`,
  }));

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Minha Agenda Profissional
          </h1>
          <p className="text-gray-600">
            Gerencie suas consultas e configure seus horários disponíveis
          </p>
        </div>

        {/* Botão de configuração */}
        <div className="flex items-center">
          <button
            onClick={onConfigurarHorarios}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg hover:from-purple-600 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            <CogIcon className="w-5 h-5" />
            <span className="font-medium">Configurar Horários</span>
          </button>
        </div>
      </div>

      {/* Status da configuração */}
      <div className="mb-6">
        {loadingHorarios ? (
          <div className="flex items-center space-x-2 text-gray-500">
            <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
            <span className="text-sm">Carregando configuração...</span>
          </div>
        ) : temHorariosConfigurados ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <CheckIcon className="w-5 h-5 text-green-600 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-green-800 font-medium mb-1">
                  Horários Configurados
                </h3>
                <p className="text-green-700 text-sm mb-3">
                  Você tem {diasAtivos.length} dia(s) ativo(s) na semana
                </p>

                {/* Resumo dos horários */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
                  {resumoHorarios.map((item, index) => (
                    <div
                      key={index}
                      className="bg-white/60 px-2 py-1 rounded text-xs text-center"
                    >
                      <div className="font-medium text-green-800">
                        {item.dia}
                      </div>
                      <div className="text-green-600">{item.horario}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <ExclamationTriangleIcon className="w-5 h-5 text-amber-600 mt-0.5" />
              <div>
                <h3 className="text-amber-800 font-medium mb-1">
                  Nenhum horário configurado
                </h3>
                <p className="text-amber-700 text-sm mb-3">
                  Configure seus horários disponíveis para que pacientes possam
                  agendar consultas com você.
                </p>
                <button
                  onClick={onConfigurarHorarios}
                  className="text-amber-800 hover:text-amber-900 text-sm font-medium underline"
                >
                  Configurar agora
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-2">Consultas Hoje</h3>
              <p className="text-3xl font-bold">{consultasHoje}</p>
            </div>
            <div className="bg-white/20 p-3 rounded-lg">
              <CalendarIcon className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-2">Pendentes</h3>
              <p className="text-3xl font-bold">{consultasPendentes}</p>
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
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-rose-500 to-rose-600 rounded-xl p-6 text-white">
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
    </div>
  );
}
