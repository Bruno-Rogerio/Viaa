// viaa/src/components/dashboard/common/ProximasConsultasWidget.tsx

"use client";
import { useMemo } from "react";
import {
  CalendarDaysIcon,
  ClockIcon,
  VideoCameraIcon,
  PhoneIcon,
  MapPinIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import { CalendarDaysIcon as CalendarSolid } from "@heroicons/react/24/solid";
import Link from "next/link";
import { useAgenda } from "@/hooks/dashboard/useAgenda";
import Avatar from "./Avatar";
import LoadingSpinner from "./LoadingSpinner";
import type { TipoUsuarioAgenda, StatusConsulta } from "@/types/agenda";

interface ProximasConsultasWidgetProps {
  tipoUsuario: TipoUsuarioAgenda;
  usuarioId: string;
  limite?: number;
  className?: string;
}

const ProximasConsultasWidget: React.FC<ProximasConsultasWidgetProps> = ({
  tipoUsuario,
  usuarioId,
  limite = 3,
  className = "",
}) => {
  const { consultas, loading, error } = useAgenda({
    tipoUsuario,
    usuarioId,
    autoLoad: true,
  });

  // Filtrar e ordenar próximas consultas
  const proximasConsultas = useMemo(() => {
    const agora = new Date();
    return consultas
      .filter((consulta) => {
        const dataConsulta = new Date(consulta.data_inicio);
        return dataConsulta > agora && consulta.status !== "cancelada";
      })
      .sort(
        (a, b) =>
          new Date(a.data_inicio).getTime() - new Date(b.data_inicio).getTime()
      )
      .slice(0, limite);
  }, [consultas, limite]);

  // Cores para status
  const coresStatus: Record<
    StatusConsulta,
    { bg: string; text: string; dot: string }
  > = {
    agendada: { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-500" },
    confirmada: {
      bg: "bg-emerald-50",
      text: "text-emerald-700",
      dot: "bg-emerald-500",
    },
    em_andamento: {
      bg: "bg-amber-50",
      text: "text-amber-700",
      dot: "bg-amber-500",
    },
    concluida: { bg: "bg-gray-50", text: "text-gray-700", dot: "bg-gray-500" },
    cancelada: { bg: "bg-red-50", text: "text-red-700", dot: "bg-red-500" },
    nao_compareceu: {
      bg: "bg-orange-50",
      text: "text-orange-700",
      dot: "bg-orange-500",
    },
  };

  // Ícones para tipos de consulta
  const iconesConsulta = {
    online: VideoCameraIcon,
    presencial: MapPinIcon,
    telefone: PhoneIcon,
  };

  // Formatação de tempo relativo
  const formatarTempoRelativo = (data: string) => {
    const agora = new Date();
    const dataConsulta = new Date(data);
    const diferenca = dataConsulta.getTime() - agora.getTime();

    const minutos = Math.floor(diferenca / (1000 * 60));
    const horas = Math.floor(diferenca / (1000 * 60 * 60));
    const dias = Math.floor(diferenca / (1000 * 60 * 60 * 24));

    if (minutos < 60) {
      return `em ${minutos} min`;
    } else if (horas < 24) {
      return `em ${horas}h`;
    } else if (dias === 1) {
      return "amanhã";
    } else if (dias < 7) {
      return `em ${dias} dias`;
    } else {
      return dataConsulta.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
      });
    }
  };

  if (loading) {
    return (
      <div
        className={`bg-white rounded-xl border border-gray-200 p-6 ${className}`}
      >
        <div className="flex items-center justify-center h-32">
          <LoadingSpinner size="md" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`bg-white rounded-xl border border-gray-200 p-6 ${className}`}
      >
        <div className="text-center text-red-600">
          <CalendarDaysIcon className="w-8 h-8 mx-auto mb-2" />
          <p className="text-sm">Erro ao carregar consultas</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`bg-white rounded-xl border border-gray-200 shadow-sm ${className}`}
    >
      {/* Cabeçalho */}
      <div className="flex items-center justify-between p-6 border-b border-gray-100">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-2 rounded-lg">
            <CalendarSolid className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Próximas Consultas</h3>
            <p className="text-sm text-gray-600">
              {proximasConsultas.length}{" "}
              {proximasConsultas.length === 1 ? "consulta" : "consultas"}
            </p>
          </div>
        </div>

        <Link
          href="/dashboard/agenda"
          className="text-blue-600 hover:text-blue-700 transition-colors"
        >
          <ChevronRightIcon className="w-5 h-5" />
        </Link>
      </div>

      {/* Lista de consultas */}
      <div className="p-6">
        {proximasConsultas.length === 0 ? (
          <div className="text-center py-8">
            <CalendarDaysIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600 font-medium mb-1">
              Nenhuma consulta agendada
            </p>
            <p className="text-sm text-gray-500">
              {tipoUsuario === "profissional"
                ? "Sua agenda está livre!"
                : "Que tal agendar uma consulta?"}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {proximasConsultas.map((consulta, index) => {
              const IconeTipo = iconesConsulta[consulta.tipo];
              const cores = coresStatus[consulta.status];
              const participante =
                tipoUsuario === "profissional"
                  ? consulta.paciente
                  : consulta.profissional;
              const dataConsulta = new Date(consulta.data_inicio);

              return (
                <div
                  key={consulta.id}
                  className="group flex items-start space-x-4 p-4 rounded-lg border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all duration-200 cursor-pointer"
                >
                  {/* Indicador de tempo */}
                  <div className="flex-shrink-0 text-center min-w-[60px]">
                    <div className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                      {formatarTempoRelativo(consulta.data_inicio)}
                    </div>
                    <div className="text-lg font-bold text-gray-900 mt-1">
                      {dataConsulta.toLocaleTimeString("pt-BR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>

                  {/* Linha vertical conectora */}
                  <div className="flex-shrink-0 flex flex-col items-center pt-2">
                    <div className={`w-3 h-3 rounded-full ${cores.dot}`}></div>
                    {index < proximasConsultas.length - 1 && (
                      <div className="w-px h-12 bg-gray-200 mt-2"></div>
                    )}
                  </div>

                  {/* Conteúdo da consulta */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                          {consulta.titulo}
                        </h4>
                        <div className="flex items-center space-x-2 mt-1">
                          <IconeTipo className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-gray-600 capitalize">
                            {consulta.tipo}
                          </span>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${cores.bg} ${cores.text}`}
                          >
                            {consulta.status.replace("_", " ")}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Participante */}
                    <div className="flex items-center space-x-3">
                      <Avatar
                        src={participante.foto_perfil_url}
                        alt={`${participante.nome} ${participante.sobrenome}`}
                        size="sm"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {participante.nome} {participante.sobrenome}
                        </p>
                        {tipoUsuario === "paciente" &&
                          "especialidades" in participante && (
                            <p className="text-xs text-gray-600 truncate">
                              {participante.especialidades}
                            </p>
                          )}
                      </div>
                    </div>

                    {/* Ações rápidas */}
                    <div className="flex items-center justify-end space-x-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      {consulta.tipo === "online" &&
                        consulta.link_videochamada && (
                          <button className="px-3 py-1 text-xs bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors">
                            Entrar
                          </button>
                        )}
                      <button className="px-3 py-1 text-xs bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
                        Ver detalhes
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Link para ver mais */}
        {proximasConsultas.length > 0 && (
          <div className="mt-6 pt-4 border-t border-gray-100">
            <Link
              href="/dashboard/agenda"
              className="flex items-center justify-center space-x-2 text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors"
            >
              <span>Ver agenda completa</span>
              <ChevronRightIcon className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProximasConsultasWidget;
