// src/components/dashboard/common/agenda/AgendaControls.tsx
// 🔧 COMPONENTE NOVO - Controles responsivos para agenda

"use client";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  Squares2X2Icon,
  CalendarDaysIcon,
  ListBulletIcon,
} from "@heroicons/react/24/outline";
import { ModoVisualizacao } from "@/types/agenda";

interface AgendaControlsProps {
  dataAtual: Date;
  modoVisualizacao: ModoVisualizacao;
  carregando?: boolean;
  onNavigateData?: (data: Date) => void;
  onChangeModoVisualizacao?: (modo: ModoVisualizacao) => void;
}

export default function AgendaControls({
  dataAtual,
  modoVisualizacao,
  carregando = false,
  onNavigateData,
  onChangeModoVisualizacao,
}: AgendaControlsProps) {
  // Navegar datas
  const navegarData = (direcao: "anterior" | "proximo") => {
    if (!onNavigateData) return;

    const nova = new Date(dataAtual);

    switch (modoVisualizacao) {
      case "semana":
        nova.setDate(nova.getDate() + (direcao === "proximo" ? 7 : -7));
        break;
      case "dia":
        nova.setDate(nova.getDate() + (direcao === "proximo" ? 1 : -1));
        break;
      default:
        nova.setMonth(nova.getMonth() + (direcao === "proximo" ? 1 : -1));
    }

    onNavigateData(nova);
  };

  // Obter texto da data atual
  const obterTextoData = () => {
    const meses = [
      "Jan",
      "Fev",
      "Mar",
      "Abr",
      "Mai",
      "Jun",
      "Jul",
      "Ago",
      "Set",
      "Out",
      "Nov",
      "Dez",
    ];

    switch (modoVisualizacao) {
      case "semana":
        const inicioSemana = new Date(dataAtual);
        inicioSemana.setDate(dataAtual.getDate() - dataAtual.getDay());
        const fimSemana = new Date(inicioSemana);
        fimSemana.setDate(inicioSemana.getDate() + 6);
        return `${inicioSemana.getDate()}-${fimSemana.getDate()} ${
          meses[dataAtual.getMonth()]
        }`;
      case "dia":
        return `${dataAtual.getDate()} ${
          meses[dataAtual.getMonth()]
        } ${dataAtual.getFullYear()}`;
      default:
        return `${meses[dataAtual.getMonth()]} ${dataAtual.getFullYear()}`;
    }
  };

  // Ir para hoje
  const irParaHoje = () => {
    if (onNavigateData) {
      onNavigateData(new Date());
    }
  };

  return (
    <div className="card-mobile">
      {/* 🔧 NAVEGAÇÃO DE DATA - LAYOUT RESPONSIVO */}
      <div className="space-mobile-sm">
        <div className="flex-mobile-safe justify-between">
          {/* Controles de navegação */}
          <div className="flex-mobile-safe bg-gray-50 rounded-lg p-1">
            <button
              onClick={() => navegarData("anterior")}
              className="p-2 hover:bg-white rounded-md transition-colors disabled:opacity-50"
              disabled={carregando}
            >
              <ChevronLeftIcon className="icon-mobile-sm" />
            </button>

            <div className="px-3 py-2 font-semibold text-gray-900 text-mobile-sm min-w-[120px] text-center">
              {obterTextoData()}
            </div>

            <button
              onClick={() => navegarData("proximo")}
              className="p-2 hover:bg-white rounded-md transition-colors disabled:opacity-50"
              disabled={carregando}
            >
              <ChevronRightIcon className="icon-mobile-sm" />
            </button>
          </div>

          {/* Botão Hoje */}
          <button
            onClick={irParaHoje}
            className="button-mobile bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200"
            disabled={carregando}
          >
            <span className="text-mobile-xs">Hoje</span>
          </button>
        </div>

        {/* 🔧 MODOS DE VISUALIZAÇÃO - MOBILE SEGURO */}
        <div className="flex-mobile-safe justify-center">
          <div className="flex bg-gray-50 rounded-lg p-1 space-x-1">
            <button
              onClick={() => onChangeModoVisualizacao?.("mes")}
              className={`
                flex-mobile-safe p-2 rounded-md transition-colors text-mobile-xs
                ${
                  modoVisualizacao === "mes"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }
              `}
              title="Mensal"
              disabled={carregando}
            >
              <Squares2X2Icon className="icon-mobile-sm mr-1" />
              <span className="hidden sm:inline">Mês</span>
            </button>

            <button
              onClick={() => onChangeModoVisualizacao?.("semana")}
              className={`
                flex-mobile-safe p-2 rounded-md transition-colors text-mobile-xs
                ${
                  modoVisualizacao === "semana"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }
              `}
              title="Semanal"
              disabled={carregando}
            >
              <CalendarDaysIcon className="icon-mobile-sm mr-1" />
              <span className="hidden sm:inline">Semana</span>
            </button>

            <button
              onClick={() => onChangeModoVisualizacao?.("lista")}
              className={`
                flex-mobile-safe p-2 rounded-md transition-colors text-mobile-xs
                ${
                  modoVisualizacao === "lista"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }
              `}
              title="Lista"
              disabled={carregando}
            >
              <ListBulletIcon className="icon-mobile-sm mr-1" />
              <span className="hidden sm:inline">Lista</span>
            </button>
          </div>
        </div>
      </div>

      {/* 🔧 INDICADORES COMPACTOS - SÓ EM DESKTOP */}
      <div className="hidden md:block">
        <div className="flex-mobile-safe justify-center space-x-4 text-mobile-xs text-gray-600">
          <div className="flex-mobile-safe">
            <div className="w-3 h-3 bg-blue-200 rounded border border-blue-300 mr-1"></div>
            <span>Agendadas</span>
          </div>
          <div className="flex-mobile-safe">
            <div className="w-3 h-3 bg-green-200 rounded border-2 border-dashed border-green-300 mr-1"></div>
            <span>Disponível</span>
          </div>
          <div className="flex-mobile-safe">
            <div className="w-3 h-3 bg-gray-200 rounded border border-gray-300 mr-1"></div>
            <span>Indisponível</span>
          </div>
        </div>
      </div>
    </div>
  );
}
