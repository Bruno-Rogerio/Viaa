// src/components/sections/onboarding/TipoUsuarioStep.tsx
"use client";

type TipoUsuario = "paciente" | "profissional" | "clinica" | "empresa";

interface TipoUsuarioStepProps {
  onSelect: (tipo: TipoUsuario) => void;
}

export default function TipoUsuarioStep({ onSelect }: TipoUsuarioStepProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-center mb-6">
        Qual é o seu perfil?
      </h2>

      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => onSelect("paciente")}
          className="p-4 border rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors"
        >
          <div className="text-2xl mb-2">🧑‍⚕️</div>
          <div className="font-medium">Paciente</div>
        </button>

        <button
          onClick={() => onSelect("profissional")}
          className="p-4 border rounded-lg hover:bg-green-50 hover:border-green-300 transition-colors"
        >
          <div className="text-2xl mb-2">👨‍⚕️</div>
          <div className="font-medium">Profissional</div>
        </button>

        <button
          onClick={() => onSelect("clinica")}
          className="p-4 border rounded-lg hover:bg-purple-50 hover:border-purple-300 transition-colors"
        >
          <div className="text-2xl mb-2">🏥</div>
          <div className="font-medium">Clínica</div>
        </button>

        <button
          onClick={() => onSelect("empresa")}
          className="p-4 border rounded-lg hover:bg-orange-50 hover:border-orange-300 transition-colors"
        >
          <div className="text-2xl mb-2">🏢</div>
          <div className="font-medium">Empresa</div>
        </button>
      </div>
    </div>
  );
}
