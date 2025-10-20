// src/components/dashboard/rede/NetworkContent.tsx
// 🌐 Componente principal da página de rede social

"use client";

import { useState, useEffect } from "react";
import {
  SparklesIcon,
  FireIcon,
  UserGroupIcon,
  AdjustmentsHorizontalIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import ProfessionalCard from "../patient/profissionais/ProfessionalCard";
import { LoadingSpinner } from "../common";

interface Profissional {
  id: string;
  user_id: string;
  nome: string;
  sobrenome: string;
  tipo: string;
  especialidades?: string;
  bio_profissional?: string;
  foto_perfil_url?: string;
  valor_sessao?: number;
  experiencia_anos?: number;
  endereco_cidade?: string;
  endereco_estado?: string;
  crp?: string;
  verificado: boolean;
}

type TabType = "sugeridos" | "trending" | "especialidades";

export default function NetworkContent() {
  const [profissionais, setProfissionais] = useState<Profissional[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [abaSelecionada, setAbaSelecionada] = useState<TabType>("sugeridos");
  const [filtroEspecialidade, setFiltroEspecialidade] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("");

  // Buscar profissionais sugeridos
  useEffect(() => {
    buscarProfissionaisSugeridos();
  }, [filtroEspecialidade, filtroTipo, abaSelecionada]);

  const buscarProfissionaisSugeridos = async () => {
    try {
      setCarregando(true);
      setErro(null);

      const params = new URLSearchParams();
      params.append("limit", "20");
      params.append("page", "1");

      if (filtroEspecialidade) {
        params.append("especialidade", filtroEspecialidade);
      }

      if (filtroTipo) {
        params.append("tipo", filtroTipo);
      }

      // Adicionar tipo de sugestão como ordenação
      if (abaSelecionada === "trending") {
        params.append("sort", "trending");
      } else if (abaSelecionada === "especialidades") {
        params.append("sort", "especialidades");
      }

      const response = await fetch(`/api/profissionais?${params.toString()}`);

      if (!response.ok) {
        throw new Error("Erro ao buscar profissionais");
      }

      const data = await response.json();
      setProfissionais(data.profissionais || []);
    } catch (error: any) {
      console.error("Erro ao buscar profissionais:", error);
      setErro(error.message || "Erro ao carregar profissionais");
    } finally {
      setCarregando(false);
    }
  };

  const ESPECIALIDADES_COMUNS = [
    "Psicologia Clínica",
    "Terapia Cognitivo-Comportamental",
    "Psicanálise",
    "Terapia Holística",
    "Coaching",
    "Reiki",
  ];

  const TIPOS = [
    { value: "", label: "Todos" },
    { value: "psicologo", label: "Psicólogo" },
    { value: "psicanalista", label: "Psicanalista" },
    { value: "holistico", label: "Holístico" },
    { value: "coach_mentor", label: "Coach/Mentor" },
  ];

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="bg-gradient-to-r from-blue-600 to-emerald-600 rounded-2xl p-8 text-white">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">🌐 Rede Profissional</h1>
            <p className="text-blue-100 text-lg">
              Conecte-se com profissionais de saúde mental e expanda seu
              conhecimento
            </p>
          </div>
          <div className="text-5xl">🤝</div>
        </div>
      </div>

      {/* ABAS */}
      <div className="flex items-center space-x-2 border-b border-gray-200 overflow-x-auto pb-4">
        {[
          {
            id: "sugeridos" as const,
            label: "✨ Sugeridos",
            icon: SparklesIcon,
          },
          { id: "trending" as const, label: "🔥 Trending", icon: FireIcon },
          {
            id: "especialidades" as const,
            label: "📚 Especialidades",
            icon: UserGroupIcon,
          },
        ].map((aba) => (
          <button
            key={aba.id}
            onClick={() => setAbaSelecionada(aba.id)}
            className={`
              px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap
              ${
                abaSelecionada === aba.id
                  ? "bg-blue-100 text-blue-600"
                  : "text-gray-600 hover:bg-gray-100"
              }
            `}
          >
            {aba.label}
          </button>
        ))}
      </div>

      {/* FILTROS */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <AdjustmentsHorizontalIcon className="w-5 h-5 mr-2" />
            Filtros
          </h3>
          <button
            onClick={() => {
              setFiltroEspecialidade("");
              setFiltroTipo("");
            }}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            Limpar
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Tipo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Profissional
            </label>
            <select
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {TIPOS.map((tipo) => (
                <option key={tipo.value} value={tipo.value}>
                  {tipo.label}
                </option>
              ))}
            </select>
          </div>

          {/* Especialidade */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Especialidade
            </label>
            <select
              value={filtroEspecialidade}
              onChange={(e) => setFiltroEspecialidade(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todas as especialidades</option>
              {ESPECIALIDADES_COMUNS.map((esp) => (
                <option key={esp} value={esp}>
                  {esp}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* LOADING STATE */}
      {carregando && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <LoadingSpinner size="lg" />
            <p className="mt-4 text-gray-600">Carregando profissionais...</p>
          </div>
        </div>
      )}

      {/* ERROR STATE */}
      {erro && !carregando && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-red-800 font-medium">
            Erro ao carregar profissionais
          </p>
          <p className="text-red-600 text-sm mt-1">{erro}</p>
          <button
            onClick={buscarProfissionaisSugeridos}
            className="mt-3 bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700"
          >
            Tentar novamente
          </button>
        </div>
      )}

      {/* GRID DE PROFISSIONAIS */}
      {!carregando && profissionais.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {profissionais.map((profissional) => (
            <ProfessionalCard
              key={profissional.id}
              profissional={profissional}
            />
          ))}
        </div>
      )}

      {/* EMPTY STATE */}
      {!carregando && profissionais.length === 0 && !erro && (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <MagnifyingGlassIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Nenhum profissional encontrado
          </h3>
          <p className="text-gray-600 mb-6">
            Tente ajustar seus filtros para ver mais profissionais
          </p>
          <button
            onClick={() => {
              setFiltroEspecialidade("");
              setFiltroTipo("");
            }}
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Limpar Filtros
          </button>
        </div>
      )}
    </div>
  );
}
