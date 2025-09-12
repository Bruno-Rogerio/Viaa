// src/components/dashboard/professional/agenda/ModalHorariosDisponiveis.tsx

import React, { useEffect } from "react";
import HorariosDisponiveis from "./HorariosDisponiveis";

// Ícone de fechar
const XMarkIcon = ({ className = "w-6 h-6" }) => (
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
      d="M6 18L18 6M6 6l12 12"
    />
  </svg>
);

interface ModalHorariosDisponiveisProps {
  isOpen: boolean;
  onClose: () => void;
  profissionalId: string;
}

const ModalHorariosDisponiveis: React.FC<ModalHorariosDisponiveisProps> = ({
  isOpen,
  onClose,
  profissionalId,
}) => {
  // Fechar modal com ESC
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      // Prevenir scroll da página
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  // Não renderizar se fechado
  if (!isOpen) return null;

  // Fechar ao clicar no backdrop
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleBackdropClick}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden z-10">
        {/* Header do Modal */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 flex-shrink-0">
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center space-x-3">
              <div className="bg-white/20 p-2 rounded-lg">
                <svg
                  className="w-5 h-5"
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
              </div>
              <div>
                <h2 className="text-xl font-bold">Configurar Horários</h2>
                <p className="text-blue-100 text-sm">
                  Define quando você está disponível para atender
                </p>
              </div>
            </div>

            {/* Botão Fechar */}
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              aria-label="Fechar modal"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Conteúdo Scrollável */}
        <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
          <HorariosDisponiveis
            profissionalId={profissionalId}
            className="rounded-none border-0"
          />
        </div>

        {/* Footer do Modal */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex-shrink-0">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              💡 <strong>Dica:</strong> Configure seus horários uma vez e eles
              ficarão salvos para sempre.
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalHorariosDisponiveis;
