// src/components/dashboard/professional/agenda/ProfessionalAgendaHeader.tsx
// 🔧 VERSÃO MOBILE CORRIGIDA - Layout responsivo e compacto

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

  return (
    <div className="card-mobile space-mobile-md">
      {/* 🔧 HEADER RESPONSIVO */}
      <div className="space-mobile-sm">
        {/* Título e subtítulo */}
        <div className="space-mobile-xs">
          <h1 className="title-mobile-lg text-gray-900">Minha Agenda</h1>
          <p className="text-mobile-sm text-gray-600">
            Gerencie consultas e horários
          </p>
        </div>

        {/* 🔧 BOTÃO CONFIGURAR - SEMPRE VISÍVEL E RESPONSIVO */}
        <div className="flex justify-end">
          <button
            onClick={onConfigurarHorarios}
            className="button-mobile bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
          >
            <CogIcon className="icon-mobile-sm mr-1" />
            <span className="hidden sm:inline">Configurar</span>
            <span className="sm:hidden">Config</span>
          </button>
        </div>
      </div>

      {/* 🔧 STATUS DE CONFIGURAÇÃO COMPACTO */}
      <div className="space-mobile-sm">
        {loadingHorarios ? (
          <div className="flex-mobile-safe bg-blue-50 p-3 rounded-lg">
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-2"></div>
            <span className="text-mobile-sm text-blue-700">
              Carregando configurações...
            </span>
          </div>
        ) : temHorariosConfigurados ? (
          <div className="bg-green-50 p-3 rounded-lg">
            <div className="flex-mobile-safe text-green-700 mb-1">
              <CheckIcon className="icon-mobile-sm mr-1 flex-shrink-0" />
              <span className="text-mobile-sm font-medium">
                Horários configurados
              </span>
            </div>
            <div className="text-mobile-xs text-green-600">
              Ativo em {diasAtivos.length} dias:{" "}
              {diasAtivos
                .map((dia) => NOMES_DIAS[dia as keyof typeof NOMES_DIAS])
                .join(", ")}
            </div>
          </div>
        ) : (
          <div className="bg-amber-50 p-3 rounded-lg">
            <div className="flex-mobile-safe text-amber-700 mb-1">
              <ExclamationTriangleIcon className="icon-mobile-sm mr-1 flex-shrink-0" />
              <span className="text-mobile-sm font-medium">
                Configure seus horários
              </span>
            </div>
            <div className="text-mobile-xs text-amber-600 mb-2">
              Defina quando você está disponível para receber pacientes
            </div>
            <button
              onClick={onConfigurarHorarios}
              className="text-mobile-xs text-amber-800 hover:text-amber-900 font-medium underline"
            >
              Configurar agora
            </button>
          </div>
        )}
      </div>

      {/* 🔧 ESTATÍSTICAS RESPONSIVAS - GRID MOBILE SEGURO */}
      <div className="grid-mobile-safe cols-2 gap-3">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-3 text-white">
          <div className="flex-mobile-safe justify-between">
            <div className="flex-grow">
              <h3 className="text-mobile-xs font-semibold mb-1">Hoje</h3>
              <p className="title-mobile-md font-bold">{consultasHoje}</p>
            </div>
            <div className="bg-white/20 p-2 rounded-lg flex-shrink-0">
              <CalendarIcon className="icon-mobile-sm" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-lg p-3 text-white">
          <div className="flex-mobile-safe justify-between">
            <div className="flex-grow">
              <h3 className="text-mobile-xs font-semibold mb-1">Pendentes</h3>
              <p className="title-mobile-md font-bold">{consultasPendentes}</p>
            </div>
            <div className="bg-white/20 p-2 rounded-lg flex-shrink-0">
              <svg
                className="icon-mobile-sm"
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

        <div className="bg-gradient-to-r from-rose-500 to-rose-600 rounded-lg p-3 text-white">
          <div className="flex-mobile-safe justify-between">
            <div className="flex-grow">
              <h3 className="text-mobile-xs font-semibold mb-1">Receita</h3>
              <p className="title-mobile-sm font-bold">R$ 2.840</p>
            </div>
            <div className="bg-white/20 p-2 rounded-lg flex-shrink-0">
              <svg
                className="icon-mobile-sm"
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

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-3 text-white">
          <div className="flex-mobile-safe justify-between">
            <div className="flex-grow">
              <h3 className="text-mobile-xs font-semibold mb-1">Pacientes</h3>
              <p className="title-mobile-md font-bold">14</p>
            </div>
            <div className="bg-white/20 p-2 rounded-lg flex-shrink-0">
              <svg
                className="icon-mobile-sm"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
