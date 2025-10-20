// src/components/dashboard/patient/profissionais/BuscarProfissionaisContent.tsx
// 🔄 ATUALIZADO PARA USAR O PROFESSIONAL CARD COM FOLLOW

"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { MagnifyingGlassIcon, FunnelIcon } from "@heroicons/react/24/outline";
import ProfessionalCard from "./ProfessionalCard";

interface Profissional {
  id: string;
  user_id: string;
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
  rating?: number;
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

export default function BuscarProfissionaisContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [profissionais, setProfissionais] = useState<Profissional[]>([]);
  const [paginacao, setPaginacao] = useState<Paginacao | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

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

          <button
            onClick={() => setMostrarFiltros(!mostrarFiltros)}
            className="md:hidden flex items-center justify-center space-x-2 px-4 py-3 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            <FunnelIcon className="w-5 h-5" />
            <span>Filtros</span>
          </button>
        </div>

        <div
          className={`mt-4 grid grid-cols-1 md:grid-cols-4 gap-4 ${
            mostrarFiltros ? "block" : "hidden md:grid"
          }`}
        >
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

          <input
            type="text"
            placeholder="Especialidade..."
            value={filtros.especialidade}
            onChange={(e) =>
              handleFiltroChange("especialidade", e.target.value)
            }
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />

          <input
            type="text"
            placeholder="Cidade..."
            value={filtros.cidade}
            onChange={(e) => handleFiltroChange("cidade", e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />

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

        {carregando && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Buscando profissionais...</p>
            </div>
          </div>
        )}

        {!carregando && profissionais.length > 0 && (
          <>
            {/* NOVO: Grid de ProfessionalCards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {profissionais.map((prof) => (
                <ProfessionalCard key={prof.id} profissional={prof} />
              ))}
            </div>

            {/* Paginação */}
            {paginacao && paginacao.total_paginas > 1 && (
              <div className="flex items-center justify-center gap-4 pt-6 border-t border-gray-200">
                <button
                  onClick={() =>
                    setFiltros((prev) => ({
                      ...prev,
                      page: Math.max(1, prev.page - 1),
                    }))
                  }
                  disabled={!paginacao.tem_anterior}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ← Anterior
                </button>

                <span className="text-gray-600">
                  Página {paginacao.pagina_atual} de {paginacao.total_paginas}
                </span>

                <button
                  onClick={() =>
                    setFiltros((prev) => ({
                      ...prev,
                      page: prev.page + 1,
                    }))
                  }
                  disabled={!paginacao.tem_proxima}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Próxima →
                </button>
              </div>
            )}
          </>
        )}

        {!carregando && profissionais.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              Nenhum profissional encontrado com esses critérios.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
