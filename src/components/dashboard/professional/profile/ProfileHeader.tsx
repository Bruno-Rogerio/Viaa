// src/components/dashboard/professional/profile/ProfileHeader.tsx
// 🔧 COMPONENTE NOVO - Header responsivo para perfil

"use client";
import {
  PencilIcon,
  EyeIcon,
  CheckIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

interface ProfileHeaderProps {
  isEditing: boolean;
  activeTab: "preview" | "edit";
  saving?: boolean;
  hasUnsavedChanges?: boolean;
  onToggleEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  onChangeTab: (tab: "preview" | "edit") => void;
}

export default function ProfileHeader({
  isEditing,
  activeTab,
  saving = false,
  hasUnsavedChanges = false,
  onToggleEdit,
  onSave,
  onCancel,
  onChangeTab,
}: ProfileHeaderProps) {
  return (
    <div className="card-mobile space-mobile-md">
      {/* 🔧 TÍTULO E SUBTÍTULO RESPONSIVOS */}
      <div className="space-mobile-xs">
        <h1 className="title-mobile-lg text-gray-900">Meu Perfil</h1>
        <p className="text-mobile-sm text-gray-600">
          {isEditing ? "Editando informações" : "Visualizar e editar dados"}
        </p>
      </div>

      {/* 🔧 CONTROLES RESPONSIVOS */}
      <div className="space-mobile-sm">
        {/* Tabs de visualização */}
        <div className="flex bg-gray-50 rounded-lg p-1">
          <button
            onClick={() => onChangeTab("preview")}
            className={`
              flex-1 flex-mobile-safe justify-center py-2 px-3 rounded-md text-mobile-sm font-medium transition-colors
              ${
                activeTab === "preview"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }
            `}
          >
            <EyeIcon className="icon-mobile-sm mr-1" />
            <span>Visualizar</span>
          </button>

          <button
            onClick={() => onChangeTab("edit")}
            className={`
              flex-1 flex-mobile-safe justify-center py-2 px-3 rounded-md text-mobile-sm font-medium transition-colors
              ${
                activeTab === "edit"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }
            `}
          >
            <PencilIcon className="icon-mobile-sm mr-1" />
            <span>Editar</span>
          </button>
        </div>

        {/* 🔧 AÇÕES - LAYOUT RESPONSIVO */}
        {isEditing && (
          <div className="flex-mobile-safe justify-end space-x-2">
            <button
              onClick={onCancel}
              className="button-mobile bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200"
              disabled={saving}
            >
              <XMarkIcon className="icon-mobile-sm mr-1" />
              <span className="hidden sm:inline">Cancelar</span>
              <span className="sm:hidden">✕</span>
            </button>

            <button
              onClick={onSave}
              disabled={saving || !hasUnsavedChanges}
              className="button-mobile bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <div className="flex-mobile-safe">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-1"></div>
                  <span className="hidden sm:inline">Salvando...</span>
                  <span className="sm:hidden">...</span>
                </div>
              ) : (
                <div className="flex-mobile-safe">
                  <CheckIcon className="icon-mobile-sm mr-1" />
                  <span className="hidden sm:inline">Salvar</span>
                  <span className="sm:hidden">✓</span>
                </div>
              )}
            </button>
          </div>
        )}

        {/* 🔧 INDICADOR DE MUDANÇAS NÃO SALVAS */}
        {hasUnsavedChanges && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <div className="flex-mobile-safe text-amber-700">
              <div className="w-2 h-2 bg-amber-500 rounded-full mr-2 mt-2 flex-shrink-0"></div>
              <span className="text-mobile-xs">
                Você tem alterações não salvas
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
