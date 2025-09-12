// src/components/dashboard/professional/agenda/HorariosDisponiveis.tsx

import React, { useState, useEffect } from "react";
import { useHorariosDisponiveis } from "@/hooks/dashboard/useHorariosDisponiveis";

// Ícones SVG personalizados
const ClockIcon = ({ className = "w-6 h-6" }) => (
  <svg
    className={className}
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
);

const CheckCircleIcon = ({ className = "w-6 h-6" }) => (
  <svg
    className={className}
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
);

const CheckCircleSolid = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path
      fillRule="evenodd"
      d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
      clipRule="evenodd"
    />
  </svg>
);

const XCircleIcon = ({ className = "w-6 h-6" }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

const CalendarDaysIcon = ({ className = "w-5 h-5" }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5a2.25 2.25 0 002.25-2.25m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5a2.25 2.25 0 012.25 2.25v7.5"
    />
  </svg>
);

const ArrowRightIcon = ({ className = "w-5 h-5" }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
    />
  </svg>
);

const ExclamationTriangleIcon = ({ className = "w-4 h-4" }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
    />
  </svg>
);

const CheckIcon = ({ className = "w-4 h-4" }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M4.5 12.75l6 6 9-13.5"
    />
  </svg>
);

interface HorarioConfig {
  ativo: boolean;
  hora_inicio: string;
  hora_fim: string;
}

interface ConfiguracaoSemanal {
  [key: number]: HorarioConfig; // 0 = domingo, 1 = segunda, etc.
}

interface HorariosDisponiveisProps {
  profissionalId: string;
  className?: string;
}

const HorariosDisponiveis: React.FC<HorariosDisponiveisProps> = ({
  profissionalId,
  className = "",
}) => {
  // Hook para gerenciar horários
  const {
    configuracao,
    loading,
    saving,
    error: hookError,
    salvarHorarios,
    resetarHorarios,
    temHorariosConfigurados,
    obterDiasAtivos,
    validarConfiguracao,
  } = useHorariosDisponiveis(profissionalId);

  // Estados locais para UI
  const [configuracaoLocal, setConfiguracaoLocal] =
    useState<ConfiguracaoSemanal>(configuracao);
  const [mensagemSucesso, setMensagemSucesso] = useState(false);
  const [erros, setErros] = useState<Record<number, string>>({});
  const [temAlteracoes, setTemAlteracoes] = useState(false);

  const diasSemana = [
    { id: 1, nome: "Segunda-feira", abrev: "SEG" },
    { id: 2, nome: "Terça-feira", abrev: "TER" },
    { id: 3, nome: "Quarta-feira", abrev: "QUA" },
    { id: 4, nome: "Quinta-feira", abrev: "QUI" },
    { id: 5, nome: "Sexta-feira", abrev: "SEX" },
    { id: 6, nome: "Sábado", abrev: "SÁB" },
    { id: 0, nome: "Domingo", abrev: "DOM" },
  ];

  // Sincronizar configuração do hook com estado local
  useEffect(() => {
    setConfiguracaoLocal(configuracao);
    setTemAlteracoes(false);
  }, [configuracao]);

  // Verificar alterações
  useEffect(() => {
    const alterado =
      JSON.stringify(configuracaoLocal) !== JSON.stringify(configuracao);
    setTemAlteracoes(alterado);
  }, [configuracaoLocal, configuracao]);

  // Validar horários
  const validarHorario = (
    diaId: number,
    inicio: string,
    fim: string
  ): string | null => {
    if (!inicio || !fim) return "Horários obrigatórios";

    const inicioMinutos =
      parseInt(inicio.split(":")[0]) * 60 + parseInt(inicio.split(":")[1]);
    const fimMinutos =
      parseInt(fim.split(":")[0]) * 60 + parseInt(fim.split(":")[1]);

    if (fimMinutos <= inicioMinutos) {
      return "Horário de fim deve ser após o início";
    }

    if (fimMinutos - inicioMinutos < 60) {
      return "Mínimo de 1 hora de trabalho";
    }

    return null;
  };

  // Atualizar configuração local de um dia
  const atualizarDia = (
    diaId: number,
    campo: keyof HorarioConfig,
    valor: any
  ) => {
    const novaConfig = {
      ...configuracaoLocal,
      [diaId]: {
        ...configuracaoLocal[diaId],
        [campo]: valor,
      },
    };

    setConfiguracaoLocal(novaConfig);

    // Validar se o dia está ativo
    if (novaConfig[diaId].ativo) {
      const erro = validarHorario(
        diaId,
        novaConfig[diaId].hora_inicio,
        novaConfig[diaId].hora_fim
      );
      setErros((prev) => ({ ...prev, [diaId]: erro || "" }));
    } else {
      setErros((prev) => ({ ...prev, [diaId]: "" }));
    }
  };

  // Aplicar horário para todos os dias úteis
  const aplicarParaTodos = () => {
    const horarioPadrao = configuracaoLocal[1]; // Usar segunda-feira como padrão
    const novaConfig = { ...configuracaoLocal };

    [1, 2, 3, 4, 5].forEach((diaId) => {
      novaConfig[diaId] = {
        ativo: true,
        hora_inicio: horarioPadrao.hora_inicio,
        hora_fim: horarioPadrao.hora_fim,
      };
    });

    setConfiguracaoLocal(novaConfig);
  };

  // Salvar configuração
  const handleSalvar = async () => {
    // Validar todos os dias ativos
    const novosErros: Record<number, string> = {};

    Object.entries(configuracaoLocal).forEach(([diaId, config]) => {
      if (config.ativo) {
        const erro = validarHorario(
          parseInt(diaId),
          config.hora_inicio,
          config.hora_fim
        );
        if (erro) novosErros[parseInt(diaId)] = erro;
      }
    });

    if (Object.keys(novosErros).length > 0) {
      setErros(novosErros);
      return;
    }

    try {
      const sucesso = await salvarHorarios(configuracaoLocal);
      if (sucesso) {
        setMensagemSucesso(true);
        setErros({});
        setTimeout(() => setMensagemSucesso(false), 3000);
      }
    } catch (error) {
      console.error("Erro ao salvar:", error);
    }
  };

  // Cancelar alterações
  const handleCancelar = () => {
    setConfiguracaoLocal(configuracao);
    setErros({});
    setTemAlteracoes(false);
  };

  const temDiasAtivos = Object.values(configuracaoLocal).some(
    (dia) => dia.ativo
  );
  const temErrosValidacao = Object.keys(erros).some(
    (id) => erros[parseInt(id)] && erros[parseInt(id)].length > 0
  );

  return (
    <div
      className={`bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden ${className}`}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 p-3 rounded-xl">
              {loading ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <ClockIcon className="w-6 h-6" />
              )}
            </div>
            <div>
              <h2 className="text-2xl font-bold">Horários Disponíveis</h2>
              <p className="text-blue-100">
                Configure quando você pode atender pacientes
              </p>
            </div>
          </div>

          {/* Indicador de alterações */}
          {temAlteracoes && (
            <div className="bg-amber-500/20 px-3 py-1 rounded-full">
              <span className="text-sm font-medium">Alterações não salvas</span>
            </div>
          )}
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="p-12 text-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando seus horários...</p>
        </div>
      )}

      {/* Error state */}
      {hookError && !loading && (
        <div className="p-6 bg-red-50 border-l-4 border-red-400">
          <div className="flex items-center space-x-2 text-red-700">
            <ExclamationTriangleIcon className="w-5 h-5" />
            <span className="font-medium">Erro ao carregar horários:</span>
          </div>
          <p className="mt-1 text-red-600">{hookError}</p>
        </div>
      )}

      {/* Content */}
      {!loading && !hookError && (
        <div className="p-6 space-y-6">
          {/* Quick Actions */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center space-x-3">
              <CalendarDaysIcon className="w-5 h-5 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">
                Ações rápidas:
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={aplicarParaTodos}
                className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
              >
                Aplicar seg-sex
              </button>
              {temAlteracoes && (
                <button
                  onClick={handleCancelar}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                >
                  Cancelar
                </button>
              )}
            </div>
          </div>

          {/* Configuração por dia */}
          <div className="space-y-4">
            {diasSemana.map((dia) => {
              const config = configuracaoLocal[dia.id];
              const erro = erros[dia.id];
              const temErro = erro && erro.length > 0;

              return (
                <div
                  key={dia.id}
                  className={`border rounded-xl p-4 transition-all ${
                    config.ativo
                      ? temErro
                        ? "border-red-200 bg-red-50"
                        : "border-emerald-200 bg-emerald-50"
                      : "border-gray-200 bg-gray-50"
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    {/* Toggle do dia */}
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() =>
                          atualizarDia(dia.id, "ativo", !config.ativo)
                        }
                        className={`flex items-center space-x-3 p-2 rounded-lg transition-all ${
                          config.ativo ? "bg-emerald-100" : "bg-gray-100"
                        }`}
                      >
                        {config.ativo ? (
                          <CheckCircleSolid className="w-6 h-6 text-emerald-600" />
                        ) : (
                          <XCircleIcon className="w-6 h-6 text-gray-400" />
                        )}
                        <div className="text-left">
                          <div className="font-semibold text-gray-900">
                            {dia.nome}
                          </div>
                          <div className="text-xs text-gray-500">
                            {dia.abrev}
                          </div>
                        </div>
                      </button>
                    </div>

                    {/* Status */}
                    <div className="flex items-center space-x-2">
                      {config.ativo && !temErro && (
                        <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium">
                          Disponível
                        </span>
                      )}
                      {config.ativo && temErro && (
                        <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
                          Erro
                        </span>
                      )}
                      {!config.ativo && (
                        <span className="px-3 py-1 bg-gray-100 text-gray-500 rounded-full text-sm font-medium">
                          Indisponível
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Horários */}
                  {config.ativo && (
                    <div className="space-y-3">
                      <div className="flex items-center space-x-4">
                        <div className="flex-1">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Início
                          </label>
                          <input
                            type="time"
                            value={config.hora_inicio}
                            onChange={(e) =>
                              atualizarDia(
                                dia.id,
                                "hora_inicio",
                                e.target.value
                              )
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>

                        <div className="pt-6">
                          <ArrowRightIcon className="w-5 h-5 text-gray-400" />
                        </div>

                        <div className="flex-1">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Fim
                          </label>
                          <input
                            type="time"
                            value={config.hora_fim}
                            onChange={(e) =>
                              atualizarDia(dia.id, "hora_fim", e.target.value)
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>

                        <div className="pt-6">
                          <div className="text-sm text-gray-500">
                            {config.hora_inicio &&
                              config.hora_fim &&
                              !temErro &&
                              (() => {
                                const inicio =
                                  parseInt(config.hora_inicio.split(":")[0]) *
                                    60 +
                                  parseInt(config.hora_inicio.split(":")[1]);
                                const fim =
                                  parseInt(config.hora_fim.split(":")[0]) * 60 +
                                  parseInt(config.hora_fim.split(":")[1]);
                                const horas = Math.floor((fim - inicio) / 60);
                                const minutos = (fim - inicio) % 60;
                                return `${horas}h${
                                  minutos > 0 ? `${minutos}m` : ""
                                }`;
                              })()}
                          </div>
                        </div>
                      </div>

                      {/* Erro */}
                      {temErro && (
                        <div className="flex items-center space-x-2 text-red-600 text-sm">
                          <ExclamationTriangleIcon className="w-4 h-4" />
                          <span>{erro}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Resumo */}
          {temDiasAtivos && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <h3 className="font-semibold text-blue-900 mb-2">
                Resumo da Semana
              </h3>
              <div className="text-sm text-blue-700 space-y-1">
                {Object.entries(configuracaoLocal)
                  .filter(([_, config]) => config.ativo)
                  .map(([diaId, config]) => {
                    const dia = diasSemana.find(
                      (d) => d.id === parseInt(diaId)
                    );
                    return (
                      <div key={diaId} className="flex justify-between">
                        <span>{dia?.abrev}:</span>
                        <span className="font-medium">
                          {config.hora_inicio} - {config.hora_fim}
                        </span>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* Botões */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <div className="flex items-center space-x-2">
              {mensagemSucesso && (
                <div className="flex items-center space-x-2 text-emerald-600">
                  <CheckIcon className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    Configuração salva com sucesso!
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-500">
                {
                  Object.values(configuracaoLocal).filter((dia) => dia.ativo)
                    .length
                }{" "}
                dias configurados
              </span>

              <button
                onClick={handleSalvar}
                disabled={
                  saving ||
                  !temDiasAtivos ||
                  temErrosValidacao ||
                  !temAlteracoes
                }
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                {saving ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Salvando...</span>
                  </div>
                ) : (
                  "Salvar Configuração"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HorariosDisponiveis;
