// src/components/dashboard/patient/agenda/SlotSelector.tsx
// Componente para seleção de horários disponíveis

"use client";

import { useState, useMemo } from "react";
import { ClockIcon, CheckIcon } from "@heroicons/react/24/outline";
import {
  formatarSlotHorario,
  agruparSlotsPorPeriodo,
  validarHorarioAgendamento,
} from "@/utils/agendamento/validacoes";
import type { HorarioDisponivel, Consulta } from "@/types/agenda";

interface SlotSelectorProps {
  data: Date;
  slots: Date[];
  horarioSelecionado?: Date;
  onSelectSlot: (slot: Date) => void;
  horariosDisponiveis: HorarioDisponivel[];
  consultasExistentes?: Consulta[];
  loading?: boolean;
}

export default function SlotSelector({
  data,
  slots,
  horarioSelecionado,
  onSelectSlot,
  horariosDisponiveis,
  consultasExistentes = [],
  loading = false,
}: SlotSelectorProps) {
  const [periodoExpandido, setPeriodoExpandido] = useState<
    "manha" | "tarde" | "noite" | null
  >(null);

  // Agrupar slots por período
  const slotsPorPeriodo = useMemo(() => {
    return agruparSlotsPorPeriodo(slots);
  }, [slots]);

  // Determinar período inicial baseado na disponibilidade
  useMemo(() => {
    if (!periodoExpandido) {
      if (slotsPorPeriodo.manha.length > 0) setPeriodoExpandido("manha");
      else if (slotsPorPeriodo.tarde.length > 0) setPeriodoExpandido("tarde");
      else if (slotsPorPeriodo.noite.length > 0) setPeriodoExpandido("noite");
    }
  }, [slotsPorPeriodo, periodoExpandido]);

  const renderizarPeriodo = (
    titulo: string,
    periodo: "manha" | "tarde" | "noite",
    icone: React.ReactNode,
    slotsNoPeriodo: Date[]
  ) => {
    const isExpandido = periodoExpandido === periodo;
    const temSlots = slotsNoPeriodo.length > 0;

    return (
      <div
        key={periodo}
        className="border border-gray-200 rounded-lg overflow-hidden"
      >
        <button
          onClick={() =>
            temSlots && setPeriodoExpandido(isExpandido ? null : periodo)
          }
          disabled={!temSlots}
          className={`w-full p-4 flex items-center justify-between transition-colors ${
            temSlots
              ? "hover:bg-gray-50 cursor-pointer"
              : "bg-gray-50 cursor-not-allowed opacity-60"
          }`}
        >
          <div className="flex items-center space-x-3">
            {icone}
            <div className="text-left">
              <h4 className="font-medium text-gray-900">{titulo}</h4>
              <p className="text-sm text-gray-500">
                {temSlots
                  ? `${slotsNoPeriodo.length} horários disponíveis`
                  : "Sem horários disponíveis"}
              </p>
            </div>
          </div>
          {temSlots && (
            <svg
              className={`w-5 h-5 text-gray-400 transition-transform ${
                isExpandido ? "rotate-180" : ""
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          )}
        </button>

        {isExpandido && temSlots && (
          <div className="p-4 pt-0">
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {slotsNoPeriodo.map((slot, idx) => {
                const isSelected =
                  horarioSelecionado?.getTime() === slot.getTime();
                const validacao = validarHorarioAgendamento(
                  slot,
                  horariosDisponiveis,
                  consultasExistentes
                );

                return (
                  <button
                    key={idx}
                    onClick={() => validacao.valido && onSelectSlot(slot)}
                    disabled={!validacao.valido}
                    className={`
                      relative px-3 py-2 rounded-lg border text-sm font-medium
                      transition-all duration-200 
                      ${
                        isSelected
                          ? "bg-blue-600 border-blue-600 text-white shadow-md scale-105"
                          : validacao.valido
                          ? "bg-white border-gray-300 text-gray-700 hover:border-blue-500 hover:bg-blue-50"
                          : "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed opacity-50"
                      }
                    `}
                    title={
                      !validacao.valido ? validacao.erros.join(", ") : undefined
                    }
                  >
                    {formatarSlotHorario(slot)}
                    {isSelected && (
                      <CheckIcon className="w-4 h-4 inline-block ml-1" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="flex items-center space-x-3">
          <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
          <span className="text-gray-600">
            Carregando horários disponíveis...
          </span>
        </div>
      </div>
    );
  }

  if (slots.length === 0) {
    return (
      <div className="text-center py-8">
        <ClockIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-600 font-medium">
          Sem horários disponíveis para esta data
        </p>
        <p className="text-sm text-gray-500 mt-1">
          Tente selecionar outro dia no calendário
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center pb-2">
        <h3 className="text-lg font-semibold text-gray-900">
          Selecione um horário
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          {data.toLocaleDateString("pt-BR", {
            weekday: "long",
            day: "numeric",
            month: "long",
          })}
        </p>
      </div>

      <div className="space-y-3">
        {renderizarPeriodo(
          "Manhã",
          "manha",
          <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
            <svg
              className="w-6 h-6 text-amber-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
          </div>,
          slotsPorPeriodo.manha
        )}

        {renderizarPeriodo(
          "Tarde",
          "tarde",
          <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
            <svg
              className="w-6 h-6 text-orange-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
          </div>,
          slotsPorPeriodo.tarde
        )}

        {renderizarPeriodo(
          "Noite",
          "noite",
          <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
            <svg
              className="w-6 h-6 text-indigo-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
              />
            </svg>
          </div>,
          slotsPorPeriodo.noite
        )}
      </div>

      {horarioSelecionado && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <span className="font-medium">Horário selecionado:</span>{" "}
            {formatarSlotHorario(horarioSelecionado)}
          </p>
        </div>
      )}
    </div>
  );
}
