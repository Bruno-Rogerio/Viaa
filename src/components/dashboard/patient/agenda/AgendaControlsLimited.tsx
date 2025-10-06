// src/components/dashboard/patient/agenda/AgendaControlsLimited.tsx
// Versão limitada dos controles da agenda (apenas semana e lista)

"use client";

import {
  ChevronLeftIcon,
  ChevronRightIcon,
  CalendarDaysIcon,
  ListBulletIcon,
} from "@heroicons/react/24/outline";
import { ModoVisualizacao } from "@/types/agenda";

interface AgendaControlsLimitedProps {
  dataAtual: Date;
  modoVisualizacao: ModoVisualizacao;
  carregando?: boolean;
  onNavigateData?: (data: Date) => void;
  onChangeModoVisualizacao?: (modo: ModoVisualizacao) => void;
}

export default function AgendaControlsLimited({
  dataAtual,
  modoVisualizacao,
  carregando = false,
  onNavigateData,
  onChangeModoVisualizacao,
}: AgendaControlsLimitedProps) {
  // Navegar datas
  const navegarData = (direcao: "anterior" | "proximo") => {
    if (!onNavigateData) return;

    const nova = new Date(dataAtual);

    if (modoVisualizacao === "semana") {
      nova.setDate(nova.getDate() + (direcao === "proximo" ? 7 : -7));
    }

    onNavigateData(nova);
  };

  // Voltar para hoje
  const irParaHoje = () => {
    if (onNavigateData) {
      onNavigateData(new Date());
    }
  };

  // Formatar período
  const formatarPeriodo = () => {
    if (modoVisualizacao === "lista") {
      return "Todas as consultas";
    }

    // Para semana
    const inicioSemana = new Date(dataAtual);
    inicioSemana.setDate(dataAtual.getDate() - dataAtual.getDay());

    const fimSemana = new Date(inicioSemana);
    fimSemana.setDate(inicioSemana.getDate() + 6);

    const mesmoMes = inicioSemana.getMonth() === fimSemana.getMonth();
    const mesmoAno = inicioSemana.getFullYear() === fimSemana.getFullYear();

    if (mesmoMes && mesmoAno) {
      return `${inicioSemana.getDate()} - ${fimSemana.getDate()} de ${inicioSemana.toLocaleDateString(
        "pt-BR",
        { month: "long", year: "numeric" }
      )}`;
    } else if (mesmoAno) {
      return `${inicioSemana.toLocaleDateString("pt-BR", {
        day: "numeric",
        month: "short",
      })} - ${fimSemana.toLocaleDateString("pt-BR", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })}`;
    } else {
      return `${inicioSemana.toLocaleDateString("pt-BR", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })} - ${fimSemana.toLocaleDateString("pt-BR", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })}`;
    }
  };

  return (
    <div className="flex items-center justify-between px-4 py-3">
      {/* Navegação de datas */}
      <div className="flex items-center space-x-2">
        {modoVisualizacao === "semana" && (
          <>
            <button
              onClick={() => navegarData("anterior")}
              disabled={carregando}
              className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
              title="Semana anterior"
            >
              <ChevronLeftIcon className="w-5 h-5 text-gray-600" />
            </button>

            <button
              onClick={irParaHoje}
              disabled={carregando}
              className="px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
            >
              Hoje
            </button>

            <button
              onClick={() => navegarData("proximo")}
              disabled={carregando}
              className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
              title="Próxima semana"
            >
              <ChevronRightIcon className="w-5 h-5 text-gray-600" />
            </button>
          </>
        )}

        <div className="ml-4 text-base sm:text-lg font-medium text-gray-900">
          {formatarPeriodo()}
        </div>
      </div>

      {/* Seletor de visualização - apenas semana e lista */}
      <div className="flex items-center bg-gray-100 rounded-lg p-1">
        <button
          onClick={() => onChangeModoVisualizacao?.("semana")}
          className={`
            flex items-center px-3 py-1.5 rounded-md text-sm font-medium transition-all
            ${
              modoVisualizacao === "semana"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }
          `}
        >
          <CalendarDaysIcon className="w-4 h-4 mr-1.5" />
          <span className="hidden sm:inline">Semana</span>
        </button>

        <button
          onClick={() => onChangeModoVisualizacao?.("lista")}
          className={`
            flex items-center px-3 py-1.5 rounded-md text-sm font-medium transition-all
            ${
              modoVisualizacao === "lista"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }
          `}
        >
          <ListBulletIcon className="w-4 h-4 mr-1.5" />
          <span className="hidden sm:inline">Lista</span>
        </button>
      </div>
    </div>
  );
}
