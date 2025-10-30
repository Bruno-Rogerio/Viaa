// src/components/dashboard/shared/feed/PostFilters.tsx
// 🎯 Componente de filtros para feed (Seguindo, Para Você, Recentes)

import { useState, useCallback } from "react";
import {
  UserGroupIcon,
  SparklesIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import { FeedFilterType } from "@/hooks/dashboard/useFeed";

interface PostFiltersProps {
  currentFilter: FeedFilterType;
  onFilterChange: (filter: FeedFilterType) => void;
}

export default function PostFilters({
  currentFilter,
  onFilterChange,
}: PostFiltersProps) {
  const [activeTab, setActiveTab] = useState<FeedFilterType>(currentFilter);

  const handleTabChange = useCallback(
    (tab: FeedFilterType) => {
      setActiveTab(tab);
      onFilterChange(tab);
    },
    [onFilterChange]
  );

  // Definição dos filtros disponíveis
  const filters = [
    {
      id: "seguindo",
      name: "Seguindo",
      icon: UserGroupIcon,
      description: "Posts de profissionais que você segue",
    },
    {
      id: "para-voce",
      name: "Para Você",
      icon: SparklesIcon,
      description: "Conteúdo personalizado baseado nos seus interesses",
    },
    {
      id: "recentes",
      name: "Recentes",
      icon: ClockIcon,
      description: "Posts mais recentes de todos os profissionais",
    },
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
      {/* Cabeçalho */}
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-900">
          Feed de Conteúdo
        </h2>
        <p className="text-sm text-gray-600">
          Explore conteúdo educativo dos profissionais
        </p>
      </div>

      {/* Filtros de abas */}
      <div className="flex flex-wrap border-b border-gray-200">
        {filters.map((filter) => {
          const isActive = activeTab === filter.id;
          return (
            <button
              key={filter.id}
              className={`
                flex items-center py-3 px-4 border-b-2 text-sm font-medium
                ${
                  isActive
                    ? "border-emerald-500 text-emerald-600 bg-emerald-50"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }
              `}
              onClick={() => handleTabChange(filter.id as FeedFilterType)}
            >
              <filter.icon
                className={`w-5 h-5 mr-2 ${
                  isActive ? "text-emerald-500" : "text-gray-400"
                }`}
              />
              {filter.name}
            </button>
          );
        })}
      </div>

      {/* Descrição do filtro ativo */}
      <div className="mt-3 text-xs text-gray-600">
        {filters.find((filter) => filter.id === activeTab)?.description}
      </div>
    </div>
  );
}
