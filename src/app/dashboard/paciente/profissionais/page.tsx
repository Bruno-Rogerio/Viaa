// src/app/dashboard/paciente/profissionais/page.tsx
// 🎯 LISTA DE PROFISSIONAIS - VERSÃO CORRIGIDA

"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { PatientLayout } from "@/components/dashboard/patient/layout";
import {
  MagnifyingGlassIcon,
  StarIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  ClockIcon,
  CheckCircleIcon,
  CalendarDaysIcon,
  UserGroupIcon,
  AdjustmentsHorizontalIcon,
} from "@heroicons/react/24/outline";
import {
  StarIcon as StarSolid,
  CheckCircleIcon as CheckSolid,
} from "@heroicons/react/24/solid";
import Link from "next/link";

export default function ProfissionaisPage() {
  const { user } = useAuth();
  const [profissionais, setProfissionais] = useState<any[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [filtrosAbertos, setFiltrosAbertos] = useState(false);

  const [filtros, setFiltros] = useState({
    busca: "",
    especialidade: "",
    tipo: "",
    valorMin: "",
    valorMax: "",
    ordenacao: "rating",
  });

  const [paginacao, setPaginacao] = useState({
    pagina_atual: 1,
    total_paginas: 0,
    total_resultados: 0,
    tem_proxima: false,
    tem_anterior: false,
  });

  const especialidadesComuns = [
    "Ansiedade",
    "Depressão",
    "Terapia de Casal",
    "Terapia Familiar",
    "Transtorno Bipolar",
    "TOC",
  ];

  const tiposProfissional = [
    { value: "psicologo", label: "Psicólogo" },
    { value: "psicanalista", label: "Psicanalista" },
    { value: "heike", label: "Terapeuta Heike" },
    { value: "holistico", label: "Terapeuta Holístico" },
    { value: "coach_mentor", label: "Coach/Mentor" },
  ];

  const opcoesOrdenacao = [
    { value: "rating", label: "Melhor Avaliados" },
    { value: "valor_asc", label: "Menor Preço" },
    { value: "experiencia", label: "Mais Experiente" },
    { value: "nome", label: "Nome A-Z" },
  ];

  const buscarProfissionais = async (novaPagina = 1) => {
    if (!user) return;

    setCarregando(true);
    setErro(null);

    try {
      const params = new URLSearchParams({
        pagina: novaPagina.toString(),
        limite: "12",
        ordenacao: filtros.ordenacao,
      });

      if (filtros.busca) params.append("busca", filtros.busca);
      if (filtros.especialidade)
        params.append("especialidade", filtros.especialidade);
      if (filtros.tipo) params.append("tipo", filtros.tipo);
      if (filtros.valorMin) params.append("valor_min", filtros.valorMin);
      if (filtros.valorMax) params.append("valor_max", filtros.valorMax);

      const response = await fetch(`/api/profissionais?${params.toString()}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao buscar profissionais");
      }

      setProfissionais(data.profissionais);
      setPaginacao(data.paginacao);
    } catch (error: any) {
      console.error("Erro ao buscar profissionais:", error);
      setErro(error.message);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      buscarProfissionais(1);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [filtros, user]);

  const formatarValor = (valor: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(valor);
  };

  const obterIniciais = (nome: string, sobrenome: string) => {
    return `${nome[0]}${sobrenome[0]}`.toUpperCase();
  };

  const renderEstrelas = (rating: number) => {
    const estrelas = [];
    const estrelasCompletas = Math.floor(rating);

    for (let i = 0; i < 5; i++) {
      if (i < estrelasCompletas) {
        estrelas.push(
          <StarSolid key={i} className="w-4 h-4 text-yellow-400" />
        );
      } else {
        estrelas.push(<StarIcon key={i} className="w-4 h-4 text-gray-300" />);
      }
    }
    return estrelas;
  };

  return (
    <PatientLayout>
      <div className="space-y-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Encontre seu Profissional
              </h1>
              <p className="text-gray-600">
                {paginacao.total_resultados > 0
                  ? `${paginacao.total_resultados} profissionais disponíveis`
                  : "Carregando profissionais..."}
              </p>
            </div>

            <button
              onClick={() => setFiltrosAbertos(!filtrosAbertos)}
              className="lg:hidden flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <AdjustmentsHorizontalIcon className="w-5 h-5" />
              Filtros
            </button>
          </div>

          <div className="relative mb-4">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nome ou especialidade..."
              value={filtros.busca}
              onChange={(e) =>
                setFiltros((prev) => ({ ...prev, busca: e.target.value }))
              }
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {especialidadesComuns.map((esp) => (
              <button
                key={esp}
                onClick={() =>
                  setFiltros((prev) => ({
                    ...prev,
                    especialidade: prev.especialidade === esp ? "" : esp,
                  }))
                }
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  filtros.especialidade === esp
                    ? "bg-blue-100 text-blue-800 border border-blue-200"
                    : "bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200"
                }`}
              >
                {esp}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div
            className={`lg:block ${
              filtrosAbertos ? "block" : "hidden"
            } space-y-6`}
          >
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Filtros
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Profissional
                  </label>
                  <select
                    value={filtros.tipo}
                    onChange={(e) =>
                      setFiltros((prev) => ({ ...prev, tipo: e.target.value }))
                    }
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  >
                    <option value="">Todos os tipos</option>
                    {tiposProfissional.map((tipo) => (
                      <option key={tipo.value} value={tipo.value}>
                        {tipo.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ordenar por
                  </label>
                  <select
                    value={filtros.ordenacao}
                    onChange={(e) =>
                      setFiltros((prev) => ({
                        ...prev,
                        ordenacao: e.target.value,
                      }))
                    }
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  >
                    {opcoesOrdenacao.map((opcao) => (
                      <option key={opcao.value} value={opcao.value}>
                        {opcao.label}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={() =>
                    setFiltros({
                      busca: "",
                      especialidade: "",
                      tipo: "",
                      valorMin: "",
                      valorMax: "",
                      ordenacao: "rating",
                    })
                  }
                  className="w-full py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Limpar Filtros
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-3">
            {carregando ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse"
                  >
                    <div className="flex items-start space-x-4">
                      <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
                      <div className="flex-1 space-y-3">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : erro ? (
              <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
                <div className="text-red-500 text-lg mb-2">
                  Erro ao carregar
                </div>
                <p className="text-gray-600 mb-4">{erro}</p>
                <button
                  onClick={() => buscarProfissionais()}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  Tentar Novamente
                </button>
              </div>
            ) : profissionais.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
                <UserGroupIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhum profissional encontrado
                </h3>
                <p className="text-gray-600">Tente ajustar os filtros.</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {profissionais.map((prof) => (
                    <div
                      key={prof.id}
                      className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow"
                    >
                      <div className="flex items-start space-x-4 mb-4">
                        <div className="relative">
                          {prof.foto_perfil_url ? (
                            <img
                              src={prof.foto_perfil_url}
                              alt={`${prof.nome} ${prof.sobrenome}`}
                              className="w-16 h-16 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-blue-700 font-semibold text-lg">
                                {obterIniciais(prof.nome, prof.sobrenome)}
                              </span>
                            </div>
                          )}

                          {prof.verificado && (
                            <CheckSolid className="absolute -bottom-1 -right-1 w-6 h-6 text-blue-500 bg-white rounded-full" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 text-lg">
                            {prof.nome} {prof.sobrenome}
                          </h3>

                          <div className="flex items-center space-x-2 mb-2">
                            <div className="flex items-center space-x-1">
                              {renderEstrelas(prof.rating)}
                            </div>
                            <span className="text-sm text-gray-600">
                              {prof.rating}
                            </span>
                          </div>

                          <p className="text-sm text-gray-600 mb-1">
                            {prof.especialidades}
                          </p>

                          <div className="flex items-center text-sm text-gray-500">
                            <MapPinIcon className="w-4 h-4 mr-1" />
                            {prof.endereco_cidade}, {prof.endereco_estado}
                          </div>
                        </div>
                      </div>

                      <p className="text-gray-700 text-sm mb-4 line-clamp-2">
                        {prof.bio_profissional || "Profissional dedicado."}
                      </p>

                      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                        <div className="flex items-center text-gray-600">
                          <ClockIcon className="w-4 h-4 mr-2" />
                          {prof.experiencia_anos} anos
                        </div>
                        <div className="flex items-center text-gray-600">
                          <CurrencyDollarIcon className="w-4 h-4 mr-2" />
                          {formatarValor(prof.valor_sessao)}
                        </div>
                      </div>

                      <div className="flex space-x-3">
                        <Link
                          href={`/dashboard/paciente/profissionais/${prof.id}`}
                          className="flex-1 bg-blue-600 text-white text-center py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                        >
                          Ver Perfil
                        </Link>

                        {prof.tem_horarios_disponiveis && (
                          <Link
                            href={`/dashboard/paciente/profissionais/${prof.id}`}
                            className="flex items-center justify-center px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                          >
                            <CalendarDaysIcon className="w-4 h-4" />
                          </Link>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {paginacao.total_paginas > 1 && (
                  <div className="flex justify-center items-center space-x-4">
                    <button
                      disabled={!paginacao.tem_anterior}
                      onClick={() =>
                        buscarProfissionais(paginacao.pagina_atual - 1)
                      }
                      className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50"
                    >
                      Anterior
                    </button>

                    <span className="text-sm text-gray-600">
                      Página {paginacao.pagina_atual} de{" "}
                      {paginacao.total_paginas}
                    </span>

                    <button
                      disabled={!paginacao.tem_proxima}
                      onClick={() =>
                        buscarProfissionais(paginacao.pagina_atual + 1)
                      }
                      className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50"
                    >
                      Próxima
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </PatientLayout>
  );
}
//aaa
