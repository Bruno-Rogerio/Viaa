// src/app/dashboard/paciente/profissionais/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PatientLayout } from "@/components/dashboard/patient/layout";
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  MapPinIcon,
  StarIcon,
  CheckBadgeIcon,
} from "@heroicons/react/24/outline";
import Image from "next/image";

interface Profissional {
  id: string;
  nome: string;
  sobrenome: string;
  tipo: string;
  especialidades: string;
  bio_profissional?: string;
  foto_perfil_url?: string;
  valor_sessao?: number;
  experiencia_anos?: number;
  endereco_cidade?: string;
  endereco_estado?: string;
  crp?: string;
  verificado: boolean;
}

interface Paginacao {
  total: number;
  pagina_atual: number;
  total_paginas: number;
  limite_por_pagina: number;
  tem_proxima: boolean;
  tem_anterior: boolean;
}

const TIPOS_PROFISSIONAL = [
  { value: "", label: "Todos os tipos" },
  { value: "psicologo", label: "Psicólogo" },
  { value: "psicanalista", label: "Psicanalista" },
  { value: "heike", label: "Terapeuta Reiki" },
  { value: "holistico", label: "Terapeuta Holístico" },
  { value: "coach_mentor", label: "Coach/Mentor" },
];

const ESTADOS_BR = [
  "",
  "AC",
  "AL",
  "AP",
  "AM",
  "BA",
  "CE",
  "DF",
  "ES",
  "GO",
  "MA",
  "MT",
  "MS",
  "MG",
  "PA",
  "PB",
  "PR",
  "PE",
  "PI",
  "RJ",
  "RN",
  "RS",
  "RO",
  "RR",
  "SC",
  "SP",
  "SE",
  "TO",
];

export default function BuscarProfissionaisPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Estados
  const [profissionais, setProfissionais] = useState<Profissional[]>([]);
  const [paginacao, setPaginacao] = useState<Paginacao | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  // Filtros
  const [filtros, setFiltros] = useState({
    busca: searchParams.get("busca") || "",
    tipo: searchParams.get("tipo") || "",
    especialidade: searchParams.get("especialidade") || "",
    cidade: searchParams.get("cidade") || "",
    estado: searchParams.get("estado") || "",
    page: parseInt(searchParams.get("page") || "1"),
  });

  // Buscar profissionais
  useEffect(() => {
    buscarProfissionais();
  }, [filtros]);

  const buscarProfissionais = async () => {
    setCarregando(true);

    try {
      const params = new URLSearchParams();
      if (filtros.busca) params.append("busca", filtros.busca);
      if (filtros.tipo) params.append("tipo", filtros.tipo);
      if (filtros.especialidade)
        params.append("especialidade", filtros.especialidade);
      if (filtros.cidade) params.append("cidade", filtros.cidade);
      if (filtros.estado) params.append("estado", filtros.estado);
      params.append("page", filtros.page.toString());
      params.append("limit", "12");

      const response = await fetch(`/api/profissionais?${params.toString()}`);

      if (!response.ok) {
        throw new Error("Erro ao buscar profissionais");
      }

      const data = await response.json();
      setProfissionais(data.profissionais);
      setPaginacao(data.paginacao);
    } catch (error) {
      console.error("Erro ao buscar profissionais:", error);
    } finally {
      setCarregando(false);
    }
  };

  const handleFiltroChange = (campo: string, valor: string) => {
    setFiltros((prev) => ({ ...prev, [campo]: valor, page: 1 }));
  };

  const limparFiltros = () => {
    setFiltros({
      busca: "",
      tipo: "",
      especialidade: "",
      cidade: "",
      estado: "",
      page: 1,
    });
  };

  const getTipoLabel = (tipo: string) => {
    const found = TIPOS_PROFISSIONAL.find((t) => t.value === tipo);
    return found?.label || tipo;
  };

  return (
    <PatientLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl p-8 text-white">
          <h1 className="text-3xl font-bold mb-2">Encontre seu Terapeuta 🔍</h1>
          <p className="text-blue-100">
            Conecte-se com profissionais verificados e qualificados
          </p>
        </div>

        {/* Barra de busca e filtros */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Busca */}
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por nome do profissional..."
                  value={filtros.busca}
                  onChange={(e) => handleFiltroChange("busca", e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Botão filtros mobile */}
            <button
              onClick={() => setMostrarFiltros(!mostrarFiltros)}
              className="md:hidden flex items-center justify-center space-x-2 px-4 py-3 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              <FunnelIcon className="w-5 h-5" />
              <span>Filtros</span>
            </button>
          </div>

          {/* Filtros (desktop sempre visível, mobile toggle) */}
          <div
            className={`mt-4 grid grid-cols-1 md:grid-cols-4 gap-4 ${
              mostrarFiltros ? "block" : "hidden md:grid"
            }`}
          >
            {/* Tipo */}
            <select
              value={filtros.tipo}
              onChange={(e) => handleFiltroChange("tipo", e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {TIPOS_PROFISSIONAL.map((tipo) => (
                <option key={tipo.value} value={tipo.value}>
                  {tipo.label}
                </option>
              ))}
            </select>

            {/* Especialidade */}
            <input
              type="text"
              placeholder="Especialidade..."
              value={filtros.especialidade}
              onChange={(e) =>
                handleFiltroChange("especialidade", e.target.value)
              }
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />

            {/* Cidade */}
            <input
              type="text"
              placeholder="Cidade..."
              value={filtros.cidade}
              onChange={(e) => handleFiltroChange("cidade", e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />

            {/* Estado */}
            <select
              value={filtros.estado}
              onChange={(e) => handleFiltroChange("estado", e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos os estados</option>
              {ESTADOS_BR.map(
                (uf) =>
                  uf && (
                    <option key={uf} value={uf}>
                      {uf}
                    </option>
                  )
              )}
            </select>
          </div>

          {/* Limpar filtros */}
          {(filtros.busca ||
            filtros.tipo ||
            filtros.especialidade ||
            filtros.cidade ||
            filtros.estado) && (
            <div className="mt-4 flex justify-end">
              <button
                onClick={limparFiltros}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Limpar filtros
              </button>
            </div>
          )}
        </div>

        {/* Resultados */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          {/* Header resultados */}
          {paginacao && (
            <div className="mb-6">
              <p className="text-gray-600">
                Encontrados{" "}
                <span className="font-semibold text-gray-900">
                  {paginacao.total}
                </span>{" "}
                profissionais
              </p>
            </div>
          )}

          {/* Loading */}
          {carregando && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">Buscando profissionais...</p>
              </div>
            </div>
          )}

          {/* Grid de profissionais */}
          {!carregando && profissionais.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {profissionais.map((prof) => (
                <div
                  key={prof.id}
                  className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow"
                >
                  {/* Foto e nome */}
                  <div className="flex items-start space-x-4 mb-4">
                    <div className="relative">
                      {prof.foto_perfil_url ? (
                        <Image
                          src={prof.foto_perfil_url}
                          alt={prof.nome}
                          width={64}
                          height={64}
                          className="rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-xl font-bold">
                            {prof.nome[0]}
                            {prof.sobrenome[0]}
                          </span>
                        </div>
                      )}
                      {prof.verificado && (
                        <CheckBadgeIcon className="absolute -bottom-1 -right-1 w-6 h-6 text-blue-600 bg-white rounded-full" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-gray-900 truncate">
                        {prof.nome} {prof.sobrenome}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {getTipoLabel(prof.tipo)}
                      </p>
                      {prof.crp && (
                        <p className="text-xs text-gray-500">CRP: {prof.crp}</p>
                      )}
                    </div>
                  </div>

                  {/* Especialidades */}
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {prof.especialidades}
                    </p>
                  </div>

                  {/* Localização */}
                  {(prof.endereco_cidade || prof.endereco_estado) && (
                    <div className="flex items-center text-sm text-gray-500 mb-4">
                      <MapPinIcon className="w-4 h-4 mr-1" />
                      <span>
                        {prof.endereco_cidade}
                        {prof.endereco_cidade && prof.endereco_estado && ", "}
                        {prof.endereco_estado}
                      </span>
                    </div>
                  )}

                  {/* Valor e experiência */}
                  <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100">
                    {prof.valor_sessao && (
                      <div>
                        <p className="text-xs text-gray-500">Valor da sessão</p>
                        <p className="text-lg font-bold text-gray-900">
                          R$ {prof.valor_sessao.toFixed(2)}
                        </p>
                      </div>
                    )}
                    {prof.experiencia_anos && (
                      <div className="text-right">
                        <p className="text-xs text-gray-500">Experiência</p>
                        <p className="text-lg font-bold text-gray-900">
                          {prof.experiencia_anos} anos
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Botões */}
                  <div className="flex space-x-3">
                    <button
                      onClick={() =>
                        router.push(`/dashboard/profissionais/${prof.id}`)
                      }
                      className="flex-1 px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium"
                    >
                      Ver Perfil
                    </button>
                    <button
                      onClick={() =>
                        router.push(
                          `/dashboard/profissionais/${prof.id}/agendar`
                        )
                      }
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      Agendar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty state */}
          {!carregando && profissionais.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Nenhum profissional encontrado
              </h3>
              <p className="text-gray-600 mb-4">
                Tente ajustar os filtros de busca
              </p>
              <button
                onClick={limparFiltros}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Limpar filtros
              </button>
            </div>
          )}

          {/* Paginação */}
          {paginacao && paginacao.total_paginas > 1 && (
            <div className="mt-8 flex items-center justify-center space-x-2">
              <button
                onClick={() =>
                  handleFiltroChange("page", (filtros.page - 1).toString())
                }
                disabled={!paginacao.tem_anterior}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Anterior
              </button>

              <div className="flex items-center space-x-1">
                {Array.from(
                  { length: paginacao.total_paginas },
                  (_, i) => i + 1
                ).map((page) => (
                  <button
                    key={page}
                    onClick={() => handleFiltroChange("page", page.toString())}
                    className={`w-10 h-10 rounded-lg font-medium ${
                      page === paginacao.pagina_atual
                        ? "bg-blue-600 text-white"
                        : "border border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button
                onClick={() =>
                  handleFiltroChange("page", (filtros.page + 1).toString())
                }
                disabled={!paginacao.tem_proxima}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Próxima
              </button>
            </div>
          )}
        </div>
      </div>
    </PatientLayout>
  );
}
