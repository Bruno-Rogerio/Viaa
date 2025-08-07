// src/components/sections/onboarding/OnboardingContainer.tsx
"use client";
import { useState } from "react";
import TipoUsuarioStep from "./TipoUsuarioStep";
import PacienteForm from "./PacienteForm";
import QuestionarioForm from "./QuestionarioForm";
import { useOnboarding } from "../../../hooks/useOnboarding";
import { useQuestionario } from "../../../hooks/useQuestionario";

type TipoUsuario = "paciente" | "profissional" | "clinica" | "empresa";

export default function OnboardingContainer() {
  const [tipoSelecionado, setTipoSelecionado] = useState<TipoUsuario | null>(
    null
  );
  const [perfilCompleto, setPerfilCompleto] = useState(false);
  const [questionarioCompleto, setQuestionarioCompleto] = useState(false);

  const { loading, error, salvarTipoUsuario, criarPerfilPaciente } =
    useOnboarding();
  const { salvarQuestionario, loading: loadingQuestionario } =
    useQuestionario();

  const handleTipoSelect = async (tipo: TipoUsuario) => {
    const sucesso = await salvarTipoUsuario(tipo);
    if (sucesso) {
      setTipoSelecionado(tipo);
    }
  };

  const handlePerfilSubmit = async (dados: any) => {
    const sucesso = await criarPerfilPaciente(dados);
    if (sucesso) {
      setPerfilCompleto(true);
    }
  };

  const handleQuestionarioSubmit = async (dados: any) => {
    const resultado = await salvarQuestionario(dados);
    if (resultado.success) {
      setQuestionarioCompleto(true);
    }
  };

  const handleQuestionarioSkip = () => {
    setQuestionarioCompleto(true);
  };

  // Se questionário está completo - FINAL
  if (questionarioCompleto) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
          <div className="text-4xl mb-4">🎉</div>
          <h1 className="text-2xl font-bold mb-2">Tudo Pronto!</h1>
          <p className="text-gray-600">
            Seu cadastro foi finalizado com sucesso. Agora vamos encontrar o
            terapeuta ideal para você!
          </p>
        </div>
      </div>
    );
  }

  // Se perfil está completo, mostrar questionário
  if (perfilCompleto && tipoSelecionado === "paciente") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <QuestionarioForm
          onSubmit={handleQuestionarioSubmit}
          onSkip={handleQuestionarioSkip}
          loading={loadingQuestionario}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h1 className="text-2xl font-bold text-center mb-6">
          Bem-vindo ao Viaa! 👋
        </h1>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        {!tipoSelecionado ? (
          <TipoUsuarioStep onSelect={handleTipoSelect} />
        ) : tipoSelecionado === "paciente" ? (
          <PacienteForm onSubmit={handlePerfilSubmit} loading={loading} />
        ) : (
          <div className="text-center">
            <p>
              Formulário para <strong>{tipoSelecionado}</strong> em breve...
            </p>
          </div>
        )}

        {loading && (
          <div className="text-center mt-4">
            <p className="text-gray-600">Processando...</p>
          </div>
        )}
      </div>
    </div>
  );
}
