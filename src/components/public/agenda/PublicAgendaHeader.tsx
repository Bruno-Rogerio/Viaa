// src/components/public/agenda/PublicAgendaHeader.tsx
// Header específico para agendamento público

"use client";

import {
  CheckIcon,
  ExclamationTriangleIcon,
  StarIcon,
  MapPinIcon,
} from "@heroicons/react/24/solid";

interface ProfissionalInfo {
  nome: string;
  sobrenome: string;
  especialidades: string;
  foto_perfil_url?: string;
  valor_sessao?: number;
  crp?: string;
  verificado?: boolean;
}

interface PublicAgendaHeaderProps {
  profissionalInfo: ProfissionalInfo;
  temHorariosConfigurados: boolean;
  tipoUsuario: "paciente" | "profissional";
  loadingHorarios: boolean;
}

export default function PublicAgendaHeader({
  profissionalInfo,
  temHorariosConfigurados,
  tipoUsuario,
  loadingHorarios,
}: PublicAgendaHeaderProps) {
  return (
    <>
      {/* Header principal com informações do profissional */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-6">
        <div className="flex items-start space-x-6">
          {/* Foto do profissional */}
          <div className="flex-shrink-0">
            {profissionalInfo.foto_perfil_url ? (
              <img
                src={profissionalInfo.foto_perfil_url}
                alt={`${profissionalInfo.nome} ${profissionalInfo.sobrenome}`}
                className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center border-4 border-white shadow-lg">
                <span className="text-2xl font-bold text-white">
                  {profissionalInfo.nome.charAt(0)}
                  {profissionalInfo.sobrenome.charAt(0)}
                </span>
              </div>
            )}
          </div>

          {/* Informações do profissional */}
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h1 className="text-2xl font-bold text-gray-900">
                {profissionalInfo.nome} {profissionalInfo.sobrenome}
              </h1>

              {profissionalInfo.verificado && (
                <div className="flex items-center space-x-1 bg-green-100 px-2 py-1 rounded-full">
                  <CheckIcon className="w-4 h-4 text-green-600" />
                  <span className="text-xs font-medium text-green-800">
                    Verificado
                  </span>
                </div>
              )}
            </div>

            <p className="text-blue-700 font-medium mb-3">
              {profissionalInfo.especialidades}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              {profissionalInfo.crp && (
                <div className="flex items-center space-x-2 text-gray-600">
                  <span className="font-medium">CRP:</span>
                  <span>{profissionalInfo.crp}</span>
                </div>
              )}

              {profissionalInfo.valor_sessao && (
                <div className="flex items-center space-x-2 text-gray-600">
                  <span className="font-medium">Valor:</span>
                  <span className="text-green-600 font-semibold">
                    R$ {profissionalInfo.valor_sessao.toLocaleString("pt-BR")}
                  </span>
                </div>
              )}

              <div className="flex items-center space-x-2 text-gray-600">
                <MapPinIcon className="w-4 h-4" />
                <span>Online / Presencial</span>
              </div>
            </div>

            {/* Avaliação (mock) */}
            <div className="flex items-center space-x-2 mt-3">
              <div className="flex items-center space-x-1">
                {[...Array(5)].map((_, i) => (
                  <StarIcon
                    key={i}
                    className={`w-4 h-4 ${
                      i < 4 ? "text-yellow-400" : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-600">4.8 (23 avaliações)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Header de instrução para agendamento */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center space-x-4 mb-4">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
            <svg
              className="w-6 h-6 text-blue-600"
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
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Agendar Consulta
            </h2>
            <p className="text-gray-600">
              Escolha um horário disponível na agenda de {profissionalInfo.nome}
            </p>
          </div>
        </div>

        {/* Status da disponibilidade */}
        {loadingHorarios ? (
          <div className="flex items-center space-x-2 text-gray-500">
            <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
            <span className="text-sm">Carregando horários disponíveis...</span>
          </div>
        ) : temHorariosConfigurados ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <CheckIcon className="w-5 h-5 text-green-600" />
              <span className="text-green-800 font-medium">
                Horários disponíveis para agendamento
              </span>
            </div>
            <p className="text-green-700 text-sm mt-1">
              Clique nos horários disponíveis (destacados em verde) para agendar
              sua consulta.
            </p>
          </div>
        ) : (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <ExclamationTriangleIcon className="w-5 h-5 text-amber-600" />
              <span className="text-amber-800 font-medium">
                Horários indisponíveis temporariamente
              </span>
            </div>
            <p className="text-amber-700 text-sm mt-1">
              Este profissional ainda não configurou seus horários disponíveis.
              Tente novamente mais tarde ou entre em contato diretamente.
            </p>
          </div>
        )}

        {/* Indicador de contexto para profissionais */}
        {tipoUsuario === "profissional" && (
          <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-blue-800 font-medium text-sm">
                Agendando como paciente
              </span>
            </div>
            <p className="text-blue-700 text-sm mt-1">
              Você está solicitando uma consulta como paciente. A solicitação
              será enviada para <strong>{profissionalInfo.nome}</strong> que
              poderá confirmar ou rejeitar.
            </p>
          </div>
        )}
      </div>
    </>
  );
}
