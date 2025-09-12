// src/app/dashboard/profissionais/[id]/agendar/page.tsx
// VERSÃO FINAL: Usando o novo container PatientAgenda

"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import PatientAgenda from "@/components/dashboard/patient/agenda/PatientAgenda";

interface AgendarProfissionalProps {
  params: {
    id: string; // ID do profissional com quem se quer agendar
  };
}

interface ProfissionalInfo {
  nome: string;
  sobrenome: string;
  especialidades: string;
  foto_perfil_url?: string;
  valor_sessao?: number;
  crp?: string;
  verificado?: boolean;
}

export default function AgendarProfissional({
  params,
}: AgendarProfissionalProps) {
  const { user, profile } = useAuth();
  const [profissionalInfo, setProfissionalInfo] =
    useState<ProfissionalInfo | null>(null);
  const [carregando, setCarregando] = useState(true);

  // Carregar informações do profissional
  useEffect(() => {
    const carregarProfissional = async () => {
      try {
        const response = await fetch(`/api/profissionais/${params.id}`);
        if (response.ok) {
          const data = await response.json();
          setProfissionalInfo(data);
        }
      } catch (error) {
        console.error("Erro ao carregar profissional:", error);
      } finally {
        setCarregando(false);
      }
    };

    carregarProfissional();
  }, [params.id]);

  if (!user || !profile) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <p className="text-gray-600">Carregando informações do usuário...</p>
      </div>
    );
  }

  if (carregando) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center space-x-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <p className="text-gray-600">
            Carregando informações do profissional...
          </p>
        </div>
      </div>
    );
  }

  if (!profissionalInfo) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="text-center py-8">
          <div className="text-6xl mb-4">😞</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Profissional não encontrado
          </h2>
          <p className="text-gray-600">
            O profissional que você está procurando não existe ou não está mais
            disponível.
          </p>
          <button
            onClick={() => window.history.back()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Voltar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb e navegação */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => window.history.back()}
          className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          <span>Voltar</span>
        </button>
        <span className="text-gray-400">•</span>
        <span className="text-gray-600">Agendar consulta</span>
        <span className="text-gray-400">•</span>
        <span className="text-gray-900 font-medium">
          {profissionalInfo.nome} {profissionalInfo.sobrenome}
        </span>
      </div>

      {/* Container específico para agendamento */}
      <PatientAgenda
        profissionalId={params.id}
        profissionalInfo={profissionalInfo}
        usuarioId={user.id}
        tipoUsuario={profile.tipo as "paciente" | "profissional"}
      />
    </div>
  );
}
