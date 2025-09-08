// viaa\src\components\ui\form\FormProgressIndicator.tsx

interface Step {
  id: number;
  title: string;
  subtitle: string;
  icon: string;
}

interface FormProgressIndicatorProps {
  steps: Step[];
  currentStep: number;
  onStepClick?: (step: number) => void;
  allowStepNavigation?: boolean;
}

export default function FormProgressIndicator({
  steps,
  currentStep,
  onStepClick,
  allowStepNavigation = true,
}: FormProgressIndicatorProps) {
  const handleStepClick = (step: number) => {
    if (allowStepNavigation && onStepClick && step <= currentStep) {
      onStepClick(step);
    }
  };

  return (
    <div className="mb-12">
      {/* Desktop Progress */}
      <div className="hidden md:flex justify-center items-center space-x-8">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div
              onClick={() => handleStepClick(step.id)}
              className={`relative group ${
                currentStep >= step.id ? "text-orange-600" : "text-gray-400"
              } ${
                allowStepNavigation && step.id <= currentStep
                  ? "cursor-pointer"
                  : "cursor-default"
              }`}
            >
              <div
                className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl border-4 transition-all duration-300 ${
                  currentStep === step.id
                    ? "bg-orange-500 border-orange-500 text-white scale-110 shadow-lg"
                    : currentStep > step.id
                    ? "bg-green-500 border-green-500 text-white"
                    : "bg-white border-gray-300 text-gray-400 hover:border-orange-300"
                }`}
              >
                {currentStep > step.id ? "✓" : step.icon}
              </div>
              <div className="absolute top-20 left-1/2 transform -translate-x-1/2 text-center min-w-max">
                <h3 className="font-bold text-sm">{step.title}</h3>
                <p className="text-xs text-gray-500">{step.subtitle}</p>
              </div>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`w-24 h-1 mx-4 rounded-full transition-all duration-500 ${
                  currentStep > step.id ? "bg-green-400" : "bg-gray-200"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Mobile Progress */}
      <div className="md:hidden">
        <div className="bg-white rounded-full p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-gray-700">
              {steps[currentStep - 1]?.title}
            </span>
            <span className="text-sm text-orange-600 font-bold">
              {currentStep}/{steps.length}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-orange-500 to-orange-400 h-3 rounded-full transition-all duration-700 shadow-sm"
              style={{ width: `${(currentStep / steps.length) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
