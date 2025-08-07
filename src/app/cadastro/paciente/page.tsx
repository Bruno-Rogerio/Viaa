// app/cadastro/paciente/page.tsx
"use client"; // ✅ Adicionar esta linha

import { CadastroPacienteForm } from "@/components/forms/CadastroPacienteForm";

export default function CadastroPacientePage() {
  const handleSubmit = (data: any) => {
    console.log("Dados do paciente:", data);
    // TODO: Integrar com Supabase
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <CadastroPacienteForm onSubmit={handleSubmit} />
    </div>
  );
}
