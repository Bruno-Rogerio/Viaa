// src/components/dashboard/common/SearchBar.tsx - VERSÃO MELHORADA

"use client";
import { useState, useRef, useEffect } from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

interface SearchBarProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
  className?: string;
  autoFocus?: boolean; // ✅ NOVA PROPRIEDADE
}

const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = "Buscar...",
  onSearch,
  className = "",
  autoFocus = false, // ✅ NOVA PROPRIEDADE
}) => {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // ✅ IMPLEMENTAR AUTOFOCUS
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(query);
  };

  return (
    <form onSubmit={handleSubmit} className={`relative ${className}`}>
      <div className="relative">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          ref={inputRef} // ✅ NOVA REF
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
        />
      </div>
    </form>
  );
};

export default SearchBar;
