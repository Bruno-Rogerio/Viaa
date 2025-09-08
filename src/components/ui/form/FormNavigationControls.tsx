// viaa\src\components\ui\form\FormNavigationControls.tsx

interface FormNavigationControlsProps {
  currentStep: number;
  totalSteps: number;
  onPrevious: () => void;
  onNext: () => void;
  onSubmit?: () => void;
  loading?: boolean;
  canGoNext?: boolean;
  canGoPrevious?: boolean;
  nextLabel?: string;
  previousLabel?: string;
  submitLabel?: string;
}

export default function FormNavigationControls({
  currentStep,
  totalSteps,
  onPrevious,
  onNext,
  onSubmit,
  loading = false,
  canGoNext = true,
  canGoPrevious = true,
  nextLabel = "Próximo",
  previousLabel = "Anterior",
  submitLabel = "Finalizar",
}: FormNavigationControlsProps) {
  const isLastStep = currentStep === totalSteps;
  const isFirstStep = currentStep === 1;

  const handleAction = () => {
    if (isLastStep && onSubmit) {
      onSubmit();
    } else {
      onNext();
    }
  };

  return (
    <div className="flex flex-col sm:flex-row justify-between items-center gap-6 mt-12 max-w-4xl mx-auto">
      {/* Botão Anterior */}
      <button
        onClick={onPrevious}
        disabled={isFirstStep || !canGoPrevious || loading}
        type="button"
        className="w-full sm:w-auto px-8 py-4 bg-white border-2 border-gray-200 text-gray-700 font-bold rounded-2xl hover:border-gray-300 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
      >
        ← {previousLabel}
      </button>

      {/* Indicadores de Step */}
      <div className="flex gap-3">
        {Array.from({ length: totalSteps }, (_, index) => (
          <div
            key={index + 1}
            className={`w-4 h-4 rounded-full transition-all duration-300 ${
              index + 1 <= currentStep
                ? "bg-orange-500 shadow-lg"
                : "bg-gray-300"
            }`}
          />
        ))}
      </div>

      {/* Botão Próximo/Finalizar */}
      <button
        onClick={handleAction}
        disabled={!canGoNext || loading}
        type={isLastStep ? "submit" : "button"}
        className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold rounded-2xl hover:from-orange-600 hover:to-orange-700 focus:outline-none focus:ring-4 focus:ring-orange-300 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <span className="flex items-center justify-center">
            <LoadingSpinner />
            Processando...
          </span>
        ) : isLastStep ? (
          `${submitLabel} ✓`
        ) : (
          `${nextLabel} →`
        )}
      </button>
    </div>
  );
}

function LoadingSpinner() {
  return (
    <svg
      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}
