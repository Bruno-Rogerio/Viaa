// viaa\src\components\dashboard\professional\feed\PostFilters.tsx

interface PostFiltersProps {
  currentFilter: string;
  onFilterChange: (filter: string) => void;
}

export default function PostFilters({
  currentFilter,
  onFilterChange,
}: PostFiltersProps) {
  const filters = [
    { id: "all", label: "Todos os posts", icon: "🏠" },
    { id: "connections", label: "Suas conexões", icon: "👥" },
    { id: "trending", label: "Em alta", icon: "🔥" },
    { id: "recent", label: "Mais recentes", icon: "⏰" },
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex items-center space-x-2 overflow-x-auto">
        <span className="text-sm font-medium text-gray-700 whitespace-nowrap mr-4">
          Filtrar por:
        </span>

        {filters.map((filter) => (
          <button
            key={filter.id}
            onClick={() => onFilterChange(filter.id)}
            className={`
              flex items-center space-x-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors
              ${
                currentFilter === filter.id
                  ? "bg-blue-100 text-blue-700 border border-blue-200"
                  : "text-gray-600 hover:bg-gray-100"
              }
            `}
          >
            <span>{filter.icon}</span>
            <span className="text-sm font-medium">{filter.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
